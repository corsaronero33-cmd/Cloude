<?php
// ============================================================================
// La pagina iniziale: che cosa scade, in ordine di urgenza.
//
// E' la pagina che si guarda al mattino, quindi non chiede niente: apre e
// mostra. I numeri in alto sono le quattro fasce; sotto, le voci una per riga
// con il cliente e quanto manca.
// ============================================================================

declare(strict_types=1);

require_once __DIR__ . '/comune.php';
require_once __DIR__ . '/scadenze.php';
require_once __DIR__ . '/layout.php';

richiedi_accesso();

$voci = scadenzario();
$gruppi = per_fascia($voci);
$conti = riepilogo($voci);
$trasmettere = da_trasmettere();
$pos = pos_da_collegare();

intestazione('Scadenze', 'Preavviso di ' . giorni_avviso() . ' giorni, verifica ogni ' . mesi_verifica() . ' mesi');
?>

<div class="numeri">
  <?php foreach (FASCE as $chiave => $nome): ?>
    <a class="numero <?= h($chiave) ?>" href="#<?= h($chiave) ?>">
      <b><?= (int) $conti[$chiave] ?></b>
      <span><?= h($nome) ?></span>
    </a>
  <?php endforeach ?>
</div>

<div class="azioni">
  <?= bottone('interventi.php?id=nuovo', 'Nuovo intervento') ?>
  <?= bottone('clienti.php?id=nuovo', 'Nuovo cliente', 'neutro') ?>
</div>

<?php if ($voci === []): ?>
  <div class="scheda">
    <p>Niente in scadenza entro <?= giorni_avviso() ?> giorni.</p>
    <p class="sotto">
      Se hai appena installato il sito e' normale: inserisci i clienti, poi gli apparecchi con
      la data dell'ultima verifica, e questa pagina si riempie da sola.
    </p>
  </div>
<?php endif ?>

<?php foreach ($gruppi as $chiave => $gruppo): ?>
  <h2 id="<?= h($chiave) ?>"><?= h(FASCE[$chiave]) ?> <span class="pillola <?= h($chiave) ?>"><?= count($gruppo) ?></span></h2>
  <div class="scheda">
    <?php foreach ($gruppo as $v): ?>
      <a class="voce" href="<?= h($v['link']) ?>">
        <span class="capo"><?= h($v['cliente']) ?></span>
        <span class="data"><?= h(data_it($v['data'])) ?> · <?= h(quando($v['giorni'])) ?></span>
        <span class="nota">
          <span class="pillola"><?= h($v['etichetta']) ?></span>
          <?= h($v['titolo']) ?><?= $v['dettaglio'] !== '' ? ' · ' . h($v['dettaglio']) : '' ?>
        </span>
      </a>
    <?php endforeach ?>
  </div>
<?php endforeach ?>

<?php if ($trasmettere !== []): ?>
  <h2>Verifiche da trasmettere <span class="pillola sette"><?= count($trasmettere) ?></span></h2>
  <div class="scheda">
    <p class="sotto">Verifiche registrate e non ancora trasmesse all'Agenzia delle Entrate.
      La spunta si mette nella scheda dell'apparecchio.</p>
    <?php foreach ($trasmettere as $t): ?>
      <a class="voce" href="apparecchi.php?id=<?= (int) $t['id'] ?>">
        <span class="capo"><?= h($t['ragione_sociale']) ?></span>
        <span class="data">verificato il <?= h(data_it($t['data_ultima_verifica'])) ?></span>
        <span class="nota">Matricola <?= h($t['matricola']) ?></span>
      </a>
    <?php endforeach ?>
  </div>
<?php endif ?>

<?php if ($pos !== []): ?>
  <h2>POS da collegare <span class="pillola"><?= count($pos) ?></span></h2>
  <div class="scheda">
    <p class="sotto">Apparecchi per cui non hai ancora registrato il collegamento con il
      terminale di pagamento.</p>
    <?php foreach (array_slice($pos, 0, 10) as $t): ?>
      <a class="voce" href="apparecchi.php?id=<?= (int) $t['id'] ?>">
        <span class="capo"><?= h($t['ragione_sociale']) ?></span>
        <span class="nota">Matricola <?= h($t['matricola']) ?></span>
      </a>
    <?php endforeach ?>
    <?php if (count($pos) > 10): ?>
      <p class="sotto"><a href="apparecchi.php?filtro=pos">Vedi tutti (<?= count($pos) ?>)</a></p>
    <?php endif ?>
  </div>
<?php endif ?>

<?php piede(); ?>
