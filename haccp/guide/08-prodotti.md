# Scheda 08 — `D_Prodotti`

Scheda di lavoro con le spunte:
<https://claude.ai/artifact/SUDN7hh3515hEk2ibRLFou>

Prerequisito: `07-fornitori.md` completata — la tendina del fornitore
abituale pesca da li'.

Terza anagrafica, stesse dieci fasi. Due cose la rendono diversa: **torna il
Menu a comparsa** per il fornitore abituale, e **il GTIN deve stare
sull'elenco** o non lo troverai mai.

E' anche la prima tabella che avra' **centinaia di record**.

---

## Fase 1 — `gCerca`

Tabella **Prodotti**, campo `gCerca` Testo, **archiviazione globale**.

## Fase 2 — Lo script `91 - Prodotti - Entra nell'elenco`

Duplica quello dei fornitori. `Imposta campo` -> `PRO|Prodotti::gCerca`,
`Ordina record` -> **`PRO|Prodotti::Descrizione` crescente**.

**Si ordina per descrizione.** Il codice prodotto lo conosce chi fa gli
ordini; la descrizione la conosce chi cucina, ed e' lui che guarda l'elenco
piu' spesso.

## Fase 3 — Duplicare i due formati

Si parte dai **fornitori**: hanno la struttura piu' vicina. Occorrenza
`PRO|Prodotti`. Poi **subito i parametri**: `← Elenco` ->
`"D_Prodotti elenco"`, `Apri` e `+ Nuovo` -> `"D_Prodotti scheda"`, `Tutti` ->
`91 - Prodotti - Entra nell'elenco`. Titoli al singolare e al plurale.

## Fase 4 — Riquadri e altezze

Corpo **578** — sessanta in meno dei fornitori, perche' il riquadro 2 ha tre
righe invece di quattro.

| | Rettangolo | Titolo |
|---|---|---|
| Riquadro 1 | y **16**, alto **194** | y **4**, `DATI DEL PRODOTTO` |
| Riquadro 2 | y **250**, alto **154** | y **238**, `CONSERVAZIONE E SCADENZA` |
| `Note` | campo y **448**, x 24, largo 912, alto 110 | etichetta y **426** |

## Fase 5 — I quindici campi

X sempre **44 / 143 / 489 / 588**, passo **40**.

| Y | Etichetta (x 44) | Campo (x 143) | Etichetta (x 489) | Campo (x 588) | Controllo |
|---|---|---|---|---|---|
| **Riquadro 1 — DATI DEL PRODOTTO** | | | | | |
| 42 | Descrizione | `Descrizione` | Fornitore | `IdFornitoreAbituale` | **comparsa** `vl_Fornitori` |
| 82 | Codice | `Codice` | GTIN | `Gtin` | — |
| 122 | Categoria | `Categoria` | Orig. animale | `OrigineAnimale` | discesa `vl_CategoriaProdotto` / `vl_SiNo` |
| 162 | Unità mis. | `UnitaMisura` | Attivo | `Attivo` | discesa `vl_UnitaMisura` / `vl_SiNo` |
| **Riquadro 2 — CONSERVAZIONE E SCADENZA** | | | | | |
| 276 | Conservaz. | `TipoConservazione` | Richiede lotto | `RichiedeLotto` | discesa `vl_TipoConservazione` / `vl_SiNo` |
| 316 | Temp. min | `TemperaturaMin` | Rich. scadenza | `RichiedeScadenza` | discesa `vl_SiNo` |
| 356 | Temp. max | `TemperaturaMax` | Gg. dopo apert. | `GiorniValiditaDopoApertura` | — |

**Torna il Menu a comparsa, e c'e' un solo campo che lo vuole.**
`IdFornitoreAbituale` contiene un IDUU. Gli altri sette campi con la tendina
contengono **il valore stesso**: restano a discesa.

**I tre campi che il programma usera' da solo.** `RichiedeLotto` e
`RichiedeScadenza` diranno allo script del ricevimento se pretendere lotto e
scadenza **per quel prodotto**; `GiorniValiditaDopoApertura` serve
all'etichetta dell'"aperto il". Sono i dati su cui poggia il **debito n. 4**
di `../DA-FARE.md`.

**Temperature qui e temperature sui punti di controllo.** Sembrano doppie e
non lo sono: qui e' *come va tenuto questo prodotto*, li' e' *a che
temperatura deve stare quel frigorifero*. Il confronto fra le due e' quello
che un domani fara' dire "questo prodotto in questo frigo non ci va".

## Fase 6 — L'elenco: sei colonne

| Colonna | X | Largh. | Campo | Ricerca rapida |
|---|---|---|---|---|
| `Apri` | 24 | 51 | gia' li' | — |
| Descrizione | 85 | 300 | `Descrizione` | **accesa** |
| Codice | 395 | 100 | `Codice` | **accesa** |
| GTIN | 505 | 140 | `Gtin` | **accesa** |
| Fornitore | 655 | 170 | **`PRO\|Fornitori::RagioneSociale`** | spenta |
| Conservazione | 835 | 101 | `TipoConservazione` | spenta |

**Il GTIN e' una colonna, e non per bellezza.** La Ricerca rapida cerca
**solo nei campi che stanno sul formato**. Se il GTIN non e' li', non lo
troverai mai — ed e' il modo in cui si trova un prodotto partendo da un codice
a barre letto col telefono. Ha preso il posto di `Categoria`, che resta sulla
scheda.

## Fase 7 — La ricerca

Casella su `PRO|Prodotti::gCerca`, parametro del trigger
`PRO|Prodotti::gCerca` (senza virgolette), trigger del formato su
`91 - Prodotti - Entra nell'elenco`.

Spunte accese su `Descrizione`, `Codice` e **`Gtin`**; spente su fornitore,
conservazione e sulla casella.

## Fase 8 — Il pulsante nel menu

Niente da fare.

## Fase 9 — Collaudo

Tredici prove, nella pagina. Le tre che contano:

- **9.4 e 9.5 sono due cose diverse.** La 9.4 verifica la *lista valori*: se
  dentro la tendina vedi gli IDUU, non e' `vl_Fornitori`. La 9.5 verifica il
  *controllo*: se l'IDUU ricompare **dopo** aver scelto, la lista e' giusta ma
  il controllo e' a discesa invece che a comparsa.
- **9.10:** cerchi il GTIN intero e deve restare il prodotto giusto. Se non
  trovi niente, quasi sempre il campo non e' sul formato.
- **9.11:** cerchi `refrig` e non deve uscire niente. Se esce, la spunta e'
  rimasta su `TipoConservazione`.

---

## Poi

**Operatori**, la piu' corta: nove campi, un riquadro solo, nessun campo
collegato.

Poi **Punti di controllo**, l'ultima e la piu' importante.
