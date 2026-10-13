<?php
// ============================================================================
// Apparecchi: i registratori telematici e tutto il resto.
//
// Il campo che conta e' "Ultima verifica periodica": da quello si ricava la
// prossima, sommando i mesi di cadenza. Se manca, si parte dalla messa in
// servizio. Se mancano entrambi, l'apparecchio non compare nello scadenzario
// -- ed e' giusto, perche' non c'e' niente da cui calcolare.
// ============================================================================

declare(strict_types=1);

require_once __DIR__ . '/comune.php';
require_once __DIR__ . '/scadenze.php';
require_once __DIR__ . '/layout.php';

richiedi_accesso();

$id = g('id');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verifica_gettone();
  $adesso = date('Y-m-d H:i:s');

  $campi = [
    'cliente_id'           => (int) p('cliente_id'),
    'sede_id'              => p_intero('sede_id'),
    'matricola'            => p('matricola'),
    'tipo'                 => p('tipo', 'rt'),
    'marca'                => p_o_null('marca'),
    'modello'              => p_o_null('modello'),
    'provvedimento'        => p_o_null('provvedimento'),
    'firmware'             => p_o_null('firmware'),
    'data_messa_servizio'  => data_iso(p('data_messa_servizio')),
    'data_ultima_verifica' => data_iso(p('data_ultima_verifica')),
    'verifica_trasmessa'   => p_spunta('verifica_trasmessa'),
    'collegato_pos'        => p_spunta('collegato_pos'),
    'stato'                => p('stato', 'attivo'),
    'data_dismissione'     => data_iso(p('data_dismissione')),
    'note'                 => p_o_null('note'),
    'aggiornato_il'        => $adesso,
  ];

  if ($campi['cliente_id'] === 0 || $campi['matricola'] === '') {
    avvisa('Servono il cliente e la matricola.');
    reindirizza('apparecchi.php?id=' . urlencode(p('id') ?: 'nuovo'));
  }

  $idApp = p('id') === '' ? null : (int) p('id');
  if ($idApp === null) $campi['creato_il'] = $adesso;
  $idApp = salva_riga('apparecchi', $campi, $idApp);

  avvisa('Apparecchio salvato.');
  reindirizza('apparecchi.php?id=' . $idApp);
}

// --- elenco -----------------------------------------------------------------

if ($id === '') {
  $cerca = g('cerca');
  $filtro = g('filtro');

  $sql = 'select a.*, c.ragione_sociale from apparecchi a join clienti c on c.id = a.cliente_id';
  $dove = [];
  $par = [];
  if ($cerca !== '') {
    $dove[] = '(a.matricola like ? or c.ragione_sociale like ? or a.modello like ?)';
    $par = array_merge($par, array_fill(0, 3, '%' . $cerca . '%'));
  }
  if ($filtro === 'pos') { $dove[] = "a.collegato_pos = 0 and a.stato = 'attivo'"; }
  if ($filtro === 'trasmettere') { $dove[] = 'a.verifica_trasmessa = 0 and a.data_ultima_verifica is not null'; }
  if ($dove !== []) $sql .= ' where ' . implode(' and ', $dove);
  $sql .= ' order by c.ragione_sociale, a.matricola';

  $elenco = righe($sql, $par);
  $mesi = mesi_verifica();

  intestazione('Apparecchi', count($elenco) . ' in elenco');
  ?>
  <form class="cerca" method="get">
    <input type="text" name="cerca" value="<?= h($cerca) ?>" placeholder="Cerca per matricola, cliente o modello">
    <button type="submit" class="neutro">Cerca</button>
    <?= bottone('apparecchi.php?id=nuovo', 'Nuovo apparecchio') ?>
  </form>
  <p class="sotto" style="margin-bottom:12px">
    Filtri:
    <a href="apparecchi.php">tutti</a> ·
    <a href="apparecchi.php?filtro=pos">POS da collegare</a> ·
    <a href="apparecchi.php?filtro=trasmettere">verifiche da trasmettere</a>
  </p>

  <div class="scheda">
    <?php if ($elenco === []): ?><p>Nessun apparecchio.</p><?php endif ?>
    <?php foreach ($elenco as $a):
      $prossima = prossima_verifica($a, $mesi);
      $giorni = $prossima ? giorni_a($prossima) : null;
      $f = $giorni === null ? null : fascia($giorni, giorni_avviso());
    ?>
      <a class="voce" href="apparecchi.php?id=<?= (int) $a['id'] ?>">
        <span class="capo"><?= h($a['ragione_sociale']) ?></span>
        <span class="data">
          <?php if ($prossima): ?>
            verifica <?= h(data_it($prossima)) ?>
            <?php if ($f !== null): ?><span class="pillola <?= h($f) ?>"><?= h(quando((int) $giorni)) ?></span><?php endif ?>
          <?php else: ?>
            <span class="pillola">senza date</span>
          <?php endif ?>
        </span>
        <span class="nota">
          Matricola <?= h($a['matricola']) ?> ·
          <?= h(TIPI_APPARECCHIO[$a['tipo']] ?? $a['tipo']) ?>
          <?= $a['modello'] ? ' · ' . h($a['marca'] . ' ' . $a['modello']) : '' ?>
          <?= $a['stato'] !== 'attivo' ? ' <span class="pillola">' . h(STATI_APPARECCHIO[$a['stato']] ?? $a['stato']) . '</span>' : '' ?>
        </span>
      </a>
    <?php endforeach ?>
  </div>
  <?php
  piede();
  exit;
}

// --- scheda -----------------------------------------------------------------

$nuovo = $id === 'nuovo';
$a = $nuovo ? null : riga('select * from apparecchi where id = ?', [(int) $id]);
if (!$nuovo && $a === null) { http_response_code(404); exit('Apparecchio non trovato.'); }

$clienteId = (int) ($a['cliente_id'] ?? g('cliente_id'));
$clienti = righe('select id, ragione_sociale from clienti order by ragione_sociale');
$sedi = $clienteId ? righe('select id, nome from sedi where cliente_id = ? order by nome', [$clienteId]) : [];
// Tutte le sedi, per cambiare la seconda tendina quando si cambia cliente senza
// ricaricare la pagina (e senza perdere quello che si e' gia' scritto).
$tutteSedi = righe('select id, nome, cliente_id from sedi order by nome');
$interventi = $nuovo ? [] : righe('select * from interventi where apparecchio_id = ? order by data desc limit 10', [(int) $id]);

$v = fn(string $campo, string $difetto = '') => h($a[$campo] ?? $difetto);
$prossima = $nuovo ? null : prossima_verifica($a, mesi_verifica());

intestazione($nuovo ? 'Nuovo apparecchio' : 'Matricola ' . $a['matricola']);

if ($prossima !== null):
  $giorni = giorni_a($prossima);
?>
  <div class="scheda">
    <b>Prossima verifica: <?= h(data_it($prossima)) ?></b>
    <span class="pillola <?= h((string) fascia($giorni, 10000)) ?>"><?= h(quando($giorni)) ?></span>
    <p class="sotto">Calcolata sommando <?= mesi_verifica() ?> mesi
      <?= $a['data_ultima_verifica'] ? 'all\'ultima verifica' : 'alla messa in servizio' ?>.
      Non e' un campo da compilare: cambia da sola quando registri una verifica nuova.</p>
  </div>
<?php endif ?>

<div class="scheda">
  <form method="post">
    <?= campo_gettone() ?>
    <input type="hidden" name="id" value="<?= $nuovo ? '' : (int) $a['id'] ?>">

    <div class="campi">
      <div><label>Cliente</label>
        <select name="cliente_id" id="cliente" required data-collega="sede_id">
          <option value="">— scegli —</option>
          <?php foreach ($clienti as $c): ?>
            <option value="<?= (int) $c['id'] ?>" <?= $clienteId === (int) $c['id'] ? 'selected' : '' ?>>
              <?= h($c['ragione_sociale']) ?></option>
          <?php endforeach ?>
        </select>
      </div>
      <div><label>Sede <span class="aiuto">Solo se il cliente ne ha piu' di una</span></label>
        <select name="sede_id" id="sede_id" data-elenco="sedi" data-scelto="<?= (int) ($a['sede_id'] ?? 0) ?>">
          <option value="">—</option>
          <?php foreach ($sedi as $s): ?>
            <option value="<?= (int) $s['id'] ?>" <?= (int) ($a['sede_id'] ?? 0) === (int) $s['id'] ? 'selected' : '' ?>>
              <?= h($s['nome']) ?></option>
          <?php endforeach ?>
        </select>
      </div>

      <div><label>Matricola</label><input type="text" name="matricola" value="<?= $v('matricola') ?>" required></div>
      <div><label>Tipo</label>
        <select name="tipo">
          <?php foreach (TIPI_APPARECCHIO as $k => $nome): ?>
            <option value="<?= h($k) ?>" <?= ($a['tipo'] ?? 'rt') === $k ? 'selected' : '' ?>><?= h($nome) ?></option>
          <?php endforeach ?>
        </select>
      </div>
      <div><label>Marca</label><input type="text" name="marca" value="<?= $v('marca') ?>"></div>
      <div><label>Modello</label><input type="text" name="modello" value="<?= $v('modello') ?>"></div>
      <div><label>Provvedimento di approvazione</label><input type="text" name="provvedimento" value="<?= $v('provvedimento') ?>"></div>
      <div><label>Versione firmware</label><input type="text" name="firmware" value="<?= $v('firmware') ?>"></div>

      <div><label>Messa in servizio <span class="aiuto">gg/mm/aaaa</span></label>
        <input type="text" name="data_messa_servizio" value="<?= h(data_it($a['data_messa_servizio'] ?? null)) ?>" placeholder="10/03/2024"></div>
      <div><label>Ultima verifica periodica <span class="aiuto">Da qui si calcola la prossima</span></label>
        <input type="text" name="data_ultima_verifica" value="<?= h(data_it($a['data_ultima_verifica'] ?? null)) ?>" placeholder="10/03/2024"></div>

      <div><label>Stato</label>
        <select name="stato">
          <?php foreach (STATI_APPARECCHIO as $k => $nome): ?>
            <option value="<?= h($k) ?>" <?= ($a['stato'] ?? 'attivo') === $k ? 'selected' : '' ?>><?= h($nome) ?></option>
          <?php endforeach ?>
        </select>
      </div>
      <div><label>Data dismissione</label>
        <input type="text" name="data_dismissione" value="<?= h(data_it($a['data_dismissione'] ?? null)) ?>"></div>

      <div class="larga"><label class="spunta">
        <input type="checkbox" name="verifica_trasmessa" value="1" <?= ($a['verifica_trasmessa'] ?? 0) ? 'checked' : '' ?>>
        Ultima verifica trasmessa all'Agenzia delle Entrate</label></div>
      <div class="larga"><label class="spunta">
        <input type="checkbox" name="collegato_pos" value="1" <?= ($a['collegato_pos'] ?? 0) ? 'checked' : '' ?>>
        Collegamento con il POS effettuato</label></div>

      <div class="larga"><label>Note</label><textarea name="note"><?= $v('note') ?></textarea></div>
    </div>

    <div class="azioni">
      <button type="submit">Salva</button>
      <?= bottone('apparecchi.php', 'Torna all\'elenco', 'neutro') ?>
      <?php if (!$nuovo): ?>
        <?= bottone('interventi.php?id=nuovo&cliente_id=' . (int) $a['cliente_id'] . '&apparecchio_id=' . (int) $a['id'], 'Nuovo intervento', 'neutro') ?>
      <?php endif ?>
    </div>
  </form>
</div>

<?php if ($interventi !== []): ?>
  <h2>Interventi su questo apparecchio</h2>
  <div class="scheda">
    <?php foreach ($interventi as $i): ?>
      <a class="voce" href="interventi.php?id=<?= (int) $i['id'] ?>">
        <span class="capo"><?= h($i['numero'] ?: '(senza numero)') ?> · <?= h(ucfirst((string) $i['tipo'])) ?></span>
        <span class="data"><?= h(data_it($i['data'])) ?></span>
      </a>
    <?php endforeach ?>
  </div>
<?php endif ?>

<script>window.ELENCHI = { sedi: <?= json_encode($tutteSedi, JSON_UNESCAPED_UNICODE) ?> };</script>

<?php piede(); ?>
