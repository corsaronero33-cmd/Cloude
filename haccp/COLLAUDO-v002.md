# Collaudo dello schema — versione v002

Verifica del rapporto struttura esportato il 07/09/2026 da FileMaker 22.0.7,
archiviato in `haccp/ddr/v002/`.

**Riepilogo:** 22 tabelle, 41 relazioni, 78 occorrenze, 23 liste valori.
L'impianto e' corretto: i tredici gruppi ci sono tutti, le liste valori hanno i
nomi giusti, le relazioni sono nei posti previsti.

Restano quattro correzioni da fare **prima** dei calcoli, piu' alcune
pulizie.

---

## 1. I tipi dei campi non sono stati convertiti — BLOCCANTE

Nel file tutti i campi sono **Testo**, tranne `CreatoIl` e `ModificatoIl` che
sono correttamente Data e ora. Il passo 4 di `09-MONTAGGIO.md` e' rimasto
indietro.

Non e' un dettaglio estetico, e' quello che impedisce di andare avanti:

- il confronto `Valore < LimiteMin` su campi Testo confronta **stringhe**, e
  in ordine alfabetico `"10"` viene prima di `"9"`. Il semaforo conforme /
  non conforme darebbe risultati sbagliati proprio sulle temperature;
- `DataScadenza - Get(CurrentDate)` su un campo Testo non calcola niente;
- gli ordinamenti per data ordinano per stringa: 01/12 prima di 02/03.

Sono **49 campi**. L'elenco esatto, generato dal rapporto struttura:

**`Allergeni`**
- `Numero` -> **Numero**

**`Attrezzature`**
- `AnnoInstallazione` -> **Numero**
- `TemperaturaMin` -> **Numero**
- `TemperaturaMax` -> **Numero**
- `DataUltimaManutenzione` -> **Data**
- `DataProssimaManutenzione` -> **Data**

**`Fornitori`**
- `DataQualifica` -> **Data**
- `DataProssimaVerifica` -> **Data**

**`Impresa`**
- `DataScia` -> **Data**

**`Lotti`**
- `DataIngresso` -> **Data**
- `DataScadenza` -> **Data**
- `QuantitaIniziale` -> **Numero**
- `QuantitaResidua` -> **Numero**
- `DataApertura` -> **Data**
- `ScadenzaDopoApertura` -> **Data**

**`ModelliPianoSanificazione`**
- `Ordine` -> **Numero**

**`ModelliPuntoControllo`**
- `LimiteMin` -> **Numero**
- `LimiteMax` -> **Numero**
- `OrarioAtteso1` -> **Ora**
- `OrarioAtteso2` -> **Ora**
- `Ordine` -> **Numero**

**`ModelliReparto`**
- `Ordine` -> **Numero**

**`NonConformita`**
- `Data` -> **Data**
- `DataChiusura` -> **Data**

**`Operatori`**
- `DataAssunzione` -> **Data**
- `DataCessazione` -> **Data**

**`Parametri`**
- `Valore` -> **Numero**

**`PianoSanificazione`**
- `Ordine` -> **Numero**

**`Prodotti`**
- `TemperaturaMin` -> **Numero**
- `TemperaturaMax` -> **Numero**
- `GiorniValiditaDopoApertura` -> **Numero**

**`PuntiControllo`**
- `LimiteMin` -> **Numero**
- `LimiteMax` -> **Numero**
- `OrarioAtteso1` -> **Ora**
- `OrarioAtteso2` -> **Ora**
- `Ordine` -> **Numero**

**`Reparti`**
- `Ordine` -> **Numero**

**`Ricevimenti`**
- `DataDdt` -> **Data**
- `DataOraRicevimento` -> **Data e ora**
- `TemperaturaVano` -> **Numero**

**`RigheRicevimento`**
- `Quantita` -> **Numero**
- `DataScadenza` -> **Data**
- `TemperaturaRilevata` -> **Numero**

**`Rilevazioni`**
- `DataOra` -> **Data e ora**
- `Valore` -> **Numero**

**`Sanificazioni`**
- `Data` -> **Data**

**`TipiAttivita`**
- `Ordine` -> **Numero**

**`Utilizzi`**
- `QuantitaImpiegata` -> **Numero**
- `DataOra` -> **Data e ora**


Totale campi da convertire: **49**

Scorciatoia: in `Gestisci Database` seleziona piu' campi con lo stesso tipo di
destinazione, scegli il tipo e premi `Cambia`.

---

## 2. `ATT|PuntiControllo` punta alla tabella sbagliata — BLOCCANTE

L'occorrenza `ATT|PuntiControllo` ha come tabella di base
**`ModelliPuntoControllo`** invece di **`PuntiControllo`**.

E' l'origine dei campi che hai dovuto aggiungere: `ModelliPuntoControllo` non
ha un campo `IdAttrezzatura` (e' una tabella modello, i suoi controlli non
sono ancora legati alle attrezzature di un locale), quindi per chiudere la
relazione e' nato il campo `idAttrezzatuea` — con il refuso, e dentro la
tabella sbagliata.

**Colpa del documento, non tua:** nel grafico i due nomi sono adiacenti
nell'elenco di scelta e `10-RELAZIONI.md` non diceva esplicitamente quale
fosse la tabella di base di ogni occorrenza. Adesso lo dice.

Rimedio:

1. nel grafico elimina l'occorrenza `ATT|PuntiControllo`;
2. creane una nuova scegliendo la tabella **`PuntiControllo`** e chiamala
   `ATT|PuntiControllo`;
3. rifai la relazione `ATT|Attrezzature::Id` = `ATT|PuntiControllo::IdAttrezzatura`;
4. in `Gestisci Database`, tabella `ModelliPuntoControllo`, **elimina il campo
   `idAttrezzatuea`**: non serve piu' e nella tabella modello non ci deve
   stare.

---

## 3. Le sei tabelle modello non hanno chiave primaria — BLOCCANTE

`Allergeni`, `TipiAttivita`, `ModelliReparto`, `ModelliPuntoControllo`,
`ModelliPianoSanificazione` e `Parametri` non hanno **`Id`** ne' i campi di
sistema: l'incollatura del passo 5 non e' arrivata fin qui.

Sono le tabelle che contengono i dati gia' pronti (33 punti di controllo, 28
voci di sanificazione, i 14 allergeni, i 20 parametri): senza chiave primaria
lo script di impianto non puo' copiarle in modo affidabile.

Rimedio, per ognuna delle sei:

1. incolla i cinque campi di sistema copiati da `Attrezzature`;
2. nelle opzioni di `Id` togli temporaneamente *Non consentire la modifica*;
3. formulario della tabella, `Record` -> `Mostra tutti i record`, clicca in
   `Id`, poi `Record` -> `Sostituisci contenuto campo` -> **Sostituisci con
   risultato calcolato** -> `Get ( UUID )`;
4. rimetti la spunta.

Controllo finale: su `ModelliPuntoControllo` i 33 record devono avere 33 `Id`
diversi.

---

## 4. `Operatori::NomeCompleto` restituisce un numero — BLOCCANTE

Il calcolo e' giusto ma il **risultato e' impostato su Numero**:

```
Nome & " " & Cognome        risultato: Numero      <-- sbagliato
```

Concatenare due testi e chiedere un numero produce un risultato vuoto o zero,
e la lista valori `vl_Operatori` mostrerebbe una colonna di nulla.

Rimedio: apri il campo, nella finestra del calcolo cambia **Risultato del
calcolo** in **Testo**.

Nota non bloccante: hai messo `Nome & " " & Cognome`. Per gli elenchi e gli
ordinamenti conviene `Cognome & " " & Nome`, cosi' la lista degli operatori
esce in ordine di cognome. Scelta tua, ma e' quella che poi non si rimpiange.

---

## 5. Nessuna relazione ha le opzioni di creazione — IMPORTANTE

Tutte e 41 le relazioni hanno `cascadeCreate = False` e
`cascadeDelete = False`. Le quattro spunte previste mancano.

| Relazione | Cosa spuntare | A cosa serve |
|---|---|---|
| `RIC\|Ricevimenti::Id` = `RIC\|RigheRicevimento::IdRicevimento` | **consenti creazione** e **elimina correlati** (sul lato righe) | il portale delle righe; e una riga senza testata non e' un documento |
| `RIC\|RigheRicevimento::Id` = `RIC\|Lotti::IdRigaRicevimento` | **consenti creazione** (sul lato lotti) | il lotto nasce da solo dalla riga di consegna |
| `RIC\|Ricevimenti::Id` = `RIC\|NonConformita::IdRicevimento` | **consenti creazione** | non conformita' aperta dal ricevimento |
| `RIL\|Rilevazioni::IdNonConformita` = `RIL\|NonConformita::Id` | **consenti creazione** | non conformita' aperta da una misura fuori limite |

Su tutte le altre le due caselle restano spente. In particolare **elimina
correlati** va spuntata **solo** sulla prima riga di questa tabella: e' un
registro sanitario, e la cancellazione a cascata di rilevazioni, lotti o non
conformita' distrugge la prova che l'ispezione deve vedere.

---

## 6. Tre campi in piu' creano una seconda fonte di verita' — IMPORTANTE

Hai aggiunto:

- `Rilevazioni::IdAttrezzatura`, con relazione diretta a `RIL|Attrezzature`
- `Sanificazioni::IdReparto` e `Sanificazioni::IdAttrezzatura`, con relazioni
  dirette a `SAN|Reparti` e `SAN|Attrezzature`

Funzionano, ma duplicano un'informazione che c'e' gia': l'attrezzatura di una
rilevazione **e' quella del suo punto di controllo**, e reparto e attrezzatura
di una sanificazione **sono quelli della voce di piano**. Con due copie, prima
o poi divergono, e in un registro sanitario "quale delle due e' vera" e' una
domanda che non deve potersi porre.

Due modi per sistemare, scegli tu:

**a) Toglierli** e ripristinare i passaggi previsti:
`RIL|PuntiControllo::IdAttrezzatura` = `RIL|Attrezzature::Id`, e
`SAN|PianoSanificazione::IdReparto` / `IdAttrezzatura` verso `SAN|Reparti` e
`SAN|Attrezzature`.

**b) Tenerli come valore ricercato** (lookup): il campo resta, ma si compila
da solo dalla relazione con il punto di controllo o con la voce di piano, e
nessuno lo scrive a mano. La fonte di verita' resta una sola.

La (a) e' piu' pulita. La (b) e' comoda se piu' avanti vorremo raggruppare le
stampe per attrezzatura senza passare da tre relazioni.

---

## 7. Pulizie

**`Sanificazioni::IdNonConformita Copia`** — duplicato accidentale (il
suffisso "Copia" e' quello che mette FileMaker). Da eliminare.

**Tabella `HACCP` con 15 record** — e' la tabella che FileMaker crea insieme
al file, con i suoi campi predefiniti (`ChiavePrimaria`,
`IndicatoreDataOraCreazione`...) e dentro 15 record, probabilmente
un'importazione finita nel posto sbagliato. Guarda cosa contiene, poi elimina
la tabella e il suo layout.

**Nomi di occorrenze da correggere** (doppio clic sull'intestazione):

| Adesso | Dovrebbe essere |
|---|---|
| `MODTipiAttivita` | `MOD\|TipiAttivita` (manca la barra) |
| `PCF\|NonConformita` | `NCF\|NonConformita` (sigla del gruppo) |
| `RIC!Lotti` | `RIC\|Lotti` (punto esclamativo invece della barra) |
| `LOT\|Ricevimento` | `LOT\|Ricevimenti` (la tabella e' al plurale) |

Non impediscono niente, ma il senso della nomenclatura e' che fra sei mesi si
legga il grafico senza pensarci.

**Le 22 occorrenze senza sigla** (`Attrezzature`, `Fornitori`, `Lotti`...) e i
23 layout automatici sono quelli nati con l'importazione. **Lasciali stare
per ora**: i layout automatici li usano, e ci servono per provare i dati.
Faremo pulizia quando costruiremo le maschere vere.

---

## Ordine consigliato

1. I 49 tipi di campo (punto 1) — e' il grosso del lavoro
2. `NomeCompleto` a Testo (punto 4) — trenta secondi
3. `ATT|PuntiControllo` e il campo con il refuso (punto 2)
4. Chiavi primarie sulle sei tabelle modello (punto 3)
5. Le quattro spunte di creazione (punto 5)
6. Decidere fra (a) e (b) al punto 6
7. Pulizie (punto 7)

Poi riesporta il rapporto struttura: lo confronto con questo e vediamo cosa e'
cambiato davvero.
