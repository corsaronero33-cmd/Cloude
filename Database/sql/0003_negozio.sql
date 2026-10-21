-- ---------------------------------------------------------------------------
-- 0003_negozio.sql - vendita al banco, registratore telematico, varianti,
--                    prima nota, inventario.
--
-- Lo schema iniziale era tagliato sul ciclo documenti. Un negozio ha un
-- flusso diverso e prevalente: si vende al banco, si batte lo scontrino sul
-- registratore telematico, a fine giornata si chiude la cassa. Le fatture
-- restano, ma non sono piu' il centro.
--
-- Quattro aggiunte che cambiano il modo di lavorare:
--
--  * VARIANTI. Abbigliamento e calzature non vendono "una scarpa": vendono
--    il modello 1234 nero numero 42, che ha una sua giacenza e un suo
--    codice a barre. Senza varianti il magazzino di un negozio di scarpe
--    non sta in piedi.
--  * CODICI MULTIPLI. In ferramenta e negli alimentari lo stesso articolo
--    ha il codice a barre del pezzo, quello della confezione e quello del
--    fornitore. Una colonna sola non basta.
--  * REPARTI. Il registratore telematico ragiona per reparto numerato, e
--    ogni reparto ha la sua aliquota. La corrispondenza fra articolo e
--    reparto va in archivio, non nella testa di chi batte.
--  * PAGAMENTI MULTIPLI. Allo scontrino si paga in contanti piu' bancomat
--    piu' buono pasto, e l'Agenzia delle Entrate vuole i totali per
--    macro-categoria alla chiusura giornaliera.
-- ---------------------------------------------------------------------------

-- Assi di variante: TAGLIA, COLORE, e quello che serve.
CREATE TABLE VariantiTipi (
    Id COUNTER,
    Codice TEXT(15) NOT NULL,
    Descrizione TEXT(40) NOT NULL,
    Posizione LONG NOT NULL,
    Attivo YESNO,
    CONSTRAINT PK_VariantiTipi PRIMARY KEY (Id)
);

CREATE UNIQUE INDEX UX_VariantiTipi_Codice ON VariantiTipi (Codice);

-- Valori possibili di un asse: TAGLIA/42, COLORE/NERO. Posizione tiene
-- l'ordine di presentazione, che per le taglie non e' quello alfabetico:
-- la S viene prima della M, e la 38 prima della 40.
CREATE TABLE VariantiValori (
    Id COUNTER,
    IdTipo LONG NOT NULL,
    Codice TEXT(15) NOT NULL,
    Descrizione TEXT(40) NOT NULL,
    Posizione LONG NOT NULL,
    Attivo YESNO,
    CONSTRAINT PK_VariantiValori PRIMARY KEY (Id),
    CONSTRAINT FK_VariantiValori_Tipi FOREIGN KEY (IdTipo) REFERENCES VariantiTipi (Id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX UX_VariantiValori ON VariantiValori (IdTipo, Codice);

-- Una riga per combinazione effettivamente trattata. Due assi coprono il
-- caso reale di qualunque negozio (taglia piu' colore); se un domani ne
-- servisse un terzo, si aggiunge IdValore3 qui e nelle query, senza
-- toccare il resto.
--
-- La giacenza della variante e' quella vera. Articoli.Giacenza, per un
-- articolo con varianti, e' solo la somma.
CREATE TABLE ArticoliVarianti (
    Id COUNTER,
    IdArticolo LONG NOT NULL,
    IdValore1 LONG,
    IdValore2 LONG,
    Codice TEXT(30) NOT NULL,
    CodiceBarre TEXT(20),
    Giacenza DOUBLE,
    ScortaMinima DOUBLE,
    PrezzoVendita CURRENCY,
    Ubicazione TEXT(20),
    Attiva YESNO,
    CONSTRAINT PK_ArticoliVarianti PRIMARY KEY (Id),
    CONSTRAINT FK_ArticoliVarianti_Articoli FOREIGN KEY (IdArticolo) REFERENCES Articoli (Id) ON DELETE CASCADE,
    CONSTRAINT FK_ArticoliVarianti_Valore1 FOREIGN KEY (IdValore1) REFERENCES VariantiValori (Id),
    CONSTRAINT FK_ArticoliVarianti_Valore2 FOREIGN KEY (IdValore2) REFERENCES VariantiValori (Id)
);

CREATE UNIQUE INDEX UX_ArticoliVarianti_Codice ON ArticoliVarianti (Codice);
CREATE UNIQUE INDEX UX_ArticoliVarianti_Combinazione ON ArticoliVarianti (IdArticolo, IdValore1, IdValore2);
CREATE INDEX IX_ArticoliVarianti_Barre ON ArticoliVarianti (CodiceBarre);

-- Codici a barre e codici alternativi. Un articolo o una sua variante
-- possono averne quanti servono: il pezzo, la confezione da sei, il codice
-- del fornitore, il vecchio codice da prima del cambio gestionale.
-- Moltiplicatore serve per i codici di confezione: un EAN di cartone da 12
-- letto in cassa deve scaricare 12 pezzi.
CREATE TABLE ArticoliCodici (
    Id COUNTER,
    IdArticolo LONG NOT NULL,
    IdVariante LONG,
    Codice TEXT(30) NOT NULL,
    Tipo TEXT(12) NOT NULL,
    Descrizione TEXT(40),
    Moltiplicatore DOUBLE NOT NULL,
    Principale YESNO,
    CONSTRAINT PK_ArticoliCodici PRIMARY KEY (Id),
    CONSTRAINT FK_ArticoliCodici_Articoli FOREIGN KEY (IdArticolo) REFERENCES Articoli (Id) ON DELETE CASCADE,
    CONSTRAINT FK_ArticoliCodici_Varianti FOREIGN KEY (IdVariante) REFERENCES ArticoliVarianti (Id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX UX_ArticoliCodici_Codice ON ArticoliCodici (Codice);
CREATE INDEX IX_ArticoliCodici_Articolo ON ArticoliCodici (IdArticolo);

-- Reparti del registratore telematico. Il numero e' quello configurato
-- nella stampante fiscale e deve combaciare: un reparto con l'aliquota
-- sbagliata manda all'Agenzia delle Entrate corrispettivi sbagliati.
CREATE TABLE Reparti (
    Id COUNTER,
    Numero LONG NOT NULL,
    Descrizione TEXT(40) NOT NULL,
    IdAliquotaIva LONG NOT NULL,
    Attivo YESNO,
    CONSTRAINT PK_Reparti PRIMARY KEY (Id),
    CONSTRAINT FK_Reparti_Aliquote FOREIGN KEY (IdAliquotaIva) REFERENCES AliquoteIva (Id)
);

CREATE UNIQUE INDEX UX_Reparti_Numero ON Reparti (Numero);

-- Una riga per postazione di cassa, con la configurazione del suo
-- registratore. TipoRt decide quale driver usare: 'epson', 'simulato' e
-- quelli che si aggiungeranno.
CREATE TABLE Casse (
    Id COUNTER,
    Codice TEXT(10) NOT NULL,
    Descrizione TEXT(60) NOT NULL,
    Postazione TEXT(40),
    TipoRt TEXT(15) NOT NULL,
    IndirizzoRt TEXT(60),
    PortaRt LONG,
    TimeoutRtMs LONG,
    MatricolaRt TEXT(30),
    IdContoCassa LONG,
    Attiva YESNO,
    CONSTRAINT PK_Casse PRIMARY KEY (Id),
    CONSTRAINT UX_Casse_Codice UNIQUE (Codice)
);

-- Vendite al banco. Il documento commerciale emesso dal registratore.
-- NumeroDocumento e NumeroChiusura sono quelli restituiti dalla
-- stampante: sono loro il riferimento fiscale, non l'Id di questa tabella.
--
-- StampataRt distingue le vendite che il registratore ha davvero emesso da
-- quelle rimaste in sospeso per un guasto. Una vendita non stampata non e'
-- un corrispettivo: va ribattuta o annullata, non corretta a mano.
CREATE TABLE Vendite (
    Id COUNTER,
    IdCassa LONG NOT NULL,
    TipoVendita TEXT(12) NOT NULL,
    DataVendita DATETIME NOT NULL,
    NumeroDocumento TEXT(20),
    NumeroChiusura LONG,
    IdSoggetto LONG,
    Operatore TEXT(32),
    TotaleImponibile CURRENCY,
    TotaleImposta CURRENCY,
    TotaleDocumento CURRENCY,
    TotaleSconti CURRENCY,
    TotalePagato CURRENCY,
    Resto CURRENCY,
    Stato TEXT(12) NOT NULL,
    StampataRt YESNO,
    ErroreRt TEXT(255),
    IdVenditaOrigine LONG,
    IdDocumento LONG,
    CodiceLotteria TEXT(20),
    Note TEXT(255),
    CreatoIl DATETIME,
    CreatoDa TEXT(32),
    CONSTRAINT PK_Vendite PRIMARY KEY (Id),
    CONSTRAINT FK_Vendite_Casse FOREIGN KEY (IdCassa) REFERENCES Casse (Id),
    CONSTRAINT FK_Vendite_Soggetti FOREIGN KEY (IdSoggetto) REFERENCES Soggetti (Id)
);

CREATE INDEX IX_Vendite_Data ON Vendite (DataVendita);
CREATE INDEX IX_Vendite_Cassa ON Vendite (IdCassa, DataVendita);
CREATE INDEX IX_Vendite_Chiusura ON Vendite (NumeroChiusura);
CREATE INDEX IX_Vendite_Stato ON Vendite (Stato, StampataRt);

-- I prezzi delle righe di vendita sono sempre comprensivi di IVA: in
-- negozio si ragiona sul prezzo di scaffale. L'imponibile si ottiene per
-- scorporo e lo calcola Scontrino, non si digita.
CREATE TABLE VenditeRighe (
    Id COUNTER,
    IdVendita LONG NOT NULL,
    Posizione LONG NOT NULL,
    IdArticolo LONG,
    IdVariante LONG,
    CodiceArticolo TEXT(30),
    CodiceLetto TEXT(30),
    Descrizione TEXT(255) NOT NULL,
    SiglaUnitaMisura TEXT(5),
    Quantita DOUBLE,
    PrezzoUnitario CURRENCY,
    ScontoPerc DOUBLE,
    ScontoImporto CURRENCY,
    IdReparto LONG,
    NumeroReparto LONG,
    PercentualeIva DOUBLE,
    NaturaIva TEXT(6),
    Imponibile CURRENCY,
    Imposta CURRENCY,
    Totale CURRENCY,
    Resa YESNO,
    CONSTRAINT PK_VenditeRighe PRIMARY KEY (Id),
    CONSTRAINT FK_VenditeRighe_Vendite FOREIGN KEY (IdVendita) REFERENCES Vendite (Id) ON DELETE CASCADE,
    CONSTRAINT FK_VenditeRighe_Articoli FOREIGN KEY (IdArticolo) REFERENCES Articoli (Id),
    CONSTRAINT FK_VenditeRighe_Varianti FOREIGN KEY (IdVariante) REFERENCES ArticoliVarianti (Id),
    CONSTRAINT FK_VenditeRighe_Reparti FOREIGN KEY (IdReparto) REFERENCES Reparti (Id)
);

CREATE UNIQUE INDEX UX_VenditeRighe_Pos ON VenditeRighe (IdVendita, Posizione);

-- Pagamenti di una vendita, uno per forma usata. Tipo e' la
-- macro-categoria che chiede l'Agenzia delle Entrate: 'contanti' (assegno
-- compreso), 'elettronico' (carta, bancomat, bonifico), 'nonriscosso',
-- 'buonopasto'. Il dettaglio leggibile sta in Descrizione, il codice che
-- vuole il registratore in CodiceRt.
CREATE TABLE VenditePagamenti (
    Id COUNTER,
    IdVendita LONG NOT NULL,
    Posizione LONG NOT NULL,
    Tipo TEXT(14) NOT NULL,
    Descrizione TEXT(40),
    Importo CURRENCY NOT NULL,
    CodiceRt LONG,
    IdContoCassa LONG,
    CONSTRAINT PK_VenditePagamenti PRIMARY KEY (Id),
    CONSTRAINT FK_VenditePagamenti_Vendite FOREIGN KEY (IdVendita) REFERENCES Vendite (Id) ON DELETE CASCADE
);

CREATE INDEX IX_VenditePagamenti_Vendita ON VenditePagamenti (IdVendita);

-- Chiusura fiscale giornaliera, una per cassa e per giorno. I totali per
-- macro-categoria di pagamento sono quelli che dal 2026 vanno confrontati
-- con i dati dei pagamenti elettronici collegati al registratore.
CREATE TABLE ChiusureFiscali (
    Id COUNTER,
    IdCassa LONG NOT NULL,
    DataChiusura DATETIME NOT NULL,
    NumeroChiusura LONG NOT NULL,
    TotaleCorrispettivi CURRENCY,
    TotaleImponibile CURRENCY,
    TotaleImposta CURRENCY,
    TotaleContanti CURRENCY,
    TotaleElettronico CURRENCY,
    TotaleNonRiscosso CURRENCY,
    TotaleBuoniPasto CURRENCY,
    TotaleResi CURRENCY,
    NumeroDocumenti LONG,
    NumeroResi LONG,
    TrasmessaAde YESNO,
    EsitoTrasmissione TEXT(60),
    Note TEXT(255),
    CreatoIl DATETIME,
    CreatoDa TEXT(32),
    CONSTRAINT PK_ChiusureFiscali PRIMARY KEY (Id),
    CONSTRAINT FK_ChiusureFiscali_Casse FOREIGN KEY (IdCassa) REFERENCES Casse (Id)
);

CREATE UNIQUE INDEX UX_ChiusureFiscali ON ChiusureFiscali (IdCassa, NumeroChiusura);
CREATE INDEX IX_ChiusureFiscali_Data ON ChiusureFiscali (DataChiusura);

CREATE TABLE ChiusureReparti (
    Id COUNTER,
    IdChiusura LONG NOT NULL,
    IdReparto LONG NOT NULL,
    PercentualeIva DOUBLE,
    Imponibile CURRENCY,
    Imposta CURRENCY,
    Totale CURRENCY,
    CONSTRAINT PK_ChiusureReparti PRIMARY KEY (Id),
    CONSTRAINT FK_ChiusureReparti_Chiusure FOREIGN KEY (IdChiusura) REFERENCES ChiusureFiscali (Id) ON DELETE CASCADE,
    CONSTRAINT FK_ChiusureReparti_Reparti FOREIGN KEY (IdReparto) REFERENCES Reparti (Id)
);

CREATE INDEX IX_ChiusureReparti_Chiusura ON ChiusureReparti (IdChiusura);

-- Conti su cui si muove il denaro: la cassa del negozio, la seconda cassa,
-- il conto in banca. La prima nota registra i movimenti su questi conti.
CREATE TABLE ContiCassa (
    Id COUNTER,
    Codice TEXT(10) NOT NULL,
    Descrizione TEXT(60) NOT NULL,
    Tipo TEXT(10) NOT NULL,
    SaldoIniziale CURRENCY,
    DataSaldoIniziale DATETIME,
    Iban TEXT(34),
    Attivo YESNO,
    CONSTRAINT PK_ContiCassa PRIMARY KEY (Id),
    CONSTRAINT UX_ContiCassa_Codice UNIQUE (Codice)
);

-- Causali della prima nota. Segno +1 entrata, -1 uscita: il segno sta
-- nella causale, cosi' chi registra scrive sempre importi positivi e non
-- c'e' modo di sbagliare il verso.
CREATE TABLE CausaliPrimaNota (
    Id COUNTER,
    Codice TEXT(10) NOT NULL,
    Descrizione TEXT(60) NOT NULL,
    Segno SMALLINT NOT NULL,
    Automatica YESNO,
    Attiva YESNO,
    CONSTRAINT PK_CausaliPrimaNota PRIMARY KEY (Id),
    CONSTRAINT UX_CausaliPrimaNota_Codice UNIQUE (Codice)
);

-- Prima nota di cassa. Volutamente semplice: un movimento, un conto, una
-- causale, un importo. Non e' contabilita' in partita doppia e non vuole
-- esserlo: serve a sapere quanto c'e' in cassa e perche'.
--
-- I riferimenti a vendita, documento e scadenza servono a non registrare
-- due volte lo stesso incasso: una riga generata dalla chiusura di cassa
-- porta l'Id della chiusura.
CREATE TABLE PrimaNota (
    Id COUNTER,
    DataRegistrazione DATETIME NOT NULL,
    IdConto LONG NOT NULL,
    IdCausale LONG NOT NULL,
    Segno SMALLINT NOT NULL,
    Importo CURRENCY NOT NULL,
    Descrizione TEXT(120) NOT NULL,
    IdSoggetto LONG,
    IdDocumento LONG,
    IdVendita LONG,
    IdChiusura LONG,
    IdScadenza LONG,
    NumeroDocumentoEsterno TEXT(30),
    Note TEXT(255),
    CreatoIl DATETIME,
    CreatoDa TEXT(32),
    CONSTRAINT PK_PrimaNota PRIMARY KEY (Id),
    CONSTRAINT FK_PrimaNota_Conti FOREIGN KEY (IdConto) REFERENCES ContiCassa (Id),
    CONSTRAINT FK_PrimaNota_Causali FOREIGN KEY (IdCausale) REFERENCES CausaliPrimaNota (Id),
    CONSTRAINT FK_PrimaNota_Soggetti FOREIGN KEY (IdSoggetto) REFERENCES Soggetti (Id)
);

CREATE INDEX IX_PrimaNota_Data ON PrimaNota (DataRegistrazione);
CREATE INDEX IX_PrimaNota_Conto ON PrimaNota (IdConto, DataRegistrazione);
CREATE INDEX IX_PrimaNota_Chiusura ON PrimaNota (IdChiusura);

-- Causali di magazzino, per i movimenti che non nascono da un documento.
CREATE TABLE CausaliMagazzino (
    Id COUNTER,
    Codice TEXT(10) NOT NULL,
    Descrizione TEXT(60) NOT NULL,
    Segno SMALLINT NOT NULL,
    Attiva YESNO,
    CONSTRAINT PK_CausaliMagazzino PRIMARY KEY (Id),
    CONSTRAINT UX_CausaliMagazzino_Codice UNIQUE (Codice)
);

-- Inventario: si conta, si confronta con la giacenza di sistema, si
-- generano i movimenti di rettifica solo alla conferma. Finche' e' in
-- stato bozza si puo' contare in piu' giorni e in piu' postazioni.
CREATE TABLE Inventari (
    Id COUNTER,
    Codice TEXT(15) NOT NULL,
    Descrizione TEXT(60),
    DataInventario DATETIME NOT NULL,
    Stato TEXT(12) NOT NULL,
    DataConferma DATETIME,
    Note MEMO,
    CreatoIl DATETIME,
    CreatoDa TEXT(32),
    CONSTRAINT PK_Inventari PRIMARY KEY (Id),
    CONSTRAINT UX_Inventari_Codice UNIQUE (Codice)
);

CREATE TABLE InventariRighe (
    Id COUNTER,
    IdInventario LONG NOT NULL,
    IdArticolo LONG NOT NULL,
    IdVariante LONG,
    QuantitaContata DOUBLE NOT NULL,
    QuantitaSistema DOUBLE,
    Differenza DOUBLE,
    PrezzoUnitario CURRENCY,
    ContataDa TEXT(32),
    ContataIl DATETIME,
    CONSTRAINT PK_InventariRighe PRIMARY KEY (Id),
    CONSTRAINT FK_InventariRighe_Inventari FOREIGN KEY (IdInventario) REFERENCES Inventari (Id) ON DELETE CASCADE,
    CONSTRAINT FK_InventariRighe_Articoli FOREIGN KEY (IdArticolo) REFERENCES Articoli (Id),
    CONSTRAINT FK_InventariRighe_Varianti FOREIGN KEY (IdVariante) REFERENCES ArticoliVarianti (Id)
);

CREATE UNIQUE INDEX UX_InventariRighe ON InventariRighe (IdInventario, IdArticolo, IdVariante);

-- Registro delle chiamate al registratore telematico. Serve quando la
-- stampante risponde male: si guarda che XML e' stato mandato e che cosa e'
-- tornato, invece di tirare a indovinare.
CREATE TABLE LogRt (
    Id COUNTER,
    QuandoIl DATETIME NOT NULL,
    IdCassa LONG,
    Operazione TEXT(30),
    IdVendita LONG,
    Riuscita YESNO,
    CodiceEsito TEXT(20),
    Messaggio TEXT(255),
    Richiesta MEMO,
    Risposta MEMO,
    CONSTRAINT PK_LogRt PRIMARY KEY (Id)
);

CREATE INDEX IX_LogRt_Quando ON LogRt (QuandoIl);

-- --- modifiche alle tabelle esistenti -------------------------------------

ALTER TABLE Articoli ADD COLUMN GestioneVarianti YESNO;

ALTER TABLE Articoli ADD COLUMN IdReparto LONG;

ALTER TABLE Articoli ADD CONSTRAINT FK_Articoli_Reparti FOREIGN KEY (IdReparto) REFERENCES Reparti (Id);

ALTER TABLE MovimentiMagazzino ADD COLUMN IdVariante LONG;

ALTER TABLE MovimentiMagazzino ADD COLUMN IdVendita LONG;

ALTER TABLE MovimentiMagazzino ADD COLUMN IdCausaleMagazzino LONG;

ALTER TABLE MovimentiMagazzino ADD CONSTRAINT FK_Movimenti_Varianti FOREIGN KEY (IdVariante) REFERENCES ArticoliVarianti (Id);

ALTER TABLE DocumentiRighe ADD COLUMN IdVariante LONG;

ALTER TABLE DocumentiRighe ADD CONSTRAINT FK_DocumentiRighe_Varianti FOREIGN KEY (IdVariante) REFERENCES ArticoliVarianti (Id);

ALTER TABLE Documenti ADD COLUMN IdVenditaOrigine LONG;

ALTER TABLE Casse ADD CONSTRAINT FK_Casse_Conti FOREIGN KEY (IdContoCassa) REFERENCES ContiCassa (Id);
