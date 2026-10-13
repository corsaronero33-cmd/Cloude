<?php
// ============================================================================
// Contratti e abbonamenti.
//
// Il pulsante "Rinnova" sposta la scadenza avanti di un periodo partendo
// dalla scadenza vecchia, non da oggi: se il cliente paga il rinnovo con due
// settimane di ritardo non deve perdere due settimane di contratto.
// ============================================================================

declare(strict_types=1);

require_once __DIR__ . '/comune.php';
require_once __DIR__ . '/layout.php';

richiedi_accesso();

$id = g('id');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verifica_gettone();
  $adesso = date('Y-m-d H:i:s');

  if (p('azione') === 'rinnova') {
    $t = riga('select * from contratti where id = ?', [(int) p('id')]);
    if ($t === null) { http_response_code(404); exit('Contratto non trovato.'); }
    $mesi = PERIODI[$t['periodicita']][1] ?? 12;
    $base = $t['data_scadenza'] ?: oggi();
    $nuova = aggiungi_mesi($base, $mesi);
    q('update contratti set data_scadenza = ?, stato = \'attivo\', aggiornato_il = ? where id = ?',
      [$nuova, $adesso, (int) $t['id']]);
    avvisa('Rinnovato fino al ' . data_it($nuova) . '.');
    reindirizza('contratti.php?id=' . (int) $t['id']);
  }

  $campi = [
    'cliente_id'         => (int) p('cliente_id'),
    'tipo'               => p('tipo', 'software'),
    'descrizione'        => p('descrizione'),
    'licenza'            => p_o_null('licenza'),
    'data_inizio'        => data_iso(p('data_inizio')),
    'data_scadenza'      => data_iso(p('data_scadenza')),
    'periodicita'        => p('periodicita', 'annuale'),
    'importo'            => p_decimale('importo'),
    'rinnovo_automatico' => p_spunta('rinnovo_automatico'),
    'stato'              => p('stato', 'attivo'),
    'note'               => p_o_null('note'),
    'aggiornato_il'      => $adesso,
  ];

  if ($campi['cliente_id'] === 0) {
    avvisa('Serve il cliente.');
    reindirizza('contratti.php?id=' . urlencode(p('id') ?: 'nuovo'));
  }

  $idCon = p('id') === '' ? null : (int) p('id');
  if ($idCon === null) $campi['creato_il'] = $adesso;
  $idCon = salva_riga('contratti', $campi, $idCon);

  avvisa('Contratto salvato.');
  reindirizza('contratti.php?id=' . $idCon);
}

// --- elenco -----------------------------------------------------------------

if ($id === '') {
  $cerca = g('cerca');
  $sql = 'select t.*, c.ragione_sociale from contratti t join clienti c on c.id = t.cliente_id';
  $par = [];
  if ($cerca !== '') {
    $sql .= ' where c.ragione_sociale like ? or t.descrizione like ? or t.licenza like ?';
    $par = array_fill(0, 3, '%' . $cerca . '%');
  }
  $sql .= ' order by (t.data_scadenza is null), t.data_scadenza';
  $elenco = righe($sql, $par);

  intestazione('Contratti', count($elenco) . ' in elenco');
  ?>
  <form class="cerca" method="get">
    <input type="text" name="cerca" value="<?= h($cerca) ?>" placeholder="Cerca per cliente, descrizione o licenza">
    <button type="submit" class="neutro">Cerca</button>
    <?= bottone('contratti.php?id=nuovo', 'Nuovo contratto') ?>
  </form>

  <div class="scheda">
    <?php if ($elenco === []): ?><p>Nessun contratto.</p><?php endif ?>
    <?php foreach ($elenco as $t):
      $giorni = $t['data_scadenza'] ? giorni_a($t['data_scadenza']) : null;
    ?>
      <a class="voce" href="contratti.php?id=<?= (int) $t['id'] ?>">
        <span class="capo"><?= h($t['ragione_sociale']) ?></span>
        <span class="data">
          <?= $t['data_scadenza'] ? h(data_it($t['data_scadenza'])) : '<span class="pillola">senza scadenza</span>' ?>
          <?php if ($giorni !== null && $t['stato'] === 'attivo'): ?>
            <span class="pillola <?= $giorni < 0 ? 'scadute' : ($giorni <= 7 ? 'sette' : '') ?>"><?= h(quando($giorni)) ?></span>
          <?php endif ?>
        </span>
        <span class="nota">
          <span class="pillola"><?= h(TIPI_CONTRATTO[$t['tipo']] ?? $t['tipo']) ?></span>
          <?= h($t['descrizione']) ?>
          <?= $t['stato'] !== 'attivo' ? ' <span class="pillola">' . h(STATI_CONTRATTO[$t['stato']] ?? $t['stato']) . '</span>' : '' ?>
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
$t = $nuovo ? null : riga('select * from contratti where id = ?', [(int) $id]);
if (!$nuovo && $t === null) { http_response_code(404); exit('Contratto non trovato.'); }

$clienteId = (int) ($t['cliente_id'] ?? g('cliente_id'));
$clienti = righe('select id, ragione_sociale from clienti order by ragione_sociale');
$v = fn(string $campo, string $difetto = '') => h($t[$campo] ?? $difetto);

intestazione($nuovo ? 'Nuovo contratto' : (string) ($t['descrizione'] ?: 'Contratto'));
?>

<div class="scheda">
  <form method="post">
    <?= campo_gettone() ?>
    <input type="hidden" name="id" value="<?= $nuovo ? '' : (int) $t['id'] ?>">
    <div class="campi">
      <div><label>Cliente</label>
        <select name="cliente_id" required>
          <option value="">— scegli —</option>
          <?php foreach ($clienti as $c): ?>
            <option value="<?= (int) $c['id'] ?>" <?= $clienteId === (int) $c['id'] ? 'selected' : '' ?>>
              <?= h($c['ragione_sociale']) ?></option>
          <?php endforeach ?>
        </select>
      </div>
      <div><label>Tipo</label>
        <select name="tipo">
          <?php foreach (TIPI_CONTRATTO as $k => $nome): ?>
            <option value="<?= h($k) ?>" <?= ($t['tipo'] ?? 'software') === $k ? 'selected' : '' ?>><?= h($nome) ?></option>
          <?php endforeach ?>
        </select>
      </div>
      <div class="larga"><label>Descrizione</label>
        <input type="text" name="descrizione" value="<?= $v('descrizione') ?>" placeholder="Canone software gestionale"></div>
      <div><label>Numero di licenza</label><input type="text" name="licenza" value="<?= $v('licenza') ?>"></div>
      <div><label>Importo <span class="aiuto">In euro</span></label>
        <input type="text" name="importo" value="<?= h($t['importo'] !== null ? number_format((float) $t['importo'], 2, ',', '') : '') ?>"></div>
      <div><label>Data inizio</label><input type="text" name="data_inizio" value="<?= h(data_it($t['data_inizio'] ?? null)) ?>" placeholder="01/01/2026"></div>
      <div><label>Data scadenza</label><input type="text" name="data_scadenza" value="<?= h(data_it($t['data_scadenza'] ?? null)) ?>" placeholder="31/12/2026"></div>
      <div><label>Periodicita'</label>
        <select name="periodicita">
          <?php foreach (PERIODI as $k => [$nome, $m]): ?>
            <option value="<?= h($k) ?>" <?= ($t['periodicita'] ?? 'annuale') === $k ? 'selected' : '' ?>><?= h($nome) ?></option>
          <?php endforeach ?>
        </select>
      </div>
      <div><label>Stato</label>
        <select name="stato">
          <?php foreach (STATI_CONTRATTO as $k => $nome): ?>
            <option value="<?= h($k) ?>" <?= ($t['stato'] ?? 'attivo') === $k ? 'selected' : '' ?>><?= h($nome) ?></option>
          <?php endforeach ?>
        </select>
      </div>
      <div class="larga"><label class="spunta">
        <input type="checkbox" name="rinnovo_automatico" value="1" <?= ($t['rinnovo_automatico'] ?? 0) ? 'checked' : '' ?>>
        Si rinnova automaticamente</label></div>
      <div class="larga"><label>Note</label><textarea name="note"><?= $v('note') ?></textarea></div>
    </div>
    <div class="azioni">
      <button type="submit">Salva</button>
      <?= bottone('contratti.php', 'Torna all\'elenco', 'neutro') ?>
    </div>
  </form>
</div>

<?php if (!$nuovo): ?>
  <div class="scheda">
    <h2 style="margin-top:0">Rinnovo</h2>
    <p class="sotto">
      Sposta la scadenza avanti di un periodo (<?= h(PERIODI[$t['periodicita']][0] ?? 'Annuale') ?>)
      partendo dalla scadenza attuale<?= $t['data_scadenza'] ? ' del ' . h(data_it($t['data_scadenza'])) : '' ?>,
      non da oggi: un pagamento in ritardo non accorcia il contratto.
    </p>
    <form method="post">
      <?= campo_gettone() ?>
      <input type="hidden" name="azione" value="rinnova">
      <input type="hidden" name="id" value="<?= (int) $t['id'] ?>">
      <div class="azioni"><button type="submit">Rinnova di un periodo</button></div>
    </form>
  </div>
<?php endif ?>

<?php piede(); ?>
