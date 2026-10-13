<?php
// ============================================================================
// Le tabelle del database, in un posto solo.
//
// Le usa installa.php per crearle. Sono scritte in SQL di MySQL, che e' quello
// che offrono tutti gli hosting. Niente di esotico: nessuna vista, nessuna
// procedura, nessun trigger. Tutto cio' che si puo' sbagliare in silenzio sta
// in PHP, dove si puo' leggere e provare.
//
// Due scelte spiegate, perche' si notano:
//
//   * le date stanno in colonne `date`, senza ora. Una scadenza non ha un
//     orario, e mettercelo porta solo problemi di fuso.
//   * `aggiornato_il` lo scrive PHP a ogni salvataggio, non il database. Una
//     colonna che si aggiorna da sola e' comoda finche' non devi capire
//     perche' una riga e' cambiata.
// ============================================================================

declare(strict_types=1);

/**
 * Adatta un'istruzione al database che si trova davanti.
 *
 * In esercizio il database e' MySQL e non cambia nulla. Su SQLite -- che uso
 * per le prove automatiche, e che va bene anche per provare il sito sul
 * proprio computer senza installare un server -- cambiano tre parole.
 */
function adatta_ddl(string $sql): string
{
  if (db()->getAttribute(PDO::ATTR_DRIVER_NAME) !== 'sqlite') return $sql;
  // Gli spazi fra le parole qui sotto sono allineati a mano nelle tabelle,
  // quindi si cercano i modelli, non il testo esatto.
  $sql = (string) preg_replace('/\)\s*engine=[^)]*$/i', ')', $sql);
  $sql = (string) preg_replace(
    '/int\s+unsigned\s+not\s+null\s+auto_increment\s+primary\s+key/i',
    'integer primary key autoincrement',
    $sql,
  );
  return (string) preg_replace('/int\s+unsigned/i', 'integer', $sql);
}

/** @return array<string, string> nome della tabella => istruzione SQL */
function tabelle(): array
{
  $m = 'engine=innodb default charset=utf8mb4 collate=utf8mb4_unicode_ci';

  return [

    'utenti' => "create table if not exists utenti (
      id             int unsigned not null auto_increment primary key,
      email          varchar(190) not null unique,
      password_hash  varchar(255) not null,
      nome           varchar(120) not null default '',
      ruolo          varchar(20)  not null default 'tecnico',
      attivo         tinyint(1)   not null default 1,
      creato_il      datetime     not null
    ) $m",

    'clienti' => "create table if not exists clienti (
      id              int unsigned not null auto_increment primary key,
      ragione_sociale varchar(200) not null,
      partita_iva     varchar(20)  null,
      codice_fiscale  varchar(20)  null,
      codice_sdi      varchar(20)  null,
      pec             varchar(190) null,
      email           varchar(190) null,
      telefono        varchar(40)  null,
      indirizzo       varchar(200) null,
      cap             varchar(10)  null,
      citta           varchar(100) null,
      provincia       varchar(4)   null,
      note            text         null,
      attivo          tinyint(1)   not null default 1,
      creato_il       datetime     not null,
      aggiornato_il   datetime     not null
    ) $m",

    'sedi' => "create table if not exists sedi (
      id          int unsigned not null auto_increment primary key,
      cliente_id  int unsigned not null,
      nome        varchar(120) not null,
      indirizzo   varchar(200) null,
      cap         varchar(10)  null,
      citta       varchar(100) null,
      provincia   varchar(4)   null,
      referente   varchar(120) null,
      telefono    varchar(40)  null,
      note        text         null,
      constraint fk_sedi_cliente foreign key (cliente_id) references clienti (id)
    ) $m",

    'apparecchi' => "create table if not exists apparecchi (
      id                   int unsigned not null auto_increment primary key,
      cliente_id           int unsigned not null,
      sede_id              int unsigned null,
      matricola            varchar(60)  not null,
      tipo                 varchar(20)  not null default 'rt',
      marca                varchar(60)  null,
      modello              varchar(60)  null,
      provvedimento        varchar(120) null,
      firmware             varchar(60)  null,
      data_messa_servizio  date         null,
      data_ultima_verifica date         null,
      verifica_trasmessa   tinyint(1)   not null default 0,
      collegato_pos        tinyint(1)   not null default 0,
      stato                varchar(20)  not null default 'attivo',
      data_dismissione     date         null,
      note                 text         null,
      creato_il            datetime     not null,
      aggiornato_il        datetime     not null,
      constraint fk_app_cliente foreign key (cliente_id) references clienti (id)
    ) $m",

    'contratti' => "create table if not exists contratti (
      id                 int unsigned  not null auto_increment primary key,
      cliente_id         int unsigned  not null,
      tipo               varchar(30)   not null default 'software',
      descrizione        varchar(200)  not null default '',
      licenza            varchar(80)   null,
      data_inizio        date          null,
      data_scadenza      date          null,
      periodicita        varchar(20)   not null default 'annuale',
      importo            decimal(10,2) null,
      rinnovo_automatico tinyint(1)    not null default 0,
      stato              varchar(20)   not null default 'attivo',
      note               text          null,
      creato_il          datetime      not null,
      aggiornato_il      datetime      not null,
      constraint fk_con_cliente foreign key (cliente_id) references clienti (id)
    ) $m",

    'interventi' => "create table if not exists interventi (
      id             int unsigned not null auto_increment primary key,
      numero         varchar(20)  not null default '',
      cliente_id     int unsigned not null,
      apparecchio_id int unsigned null,
      sede_id        int unsigned null,
      tecnico_id     int unsigned null,
      tipo           varchar(30)  not null default 'assistenza',
      stato          varchar(20)  not null default 'aperto',
      data           date         not null,
      ora_inizio     varchar(5)   null,
      ora_fine       varchar(5)   null,
      descrizione    text         null,
      soluzione      text         null,
      esito_verifica varchar(20)  null,
      sigilli        varchar(120) null,
      libretto       varchar(120) null,
      firma_nome     varchar(120) null,
      firma_png      mediumtext   null,
      creato_il      datetime     not null,
      aggiornato_il  datetime     not null,
      constraint fk_int_cliente foreign key (cliente_id) references clienti (id)
    ) $m",

    'intervento_righe' => "create table if not exists intervento_righe (
      id            int unsigned  not null auto_increment primary key,
      intervento_id int unsigned  not null,
      descrizione   varchar(200)  not null default '',
      quantita      decimal(10,2) not null default 1,
      prezzo        decimal(10,2) null,
      constraint fk_righe_intervento foreign key (intervento_id) references interventi (id)
    ) $m",

    'impostazioni' => "create table if not exists impostazioni (
      chiave  varchar(60)  not null primary key,
      valore  varchar(500) not null default ''
    ) $m",

    'avvisi_log' => "create table if not exists avvisi_log (
      id          int unsigned not null auto_increment primary key,
      inviato_il  datetime     not null,
      esito       varchar(20)  not null,
      destinatari varchar(400) not null default '',
      scadute     int          not null default 0,
      entro_sette int          not null default 0,
      messaggio   varchar(500) not null default ''
    ) $m",
  ];
}

/** Gli indici: niente di magico, solo le colonne su cui si cerca sempre. */
function indici(): array
{
  return [
    'idx_sedi_cliente'    => 'create index idx_sedi_cliente on sedi (cliente_id)',
    'idx_app_cliente'     => 'create index idx_app_cliente on apparecchi (cliente_id)',
    'idx_app_matricola'   => 'create index idx_app_matricola on apparecchi (matricola)',
    'idx_con_cliente'     => 'create index idx_con_cliente on contratti (cliente_id)',
    'idx_con_scadenza'    => 'create index idx_con_scadenza on contratti (data_scadenza)',
    'idx_int_cliente'     => 'create index idx_int_cliente on interventi (cliente_id)',
    'idx_int_data'        => 'create index idx_int_data on interventi (data)',
    'idx_righe_int'       => 'create index idx_righe_int on intervento_righe (intervento_id)',
  ];
}

/** I valori di partenza delle impostazioni. */
function impostazioni_di_partenza(): array
{
  return [
    'mesi_verifica'  => '24',
    'giorni_avviso'  => '60',
    'avvisi_attivi'  => '1',
  ];
}
