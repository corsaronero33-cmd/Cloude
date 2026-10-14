<?php
// ============================================================================
// Mandare un'email dalla tua casella di posta (SMTP).
//
// Perche' scritto a mano invece di usare una libreria: su un hosting
// condiviso non c'e' modo di installare pacchetti, e `mail()` di PHP manda
// senza autenticazione -- quindi finisce nello spam. Parlare SMTP con la tua
// casella e' la strada che funziona, ed e' una conversazione di dieci righe.
//
// Com'e' fatta una consegna SMTP:
//
//     noi                             il server di posta
//     ---------------------------------------------------
//                                 <-- 220 pronto
//     EHLO ...                    -->
//                                 <-- 250 lista di cose che sa fare
//     (se serve) STARTTLS         -->   e da qui si cifra
//     AUTH LOGIN  utente password -->
//                                 <-- 235 accesso fatto
//     MAIL FROM / RCPT TO / DATA  -->
//     ...il messaggio, poi "."    -->
//                                 <-- 250 preso in carico
//     QUIT                        -->
// ============================================================================

declare(strict_types=1);

/**
 * Manda un messaggio. Non lancia eccezioni: restituisce com'e' andata, perche'
 * chi la chiama (il cron degli avvisi) deve poterlo scrivere nel registro.
 *
 * @return array{ok: bool, messaggio: string, dialogo: string}
 */
function manda_email(array $destinatari, string $oggetto, string $html): array
{
  // Di norma i dati della posta vengono da configurazione.php. La pagina
  // diagnostica-posta.php ne mette di diversi qui, per provarli senza
  // ricaricare il file sul server.
  $c = $GLOBALS['POSTA_DI_PROVA'] ?? conf('posta');
  $dialogo = [];

  $destinatari = array_values(array_filter(array_map('trim', $destinatari)));
  if ($destinatari === []) return ['ok' => false, 'messaggio' => 'Nessun destinatario', 'dialogo' => ''];
  foreach ($destinatari as $d) {
    if (!filter_var($d, FILTER_VALIDATE_EMAIL)) {
      return ['ok' => false, 'messaggio' => "Indirizzo non valido: $d", 'dialogo' => ''];
    }
  }
  if (($c['server'] ?? '') === '' || ($c['mittente'] ?? '') === '') {
    return ['ok' => false, 'messaggio' => 'Posta non configurata in configurazione.php', 'dialogo' => ''];
  }

  $sicurezza = strtolower((string) ($c['sicurezza'] ?? 'ssl'));
  $indirizzo = ($sicurezza === 'ssl' ? 'ssl://' : '') . $c['server'] . ':' . (int) $c['porta'];

  $contesto = stream_context_create(['ssl' => [
    'verify_peer' => true,
    'verify_peer_name' => true,
    'SNI_enabled' => true,
    'peer_name' => (string) $c['server'],
  ] + (array) ($c['ssl'] ?? [])]);

  $socket = @stream_socket_client($indirizzo, $numero, $errore, 20, STREAM_CLIENT_CONNECT, $contesto);
  if ($socket === false) {
    return [
      'ok' => false,
      'messaggio' => "Non riesco a collegarmi a $indirizzo ($errore). Controlla server, porta e sicurezza.",
      'dialogo' => '',
    ];
  }
  stream_set_timeout($socket, 20);

  // --- la conversazione -----------------------------------------------------

  $leggi = function () use ($socket, &$dialogo): array {
    $righe = [];
    do {
      $r = fgets($socket, 1024);
      if ($r === false) { $dialogo[] = '<-- (niente risposta)'; return [0, '']; }
      $dialogo[] = '<-- ' . rtrim($r);
      $righe[] = rtrim($r);
      // Nelle risposte su piu' righe il codice e' seguito da '-' tranne che
      // nell'ultima.
    } while (strlen($r) > 3 && $r[3] === '-');
    $ultima = end($righe);
    return [(int) substr((string) $ultima, 0, 3), implode(' | ', $righe)];
  };

  $scrivi = function (string $riga, bool $segreto = false) use ($socket, &$dialogo): void {
    $dialogo[] = '--> ' . ($segreto ? '(nascosto)' : $riga);
    fwrite($socket, $riga . "\r\n");
  };

  $chiudi = function (string $messaggio) use ($socket, &$dialogo): array {
    @fclose($socket);
    return ['ok' => false, 'messaggio' => $messaggio, 'dialogo' => implode("\n", $dialogo)];
  };

  [$codice, $testo] = $leggi();
  if ($codice !== 220) return $chiudi("Il server non ha risposto come doveva: $testo");

  $miodominio = $_SERVER['SERVER_NAME'] ?? 'localhost';
  $scrivi('EHLO ' . $miodominio);
  [$codice, $testo] = $leggi();
  if ($codice !== 250) return $chiudi("EHLO rifiutato: $testo");
  // Nella risposta a EHLO il server elenca quello che sa fare, compresi i modi
  // di autenticazione che accetta.
  $capacita = $testo;

  if ($sicurezza === 'starttls') {
    $scrivi('STARTTLS');
    [$codice, $testo] = $leggi();
    if ($codice !== 220) return $chiudi("STARTTLS rifiutato: $testo");
    if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
      return $chiudi('Il collegamento cifrato non si e\' stabilito (STARTTLS).');
    }
    $dialogo[] = '--- da qui in poi cifrato ---';
    $scrivi('EHLO ' . $miodominio);
    [$codice, $testo] = $leggi();
    if ($codice !== 250) return $chiudi("EHLO dopo STARTTLS rifiutato: $testo");
    $capacita = $testo;
  }

  if (($c['utente'] ?? '') !== '') {

    // Due modi di dire le stesse credenziali. Non tutti i server accettano
    // tutti e due, e qualcuno risponde "credenziali non valide" al primo
    // mentre accetta il secondo: si prova quello che il server dichiara, e se
    // non basta si prova l'altro prima di arrendersi.
    $dichiarati = strtoupper($capacita);
    $modi = [];
    if (str_contains($dichiarati, 'PLAIN')) $modi[] = 'PLAIN';
    if (str_contains($dichiarati, 'LOGIN')) $modi[] = 'LOGIN';
    if ($modi === []) $modi = ['LOGIN', 'PLAIN'];

    $entrato = false;
    $ultimo = '';
    foreach ($modi as $modo) {
      [$entrato, $ultimo] = autentica($modo, $c, $scrivi, $leggi);
      if ($entrato) break;
    }

    if (!$entrato) {
      return $chiudi('Utente o password della casella non accettati ('
        . implode(' e ', $modi) . '). Controlla che l\'utente sia l\'indirizzo '
        . 'email completo e che la password sia esattamente quella della casella. ('
        . $ultimo . ')');
    }
  }

  $scrivi('MAIL FROM:<' . $c['mittente'] . '>');
  [$codice, $testo] = $leggi();
  if ($codice !== 250) return $chiudi("Mittente rifiutato: $testo");

  foreach ($destinatari as $d) {
    $scrivi('RCPT TO:<' . $d . '>');
    [$codice, $testo] = $leggi();
    if ($codice !== 250 && $codice !== 251) return $chiudi("Destinatario $d rifiutato: $testo");
  }

  $scrivi('DATA');
  [$codice, $testo] = $leggi();
  if ($codice !== 354) return $chiudi("DATA rifiutato: $testo");

  fwrite($socket, intestazioni_e_corpo($c, $destinatari, $oggetto, $html));
  $dialogo[] = '--> (il messaggio) .';
  [$codice, $testo] = $leggi();
  if ($codice !== 250) return $chiudi("Il messaggio non e' stato accettato: $testo");

  $scrivi('QUIT');
  $leggi();
  fclose($socket);

  return ['ok' => true, 'messaggio' => 'Inviata a ' . implode(', ', $destinatari), 'dialogo' => implode("\n", $dialogo)];
}

/**
 * Un tentativo di autenticazione, in uno dei due modi.
 *
 *   PLAIN  manda utente e password in un colpo solo, dentro un'unica riga.
 *   LOGIN  li manda uno per volta, ciascuno dopo un invito del server.
 *
 * Nessuno dei due nasconde niente: e' il collegamento cifrato a proteggerli,
 * ed e' per questo che la porta 465 (o STARTTLS sulla 587) non e' facoltativa.
 *
 * @return array{0: bool, 1: string} riuscito, e l'ultima risposta del server
 */
function autentica(string $modo, array $c, callable $scrivi, callable $leggi): array
{
  $utente = (string) $c['utente'];
  $password = (string) $c['password'];

  if ($modo === 'PLAIN') {
    $scrivi('AUTH PLAIN ' . base64_encode("\0" . $utente . "\0" . $password), true);
    [$codice, $testo] = $leggi();
    return [$codice === 235, $testo];
  }

  $scrivi('AUTH LOGIN');
  [$codice, $testo] = $leggi();
  if ($codice !== 334) return [false, $testo];

  $scrivi(base64_encode($utente), true);
  [$codice, $testo] = $leggi();
  if ($codice !== 334) return [false, $testo];

  $scrivi(base64_encode($password), true);
  [$codice, $testo] = $leggi();
  return [$codice === 235, $testo];
}

/**
 * Il messaggio vero e proprio.
 *
 * Il corpo va in base64: cosi' gli accenti arrivano giusti e non esistono
 * righe troppo lunghe, che alcuni server troncano. L'oggetto si codifica
 * allo stesso modo, perche' "Scadenze di oggi: verifica perché" con gli
 * accenti crudi arriverebbe storto.
 */
function intestazioni_e_corpo(array $c, array $destinatari, string $oggetto, string $html): string
{
  $capo = [];
  $capo[] = 'Date: ' . date('r');
  $capo[] = 'From: ' . codifica_nome((string) ($c['nome_mittente'] ?? '')) . ' <' . $c['mittente'] . '>';
  $capo[] = 'To: ' . implode(', ', $destinatari);
  $capo[] = 'Subject: ' . codifica_nome($oggetto);
  $capo[] = 'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . ($_SERVER['SERVER_NAME'] ?? 'localhost') . '>';
  $capo[] = 'MIME-Version: 1.0';
  $capo[] = 'Content-Type: text/html; charset=UTF-8';
  $capo[] = 'Content-Transfer-Encoding: base64';

  $corpo = chunk_split(base64_encode($html), 76, "\r\n");

  return implode("\r\n", $capo) . "\r\n\r\n" . $corpo . "\r\n.\r\n";
}

function codifica_nome(string $testo): string
{
  if ($testo === '') return '';
  // Se e' tutto ASCII non serve codificare: resta leggibile anche nei registri.
  return preg_match('/^[\x20-\x7E]*$/', $testo)
    ? $testo
    : '=?UTF-8?B?' . base64_encode($testo) . '?=';
}
