# Scheda 09 — `D_Operatori`

Scheda di lavoro con le spunte:
<https://claude.ai/artifact/7W533dpYsxZnUc79dBQZzC>

Prerequisito: `08-prodotti.md` completata.

> **Le fasi 4, 5 e 6 sono superate da `11-operatori-accesso.md`**, che
> aggiunge il riquadro dell'accesso al programma: corpo 400 invece di 230,
> nove campi invece di otto, sette colonne invece di sei. Questa scheda
> resta per il metodo e per il perche' di `AccountFileMaker`.

La piu' corta di tutte: **otto campi, un riquadro solo, nessun campo
collegato**. Corpo alto **230**, la scheda piu' bassa del progetto.

E' pero' la tabella che fa funzionare una cosa costruita il primo giorno: il
**nome in testata**. Il campo `AccountFileMaker` e' il ponte fra l'account di
FileMaker e la persona.

---

## Fase 1 — `gCerca`, e una convalida

Tabella **Operatori**, campo `gCerca` Testo, **archiviazione globale**.

Gia' che sei li': su `AccountFileMaker`, `Opzioni` › scheda **Convalida** ›
spunta **Univoco**. Il perche' e' nella fase 5.

## Fase 2 — Lo script `91 - Operatori - Entra nell'elenco`

Duplica quello dei prodotti. `Imposta campo` -> `OPE|Operatori::gCerca`,
`Ordina record` -> **`Cognome` crescente, poi `Nome` crescente**.

**Due criteri e non uno.** In una cucina due Rossi ci sono quasi sempre.
Ordinando per cognome e basta, l'ordine fra i due cambia a ogni ricerca e non
si capisce perche'.

## Fase 3 — Duplicare i due formati

Si parte dai **prodotti**. Occorrenza `OPE|Operatori`. Poi **subito i
parametri**: `← Elenco` -> `"D_Operatori elenco"`, `Apri` e `+ Nuovo` ->
`"D_Operatori scheda"`, `Tutti` -> `91 - Operatori - Entra nell'elenco`.

## Fase 4 — Un riquadro solo

Si cancella **il secondo riquadro** con il suo titolo e **il campo `Note`**:
la tabella `Operatori` non ce l'ha.

Corpo **230**. Il riquadro rimasto: rettangolo y **16**, alto **194**; titolo
y **4**, testo `DATI DELL'OPERATORE`.

**Niente `Note`, ed e' giusto.** Quello che si scriverebbe nelle note di un
operatore — corsi, attestati, scadenze della formazione — e' materia della
tabella **Formazione**, che e' di fase 2. Appiccicarlo a un campo libero
adesso vorrebbe dire ritrovarselo da migrare dopo.

## Fase 5 — Gli otto campi

X di sempre: **44 / 143 / 489 / 588**. Passo **40**.

| Y | Etichetta (x 44) | Campo (x 143) | Etichetta (x 489) | Campo (x 588) | Controllo |
|---|---|---|---|---|---|
| 42 | Cognome | `Cognome` | Account FM | `AccountFileMaker` | — |
| 82 | Nome | `Nome` | Data assunz. | `DataAssunzione` | **calendario** |
| 122 | Mansione | `Mansione` | Data cessaz. | `DataCessazione` | **calendario** |
| 162 | Telefono | `Telefono` | Attivo | `Attivo` | discesa `vl_SiNo` |

### `AccountFileMaker` e' il campo piu' importante, e non si vede perche'

Lo usa lo script `02 - Utilita - Riconosci operatore`, che all'avvio:

1. prende `Get ( AccountName )`, il nome dell'account con cui sei entrato;
2. cerca fra gli operatori chi ha **quel** valore in `AccountFileMaker`;
3. **solo se ne trova esattamente uno** riempie `$$UTENTE.Nome` con
   `NomeCompleto`.

Se non lo trova, in testata compare il **nome dell'account** invece del nome
della persona, e le registrazioni restano senza nome. Non blocca niente: e' un
caso da sistemare in anagrafica.

**Per questo la convalida `Univoco`.** Lo script pretende **un solo** record
trovato: con due operatori sullo stesso account ne troverebbe due e cadrebbe
nel ramo "non ti conosco" senza dire perche'. La convalida fa comparire
l'errore **quando lo digiti**, che e' il momento in cui sai ancora cosa stavi
facendo.

**`NomeCompleto` non va sulla scheda.** E' un calcolo (`Cognome & " " & Nome`,
da `06-RELAZIONI.md`): si riempie da solo. Lo usano la lista `vl_Operatori` e
lo script `02`.

**Un operatore che se ne va non si cancella mai.** Si mette `Attivo` a `No` e
si compila `DataCessazione`. Il suo nome e' sulle rilevazioni, sulle
sanificazioni e sulle non conformita' degli anni passati, e quei registri
devono restare leggibili: cancellando il record, un'ispezione troverebbe firme
senza firmatario.

## Fase 6 — L'elenco: sei colonne

| Colonna | X | Largh. | Campo | Ricerca rapida |
|---|---|---|---|---|
| `Apri` | 24 | 51 | gia' li' | — |
| Cognome | 85 | 200 | `Cognome` | **accesa** |
| Nome | 295 | 180 | `Nome` | **accesa** |
| Mansione | 485 | 200 | `Mansione` | **accesa** |
| Account FM | 695 | 140 | `AccountFileMaker` | spenta |
| Attivo | 845 | 91 | `Attivo` | spenta |

L'ultima colonna chiude a **936**.

**`AccountFileMaker` sta nell'elenco anche se non si cerca.** Serve a vederlo:
con la colonna li', ti accorgi a colpo d'occhio di chi ha la casella vuota —
cioe' di chi comparira' in testata come nome di account invece che come
persona.

## Fase 7 — La ricerca

Casella su `OPE|Operatori::gCerca`, parametro del trigger
`OPE|Operatori::gCerca` (senza virgolette), trigger del formato su
`91 - Operatori - Entra nell'elenco`.

Spunte accese su `Cognome`, `Nome`, `Mansione`; spente su account, `Attivo` e
sulla casella.

## Fase 8 — Il pulsante nel menu

Niente da fare.

## Fase 9 — Collaudo

Dodici prove. Le prime otto sono le solite; le ultime quattro chiudono un
cerchio aperto il primo giorno:

- **9.9** — sul **tuo** record, in `Account FM`, scrivi il nome dell'account
  con cui entri. Se non lo ricordi: `Strumenti` › `Visualizzatore dati`,
  scheda **Corrente**, espressione `Get ( AccountName )`.
- **9.10** — esegui `00 - Avvio`.
- **9.11** — in testata compare **il tuo nome e cognome** al posto del nome
  dell'account.
- **9.12** — svuoti il campo, riesegui `00 - Avvio`, e torna il nome
  dell'account. Rimetti il valore e riesegui.

**La 9.11 chiude un cerchio.** Quel `<<$$UTENTE.Nome>>` l'avevi messo
nell'intestazione della prima maschera, quando non c'era nessun operatore in
tabella: fino a ieri mostrava il nome dell'account. Da oggi mostra una
persona, e ogni rilevazione sapra' chi l'ha fatta **senza chiederlo**.

**La 9.12 e' la prova del guasto**, e vale la pena farla davvero. Quando fra
un mese il ristoratore dira' "in alto a destra c'e' scritto una cosa strana",
saprai in tre secondi dove guardare.

---

## Poi

Resta **Punti di controllo**, l'ultima anagrafica e la piu' importante:
diciannove campi, dieci tendine, due campi collegati e `AzioneCorrettiva`, il
testo che l'operatore leggera' sul telefono nel momento peggiore della
giornata.

E' li' che si decide **cosa il programma controllera' e con quali limiti**.
