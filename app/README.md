# Gestione Assistenza

Gestionale per un centro di assistenza tecnica: verifiche periodiche dei
registratori telematici, scadenze degli abbonamenti software e dei contratti,
interventi hardware e software con rapportino firmato dal cliente.

Una sola applicazione per telefono e per PC. E' una **PWA**: si apre nel browser
sul computer dell'ufficio e si installa come icona sul telefono dei tecnici,
senza passare da nessuno store.

## Come e' fatta

Il principio che regge tutto il resto: **l'app legge e scrive nel database del
dispositivo, non sulla rete.** La rete serve solo a riallineare quella copia con
quella condivisa. Un tecnico nel retro di un negozio senza campo compila il
rapportino, raccoglie la firma, stampa il PDF e chiude l'intervento: quando il
telefono ritrova la linea, tutto sale da solo.

```
   telefono / PC                               Supabase
 +----------------------+                 +------------------------+
 |  interfaccia React   |                 |                        |
 |          |           |                 |   PostgreSQL + RLS     |
 |     IndexedDB  <-----+-- salita -----> |                        |
 |     (Dexie)    <-----+-- discesa ----- |   autenticazione       |
 |          |           |                 |                        |
 |   coda "pendenti"    |                 +------------------------+
 +----------------------+
```

Le regole, scritte per esteso in `src/lib/db.ts` e `src/lib/sync.ts`:

- ogni riga nasce con un **uuid generato sul dispositivo**, quindi un intervento
  creato offline ha subito il suo identificativo definitivo e le sue righe
  possono collegarsi a lui prima che il server lo abbia mai visto;
- `updated_at` lo scrive il client al momento della modifica, e in caso di
  conflitto **vince la scrittura piu' recente**;
- `synced_at` lo scrive il server a ogni passaggio, ed e' il segnalibro con cui
  il client chiede solo quello che e' cambiato: il traffico resta proporzionale
  alle novita', non alla dimensione dell'archivio;
- le cancellazioni sono **logiche** (`deleted = true`), perche' una riga rimossa
  fisicamente non potrebbe arrivare agli altri dispositivi;
- la salita rispetta un **ordine fisso fra le tabelle**, cosi' i vincoli di
  integrita' reggono anche sincronizzando un'intera giornata di lavoro arretrato.

Una cosa che non e' memorizzata: **la data della prossima verifica periodica.**
Si ricava ogni volta dall'ultima verifica (o, se manca, dalla messa in servizio)
sommando i mesi di cadenza impostati. Cosi' il calcolo e' identico online e
offline, e il giorno in cui la norma cambiasse la cadenza basta cambiare un
numero nelle impostazioni perche' tutte le scadenze si ricalcolino.

## Provarla subito, senza server

```bash
npm install
npm run dev
```

Si apre su `http://localhost:5173` in modalita' **solo locale**: si possono
inserire clienti, apparecchi e interventi, e tutto resta nel browser. L'etichetta
viola in alto a destra lo dice chiaramente. Serve a vedere se l'impianto
convince, prima di mettere in piedi il server.

## Collegare il server (Supabase)

1. **Creare il progetto** su [supabase.com](https://supabase.com). Il piano
   gratuito basta e avanza per un centro con qualche migliaio di apparecchi.
   Scegliere una regione europea (Francoforte) per tenere i dati dei clienti
   dentro l'Unione.

2. **Creare le tabelle.** Nel pannello, `SQL Editor` → `New query`, incollare
   tutto il contenuto di `supabase/migrations/0001_init.sql` e premere `Run`.

3. **Configurare l'app.** Copiare `.env.example` in `.env.local` e riempire i
   due valori, che si trovano in `Project Settings` → `API`:

   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

   La chiave `anon` e' pubblica per sua natura: puo' stare nel browser perche' i
   permessi veri li impongono le policy RLS scritte nella migrazione. La chiave
   `service_role`, invece, non va **mai** messa qui.

4. **Creare gli accessi.** `Authentication` → `Users` → `Add user`, uno per te e
   uno per ciascun tecnico, con email e password. Il profilo viene creato da solo
   al primo accesso.

5. **Darsi il ruolo di amministratore**, dall'SQL Editor:

   ```sql
   update public.profiles set ruolo = 'admin', nome = 'Il tuo nome'
   where id = (select id from auth.users where email = 'tua@email.it');
   ```

6. Riavviare `npm run dev` ed entrare.

## Pubblicarla

```bash
npm run build      # produce dist/
```

`dist/` e' un sito statico: va bene qualunque hosting (Netlify, Vercel, Cloudflare
Pages, o una cartella su un server web). Le variabili `VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY` vanno impostate anche nell'ambiente di build
dell'hosting, perche' vengono incorporate nel pacchetto al momento della
compilazione.

Gli indirizzi usano il cancelletto (`/#/clienti`): non serve configurare nessuna
regola di riscrittura sull'hosting, e l'app continua a funzionare aperta dalla
cache quando la rete non c'e'.

### Installazione sul telefono

Aprire l'indirizzo con Chrome su Android o Safari su iPhone, poi *Aggiungi a
schermata Home* (su iPhone sta nel menu di condivisione). Il primo accesso
richiede la connessione: serve a scaricare i dati e a stabilire la sessione.

## Portare dentro i dati che hai oggi

`Importa dati` legge i CSV che escono da Excel in italiano — punto e virgola come
separatore, accenti compresi — e accosta da sola le colonne ai campi quando i
nomi si somigliano (`Ragione Sociale`, `ragione_sociale` e `RAGIONE SOCIALE`
finiscono tutte sullo stesso posto). Niente viene scritto prima dell'anteprima.

Ordine consigliato: prima i **clienti**, poi gli **apparecchi**, poi i
**contratti**. Importando apparecchi o contratti si puo' lasciare che i clienti
mancanti vengano creati al volo, ma partire dall'anagrafica completa da' un
archivio piu' pulito.

Le date si possono scrivere come si e' abituati: `10/03/2026`, `10-3-26` e
`2026-03-10` vengono lette tutte allo stesso modo. Una data impossibile non viene
corretta a caso: la riga viene saltata e compare nell'elenco degli scarti, con il
motivo.

## Com'e' organizzato il codice

| Percorso | Ruolo |
| --- | --- |
| `supabase/migrations/0001_init.sql` | Tabelle, trigger, policy RLS. E' la fonte di verita' dello schema |
| `src/lib/types.ts` | I tipi del dominio, uno per tabella |
| `src/lib/db.ts` | Database locale (Dexie), generazione degli uuid, coda delle scritture |
| `src/lib/sync.ts` | Salita e discesa, risoluzione dei conflitti |
| `src/lib/scadenze.ts` | Lo scadenzario unificato: verifiche, contratti, adempimenti |
| `src/lib/dates.ts` | Aritmetica delle date sul calendario, senza fusi orari |
| `src/lib/csv.ts` | Lettura e scrittura dei CSV di Excel |
| `src/lib/pdf.ts` | Rapportino e verbale di verifica, generati sul dispositivo |
| `src/lib/dati.ts` | Gli agganci reattivi fra IndexedDB e le schermate |
| `src/pages/` | Una schermata per file |
| `src/components/` | Mattoncini dell'interfaccia, barra di navigazione, riquadro della firma |

## Test

```bash
npm test
```

Coprono le tre parti che possono sbagliare in silenzio: l'aritmetica delle date
(il 31 gennaio piu' un mese, l'ora legale, il 29 febbraio), le regole con cui lo
scadenzario decide cosa mostrare, e la lettura dei CSV veri di Excel (virgolette
raddoppiate, campi che vanno a capo, BOM).

```bash
npm run typecheck   # solo i tipi
npm run build       # compila per la pubblicazione
```

## Cosa c'e' e cosa manca

Funziona oggi:

- scadenzario unificato con fasce (scadute, entro 7 giorni, entro il mese, in arrivo)
- anagrafica clienti con sedi multiple
- schede degli apparecchi con matricola, provvedimento, firmware, stato, collegamento al POS
- contratti e abbonamenti con rinnovo a un tocco, che non fa perdere giorni al cliente
- interventi con tipo, orari, ore calcolate, materiali, firma del cliente, PDF
- verbale di verifica periodica con esito, sigilli, libretto e **spunta della trasmissione ad AdE**
- importazione ed esportazione CSV
- funzionamento offline con coda delle scritture visibile

Non c'e' ancora, in ordine di utilita':

1. **avvisi automatici** — un riepilogo giornaliero via email delle scadenze dei
   prossimi giorni (si fa con una Edge Function e `pg_cron` su Supabase);
2. **foto negli interventi** — allegati su Supabase Storage, con coda offline;
3. **calendario dei giri** dei tecnici, con assegnazione per zona;
4. **magazzino ricambi** collegato alle righe dei rapportini (la tabella c'e' gia');
5. **esportazione verso la fatturazione elettronica**;
6. **permessi per zona**: oggi chi ha un accesso vede tutti i clienti.

## Una nota sulle scadenze normative

La cadenza della verifica periodica e' un **parametro**, non una costante
scritta nel codice: sta in `Impostazioni` → `Regole dello scadenzario`, vale 24
mesi come impostazione di partenza e si cambia in un punto solo. Lo stesso per il
preavviso.

Il campo `collegato_pos` sugli apparecchi e il filtro *POS da collegare*
nell'elenco servono a tenere sotto controllo l'adeguamento al collegamento fra
registratore telematico e terminale di pagamento. Le date di decorrenza di quel
tipo di obbligo vengono ritoccate spesso: l'app non le codifica da nessuna parte,
si limita a dirti chi hai adeguato e chi no.
