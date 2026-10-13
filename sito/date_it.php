<?php
// ============================================================================
// Date.
//
// Nel database le date stanno sempre come 2026-03-10 (anno-mese-giorno): e'
// il formato che MySQL sa ordinare e confrontare. Nei form e sullo schermo si
// scrivono come 10/03/2026. Qui dentro ci sono le due traduzioni e l'unico
// pezzo di aritmetica che conta davvero: sommare dei mesi.
// ============================================================================

declare(strict_types=1);

function oggi(): string { return date('Y-m-d'); }

/**
 * Da quello che ha scritto una persona a quello che vuole il database.
 *
 * Accetta 10/03/2026, 10-3-2026, 10.3.26 e 2026-03-10. Se la data non esiste
 * (il 31 febbraio, il 45 del mese) restituisce null: meglio un campo vuoto che
 * una data inventata.
 */
function data_iso(?string $testo): ?string
{
  $t = trim((string) $testo);
  if ($t === '') return null;

  if (preg_match('/^(\d{4})-(\d{1,2})-(\d{1,2})$/', $t, $m)) {
    [, $a, $me, $g] = $m;
  } elseif (preg_match('#^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$#', $t, $m)) {
    [, $g, $me, $a] = $m;
    if (strlen($a) === 2) $a = (int) $a <= 70 ? '20' . $a : '19' . $a;
  } else {
    return null;
  }

  $a = (int) $a; $me = (int) $me; $g = (int) $g;
  if (!checkdate($me, $g, $a)) return null;
  return sprintf('%04d-%02d-%02d', $a, $me, $g);
}

/** Da database a schermo. */
function data_it(?string $iso): string
{
  if (!$iso) return '';
  $d = DateTimeImmutable::createFromFormat('Y-m-d', substr($iso, 0, 10));
  return $d === false ? '' : $d->format('d/m/Y');
}

/**
 * Somma dei mesi a una data, con la regola del calendario e non quella che
 * viene comoda al computer.
 *
 * PHP da solo fa 31 gennaio + 1 mese = 3 marzo, perche' somma 31 giorni al
 * mese dopo. Per una scadenza questo e' sbagliato: il 31 gennaio piu' un mese
 * e' il 28 febbraio (o il 29 negli anni bisestili). Qui si tiene l'ultimo
 * giorno disponibile del mese di arrivo.
 */
function aggiungi_mesi(string $iso, int $mesi): string
{
  $d = new DateTimeImmutable(substr($iso, 0, 10));
  $anno  = (int) $d->format('Y');
  $mese  = (int) $d->format('n') + $mesi;
  $anno += intdiv($mese - 1, 12);
  $mese  = ($mese - 1) % 12 + 1;
  if ($mese < 1) { $mese += 12; $anno -= 1; }

  $giorno = min((int) $d->format('j'), (int) cal_giorni_mese($mese, $anno));
  return sprintf('%04d-%02d-%02d', $anno, $mese, $giorno);
}

function cal_giorni_mese(int $mese, int $anno): int
{
  return (int) (new DateTimeImmutable(sprintf('%04d-%02d-01', $anno, $mese)))->format('t');
}

/**
 * Quanti giorni da oggi (o da $da) alla data indicata. Negativo = passata.
 * Si contano i giorni di calendario, non le ore: due date senza ora non
 * possono dare "mezzo giorno di ritardo".
 */
function giorni_a(string $iso, ?string $da = null): int
{
  $a = new DateTimeImmutable(substr($da ?? oggi(), 0, 10));
  $b = new DateTimeImmutable(substr($iso, 0, 10));
  return (int) $a->diff($b)->format('%r%a');
}

/** "fra 3 giorni", "ieri", "in ritardo di 12 giorni". */
function quando(int $giorni): string
{
  if ($giorni === 0) return 'oggi';
  if ($giorni === 1) return 'domani';
  if ($giorni === -1) return 'ieri';
  return $giorni > 0
    ? "fra $giorni giorni"
    : 'in ritardo di ' . abs($giorni) . ' giorni';
}
