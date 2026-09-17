# Collaudo v007 — le due maschere desktop

Fonte: `ddr/v007/HACCP_Revisione_5.xml` (Salva come XML, 17/09/2026) piu' due
videate a schermo intero.

**Esito: nessun errore.** Tutto quello che doveva funzionare funziona. Quello
che segue sono differenze rispetto alla specifica — quasi tutte migliorie che
diventano lo standard — e cinque ritocchi.

---

## Cosa e' verificato

| | |
|---|---|
| Tema | `HACCP`, `baseName = com.filemaker.theme.apex_blue` — copia di Blu Apex, come previsto |
| Colore intestazione | `rgba(10.5882%, 22.7451%, 36.0784%)` = **#1B3A5C** esatto |
| Occorrenze | `REP\|Reparti` su entrambi i formati |
| Pulsanti scheda | `Elenco` -> script 90 con parametro `"D_Reparti elenco"`; `Nuovo` -> Nuovo record; `Elimina` -> Elimina record **con finestra di conferma** |
| Pulsanti elenco | `Menù` -> script 90 con parametro `"D_Menu"` (senza accento: giusto); `Elimina` rimosso |
| `Apri` di riga | script 90 con parametro `"D_Reparti scheda"` |
| Tendina | `Attivo` sulla scheda e' Drop-down List con `vl_SiNo`; sull'elenco e' campo normale |
| Campi del corpo elenco | sfondo trasparente e bordi spenti su tutti e quattro |
| Allineamento colonne | **perfetto**: ogni etichetta ha la stessa X e la stessa larghezza del campo sotto |
| Trigger | `OnLayoutEnter` su `D_Reparti elenco` -> `91 - Reparti - Ordina elenco`, attivo in Navigazione e in Trova |
| Ordinamento | la videata mostra `Totale (Ordinati)` e le righe 10 poi 40: **regge dopo `Mostra tutti i record`** |
| Campi di sistema | fuori da entrambi i formati |

Il dubbio sollevato in `13b` fase 6 e' chiuso: l'ordinamento sopravvive al
`Mostra tutti i record` dello script 90. Non serve spostare niente.

**Limite di questa verifica:** l'esportazione XML porta i formati per intero
ma **non i passi degli script**. Lo script `91` risulta esistere, non ho potuto
rileggerne il testo. E' verificato dal suo effetto, che e' comunque la prova
che conta.

---

## Le modifiche fatte durante la costruzione

Sono migliorie. **Vince il file**: diventano lo standard, e le misure sono
riportate in `../09-MASCHERE.md`, sezione *Misure standard*.

### 1. I pulsanti stanno sul blu, con l'icona

Via la fascia bianca sotto l'intestazione: i tre pulsanti sono piatti sul fondo
scuro, testo bianco e icona SVG (freccia, piu', cestino). Sono 117 x 35, a
passo 122.

E' meglio della specifica. Si legge come una barra degli strumenti invece che
come una seconda fascia, e l'intestazione resta un blocco solo.

Conseguenza: **niente pulsante "principale" in colore pieno.** Su fondo blu un
pulsante blu sparirebbe. A distinguere `Elimina` ci pensa l'icona del cestino,
che e' un segnale piu' forte del colore.

### 2. Via il riquadro bianco e il titolo di sezione

Sulla scheda non ci sono piu' ne' il rettangolo bianco, ne' "DATI DEL REPARTO",
ne' la linea. Quattro campi su fondo chiaro, e basta.

Giusto: con quattro campi il riquadro era decorazione. **Torna utile quando i
campi sono tanti** — `PuntiControllo` ne ha una quindicina e li' i gruppi
servono davvero a leggere.

### 3. Tutti i campi della scheda larghi uguali

Non piu' 120 / 400 / 80 / 100 a seconda del contenuto, ma **tutti 329**.
La colonna dei campi diventa un blocco unico e l'occhio scende dritto.

Il prezzo e' un campo `Ordine` largo 329 per ospitare "10". Accettabile: la
regolarita' vale piu' della precisione.

### 4. Il contatore in quattro oggetti

`Record` + `{{RecordNumber}}` + `Di` + `{{FoundCount}}`, con i due simboli su
fondo grigio chiaro. Si distingue a colpo d'occhio cosa e' testo fisso e cosa
e' un numero che cambia.

### 5. Misure piu' generose

Campi alti **32** e non 29, passo **36** e non 38, piede **38** e non 34,
pulsanti **35** e non 28. E' la risposta al controllo che avevo messo nella
fase 4 di `13a`: con il corpo del testo di Blu Apex, 29 stringeva.

---

## I cinque ritocchi

### A. `Apri` tocca il bordo sinistro — x da 1 a 24

Il pulsante `Apri` sta a **x 1**, mentre in tutto il resto del progetto il
margine sinistro e' 24. Nella videata si vede: tocca il bordo della finestra.

Spostandolo a 24 finirebbe sotto `Codice`, che parte da 57. Quindi si spostano
anche le due colonne di sinistra, lasciando intatta la destra:

| Colonna | X ora | X nuova | Largh. ora | Largh. nuova |
|---|---|---|---|---|
| `Apri` | 1 | **24** | 51 | 51 |
| `Codice` | 57 | **85** | 169 | 169 |
| `Descrizione` | 226 | **264** | 314 | **276** |
| `Ordine` | 540 | 540 | 70 | 70 |
| `Attivo` | 610 | 610 | 70 | 70 |

Le etichette di colonna vanno spostate **insieme** ai campi: stessa X, stessa
larghezza. Il modo sicuro e' selezionare etichetta e campo insieme e muoverli
con le frecce, non uno per volta.

### B. L'etichetta `Ordine` e' due punti piu' in alto

Sta a **y 113**, le altre tre a **y 115**. Si nota appena, ma si nota.
Portala a 115.

### C. Le due maschere non sono larghe uguali

`D_Reparti elenco` e' larga **685**. `D_Reparti scheda` e' circa **493**
(l'oggetto piu' a destra sta a 452). Passando da una all'altra la finestra
cambia misura.

Porta la **scheda a 685** e sposta `<<$$UTENTE.Nome>>` a **x 425**, come
nell'elenco. I campi restano dove sono: una scheda con i campi a sinistra e
dell'aria a destra e' normale, la finestra che salta no.

### D. Lo stile si chiama `Titolo Riquadro` ma non e' piu' un titolo di riquadro

E' applicato al titolo bianco dell'intestazione su entrambi i formati, e i
riquadri non esistono piu'. **Rinominalo `Titolo maschera`** e risalva il tema:
fra sei mesi il nome deve dire cosa fa.

### E. `D_Menu` esiste ma e' vuoto, e sul tema sbagliato

Il formato c'e' (occorrenza `IMP|Impresa`, giusta) ma non contiene nessun
oggetto e usa il tema **Minimalista**, non `HACCP`.

Va bene come segnaposto — e' quello che ha fatto funzionare il pulsante `Menù`.
Prima di costruirlo: `Formati` -> `Cambia tema` -> **HACCP**.

Ha una parte **Navigazione superiore** invece di una Intestazione, ed e' una
buona idea: quella parte non scorre mai. La teniamo.
