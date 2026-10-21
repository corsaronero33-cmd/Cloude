-- ---------------------------------------------------------------------------
-- 0005_fattura_elettronica.sql - quello che mancava per generare l'XML.
--
-- Le colonne di stato della fattura elettronica (StatoFE, NomeFileFE,
-- ProgressivoFE, DataInvioFE) c'erano gia' dallo schema iniziale. Qui si
-- aggiungono i tre codici che dipendono dal singolo documento e che non si
-- possono dedurre: il tipo di ritenuta, la causale di pagamento e il tipo
-- di cassa previdenziale.
--
-- Stanno sul documento e non sull'azienda perche' cambiano: lo stesso
-- professionista emette parcelle con ritenuta di persone fisiche e fatture
-- a societa' con ritenuta di persone giuridiche.
-- ---------------------------------------------------------------------------

-- RT01 ritenuta di persone fisiche, RT02 di persone giuridiche,
-- RT03 contributo INPS, RT04 contributo ENASARCO, RT05 contributo ENPAM,
-- RT06 altro contributo previdenziale
ALTER TABLE Documenti ADD COLUMN TipoRitenutaFE TEXT(4);

-- Lettera del quadro della dichiarazione dei redditi: A per le
-- prestazioni di lavoro autonomo, G per le provvigioni, e via elencando
ALTER TABLE Documenti ADD COLUMN CausalePagamentoFE TEXT(2);

-- TC01 cassa avvocati, TC02 cassa dottori commercialisti, TC22 INPS,
-- e il resto dell'elenco: dipende dall'albo
ALTER TABLE Documenti ADD COLUMN TipoCassaFE TEXT(4);

ALTER TABLE Aziende ADD COLUMN Pec TEXT(120);

-- Registro delle generazioni e degli invii. Serve quando una fattura
-- viene scartata: si guarda l'XML che e' stato prodotto invece di
-- rigenerarlo e sperare che sia lo stesso.
CREATE TABLE LogFE (
    Id COUNTER,
    QuandoIl DATETIME NOT NULL,
    IdDocumento LONG,
    Operazione TEXT(20),
    NomeFile TEXT(60),
    ProgressivoInvio TEXT(10),
    Riuscita YESNO,
    Messaggio TEXT(255),
    Contenuto MEMO,
    Utente TEXT(32),
    CONSTRAINT PK_LogFE PRIMARY KEY (Id),
    CONSTRAINT FK_LogFE_Documenti FOREIGN KEY (IdDocumento) REFERENCES Documenti (Id)
);

CREATE INDEX IX_LogFE_Quando ON LogFE (QuandoIl);
CREATE INDEX IX_LogFE_Documento ON LogFE (IdDocumento);

INSERT INTO Parametri (Chiave, Contenuto, Descrizione) VALUES ('FETipoRitenutaPredefinito', 'RT02', 'Tipo di ritenuta proposto sui nuovi documenti');
INSERT INTO Parametri (Chiave, Contenuto, Descrizione) VALUES ('FECausalePagamentoPredefinita', 'A', 'Causale di pagamento della ritenuta proposta sui nuovi documenti');
INSERT INTO Parametri (Chiave, Contenuto, Descrizione) VALUES ('FETipoCassaPredefinito', '', 'Tipo di cassa previdenziale proposto sui nuovi documenti');
INSERT INTO Parametri (Chiave, Contenuto, Descrizione) VALUES ('FEFormatoTrasmissione', 'FPR12', 'FPR12 per i privati, FPA12 per la pubblica amministrazione');
