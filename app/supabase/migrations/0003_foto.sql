-- ============================================================================
-- Foto degli interventi
--
-- Il file sta nello Storage di Supabase; qui c'e' solo la riga che lo descrive,
-- cosi' le foto viaggiano con la stessa sincronizzazione di tutto il resto e
-- una foto scattata senza rete sale quando la rete torna.
--
-- Il secchio e' privato: le immagini non sono raggiungibili da chi non ha
-- fatto l'accesso, nemmeno conoscendo l'indirizzo.
-- ============================================================================

create table public.allegati (
  id            uuid primary key,
  intervento_id uuid not null references public.interventi (id) on delete cascade,
  nome          text not null default '',
  -- Posizione del file dentro il secchio: <id intervento>/<id allegato>.jpg
  percorso      text not null,
  tipo          text,
  dimensione    integer,
  updated_at    timestamptz not null default now(),
  synced_at     timestamptz not null default now(),
  deleted       boolean not null default false
);

create index allegati_intervento_idx on public.allegati (intervento_id);
create index allegati_synced_at_idx on public.allegati (synced_at);

create trigger tocca_synced_at before insert or update on public.allegati
  for each row execute function public.tocca_synced_at();

alter table public.allegati enable row level security;

create policy leggi_allegati on public.allegati
  for select to authenticated using (true);
create policy inserisci_allegati on public.allegati
  for insert to authenticated with check (true);
create policy aggiorna_allegati on public.allegati
  for update to authenticated using (true) with check (true);

-- --------------------------------------------------------------------------
-- Il secchio dove finiscono i file
--
-- Creato qui invece che a mano nel pannello, cosi' chi installa non deve
-- ricordarsi un passaggio in piu'. `on conflict do nothing` lo rende
-- ripetibile senza danni.
-- --------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('foto-interventi', 'foto-interventi', false)
on conflict (id) do nothing;

-- Chi ha fatto l'accesso puo' leggere, caricare e cancellare le foto; chi non
-- l'ha fatto non vede niente, perche' il secchio non e' pubblico.
drop policy if exists "foto leggi" on storage.objects;
create policy "foto leggi" on storage.objects
  for select to authenticated using (bucket_id = 'foto-interventi');

drop policy if exists "foto carica" on storage.objects;
create policy "foto carica" on storage.objects
  for insert to authenticated with check (bucket_id = 'foto-interventi');

drop policy if exists "foto sostituisci" on storage.objects;
create policy "foto sostituisci" on storage.objects
  for update to authenticated using (bucket_id = 'foto-interventi');

drop policy if exists "foto cancella" on storage.objects;
create policy "foto cancella" on storage.objects
  for delete to authenticated using (bucket_id = 'foto-interventi');
