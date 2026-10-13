<?php
// ============================================================================
// Clienti: elenco, scheda, e le sedi dentro la scheda.
//
// Tutte le pagine di questo gestionale hanno la stessa forma, cosi' quando ne
// hai capita una hai capito tutte:
//
//   1. in cima si gestisce il POST (il salvataggio), poi si reindirizza;
//   2. si leggono i dati che servono;
//   3. si scrive la pagina.
//
// Il reindirizzamento dopo il salvataggio non e' un vezzo: senza, premendo
// "ricarica" il browser rimanderebbe lo stesso salvataggio una seconda volta.
// ============================================================================

declare(strict_types=1);

require_once __DIR__ . '/comune.php';
require_once __DIR__ . '/layout.php';

richiedi_accesso();

$id = g('id');

// --- 1. salvataggi ----------------------------------------------------------

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verifica_gettone();
  $azione = p('azione');
  $adesso = date('Y-m-d H:i:s');

  if ($azione === 'cliente') {
    $campi = [
      'ragione_sociale' => p('ragione_sociale'),
      'partita_iva'     => p_o_null('partita_iva'),
      'codice_fiscale'  => p_o_null('codice_fiscale'),
      'codice_sdi'      => p_o_null('codice_sdi'),
      'pec'             => p_o_null('pec'),
      'email'           => p_o_null('email'),
      'telefono'        => p_o_null('telefono'),
      'indirizzo'       => p_o_null('indirizzo'),
      'cap'             => p_o_null('cap'),
      'citta'           => p_o_null('citta'),
      'provincia'       => p_o_null('provincia'),
      'note'            => p_o_null('note'),
      'attivo'          => p_spunta('attivo'),
      'aggiornato_il'   => $adesso,
    ];
    if ($campi['ragione_sociale'] === '') {
      avvisa('La ragione sociale non puo\' restare vuota.');
      reindirizza('clienti.php?id=' . urlencode(p('id') ?: 'nuovo'));
    }

    $idCliente = p('id') === '' ? null : (int) p('id');
    if ($idCliente === null) $campi['creato_il'] = $adesso;
    $idCliente = salva_riga('clienti', $campi, $idCliente);

    avvisa('Cliente salvato.');
    reindirizza('clienti.php?id=' . $idCliente);
  }

  if ($azione === 'sede') {
    $idCliente = (int) p('cliente_id');
    $campi = [
      'cliente_id' => $idCliente,
      'nome'       => p('nome') ?: 'Sede',
      'indirizzo'  => p_o_null('indirizzo'),
      'cap'        => p_o_null('cap'),
      'citta'      => p_o_null('citta'),
      'provincia'  => p_o_null('provincia'),
      'referente'  => p_o_null('referente'),
      'telefono'   => p_o_null('telefono'),
      'note'       => p_o_null('note'),
    ];
    salva_riga('sedi', $campi, p('id') === '' ? null : (int) p('id'));
    avvisa('Sede salvata.');
    reindirizza('clienti.php?id=' . $idCliente);
  }

  if ($azione === 'cancella_sede') {
    $idCliente = (int) p('cliente_id');
    $idSede = (int) p('id');
    // Una sede usata da un apparecchio non si cancella: si perderebbe il
    // riferimento. Prima si sposta l'apparecchio.
    $usata = (int) valore('select count(*) from apparecchi where sede_id = ?', [$idSede]);
    if ($usata > 0) {
      avvisa("Non posso cancellare la sede: ci sono $usata apparecchi collegati.");
    } else {
      q('delete from sedi where id = ?', [$idSede]);
      avvisa('Sede cancellata.');
    }
    reindirizza('clienti.php?id=' . $idCliente);
  }
}

// --- 2. lettura -------------------------------------------------------------

if ($id === '') {
  $cerca = g('cerca');
  $sql = 'select c.*,
            (select count(*) from apparecchi a where a.cliente_id = c.id) as apparecchi,
            (select count(*) from contratti t where t.cliente_id = c.id and t.stato = \'attivo\') as contratti
          from clienti c';
  $par = [];
  if ($cerca !== '') {
    $sql .= ' where c.ragione_sociale like ? or c.citta like ? or c.partita_iva like ?';
    $par = array_fill(0, 3, '%' . $cerca . '%');
  }
  $sql .= ' order by c.ragione_sociale';
  $elenco = righe($sql, $par);

  intestazione('Clienti', count($elenco) . ($cerca !== '' ? ' trovati' : ' in archivio'));
  ?>
  <form class="cerca" method="get">
    <input type="text" name="cerca" value="<?= h($cerca) ?>" placeholder="Cerca per nome, citta' o partita IVA">
    <button type="submit" class="neutro">Cerca</button>
    <?= bottone('clienti.php?id=nuovo', 'Nuovo cliente') ?>
  </form>

  <div class="scheda">
    <?php if ($elenco === []): ?>
      <p>Nessun cliente<?= $cerca !== '' ? ' con questo nome' : ' ancora' ?>.</p>
    <?php endif ?>
    <?php foreach ($elenco as $c): ?>
      <a class="voce" href="clienti.php?id=<?= (int) $c['id'] ?>">
        <span class="capo"><?= h($c['ragione_sociale']) ?>
          <?= $c['attivo'] ? '' : '<span class="pillola">non attivo</span>' ?></span>
        <span class="data"><?= (int) $c['apparecchi'] ?> app. · <?= (int) $c['contratti'] ?> contr.</span>
        <span class="nota"><?= h(trim(($c['citta'] ?? '') . ' ' . ($c['provincia'] ? '(' . $c['provincia'] . ')' : ''))) ?>
          <?= $c['telefono'] ? ' · ' . h($c['telefono']) : '' ?></span>
      </a>
    <?php endforeach ?>
  </div>
  <?php
  piede();
  exit;
}

$nuovo = $id === 'nuovo';
$c = $nuovo ? null : riga('select * from clienti where id = ?', [(int) $id]);
if (!$nuovo && $c === null) { http_response_code(404); exit('Cliente non trovato.'); }

$v = fn(string $campo, string $difetto = '') => h($c[$campo] ?? $difetto);

$sedi = $nuovo ? [] : righe('select * from sedi where cliente_id = ? order by nome', [(int) $id]);
$apparecchi = $nuovo ? [] : righe('select * from apparecchi where cliente_id = ? order by matricola', [(int) $id]);
$contratti = $nuovo ? [] : righe('select * from contratti where cliente_id = ? order by data_scadenza', [(int) $id]);
$interventi = $nuovo ? [] : righe('select * from interventi where cliente_id = ? order by data desc limit 10', [(int) $id]);

intestazione($nuovo ? 'Nuovo cliente' : (string) $c['ragione_sociale']);
?>

<div class="scheda">
  <form method="post">
    <?= campo_gettone() ?>
    <input type="hidden" name="azione" value="cliente">
    <input type="hidden" name="id" value="<?= $nuovo ? '' : (int) $c['id'] ?>">

    <div class="campi">
      <div class="larga"><label>Ragione sociale</label>
        <input type="text" name="ragione_sociale" value="<?= $v('ragione_sociale') ?>" required autofocus></div>
      <div><label>Partita IVA</label><input type="text" name="partita_iva" value="<?= $v('partita_iva') ?>"></div>
      <div><label>Codice fiscale</label><input type="text" name="codice_fiscale" value="<?= $v('codice_fiscale') ?>"></div>
      <div><label>Telefono</label><input type="text" name="telefono" value="<?= $v('telefono') ?>"></div>
      <div><label>Email</label><input type="text" name="email" value="<?= $v('email') ?>"></div>
      <div><label>PEC</label><input type="text" name="pec" value="<?= $v('pec') ?>"></div>
      <div><label>Codice SDI <span class="aiuto">Per la fatturazione elettronica</span></label>
        <input type="text" name="codice_sdi" value="<?= $v('codice_sdi') ?>"></div>
      <div class="larga"><label>Indirizzo</label><input type="text" name="indirizzo" value="<?= $v('indirizzo') ?>"></div>
      <div><label>CAP</label><input type="text" name="cap" value="<?= $v('cap') ?>"></div>
      <div><label>Citta'</label><input type="text" name="citta" value="<?= $v('citta') ?>"></div>
      <div><label>Provincia</label><input type="text" name="provincia" maxlength="4" value="<?= $v('provincia') ?>"></div>
      <div class="larga"><label>Note</label><textarea name="note"><?= $v('note') ?></textarea></div>
      <div class="larga"><label class="spunta">
        <input type="checkbox" name="attivo" value="1" <?= ($c['attivo'] ?? 1) ? 'checked' : '' ?>>
        Cliente attivo</label></div>
    </div>

    <div class="azioni">
      <button type="submit">Salva</button>
      <?= bottone('clienti.php', 'Torna all\'elenco', 'neutro') ?>
      <?php if (!$nuovo): ?>
        <?= bottone('interventi.php?id=nuovo&cliente_id=' . (int) $c['id'], 'Nuovo intervento', 'neutro') ?>
      <?php endif ?>
    </div>
  </form>
</div>

<?php if (!$nuovo): ?>

  <h2>Sedi</h2>
  <div class="scheda">
    <p class="sotto">Serve solo a chi ha piu' di un punto vendita. Un cliente con una sede sola
      puo' farne a meno.</p>
    <?php foreach ($sedi as $s): ?>
      <div class="voce">
        <span class="capo"><?= h($s['nome']) ?></span>
        <span class="nota"><?= h(trim(($s['indirizzo'] ?? '') . ' ' . ($s['citta'] ?? ''))) ?>
          <?= $s['referente'] ? ' · ' . h($s['referente']) : '' ?></span>
        <form method="post" onsubmit="return confirm('Cancellare la sede?')">
          <?= campo_gettone() ?>
          <input type="hidden" name="azione" value="cancella_sede">
          <input type="hidden" name="id" value="<?= (int) $s['id'] ?>">
          <input type="hidden" name="cliente_id" value="<?= (int) $c['id'] ?>">
          <button type="submit" class="pericolo">Cancella</button>
        </form>
      </div>
    <?php endforeach ?>

    <form method="post" style="margin-top:12px">
      <?= campo_gettone() ?>
      <input type="hidden" name="azione" value="sede">
      <input type="hidden" name="cliente_id" value="<?= (int) $c['id'] ?>">
      <div class="campi">
        <div><label>Nome della sede</label><input type="text" name="nome" placeholder="Negozio di via Roma"></div>
        <div><label>Indirizzo</label><input type="text" name="indirizzo"></div>
        <div><label>Citta'</label><input type="text" name="citta"></div>
        <div><label>Referente</label><input type="text" name="referente"></div>
      </div>
      <div class="azioni"><button type="submit" class="neutro">Aggiungi la sede</button></div>
    </form>
  </div>

  <h2>Apparecchi <span class="pillola"><?= count($apparecchi) ?></span></h2>
  <div class="scheda">
    <?php if ($apparecchi === []): ?><p class="sotto">Nessun apparecchio.</p><?php endif ?>
    <?php foreach ($apparecchi as $a): ?>
      <a class="voce" href="apparecchi.php?id=<?= (int) $a['id'] ?>">
        <span class="capo"><?= h($a['matricola']) ?></span>
        <span class="data"><?= h(data_it($a['data_ultima_verifica'])) ?></span>
        <span class="nota"><?= h(trim(($a['marca'] ?? '') . ' ' . ($a['modello'] ?? ''))) ?></span>
      </a>
    <?php endforeach ?>
    <div class="azioni"><?= bottone('apparecchi.php?id=nuovo&cliente_id=' . (int) $c['id'], 'Aggiungi un apparecchio', 'neutro') ?></div>
  </div>

  <h2>Contratti <span class="pillola"><?= count($contratti) ?></span></h2>
  <div class="scheda">
    <?php if ($contratti === []): ?><p class="sotto">Nessun contratto.</p><?php endif ?>
    <?php foreach ($contratti as $t): ?>
      <a class="voce" href="contratti.php?id=<?= (int) $t['id'] ?>">
        <span class="capo"><?= h($t['descrizione'] ?: ucfirst((string) $t['tipo'])) ?></span>
        <span class="data"><?= h(data_it($t['data_scadenza'])) ?></span>
      </a>
    <?php endforeach ?>
    <div class="azioni"><?= bottone('contratti.php?id=nuovo&cliente_id=' . (int) $c['id'], 'Aggiungi un contratto', 'neutro') ?></div>
  </div>

  <h2>Ultimi interventi</h2>
  <div class="scheda">
    <?php if ($interventi === []): ?><p class="sotto">Nessun intervento.</p><?php endif ?>
    <?php foreach ($interventi as $i): ?>
      <a class="voce" href="interventi.php?id=<?= (int) $i['id'] ?>">
        <span class="capo"><?= h($i['numero'] ?: '(senza numero)') ?> · <?= h(ucfirst((string) $i['tipo'])) ?></span>
        <span class="data"><?= h(data_it($i['data'])) ?></span>
      </a>
    <?php endforeach ?>
  </div>

<?php endif ?>

<?php piede(); ?>
