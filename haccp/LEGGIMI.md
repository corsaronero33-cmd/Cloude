# HACCP - Tracciabilita' e rintracciabilita' per ristorazione

Applicazione FileMaker per la gestione dell'autocontrollo alimentare di un
ristorante: registri HACCP, rintracciabilita' dei lotti, non conformita',
sanificazioni, formazione.

Piattaforma: **Claris FileMaker**, file ospitato, accesso da desktop e da
**FileMaker Go** su iPhone/iPad (fotocamera, lettura codici a barre, firma).

## Stato

| Documento | Contenuto | Stato |
|---|---|---|
| `01-ANALISI-HACCP.md` | Normativa, fasi, pericoli, CCP, limiti critici, registri | fatto |
| `02-MODELLO-DATI.md` | Tabelle, campi, relazioni, fasi di consegna | fatto |
| `03-CONVENZIONI-FILEMAKER.md` | Regole di costruzione del file | fatto |
| `04-PRODOTTO.md` | Scelte per rivendere la soluzione ad altri locali | fatto |

### Costruzione del file, in ordine

| Passo | Documento | Contenuto | Stato |
|---|---|---|---|
| 1 | `09-MONTAGGIO.md` | Crea il file, importa le 21 tabelle, sistema tipi e campi di sistema | fatto |
| 2 | `10-RELAZIONI.md` | Grafico a ancora e boe, liste valori | fatto |
| 3 | `11-CALCOLI.md` | Formule (esiti, scadenze, GS1-128, partita IVA) | da fare |
| 4 | `12-SCRIPT.md` | Script passo per passo | da fare |
| 5 | `13-LAYOUT.md` | Maschere desktop / iPad / iPhone | da fare |
| 6 | `14-STAMPE.md` | Registri in PDF per l'ispezione | da fare |
| 7 | `15-NUOVO-CLIENTE.md` | Procedura di impianto di un locale | da fare |

Il file `Haccp.fmp12` non sta nel repository: e' binario e non si puo'
confrontare fra due versioni. Qui stanno la specifica e i pezzi da incollare;
il file lo costruiamo seguendo `09-MONTAGGIO.md`, e ad ogni traguardo se ne
esporta il rapporto struttura in `haccp/ddr/` per avere una storia leggibile
dello schema.

**Architettura: file unico**, non separazione dati/interfaccia, e un file per
ogni locale. Le motivazioni stanno in `03-CONVENZIONI-FILEMAKER.md`.

**La soluzione nasce come prodotto**, non come lavoro su misura per un solo
cliente: le conseguenze di questa scelta stanno in `04-PRODOTTO.md` e vanno
lette prima di costruire il file.

## Si comincia da qui

Per costruire il file: **`09-MONTAGGIO.md`**. I file da importare stanno in
`import/schema/` (15 tabelle vuote) e `import/dati/` (6 tabelle gia' piene,
compresi i 33 punti di controllo dell'analisi HACCP). Una serata di lavoro,
quasi tutta importazione.

## Ordine di lettura

1. `01-ANALISI-HACCP.md` — cosa chiede la legge e cosa deve registrare il locale
2. `02-MODELLO-DATI.md` — come si traduce in tabelle
3. `03-CONVENZIONI-FILEMAKER.md` — come si scrive dentro FileMaker
4. `04-PRODOTTO.md` — cosa cambia per poterlo rivendere

## Avvertenza

L'analisi qui dentro e' quella tipica di un ristorante con cucina, e i limiti
critici sono valori di riferimento comuni. **Vanno confrontati con il manuale
di autocontrollo del locale**: e' quello il documento che fa fede davanti
all'ispettore, non questo. Dove i due divergono, vince il manuale e noi
adeguiamo i parametri (che infatti sono dati in tabella, non scritti nel
codice).
