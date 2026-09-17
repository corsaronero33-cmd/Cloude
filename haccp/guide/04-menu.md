# Scheda 04 — `D_Menu`

Scheda di lavoro passo passo, con il disegno in scala:
<https://claude.ai/artifact/FKXgh6FMjL2NGxS2th9vdb>

Prerequisito: `03-ricerca.md` finita e collaudata.

L'ultima maschera del giro. Dodici pulsanti, di cui **uno solo funziona oggi**:
gli altri undici diranno "non ancora pronto", ed e' giusto cosi'.

Finita questa il giro e' chiuso — **menu, anagrafica, record, indietro** — e da
qui in avanti e' tutta ripetizione.

Il formato **esiste gia'** come segnaposto: occorrenza `IMP|Impresa` (giusta),
parte **Navigazione superiore** (buona scelta, non scorre mai), vuoto e sul
tema `Minimalista`.

---

## Fase 0 — Il record dell'impresa

La tabella `Impresa` e' **vuota**: non c'era fra i file di importazione perche'
quei dati cambiano da cliente a cliente.

1. Vai sul formato nudo `Impresa`, quello nato dall'importazione.
2. `Record` › `Nuovo record`.
3. Compila almeno `RagioneSociale` con il nome del locale.
4. Conferma cliccando fuori dai campi.

**Un record solo, per sempre.** `Impresa` descrive il locale, e il locale e'
uno: un file per ogni ristorante (`04-PRODOTTO.md`). Due record qui dentro
vogliono dire che il menu mostrera' quello sbagliato.

Senza questo record il menu funziona lo stesso, ma la testata resta bianca e
sembra rotta.

---

## Fase 1 — Preparare il formato

1. `D_Menu`, modifica formato (Ctrl+L).
2. **Il tema:** `Formati` › `Cambia tema` › **HACCP**.
3. `Formati` › `Imposta formato` › Generale: togli **Includi nel menu dei
   formati**.
4. Altezze, Ispettore › Posizione:
   - **Navigazione superiore**: da 110 a **100**
   - **Corpo**: da 658 a **440**
5. Larghezza del formato: **685**, come le altre due.

**100 non e' scelto adesso**: e' l'altezza dell'intestazione di
`D_Reparti scheda`. Tenendola uguale, passando dal menu alla scheda la fascia
blu non si muove di un pixel.

---

## Fase 2 — L'intestazione

Il fondo scuro lo porta il tema: sta nel riempimento della parte.

| Oggetto | X | Y | Largh. | Alt. | Aspetto |
|---|---|---|---|---|---|
| Campo `IMP\|Impresa::RagioneSociale` | 24 | 16 | 380 | 36 | stile `Titolo maschera`, **senza bordo e senza riempimento** |
| Testo `REGISTRO HACCP` | 24 | 62 | 380 | 22 | 12 pt, bianco, opacita' ridotta |
| Testo `<<$$UTENTE.Nome>>` | 425 | 18 | 255 | 32 | copialo dalle altre maschere |
| Pulsante `Esci` | 563 | 57 | 117 | 35 | come gli altri pulsanti d'intestazione |

**Qui il titolo e' un CAMPO, non un testo.** Nelle altre due maschere
"Reparto" e "Reparti" sono oggetti testo scritti a mano. Qui e'
`RagioneSociale`, perche' il nome cambia da cliente a cliente: al prossimo
ristorante si cambia un record, non una maschera. E' la stessa regola dei
limiti critici, applicata alla grafica.

**Pulsante `Esci`:** duplica un pulsante dell'intestazione di
`D_Reparti elenco`, incollalo qui, dai le misure, cambia etichetta e azione.
Azione: **Esegui passo script** › `Esci dall'applicazione`. Niente parametro.
Chiude a **680**.

---

## Fase 3 — Stile nuovo: `Titolo gruppo`

Le tre scritte REGISTRI, ANAGRAFICHE, CONFIGURAZIONE.

1. Testo `REGISTRI` a **x 24, y 24**, largo 380, alto 20.
2. **10,5 pt**, semigrassetto, tutto maiuscolo, colore `#1B3A5C`.
3. Ispettore › Aspetto › menu con la freccia › **Salva come nuovo stile** ›
   `Titolo gruppo`.
4. Gli altri due, con lo stile applicato a un clic:
   `ANAGRAFICHE` a y **140**, `CONFIGURAZIONE` a y **328**.
5. `Formati` › **Salva come tema**, risalva su `HACCP`.

Terzo stile nostro, dopo `Titolo maschera`. Tre stili per un'applicazione
intera sono pochi: e' il segno che Blu Apex sta facendo il suo lavoro.

---

## Fase 4 — I dodici pulsanti

Tutti **152 x 60**, quattro per riga. Azione **Esegui script** ›
`90 - Utilita - Vai a`, cambia solo il parametro.

### La griglia

| Conto | Numeri |
|---|---|
| Larghezza utile | 680 − 24 = **656** |
| Quattro pulsanti | 4 × 152 = 608 |
| Tre spazi | 3 × 16 = 48 |
| Totale | 608 + 48 = **656** ✓ |
| Le quattro X | **24 · 192 · 360 · 528** |

L'ultimo pulsante chiude esattamente a **680**.

### I pulsanti

| Etichetta | X | Y | Parametro dello script 90 |
|---|---|---|---|
| *Registri — titolo a y 24* | | | |
| Rilevazioni | 24 | 52 | `"D_Rilevazioni elenco"` |
| Ricevimenti | 192 | 52 | `"D_Ricevimenti elenco"` |
| Non conformità | 360 | 52 | `"D_NonConformita elenco"` |
| Sanificazioni | 528 | 52 | `"D_Sanificazioni elenco"` |
| *Anagrafiche — titolo a y 140* | | | |
| Reparti | 24 | 168 | `"D_Reparti elenco"` ← **l'unico che funziona oggi** |
| Attrezzature | 192 | 168 | `"D_Attrezzature elenco"` |
| Punti di controllo | 360 | 168 | `"D_PuntiControllo elenco"` |
| Fornitori | 528 | 168 | `"D_Fornitori elenco"` |
| Prodotti | 24 | 240 | `"D_Prodotti elenco"` |
| Operatori | 192 | 240 | `"D_Operatori elenco"` |
| *Configurazione — titolo a y 328* | | | |
| Impresa | 24 | 356 | `"D_Impresa scheda"` |
| Parametri | 192 | 356 | `"D_Parametri elenco"` |

**La trappola degli accenti.** L'etichetta si scrive `Non conformità` **con
l'accento**, perche' la legge l'operatore. Il parametro si scrive
`"D_NonConformita"` **senza**, perche' deve corrispondere lettera per lettera
al nome del formato, e i nomi dei formati nel progetto non hanno accenti.
Sbagliando, il pulsante dira' "non ancora pronto" anche il giorno in cui la
maschera esistera'.

**Le virgolette ci vanno**, come per tutti i parametri dello script `90`: e' un
testo fisso. L'unico parametro del progetto senza virgolette e' quello del
trigger della casella di ricerca, che passa un campo.

**In pratica:** fai il primo per intero, poi **Ctrl+D** undici volte cambiando
X, Y, etichetta e parametro.

---

## Fase 5 — Aprire il file sul menu

Lo script `00 - Avvio` porta su `Rilevazioni`, un formato nudo.

1. Apri `00 - Avvio`.
2. Trova il `Vai al formato` che punta a `Rilevazioni`.
3. Cambialo in `Vai al formato [ "D_Menu" ]`, scegliendolo **dall'elenco dei
   formati**, non come calcolo.

E' la prima rata del **debito n. 1** di `../DA-FARE.md`.

---

## Fase 6 — Collaudo

| # | Cosa fai | Deve succedere |
|---|---|---|
| 1 | Esci dal file e riaprilo | Si apre **sul menu**, con il nome del locale e il tuo |
| 2 | Guardi la fascia blu | Alta come nelle altre due maschere: passando non "salta" |
| 3 | Guardi la griglia | Quattro colonne allineate, l'ultimo pulsante finisce dove finisce il nome dell'operatore |
| 4 | Premi **Reparti** | Si apre `D_Reparti elenco`, gia' ordinato |
| 5 | Da li' premi **← Menù** | Torni al menu. **Il giro e' chiuso** |
| 6 | Premi **Prodotti** | "La maschera D_Prodotti elenco non c'e' ancora" |
| 7 | Premi **Non conformità** | Il messaggio deve dire **D_NonConformita**, senza accento |
| 8 | Provi tutti e dodici | Undici dicono "non ancora pronto", nessun errore di FileMaker |
| 9 | Premi **Esci** | FileMaker si chiude |

La prova 7 risparmia mezz'ora fra due mesi: il messaggio rilegge il parametro
com'e', ed e' l'unico momento in cui un accento di troppo si vede prima di
diventare un pulsante muto.

La prova 5 e' il traguardo vero.

---

## Poi

Cinque anagrafiche uguali a questa coppia: **attrezzature, punti di controllo,
fornitori, prodotti, operatori**. Per ognuna: duplichi elenco e scheda, cambi
occorrenza e campi, aggiungi `gCerca` e il suo `91`, accendi il pulsante nel
menu. Lo script `92` non si tocca mai.

La piu' importante e' **Punti di controllo**: e' li' che si decide cosa il
programma controllera' e con quali limiti. Ha una quindicina di campi, quindi
e' anche la prima scheda dove il **riquadro con il titolo di gruppo** torna
utile — quello che sui reparti avevamo tolto perche' era decorazione.
