# Convenzioni del progetto HACCP

Regole per chiunque (persona o assistente) lavori dentro `haccp/`.
Valgono in aggiunta al `CLAUDE.md` alla radice del repository.

## Ambiente di lavoro

| | |
|---|---|
| Programma | **Claris FileMaker Pro 22** (2025) |
| Lingua dell'interfaccia | **italiano** |
| Sistema | Windows |
| File | `Haccp.fmp12`, un file unico (vedi `03-CONVENZIONI-FILEMAKER.md`) |

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

## Come si consegna il lavoro

Il `.fmp12` e' binario e **non sta nel repository**: qui stanno la specifica,
i pezzi da incollare e le procedure di montaggio.

Ad ogni traguardo il file viene esportato (`Strumenti > Rapporto struttura
database`, oppure `File > Salva con nome > XML`) e archiviato in
`haccp/ddr/vNNN/`. E' l'unico modo per avere una storia confrontabile di uno
schema che vive dentro un file binario, e per verificare il lavoro fatto
invece di fidarsi.

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
