<?php
// ============================================================================
// Il rapportino da consegnare al cliente.
//
// Non si produce un PDF con una libreria: e' una pagina impaginata per il
// foglio A4, e si usa la stampa del browser ("Stampa" -> "Salva come PDF").
// Funziona identica su PC e su telefono, non ha dipendenze da aggiornare, e
// il foglio viene come lo si vede sullo schermo.
// ============================================================================

declare(strict_types=1);

require_once __DIR__ . '/comune.php';
require_once __DIR__ . '/scadenze.php';

richiedi_accesso();

$i = riga('select * from interventi where id = ?', [(int) g('id')]);
if ($i === null) { http_response_code(404); exit('Intervento non trovato.'); }

$c = riga('select * from clienti where id = ?', [(int) $i['cliente_id']]);
$a = $i['apparecchio_id'] ? riga('select * from apparecchi where id = ?', [(int) $i['apparecchio_id']]) : null;
$s = $i['sede_id'] ? riga('select * from sedi where id = ?', [(int) $i['sede_id']]) : null;
$t = $i['tecnico_id'] ? riga('select * from utenti where id = ?', [(int) $i['tecnico_id']]) : null;
$rr = righe('select * from intervento_righe where intervento_id = ? order by id', [(int) $i['id']]);
$az = conf('azienda');

$totale = 0.0;
foreach ($rr as $r) $totale += (float) $r['quantita'] * (float) ($r['prezzo'] ?? 0);

$ore = '';
if ($i['ora_inizio'] && $i['ora_fine']) {
  $min = (strtotime('1970-01-01 ' . $i['ora_fine'] . ':00') - strtotime('1970-01-01 ' . $i['ora_inizio'] . ':00')) / 60;
  if ($min > 0) $ore = sprintf('%d h %02d min', intdiv((int) $min, 60), (int) $min % 60);
}

$prossima = $a !== null ? prossima_verifica($a, mesi_verifica()) : null;

$euro = fn(?float $n) => $n === null ? '' : number_format($n, 2, ',', '.') . ' €';
?><!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rapportino <?= h($i['numero']) ?></title>
<link rel="stylesheet" href="stile.css?v=1">
<style>
  .foglio { max-width: 190mm; margin: 0 auto; background: #fff; padding: 16px; }
  .testa { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #0f172a; padding-bottom: 8px; }
  .testa h1 { font-size: 20px; }
  .riquadri { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
  .riquadro { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; }
  .riquadro h3 { margin: 0 0 6px; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: .04em; }
  .riga-dato { font-size: 14px; }
  .riga-dato b { display: inline-block; min-width: 150px; color: #475569; font-weight: 600; }
  .firme { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 28px; }
  .firme div { border-top: 1px solid #94a3b8; padding-top: 4px; font-size: 12px; color: #64748b; }
  .totale td { font-weight: 700; border-top: 2px solid #0f172a; }
  @media print { .foglio { max-width: none; padding: 0; } }
</style>
</head>
<body style="background:#fff">

<div class="azioni nostampa" style="max-width:190mm;margin:16px auto 0">
  <button type="button" onclick="window.print()">Stampa o salva in PDF</button>
  <a class="bottone neutro" href="interventi.php?id=<?= (int) $i['id'] ?>">Torna al rapportino</a>
</div>

<div class="foglio">
  <div class="testa">
    <div>
      <h1><?= h($az['nome'] ?? '') ?></h1>
      <div class="riga-dato"><?= h($az['indirizzo'] ?? '') ?></div>
      <div class="riga-dato">
        <?= h($az['telefono'] ?? '') ?> · <?= h($az['email'] ?? '') ?>
        <?= ($az['piva'] ?? '') !== '' ? ' · P. IVA ' . h($az['piva']) : '' ?>
      </div>
      <?php if (($az['laboratorio'] ?? '') !== ''): ?>
        <div class="riga-dato"><?= h($az['laboratorio']) ?></div>
      <?php endif ?>
    </div>
    <div style="text-align:right">
      <div style="font-size:12px;color:#64748b;text-transform:uppercase">Rapporto di intervento</div>
      <div style="font-size:22px;font-weight:700">N. <?= h($i['numero']) ?></div>
      <div class="riga-dato"><?= h(data_it($i['data'])) ?></div>
    </div>
  </div>

  <div class="riquadri">
    <div class="riquadro">
      <h3>Cliente</h3>
      <div style="font-weight:700"><?= h($c['ragione_sociale']) ?></div>
      <div class="riga-dato"><?= h(trim(($c['indirizzo'] ?? '') . ', ' . ($c['cap'] ?? '') . ' ' . ($c['citta'] ?? '')
        . ' ' . (($c['provincia'] ?? '') !== '' ? '(' . $c['provincia'] . ')' : ''), ' ,')) ?></div>
      <?php if (($c['partita_iva'] ?? '') !== ''): ?><div class="riga-dato">P. IVA <?= h($c['partita_iva']) ?></div><?php endif ?>
      <?php if ($s !== null): ?><div class="riga-dato">Sede: <?= h($s['nome']) ?> <?= h((string) $s['indirizzo']) ?></div><?php endif ?>
    </div>

    <div class="riquadro">
      <h3>Apparecchio</h3>
      <?php if ($a !== null): ?>
        <div style="font-weight:700"><?= h(trim(($a['marca'] ?? '') . ' ' . ($a['modello'] ?? ''))) ?></div>
        <div class="riga-dato"><b>Matricola</b> <?= h($a['matricola']) ?></div>
        <?php if (($a['provvedimento'] ?? '') !== ''): ?>
          <div class="riga-dato"><b>Provvedimento</b> <?= h($a['provvedimento']) ?></div><?php endif ?>
        <?php if (($a['firmware'] ?? '') !== ''): ?>
          <div class="riga-dato"><b>Firmware</b> <?= h($a['firmware']) ?></div><?php endif ?>
      <?php else: ?>
        <div class="riga-dato">Nessun apparecchio collegato a questo intervento.</div>
      <?php endif ?>
    </div>
  </div>

  <div class="riquadro">
    <h3>Intervento</h3>
    <div class="riga-dato"><b>Tipo</b> <?= h(TIPI_INTERVENTO[$i['tipo']] ?? $i['tipo']) ?></div>
    <?php if ($i['ora_inizio']): ?>
      <div class="riga-dato"><b>Orario</b> <?= h($i['ora_inizio']) ?><?= $i['ora_fine'] ? ' – ' . h($i['ora_fine']) : '' ?>
        <?= $ore !== '' ? ' (' . h($ore) . ')' : '' ?></div>
    <?php endif ?>
    <?php if ($t !== null): ?><div class="riga-dato"><b>Tecnico</b> <?= h($t['nome'] ?: $t['email']) ?></div><?php endif ?>
    <?php if (($i['descrizione'] ?? '') !== ''): ?>
      <div style="margin-top:8px"><b style="color:#475569">Problema riferito</b><br><?= nl2br(h($i['descrizione'])) ?></div>
    <?php endif ?>
    <?php if (($i['soluzione'] ?? '') !== ''): ?>
      <div style="margin-top:8px"><b style="color:#475569">Lavoro eseguito</b><br><?= nl2br(h($i['soluzione'])) ?></div>
    <?php endif ?>
  </div>

  <?php if ($i['tipo'] === 'verifica' || ($i['esito_verifica'] ?? '') !== ''): ?>
    <div class="riquadro" style="margin-top:16px">
      <h3>Verifica periodica</h3>
      <div class="riga-dato"><b>Esito</b> <?= h(ESITI[$i['esito_verifica'] ?? ''] ?? '') ?></div>
      <?php if (($i['sigilli'] ?? '') !== ''): ?><div class="riga-dato"><b>Sigilli</b> <?= h($i['sigilli']) ?></div><?php endif ?>
      <?php if (($i['libretto'] ?? '') !== ''): ?><div class="riga-dato"><b>Libretto</b> <?= h($i['libretto']) ?></div><?php endif ?>
      <?php if ($prossima !== null): ?>
        <div class="riga-dato"><b>Prossima verifica</b> entro il <?= h(data_it($prossima)) ?></div>
      <?php endif ?>
    </div>
  <?php endif ?>

  <?php if ($rr !== []): ?>
    <h3 style="margin-top:20px;font-size:12px;text-transform:uppercase;color:#64748b">Materiali e manodopera</h3>
    <table>
      <tr><th>Descrizione</th><th style="text-align:right">Q.ta'</th><th style="text-align:right">Prezzo</th><th style="text-align:right">Totale</th></tr>
      <?php foreach ($rr as $r):
        $q = (float) $r['quantita']; $pz = $r['prezzo'] === null ? null : (float) $r['prezzo']; ?>
        <tr>
          <td><?= h($r['descrizione']) ?></td>
          <td style="text-align:right"><?= h(rtrim(rtrim(number_format($q, 2, ',', ''), '0'), ',')) ?></td>
          <td style="text-align:right"><?= h($euro($pz)) ?></td>
          <td style="text-align:right"><?= h($pz === null ? '' : $euro($q * $pz)) ?></td>
        </tr>
      <?php endforeach ?>
      <?php if ($totale > 0): ?>
        <tr class="totale"><td colspan="3" style="text-align:right">Totale (IVA esclusa)</td>
          <td style="text-align:right"><?= h($euro($totale)) ?></td></tr>
      <?php endif ?>
    </table>
  <?php endif ?>

  <div class="firme">
    <div>
      Il tecnico<br>
      <span style="color:#0f172a;font-size:14px"><?= h($t['nome'] ?? '') ?></span>
    </div>
    <div>
      Il cliente<?= ($i['firma_nome'] ?? '') !== '' ? ' — ' . h($i['firma_nome']) : '' ?><br>
      <?php if (($i['firma_png'] ?? '') !== ''): ?>
        <img src="<?= h($i['firma_png']) ?>" alt="firma del cliente" style="max-height:60px">
      <?php endif ?>
    </div>
  </div>
</div>
</body>
</html>
