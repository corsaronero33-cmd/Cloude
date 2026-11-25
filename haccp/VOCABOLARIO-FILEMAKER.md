# Come si chiamano le cose in FileMaker Pro 22 italiano

Verificato sulla documentazione Claris in italiano, `help.claris.com/it/pro-help/`,
il 18 novembre 2026. **Non si va a memoria e non si traduce a senso:** un nome
sbagliato manda chi costruisce a cercare un comando che non esiste.

## La regola

Si scrive il nome **che l'utente legge a schermo**. Quando non si e' sicuri si
apre la pagina italiana del passo su `help.claris.com/it/pro-help/content/` e
si legge il titolo: il titolo della pagina **e'** il nome del passo.

## Istruzioni di script

Si chiamano **istruzioni di script**, non "passi di script".

| Inglese | Italiano |
|---|---|
| `Perform Find` | **`Esegui la ricerca`** |
| `Enter Find Mode` | **`Passa al modo Trova`** |
| `Enter Browse Mode` | **`Passa al modo Usa`** |
| `Enter Preview Mode` | **`Passa al modo Anteprima`** |
| `Perform Find/Replace` | **`Esegui Trova/Sostituisci`** |
| `Show All Records` | `Mostra tutti i record` |
| `Show Omitted Only` | `Mostra solo le omissioni` |
| `Omit Record` | `Ometti il record` |
| `Constrain Found Set` | `Limita gruppo trovato` |
| `Sort Records` | **`Ordina i record`** |
| `Commit Records/Requests` | **`Salva record/richieste`** |
| `New Record/Request` | `Nuovo record/richiesta` |
| `Delete Record/Request` | `Elimina il record/richiesta` |
| `Go to Layout` | `Vai al formato` |
| `Go to Record/Request/Page` | **`Vai a Record/Richiesta/Pagina`** |
| `Go to Field` | `Vai al campo` |
| `Set Field` | `Imposta campo` |
| `Set Variable` | `Imposta variabile` |
| `Set Error Capture` | **`Imposta cattura errori`** |
| `Show Custom Dialog` | `Mostra finestra personalizzata` |
| `Allow User Abort` | `Consenti interruzione utente` |
| `Exit Script` | `Esci dallo script` |
| `Perform Script` | `Esegui script` |
| `Pause/Resume Script` | `Pausa/continua lo script` |
| `Freeze Window` | `Blocca finestra` |
| `Refresh Window` | `Aggiorna finestra` |
| `Adjust Window` | `Regola finestra` |
| `New Window` | `Nuova finestra` |
| `Close Window` | `Chiudi finestra` |

### Queste **non** si traducono

`If`, `Else`, `Else If`, `End If`, `Loop`, `End Loop`, `Exit Loop If`
restano **in inglese** anche nell'interfaccia italiana.

La pagina italiana di `End If` lo dice da sola: *"Segnala la fine di
un'istruzione di script **If**"*.

Quindi **non** si scrive `Se [ ... ]`, `Altrimenti`, `Fine se`.

## Funzioni di calcolo

Verificate sul titolo della pagina italiana Claris, una per una. Si scrivono
**in italiano**, come le mostra FileMaker (vedi `CLAUDE.md`, regola 3).

| Inglese | Italiano |
|---|---|
| `IsEmpty` | **`EVuoto`** |
| `If` | `If` |
| `Case` | **`Casi`** |
| `Let` | **`Dichiara`** |
| `Count` | `Conteggio` |
| `GetAsDate` | **`RicavaComeData`** |
| `GetAsTime` | **`RicavaComeOra`** |
| `GetAsText` | `RicavaComeTesto` |
| `Left` | `Sinistra` |
| `Length` | `Lunghezza` |

### Le `Get`

| Inglese | Italiano |
|---|---|
| `Get ( ScriptParameter )` | `Get ( ParametroScript )` |
| `Get ( ScriptResult )` | `Get ( RisultatoScript )` |
| `Get ( FoundCount )` | **`Get ( ContoTrovati )`** |
| `Get ( RecordNumber )` | `Get ( NumeroRecord )` |
| `Get ( LastError )` | `Get ( UltimoErrore )` |
| `Get ( LastMessageChoice )` | **`Get ( SceltaUltimoMessaggio )`** |
| `Get ( AccountName )` | `Get ( NomeAccount )` |
| `Get ( AccountPrivilegeSetName )` | **`Get ( NomeSetPrivilegiAccount )`** |
| `Get ( CurrentDate )` | `Get ( DataCorrente )` |
| `Get ( CurrentTimestamp )` | **`Get ( IndicatoreDataOraCorrente )`** |
| `Get ( UUID )` | **`Get ( IDUU )`** |
| `Get ( SystemPlatform )` | `Get ( PiattaformaSistema )` |
| `Get ( Device )` | `Get ( Dispositivo )` |

### Operatori: non si traducono

`AND`, `OR`, `XOR`, `NOT`. La pagina italiana *Operatori logici* li scrive
cosi': *"Utilizzare AND, OR o XOR con due espressioni; utilizzare NOT con
un'espressione"*.

### Nomi inventati, corretti il 23 novembre 2026

| Scritto | Non esiste. Si chiama |
|---|---|
| `Get ( NomeSetPrivilegi )` | `Get ( NomeSetPrivilegiAccount )` |
| `Get ( ConteggioTrovati )` | `Get ( ContoTrovati )` |
| `Get ( ConteggioRecordTrovati )` | `Get ( ContoTrovati )` |
| `Get ( UltimaSceltaMessaggio )` | `Get ( SceltaUltimoMessaggio )` |

### Non ancora verificati

Le variabili di unione nei formati (`{{FoundCount}}`, `{{RecordNumber}}`)
sono scritte all'inglese e **non** sono state verificate in italiano. Finche'
non lo sono, nelle schede si dice di **copiarle da un formato che le ha gia'**
invece di scriverle.

## I quattro modi

Si dice **modo**, non "modalita'": `modo Usa`, `modo Trova`,
`modo Anteprima`, `modo Formato scheda`.

| Inglese | Italiano |
|---|---|
| Browse mode | **modo Usa** |
| Find mode | **modo Trova** |
| Preview mode | modo Anteprima |
| Layout mode | modo Formato scheda |

## Formati, sezioni, trigger

| Inglese | Italiano | Dove |
|---|---|---|
| layout parts | **sezioni** del formato | non "parti" |
| Part Setup | **`Formati > Imposta la Sezione`**, finestra **`Imposta sezione`** | non "Imposta parti" |
| Insert Part | **`Inserisci > Sezione`**, finestra **`Definizione della sezione`** | |
| Sub-summary | **`Riassunto parziale`** (con il *campo di separazione*) | non "Riepilogo iniziale", non "Sottoriepilogo" |
| Header / Body / Footer | `Intestazione` / `Corpo` / `Piè di pagina` | |
| Top / Bottom Navigation | `Navigazione superiore` / `Navigazione inferiore` | |
| New Layout/Report | pulsante **`Nuovo formato/resoconto`** nella barra (modo Formato scheda), oppure `File > Gestisci > Formati > Nuovo` | non "Nuovo formato/rapporto" |
| List / Form / Table View | **`Visualizza come lista`** / `come modulo` / `come tabella` | non "Vista Elenco" |
| Layout Setup | **`Impostazione formato`**, dalla barra formato in modo Formato scheda | |
| layout triggers | `Impostazione formato` > scheda **`Script trigger`** > doppio clic sull'evento | non "Formati > Imposta trigger di script" |
| object triggers | **`Formattazione > Imposta trigger di script`**, finestra `Imposta script trigger` | il menu e' **Formattazione**, non Formati |
| Conditional Formatting | **`Formattazione > Condizionale`**, finestra `Formattazione condizionale` > `Aggiungi` | non "Formato > Formattazione condizionale" |
| merge field | `Inserisci > Campo di fusione` | |
| Script Workspace | `Script > Area di lavoro script` | |
| Duplicate | `Modifica > Duplica` | |

I **modi** si scelgono dal menu `Visualizza` (o con la scorciatoia):
`Usa`, `Trova`, `Formato scheda`, `Anteprima`.

### I trigger

| Inglese | Italiano |
|---|---|
| `OnLayoutEnter` | **`SuEntrataFormato`** |
| `OnLayoutExit` | `SuUscitaFormato` |
| `OnRecordLoad` | `SuCaricamentoRecord` |
| `OnRecordCommit` | `SuSalvataggioRecord` |
| `OnObjectEnter` | `SuEntrataOggetto` |
| `OnObjectExit` | **`SuUscitaOggetto`** |
| `OnObjectSave` | **`SuSalvataggioOggetto`** |
| `OnObjectModify` | `SuModificaOggetto` |
| `OnFirstWindowOpen` | `SuAperturaPrimaFinestra` |
| `OnModeEnter` | `SuEntrataModo` |

### Tipi di campo

`Testo`, `Numero`, `Data`, `Ora`, `Indicatore data e ora`, `Contenitore`,
**`Calcolo`**, **`Riassunto`** (non "Riepilogo").

## Sicurezza e script

| Inglese | Italiano |
|---|---|
| Run script with full access privileges | tasto destro sullo script > **`Garantisci privilegi di accesso completo`** |
| Edit Privilege Set | finestra `Modifica set privilegi` |
| Records: Custom privileges | `Record` > **`Privilegi personalizzati`**, finestra `Privilegi record personalizzati` |
| View / Edit / Create / Delete | `Visualizza` / `Modifica` / `Crea` / `Elimina` |
| Yes / Limited / No | `Sì` / **`Limitati`** / `No` |
| Commit option "With dialog" | `Con finestra di dialogo` |
| Revert Record/Request | `Ripristina record` (il pulsante `Annulla Modifiche` delle schede) |
| Manage Layouts | `File > Gestisci > Formati`, finestra `Gestisci formati` |
| Get ( CurrentPrivilegeSetName ) | `Get ( NomeSetPrivilegiCorrente )` — dentro uno script con accesso completo restituisce `[Full Access]`; `Get ( NomeSetPrivilegiAccount )` resta il set vero |

## Impostazioni dell'applicazione

Su **Windows** non si chiamano "Preferenze": **`Modifica > Impostazioni`**
(su macOS `FileMaker Pro > Impostazioni`). Schede: `Generale`, `Schema`,
`Memoria`, `Plug-In`, `Host e plug-in autorizzati`.

| Scheda | Voce |
|---|---|
| Generale | `Segnala quando è disponibile un aggiornamento` |
| Generale | `Avvisami quando è disponibile un aggiornamento della versione principale` |
| Generale | `Segnala quando è disponibile una nuova versione` |
| Generale | `Mostra gli annunci dei prodotti nella finestra Home` |
| Generale | `Mostra i file aperti di recente` |
| Generale | `All'avvio, apri il file` |
| Plug-In | `Plug-In correntemente attivi`, `Visualizza cartella plug-in` |

La finestra iniziale con i file recenti si chiama **finestra Home**.
Le opzioni del singolo file stanno invece in `File > Opzioni file`, scheda
`Apri`.

## Altri termini verificati

| Inglese | Italiano |
|---|---|
| found set | **gruppo trovato** |
| Script Workspace | `Area di lavoro script` |
| conditional formatting | `Formattazione condizionale` |

## Come si e' sbagliato

Scritto per diciannove schede, e corretto tutto in una volta:

| Scritto | Giusto |
|---|---|
| `Esegui trova` | `Esegui la ricerca` |
| `Modalita' Trova` | `Passa al modo Trova` (istruzione), `modo Trova` (il modo) |
| `Modalita' Scheda` | `Passa al modo Usa` (istruzione), `modo Usa` (il modo) |
| `Imposta acquisizione errori` | `Imposta cattura errori` |
| `Ordina record` | `Ordina i record` |
| `Vai al record [ Primo ]` | `Vai a Record/Richiesta/Pagina [ Primo ]` |
| `Se [ ... ]` / `Altrimenti` / `Fine se` | `If [ ... ]` / `Else` / `End If` |
| "passo di script" | "istruzione di script" |
| "parti" del formato, `Imposta parti...` | **sezioni**, `Formati > Imposta la Sezione` |
| "Riepilogo iniziale", "Sottoriepilogo" | **Riassunto parziale** |
| campo di tipo "Riepilogo" | campo di tipo **Riassunto** |
| `Vista Elenco` | `Visualizza come lista` |
| `Nuovo formato/rapporto` | `Nuovo formato/resoconto` |
| `Formati > Imposta trigger di script` | formato: `Impostazione formato > Script trigger`; oggetto: `Formattazione > Imposta trigger di script` |
| `OnLayoutEnter`, `OnObjectSave`, `OnObjectExit` | `SuEntrataFormato`, `SuSalvataggioOggetto`, `SuUscitaOggetto` |
| `Formato > Formattazione condizionale` | `Formattazione > Condizionale` |
| `Visualizza > Modifica formato` | `Visualizza > Formato scheda` (Ctrl+L) |

La prima a cadere e' stata `Esegui trova`, segnalata da chi stava costruendo:
*"a dire il vero non e' esegui trova ma esegui ricerca"*. Tirando quel filo
sono venute fuori le altre sette.
