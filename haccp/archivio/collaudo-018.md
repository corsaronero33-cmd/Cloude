# Collaudo 018 — Revisione 19, la prima maschera della tappa 6 e' chiusa

**Niente da correggere.** Tutto quello che era aperto risulta fatto, e
`0 record` vuoti.

---

## Collaudo 017, verificato

| | Lavoro | Nel file |
|---|---|---|
| f1.1 | `20 - Rilevazioni - Registra Copia` eliminato | non c'e' piu': il catalogo ha 17 script, nessuno `Copia` |
| f1.2 | secondo `Blocca finestra` cancellato | `Blocca finestra` compare **una volta sola**, alla riga 26 |
| f3.1 | `Non vuoto` su `IdPuntoControllo` | `notEmpty=True`, `OnlyDuringDataEntry`, ignorabile |
| f3.2 | `Non vuoto` su `DataOra` | `notEmpty=True`, `OnlyDuringDataEntry`, ignorabile |
| f3.3 | *Consenti di ignorare* lasciato spuntato | `allowOverride=True` su tutte e due |
| f2.4 | record vuoti eliminati | **0 record**, riferito |

Lo script `20` e' identico alla struttura voluta, con i numeri di riga
spostati di uno in meno dopo la cancellazione:

```
12  Salva record/richieste
15  If [ IsEmpty ( RIL|Rilevazioni::gIdPuntoControllo ) ]
20  If [ If ( Grandezza = "visivo" ; IsEmpty ( gValoreTesto ) ; IsEmpty ( gValore ) ) ]
26  Blocca finestra                       <- una sola volta
27  Vai al formato [ Z_RIL Rilevazioni ]
45  Imposta variabile [ $nome ; RIL|PuntiControllo::Descrizione ]
48  If [ $esito = "non conforme" ]  ... il lavoro in piu'
73  Vai al formato [ Formato originale ]  ... la chiusura comune
81  If [ $esito = "non conforme" ]  ... la sola differenza
90  Vai al campo [ gIdPuntoControllo ]
```

## Collaudo 014, chiuso anche lui

**Le sei etichette di colonna sono allineate al loro campo**, stessa X e
stessa larghezza:

| Formato | Etichetta | X / largh. | Campo |
|---|---|---|---|
| `D_Attrezzature elenco` | `Codice` | 81 / 170 | 81 / 170 |
| | `Descrizione` | 251 / 320 | 251 / 320 |
| `D_Fornitori elenco` | `Ragione Sociale` | 81 / 340 | 81 / 340 |
| | `Partita I.v.a.` | 421 / 150 | 421 / 150 |
| | `Telefono` | 746 / 150 | 746 / 150 |
| `D_Parametri elenco` | `CHIAVE` | 24 / 260 | 24 / 260 |

**I quattro disallineamenti verticali non ci sono piu':** su tutti gli elenchi
le etichette stanno a y 114 e i campi a y 144, senza eccezioni.

I due campi `Valore` sovrapposti di `D_Parametri elenco` hanno le due formule
*Nascondi oggetto quando* esattamente opposte, letto col nome giusto
(`<Conditions><Hide>`). Quello che avevo segnalato come mancante al collaudo
016 e ritirato al 017 e' confermato presente.

## Quello che c'era gia' e serve alla seconda maschera

Niente relazioni nuove da costruire: l'ancora `RIL` ha gia' tutto.

| Relazione | Da | A |
|---|---|---|
| `RIL\|Rilevazioni::IdPuntoControllo` | | `RIL\|PuntiControllo::Id` |
| `RIL\|Rilevazioni::IdOperatore` | | `RIL\|Operatori::Id` |
| `RIL\|Rilevazioni::IdNonConformita` | | `RIL\|NonConformita::Id` |
| `RIL\|Rilevazioni::gIdPuntoControllo` | | `RIL\|PuntoScelto::Id` |
| `RIL\|PuntiControllo::IdAttrezzatura` | | `RIL\|Attrezzature::Id` |

`Operatori::NomeCompleto` esiste gia' (`Cognome & " " & Nome`).

> **Correzione, dal collaudo 019.** Qui avevo scritto che e' *"non
> memorizzato: va bene per mostrarlo, non per ordinare"*. **Non e' vero:** ha
> `storeCalculationResults="True"`, quindi e' memorizzato e si puo' usare per
> ordinare. Avevo letto `index="None"` e l'avevo preso per "non memorizzato".
> Sono due cose diverse: `index` dice se l'indice e' **gia' costruito**
> (`None` con `autoIndex="True"` significa che FileMaker lo costruira' la
> prima volta che serve), `storeCalculationResults` dice se il risultato e'
> memorizzato.

## Resta aperto

- `D_Rilevazioni elenco` — `guide/19-rilevazioni-elenco.md`. Con quella la
  tappa 6 si chiude.
- lo stile del tema (`Titolo Riquadro` / `Titolo maschera`): si lascia, e' un
  nome interno.
