# Scheda 05 — Duplicare un'anagrafica

Scheda di lavoro passo passo, con il disegno in scala:
<https://claude.ai/artifact/7hD4LvSbe72WNeMLaV3dDM>

Prerequisito: `04-menu.md` finita e collaudata.

Da qui in avanti **non si inventa piu' niente**. La coppia elenco+scheda dei
reparti e' lo stampo: cinque volte la stessa procedura, cambiando occorrenza e
campi.

Si comincia da **Attrezzature**, che porta i due pezzi nuovi: i **riquadri**
per le schede con tanti campi, e il **campo collegato** — un UUID che
l'operatore non deve mai vedere.

---

## La procedura, sette passi

| # | Cosa | Dove |
|---|---|---|
| 1 | Campo `gCerca`, Testo, **archiviazione globale** | `File` › `Gestisci` › `Database` |
| 2 | Script `91 - <Tabella> - Entra nell'elenco`: svuota `gCerca`, mostra tutti, ordina | Area di lavoro Script |
| 3 | Duplica i due formati dei reparti, rinomina, cambia l'occorrenza in `Imposta formato` | Formati |
| 4 | Sostituisci i campi, sistema colonne e riquadri | sui due formati |
| 5 | Trigger `OnLayoutEnter` sull'elenco → lo script `91` nuovo | `Imposta formato` › Trigger |
| 6 | Casella di ricerca: trigger → `92 - Utilita - Cerca`, parametro `<OCC>::gCerca` | sull'elenco |
| 7 | Spunte della **Ricerca rapida**, e i parametri dei pulsanti `Apri`, `← Elenco`, `← Menù` | sui due formati |

**Il passo che si dimentica e' il 7.** Duplicando un formato i pulsanti si
portano dietro **i parametri vecchi**: `Apri` continuera' a mandare su
`"D_Reparti scheda"`. Nessun errore, nessun messaggio: apre semplicemente il
reparto invece dell'attrezzatura. Cambia i parametri **subito dopo aver
duplicato**, prima di mettere mano ai campi.

**Lo script `92` non si tocca mai.** Non nomina nessuna tabella: il testo
glielo passa la casella nel parametro del trigger.

---

## Novita' 1 — I riquadri

Sui reparti li avevamo tolti: con quattro campi erano decorazione. Con
quattordici diventano il modo in cui la maschera si legge.

| Campi sulla scheda | Cosa fare |
|---|---|
| fino a 5 | una colonna, niente riquadro — come `D_Reparti scheda` |
| da 6 a 10 | due colonne, **un** riquadro |
| oltre 10 | due colonne, **un riquadro per argomento** |

**Il criterio per dividere non e' il numero, e' l'argomento.** Qui: chi e'
l'attrezzatura, e come va tenuta. Uno guarda il primo riquadro quando cerca
"quale frigo e'", il secondo quando cerca "quando l'ho tarato". Se un campo
non sai dove metterlo, probabilmente il riquadro giusto non esiste ancora.

### La griglia a due colonne

| Elemento | X | Largh. | Note |
|---|---|---|---|
| Rettangolo del riquadro | 24 | 656 | da 24 a 680 |
| Titolo e linea del riquadro | 44 | 616 | rientrati di 20 |
| Etichette, colonna sinistra | 44 | 88 | allineate a **destra** |
| Campi, colonna sinistra | 143 | 200 | |
| Etichette, colonna destra | 361 | 88 | allineate a **destra** |
| Campi, colonna destra | 460 | 200 | chiudono a **660** |
| Campi alti 32 | | | passo verticale **36** |

**I conti.** Da 44 a 660 ci sono 616 punti utili: due blocchi da
(88 + 11 + 200) = 299, piu' 18 di respiro, fanno 616 esatti.

Le etichette restano larghe **88** e non 150 come sui reparti, perche' in due
colonne 150 non ci stanno — ed e' il motivo per cui "Ultima manutenzione"
diventa **"Ultima manut."**.

---

## Novita' 2 — Il campo collegato

`IdReparto` contiene un **UUID**, 36 caratteri senza significato. Non va
mostrato mai.

| Dove | Cosa metti | Perche' |
|---|---|---|
| **Sulla scheda** | `ATT\|Attrezzature::IdReparto`, controllo **Menu a discesa**, lista `vl_Reparti` | l'operatore **sceglie**: vede "Cucina", il database memorizza l'UUID |
| **Sull'elenco** | `ATT\|Reparti::Descrizione`, che arriva dalla relazione | nell'elenco si **legge** e basta |

**Due campi diversi, non lo stesso campo formattato in due modi.** Il secondo
e' un campo di **un'altra tabella**, visibile grazie alla relazione
dell'ancora `ATT`. Disegnandolo, nella finestra di scelta devi cambiare
l'occorrenza in alto: da `ATT|Attrezzature` a `ATT|Reparti`.

La lista `vl_Reparti` mostra `Descrizione` e scrive `Id`: e' gia' fatta cosi'
in `06-RELAZIONI.md`.

---

## `D_Attrezzature scheda` — le misure

Intestazione e pie' arrivano dalla duplicazione: cambia solo il titolo, da
"Reparto" a **"Attrezzatura"**. Parte **Corpo alta 500**.

### Riquadro 1 — "DATI DELL'ATTREZZATURA"
Rettangolo y 20, alt. 208 · titolo y 32 · linea y 56

| Y | Etichetta sinistra (x 44) | Campo (x 143) | Etichetta destra (x 361) | Campo (x 460) |
|---|---|---|---|---|
| 72 | Codice | `Codice` | Matricola | `Matricola` |
| 108 | Descrizione | `Descrizione` | Marca | `Marca` |
| 144 | Tipo | `Tipo` — `vl_TipoAttrezzatura` | Modello | `Modello` |
| 180 | Reparto | `IdReparto` — **`vl_Reparti`** | Anno | `AnnoInstallazione` |

### Riquadro 2 — "TEMPERATURE E MANUTENZIONE"
Rettangolo y 244, alt. 236 · titolo y 256 · linea y 280

| Y | Etichetta sinistra | Campo | Etichetta destra | Campo |
|---|---|---|---|---|
| 296 | Temp. min | `TemperaturaMin` | Ultima manut. | `DataUltimaManutenzione` |
| 332 | Temp. max | `TemperaturaMax` | Prossima manut. | `DataProssimaManutenzione` |
| 368 | Attivo | `Attivo` — `vl_SiNo` | | |
| 404 | Note | `Note` — **alto 60, largo 517** (da 143 a 660) | | |

---

## `D_Attrezzature elenco`

Intestazione 143, corpo 30, pie' 38, come i reparti. Cambiano le colonne.

| Colonna | X | Largh. | Campo | Ricerca rapida |
|---|---|---|---|---|
| `Apri` | 24 | 51 | script `90`, parametro `"D_Attrezzature scheda"` | — |
| Codice | 85 | 110 | `ATT\|Attrezzature::Codice` | **accesa** |
| Descrizione | 205 | 230 | `ATT\|Attrezzature::Descrizione` | **accesa** |
| Tipo | 445 | 110 | `ATT\|Attrezzature::Tipo` | **accesa** |
| Reparto | 565 | 115 | `ATT\|Reparti::Descrizione` | spenta |

**Su `Tipo` la spunta resta accesa, e sembra contraddire la regola.** La
differenza vera non e' quante parole diverse ci sono, e' **quanto restringe**.
Con sei o sette tipi su trenta attrezzature, cercare `frigo` lascia cinque
righe. Con `Si`/`No` non restringe niente. La regola giusta e' **"accendi dove
cercare serve a togliere righe"**.

---

## Collaudo

| # | Cosa fai | Deve succedere |
|---|---|---|
| 1 | Dal menu premi **Attrezzature** | Si apre l'elenco, vuoto |
| 2 | `+ Nuovo`, compili la scheda | I riquadri si leggono, le etichette non sono tagliate |
| 3 | Clicchi sul campo **Reparto** | La tendina mostra **Cucina** e **Magazzino secco**, non stringhe di 36 caratteri |
| 4 | Scegli Cucina, torni all'elenco | La colonna Reparto dice **Cucina**: la relazione funziona |
| 5 | Crei una seconda attrezzatura in un altro reparto | Le due righe mostrano reparti diversi |
| 6 | `Apri` sulla **seconda** riga | Si apre **quella** attrezzatura. Se si apre un reparto, hai saltato il passo 7 |
| 7 | Cerchi il codice di una delle due | Resta una riga sola |
| 8 | Premi `Tutti` | Tornano tutte, in ordine, casella vuota |
| 9 | `← Menù`, poi di nuovo **Attrezzature** | Il giro regge nei due versi |

**La prova 3 e' quella che conta.** Se nella tendina vedi gli UUID, la lista
valori non e' `vl_Reparti` o il campo e' sbagliato. Un operatore davanti a
trentasei caratteri casuali chiude il programma e telefona.

---

## Le altre tre

### Fornitori — `FOR|Fornitori`

| Riquadro | Colonna sinistra | Colonna destra |
|---|---|---|
| DATI DEL FORNITORE | `RagioneSociale`, `PartitaIva`, `Indirizzo`, `Cap` | `Citta`, `Provincia`, `Telefono`, `Email` |
| QUALIFICA | `Referente`, `CategorieFornite`, `NumeroRiconoscimentoCe` | `Qualificato` (`vl_SiNo`), `DataQualifica`, `DataProssimaVerifica` |
| | `Attivo` (`vl_SiNo`), poi `Note` largo 517 | |

| Elenco | X | Largh. | Ricerca rapida |
|---|---|---|---|
| `Apri` | 24 | 51 | — |
| `RagioneSociale` | 85 | 250 | **accesa** |
| `PartitaIva` | 345 | 115 | **accesa** |
| `Citta` | 470 | 130 | **accesa** |
| `Qualificato` | 610 | 70 | spenta |

La funzione `PartitaIvaValida` di `07-CALCOLI.md` si agganchera' qui quando
faremo le convalide.

### Prodotti — `PRO|Prodotti`

| Riquadro | Colonna sinistra | Colonna destra |
|---|---|---|
| DATI DEL PRODOTTO | `Descrizione`, `Codice`, `Categoria` (`vl_CategoriaProdotto`), `UnitaMisura` (`vl_UnitaMisura`) | `IdFornitoreAbituale` (**`vl_Fornitori`**), `Gtin`, `OrigineAnimale` (`vl_SiNo`), `Attivo` (`vl_SiNo`) |
| CONSERVAZIONE | `TipoConservazione` (`vl_TipoConservazione`), `TemperaturaMin`, `TemperaturaMax` | `RichiedeLotto` (`vl_SiNo`), `RichiedeScadenza` (`vl_SiNo`), `GiorniValiditaDopoApertura` |
| | `Note` largo 517 | |

| Elenco | X | Largh. | Ricerca rapida |
|---|---|---|---|
| `Apri` | 24 | 51 | — |
| `Descrizione` | 85 | 250 | **accesa** |
| `Codice` | 345 | 100 | **accesa** |
| `PRO\|Fornitori::RagioneSociale` | 455 | 145 | spenta |
| `Categoria` | 610 | 70 | **accesa** |

`IdFornitoreAbituale` e' un campo collegato come `IdReparto`.

**Qui la ricerca si sentira':** Prodotti sara' la prima tabella con centinaia
di record, ed e' la prima da provare **dopo** aver caricato i dati veri.

### Operatori — `OPE|Operatori`

Nove campi, **un solo riquadro**, corpo alto 260 invece di 500.

| Riquadro | Colonna sinistra | Colonna destra |
|---|---|---|
| DATI DELL'OPERATORE | `Cognome`, `Nome`, `Mansione`, `Telefono` | `AccountFileMaker`, `DataAssunzione`, `DataCessazione`, `Attivo` (`vl_SiNo`) |

| Elenco | X | Largh. | Ricerca rapida |
|---|---|---|---|
| `Apri` | 24 | 51 | — |
| `Cognome` | 85 | 160 | **accesa** |
| `Nome` | 255 | 140 | **accesa** |
| `Mansione` | 405 | 150 | **accesa** |
| `AccountFileMaker` | 565 | 115 | spenta |

**Non mettere `NomeCompleto` sulla scheda.** E' un calcolo
(`Cognome & " " & Nome`, da `06-RELAZIONI.md`): si riempie da solo. Lo usa la
lista `vl_Operatori`, non l'operatore.

---

## E i punti di controllo?

Avranno una scheda tutta loro, la prossima. Non perche' siano difficili, ma
perche' sono **la maschera piu' importante del back office**: e' li' che si
decide cosa il programma controllera' e con quali limiti. Diciannove campi,
dieci tendine, e un campo — `AzioneCorrettiva` — che l'operatore leggera' sul
telefono nel momento peggiore della giornata.
