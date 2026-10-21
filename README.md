# Gestionale

Gestionale di fatturazione e magazzino in stile Danea Easyfatt, scritto in
**twinBASIC** con archivio **Microsoft Access**, per una rete locale con
cinque o sette postazioni.

Oggi nel repository c'e' il **nucleo fiscale e il livello dati**: schema
dell'archivio, motore di calcolo dei documenti, scadenzario, accesso ai
dati pensato per la multiutenza, numerazione sicura dei documenti. Le
maschere non ci sono ancora, e la scelta e' deliberata: in un gestionale le
finestre si riscrivono due volte, il motore di calcolo dell'IVA no. La
strada da qui in avanti sta in [docs/04-roadmap.md](docs/04-roadmap.md).

Il nucleo fiscale e' coperto da test che girano **senza archivio**: premere
F5 e in mezzo secondo si sa se i conti tornano.

## Contenuto

### Dominio fiscale

| File | Ruolo |
| --- | --- |
| `Sources/Money.twin` | Aritmetica monetaria esatta, arrotondamento commerciale, sconti, scorporo IVA |
| `Sources/CalcoloDocumento.twin` | Totali, riepilogo IVA, bollo, cassa previdenziale, ritenuta, validazione |
| `Sources/RigaCalcolo.twin` | Una riga di documento in ingresso al motore |
| `Sources/RiepilogoIva.twin` | Un rigo del riepilogo per aliquota e natura |
| `Sources/CalcoloScadenze.twin` | Dalle condizioni di pagamento alle rate |
| `Sources/Scadenza.twin` | Una rata |
| `Sources/Costanti.twin` | Valori di dominio condivisi |

### Infrastruttura

| File | Ruolo |
| --- | --- |
| `Sources/Database.twin` | Accesso ad Access via ADO, con le regole della multiutenza applicate |
| `Sources/Numeratore.twin` | Progressivi dei documenti senza buchi e senza collisioni |
| `Sources/Migrator.twin` | Versioni dello schema |
| `Sources/AppConfig.twin` | Impostazioni della postazione, in un file INI |
| `Sources/Crypto.twin` | Hash delle password con sale e iterazioni |
| `Sources/AdoConst.twin` | Costanti ADO per il late binding |

### Archivio

| File | Ruolo |
| --- | --- |
| `Database/sql/0001_schema.sql` | Le 20 tabelle |
| `Database/sql/0002_dati_base.sql` | Aliquote, nature IVA, tipi documento, pagamenti, unita' di misura |
| `Database/Tools/CreaDatabase.vbs` | Crea l'archivio e applica le migrazioni dal prompt |

### Test e utilita'

| File | Ruolo |
| --- | --- |
| `Sources/MoneyTests.twin` | Arrotondamenti, sconti, scorpori, lettura degli importi |
| `Sources/CalcoloDocumentoTests.twin` | Quattordici gruppi di casi presi da fatture vere |
| `Sources/CalcoloScadenzeTests.twin` | Rate, fine mese, quadratura |
| `Sources/StringUtils.twin` | Libreria di utilita' per stringhe |
| `Sources/StringUtilsTests.twin` | Suite di test della libreria |
| `Sources/TestRunner.twin` | Micro framework di test, circa cento righe |
| `Sources/ConsoleOut.twin` | Output verso la finestra Debug e verso stdout |
| `Sources/App.twin` | `Sub Main`: esegue i test e poi emette una fattura di esempio |

## Documentazione

| Pagina | Contenuto |
| --- | --- |
| [01-architettura.md](docs/01-architettura.md) | I livelli, la lingua degli identificatori, perche' gli importi non sono Double, l'ordine dei calcoli, quando lasciare Access |
| [02-schema-dati.md](docs/02-schema-dati.md) | Le tabelle e il perche' di ogni scelta |
| [03-access-in-rete.md](docs/03-access-in-rete.md) | ACE e architettura, le cinque regole della multiutenza, backup, cosa non si risolve |
| [04-roadmap.md](docs/04-roadmap.md) | Cosa manca, in che ordine e perche' |

## Come aprirlo nell'IDE

Il file di progetto `.twinproj` e' un contenitore binario, non un file di
testo, quindi in questo repository non c'e' e non va scritto a mano. Si
parte da un progetto vuoto:

1. Nell'IDE twinBASIC creare un nuovo progetto (Console Application oppure
   Standard EXE).
2. Aggiungere i file di `Sources/` con **Add existing file**, oppure
   trascinarli nella finestra del progetto.
3. Impostare `App` come *Startup Object* nelle impostazioni del progetto.
4. Premere F5.

Per il controllo di versione a valle, twinBASIC distribuisce lo strumento
`impexp` (in versione Python e Node.js) che esporta e reimporta un
`.twinproj` come albero di cartelle. Le radici che genera sono `Sources`,
`Settings` e `Resources`: la cartella `Sources/` di questo repository e'
gia' nella posizione giusta perche' i file vengano ripresi da un import.

**Architettura della compilazione.** Il livello dati parla con ACE, il
motore di database di Access, che esiste a 32 e a 64 bit. L'eseguibile e
ACE devono combaciare. Con un parco macchine misto conviene compilare
**win32**: gira anche su Windows a 64 bit. Il dettaglio sta in
[03-access-in-rete.md](docs/03-access-in-rete.md).

Il nucleo fiscale e i test, invece, non hanno bisogno di niente: ne' ACE,
ne' un archivio, ne' una rete.

## Preparare l'archivio

Una volta sola, dal server o da una postazione:

```
cscript //nologo Database\Tools\CreaDatabase.vbs \\SERVER\Gestionale\Dati\Gestionale.accdb
```

Poi, accanto all'eseguibile, un `Gestionale.ini`:

```ini
[Archivio]
Percorso=\\SERVER\Gestionale\Dati\Gestionale.accdb

[Postazione]
Nome=UFFICIO1
```

Il percorso va in forma UNC, non come lettera di unita' mappata: le lettere
cambiano da postazione a postazione.

L'utente `admin` nasce **senza password**, cosi' non resta in giro una
password predefinita che nessuno cambia.

## Cosa stampa un F5

```
Gestionale - suite di test
--------------------------

Asserzioni superate: 219 su 219
Esito: TUTTO OK

Fattura di esempio del 18/03/2026
---------------------------------
TAST-MEC    Tastiera meccanica                    10,00      40,50      405,00
MON-24      Monitor 24 pollici                     2,00     189,00      378,00
SERV-INST   Installazione e configurazione         1,00     150,00      150,00
RIMB-TRAS   Rimborso spese di trasferta            1,00      80,00       80,00

Riepilogo IVA
  IVA 22 per cento                        936,00      205,92
  Natura N1 - senza imposta                80,00        0,00

Totale merce.......... 1.058,00
Sconti................ 45,00
Totale imponibile..... 1.016,00
Totale imposta........ 205,92
Bollo................. 2,00
Totale documento...... 1.223,92
Netto a pagare........ 1.223,92

Scadenze - RiBa 30 giorni fine mese
  Rata 1 - 30/04/2026 - 1.223,92

Validazione: nessun rilievo, il documento e' emettibile.
```

I separatori di migliaia e dei decimali sono quelli delle impostazioni di
Windows, quindi su una macchina italiana vengono cosi'. Le 219 asserzioni
sono quelle delle quattro suite oggi nel repository.
