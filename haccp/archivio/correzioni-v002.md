# Correzioni da fare — lista di lavoro

Sette lavori, in ordine. Fanne uno per volta e spuntalo.
Quando li hai finiti tutti, riesporta il rapporto struttura e mandamelo.

---

# LAVORO 1 — Cambiare il tipo a 49 campi

**Perche':** adesso sono tutti Testo. Un confronto fra numeri su campi Testo
confronta le lettere, e "10" risulta minore di "9". Sulle temperature darebbe
il semaforo sbagliato.

**Dove:** `File` -> `Gestisci` -> `Database` -> scheda **Campi**

**Come si fa, per ogni riga dell'elenco:**

1. in alto, nel menu **Tabella**, scegli la tabella
2. clicca il campo nell'elenco (per prenderne piu' d'uno insieme: Ctrl+clic)
3. in basso, nel menu **Tipo**, scegli il tipo nuovo
4. premi **Cambia**
5. FileMaker chiede conferma: rispondi di si'

I campi elencati insieme sulla stessa riga vanno **tutti nello stesso tipo**,
quindi puoi selezionarli insieme e cambiarli in un colpo solo.

Tutti gli altri campi **restano Testo**: non toccarli.

## L'elenco


**Allergeni**  (1 campi)
- Numero  ->  **Numero**

**Attrezzature**  (5 campi)
- AnnoInstallazione,  TemperaturaMin,  TemperaturaMax  ->  **Numero**
- DataUltimaManutenzione,  DataProssimaManutenzione  ->  **Data**

**Fornitori**  (2 campi)
- DataQualifica,  DataProssimaVerifica  ->  **Data**

**Impresa**  (1 campi)
- DataScia  ->  **Data**

**Lotti**  (6 campi)
- QuantitaIniziale,  QuantitaResidua  ->  **Numero**
- DataIngresso,  DataScadenza,  DataApertura,  ScadenzaDopoApertura  ->  **Data**

**ModelliPianoSanificazione**  (1 campi)
- Ordine  ->  **Numero**

**ModelliPuntoControllo**  (5 campi)
- LimiteMin,  LimiteMax,  Ordine  ->  **Numero**
- OrarioAtteso1,  OrarioAtteso2  ->  **Ora**

**ModelliReparto**  (1 campi)
- Ordine  ->  **Numero**

**NonConformita**  (2 campi)
- Data,  DataChiusura  ->  **Data**

**Operatori**  (2 campi)
- DataAssunzione,  DataCessazione  ->  **Data**

**Parametri**  (1 campi)
- Valore  ->  **Numero**

**PianoSanificazione**  (1 campi)
- Ordine  ->  **Numero**

**Prodotti**  (3 campi)
- TemperaturaMin,  TemperaturaMax,  GiorniValiditaDopoApertura  ->  **Numero**

**PuntiControllo**  (5 campi)
- LimiteMin,  LimiteMax,  Ordine  ->  **Numero**
- OrarioAtteso1,  OrarioAtteso2  ->  **Ora**

**Reparti**  (1 campi)
- Ordine  ->  **Numero**

**Ricevimenti**  (3 campi)
- TemperaturaVano  ->  **Numero**
- DataDdt  ->  **Data**
- DataOraRicevimento  ->  **Data e ora**

**RigheRicevimento**  (3 campi)
- Quantita,  TemperaturaRilevata  ->  **Numero**
- DataScadenza  ->  **Data**

**Rilevazioni**  (2 campi)
- Valore  ->  **Numero**
- DataOra  ->  **Data e ora**

**Sanificazioni**  (1 campi)
- Data  ->  **Data**

**TipiAttivita**  (1 campi)
- Ordine  ->  **Numero**

**Utilizzi**  (2 campi)
- QuantitaImpiegata  ->  **Numero**
- DataOra  ->  **Data e ora**

**Totale: 49 campi.**

- [ ] Lavoro 1 fatto

---

# LAVORO 2 — Sistemare NomeCompleto

**Perche':** il campo unisce due testi ma e' impostato per restituire un
numero, quindi resta vuoto.

**Dove:** `Gestisci` -> `Database` -> **Campi** -> tabella `Operatori`

1. doppio clic sul campo **NomeCompleto**: si apre la finestra del calcolo
2. in basso c'e' **Risultato del calcolo**: cambialo da `Numero` a **`Testo`**
3. gia' che ci sei, cambia la formula da

   `Nome & " " & Cognome`

   a

   `Cognome & " " & Nome`

   (cosi' gli elenchi escono in ordine di cognome)
4. `OK`, poi `Cambia`

- [ ] Lavoro 2 fatto

---

# LAVORO 3 — Correggere ATT|PuntiControllo

**Perche':** quell'occorrenza punta alla tabella `ModelliPuntoControllo`
invece che a `PuntiControllo`. Sono due tabelle diverse. E' per questo che ti
e' toccato inventare un campo per far funzionare la relazione.

**Dove:** `Gestisci` -> `Database` -> scheda **Relazioni**

1. trova il riquadro **`ATT|PuntiControllo`** e **eliminalo**
   (selezionalo e premi il pulsante `-` in basso a sinistra)
2. premi **`+`** e scegli dall'elenco la tabella **`PuntiControllo`**
   (attenzione: **non** `ModelliPuntoControllo`)
3. doppio clic sull'intestazione del riquadro nuovo e chiamalo
   **`ATT|PuntiControllo`**
4. trascina dal campo **`Id`** di `ATT|Attrezzature`
   al campo **`IdAttrezzatura`** di `ATT|PuntiControllo`

Poi vai nella scheda **Campi**, tabella **`ModelliPuntoControllo`**, e
**elimina il campo `idAttrezzatuea`**: adesso non serve piu'.

- [ ] Lavoro 3 fatto

---

# LAVORO 4 — Dare la chiave primaria a sei tabelle

**Perche':** a queste sei tabelle mancano `Id` e i campi di sistema. Senza
`Id` i loro record non si possono collegare a niente.

Le sei tabelle sono:

1. `Allergeni`
2. `TipiAttivita`
3. `ModelliReparto`
4. `ModelliPuntoControllo`
5. `ModelliPianoSanificazione`
6. `Parametri`

## Prima: copia i campi buoni

`Gestisci` -> `Database` -> **Campi** -> tabella **`Attrezzature`**

Seleziona con Ctrl+clic questi cinque campi:
`Id`, `CreatoIl`, `CreatoDa`, `ModificatoIl`, `ModificatoDa`
e premi **Ctrl+C**.

## Poi, per ognuna delle sei tabelle

1. scegli la tabella nel menu **Tabella**
2. premi **Ctrl+V**: i cinque campi compaiono con tutte le impostazioni
3. doppio clic sul campo `Id` -> pulsante **Opzioni** -> scheda **Immissione
   automatica** -> **togli** la spunta *Non consentire la modifica del valore
   durante l'immissione dati* -> `OK`

## Poi riempi gli Id dei record che ci sono gia'

I record erano gia' dentro prima che `Id` esistesse, quindi ce l'hanno vuoto.
Per ognuna delle sei tabelle:

1. chiudi `Gestisci Database`
2. vai sul layout con il nome di quella tabella (menu dei layout in alto)
3. `Record` -> `Mostra tutti i record`
4. clicca **dentro il campo `Id`** di un record qualsiasi
5. menu `Record` -> **`Sostituisci contenuto campo`**
6. scegli **`Sostituisci con risultato calcolato`**, scrivi

   `Get ( UUID )`

7. `OK`, poi conferma

## Infine rimetti la protezione

Torna in `Gestisci` -> `Database` -> `Campi`, e per ognuna delle sei tabelle
rimetti sul campo `Id` la spunta *Non consentire la modifica del valore
durante l'immissione dati*.

**Verifica:** apri il layout `ModelliPuntoControllo`. I 33 record devono avere
33 `Id` tutti diversi, nessuno vuoto.

- [ ] Lavoro 4 fatto

---

# LAVORO 5 — Mettere quattro spunte nelle relazioni

**Perche':** senza queste spunte il programma non puo' creare da solo le
righe di un ricevimento, il lotto e la non conformita'.

**Dove:** `Gestisci` -> `Database` -> scheda **Relazioni**.
Fai **doppio clic sulla linea** che collega i due riquadri: si apre la
finestra `Modifica relazione`, con in basso due caselle per ciascun lato.

### Spunta 1
Linea fra **`RIC|Ricevimenti`** e **`RIC|RigheRicevimento`**
Sul lato **`RIC|RigheRicevimento`** (quello di destra) spunta **tutte e due**:
- Consenti la creazione di record in questa tabella tramite questa relazione
- Elimina i record correlati in questa tabella quando un record viene
  eliminato nell'altra tabella

### Spunta 2
Linea fra **`RIC|RigheRicevimento`** e **`RIC|Lotti`**
Sul lato **`RIC|Lotti`** spunta **solo** *Consenti la creazione*.

### Spunta 3
Linea fra **`RIC|Ricevimenti`** e **`RIC|NonConformita`**
Sul lato **`RIC|NonConformita`** spunta **solo** *Consenti la creazione*.

### Spunta 4
Linea fra **`RIL|Rilevazioni`** e **`RIL|NonConformita`**
Sul lato **`RIL|NonConformita`** spunta **solo** *Consenti la creazione*.

**Su tutte le altre relazioni non spuntare niente.**
In particolare *Elimina i record correlati* va messa **solo nella Spunta 1**:
questo e' un registro sanitario, e le cancellazioni a catena distruggono le
prove che l'ispettore deve vedere.

- [ ] Lavoro 5 fatto

---

# LAVORO 6 — Togliere tre campi di troppo

**Perche':** dicono una cosa che il database sa gia' da un'altra parte. Due
copie della stessa informazione, prima o poi, diventano diverse.

I tre campi sono:
- `Rilevazioni::IdAttrezzatura`
- `Sanificazioni::IdReparto`
- `Sanificazioni::IdAttrezzatura`

## Prima elimina le relazioni che li usano

`Gestisci` -> `Database` -> **Relazioni**. Clicca la linea e premi il
pulsante `-` in basso, per queste tre:

- `RIL|Rilevazioni::IdAttrezzatura` = `RIL|Attrezzature::Id`
- `SAN|Sanificazioni::IdReparto` = `SAN|Reparti::Id`
- `SAN|Sanificazioni::IdAttrezzatura` = `SAN|Attrezzature::Id`

## Poi rifai le relazioni giuste

Trascina, sempre nella scheda Relazioni:

- da `RIL|PuntiControllo::IdAttrezzatura` a `RIL|Attrezzature::Id`
- da `SAN|PianoSanificazione::IdReparto` a `SAN|Reparti::Id`
- da `SAN|PianoSanificazione::IdAttrezzatura` a `SAN|Attrezzature::Id`

L'informazione arriva lo stesso, solo che passa dal punto di controllo e dalla
voce di piano, che sono i posti dove sta scritta davvero.

## Poi elimina i tre campi

Scheda **Campi**, tabella `Rilevazioni`: elimina `IdAttrezzatura`.
Tabella `Sanificazioni`: elimina `IdReparto` e `IdAttrezzatura`.

- [ ] Lavoro 6 fatto

---

# LAVORO 7 — Pulizie

### 7a — Un campo doppio
Tabella `Sanificazioni`: elimina il campo **`IdNonConformita Copia`**.
E' un duplicato nato per sbaglio (il suffisso "Copia" lo mette FileMaker).

### 7b — La tabella HACCP
C'e' ancora la tabella **`HACCP`**, quella creata da FileMaker insieme al
file, e dentro ha **15 record**.

1. apri il layout `HACCP` e guarda cosa contiene
2. se non e' roba che ti serve: `Gestisci` -> `Database` -> **Tabelle**,
   selezionala ed **elimina**
3. elimina anche il layout `HACCP`

### 7c — Quattro nomi da correggere
Scheda **Relazioni**, doppio clic sull'intestazione del riquadro e rinomina:

| Adesso si chiama | Va chiamato |
|---|---|
| `MODTipiAttivita` | `MOD\|TipiAttivita` |
| `PCF\|NonConformita` | `NCF\|NonConformita` |
| `RIC!Lotti` | `RIC\|Lotti` |
| `LOT\|Ricevimento` | `LOT\|Ricevimenti` |

La barra verticale `|` si fa con **AltGr + \\**.

### 7d — Cosa NON toccare
Nel grafico ci sono anche 22 riquadri senza sigla (`Attrezzature`,
`Fornitori`, `Lotti`...) e 23 layout con i nomi delle tabelle.
**Lasciali stare.** Sono nati con l'importazione, per ora servono a guardare i
dati. Li puliremo quando faremo le maschere vere.

- [ ] Lavoro 7 fatto

---

# Quando hai finito

`Strumenti` -> `Rapporto struttura database` -> formato **XML** -> `Crea`,
e mandami il file. Lo confronto con quello di prima e verifichiamo che sia
tutto a posto prima di passare ai calcoli.
