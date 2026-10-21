# Roadmap

Il gestionale e' rivolto a **negozi** (alimentari, ferramenta, abbigliamento,
calzature e simili), su rete locale con cinque o sette postazioni. Quello
che c'e' oggi e' il nucleo fiscale, il livello dati, la vendita al banco e
il driver del registratore telematico. Manca l'interfaccia utente.

## Fatto

**Nucleo fiscale** (nessuna dipendenza da Access, tutto coperto da test)

* Aritmetica monetaria esatta e arrotondamento commerciale.
* Motore di calcolo del documento: sconti in cascata e in piede, prezzi
  ivati con scorporo, riepilogo per aliquota e natura, bollo virtuale,
  cassa previdenziale, ritenuta d'acconto, scissione dei pagamenti.
* Imposta ricavata per differenza sui prezzi IVA inclusa, cosi' il totale
  torna al prezzo di scaffale. Il perche' sta in
  [05-negozio-e-rt.md](05-negozio-e-rt.md).
* Vendita al banco: prezzi di scaffale, pagamenti multipli per
  macro-categoria, resto solo dai contanti, resi.
* Scadenzario con rate, fine mese e quadratura garantita.
* Validazione dei documenti e degli scontrini, separata dal calcolo.

**Registratore telematico**

* Protocollo XML Epson (FP-81II, FP-90III e derivati) in un modulo di
  funzioni pure, con test che girano senza stampante.
* Trasporto HTTP e registratore simulato, che scrive su file e permette di
  sviluppare tutto il resto senza hardware.
* Lettura della risposta con estrazione dei numeri fiscali e traduzione
  degli errori in messaggi mostrabili a chi sta servendo un cliente.

**Fattura elettronica**

* Generazione dell'XML FatturaPA 1.2 (FPR12 e FPA12) in un modulo di
  funzioni pure, con test che girano senza archivio.
* Ordine degli elementi secondo lo schema, numeri sempre col punto,
  elementi opzionali omessi invece che vuoti: le tre cause della quasi
  totalita' degli scarti.
* Lettura del documento dall'archivio con confronto fra i totali
  ricalcolati e quelli salvati: un documento che non coincide non si
  trasmette, si riconferma.
* Progressivo di invio univoco con lo stesso schema del numeratore,
  scrittura in UTF-8, registro degli invii.
* Validazione dei dati prima della generazione.

**Archivio e infrastruttura**

* 39 tabelle con migrazioni versionate.
* Varianti taglia e colore, codici a barre multipli con moltiplicatore,
  reparti RT, casse, vendite, chiusure fiscali, prima nota, inventari.
* Accesso ai dati con parametri, recordset scollegati, transazioni corte e
  ripetizione automatica sui conflitti di blocco.
* Numerazione dei documenti sicura in multiutenza.
* Magazzino: movimenti da documenti e da vendite, giacenze ricostruibili,
  giacenza a una data, sottoscorta.
* Prima nota con il segno nella causale e incasso automatico dalla
  chiusura di cassa.
* Hash delle password con sale per utente e 25.000 iterazioni.

## 1. La maschera di cassa

E' la prima da fare, perche' e' quella che si usa tutto il giorno e perche'
tutto il resto del negozio le gira intorno.

Serve: lettura del codice a barre che trova articolo o variante in
`ArticoliCodici` applicando il moltiplicatore, griglia delle righe,
totale e resto aggiornati a ogni tasto, finestra dei pagamenti, stampa sul
registratore, salvataggio con il numero restituito, scarico di magazzino.

Due cose da non sbagliare: il **fuoco deve restare sul campo del codice**
(chi sta in cassa non usa il mouse), e la gestione del caso in cui la
stampante non risponde.

Qui si decide anche la griglia, che e' il pezzo piu' impegnativo di tutta
l'interfaccia. Le strade sono tre: il `ListView` di Windows (nessuna
dipendenza, compila a 32 e 64 bit, l'editing in cella va costruito), un
controllo ActiveX tipo VSFlexGrid (pronto ma da registrare su ogni
postazione, e problematico a 64 bit), oppure una griglia disegnata a mano
(controllo totale, piu' lavoro). La prima e' la piu' sensata per un
programma che deve girare su sette postazioni per dieci anni.

## 2. Repository e maschere delle anagrafiche

Il livello che manca fra il dominio e le maschere: una classe per entita'
che traduce fra righe di archivio e oggetti, applica i valori predefiniti e
gestisce `Revisione` per la concorrenza ottimistica.

Poi le maschere di articoli (con la griglia delle varianti, che per un
negozio di scarpe e' la schermata piu' usata dopo la cassa), clienti e
fornitori.

## 3. Chiusura di cassa

Chiusura fiscale sul registratore, lettura dei totali, riga in
`ChiusureFiscali` con i totali per macro-categoria e per reparto, incasso
automatico in prima nota, stampa del riepilogo giornaliero.

Da qui esce anche il controllo che serve dal 2026: i totali dei pagamenti
elettronici devono combaciare con quelli del POS collegato al registratore.

## 4. Documenti fornitori e clienti

Carico da fornitore con aggiornamento dei prezzi di acquisto, DDT, fatture.
Il motore di calcolo c'e' gia' tutto: serve la maschera e il repository.
L'evasione da documento a documento ha gia' il suo campo
(`IdDocumentoOrigine`).

## 5. Fattura elettronica: completare

Il generatore c'e' (vedere [06-fattura-elettronica.md](06-fattura-elettronica.md)).
Restano quattro cose, e la prima e' una decisione:

* **il canale di trasmissione.** Tramite intermediario (Aruba, il
  commercialista) e' la strada normale: il gestionale deposita l'XML in una
  cartella condivisa. L'invio diretto allo SDI richiede accreditamento e
  firma digitale, e vale la pena solo se l'accreditamento c'e' gia'.
* **validazione contro lo schema XSD** prima dell'invio, e lettura delle
  notifiche di esito. Finche' non e' stata provata una trasmissione vera
  sul canale di prova, il generatore non e' collaudato.
* **il bollo addebitato**, che oggi esce solo in `DatiBollo`: quando viene
  addebitato al cliente andrebbe anche come riga con natura `N1`.
* **la fattura da scontrino**, che per un negozio e' il caso piu'
  frequente: il cliente che chiede la fattura dopo aver pagato in cassa.
  La tabella `Documenti` ha gia' `IdVenditaOrigine`.

## 6. Stampa e PDF

Senza stampa il gestionale non si usa. Da valutare in questo ordine:
disegno diretto sull'oggetto `Printer` (nessuna dipendenza, piu' lavoro per
modulo), un motore di report di terze parti (una licenza e una dipendenza),
generazione di HTML e stampa dal browser (la via piu' rapida a un PDF
decente). Serve comunque un meccanismo di modelli modificabili: ogni
azienda vuole il suo logo.

## 7. Inventario e utenti

Maschera di inventario con conteggio su piu' giorni e piu' postazioni,
confronto con la giacenza di sistema, rettifiche generate solo alla
conferma. Le tabelle ci sono.

Maschera di accesso, cambio password, ruoli con i controlli nei punti che
contano: modificare una vendita stampata, cambiare i prezzi, vedere i
costi, fare la chiusura. `Crypto.twin` e la tabella `Utenti` sono pronti.

## Cose piccole che migliorano la vita

* **Altre marche di registratore**: RCH, Ditron, Custom, Olivetti. Il modo
  di aggiungerle e' descritto in [05-negozio-e-rt.md](05-negozio-e-rt.md).
* **Lotti e scadenze** per gli alimentari: oggi non ci sono.
* **Scadenze fuori agosto**: molte aziende le spostano a settembre. Sarebbe
  un parametro in piu' sulla condizione di pagamento.
* **Terzo asse di variante**, per chi ne ha bisogno.
* **Omaggi con rivalsa IVA**: oggi un omaggio azzera l'imponibile.
* **Registro delle attivita'**: la tabella `LogAttivita` c'e', va riempita.
* **Avviso di manutenzione**: la tabella `Sessioni` c'e', serve il ping
  periodico e la finestra che chiede a tutti di uscire.
