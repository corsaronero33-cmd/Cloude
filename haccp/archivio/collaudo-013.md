# Collaudo 013 — `HACCP_Revisione_12.xml`

Scheda con le correzioni:
<https://claude.ai/artifact/YLT9Fs4pggEyPphiyzoppW>

**Tappa 4 chiusa.** Le due maschere ci sono e sono costruite bene. Un difetto
di nomenclatura, e tre controlli che l'export non permette di fare.

---

## Verificato nel file

### `D_Impresa Scheda`

| | |
|---|---|
| Parti | Intestazione 100, Corpo 559, **nessun pie' di pagina** |
| Pulsanti | `← Menù` → `90` con `"D_Menu"`, `Salva`, `Annulla Modifiche`. Niente `+ Nuovo` ne' `Elimina` |
| Campi | gli undici testi, `DataScia` **Calendario a discesa**, contenitori `Logo` e `ManualeAutocontrollo` |
| Script `96` | esiste, scritto giusto, agganciato a **`OnLayoutEnter`** |

### `D_Parametri elenco`

| | |
|---|---|
| La parte nuova | **`Leading Sub-summary` raggruppata su `Categoria`** — quella giusta |
| Script `91 - Parametri` | `Mostra tutti` + `Ordina per Categoria, poi Chiave`, sui campi di `PAR\|Parametri` |
| Le quattro colonne | ogni etichetta ha la X e la larghezza del suo campo |
| I due campi `Valore` | sovrapposti, stessa X e larghezza, condizioni **esattamente opposte** |
| Le formule | `Get ( AccountPrivilegeSetName ) = "Operatore" or ( ... = "Responsabile" and ModificabileDalCliente = "No" )`, e il `not` sull'altra |
| Quello che non c'e' | casella di ricerca, `Tutti`, `+ Nuovo`, `Apri` — come doveva |

**Sui nomi delle funzioni:** nelle formule compare
`Get ( AccountPrivilegeSetName )` e non `Get ( NomeSetPrivilegi )`. **E' la
stessa funzione**: FileMaker la mostra tradotta e la salva in inglese, quindi
nell'esportazione si ritrova sempre cosi'.

---

## 1. Il difetto: `D_Impresa Scheda` con la S maiuscola

Tutti gli altri sono `... scheda` minuscolo.

Funziona lo stesso perche' `Vai al formato` **non distingue maiuscole e
minuscole**, quindi il collaudo non poteva prenderlo. Si corregge da
`Formati › Gestisci formati`.

Si corregge adesso perche' alla tappa 11 lo script di impianto girera' sui
formati, e la regolarita' dei nomi e' quello che lo tiene in piedi.

## 2. Tre cose che l'export non porta

**La spunta *Consenti l'immissione nel campo*.** Ho provato a dedurla dai
numeri che FileMaker scrive nelle proprieta' degli oggetti e **non ci sono
riuscito in modo affidabile**: su `D_Parametri` i due campi `Valore`
differiscono di un bit coerente con quella spunta, ma gli stessi numeri sui
campi di `D_Impresa` darebbero tutti di sola lettura — e il collaudo dice che
si compilano. Meglio dichiarare il limite che dare un allarme sbagliato.

Si verifica a mano: su `Chiave`, `Descrizione`, `Tipo` e sul `Categoria` della
fascia, **il cursore non deve entrare**.

**I venti record.** Il DDR non porta **nessun dato**: vede che la tabella
esiste, non quante righe contiene. Vale anche per i 33 punti di controllo e
per il record dell'impresa.

**La Ricerca rapida** sulla colonna `O. ATTESO 1` di `D_PuntiControllo
elenco`: deve essere spenta.

---

## Le larghezze, per la tappa 5

| Anagrafica | Scheda | Elenco | Salto |
|---|---|---|---|
| Reparti | 701 | 725 | 24 |
| Attrezzature | 1018 | 968 | 50 |
| Fornitori | 1018 | 968 | 50 |
| Prodotti | 1004 | 1097 | 93 |
| Operatori | 1010 | 1248 | 238 |
| Punti di controllo | 1004 | 1271 | 267 |
| Impresa | 1004 | — | |
| Parametri | — | 1295 | |
| `D_Menu` | 731 | — | |

**Le schede si sono assestate fra 1004 e 1018**, ed e' la misura giusta: sei
di quelle maschere hanno due colonne di campi. La proposta per la tappa 5 e'
**1020**.

Il lavoro vero sono i **quattro elenchi sopra 1020**, dove le colonne vanno
ridistribuite, non trascinate.

## Stato

| | |
|---|---|
| Tappe chiuse | 0, 1, 2, 3, **4** |
| Script | 17, compreso il `96` nuovo |
| Maschere | 15, tutte raggiungibili dal menu |
| Difetti aperti | uno, di nomenclatura |
