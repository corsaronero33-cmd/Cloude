# Passo 4 — Gli script

Prerequisito: le dodici funzioni create e collaudate (`11-CALCOLI.md`).

Con le formule il file sa **capire**. Con gli script comincia a **fare**: si
ricorda chi sei, apre da solo una non conformita' quando una misura e' fuori
limite, e legge lotto e scadenza dal cartone.

> **I passi script non si incollano.** FileMaker non accetta testo incollato
> nell'elenco dei passi: ogni passo va scelto dalla lista a sinistra, che ha
> una casella di ricerca in alto. I listati qui sotto servono a leggere e a
> capire, non a copiare.
>
> **Le finestre dei calcoli invece il copia-incolla lo accettano**, ed e' li'
> che stanno le formule lunghe. La tabella di marcia pubblicata come pagina
> web presenta gli stessi script riga per riga, con il nome del passo da
> cercare e i valori da incollare.
>
> **Da quale occorrenza vengono i campi.** Un riferimento come
> `Parametri::Chiave` si legge **dall'occorrenza su cui e' basato il formato in
> cui lo script si trova in quel momento**. Per questo ogni `Vai al formato`
> dichiara l'occorrenza: da li' in poi tutti i campi vengono da quella.
> Sbagliare occorrenza **non da' errore**, restituisce il vuoto.
>
> Unica eccezione: i **campi globali** (quelli con la `g` davanti) hanno un
> solo valore per tutto il file e si leggono uguali da qualunque occorrenza.
> `Parametri::gGiorniAvviso` e' uno di questi.
>
> **Commenti.** Ogni script comincia con un blocco di commenti che dice cosa
> fa, da chi viene chiamato e cosa legge, e ne ha uno prima di ogni fase. Il
> passo si chiama `Commento` ed e' una riga di testo senza opzioni. Vanno
> scritti: sono il motivo per cui fra sei mesi si riapre lo script e si capisce
> subito dove mettere le mani.
>
> **Quanti pulsanti su una finestra di dialogo.** Due servono **solo** se lo
> script poi guarda quale e' stato premuto, cioe' se c'e' un
> `Get ( UltimaSceltaMessaggio )` dopo. In tutto il progetto capita **una volta
> sola**: la finestra che chiede il codice a mano nello script `10`. Tutte le
> altre hanno un pulsante: si lasciano **Pulsante 2 e 3 vuoti**.
>
> **Nomi dei passi.** L'interfaccia e' in italiano: `Imposta variabile`,
> `Imposta campo`, `Vai al formato`, `Se`, `Fine se`, `Ciclo`. In FileMaker
> italiano **layout si dice formato**. Se un nome non corrisponde
> esattamente, cercalo nella casella: la traduzione puo' variare di una
> parola.

---

## Prima: quattro campi globali e una funzione

### I campi di immissione

Una registrazione non si scrive direttamente nel record: prima si raccoglie in
**campi globali**, e solo quando e' completa si crea il record vero.

Serve a una cosa concreta: se l'operatore comincia a compilare e poi si
distrae, non resta in archivio un registro mezzo scritto. In un registro
sanitario le righe incomplete sono peggio delle righe mancanti.

Tabella `Rilevazioni`, quattro campi nuovi, tutti con
`Opzioni` -> `Archiviazione` -> **Utilizza archiviazione globale**:

| Campo | Tipo |
|---|---|
| `gIdPuntoControllo` | Testo |
| `gValore` | Numero |
| `gValoreTesto` | Testo |
| `gNote` | Testo |

### La tredicesima funzione

I parametri stanno in una tabella, ma gli script devono poterli leggere
ovunque senza relazioni. Lo script di avvio li carica tutti in una variabile
globale, e questa funzione ne pesca uno.

| Casella nella finestra | Cosa scriverci |
|---|---|
| Nome funzione | `Parametro` |
| Parametri funzione | `pChiave` |

Si usa cosi': `Parametro ( "GiorniAvvisoScadenza" )`.

```
Let ( [
  righe = $$PARAMETRI ;
  pos = Position ( "¶" & righe ; "¶" & pChiave & "=" ; 1 ; 1 )
] ;
Case (
  pos = 0 ; "" ;
  Let ( [
    resto = Middle ( righe ; pos + Length ( pChiave ) + 1 ; Length ( righe ) ) ;
    fine = Position ( resto ; "¶" ; 1 ; 1 )
  ] ;
    If ( fine = 0 ; resto ; Left ( resto ; fine - 1 ) )
  )
) )
```

Il carattere `¶` si scrive con **AltGr + 7** oppure si prende dalla lista degli
operatori a destra nella finestra del calcolo.

---

# Script 1 — `01 - Utilita - Carica parametri`

Legge tutta la tabella `Parametri` e la mette in una variabile globale.

```
# === 01 - UTILITA - CARICA PARAMETRI ===
# Legge tutta la tabella Parametri e la mette in una sola variabile globale,
# una riga per parametro nella forma chiave=valore.
# Da li' in poi qualsiasi script legge un parametro con Parametro ( "chiave" ).
# Chiamato da: 00 - Avvio.

# --- vai sui parametri e prendili tutti ---
Vai al formato [ "Parametri" (Parametri) ]
Mostra tutti i record
Imposta variabile [ $$PARAMETRI ; Valore: "" ]
Vai a record/richiesta/pagina [ Primo ]

# --- un giro per ogni parametro: accoda chiave=valore e va a capo ---
Ciclo
    Imposta variabile [ $$PARAMETRI ; Valore:
        $$PARAMETRI & Parametri::Chiave & "=" & Parametri::Valore & "¶" ]
    Vai a record/richiesta/pagina [ Successivo ; Esci dopo l'ultimo: Attivato ]
Fine ciclo

# --- il semaforo delle scadenze legge da un campo globale, non dalla variabile ---
Imposta campo [ Parametri::gGiorniAvviso ;
    GetAsNumber ( Parametro ( "GiorniAvvisoScadenza" ) ) ]
```

Un ciclo esplicito, una riga per volta. Si mette in debug e si vede cosa
succede: e' il motivo per cui non si usa niente di piu' furbo.

`Parametri::Chiave` e `Parametri::Valore` vengono dall'occorrenza **`Parametri`
senza sigla**, che e' quella su cui e' basato il formato `Parametri` dove lo
script si trova. `gGiorniAvviso` invece e' globale: da qualunque occorrenza lo
si guardi, e' lo stesso valore.

---

# Script 2 — `02 - Utilita - Riconosci operatore`

Collega l'account con cui sei entrato al record dell'operatore, una volta
sola all'avvio. Da li' in poi ogni registrazione sa chi l'ha fatta senza
chiederlo.

```
Imposta variabile [ $conto ; Valore: Get ( AccountName ) ]
Vai al formato [ "Operatori" (Operatori) ]
Attiva modo Trova
Imposta campo [ Operatori::AccountFileMaker ; $conto ]
Esegui trova [ ]
Se [ Get ( UltimoErrore ) = 0 and Get ( ConteggioRecordTrovati ) = 1 ]
    Imposta variabile [ $$UTENTE.Id ; Valore: Operatori::Id ]
    Imposta variabile [ $$UTENTE.Nome ; Valore: Operatori::NomeCompleto ]
Altrimenti
    Imposta variabile [ $$UTENTE.Id ; Valore: "" ]
    Imposta variabile [ $$UTENTE.Nome ; Valore: $conto ]
Fine se
```

Se l'account non e' agganciato a nessun operatore il programma continua a
funzionare, ma le registrazioni resteranno senza nome: e' il caso da
sistemare in anagrafica, non da bloccare a video.

---

# Script 3 — `00 - Avvio`

```
Consenti annullamento utente [ Disattivato ]
Imposta acquisizione errori [ Attivato ]
Esegui script [ "01 - Utilita - Carica parametri" ]
Esegui script [ "02 - Utilita - Riconosci operatore" ]
Vai al formato [ "Rilevazioni" (Rilevazioni) ]
```

L'ultima riga cambiera' quando ci saranno le maschere vere: mandera' a quella
giusta per il dispositivo. Per adesso serve solo a non lasciare l'utente sul
formato dei parametri.

### Farlo partire da solo

`File` -> `Opzioni file` -> scheda `Apri` -> spunta
**Esegui script** e scegli `00 - Avvio`.

---

# Script 4 — `20 - Rilevazioni - Registra`

**E' il pezzo che trasforma un registro in un sistema di autocontrollo.**

### Prima serve un formato tecnico

Questo script legge `RIL|PuntiControllo::LimiteMin`, e quei limiti si vedono
**solo dall'ancora `RIL|Rilevazioni`**. I formati esistenti sono tutti quelli
nudi nati dall'importazione, e dal formato `Rilevazioni` nudo non c'e' nessuna
relazione verso i punti di controllo: i limiti tornerebbero vuoti e l'esito
sarebbe sempre "conforme".

1. `Visualizza` -> `Modifica formato`
2. `Formati` -> `Nuovo formato/rapporto`
3. **Mostra record da: `RIL|Rilevazioni`** (non l'occorrenza senza sigla)
4. Nome: **`Z_RIL Rilevazioni`**, tipo Modulo
5. `Formati` -> `Imposta formato`, togli *Includi nel menu dei formati*

Il prefisso **`Z_`** marca i formati **tecnici**: servono agli script, non li
vede nessun operatore, e finiscono in fondo all'elenco. Quando arriveranno le
maschere vere non si confonderanno con quelle.

E' l'unico formato tecnico che serve: gli altri quattro script leggono
soltanto campi della propria tabella, quindi i formati nudi bastano.

Registra la misura, calcola l'esito con i limiti del punto di controllo, e se
la misura e' fuori limite **apre da sola la non conformita'** portandosi
dentro l'azione correttiva gia' scritta nel punto di controllo.

```
Consenti annullamento utente [ Disattivato ]
Imposta acquisizione errori [ Attivato ]

# --- controlli prima di scrivere qualsiasi cosa ---
Se [ IsEmpty ( RIL|Rilevazioni::gIdPuntoControllo ) ]
    Mostra finestra di dialogo personalizzata [
        "Manca un dato" ; "Scegli il punto di controllo." ; Pulsante 1: "OK" ]
    Esci dallo script [ Risultato del testo: "" ]
Fine se

Se [ IsEmpty ( RIL|Rilevazioni::gValore ) and IsEmpty ( RIL|Rilevazioni::gValoreTesto ) ]
    Mostra finestra di dialogo personalizzata [
        "Manca un dato" ; "Scrivi il valore rilevato." ; Pulsante 1: "OK" ]
    Esci dallo script [ Risultato del testo: "" ]
Fine se

# --- crea la rilevazione ---
Vai al formato [ "Z_RIL Rilevazioni" (RIL|Rilevazioni) ]
Nuovo record/richiesta
Imposta campo [ RIL|Rilevazioni::IdPuntoControllo ; RIL|Rilevazioni::gIdPuntoControllo ]
Imposta campo [ RIL|Rilevazioni::DataOra ; Get ( IndicatoreDataOraCorrente ) ]
Imposta campo [ RIL|Rilevazioni::IdOperatore ; $$UTENTE.Id ]
Imposta campo [ RIL|Rilevazioni::Valore ; RIL|Rilevazioni::gValore ]
Imposta campo [ RIL|Rilevazioni::ValoreTesto ; RIL|Rilevazioni::gValoreTesto ]
Imposta campo [ RIL|Rilevazioni::Note ; RIL|Rilevazioni::gNote ]
Conferma record/richieste [ Con dialogo: Disattivato ]

# --- l'esito, letto dai limiti del punto di controllo ---
Imposta variabile [ $esito ; Valore:
    If ( RIL|PuntiControllo::Grandezza = "visivo" ;
         RIL|Rilevazioni::ValoreTesto ;
         EsitoRilevazione (
             RIL|Rilevazioni::Valore ;
             RIL|PuntiControllo::LimiteMin ;
             RIL|PuntiControllo::LimiteMax ) ) ]
Imposta campo [ RIL|Rilevazioni::Esito ; $esito ]
Imposta campo [ RIL|Rilevazioni::Bloccato ; "Si" ]
Conferma record/richieste [ Con dialogo: Disattivato ]
Imposta variabile [ $idRilevazione ; Valore: RIL|Rilevazioni::Id ]

# --- se e' fuori limite, apri la non conformita' ---
Se [ $esito = "non conforme" ]
    Imposta variabile [ $descrizione ; Valore:
        "Fuori limite: " & RIL|PuntiControllo::Descrizione &
        ". Valore rilevato " & RIL|Rilevazioni::Valore & " " &
        RIL|PuntiControllo::UnitaMisura &
        ", limiti ammessi da " & RIL|PuntiControllo::LimiteMin &
        " a " & RIL|PuntiControllo::LimiteMax & "." ]
    Imposta variabile [ $azione ; Valore: RIL|PuntiControllo::AzioneCorrettiva ]
    Imposta variabile [ $gravita ; Valore:
        If ( RIL|PuntiControllo::Tipo = "CCP" ; "alta" ; "media" ) ]

    Nuova finestra [ Stile: Documento ; Nome: "nc" ]
    Vai al formato [ "NonConformita" (NonConformita) ]
    Nuovo record/richiesta
    Imposta campo [ NonConformita::Data ; Get ( DataCorrente ) ]
    Imposta campo [ NonConformita::Origine ; "rilevazione" ]
    Imposta campo [ NonConformita::IdRilevazione ; $idRilevazione ]
    Imposta campo [ NonConformita::Descrizione ; $descrizione ]
    Imposta campo [ NonConformita::AzioneCorrettiva ; $azione ]
    Imposta campo [ NonConformita::Gravita ; $gravita ]
    Imposta campo [ NonConformita::IdOperatoreRilevatore ; $$UTENTE.Id ]
    Conferma record/richieste [ Con dialogo: Disattivato ]
    Imposta variabile [ $idNC ; Valore: NonConformita::Id ]
    Chiudi finestra [ Finestra corrente ]

    Imposta campo [ RIL|Rilevazioni::IdNonConformita ; $idNC ]
    Conferma record/richieste [ Con dialogo: Disattivato ]

    Mostra finestra di dialogo personalizzata [
        "Valore fuori limite" ;
        $descrizione & "¶¶Azione correttiva da eseguire:¶" & $azione ;
        Pulsante 1: "Ho capito" ]
Fine se

# --- svuota i campi di immissione ---
Imposta campo [ RIL|Rilevazioni::gIdPuntoControllo ; "" ]
Imposta campo [ RIL|Rilevazioni::gValore ; "" ]
Imposta campo [ RIL|Rilevazioni::gValoreTesto ; "" ]
Imposta campo [ RIL|Rilevazioni::gNote ; "" ]
```

### Due punti che sembrano dettagli e non lo sono

**Ogni campo delle rilevazioni si scrive `RIL|Rilevazioni::`, mai
`Rilevazioni::`.** Sono **due occorrenze diverse** della stessa tabella: dal
formato `Z_RIL Rilevazioni` l'occorrenza nuda non e' correlata, quindi
restituisce il vuoto. Come sempre in questi casi, senza nessun messaggio di
errore. Prendendo i campi con il selettore a sinistra, con *Tabella corrente*
selezionata in alto, FileMaker ci mette da solo l'occorrenza giusta.

I campi **globali** (quelli con la `g` davanti) sarebbero l'eccezione, perche'
hanno un solo valore per tutto il file: si scrivono comunque `RIL|` per non
doversi chiedere ogni volta quali lo siano.

**Il `Conferma record/richieste` dopo aver scritto `IdPuntoControllo`.**
Finche' il record non e' confermato la relazione non si aggancia, e
`RIL|PuntiControllo::LimiteMin` risulta vuoto: l'esito verrebbe sempre
"conforme". E' l'errore piu' insidioso di tutto il progetto, perche' il
programma non da' nessun messaggio, dice solo che va tutto bene.

**Il pulsante scritto "Ho capito" e non "OK".**
Quella finestra non informa: consegna all'operatore un'azione correttiva da
eseguire. Il testo del pulsante e' l'unica cosa che gli fa registrare di aver
preso un impegno invece di aver chiuso un avviso. Costa niente e cambia come
viene usato il programma.

**La finestra nuova per creare la non conformita'.**
Serve a non perdere il record su cui stai lavorando: si apre, si crea la non
conformita', si chiude, e ti ritrovi esattamente dov'eri.

---

# Script 5 — `10 - Ricevimento - Leggi etichetta`

Da eseguire con il cursore su una riga di ricevimento.

> **Qui i campi si scrivono `RigheRicevimento::`, senza sigla, ed e' voluto.**
> E' l'unico dei cinque script che **non naviga**: lavora sulla riga che hai
> gia' davanti, e se facesse `Vai al formato` perderebbe proprio il record su
> cui deve scrivere. Di conseguenza i suoi riferimenti si risolvono
> sull'occorrenza del formato **da cui lo lanci**, che oggi e' quello nudo.
>
> Mettere `RIC|RigheRicevimento::` stando sul formato nudo darebbe il vuoto:
> e' l'errore opposto a quello dello script 20. Quando ci sara' la maschera del
> ricevimento questi riferimenti andranno riscritti col prefisso `RIC|`
> (debito n. 3 in `DEBITI.md`).

```
Consenti annullamento utente [ Disattivato ]
Imposta acquisizione errori [ Attivato ]

Se [ Get ( PiattaformaSistema ) = 3 ]
    Inserisci da dispositivo [ RigheRicevimento::CodiceScansionato ;
        Tipo: Codice a barre ; Fotocamera: Posteriore ]
Altrimenti
    Mostra finestra di dialogo personalizzata [
        # scheda "Finestra di dialogo generale"
        Titolo: "Codice etichetta" ;
        Messaggio: "Sul telefono si legge con la fotocamera. Qui incollalo a mano." ;
        Pulsante predefinito: "OK" ; Pulsante 2: "Annulla" ;
        # scheda "Campi di immissione"
        Mostra campo di immissione 1 -> RigheRicevimento::CodiceScansionato ,
        etichetta "Codice" ]
    Se [ Get ( UltimaSceltaMessaggio ) = 2 ]
        Esci dallo script [ Risultato del testo: "" ]
    Fine se
Fine se

Se [ IsEmpty ( RigheRicevimento::CodiceScansionato ) ]
    Esci dallo script [ Risultato del testo: "" ]
Fine se

Imposta variabile [ $lotto ; Valore: GS1Lotto ( RigheRicevimento::CodiceScansionato ) ]
Imposta variabile [ $scadenza ; Valore: GS1Scadenza ( RigheRicevimento::CodiceScansionato ) ]

Se [ not IsEmpty ( $lotto ) ]
    Imposta campo [ RigheRicevimento::Lotto ; $lotto ]
Fine se

Se [ not IsEmpty ( $scadenza ) ]
    Imposta campo [ RigheRicevimento::DataScadenza ; $scadenza ]
    Imposta campo [ RigheRicevimento::TipoScadenza ; "scadenza" ]
Fine se

Conferma record/richieste [ Con dialogo: Disattivato ]

Se [ IsEmpty ( $lotto ) and IsEmpty ( $scadenza ) ]
    Mostra finestra di dialogo personalizzata [
        Pulsante 1: "OK" ;
        "Etichetta non riconosciuta" ;
        "Il codice e' stato salvato ma non contiene lotto ne' scadenza in "
        & "formato GS1. Scrivili a mano e segnalamelo: potrebbe essere "
        & "un'etichetta particolare di quel fornitore." ]
Fine se
```

**Quando scatta l'avviso.** Solo se non si e' capito **niente**: la condizione
usa `and`, non `or`. Se l'etichetta porta il lotto ma non la scadenza, lo
script riempie il lotto e tace.

Non e' pigrizia: moltissime etichette dei fornitori portano solo il lotto, e un
avviso che scatta ad ogni consegna nel giro di due settimane viene chiuso senza
leggerlo. **Un avviso che scatta sempre e' un avviso spento.**

Il controllo di completezza va fatto dove ha senso, cioe' al **salvataggio
della riga di ricevimento**: li' il programma sa, da `Prodotti::RichiedeLotto`
e `Prodotti::RichiedeScadenza`, se *quel* prodotto li esige davvero, e puo'
bloccare solo chi deve essere bloccato. Vedi `DEBITI.md`.

**Limite dichiarato:** per adesso lo script compila lotto e scadenza, non il
prodotto. Agganciare il prodotto dal codice GTIN richiede una relazione in
piu' nel grafico: si fa nella sessione delle maschere, quando sappiamo come
si presenta il ricevimento a video.

> **Le opzioni di `Mostra finestra di dialogo personalizzata` stanno su due
> schede.** Titolo, messaggio e pulsanti sulla prima; il campo di immissione
> sulla seconda, dove va spuntato *Mostra campo di immissione 1* e poi premuto
> *Specifica* per scegliere il campo.
>
> Il **Pulsante 2** non e' facoltativo: e' quello che il passo successivo
> riconosce come Annulla con `Get ( UltimaSceltaMessaggio ) = 2`. Senza, quel
> controllo non scatta mai e l'operatore non puo' rinunciare alla scansione.

**Sul PC il passo della fotocamera non funziona**, ed e' giusto cosi':
`Inserisci da dispositivo` esiste solo su FileMaker Go. Per questo lo script
chiede il codice a mano quando non e' su iPhone o iPad, cosi' lo puoi provare
adesso.

---

# Collaudo

## Due cose da saper fare

**Eseguire uno script.** Menu `Script`: se compare nell'elenco, si clicca.
Altrimenti `Script` -> `Area di lavoro script` (Ctrl+Maiusc+S), si seleziona a
sinistra e si preme il triangolo **Esegui**.

**Guardare un valore.** `Strumenti` -> `Visualizzatore dati`, scheda
**Controlla**, pulsante `+`. Nella casella **Espressione** si scrive cosa si
vuole vedere e si preme **Monitora**. Il valore compare accanto e si aggiorna
da solo, quindi la finestra si puo' lasciare aperta mentre si lavora.

Nella casella si possono scrivere tre cose diverse:

| Cosa | Esempio |
|---|---|
| una **variabile** | `$$PARAMETRI` |
| un **campo** | `Parametri::gGiorniAvviso` |
| la **chiamata a una funzione** | `Parametro ( "GiorniAvvisoScadenza" )` |

Nell'ultimo caso FileMaker esegue davvero la funzione e mostra cosa risponde.
E' cosi' che si prova una funzione senza costruirle intorno una maschera.

## Preparazione: un punto di controllo su cui provare

`PuntiControllo` e' **vuota**: i 33 punti stanno in `ModelliPuntoControllo`,
che e' la libreria del prodotto, e ci finiranno con lo script di impianto.
Per collaudare adesso ne serve uno vero.

Formato `PuntiControllo`, nuovo record:

| Campo | Valore |
|---|---|
| `Codice` | `CON-01` |
| `Descrizione` | `Temperatura frigorifero 1` |
| `Tipo` | `CCP` |
| `Fase` | `conservazione` |
| `Grandezza` | `temperatura` |
| `UnitaMisura` | `C` |
| `LimiteMin` | `0` |
| `LimiteMax` | `4` |
| `Frequenza` | `due volte al giorno` |
| `AzioneCorrettiva` | `Trasferire la merce in un altro frigorifero, verificare guarnizioni e carico, chiamare il manutentore.` |
| `Attivo` | `Si` |

Sono gli stessi valori della riga `CON-01` dei punti modello: cosi' la sesta
prova mostra l'azione correttiva vera.

## Le nove prove

L'elenco completo, con i passi da fare e cosa guardare se qualcosa non torna,
sta nella tabella di marcia pubblicata come pagina. In sintesi:

| # | Prova | Deve dare |
|---|---|---|
| 1 | esegui `01`, guarda `$$PARAMETRI` | 20 righe `chiave=valore` |
| 2 | `Parametro ( "GiorniAvvisoScadenza" )` | `7` |
| 3 | `Parametri::gGiorniAvviso` | `7` |
| 4 | crea un operatore con il tuo account, esegui `02`, guarda `$$UTENTE.Nome` | il tuo nome |
| 5 | `gValore` = 3 sul frigo, esegui `20` | esito conforme, nessuna finestra |
| 6 | `gValore` = 9, esegui `20` | **finestra con l'azione correttiva, esito non conforme** |
| 7 | guarda l'ultima non conformita' | nata da sola, con dentro l'azione correttiva e gravita' alta |
| 8 | esegui `10`, incolla `010800123456789010LOTTO123` | `Lotto` = `LOTTO123`, **nessun avviso** (manca la scadenza ma il lotto c'e') |
| 9 | incolla `01080012345678901725013110LOTTO123` | lotto e scadenza 31/01/2025 |

La prova che conta e' la **sesta**. Se una misura fuori limite genera da sola
la non conformita' con l'azione correttiva gia' dentro, il cuore del sistema
c'e'.

Se la sesta dice "conforme" con valore 9, il colpevole e' quasi sempre il
`Conferma record/richieste` prima della lettura dei limiti.

## Cosa viene dopo

`13-LAYOUT.md`: le maschere. La prima vera e' il ricevimento merci su iPhone,
con la fotocamera e il pulsante che chiama lo script `10`.
