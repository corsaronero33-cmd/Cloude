# Collaudo 016 — Revisione 15, lo script `20` non e' simmetrico

Scheda di correzione:
<https://claude.ai/artifact/6z2L966mmMiMQz4Vqi1pwG>

Osservazione di partenza, textuale: *"non mi piace il comportamento dello
script 20 non si comporta allo stesso modo se conforme o non conforme, se nei
limiti o non"*.

**L'osservazione e' giusta, e la causa principale non e' nello script.**

---

## 1. La causa vera: i due campi del valore sono sovrapposti e sempre visibili

Sul formato `D_Rilevazioni registra`:

| Campo | X | Y | Largh. | Visibile | Nascondi oggetto quando |
|---|---|---|---|---|---|
| `RIL\|Rilevazioni::gValore` | 184 | 297 | 300 | si' | **nessuna** |
| `RIL\|Rilevazioni::gValoreTesto` | 184 | 297 | 300 | si' | **nessuna** |

La fase 4 della scheda 18 le prevedeva entrambe. Non sono mai state inserite.

Conseguenza a catena, tutta verificabile sul DDR:

1. `gValoreTesto` e' l'ultimo oggetto dell'elenco, quindi sta **davanti** e
   copre l'altro. Su un punto a temperatura il numero **non si puo' digitare**:
   si apre il menu `vl_EsitoRilevazione` (`conforme` / `non conforme`).
2. Il controllo del passo 19 (`IsEmpty ( gValore ) and IsEmpty ( gValoreTesto )`)
   passa, perche' `gValoreTesto` e' pieno.
3. `Valore` nasce vuoto. Il punto non e' `visivo`, quindi il passo 38 chiama
   `EsitoRilevazione ( "" ; min ; max )`, che per il primo ramo del `Case`
   restituisce `""`.
4. `$esito` e' vuoto → `Esito` nel record e' **vuoto** → il test
   `$esito = "non conforme"` e' sempre falso → **ramo "conforme" sempre**.

**Su tutti i punti a temperatura il limite non viene mai valutato, e il
registro conserva record con l'esito vuoto.** In un registro HACCP e' il
difetto piu' grave dei sei.

Le due formule, da inserire su Ispettore > Dati > Comportamento:

```
gValore        nascondi quando:  RIL|PuntoScelto::Grandezza = "visivo"
gValoreTesto   nascondi quando:  RIL|PuntoScelto::Grandezza <> "visivo"
```

In piu', per chiudere il buco anche se un domani quelle formule vengono
toccate, il controllo del passo 19 diventa:

```
If ( RIL|PuntoScelto::Grandezza = "visivo" ;
     IsEmpty ( RIL|Rilevazioni::gValoreTesto ) ;
     IsEmpty ( RIL|Rilevazioni::gValore ) )
```

## 2. Il messaggio del ramo conforme esce senza il nome del punto

Passo 86 (riga 87): il messaggio e'

```
"Rilevazione registrata:  " & RIL|PuntoScelto::Descrizione & "— conforme."
```

Il passo 80 (riga 81), tre righe sopra, ha svuotato `gIdPuntoControllo`. La
relazione e' `RIL|Rilevazioni::gIdPuntoControllo = RIL|PuntoScelto::Id`
(predicato verificato nel DDR): svuotata la chiave, `RIL|PuntoScelto` non ha
piu' record e `Descrizione` e' vuota.

Il ramo "non conforme" usa `$descrizione`, catturata al passo 48 **prima**
dello svuotamento, e quindi esce piena. **Questa e' l'asimmetria visibile.**

Nello stesso calcolo: due spazi dopo i due punti, e nessuno spazio prima del
trattino. Diventa:

```
"Rilevazione registrata: " & $nome & " - conforme."
```

con `$nome` preso da `RIL|PuntiControllo::Descrizione` — relazione che parte
da `IdPuntoControllo`, campo del record, **non** dal globale. Cosi' il nome
resta raggiungibile a prescindere dall'ordine dei passi. La scheda 18 diceva
`RIL|PuntoScelto::Descrizione`, che e' fragile: corretta.

## 3. Lavoro duplicato nei due rami

| Che cosa | Dove |
|---|---|
| I quattro `Imposta campo [ g… ; "" ]` | righe 73-76 **e** righe 81-84 |
| `Vai al formato [ Formato originale ]` | riga 44 **e** riga 86 |

La fase 2a della scheda 18 diceva di spostare `Vai al formato` **insieme ai
quattro `Imposta campo`**. E' stato spostato solo il primo, e i quattro sono
stati ricopiati nel secondo ramo.

Il difetto n. 2 e' nato esattamente da qui: due copie della stessa chiusura,
e la correzione di una non arriva all'altra. Vanno scritti **una volta sola,
dopo il `Fine se`**.

## 4. La finestra `nc` e' una finestra Documento con la barra dei menu

Passo 54 (riga 55), letto dal DDR:

```
Stile: Document
Bounds: height/width/top/left tutti vuoti
MenuBar: True   Toolbar: True   DimParentWindow: False
Formato: NonConformita (occorrenza NonConformita)
```

Lampeggia a schermo, e solo nel ramo "non conforme". Soprattutto: alla
consegna i menu saranno nascosti a tutti gli account, e **questa finestra
comparirebbe con la sua barra dei menu**.

Non serve una finestra nuova. Nella stessa finestra:

```
Vai al formato [ NonConformita ]     (al posto di Nuova finestra)
...
Vai al formato [ Z_RIL Rilevazioni ] (al posto di Chiudi finestra)
```

Il ritorno su un formato di `RIL|Rilevazioni` e' **necessario**, non estetico:
`Imposta campo [ RIL|Rilevazioni::IdNonConformita ]` scrive sul record
dell'occorrenza del formato, e dal formato `NonConformita` quel campo non si
raggiunge. Prima funzionava perche' `Chiudi finestra` riportava sulla finestra
madre, che era gia' su `D_Rilevazioni registra`.

Con `Blocca finestra` (passo 53, da spostare in cima) i cambi di formato nella
stessa finestra non si vedono: lo schermo resta fermo fino al messaggio.

## 5. Manca `Conferma record/richieste` come primo passo

Righe 11 e 12: `Consenti interruzione utente`, `Imposta acquisizione errori`.
Nessun commit. La fase 2 della scheda 18 lo chiedeva ("una riga che va messa
comunque"). Se il cursore e' ancora dentro `gValore` o `gNote` quando si preme
REGISTRA, lo script legge il campo com'era prima.

## 6. Due riferimenti con la grafia diversa

Righe 15 e 20: `Rilevazioni::g…` (occorrenza nuda) invece di
`RIL|Rilevazioni::g…`. Funziona — un globale vale lo stesso da qualunque
occorrenza — ma sono gli unici due punti dello script con grafia diversa.

---

## Due cose controllate e giuste

**`EsitoRilevazione`** restituisce esattamente `""`, `"conforme"`,
`"non conforme"`: il test del ramo e' sano, se il valore arriva.

**Il set `Operatore`** ha accesso personalizzato per tabella, e su
`Rilevazioni` e su `NonConformita` ha `View`, `Edit` e `Create`. Il ramo della
non conformita' non si blocca per i permessi — che con
`Imposta acquisizione errori [ Attivato ]` sarebbe stato un guasto muto.

| Tabella | Vedi | Modifica | Crea | Elimina |
|---|---|---|---|---|
| `Rilevazioni` | si' | si' | **si'** | no |
| `NonConformita` | si' | si' | **si'** | no |
| `PuntiControllo` | si' | no | no | no |

---

## La struttura corretta

Il principio, che e' quello che mancava: **i due rami non devono fare la
stessa cosa — uno deve aprire una non conformita' — ma tutto quello che e'
comune va scritto una volta, e l'unica differenza in fondo deve essere
quello che si dice.**

```
testa          Consenti interruzione / Acquisizione errori / Conferma record
controlli      due Se, con la verifica giusta per il tipo di punto
Blocca finestra
salvataggio    Z_RIL, Nuovo record, 6 Imposta campo, esito, Bloccato
testi          $nome  $descrizione  $azione  $gravita     <- presi qui, una volta
Se non conforme ... apri la non conformita' ... Fine se   <- il lavoro in piu'
chiusura       Formato originale, 4 svuotamenti, Conferma  <- comune
Se non conforme ... messaggio ... Altrimenti ... messaggio <- la sola differenza
Vai al campo   gIdPuntoControllo
```

Prima: due rami da 32 e 8 passi con sei passi ripetuti a testa.
Dopo: un ramo da 14 passi che **fa** una cosa in piu', due passi che
**dicono** cose diverse, tutto il resto comune.

## Resta aperto dai collaudi precedenti

Da verificare sul prossimo DDR, assieme a questa correzione:

- le sei etichette di colonna segnalate al collaudo 014;
- lo stile del tema (`Titolo Riquadro` / `Titolo maschera`) — si puo' lasciare,
  e' un nome interno;
- i quattro disallineamenti verticali da 2 punti.
