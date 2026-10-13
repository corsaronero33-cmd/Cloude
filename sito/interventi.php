<?php
// ============================================================================
// Interventi: il rapportino.
//
// E' la pagina che si compila dal cliente, col telefono in una mano. Quindi:
//
//   * i campi stanno uno sotto l'altro e sono grandi da toccare;
//   * la firma si prende col dito sulla tela in fondo;
//   * quello che si scrive viene tenuto anche nella memoria del telefono
//     (vedi app.js): se cade la linea mentre si salva, riaprendo la pagina il
//     rapportino e' ancora la'.
//
// Le righe dei materiali si salvano cancellandole e riscrivendole tutte: con
// cinque righe per rapportino e' l'operazione piu' semplice che funziona, e
// non lascia righe orfane.
// ============================================================================

declare(strict_types=1);

require_once __DIR__ . '/comune.php';
require_once __DIR__ . '/layout.php';

richiedi_accesso();

$id = g('id');

/** Il numero del rapportino: 2026/001, progressivo per anno. */
function prossimo_numero(): string
{
  $anno = date('Y');
  $ultimo = (string) (valore(
    'select numero from interventi where numero like ? order by numero desc limit 1',
    [$anno . '/%'],
  ) ?? '');
  $n = $ultimo === '' ? 0 : (int) substr($ultimo, 5);
  return sprintf('%s/%03d', $anno, $n + 1);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verifica_gettone();
  $adesso = date('Y-m-d H:i:s');

  if (p('azione') === 'cancella') {
    $idInt = (int) p('id');
    q('delete from intervento_righe where intervento_id = ?', [$idInt]);
    q('delete from interventi where id = ?', [$idInt]);
    avvisa('Intervento cancellato.');
    reindirizza('interventi.php');
  }

  $campi = [
    'cliente_id'     => (int) p('cliente_id'),
    'apparecchio_id' => p_intero('apparecchio_id'),
    'sede_id'        => p_intero('sede_id'),
    'tecnico_id'     => p_intero('tecnico_id'),
    'tipo'           => p('tipo', 'assistenza'),
    'stato'          => p('stato', 'aperto'),
    'data'           => data_iso(p('data')) ?? oggi(),
    'ora_inizio'     => p_o_null('ora_inizio'),
    'ora_fine'       => p_o_null('ora_fine'),
    'descrizione'    => p_o_null('descrizione'),
    'soluzione'      => p_o_null('soluzione'),
    'esito_verifica' => p_o_null('esito_verifica'),
    'sigilli'        => p_o_null('sigilli'),
    'libretto'       => p_o_null('libretto'),
    'firma_nome'     => p_o_null('firma_nome'),
    'aggiornato_il'  => $adesso,
  ];

  // La firma arriva come immagine dentro il form. Se il campo e' vuoto si
  // tiene quella che c'era: non si cancella una firma per sbaglio.
  $firma = p('firma_png');
  if (str_starts_with($firma, 'data:image/png;base64,')) $campi['firma_png'] = $firma;
  if (p('firma_cancella') === '1') $campi['firma_png'] = null;

  if ($campi['cliente_id'] === 0) {
    avvisa('Serve il cliente.');
    reindirizza('interventi.php?id=' . urlencode(p('id') ?: 'nuovo'));
  }

  $idInt = p('id') === '' ? null : (int) p('id');
  if ($idInt === null) {
    $campi['creato_il'] = $adesso;
    $campi['numero'] = prossimo_numero();
  }
  $idInt = salva_riga('interventi', $campi, $idInt);

  // Le righe: si riscrivono tutte.
  q('delete from intervento_righe where intervento_id = ?', [$idInt]);
  $descrizioni = (array) ($_POST['riga_descrizione'] ?? []);
  foreach ($descrizioni as $i => $d) {
    $d = trim((string) $d);
    if ($d === '') continue;
    $qta = str_replace(',', '.', (string) ($_POST['riga_quantita'][$i] ?? '1'));
    $prz = str_replace(',', '.', (string) ($_POST['riga_prezzo'][$i] ?? ''));
    salva_riga('intervento_righe', [
      'intervento_id' => $idInt,
      'descrizione'   => $d,
      'quantita'      => $qta === '' ? 1 : (float) $qta,
      'prezzo'        => $prz === '' ? null : (float) $prz,
    ]);
  }

  // Una verifica periodica registrata aggiorna l'apparecchio: e' la data da
  // cui si calcolera' la prossima. Senza questo passaggio il tecnico
  // dovrebbe ricordarsi di riscrivere la stessa data in due posti.
  if ($campi['tipo'] === 'verifica' && $campi['apparecchio_id'] !== null && $campi['esito_verifica'] === 'conforme') {
    q('update apparecchi set data_ultima_verifica = ?, verifica_trasmessa = 0, aggiornato_il = ? where id = ?',
      [$campi['data'], $adesso, $campi['apparecchio_id']]);
    avvisa('Intervento salvato. Ho aggiornato anche l\'ultima verifica dell\'apparecchio.');
  } else {
    avvisa('Intervento salvato.');
  }

  reindirizza('interventi.php?id=' . $idInt);
}

// --- elenco -----------------------------------------------------------------

if ($id === '') {
  $cerca = g('cerca');
  $sql = 'select i.*, c.ragione_sociale, u.nome as tecnico
            from interventi i
            join clienti c on c.id = i.cliente_id
            left join utenti u on u.id = i.tecnico_id';
  $par = [];
  if ($cerca !== '') {
    $sql .= ' where c.ragione_sociale like ? or i.numero like ? or i.descrizione like ?';
    $par = array_fill(0, 3, '%' . $cerca . '%');
  }
  $sql .= ' order by i.data desc, i.id desc limit 200';
  $elenco = righe($sql, $par);

  intestazione('Interventi', count($elenco) . ' piu\' recenti');
  ?>
  <form class="cerca" method="get">
    <input type="text" name="cerca" value="<?= h($cerca) ?>" placeholder="Cerca per cliente, numero o descrizione">
    <button type="submit" class="neutro">Cerca</button>
    <?= bottone('interventi.php?id=nuovo', 'Nuovo intervento') ?>
  </form>

  <div class="scheda">
    <?php if ($elenco === []): ?><p>Nessun intervento.</p><?php endif ?>
    <?php foreach ($elenco as $i): ?>
      <a class="voce" href="interventi.php?id=<?= (int) $i['id'] ?>">
        <span class="capo"><?= h($i['ragione_sociale']) ?></span>
        <span class="data"><?= h(data_it($i['data'])) ?> · <?= h($i['numero']) ?></span>
        <span class="nota">
          <span class="pillola"><?= h(TIPI_INTERVENTO[$i['tipo']] ?? $i['tipo']) ?></span>
          <?= h(mb_strimwidth((string) $i['descrizione'], 0, 90, '…')) ?>
          <?= $i['tecnico'] ? ' · ' . h($i['tecnico']) : '' ?>
          <?= $i['stato'] === 'aperto' ? ' <span class="pillola sette">aperto</span>' : '' ?>
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
$i = $nuovo ? null : riga('select * from interventi where id = ?', [(int) $id]);
if (!$nuovo && $i === null) { http_response_code(404); exit('Intervento non trovato.'); }

$clienteId = (int) ($i['cliente_id'] ?? g('cliente_id'));
$apparecchioId = (int) ($i['apparecchio_id'] ?? g('apparecchio_id'));

$clienti = righe('select id, ragione_sociale from clienti where attivo = 1 order by ragione_sociale');
$tecnici = righe('select id, nome, email from utenti where attivo = 1 order by nome');
$tutteSedi = righe('select id, nome, cliente_id from sedi order by nome');
$tuttiApparecchi = righe("select id, cliente_id, matricola, marca, modello from apparecchi where stato <> 'dismesso' order by matricola");
foreach ($tuttiApparecchi as $k => $a) {
  $tuttiApparecchi[$k]['etichetta'] = trim($a['matricola'] . ' · ' . $a['marca'] . ' ' . $a['modello']);
}

$righeInt = $nuovo ? [] : righe('select * from intervento_righe where intervento_id = ? order by id', [(int) $id]);
$v = fn(string $campo, string $difetto = '') => h($i[$campo] ?? $difetto);

$ore = null;
if (!$nuovo && $i['ora_inizio'] && $i['ora_fine']) {
  $min = (strtotime('1970-01-01 ' . $i['ora_fine'] . ':00') - strtotime('1970-01-01 ' . $i['ora_inizio'] . ':00')) / 60;
  if ($min > 0) $ore = sprintf('%d h %02d', intdiv((int) $min, 60), (int) $min % 60);
}

intestazione(
  $nuovo ? 'Nuovo intervento' : 'Rapportino ' . $i['numero'],
  $ore !== null ? 'Durata ' . $ore : '',
);
?>

<p class="fatto" id="avviso-bozza" hidden>
  C'e' un rapportino rimasto a meta' su questo dispositivo.
  <button type="button" id="riprendi-bozza" class="neutro">Riprendilo</button>
  <button type="button" id="butta-bozza" class="neutro">Buttalo</button>
</p>

<form method="post" data-bozza="intervento-<?= $nuovo ? 'nuovo' : (int) $i['id'] ?>">
  <?= campo_gettone() ?>
  <input type="hidden" name="id" value="<?= $nuovo ? '' : (int) $i['id'] ?>">

  <div class="scheda">
    <div class="campi">
      <div><label>Cliente</label>
        <select name="cliente_id" id="cliente" required data-collega="sede_id,apparecchio_id">
          <option value="">— scegli —</option>
          <?php foreach ($clienti as $c): ?>
            <option value="<?= (int) $c['id'] ?>" <?= $clienteId === (int) $c['id'] ? 'selected' : '' ?>>
              <?= h($c['ragione_sociale']) ?></option>
          <?php endforeach ?>
        </select>
      </div>
      <div><label>Apparecchio</label>
        <select name="apparecchio_id" id="apparecchio_id" data-elenco="apparecchi" data-scelto="<?= $apparecchioId ?>">
          <option value="">—</option>
          <?php foreach ($tuttiApparecchi as $a): if ((int) $a['cliente_id'] !== $clienteId) continue; ?>
            <option value="<?= (int) $a['id'] ?>" <?= $apparecchioId === (int) $a['id'] ? 'selected' : '' ?>>
              <?= h($a['etichetta']) ?></option>
          <?php endforeach ?>
        </select>
      </div>
      <div><label>Sede</label>
        <select name="sede_id" id="sede_id" data-elenco="sedi" data-scelto="<?= (int) ($i['sede_id'] ?? 0) ?>">
          <option value="">—</option>
          <?php foreach ($tutteSedi as $s): if ((int) $s['cliente_id'] !== $clienteId) continue; ?>
            <option value="<?= (int) $s['id'] ?>" <?= (int) ($i['sede_id'] ?? 0) === (int) $s['id'] ? 'selected' : '' ?>>
              <?= h($s['nome']) ?></option>
          <?php endforeach ?>
        </select>
      </div>
      <div><label>Tecnico</label>
        <select name="tecnico_id">
          <?php $tecnicoScelto = (int) ($i['tecnico_id'] ?? utente()['id']); ?>
          <?php foreach ($tecnici as $t): ?>
            <option value="<?= (int) $t['id'] ?>" <?= $tecnicoScelto === (int) $t['id'] ? 'selected' : '' ?>>
              <?= h($t['nome'] ?: $t['email']) ?></option>
          <?php endforeach ?>
        </select>
      </div>

      <div><label>Tipo</label>
        <select name="tipo">
          <?php foreach (TIPI_INTERVENTO as $k => $nome): ?>
            <option value="<?= h($k) ?>" <?= ($i['tipo'] ?? 'assistenza') === $k ? 'selected' : '' ?>><?= h($nome) ?></option>
          <?php endforeach ?>
        </select>
      </div>
      <div><label>Stato</label>
        <select name="stato">
          <?php foreach (STATI_INTERVENTO as $k => $nome): ?>
            <option value="<?= h($k) ?>" <?= ($i['stato'] ?? 'aperto') === $k ? 'selected' : '' ?>><?= h($nome) ?></option>
          <?php endforeach ?>
        </select>
      </div>

      <div><label>Data</label>
        <input type="text" name="data" value="<?= h(data_it($i['data'] ?? oggi())) ?>" required></div>
      <div class="campi" style="grid-template-columns:1fr 1fr;gap:8px">
        <div><label>Ora inizio</label><input type="time" name="ora_inizio" value="<?= $v('ora_inizio') ?>"></div>
        <div><label>Ora fine</label><input type="time" name="ora_fine" value="<?= $v('ora_fine') ?>"></div>
      </div>

      <div class="larga"><label>Problema riferito dal cliente</label>
        <textarea name="descrizione"><?= $v('descrizione') ?></textarea></div>
      <div class="larga"><label>Lavoro eseguito</label>
        <textarea name="soluzione"><?= $v('soluzione') ?></textarea></div>
    </div>
  </div>

  <h2>Verifica periodica</h2>
  <div class="scheda">
    <p class="sotto">Da compilare quando il tipo e' <i>Verifica periodica</i>. Con esito
      <i>Conforme</i>, salvando, la data finisce anche sull'apparecchio come ultima verifica:
      non va riscritta a mano.</p>
    <div class="campi">
      <div><label>Esito</label>
        <select name="esito_verifica">
          <?php foreach (ESITI as $k => $nome): ?>
            <option value="<?= h($k) ?>" <?= ($i['esito_verifica'] ?? '') === $k ? 'selected' : '' ?>><?= h($nome) ?></option>
          <?php endforeach ?>
        </select>
      </div>
      <div><label>Sigilli <span class="aiuto">Numeri o riferimento</span></label>
        <input type="text" name="sigilli" value="<?= $v('sigilli') ?>"></div>
      <div class="larga"><label>Libretto di dotazione fiscale</label>
        <input type="text" name="libretto" value="<?= $v('libretto') ?>" placeholder="Annotazione riportata sul libretto"></div>
    </div>
  </div>

  <h2>Materiali e manodopera</h2>
  <div class="scheda">
    <table>
      <tr><th style="width:60%">Descrizione</th><th>Quantita'</th><th>Prezzo unitario</th></tr>
      <?php
      $daMostrare = $righeInt;
      for ($n = 0; $n < 3; $n++) $daMostrare[] = ['descrizione' => '', 'quantita' => '', 'prezzo' => ''];
      foreach ($daMostrare as $r): ?>
        <tr>
          <td><input type="text" name="riga_descrizione[]" value="<?= h((string) $r['descrizione']) ?>"></td>
          <td><input type="text" name="riga_quantita[]" value="<?= $r['quantita'] === '' ? '' : h(rtrim(rtrim(number_format((float) $r['quantita'], 2, ',', ''), '0'), ',')) ?>"></td>
          <td><input type="text" name="riga_prezzo[]" value="<?= $r['prezzo'] === null || $r['prezzo'] === '' ? '' : h(number_format((float) $r['prezzo'], 2, ',', '')) ?>"></td>
        </tr>
      <?php endforeach ?>
    </table>
    <p class="sotto">Le righe vuote non si salvano. Salvando ne ricompaiono tre nuove.</p>
  </div>

  <h2>Firma del cliente</h2>
  <div class="scheda">
    <?php if (!$nuovo && $i['firma_png']): ?>
      <img src="<?= h($i['firma_png']) ?>" alt="firma" style="max-width:320px;border:1px solid #e2e8f0;border-radius:8px">
      <label class="spunta" style="margin-top:8px">
        <input type="checkbox" name="firma_cancella" value="1"> Cancella la firma e rifalla</label>
    <?php else: ?>
      <p class="sotto">Si firma col dito o col mouse, dentro il riquadro.</p>
      <canvas id="firma" class="firma-area"></canvas>
      <input type="hidden" name="firma_png" id="firma_png" value="">
      <div class="azioni"><button type="button" id="pulisci-firma" class="neutro">Pulisci</button></div>
    <?php endif ?>
    <div class="campi" style="margin-top:12px">
      <div><label>Nome di chi firma</label><input type="text" name="firma_nome" value="<?= $v('firma_nome') ?>"></div>
    </div>
  </div>

  <div class="azioni">
    <button type="submit">Salva</button>
    <?php if (!$nuovo): ?>
      <?= bottone('rapportino.php?id=' . (int) $i['id'], 'Stampa il rapportino', 'neutro') ?>
    <?php endif ?>
    <?= bottone('interventi.php', 'Torna all\'elenco', 'neutro') ?>
  </div>
</form>

<?php if (!$nuovo): ?>
  <form method="post" style="margin-top:24px" onsubmit="return confirm('Cancellare questo intervento?')">
    <?= campo_gettone() ?>
    <input type="hidden" name="azione" value="cancella">
    <input type="hidden" name="id" value="<?= (int) $i['id'] ?>">
    <button type="submit" class="pericolo">Cancella l'intervento</button>
  </form>
<?php endif ?>

<script>window.ELENCHI = {
  sedi: <?= json_encode($tutteSedi, JSON_UNESCAPED_UNICODE) ?>,
  apparecchi: <?= json_encode($tuttiApparecchi, JSON_UNESCAPED_UNICODE) ?>
};</script>

<?php piede(); ?>
