-- ---------------------------------------------------------------------------
-- 0001_schema.sql - struttura iniziale dell'archivio.
--
-- Dialetto: Access / ACE (motore di Microsoft Access 2007 e successivi).
-- Il file viene eseguito una istruzione per volta: ACE non accetta batch.
-- Ogni istruzione termina con un punto e virgola a fine riga, le righe che
-- iniziano con due trattini sono commenti. Dentro le istruzioni non ci sono
-- punti e virgola, altrimenti lo splitter li taglierebbe a meta'.
--
-- Scelte deliberate:
--
--  * nessuna clausola DEFAULT. I valori predefiniti li mette il livello
--    applicativo, cosi' lo schema resta portabile verso SQL Server o
--    PostgreSQL quando l'archivio Access diventera' stretto.
--  * gli importi sono CURRENCY (interi scalati a 4 decimali, esatti), le
--    quantita' e le percentuali sono DOUBLE.
--  * i documenti emessi conservano una copia dei dati anagrafici del
--    soggetto. Se domani il cliente cambia indirizzo, le fatture vecchie
--    non devono cambiare con lui.
--  * ogni tabella modificabile a mano dagli utenti ha Revisione: il
--    controllo di concorrenza ottimistico si appoggia a quel contatore.
-- ---------------------------------------------------------------------------

-- Utenti dell'applicazione. La password e' salvata come hash iterato con
-- sale per utente, mai in chiaro: l'archivio sta su una cartella condivisa.
CREATE TABLE Utenti (
    Id COUNTER,
    NomeUtente TEXT(32) NOT NULL,
    NomeCompleto TEXT(80),
    HashPassword TEXT(80),
    Salt TEXT(32),
    Iterazioni LONG,
    Ruolo TEXT(20),
    Attivo YESNO,
    CreatoIl DATETIME,
    UltimoAccesso DATETIME,
    CONSTRAINT PK_Utenti PRIMARY KEY (Id)
);

CREATE UNIQUE INDEX UX_Utenti_NomeUtente ON Utenti (NomeUtente);

-- Dati di chi emette i documenti (cedente / prestatore nella fattura
-- elettronica). Una riga sola nell'uso normale, ma la tabella permette di
-- gestire piu' ragioni sociali sullo stesso archivio.
CREATE TABLE Aziende (
    Id COUNTER,
    RagioneSociale TEXT(120) NOT NULL,
    PartitaIva TEXT(20),
    CodiceFiscale TEXT(20),
    RegimeFiscale TEXT(6),
    Indirizzo TEXT(80),
    Civico TEXT(10),
    Cap TEXT(10),
    Comune TEXT(60),
    Provincia TEXT(2),
    Nazione TEXT(2),
    Telefono TEXT(25),
    Email TEXT(120),
    Iban TEXT(34),
    RegistroImprese TEXT(60),
    NumeroRea TEXT(20),
    CapitaleSociale CURRENCY,
    SocioUnico TEXT(4),
    StatoLiquidazione TEXT(4),
    IdPaeseTrasmittente TEXT(2),
    IdCodiceTrasmittente TEXT(28),
    ProgressivoInvio LONG,
    Attiva YESNO,
    CONSTRAINT PK_Aziende PRIMARY KEY (Id)
);

-- Configurazione condivisa fra le postazioni: versione dello schema,
-- preferenze aziendali, percorsi delle cartelle comuni.
CREATE TABLE Parametri (
    Chiave TEXT(50) NOT NULL,
    Contenuto MEMO,
    Descrizione TEXT(120),
    CONSTRAINT PK_Parametri PRIMARY KEY (Chiave)
);

-- Aliquote IVA e nature di esclusione. Una riga con Percentuale 0 e Natura
-- valorizzata (N1..N7) descrive un caso senza imposta: esente, non
-- soggetto, inversione contabile. Natura vuota significa imposta dovuta.
CREATE TABLE AliquoteIva (
    Id COUNTER,
    Codice TEXT(10) NOT NULL,
    Descrizione TEXT(80) NOT NULL,
    Percentuale DOUBLE NOT NULL,
    Natura TEXT(6),
    RiferimentoNormativo TEXT(120),
    ConcorreAlBollo YESNO,
    Attiva YESNO,
    CONSTRAINT PK_AliquoteIva PRIMARY KEY (Id)
);

CREATE UNIQUE INDEX UX_AliquoteIva_Codice ON AliquoteIva (Codice);

CREATE TABLE UnitaMisura (
    Id COUNTER,
    Codice TEXT(5) NOT NULL,
    Descrizione TEXT(40) NOT NULL,
    Decimali BYTE,
    CONSTRAINT PK_UnitaMisura PRIMARY KEY (Id)
);

CREATE UNIQUE INDEX UX_UnitaMisura_Codice ON UnitaMisura (Codice);

CREATE TABLE CategorieArticoli (
    Id COUNTER,
    Codice TEXT(15) NOT NULL,
    Descrizione TEXT(60) NOT NULL,
    Attiva YESNO,
    CONSTRAINT PK_CategorieArticoli PRIMARY KEY (Id)
);

CREATE UNIQUE INDEX UX_CategorieArticoli_Codice ON CategorieArticoli (Codice);

-- Condizioni di pagamento. Da qui nasce lo scadenzario: numero di rate,
-- giorni della prima, intervallo fra le successive, eventuale fine mese.
CREATE TABLE Pagamenti (
    Id COUNTER,
    Codice TEXT(10) NOT NULL,
    Descrizione TEXT(60) NOT NULL,
    NumeroRate SMALLINT NOT NULL,
    GiorniPrimaRata LONG NOT NULL,
    IntervalloGiorni LONG NOT NULL,
    FineMese YESNO,
    GiorniDopoFineMese LONG,
    SpeseIncasso CURRENCY,
    ModalitaPagamentoFE TEXT(4),
    CondizioniPagamentoFE TEXT(4),
    Attivo YESNO,
    CONSTRAINT PK_Pagamenti PRIMARY KEY (Id)
);

CREATE UNIQUE INDEX UX_Pagamenti_Codice ON Pagamenti (Codice);

CREATE TABLE Listini (
    Id COUNTER,
    Codice TEXT(10) NOT NULL,
    Descrizione TEXT(60) NOT NULL,
    PrezziIvati YESNO,
    Attivo YESNO,
    CONSTRAINT PK_Listini PRIMARY KEY (Id)
);

CREATE UNIQUE INDEX UX_Listini_Codice ON Listini (Codice);

-- Clienti e fornitori in una tabella sola, distinti da Tipo: 'C' cliente,
-- 'F' fornitore, 'E' entrambi. Lo stesso soggetto spesso e' tutti e due e
-- duplicarlo in due tabelle costa solo fatica.
CREATE TABLE Soggetti (
    Id COUNTER,
    Codice TEXT(15) NOT NULL,
    Tipo TEXT(1) NOT NULL,
    RagioneSociale TEXT(120) NOT NULL,
    Nome TEXT(60),
    Cognome TEXT(60),
    PersonaFisica YESNO,
    PartitaIva TEXT(20),
    CodiceFiscale TEXT(20),
    Indirizzo TEXT(80),
    Civico TEXT(10),
    Cap TEXT(10),
    Comune TEXT(60),
    Provincia TEXT(2),
    Nazione TEXT(2),
    DestRagioneSociale TEXT(120),
    DestIndirizzo TEXT(80),
    DestCap TEXT(10),
    DestComune TEXT(60),
    DestProvincia TEXT(2),
    Telefono TEXT(25),
    Cellulare TEXT(25),
    Email TEXT(120),
    Pec TEXT(120),
    SitoWeb TEXT(120),
    CodiceDestinatario TEXT(7),
    IdPagamento LONG,
    IdListino LONG,
    IdAliquotaForzata LONG,
    ScontoPredefinito DOUBLE,
    Fido CURRENCY,
    Iban TEXT(34),
    SplitPayment YESNO,
    Note MEMO,
    Attivo YESNO,
    CreatoIl DATETIME,
    Revisione LONG,
    ModificatoIl DATETIME,
    ModificatoDa TEXT(32),
    CONSTRAINT PK_Soggetti PRIMARY KEY (Id),
    CONSTRAINT FK_Soggetti_Pagamenti FOREIGN KEY (IdPagamento) REFERENCES Pagamenti (Id),
    CONSTRAINT FK_Soggetti_Listini FOREIGN KEY (IdListino) REFERENCES Listini (Id),
    CONSTRAINT FK_Soggetti_Aliquote FOREIGN KEY (IdAliquotaForzata) REFERENCES AliquoteIva (Id)
);

CREATE UNIQUE INDEX UX_Soggetti_Codice ON Soggetti (Codice);
CREATE INDEX IX_Soggetti_RagioneSociale ON Soggetti (RagioneSociale);
CREATE INDEX IX_Soggetti_PartitaIva ON Soggetti (PartitaIva);
CREATE INDEX IX_Soggetti_Tipo ON Soggetti (Tipo);

-- Giacenza e' denormalizzata per non sommare i movimenti a ogni ricerca.
-- E' sempre ricostruibile da MovimentiMagazzino: la procedura di ricalcolo
-- e' il riferimento, questo campo e' solo una cache.
CREATE TABLE Articoli (
    Id COUNTER,
    Codice TEXT(25) NOT NULL,
    CodiceBarre TEXT(20),
    Descrizione TEXT(255) NOT NULL,
    DescrizioneEstesa MEMO,
    IdCategoria LONG,
    IdUnitaMisura LONG,
    IdAliquotaIva LONG NOT NULL,
    PrezzoAcquisto CURRENCY,
    PrezzoVendita CURRENCY,
    PrezzoIvato YESNO,
    GestioneMagazzino YESNO,
    Giacenza DOUBLE,
    ScortaMinima DOUBLE,
    Ubicazione TEXT(20),
    Peso DOUBLE,
    IdFornitore LONG,
    CodiceFornitore TEXT(25),
    Note MEMO,
    Attivo YESNO,
    CreatoIl DATETIME,
    Revisione LONG,
    ModificatoIl DATETIME,
    ModificatoDa TEXT(32),
    CONSTRAINT PK_Articoli PRIMARY KEY (Id),
    CONSTRAINT FK_Articoli_Categorie FOREIGN KEY (IdCategoria) REFERENCES CategorieArticoli (Id),
    CONSTRAINT FK_Articoli_UnitaMisura FOREIGN KEY (IdUnitaMisura) REFERENCES UnitaMisura (Id),
    CONSTRAINT FK_Articoli_Aliquote FOREIGN KEY (IdAliquotaIva) REFERENCES AliquoteIva (Id),
    CONSTRAINT FK_Articoli_Fornitore FOREIGN KEY (IdFornitore) REFERENCES Soggetti (Id)
);

CREATE UNIQUE INDEX UX_Articoli_Codice ON Articoli (Codice);
CREATE INDEX IX_Articoli_Descrizione ON Articoli (Descrizione);
CREATE INDEX IX_Articoli_CodiceBarre ON Articoli (CodiceBarre);

-- Prezzo per listino e articolo, con scaglione di quantita' minima e
-- validita' opzionale nel tempo.
CREATE TABLE ListiniRighe (
    Id COUNTER,
    IdListino LONG NOT NULL,
    IdArticolo LONG NOT NULL,
    QuantitaMinima DOUBLE NOT NULL,
    Prezzo CURRENCY NOT NULL,
    ScontoPerc DOUBLE,
    ValidoDal DATETIME,
    ValidoAl DATETIME,
    CONSTRAINT PK_ListiniRighe PRIMARY KEY (Id),
    CONSTRAINT FK_ListiniRighe_Listini FOREIGN KEY (IdListino) REFERENCES Listini (Id) ON DELETE CASCADE,
    CONSTRAINT FK_ListiniRighe_Articoli FOREIGN KEY (IdArticolo) REFERENCES Articoli (Id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX UX_ListiniRighe ON ListiniRighe (IdListino, IdArticolo, QuantitaMinima);

-- Tipi di documento. I tre segni decidono il comportamento senza bisogno di
-- scrivere un ramo If per ogni sigla:
--   Verso           +1 ciclo attivo (vendite), -1 ciclo passivo (acquisti)
--   SegnoMagazzino  -1 scarica, +1 carica, 0 nessun effetto
--   SegnoContabile  +1 fattura, -1 nota di credito, 0 documento non fiscale
CREATE TABLE TipiDocumento (
    Id COUNTER,
    Codice TEXT(10) NOT NULL,
    Descrizione TEXT(60) NOT NULL,
    Verso SMALLINT NOT NULL,
    SegnoMagazzino SMALLINT NOT NULL,
    SegnoContabile SMALLINT NOT NULL,
    GeneraScadenze YESNO,
    Numerato YESNO,
    TipoDocumentoFE TEXT(4),
    Attivo YESNO,
    CONSTRAINT PK_TipiDocumento PRIMARY KEY (Id)
);

CREATE UNIQUE INDEX UX_TipiDocumento_Codice ON TipiDocumento (Codice);

-- Un contatore per tipo, serie e anno. L'incremento passa sempre da
-- Numeratore.Prossimo, che gira dentro una transazione: e' l'unico punto in
-- cui due postazioni possono davvero pestarsi i piedi.
CREATE TABLE Numeratori (
    Id COUNTER,
    IdTipoDocumento LONG NOT NULL,
    Serie TEXT(5) NOT NULL,
    Anno SMALLINT NOT NULL,
    UltimoNumero LONG NOT NULL,
    CONSTRAINT PK_Numeratori PRIMARY KEY (Id),
    CONSTRAINT FK_Numeratori_Tipi FOREIGN KEY (IdTipoDocumento) REFERENCES TipiDocumento (Id)
);

CREATE UNIQUE INDEX UX_Numeratori ON Numeratori (IdTipoDocumento, Serie, Anno);

-- Testata del documento. I campi Intestazione* sono la copia congelata
-- dell'anagrafica al momento dell'emissione.
CREATE TABLE Documenti (
    Id COUNTER,
    IdTipoDocumento LONG NOT NULL,
    Serie TEXT(5) NOT NULL,
    Anno SMALLINT NOT NULL,
    Numero LONG NOT NULL,
    NumeroCompleto TEXT(20) NOT NULL,
    DataDocumento DATETIME NOT NULL,
    IdSoggetto LONG NOT NULL,
    IntestazioneRagioneSociale TEXT(120),
    IntestazionePartitaIva TEXT(20),
    IntestazioneCodiceFiscale TEXT(20),
    IntestazioneIndirizzo TEXT(80),
    IntestazioneCivico TEXT(10),
    IntestazioneCap TEXT(10),
    IntestazioneComune TEXT(60),
    IntestazioneProvincia TEXT(2),
    IntestazioneNazione TEXT(2),
    IdPagamento LONG,
    IdListino LONG,
    PrezziIvati YESNO,
    ScontoPiedePerc DOUBLE,
    SpeseTrasporto CURRENCY,
    SpeseIncasso CURRENCY,
    SpeseImballo CURRENCY,
    IdAliquotaSpese LONG,
    Bollo CURRENCY,
    BolloAddebitato YESNO,
    CassaPrevidenzialePerc DOUBLE,
    CassaPrevidenzialeImporto CURRENCY,
    IdAliquotaCassa LONG,
    RitenutaPerc DOUBLE,
    RitenutaBasePerc DOUBLE,
    RitenutaImporto CURRENCY,
    SplitPayment YESNO,
    TotaleImponibile CURRENCY,
    TotaleImposta CURRENCY,
    TotaleDocumento CURRENCY,
    TotaleDaPagare CURRENCY,
    Stato TEXT(12) NOT NULL,
    NumeroDdt TEXT(20),
    DataDdt DATETIME,
    Vettore TEXT(80),
    Causale TEXT(60),
    AspettoBeni TEXT(40),
    NumeroColli LONG,
    PesoLordo DOUBLE,
    PortoTipo TEXT(20),
    IdDocumentoOrigine LONG,
    StatoFE TEXT(20),
    NomeFileFE TEXT(60),
    ProgressivoFE TEXT(10),
    DataInvioFE DATETIME,
    Note MEMO,
    NoteStampa MEMO,
    CreatoIl DATETIME,
    CreatoDa TEXT(32),
    Revisione LONG,
    ModificatoIl DATETIME,
    ModificatoDa TEXT(32),
    CONSTRAINT PK_Documenti PRIMARY KEY (Id),
    CONSTRAINT FK_Documenti_Tipi FOREIGN KEY (IdTipoDocumento) REFERENCES TipiDocumento (Id),
    CONSTRAINT FK_Documenti_Soggetti FOREIGN KEY (IdSoggetto) REFERENCES Soggetti (Id),
    CONSTRAINT FK_Documenti_Pagamenti FOREIGN KEY (IdPagamento) REFERENCES Pagamenti (Id),
    CONSTRAINT FK_Documenti_Listini FOREIGN KEY (IdListino) REFERENCES Listini (Id)
);

CREATE UNIQUE INDEX UX_Documenti_Numero ON Documenti (IdTipoDocumento, Serie, Anno, Numero);
CREATE INDEX IX_Documenti_Data ON Documenti (DataDocumento);
CREATE INDEX IX_Documenti_Soggetto ON Documenti (IdSoggetto, DataDocumento);
CREATE INDEX IX_Documenti_Stato ON Documenti (Stato);

-- Righe del documento. TipoRiga: 'A' articolo, 'D' descrizione libera,
-- 'S' sconto o maggiorazione a valore, 'T' totale parziale di stampa.
CREATE TABLE DocumentiRighe (
    Id COUNTER,
    IdDocumento LONG NOT NULL,
    Posizione LONG NOT NULL,
    TipoRiga TEXT(1) NOT NULL,
    IdArticolo LONG,
    CodiceArticolo TEXT(25),
    Descrizione TEXT(255) NOT NULL,
    SiglaUnitaMisura TEXT(5),
    Quantita DOUBLE,
    PrezzoUnitario CURRENCY,
    Sconto1 DOUBLE,
    Sconto2 DOUBLE,
    Sconto3 DOUBLE,
    ScontoImporto CURRENCY,
    IdAliquotaIva LONG,
    PercentualeIva DOUBLE,
    NaturaIva TEXT(6),
    Imponibile CURRENCY,
    Imposta CURRENCY,
    Omaggio YESNO,
    SoggettaRitenuta YESNO,
    Note TEXT(255),
    CONSTRAINT PK_DocumentiRighe PRIMARY KEY (Id),
    CONSTRAINT FK_DocumentiRighe_Documenti FOREIGN KEY (IdDocumento) REFERENCES Documenti (Id) ON DELETE CASCADE,
    CONSTRAINT FK_DocumentiRighe_Articoli FOREIGN KEY (IdArticolo) REFERENCES Articoli (Id),
    CONSTRAINT FK_DocumentiRighe_Aliquote FOREIGN KEY (IdAliquotaIva) REFERENCES AliquoteIva (Id)
);

CREATE UNIQUE INDEX UX_DocumentiRighe_Pos ON DocumentiRighe (IdDocumento, Posizione);

-- Riepilogo per aliquota, come lo pretende la fattura elettronica. E'
-- ridondante rispetto alle righe ed e' voluto: il riepilogo stampato e
-- quello trasmesso devono restare identici anche se un domani il motore di
-- calcolo cambia una regola di arrotondamento.
CREATE TABLE DocumentiRiepilogoIva (
    Id COUNTER,
    IdDocumento LONG NOT NULL,
    PercentualeIva DOUBLE NOT NULL,
    NaturaIva TEXT(6),
    Imponibile CURRENCY NOT NULL,
    Imposta CURRENCY NOT NULL,
    Esigibilita TEXT(1),
    RiferimentoNormativo TEXT(120),
    CONSTRAINT PK_DocumentiRiepilogoIva PRIMARY KEY (Id),
    CONSTRAINT FK_Riepilogo_Documenti FOREIGN KEY (IdDocumento) REFERENCES Documenti (Id) ON DELETE CASCADE
);

CREATE INDEX IX_Riepilogo_Documento ON DocumentiRiepilogoIva (IdDocumento);

CREATE TABLE Scadenze (
    Id COUNTER,
    IdDocumento LONG NOT NULL,
    IdSoggetto LONG NOT NULL,
    NumeroRata SMALLINT NOT NULL,
    DataScadenza DATETIME NOT NULL,
    Importo CURRENCY NOT NULL,
    ImportoPagato CURRENCY,
    Pagata YESNO,
    DataPagamento DATETIME,
    ModalitaPagamento TEXT(4),
    Note TEXT(255),
    CONSTRAINT PK_Scadenze PRIMARY KEY (Id),
    CONSTRAINT FK_Scadenze_Documenti FOREIGN KEY (IdDocumento) REFERENCES Documenti (Id) ON DELETE CASCADE,
    CONSTRAINT FK_Scadenze_Soggetti FOREIGN KEY (IdSoggetto) REFERENCES Soggetti (Id)
);

CREATE INDEX IX_Scadenze_Data ON Scadenze (DataScadenza, Pagata);
CREATE INDEX IX_Scadenze_Soggetto ON Scadenze (IdSoggetto, Pagata);

-- Partita doppia del magazzino: ogni variazione di giacenza e' una riga.
-- Segno +1 carico, -1 scarico.
CREATE TABLE MovimentiMagazzino (
    Id COUNTER,
    DataMovimento DATETIME NOT NULL,
    IdArticolo LONG NOT NULL,
    Segno SMALLINT NOT NULL,
    Quantita DOUBLE NOT NULL,
    PrezzoUnitario CURRENCY,
    Causale TEXT(30),
    IdDocumento LONG,
    IdRigaDocumento LONG,
    IdSoggetto LONG,
    Note TEXT(255),
    CreatoIl DATETIME,
    CreatoDa TEXT(32),
    CONSTRAINT PK_MovimentiMagazzino PRIMARY KEY (Id),
    CONSTRAINT FK_Movimenti_Articoli FOREIGN KEY (IdArticolo) REFERENCES Articoli (Id)
);

CREATE INDEX IX_Movimenti_Articolo ON MovimentiMagazzino (IdArticolo, DataMovimento);
CREATE INDEX IX_Movimenti_Documento ON MovimentiMagazzino (IdDocumento);

-- Traccia delle operazioni sensibili: chi ha emesso, modificato o annullato
-- un documento. Con sette utenti su una cartella condivisa, sapere chi ha
-- fatto cosa vale il costo di una riga in piu'.
CREATE TABLE LogAttivita (
    Id COUNTER,
    QuandoIl DATETIME NOT NULL,
    Utente TEXT(32),
    Postazione TEXT(40),
    Operazione TEXT(30),
    Entita TEXT(30),
    IdEntita LONG,
    Dettaglio MEMO,
    CONSTRAINT PK_LogAttivita PRIMARY KEY (Id)
);

CREATE INDEX IX_LogAttivita_Quando ON LogAttivita (QuandoIl);

-- Chi e' collegato in questo momento. Serve per avvisare prima di una
-- manutenzione e per capire chi tiene aperto l'archivio quando il file di
-- lock non si libera.
CREATE TABLE Sessioni (
    Id COUNTER,
    Utente TEXT(32) NOT NULL,
    Postazione TEXT(40),
    ProcessoId LONG,
    ApertaIl DATETIME,
    UltimoPing DATETIME,
    CONSTRAINT PK_Sessioni PRIMARY KEY (Id)
);

CREATE INDEX IX_Sessioni_Ping ON Sessioni (UltimoPing);
