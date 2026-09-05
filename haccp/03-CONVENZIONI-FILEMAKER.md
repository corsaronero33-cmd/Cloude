# Convenzioni di costruzione del file FileMaker

Regole per costruire il file in modo che fra sei mesi sia ancora modificabile.
Stesso spirito del `CLAUDE.md` alla radice del repository: leggibile dall'alto
in basso, niente strutture ingegnose.

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
