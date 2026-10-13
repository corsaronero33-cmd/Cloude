<?php
// ============================================================================
// Le parole del mestiere, tutte qui.
//
// Tipi di apparecchio, tipi di contratto, tipi di intervento, stati. Stanno
// in un posto solo perche' sono le cose che piu' probabilmente vorrai
// cambiare: aggiungere un tipo di intervento e' modificare una riga di questo
// file, e compare da solo in tutte le tendine e in tutti i rapportini.
//
// La chiave (a sinistra) e' quella che finisce nel database: una volta che ci
// sono dei dati, non si cambia. La scritta (a destra) e' quella che si legge,
// e si puo' cambiare quando si vuole.
// ============================================================================

declare(strict_types=1);

const TIPI_APPARECCHIO = [
  'rt'         => 'Registratore telematico',
  'misuratore' => 'Misuratore fiscale',
  'pos'        => 'POS',
  'bilancia'   => 'Bilancia',
  'altro'      => 'Altro',
];

const STATI_APPARECCHIO = [
  'attivo'   => 'Attivo',
  'guasto'   => 'Guasto',
  'dismesso' => 'Dismesso',
];

const TIPI_CONTRATTO = [
  'software'   => 'Abbonamento software',
  'assistenza' => 'Contratto di assistenza',
  'noleggio'   => 'Noleggio',
  'telemetria' => 'Servizio telematico',
  'altro'      => 'Altro',
];

/** Nome e mesi: i mesi servono al pulsante "Rinnova". */
const PERIODI = [
  'mensile'     => ['Mensile', 1],
  'trimestrale' => ['Trimestrale', 3],
  'semestrale'  => ['Semestrale', 6],
  'annuale'     => ['Annuale', 12],
  'biennale'    => ['Biennale', 24],
];

const STATI_CONTRATTO = [
  'attivo'  => 'Attivo',
  'sospeso' => 'Sospeso',
  'chiuso'  => 'Chiuso',
];

const TIPI_INTERVENTO = [
  'assistenza'    => 'Assistenza',
  'verifica'      => 'Verifica periodica',
  'guasto'        => 'Guasto',
  'installazione' => 'Installazione',
  'software'      => 'Aggiornamento software',
  'sopralluogo'   => 'Sopralluogo',
];

const STATI_INTERVENTO = [
  'aperto'       => 'Aperto',
  'chiuso'       => 'Chiuso',
  'da_fatturare' => 'Da fatturare',
];

const ESITI = [
  ''             => '—',
  'conforme'     => 'Conforme',
  'non_conforme' => 'Non conforme',
];
