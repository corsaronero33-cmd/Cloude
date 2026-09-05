# Prima sessione davanti a FileMaker

Obiettivo: alla fine di questa sessione esiste `Haccp.fmp12` con **21 tabelle,
tutti i campi, e dentro l'analisi HACCP gia' compilata** (33 punti di
controllo, 28 voci del piano di sanificazione, i 14 allergeni, i parametri).

Tempo stimato: **una serata.** Quasi tutto e' importazione, non digitazione.

---

## Perche' si importa invece di digitare

FileMaker crea una tabella nuova, con tutti i suoi campi, importando un file
di testo la cui prima riga contiene i nomi dei campi. Sono 269 campi: digitarli
a mano sono ore, importarli sono minuti.

I file stanno in `haccp/import/`:

- `import/schema/` — 15 file con la sola intestazione (piu' una riga di
  esempio da cancellare). Creano le tabelle vuote.
- `import/dati/` — 6 file **gia' pieni**. Creano la tabella e ci mettono
  dentro il contenuto: e' qui che sta il lavoro di analisi.

Sono file **separati da tabulazione**, codifica **UTF-8**. Non aprirli con
Excel prima di importarli: Excel ci mette del suo e li rovina.

---

## Passo 1 — Creare il file

1. FileMaker Pro, `File` -> `Nuovo`.
2. Salvalo come **`Haccp.fmp12`** in una cartella di lavoro tua, per esempio
   `C:\Progetti\Haccp`. **Non** e' ancora il file del cliente: e' la copia di
   sviluppo.
3. FileMaker crea da solo una tabella con lo stesso nome del file e un campo
   di esempio. La cancelleremo alla fine, quando le altre esistono (FileMaker
   non lascia un file senza tabelle).

## Passo 2 — Importare le tabelle vuote

Per **ognuno** dei 15 file in `import/schema/`:

1. `File` -> `Importa record` -> `File`
2. Scegli il `.tab`. Se il tipo di file non compare, imposta il filtro su
   tutti i file.
3. Nella finestra di importazione:
   - **Destinazione: `Nuova tabella`**
   - spunta **"Il primo record contiene i nomi dei campi"**
   - codifica: **UTF-8**
4. Importa.

FileMaker crea la tabella con il nome del file e tutti i campi **di tipo
Testo**. I tipi si sistemano al passo 4.

Fatti tutti e 15, vai in `Record` -> `Mostra tutti i record` su ciascuna e
**cancella la riga `ESEMPIO-DA-CANCELLARE`**. Serviva solo a far capire a
FileMaker che c'erano dei dati.

## Passo 3 — Importare le tabelle con dentro l'analisi

Stessa identica procedura per i 6 file di `import/dati/`. Qui **non** si
cancella niente: i record sono il contenuto buono.

| File | Cosa contiene |
|---|---|
| `Allergeni.tab` | i 14 allergeni dell'Allegato II |
| `TipiAttivita.tab` | 7 profili di attivita' |
| `ModelliReparto.tab` | 15 reparti tipici di un ristorante con cucina |
| `ModelliPuntoControllo.tab` | **33 punti di controllo** con limiti critici, frequenze e azioni correttive |
| `ModelliPianoSanificazione.tab` | 28 voci di piano di sanificazione |
| `Parametri.tab` | 20 parametri di configurazione |

`ModelliPuntoControllo` e' il file che vale il progetto: e' l'analisi HACCP di
un ristorante con cucina, gia' scritta. Leggilo prima di andare avanti, e
confrontalo con il manuale di autocontrollo del cliente quando te lo daranno.

## Passo 4 — Sistemare i tipi dei campi

`File` -> `Gestisci` -> `Database` -> scheda `Campi`.

Tutti i campi sono nati **Testo**. Vanno cambiati solo quelli elencati qui
sotto: tutto il resto resta Testo, ed e' giusto cosi'.

> Regola generale: nel dubbio, **Testo**. Un codice fiscale, un CAP o una
> partita IVA sono testo, non numeri: se li fai numerici perdi gli zeri
> iniziali.

**`Attrezzature`**
- `AnnoInstallazione` -> Numero
- `TemperaturaMin` -> Numero
- `TemperaturaMax` -> Numero
- `DataUltimaManutenzione` -> Data
- `DataProssimaManutenzione` -> Data
- `CreatoIl` -> Data e ora
- `ModificatoIl` -> Data e ora

**`Fornitori`**
- `DataQualifica` -> Data
- `DataProssimaVerifica` -> Data
- `CreatoIl` -> Data e ora
- `ModificatoIl` -> Data e ora

**`Impresa`**
- `DataScia` -> Data
- `CreatoIl` -> Data e ora
- `ModificatoIl` -> Data e ora

**`Lotti`**
- `DataIngresso` -> Data
- `DataScadenza` -> Data
- `QuantitaIniziale` -> Numero
- `QuantitaResidua` -> Numero
- `DataApertura` -> Data
- `ScadenzaDopoApertura` -> Data
- `CreatoIl` -> Data e ora
- `ModificatoIl` -> Data e ora

**`NonConformita`**
- `Data` -> Data
- `DataChiusura` -> Data
- `CreatoIl` -> Data e ora
- `ModificatoIl` -> Data e ora

**`Operatori`**
- `DataAssunzione` -> Data
- `DataCessazione` -> Data
- `CreatoIl` -> Data e ora
- `ModificatoIl` -> Data e ora

**`PianoSanificazione`**
- `Ordine` -> Numero
- `CreatoIl` -> Data e ora
- `ModificatoIl` -> Data e ora

**`Prodotti`**
- `TemperaturaMin` -> Numero
- `TemperaturaMax` -> Numero
- `GiorniValiditaDopoApertura` -> Numero
- `CreatoIl` -> Data e ora
- `ModificatoIl` -> Data e ora

**`PuntiControllo`**
- `LimiteMin` -> Numero
- `LimiteMax` -> Numero
- `OrarioAtteso1` -> Ora
- `OrarioAtteso2` -> Ora
- `Ordine` -> Numero
- `CreatoIl` -> Data e ora
- `ModificatoIl` -> Data e ora

**`Reparti`**
- `Ordine` -> Numero
- `CreatoIl` -> Data e ora
- `ModificatoIl` -> Data e ora

**`Ricevimenti`**
- `DataDdt` -> Data
- `DataOraRicevimento` -> Data e ora
- `TemperaturaVano` -> Numero
- `CreatoIl` -> Data e ora
- `ModificatoIl` -> Data e ora

**`RigheRicevimento`**
- `Quantita` -> Numero
- `DataScadenza` -> Data
- `TemperaturaRilevata` -> Numero
- `CreatoIl` -> Data e ora
- `ModificatoIl` -> Data e ora

**`Rilevazioni`**
- `DataOra` -> Data e ora
- `Valore` -> Numero
- `CreatoIl` -> Data e ora
- `ModificatoIl` -> Data e ora

**`Sanificazioni`**
- `Data` -> Data
- `CreatoIl` -> Data e ora
- `ModificatoIl` -> Data e ora

**`Utilizzi`**
- `QuantitaImpiegata` -> Numero
- `DataOra` -> Data e ora
- `CreatoIl` -> Data e ora
- `ModificatoIl` -> Data e ora

Nelle tabelle importate da `import/dati/` valgono le stesse regole: `Numero`
per `Ordine`, `Numero`, `LimiteMin`, `LimiteMax`, e `Ora` per `OrarioAtteso1`
e `OrarioAtteso2`.

## Passo 5 — I campi di sistema

Su **ogni** tabella, apri le opzioni (`Opzioni...` accanto al campo) e imposta:

| Campo | Immissione automatica | Altro |
|---|---|---|
| `Id` | Valore calcolato: `Get ( UUID )`, **togliere** la spunta "Non sostituire il valore esistente" al primo giro, rimetterla dopo | Convalida: univoco, non vuoto. Vietare la modifica |
| `CreatoIl` | Data e ora di creazione | Vietare la modifica |
| `CreatoDa` | Nome account di creazione | Vietare la modifica |
| `ModificatoIl` | Data e ora di modifica | Vietare la modifica |
| `ModificatoDa` | Nome account di modifica | Vietare la modifica |

"Vietare la modifica" e' la spunta **"Non consentire la modifica del valore
durante l'immissione dati"**. Non e' pignoleria: e' il requisito di
inalterabilita' del registro davanti a un'ispezione.

### Popolare gli Id dei record gia' importati

I record delle tabelle modello sono entrati **prima** che `Id` avesse
l'immissione automatica, quindi hanno il campo vuoto. Per ognuna delle 6
tabelle di `import/dati/`:

1. vai su un formulario di quella tabella, `Record` -> `Mostra tutti`;
2. clicca nel campo `Id`;
3. `Record` -> `Sostituisci contenuto campo`;
4. scegli **"Sostituisci con risultato calcolato"** e scrivi `Get ( UUID )`.

Un colpo solo per tabella. Poi rimetti la spunta "Non sostituire il valore
esistente" sull'immissione automatica di `Id`.

## Passo 6 — I campi contenitore

L'importazione non puo' creare campi contenitore: vanno aggiunti a mano.
Sono nove.

| Tabella | Campo |
|---|---|
| `Impresa` | `Logo`, `ManualeAutocontrollo` |
| `Fornitori` | `Documenti` |
| `Operatori` | `Firma` |
| `Ricevimenti` | `FotoDdt`, `Firma` |
| `RigheRicevimento` | `FotoEtichetta` |
| `Rilevazioni` | `Foto`, `Firma` |
| `NonConformita` | `Foto` |
| `Sanificazioni` | `Firma` |

Per ognuno: tipo **Contenitore**, poi `Opzioni` -> scheda `Archiviazione` ->
**"Archivia i dati del contenitore all'esterno"**, cartella **sicura**.

Con l'archiviazione interna il file cresce di gigabyte e i backup diventano
impraticabili. E' l'errore piu' comune e il piu' costoso da correggere dopo.

## Passo 7 — Chiudere

1. Cancella la tabella iniziale creata da FileMaker con il nome del file.
2. `File` -> `Gestisci` -> `Database` -> scheda `Relazioni`: per ora lascia
   stare, le relazioni le facciamo nella sessione successiva secondo lo schema
   a ancora e boe.
3. Esporta il rapporto struttura: `Strumenti` -> `Rapporto struttura
   database`, formato **XML**, e salvalo in `haccp/ddr/v001/`. E' la
   fotografia dello schema appena costruito, ed e' l'unico modo per avere una
   storia confrontabile di un file binario.

---

## Come dirmi com'e' andata

Se qualcosa non torna, mandami:

- il **messaggio esatto** che vedi;
- in quale passo eri;
- se e' un problema di importazione, quante colonne ti ha trovato FileMaker
  contro quante ne ha il file.

Nota onesta, la stessa del progetto B4J: **questa procedura non l'ho potuta
provare**, perche' FileMaker non gira dove sto io. I file sono costruiti con
attenzione e verificati (colonne coerenti, codifica UTF-8, nessun carattere
accentato), ma alla prima prova puo' saltare fuori un dettaglio della
finestra di importazione diverso da come l'ho descritto. Non e' un guaio: me
lo dici e lo sistemo.

---

## Cosa viene dopo, in ordine

1. **Relazioni** fra le tabelle (gruppi a ancora e boe).
2. **`05-CALCOLI.md`**: esito conforme/non conforme letto dai limiti, semaforo
   scadenze, scadenza dopo apertura, partita IVA, parser GS1-128.
3. **Script di avvio** e caricamento dei parametri in variabili globali.
4. **Prima maschera vera**: ricevimento merci su iPhone, con fotocamera e
   lettura del codice a barre. E' la piu' difficile e la piu' utile: quando
   funziona quella, il progetto e' in discesa.
