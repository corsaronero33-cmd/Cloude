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
| `04-CALCOLI.md` | Formule da incollare (esiti, scadenze, GS1-128, allergeni) | da fare |
| `05-SCRIPT.md` | Script passo per passo | da fare |
| `06-LAYOUT.md` | Maschere desktop / iPad / iPhone | da fare |
| `07-STAMPE.md` | Registri in PDF per l'ispezione | da fare |
| `08-MONTAGGIO.md` | Istruzioni di assemblaggio del file | da fare |

Il file `Haccp.fmp12` non sta nel repository: e' binario e non si puo'
confrontare fra due versioni. Qui stanno la specifica e i pezzi da incollare;
il file lo costruiamo seguendo `08-MONTAGGIO.md`, e ad ogni traguardo se ne
esporta il rapporto struttura in `haccp/ddr/` per avere una storia leggibile
dello schema.

**Architettura: file unico**, non separazione dati/interfaccia. Le motivazioni
stanno in `03-CONVENZIONI-FILEMAKER.md`.

## Ordine di lettura

1. `01-ANALISI-HACCP.md` — cosa chiede la legge e cosa deve registrare il locale
2. `02-MODELLO-DATI.md` — come si traduce in tabelle
3. `03-CONVENZIONI-FILEMAKER.md` — come si scrive dentro FileMaker

## Avvertenza

L'analisi qui dentro e' quella tipica di un ristorante con cucina, e i limiti
critici sono valori di riferimento comuni. **Vanno confrontati con il manuale
di autocontrollo del locale**: e' quello il documento che fa fede davanti
all'ispettore, non questo. Dove i due divergono, vince il manuale e noi
adeguiamo i parametri (che infatti sono dati in tabella, non scritti nel
codice).
