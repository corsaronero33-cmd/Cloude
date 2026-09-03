# Convenzioni di questo progetto

Regole per chiunque (persona o assistente) scriva codice qui dentro.

## Stile: procedurale, non a oggetti

Chi mantiene questo progetto viene da Clipper, QuickBasic e FileMaker, e vuole
poter leggere qualsiasi file dall'alto in basso senza inseguire gerarchie.
Il codice va scritto di conseguenza.

**Si fa cosi':**

- I dati stanno in classi che contengono **solo campi**, senza metodi dentro
  (`Cliente`, `Documento`, `RigaDocumento`). Sono record, non oggetti.
  I campi si scrivono `public string Nome { get; set; }` perche' e' l'unica
  forma che la griglia di WinForms e Dapper sanno leggere: vanno pensati come
  normali variabili.
- Il comportamento sta in **moduli di funzioni**: `static class` con dentro
  `static` method, cioe' funzioni (`CalcoloDocumento`, `Validazioni`,
  `ClientiDb`, `DocumentiDb`). Si chiamano `Modulo.Funzione(dati)`.
- Cicli `for` e `foreach` espliciti. Sono leggibili e si mettono in debug
  una riga per volta.
- Funzioni pure dove possibile: dati in ingresso, risultato in uscita, niente
  variabili globali e niente accessi a file nascosti dentro il calcolo.
- Le funzioni che validano tornano una **lista di messaggi**, non lanciano
  eccezioni: l'utente deve vedere tutti i problemi in una volta.

**Non si fa:**

- Ereditarieta' fra classi nostre, classi astratte, gerarchie.
- Interfacce nostre, dependency injection, contenitori IoC.
- Pattern (Repository, Factory, Strategy, Mediator, MVVM...) introdotti
  "per pulizia". Se non risolvono un problema che esiste adesso, non entrano.
- LINQ a catena come sostituto di un ciclo leggibile. Un `foreach` va bene.
- Metodi dentro le classi di dati.

L'unica eccezione ammessa e' la colla richiesta da una libreria esterna
(esempio: `ConvertitoreDecimal` in `Database.cs` deve ereditare da una classe
di Dapper). Va isolata, commentata e tenuta fuori dalla logica del gestionale.

## Lingua

Nomi di classi, funzioni, campi, tabelle e colonne: **in italiano**, come il
dominio. Commenti in italiano. Niente caratteri accentati negli identificatori
e nelle stringhe di codice (si scrive "quantita'", non "quantità") per evitare
problemi di codifica fra editor diversi.

## Soldi e numeri

- Gli importi sono sempre `decimal`, **mai** `double` o `float`.
- Arrotondamento commerciale via `CalcoloDocumento.Arrotonda` (0,005 -> 0,01),
  mai `Math.Round` diretto: il default di .NET arrotonda "al pari" e da'
  risultati diversi.
- L'IVA si calcola **sul totale imponibile di ogni aliquota**, mai sommando
  l'imposta riga per riga. Vedi il test
  `ImpostaCalcolataSulTotaleDellAliquotaNonRigaPerRiga`.
- Nel database gli importi stanno in colonne `TEXT` (SQLite non ha un tipo
  decimale esatto). La conversione passa da `ConvertitoreDecimal`, che impone
  il formato con il punto a prescindere da come e' configurato Windows.

## Database

- SQL scritto a mano, sempre con parametri `@nome`. Mai concatenare testo
  dell'utente dentro una query.
- Lo schema si cambia **solo aggiungendo** un nuovo file in `db/`
  (`002_...sql`, `003_...sql`). Uno script gia' rilasciato non si tocca mai.
- Testata e righe di un documento si salvano dentro una transazione.

## Test

Ogni regola di calcolo o di validazione ha un test in `test/Cloude.Test`.
Prima di considerare finita una modifica: `dotnet test` deve essere verde.
