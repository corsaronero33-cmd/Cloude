# Il negozio e il registratore telematico

Lo schema iniziale era tagliato sul ciclo documenti. Un negozio ha un
flusso diverso e prevalente: si vende al banco, si batte lo scontrino sul
registratore telematico, a fine giornata si chiude la cassa. Le fatture
restano, ma non sono piu' il centro.

## Il flusso di una vendita

```
  lettura del codice a barre
            |
      riga sullo scontrino        Scontrino.AggiungiArticolo
            |
     totali e resto, a ogni tasto Scontrino.Calcola
            |
        validazione               Scontrino.Validazione
            |
   STAMPA sul registratore        Rt.StampaVendita     <-- crea il corrispettivo
            |
    salvataggio in archivio       con il numero che la stampante ha dato
            |
    movimenti di magazzino        Magazzino.MuoviDaVendita
```

**L'ordine non e' negoziabile: prima si stampa, poi si salva.** E' la stampa
che crea il corrispettivo agli occhi dell'Agenzia delle Entrate, e il
numero del documento commerciale lo decide la stampante, non il gestionale.
Se la stampa fallisce non c'e' niente da salvare. Se il salvataggio
fallisce dopo una stampa riuscita, il corrispettivo esiste comunque: per
quel caso la tabella `Vendite` ha la colonna `StampataRt`, e una vendita
non stampata non va corretta a mano, va ribattuta o annullata.

## Varianti: taglia e colore

Abbigliamento e calzature non vendono "una scarpa": vendono il modello 1234
nero numero 42, che ha una sua giacenza e un suo codice a barre. Senza
varianti il magazzino di un negozio di scarpe non sta in piedi.

* `VariantiTipi` sono gli assi: `TAGLIA`, `COLORE`.
* `VariantiValori` sono i valori di un asse. La colonna `Posizione` tiene
  l'ordine giusto, che per le taglie non e' quello alfabetico: la S viene
  prima della M e la 38 prima della 40.
* `ArticoliVarianti` e' una riga per combinazione effettivamente trattata,
  con **la giacenza vera**. `Articoli.Giacenza`, per un articolo con
  varianti, e' solo la somma.

Due assi coprono il caso reale di qualunque negozio. Se un domani servisse
un terzo, si aggiunge `IdValore3` alla tabella e alle query, senza toccare
il resto.

## Codici a barre multipli

In ferramenta e negli alimentari lo stesso articolo ha il codice del pezzo,
quello del cartone e quello del fornitore. `ArticoliCodici` ne tiene quanti
servono, con un indice unico sul codice: una lettura in cassa trova sempre
una riga sola.

`Moltiplicatore` e' il dettaglio che fa la differenza: un EAN di cartone da
dodici, letto in cassa, deve scaricare dodici pezzi e non uno.

## Reparti

Il registratore telematico ragiona per reparto numerato, e ogni reparto ha
la sua aliquota. La tabella `Reparti` tiene la corrispondenza, e **i numeri
devono combaciare con quelli configurati nella stampante**: un reparto con
l'aliquota sbagliata manda all'Agenzia delle Entrate corrispettivi
sbagliati, e non c'e' modo di accorgersene guardando lo scontrino.

L'articolo porta il suo reparto in `Articoli.IdReparto`. Se manca,
`Scontrino` usa `RepartoPredefinito` e `Validazione` segnala la riga: e' il
tipo di cosa che e' meglio vedere prima di battere.

## Pagamenti

L'Agenzia delle Entrate vuole i pagamenti in tre macro-categorie:
**contanti** (assegno compreso), **elettronico** (carta, bancomat,
bonifico) e **non riscosso**. Il gestionale ne tiene una quarta, i **buoni
pasto**, perche' in un negozio alimentare si contano a parte.

Il dettaglio leggibile ("Bancomat", "Ticket Edenred") sta in
`VenditePagamenti.Descrizione` ed e' quello che si stampa; la categoria sta
in `Tipo` ed e' quella che finisce nei totali della chiusura.

**Il resto esce solo dai contanti.** Un bancomat da trenta euro su una
spesa da venti non esiste, e un registratore che se lo vede arrivare stampa
un corrispettivo sbagliato. `Scontrino.Validazione` lo blocca.

### Il collegamento con il POS

Dal 1 gennaio 2026 il registratore telematico e lo strumento di pagamento
elettronico devono essere collegati. Il collegamento e' **logico, non
fisico**: si configura sul portale "Fatture e Corrispettivi" dell'Agenzia
delle Entrate, e i dati dei pagamenti elettronici vengono trasmessi
aggregati con la chiusura giornaliera nel tracciato Corrispettivi.

Per il gestionale questo significa una cosa sola, ma importante: i totali
per macro-categoria della chiusura devono essere giusti, perche' sono
quelli che vengono confrontati con i dati del POS. Per questo
`ChiusureFiscali` tiene `TotaleContanti`, `TotaleElettronico`,
`TotaleNonRiscosso` e `TotaleBuoniPasto` separati, e non un totale solo.

## L'arrotondamento, con i prezzi IVA inclusa

Questo e' il punto in cui un gestionale per negozi si distingue da uno di
fatturazione adattato, e vale la pena capirlo.

Con i prezzi netti, l'imposta e' l'imponibile per l'aliquota, arrotondato;
il totale e' imponibile piu' imposta ed e' esatto per costruzione.

Con i prezzi di scaffale non funziona. Tre pezzi da 0,99 al 22 per cento
fanno **2,97** allo scaffale. Scorporando: 2,97 diviso 1,22 fa 2,4344, che
arrotondato e' 2,43; e 2,43 al 22 per cento fa 0,5346, che arrotondato e'
0,53. Sommati: **2,96**. Un centesimo in meno. E non c'e' nessuna coppia di
valori arrotondati che sommi a 2,97: con 2,44 di imponibile viene 2,98.

La regola giusta e' ricavare l'imposta **per differenza**: imponibile 2,43,
imposta 2,97 meno 2,43 cioe' 0,54, totale 2,97. E' quello che fa
`CalcoloDocumento` quando `PrezziIvati` e' attivo.

Conta perche' il cliente ha letto 2,97 sull'etichetta, e perche' il
registratore telematico stampa la somma dei prezzi di scaffale: se il
gestionale dicesse 2,96, sarebbe il gestionale a essere sbagliato. Il test
`ScontrinoTests.TestQuadraturaScorporo` tiene ferma la regola.

Per la stessa ragione **lo sconto di riga si arrotonda subito sul prezzo
unitario**: il registratore ricalcola quantita' per prezzo unitario, e se
il gestionale tenesse 80,910 dove la stampante vede 80,91, i due conti
divergerebbero sulle quantita' alte.

## Il driver del registratore

Due file, e la divisione e' il punto:

| File | Cosa fa | Dipendenze |
| --- | --- | --- |
| `RtEpsonXml.twin` | Costruisce l'XML e legge la risposta | **nessuna** |
| `Rt.twin` | Trasporto: POST HTTP, oppure simulazione su file | MSXML |

`RtEpsonXml` e' un modulo di funzioni pure, e per questo ha una suite di
test che gira **senza stampante collegata**. E' la condizione normale
mentre si scrive il programma, e un protocollo che si puo' provare solo con
l'hardware sul tavolo e' un protocollo che non si prova.

Il dialogo e' XML su HTTP verso

```
http://<indirizzo>/cgi-bin/fpmate.cgi?devid=local_printer&timeout=<ms>
```

con corpo SOAP e `Content-Type: text/xml`. Vale per i modelli RT Epson
recenti (FP-81II, FP-90III e derivati) con firmware che espone `fpmate`.

### Tre cose da verificare sul manuale

I nomi dei comandi e la struttura sono stabili, ma tre dettagli cambiano
fra modelli e versioni di firmware. Sono raccolti nelle costanti in testa a
`RtEpsonXml`, cosi' si correggono in un punto solo:

1. **i codici `paymentType` di `printRecTotal`.** Qui sono 0 contanti, 2
   elettronico, 3 ticket, 5 non riscosso, secondo la guida Epson. La guida
   stessa avverte che il significato del 2 e' stato reinterpretato.
2. **`adjustmentType` di `printRecItemAdjustment`**, usato per lo sconto a
   valore su una riga.
3. **la lunghezza massima delle descrizioni**, qui 38 caratteri.

### L'errore da non fare

`unitPrice` e' il prezzo **unitario**, non il totale della riga: la
stampante moltiplica da sola per la quantita'. Mandarci il totale di riga
produce scontrini corretti solo quando la quantita' e' uno, quindi passa i
collaudi e sbaglia in produzione. E' l'errore piu' comune nelle
integrazioni con le stampanti fiscali, e c'e' un test dedicato a
impedirlo.

### Il registratore simulato

`TipoRt` a `simulato` non e' un ripiego: e' il modo in cui si sviluppa il
resto del programma. Scrive su file lo stesso XML che manderebbe alla
stampante e risponde con numeri plausibili, cosi' la cassa si puo' provare
per intero senza hardware. La cassa precaricata in archivio nasce con
questo tipo; quando arriva il registratore vero si cambiano `TipoRt`,
`IndirizzoRt` e `PortaRt` sulla riga di `Casse`.

I progressivi del simulato ripartono da zero a ogni avvio, di proposito:
non sono numeri fiscali e non devono sembrarlo.

### Aggiungere una marca

RCH, Ditron, Custom e Olivetti parlano protocolli diversi, alcuni su
seriale. Aggiungere una marca vuol dire aggiungere un modulo `RtMarcaXml`
con le sue funzioni pure e un ramo in `Rt.Invia`. Il resto
dell'applicazione non cambia: chiede `StampaVendita` e guarda l'esito.

## Chiusura di cassa e prima nota

La chiusura fiscale giornaliera (la Z) azzera i totali della stampante e
trasmette i corrispettivi. Il gestionale ne conserva una riga in
`ChiusureFiscali` con i totali per macro-categoria e per reparto.

Da li' nasce la riga di prima nota: `PrimaNota.RegistraIncassoChiusura`
registra **solo i contanti**, perche' il bancomat arriva sul conto in banca
per altra strada e i buoni pasto non sono denaro in cassa. La funzione
controlla se la chiusura e' gia' stata registrata e in quel caso non fa
niente: si puo' richiamare senza paura di doppioni.

La prima nota e' volutamente semplice: un movimento, un conto, una causale,
un importo. Non e' contabilita' in partita doppia e non vuole esserlo. Due
scelte evitano la meta' degli errori di registrazione:

* **il segno sta nella causale**, non nella testa di chi registra. Si
  digita sempre un importo positivo e si scegle "Pagamento fornitore"
  oppure "Incasso vendite". Non esiste il caso dell'uscita registrata in
  entrata.
* **ogni riga automatica porta il riferimento** a quello che l'ha generata.
  Da li' si capisce se un incasso e' gia' stato registrato, che e' la
  domanda da cui nascono i doppioni.

## Magazzino

La giacenza vera e' la somma dei movimenti. `Articoli.Giacenza` e
`ArticoliVarianti.Giacenza` sono una cache, tenuta aggiornata per non
sommare mezzo milione di righe a ogni ricerca, e ricostruibile con
`Magazzino.RicalcolaTutte`. Se la cache e la somma divergono, ha ragione la
somma.

Non e' pignoleria: a fine anno il commercialista chiede la giacenza **a una
data**, e quella si ottiene solo dai movimenti. Un gestionale che tiene
solo il numero corrente non sa rispondere.

I movimenti nascono alla **conferma** di un documento o di una vendita, non
al salvataggio della bozza. `MuoviDaDocumento` e `MuoviDaVendita`
cancellano prima i movimenti di quel documento e li rigenerano: confermare
due volte non raddoppia lo scarico, e l'operazione si puo' ripetere dopo un
errore.

Il verso viene da `TipiDocumento.SegnoMagazzino`, quindi aggiungere un tipo
di documento e' una riga in tabella e non una modifica al codice. Una riga
con quantita' negativa dentro una fattura (un reso) ribalta il verso del
suo movimento.

## Fonti

* [Epson ePOS Fiscal Print Solution Development Guide](https://download4.epson.biz/sec_pubs/bs/pdf/ePOS%20Fiscal%20Print%20Solution%20Development%20Guide%20Rev%20T.pdf) - comandi, attributi e codici di pagamento
* [Epson Fiscal Printer Intelligent Features Guide](https://download4.epson.biz/sec_pubs/bs/pdf/Fiscal%20Printer%20Intelligent%20Features%20Guide%20Rev%20J.pdf) - endpoint `fpmate.cgi` e requisiti di firmware
* [Agenzia delle Entrate - chiarimenti sui registratori telematici](https://www.agenziaentrate.gov.it/portale/documents/20143/288260/Precisazioni+mod+registratori+telematici_Chiarimenti+e+precisazioni+su+RT.pdf/79d9700f-1f06-36c2-e2bb-dd6cdeae8d9b) - macro-categorie di pagamento del documento commerciale
