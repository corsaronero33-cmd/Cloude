# Collaudo 020 — Revisione 21: il debito e' pagato, l'elenco funziona

Schede verificate: 19 (fase 9) e 20.
Scheda successiva: <https://claude.ai/artifact/KUKhCxVnhfHBESUYo3i2Nf>

**Tutto il lavoro strutturale e' giusto.** Due ritocchi di testo e di colore
sull'elenco, piu' una correzione mia sugli account di prova.

---

## Scheda 19, fase 9

| | Nel file |
|---|---|
| contatore di `D_Rilevazioni elenco` | `{{FoundCount}}` ✓ |
| i due passi disattivati nello script `91 - Rilevazioni` | **spariti** ✓ |
| la linea facoltativa a y 101 | non aggiunta — era facoltativa |

## Scheda 20

### Il debito n. 1 e' pagato

| Formato | id interno | Lo usa | Nel passo |
|---|---|---|---|
| `Z_Parametri` | 8 | `01` riga 9 | `Vai al formato [ Z_Parametri ]` ✓ |
| `Z_Operatori` | 15 | `02` riga 12 | `Vai al formato [ Z_Operatori ]` ✓ |
| `Z_NonConformita` | 14 | `20` riga 56 | `Vai al formato [ Z_NonConformita ]` ✓ |

Gli identificativi interni sono gli stessi di prima della rinomina: e' per
questo che gli script hanno seguito da soli.

### Il resto

- `Stato`: calcolo, testo, `storeCalculationResults="True"` ✓.
- Script `91 - NonConformita`: `$cosa`, `Passa al modo Trova` con Pausa
  disattivata, `Imposta campo [ NCF|NonConformita::Stato ; "==aperta" ]`,
  **ordinamento rifatto** su `NCF|NonConformita::Stato` crescente e
  `NCF|NonConformita::Data` decrescente — la trappola della copia e' evitata —,
  `Vai a Record/Richiesta/Pagina [ Primo ]`, nessun passo disattivato ✓.
- Formato su `NCF|NonConformita`, sezioni 143 / 30 / 38 ✓.
- Sei campi alla X e larghezza giuste, da 81 a 996 ✓.
- `Tutte` senza parametro, `Solo aperte` con `"aperte"` ✓.
- `Apri` con il parametro **cambiato** in `"D_NonConformita scheda"` ✓.
- Pie' di pagina copiato, con `{{FoundCount}}` ✓.
- Trigger `SuEntrataFormato`, senza parametro ✓.

## Due ritocchi

### 1. La quarta etichetta dice `DATA`

Sopra il campo `Gravita` (x 686) l'etichetta e' **`DATA`**, x 685: copiata
dalla prima e non riscritta. L'elenco ha due colonne `DATA`.
Va scritta `GRAVITÀ` e portata a **x 686**, larga 90 come il campo.

### 2. Il rosso non e' quello del registro

La formattazione condizionale su `Stato` usa
`rgba(100%, 15.29%, 7.06%)` = **`#FF2712`**, un rosso-arancio. Il registro
delle rilevazioni usa `#DD0000`. La regola e' un rosso solo
(`CLAUDE.md`, *I colori non si dettano*): va portato a **`#DD0000`**.

## Una correzione mia: chi e' l'Operatore

Nel collaudo della scheda 19 (7.13) e della 20 (9.9) avevo scritto *"come
`MRossi` (set `Operatore`)"*. Nel file:

| Account | Set |
|---|---|
| `Admin` | Accesso completo |
| **`MRossi`** | **`Responsabile`** |
| **`P_Pippo`** | **`Operatore`** |

Quindi quelle due prove sono state fatte **da Responsabile**. Non hanno
provato cosa vede un operatore. Si rifanno con `P_Pippo` nel collaudo della
scheda 21, dove contano di piu': la 21 cambia proprio i permessi
dell'Operatore sulle non conformita'.

---

## Cosa viene

Scheda 21, `D_NonConformita scheda`: il Responsabile la chiude.
Porta con se' le prime decisioni di **permessi per tabella** del progetto
dalla tappa 2, ed e' per questo che il collaudo va fatto con tutti e tre gli
account.
