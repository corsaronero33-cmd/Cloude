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
 |   coda "pendenti"    |                 |   Storage (le foto)    |
 +----------------------+                 +------------------------+
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

## Provarla subito

Senza configurare niente, l'app parte in modalita' **solo locale**: si inseriscono
clienti, apparecchi, contratti e rapportini, tutto resta nel browser, e
l'etichetta viola in alto a destra lo dice chiaramente. In `Impostazioni` c'e' un
pulsante **Carica i dati di esempio** che riempie l'archivio con cinque clienti
inventati e date calcolate a partire da oggi, cosi' lo scadenzario si vede pieno
senza passare una serata a digitare.

Tre strade, dalla piu' rapida alla piu' definitiva.

### 1. Metterla online in due minuti, senza registrarsi

Serve la cartella `dist/` compilata (`npm run build`, oppure il pacchetto zip
gia' pronto).

1. Aprire [app.netlify.com/drop](https://app.netlify.com/drop).
2. Trascinare la cartella `dist` dentro il riquadro.
3. In una ventina di secondi compare un indirizzo tipo
   `https://qualcosa-a1b2c3.netlify.app`: e' gia' raggiungibile dal telefono.

Nessun account, nessuna carta di credito. L'indirizzo resta attivo e si puo'
rivendicare dopo, registrandosi, se si decide di tenerlo.

### 2. Sul proprio computer

```bash
npm install
npm run dev
```

Si apre su `http://localhost:5173`. Per aprirla anche dal telefono, sulla stessa
rete di casa o dell'ufficio:

```bash
npm run dev -- --host
```

Vite stampa un secondo indirizzo, del tipo `http://192.168.1.20:5173`: quello si
digita nel browser del telefono.

### 3. Pubblicazione vera

Vedi [Pubblicarla](#pubblicarla) piu' sotto: e' il passo da fare quando si decide
di usarla sul serio, insieme al collegamento con Supabase.

## Collegare il server (Supabase)

1. **Creare il progetto** su [supabase.com](https://supabase.com). Il piano
   gratuito basta e avanza per un centro con qualche migliaio di apparecchi.
   Scegliere una regione europea (Francoforte) per tenere i dati dei clienti
   dentro l'Unione.

2. **Creare le tabelle.** Nel pannello, `SQL Editor` → `New query`, incollare
   tutto il contenuto di `supabase/installazione.sql` e premere `Run`. E' un
   unico file: contiene le tre migrazioni in fila (tabelle e policy, scadenzario
   lato server, allegati e secchio delle foto), e si puo' rieseguire senza fare
   danni.

   Chi aveva collegato il server quando l'installatore era piu' corto esegue solo
   le migrazioni che gli mancano, da `supabase/migrations/`, non di nuovo tutto.

3. **Configurare l'app.** Copiare `.env.example` in `.env.local` e riempire i
   due valori, che si trovano in `Project Settings` → `API`:

   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_...
   ```

   Nel secondo valore va la chiave pubblica del progetto: sui progetti nuovi si
   chiama `publishable` e comincia con `sb_publishable_`, su quelli piu' vecchi
   `anon` e comincia con `eyJ`. Vanno bene entrambe, e il nome della variabile
   resta quello.

   Quella chiave e' pubblica per sua natura: puo' stare nel browser perche' i
   permessi veri li impongono le policy RLS scritte nella migrazione. La chiave
   `secret` (prima `service_role`), invece, non va **mai** messa qui, ne'
   mandata a nessuno: scavalca le policy e deve restare nel pannello.

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

## Avvisi per email

Ogni mattina parte un messaggio con le scadenze in ritardo, quelle della settimana
e le verifiche ancora da trasmettere. Se non c'e' niente da segnalare non viene
mandato niente, cosi' il messaggio che arriva significa sempre qualcosa.

Il calcolo non e' rifatto a parte: la funzione SQL `public.scadenze` applica le
stesse tre regole dello scadenzario che si vede nell'app. Le due implementazioni
devono restare allineate, e il commento in testa a
`supabase/migrations/0002_avvisi.sql` lo ricorda.

### Metterli in funzione

1. **Il database e' gia' pronto** se hai eseguito `supabase/installazione.sql`
   al momento del collegamento: contiene gia' lo scadenzario lato server e il
   registro degli invii. Se invece avevi eseguito solo `0001_init.sql`, esegui
   adesso anche `supabase/migrations/0002_avvisi.sql`.

2. **Prendere una chiave per la posta.** Su [resend.com](https://resend.com) il
   piano gratuito manda 3.000 messaggi al mese, piu' che abbondanti. In partenza
   si puo' spedire da `onboarding@resend.dev`; per avere il proprio indirizzo come
   mittente va verificato il dominio, che e' un record DNS.

3. **Pubblicare la funzione dal browser**, senza installare niente. Nel pannello
   Supabase, `Edge Functions` -> `Deploy a new function` -> `Via Editor`:
   chiamala `avvisi-scadenze`, cancella il codice di esempio, incolla tutto il
   contenuto di `supabase/functions/avvisi-scadenze/funzione-completa.ts` e premi
   `Deploy`.

   Quel file e' un **unico pezzo**: nell'editor del pannello si crea un file solo e
   si incolla una volta. Non e' scritto a mano due volte — lo genera
   `npm run unisci-funzione` unendo `index.ts` e `messaggio.ts`, che restano i
   file veri da modificare. Un test (`unito.test.ts`) fallisce se qualcuno
   cambia i due e si dimentica di rigenerare l'unito, cosi' le due copie non
   possono divergere in silenzio.

   Poi i due segreti, in `Edge Functions` -> `Secrets`:

   | Nome | Valore |
   | --- | --- |
   | `RESEND_API_KEY` | la chiave presa al punto 2 |
   | `AVVISI_MITTENTE` | `Assistenza <avvisi@tuodominio.it>`, oppure `Gestione Assistenza <onboarding@resend.dev>` per cominciare |

   L'editor del pannello non tiene le versioni: va bene per metterla in
   funzione, ma il codice buono resta quello del repository. Chi preferisce la
   riga di comando puo' usare la [CLI](https://supabase.com/docs/guides/cli), e in
   quel caso si pubblica la cartella `avvisi-scadenze/` con i suoi due file veri,
   non l'unito: `supabase functions deploy avvisi-scadenze` e
   `supabase secrets set RESEND_API_KEY=...`.

   Per leggere il database la funzione usa la chiave di servizio del progetto, che
   Supabase mette a disposizione da sola: cerca prima
   `SUPABASE_SERVICE_ROLE_KEY`, poi `SUPABASE_SECRET_KEYS` (il formato nuovo, un
   JSON), quindi va bene sia un progetto vecchio sia uno creato adesso. Non c'e'
   niente da incollare: quella chiave non deve mai uscire dal pannello.

4. **Dire a chi mandarli.** In `Impostazioni` → `Avvisi per email`: destinatari
   separati da virgola, orizzonte in giorni, e l'indirizzo dell'app per il
   pulsante dentro il messaggio. Poi **Manda una prova adesso**: arriva subito, e
   se qualcosa non va la risposta dice che cosa.

5. **Programmare l'invio quotidiano.** Aprire `supabase/avvisi/pianificazione.sql`,
   sostituire i due segnaposto ed eseguirlo nell'SQL Editor.

### Quando non arriva niente

La tabella `avvisi_log` registra ogni tentativo: se e' partito, a chi, e che cosa
ha risposto il servizio di posta. Gli ultimi cinque invii si vedono direttamente
in `Impostazioni`, sotto il pulsante di prova. Le tre cause piu' comuni sono il
segreto `RESEND_API_KEY` non impostato, nessun destinatario, e gli avvisi
disattivati dall'interruttore.

## Foto negli interventi

E' una funzione **facoltativa**, e si spegne da `Impostazioni` → `Interventi` →
*Foto negli interventi*. Spenta, il riquadro non compare in nessuna scheda e sul
server non serve niente: chi non vuole le foto non deve eseguire la migrazione
`0003_foto.sql`, e la sincronizzazione del resto non ne soffre (vedi *Una
tabella che il server non ha* piu' sotto). L'interruttore e' un'impostazione
come le altre, quindi viaggia su tutti i dispositivi.

Dentro la scheda di un intervento c'e' un riquadro **Foto**: su telefono apre la
fotocamera, su computer il solito scegli-file. Si possono aggiungere piu' foto
alla volta.

Come funziona, perche' conta sapere l'ordine:

1. **La foto viene rimpicciolita sul dispositivo** prima di toccare qualsiasi
   cosa: lato lungo 1600 pixel, JPEG. Una foto da telefono passa da qualche mega
   a qualche decina di kilobyte. Se il rimpicciolimento non riesce — formato
   strano, immagine rotta — viene tenuta l'originale invece di perdere lo scatto.
2. **Resta sul dispositivo**, dentro il database locale, insieme al resto. Si
   vede subito, anche senza campo, anche chiudendo e riaprendo l'app.
3. **Sale su Supabase Storage** alla prima sincronizzazione utile, nel secchio
   privato `foto-interventi`. Fino a quel momento la miniatura porta la pillola
   *da inviare*, che e' la stessa informazione della coda delle scritture ma
   messa dove la stai guardando.
4. **Si rivede da un altro dispositivo** con un indirizzo firmato che vale un'ora:
   il secchio non e' pubblico, quindi una foto di un cliente non e' raggiungibile
   da chi non ha un accesso all'app.

Una foto non puo' esistere senza il suo intervento, quindi aggiungendola a un
intervento appena creato l'intervento viene **salvato da solo** in quel momento.

Se il caricamento di una foto non riesce, quella riga non viene mandata al
server: meglio una foto che resta "da inviare" e riprova, che una scheda che
dice di avere un allegato che non c'e'. Le altre tabelle intanto continuano a
sincronizzarsi.

Il secchio e le sue policy li crea `supabase/migrations/0003_foto.sql` (incluso
in `installazione.sql`). Chi aveva collegato il server prima che le foto
esistessero esegue **solo** quel file, non di nuovo tutto l'installatore.

### Una tabella che il server non ha

`allegati` e' segnata `opzionale` fra i descrittori. Quando il server risponde
che quella tabella non esiste, la sincronizzazione la salta per il resto della
sessione e tira avanti con tutte le altre, invece di fermarsi: un database a cui
manca una migrazione arrivata dopo non e' un guasto, e perdere lo scadenzario
perche' manca il secchio delle foto sarebbe un pessimo scambio.

Il riconoscimento sta in `src/lib/erroriServer.ts`, a parte e sotto test, perche'
e' logica che sbaglia in silenzio: cercare la sola frase *schema cache* avrebbe
preso anche la **colonna** mancante, che invece e' un guasto vero e va mostrato.

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
| `supabase/migrations/0002_avvisi.sql` | Lo scadenzario in SQL, per l'avviso che parte quando nessuno ha l'app aperta |
| `supabase/migrations/0003_foto.sql` | La tabella degli allegati, il secchio delle foto e le sue policy |
| `supabase/installazione.sql` | Le tre migrazioni in fila, da incollare una volta sola su un progetto nuovo |
| `supabase/functions/avvisi-scadenze/` | La funzione che compone e manda il messaggio |
| `strumenti/unisci-funzione.mjs` | Unisce i due file della funzione in quello da incollare nel pannello |
| `strumenti/pacchetto.mjs` | Monta il pacchetto da consegnare: app compilata, file da incollare, istruzioni |
| `pacchetto/LEGGIMI.txt` | Il foglio di istruzioni che viaggia dentro il pacchetto |
| `supabase/avvisi/pianificazione.sql` | Il modello per programmare l'invio quotidiano |
| `supabase/tests/scadenze.test.sql` | Prove sulla funzione SQL, da lanciare con psql |
| `src/lib/types.ts` | I tipi del dominio, uno per tabella |
| `src/lib/db.ts` | Database locale (Dexie), generazione degli uuid, coda delle scritture |
| `src/lib/sync.ts` | Salita e discesa, risoluzione dei conflitti |
| `src/lib/scadenze.ts` | Lo scadenzario unificato: verifiche, contratti, adempimenti |
| `src/lib/dates.ts` | Aritmetica delle date sul calendario, senza fusi orari |
| `src/lib/csv.ts` | Lettura e scrittura dei CSV di Excel |
| `src/lib/pdf.ts` | Rapportino e verbale di verifica, generati sul dispositivo |
| `src/lib/immagini.ts` | Rimpicciolimento delle foto prima di salvarle |
| `src/lib/erroriServer.ts` | Riconosce gli errori del server che si possono ignorare |
| `src/lib/dati.ts` | Gli agganci reattivi fra IndexedDB e le schermate |
| `src/lib/esempio.ts` | I dati di prova, con le date calcolate a partire da oggi |
| `src/pages/` | Una schermata per file |
| `src/components/` | Mattoncini dell'interfaccia, barra di navigazione, riquadro della firma |

## Test

```bash
npm test
```

Coprono le parti che possono sbagliare in silenzio: l'aritmetica delle date (il
31 gennaio piu' un mese, l'ora legale, il 29 febbraio), le regole con cui lo
scadenzario decide cosa mostrare, la lettura dei CSV veri di Excel (virgolette
raddoppiate, campi che vanno a capo, BOM) e la composizione dell'email di avviso,
che altrimenti nessuno guarderebbe prima che parta da sola alle sette del mattino.
Un test a parte tiene allineato `funzione-completa.ts` ai due file da cui nasce.

La funzione SQL ha le sue prove, da lanciare contro il database. Girano dentro una
transazione annullata in fondo, quindi si possono lanciare anche sul database vero
senza lasciare traccia:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/scadenze.test.sql
```

```bash
npm run typecheck        # solo i tipi
npm run build            # compila per la pubblicazione
npm run unisci-funzione  # rigenera il file unico della funzione
npm run pacchetto        # monta pacchetto-pronto/gestione-assistenza.zip
```

`npm run pacchetto` va dopo `npm run build` e mette insieme quello che si
consegna: `dist/` come cartella da pubblicare, i tre file da incollare nel
pannello e `pacchetto/LEGGIMI.txt`. Nei file da incollare scrive il riferimento
del progetto letto da `.env.local`, cosi' chi li usa ha un segnaposto in meno da
sostituire; la chiave segreta resta un segnaposto, perche' non deve mai uscire
dal pannello. Esiste perche' la prima volta l'ho montato a mano, e un pacchetto
montato a mano prima o poi parte con dentro una compilazione vecchia.

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
- **avviso giornaliero via email**, con registro degli invii e pulsante di prova
- **foto negli interventi** (facoltative, con interruttore): rimpicciolite sul dispositivo, in coda se non c'e' campo, su Storage privato

Non c'e' ancora, in ordine di utilita':

1. **calendario dei giri** dei tecnici, con assegnazione per zona;
2. **magazzino ricambi** collegato alle righe dei rapportini (la tabella c'e' gia');
3. **esportazione verso la fatturazione elettronica**;
4. **permessi per zona**: oggi chi ha un accesso vede tutti i clienti.

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
