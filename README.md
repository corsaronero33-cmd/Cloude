# tbToolkit

Libreria di utilita' per stringhe scritta in **twinBASIC**, con un micro
framework di test e una suite che la copre.

Il codice e' pensato per essere letto: nessuna dipendenza esterna, nessun
controllo ActiveX, solo due chiamate all'API di Windows per l'output su
console. Compila identico a 32 e a 64 bit.

## Contenuto

| File | Ruolo |
| --- | --- |
| `Sources/StringUtils.twin` | La libreria: padding, ricerca, normalizzazione, slug, distanza di Levenshtein |
| `Sources/TestRunner.twin` | Micro framework di test, circa cento righe |
| `Sources/StringUtilsTests.twin` | Suite di test sulla libreria |
| `Sources/ConsoleOut.twin` | Output verso la finestra Debug e verso stdout |
| `Sources/App.twin` | `Sub Main`: esegue i test e poi una dimostrazione |

## Come aprirlo nell'IDE

Il file di progetto `.twinproj` e' un contenitore binario, non un file di
testo, quindi in questo repository non c'e' e non va scritto a mano. Si parte
da un progetto vuoto:

1. Nell'IDE twinBASIC creare un nuovo progetto (Console Application oppure
   Standard EXE).
2. Aggiungere i cinque file di `Sources/` con **Add existing file**, oppure
   trascinarli nella finestra del progetto.
3. Impostare `App` come *Startup Object* nelle impostazioni del progetto.
4. Premere F5.

Per il controllo di versione a valle, twinBASIC distribuisce lo strumento
`impexp` (in versione Python e Node.js) che esporta e reimporta un
`.twinproj` come albero di cartelle. Le radici che genera sono `Sources`,
`Settings` e `Resources`: la cartella `Sources/` di questo repository e' gia'
nella posizione giusta perche' i file vengano ripresi da un import.

## Cosa stampa

```
tbToolkit - suite di test
-------------------------

Asserzioni superate: 49 su 49
Esito: TUTTO OK

tbToolkit - dimostrazione
-------------------------
Slug del titolo....... guida-rapida-a-twinbasic
Occorrenze di 'a'..... 6
Distanza gatto/gatti.. 1
Cornice............... =*=*=*=*=*=*=*=*=*=*

Testo mandato a capo a 40 colonne:
twinBASIC compila lo stesso sorgente sia
a 32 sia a 64 bit, senza modifiche.
```

## Note sulla libreria

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

## Test

I test vivono in `StringUtilsTests.RunAll`, che riceve il `TestRunner` da
usare invece di crearne uno proprio: cosi' altre suite si possono aggiungere
a `App.Main` e condividere lo stesso riepilogo finale. `TestRunner.HasFailures`
espone l'esito complessivo a chi volesse propagarlo come codice di uscita.
