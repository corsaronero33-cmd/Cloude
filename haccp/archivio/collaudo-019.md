# Collaudo 019 — Revisione 20, la tappa 6 e' chiusa

Scheda di lavoro:
<https://claude.ai/artifact/XmgzrxFqHYdJafeuqan71A>

**`D_Rilevazioni elenco` e' montata e funziona.** Un difetto solo, piccolo ma
che si vede proprio dove questa maschera e' diversa dalle altre, e due passi
morti da togliere.

---

## Quello che risulta giusto

### Il formato

| Parte | Alta | y | |
|---|---|---|---|
| Intestazione | 143 | 0&ndash;143 | |
| **Riepilogo iniziale** | 40 | 143&ndash;183 | **raggruppato su `Giorno`** |
| Corpo | 30 | 183&ndash;213 | |
| Pie' di pagina | 38 | 213&ndash;251 | |

Le sette colonne hanno etichetta e campo alla **stessa X e stessa
larghezza**, etichette a y 114 e campi a y 184, e l'ultima chiude a **996**:

| | X | Largh. | Campo |
|---|---|---|---|
| Ora | 24 | 70 | `RIL\|Rilevazioni::Ora` |
| Punto di controllo | 94 | 290 | `RIL\|PuntiControllo::Descrizione` |
| Valore | 384 | 100 | `RIL\|Rilevazioni::Valore` |
| Unita | 484 | 80 | `RIL\|PuntiControllo::UnitaMisura` |
| Esito | 564 | 120 | `RIL\|Rilevazioni::Esito` |
| Operatore | 684 | 150 | `RIL\|Operatori::NomeCompleto` |
| Note | 834 | 162 | `RIL\|Rilevazioni::Note` |

Ci sono anche il rettangolo bianco della fascia etichette (x 0, y 110,
1020 x 32) e la linea sotto la data nel riepilogo (x 24, y 178, larga 972).

### I campi nuovi

| Campo | Tipo | Formula | Memorizzato |
|---|---|---|---|
| `Giorno` | Calcolo, risultato Data | `GetAsDate ( DataOra )` | **si'** |
| `Ora` | Calcolo, risultato Ora | `GetAsTime ( DataOra )` | **si'** |
| `ConteggioRilevazioni` | Riepilogo | Conteggio di `Id` | — |

`storeCalculationResults="True"` su tutti e due i calcoli: e' la condizione
perche' `Giorno` si possa usare per ordinare, e quindi perche' il Riepilogo
iniziale compaia. Era il punto in cui questa maschera si rompeva in silenzio,
ed e' a posto.

### Lo script, i pulsanti, il trigger

`Ordina i record`: `Ripristina` attivo, **senza** finestra di dialogo,
`Giorno` decrescente e poi `DataOra` decrescente, nell'ordine giusto.
`Passa al modo Trova` ha **Pausa disattivata**. `Vai a Record/Richiesta/Pagina [ Primo ]`.

| Pulsante | X | Largh. | Script | Parametro |
|---|---|---|---|---|
| `← Menu` | 24 | 84 | `90 - Utilita - Vai a` | `"D_Menu"` |
| `Tutte` | 109 | 117 | `91 - Rilevazioni - Entra nell'elenco` | nessuno |
| `Solo non conformi` | 227 | 187 | lo stesso | `"nonconformi"` |

Trigger `OnLayoutEnter` -> `91 - Rilevazioni - Entra nell'elenco`, senza
parametro.

Formattazione condizionale su `Esito`:
`RIL|Rilevazioni::Esito = "non conforme"` -> **grassetto**, colore
`rgba(86.67%, 0%, 0%)`, cioe' esattamente **`#DD0000`**.

---

## 1. Il contatore in fondo conta la tabella, non il trovato

In fondo alla maschera c'e' **`{{TotalRecordCount}}`**. Su tutti gli altri
sette elenchi c'e' `{{FoundCount}}`:

| Formato | Contatore |
|---|---|
| `D_Reparti elenco` | `{{FoundCount}}` |
| `D_Attrezzature elenco` | `{{FoundCount}}` |
| `D_Fornitori elenco` | `{{FoundCount}}` |
| `D_Prodotti elenco` | `{{FoundCount}}` |
| `D_Operatori elenco` | `{{FoundCount}}` |
| `D_PuntiControllo elenco` | `{{FoundCount}}` |
| `D_Parametri elenco` | `{{FoundCount}}` |
| `D_Rilevazioni elenco` | **`{{TotalRecordCount}}`** |

I due nomi sono vicini nel menu `Inserisci > Variabile di unione`, e si
prendono uno per l'altro.

**E qui conta piu' che altrove, perche' questa e' l'unica maschera con un
filtro.** Premendo `Solo non conformi` il set trovato diventa, per dire, 3
righe, ma il piede continuerebbe a dire *"Record 1 Di 248"*: il totale della
tabella. Su un registro HACCP un numero che non corrisponde a quello che si
vede e' peggio che nessun numero.

Si sostituisce con `{{FoundCount}}`. Con `Tutte` i due valori coincidono,
quindi il difetto si vede **solo** dopo aver premuto il filtro.

## 2. Due passi morti dentro lo script `91`

```
10  Esegui Trova/Sostituisci   [ disattivato ]
11  modo Usa           [ disattivato ]
```

Tutti e due hanno `enable="False"`: **non girano**, e il comportamento oggi e'
giusto. Sono il segno che nell'elenco dei passi si e' preso
`Esegui Trova/Sostituisci` al posto di `Esegui la ricerca` — i due nomi sono
attaccati — e invece di cancellarlo lo si e' disattivato.

Vanno **cancellati**, non lasciati disattivati. `Esegui Trova/Sostituisci`
non e' un passo qualunque: se un domani qualcuno lo riattiva per sbaglio,
quello cerca e **sostituisce testo in tutti i record e in tutti i campi**.
Non e' una cosa che deve stare addormentata dentro uno script del registro.

`Passa al modo Usa` e' innocuo (dopo `Esegui la ricerca` si e' gia' in Modalita'
Scheda), ma tanto vale togliere tutti e due insieme.

## 3. Piccolo: manca la linea sopra la fascia delle etichette

Gli altri elenchi hanno una `Line` x 0, y 101, larga 1020, che stacca i
pulsanti dalla fascia bianca delle intestazioni di colonna. Su
`D_Rilevazioni elenco` non c'e'.

Non e' un difetto: e' una riga che **non avevo scritto nella guida**. Si
aggiunge se si vuole la maschera identica alle altre, si lascia stare se non
da' fastidio.

---

## Una cosa che avevo scritto male io

Nel collaudo 018 avevo scritto che `Operatori::NomeCompleto` e' *"non
memorizzato: va bene per mostrarlo, non per ordinare"*. **Non e' vero.**
Nel file ha `storeCalculationResults="True"`, come `Giorno` e `Ora`: e'
memorizzato e si puo' usare per ordinare.

Avevo letto `index="None"` e l'avevo preso per "non memorizzato". Sono due
cose diverse: `index` dice se l'indice e' **gia' costruito** (`None` significa
che FileMaker lo costruira' la prima volta che serve, visto che
`autoIndex="True"`), `storeCalculationResults` dice se il risultato e'
memorizzato. Corretto nel collaudo 018.

---

## La tappa 6 e' chiusa

Si misura una temperatura, il programma la confronta con i limiti del punto,
scrive l'esito, **apre da solo la non conformita'** con l'azione correttiva, e
il registro si legge per giornate con i fuori limite in rosso.

### Resta aperto, e rientra alla tappa 7

**Debito n. 1.** Gli script `01`, `02`, `10` e — dalla tappa 6 — anche il `20`
girano su formati nati dall'importazione. Si rinominano col prefisso `Z_` e
l'ancora davanti (`NonConformita` -> `Z_NCF NonConformita`) quando la tappa 7
tocchera' quel formato comunque. FileMaker segue i formati per identificativo
interno: i riferimenti negli script non si rompono.
