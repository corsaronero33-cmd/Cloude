-- ============================================================================
-- Prove sulla funzione public.scadenze
--
-- Girano dentro una transazione che viene sempre annullata: si possono lanciare
-- anche su un database con dentro i dati veri, senza lasciare traccia.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/scadenze.test.sql
--
-- Ogni controllo che non torna interrompe l'esecuzione dicendo che cosa si
-- aspettava e che cosa ha trovato. Se arriva in fondo, stampa "TUTTO OK".
--
-- Le date sono tutte relative a oggi, cosi' le prove non scadono col tempo.
-- ============================================================================

begin;

-- Le prove non devono dipendere da come e' configurato il database di turno.
insert into public.impostazioni (chiave, valore) values ('mesi_verifica', '24')
  on conflict (chiave) do update set valore = '24';

create temporary table atteso_vuoto (x int) on commit drop;

do $$
declare
  c1 uuid := gen_random_uuid();
  c2 uuid := gen_random_uuid();
  oggi date := public.oggi_it();
  quante int;
  riga record;
begin
  -- ---------------------------------------------------------------- dati ---
  insert into public.clienti (id, ragione_sociale, updated_at)
    values (c1, 'Bar Centrale di Rossi snc', now()),
           (c2, 'Panificio Bianchi', now());

  -- d1: verificato 24 mesi e 10 giorni fa -> in ritardo di 10 giorni
  insert into public.dispositivi (id, cliente_id, matricola, marca, modello, data_ultima_verifica, stato, updated_at)
    values (gen_random_uuid(), c1, 'RT0000001', 'Epson', 'FP-81', oggi - interval '24 months' - interval '10 days', 'attivo', now());

  -- d2: verificato 24 mesi meno 5 giorni fa -> scade fra 5 giorni
  insert into public.dispositivi (id, cliente_id, matricola, data_ultima_verifica, stato, updated_at)
    values (gen_random_uuid(), c1, 'RT0000002', oggi - interval '24 months' + interval '5 days', 'attivo', now());

  -- d3: dismesso, verifica vecchissima -> non deve comparire
  insert into public.dispositivi (id, cliente_id, matricola, data_ultima_verifica, stato, updated_at)
    values (gen_random_uuid(), c2, 'RT0000003', oggi - interval '60 months', 'dismesso', now());

  -- d4: fuori servizio, in ritardo -> deve comparire, va verificato prima di
  -- rimetterlo in funzione
  insert into public.dispositivi (id, cliente_id, matricola, data_ultima_verifica, stato, updated_at)
    values (gen_random_uuid(), c2, 'RT0000004', oggi - interval '30 months', 'fuori_servizio', now());

  -- d5: nessuna data -> non calcolabile, resta fuori
  insert into public.dispositivi (id, cliente_id, matricola, stato, updated_at)
    values (gen_random_uuid(), c2, 'RT0000005', 'attivo', now());

  -- d6: nessuna verifica ma messa in servizio 23 mesi fa -> scade fra ~1 mese
  insert into public.dispositivi (id, cliente_id, matricola, data_messa_servizio, stato, updated_at)
    values (gen_random_uuid(), c1, 'RT0000006', oggi - interval '23 months', 'attivo', now());

  -- contratti
  insert into public.contratti (id, cliente_id, tipo, descrizione, data_scadenza, importo, stato, updated_at)
    values (gen_random_uuid(), c1, 'software', 'Gestionale 3 postazioni', oggi + 20, 480.00, 'attivo', now()),
           (gen_random_uuid(), c1, 'assistenza', 'Disdetto a settembre', oggi + 15, 200.00, 'disdetto', now()),
           (gen_random_uuid(), c2, 'canone_rt', 'Canone annuo', oggi - 3, 90.00, 'scaduto', now()),
           (gen_random_uuid(), c2, 'software', 'Sostituito dal rinnovo', oggi + 10, 100.00, 'rinnovato', now());

  -- interventi: una verifica chiusa non trasmessa, una gia' trasmessa
  insert into public.interventi (id, cliente_id, tipo, stato, data_intervento, ade_trasmessa, updated_at)
    values (gen_random_uuid(), c1, 'verifica_periodica', 'chiuso', oggi - 12, false, now()),
           (gen_random_uuid(), c1, 'verifica_periodica', 'chiuso', oggi - 40, true, now()),
           (gen_random_uuid(), c2, 'verifica_periodica', 'in_corso', oggi - 2, false, now()),
           (gen_random_uuid(), c2, 'hardware', 'chiuso', oggi - 5, false, now());

  -- ------------------------------------------------------------ controlli ---

  -- Le verifiche in elenco sono quattro: d1, d2, d4, d6.
  select count(*) into quante from public.scadenze(null) where origine = 'verifica';
  if quante <> 4 then
    raise exception 'verifiche attese 4, trovate %', quante;
  end if;

  -- d1 e' in ritardo esattamente di dieci giorni.
  select * into riga from public.scadenze(null)
    where origine = 'verifica' and dettaglio like '%RT0000001%';
  if riga.giorni <> -10 then
    raise exception 'RT0000001: attesi -10 giorni, trovati %', riga.giorni;
  end if;
  if riga.dettaglio <> 'Epson FP-81 · matricola RT0000001' then
    raise exception 'RT0000001: dettaglio inatteso "%"', riga.dettaglio;
  end if;
  if riga.cliente <> 'Bar Centrale di Rossi snc' then
    raise exception 'RT0000001: cliente inatteso "%"', riga.cliente;
  end if;

  -- d2 scade fra cinque giorni.
  select * into riga from public.scadenze(null)
    where origine = 'verifica' and dettaglio like '%RT0000002%';
  if riga.giorni <> 5 then
    raise exception 'RT0000002: attesi 5 giorni, trovati %', riga.giorni;
  end if;

  -- d3 (dismesso) e d5 (senza date) non compaiono.
  select count(*) into quante from public.scadenze(null)
    where dettaglio like '%RT0000003%' or dettaglio like '%RT0000005%';
  if quante <> 0 then
    raise exception 'dismesso o senza date comparso in elenco (% righe)', quante;
  end if;

  -- d6 parte dalla messa in servizio: 23 mesi fa + 24 mesi = fra circa un mese.
  select * into riga from public.scadenze(null)
    where origine = 'verifica' and dettaglio like '%RT0000006%';
  if riga.giorni < 25 or riga.giorni > 35 then
    raise exception 'RT0000006: atteso circa un mese, trovati % giorni', riga.giorni;
  end if;

  -- Contratti: solo quello in corso e quello scaduto.
  select count(*) into quante from public.scadenze(null) where origine = 'contratto';
  if quante <> 2 then
    raise exception 'contratti attesi 2, trovati %', quante;
  end if;

  select * into riga from public.scadenze(null)
    where origine = 'contratto' and dettaglio = 'Gestionale 3 postazioni';
  if riga.giorni <> 20 or riga.importo <> 480.00 or riga.titolo <> 'Abbonamento software' then
    raise exception 'contratto software: giorni %, importo %, titolo %',
      riga.giorni, riga.importo, riga.titolo;
  end if;

  -- Trasmissioni: solo la verifica chiusa e non trasmessa.
  select count(*) into quante from public.scadenze(null) where origine = 'trasmissione';
  if quante <> 1 then
    raise exception 'trasmissioni attese 1, trovate %', quante;
  end if;

  -- Un adempimento arretrato non ha giorni che mancano: resta sempre <= 0.
  select * into riga from public.scadenze(null) where origine = 'trasmissione';
  if riga.giorni > 0 then
    raise exception 'la trasmissione arretrata ha giorni positivi: %', riga.giorni;
  end if;

  -- L'orizzonte taglia le scadenze lontane ma tiene sempre gli arretrati.
  select count(*) into quante from public.scadenze(7);
  -- entro 7 giorni o gia' in ritardo: d1 (-10), d2 (+5), d4 (in ritardo),
  -- il canone scaduto (-3), la trasmissione.
  if quante <> 5 then
    raise exception 'orizzonte 7 giorni: attese 5 righe, trovate %', quante;
  end if;

  select count(*) into quante from public.scadenze(0) where giorni > 0;
  if quante <> 0 then
    raise exception 'orizzonte 0: comparse % righe future', quante;
  end if;

  -- L'elenco esce ordinato per data crescente.
  perform 1 from (
    select data, lag(data) over (order by (select 1)) as precedente
    from public.scadenze(null)
  ) q where precedente is not null and data < precedente;
  if found then
    raise exception 'elenco non ordinato per data';
  end if;

  -- Una cadenza diversa sposta tutte le verifiche, senza toccare i contratti.
  update public.impostazioni set valore = '12' where chiave = 'mesi_verifica';
  select * into riga from public.scadenze(null)
    where origine = 'verifica' and dettaglio like '%RT0000001%';
  if riga.giorni <> -10 - 365 and riga.giorni <> -10 - 366 then
    raise exception 'cadenza 12 mesi: attesi circa -375 giorni, trovati %', riga.giorni;
  end if;

  -- Un valore sporco non deve far saltare l'avviso notturno: si torna a 24.
  update public.impostazioni set valore = 'ventiquattro' where chiave = 'mesi_verifica';
  if public.impostazione_numero('mesi_verifica', 24) <> 24 then
    raise exception 'un valore non numerico non e'' stato ignorato';
  end if;
  select * into riga from public.scadenze(null)
    where origine = 'verifica' and dettaglio like '%RT0000001%';
  if riga.giorni <> -10 then
    raise exception 'con impostazione sporca attesi -10 giorni, trovati %', riga.giorni;
  end if;

  raise notice 'TUTTO OK';
end;
$$;

rollback;
