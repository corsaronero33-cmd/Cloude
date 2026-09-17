# Collaudo v008 — la ricerca

Fonte: `ddr/v008/HACCP_Revisione_6.xml` (Salva come XML, 17/09/2026).

**Esito: un bug che impedisce alla ricerca di funzionare**, un punto minore, e
un errore mio da correggere nella specifica.

---

## Verificato e a posto

| | |
|---|---|
| Campo | `Reparti::gCerca`, tipo **Testo**, `Storage global="True"` |
| Script | `91 - Reparti - Entra nell'elenco` (rinominato) e `92 - Utilita - Cerca` (nuovo) |
| Trigger di formato | `OnLayoutEnter` -> `91 - Reparti - Entra nell'elenco`, attivo in Navigazione. FileMaker ha seguito il rinomino da solo, come previsto |
| Casella sul formato | `REP|Reparti::gCerca`, nell'intestazione |
| Pulsante `Tutti` | -> `91 - Reparti - Entra nell'elenco`, **parametro vuoto**: esattamente giusto |

---

## Il bug: il trigger della casella non passa il parametro

```
Edit Box  REP|Reparti::gCerca
   TRIGGER OnObjectExit -> 92 - Utilita - Cerca | PARAMETRO: (vuoto)
```

**Cosa succede, passo per passo:**

1. Scrivi `cuc` nella casella e premi Invio.
2. Parte il trigger e chiama `92` **senza parametro**.
3. Passo 05: `$cerca = Get ( ParametroScript )` -> **vuoto**.
4. Passo 07: `IsEmpty ( $cerca )` -> **vero**.
5. Passo 08: `Mostra tutti i record`.
6. Passo 09: `Esci dallo script`.

Risultato: **la ricerca non cerchera' mai niente.** Scrivi `cuc`, e ti
ritrovi tutti i reparti. Nessun messaggio, nessun errore: sembra solo che non
abbia trovato quello che cercavi.

`Esegui ricerca rapida` non viene mai raggiunto.

**La correzione.** Sulla casella: tasto destro -> `Imposta trigger di script`
-> la riga dell'evento -> `Specifica script` -> riquadro **Parametro script
facoltativo**:

```
REP|Reparti::gCerca
```

**Senza virgolette**, perche' quel riquadro e' un calcolo e deve leggere il
contenuto del campo, non il suo nome.

---

## Punto minore: `OnObjectExit` invece di `OnObjectSave`

Con il parametro corretto funzionerebbero tutti e due. La differenza:

| | Quando scatta |
|---|---|
| `OnObjectSave` | solo se **hai cambiato** il contenuto, quando esci |
| `OnObjectExit` | **ogni volta** che esci, anche senza aver scritto niente |

C'e' un caso in cui si sente. Il cursore e' nella casella, clicchi `Apri` su
una riga: con `OnObjectExit` uscire dal campo fa comunque partire la ricerca,
il gruppo trovato cambia sotto al clic, e `Apri` puo' portarti su un record
diverso da quello che avevi puntato. Con `OnObjectSave`, non avendo scritto
niente, non succede nulla.

Consiglio di spostarlo su `OnObjectSave`: nella stessa finestra, togli la
spunta da `OnObjectExit` e mettila su `OnObjectSave`, poi rimetti lo script e
**il parametro**.

---

## Errore mio: il margine destro non e' 24

Avevo scritto che la casella "chiude a 661, cioe' 24 dal bordo, come tutto il
resto". **E' sbagliato.**

Nel file il bordo destro del contenuto e' **680**, ed e' li' da sempre:

| Oggetto | X | Largh. | Finisce a |
|---|---|---|---|
| `<<$$UTENTE.Nome>>` | 425 | 255 | **680** |
| Colonna `Attivo` | 610 | 70 | **680** |
| Casella `gCerca` (tua) | 273 | 307 | 580 |
| Pulsante `Tutti` (tuo) | 585 | 95 | **680** |

Hai allineato i due oggetti nuovi a 680, cioe' con il nome dell'operatore e
con l'ultima colonna. **Giusto tu**, e le misure che ti avevo dato vanno
corrette, non il file.

Il formato e' largo 685: margine sinistro 24, destro 5. Asimmetrico, ma e'
cosi' da prima della ricerca e la coerenza interna vale piu' della simmetria.
`13-LAYOUT.md` e `13c-RICERCA.md` sono aggiornati con i numeri veri.

---

## Le altre differenze, tutte benigne

| | Specifica | File | Giudizio |
|---|---|---|---|
| Casella, larghezza | 180 | **307** | meglio: piu' spazio per scrivere |
| Casella, altezza | 35 | 32 | i pulsanti accanto sono 35; differenza impercettibile |
| `Tutti`, largh. | 73 | **95** | e' il ripiego che avevo descritto per il testo tagliato |
| Corpo dell'elenco | 32 | **30** | i campi (y 1, alt. 28) ci stanno; righe appena piu' strette |

---

## Cosa questo file NON permette di verificare

1. **I passi degli script `91` e `92`.** L'esportazione `Salva come XML` porta
   i formati per intero ma non il corpo degli script — vale anche per tutte le
   esportazioni precedenti. Si verificano dal comportamento.
2. **Le spunte della Ricerca rapida campo per campo.** Non compaiono
   nell'XML. Si verificano con la **prova 5** del collaudo: cercando `si`, se
   escono tutti i reparti la spunta e' rimasta su `Attivo`.

---

## Ritocchi di `COLLAUDO-v007.md` ancora aperti

| | Stato |
|---|---|
| A — `Apri` da x 1 a x 24, colonne a 85 / 264 | **non fatto**: `Apri` e' ancora a x 1 |
| B — etichetta `Ordine` da y 113 a y 115 | **non fatto** |
| C — scheda larga come l'elenco | **non fatto**: la scheda finisce a 452, l'elenco a 685 |
| D — stile `Titolo Riquadro` -> `Titolo maschera` | **non fatto** |
| E — `D_Menu` sul tema `HACCP` | **non fatto**: e' ancora `Minimalista` |

Nessuno di questi impedisce di andare avanti. Il **parametro del trigger**
si'.
