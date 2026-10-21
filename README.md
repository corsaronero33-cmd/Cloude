# Gestionale

Gestionale per **negozi** in stile Danea Easyfatt, scritto in
**twinBASIC** con archivio **Microsoft Access**, per una rete locale con
cinque o sette postazioni. Pensato per alimentari, ferramenta,
abbigliamento, calzature: vendita al banco con **registratore telematico**,
magazzino con varianti taglia e colore, documenti di clienti e fornitori,
prima nota di cassa, fattura elettronica.

Oggi nel repository c'e' il **nucleo fiscale, il livello dati, la vendita
al banco, il driver del registratore e la fattura elettronica**. Le maschere non ci sono ancora, e
la scelta e' deliberata: in un gestionale le finestre si riscrivono due
volte, il motore di calcolo dell'IVA no. La strada da qui in avanti sta in
[docs/04-roadmap.md](docs/04-roadmap.md).

Tutto il nucleo e' coperto da test che girano **senza archivio, senza
registratore collegato e senza rete**: premere F5 e in mezzo secondo si sa
se i conti tornano e se i due XML, quello della stampante fiscale e quello
per lo SDI, sono quelli giusti.

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
| `Sources/Scontrino.twin` | Vendita al banco: prezzi di scaffale, pagamenti multipli, resto |
| `Sources/PagamentoScontrino.twin` | Una forma di pagamento |
| `Sources/Costanti.twin` | Valori di dominio condivisi |

### Fattura elettronica

| File | Ruolo |
| --- | --- |
| `Sources/FatturaPaXml.twin` | Genera l'XML FatturaPA 1.2: funzioni pure, provabili senza archivio |
| `Sources/FatturaElettronica.twin` | Legge il documento, scrive il file, aggiorna lo stato |
| `Sources/DatiFatturaElettronica.twin` | Tutto quello che serve per scrivere un XML |
| `Sources/SoggettoFE.twin` | Cedente o cessionario |
| `Sources/XmlBuilder.twin` | XML indentato, con protezione dei caratteri |

### Registratore telematico

| File | Ruolo |
| --- | --- |
| `Sources/RtEpsonXml.twin` | Protocollo XML Epson: funzioni pure, provabili senza stampante |
| `Sources/Rt.twin` | Trasporto HTTP e registratore simulato |
| `Sources/RtEsito.twin` | Risposta del registratore |

### Infrastruttura

| File | Ruolo |
| --- | --- |
| `Sources/Database.twin` | Accesso ad Access via ADO, con le regole della multiutenza applicate |
| `Sources/Magazzino.twin` | Movimenti e giacenze, ricostruibili e con giacenza a una data |
| `Sources/PrimaNota.twin` | Cassa e banca, con il segno nella causale |
| `Sources/Numeratore.twin` | Progressivi dei documenti senza buchi e senza collisioni |
| `Sources/Migrator.twin` | Versioni dello schema |
| `Sources/AppConfig.twin` | Impostazioni della postazione, in un file INI |
| `Sources/Crypto.twin` | Hash delle password con sale e iterazioni |
| `Sources/AdoConst.twin` | Costanti ADO per il late binding |

### Archivio

| File | Ruolo |
| --- | --- |
| `Database/sql/0001_schema.sql` | Le 20 tabelle del ciclo documenti |
| `Database/sql/0002_dati_base.sql` | Aliquote, nature IVA, tipi documento, pagamenti, unita' di misura |
| `Database/sql/0003_negozio.sql` | Varianti, codici a barre, reparti, casse, vendite, chiusure, prima nota, inventari |
| `Database/sql/0004_dati_negozio.sql` | Taglie, colori, reparti RT, causali, conti cassa, prima cassa simulata |
| `Database/sql/0005_fattura_elettronica.sql` | Codici di ritenuta e cassa sul documento, registro degli invii |
| `Database/Tools/CreaDatabase.vbs` | Crea l'archivio e applica le migrazioni dal prompt |

### Test e utilita'

| File | Ruolo |
| --- | --- |
| `Sources/MoneyTests.twin` | Arrotondamenti, sconti, scorpori, lettura degli importi |
| `Sources/CalcoloDocumentoTests.twin` | Quattordici gruppi di casi presi da fatture vere |
| `Sources/CalcoloScadenzeTests.twin` | Rate, fine mese, quadratura |
| `Sources/ScontrinoTests.twin` | Scorporo, pagamenti misti, resto, sconti, resi |
| `Sources/RtEpsonXmlTests.twin` | L'XML uscente e la lettura della risposta |
| `Sources/FatturaPaXmlTests.twin` | Ordine degli elementi, destinatario, ritenuta, bollo, validazione |
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
| [05-negozio-e-rt.md](docs/05-negozio-e-rt.md) | Il flusso di cassa, varianti, reparti, il driver del registratore, l'arrotondamento con i prezzi IVA inclusa |
| [06-fattura-elettronica.md](docs/06-fattura-elettronica.md) | Le tre cose su cui lo SDI e' inflessibile, il progressivo di invio, un esempio di XML completo |

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

Asserzioni superate: 406 su 406
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

Cassa - scontrino di esempio
----------------------------
PANE-CAS    Pane casereccio                     1,000       3,50        3,50
VINO-ROS    Vino rosso Montepulciano            2,000       6,00       12,00
SCARPA-42   Scarpa pelle nera 42                1,000      80,91       80,91

Riepilogo IVA
  IVA 4 per cento                 3,37        0,13        3,50
  IVA 22 per cento               76,16       16,75       92,91

Totale imponibile..... 79,53
Totale imposta........ 16,88
Totale scontrino...... 96,41
Bancomat.............. 90,00
Contanti.............. 10,00
Pagato................ 100,00
Resto................. 3,59

Validazione: nessun rilievo, lo scontrino si puo' battere.

XML per il registratore 908 caratteri
Righe di vendita...... 3
Totali di pagamento... 2
Separatore decimale... punto, corretto

Fattura elettronica - IT01234567890_00042.xml
---------------------------------------------
Validazione: nessun rilievo, il file e' trasmettibile.

<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica versione="FPR12" xmlns:p="http://ivaservizi...">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente>
        <IdPaese>IT</IdPaese>
        <IdCodice>01234567890</IdCodice>
      </IdTrasmittente>
      <ProgressivoInvio>00042</ProgressivoInvio>
      ...
```

L'XML viene stampato per intero: qui sopra e' tagliato, quello completo e'
in [06-fattura-elettronica.md](docs/06-fattura-elettronica.md).

Due numeri valgono la pena di essere guardati.

La **scarpa a 80,91**: il prezzo di listino e' 89,90 e lo sconto del dieci
per cento farebbe 80,91 esatti, ma su un prezzo come 9,99 farebbe 8,991. Lo
sconto si arrotonda subito sul prezzo unitario perche' il registratore
ricalcola quantita' per prezzo unitario, e i due conti devono combaciare al
centesimo.

Il **riepilogo dello scontrino**, dove 3,37 piu' 0,13 fa 3,50 e 76,16 piu'
16,75 fa 92,91: i prezzi di scaffale tornano esatti perche' con l'IVA
inclusa l'imposta si ricava per differenza e non si ricalcola. Il perche'
sta in [05-negozio-e-rt.md](docs/05-negozio-e-rt.md).

I separatori di migliaia e dei decimali sono quelli delle impostazioni di
Windows, quindi su una macchina italiana vengono cosi'. Dentro l'XML per il
registratore il separatore e' sempre il punto, qualunque sia la lingua
della postazione: una virgola la' farebbe rifiutare il comando.
