-- ============================================================================
-- Pianificazione dell'avviso giornaliero
--
-- Da eseguire UNA VOLTA nell'SQL Editor di Supabase, dopo aver pubblicato la
-- funzione `avvisi-scadenze`. Prima di lanciarlo vanno sostituiti i due
-- segnaposto piu' sotto.
--
--   RIFERIMENTO_PROGETTO   la sigla del progetto: si legge nell'indirizzo del
--                          pannello, https://supabase.com/dashboard/project/XXXX
--   CHIAVE_SERVICE_ROLE    Project Settings > API > service_role.
--                          E' una chiave che vale come una password di
--                          amministratore: sta qui dentro, dentro al database,
--                          e non va mai messa nell'app ne' in un file del
--                          repository.
--
-- Nota sull'orario: pg_cron ragiona in UTC. In Italia siamo avanti di un'ora
-- d'inverno e di due d'estate, quindi '0 6 * * 1-5' significa le 7 del mattino
-- da ottobre a marzo e le 8 da aprile a settembre. Se l'ora esatta conta, si
-- mettono due pianificazioni e se ne tiene attiva una per stagione.
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Se la si rilancia dopo una modifica, prima si toglie quella vecchia.
select cron.unschedule('avvisi-scadenze')
where exists (select 1 from cron.job where jobname = 'avvisi-scadenze');

select cron.schedule(
  'avvisi-scadenze',
  '0 6 * * 1-5',          -- dal lunedi' al venerdi'; '0 6 * * *' per tutti i giorni
  $corpo$
  select net.http_post(
    url := 'https://RIFERIMENTO_PROGETTO.supabase.co/functions/v1/avvisi-scadenze',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer CHIAVE_SERVICE_ROLE'
    ),
    body := '{}'::jsonb
  );
  $corpo$
);

-- Controlli utili --------------------------------------------------------

-- Che cosa e' pianificato:
--   select jobname, schedule, active from cron.job;

-- Come sono andate le ultime esecuzioni della pianificazione:
--   select status, return_message, start_time
--     from cron.job_run_details order by start_time desc limit 10;

-- Che cosa ha fatto la funzione, invio per invio (e' la tabella che si vede
-- anche dentro l'app, in Impostazioni):
--   select inviato_il, esito, destinatari, scadute, entro_sette, messaggio
--     from public.avvisi_log order by inviato_il desc limit 10;

-- Per fermare gli avvisi senza disfare nulla:
--   update public.impostazioni set valore = '0', updated_at = now()
--    where chiave = 'avvisi_attivi';
