# Collaudo v004 — schema chiuso

Verifica sul file salvato in XML il 09/09/2026, archiviato in `haccp/ddr/v004/`.

## Struttura: nessun problema

| Voce | Stato |
|---|---|
| 21 tabelle, 79 occorrenze, 42 relazioni, 24 layout | ok |
| Tipi dei campi (numeri, date, ore, data e ora) | ok, nessuno rimasto Testo per sbaglio |
| `Id` su tutte e 21: `Get (UUID)`, univoco, non vuoto, non modificabile | ok |
| I quattro campi di sistema con immissione automatica e protezione | ok su tutte |
| `ATT\|PuntiControllo` sulla tabella `PuntiControllo` | ok |
| Eliminazione a cascata | **solo** fra `RIC\|Ricevimenti` e `RIC\|RigheRicevimento` |

Creazione di record consentita su cinque relazioni: le quattro previste piu'
`LOT|Lotti` verso `LOT|Utilizzi`. Quest'ultima non era in elenco ma e' giusta:
serve al portale che registrera' gli impieghi di un lotto in fase 2.

## Liste valori: 18 su 19

Corrette tutte quelle segnalate, e create le due nuove
(`vl_TipoParametro`, `vl_UnitaMisuraControllo`). Le sei dinamiche puntano ai
campi e alle occorrenze giuste.

Resta un solo scostamento:

**`vl_EsitoRicevimento`** contiene `accettato` e `accettato parzialmente`.
Manca la terza voce:

```
respinto
```

Senza, non si puo' registrare una consegna rifiutata in blocco: e' il caso in
cui il registro serve di piu', perche' e' quello che dimostra all'ispettore
che il controllo in accettazione funziona davvero.

## Conclusione

Aggiunta quella voce, **lo schema e' chiuso**. Si passa a `11-CALCOLI.md`.
