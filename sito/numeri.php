<?php
// ============================================================================
// Il numero del rapportino: 2026/001, progressivo per anno.
//
// Sta in un file suo perche' ha una regola che non si vede a occhio: il numero
// non si ricava soltanto guardando l'ultimo rapportino in archivio.
//
// Se si cancella un rapportino (capita: uno sbagliato, un doppione), l'ultimo
// in archivio torna indietro, e il prossimo riuserebbe un numero gia' uscito.
// Due documenti diversi con lo stesso numero sono un guaio, perche' il primo
// puo' essere gia' in mano al cliente.
//
// Quindi il contatore dell'anno viene anche memorizzato, e il numero nuovo e'
// il piu' alto fra i due piu' uno: cosi' un numero, una volta uscito, non
// torna mai.
// ============================================================================

declare(strict_types=1);

require_once __DIR__ . '/comune.php';

function prossimo_numero(): string
{
  $anno = date('Y');

  $ultimo = (string) (valore(
    'select numero from interventi where numero like ? order by numero desc limit 1',
    [$anno . '/%'],
  ) ?? '');
  $in_archivio = $ultimo === '' ? 0 : (int) substr($ultimo, 5);

  $memorizzato = (int) impostazione('numero_' . $anno, '0');

  $prossimo = max($in_archivio, $memorizzato) + 1;
  imposta('numero_' . $anno, (string) $prossimo);

  return sprintf('%s/%03d', $anno, $prossimo);
}
