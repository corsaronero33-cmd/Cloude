# Collaudo 016 — Revisione 15, lo script `20` non e' simmetrico

Scheda di correzione:
<https://claude.ai/artifact/6z2L966mmMiMQz4Vqi1pwG>

Osservazione di partenza, textuale: *"non mi piace il comportamento dello
script 20 non si comporta allo stesso modo se conforme o non conforme, se nei
limiti o non"*.

**L'osservazione e' giusta.** Cinque difetti confermati, tutti nello script.

> **Correzione, dopo la Revisione 16.** La prima stesura di questo collaudo
> apriva con un sesto rilievo, dato come il piu' grave: le due formule
> *Nascondi oggetto quando* mancanti sulla maschera. **Era un errore di
> lettura mio**, non un difetto del file. Vedi il paragrafo 1.

---

## 1. RITIRATO — era un errore di lettura mio

> Quello che segue era, nella prima stesura di questo collaudo, il rilievo
> piu' grave dei sei. **Era un falso allarme**, trovato e corretto con la
> Revisione 16. Resta scritto qui, e non cancellato, perche' e' l'errore che
> ha prodotto la regola *"Mai dire manca senza una prova in positivo"* in
> `CLAUDE.md`.

**Che cosa avevo scritto.** Che su `D_Rilevazioni registra` i due campi
`gValore` e `gValoreTesto`, sovrapposti alla stessa posizione, erano entrambi
visibili perche' **nessuno dei due aveva la formula *Nascondi oggetto
quando***; e che da qui seguiva, a catena, che su un punto a temperatura il
numero non si poteva digitare, `Valore` nasceva vuoto,
`EsitoRilevazione ( "" ; min ; max )` restituiva `""`, e il registro
conservava record con l'esito vuoto mentre lo script diceva "conforme".

**Perche' era falso.** Il mio lettore del DDR cercava un elemento
`<HideCondition>`, che non esiste. La formula sta in

```
<LayoutObject> <Conditions> <Hide findMode="False"> <Calculation> <Text>
```

Letto con il nome giusto, **le due formule c'erano gia' nella Revisione 15**,
scritte esattamente come la scheda 18 le prescriveva:

| Campo | Nascondi oggetto quando |
|---|---|
| `RIL\|Rilevazioni::gValore` | `RIL\|PuntoScelto::Grandezza = "visivo"` |
| `RIL\|Rilevazioni::gValoreTesto` | `RIL\|PuntoScelto::Grandezza <> "visivo"` |

Quindi la temperatura si digitava, `Esito` si riempiva, e il ramo "non
conforme" scattava. **Il difetto grave non c'e' mai stato.**

**Che cosa avrebbe dovuto smentirmi subito.** Un controllo in positivo su
`D_Parametri elenco`, dove due campi sovrapposti con formule opposte erano
gia' montati e collaudati: lo stesso lettore riportava zero formule anche la',
dove invece funzionano. L'assenza era nel lettore, non nel file.

**Che cosa resta valido.** Il controllo del valore riscritto come

```
If ( RIL|PuntoScelto::Grandezza = "visivo" ;
     IsEmpty ( RIL|Rilevazioni::gValoreTesto ) ;
     IsEmpty ( RIL|Rilevazioni::gValore ) )
```

e' un miglioramento a prescindere: chiede il dato giusto per il tipo di punto
invece di accontentarsi di "o l'uno o l'altro", ed e' stato applicato. I
cinque rilievi che seguono sono tutti confermati.

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

## 5. Manca `Salva record/richieste` come primo passo

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
testa          Consenti interruzione / Acquisizione errori / Salva record
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
