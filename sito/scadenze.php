<?php
// ============================================================================
// Lo scadenzario: l'unico posto dove si decide che cosa e' in scadenza.
//
// La pagina iniziale e l'email degli avvisi chiamano le stesse funzioni di
// qui. Se le regole fossero scritte due volte, un giorno direbbero due cose
// diverse e non si capirebbe quale delle due e' quella giusta.
//
// La data della prossima verifica NON e' memorizzata da nessuna parte: si
// ricava ogni volta dall'ultima verifica (o, se manca, dalla messa in
// servizio) sommando i mesi di cadenza. Cosi' il giorno in cui la norma
// cambiasse la cadenza, si cambia un numero in Impostazioni e tutte le
// scadenze si ricalcolano da sole.
// ============================================================================

declare(strict_types=1);

require_once __DIR__ . '/date_it.php';

/** La data della prossima verifica periodica, o null se non si puo' sapere. */
function prossima_verifica(array $apparecchio, int $mesi): ?string
{
  $base = $apparecchio['data_ultima_verifica'] ?: ($apparecchio['data_messa_servizio'] ?: null);
  return $base === null ? null : aggiungi_mesi($base, $mesi);
}

/**
 * In che fascia cade una scadenza. Null quando e' troppo in la' per
 * interessare: con il preavviso a 60 giorni, una verifica fra otto mesi non
 * deve occupare spazio sullo schermo.
 */
function fascia(int $giorni, int $preavviso): ?string
{
  if ($giorni < 0)  return 'scadute';
  if ($giorni <= 7) return 'sette';
  if ($giorni <= 30) return 'mese';
  if ($giorni <= $preavviso) return 'arrivo';
  return null;
}

const FASCE = [
  'scadute' => 'Scadute',
  'sette'   => 'Entro 7 giorni',
  'mese'    => 'Entro il mese',
  'arrivo'  => 'In arrivo',
];

/**
 * Tutte le scadenze entro il preavviso, ordinate dalla piu' urgente.
 * $oggi serve alle prove: in esercizio e' il giorno di oggi.
 */
function scadenzario(?int $preavviso = null, ?string $oggi = null): array
{
  $preavviso = $preavviso ?? giorni_avviso();
  $oggi = $oggi ?? oggi();
  $mesi = mesi_verifica();
  $voci = [];

  $apparecchi = righe(
    "select a.*, c.ragione_sociale
       from apparecchi a
       join clienti c on c.id = a.cliente_id
      where a.stato = 'attivo'",
  );
  foreach ($apparecchi as $a) {
    $data = prossima_verifica($a, $mesi);
    if ($data === null) continue;
    $giorni = giorni_a($data, $oggi);
    $f = fascia($giorni, $preavviso);
    if ($f === null) continue;
    $voci[] = [
      'tipo'      => 'verifica',
      'etichetta' => 'Verifica periodica',
      'cliente'   => $a['ragione_sociale'],
      'titolo'    => trim(($a['marca'] ?? '') . ' ' . ($a['modello'] ?? '')) ?: 'Apparecchio',
      'dettaglio' => 'Matricola ' . $a['matricola'],
      'data'      => $data,
      'giorni'    => $giorni,
      'fascia'    => $f,
      'link'      => 'apparecchi.php?id=' . $a['id'],
    ];
  }

  $contratti = righe(
    "select t.*, c.ragione_sociale
       from contratti t
       join clienti c on c.id = t.cliente_id
      where t.stato = 'attivo' and t.data_scadenza is not null",
  );
  foreach ($contratti as $t) {
    $giorni = giorni_a($t['data_scadenza'], $oggi);
    $f = fascia($giorni, $preavviso);
    if ($f === null) continue;
    $voci[] = [
      'tipo'      => 'contratto',
      'etichetta' => ucfirst((string) $t['tipo']),
      'cliente'   => $t['ragione_sociale'],
      'titolo'    => $t['descrizione'] ?: 'Contratto',
      'dettaglio' => $t['licenza'] ? 'Licenza ' . $t['licenza'] : '',
      'data'      => $t['data_scadenza'],
      'giorni'    => $giorni,
      'fascia'    => $f,
      'link'      => 'contratti.php?id=' . $t['id'],
    ];
  }

  usort($voci, fn($x, $y) => $x['giorni'] <=> $y['giorni']);
  return $voci;
}

/** Le voci raggruppate per fascia, nell'ordine delle FASCE. */
function per_fascia(array $voci): array
{
  $gruppi = array_fill_keys(array_keys(FASCE), []);
  foreach ($voci as $v) $gruppi[$v['fascia']][] = $v;
  return array_filter($gruppi, fn($g) => $g !== []);
}

/**
 * Le verifiche fatte e non ancora trasmesse all'Agenzia delle Entrate.
 * Non e' una scadenza con una data: e' una cosa rimasta a meta'.
 */
function da_trasmettere(): array
{
  return righe(
    "select a.id, a.matricola, a.data_ultima_verifica, c.ragione_sociale
       from apparecchi a
       join clienti c on c.id = a.cliente_id
      where a.stato = 'attivo'
        and a.data_ultima_verifica is not null
        and a.verifica_trasmessa = 0
      order by a.data_ultima_verifica",
  );
}

/** Gli apparecchi senza il collegamento al POS registrato. */
function pos_da_collegare(): array
{
  return righe(
    "select a.id, a.matricola, c.ragione_sociale
       from apparecchi a
       join clienti c on c.id = a.cliente_id
      where a.stato = 'attivo' and a.collegato_pos = 0
      order by c.ragione_sociale",
  );
}

function riepilogo(array $voci): array
{
  $r = array_fill_keys(array_keys(FASCE), 0);
  foreach ($voci as $v) $r[$v['fascia']]++;
  return $r;
}
