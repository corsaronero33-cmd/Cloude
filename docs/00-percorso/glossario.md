# Glossario: da FileMaker a C# / PostgreSQL

Tabella di traduzione da consultare quando incontri un termine nuovo. Non e'
da imparare a memoria: e' da tenere aperta.

## Il cambio di mentalita' piu' importante

In FileMaker **un solo file** contiene i dati, le maschere, gli script e le
relazioni. Qui sono **tre cose separate**, che vivono in posti diversi:

| | Dove sta | Cosa contiene |
| --- | --- | --- |
| **I dati** | PostgreSQL, sul PC "server" del negozio | tabelle e righe |
| **La logica** | una libreria C# (`Cassa.Core`) | calcoli, regole, driver RT |
| **L'interfaccia** | un programma WinForms (`Cassa.App`) | finestre e bottoni |

Il motivo e' pratico: con i dati su un server vero il multiutente funziona
senza corrompere niente, e con la logica separata dall'interfaccia si possono
scrivere i test e, un domani, cambiare l'interfaccia senza riscrivere i
calcoli.

## Concetti

| FileMaker | Qui | Nota |
| --- | --- | --- |
| Tabella | Tabella (nel DB) / classe (nel codice) | due rappresentazioni della stessa cosa |
| Campo | Colonna (nel DB) / proprieta' (nel codice) | |
| Record | Riga (nel DB) / oggetto (nel codice) | |
| Relazione fra tabelle | Chiave esterna + `JOIN` | la relazione non e' "disegnata", si scrive nella query |
| Campo calcolato | Proprieta' calcolata | vedi `RigaVendita.Imponibile` |
| Script | Metodo (o funzione) | |
| Passo di script | Istruzione | |
| Variabile `$locale` | Variabile locale | vive dentro il metodo |
| Variabile `$$globale` | Campo della classe | vive quanto l'oggetto |
| `Imposta campo [...]` | Assegnazione con `=` | |
| Layout | Form (finestra) WinForms | si disegna trascinando, come un layout |
| Portale | `DataGridView` | la griglia che mostra tante righe |
| Modalita' Trova | `WHERE` in SQL | |
| Ordina record | `ORDER BY` in SQL | |
| Script trigger | Evento (`Click`, `TextChanged`) | |
| Lista valori | Sorgente dati di una `ComboBox` | |
| FileMaker Server | PostgreSQL | |
| Privilegi di accesso | Utenti e permessi, gestiti da noi nel programma | |

## Termini nuovi che non hanno un equivalente FileMaker

| Termine | Cosa significa, in una riga |
| --- | --- |
| **Compilare** | tradurre il codice che scrivi in un programma eseguibile; se c'e' un errore di scrittura, lo scopri **adesso** e non davanti al cliente |
| **Tipo** (`decimal`, `string`, `int`) | il genere di dato che una variabile puo' contenere; dichiararlo serve a far controllare al compilatore che non si sommino mele con date |
| **`decimal`** | il tipo per i soldi: conta in centesimi esatti. Mai usare `double` per gli importi |
| **Classe** | lo stampo; descrive com'e' fatta una cosa (una riga di vendita, un articolo) |
| **Oggetto / istanza** | un esemplare concreto fatto con quello stampo |
| **Metodo** | uno script che appartiene a una classe |
| **Proprieta'** | un campo di una classe, eventualmente calcolato |
| **`namespace`** | la cartella logica in cui stanno le classi, per non avere nomi che si scontrano |
| **Eccezione** | un errore che interrompe l'esecuzione; si intercetta con `try` / `catch` |
| **Test automatico** | un pezzo di codice che verifica un altro pezzo di codice e dice "ok" o "sbagliato" in mezzo secondo |
| **Git / commit** | lo storico del progetto: ogni salvataggio importante resta, e si puo' tornare indietro |
| **Migrazione** | un'istruzione che aggiorna la struttura del database; serve per aggiornare i PC dei clienti gia' installati |
| **EF Core** | il traduttore fra le classi C# e le tabelle PostgreSQL, cosi' non scrivi SQL per le operazioni banali |
| **Breakpoint** | un segnalibro nel codice: l'esecuzione si ferma la' e puoi guardare il valore di ogni variabile |

## Sigle del dominio

| Sigla | Significato |
| --- | --- |
| **RT** | Registratore Telematico: la cassa fiscale certificata che stampa lo scontrino e trasmette i corrispettivi |
| **Documento commerciale** | il nome corretto dello "scontrino" dal 2020 |
| **Chiusura Z** | la chiusura fiscale di giornata dell'RT |
| **SdI** | Sistema di Interscambio: il canale dell'Agenzia delle Entrate per le fatture elettroniche |
| **FatturaPA** | il formato XML della fattura elettronica |
| **PEM / PEL** | Punto di Emissione / Punto di Elaborazione: l'architettura della futura soluzione software certificata al posto dell'RT hardware |
| **Scorporo** | ricavare l'imponibile da un prezzo che ha l'IVA gia' dentro |
