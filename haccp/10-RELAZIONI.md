# Passo 2 — Il grafico delle relazioni

Prerequisito: le 21 tabelle esistono, con i tipi sistemati e i cinque campi di
sistema funzionanti (`09-MONTAGGIO.md`).

Tempo stimato: **una serata.** E' un lavoro di pazienza, non di difficolta'.

---

## Il metodo: ancora e boe

Un gruppo di occorrenze per ogni maschera principale. L'**ancora** e' la
tabella da cui parte la maschera, le **boe** sono le tabelle collegate che le
servono. I gruppi non si intrecciano fra loro: se una maschera ha bisogno dei
fornitori, ha la *sua* occorrenza dei fornitori.

Sembra uno spreco. Non lo e': e' il motivo per cui fra sei mesi potrai
cambiare una relazione del ricevimento merci senza scoprire tre giorni dopo
che si e' rotto il registro delle sanificazioni.

**Nomenclatura:** `SIGLA|Tabella`, per esempio `RIC|Fornitori`.
La sigla dice a quale gruppo appartiene l'occorrenza. La barra verticale
(`|`, AltGr + backslash) e' ammessa da FileMaker nei nomi delle occorrenze.

### Come si fa in pratica

- `File` -> `Gestisci` -> `Database` -> scheda **Relazioni**
- il pulsante **`+`** in basso a sinistra aggiunge un'occorrenza: scegli la
  tabella dall'elenco
- per averne **due della stessa tabella**, premi `+` di nuovo e scegli la
  stessa tabella: FileMaker la chiama `Fornitori 2`
- **doppio clic** sull'intestazione dell'occorrenza per rinominarla
- per creare una relazione, trascina da un campo di un'occorrenza al campo
  dell'altra; doppio clic sulla linea per aprire le opzioni

Disponi ogni gruppo in una zona sua, con l'ancora a sinistra. Usa i colori
delle occorrenze (tasto destro -> colore) per distinguere i gruppi a colpo
d'occhio: dopo il quinto gruppo ringrazierai.

---

## Regola di ferro sulle eliminazioni

Nelle opzioni di ogni relazione ci sono due caselle. Vanno usate con giudizio.

**"Consenti la creazione di record in questa tabella tramite questa
relazione"** — serve quando un portale deve creare i figli (le righe di un
ricevimento, per esempio). Dove indicato sotto, spuntala.

**"Elimina i record correlati quando un record viene eliminato nell'altra
tabella"** — spuntala **solo** dove indicato sotto, cioe' praticamente mai.

Il motivo e' che questo e' un **registro sanitario**. Cancellare a cascata una
rilevazione, un lotto o una non conformita' non e' una comodita': e' la
distruzione della prova che l'ispettore vuole vedere. La sola cascata ammessa
e' quella di un ricevimento sulle sue righe, perche' una riga senza testata non
esiste come documento.

Le cancellazioni vere si gestiscono negli script, con un annullamento
registrato, non con una casella nel grafico.

---

## I gruppi

### `RIC` — Ricevimento merci
Ancora: **`RIC|Ricevimenti`**

| Da | Campo | | A | Campo | Opzioni |
|---|---|---|---|---|---|
| `RIC\|Ricevimenti` | `IdFornitore` | = | `RIC\|Fornitori` | `Id` | |
| `RIC\|Ricevimenti` | `IdOperatore` | = | `RIC\|Operatori` | `Id` | |
| `RIC\|Ricevimenti` | `Id` | = | `RIC\|RigheRicevimento` | `IdRicevimento` | **consenti creazione**, **elimina correlati** |
| `RIC\|RigheRicevimento` | `IdProdotto` | = | `RIC\|Prodotti` | `Id` | |
| `RIC\|RigheRicevimento` | `Id` | = | `RIC\|Lotti` | `IdRigaRicevimento` | **consenti creazione** |
| `RIC\|Ricevimenti` | `Id` | = | `RIC\|NonConformita` | `IdRicevimento` | **consenti creazione** |

E' l'unico gruppo con la cascata di eliminazione, e solo fra testata e righe.

Il collegamento `RigheRicevimento -> Lotti` con creazione consentita e' quello
che fa nascere il lotto dalla riga di consegna: si scansiona il cartone, si
salva la riga, e il lotto entra in giacenza da solo.

### `LOT` — Lotti e rintracciabilita'
Ancora: **`LOT|Lotti`**

| Da | Campo | | A | Campo | Opzioni |
|---|---|---|---|---|---|
| `LOT\|Lotti` | `IdProdotto` | = | `LOT\|Prodotti` | `Id` | |
| `LOT\|Lotti` | `IdFornitore` | = | `LOT\|Fornitori` | `Id` | |
| `LOT\|Lotti` | `IdAttrezzatura` | = | `LOT\|Attrezzature` | `Id` | |
| `LOT\|Lotti` | `IdRigaRicevimento` | = | `LOT\|RigheRicevimento` | `Id` | |
| `LOT\|RigheRicevimento` | `IdRicevimento` | = | `LOT\|Ricevimenti` | `Id` | |
| `LOT\|Lotti` | `Id` | = | `LOT\|Utilizzi` | `IdLotto` | **consenti creazione** |

Le ultime tre righe sono la rintracciabilita' completa: risalendo si arriva al
DDT e al fornitore (**passo indietro**), scendendo su `Utilizzi` si arriva
alle preparazioni in cui il lotto e' finito (**passo avanti**).

`Utilizzi` e' ancora vuota: e' fase 2. La relazione si fa adesso lo stesso.

### `RIL` — Registro delle rilevazioni
Ancora: **`RIL|Rilevazioni`**

| Da | Campo | | A | Campo | Opzioni |
|---|---|---|---|---|---|
| `RIL\|Rilevazioni` | `IdPuntoControllo` | = | `RIL\|PuntiControllo` | `Id` | |
| `RIL\|Rilevazioni` | `IdOperatore` | = | `RIL\|Operatori` | `Id` | |
| `RIL\|Rilevazioni` | `IdNonConformita` | = | `RIL\|NonConformita` | `Id` | **consenti creazione** |
| `RIL\|PuntiControllo` | `IdAttrezzatura` | = | `RIL\|Attrezzature` | `Id` | |

La creazione consentita su `NonConformita` serve allo script che, davanti a
una misura fuori limite, apre da solo la non conformita' con dentro l'azione
correttiva prevista dal punto di controllo. E' il pezzo che trasforma un
registro in un sistema di autocontrollo.

### `PCO` — Punti di controllo (configurazione)
Ancora: **`PCO|PuntiControllo`**

| Da | Campo | | A | Campo |
|---|---|---|---|---|
| `PCO\|PuntiControllo` | `IdAttrezzatura` | = | `PCO\|Attrezzature` | `Id` |
| `PCO\|PuntiControllo` | `IdReparto` | = | `PCO\|Reparti` | `Id` |
| `PCO\|PuntiControllo` | `Id` | = | `PCO\|Rilevazioni` | `IdPuntoControllo` |

Serve a vedere lo storico di un singolo controllo: apri "Temperatura frigo 1"
e hai sotto tutte le sue misure.

### `NCF` — Non conformita'
Ancora: **`NCF|NonConformita`**

| Da | Campo | | A | Campo |
|---|---|---|---|---|
| `NCF\|NonConformita` | `IdRilevazione` | = | `NCF\|Rilevazioni` | `Id` |
| `NCF\|NonConformita` | `IdRicevimento` | = | `NCF\|Ricevimenti` | `Id` |
| `NCF\|NonConformita` | `IdLotto` | = | `NCF\|Lotti` | `Id` |
| `NCF\|NonConformita` | `IdOperatoreRilevatore` | = | `NCF\|OperatoriRilevatore` | `Id` |
| `NCF\|NonConformita` | `IdResponsabile` | = | `NCF\|OperatoriResponsabile` | `Id` |

Attenzione alle ultime due: sono **due occorrenze diverse della stessa tabella
`Operatori`**, perche' chi rileva il problema e chi lo prende in carico sono
due persone diverse. E' il caso in cui la nomenclatura si guadagna lo
stipendio: se le lasciassi `Operatori 3` e `Operatori 4` non ricorderesti
quale e' quale.

### `SAN` — Sanificazioni eseguite
Ancora: **`SAN|Sanificazioni`**

| Da | Campo | | A | Campo |
|---|---|---|---|---|
| `SAN\|Sanificazioni` | `IdPianoSanificazione` | = | `SAN\|PianoSanificazione` | `Id` |
| `SAN\|Sanificazioni` | `IdOperatore` | = | `SAN\|Operatori` | `Id` |
| `SAN\|PianoSanificazione` | `IdReparto` | = | `SAN\|Reparti` | `Id` |
| `SAN\|PianoSanificazione` | `IdAttrezzatura` | = | `SAN\|Attrezzature` | `Id` |

### `PSA` — Piano di sanificazione (configurazione)
Ancora: **`PSA|PianoSanificazione`**

| Da | Campo | | A | Campo |
|---|---|---|---|---|
| `PSA\|PianoSanificazione` | `IdReparto` | = | `PSA\|Reparti` | `Id` |
| `PSA\|PianoSanificazione` | `IdAttrezzatura` | = | `PSA\|Attrezzature` | `Id` |
| `PSA\|PianoSanificazione` | `Id` | = | `PSA\|Sanificazioni` | `IdPianoSanificazione` |

### `ATT` — Attrezzature
Ancora: **`ATT|Attrezzature`**

| Da | Campo | | A | Campo |
|---|---|---|---|---|
| `ATT\|Attrezzature` | `IdReparto` | = | `ATT\|Reparti` | `Id` |
| `ATT\|Attrezzature` | `Id` | = | `ATT\|PuntiControllo` | `IdAttrezzatura` |

### `FOR` — Fornitori
Ancora: **`FOR|Fornitori`**

| Da | Campo | | A | Campo |
|---|---|---|---|---|
| `FOR\|Fornitori` | `Id` | = | `FOR\|Ricevimenti` | `IdFornitore` |
| `FOR\|Fornitori` | `Id` | = | `FOR\|Prodotti` | `IdFornitoreAbituale` |

### `PRO` — Prodotti
Ancora: **`PRO|Prodotti`**

| Da | Campo | | A | Campo |
|---|---|---|---|---|
| `PRO\|Prodotti` | `IdFornitoreAbituale` | = | `PRO\|Fornitori` | `Id` |
| `PRO\|Prodotti` | `Id` | = | `PRO\|Lotti` | `IdProdotto` |

### `OPE` — Operatori
Ancora: **`OPE|Operatori`**, con `OPE|Rilevazioni` collegata su
`Id` = `IdOperatore`.

### `REP` — Reparti
Ancora: **`REP|Reparti`**, con `REP|Attrezzature` collegata su
`Id` = `IdReparto`.

### `MOD` — Modelli e impianto
Ancora: **`MOD|TipiAttivita`**

| Da | Campo | | A | Campo |
|---|---|---|---|---|
| `MOD\|TipiAttivita` | `Codice` | = | `MOD\|ModelliReparto` | `CodiceTipoAttivita` |
| `MOD\|TipiAttivita` | `Codice` | = | `MOD\|ModelliPuntoControllo` | `CodiceTipoAttivita` |
| `MOD\|TipiAttivita` | `Codice` | = | `MOD\|ModelliPianoSanificazione` | `CodiceTipoAttivita` |

Qui il collegamento e' sul **codice** e non sull'`Id`: i modelli sono dati di
prodotto, scritti da noi, e il codice `RC` e' piu' leggibile di un UUID quando
si guarda il grafico o si scrive lo script di impianto.

E' l'unica eccezione, e vale solo per le tabelle modello.

### Occorrenze isolate
`IMP|Impresa`, `PAR|Parametri`, `MOD|Allergeni`: nessuna relazione, servono
solo come contesto per le rispettive maschere.

---

## Un campo da aggiungere: `Operatori::NomeCompleto`

Le liste valori dinamiche di FileMaker mostrano al massimo **due campi**: uno
da memorizzare e uno da mostrare. `Operatori` ha `Cognome` e `Nome` separati,
quindi servirebbero tre campi.

Aggiungi in `Operatori` un campo **calcolato**, risultato testo:

```
Cognome & " " & Nome
```

Chiamalo `NomeCompleto`. Lascialo **memorizzato** (e' il comportamento
predefinito): cosi' si puo' ordinare e cercare.

---

## Liste valori

`File` -> `Gestisci` -> **`Liste valori`**. Le prime sono elenchi fissi
(**Valori personalizzati**, uno per riga). Servono prima dei layout.

| Nome | Valori |
|---|---|
| `vl_SiNo` | Si / No |
| `vl_TipoPuntoControllo` | CCP / CP / PRP |
| `vl_FasePuntoControllo` | ricevimento / conservazione / cottura / abbattimento / mantenimento / rigenerazione / bonifica / frittura / sanificazione / altro |
| `vl_Grandezza` | temperatura / tempo / percentuale / pH / visivo |
| `vl_Frequenza` | ad evento / giornaliera / due volte al giorno / settimanale / mensile / trimestrale / semestrale / annuale |
| `vl_EsitoRilevazione` | conforme / non conforme |
| `vl_EsitoRiga` | accettato / accettato con riserva / respinto |
| `vl_EsitoRicevimento` | accettato / accettato parzialmente / respinto |
| `vl_TipoScadenza` | scadenza / TMC |
| `vl_StatoLotto` | in giacenza / esaurito / bloccato / smaltito |
| `vl_OrigineLotto` | acquistato / prodotto internamente |
| `vl_OrigineNonConformita` | rilevazione / ricevimento / reclamo / verifica interna / analisi / ispezione |
| `vl_Gravita` | bassa / media / alta |
| `vl_TipoAttrezzatura` | frigorifero / congelatore / abbattitore / forno / friggitrice / lavastoviglie / vetrina / cella / altro |
| `vl_TipoConservazione` | ambiente / refrigerato / congelato |
| `vl_CategoriaProdotto` | carne / pesce / ortofrutta / latticini / secco / bevande / detergenti / altro |
| `vl_UnitaMisura` | kg / g / l / ml / pz / cf / ct |

I valori devono essere scritti **esattamente** cosi': sono gli stessi che
compaiono nei file di `import/dati/`, e i calcoli dell'esito li confronteranno
alla lettera.

### Liste dinamiche

**Usa valori dal campo**, con "Includi anche valori da un secondo campo" e la
spunta **"Mostra solo i valori dal secondo campo"**.

| Nome | Occorrenza | Campo memorizzato | Campo mostrato |
|---|---|---|---|
| `vl_Fornitori` | `FOR\|Fornitori` | `Id` | `RagioneSociale` |
| `vl_Prodotti` | `PRO\|Prodotti` | `Id` | `Descrizione` |
| `vl_Operatori` | `OPE\|Operatori` | `Id` | `NomeCompleto` |
| `vl_Attrezzature` | `ATT\|Attrezzature` | `Id` | `Descrizione` |
| `vl_Reparti` | `REP\|Reparti` | `Id` | `Descrizione` |
| `vl_PuntiControllo` | `PCO\|PuntiControllo` | `Id` | `Descrizione` |

Cosi' l'operatore vede "Rossi Carni Srl" e il database memorizza l'UUID. E' il
motivo per cui le chiavi possono essere illeggibili senza che a nessuno
importi.

---

## Come verificare che sia tutto a posto

Non fidarti del grafico a vista: provalo.

1. Crea un record in `Reparti` (per esempio `CUC` / Cucina).
2. Crea un record in `Attrezzature` e, nel campo `IdReparto`, mettici l'`Id`
   del reparto appena creato (per ora copia e incolla a mano: il menu a tendina
   arrivera' con i layout).
3. Su un layout basato su `ATT|Attrezzature`, aggiungi il campo
   `ATT|Reparti::Descrizione`: deve comparire "Cucina".

Se compare, la relazione funziona. Ripeti il controllo su una relazione per
gruppo, non su tutte: se il metodo e' giusto, lo e' per tutte.

Alla fine, esporta di nuovo il rapporto struttura in `haccp/ddr/v002/`.

---

## Cosa viene dopo

`11-CALCOLI.md`: l'esito conforme o non conforme letto dai limiti del punto di
controllo, il semaforo delle scadenze, la scadenza dopo apertura, la
validazione della partita IVA e il parser del codice a barre GS1-128 che tira
fuori lotto e data di scadenza dal cartone.
