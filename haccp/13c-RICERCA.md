# Passo 5c — La ricerca sugli elenchi

Scheda di lavoro passo passo, con il disegno e i calcoli da copiare:
<https://claude.ai/artifact/M8YkvJgCjPHtiLcYYAxM81>

Prerequisiti: `13b-D_REPARTI-ELENCO.md` finito e i **cinque ritocchi** di
`COLLAUDO-v007.md` applicati (la casella va in un formato largo 685).

## Prima: oggi si cerca gia'

`Ctrl+F`, si scrive, `Invio`. La ricerca di FileMaker funziona da sempre e non
e' bloccato niente.

Quello che si costruisce qui serve per due motivi che arrivano dopo:

- **alla consegna la barra degli strumenti sara' nascosta** (un ristoratore
  non deve imparare il Modo Trova per cercare un fornitore);
- **una casella sola che cerca in piu' campi**: si scrive `cuc` e trova sia il
  codice `CUC` sia la descrizione `Cucina`. Il Trova di FileMaker per farlo
  richiede di compilare due richieste a mano.

## Dove va: sull'elenco, non sulla scheda

**Sull'elenco.** Si cerca dove si guarda: la scheda mostra un record, l'elenco
li mostra tutti. Il flusso e' elenco -> cerco -> apro.

Mettere la casella anche sulla scheda sembra comodo e non lo e': cerchi da una
scheda, il programma trova cinque record e tu ne stai guardando uno solo —
devi comunque andare all'elenco per vedere gli altri. Un giro in piu' e un
momento di confusione.

Se la vuoi lo stesso, in fondo c'e' come farla.

## Il vero motivo per farla adesso

Su `Reparti` la ricerca e' inutile: sono cinque record. Si costruisce qui
perche' **questa coppia e' lo stampo**, e su `Prodotti` e su `Lotti`, dove i
record saranno migliaia, la casella e' la differenza fra un programma usabile
e uno no.

---

## 1. Il campo

In `Reparti`, un campo nuovo:

| | |
|---|---|
| Nome | `gCerca` |
| Tipo | Testo |
| Opzioni | scheda **Archiviazione** -> **Usa archiviazione globale (un valore per file)** |

**Perche' globale.** Un campo globale vive fuori dai record: contiene un
valore solo per tutta la sessione e non viene scritto da nessuna parte. Scrivi
`cuc` nella casella e non hai sporcato nessun reparto. Un campo normale
scriverebbe `cuc` dentro il record su cui sei.

Stesso prefisso `g` di `Parametri::gGiorniAvviso`.

**Uno per tabella**, non uno solo condiviso: cosi' la ricerca dei reparti e
quella dei fornitori non si pestano i piedi.

---

## 2. Lo script `92 - Reparti - Cerca`

```
# === 92 - REPARTI - CERCA ===
# Cerca il testo di gCerca dentro Codice OPPURE Descrizione.
# Lo chiamano in due: il trigger OnObjectSave della casella di ricerca,
# e il pulsante Tutti, che passa "tutti" per azzerare la ricerca.

01  Se [ Get ( ParametroScript ) = "tutti" ]
02      Imposta campo [ REP|Reparti::gCerca ; "" ]
03  Fine se

    # Il globale si legge PRIMA di entrare in Modo Trova: da li' in avanti
    # scrivere in un campo significa impostare un criterio di ricerca,
    # non mettere un valore.
04  Imposta variabile [ $cerca ; Valore: REP|Reparti::gCerca ]

05  Se [ IsEmpty ( $cerca ) ]
06      Mostra tutti i record
07      Esegui script [ "91 - Reparti - Ordina elenco" ]
08      Esci dallo script [ Risultato del testo: "" ]
09  Fine se

10  Imposta acquisizione errori [ Attivato ]
11  Modo Trova [ Sospendi: No ]

    # Due richieste di ricerca sono una O: trova chi ha il testo nel codice
    # OPPURE nella descrizione. Gli asterischi fanno "contiene": senza,
    # FileMaker cerca le parole che cominciano cosi'.
12  Imposta campo [ REP|Reparti::Codice ; "*" & $cerca & "*" ]
13  Nuova richiesta di ricerca
14  Imposta campo [ REP|Reparti::Descrizione ; "*" & $cerca & "*" ]

15  Esegui ricerca [ ]

16  Se [ Get ( UltimoErrore ) = 401 ]
17      Mostra finestra di dialogo personalizzata
            [ "Nessun risultato" ;
              "Nessun reparto contiene " & $cerca & "." ]
18      Mostra tutti i record
19  Fine se

20  Esegui script [ "91 - Reparti - Ordina elenco" ]
```

**Errore 401** e' il codice di FileMaker per "nessun record trovato". Senza
l'`Imposta acquisizione errori` del passo 10 comparirebbe la finestra di
FileMaker, che parla di record e di richieste; con, parliamo noi.

**Un solo script per due pulsanti**, come lo script `90`: il parametro dice
cosa fare. Il passo 20 rimette l'ordine anche dopo una ricerca, perche' il
risultato di una ricerca non e' ordinato.

---

## 3. Sul formato `D_Reparti elenco`

Larghezza formato 685. La riga dei pulsanti e' a y 57, alta 35: la casella
sta li', a destra.

| Oggetto | X | Y | Largh. | Alt. | Aspetto |
|---|---|---|---|---|---|
| Campo `REP\|Reparti::gCerca` | 400 | 57 | 180 | 35 | fondo **bianco** (sta sul blu), raggio 3 |
| Pulsante `Tutti` | 588 | 57 | 73 | 35 | come gli altri pulsanti: testo bianco, niente fondo |

Chiude a 661, cioe' 24 dal bordo: stesso margine di tutto il resto.

**Testo segnaposto.** Con la casella selezionata, Ispettore -> scheda **Dati**
-> **Testo segnaposto**: `Cerca...`. E' un suggerimento grigio che sparisce
appena si scrive, e risparmia l'etichetta.

**Il trigger sulla casella.** Tasto destro sul campo -> `Imposta trigger di
script` -> **OnObjectSave** -> `92 - Reparti - Cerca`, senza parametro.
Scatta quando esci dalla casella: `Invio`, `Tab`, o un clic fuori.

**Il pulsante `Tutti`**: azione **Esegui script**, `92 - Reparti - Cerca`,
parametro `"tutti"` **con le virgolette**.

---

## 4. Collaudo

| # | Cosa fai | Deve succedere |
|---|---|---|
| 1 | Scrivi `cuc` e premi Invio | Resta il solo reparto Cucina |
| 2 | Premi `Tutti` | Tornano tutti, in ordine, e la casella si svuota |
| 3 | Scrivi `magazz` e Invio | Trova `Magazzino secco` — cioe' ha cercato **nella descrizione**, non solo nel codice |
| 4 | Scrivi `zzz` e Invio | "Nessun reparto contiene zzz", e dopo l'OK ci sono di nuovo tutti |
| 5 | Svuoti la casella e premi Invio | Tornano tutti, senza messaggi |
| 6 | Cerchi, poi apri con `Apri`, poi torni con `← Elenco` | Tornando, ci sono **tutti** i record: il trigger `OnLayoutEnter` ha rifatto `Mostra tutti i record` |
| 7 | Apri un reparto e guarda i suoi campi | `gCerca` e' vuoto nel record: il globale non ha scritto niente nei dati |

La prova 7 e' quella che dimostra il senso del campo globale.

---

## Se la vuoi anche sulla scheda

Stessa casella e stesso script, con una sola aggiunta: **in fondo allo script
`92`, dopo il passo 20**, un `Vai al formato [ "D_Reparti elenco" ]`.

Cosi' cercando da una scheda finisci sull'elenco dei risultati, che e' l'unico
posto dove li vedi tutti. Senza quel passo resteresti su una scheda a guardare
un record, senza accorgerti che il gruppo trovato ne contiene altri quattro.

---

## Quando si duplica

Per ogni anagrafica: campo `gCerca` nella sua tabella, script
`92 - <Tabella> - Cerca` con i suoi due campi, casella e pulsante sull'elenco.
Sono dieci minuti a tabella.

I campi su cui cercare, per le anagrafiche che verranno:

| Tabella | Campi da cercare |
|---|---|
| Attrezzature | `Codice`, `Descrizione` |
| PuntiControllo | `Codice`, `Descrizione` |
| Fornitori | `RagioneSociale`, `PartitaIva` |
| Prodotti | `Descrizione`, `Codice` |
| Operatori | `Cognome`, `Nome` |

**Un avviso per quando arriveremo ai lotti.** Il `*` davanti al testo impedisce
a FileMaker di usare l'indice: su cinquemila lotti la ricerca si sente. Li'
toglieremo l'asterisco iniziale e cercheremo "che comincia per", che e' anche
il modo in cui uno cerca un numero di lotto.
