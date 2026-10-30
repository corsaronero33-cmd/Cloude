# Scheda 18 — `D_Rilevazioni registra` (tappa 6, prima di due)

Scheda di lavoro con le spunte:
<https://claude.ai/artifact/EDoUvUjqFjFpL63ceLzBqE>

La maschera con cui si segna che il frigo e' a 3 gradi. Lo script `20` e'
scritto e collaudato dal primo giorno: qui gli si mette davanti una faccia.

---

## Tre cose che la rendono diversa da tutte

### 1. Non si scrive nel record: si scrive in quattro campi globali

`gIdPuntoControllo`, `gValore`, `gValoreTesto`, `gNote`. Il record nasce
**solo** quando si preme `REGISTRA`, e lo crea lo script.

Se qualcuno comincia a compilare e si distrae, non resta in archivio **un
registro mezzo scritto**. In un registro sanitario una riga a meta' si spiega
male, una riga che non c'e' si spiega.

### 2. Per questo i campi vanno nell'intestazione

In FileMaker il **corpo** si disegna una volta per record: con la tabella
vuota non si disegna, e **i campi non si vedono**. `Rilevazioni` e' vuota
adesso e lo sara' a ogni file di cliente nuovo: la maschera piu' importante si
presenterebbe come una pagina bianca.

Due deroghe che ne derivano: il formato ha **una parte sola** — niente corpo,
niente pie' — e la **fascia blu e' un rettangolo**, non il colore della parte,
perche' l'intestazione qui e' alta 510.

### 3. Serve una relazione nuova

La relazione esistente parte da `IdPuntoControllo`, il campo **del record**,
che mentre si compila non esiste ancora. Quindi i limiti non si potrebbero
mostrare.

| Relazione | Parte da | Quando funziona |
|---|---|---|
| `RIL\|Rilevazioni` → `RIL\|PuntiControllo` | `IdPuntoControllo` | dopo che il record esiste |
| **`RIL\|Rilevazioni` → `RIL\|PuntoScelto`** | **`gIdPuntoControllo`**, globale | **subito, anche senza record** |

E' la differenza fra una maschera utile e una che fa scrivere alla cieca:
scegli *Frigo carni* e **vedi comparire** "da 0 a 4 °C".

## Fase 1 — La relazione

Si duplica l'occorrenza `RIL|PuntiControllo`, si rinomina **`RIL|PuntoScelto`**,
e si collega:

```
RIL|Rilevazioni::gIdPuntoControllo   =   RIL|PuntoScelto::Id
```

Il nome segue la convenzione gia' nel file: quando servono due occorrenze
della stessa tabella nello stesso gruppo, la seconda prende il **ruolo** —
come `NCF|OperatoreRilevatore` accanto a `NCF|OperatoreResponsabile`.

**Una relazione da un campo globale funziona sempre**, anche con la tabella
vuota e fuori da ogni record.

## Fase 2 — Due correzioni allo script `20`

**2a.** Il `20` va su `Z_RIL Rilevazioni` e non torna indietro: l'operatore si
ritroverebbe sul formato tecnico. In fondo, dopo i quattro `Imposta campo` che
svuotano i globali, va aggiunto `Vai al formato [ Formato originale ]`.

*Formato originale* e non il nome della maschera: cosi' lo stesso script serve
il desktop e, alla tappa 10, il telefono.

**2b.** Quando il valore e' conforme lo script non dice niente. Al
`Se [ $esito = "non conforme" ]` va aggiunto un `Altrimenti`:

```
Mostra finestra di dialogo personalizzata
    [ "Registrato" ;
      "Rilevazione registrata: " & RIL|PuntoScelto::Descrizione & " - conforme." ]
```

Un OK in piu' da premere: in un registro sanitario la cosa peggiore e'
**credere** di aver registrato.

## Fase 3 — Il formato

Vista **Modulo**, occorrenza `RIL|Rilevazioni`, larghezza **1020**.
`Imposta parti...`: **eliminare Corpo e Pie' di pagina**. Resta la sola
**Intestazione**, alta **510**.

La fascia blu e' un rettangolo x 0 y 0, 1020 × 100, `#1B3A5C`, **mandato
indietro** — se no copre titolo e pulsanti.

Due riquadri: `CHE COSA CONTROLLI` (y 126, alto 130), `QUANTO HAI MISURATO`
(y 286, alto 150).

Pulsanti a y 57: `← Menù` → `90` con `"D_Menu"`, `Registro` → `90` con
`"D_Rilevazioni elenco"` — che non esiste ancora, ed e' giusto.

## Fase 4 — I campi

| Y | Etichetta | Campo | X | Largh. | Controllo |
|---|---|---|---|---|---|
| 152 | Punto di controllo | `gIdPuntoControllo` | 143 | 853 | **Menu a comparsa** `vl_PuntiControllo` |
| 202 | Misura | `RIL\|PuntoScelto::Grandezza` | 143 | 180 | sola lettura |
| 202 | Limiti | `RIL\|PuntoScelto::LimiteMin` | 422 | 100 | sola lettura |
| 202 | `a` | — | 532 | 12 | testo fisso |
| 202 | — | `RIL\|PuntoScelto::LimiteMax` | 552 | 100 | sola lettura |
| 202 | Unita | `RIL\|PuntoScelto::UnitaMisura` | 751 | 245 | sola lettura |
| 312 | Valore | `gValore` | 143 | 300 | casella **alta 50**, 24pt |
| 312 | *sovrapposto* | `gValoreTesto` | 143 | 300 | **Menu a discesa** `vl_EsitoRilevazione` |
| 382 | Note | `gNote` | 143 | 853 | casella |

I quattro campi di `RIL|PuntoScelto`: sfondo grigio, **immissione tolta**.
Sono quello che il punto dice, non quello che l'operatore scrive.

**I due campi del valore si nascondono a vicenda**, stessa tecnica dei
parametri:

```
gValore        nascondi quando:  RIL|PuntoScelto::Grandezza = "visivo"
gValoreTesto   nascondi quando:  RIL|PuntoScelto::Grandezza <> "visivo"
```

Diciassette punti su trentatre' sono visivi: "integrita' delle zanzariere" non
ha un numero da scrivere, ha un esito.

**Con il punto non ancora scelto compare la casella numerica** (`Grandezza` e'
vuota, quindi diversa da `"visivo"`). E' accettabile: la maschera si legge
dall'alto, e la prima cosa da fare e' scegliere il punto.

## Fase 5 — `REGISTRA`, e il menu

Pulsante x 143, y 456, 300 × 54, riempimento `#1B3A5C`, testo bianco →
script `20`, nessun parametro.

**E' l'unico pulsante pieno di tutto il progetto:** gli altri sono
navigazione, questo **scrive nel registro**.

Su `D_Menu`, il pulsante `Rilevazioni` passa da `"D_Rilevazioni elenco"` a
**`"D_Rilevazioni registra"`**: per chi lo preme la cosa da fare e' segnare
una temperatura, non leggere cosa e' stato segnato ieri.

## Fase 6 — Collaudo

Quattordici prove. Le tre che contano:

- **6.3** — scelto il punto, **compaiono i limiti**. E' la prova della
  relazione nuova.
- **6.9** — valore `12` su un frigorifero: deve comparire *"Valore fuori
  limite"* con la descrizione, i limiti **e l'azione correttiva** caricata
  alla tappa 3. E' il momento in cui il programma diventa quello che doveva
  essere.
- **6.13** — su un punto **visivo** scegliendo `non conforme`: la non
  conformita' deve nascere **anche li'**. E' l'unico ramo in cui il programma
  non calcola niente ma si fida di quello che l'operatore ha scelto.

Se la non conformita' non nasce, controllare che `$esito` valga esattamente
`non conforme`: la funzione `EsitoRilevazione` lo restituisce in minuscolo e
`vl_EsitoRilevazione` deve contenere **le stesse identiche parole**.

---

## Poi

`D_Rilevazioni elenco`, il registro: sola lettura, per data decrescente,
raggruppato per giorno col sottoriepilogo. **DDR a fine tappa**, con tutte e
due.
