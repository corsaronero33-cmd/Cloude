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

## I quattro modi

Si dice **modo**, non "modalita'": `modo Usa`, `modo Trova`,
`modo Anteprima`, `modo Formato scheda`.

| Inglese | Italiano |
|---|---|
| Browse mode | **modo Usa** |
| Find mode | **modo Trova** |
| Preview mode | modo Anteprima |
| Layout mode | modo Formato scheda |

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

La prima a cadere e' stata `Esegui trova`, segnalata da chi stava costruendo:
*"a dire il vero non e' esegui trova ma esegui ricerca"*. Tirando quel filo
sono venute fuori le altre sette.
