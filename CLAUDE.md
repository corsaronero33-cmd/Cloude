# Progetto: gestionale di cassa e magazzino per negozi

Nome provvisorio: **Cloude** (da decidere).

Prodotto desktop Windows, multiutente, destinato a negozianti, da vendere in
abbonamento annuale. **Non** e' un clone completo di Danea Easyfatt: lo scope
e' deliberatamente piu' stretto.

## Ambito funzionale

Nell'ordine di priorita' deciso dal committente:

1. **Magazzino**: movimenti (carico, scarico, resi, rettifiche da inventario),
   carichi da fatture e bolle fornitori, giacenze, valorizzazione.
2. **Vendita al banco** con collegamento al **registratore telematico (RT)**.
3. **Prima nota cassa** semplice (non partita doppia).
4. **Statistiche e KPI**: e' un requisito di prima classe, non un extra.
5. **Fattura elettronica**: solo **generazione dell'XML**. L'invio allo SdI si
   aggancera' a un servizio terzo da scegliere. **Nessuna conservazione
   sostitutiva**, ne' ora ne' in futuro: resta in capo al cliente finale e va
   messo per iscritto nelle condizioni d'uso.

Fuori ambito per ora: ciclo attivo completo (preventivi, ordini, DDT),
provvigioni agenti, e-commerce, multi-azienda.

## Stack

| Pezzo | Scelta |
| --- | --- |
| Linguaggio | C# su .NET (LTS) |
| Interfaccia | **WinForms**, non WPF |
| Database | **PostgreSQL** |
| Accesso dati | EF Core con migrazioni |
| Test | xUnit |
| Grafici KPI | ScottPlot o LiveCharts2 |

Vincolo architetturale non negoziabile: **la logica di dominio sta in una
libreria separata dalla UI**. Niente calcoli, niente SQL e niente chiamate al
registratore telematico dentro il codice delle form.

L'emissione del documento commerciale sta dietro un'unica interfaccia
(`IFiscalDevice`), cosi' si possono aggiungere marche di RT diverse e, in
futuro, la soluzione software certificata (architettura PEM/PEL) senza
toccare il resto.

## Chi e' il committente, e come lavorare con lui

Viene da **FileMaker**. Conosce percio' i concetti di tabella, campo, record,
relazione, calcolo, script e layout. **Non conosce**: C#, SQL scritto a mano,
programmazione a oggetti, Git, i test automatici. Non ha esperienza recente di
VB6 ne' di Access: non dare per scontato nulla di questo.

Ha scelto esplicitamente di **imparare mentre il prodotto viene costruito**.
L'insegnamento e' parte della commessa, non un extra.

**Il suo obiettivo dichiarato e' diventare un programmatore professionista**,
non "saper mantenere il prodotto". Questo cambia il metodo: non basta
scrivere codice leggibile e spiegarlo, **deve scrivere lui**. Vedi
`docs/00-percorso/README.md`, sezione "Chi scrive il codice", per il rapporto
per fase:

- **fase A** (moduli 0-5): scrivo io, lui legge e spiega;
- **fase B** (moduli 6-9): si scrive a meta'. Lui prende i pezzi dove un
  errore non costa (anagrafiche, maschere, report, importazioni), io quelli
  dove costa caro (XML fiscale, driver RT, concorrenza sui numeratori). Ogni
  cosa che scrive **passa da una revisione** puntuale, con gravita'
  crescente;
- **fase C** (moduli 10+): scrive lui, io faccio il revisore e l'avvocato del
  diavolo.

Non proporre di scrivere io un pezzo che tocca a lui per andare piu' veloce:
se serve consegnare, lo dice lui e si sposta l'ago temporaneamente.

Regole di lavoro, da rispettare sempre:

- **In italiano**, codice commentato in italiano dove la ragione non e' ovvia.
- **Mai un costrutto nuovo senza spiegarlo al primo uso**, sul posto, non con
  un rimando.
- **Usare analogie con FileMaker** per introdurre i concetti nuovi: vedi
  `docs/00-percorso/glossario.md`.
- **Fette verticali piccole e complete**, che lui legge interamente prima che
  si vada avanti. Non consegnare moduli grandi da leggere in blocco.
- **Test automatici su ogni calcolo**: servono al prodotto e gli fanno da
  maestro, perche' gli danno un riscontro immediato senza dover aspettare me.
- **Non presumere conoscenze: chiedere.** Questo errore e' gia' stato
  commesso una volta all'inizio del progetto.
- Se dice che non ha capito, si torna indietro: non si va avanti sopra una
  lacuna.
- Niente scorciatoie "intanto funziona": il software gestisce dati fiscali di
  terzi e viene venduto.

## Dove sta cosa

| Percorso | Contenuto |
| --- | --- |
| `docs/00-percorso/` | Percorso didattico, glossario, lezioni |
| `docs/00-percorso/diario.md` | Cosa e' stato affrontato e cosa resta aperto |
| `docs/manuale/index.html` | **Versione leggibile** del manuale, pubblicata come pagina web |
| `docs/01-scelta-linguaggio/` | Confronto C# / VB.NET che ha portato alla scelta |
| `Sources/` | **Vecchio** esperimento in twinBASIC (tbToolkit), non fa parte del prodotto |

**All'inizio di ogni sessione**: leggere questo file e
`docs/00-percorso/diario.md`, perche' la memoria tra una sessione e l'altra
sta nel repository, non nella conversazione.

**Gli artefatti vanno fatti spuntabili.** Richiesta esplicita del
committente: ogni manuale, lezione o elenco di passi che pubblichiamo deve
avere caselle da spuntare, cosi' si vede a colpo d'occhio dove si e'
arrivati. Le spunte **non** vanno tenute nel codice della pagina (andrebbero
perse a ogni ripubblicazione) ne' nel solo `localStorage`: stanno nella
capacita' `db` dell'artefatto, documento `progresso/manuale`, campo `voci`
come mappa `id -> true/false`, con copia locale nel browser come rete di
sicurezza. Gli identificativi delle caselle sono stabili: `mod-<n>` per i
moduli del percorso, `m0-*` per il modulo 0, `l1-*` per il modulo 1, e cosi'
via. **Non spuntare mai una casella per conto suo** se non ha riportato di
aver fatto quella cosa: si semina solo cio' che ha dichiarato.

**Il committente non legge i file Markdown**: li apre su GitHub dal browser,
oppure legge la pagina web pubblicata. Quindi, quando il contenuto didattico
cambia in modo sostanziale, aggiornare `docs/manuale/index.html` e
**ripubblicarlo** con lo strumento Artifact sullo stesso URL, indicato nel
diario. I `.md` restano la fonte: la pagina e' la loro versione leggibile.

## Note di dominio da non dimenticare

- L'imposta si ricava **per differenza** dal totale lordo, mai ricalcolata a
  parte: evita lo scarto di un centesimo che il registratore telematico
  rifiuta.
- L'arrotondamento e' **commerciale** (`MidpointRounding.AwayFromZero`): il
  default di `Math.Round` in .NET e' "al pari" e produce totali sbagliati di
  un centesimo, in silenzio.
- La vendita si **persiste prima** di parlare con l'RT, e all'avvio le vendite
  rimaste in sospeso si riconciliano **interrogando l'RT**, non indovinando.
- La **chiusura di cassa** deve confrontare il totale dell'RT con il totale
  delle vendite registrate e **segnalare** la differenza.
- Serve la **ripartizione per forma di pagamento** su ogni scontrino: dal
  1 gennaio 2026 c'e' l'obbligo di collegamento RT-POS e i totali devono
  corrispondere.
- Il **codice lotteria** e' un campo opzionale sulla vendita, da passare
  all'RT (lotteria risultata ancora attiva nel 2026).
- I **movimenti di magazzino** sono append-only: la giacenza e' una somma
  ricalcolabile, non un contatore che si modifica.
