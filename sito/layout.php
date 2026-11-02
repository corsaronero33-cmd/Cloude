<?php
// ============================================================================
// L'intestazione e il piede di ogni pagina: il menu, il nome di chi e'
// entrato, il messaggio dopo un salvataggio.
//
//     intestazione('Clienti');   ... il contenuto ...   piede();
// ============================================================================

declare(strict_types=1);

const MENU = [
  'index.php'      => 'Scadenze',
  'interventi.php' => 'Interventi',
  'clienti.php'    => 'Clienti',
  'apparecchi.php' => 'Apparecchi',
  'contratti.php'  => 'Contratti',
];

function intestazione(string $titolo, string $sottotitolo = ''): void
{
  $pagina = basename((string) ($_SERVER['SCRIPT_NAME'] ?? ''));
  $u = utente();
  $avviso = avviso_da_mostrare();
  ?><!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0f172a">
<title><?= h($titolo) ?> · Gestione Assistenza</title>
<link rel="stylesheet" href="stile.css?v=1">
</head>
<body>
<header class="barra">
  <div class="barra-dentro">
    <a class="marchio" href="index.php">Assistenza</a>
    <nav>
      <?php foreach (MENU as $file => $voce): ?>
        <a href="<?= h($file) ?>" class="<?= $pagina === $file ? 'attiva' : '' ?>"><?= h($voce) ?></a>
      <?php endforeach ?>
      <?php if (e_amministratore()): ?>
        <a href="impostazioni.php" class="<?= $pagina === 'impostazioni.php' ? 'attiva' : '' ?>">Impostazioni</a>
      <?php endif ?>
    </nav>
    <span class="chi">
      <?= h($u['nome'] ?: $u['email']) ?>
      <a href="esci.php" class="esci">esci</a>
    </span>
  </div>
</header>

<main>
  <div class="titolo">
    <h1><?= h($titolo) ?></h1>
    <?php if ($sottotitolo !== ''): ?><p class="sotto"><?= h($sottotitolo) ?></p><?php endif ?>
  </div>
  <?php if ($avviso !== null): ?>
    <p class="fatto"><?= h($avviso) ?></p>
  <?php endif ?>
<?php
}

function piede(): void
{
  ?>
</main>
<script src="app.js?v=1"></script>
</body>
</html>
<?php
}

/**
 * Il riquadro rosso che chiede conferma prima di cancellare.
 *
 * Due casi soli: o si puo' fare, e c'e' il pulsante; oppure c'e' qualcosa che
 * lo impedisce, e allora si dice che cos'e' e che cosa fare al posto suo.
 * Uguale in tutte le pagine, cosi' si riconosce al volo.
 */
function riquadro_elimina(
  string $titolo,
  string $azione,
  int $id,
  string $ritorno,
  string $conferma,
  ?string $impedimento = null,
  ?string $alternativa = null,
): void {
  ?>
  <div class="scheda" id="elimina" style="border-color:#fecaca">
    <h2 style="margin-top:0;color:#b91c1c"><?= h($titolo) ?></h2>

    <?php if ($impedimento !== null): ?>
      <p><?= h($impedimento) ?></p>
      <?php if ($alternativa !== null): ?><p class="sotto"><?= h($alternativa) ?></p><?php endif ?>
      <div class="azioni"><?= bottone($ritorno, 'Torna indietro', 'neutro') ?></div>
    <?php else: ?>
      <p>Non si torna indietro.</p>
      <?php if ($alternativa !== null): ?><p class="sotto"><?= h($alternativa) ?></p><?php endif ?>
      <form method="post" onsubmit="return confirm(<?= h(json_encode($conferma)) ?>)">
        <?= campo_gettone() ?>
        <input type="hidden" name="azione" value="<?= h($azione) ?>">
        <input type="hidden" name="id" value="<?= $id ?>">
        <div class="azioni">
          <button type="submit" class="pericolo">Elimina definitivamente</button>
          <?= bottone($ritorno, 'Lascia stare', 'neutro') ?>
        </div>
      </form>
    <?php endif ?>
  </div>
  <?php
}

/** Un pulsante-link, per non ripetere le classi a mano. */
function bottone(string $url, string $testo, string $tipo = ''): string
{
  return '<a class="bottone ' . h($tipo) . '" href="' . h($url) . '">' . h($testo) . '</a>';
}
