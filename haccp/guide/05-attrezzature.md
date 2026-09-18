# Scheda 05 — `D_Attrezzature`

Scheda di lavoro passo passo, con il disegno in scala:
<https://claude.ai/artifact/7hD4LvSbe72WNeMLaV3dDM>

Prerequisito: `04-menu.md` finita e collaudata.

La prima anagrafica duplicata dallo stampo dei reparti. **Una maschera per
volta**: Fornitori, Prodotti e Operatori dopo, con la stessa procedura.

Porta due cose nuove: i **riquadri** per le schede con tanti campi, e il
**campo collegato** — un UUID che l'operatore non deve vedere mai.

Dieci fasi. Le stesse dieci varranno per le prossime quattro anagrafiche:
cambiano i campi, non i passi.

---

## Fase 1 — Il campo `gCerca`

| # | Dove sei | Cosa fai |
|---|---|---|
| 1 | | `File` › `Gestisci` › `Database` (Ctrl+Maiusc+D) |
| 2 | Finestra **Gestisci database** | Scheda **Campi**. Tendina **Tabella** in alto: **Attrezzature** |
| 3 | In basso | **Nome campo** `gCerca`, **Tipo** Testo, premi **Crea** |
| 4 | Con `gCerca` selezionato | Premi **Opzioni** |
| 5 | Finestra **Opzioni per il campo** | Scheda **Archiviazione**: spunta **Usa archiviazione globale (un valore per file)** |
| 6 | | **OK**, poi **OK** |

Saltando il passo 5 il campo diventa normale: scrivendo nella casella di
ricerca scriveresti **dentro il record** su cui sei. Lo verifica la prova 11.

---

## Fase 2 — Lo script `91 - Attrezzature - Entra nell'elenco`

Non si scrive: si duplica quello dei reparti e si cambiano **due** cose.

| # | Dove sei | Cosa fai |
|---|---|---|
| 1 | | `Script` › `Area di lavoro Script` (Ctrl+Maiusc+S) |
| 2 | Elenco a sinistra | `91 - Reparti - Entra nell'elenco`, tasto destro › **Duplica** |
| 3 | Sulla copia | Tasto destro › **Rinomina**: `91 - Attrezzature - Entra nell'elenco` |
| 4 | Passo `Imposta campo` | Doppio clic › **Specifica**: e' ancora `REP\|Reparti::gCerca`. Cambia l'occorrenza in **`ATT\|Attrezzature`** e scegli `gCerca` |
| 5 | Passo `Ordina record` | Doppio clic: i criteri sono ancora quelli dei reparti. **Cancellali** e metti `ATT\|Attrezzature::Codice` crescente |
| 6 | `Mostra tutti i record` | Non si tocca: non nomina nessuna tabella |
| 7 | | Chiudi e **salva** |

**I passi 4 e 5 sono la trappola della duplicazione.** FileMaker duplica lo
script **con dentro i riferimenti vecchi** e non te lo dice. Un
`Ordina record` lasciato sui reparti non da' errore: ordina secondo una
tabella che non c'entra, cioe' non ordina.

**Sì, lo stesso numero 91.** Non e' un progressivo: il numero dice *che tipo
di script e'*, e l'ambito in mezzo dice *di quale tabella*. Avranno tutti `91`
anche fornitori, prodotti, operatori e punti di controllo — cosi' nell'elenco
degli script stanno insieme e si vede che sono la stessa cosa su sei tabelle.
Con 93, 94, 95 diventerebbero sei script scollegati. La regola completa e' in
`../CLAUDE.md`.

**Perche' `Codice` e non `Ordine`.** I reparti hanno `Ordine` perche' si
vogliono in un ordine deciso da noi. Le attrezzature no: quel campo non esiste
nella tabella, e l'ordine alfabetico di codice e' quello giusto.

---

## Fase 3 — Duplicare i due formati

### 3a — La scheda

| # | Dove sei | Cosa fai |
|---|---|---|
| 1 | Su `D_Reparti scheda` | Ctrl+L |
| 2 | | `Formati` › **Duplica formato** |
| 3 | `Formati` › `Imposta formato`, Generale | **Nome formato**: `D_Attrezzature scheda` |
| 4 | Stessa finestra | **Mostra record da**: **`ATT\|Attrezzature`** — il passo che cambia tutto |
| 5 | Stessa finestra | **Includi nel menu dei formati**: spento |

**Appena chiudi quella finestra i quattro campi smettono di funzionare.**
Puntano ancora a `REP|Reparti::Codice` e compagnia, che da questo formato non
si raggiungono piu'. E' normale: la fase 4 li butta via.

### 3b — L'elenco

Stessa cosa da `D_Reparti elenco`: nome `D_Attrezzature elenco`, occorrenza
`ATT|Attrezzature`. Il tipo di vista **Elenco** si porta dietro da solo.

### 3c — I parametri, subito

**Prima di toccare i campi**, se no ci si dimentica.

| Formato | Pulsante | Parametro ora | Parametro nuovo |
|---|---|---|---|
| `D_Attrezzature scheda` | `← Elenco` | `"D_Reparti elenco"` | `"D_Attrezzature elenco"` |
| `D_Attrezzature elenco` | `Apri` (nel corpo) | `"D_Reparti scheda"` | `"D_Attrezzature scheda"` |
| `D_Attrezzature elenco` | `← Menù` | `"D_Menu"` | **non si tocca** |
| `D_Attrezzature elenco` | `Tutti` | script `91 - Reparti...` | script **`91 - Attrezzature - Entra nell'elenco`** |

**E' il passo che tutti saltano.** Nessuno di questi sbagli da' un messaggio:
premi `Apri` su un'attrezzatura e ti si apre un reparto.

### 3d — I titoli

Scheda: da `Reparto` a **`Attrezzatura`**. Elenco: da `Reparti` a
**`Attrezzature`**.

---

## Fase 4 — La scheda: svuotare il corpo e fare i riquadri

1. Seleziona nel **Corpo** i quattro campi e le quattro etichette, **Canc**.
   Non si recuperano: la griglia nuova ha misure diverse (etichette da 150 a
   88, campi da 329 a 200) e ridisegnarli e' piu' veloce che correggerli.
2. Parte **Corpo** › Ispettore › Posizione › **Altezza 500**.
3. **Rettangolo** del primo riquadro, misure dalla tabella. Riempimento
   bianco, bordo 1 pt, raggio 4.
4. **Testo** del titolo, poi Ispettore › Aspetto › stile **`Titolo gruppo`**,
   quello salvato per il menu.
5. **Linea**, con Maiusc premuto.
6. Seleziona i tre oggetti insieme, **Ctrl+D**, e dai al duplicato le misure
   del secondo riquadro. Cambia il testo del titolo.

| Oggetto | X | Y | Largh. | Alt. |
|---|---|---|---|---|
| **Riquadro 1** | | | | |
| Rettangolo | 24 | 20 | 656 | 208 |
| Testo `DATI DELL'ATTREZZATURA` | 44 | 32 | 320 | 16 |
| Linea | 44 | 56 | 616 | 1 |
| **Riquadro 2** | | | | |
| Rettangolo | 24 | 244 | 656 | 236 |
| Testo `TEMPERATURE E MANUTENZIONE` | 44 | 256 | 320 | 16 |
| Linea | 44 | 280 | 616 | 1 |

**Perche' due riquadri.** Il criterio non e' il numero di campi, e'
l'argomento: **chi e'** l'attrezzatura, e **come va tenuta**. Uno guarda il
primo quando cerca "quale frigo e'", il secondo quando cerca "quando l'ho
tarato". Se un campo non sai dove metterlo, probabilmente manca un riquadro.

**La regola generale**, valida per le prossime quattro: fino a **5** campi una
colonna e niente riquadro; da **6 a 10** due colonne e un riquadro; **oltre
10** due colonne e un riquadro per argomento.

---

## Fase 5 — La scheda: i quattordici campi

### Prima la coppia di riferimento

1. **Campo**: disegnalo nel riquadro 1. Nella finestra di scelta, la tendina
   dell'occorrenza in alto dev'essere **`ATT|Attrezzature`**. Scegli `Codice`.
2. Ispettore › Posizione: **x 143, y 72, largh. 200, alt. 32**.
3. L'etichetta creata in automatico: **x 44, y 72, largh. 88, alt. 32**,
   allineata a **destra**.
4. Ora hai la coppia campione. **Selezionala tutta** e **Ctrl+D** per ogni
   riga: cambia solo la **Y** (+36) e il campo.
5. Per la colonna destra: duplica una coppia, etichetta a **x 361**, campo a
   **x 460**.

Le X sono quattro sole: **44** e **361** per le etichette (larghe 88), **143**
e **460** per i campi (larghi 200). La colonna destra chiude a **660**.

### Riquadro 1

| Y | Etichetta (x 44) | Campo (x 143) | Controllo | Etichetta (x 361) | Campo (x 460) | Controllo |
|---|---|---|---|---|---|---|
| 72 | Codice | `Codice` | — | Matricola | `Matricola` | — |
| 108 | Descrizione | `Descrizione` | — | Marca | `Marca` | — |
| 144 | Tipo | `Tipo` | **tendina** `vl_TipoAttrezzatura` | Modello | `Modello` | — |
| 180 | Reparto | `IdReparto` | **tendina** `vl_Reparti` | Anno | `AnnoInstallazione` | a destra |

### Riquadro 2

| Y | Etichetta (x 44) | Campo (x 143) | Controllo | Etichetta (x 361) | Campo (x 460) | Controllo |
|---|---|---|---|---|---|---|
| 296 | Temp. min | `TemperaturaMin` | a destra | Ultima manut. | `DataUltimaManutenzione` | — |
| 332 | Temp. max | `TemperaturaMax` | a destra | Prossima manut. | `DataProssimaManutenzione` | — |
| 368 | Attivo | `Attivo` | **tendina** `vl_SiNo` | | | |
| 404 | Note | `Note` | **x 143, largh. 517, alt. 60** — arriva a 660 | | | |

**Le tendine si mettono dopo.** Disegna prima tutti e quattordici i campi, poi
torna sui tre che le vogliono: `Formato` › `Controllo` › Menu a discesa.

**Le etichette sono corte per forza.** Larghe 88 non ci sta "Ultima
manutenzione": si scrive **"Ultima manut."**. E' il prezzo delle due colonne.

---

## Fase 6 — Il campo collegato

`IdReparto` contiene un **UUID**: trentasei caratteri senza significato.
La soluzione e' **diversa sulla scheda e sull'elenco**.

| Dove | Quale campo | Come | Perche' |
|---|---|---|---|
| **Scheda** | `ATT\|Attrezzature::IdReparto` | `Formato` › `Controllo` › Menu a discesa, lista `vl_Reparti` | qui si **sceglie**: vedi "Cucina", il database scrive l'UUID |
| **Elenco** | `ATT\|Reparti::Descrizione` | campo normale | qui si **legge**: trenta tendine su trenta righe non servono |

**Sono due campi diversi, non lo stesso formattato in due modi.** Il secondo
appartiene a un'altra tabella e si vede grazie alla relazione dell'ancora
`ATT`. Disegnandolo sull'elenco devi **cambiare la tendina dell'occorrenza in
alto**, da `ATT|Attrezzature` a `ATT|Reparti`.

La lista `vl_Reparti` **mostra** `Descrizione` e **scrive** `Id`: e' gia'
fatta cosi' in `06-RELAZIONI.md`.

---

## Fase 7 — L'elenco: le cinque colonne

1. Nel **Corpo**, cancella i quattro campi vecchi. Il pulsante `Apri` tienilo.
2. Nell'**Intestazione**, cancella le quattro etichette di colonna (y 115).
3. Disegna i quattro campi nel corpo, poi le quattro etichette.
4. Ai campi del corpo togli **bordo** e **riempimento**, tutti insieme.

| Colonna | X | Largh. | Campo nel corpo (y 1, alt. 28) | Etichetta (y 115, alt. 22) |
|---|---|---|---|---|
| `Apri` | 24 | 51 | gia' li' | *nessuna* |
| Codice | 85 | 110 | `ATT\|Attrezzature::Codice` | `CODICE` |
| Descrizione | 205 | 230 | `ATT\|Attrezzature::Descrizione` | `DESCRIZIONE` |
| Tipo | 445 | 110 | `ATT\|Attrezzature::Tipo` | `TIPO` |
| Reparto | 565 | 115 | **`ATT\|Reparti::Descrizione`** | `REPARTO` |

Etichetta e campo devono avere **la stessa X e la stessa larghezza**.
L'ultima colonna chiude a **680**. `Tipo` nell'elenco resta un campo normale:
niente tendina.

---

## Fase 8 — La ricerca

Casella e pulsante `Tutti` sono arrivati con la duplicazione. Vanno
**ripuntati** in tre punti.

| # | Cosa | Come |
|---|---|---|
| 1 | La **casella** punta a `REP\|Reparti::gCerca` | Doppio clic, cambia l'occorrenza in `ATT\|Attrezzature`, scegli `gCerca` |
| 2 | Il **trigger** della casella passa il campo dei reparti | Tasto destro › `Imposta trigger di script` › `OnObjectSave` › `Specifica script`: lo script `92` resta, cambia il **Parametro script facoltativo** in `ATT\|Attrezzature::gCerca` — **senza virgolette** |
| 3 | Il **trigger del formato** chiama `91 - Reparti` | `Imposta formato` › `Trigger di script` › `OnLayoutEnter` → **`91 - Attrezzature - Entra nell'elenco`** |

### Le spunte della Ricerca rapida

| Campo | Spunta | Perche' |
|---|---|---|
| `Codice` | **accesa** | il modo piu' veloce di trovare un'attrezzatura |
| `Descrizione` | **accesa** | e' quello che la gente ricorda |
| `Tipo` | **accesa** | vedi la nota |
| `ATT\|Reparti::Descrizione` | spenta | pochi reparti, cercarli non restringe |
| `gCerca` | spenta | cercherebbe dentro se stessa |

**Su `Tipo` la spunta resta accesa, e sembra contraddire la regola.** Avevo
detto: spegnila sui campi con poche parole ripetute. La differenza vera pero'
non e' quante parole diverse ci sono, e' **quanto la ricerca restringe**. Con
sei o sette tipi su trenta attrezzature, cercare `frigo` lascia cinque righe.
Con `Si`/`No` non restringe niente.

La regola giusta, da portarsi dietro: **accendi dove cercare serve a togliere
righe**.

---

## Fase 9 — Il pulsante nel menu

**Non c'e' niente da fare.** Il pulsante **Attrezzature** su `D_Menu` ha gia'
il parametro `"D_Attrezzature elenco"`: fino a ieri diceva "non ancora
pronto", da oggi funziona.

E' la ricompensa della scelta fatta al menu: ogni anagrafica si accende da se'
il giorno in cui esiste.

---

## Fase 10 — Collaudo

| # | Cosa fai | Deve succedere |
|---|---|---|
| 1 | Dal menu premi **Attrezzature** | Si apre l'elenco. Non dice piu' "non ancora pronto" |
| 2 | Guardi le colonne | Ogni titolo esattamente sopra la sua colonna |
| 3 | `+ Nuovo` | Due riquadri, titolo **Attrezzatura**, etichette non tagliate |
| 4 | Clicchi su **Tipo** | Tendina con i tipi di attrezzatura |
| 5 | Clicchi su **Reparto** | Tendina con **Cucina** e **Magazzino secco**, non stringhe di 36 caratteri |
| 6 | Compili `FRI-01` / `Frigo verdure` / Frigorifero / Cucina, poi `← Elenco` | La colonna **Reparto** dice **Cucina**: la relazione funziona |
| 7 | Crei `FOR-01` / `Forno` nell'altro reparto | Due righe, **in ordine di codice**: FOR prima di FRI |
| 8 | `Apri` sulla **seconda** riga | Si apre **quella** attrezzatura. Se si apre un reparto, hai saltato la fase 3c |
| 9 | Cerchi `frigo` | Resta il frigo: ha trovato per **tipo**, non per codice |
| 10 | Premi `Tutti` | Tornano tutte, in ordine, casella vuota |
| 11 | Apri un'attrezzatura e guarda i campi | `gCerca` e' **vuoto** nel record |
| 12 | `← Menù`, poi **Attrezzature**, poi **Reparti** | Funzionano e **non si disturbano**: hanno `gCerca` e script `91` separati |

La prova 5 e' quella che conta: se vedi gli UUID, o la lista non e'
`vl_Reparti` o il campo e' sbagliato.

La prova 12 dimostra che la duplicazione e' pulita. Se le due anagrafiche si
disturbano, due formati puntano allo stesso `gCerca`.

---

## Poi

Fatta questa, la prossima e' **Fornitori**, con la stessa identica procedura:
cambiano i campi e le colonne, le dieci fasi no. Poi **Prodotti**, poi
**Operatori**. Per ultima **Punti di controllo**, che avra' piu' spazio.

---

## Appendice — i dati delle prossime tre

Non servono adesso. Sono qui per non riaprire il DDR ogni volta.

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
