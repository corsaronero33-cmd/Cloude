# Etichette per laboratorio di sushi

Programma in **twinBASIC** per stampare le etichette che un negozio di sushi
applica sulle confezioni che produce: lotto, data di produzione, data di
scadenza, ingredienti con allergeni evidenziati, codice a barre GS1-128 per la
tracciabilita'.

Il motore dell'etichetta e' completo e si prova da console. L'interfaccia
grafica e' l'ultimo pezzo e va costruita nel designer dell'IDE: il perche' e'
spiegato sotto, in [Collegare un form vero](#collegare-un-form-vero).

## Com'e' fatta l'etichetta

Questa e' l'anteprima a caratteri che il programma stampa all'avvio, per il
prodotto piu' carico del catalogo di esempio su un supporto da 70 x 50 mm:

```
+------------------------------------------------------------------------------------------+
|  SUSHI MISTO 12 PEZZI                                                                    |
|                                                                                          |
|  Ingredienti: Riso (riso, aceto di riso, zucchero, sale), SALMONE (Salmo                 |
|  salar), TONNO (Thunnus albacares), GAMBERI (Litopenaeus vannamei), alga                 |
|  nori, avocado, SURIMI (PESCE, amido, albume d'UOVO), semi di SESAMO, SALSA              |
|  DI SOIA (acqua, SOIA, GRANO, sale)                                                      |
|  Contiene: GLUTINE, CROSTACEI, UOVA, PESCE, SOIA, SESAMO                                 |
|  Prodotto a base di pesce consumato crudo, sottoposto a bonifica preventiva ai sensi     |
|  del Reg. CE 853/2004.                                                                   |
|  -------------------------------------------------------------------------------------   |
|  Peso netto 420 g                                                                        |
|  Prodotto il 05/11/2026 ore 10:30                                                        |
|  DA CONSUMARE ENTRO 06/11/2026 10:30                                                     |
|  Lotto L261105-03                                                                        |
|  Conservare 0/+4 °C                                                                      |
|  |||| ||| |||| || |||| ||| || |||| ||| |||| || ||| |||| ||| || |||| ||| |||| || |||      |
|                                (17)261106(10)L261105-03                                  |
|  Sakura Sushi di Mario Rossi - Via Giuseppe Verdi 14 - 20121 Milano (MI) - IT 1234 CE    |
|  Prodotto confezionato in atmosfera protettiva.                                          |
+------------------------------------------------------------------------------------------+
```

L'anteprima serve a controllare l'ordine delle righe e gli ingombri. Le
proporzioni sono quelle vere, i corpi dei caratteri no: in una griglia di
caratteri tutto il testo e' della stessa misura.

## Cosa va in etichetta e perche'

Le informazioni obbligatorie sono quelle del **Reg. UE 1169/2011**, che per i
prodotti preimballati chiede denominazione, elenco degli ingredienti con gli
allergeni evidenziati, quantita' netta, data di scadenza, condizioni di
conservazione e dati dell'operatore. A queste si aggiungono:

| Informazione | Da dove viene l'obbligo |
| --- | --- |
| Lotto di produzione | D.Lgs. 231/2017 |
| Allergeni messi in risalto nell'elenco ingredienti | Reg. UE 1169/2011, art. 21 |
| Data di scadenza, non termine minimo di conservazione | Reg. UE 1169/2011: i prodotti molto deperibili vogliono "da consumare entro" |
| Specie, nome scientifico, metodo di produzione, zona di cattura, attrezzo da pesca | Reg. UE 1379/2013, per i prodotti della pesca al consumatore finale |
| Avviso di bonifica preventiva sul pesce da consumare crudo | Reg. CE 853/2004, All. III, Sez. VIII, Cap. 3, lett. D |
| Marchio di identificazione dello stabilimento | Reg. CE 853/2004, All. II, Sez. I |

**Due avvertenze, che non sono formalita'.**

Il riconoscimento automatico degli allergeni e' un aiuto alla compilazione,
non una garanzia: va letto e confermato prodotto per prodotto. Il campo
`AllergeniManuali` della scheda, se compilato, vince sempre su quello
calcolato, ed e' lo strumento per correggere il programma quando sbaglia.

Il programma non e' una consulenza legale. Prima di usare le etichette in
negozio, far validare il contenuto da chi segue l'HACCP del laboratorio.

## Il contenuto del progetto

### Il motore dell'etichetta

| File | Ruolo |
| --- | --- |
| `Sources/Prodotto.twin` | La scheda di un prodotto: ricetta, durata, prezzo, dati sulla pesca |
| `Sources/Catalogo.twin` | L'elenco dei prodotti, con lettura e scrittura su CSV |
| `Sources/Azienda.twin` | Dati del negozio e formato del supporto, su file `chiave = valore` |
| `Sources/Etichetta.twin` | Una stampa concreta: prodotto, momento di produzione, lotto, copie |
| `Sources/ComposizioneEtichetta.twin` | Da etichetta a layout: decide cosa scrivere, dove e con che corpo |
| `Sources/LayoutEtichetta.twin` | Il layout: lista di elementi, ingombri, avvisi |
| `Sources/ElementoEtichetta.twin` | Un elemento da disegnare, posizionato in millimetri |
| `Sources/Grafica.twin` | Tipi e conversioni fra punti tipografici e millimetri |
| `Sources/Code128.twin` | Generatore Code 128 e GS1-128, senza font ne' controlli esterni |
| `Sources/Disegno.twin` | Disegna un layout su una superficie grafica qualunque |
| `Sources/AnteprimaTesto.twin` | Disegna un layout a caratteri, per la console e per i test |
| `Sources/Stampa.twin` | Manda in stampa, una etichetta per pagina o a griglia su A4 |
| `Sources/RegistroStampe.twin` | Registro in sola aggiunta di quello che e' stato stampato |
| `Sources/Allergeni.twin` | I quattordici allergeni dell'Allegato II, riconoscimento e risalto |
| `Sources/Lotto.twin` | Generazione e rilettura del codice di lotto |
| `Sources/DateUtil.twin` | Date in formato italiano, indipendenti dalla lingua di Windows |
| `Sources/Numero.twin` | Numeri con la virgola, indipendenti dalla lingua di Windows |
| `Sources/CsvUtil.twin` | CSV con il punto e virgola, campi protetti dalle virgolette |
| `Sources/Utf8File.twin` | Lettura e scrittura di file in UTF-8, senza API di Windows |
| `Sources/Esempi.twin` | Un catalogo e un negozio di prova, usati dalla demo e dai test |
| `Sources/EtichetteTests.twin` | La suite di test del programma |
| `Sources/AppEtichette.twin` | `Sub Main`: test, anteprima, riepilogo allergeni |

### I dati

| File | Ruolo |
| --- | --- |
| `Dati/prodotti.csv` | Nove prodotti di esempio, con commenti che spiegano le colonne |
| `Dati/azienda.ini` | Dati del negozio e formato dell'etichetta, con commenti |

Entrambi sono file di testo UTF-8 con il BOM e il punto e virgola come
separatore: si aprono con un doppio clic in Excel su un Windows italiano, si
correggono anche col Blocco note, e le righe che iniziano con `#` sono
commenti.

### La libreria di stringhe

`StringUtils`, `TestRunner`, `ConsoleOut`, `StringUtilsTests` e `App` sono la
libreria che era gia' in questo repository. Il programma delle etichette la
usa: `WordWrap` manda a capo l'elenco ingredienti, `PadRight` allinea
l'anteprima, `TestRunner` esegue i test. Le note su quella libreria sono in
fondo a questo file.

## Come aprirlo nell'IDE

Il file di progetto `.twinproj` e' un contenitore e non un file di testo,
quindi in questo repository non c'e' e non va scritto a mano. Si parte da un
progetto vuoto:

1. Nell'IDE twinBASIC creare un nuovo progetto (**Standard EXE**, cosi' si
   potra' aggiungere il form).
2. Aggiungere tutti i file di `Sources/` con **Add existing file**, oppure
   trascinarli nella finestra del progetto.
3. Impostare **`AppEtichette`** come *Startup Object* nelle impostazioni del
   progetto. (`App`, che e' il punto di ingresso della libreria di stringhe,
   resta nel progetto: si scambia solo lo Startup Object.)
4. Premere F5.

L'avvio esegue la suite di test, stampa l'anteprima dell'etichetta e il
riepilogo degli allergeni di tutto il catalogo. Non serve ne' una stampante
ne' un form.

Per il controllo di versione, twinBASIC distribuisce `impexp` (in versione
Python e Node.js) che esporta e reimporta un `.twinproj` come albero di
cartelle. Le radici che genera sono `Sources`, `Settings` e `Resources`: la
cartella `Sources/` di questo repository e' gia' nella posizione giusta.

## Collegare un form vero

Il motore e' deliberatamente separato dall'interfaccia, e il disegno non sa su
che cosa sta disegnando:

```vb
Public Sub Disegna(ByVal superficie As Object, ByVal layout As LayoutEtichetta, ...)
```

La superficie e' dichiarata `As Object`, non `As Printer` o `As PictureBox`.
E' la scelta portante del programma: la stessa funzione disegna l'anteprima a
schermo e la stampa, quindi l'anteprima non puo' mostrare qualcosa di diverso
da quello che esce dalla stampante. Tutte le chiamate alla superficie passano
da quattro procedure private di `Disegno.twin` (`ImpostaScala`, `ImpostaFont`,
`ScriviTesto`, `RiempiRettangolo`): se la versione di twinBASIC in uso espone
quelle proprieta' con nomi diversi, sono gli unici quattro punti da adattare.

**Perche' il form non e' nel repository.** Nell'IDE un form sono due file: il
codice in un `.twin` e il layout in un `.tbform`, che e' JSON generato
dall'IDE e non documentato. Scriverlo a mano significa consegnare un file che
l'IDE probabilmente rifiuta di importare, cioe' peggio di niente. Il form si
disegna in due minuti nel designer; qui sotto c'e' il codice da incollarci.

Serve un form con questi controlli:

| Controllo | Nome | Note |
| --- | --- | --- |
| ComboBox | `cboProdotto` | `Style` = Dropdown List |
| TextBox | `txtCopie` | |
| TextBox | `txtPeso` | per i prodotti che si pesano al momento |
| PictureBox | `picAnteprima` | `AutoRedraw` = True, circa 70 x 50 mm |
| Label | `lblAvvisi` | multiriga |
| CommandButton | `cmdAnteprima`, `cmdStampa` | |

E questo e' il codice del form, completo:

```vb
Option Explicit

Private mCatalogo As Catalogo
Private mNegozio As Azienda

Private Sub Form_Load()
    Dim i As Long

    Set mNegozio = New Azienda
    Set mCatalogo = New Catalogo

    mNegozio.CaricaDaFile CartellaDati() & "azienda.ini"
    mCatalogo.CaricaDaFile CartellaDati() & "prodotti.csv"

    If mCatalogo.NumeroErrori > 0 Then
        MsgBox "Problemi nel catalogo:" & vbCrLf & mCatalogo.TestoErrori(), _
               vbExclamation
    End If

    For i = 1 To mCatalogo.Conteggio
        cboProdotto.AddItem mCatalogo.Elemento(i).Denominazione
        cboProdotto.ItemData(cboProdotto.NewIndex) = i
    Next i
    If cboProdotto.ListCount > 0 Then cboProdotto.ListIndex = 0

    txtCopie.Text = "1"
    txtPeso.Text = ""
End Sub

' L'etichetta che l'operatore ha composto sullo schermo in questo momento.
Private Function EtichettaCorrente() As Etichetta
    Dim e As Etichetta
    Dim scheda As Prodotto

    If cboProdotto.ListIndex < 0 Then Return Nothing
    Set scheda = mCatalogo.Elemento(cboProdotto.ItemData(cboProdotto.ListIndex))

    Set e = New Etichetta
    e.Prepara scheda, mNegozio, Now, 1
    e.Copie = CLng(Numero.Interpreta(txtCopie.Text))
    e.PesoEffettivoGrammi = Numero.Interpreta(txtPeso.Text)
    Return e
End Function

Private Sub cmdAnteprima_Click()
    Dim e As Etichetta
    Dim layout As LayoutEtichetta

    Set e = EtichettaCorrente()
    If e Is Nothing Then Exit Sub

    Set layout = ComposizioneEtichetta.Componi(e)

    ' ScaleMode in millimetri: l'anteprima esce in scala 1 a 1, cioe'
    ' l'etichetta sullo schermo e' grande come sara' sulla confezione.
    picAnteprima.Cls
    Disegno.Disegna picAnteprima, layout

    lblAvvisi.Caption = layout.TestoAvvisi()
End Sub

Private Sub cmdStampa_Click()
    Dim e As Etichetta
    Dim registro As RegistroStampe
    Dim problema As String

    Set e = EtichettaCorrente()
    If e Is Nothing Then Exit Sub

    problema = e.Valida()
    If Len(problema) > 0 Then
        MsgBox problema, vbExclamation
        Exit Sub
    End If

    Stampa.Etichette Printer, e

    ' Il registro si scrive dopo la stampa: cosi' non registra etichette
    ' che non sono uscite.
    Set registro = New RegistroStampe
    registro.Percorso = CartellaDati() & "registro.csv"
    registro.Registra e, "banco"
End Sub

' La cartella Dati accanto all'eseguibile. Si usa CurDir$ e non App.Path
' perche' in questo progetto App e' un modulo, non l'oggetto App di VB.
Private Function CartellaDati() As String
    Dim radice As String

    radice = CurDir$()
    If Right$(radice, 1) <> "\" Then radice = radice & "\"
    Return radice & "Dati\"
End Function
```

Per stampare piu' etichette su un foglio adesivo A4 invece che su una
stampante termica, al posto di `Stampa.Etichette` si usa `Stampa.Griglia`,
che prende il numero di colonne e di righe e i passi fra un'etichetta e
l'altra in millimetri.

## Come si comporta

### Il lotto

Due formati, entrambi rileggibili: dal codice si risale a data e turno senza
consultare archivi.

```
Compatto   L261105-03    prefisso, anno/mese/giorno, progressivo
Giuliano   L26309-03     prefisso, anno, giorno dell'anno, progressivo
```

`Lotto.Interpreta` fa il giro inverso e rifiuta i codici impossibili (il
giorno 45, il mese 13, il 366esimo giorno di un anno non bisestile), quindi
serve anche a validare quello che l'operatore digita a mano.

### Il codice a barre

E' un **GS1-128** che porta dentro la scadenza e il lotto:

```
(17)261106(10)L261105-03
```

Cosi' chi lo legge in cassa o in magazzino ha la tracciabilita' senza
digitare nulla. In un EAN-13 ci stanno tredici cifre e nient'altro, e il
lotto non ci entrerebbe.

Non serve nessun font per codici a barre e nessun controllo ActiveX: il
codice viene disegnato come una serie di rettangoli, quindi si stampa identico
su qualunque stampante. La larghezza del modulo viene calcolata perche' il
codice occupi lo spazio disponibile, e se scende sotto il minimo impostato
(0,19 mm, circa un modulo e mezzo a 203 dpi) il layout lo segnala: un codice
troppo fitto per la risoluzione della stampante si stampa benissimo e non si
legge.

### Quando il contenuto non entra

L'etichetta viene composta fino a cinque volte, riducendo i caratteri di un
cinque per cento per volta fino all'ottanta. **Quello che si riduce sono i
caratteri, non il testo:** l'elenco degli ingredienti e' un'informazione
obbligatoria, e abbreviarlo e' un difetto dell'etichetta, non un modo di
guadagnare spazio. Il conto torna anche a favore, perche' un corpo piu'
piccolo fa entrare piu' caratteri per riga e lo stesso elenco occupa spesso
meno righe.

Se nemmeno all'ottanta per cento ci sta, il layout viene restituito comunque
con l'avviso di quanti millimetri esce: decide l'operatore se stampare o
cambiare supporto. Se l'elenco ingredienti ha dovuto essere abbreviato,
l'avviso lo dice a lettere maiuscole.

Sui nove prodotti di esempio, su 70 x 50 mm: sei entrano a grandezza piena,
tre al novantacinque per cento, e in nessuno l'elenco ingredienti viene
abbreviato. 70 x 50 mm e' il formato su cui il programma e' tarato ed e' il
minimo pratico per un'etichetta completa con il codice a barre; su 70 x 60
si sta larghi.

### Lingua del sistema

Date e numeri non passano mai da `Format$` ne' da `CStr` per la parte
decimale. Un'etichetta deve dire `05/11/2026` e `12,50` anche su un PC
configurato in inglese, e `Format$` seguirebbe le impostazioni
internazionali. I file di testo sono letti e scritti in UTF-8 con una
conversione fatta byte per byte, senza chiamate all'API di Windows, perche'
`Print #` e `Line Input #` lavorano in ANSI e perderebbero gli accenti
dentro un elenco di ingredienti.

## Test

`EtichetteTests.RunAll` copre date, numeri, UTF-8, CSV, allergeni, lotto,
Code 128, prodotto, catalogo, azienda, etichetta, composizione, anteprima e
registro. Gira insieme alla suite della libreria di stringhe e condivide il
riepilogo finale.

Due cose che vale la pena di sapere su come sono scritti.

**I vettori del codice a barre sono costanti letterali.** Un test che
ricalcolasse il risultato con la stessa funzione che sta provando non
proverebbe nulla, quindi i valori attesi sono stati calcolati a mano e
verificati contro la tabella dello standard.

**La tabella dei motivi si controlla da sola.** Sono centosei righe di sei
cifre battute a mano, e un errore di battitura produrrebbe un codice che si
stampa benissimo e che nessun lettore riesce a leggere.
`Code128.TabellaValida` verifica due proprieta' che in Code 128 valgono per
costruzione e che un errore rompe quasi sempre: la somma delle sei cifre di
ogni motivo fa undici, e la somma delle sole barre e' pari. Il test la chiama,
quindi una tabella sbagliata si scopre al primo avvio e non in negozio.

## Cosa manca

- Il form, per il motivo spiegato sopra. Il codice da incollarci e' in questo
  file.
- La gestione dei prodotti dall'interfaccia: adesso il catalogo si modifica
  in `Dati/prodotti.csv`. `Catalogo` ha gia' `Imposta` e `Rimuovi`, serve la
  finestra.
- La dichiarazione nutrizionale. Per la vendita diretta in piccole quantita'
  al consumatore finale non e' obbligatoria (Reg. UE 1169/2011, art. 16 e
  Allegato V), quindi non c'e'; se servisse, si aggiunge una tabella alla
  scheda prodotto e un blocco al compositore.
- L'uscita in **ZPL** diretto per le stampanti Zebra, che salta il driver
  Windows. Il layout e' gia' una lista di elementi con coordinate in
  millimetri, quindi e' un secondo modulo di disegno accanto a `Disegno.twin`,
  non una riscrittura.

---

## Nota sulla libreria di stringhe

`StringUtils` e' una libreria di utilita' per stringhe senza dipendenze
esterne, con un micro framework di test che la copre.

- Tutti i parametri sono `ByVal` e nessuna funzione tocca lo stato del
  modulo, quindi le funzioni si possono comporre liberamente.
- `CountOccurrences` conta occorrenze **non** sovrapposte: `"aaaa"` contiene
  due volte `"aa"`, non tre.
- `WordWrap` spezza solo sugli spazi. Una parola piu' lunga della larghezza
  richiesta occupa da sola la sua riga e la eccede, non viene mai troncata.
- `Repeat` raddoppia il buffer a ogni passo, quindi fa un numero di
  concatenazioni proporzionale al logaritmo del conteggio.
- `Slugify` riduce le accentate latine alla lettera base, cosi'
  `"Citta' di Nizza"` diventa `citta-di-nizza`.
- Gli argomenti non validi sollevano l'errore 5 (`Invalid procedure call`)
  con `Err.Source` valorizzato.
