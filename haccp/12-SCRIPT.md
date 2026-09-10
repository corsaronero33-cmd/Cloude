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
Vai al formato [ "Parametri" (Parametri) ]
Mostra tutti i record
Imposta variabile [ $$PARAMETRI ; Valore: "" ]
Vai a record/richiesta/pagina [ Primo ]
Ciclo
    Imposta variabile [ $$PARAMETRI ; Valore:
        $$PARAMETRI & Parametri::Chiave & "=" & Parametri::Valore & "¶" ]
    Vai a record/richiesta/pagina [ Successivo ; Esci dopo l'ultimo: Attivato ]
Fine ciclo
Imposta campo [ Parametri::gGiorniAvviso ;
    GetAsNumber ( Parametro ( "GiorniAvvisoScadenza" ) ) ]
```

Un ciclo esplicito, una riga per volta. Si mette in debug e si vede cosa
succede: e' il motivo per cui non si usa niente di piu' furbo.

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

Registra la misura, calcola l'esito con i limiti del punto di controllo, e se
la misura e' fuori limite **apre da sola la non conformita'** portandosi
dentro l'azione correttiva gia' scritta nel punto di controllo.

```
Consenti annullamento utente [ Disattivato ]
Imposta acquisizione errori [ Attivato ]

# --- controlli prima di scrivere qualsiasi cosa ---
Se [ IsEmpty ( Rilevazioni::gIdPuntoControllo ) ]
    Mostra finestra di dialogo personalizzata [ "Manca il punto di controllo." ]
    Esci dallo script [ Risultato del testo: "" ]
Fine se

Se [ IsEmpty ( Rilevazioni::gValore ) and IsEmpty ( Rilevazioni::gValoreTesto ) ]
    Mostra finestra di dialogo personalizzata [ "Manca il valore rilevato." ]
    Esci dallo script [ Risultato del testo: "" ]
Fine se

# --- crea la rilevazione ---
Vai al formato [ "Rilevazioni" (RIL|Rilevazioni) ]
Nuovo record/richiesta
Imposta campo [ Rilevazioni::IdPuntoControllo ; Rilevazioni::gIdPuntoControllo ]
Imposta campo [ Rilevazioni::DataOra ; Get ( IndicatoreDataOraCorrente ) ]
Imposta campo [ Rilevazioni::IdOperatore ; $$UTENTE.Id ]
Imposta campo [ Rilevazioni::Valore ; Rilevazioni::gValore ]
Imposta campo [ Rilevazioni::ValoreTesto ; Rilevazioni::gValoreTesto ]
Imposta campo [ Rilevazioni::Note ; Rilevazioni::gNote ]
Conferma record/richieste [ Con dialogo: Disattivato ]

# --- l'esito, letto dai limiti del punto di controllo ---
Imposta variabile [ $esito ; Valore:
    If ( RIL|PuntiControllo::Grandezza = "visivo" ;
         Rilevazioni::ValoreTesto ;
         EsitoRilevazione (
             Rilevazioni::Valore ;
             RIL|PuntiControllo::LimiteMin ;
             RIL|PuntiControllo::LimiteMax ) ) ]
Imposta campo [ Rilevazioni::Esito ; $esito ]
Imposta campo [ Rilevazioni::Bloccato ; "Si" ]
Conferma record/richieste [ Con dialogo: Disattivato ]
Imposta variabile [ $idRilevazione ; Valore: Rilevazioni::Id ]

# --- se e' fuori limite, apri la non conformita' ---
Se [ $esito = "non conforme" ]
    Imposta variabile [ $descrizione ; Valore:
        "Fuori limite: " & RIL|PuntiControllo::Descrizione &
        ". Valore rilevato " & Rilevazioni::Valore & " " &
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

    Imposta campo [ Rilevazioni::IdNonConformita ; $idNC ]
    Conferma record/richieste [ Con dialogo: Disattivato ]

    Mostra finestra di dialogo personalizzata [
        "Valore fuori limite" ;
        $descrizione & "¶¶Azione correttiva da eseguire:¶" & $azione ]
Fine se

# --- svuota i campi di immissione ---
Imposta campo [ Rilevazioni::gIdPuntoControllo ; "" ]
Imposta campo [ Rilevazioni::gValore ; "" ]
Imposta campo [ Rilevazioni::gValoreTesto ; "" ]
Imposta campo [ Rilevazioni::gNote ; "" ]
```

### Due punti che sembrano dettagli e non lo sono

**Il `Conferma record/richieste` dopo aver scritto `IdPuntoControllo`.**
Finche' il record non e' confermato la relazione non si aggancia, e
`RIL|PuntiControllo::LimiteMin` risulta vuoto: l'esito verrebbe sempre
"conforme". E' l'errore piu' insidioso di tutto il progetto, perche' il
programma non da' nessun messaggio, dice solo che va tutto bene.

**La finestra nuova per creare la non conformita'.**
Serve a non perdere il record su cui stai lavorando: si apre, si crea la non
conformita', si chiude, e ti ritrovi esattamente dov'eri.

---

# Script 5 — `10 - Ricevimento - Leggi etichetta`

Da eseguire con il cursore su una riga di ricevimento.

```
Consenti annullamento utente [ Disattivato ]
Imposta acquisizione errori [ Attivato ]

Se [ Get ( PiattaformaSistema ) = 3 ]
    Inserisci da dispositivo [ RigheRicevimento::CodiceScansionato ;
        Tipo: Codice a barre ; Fotocamera: Posteriore ]
Altrimenti
    Mostra finestra di dialogo personalizzata [
        "Codice etichetta" ;
        "Sul telefono questo si legge con la fotocamera. Qui incollalo a mano." ;
        Campo immissione 1: RigheRicevimento::CodiceScansionato ]
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
        "Etichetta non riconosciuta" ;
        "Il codice e' stato salvato ma non contiene lotto ne' scadenza in "
        & "formato GS1. Scrivili a mano e segnalamelo: potrebbe essere "
        & "un'etichetta particolare di quel fornitore." ]
Fine se
```

**Limite dichiarato:** per adesso lo script compila lotto e scadenza, non il
prodotto. Agganciare il prodotto dal codice GTIN richiede una relazione in
piu' nel grafico: si fa nella sessione delle maschere, quando sappiamo come
si presenta il ricevimento a video.

**Sul PC il passo della fotocamera non funziona**, ed e' giusto cosi':
`Inserisci da dispositivo` esiste solo su FileMaker Go. Per questo lo script
chiede il codice a mano quando non e' su iPhone o iPad, cosi' lo puoi provare
adesso.

---

# Collaudo

| Prova | Come | Deve succedere |
|---|---|---|
| Parametri caricati | Esegui `01`, poi nel visualizzatore dati guarda `$$PARAMETRI` | una riga per ogni parametro, `chiave=valore` |
| Funzione parametro | `Parametro ( "GiorniAvvisoScadenza" )` | `7` |
| Campo globale | guarda `Parametri::gGiorniAvviso` | `7` |
| Operatore | crea un operatore con `AccountFileMaker` = `Admin`, esegui `02`, guarda `$$UTENTE.Nome` | il nome dell'operatore |
| Rilevazione conforme | metti `gIdPuntoControllo` di un frigo, `gValore` = `3`, esegui `20` | nuova rilevazione, `Esito` = `conforme`, nessuna non conformita' |
| Rilevazione fuori limite | stesso punto, `gValore` = `9`, esegui `20` | `Esito` = `non conforme`, finestra con l'azione correttiva, e **una non conformita' nuova** con dentro quell'azione |
| Legame fra i due | apri la non conformita' appena nata | `IdRilevazione` valorizzato, `Gravita` = `alta` se il punto e' un CCP |
| Etichetta | esegui `10` su una riga di ricevimento e incolla `010800123456789010LOTTO123` | `Lotto` = `LOTTO123` |
| Etichetta con scadenza | incolla `01080012345678901725013110LOTTO123` | `Lotto` = `LOTTO123`, `DataScadenza` = `31/01/2025` |

La prova che conta e' la sesta: **una misura fuori limite deve generare da
sola la non conformita' con l'azione correttiva gia' scritta dentro**. Se
funziona quella, il cuore del sistema c'e'.

---

## Cosa viene dopo

`13-LAYOUT.md`: le maschere. La prima vera e' il ricevimento merci su iPhone,
con la fotocamera e il pulsante che chiama lo script `10`.
