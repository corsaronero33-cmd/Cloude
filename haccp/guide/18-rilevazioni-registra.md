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

## Fase 2 — Lo script `20`, la struttura definitiva

Il `20` nasce dall'importazione e va rifatto in coda. Il principio, che e'
quello che si sbaglia sempre:

> I due rami **non** devono fare la stessa cosa — uno deve aprire una non
> conformita'. Ma tutto quello che e' comune va scritto **una volta sola**, e
> l'unica differenza in fondo deve essere **quello che si dice**.

Scritto in un altro modo: prima si fa il lavoro, poi si riordina, e solo
alla fine si parla.

```
Consenti interruzione utente [ Disattivato ]
Imposta acquisizione errori [ Attivato ]
Salva record/richieste [ Senza finestra di dialogo ]

# 1 - controlli, prima di toccare il database
Se [ IsEmpty ( RIL|Rilevazioni::gIdPuntoControllo ) ]
   Mostra finestra personalizzata [ "Manca un dato" ; "Scegli il punto di controllo." ]
   Esci dallo script [ "" ]
Fine se
Se [ If ( RIL|PuntoScelto::Grandezza = "visivo" ;
          IsEmpty ( RIL|Rilevazioni::gValoreTesto ) ;
          IsEmpty ( RIL|Rilevazioni::gValore ) ) ]
   Mostra finestra personalizzata [ "Manca un dato" ; "Scrivi il valore rilevato." ]
   Esci dallo script [ "" ]
Fine se

Blocca finestra

# 2 - salva la rilevazione
Vai al formato [ Z_RIL Rilevazioni ]
Nuovo record/richiesta
Imposta campo [ RIL|Rilevazioni::IdPuntoControllo ; RIL|Rilevazioni::gIdPuntoControllo ]
Imposta campo [ RIL|Rilevazioni::DataOra ; Get ( CurrentTimeStamp ) ]
Imposta campo [ RIL|Rilevazioni::IdOperatore ; $$UTENTE.Id ]
Imposta campo [ RIL|Rilevazioni::Valore ; RIL|Rilevazioni::gValore ]
Imposta campo [ RIL|Rilevazioni::ValoreTesto ; RIL|Rilevazioni::gValoreTesto ]
Imposta campo [ RIL|Rilevazioni::Note ; RIL|Rilevazioni::gNote ]
Salva record/richieste
Imposta variabile [ $esito ; If ( RIL|PuntiControllo::Grandezza = "visivo" ;
                        RIL|Rilevazioni::ValoreTesto ;
                        EsitoRilevazione ( RIL|Rilevazioni::Valore ;
                                           RIL|PuntiControllo::LimiteMin ;
                                           RIL|PuntiControllo::LimiteMax ) ) ]
Imposta campo [ RIL|Rilevazioni::Esito ; $esito ]
Imposta campo [ RIL|Rilevazioni::Bloccato ; "Si" ]
Salva record/richieste
Imposta variabile [ $idRilevazione ; RIL|Rilevazioni::Id ]

# 3 - tutti i testi, presi adesso che i dati si raggiungono
Imposta variabile [ $nome ; RIL|PuntiControllo::Descrizione ]
Imposta variabile [ $descrizione ; "Fuori limite: " & RIL|PuntiControllo::Descrizione &
                        ". Valore rilevato " & RIL|Rilevazioni::Valore & " " &
                        RIL|PuntiControllo::UnitaMisura &
                        ", limiti ammessi da " & RIL|PuntiControllo::LimiteMin &
                        " a " & RIL|PuntiControllo::LimiteMax & "." ]
Imposta variabile [ $azione ; RIL|PuntiControllo::AzioneCorrettiva ]
Imposta variabile [ $gravita ; If ( RIL|PuntiControllo::Tipo = "CCP" ; "alta" ; "media" ) ]

# 4 - solo se fuori limite: apri la non conformita'
Se [ $esito = "non conforme" ]
   Vai al formato [ NonConformita ]
   Nuovo record/richiesta
   Imposta campo [ NonConformita::Data ; Get ( CurrentDate ) ]
   Imposta campo [ NonConformita::Origine ; "rilevazione" ]
   Imposta campo [ NonConformita::IdRilevazione ; $idRilevazione ]
   Imposta campo [ NonConformita::Descrizione ; $descrizione ]
   Imposta campo [ NonConformita::AzioneCorrettiva ; $azione ]
   Imposta campo [ NonConformita::Gravita ; $gravita ]
   Imposta campo [ NonConformita::IdOperatoreRilevatore ; $$UTENTE.Id ]
   Salva record/richieste
   Imposta variabile [ $idNC ; NonConformita::Id ]
   Vai al formato [ Z_RIL Rilevazioni ]
   Imposta campo [ RIL|Rilevazioni::IdNonConformita ; $idNC ]
   Salva record/richieste
Fine se

# 5 - chiusura, identica nei due casi
Vai al formato [ Formato originale ]
Imposta campo [ RIL|Rilevazioni::gIdPuntoControllo ; "" ]
Imposta campo [ RIL|Rilevazioni::gValore ; "" ]
Imposta campo [ RIL|Rilevazioni::gValoreTesto ; "" ]
Imposta campo [ RIL|Rilevazioni::gNote ; "" ]
Salva record/richieste

# 6 - un messaggio solo, scelto in base all'esito
Se [ $esito = "non conforme" ]
   Mostra finestra personalizzata [ "Valore fuori limite" ;
       $descrizione & "PP Azione correttiva da eseguire: P" & $azione ]
Altrimenti
   Mostra finestra personalizzata [ "Registrato" ;
       "Rilevazione registrata: " & $nome & " - conforme." ]
Fine se

Vai al campo [ RIL|Rilevazioni::gIdPuntoControllo ]
```

(`P` sta per il segno di paragrafo che FileMaker scrive come pilcrow.)

Sei cose di questo elenco si sbagliano facilmente, e ognuna e' costata un
collaudo:

**`Salva record/richieste` come primo passo.** Se l'operatore scrive `12` e
preme **subito** REGISTRA senza uscire dal campo, il cursore e' ancora li'
dentro e quel valore non e' stato acquisito. Toglie una categoria intera di
guasti che si manifestano "a volte si' e a volte no".

**Il secondo controllo chiede il dato giusto per il tipo di punto.** Non
"o il numero o il testo": su un punto a temperatura un `gValoreTesto` pieno
farebbe passare il controllo con `Valore` vuoto, e `EsitoRilevazione` di un
valore vuoto restituisce `""`. Il registro conserverebbe l'esito vuoto.

**`Vai al formato [ Formato originale ]` sta nella chiusura comune**, dopo il
`Fine se` del lavoro e prima del `Se` dei messaggi. In fondo a tutto il
messaggio esce mentre si e' ancora sul formato tecnico, e il ritorno avviene
solo premendo OK. Dentro i rami diventa un doppione.

**I quattro svuotamenti stanno nella chiusura comune**, per lo stesso motivo.
Dentro i rami sono il doppione che ha prodotto il difetto qui sotto.

**`$nome` viene da `RIL|PuntiControllo::Descrizione`, non da
`RIL|PuntoScelto`.** `RIL|PuntoScelto` parte dal campo globale: svuotato il
globale, la relazione non ha piu' record e la finestra del "Registrato" esce
senza il nome del punto. `RIL|PuntiControllo` parte da `IdPuntoControllo`, che
e' nel record ed e' salvato.

**La non conformita' si apre cambiando formato, non con una finestra nuova.**
`Nuova finestra` ne apre una in stile Documento, con barra dei menu e barra
degli strumenti: lampeggia, e alla consegna — con i menu nascosti a tutti gli
account — comparirebbe con la sua barra. Con `Blocca finestra` in cima, i
cambi di formato nella stessa finestra non si vedono. Il ritorno su
`Z_RIL Rilevazioni` prima di scrivere `IdNonConformita` **e' necessario**:
`Imposta campo` scrive sul record dell'occorrenza del formato, e dal formato
`NonConformita` quel campo non si raggiunge.

*Formato originale* e non il nome della maschera: cosi' lo stesso script serve
il desktop e, alla tappa 10, il telefono.

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
parametri. Ispettore > scheda **Dati** > riquadro **Comportamento** >
**Nascondi oggetto quando**:

```
gValore        nascondi quando:  RIL|PuntoScelto::Grandezza = "visivo"
gValoreTesto   nascondi quando:  RIL|PuntoScelto::Grandezza <> "visivo"
```

**Queste due formule non sono un abbellimento: senza di loro la maschera non
funziona.** Sono sovrapposti, quindi senza le formule sono visibili tutti e
due e davanti sta `gValoreTesto`, che copre l'altro: su un punto a temperatura
il numero non si puo' digitare, `Valore` nasce vuoto,
`EsitoRilevazione ( "" ; min ; max )` restituisce `""`, e il registro conserva
record con `Esito` vuoto mentre lo script dice "conforme".

Poiche' sono sovrapposti, a clic non si distinguono: aprire
**Visualizza > Oggetti** e selezionarli dall'elenco. E per verificarle dal DDR
si cerca `<Conditions><Hide>`, non `<HideCondition>`, che non esiste: vedi
`CLAUDE.md`, *Mai dire "manca" senza una prova in positivo*.

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

### Se l'esito esce vuoto, o i due rami si comportano in modo diverso

Diagnosi in `archivio/collaudo-016.md` —
<https://claude.ai/artifact/6z2L966mmMiMQz4Vqi1pwG>

Due verifiche, in quest'ordine:

1. **Sulla maschera**, scegliere un punto a temperatura: se compare il menu
   `conforme / non conforme` invece della casella numerica, le due formule
   *Nascondi oggetto quando* della fase 4 non stanno facendo il loro lavoro.
   Tutto il resto segue da li'.
2. **Su `Z_RIL Rilevazioni`**, guardare la colonna `Esito` dei record appena
   fatti: **un solo `Esito` vuoto e' un difetto**, non una stranezza. Vuol
   dire che `Valore` e' arrivato vuoto a `EsitoRilevazione`.

Se invece l'esito e' giusto ma il messaggio del "Registrato" non nomina il
punto, `$nome` sta prendendo da `RIL|PuntoScelto` invece che da
`RIL|PuntiControllo`: vedi la fase 2.

### Se il pulsante crea un record vuoto

Diagnosi in `archivio/collaudo-015.md` —
<https://claude.ai/artifact/SJRPNubRK8yEVAfBKNMxTh>

La verifica che decide: compilare la maschera, **uscire dai campi senza
premere REGISTRA**, e guardare nel `Visualizzatore dati` quanto valgono
`RIL|Rilevazioni::gIdPuntoControllo` e `gValore`.

- **Vuoti** → sul formato sono finiti i campi **senza la g**. Scrivendoci, i
  valori non vanno da nessuna parte; i globali restano con quello che c'era
  dalla prova precedente, i due controlli passano, e i quattro `Imposta campo`
  copiano globali vuoti in un record nuovo.
- **Pieni** → i valori ci sono e si perdono dentro lo script: serve il DDR.

---

## Poi

`D_Rilevazioni elenco`, il registro: sola lettura, per data decrescente,
raggruppato per giorno col sottoriepilogo. **DDR a fine tappa**, con tutte e
due.
