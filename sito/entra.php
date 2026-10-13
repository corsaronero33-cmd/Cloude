<?php
// ============================================================================
// La pagina di accesso.
//
// La password non e' salvata da nessuna parte: nel database c'e' solo la sua
// impronta (`password_hash`), che non si puo' riportare indietro. Se qualcuno
// leggesse il database non avrebbe le password dei tecnici.
// ============================================================================

declare(strict_types=1);

require_once __DIR__ . '/comune.php';

if (utente() !== null) reindirizza('index.php');

$errore = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verifica_gettone();
  $email = strtolower(p('email'));
  $pw = p('password');

  $u = riga('select * from utenti where email = ? and attivo = 1', [$email]);

  // Un solo messaggio per "email sbagliata" e "password sbagliata": dire
  // quale delle due e' giusta aiuterebbe solo chi prova a indovinare.
  if ($u === null || !password_verify($pw, $u['password_hash'])) {
    $errore = 'Email o password non corrette.';
    usleep(300000);
  } else {
    avvia_sessione();
    session_regenerate_id(true);
    $_SESSION['utente_id'] = (int) $u['id'];
    $dove = $_SESSION['dopo_accesso'] ?? 'index.php';
    unset($_SESSION['dopo_accesso']);
    reindirizza(str_contains($dove, 'entra.php') ? 'index.php' : $dove);
  }
}

$avviso = avviso_da_mostrare();
?><!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0f172a">
<title>Entra · Gestione Assistenza</title>
<link rel="stylesheet" href="stile.css?v=1">
</head>
<body>
<main style="max-width:420px">
  <div class="titolo"><h1>Gestione Assistenza</h1></div>
  <p class="sotto" style="margin-bottom:16px">Verifiche RT, scadenze dei contratti e interventi tecnici.</p>

  <?php if ($avviso !== null): ?><p class="fatto"><?= h($avviso) ?></p><?php endif ?>
  <?php if ($errore !== ''): ?><p class="errore"><?= h($errore) ?></p><?php endif ?>

  <div class="scheda">
    <form method="post">
      <?= campo_gettone() ?>
      <div class="campi">
        <div class="larga"><label>Email</label>
          <input type="email" name="email" autocomplete="username" required autofocus></div>
        <div class="larga"><label>Password</label>
          <input type="password" name="password" autocomplete="current-password" required></div>
      </div>
      <div class="azioni"><button type="submit">Entra</button></div>
    </form>
  </div>
</main>
</body>
</html>
