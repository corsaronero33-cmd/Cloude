# Collaudo v003 — dopo le correzioni

Verifica sul file salvato in XML da FileMaker 22.0.7 l'08/09/2026, archiviato
in `haccp/ddr/v003/`.

Nota sul formato: questa volta il file e' un **salvataggio in XML**
(`FMSaveAsXML`), non il rapporto struttura (`FMPReport`). Va bene uguale,
anzi e' piu' ricco: contiene le definizioni complete di campi, relazioni e
liste valori. Per i confronti futuri va bene l'uno o l'altro, basta essere
coerenti.

---

## Esito dei sette lavori: tutti superati

| Lavoro | Verifica sul file | Esito |
|---|---|---|
| 1. Tipi dei campi | tutti e 49 convertiti; nessun campo rimasto Testo dove non deve | **ok** |
| 2. `NomeCompleto` | risultato `Testo`, formula `Cognome & " " & Nome` | **ok** |
| 3. `ATT\|PuntiControllo` | tabella di base ora `PuntiControllo`; `idAttrezzatuea` eliminato | **ok** |
| 4. Chiavi primarie | 21 tabelle su 21 con `Id` = `Get (UUID)`, univoco, non vuoto, non modificabile; i quattro campi di sistema con l'immissione automatica giusta | **ok** |
| 5. Spunte di creazione | le quattro previste, e la cascata di eliminazione **solo** fra ricevimento e righe | **ok** |
| 6. Campi doppioni | i tre eliminati, le tre relazioni rifatte passando da punto di controllo e voce di piano | **ok** |
| 7. Pulizie | `IdNonConformita Copia` eliminato, tabella `HACCP` eliminata, i quattro nomi di occorrenza corretti | **ok** |

Stato: **21 tabelle, 79 occorrenze, 42 relazioni, 23 liste valori, 24 layout.**

Lo schema e' solido. Da qui si puo' passare ai calcoli.

---

## Resta da rifinire: le liste valori

Il confronto fra i valori scritti nelle liste e quelli **realmente presenti
nei record importati** fa emergere sette scostamenti. Contano perche' i
calcoli confrontano le stringhe alla lettera: `Frequenza = "giornaliera"` non
trova niente se nella lista c'e' scritto `giornaliero`.

### Da correggere

| Lista | Adesso | Deve diventare |
|---|---|---|
| `vl_SiNo` | `SI` `NO` | `Si` `No` |
| `vl_TipoScadenza` | `esistente` `TMC` | `scadenza` `TMC` |
| `vl_StatoLotto` | ... `smaltato` | ... `smaltito` |
| `vl_EsitoRiga` | ... `rifiutato` | ... `respinto` |
| `vl_EsitoRicevimento` | `ha accettato` `parzialmente accettato` `respinto` | `accettato` `accettato parzialmente` `respinto` |
| `vl_OrigineNonConformita` | `ricevimento` due volte | il primo va cambiato in `rilevazione` |
| `vl_Frequenza` | `giornaliero` | `giornaliera`, piu' i valori mancanti (sotto) |

`vl_SiNo` e `vl_Frequenza` sono le due che rompono qualcosa **adesso**: i 33
punti di controllo e le 28 voci di sanificazione contengono gia' `Si`, `No` e
`giornaliera`.

### `vl_Frequenza` va allargata

Il piano di sanificazione usa frequenze che i punti di controllo non hanno.
Meglio una lista sola con tutti i valori, invece di due liste da tenere
allineate:

```
ad evento
dopo ogni utilizzo
dopo ogni servizio
fine servizio
piu volte al giorno
due volte al giorno
giornaliera
settimanale
mensile
trimestrale
semestrale
annuale
```

### Due liste che mancano

Il confronto ha fatto emergere due buchi nella specifica, non nel file.

**`vl_TipoParametro`** — il campo `Parametri::Tipo` contiene `testo`,
`numero`, `si-no`, `data`. Non e' il tipo di un punto di controllo e non puo'
usare `vl_TipoPuntoControllo`.

```
testo
numero
si-no
data
```

**`vl_UnitaMisuraControllo`** — `PuntiControllo::UnitaMisura` contiene `C`,
`%`, `minuti`, `ore`: sono unita' di **misura di un controllo**, non di una
quantita' di merce. `Prodotti::UnitaMisura` e `Lotti::UnitaMisura` continuano
a usare `vl_UnitaMisura` con `kg`, `g`, `l`, `ml`, `pz`, `cf`, `ct`.

```
C
%
minuti
ore
pH
```

Stesso nome di campo, due domini diversi: e' il tipo di svista che si paga
sei mesi dopo, quando in un elenco a tendina delle temperature compaiono i
chilogrammi.
