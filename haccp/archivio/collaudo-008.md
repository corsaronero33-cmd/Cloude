# Collaudo v008 — la ricerca

Fonte: `ddr/v008/HACCP_Revisione_6.xml` (Salva come XML, 17/09/2026).

**Esito: la ricerca funziona, verificata sul file reale.** Nessun errore nel
file. Due errori miei, corretti qui: avevo segnalato un parametro mancante che
c'era, e avevo dato una misura sbagliata nella specifica.

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

## Errore mio: avevo dato il parametro per mancante

Avevo scritto che il trigger della casella chiama `92` senza parametro e che
quindi la ricerca non avrebbe mai cercato niente. **Falso.** Il parametro c'e'
ed e' quello giusto:

```xml
<ScriptTrigger action="OnObjectExit">
  <ScriptReference name="92 - Utilita - Cerca">
    <Calculation><Text>REP|Reparti::gCerca</Text></Calculation>
  </ScriptReference>
</ScriptTrigger>
```

Il parametro sta dentro `<ScriptReference>`, non fra i figli diretti di
`<ScriptTrigger>`; il mio lettore lo cercava solo al primo livello e non lo
trovava. Errore dello strumento con cui leggo il DDR, non del file.

**Da qui in avanti**, quando verifico un trigger leggo tutto il sottoalbero,
non solo i figli diretti. La ricerca nel file reale funziona.

---

## Unica osservazione rimasta: `OnObjectExit` invece di `OnObjectSave`

Funzionano tutti e due, ed e' verificato che funziona. La differenza:

| | Quando scatta |
|---|---|
| `OnObjectSave` | solo se **hai cambiato** il contenuto, quando esci |
| `OnObjectExit` | **ogni volta** che esci, anche senza aver scritto niente |

Il caso in cui si sente: il cursore e' nella casella, clicchi `Apri` su una
riga. Con `OnObjectExit` uscire dal campo fa comunque ripartire la ricerca, il
gruppo trovato cambia sotto al clic, e `Apri` puo' portarti su un record
diverso da quello puntato.

Non e' urgente e non e' un errore: se capitera' di aprire il reparto sbagliato
cliccando `Apri` con il cursore ancora nella casella, la causa e' questa.

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
`../09-MASCHERE.md` e `../guide/03-ricerca.md` sono aggiornati con i numeri veri.

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

## Ritocchi di `collaudo-007.md` ancora aperti

| | Stato |
|---|---|
| A — `Apri` da x 1 a x 24, colonne a 85 / 264 | **non fatto**: `Apri` e' ancora a x 1 |
| B — etichetta `Ordine` da y 113 a y 115 | **non fatto** |
| C — scheda larga come l'elenco | **non fatto**: la scheda finisce a 452, l'elenco a 685 |
| D — stile `Titolo Riquadro` -> `Titolo maschera` | **non fatto** |
| E — `D_Menu` sul tema `HACCP` | **non fatto**: e' ancora `Minimalista` |

Nessuno di questi impedisce di andare avanti. Sono raccolti, insieme a tutto
il resto di aperto, in `../DA-FARE.md`.
