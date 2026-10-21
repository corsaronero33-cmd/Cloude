# Schema dei dati

Venti tabelle in `Database/sql/0001_schema.sql`. Questa pagina spiega
**perche'** sono fatte cosi'; i tipi esatti delle colonne stanno nel file
SQL, che e' la fonte unica.

## Convenzioni

* Chiave primaria sempre `Id COUNTER`, cioe' contatore automatico. Niente
  chiavi naturali come chiave primaria: una partita IVA sbagliata in fase
  di caricamento si corregge, un codice usato come chiave primaria no.
* Il codice visibile all'utente (`Codice`) e' una colonna a parte con un
  indice unico.
* Gli importi sono `CURRENCY`, le quantita' e le percentuali `DOUBLE`.
* **Nessuna clausola `DEFAULT`.** I valori predefiniti li mette
  l'applicazione. Costa qualche riga in piu' nel livello dati e rende lo
  schema portabile verso SQL Server o PostgreSQL senza riscritture.
* Le tabelle che gli utenti modificano a mano hanno `Revisione`,
  `ModificatoIl`, `ModificatoDa`: il controllo di concorrenza ottimistico
  si appoggia al contatore `Revisione` (`UPDATE ... WHERE Id = ? AND
  Revisione = ?`, zero righe interessate significa che qualcun altro ha
  salvato prima).

## Anagrafiche

**`Soggetti`** tiene clienti e fornitori insieme, distinti dalla colonna
`Tipo`: `C` cliente, `F` fornitore, `E` entrambi. Lo stesso soggetto spesso
e' tutti e due e duplicarlo in due tabelle costa solo fatica: due indirizzi
da aggiornare, due saldi da riconciliare.

Oltre all'indirizzo c'e' la **destinazione diversa** (`Dest*`), per chi
fattura in sede e consegna altrove, e `CodiceDestinatario`, il codice a 7
caratteri dello SDI.

`IdPagamento`, `IdListino`, `ScontoPredefinito` e `IdAliquotaForzata` sono
i valori che il documento erediteta' quando si seleziona il cliente.
`IdAliquotaForzata` serve ai clienti che per legge non pagano l'IVA, dove
l'aliquota dell'articolo va ignorata.

**`Articoli`** ha `Giacenza` denormalizzata. E' una cache: la verita' sta in
`MovimentiMagazzino` e la procedura di ricalcolo e' il riferimento. La
colonna esiste per non sommare i movimenti a ogni ricerca, non per essere
creduta sulla parola.

`PrezzoIvato` dice se `PrezzoVendita` comprende l'IVA. Serve a chi vende al
pubblico e ragiona sul prezzo di scaffale.

## Aliquote e nature IVA

**`AliquoteIva`** descrive sia le aliquote con imposta sia i casi senza. Una
riga con `Percentuale = 0` e `Natura` valorizzata (`N1`..`N7`) e'
un'operazione senza imposta: esente, non soggetta, non imponibile,
inversione contabile. `Natura` vuota significa imposta dovuta.

`Natura` e `RiferimentoNormativo` finiscono tali e quali nel blocco
`DatiRiepilogo` della fattura elettronica: una riga sbagliata qui diventa un
file scartato dallo SDI. Le righe precaricate in `0002_dati_base.sql` sono
un punto di partenza, **da completare in base all'attivita' reale**.

`ConcorreAlBollo` marca le operazioni che contano per la soglia dei 77,47
euro oltre la quale scatta il bollo da 2 euro. Il motore di calcolo
considera rilevante una riga anche solo in base alla natura, quindi una
spunta dimenticata non fa sparire il bollo.

## Documenti

**`TipiDocumento`** evita una cascata di `If` sulla sigla del documento. Tre
colonne con il segno decidono il comportamento:

| Colonna | Significato |
| --- | --- |
| `Verso` | `+1` ciclo attivo (vendite), `-1` ciclo passivo (acquisti), `0` interno |
| `SegnoMagazzino` | `-1` scarica, `+1` carica, `0` nessun effetto |
| `SegnoContabile` | `+1` fattura, `-1` nota di credito, `0` non fiscale |

Una nota di credito a cliente e' `Verso +1`, `SegnoMagazzino +1` (il reso
rientra), `SegnoContabile -1`. Un preventivo e' `+1, 0, 0`. Aggiungere un
tipo di documento e' una riga in tabella, non una modifica al codice.

`TipoDocumentoFE` porta il codice della fattura elettronica: `TD01`
fattura, `TD04` nota di credito, `TD24` fattura differita.

**`Documenti`** conserva una **copia congelata** dei dati anagrafici del
soggetto nelle colonne `Intestazione*`. Se domani il cliente cambia
indirizzo o ragione sociale, le fatture dell'anno scorso non devono
cambiare con lui: quella e' la fattura che e' stata emessa, ed e' quella che
va ristampata identica fra cinque anni.

Nella testata ci sono anche le voci che non appartengono a nessuna riga:
sconto in piede, spese di trasporto, incasso e imballo, bollo, cassa
previdenziale, ritenuta d'acconto, scissione dei pagamenti. I quattro
totali (`TotaleImponibile`, `TotaleImposta`, `TotaleDocumento`,
`TotaleDaPagare`) sono scritti, non ricalcolati a ogni lettura: un
documento confermato non deve cambiare importo perche' il motore di calcolo
e' stato aggiornato.

**`DocumentiRighe`** distingue quattro tipi in `TipoRiga`: `A` articolo con
quantita' e prezzo, `D` descrizione libera che non entra nei conti, `S`
sconto o maggiorazione a valore, `T` totale parziale di sola stampa. Anche
qui il codice e la descrizione dell'articolo sono copiati nella riga, per
la stessa ragione dell'intestazione.

**`DocumentiRiepilogoIva`** e' ridondante rispetto alle righe, ed e' voluto.
Il riepilogo stampato e quello trasmesso allo SDI devono restare identici
anche se un domani il motore di calcolo cambia una regola di
arrotondamento. Una riga per coppia aliquota piu' natura, piu'
`Esigibilita` (`I` immediata, `D` differita, `S` scissione dei pagamenti).

**`Numeratori`** tiene un contatore per tipo, serie e anno, con indice
unico sulla terna. E' l'unico punto in cui due postazioni possono davvero
pestarsi i piedi, e il perche' e' spiegato in
[03-access-in-rete.md](03-access-in-rete.md).

## Scadenze e magazzino

**`Scadenze`** e' una riga per rata, con `ImportoPagato` separato da
`Importo` per gestire gli incassi parziali. L'indice su
`(DataScadenza, Pagata)` e' quello che serve allo scadenzario, che e' una
delle due interrogazioni piu' frequenti di un gestionale.

**`MovimentiMagazzino`** e' la partita doppia del magazzino: ogni variazione
di giacenza e' una riga, con `Segno +1` per i carichi e `-1` per gli
scarichi, e il riferimento al documento e alla riga che l'ha generata. Da
qui si ricostruisce la giacenza a qualunque data, che e' quello che chiede
il commercialista a fine anno.

## Servizio

**`Parametri`** e' la configurazione condivisa fra le postazioni, chiave e
valore. Contiene `SchemaVersion`, che e' la versione dello schema applicata
e la gestisce il `Migrator`: non va modificata a mano.

Le impostazioni della singola postazione (percorso dell'archivio, nome
della postazione) stanno invece nel file `Gestionale.ini` accanto
all'eseguibile, perche' servono **prima** di poter aprire l'archivio.

**`Utenti`** tiene `HashPassword`, `Salt` e `Iterazioni` separati. Il
numero di iterazioni e' salvato accanto all'hash cosi' si puo' alzare in
futuro senza invalidare le password esistenti. L'algoritmo e' scritto per
esteso nell'intestazione di `Sources/Crypto.twin`.

**`LogAttivita`** traccia chi ha emesso, modificato o annullato un
documento. Con sette utenti su una cartella condivisa, sapere chi ha fatto
cosa vale il costo di una riga in piu'.

**`Sessioni`** dice chi e' collegato in questo momento: serve per avvisare
prima di una manutenzione e per capire chi tiene aperto l'archivio quando
il file di lock non si libera.

## Migrazioni

Le modifiche allo schema sono file numerati in `Database/sql`, nella forma
`NNNN_descrizione.sql`. Il numero e' la versione. `Migrator.Apply` applica
solo i file con numero maggiore di `SchemaVersion`, in ordine crescente, e
aggiorna la versione dopo ogni file completato.

Formato dei file: una istruzione per volta terminata da punto e virgola a
fine riga, righe di commento che iniziano con `--`, nessun punto e virgola
dentro le istruzioni (lo splitter li taglierebbe a meta'), solo caratteri
ASCII.

In Access il DDL **non e' transazionale**: un file che si interrompe a
meta' lascia lo schema a meta'. Per questo si fa una copia del `.accdb`
prima di aggiornare uno schema in produzione. Il messaggio di errore dice
quale istruzione si e' fermata e perche'.
