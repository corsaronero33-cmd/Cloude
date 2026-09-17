# HACCP — Tracciabilita' e rintracciabilita' per ristorazione

Applicazione **Claris FileMaker Pro 22** (interfaccia italiana, Windows) per
l'autocontrollo alimentare di un ristorante: registri HACCP, rintracciabilita'
dei lotti, non conformita', sanificazioni, formazione.

File ospitato, accesso da desktop e da **FileMaker Go** su iPhone/iPad
(fotocamera, lettura codici a barre, firma).

---

## Si riprende da qui

| | |
|---|---|
| **Cosa e' aperto** | **`DA-FARE.md`** — prossimo passo, ritocchi, debiti. Tutto in una pagina |
| **Come si scrive qui dentro** | `CLAUDE.md` — convenzioni, valide per chiunque, persona o assistente |
| **Ultima verifica del file reale** | `archivio/collaudo-008.md` |

Il file `Haccp.fmp12` **non sta nel repository**: e' binario e non si confronta
fra due versioni. Qui stanno la specifica e i pezzi da incollare. Ad ogni
traguardo se ne esporta la struttura in XML dentro `ddr/`.

---

## I documenti

Nove riferimenti, da leggere in ordine la prima volta, da consultare poi.

| | Documento | Cosa contiene | Stato |
|---|---|---|---|
| 01 | `01-ANALISI.md` | Normativa, fasi di lavorazione, pericoli, CCP, limiti critici, registri obbligatori | fatto |
| 02 | `02-DATI.md` | Le 26 tabelle, i campi, le relazioni, le fasi di consegna | fatto |
| 03 | `03-CONVENZIONI.md` | Come si costruisce dentro FileMaker: file unico, ancore e boe, prefissi | fatto |
| 04 | `04-PRODOTTO.md` | Cosa cambia per poter **rivendere** la soluzione ad altri locali | fatto |
| 05 | `05-MONTAGGIO.md` | Creare il file e importare le 21 tabelle | fatto |
| 06 | `06-RELAZIONI.md` | Grafico a ancore e boe, 42 relazioni, 23 liste valori | fatto |
| 07 | `07-CALCOLI.md` | Le 13 funzioni personalizzate (esiti, scadenze, GS1-128, partita IVA) | fatto |
| 08 | `08-SCRIPT.md` | Gli script del motore: avvio, registrazione con non conformita' automatica, lettura etichetta | fatto |
| 09 | `09-MASCHERE.md` | Le maschere desktop: decisioni, modello elenco+scheda, **misure standard** | fatto |
| 10 | `10-STAMPE.md` | I registri in PDF per l'ispezione | da fare |
| 11 | `11-NUOVO-CLIENTE.md` | Procedura di impianto di un locale nuovo | da fare |

## Le schede di lavoro — `guide/`

Una maschera per volta, passo per passo, con il disegno in scala, le
coordinate di ogni oggetto e le prove di collaudo. Si seguono **in ordine**:
ognuna parte da dove finisce la precedente.

| | Scheda | Pagina |
|---|---|---|
| 01 | `guide/01-reparti-scheda.md` | <https://claude.ai/artifact/EFA6wMJavrYWEY6wQXnQzu> |
| 02 | `guide/02-reparti-elenco.md` | <https://claude.ai/artifact/3T9i9JSG3sa88ZKnC2hc1J> |
| 03 | `guide/03-ricerca.md` | <https://claude.ai/artifact/M8YkvJgCjPHtiLcYYAxM81> |
| 04 | `guide/04-menu.md` | <https://claude.ai/artifact/FKXgh6FMjL2NGxS2th9vdb> |

> **Le coordinate delle schede 01 e 02 sono superate.** Costruendo, le misure
> sono cambiate in meglio. Quelle valide stanno in `09-MASCHERE.md`, sezione
> *Misure standard*, e sono prese dal file reale. Le schede restano per il
> **metodo** e per il **perche'** di ogni scelta.

## Le altre cartelle

| | |
|---|---|
| `archivio/` | I collaudi, uno per giro di verifica: il diario di cosa si e' rotto e come si e' aggiustato |
| `ddr/` | Le ultime due esportazioni XML del file reale. Le precedenti stanno nella storia di git (`git log -- haccp/ddr`) |
| `import/` | I file da importare: `schema/` (15 tabelle vuote), `dati/` (6 gia' piene, compresi i 33 punti di controllo) |

---

## Le tre decisioni che spiegano tutto il resto

**File unico**, non separazione dati/interfaccia, e un file per ogni locale.
Il perche' sta in `03-CONVENZIONI.md`.

**Nasce come prodotto**, non come lavoro su misura per un cliente solo. Le
conseguenze stanno in `04-PRODOTTO.md` e vanno lette **prima** di costruire.

**I limiti critici stanno nei dati, mai nel codice.** Perche' il documento che
fa fede davanti all'ispettore e' il manuale di autocontrollo del locale, non
questo. L'analisi qui dentro e' quella tipica di un ristorante con cucina e i
limiti sono valori di riferimento comuni: **vanno confrontati con il manuale
del locale**, e dove i due divergono vince il manuale.
