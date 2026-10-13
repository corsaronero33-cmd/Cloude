<?php
// ============================================================================
// Le cose che servono a tutte le pagine: il collegamento al database, la
// sessione, l'intestazione con il menu, e un po' di funzioni di aiuto.
//
// Ogni pagina comincia con:
//     require __DIR__ . '/comune.php';
//     richiedi_accesso();
// ============================================================================

declare(strict_types=1);

require_once __DIR__ . '/date_it.php';
require_once __DIR__ . '/vocabolario.php';

date_default_timezone_set('Europe/Rome');
mb_internal_encoding('UTF-8');

// --- configurazione ---------------------------------------------------------

function conf(?string $chiave = null): mixed
{
  static $c = null;
  if ($c === null) {
    // Le prove automatiche (prove.php) mettono qui la loro configurazione, per
    // girare su un database temporaneo senza toccare il tuo.
    if (isset($GLOBALS['CONFIGURAZIONE'])) return ($c = $GLOBALS['CONFIGURAZIONE'])[$chiave] ?? ($chiave === null ? $c : null);

    $file = __DIR__ . '/configurazione.php';
    if (!is_file($file)) {
      http_response_code(500);
      exit('Manca il file configurazione.php: copia configurazione.esempio.php, '
         . 'rinominalo in configurazione.php e riempi i tuoi dati.');
    }
    $c = require $file;
  }
  return $chiave === null ? $c : ($c[$chiave] ?? null);
}

// --- database ---------------------------------------------------------------

/**
 * Il collegamento al database, aperto una volta sola per pagina.
 *
 * ERRMODE_EXCEPTION: se una query sbaglia, PHP si ferma e lo dice, invece di
 * tirare avanti con un risultato vuoto. Un errore che si vede costa un minuto,
 * uno che non si vede costa una settimana.
 */
function db(): PDO
{
  static $pdo = null;
  if ($pdo !== null) return $pdo;

  $db = conf('db');
  // Un DSN pronto (serve alle prove automatiche, che girano su SQLite).
  $dsn = $db['dsn'] ?? sprintf(
    'mysql:host=%s;dbname=%s;charset=utf8mb4',
    $db['host'] ?? 'localhost',
    $db['nome'] ?? '',
  );

  try {
    $pdo = new PDO($dsn, $db['utente'] ?? null, $db['password'] ?? null, [
      PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
  } catch (PDOException $e) {
    http_response_code(500);
    exit('Non riesco a collegarmi al database. Controlla i quattro valori in '
       . 'configurazione.php. Il messaggio del database e\': ' . $e->getMessage());
  }
  if (str_starts_with($dsn, 'sqlite:')) $pdo->exec('pragma foreign_keys = on');
  return $pdo;
}

/** Una query con i parametri al posto giusto. Mai incollare valori nell'SQL. */
function q(string $sql, array $par = []): PDOStatement
{
  $s = db()->prepare($sql);
  $s->execute($par);
  return $s;
}

function righe(string $sql, array $par = []): array { return q($sql, $par)->fetchAll(); }
function riga(string $sql, array $par = []): ?array { $r = q($sql, $par)->fetch(); return $r === false ? null : $r; }
function valore(string $sql, array $par = []): mixed { $r = q($sql, $par)->fetch(PDO::FETCH_NUM); return $r === false ? null : $r[0]; }

/**
 * Inserisce o aggiorna una riga a partire da un array di campi.
 * Restituisce l'id. Con $id nullo inserisce, altrimenti aggiorna.
 */
function salva_riga(string $tabella, array $campi, ?int $id = null): int
{
  $nomi = array_keys($campi);
  if ($id === null) {
    $sql = sprintf(
      'insert into %s (%s) values (%s)',
      $tabella,
      implode(', ', $nomi),
      implode(', ', array_map(fn($n) => ':' . $n, $nomi)),
    );
    q($sql, $campi);
    return (int) db()->lastInsertId();
  }
  $sql = sprintf(
    'update %s set %s where id = :id_riga',
    $tabella,
    implode(', ', array_map(fn($n) => "$n = :$n", $nomi)),
  );
  q($sql, $campi + ['id_riga' => $id]);
  return $id;
}

// --- impostazioni salvate nel database --------------------------------------

function impostazione(string $chiave, string $difetto = ''): string
{
  static $cache = null;
  if ($cache === null) {
    $cache = [];
    foreach (righe('select chiave, valore from impostazioni') as $r) {
      $cache[$r['chiave']] = $r['valore'];
    }
  }
  return $cache[$chiave] ?? $difetto;
}

function imposta(string $chiave, string $valore): void
{
  // Nessun "insert ... on duplicate key": due righe chiare valgono piu' di una
  // riga furba che si comporta diversamente su MySQL e su SQLite.
  if (valore('select count(*) from impostazioni where chiave = ?', [$chiave])) {
    q('update impostazioni set valore = ? where chiave = ?', [$valore, $chiave]);
  } else {
    q('insert into impostazioni (chiave, valore) values (?, ?)', [$chiave, $valore]);
  }
}

function mesi_verifica(): int { return max(1, (int) impostazione('mesi_verifica', '24')); }
function giorni_avviso(): int { return max(1, (int) impostazione('giorni_avviso', '60')); }

// --- accesso ----------------------------------------------------------------

/**
 * Vero quando la pagina e' arrivata in https.
 *
 * Su molti hosting il sito sta dietro a un apparato che si occupa lui del
 * certificato e poi parla con PHP in chiaro: li' `HTTPS` non vale 'on' e
 * l'unica traccia resta l'intestazione che quell'apparato aggiunge. Senza
 * questo controllo il cookie della sessione non verrebbe marcato come sicuro
 * proprio sui siti che il certificato ce l'hanno.
 */
function collegamento_sicuro(): bool
{
  $https = strtolower((string) ($_SERVER['HTTPS'] ?? ''));
  if ($https === 'on' || $https === '1') return true;
  if (strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https') return true;
  return (int) ($_SERVER['SERVER_PORT'] ?? 0) === 443;
}

function avvia_sessione(): void
{
  if (session_status() === PHP_SESSION_ACTIVE) return;
  session_set_cookie_params([
    'httponly' => true,
    'samesite' => 'Lax',
    'secure'   => collegamento_sicuro(),
  ]);
  session_start();
}

function utente(): ?array
{
  avvia_sessione();
  if (empty($_SESSION['utente_id'])) return null;
  static $u = null;
  if ($u === null) {
    $u = riga('select * from utenti where id = ? and attivo = 1', [$_SESSION['utente_id']]);
    if ($u === null) { $_SESSION = []; }
  }
  return $u;
}

function richiedi_accesso(): void
{
  if (utente() === null) {
    $_SESSION['dopo_accesso'] = $_SERVER['REQUEST_URI'] ?? 'index.php';
    reindirizza('entra.php');
  }
}

function e_amministratore(): bool { return (utente()['ruolo'] ?? '') === 'admin'; }

function richiedi_amministratore(): void
{
  richiedi_accesso();
  if (!e_amministratore()) { http_response_code(403); exit('Questa pagina e\' solo per l\'amministratore.'); }
}

// --- protezione dei form (CSRF) ---------------------------------------------

/**
 * Un gettone nascosto in ogni form. Senza, un sito qualunque potrebbe far
 * inviare dati al tuo gestionale dal browser di un tecnico che ha la sessione
 * aperta: si chiama CSRF, e questa e' la difesa standard.
 */
function gettone(): string
{
  avvia_sessione();
  if (empty($_SESSION['gettone'])) $_SESSION['gettone'] = bin2hex(random_bytes(16));
  return $_SESSION['gettone'];
}

function campo_gettone(): string
{
  return '<input type="hidden" name="gettone" value="' . h(gettone()) . '">';
}

function verifica_gettone(): void
{
  avvia_sessione();
  $dato = (string) ($_POST['gettone'] ?? '');
  if ($dato === '' || !hash_equals($_SESSION['gettone'] ?? '', $dato)) {
    http_response_code(400);
    exit('Richiesta non valida (gettone mancante). Torna indietro e riprova.');
  }
}

// --- aiuti ------------------------------------------------------------------

/** Mette al sicuro un testo prima di scriverlo nella pagina. */
function h(?string $s): string { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); }

function reindirizza(string $url): never { header('Location: ' . $url); exit; }

function p(string $campo, string $difetto = ''): string
{
  return trim((string) ($_POST[$campo] ?? $difetto));
}

/** Un campo di testo vuoto va salvato come NULL, non come stringa vuota. */
function p_o_null(string $campo): ?string { $v = p($campo); return $v === '' ? null : $v; }

function p_intero(string $campo): ?int { $v = p($campo); return $v === '' ? null : (int) $v; }

function p_decimale(string $campo): ?float
{
  $v = str_replace(',', '.', p($campo));
  return $v === '' ? null : (float) $v;
}

function p_spunta(string $campo): int { return empty($_POST[$campo]) ? 0 : 1; }

function g(string $campo, string $difetto = ''): string
{
  return trim((string) ($_GET[$campo] ?? $difetto));
}

/** Messaggio da mostrare dopo un salvataggio, che sopravvive al reindirizzamento. */
function avvisa(string $testo): void { avvia_sessione(); $_SESSION['avviso'] = $testo; }

function avviso_da_mostrare(): ?string
{
  avvia_sessione();
  $a = $_SESSION['avviso'] ?? null;
  unset($_SESSION['avviso']);
  return $a;
}
