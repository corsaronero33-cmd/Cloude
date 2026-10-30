# Collaudo 014 — `HACCP_Revisione_13.xml`

Scheda con le correzioni:
<https://claude.ai/artifact/BffatSzdHQ4TEkDQ4ZnREn>

**Tappa 5 riuscita.** Quattro difetti, tutti della stessa famiglia: etichette
non spostate insieme al loro campo.

---

## Verificato

| Cosa | Come risulta |
|---|---|
| Le larghezze | **15 formati su 15 a 1020** |
| Gli elenchi | **7 su 7** con l'ultima colonna che chiude a **996** |
| Le schede | l'oggetto piu' a destra chiude a **996** su tutte e sette |
| `<<$$UTENTE.Nome>>` | **x 741 → 996** su tutti e quindici |
| I due campi `Valore` | x 836, larghi 160 tutti e due: **esattamente sovrapposti** |
| Script `90` | ramo **105**, ramo errore generico, `Esci dallo script "ok"` |
| Script `93` | `Se Get ( RisultatoScript ) <> "ok"` prima di `Nuovo record` |
| Trigger della ricerca | **`OnObjectSave`** su tutti e sei gli elenchi che hanno la casella |
| Griglia del menu | 24 / 271 / 518 / 765, larghi 231, chiude a 996 |
| `D_Impresa scheda` | rinominato con la **s** minuscola |

La parte difficile — ridistribuire le colonne di quattro elenchi che si
stringevano fino a 275 punti — e' venuta giusta al primo colpo su tutte e
sette le tabelle.

---

## 1. Sei etichette non partite con il campo

### `D_Attrezzature elenco`

| Etichetta | Com'e' | Campo | Correggi a |
|---|---|---|---|
| `Codice` | x 57, l 169 | x 81, l 170 | **x 81, l 170** |
| `Descrizione` | x 226, l 314 | x 251, l 320 | **x 251, l 320** |

### `D_Fornitori elenco`

| Etichetta | Com'e' | Campo | Correggi a |
|---|---|---|---|
| `Ragione Sociale` | x 88, l 333 | x 81, l 340 | **x 81, l 340** |
| `Partita I.v.a.` | x 390, l 150 | x 421, l 150 | **x 421, l 150** |
| `Telefono` | x 745, l 151 | x 746, l 150 | **x 746, l 150** |

### `D_Parametri elenco`

| Etichetta | Com'e' | Campo | Correggi a |
|---|---|---|---|
| `CHIAVE` | x 14, l 309 | x 24, l 260 | **x 24, l 260** |

`Telefono` e' sfasata di **un punto** ed e' segnalata lo stesso: e' la
differenza fra colonne allineate e colonne *quasi* allineate, e la seconda e'
la condizione in cui fra sei mesi non si sa piu' quale sia la misura giusta.

## 2. Lo stile del tema e' stato duplicato

| Stile | Oggetti che lo usano |
|---|---|
| `Titolo Riquadro` | **15** — tutti i titoli di tutte le maschere |
| `Titolo maschera` | **0** |

Lo stile nuovo e' stato creato invece di rinominare il vecchio. Si elimina
`Titolo maschera` (si puo', non lo usa nessuno), poi si rinomina
`Titolo Riquadro`, poi **si salva il tema**. In quest'ordine: rinominando
prima, FileMaker aggiungerebbe un numero al nome duplicato.

## 3. Due punti di disallineamento verticale

| Formato | A y 115 | Fuori riga |
|---|---|---|
| `D_Attrezzature elenco` | Codice, Descrizione, Reparto | `Tipo` a y **113** |
| `D_Fornitori elenco` | le altre quattro | `Citta` a y **113** |
| `D_Menu`, registri | gli altri tre a y 150 | `Rilevazioni` a y **149** |
| `D_Menu`, 2ª riga anagrafiche | `Operatori` a y 294 | `Prodotti` a y **296** |

Due punti non si vedono fermi, si vedono in movimento: passando da una
maschera all'altra la riga delle intestazioni sobbalza.

---

## Stato

| | |
|---|---|
| Tappe chiuse | 0, 1, 2, 3, 4, **5** (a meno dei tre ritocchi) |
| Formati | 15, tutti a 1020 |
| Script | 17 |
| Debiti chiusi in questa tappa | `90` e `93`, il trigger della ricerca, la `S` di `D_Impresa` |

Non serve un DDR per i tre ritocchi: si verificano insieme al prossimo, a fine
tappa 6.
