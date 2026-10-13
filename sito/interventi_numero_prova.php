<?php
// Il pezzo di interventi.php che si puo' provare da solo: il numero
// progressivo. Sta in un file a parte perche' interventi.php e' una pagina
// (chiede l'accesso, scrive HTML) e non si puo' includere in una prova.

declare(strict_types=1);

function prossimo_numero_prova(): string
{
  $anno = date('Y');
  $ultimo = (string) (valore(
    'select numero from interventi where numero like ? order by numero desc limit 1',
    [$anno . '/%'],
  ) ?? '');
  $n = $ultimo === '' ? 0 : (int) substr($ultimo, 5);
  return sprintf('%s/%03d', $anno, $n + 1);
}

prova('il primo rapportino dell\'anno', date('Y') . '/001', prossimo_numero_prova());

$a = date('Y-m-d H:i:s');
salva_riga('interventi', [
  'numero' => prossimo_numero_prova(), 'cliente_id' => 1, 'tipo' => 'assistenza',
  'stato' => 'chiuso', 'data' => oggi(), 'creato_il' => $a, 'aggiornato_il' => $a,
]);
prova('il secondo', date('Y') . '/002', prossimo_numero_prova());

// Il numero dell'anno scorso non conta per quest'anno.
salva_riga('interventi', [
  'numero' => (date('Y') - 1) . '/099', 'cliente_id' => 1, 'tipo' => 'assistenza',
  'stato' => 'chiuso', 'data' => (date('Y') - 1) . '-12-30', 'creato_il' => $a, 'aggiornato_il' => $a,
]);
prova('l\'anno scorso non sposta il contatore', date('Y') . '/002', prossimo_numero_prova());

// Dopo il nono, il decimo (le stringhe si ordinano, 002 < 010).
for ($i = 2; $i <= 9; $i++) {
  salva_riga('interventi', [
    'numero' => sprintf('%s/%03d', date('Y'), $i), 'cliente_id' => 1, 'tipo' => 'assistenza',
    'stato' => 'chiuso', 'data' => oggi(), 'creato_il' => $a, 'aggiornato_il' => $a,
  ]);
}
prova('dopo il nono viene il decimo', date('Y') . '/010', prossimo_numero_prova());
