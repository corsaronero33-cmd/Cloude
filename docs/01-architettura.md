# Architettura

## Cosa c'e' e cosa manca

Questo primo blocco di lavoro copre il **nucleo fiscale** e il **livello
dati**: le parti su cui tutto il resto si appoggia e quelle che costa piu'
caro sbagliare. L'interfaccia utente non c'e' ancora. La scelta e'
deliberata: in un gestionale le maschere si riscrivono due volte, il motore
di calcolo dell'IVA no.

| Fatto | Dove |
| --- | --- |
| Schema dell'archivio, 39 tabelle | `Database/sql/000*.sql` |
| Aliquote, nature IVA, tipi documento, pagamenti | `Database/sql/0002_dati_base.sql` |
| Varianti, reparti RT, casse, vendite, prima nota | `Database/sql/0003_negozio.sql` |
| Aritmetica monetaria e arrotondamento | `Sources/Money.twin` |
| Motore di calcolo del documento | `Sources/CalcoloDocumento.twin` |
| Vendita al banco | `Sources/Scontrino.twin` |
| Protocollo del registratore telematico | `Sources/RtEpsonXml.twin`, `Sources/Rt.twin` |
| Fattura elettronica | `Sources/FatturaPaXml.twin`, `Sources/FatturaElettronica.twin` |
| Scadenzario | `Sources/CalcoloScadenze.twin` |
| Magazzino e prima nota | `Sources/Magazzino.twin`, `Sources/PrimaNota.twin` |
| Accesso ai dati, pensato per la LAN | `Sources/Database.twin` |
| Numerazione sicura in multiutenza | `Sources/Numeratore.twin` |
| Versioni dello schema | `Sources/Migrator.twin` |
| Password degli utenti | `Sources/Crypto.twin` |
| Impostazioni della postazione | `Sources/AppConfig.twin` |
| Test, oltre 400 asserzioni | `Sources/*Tests.twin` |

Quello che manca e il perche' di quest'ordine stanno in
[04-roadmap.md](04-roadmap.md).

## I livelli

```
        maschere (ancora da fare)
                  |
        repository (ancora da fare)
                  |
   +--------------+--------------+
   |                             |
dominio                     infrastruttura
CalcoloDocumento            Database
Scontrino                   Migrator
CalcoloScadenze             Numeratore
RigaCalcolo                 Magazzino
RiepilogoIva                PrimaNota
PagamentoScontrino          AppConfig
Scadenza                    Crypto
Costanti                    Money
RtEpsonXml                  Rt
FatturaPaXml                FatturaElettronica
XmlBuilder                  AdoConst
```

`RtEpsonXml` e `FatturaPaXml` stanno fra i moduli di dominio e non fra
quelli di infrastruttura, e non e' una svista: costruiscono e leggono
testo, non aprono connessioni ne' archivi. Il trasporto verso la stampante
e' `Rt`, la lettura dell'archivio e' `FatturaElettronica`. La divisione
serve a poter provare i due protocolli senza il registratore sul tavolo e
senza un documento in archivio, che e' la condizione normale mentre si
scrive il programma.

La regola che tiene in piedi la cosa e' una sola: **il dominio non conosce
l'archivio**. `CalcoloDocumento` non sa che esiste Access, non apre
connessioni, non legge tabelle. Gli si passano righe e impostazioni e
risponde con i totali.

Il vantaggio e' pratico, non teorico. La suite di test del motore fiscale
gira in mezzo secondo premendo F5, senza un file `.accdb`, senza ACE
installato, senza una cartella condivisa. Quando fra sei mesi ci sara' da
cambiare la regola del bollo, la verifica sara' immediata. E se un giorno
l'archivio Access diventera' stretto, il dominio non si accorgera' del
cambio.

## La lingua degli identificatori

Due registri, e la divisione e' voluta:

* **inglese per l'infrastruttura**: `Money`, `Database`, `Migrator`,
  `AppConfig`, `Crypto`, `OpenRecordset`, `RoundHalfUp`. Sono concetti da
  programmatori e la convenzione del repository e' quella.
* **italiano per il dominio fiscale**: `Imponibile`, `Imposta`,
  `NaturaIva`, `RiepilogoIva`, `ScontoPiedePerc`, `CassaPrevidenziale`,
  `Scadenza`. Questi termini hanno un significato legale preciso e
  corrispondono uno a uno alle colonne dell'archivio e ai campi della
  fattura elettronica. Tradurre `imponibile` in `taxableAmount`
  aggiungerebbe un passaggio mentale a ogni riga letta, con l'XML della
  fattura aperto accanto.

I commenti sono in italiano senza lettere accentate, come il resto del
repository: `utilita'`, `piu'`, `e'`. I sorgenti restano ASCII e si aprono
uguali con qualunque editor e qualunque tabella codici.

## Il denaro

Il punto su cui si decide se un gestionale e' credibile.

`Double` non va bene per gli importi: 0,1 non esiste in binario, e
`Round()` di VB arrotonda al pari, quindi 2,5 diventa 2 mentre la prassi
commerciale italiana vuole 3. Una fattura che sbaglia un centesimo e' una
fattura da rifare.

La regola, tutta dentro `Money.twin`:

* gli importi sono `Currency`, che e' un intero scalato a 4 decimali,
  quindi esatto;
* i conti intermedi passano per `Variant`/`Decimal` a 28 cifre, dove
  `22/100` fa esattamente `0,22`;
* l'arrotondamento e' commerciale, lo 0,5 va lontano dallo zero;
* quantita' e percentuali restano `Double`, dove l'errore non arriva al
  risultato arrotondato.

Tutte le conversioni passano da `Money.Dec`. Se un domani `Decimal` dovesse
dare problemi su qualche versione di twinBASIC, c'e' un punto solo da
cambiare.

## L'ordine dei calcoli in un documento

Non e' arbitrario, e cambiarlo cambia i totali:

1. **imponibile di riga**: sconti in cascata sul prezzo unitario *non
   arrotondato*, poi la quantita', poi arrotondamento a 2 decimali.
   Arrotondare prima il prezzo scontato perde centesimi sulle quantita'
   grandi.
2. **sconto in piede** ripartito riga per riga, non sottratto in fondo.
   Sottraendolo in fondo la somma delle righe non torna piu' con il
   riepilogo IVA, e la differenza salta fuori quando il cliente contesta la
   fattura.
3. **cassa previdenziale** sulle righe che la prevedono.
4. **spese** di trasporto, incasso, imballo.
5. **riepilogo** per coppia aliquota piu' natura, con l'imposta arrotondata
   **una volta sola sul totale del rigo** e non riga per riga. Tre righe da
   0,33 al 22% fanno 0,22 di imposta, non 0,21: e' la regola che fa
   quadrare il riepilogo con quello che si aspetta lo SDI.
6. **bollo, ritenuta, totali**.

Il test `CalcoloDocumentoTests.TestArrotondamentoRiepilogo` esiste proprio
per inchiodare il punto 5.

## Due metodi con due caratteri

`CalcoloDocumento` espone due verbi che si comportano in modo opposto, e la
differenza e' sostanziale:

* **`Calcola`** non si lamenta mai dei dati. Viene chiamato a ogni tasto
  premuto nella maschera del documento, quindi deve sopportare righe appena
  nate e campi ancora vuoti.
* **`Validazione`** elenca tutto quello che non va e restituisce una
  collezione di messaggi. Si chiama prima di confermare o di trasmettere,
  dove essere severi conviene.

Un motore che solleva un errore a ogni riga incompleta rende l'interfaccia
inutilizzabile; un motore che non controlla niente manda allo SDI file che
vengono scartati. Servono entrambi, separati.

## L'archivio

Access va benissimo per cinque o sette postazioni, a patto di rispettare
poche regole: una connessione per postazione tenuta aperta, blocco a
livello di record, recordset di lettura scollegati, query sempre con
parametri, transazioni corte. Sono tutte dentro `Database.twin`, cosi' il
resto dell'applicazione non ha modo di violarle. Il dettaglio operativo,
installazione di ACE compresa, sta in
[03-access-in-rete.md](03-access-in-rete.md).

Il punto davvero delicato e' la **numerazione dei documenti**, che in
`Numeratore.twin` non passa da `SELECT MAX(Numero) + 1` ma da un `UPDATE`
su una tabella di contatori dentro una transazione. Il perche' e' spiegato
nell'intestazione di quel file: si riduce a "fra una lettura e una
scrittura separate c'e' sempre il tempo perche' un'altra postazione faccia
la stessa lettura".

## Quando lasciare Access

Vale la pena sapere in anticipo dove sta il muro, cosi' non ci si arriva di
sorpresa:

* oltre le **10 postazioni** contemporanee la contesa sui blocchi comincia
  a farsi sentire;
* oltre i **500 MB - 1 GB** di file il compattamento diventa lento e il
  rischio di corruzione cresce;
* una **VPN o un Wi-Fi instabile** non si risolvono: ACE legge il file a
  blocchi, una disconnessione a meta' di una scrittura corrompe l'archivio.
  Con sedi remote serve un desktop remoto, oppure un vero server di
  database.

La migrazione naturale e' SQL Server Express, che e' gratuito fino a 10 GB.
Lo schema e' stato scritto per quel giorno: nessuna clausola `DEFAULT`
(i valori predefiniti li mette l'applicazione), nessuna query Access,
nessuna macro, nessun campo calcolato. Cambierebbero `Database.twin` e la
stringa di connessione, non il dominio.
