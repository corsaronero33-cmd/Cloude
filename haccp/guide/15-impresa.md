# Scheda 15 — `D_Impresa scheda` (tappa 4, prima di due)

Scheda di lavoro con le spunte:
<https://claude.ai/artifact/XwN5T92X5WNoucdKtQmBsf>

La maschera piu' semplice del progetto, e **l'unica senza elenco**: l'impresa
e' un record solo.

---

## Cosa la rende diversa

| | Le altre sei | Questa |
|---|---|---|
| Elenco | c'e' | **no** |
| Ricerca | casella + `92` | **no** |
| `+ Nuovo`, `Elimina` | ci sono | **no** |
| Contatore in fondo | c'e' | **niente pie' di pagina** |
| Si arriva | dall'elenco | **dal menu** |

Togliere `+ Nuovo` ed `Elimina` e' quello che impedisce al titolare di
ritrovarsi due anagrafiche d'impresa e un menu che mostra il nome sbagliato.

**Controlla se il record c'e':** formato tecnico `Impresa`, contatore. Se dice
0, in `D_Menu` il nome del locale e' una riga bianca — lo script della fase 3
risolve anche questo.

## Fase 1 — I due campi contenitore

`Logo` e `ManualeAutocontrollo`, tipo **Contenitore**, con
`Opzioni › Archiviazione › Memorizza i dati del contenitore esternamente`.

Erano nella specifica (`02-DATI.md`) ma non nello schema importato.

**Esternamente, non dentro il file.** Un PDF di manuale sta sui dieci
megabyte: dentro il `.fmp12` lo porteresti dietro a ogni copia e a ogni
backup. Quando sposti il file su un altro computer, **va spostata anche la
cartella** dei contenitori.

**Il logo finira' sulle stampe** della tappa 9, ed e' la prima cosa che fa
sembrare il programma del cliente e non un modello comprato.

## Fase 2 — Il formato

Si duplica `D_PuntiControllo scheda`, occorrenza **`IMP|Impresa`** — la stessa
di `D_Menu`. Nome del formato **esatto**: `D_Impresa scheda`, perche' il
pulsante del menu lo cerca gia' cosi'.

Si cancellano `+ Nuovo` ed `Elimina`, si cancella la **parte Pie' di pagina**
(`Formati › Parti › Elimina parte`), e il primo pulsante diventa `← Menù` con
parametro `"D_Menu"`.

Corpo **562**, tre riquadri: `DATI DELL'IMPRESA` (y 16, alto 154),
`AUTOCONTROLLO` (y 186, alto 154), `DOCUMENTI` (y 356, alto 190). Misure di
partenza; vincolante solo la **fascia blu alta 100**.

## Fase 3 — Lo script `96 - Impresa - Apri la scheda`

```
# === 96 - IMPRESA - APRI LA SCHEDA ===
# Porta sull'unico record dell'impresa, e lo crea se la tabella e' vuota.
# Agganciato al trigger OnLayoutEnter di D_Impresa scheda.

Mostra tutti i record
Se [ Get ( ConteggioTrovati ) = 0 ]
    Nuovo record/richiesta
Altrimenti
    Vai al record/richiesta/pagina [ Primo ]
Fine se
```

Trigger `OnLayoutEnter` del formato, nessun parametro.

**Perche' `96` e non `91`.** Il `91` e' *entra in un elenco*: svuota la
ricerca, mostra tutti, ordina. Questo fa una cosa che non esiste su
nessun'altra tabella — portare sull'unico record e crearlo se manca — quindi
prende un numero nuovo nella decina delle utilita' di formato.

**Il ramo `Nuovo record` scatta una volta sola nella vita del file**, e alla
tappa 11 sara' gia' al suo posto per l'impianto di un locale nuovo.

## Fase 4 — I tredici campi

X di partenza **44 / 143 / 489 / 588**, passo **40**. Tutti Casella di
modifica tranne `DataScia`, che e' **Calendario a discesa**.

| Y | Etichetta | Campo | Etichetta | Campo |
|---|---|---|---|---|
| **Riquadro 1** | | | | |
| 42 | Ragione sociale | `RagioneSociale` | Partita IVA | `PartitaIva` |
| 82 | Indirizzo sede | `IndirizzoSede` | Codice fiscale | `CodiceFiscale` |
| 122 | Telefono | `Telefono` | Email | `Email` |
| **Riquadro 2** | | | | |
| 212 | N. reg. sanitaria | `NumeroRegistrazioneSanitaria` | Data SCIA | `DataScia` — **calendario** |
| 252 | OSA | `Osa` | ASL competente | `AslCompetente` |
| 292 | Consulente HACCP | `ConsulenteHaccp` | — | — |
| **Riquadro 3** | | | | |
| 382 | Logo | `Logo` — contenitore 240×140 | Manuale | `ManualeAutocontrollo` — contenitore 240×140 |

Sui contenitori: `Ottimizza per` **Immagini** sul logo, **Documenti
interattivi** sul manuale, cosi' il PDF si sfoglia dentro la scheda.

**`Osa` e' una sigla:** Operatore del Settore Alimentare, la persona
giuridicamente responsabile dell'igiene. E' il nome che un ispettore chiede
per primo.

**Nessun campo e' obbligatorio**, e va bene: le validazioni si metteranno alla
tappa 11, quando si sapra' cosa serve davvero per impiantare un locale nuovo.

## Fase 5 — Collaudo

Nove prove nella pagina. Le due che contano:

- **5.3** — tornando al menu, **in alto a sinistra compare il nome del
  locale**. Quel campo c'e' da settimane e ha sempre mostrato una riga bianca
  perche' la tabella era vuota.
- **5.4** — rientrando nella scheda deve esserci **sempre lo stesso record**.
  Se ne trovi due, lo script sta creando ogni volta: controlla il `Se`.

---

## Poi

`D_Parametri elenco`, la seconda della tappa 4. **Niente DDR in mezzo**: il
DDR si fa a fine tappa.
