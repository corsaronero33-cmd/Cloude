-- ============================================================================
-- Gestione Assistenza -- schema iniziale
--
-- Impianto pensato per la sincronizzazione offline:
--   * ogni tabella ha una chiave uuid generata dal client, cosi' un record
--     creato senza rete nasce con l'id definitivo;
--   * updated_at lo scrive il client al momento della modifica ed e' il
--     criterio con cui si risolvono i conflitti (vince la scrittura piu'
--     recente);
--   * synced_at lo scrive il server a ogni insert o update ed e' il segnalibro
--     con cui il client chiede "dammi tutto quello che e' cambiato dopo";
--   * deleted marca le cancellazioni logiche, perche' una riga rimossa deve
--     poter viaggiare fino agli altri dispositivi.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Funzioni di servizio
-- ---------------------------------------------------------------------------

-- Timbra synced_at a ogni scrittura: e' il segnalibro della sincronizzazione
-- e non deve mai dipendere dall'orologio del telefono.
create or replace function public.tocca_synced_at()
returns trigger
language plpgsql
as $$
begin
  new.synced_at := now();
  if new.updated_at is null then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profili (un record per utente che accede: tu e i tecnici)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text not null default '',
  ruolo       text not null default 'tecnico' check (ruolo in ('admin', 'tecnico')),
  telefono    text,
  attivo      boolean not null default true,
  updated_at  timestamptz not null default now(),
  synced_at   timestamptz not null default now(),
  deleted     boolean not null default false
);

-- Alla registrazione di un utente creiamo subito il suo profilo.
create or replace function public.crea_profilo_per_utente()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger su_nuovo_utente
  after insert on auth.users
  for each row execute function public.crea_profilo_per_utente();

-- ---------------------------------------------------------------------------
-- Clienti e sedi
-- ---------------------------------------------------------------------------

create table public.clienti (
  id              uuid primary key,
  ragione_sociale text not null,
  partita_iva     text,
  codice_fiscale  text,
  codice_sdi      text,
  pec             text,
  email           text,
  telefono        text,
  indirizzo       text,
  cap             text,
  citta           text,
  provincia       text,
  note            text,
  attivo          boolean not null default true,
  updated_at      timestamptz not null default now(),
  synced_at       timestamptz not null default now(),
  deleted         boolean not null default false
);

-- Un cliente con tre negozi ha tre sedi, e ogni sede ha i suoi apparecchi.
create table public.sedi (
  id          uuid primary key,
  cliente_id  uuid not null references public.clienti (id) on delete cascade,
  nome        text not null,
  indirizzo   text,
  cap         text,
  citta       text,
  provincia   text,
  telefono    text,
  referente   text,
  note        text,
  updated_at  timestamptz not null default now(),
  synced_at   timestamptz not null default now(),
  deleted     boolean not null default false
);

-- ---------------------------------------------------------------------------
-- Dispositivi (registratori telematici e affini)
--
-- La prossima verifica periodica NON e' una colonna: la calcola l'app da
-- data_ultima_verifica (o, se manca, da data_messa_servizio) sommando i mesi
-- configurati in impostazioni. Cosi' il calcolo e' identico online e offline,
-- e un domani la cadenza si cambia in un posto solo.
-- ---------------------------------------------------------------------------

create table public.dispositivi (
  id                   uuid primary key,
  cliente_id           uuid not null references public.clienti (id) on delete cascade,
  sede_id              uuid references public.sedi (id) on delete set null,
  matricola            text not null,
  marca                text,
  modello              text,
  provvedimento        text,
  tipo                 text not null default 'rt'
                         check (tipo in ('rt', 'server_rt', 'pos_integrato', 'misuratore', 'altro')),
  data_messa_servizio  date,
  data_ultima_verifica date,
  firmware_versione    text,
  collegato_pos        boolean not null default false,
  stato                text not null default 'attivo'
                         check (stato in ('attivo', 'fuori_servizio', 'dismesso', 'magazzino')),
  data_dismissione     date,
  note                 text,
  updated_at           timestamptz not null default now(),
  synced_at            timestamptz not null default now(),
  deleted              boolean not null default false
);

create index dispositivi_cliente_idx on public.dispositivi (cliente_id);
create index dispositivi_matricola_idx on public.dispositivi (matricola);

-- ---------------------------------------------------------------------------
-- Contratti e abbonamenti (il tuo software, i canoni, l'assistenza)
-- ---------------------------------------------------------------------------

create table public.contratti (
  id                 uuid primary key,
  cliente_id         uuid not null references public.clienti (id) on delete cascade,
  tipo               text not null default 'software'
                       check (tipo in ('software', 'assistenza', 'canone_rt', 'noleggio', 'altro')),
  descrizione        text not null default '',
  data_inizio        date,
  data_scadenza      date not null,
  periodicita        text not null default 'annuale'
                       check (periodicita in ('mensile', 'trimestrale', 'semestrale', 'annuale', 'biennale', 'una_tantum')),
  importo            numeric(10, 2),
  licenza            text,
  rinnovo_automatico boolean not null default false,
  stato              text not null default 'attivo'
                       check (stato in ('attivo', 'rinnovato', 'scaduto', 'disdetto')),
  note               text,
  updated_at         timestamptz not null default now(),
  synced_at          timestamptz not null default now(),
  deleted            boolean not null default false
);

create index contratti_cliente_idx on public.contratti (cliente_id);
create index contratti_scadenza_idx on public.contratti (data_scadenza);

-- ---------------------------------------------------------------------------
-- Interventi
--
-- Un solo tipo di record per tutto cio' che si fa sul campo: guasto hardware,
-- assistenza software, verifica periodica, installazione, dismissione. I campi
-- verifica_* e ade_* valgono solo quando tipo = 'verifica_periodica'.
-- Il numero progressivo lo assegna il server: il client non lo invia mai,
-- percio' un rapportino compilato offline lo riceve quando arriva in rete.
-- ---------------------------------------------------------------------------

create sequence public.interventi_numero_seq;

create table public.interventi (
  id                uuid primary key,
  numero            bigint,
  cliente_id        uuid not null references public.clienti (id) on delete cascade,
  sede_id           uuid references public.sedi (id) on delete set null,
  dispositivo_id    uuid references public.dispositivi (id) on delete set null,
  tipo              text not null default 'hardware'
                      check (tipo in ('hardware', 'software', 'verifica_periodica',
                                      'installazione', 'dismissione', 'consulenza', 'altro')),
  stato             text not null default 'aperto'
                      check (stato in ('aperto', 'in_corso', 'sospeso', 'chiuso', 'annullato')),
  priorita          text not null default 'normale'
                      check (priorita in ('bassa', 'normale', 'alta', 'urgente')),
  data_apertura     timestamptz not null default now(),
  data_intervento   date,
  ora_inizio        text,
  ora_fine          text,
  tecnico_id        uuid references public.profiles (id) on delete set null,
  problema          text,
  soluzione         text,
  ore               numeric(5, 2),
  da_fatturare      boolean not null default true,
  fatturato         boolean not null default false,
  firma_base64      text,
  firma_nome        text,
  -- solo per le verifiche periodiche
  verifica_esito    text check (verifica_esito in ('regolare', 'irregolare')),
  verifica_sigilli  text,
  verifica_libretto text,
  ade_trasmessa     boolean not null default false,
  ade_trasmessa_il  date,
  note              text,
  updated_at        timestamptz not null default now(),
  synced_at         timestamptz not null default now(),
  deleted           boolean not null default false
);

create index interventi_cliente_idx on public.interventi (cliente_id);
create index interventi_dispositivo_idx on public.interventi (dispositivo_id);
create index interventi_stato_idx on public.interventi (stato);
create index interventi_data_idx on public.interventi (data_intervento);

create or replace function public.assegna_numero_intervento()
returns trigger
language plpgsql
as $$
begin
  if new.numero is null then
    new.numero := nextval('public.interventi_numero_seq');
  end if;
  return new;
end;
$$;

create trigger su_insert_intervento
  before insert on public.interventi
  for each row execute function public.assegna_numero_intervento();

-- Righe del rapportino: manodopera, ricambi, trasferta.
create table public.intervento_righe (
  id              uuid primary key,
  intervento_id   uuid not null references public.interventi (id) on delete cascade,
  tipo            text not null default 'manodopera'
                    check (tipo in ('manodopera', 'ricambio', 'trasferta', 'altro')),
  descrizione     text not null default '',
  quantita        numeric(10, 2) not null default 1,
  prezzo_unitario numeric(10, 2),
  ricambio_id     uuid,
  updated_at      timestamptz not null default now(),
  synced_at       timestamptz not null default now(),
  deleted         boolean not null default false
);

create index intervento_righe_intervento_idx on public.intervento_righe (intervento_id);

-- ---------------------------------------------------------------------------
-- Magazzino ricambi (minimo indispensabile, si amplia in seguito)
-- ---------------------------------------------------------------------------

create table public.ricambi (
  id            uuid primary key,
  codice        text not null default '',
  descrizione   text not null default '',
  giacenza      numeric(10, 2) not null default 0,
  scorta_minima numeric(10, 2) not null default 0,
  prezzo        numeric(10, 2),
  note          text,
  updated_at    timestamptz not null default now(),
  synced_at     timestamptz not null default now(),
  deleted       boolean not null default false
);

alter table public.intervento_righe
  add constraint intervento_righe_ricambio_fkey
  foreign key (ricambio_id) references public.ricambi (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Impostazioni (cadenza verifiche, soglie di avviso, intestazione rapportino)
-- ---------------------------------------------------------------------------

create table public.impostazioni (
  chiave     text primary key,
  valore     text not null default '',
  updated_at timestamptz not null default now(),
  synced_at  timestamptz not null default now(),
  deleted    boolean not null default false
);

insert into public.impostazioni (chiave, valore) values
  ('mesi_verifica',      '24'),
  ('giorni_avviso',      '60'),
  ('azienda_nome',       ''),
  ('azienda_indirizzo',  ''),
  ('azienda_piva',       ''),
  ('azienda_telefono',   ''),
  ('azienda_email',      ''),
  ('azienda_laboratorio','');

-- ---------------------------------------------------------------------------
-- Trigger synced_at su tutte le tabelle sincronizzate
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'clienti', 'sedi', 'dispositivi', 'contratti',
    'interventi', 'intervento_righe', 'ricambi', 'impostazioni'
  ]
  loop
    execute format(
      'create trigger tocca_synced_at before insert or update on public.%I
         for each row execute function public.tocca_synced_at()', t);
    execute format('create index %I on public.%I (synced_at)', t || '_synced_at_idx', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Centro singolo: chiunque abbia un account puo' leggere e scrivere i dati di
-- lavoro. Le cancellazioni fisiche sono vietate, si usa deleted = true, perche'
-- altrimenti la cancellazione non arriverebbe agli altri dispositivi.
-- Il giorno in cui servisse separare i tecnici per zona, si cambia qui.
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'clienti', 'sedi', 'dispositivi', 'contratti',
    'interventi', 'intervento_righe', 'ricambi', 'impostazioni'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy leggi_%1$s on public.%1$I for select to authenticated using (true)', t);
    execute format(
      'create policy inserisci_%1$s on public.%1$I for insert to authenticated with check (true)', t);
    execute format(
      'create policy aggiorna_%1$s on public.%1$I for update to authenticated using (true) with check (true)', t);
  end loop;
end;
$$;

alter table public.profiles enable row level security;

create policy leggi_profiles on public.profiles
  for select to authenticated using (true);

-- Ognuno modifica il proprio profilo; gli admin modificano tutti.
create policy aggiorna_profiles on public.profiles
  for update to authenticated
  using (
    id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.ruolo = 'admin')
  )
  with check (
    id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.ruolo = 'admin')
  );
