<?php
// ============================================================================
// Installazione e aggiornamento del database.
//
// Si apre nel browser:  https://iltuosito.it/installa.php
//
// Fa tre cose, in quest'ordine, e dice sempre come e' andata:
//   1. controlla che l'hosting abbia quello che serve;
//   2. crea le tabelle che mancano (si puo' rilanciare quando vuoi: le
//      tabelle che ci sono non vengono toccate);
//   3. la prima volta, crea il tuo accesso da amministratore.
//
// Dopo il primo accesso questa pagina chiede di entrare come amministratore,
// quindi si puo' lasciare dov'e': serve ancora quando un aggiornamento porta
// una tabella nuova.
// ============================================================================

declare(strict_types=1);

require_once __DIR__ . '/comune.php';
require_once __DIR__ . '/schema.php';

$esiti = [];
$errori = [];

// --- 1. controlli dell'hosting ---------------------------------------------

$controlli = [
  'PHP 8.0 o piu' . "\u{2019}" . ' recente' => [PHP_VERSION_ID >= 80000, PHP_VERSION],
  'Estensione PDO MySQL'                     => [extension_loaded('pdo_mysql') || extension_loaded('pdo_sqlite'), ''],
  'Estensione mbstring (accenti)'            => [extension_loaded('mbstring'), ''],
  'Estensione openssl (posta sicura)'        => [extension_loaded('openssl'), ''],
];

// --- quante tabelle ci sono gia'? ------------------------------------------

function tabella_esiste(string $nome): bool
{
  try { valore("select 1 from $nome limit 1"); return true; }
  catch (PDOException) { return false; }
}

$utenti_presenti = tabella_esiste('utenti')
  ? (int) valore('select count(*) from utenti')
  : 0;

// Se il sistema e' gia' in piedi, da qui non si passa senza essere
// l'amministratore: altrimenti chiunque potrebbe creare un secondo utente.
if ($utenti_presenti > 0) richiedi_amministratore();

$azione = $_POST['azione'] ?? '';

// --- 2. creazione delle tabelle --------------------------------------------

if ($azione === 'crea') {
  verifica_gettone();

  foreach (tabelle() as $nome => $sql) {
    try {
      db()->exec(adatta_ddl($sql));
      $esiti[] = "Tabella $nome: pronta";
    } catch (PDOException $e) {
      $errori[] = "Tabella $nome: " . $e->getMessage();
    }
  }

  // Gli indici non hanno un "crea se non c'e'" che funzioni su tutti i
  // database: si prova, e se c'e' gia' si tira avanti.
  foreach (indici() as $nome => $sql) {
    try { db()->exec(adatta_ddl($sql)); $esiti[] = "Indice $nome: creato"; }
    catch (PDOException $e) {
      $m = strtolower($e->getMessage());
      if (!str_contains($m, 'exist') && !str_contains($m, 'duplicate')) {
        $errori[] = "Indice $nome: " . $e->getMessage();
      }
    }
  }

  if ($errori === []) {
    foreach (impostazioni_di_partenza() as $chiave => $valore) {
      if (!valore('select count(*) from impostazioni where chiave = ?', [$chiave])) {
        q('insert into impostazioni (chiave, valore) values (?, ?)', [$chiave, $valore]);
      }
    }
    $esiti[] = 'Impostazioni di partenza: a posto';
  }

  $utenti_presenti = tabella_esiste('utenti') ? (int) valore('select count(*) from utenti') : 0;
}

// --- 3. il primo amministratore --------------------------------------------

if ($azione === 'admin' && $utenti_presenti === 0) {
  verifica_gettone();
  $nome = p('nome');
  $email = strtolower(p('email'));
  $pw = p('password');

  if ($nome === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($pw) < 8) {
    $errori[] = 'Servono nome, un indirizzo email valido e una password di almeno 8 caratteri.';
  } else {
    salva_riga('utenti', [
      'email'         => $email,
      'password_hash' => password_hash($pw, PASSWORD_DEFAULT),
      'nome'          => $nome,
      'ruolo'         => 'admin',
      'attivo'        => 1,
      'creato_il'     => date('Y-m-d H:i:s'),
    ]);
    avvisa('Accesso creato. Entra con la tua email e la password.');
    reindirizza('entra.php');
  }
}

$tabelle_pronte = tabella_esiste('clienti') && tabella_esiste('utenti');
?><!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Installazione · Gestione Assistenza</title>
<link rel="stylesheet" href="stile.css?v=1">
</head>
<body>
<main>
  <div class="titolo"><h1>Installazione</h1></div>

  <?php foreach ($errori as $e): ?>
    <p class="errore"><?= h($e) ?></p>
  <?php endforeach ?>

  <div class="scheda">
    <h2>1. Che cosa offre questo hosting</h2>
    <table>
      <?php foreach ($controlli as $voce => [$ok, $extra]): ?>
        <tr>
          <td><?= h($voce) ?></td>
          <td><?= $ok ? '<span class="pillola ok">a posto</span>' : '<span class="pillola scadute">manca</span>' ?>
              <?= $extra !== '' ? ' <span class="pillola">' . h($extra) . '</span>' : '' ?></td>
        </tr>
      <?php endforeach ?>
      <tr>
        <td>Collegamento al database</td>
        <td><?php try { valore('select 1'); echo '<span class="pillola ok">a posto</span>'; }
                  catch (Throwable $e) { echo '<span class="pillola scadute">no</span>'; } ?></td>
      </tr>
    </table>
  </div>

  <div class="scheda">
    <h2>2. Le tabelle</h2>
    <?php if ($esiti !== []): ?>
      <ul><?php foreach ($esiti as $e): ?><li><?= h($e) ?></li><?php endforeach ?></ul>
    <?php else: ?>
      <p class="sotto">
        <?= $tabelle_pronte
            ? 'Le tabelle ci sono. Puoi rilanciare questo passaggio dopo un aggiornamento: quello che esiste non viene toccato.'
            : 'Non ci sono ancora. Premi il pulsante: ci vuole un secondo.' ?>
      </p>
    <?php endif ?>
    <form method="post">
      <?= campo_gettone() ?>
      <input type="hidden" name="azione" value="crea">
      <div class="azioni"><button type="submit">Crea o aggiorna le tabelle</button></div>
    </form>
  </div>

  <?php if ($tabelle_pronte && $utenti_presenti === 0): ?>
    <div class="scheda">
      <h2>3. Il tuo accesso da amministratore</h2>
      <p class="sotto">E' il primo utente, e sei tu. I tecnici li aggiungi dopo, da Impostazioni.</p>
      <form method="post">
        <?= campo_gettone() ?>
        <input type="hidden" name="azione" value="admin">
        <div class="campi">
          <div><label>Nome e cognome</label><input type="text" name="nome" required></div>
          <div><label>Email</label><input type="email" name="email" required></div>
          <div class="larga">
            <label>Password <span class="aiuto">Almeno 8 caratteri</span></label>
            <input type="password" name="password" minlength="8" required>
          </div>
        </div>
        <div class="azioni"><button type="submit">Crea l'accesso</button></div>
      </form>
    </div>
  <?php elseif ($utenti_presenti > 0): ?>
    <div class="scheda">
      <h2>3. Pronto</h2>
      <p>Ci sono <?= (int) $utenti_presenti ?> utenti. <a href="index.php">Vai al gestionale</a>.</p>
    </div>
  <?php endif ?>
</main>
</body>
</html>
