# Passo 5 — Le maschere per il PC

Prerequisito: motore completo e collaudato (`archivio/collaudo-006.md`).

> **Questo documento e' la mappa d'insieme**: le decisioni prese una volta, i
> nomi, il modello elenco/scheda, cosa cambia da un'anagrafica all'altra.
> La costruzione vera, oggetto per oggetto e con tutte le coordinate, sta nei
> documenti `13a`, `13b`, ... — **uno per maschera**, nell'ordine in cui si
> costruiscono. Si comincia da `guide/01-reparti-scheda.md`.

Si comincia dal back office, e non per comodita': **senza le anagrafiche non
c'e' niente da monitorare**. I punti di controllo, le attrezzature e i
fornitori si inseriscono al PC; il telefono serve dopo, quando c'e' qualcosa
da registrare.

---

## Le decisioni, prese una volta

### Nomi

Prefisso **`D_`** per il desktop, come da `03-CONVENZIONI.md`.
Arriveranno poi `T_` per iPad e `F_` per iPhone.

Ogni anagrafica ha **due formati**: l'elenco e la scheda.

```
D_Menu
D_Reparti elenco          D_Reparti scheda
D_Attrezzature elenco     D_Attrezzature scheda
D_PuntiControllo elenco   D_PuntiControllo scheda
```

### Sempre sull'occorrenza ancora

`D_Reparti elenco` si basa su **`REP|Reparti`**, non sulla `Reparti` nuda.

Non e' pignoleria: costruendo le maschere vere sulle ancore, i formati
automatici dell'importazione diventano finalmente cancellabili, ed e' l'inizio
della restituzione del **debito n. 1**.

### Elenco e scheda, non una cosa sola

L'elenco serve a **trovare**: poche colonne, molte righe, ordinabile.
La scheda serve a **compilare**: tutti i campi, uno sotto l'altro, spazio per
scrivere.

Provare a fare tutto in una maschera sola produce una griglia con venti
colonne in cui non si legge niente e non si scrive comodi. E' l'errore che si
vede in meta' dei gestionali.

### Un tema solo: `Haccp`, derivato da **Apex blu**

Si parte dal tema di serie **Apex blu** e si cambia **una cosa sola**:
l'intestazione, che di suo e' azzurro chiaro, diventa **`#1B3A5C`**. Poi
`Formati` -> `Salva come tema` con il nome **`Haccp`**, e da li' in avanti i
formati nuovi si creano su `Haccp`.

Due conseguenze, tutte e due buone:

- **I colori non si scrivono a mano.** Campi, etichette e pulsanti li veste
  Apex blu. Nelle guide di costruzione si danno le **misure**; la colonna
  Aspetto dice quasi sempre *lascia com'e'*. Meno lavoro e piu' uniforme.
- **L'intestazione si costruisce una volta.** Il riempimento di una *parte* fa
  parte del tema: colorata una volta e salvata in `Haccp`, ogni formato nuovo
  nasce gia' con l'intestazione giusta, senza copiare e incollare niente.

Un tema di FileMaker non si modifica: se ne salva una copia con un nome
nostro. Quando piu' avanti si cambia uno stile e lo si vuole ovunque, si
rifa' `Formati` -> `Salva come tema` su `Haccp`; altrimenti la modifica vale
solo sulla maschera dove l'hai fatta.

FileMaker non ha le pagine mastro: la **fascia dei pulsanti** e i pulsanti
stessi si costruiscono **una volta** e si copiano e incollano sugli altri
formati. Fallo bene la prima volta. Il colore di fondo dell'intestazione no:
quello viaggia dentro il tema.

---

## Misure standard

**Queste sono le misure del file reale**, rilevate dall'esportazione XML del
17/09/2026 e verificate in `archivio/collaudo-007.md`. Dove divergono da quello che
era scritto in `13a` e `13b`, **vince questa tabella**: le guide di
costruzione erano una proposta, il file e' la verita'.

Larghezza formato: **685**, uguale per elenco e scheda, cosi' la finestra non
cambia misura quando si passa dall'uno all'altro.

**Margini: 24 a sinistra, il contenuto chiude a 680 a destra.** Il margine
destro e' quindi 5, non 24: e' asimmetrico, ma e' cosi' da prima ed e'
coerente in tutto il file. Ci finiscono `<<$$UTENTE.Nome>>`, l'ultima colonna
dell'elenco, la casella di ricerca e il pulsante `Tutti`.

### Intestazione

| | Scheda | Elenco |
|---|---|---|
| Altezza | 100 | 143 |
| Fondo | `#1B3A5C` (dalla parte, quindi dal tema) | idem |
| Titolo | x 24, y 16 — stile `Titolo maschera` | idem |
| Operatore | `<<$$UTENTE.Nome>>` x 425, y 18, largh. 255, allineato a destra | idem |
| Pulsanti | y **57**, alt. **35**, largh. **117**, passo **122** (x 24, 146, 268) | idem, due soli |
| Linea sotto i pulsanti | — | y 101, da bordo a bordo |
| Fascia bianca colonne | — | x 0, y 110, alt. 32 |
| Etichette colonna | — | y **115**, alt. 22 |

I pulsanti stanno **direttamente sul blu**, senza fascia bianca: testo bianco
e icona SVG. Nessun pulsante in colore pieno — su fondo scuro sparirebbe.

### Corpo della scheda

| | |
|---|---|
| Altezza parte | 270 |
| Campi | x **123**, largh. **329** tutti uguali, alt. **32** |
| Passo verticale | **36** (primo campo a y 39 dall'inizio della parte) |
| Etichette | allineate a destra, **bordo destro a 112** |
| Niente riquadro | ne' rettangolo bianco, ne' titolo di sezione, ne' linea |

Il riquadro torna utile **solo quando i campi sono tanti**: su `PuntiControllo`
si raggruppa, su un'anagrafica da quattro campi no.

### Corpo dell'elenco

Altezza parte **32**. Campi a **y 1, alt. 28**, sfondo trasparente e bordi
spenti. Bordo superiore della parte 1 pt grigio chiaro: e' il filo fra le righe.

| Colonna | X | Largh. |
|---|---|---|
| `Apri` (pulsante) | 24 | 51 |
| Codice | 85 | 169 |
| Descrizione | 264 | 276 |
| Ordine | 540 | 70 (allineato a destra) |
| Attivo | 610 | 70 |

**Etichetta di colonna e campo devono avere la stessa X e la stessa
larghezza.** Si spostano selezionandoli insieme, mai uno per volta.

### La ricerca, sugli elenchi

| Oggetto | X | Y | Largh. | Alt. |
|---|---|---|---|---|
| Casella `<OCC>::gCerca` | 273 | 58 | 307 | 32 |
| Pulsante `Tutti` | 585 | 58 | 95 | 35 |

Dettagli, trigger e parametri: `guide/03-ricerca.md`.

### Pie' di pagina

Altezza **38**, fondo bianco, bordo solo sopra. Il contatore e' fatto di
**quattro oggetti** a y 5, alti 23:

| Oggetto | X | Largh. |
|---|---|---|
| `Record` | 24 | 55 |
| `{{RecordNumber}}` | 84 | 70 — fondo grigio chiaro |
| `Di` | 157 | 19 |
| `{{FoundCount}}` | 179 | 70 — fondo grigio chiaro |

Il fondo grigio sui due simboli distingue a colpo d'occhio il testo fisso dal
numero che cambia.

### Stili del tema `HACCP`

| Stile | Su cosa |
|---|---|
| `Titolo maschera` | il titolo bianco dell'intestazione |

Etichette, campi e pulsanti usano gli stili di Blu Apex: non ne servono di
nostri.

---

## Lo script di navigazione

Un solo script per tutti gli spostamenti, che riceve come parametro il nome
del formato dove andare. Stesso spirito dei moduli di funzioni: una cosa sola,
chiamata da molti punti.

### `90 - Utilita - Vai a`

```
# === 90 - UTILITA - VAI A ===
# Sposta l'utente sul formato ricevuto come parametro.
# Lo chiamano tutti i pulsanti di navigazione: un solo script invece di uno
# per ogni destinazione.
# Se il formato non esiste ancora lo dice con garbo, invece di lasciare
# comparire l'errore di FileMaker: costruendo le maschere una per volta,
# ci sono sempre pulsanti che puntano a qualcosa che arriva domani.
# Parametro: il nome esatto del formato, fra virgolette.

Imposta acquisizione errori [ Attivato ]
Imposta variabile [ $formato ; Valore: Get ( ParametroScript ) ]

Se [ IsEmpty ( $formato ) ]
    Esci dallo script [ Risultato del testo: "" ]
Fine se

Vai al formato [ Nome del formato per calcolo: $formato ]

Se [ Get ( UltimoErrore ) <> 0 ]
    Mostra finestra di dialogo personalizzata
        [ "Non ancora pronto" ;
          "La maschera " & $formato & " non c'e' ancora." ]
    Esci dallo script [ Risultato del testo: "" ]
Fine se

Mostra tutti i record
```

Nel passo `Vai al formato`, alla voce **Formato** scegli
**Nome del formato per calcolo** e metti `$formato`.

Ogni pulsante poi si imposta cosi': azione **Esegui script**, script
`90 - Utilita - Vai a`, **parametro facoltativo** il nome del formato fra
virgolette, per esempio `"D_Reparti elenco"`.

Il giorno che un formato cambia nome, si cambia il parametro dei pulsanti che
lo puntano. Il giorno che cambia il modo di navigare — una transizione, un
controllo dei permessi — si cambia in un posto solo.

---

## Il menu

`D_Menu`, basato su **`IMP|Impresa`**, vista Modulo.

Non contiene dati: e' il punto da cui si parte e a cui si torna. Lo si basa
sull'impresa perche' cosi' in testata puo' mostrare il nome del locale.

**In testata:** il nome del locale e, a destra, chi sta lavorando. Per il nome
dell'operatore non serve un campo: si usa una **variabile di unione**,
scrivendo nel testo del formato

```
<<$$UTENTE.Nome>>
```

FileMaker la sostituisce con il contenuto della variabile globale che lo
script di avvio ha riempito.

**Nel corpo:** i pulsanti, raggruppati per quello che l'utente vuole fare, non
per come e' fatto il database.

| Gruppo | Pulsanti |
|---|---|
| Registri | Rilevazioni, Ricevimenti, Non conformita', Sanificazioni |
| Anagrafiche | Reparti, Attrezzature, Punti di controllo, Fornitori, Prodotti, Operatori |
| Configurazione | Impresa, Parametri |

Per adesso funzioneranno solo i pulsanti dei formati che avrai creato. Gli
altri li aggiungi mano a mano: meglio un menu che cresce di un pulsante per
volta che un menu finto pieno di pulsanti che non fanno niente.

---

## Il modello: elenco e scheda

Si costruisce **una volta** su `Reparti`, che ha cinque campi e si finisce in
venti minuti, e poi si ripete uguale su tutte le altre.

### `D_Reparti elenco`

> Costruzione completa: **`guide/02-reparti-elenco.md`**. Non si crea da zero,
> si **duplica la scheda** e si cambia `Visualizza come` in Elenco: cosi' il
> tema, l'intestazione e i pulsanti arrivano gia' fatti.

`Formati` -> `Duplica formato` da `D_Reparti scheda`, poi `Imposta formato`
-> **Visualizza come: Elenco**.

| Parte | Cosa ci va |
|---|---|
| Intestazione | titolo "Reparti", pulsante **Menu**, pulsante **Nuovo** |
| Intestazione colonne | le etichette: Apri, Codice, Descrizione, Ordine, Attivo |
| Corpo | un pulsante **Apri** e i quattro campi |
| Pie' di pagina | conteggio dei record |

Il pulsante **Apri** sulla riga fa `90 - Utilita - Vai a` con parametro
`"D_Reparti scheda"`. Il record su cui si e' cliccato resta quello corrente,
quindi la scheda si apre gia' sul reparto giusto.

> Un pulsantino esplicito su ogni riga e' piu' brutto di una riga interamente
> cliccabile, ma si costruisce in trenta secondi invece che combattendo con
> la sovrapposizione degli oggetti. Quando le maschere saranno finite e
> funzionanti, se la riga cliccabile ti manca la aggiungiamo.

### `D_Reparti scheda`

> Costruzione completa, con il disegno in scala e le coordinate di ogni
> oggetto: **`guide/01-reparti-scheda.md`**. Qui sotto solo l'impianto.

`Formati` -> `Nuovo formato/rapporto` -> **Modulo**, su `REP|Reparti`.

| Parte | Cosa ci va |
|---|---|
| Intestazione | titolo, pulsante **Elenco**, pulsante **Nuovo**, pulsante **Elimina** |
| Corpo | i campi uno sotto l'altro, con le etichette a sinistra |

**Elimina** non ha bisogno di uno script: azione **Esegui passo script** ->
`Elimina record/richiesta`, lasciando **attivata** la finestra di conferma.

I cinque campi di sistema (`Id`, `CreatoIl`, `CreatoDa`, `ModificatoIl`,
`ModificatoDa`) **non si mettono sulla scheda**: non servono a chi compila.
Se ti servono per il collaudo, mettili in fondo e poi toglili.

---

## Le due anagrafiche successive

Si duplicano i formati dei reparti (`Formati` -> `Duplica formato`), si cambia
la tabella di origine e si sistemano i campi. Quello che cambia e' poco.

### `D_Attrezzature`

Aggiunge due cose:

**Menu a tendina.** Sul campo `Tipo`, `Formato` -> `Controllo` ->
**Menu a discesa** con la lista `vl_TipoAttrezzatura`. Idem per `Attivo` con
`vl_SiNo`.

**Il reparto.** Il campo `IdReparto` contiene un IDUU, che non si puo' mostrare
a nessuno. Si mette il campo con controllo **Menu a comparsa** e lista
**`vl_Reparti`**: l'operatore vede "Cucina" e continua a vederla anche dopo
aver scelto, il database memorizza l'IDUU.

Con **Menu a discesa** invece, appena si esce dal campo ricompare l'IDUU: la
regola completa e' in `CLAUDE.md`.

Sull'**elenco** invece il campo giusto da mostrare non e' `IdReparto` ma
`ATT|Reparti::Descrizione`, che arriva dalla relazione: nell'elenco si legge e
basta, non si sceglie.

### `D_PuntiControllo`

E' **la piu' importante del back office**: e' qui che si decide cosa il
programma controllera' e con quali limiti.

Menu a tendina su: `Tipo` (`vl_TipoPuntoControllo`), `Fase`
(`vl_FasePuntoControllo`), `Grandezza` (`vl_Grandezza`), `UnitaMisura`
(`vl_UnitaMisuraControllo`), `Frequenza` (`vl_Frequenza`),
`IdAttrezzatura` (`vl_Attrezzature`), `IdReparto` (`vl_Reparti`),
`RichiedeFoto`, `RichiedeFirma`, `Attivo` (`vl_SiNo`).

`AzioneCorrettiva` va messo **grande**: e' un testo di due righe che
l'operatore leggera' sul telefono nel momento peggiore della giornata. Dargli
due centimetri di altezza sulla scheda significa che chi lo scrive lo scrive
per esteso.

Nell'elenco tieni poche colonne: `Codice`, `Descrizione`, `Tipo`,
`LimiteMin`, `LimiteMax`, `Attivo`. Bastano a capire cosa c'e'.

---

## Collaudo

| Prova | Deve succedere |
|---|---|
| Dal menu, pulsante Reparti | si apre `D_Reparti elenco` |
| Pulsante Nuovo, compili, torni all'elenco | il reparto nuovo c'e' |
| Pulsante Apri su una riga | la scheda si apre su **quel** reparto |
| Su `D_Attrezzature scheda`, tendina Reparto | mostra le descrizioni, non gli IDUU |
| Salvi e torni all'elenco | la colonna Reparto mostra la descrizione giusta |
| Crei un punto di controllo completo | le tendine propongono i valori giusti |
| Esci e riapri il file | lo script di avvio ti porta dove previsto |

L'ultima prova e' quella che conta davvero: **crea un punto di controllo vero
per un frigorifero vero**, poi rifai la prova 6 del collaudo degli script. Se
la misura fuori limite genera la non conformita' partendo da dati inseriti
dalle maschere e non a mano, il giro e' chiuso.

---

## Cosa viene dopo

`10-STAMPE.md`, oppure le maschere per iPhone: dipende da cosa serve prima al
cliente. La stampa dei registri e' quello che l'ispettore chiede; il telefono
e' quello che fa compilare il registro davvero.
