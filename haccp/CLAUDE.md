# Convenzioni del progetto HACCP

Regole per chiunque (persona o assistente) lavori dentro `haccp/`.
Valgono in aggiunta al `CLAUDE.md` alla radice del repository.

## Ambiente di lavoro

| | |
|---|---|
| Programma | **Claris FileMaker Pro 22** (2025) |
| Lingua dell'interfaccia | **italiano** |
| Sistema | Windows |
| File | `Haccp.fmp12`, un file unico (vedi `03-CONVENZIONI.md`) |
| Tema dei formati | **`HACCP`**, copia di **Blu Apex** con l'intestazione `#1B3A5C` |

Conseguenze pratiche, tutte e tre importanti:

**1. I percorsi di menu si scrivono in italiano.**
`File > Gestisci > Database`, non `File > Manage > Database`. Idem per
`Strumenti > Visualizzatore dati`, `Record > Sostituisci contenuto campo`,
`Opzioni > Immissione automatica`.

**2. I parametri delle funzioni personalizzate hanno la `p` davanti.**
In italiano molti nomi comuni sono **funzioni di FileMaker** e non si possono
usare come nomi di parametro: `Codice`, `Data`, `Giorno`, `Mese`, `Anno`,
`Posizione`, `Lunghezza`, `Filtro`, `Sostituisci`, `Medio`, `Sinistra`,
`Destra`, `Se`, `Car`.

Quindi si scrive `pCodice`, `pData`, `pValore`. Sempre, anche quando il nome
sembrerebbe libero: costa una lettera e toglie una categoria intera di
errori.

Quando si corregge il nome di un parametro va cambiato **anche dentro il
corpo del calcolo**, non solo nell'elenco dei parametri: FileMaker non lo
aggiorna da solo.

**3. Le formule si scrivono con i nomi delle funzioni in inglese.**
`Case`, `Let`, `Middle`, `Get ( CurrentDate )`. FileMaker li accetta anche
nella versione italiana. Restano cosi' in tutta la documentazione: sono
quelli che si trovano scritti ovunque.

## I colori non si dettano

Il tema e' **`Haccp`**, derivato dal tema di serie **Apex blu**: campi,
etichette e pulsanti li veste lui. Nelle istruzioni di costruzione si danno
le **misure** (X, Y, larghezza, altezza) e la colonna Aspetto dice
*lascia com'e'*.

Si scrive un codice colore **solo** dove il tema non arriva, e sono tre casi:

- il riempimento dell'**intestazione**, `#1B3A5C`, che e' l'unica modifica
  nostra ad Apex blu;
- il **testo bianco** sopra quel fondo scuro, perche' il tema lo farebbe
  scuro;
- il riquadro **bianco** che stacca i campi dallo sfondo del corpo.

Elencare hex dove il tema gia' provvede fa perdere tempo e, alla prima
maschera dimenticata, produce due grigi diversi nello stesso file.

## Dove sta cosa

| | |
|---|---|
| Quello che e' aperto | **`DA-FARE.md`**, e solo li'. Chiusa una voce, si toglie da li' |
| Le misure dei formati | **`09-MASCHERE.md`**, sezione *Misure standard* |
| Le schede di lavoro | `guide/`, numerate nell'ordine in cui si costruiscono |
| I collaudi | `archivio/`, uno per giro di verifica |

Non si aprono documenti nuovi in radice: una cosa nuova o entra in uno dei
nove riferimenti numerati, o e' una scheda in `guide/`, o e' un collaudo in
`archivio/`.

## Le misure stanno in un posto solo

Coordinate e altezze dei formati: **`09-MASCHERE.md`, sezione *Misure
standard***. Quella tabella e' rilevata dal file reale, non proposta a
tavolino.

Quando si scrive una guida per una maschera nuova, le misure si **copiano da
li'**, non si reinventano. Se costruendo emerge che una misura non va, si
cambia nel file e poi si aggiorna quella tabella: **il file vince sempre sulla
guida**, e la guida va allineata prima di passare alla maschera successiva.

Le schede in `guide/` restano per il metodo e per il perche' delle scelte.
Le loro tabelle di coordinate sono storia.

## Come si consegna il lavoro

Il `.fmp12` e' binario e **non sta nel repository**: qui stanno la specifica,
i pezzi da incollare e le procedure di montaggio.

Ad ogni traguardo il file viene esportato (`Strumenti > Rapporto struttura
database`, oppure `File > Salva con nome > XML`) e archiviato in
`haccp/ddr/vNNN/`. E' l'unico modo per avere una storia confrontabile di uno
schema che vive dentro un file binario, e per verificare il lavoro fatto
invece di fidarsi.

## Una maschera per volta, sempre lo stesso formato

Le schede di lavoro in `guide/` hanno tutte la stessa forma, e non si cambia:

1. **Una maschera sola per scheda.** Mai due, mai quattro. Anche quando la
   procedura e' identica, la scheda successiva si prepara **dopo** che la
   precedente e' collaudata.
2. **Il disegno in scala** della maschera finita, con le misure.
3. **Fasi numerate.** Ogni fase e' una tabella *dove sei / cosa fai*, oppure
   un elenco numerato: percorsi di menu per esteso, un clic per riga.
4. Le tabelle di coordinate **dentro** la fase che le usa, mai da sole.
5. Ogni scelta non ovvia ha **una riga di perche'**, subito sotto.
6. **Un collaudo numerato** in fondo, con scritto per ogni prova cosa deve
   succedere e quale fase rifare se non succede.

Un elenco di dati senza i passi non e' una scheda di lavoro: e' una tabella,
e va dentro una fase o in appendice.

## Come si scrivono le istruzioni operative

Chi lavora al file sta davanti a FileMaker, non sta leggendo un manuale.
Le istruzioni vanno scritte come **tabella di marcia**:

- lavori numerati, uno per volta, in ordine di dipendenza;
- per ogni lavoro: il percorso di menu, i clic da fare, una casella da
  spuntare;
- una riga sola sul perche', non un capitolo;
- dove ci sarebbero due strade, se ne indica **una**.

I documenti numerati (`01-`, `02-`, ...) restano come riferimento e come
registro delle decisioni. Le liste di lavoro si pubblicano come pagina web,
perche' si tengono aperte di fianco a FileMaker e le spunte si salvano.

## Leggere un DDR esportato

L'esportazione `Salva come XML` porta i **formati per intero** — ogni oggetto
con le sue coordinate — ma **non il corpo degli script** e **non le spunte
della Ricerca rapida**. Quelle due cose si verificano solo dal comportamento,
con le prove di collaudo.

Quando si cerca un valore dentro l'XML si guarda **tutto il sottoalbero**, mai
i soli figli diretti. Esempio vero: il parametro di un trigger non sta sotto
`<ScriptTrigger>` ma un livello piu' in fondo, dentro `<ScriptReference>`.
Cercandolo al primo livello risulta mancante, e si segnala un errore che non
c'e'.

## Lingua

Come alla radice: nomi di tabelle, campi, occorrenze, funzioni e script in
**italiano**, e **niente lettere accentate** negli identificatori (si scrive
`Quantita`, `NonConformita`, `Modalita`). Le accentate vanno bene solo nelle
etichette a video e nelle stampe, dove le legge una persona.

## Dove i limiti critici non vanno mai

Dentro una formula. Arrivano da `PuntiControllo` o da `Prodotti`, passati come
parametri. **Se in un calcolo compare il numero 75, e' un errore**: significa
che un locale con un limite diverso diventerebbe una versione diversa del
programma.
