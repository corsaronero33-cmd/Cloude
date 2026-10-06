-- ============================================================================
-- Avvisi di scadenza
--
-- Lo scadenzario che si vede nell'app e' calcolato nel browser, sui dati
-- locali. L'avviso per email deve pero' partire anche quando nessuno ha l'app
-- aperta, quindi lo stesso calcolo serve una seconda volta qui, sul server.
--
-- ATTENZIONE: la funzione `scadenze` piu' sotto e `src/lib/scadenze.ts` devono
-- dire la stessa cosa. Se si cambia una regola in uno, va cambiata nell'altro.
-- Le regole in questione sono tre, e sono queste:
--   * la prossima verifica si conta dall'ultima verifica, o in mancanza dalla
--     messa in servizio, sommando i mesi configurati;
--   * si considerano solo gli apparecchi attivi o fuori servizio (un dismesso
--     non va verificato, uno fuori servizio si', prima di rimetterlo in uso);
--   * si considerano solo i contratti in corso o scaduti, non i disdetti ne'
--     quelli gia' sostituiti da un rinnovo.
-- ============================================================================

-- --------------------------------------------------------------------------
-- Lettura delle impostazioni, con valore di ripiego
-- --------------------------------------------------------------------------

create or replace function public.impostazione(p_chiave text, p_difetto text)
returns text
language sql
stable
as $$
  select coalesce(
    (select valore from public.impostazioni
      where chiave = p_chiave and not deleted and valore <> ''),
    p_difetto)
$$;

-- Variante numerica: un valore non numerico non deve far fallire l'avviso
-- notturno, si torna semplicemente al valore di ripiego.
create or replace function public.impostazione_numero(p_chiave text, p_difetto int)
returns int
language sql
stable
as $$
  select case
    when public.impostazione(p_chiave, '') ~ '^[0-9]+$'
      then public.impostazione(p_chiave, '')::int
    else p_difetto
  end
$$;

-- --------------------------------------------------------------------------
-- Il giorno di oggi secondo l'orologio italiano
--
-- Il server ragiona in UTC. Alle due di notte in Italia e' gia' il giorno dopo
-- a Greenwich: senza questa conversione una scadenza "oggi" potrebbe risultare
-- "ieri" nell'email mandata di prima mattina.
-- --------------------------------------------------------------------------

create or replace function public.oggi_it()
returns date
language sql
stable
as $$
  select (timezone('Europe/Rome', now()))::date
$$;

-- --------------------------------------------------------------------------
-- La data della prossima verifica periodica
-- --------------------------------------------------------------------------

create or replace function public.prossima_verifica(
  p_ultima_verifica date,
  p_messa_servizio date,
  p_mesi int
)
returns date
language sql
immutable
as $$
  select case
    when coalesce(p_ultima_verifica, p_messa_servizio) is null then null
    else (coalesce(p_ultima_verifica, p_messa_servizio) + make_interval(months => p_mesi))::date
  end
$$;

-- --------------------------------------------------------------------------
-- Lo scadenzario unificato
--
-- p_giorni limita l'orizzonte: tutto cio' che scade entro quei giorni, piu'
-- tutto cio' che e' gia' in ritardo. Passando null si ottiene l'elenco intero.
-- --------------------------------------------------------------------------

create or replace function public.scadenze(p_giorni int default null)
returns table (
  origine     text,
  riferimento uuid,
  cliente_id  uuid,
  cliente     text,
  titolo      text,
  dettaglio   text,
  data        date,
  giorni      int,
  importo     numeric
)
language sql
stable
as $$
  with cfg as (
    select public.impostazione_numero('mesi_verifica', 24) as mesi,
           public.oggi_it() as giorno
  ),
  verifiche as (
    select
      'verifica'::text as origine,
      d.id as riferimento,
      d.cliente_id,
      c.ragione_sociale as cliente,
      'Verifica periodica'::text as titolo,
      trim(both ' ·' from
        concat_ws(' ', d.marca, d.modello) || ' · matricola ' || d.matricola) as dettaglio,
      public.prossima_verifica(d.data_ultima_verifica, d.data_messa_servizio, cfg.mesi) as data,
      null::numeric as importo
    from public.dispositivi d
    join public.clienti c on c.id = d.cliente_id
    cross join cfg
    where not d.deleted
      and not c.deleted
      and d.stato in ('attivo', 'fuori_servizio')
      and coalesce(d.data_ultima_verifica, d.data_messa_servizio) is not null
  ),
  rinnovi as (
    select
      'contratto'::text as origine,
      k.id as riferimento,
      k.cliente_id,
      c.ragione_sociale as cliente,
      case k.tipo
        when 'software'   then 'Abbonamento software'
        when 'assistenza' then 'Contratto di assistenza'
        when 'canone_rt'  then 'Canone RT'
        when 'noleggio'   then 'Noleggio'
        else 'Contratto'
      end as titolo,
      coalesce(nullif(k.descrizione, ''), coalesce('Licenza ' || k.licenza, '')) as dettaglio,
      k.data_scadenza as data,
      k.importo
    from public.contratti k
    join public.clienti c on c.id = k.cliente_id
    where not k.deleted
      and not c.deleted
      and k.stato in ('attivo', 'scaduto')
  ),
  -- Verifiche concluse e non ancora trasmesse a Fatture e Corrispettivi.
  -- Non e' una scadenza di calendario, ma e' l'adempimento che si dimentica e
  -- che costa caro, quindi viaggia insieme alle altre, sempre in testa.
  trasmissioni as (
    select
      'trasmissione'::text as origine,
      i.id as riferimento,
      i.cliente_id,
      c.ragione_sociale as cliente,
      'Da trasmettere ad AdE'::text as titolo,
      'Verifica del ' || to_char(coalesce(i.data_intervento, cfg.giorno), 'DD/MM/YYYY')
        || coalesce(' · rapportino n. ' || i.numero, '') as dettaglio,
      coalesce(i.data_intervento, cfg.giorno) as data,
      null::numeric as importo
    from public.interventi i
    join public.clienti c on c.id = i.cliente_id
    cross join cfg
    where not i.deleted
      and not c.deleted
      and i.tipo = 'verifica_periodica'
      and i.stato = 'chiuso'
      and not i.ade_trasmessa
  ),
  tutte as (
    select * from verifiche
    union all select * from rinnovi
    union all select * from trasmissioni
  )
  select
    t.origine,
    t.riferimento,
    t.cliente_id,
    t.cliente,
    t.titolo,
    t.dettaglio,
    t.data,
    -- Un adempimento arretrato non ha giorni "che mancano": e' sempre in
    -- ritardo, e deve ordinarsi insieme alle cose scadute.
    case when t.origine = 'trasmissione'
      then least((t.data - cfg.giorno)::int, 0)
      else (t.data - cfg.giorno)::int
    end as giorni,
    t.importo
  from tutte t
  cross join cfg
  where t.data is not null
    and (
      p_giorni is null
      or (case when t.origine = 'trasmissione'
            then least((t.data - cfg.giorno)::int, 0)
            else (t.data - cfg.giorno)::int
          end) <= p_giorni
    )
  order by t.data, t.cliente
$$;

grant execute on function public.scadenze(int) to authenticated, service_role;
grant execute on function public.impostazione(text, text) to authenticated, service_role;
grant execute on function public.impostazione_numero(text, int) to authenticated, service_role;
grant execute on function public.prossima_verifica(date, date, int) to authenticated, service_role;
grant execute on function public.oggi_it() to authenticated, service_role;

-- --------------------------------------------------------------------------
-- Registro degli invii
--
-- Serve a rispondere alla domanda "perche' stamattina non mi e' arrivato
-- niente": c'e' scritto se l'invio e' partito, a chi, e che cosa e' andato
-- storto. Lo scrive la funzione con la chiave di servizio; gli utenti lo
-- leggono soltanto.
-- --------------------------------------------------------------------------

create table public.avvisi_log (
  id            uuid primary key default gen_random_uuid(),
  inviato_il    timestamptz not null default now(),
  destinatari   text not null default '',
  scadute       int not null default 0,
  entro_sette   int not null default 0,
  entro_trenta  int not null default 0,
  da_trasmettere int not null default 0,
  esito         text not null default 'inviato' check (esito in ('inviato', 'saltato', 'errore')),
  messaggio     text,
  prova         boolean not null default false
);

create index avvisi_log_inviato_il_idx on public.avvisi_log (inviato_il desc);

alter table public.avvisi_log enable row level security;

create policy leggi_avvisi_log on public.avvisi_log
  for select to authenticated using (true);

-- --------------------------------------------------------------------------
-- Impostazioni degli avvisi
-- --------------------------------------------------------------------------

insert into public.impostazioni (chiave, valore) values
  ('avvisi_attivi',        '1'),
  ('avvisi_destinatari',   ''),
  ('avvisi_orizzonte',     '30'),
  ('avvisi_anche_se_nulla','0'),
  ('app_indirizzo',        '')
on conflict (chiave) do nothing;
