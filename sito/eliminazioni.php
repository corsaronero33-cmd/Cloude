<?php
// ============================================================================
// Cancellare davvero.
//
// Sta a parte perche' e' l'unica parte del gestionale che distrugge dati, e
// voglio poterla provare da sola (vedi prove.php).
//
// Due regole, e il motivo per cui sono due:
//
//   * un cliente con roba attaccata NON si cancella per sbaglio: prima si
//     dice che cosa c'e' sotto, e solo con un secondo clic esplicito si porta
//     via tutto;
//   * un utente che ha firmato dei rapportini non si cancella affatto, si
//     disattiva. Cancellarlo toglierebbe il nome del tecnico da documenti
//     gia' consegnati al cliente.
// ============================================================================

declare(strict_types=1);

require_once __DIR__ . '/comune.php';

/** Quanta roba e' attaccata a un cliente, voce per voce. */
function collegati_al_cliente(int $id): array
{
  return [
    'sedi'       => (int) valore('select count(*) from sedi where cliente_id = ?', [$id]),
    'apparecchi' => (int) valore('select count(*) from apparecchi where cliente_id = ?', [$id]),
    'contratti'  => (int) valore('select count(*) from contratti where cliente_id = ?', [$id]),
    'interventi' => (int) valore('select count(*) from interventi where cliente_id = ?', [$id]),
  ];
}

function quanti_collegati(array $conti): int
{
  return array_sum($conti);
}

/** "2 apparecchi, 1 contratto" — per dire che cosa si sta per portare via. */
function descrivi_collegati(array $conti): string
{
  $nomi = [
    'sedi'       => ['sede', 'sedi'],
    'apparecchi' => ['apparecchio', 'apparecchi'],
    'contratti'  => ['contratto', 'contratti'],
    'interventi' => ['intervento', 'interventi'],
  ];
  $pezzi = [];
  foreach ($conti as $chiave => $quanti) {
    if ($quanti > 0) $pezzi[] = $quanti . ' ' . $nomi[$chiave][$quanti === 1 ? 0 : 1];
  }
  return implode(', ', $pezzi);
}

/**
 * Cancella un cliente e tutto quello che gli sta sotto.
 *
 * L'ordine non e' casuale: si parte dalle foglie e si risale, altrimenti i
 * vincoli del database rifiutano la cancellazione. Tutto dentro una
 * transazione: o sparisce tutto, o non sparisce niente.
 */
function elimina_cliente(int $id): void
{
  db()->beginTransaction();
  try {
    q('delete from intervento_righe where intervento_id in
         (select id from interventi where cliente_id = ?)', [$id]);
    q('delete from interventi where cliente_id = ?', [$id]);
    q('delete from contratti  where cliente_id = ?', [$id]);
    q('delete from apparecchi where cliente_id = ?', [$id]);
    q('delete from sedi       where cliente_id = ?', [$id]);
    q('delete from clienti    where id = ?', [$id]);
    db()->commit();
  } catch (Throwable $e) {
    db()->rollBack();
    throw $e;
  }
}

/** Cancella un intervento con le sue righe. */
function elimina_intervento(int $id): void
{
  db()->beginTransaction();
  try {
    q('delete from intervento_righe where intervento_id = ?', [$id]);
    q('delete from interventi where id = ?', [$id]);
    db()->commit();
  } catch (Throwable $e) {
    db()->rollBack();
    throw $e;
  }
}

/** Quanti rapportini portano la firma di questo tecnico. */
function interventi_del_tecnico(int $id): int
{
  return (int) valore('select count(*) from interventi where tecnico_id = ?', [$id]);
}
