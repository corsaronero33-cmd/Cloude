# Convenzioni di costruzione del file FileMaker

Regole per costruire il file in modo che fra sei mesi sia ancora modificabile.
Stesso spirito del `CLAUDE.md` alla radice del repository: leggibile dall'alto
in basso, niente strutture ingegnose.

---

## Decisione: un file unico, non dati/interfaccia separati

Il file e' uno solo: `Haccp.fmp12`. Niente modello a separazione fra file dati
e file interfaccia.

**Perche'.** La separazione nasce per poter spedire una versione nuova
dell'interfaccia a molti clienti senza toccare i loro dati. Qui il file e'
ospitato e il cliente e' uno: in FileMaker un file ospitato **si modifica dal
vivo** (si apre con un account con accesso completo e si cambiano campi,
layout e script mentre il locale lavora). Non esiste un rilascio da spedire,
quindi il vantaggio della separazione non si presenta mai.

I costi invece si presentano tutti:

- le modifiche di schema restano comunque nel file dati, e il consulente HACCP
  chiedera' campi nuovi, non solo layout;
- account e insiemi di privilegi vanno tenuti allineati in due file;
- le relazioni fra file costano prestazioni, e si sente sulla connessione del
  locale in orario di servizio;
- il rapporto struttura si spezza su due file e la diagnosi diventa piu' lenta;
- il backup deve restare coerente su due file invece di uno.

**Se un giorno serve rifare il file e portarci dentro i dati del cliente**, lo
strumento giusto non e' la separazione ma il **FileMaker Data Migration Tool**
(riga di comando: file nuovo vuoto piu' file vecchio pieno, travaso completo
contenitori inclusi). Verificare le condizioni di accesso, che dipendono dal
programma partner Claris.

**Quando riaprire la decisione.** Solo se questa soluzione viene rivenduta ad
altri locali: da due o tre installazioni conviene procurarsi il Data Migration
Tool restando a file unico; oltre la decina la separazione torna sensata,
perche' a quel punto si stanno spedendo versioni per davvero. Il primo cliente
si fa comunque a file unico.

### Cosa tiene aperta la porta

Tre abitudini che costano poco e rendono economico un eventuale cambio:

1. Niente logica nei layout: un pulsante chiama uno script, i calcoli riusati
   stanno in funzioni personalizzate.
2. Occorrenze a ancora e boe con prefisso di gruppo, gia' pronte da ridefinire
   su origine dati esterna.
3. Nessuno stato dell'interfaccia dentro le tabelle vere: campi globali e
   variabili, mai una tabella di appoggio mescolata ai dati.

---

## Versioni e storia dello schema

Il `.fmp12` e' binario e non si confronta fra due versioni. Per avere comunque
una storia leggibile:

- ad ogni traguardo si esporta il **DDR** (Strumenti, Rapporto struttura
  database) in XML e si committa in `haccp/ddr/`;
- si tiene un campo `Versione` nella tabella `Impresa` o in `Impostazioni`,
  aggiornato ad ogni rilascio;
- le modifiche si annotano in `haccp/DIARIO.md`.

Cosi' fra un anno si puo' rispondere a "quando e' comparso questo campo e
perche'" guardando un diff, invece che la memoria.

---

## Ambiente di lavoro

Si sviluppa su una **copia locale**, non direttamente sul file del cliente.
Quando la modifica e' provata, la si ripete sul file ospitato (oppure si
travasa con il Data Migration Tool, se disponibile).

Le modifiche di schema sul file ospitato si fanno **fuori orario di servizio**:
sono operazioni che bloccano brevemente i record e nessuno vuole scoprirlo
mentre arriva la merce.

---

## Nomi

- Tabelle al **plurale**, in italiano: `Fornitori`, `Rilevazioni`, `Lotti`.
- Campi al **singolare**, in italiano, senza prefissi di tipo:
  `DataScadenza`, non `dtDataScadenza`.
- Chiavi: `Id` per la primaria, `Id` + tabella al singolare per le esterne
  (`IdFornitore`).
- **Niente lettere accentate** nei nomi di campi, tabelle, occorrenze,
  script e liste valori: si scrive `Quantita`, `Attivita`, `NonConformita`.
  Le accentate vanno bene nelle etichette a video e nelle stampe, dove le
  legge una persona.
- Script numerati per area, cosi' l'elenco resta ordinato:
  `10 - Ricevimento - Nuovo`, `11 - Ricevimento - Scansiona lotto`,
  `20 - Rilevazioni - Registra`, `90 - Utilita' - Vai a maschera`.

La convenzione della comunita' FileMaker vorrebbe `__pkFornitoreID` e
`_fkFornitoreID`. E' piu' esplicita nel grafico delle relazioni, ma qui
scegliamo la leggibilita': i campi si devono poter leggere ad alta voce.

---

## Grafico delle relazioni

Si usa **ancora e boe** (anchor-buoy): un gruppo di occorrenze per ogni
maschera principale, con l'occorrenza di partenza a sinistra e le collegate
che si diramano a destra. I gruppi non si intrecciano fra loro.

Nomenclatura delle occorrenze: `NomeGruppo|Tabella`, per esempio
`RIC|Fornitori`, `RIC|RigheRicevimento` nel gruppo del ricevimento merci.

Perche' non un grafico unico condiviso: perche' dopo trenta tabelle non lo
capisce piu' nessuno, e ogni modifica a una relazione rischia di rompere una
maschera lontana che non stavi guardando.

---

## Campi di sistema

Ogni tabella ha `Id`, `CreatoIl`, `CreatoDa`, `ModificatoIl`, `ModificatoDa`
come descritto in `02-MODELLO-DATI.md`.

Tutti e cinque vanno impostati con **"Non consentire la modifica del valore
durante l'immissione dati"**. Non e' pignoleria: e' il requisito di
inalterabilita' del registro.

`Id` usa `Get(UUID)` come valore calcolato all'immissione, con la spunta
"Non sostituire il valore esistente".

---

## Contenitori e foto

- Tutti i campi contenitore usano **archiviazione esterna sicura**, non
  interna. Con l'archiviazione interna il file cresce di gigabyte e i backup
  diventano impraticabili.
- Le foto si acquisiscono con `Inserisci da dispositivo [Fotocamera]`
  impostando una **risoluzione ridotta**. Una foto di un DDT a piena
  risoluzione pesa 4 MB e non serve a nessuno: a 1024 px si legge benissimo e
  pesa un ventesimo.
- Ogni contenitore ha accanto un campo testo `NomeFile` se serve ritrovare il
  documento fuori da FileMaker.

---

## Interfaccia: tre famiglie di maschere

| Famiglia | Dispositivo | Uso |
|---|---|---|
| `D_` | desktop | back office: anagrafiche, stampe, configurazione |
| `T_` | iPad | lavoro in cucina, registro completo |
| `F_` | iPhone | registrazione rapida sul posto: temperatura, foto, esito |

Non si prova a far bastare la stessa maschera per tutti e tre. La maschera
iPhone ha **un compito solo per schermata**, pulsanti grandi, nessuna tabella
laterale: la si usa con una mano, spesso con i guanti.

All'apertura, uno script di avvio indirizza alla famiglia giusta leggendo
`Get(Device)` (e in seconda battuta `Get(SystemPlatform)`). I valori esatti
restituiti dalla funzione vanno verificati sul dispositivo reale prima di
fidarsi: si scrive lo script, si esegue una volta su iPhone e su iPad, si
guardano i numeri veri.

---

## Dove sta la logica

- **Niente calcoli di dominio dentro i pulsanti dei layout.** Un pulsante
  chiama uno script, punto.
- Uno script per operazione, con un nome che dice cosa fa.
- I calcoli riutilizzati (validazioni, estrazione dal codice a barre, giorni
  alla scadenza) stanno in **funzioni personalizzate**, cosi' esistono in un
  posto solo.
- I limiti critici **non si scrivono nelle formule**: si leggono da
  `PuntiControllo`. Se in un calcolo compare il numero 75, e' un errore.

---

## Accessi

Quattro insiemi di privilegi:

| Insieme | Puo' |
|---|---|
| `Titolare` | tutto, compresa la configurazione |
| `Responsabile` | registrare, chiudere non conformita', stampare, gestire anagrafiche |
| `Operatore` | registrare rilevazioni, ricevimenti, sanificazioni. **Non** modificare cio' che ha gia' salvato |
| `Ispezione` | sola lettura e stampa, nessuna modifica |

Account **nominali**, uno per persona: senza, il registro non risponde alla
domanda "chi ha scritto questo dato".

L'account `Ispezione` e' un dettaglio che fa impressione in buona fede: si
consegna il tablet all'ispettore senza timore che tocchi qualcosa.

---

## Blocco dei record

Una rilevazione salvata si blocca (`Bloccato = si'`). Da li' in poi:

- l'`Operatore` non la modifica piu';
- il `Responsabile` puo' correggerla, ma la correzione finisce in `Log`.

Non si cancella mai una registrazione: si annulla, con motivo e autore.
Un registro con dei buchi vale meno di un registro con un errore corretto in
modo tracciato.

---

## Stampe

Ogni registro ha la sua stampa PDF per periodo, con in testata i dati
dell'impresa e in calce il totale delle non conformita' del periodo.

Le stampe si preparano **subito**, non alla fine: sono il momento in cui ci si
accorge che a un campo manca un dato. Meglio scoprirlo in fase di disegno che
il giorno dell'ispezione.

---

## Backup

Il file e' ospitato, quindi il backup e' quello del server o del servizio
cloud. Verificare **una volta** che un ripristino funzioni davvero: un backup
mai riprovato non e' un backup.

Le foto in archiviazione esterna stanno accanto al file: il backup deve
prendere anche quelle.
