<?php
// ============================================================================
// Esportazione in CSV, per aprire i dati con Excel.
//
// Il punto e virgola come separatore e il BOM davanti al file sono le due cose
// che fanno aprire il CSV a Excel italiano con le colonne giuste e gli accenti
// al posto loro. Senza, si vede tutto in una colonna.
// ============================================================================

declare(strict_types=1);

require_once __DIR__ . '/comune.php';
require_once __DIR__ . '/scadenze.php';

richiedi_accesso();

$cosa = g('cosa', 'clienti');

$query = match ($cosa) {
  'apparecchi' => ['apparecchi.csv', 'select c.ragione_sociale as Cliente, a.matricola as Matricola,
       a.tipo as Tipo, a.marca as Marca, a.modello as Modello, a.provvedimento as Provvedimento,
       a.firmware as Firmware, a.data_messa_servizio as "Messa in servizio",
       a.data_ultima_verifica as "Ultima verifica", a.verifica_trasmessa as Trasmessa,
       a.collegato_pos as "POS collegato", a.stato as Stato
     from apparecchi a join clienti c on c.id = a.cliente_id
     order by c.ragione_sociale, a.matricola'],
  'contratti' => ['contratti.csv', 'select c.ragione_sociale as Cliente, t.tipo as Tipo,
       t.descrizione as Descrizione, t.licenza as Licenza, t.data_inizio as Inizio,
       t.data_scadenza as Scadenza, t.periodicita as "Periodicita", t.importo as Importo,
       t.stato as Stato
     from contratti t join clienti c on c.id = t.cliente_id
     order by t.data_scadenza'],
  'interventi' => ['interventi.csv', 'select i.numero as Numero, i.data as Data,
       c.ragione_sociale as Cliente, i.tipo as Tipo, i.stato as Stato,
       i.ora_inizio as Inizio, i.ora_fine as Fine, i.descrizione as Problema,
       i.soluzione as Lavoro
     from interventi i join clienti c on c.id = i.cliente_id
     order by i.data desc'],
  default => ['clienti.csv', 'select ragione_sociale as "Ragione sociale", partita_iva as "Partita IVA",
       codice_fiscale as "Codice fiscale", indirizzo as Indirizzo, cap as CAP, citta as "Citta",
       provincia as Provincia, telefono as Telefono, email as Email, pec as PEC,
       codice_sdi as "Codice SDI", attivo as Attivo
     from clienti order by ragione_sociale'],
};

[$nomeFile, $sql] = $query;
$dati = righe($sql);

header('Content-Type: text/csv; charset=UTF-8');
header('Content-Disposition: attachment; filename="' . $nomeFile . '"');

$uscita = fopen('php://output', 'w');
fwrite($uscita, "\xEF\xBB\xBF"); // BOM: dice a Excel che il file e' UTF-8

if ($dati === []) { fclose($uscita); exit; }

fputcsv($uscita, array_keys($dati[0]), ';');
foreach ($dati as $r) {
  // Le date in formato italiano, altrimenti Excel le legge al rovescio.
  foreach ($r as $k => $vv) {
    if (is_string($vv) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $vv)) $r[$k] = data_it($vv);
  }
  fputcsv($uscita, array_values($r), ';');
}
fclose($uscita);
