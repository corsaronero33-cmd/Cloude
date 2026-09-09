# Passo 3 — I calcoli

Prerequisito: schema chiuso (`COLLAUDO-v004.md`).

Qui il programma comincia a ragionare: capire da solo se una misura e' fuori
limite, quanto manca a una scadenza, se una partita IVA e' scritta bene, e
leggere lotto e data direttamente dal codice a barre del cartone.

---

## Dove vivono i calcoli

Tutto quello che si riusa sta in **funzioni personalizzate**:
`File` -> `Gestisci` -> `Funzioni personalizzate` -> `Nuovo`.

Cosi' la regola esiste in un posto solo. Se domani cambia il modo di calcolare
un esito, si cambia li' e cambia dappertutto.

**La regola che non si viola:** i limiti critici non si scrivono mai dentro una
formula. Arrivano sempre da `PuntiControllo` o da `Prodotti`, passati come
parametri. Se in un calcolo compare il numero 75, e' un errore.

### I nomi dei parametri

Un parametro non puo' chiamarsi come una funzione di FileMaker. E' il caso di
**`codice`**: in italiano `Codice` e' una funzione vera (l'equivalente di
`Code`, che da' il codice numerico di un carattere), quindi FileMaker rifiuta
il nome.

Per questo i parametri delle funzioni GS1 hanno la **`p`** davanti:
`pCodice`. Se in futuro FileMaker ne rifiuta un altro, mettici la `p` davanti
allo stesso modo e ricordati di cambiarlo **anche dentro il calcolo**, non
solo nell'elenco dei parametri.

### Memorizzato o non memorizzato

E' la distinzione piu' importante di questo documento.

| Cosa | Come | Perche' |
|---|---|---|
| `Rilevazioni::Esito` | campo **Testo normale**, scritto da uno script | Deve raccontare cosa fu deciso **quel giorno**. Se domani si stringe un limite, le rilevazioni di ieri non devono cambiare esito da sole: sarebbe riscrivere la storia, ed e' esattamente cio' che un registro non deve fare |
| `RigheRicevimento::Esito` | campo **Testo normale**, scritto da uno script | stesso motivo |
| Semaforo delle scadenze | campo **calcolo non memorizzato** | Deve cambiare da solo col passare dei giorni: e' giusto che oggi dica "in scadenza" e fra una settimana "scaduto" |

Per i calcoli non memorizzati: nella finestra del campo, `Archiviazione` ->
spunta **"Non memorizzare i risultati del calcolo"**.

---

## Il parametro dei giorni di avviso

Il semaforo ha bisogno di sapere con quanti giorni di anticipo avvisare. Il
valore sta in `Parametri`, chiave `GiorniAvvisoScadenza`, ma un campo calcolato
non puo' andarselo a leggere in un'altra tabella senza una relazione.

Soluzione: un **campo globale**. I campi globali si leggono da qualunque
tabella senza relazioni.

1. Tabella `Parametri`, nuovo campo `gGiorniAvviso`, tipo **Numero**
2. `Opzioni` -> `Archiviazione` -> spunta **"Utilizza archiviazione globale"**
3. Lo script di avvio lo riempira' leggendo il record con
   `Chiave = "GiorniAvvisoScadenza"` (lo scriviamo in `12-SCRIPT.md`)

Finche' lo script non c'e', scrivici dentro `7` a mano per provare.

---

# Le funzioni

Creale in quest'ordine: alcune usano le precedenti.

## 1. `Raddoppia ( cifra )`

Serve solo alla partita IVA. Raddoppia una cifra e, se il risultato supera 9,
gli toglie 9.

```
Let ( r = GetAsNumber ( cifra ) * 2 ;
  If ( r > 9 ; r - 9 ; r )
)
```

## 2. `PartitaIvaValida ( partitaIva )`

Torna `1` se e' valida, `0` se non lo e'. Una partita IVA vuota torna `1`: la
funzione controlla la forma, non l'obbligatorieta'.

```
Let ( [
  p = Filter ( partitaIva ; "0123456789" )
] ;
Case (
  IsEmpty ( partitaIva ) ; 1 ;
  Length ( p ) <> 11 ; 0 ;
  Let ( [
    d1  = GetAsNumber ( Middle ( p ;  1 ; 1 ) ) ;
    d2  = GetAsNumber ( Middle ( p ;  2 ; 1 ) ) ;
    d3  = GetAsNumber ( Middle ( p ;  3 ; 1 ) ) ;
    d4  = GetAsNumber ( Middle ( p ;  4 ; 1 ) ) ;
    d5  = GetAsNumber ( Middle ( p ;  5 ; 1 ) ) ;
    d6  = GetAsNumber ( Middle ( p ;  6 ; 1 ) ) ;
    d7  = GetAsNumber ( Middle ( p ;  7 ; 1 ) ) ;
    d8  = GetAsNumber ( Middle ( p ;  8 ; 1 ) ) ;
    d9  = GetAsNumber ( Middle ( p ;  9 ; 1 ) ) ;
    d10 = GetAsNumber ( Middle ( p ; 10 ; 1 ) ) ;
    d11 = GetAsNumber ( Middle ( p ; 11 ; 1 ) ) ;
    somma = d1 + d3 + d5 + d7 + d9
          + Raddoppia ( d2 ) + Raddoppia ( d4 ) + Raddoppia ( d6 )
          + Raddoppia ( d8 ) + Raddoppia ( d10 ) ;
    controllo = Mod ( 10 - Mod ( somma ; 10 ) ; 10 )
  ] ;
    If ( controllo = d11 ; 1 ; 0 )
  )
) )
```

**Dove si usa:** convalida del campo `Fornitori::PartitaIva`.
`Opzioni` -> `Convalida` -> **Convalidata da calcolo**, formula
`PartitaIvaValida ( PartitaIva )`, e nel messaggio personalizzato scrivi
"La partita IVA non e' valida: controlla le cifre."

## 3. `EsitoRilevazione ( valore ; limiteMin ; limiteMax )`

Il cuore dell'autocontrollo. Torna `conforme` o `non conforme` confrontando la
misura con i limiti **del punto di controllo**, che arrivano da fuori.

```
Case (
  IsEmpty ( valore ) ; "" ;
  not IsEmpty ( limiteMin ) and valore < limiteMin ; "non conforme" ;
  not IsEmpty ( limiteMax ) and valore > limiteMax ; "non conforme" ;
  "conforme"
)
```

Regge i tre casi che compaiono davvero nei 33 punti di controllo: solo minimo
(cottura: almeno 75), solo massimo (raffreddamento: entro 120 minuti), tutti e
due (frigorifero: fra 0 e 4).

**Dove si usa:** nello script che salva una rilevazione, per scrivere dentro
`Rilevazioni::Esito`. **Mai** come campo calcolato.

## 4. `EsitoAccettazione ( temperatura ; tempMin ; tempMax ; tolleranza )`

L'accettazione merce non e' bianco o nero: c'e' la fascia di tolleranza in cui
la merce si prende ma si usa subito e si segnala al fornitore.

```
Case (
  IsEmpty ( temperatura ) ; "" ;
  temperatura >= tempMin and temperatura <= tempMax ; "accettato" ;
  temperatura > tempMax and temperatura <= tempMax + tolleranza ; "accettato con riserva" ;
  temperatura < tempMin and temperatura >= tempMin - tolleranza ; "accettato con riserva" ;
  "respinto"
)
```

`tempMin` e `tempMax` arrivano da `Prodotti`, `tolleranza` dal parametro
`TolleranzaRicevimentoRefrigerati`.

## 5. `GiorniAllaScadenza ( dataScadenza )`

```
If ( IsEmpty ( dataScadenza ) ; "" ;
  dataScadenza - Get ( CurrentDate )
)
```

Negativo vuol dire scaduto da quei giorni.

## 6. `ScadenzaEffettiva ( dataScadenza ; dataApertura ; giorniDopoApertura )`

Regola HACCP: una confezione aperta ha **due** scadenze, quella stampata e
quella che parte dall'apertura. Vale la piu' vicina delle due.

```
Let ( [
  sa = If (
         IsEmpty ( dataApertura ) or IsEmpty ( giorniDopoApertura ) ;
         "" ;
         dataApertura + giorniDopoApertura
       )
] ;
Case (
  IsEmpty ( sa ) ; dataScadenza ;
  IsEmpty ( dataScadenza ) ; sa ;
  Min ( sa ; dataScadenza )
) )
```

## 7. `SemaforoScadenza ( dataScadenza ; giorniAvviso )`

```
Case (
  IsEmpty ( dataScadenza ) ; "" ;
  dataScadenza < Get ( CurrentDate ) ; "scaduto" ;
  dataScadenza - Get ( CurrentDate ) <= giorniAvviso ; "in scadenza" ;
  "valido"
)
```

---

# Il lettore del codice a barre GS1-128

Questo e' il pezzo che fa la differenza fra un registro compilato davvero e
uno compilato la domenica sera a memoria.

Sui cartoni dei fornitori food c'e' quasi sempre un **GS1-128**: dentro ci sono
il codice prodotto, il **lotto** e la **scadenza**, tutti insieme in una
stringa sola. Si scansiona con FileMaker Go e il programma li tira fuori da
solo, senza che nessuno li digiti.

La stringa e' fatta di coppie *identificatore + dato*:

| Identificatore | Cosa contiene | Lunghezza |
|---|---|---|
| `01` | codice prodotto (GTIN) | fissa, 14 |
| `10` | **lotto** | variabile |
| `17` | **data di scadenza**, formato AAMMGG | fissa, 6 |
| `15` | termine minimo di conservazione | fissa, 6 |
| `11` | data di produzione | fissa, 6 |
| `310n`-`316n` | peso netto | fissa, 6 |

I dati a lunghezza variabile finiscono con un carattere separatore invisibile
(codice 29). Le due funzioni sotto reggono sia le stringhe che ce l'hanno sia
quelle che non ce l'hanno.

## 8. `GS1Scorri ( resto ; ai )`

La funzione ricorsiva che cammina lungo la stringa. Non la chiamerai mai
direttamente.

```
Case (
  Length ( resto ) < 3 ; "" ;
  Let ( [
    pre2 = Left ( resto ; 2 ) ;
    quattro = pre2 = "31" or pre2 = "32" or pre2 = "33"
           or pre2 = "34" or pre2 = "35" or pre2 = "36" ;
    lungAI = If ( quattro ; 4 ; 2 ) ;
    aiCorrente = Left ( resto ; lungAI ) ;
    lungFissa = Case (
      quattro ; 6 ;
      pre2 = "00" ; 18 ;
      pre2 = "01" or pre2 = "02" ; 14 ;
      pre2 = "11" or pre2 = "12" or pre2 = "13"
        or pre2 = "15" or pre2 = "16" or pre2 = "17" ; 6 ;
      pre2 = "20" ; 2 ;
      0
    ) ;
    dopoAI = Middle ( resto ; lungAI + 1 ; Length ( resto ) ) ;
    posSep = Position ( dopoAI ; Char ( 29 ) ; 1 ; 1 ) ;
    lungDato = Case (
      lungFissa > 0 ; lungFissa ;
      posSep > 0 ; posSep - 1 ;
      Length ( dopoAI )
    ) ;
    dato = Left ( dopoAI ; lungDato ) ;
    resto2 = Middle ( dopoAI ; lungDato + 1 ; Length ( dopoAI ) ) ;
    resto3 = If (
      Left ( resto2 ; 1 ) = Char ( 29 ) ;
      Middle ( resto2 ; 2 ; Length ( resto2 ) ) ;
      resto2
    )
  ] ;
    Case (
      aiCorrente = ai ; dato ;
      Length ( resto3 ) < 3 ; "" ;
      GS1Scorri ( resto3 ; ai )
    )
  )
)
```

> **Nota per FileMaker:** la funzione richiama se stessa, quindi va creata
> in due passaggi. Prima creala con dentro solo `""` e salva; poi riaprila e
> incolla il codice vero. Altrimenti l'editor non riconosce il nome mentre lo
> stai scrivendo.

## 9. `GS1Estrai ( pCodice ; ai )`

Quella che userai. Pulisce la stringa e avvia la scansione.

```
GS1Scorri (
  Substitute ( Trim ( pCodice ) ; [ Char ( 13 ) ; "" ] ; [ Char ( 10 ) ; "" ] ) ;
  ai
)
```

## 10. `GS1Lotto ( pCodice )`

```
GS1Estrai ( pCodice ; "10" )
```

## 11. `GS1Gtin ( pCodice )`

```
GS1Estrai ( pCodice ; "01" )
```

## 12. `GS1Scadenza ( pCodice )`

Prende la data di scadenza `17`, e se non c'e' ripiega sul termine minimo di
conservazione `15`. Torna una **data vera**, non un testo.

```
Let ( [
  d  = GS1Estrai ( pCodice ; "17" ) ;
  d2 = If ( IsEmpty ( d ) ; GS1Estrai ( pCodice ; "15" ) ; d )
] ;
Case (
  Length ( d2 ) < 6 ; "" ;
  Let ( [
    aa = 2000 + GetAsNumber ( Left ( d2 ; 2 ) ) ;
    mm = GetAsNumber ( Middle ( d2 ; 3 ; 2 ) ) ;
    gg = GetAsNumber ( Middle ( d2 ; 5 ; 2 ) ) ;
    ggReale = If ( gg = 0 ; Day ( Date ( mm + 1 ; 1 ; aa ) - 1 ) ; gg )
  ] ;
    Date ( mm ; ggReale ; aa )
  )
) )
```

Il giorno `00` nello standard GS1 significa **fine mese**: la riga `ggReale`
lo traduce nell'ultimo giorno vero, che a febbraio non e' il 30.

Attenzione a `Date`: in FileMaker vuole **mese, giorno, anno** in
quest'ordine, non giorno-mese-anno.

### Se un codice non viene letto

E' il motivo per cui in `RigheRicevimento` c'e' il campo
**`CodiceScansionato`**: la stringa grezza ci si salva sempre, cosi' se un
fornitore usa un'etichetta strana si guarda cosa e' arrivato davvero e si
sistema la funzione, invece di indovinare.

---

# I campi nuovi da aggiungere

Tabella **`Lotti`**, tutti e tre **calcolo** con
`Archiviazione` -> **"Non memorizzare i risultati del calcolo"** spuntato.

| Campo | Risultato | Formula |
|---|---|---|
| `ScadenzaEffettiva` | Data | `ScadenzaEffettiva ( DataScadenza ; DataApertura ; LOT::Prodotti::GiorniValiditaDopoApertura )` |
| `GiorniAllaScadenza` | Numero | `GiorniAllaScadenza ( ScadenzaEffettiva )` |
| `Semaforo` | Testo | `SemaforoScadenza ( ScadenzaEffettiva ; Parametri::gGiorniAvviso )` |

Nella prima formula il riferimento al prodotto lo scegli con il selettore dei
campi: e' `GiorniValiditaDopoApertura` nell'occorrenza `LOT|Prodotti`.

---

# Collaudo

Le convenzioni del progetto dicono che ogni regola di calcolo ha un test.
FileMaker non ha i test automatici, quindi li facciamo a mano una volta:

`Strumenti` -> `Visualizzatore dati` -> scheda `Monitoraggio` -> `+`, e incolla
l'espressione. Confronta con il risultato atteso.

| Espressione | Deve dare |
|---|---|
| `PartitaIvaValida ( "12345678903" )` | `1` |
| `PartitaIvaValida ( "12345678901" )` | `0` |
| `PartitaIvaValida ( "" )` | `1` |
| `PartitaIvaValida ( "1234567890" )` | `0` |
| `EsitoRilevazione ( 3 ; 0 ; 4 )` | `conforme` |
| `EsitoRilevazione ( 6 ; 0 ; 4 )` | `non conforme` |
| `EsitoRilevazione ( 80 ; 75 ; "" )` | `conforme` |
| `EsitoRilevazione ( 70 ; 75 ; "" )` | `non conforme` |
| `EsitoRilevazione ( 90 ; "" ; 120 )` | `conforme` |
| `EsitoRilevazione ( "" ; 0 ; 4 )` | vuoto |
| `EsitoAccettazione ( 3 ; 0 ; 4 ; 2 )` | `accettato` |
| `EsitoAccettazione ( 5 ; 0 ; 4 ; 2 )` | `accettato con riserva` |
| `EsitoAccettazione ( 7 ; 0 ; 4 ; 2 )` | `respinto` |
| `SemaforoScadenza ( Get ( CurrentDate ) + 30 ; 7 )` | `valido` |
| `SemaforoScadenza ( Get ( CurrentDate ) + 3 ; 7 )` | `in scadenza` |
| `SemaforoScadenza ( Get ( CurrentDate ) - 1 ; 7 )` | `scaduto` |
| `GS1Lotto ( "010800123456789010LOTTO123" )` | `LOTTO123` |
| `GS1Gtin ( "010800123456789010LOTTO123" )` | `08001234567890` |
| `GS1Estrai ( "01080012345678901725013110LOTTO123" ; "17" )` | `250131` |
| `GS1Scadenza ( "01080012345678901725013110LOTTO123" )` | `31/01/2025` |
| `GS1Scadenza ( "0108001234567890" & "17250100" )` | `31/01/2025` |
| `GS1Lotto ( "0108001234567890" & "10LOTTO 9" & Char ( 29 ) & "17250131" )` | `LOTTO 9` |

Le ultime due sono i casi scomodi: il giorno `00` che significa fine mese, e il
lotto a lunghezza variabile chiuso dal separatore invisibile.

Se una riga non torna, fermati e scrivimi quale: e' molto meglio scoprirlo qui
che dentro una maschera.

---

## Cosa viene dopo

`12-SCRIPT.md`: lo script di avvio che carica i parametri, quello che registra
una rilevazione aprendo da sola la non conformita' quando la misura e' fuori
limite, e quello che scansiona il cartone in accettazione merce.
