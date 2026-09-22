# Scheda 07 — `D_Fornitori`

Scheda di lavoro con le spunte:
<https://claude.ai/artifact/BmGJpyrqZwEPcRgGGKPdRa>

Prerequisito: `06-correzioni-v009.md` completata — serve la larghezza **960**
e lo script `93 - Utilita - Nuovo`.

Seconda anagrafica, **stesse dieci fasi** delle attrezzature: cambiano i campi
e le colonne, non i passi. Prima maschera costruita direttamente alla
larghezza nuova.

---

## Fase 1 — Il campo `gCerca`

`File` › `Gestisci` › `Database`, tabella **Fornitori**, campo `gCerca` di
tipo Testo, `Opzioni` › `Archiviazione` › **Usa archiviazione globale**.

## Fase 2 — Lo script `91 - Fornitori - Entra nell'elenco`

Duplica `91 - Attrezzature`, rinomina, e cambia **due** cose:

- `Imposta campo` -> `FOR|Fornitori::gCerca`
- `Ordina record` -> **`FOR|Fornitori::RagioneSociale` crescente**

Si ordina per ragione sociale e non per un codice: i fornitori non hanno un
codice nostro, e chi cerca "Rossi" se lo aspetta in ordine alfabetico.

Controlla che **non ci siano spazi in fondo al nome**.

## Fase 3 — Duplicare i due formati

Si parte dalle **attrezzature**, non dai reparti: hanno gia' la larghezza 960,
i due riquadri e le due colonne.

Occorrenza `FOR|Fornitori` su tutti e due. Poi **subito i parametri**:

| Formato | Pulsante | Parametro nuovo |
|---|---|---|
| scheda | `← Elenco` | `"D_Fornitori elenco"` |
| elenco | `Apri` e `+ Nuovo` | `"D_Fornitori scheda"` |
| elenco | `Tutti` | script `91 - Fornitori - Entra nell'elenco` |
| elenco | `← Menù` | non si tocca |

Titoli: `Attrezzatura` -> **`Fornitore`**, `Attrezzature` -> **`Fornitori`**.

## Fase 4 — La scheda: riquadri e altezze

Corpo **618**. Si riusano i due riquadri e il campo `Note` (ripuntandolo su
`FOR|Fornitori::Note`); si cancellano i quattordici campi e le loro etichette.

| | Rettangolo | Titolo |
|---|---|---|
| Riquadro 1 | y **16**, alto **194** | y **4**, `DATI DEL FORNITORE` |
| Riquadro 2 | y **250**, alto **194** | y **238**, `QUALIFICA` |
| `Note` | campo y **488**, x 24, largo 912, alto 110 | etichetta y **466** |

## Fase 5 — La scheda: i diciotto campi

Le quattro X: **44** e **489** per le etichette (larghe 88), **143** e **588**
per i campi (larghi 328). Passo **40**.

| Y | Etichetta (x 44) | Campo (x 143) | Etichetta (x 489) | Campo (x 588) | Controllo |
|---|---|---|---|---|---|
| **Riquadro 1 — DATI DEL FORNITORE** | | | | | |
| 42 | Ragione soc. | `RagioneSociale` | Città | `Citta` | — |
| 82 | Partita IVA | `PartitaIva` | Provincia | `Provincia` | — |
| 122 | Indirizzo | `Indirizzo` | Telefono | `Telefono` | — |
| 162 | Cap | `Cap` | Email | `Email` | — |
| **Riquadro 2 — QUALIFICA** | | | | | |
| 276 | Referente | `Referente` | Qualificato | `Qualificato` | discesa `vl_SiNo` |
| 316 | Categorie | `CategorieFornite` | Data qualifica | `DataQualifica` | **calendario** |
| 356 | N. ricon. CE | `NumeroRiconoscimentoCe` | Prossima verif. | `DataProssimaVerifica` | **calendario** |
| 396 | Attivo | `Attivo` — discesa `vl_SiNo` | | | |

**Qui non c'e' nessun campo Id.** I fornitori non puntano a nient'altro: sono
loro a essere puntati, dai prodotti e dai ricevimenti. Niente Menu a comparsa
su questa scheda.

**Perche' il riquadro QUALIFICA esiste.** Non e' anagrafica, e' HACCP: il
Reg. 852/2004 chiede di **scegliere e sorvegliare i fornitori**.
`DataProssimaVerifica` e' il campo che un domani fara' scattare l'avviso
"questo fornitore va riqualificato". Tenerlo in un riquadro suo significa che
chi compila capisce che quella parte non e' facoltativa.

**Un debito, non un lavoro di oggi.** `PartitaIvaValida` esiste da
`07-CALCOLI.md` ma **non e' agganciata** al campo: si fara' con tutte le
convalide insieme.

## Fase 6 — L'elenco: sei colonne

| Colonna | X | Largh. | Campo | Ricerca rapida |
|---|---|---|---|---|
| `Apri` | 24 | 51 | gia' li' | — |
| Ragione sociale | 85 | 300 | `RagioneSociale` | **accesa** |
| Partita IVA | 395 | 130 | `PartitaIva` | **accesa** |
| Città | 535 | 150 | `Citta` | **accesa** |
| Telefono | 695 | 140 | `Telefono` | **accesa** |
| Qualificato | 845 | 91 | `Qualificato` | spenta |

L'ultima colonna chiude a **936**: e' il numero vincolante, le larghezze
intermedie si adattano.

**Su `Telefono` la spunta e' accesa**, e sembra strano cercare per numero.
Serve al contrario: arriva una telefonata, leggi il numero sul display, lo
cerchi e sai chi e'.

## Fase 7 — La ricerca

Tre cose da ripuntare: la **casella** su `FOR|Fornitori::gCerca`, il
**parametro del suo trigger** su `FOR|Fornitori::gCerca` (senza virgolette),
il **trigger del formato** su `91 - Fornitori - Entra nell'elenco`.

Spunte della Ricerca rapida: accese su ragione sociale, partita IVA, citta' e
telefono; spente su `Qualificato` e sulla casella.

## Fase 8 — Il pulsante nel menu

Niente da fare: ha gia' il parametro giusto.

## Fase 9 — Collaudo

Tredici prove, nella pagina. Le tre che contano:

- **con l'elenco vuoto**, `+ Nuovo` crea il record e apre la scheda — e' la
  prova del lavoro della scheda 06;
- cercando `si` **non deve uscire niente**: se escono tutti, la spunta e'
  rimasta su `Qualificato`, ed e' un errore che non da' nessun messaggio;
- girando fra menu, fornitori, attrezzature e reparti **senza toccare la
  finestra**, nessuna barra di scorrimento e bordo destro sempre allo stesso
  punto.

---

## Poi

**Prodotti**: la prima con un campo collegato dopo le attrezzature —
`IdFornitoreAbituale`, che punta proprio ai fornitori di oggi — e quindi la
prima in cui torna il **Menu a comparsa**.

Poi **Operatori**, la piu' corta: nove campi, un riquadro solo.
