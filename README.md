# Cloude

Gestionale per fatturazione, in sviluppo. Applicazione desktop Windows.

Stato attuale: c'e' il motore di calcolo dei documenti, i controlli formali,
il database con le migrazioni e la gestione anagrafica clienti.
Non c'e' ancora la fattura a video, la stampa PDF ne' il file XML per il
Sistema di Interscambio.

## Cosa serve per lavorarci

1. **Visual Studio 2022 Community** (gratuito) — durante l'installazione
   spunta il carico di lavoro **"Sviluppo di applicazioni desktop .NET"**.
   E' quello che porta con se' il designer visuale delle finestre.
2. **.NET 10 SDK** — di norma arriva con Visual Studio. Verifica con
   `dotnet --version` da prompt: deve rispondere `10.something`.
3. **Git** — per scaricare e salvare il codice.

Poi apri `Cloude.sln` con Visual Studio e premi F5.

## Come e' organizzato

```
Cloude.sln
├─ src/
│  ├─ Cloude.Nucleo/     Strutture dati, calcoli, controlli. Nessuna dipendenza.
│  ├─ Cloude.Dati/       Database SQLite, SQL scritto a mano, migrazioni.
│  ├─ Cloude.App/        Le finestre (WinForms). Solo Windows.
│  └─ Cloude.Demo/       Programma di prova da riga di comando.
├─ test/Cloude.Test/     Test automatici (42).
└─ db/                   Script SQL dello schema, numerati.
```

La divisione non e' un vezzo: **Cloude.Nucleo e Cloude.Dati non sanno niente
delle finestre**. Serve per due motivi pratici.

Il primo e' che si possono collaudare da soli, senza aprire nessuna finestra e
senza cliccare: i 42 test girano in mezzo secondo e dicono subito se un calcolo
si e' rotto. Provare a mano le stesse combinazioni di aliquote richiederebbe
mezz'ora ogni volta.

Il secondo e' che il giorno in cui servisse una versione web o un'app, il
motore e' gia' pronto e si riscrive solo la parte a video, che e' la meta'
meno complicata.

## Comandi utili

```bash
dotnet build                              # compila tutto
dotnet test                               # esegue i test
dotnet run --project src/Cloude.Demo      # prova il motore senza finestre
```

`Cloude.Demo` crea un database temporaneo, ci mette un cliente e una fattura
con quattro aliquote diverse, e stampa il documento con il riepilogo IVA.
E' il modo piu' rapido per vedere se il motore funziona.

## Dove finiscono i dati

Il database e' un unico file:

```
%APPDATA%\Cloude\cloude.db
```

cioe' `C:\Users\<tuonome>\AppData\Roaming\Cloude\cloude.db`.
La copia di sicurezza e' la copia di quel file.

Non sta accanto al programma di proposito: da Windows Vista in poi la cartella
`Program Files` e' di sola lettura per gli utenti non amministratori, e un
programma che ci scrive dentro va in errore sul PC del cliente.

## Cosa manca, in ordine

1. Finestra articoli (uguale a quella clienti, gia' fatta come modello)
2. Finestra fattura con la griglia delle righe e i totali in tempo reale
3. Stampa PDF del documento
4. Generazione del file XML FatturaPA e validazione contro lo schema XSD
5. Invio al Sistema di Interscambio tramite intermediario e ricezione ricevute
6. Magazzino, DDT, preventivi
7. Scadenzario

## Convenzioni

Il codice segue uno stile procedurale deliberato, non a oggetti.
Le regole stanno in [CLAUDE.md](CLAUDE.md): leggilo prima di aggiungere roba.
