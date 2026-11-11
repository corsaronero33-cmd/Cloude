# Etichette

Programma per etichette alimentari scritto in **twinBASIC**.

- Etichetta 60 × 120 mm.
- Stampa attraverso il driver Windows della stampante (Astra TT o qualsiasi altra).
- Archivio SQLite con prodotti, impostazioni e registro delle stampe.
- Codice EAN-13 disegnato dal programma, senza font barcode né componenti esterni.

Il cliente riceve un solo file EXE: non deve comprare licenze, non deve
installare runtime e non deve installare nessun database.

## Perché twinBASIC va bene per questo lavoro

| Esigenza | Come la copre questo progetto |
| --- | --- |
| Nessuna licenza per il cliente | L'EXE compilato non porta royalty. La Community Edition è gratuita anche per uso commerciale. Il suo unico limite che conta qui è la schermata iniziale di 5 secondi negli EXE a **64 bit**, e questo programma si compila a **32 bit**. |
| Database integrato | Si usa `winsqlite3.dll`, la copia di SQLite che Windows 10 e 11 hanno già in `System32`. Non ci sono DLL da distribuire. |
| Basso costo | 0 € per sviluppare e distribuire a 32 bit. La licenza Professional serve solo per i 64 bit senza schermata iniziale e per l'ottimizzazione LLVM; qui non servono. |
| Linguaggio familiare | La sintassi è quella di VB6/VBA, in più ci sono `Return`, `+=` e i tipi `LongPtr` e `LongLong`. |

Prima di vendere, conviene verificare i termini aggiornati della licenza su
twinbasic.com. Le condizioni sono cambiate nel tempo.

Ci sono anche dei limiti, da conoscere prima di partire:

- twinBASIC è ancora in beta. Qualche controllo o qualche funzione VB6 può
  comportarsi diversamente da VB6. Per questo il progetto evita le parti meno
  mature: niente oggetto `Printer`, niente ActiveX, niente report designer.
  Stampa e database passano direttamente dalle API di Windows.
- Funziona solo su Windows. Per un laboratorio alimentare di solito non è un
  problema.
- Non c'è un report designer stile FileMaker: il layout dell'etichetta è
  scritto nel codice (`StampanteEtichette.Layout`). In cambio è preciso al
  punto di stampa.

## Struttura

| File | Ruolo |
| --- | --- |
| `Sources/Ean13.twin` | Cifra di controllo, validazione e codifica dei 95 moduli EAN-13 |
| `Sources/Allergeni.twin`, `TextRun.twin` | Allergeni scritti tra `*asterischi*` → tratti in grassetto |
| `Sources/Tracciabilita.twin` | Lotto (`L` + anno + giorno, es. `L26315`), scadenza, diciture, date gg/mm/aaaa |
| `Sources/SqliteApi.twin` | `Declare` verso `winsqlite3.dll` |
| `Sources/SqliteDb.twin`, `SqliteStatement.twin` | Connessione, query con parametri `?`, transazioni |
| `Sources/Prodotto.twin` | Anagrafica di un prodotto e sua validazione |
| `Sources/Archivio.twin` | Schema del database, prodotti, impostazioni, registro stampe, importazione CSV |
| `Sources/Csv.twin` | Lettura dei CSV di Excel (punto e virgola, UTF-8 o Windows-1252) |
| `Sources/DatiEtichetta.twin` | I testi finali di una etichetta |
| `Sources/StampanteEtichette.twin` | Impaginazione e disegno GDI, codice a barre al punto di stampa |
| `Sources/Stampanti.twin` | Elenco delle stampanti installate e stampante predefinita |
| `Sources/Etichettatura.twin` | Casi d'uso: apri archivio, componi, stampa e registra |
| `Sources/EtichetteTests.twin` | Test di tutta la logica, database compreso (in memoria) |
| `Sources/Avvio.twin` | `Sub Main` per eseguire i test e stampare un'etichetta di prova |
| `Form/frmStampa.twin.txt` | Codice della maschera di stampa, da incollare (vedi sotto) |
| `prodotti.csv` | Esempio di listino da importare |

Il progetto usa anche tre file di `../Sources` (tbToolkit): `StringUtils.twin`,
`TestRunner.twin` e `ConsoleOut.twin`. Le loro suite di test girano insieme a
quelle delle etichette.

## Primo avvio nell'IDE: i test

1. In twinBASIC creare un progetto **Standard EXE** e impostare la piattaforma
   **Win32**.
2. Con **Add existing file** aggiungere tutti i file di `Etichette/Sources/`.
   Aggiungere poi `StringUtils.twin`, `TestRunner.twin`, `ConsoleOut.twin` e
   `StringUtilsTests.twin` da `Sources/`, ma **non** `App.twin`.
3. Impostare `Avvio` come *Startup Object* e premere F5.

Nella finestra Debug compaiono l'esito dei test, la versione di SQLite
caricata e la cartella dei dati.

Per vedere un'etichetta senza consumare carta, aggiungere nelle proprietà
del progetto questo argomento della riga di comando:

```
/prova Microsoft Print to PDF
```

## La maschera

Il file di una maschera twinBASIC lo genera l'IDE, quindi non è nel
repository. In `Form/frmStampa.twin.txt` ci sono il codice e l'elenco dei
controlli da disegnare, con i nomi esatti. Ci vogliono pochi minuti:

1. Aggiungere una maschera `frmStampa` e disegnare i nove controlli elencati
   in testa al file.
2. Incollare il codice nella classe della maschera.
3. Impostare `frmStampa` come *Startup Object*.

La maschera permette di:

- cercare un prodotto per nome o per codice, oppure leggerne l'EAN con un
  lettore di codici a barre;
- vedere in chiaro l'anteprima dei testi, gli allergeni, la scadenza e il
  lotto;
- scegliere data di produzione e numero di copie, e stampare;
- scegliere la stampante e scrivere i dati del produttore;
- importare il listino da CSV.

## Il listino: 65 prodotti da Excel

Si prepara il foglio con queste intestazioni, in qualsiasi ordine:

```
codice;denominazione;ingredienti;peso_netto;conservazione;giorni_scadenza;tipo_scadenza;ean
```

Poi lo si salva come **CSV (delimitato dal separatore di elenco)** oppure
come **CSV UTF-8**. Il programma riconosce da solo la codifica.

- `ingredienti`: gli allergeni vanno tra asterischi, per esempio
  `Farina di *frumento*, *uova*, zucchero`. In stampa escono in grassetto,
  come chiede l'art. 21 del Reg. UE 1169/2011.
- `tipo_scadenza`: `entro` oppure `preferibilmente` (anche `TMC`).
- `ean`: 13 cifre. Se se ne scrivono 12, la cifra di controllo la calcola il
  programma. Se il campo è vuoto, il prodotto non ha codice a barre.
- `codice`: il codice interno. Se si reimporta un codice già presente, il
  prodotto viene aggiornato e non duplicato.

L'importazione è tutto-o-niente: al primo errore non viene salvato nulla e
il messaggio indica la riga del file.

Se mettete `prodotti.csv` accanto all'EXE, al primo avvio viene importato in
automatico. Così si consegna un'installazione già pronta.

I codici EAN nel file di esempio sono inventati. I codici veri il laboratorio
li ottiene da GS1 Italy.

## Stampante: impostazioni del driver

Il programma disegna nelle coordinate dell'etichetta. Il formato della carta
lo decide il driver, quindi sul PC del cliente, una volta sola:

1. Nelle *Preferenze stampa* della Astra TT creare un formato **60 × 120 mm**
   (larghezza × altezza, orientamento verticale). Impostare il tipo di
   supporto: etichette con gap o con tacca nera, come il rotolo usato.
2. Impostare la modalità **trasferimento termico** e la velocità e la
   temperatura consigliate per il nastro.
3. Se la stampa risulta spostata di qualche millimetro, correggere nella
   tabella `impostazioni` le chiavi `etichetta.spostamento_x_mm` e
   `etichetta.spostamento_y_mm`. Valgono anche i decimali, con il punto, per
   esempio `0.5`.

Le misure dell'etichetta sono a loro volta impostazioni:
`etichetta.larghezza_mm`, `etichetta.altezza_mm`, `etichetta.margine_mm` e
`etichetta.altezza_barre_mm`. Per un altro formato non serve ricompilare.

### Codice a barre

Ogni modulo è largo un numero intero di punti della stampante: 3 punti a
203 dpi (0,375 mm) e 4 punti a 300 dpi (0,339 mm). Il simbolo è sempre nitido
e resta dentro le dimensioni ammesse dallo standard. Il codice è centrato e
ha le zone di rispetto, di 11 moduli a sinistra e 7 a destra.

### Testo

Nessun testo obbligatorio scende sotto i 7 punti. In Arial corrispondono a
una "x" di circa 1,28 mm, sopra il minimo di 1,2 mm del regolamento. Se gli
ingredienti sono lunghi, il corpo scende da 8 a 7 punti. Se il testo non
entra nemmeno così, la stampa viene rifiutata con un messaggio chiaro
invece di uscire illeggibile.

## Registro stampe

Ogni stampa scrive una riga nella tabella `stampe` con prodotto, lotto, data
di produzione, scadenza, copie, stampante e ora. Denominazione, ingredienti
ed EAN vengono **copiati** al momento della stampa: se in seguito la ricetta
cambia, per ogni lotto resta il testo che c'era sull'etichetta. È la
risposta pronta in caso di controllo o di richiamo.

## Dove stanno i dati

`C:\ProgramData\EtichetteLab\etichette.db`: un solo file. Il backup è una
copia del file, e per spostare il programma su un altro PC basta copiarlo.

## Distribuzione

1. Compilare a **Win32**: la Community Edition non mostra la schermata iniziale.
2. Consegnare `Etichette.exe` (e, se si vuole, `prodotti.csv`) in una
   cartella qualsiasi.

Non c'è altro da installare. Se un giorno servisse una versione di SQLite
più recente di quella di Windows, basta mettere `sqlite3.dll` accanto
all'EXE e cambiare le `Declare` in `SqliteApi.twin`, come spiegato in testa
al file.

## Stato del codice

Il codice è stato scritto senza poterlo compilare: il compilatore twinBASIC
gira solo su Windows. Le tabelle EAN-13 e i valori attesi dei test sono stati
verificati con una libreria indipendente. Al primo F5 nell'IDE possono però
emergere piccoli errori di sintassi o di compilazione, da sistemare caso per
caso. Le parti da verificare per prime, in ordine:

1. i test (F5 con `Avvio`);
2. l'etichetta di prova su "Microsoft Print to PDF";
3. l'etichetta vera sulla Astra TT, da passare con il lettore di codici a
   barre.
