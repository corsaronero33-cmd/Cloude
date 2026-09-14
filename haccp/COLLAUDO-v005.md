# Collaudo v005 — funzioni e script

Verifica sul file salvato in XML, archiviato in `haccp/ddr/v005/`.

## Quello che e' a posto

**Le 13 funzioni personalizzate ci sono tutte**, con le formule integre:
`pCodice` al posto di `codice` nelle quattro GS1, la ricorsione di `GS1Scorri`
chiusa su se stessa, `PartitaIvaValida` che chiama `Raddoppia`, `Parametro`
che legge `$$PARAMETRI`.

**I cinque script hanno esattamente i passi previsti**, tolti i commenti:

| Script | Passi | Commenti |
|---|---|---|
| `01 - Carica parametri` | 9 | 13 |
| `02 - Riconosci operatore` | 12 | 12 |
| `00 - Avvio` | 5 | 13 |
| `20 - Registra rilevazione` | 47 | 65 |
| `10 - Leggi etichetta` | 26 | 44 |

147 righe di commento su 99 passi. Fra sei mesi si ringrazia.

**Lo script 10 e' corretto**, compreso il punto su cui c'era il dubbio: la
condizione finale e' `IsEmpty ( $lotto ) and IsEmpty ( $scadenza )`, con
`and`, e il `Mostra finestra` sta **dentro** il blocco `Se`. Con il lotto
trovato quella finestra non puo' aprirsi.

**I cinque campi globali** ci sono, e i formati tecnici sono organizzati con
separatori `TECNICI` e `SERVIZIO` nel menu: idea buona, non era chiesta.

---

## Meglio della specifica: il formato nella finestra nuova

La specifica diceva `Nuova finestra` seguita da `Vai al formato`. Nel file il
formato e' impostato **dentro le opzioni di `Nuova finestra`**.

E' piu' pulito: un passo in meno, e soprattutto **nessun istante in cui la
finestra nuova e' aperta sul formato sbagliato**. Con il `Vai al formato`
separato, se qualcuno un giorno sposta o cancella quella riga, il
`Nuovo record` successivo creerebbe una rilevazione invece di una non
conformita'.

Specifica aggiornata di conseguenza.

---

## Due correzioni

### 1. `Insert from Device` scrive nel campo sbagliato — script 10

Il passo punta a **`RigheRicevimento::Quantita`** invece che a
**`RigheRicevimento::CodiceScansionato`**.

Su PC non si vede: quel ramo gira solo su iPhone e iPad, e il collaudo e'
passato dal ramo `Altrimenti`. Sull'iPad pero' la scansione scriverebbe il
codice a barre dentro la quantita', e lascerebbe vuoto il campo che serve.

**Rimedio:** apri lo script `10`, clicca il passo `Inserisci da dispositivo`,
e nella casella del campo di destinazione scegli
`RigheRicevimento::CodiceScansionato`.

### 2. Manca un passo nello script 20

Fra `Conferma record/richieste` e `Chiudi finestra`, dentro il blocco della
non conformita', manca:

```
Imposta variabile [ $idNC ; Valore: NonConformita::Id ]
```

Senza, `$idNC` resta vuoto, e il passo successivo scrive il vuoto dentro
`RIL|Rilevazioni::IdNonConformita`: **il collegamento dalla rilevazione alla
sua non conformita' si perde.**

Il legame inverso regge — `NonConformita::IdRilevazione` viene valorizzato —
quindi la rintracciabilita' non e' persa del tutto, ma dalla rilevazione non si
arriva piu' alla non conformita'. E' anche il motivo per cui la settima prova
non poteva tornare del tutto.

**Rimedio:** aggiungi quel passo subito dopo il `Conferma record/richieste`
che sta prima di `Chiudi finestra`. Attenzione all'ordine: deve stare
**prima** di chiudere la finestra, perche' dopo il record della non
conformita' non e' piu' raggiungibile.

---

## Una rifinitura

`Rilevazioni::gValore` e' di tipo **Testo**: dovrebbe essere **Numero**, come
il campo `Valore` in cui viene travasato. Oggi funziona perche' FileMaker
converte da solo, ma se un operatore scrivesse `3,5o` invece di `3,5` il
testo passerebbe senza protestare e diventerebbe un numero sbagliato.

Cambialo in Numero: e' il campo in cui si scrive la temperatura.
