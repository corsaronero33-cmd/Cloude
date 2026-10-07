# Collaudo 011 — `HACCP_Revisione_10.xml`

Scheda di lavoro con le correzioni:
<https://claude.ai/artifact/FmkcGXHaATyFF55ATWKeiA>

Verifica della **tappa 3**. Le misure non sono state controllate: le adatta chi
costruisce. Sono state controllate le **relazioni** — etichetta e campo con la
stessa X e larghezza, elenco e scheda larghi uguali — e tutto il resto.

---

## Verificato e a posto

| Cosa | Come risulta |
|---|---|
| `D_PuntiControllo elenco` | sette colonne, **ogni etichetta ha X e larghezza del suo campo**, `Apri` a x 25 |
| Colonna Reparto | `PCO\|Reparti::Descrizione` — e' il campo collegato |
| Script `91 - PuntiControllo` | `Imposta campo` su `PCO\|PuntiControllo::gCerca`, ordina `Ordine` poi `Codice` |
| I due trigger | `OnObjectExit` → `92` con parametro `PCO\|PuntiControllo::gCerca`; `OnLayoutEnter` → `91` |
| Parametri dei pulsanti | tutti giusti, compreso `+ Nuovo` → `93` |
| `IdReparto` | Menu a comparsa con `vl_Reparti` |
| Le sette tendine del valore | Menu a discesa con la lista giusta |

### Chiuso dal collaudo 010

- Set `Responsabile`: `prohibitModification=False`, `commands="Edit"`,
  `Print="True"`, `Export="True"` — tutte e quattro.
- Script `94`: `Exit Script` nel ramo dell'errore, `Lower(...)`,
  `gPassword ; ""`, titolo corretto — tutte e quattro.
- `Reimposta Account` con condizione di nascondimento.
- `Salva` e `Annulla Modifiche` su tutte e sei le schede.
- `Cambia Password` su `D_Menu`, passo `Change Password`.
- I due spazi nel nome di `91 - Attrezzature` tolti.

Quattordici voci chiuse in un giro.

---

## 1. Il campo dell'azione correttiva e' `OrarioAtteso1`

```
riquadro 3, y 613, x 167, largo 802  ->  PCO|PuntiControllo::OrarioAtteso1
riquadro 2, y 509, x 147, largo 312  ->  PCO|PuntiControllo::OrarioAtteso1
```

**`AzioneCorrettiva` non e' sulla scheda**, da nessuna parte. L'elenco dei
campi presenti sul formato lo conferma: diciotto campi, e quello non c'e'.

Due conseguenze. Il testo che l'operatore leggera' sul telefono non si vede e
non si corregge. E tutto quello che e' stato scritto in quel riquadro durante
le prove e' finito in `OrarioAtteso1`, **cancellando l'orario atteso** di quei
punti.

**I 33 testi veri non sono persi:** l'importazione ha riempito
`AzioneCorrettiva` nel database, il dato c'e' ed e' solo invisibile.

Nei modelli `OrarioAtteso1` e `OrarioAtteso2` sono **sempre vuoti**: se nel
campo si trova del testo, viene dalle prove e cancellarlo e' sicuro.

## 2. `IdAttrezzatura` ha la lista `vl_TipoAttrezzatura`

Controllo Menu a comparsa — giusto — ma la lista e' quella dei **tipi**
(frigorifero, congelatore, abbattitore) invece di `vl_Attrezzature`, che
esiste nel file ed e' quella degli apparecchi del locale.

Cosi' non puo' funzionare: `IdAttrezzatura` contiene un IDUU e la lista dei
tipi contiene parole. Il Menu a comparsa non trova mai una riga da mostrare e
il campo appare **sempre vuoto**; e scegliendo una voce nel campo finisce la
parola `frigorifero` al posto dell'IDUU.

**Quinto modo in cui la duplicazione morde in silenzio:** campi che non si
risolvono, script con i vecchi riferimenti, pulsanti con i vecchi parametri,
campi con il vecchio controllo, e ora **campi con la vecchia lista valori**.

## 3. Tre residui sulla scheda

- Etichetta `Richiede Foto` a destra, dove il campo e' `RichiedeFirma`.
- Oggetto testo vuoto a y 268, x 147, largo 8 — sopra il campo `Ordine`.
- Oggetto testo vuoto a y 619, x 28 — sotto l'etichetta `Azione Correttiva`.

## 4. Minuzie

- Set `Operatore`, riga `type="New"` (tabelle future): ancora `ReadWrite` su
  modifica e creazione.
- Elenco: etichette `TIPO` e `REPARTO` a y 113, le altre quattro a y 115.

---

## Le larghezze, per la tappa 5

| Anagrafica | Scheda | Elenco |
|---|---|---|
| Reparti | 701 | 725 |
| Attrezzature | 1018 | 968 |
| Fornitori | 1018 | 968 |
| Prodotti | 1004 | 1097 |
| Operatori | 1010 | 1248 |
| Punti di controllo | 1004 | 1126 |
| `D_Menu` | 731 | — |

**La proposta di 960 va rivista.** Le schede si sono assestate fra **1004 e
1018**, cioe' dove servono: sei di quelle maschere hanno due colonne di campi.
Il 960 era un numero a tavolino e il file vince sulla guida. Alla tappa 5 la
misura da proporre e' **1020**.

Il lavoro vero di quella tappa saranno **gli elenchi**: tre su sei stanno
sopra 1020 e vanno ridistribuite le colonne, non trascinato un bordo.
