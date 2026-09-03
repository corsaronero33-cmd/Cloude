-- ===========================================================================
-- Schema iniziale.
--
-- Gli script in questa cartella vengono eseguiti in ordine di nome, una volta
-- sola ciascuno, e l'elenco di quelli gia' applicati sta nella tabella
-- _migrazioni. Per cambiare il database NON si modifica mai uno script gia'
-- rilasciato: se ne aggiunge uno nuovo (002_..., 003_...). Altrimenti chi ha
-- gia' il programma installato si ritrova con un database diverso dal tuo.
--
-- Perche' gli importi sono TEXT e non REAL:
-- SQLite non ha un tipo decimale. Il tipo REAL e' un numero a virgola mobile
-- binario e non sa rappresentare esattamente 0,10 (diventa 0,1000000000000000055).
-- Su una fattura quell'errore diventa un centesimo di scarto. Dichiarando le
-- colonne come TEXT, la libreria salva il valore decimale come testo esatto e
-- lo rilegge identico. Si perde la possibilita' di fare SUM() in SQL su quelle
-- colonne: i totali si calcolano nel programma, dove il tipo decimal e' esatto.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS _migrazioni (
    nome           TEXT PRIMARY KEY,
    applicata_il   TEXT NOT NULL
);

-- --------------------------------------------------------------------------
CREATE TABLE clienti (
    Id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    Codice                TEXT    NOT NULL DEFAULT '',
    RagioneSociale        TEXT    NOT NULL DEFAULT '',
    Nome                  TEXT    NOT NULL DEFAULT '',
    Cognome               TEXT    NOT NULL DEFAULT '',
    PartitaIva            TEXT    NOT NULL DEFAULT '',
    CodiceFiscale         TEXT    NOT NULL DEFAULT '',
    Indirizzo             TEXT    NOT NULL DEFAULT '',
    Cap                   TEXT    NOT NULL DEFAULT '',
    Comune                TEXT    NOT NULL DEFAULT '',
    Provincia             TEXT    NOT NULL DEFAULT '',
    Nazione               TEXT    NOT NULL DEFAULT 'IT',
    CodiceDestinatario    TEXT    NOT NULL DEFAULT '',
    PecDestinatario       TEXT    NOT NULL DEFAULT '',
    Email                 TEXT    NOT NULL DEFAULT '',
    Telefono              TEXT    NOT NULL DEFAULT '',
    ScontoPredefinito     TEXT    NOT NULL DEFAULT '0',
    Note                  TEXT    NOT NULL DEFAULT '',
    Attivo                INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX ix_clienti_ragione   ON clienti (RagioneSociale);
CREATE INDEX ix_clienti_cognome   ON clienti (Cognome, Nome);
CREATE INDEX ix_clienti_piva      ON clienti (PartitaIva);
CREATE UNIQUE INDEX ux_clienti_codice ON clienti (Codice) WHERE Codice <> '';

-- --------------------------------------------------------------------------
CREATE TABLE articoli (
    Id              INTEGER PRIMARY KEY AUTOINCREMENT,
    Codice          TEXT    NOT NULL DEFAULT '',
    Barcode         TEXT    NOT NULL DEFAULT '',
    Descrizione     TEXT    NOT NULL DEFAULT '',
    Categoria       TEXT    NOT NULL DEFAULT '',
    UnitaMisura     TEXT    NOT NULL DEFAULT 'PZ',
    PrezzoVendita   TEXT    NOT NULL DEFAULT '0',
    PrezzoAcquisto  TEXT    NOT NULL DEFAULT '0',
    AliquotaIva     TEXT    NOT NULL DEFAULT '22',
    NaturaIva       TEXT    NOT NULL DEFAULT '',
    Giacenza        TEXT    NOT NULL DEFAULT '0',
    Attivo          INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX ix_articoli_descrizione ON articoli (Descrizione);
CREATE UNIQUE INDEX ux_articoli_codice ON articoli (Codice) WHERE Codice <> '';

-- --------------------------------------------------------------------------
CREATE TABLE documenti (
    Id                         INTEGER PRIMARY KEY AUTOINCREMENT,
    Tipo                       TEXT    NOT NULL,
    Anno                       INTEGER NOT NULL,
    Numero                     TEXT    NOT NULL,
    Data                       TEXT    NOT NULL,
    ClienteId                  INTEGER NOT NULL DEFAULT 0,

    -- Dati del cliente congelati al momento dell'emissione (vedi il commento
    -- nella classe Documento: la fattura vecchia non deve cambiare se poi
    -- l'anagrafica viene aggiornata).
    ClienteDenominazione       TEXT    NOT NULL DEFAULT '',
    ClientePartitaIva          TEXT    NOT NULL DEFAULT '',
    ClienteCodiceFiscale       TEXT    NOT NULL DEFAULT '',
    ClienteIndirizzo           TEXT    NOT NULL DEFAULT '',
    ClienteCap                 TEXT    NOT NULL DEFAULT '',
    ClienteComune              TEXT    NOT NULL DEFAULT '',
    ClienteProvincia           TEXT    NOT NULL DEFAULT '',
    ClienteNazione             TEXT    NOT NULL DEFAULT 'IT',
    ClienteCodiceDestinatario  TEXT    NOT NULL DEFAULT '',
    ClientePecDestinatario     TEXT    NOT NULL DEFAULT '',

    Note                       TEXT    NOT NULL DEFAULT ''
);

-- Due fatture non possono avere lo stesso numero nello stesso anno.
-- Questo vincolo sta nel database e non solo nel programma: e' l'unico punto
-- in cui nessuno puo' aggirarlo per sbaglio.
CREATE UNIQUE INDEX ux_documenti_numero ON documenti (Tipo, Anno, Numero);
CREATE INDEX ix_documenti_cliente ON documenti (ClienteId);
CREATE INDEX ix_documenti_data    ON documenti (Data);

-- --------------------------------------------------------------------------
CREATE TABLE righe_documento (
    Id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    DocumentoId        INTEGER NOT NULL,
    Numero             INTEGER NOT NULL,
    ArticoloId         INTEGER NOT NULL DEFAULT 0,
    Codice             TEXT    NOT NULL DEFAULT '',
    Descrizione        TEXT    NOT NULL DEFAULT '',
    UnitaMisura        TEXT    NOT NULL DEFAULT 'PZ',
    Quantita           TEXT    NOT NULL DEFAULT '1',
    PrezzoUnitario     TEXT    NOT NULL DEFAULT '0',
    ScontoPercentuale  TEXT    NOT NULL DEFAULT '0',
    AliquotaIva        TEXT    NOT NULL DEFAULT '22',
    NaturaIva          TEXT    NOT NULL DEFAULT '',

    FOREIGN KEY (DocumentoId) REFERENCES documenti (Id) ON DELETE CASCADE
);

CREATE INDEX ix_righe_documento ON righe_documento (DocumentoId, Numero);
