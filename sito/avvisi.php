<?php
// ============================================================================
// L'avviso delle scadenze per email.
//
// Si fa chiamare in tre modi:
//
//   1. dal cron dell'hosting, una volta al mattino (il modo normale):
//        php /home/tuoutente/public_html/avvisi.php
//
//   2. da un indirizzo web, se il tuo hosting non sa lanciare PHP dal cron:
//        https://iltuosito.it/avvisi.php?chiave=la-parola-in-configurazione
//
//   3. dal pulsante "Manda una prova adesso" in Impostazioni.
//
// Se non c'e' niente da segnalare non manda niente: cosi' il messaggio che
// arriva significa sempre qualcosa. Ogni tentativo finisce in `avvisi_log`,
// che si vede dentro Impostazioni.
// ============================================================================

declare(strict_types=1);

require_once __DIR__ . '/comune.php';
require_once __DIR__ . '/scadenze.php';
require_once __DIR__ . '/posta.php';

/**
 * Compone l'avviso. Separata dall'invio perche' cosi' si puo' provare senza
 * mandare niente a nessuno (vedi prove.php).
 *
 * @return array{oggetto: string, html: string, scadute: int, sette: int}
 */
function messaggio_avviso(array $voci, array $trasmettere, string $indirizzo_sito, string $nome_azienda): array
{
  $scadute = array_values(array_filter($voci, fn($v) => $v['fascia'] === 'scadute'));
  $sette   = array_values(array_filter($voci, fn($v) => $v['fascia'] === 'sette'));
  $resto   = array_values(array_filter($voci, fn($v) => !in_array($v['fascia'], ['scadute', 'sette'], true)));

  $pezzi = [];
  if ($scadute !== []) $pezzi[] = count($scadute) . ' in ritardo';
  if ($sette !== []) $pezzi[] = count($sette) . ' entro una settimana';
  if ($pezzi === [] && $resto !== []) $pezzi[] = count($resto) . ' in arrivo';
  $oggetto = 'Scadenze: ' . ($pezzi === [] ? 'niente in scadenza' : implode(', ', $pezzi));

  $elenco = function (array $gruppo, string $titolo, string $colore) use (&$html): string {
    if ($gruppo === []) return '';
    $t = '<h2 style="font:600 15px system-ui;color:' . $colore . ';margin:20px 0 6px">'
       . htmlspecialchars($titolo) . '</h2>'
       . '<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">';
    foreach ($gruppo as $v) {
      $t .= '<tr>'
        . '<td style="padding:6px 8px 6px 0;border-bottom:1px solid #e2e8f0;font:14px system-ui">'
        . '<b>' . htmlspecialchars($v['cliente']) . '</b><br>'
        . '<span style="color:#64748b">' . htmlspecialchars($v['etichetta'] . ' · ' . $v['titolo']
            . ($v['dettaglio'] !== '' ? ' · ' . $v['dettaglio'] : '')) . '</span></td>'
        . '<td style="padding:6px 0;border-bottom:1px solid #e2e8f0;font:14px system-ui;'
        . 'text-align:right;white-space:nowrap">'
        . htmlspecialchars(data_it($v['data'])) . '<br>'
        . '<span style="color:#64748b">' . htmlspecialchars(quando($v['giorni'])) . '</span></td>'
        . '</tr>';
    }
    return $t . '</table>';
  };

  $html = '<!doctype html><html lang="it"><body style="margin:0;padding:16px;background:#f8fafc">'
    . '<div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;'
    . 'border-radius:12px;padding:20px">'
    . '<p style="font:600 18px system-ui;margin:0 0 4px">Scadenze del ' . data_it(oggi()) . '</p>'
    . '<p style="font:14px system-ui;color:#64748b;margin:0">' . htmlspecialchars($nome_azienda) . '</p>'
    . $elenco($scadute, 'In ritardo', '#b91c1c')
    . $elenco($sette, 'Entro sette giorni', '#92400e')
    . $elenco($resto, 'Piu\' avanti', '#334155');

  if ($trasmettere !== []) {
    $html .= '<h2 style="font:600 15px system-ui;color:#334155;margin:20px 0 6px">'
      . 'Verifiche da trasmettere all\'Agenzia delle Entrate</h2>'
      . '<p style="font:14px system-ui;color:#334155;margin:0">'
      . count($trasmettere) . ' verifiche registrate e non ancora trasmesse.</p>';
  }

  if ($voci === [] && $trasmettere === []) {
    $html .= '<p style="font:14px system-ui;margin:20px 0 0">Niente in scadenza. Buona giornata.</p>';
  }

  if ($indirizzo_sito !== '') {
    $html .= '<p style="margin:24px 0 0"><a href="' . htmlspecialchars($indirizzo_sito)
      . '" style="font:600 14px system-ui;background:#0f172a;color:#fff;text-decoration:none;'
      . 'padding:10px 16px;border-radius:8px;display:inline-block">Apri il gestionale</a></p>';
  }

  $html .= '</div></body></html>';

  return [
    'oggetto' => $oggetto,
    'html'    => $html,
    'scadute' => count($scadute),
    'sette'   => count($sette),
  ];
}

/**
 * Prepara e manda. Con $prova a vero manda anche quando non c'e' nulla da
 * dire: e' il pulsante di prova, e serve proprio a vedere arrivare qualcosa.
 *
 * @return array{ok: bool, messaggio: string, mandata: bool}
 */
function manda_avviso(bool $prova = false): array
{
  $attivi = impostazione('avvisi_attivi', '1') === '1';
  if (!$attivi && !$prova) {
    return ['ok' => true, 'messaggio' => 'Avvisi disattivati dalle impostazioni', 'mandata' => false];
  }

  $voci = scadenzario();
  $trasmettere = da_trasmettere();

  if ($voci === [] && $trasmettere === [] && !$prova) {
    return ['ok' => true, 'messaggio' => 'Niente da segnalare', 'mandata' => false];
  }

  $destinatari = array_map('trim', explode(',', (string) (conf('posta')['destinatari'] ?? '')));
  $m = messaggio_avviso(
    $voci,
    $trasmettere,
    (string) conf('indirizzo_sito'),
    (string) (conf('azienda')['nome'] ?? ''),
  );
  if ($prova) $m['oggetto'] = '[prova] ' . $m['oggetto'];

  $esito = manda_email($destinatari, $m['oggetto'], $m['html']);

  salva_riga('avvisi_log', [
    'inviato_il'  => date('Y-m-d H:i:s'),
    'esito'       => $esito['ok'] ? 'inviato' : 'errore',
    'destinatari' => mb_substr(implode(', ', $destinatari), 0, 400),
    'scadute'     => $m['scadute'],
    'entro_sette' => $m['sette'],
    'messaggio'   => mb_substr($esito['messaggio'], 0, 500),
  ]);

  return ['ok' => $esito['ok'], 'messaggio' => $esito['messaggio'], 'mandata' => $esito['ok']];
}

// --- chiamata diretta -------------------------------------------------------
//
// Questo file viene anche incluso da impostazioni.php (per il pulsante di
// prova): in quel caso qui sotto non si deve fare niente.

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === realpath(__FILE__)) {

  $da_riga_di_comando = PHP_SAPI === 'cli';

  if (!$da_riga_di_comando) {
    $chiave = (string) conf('chiave_avvisi');
    $data = (string) ($_GET['chiave'] ?? '');
    // hash_equals: il confronto non si fa con == perche' il tempo che ci
    // mette rivelerebbe quanti caratteri sono giusti.
    if ($chiave === '' || !hash_equals($chiave, $data)) {
      http_response_code(403);
      exit("Chiave mancante o sbagliata.\n");
    }
    header('Content-Type: text/plain; charset=utf-8');
  }

  $esito = manda_avviso(isset($_GET['prova']) || in_array('--prova', $argv ?? [], true));

  echo ($esito['ok'] ? 'OK: ' : 'ERRORE: '), $esito['messaggio'], "\n";
  if ($da_riga_di_comando) exit($esito['ok'] ? 0 : 1);
}
