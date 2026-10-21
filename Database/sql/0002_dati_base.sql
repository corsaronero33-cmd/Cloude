-- ---------------------------------------------------------------------------
-- 0002_dati_base.sql - tabelle di servizio precaricate.
--
-- Qui non ci sono dati dell'azienda: solo le tabelle che un gestionale
-- italiano deve avere pronte al primo avvio. L'elenco delle nature IVA va
-- completato in base all'attivita' reale: ogni riga sbagliata finisce
-- dentro un file XML trasmesso allo SDI.
--
-- La chiave SchemaVersion non e' qui: la scrive il Migrator dopo avere
-- applicato ogni file, ed e' lui il solo a tenerne il conto.
-- ---------------------------------------------------------------------------

INSERT INTO Parametri (Chiave, Contenuto, Descrizione) VALUES ('BolloAutomatico', '1', 'Calcola il bollo da 2 euro sulle fatture senza IVA oltre la soglia');
INSERT INTO Parametri (Chiave, Contenuto, Descrizione) VALUES ('BolloSoglia', '77.47', 'Soglia oltre la quale scatta il bollo');
INSERT INTO Parametri (Chiave, Contenuto, Descrizione) VALUES ('BolloImporto', '2.00', 'Importo del bollo virtuale');
INSERT INTO Parametri (Chiave, Contenuto, Descrizione) VALUES ('CartellaStampe', '', 'Cartella condivisa dove finiscono i PDF generati');
INSERT INTO Parametri (Chiave, Contenuto, Descrizione) VALUES ('CartellaFatturaElettronica', '', 'Cartella condivisa degli XML per lo SDI');

-- Aliquote con imposta dovuta: Natura resta vuota.
INSERT INTO AliquoteIva (Codice, Descrizione, Percentuale, Natura, RiferimentoNormativo, ConcorreAlBollo, Attiva) VALUES ('22', 'IVA 22%', 22, NULL, NULL, False, True);
INSERT INTO AliquoteIva (Codice, Descrizione, Percentuale, Natura, RiferimentoNormativo, ConcorreAlBollo, Attiva) VALUES ('10', 'IVA 10%', 10, NULL, NULL, False, True);
INSERT INTO AliquoteIva (Codice, Descrizione, Percentuale, Natura, RiferimentoNormativo, ConcorreAlBollo, Attiva) VALUES ('5', 'IVA 5%', 5, NULL, NULL, False, True);
INSERT INTO AliquoteIva (Codice, Descrizione, Percentuale, Natura, RiferimentoNormativo, ConcorreAlBollo, Attiva) VALUES ('4', 'IVA 4%', 4, NULL, NULL, False, True);

-- Casi senza imposta. Natura e riferimento normativo finiscono tali e quali
-- nel blocco DatiRiepilogo della fattura elettronica.
INSERT INTO AliquoteIva (Codice, Descrizione, Percentuale, Natura, RiferimentoNormativo, ConcorreAlBollo, Attiva) VALUES ('FC15', 'Escluso art. 15', 0, 'N1', 'Operazione esclusa ex art. 15 DPR 633/72', True, True);
INSERT INTO AliquoteIva (Codice, Descrizione, Percentuale, Natura, RiferimentoNormativo, ConcorreAlBollo, Attiva) VALUES ('NS', 'Non soggetto', 0, 'N2.2', 'Operazione non soggetta a IVA', True, True);
INSERT INTO AliquoteIva (Codice, Descrizione, Percentuale, Natura, RiferimentoNormativo, ConcorreAlBollo, Attiva) VALUES ('NI8', 'Non imponibile - esportazione', 0, 'N3.1', 'Non imponibile ex art. 8 DPR 633/72', True, True);
INSERT INTO AliquoteIva (Codice, Descrizione, Percentuale, Natura, RiferimentoNormativo, ConcorreAlBollo, Attiva) VALUES ('NI41', 'Non imponibile - cessione intra UE', 0, 'N3.2', 'Non imponibile ex art. 41 DL 331/93', True, True);
INSERT INTO AliquoteIva (Codice, Descrizione, Percentuale, Natura, RiferimentoNormativo, ConcorreAlBollo, Attiva) VALUES ('ES10', 'Esente art. 10', 0, 'N4', 'Esente ex art. 10 DPR 633/72', True, True);
INSERT INTO AliquoteIva (Codice, Descrizione, Percentuale, Natura, RiferimentoNormativo, ConcorreAlBollo, Attiva) VALUES ('MARG', 'Regime del margine', 0, 'N5', 'Regime del margine ex art. 36 DL 41/95', True, True);
INSERT INTO AliquoteIva (Codice, Descrizione, Percentuale, Natura, RiferimentoNormativo, ConcorreAlBollo, Attiva) VALUES ('RC', 'Inversione contabile - altri casi', 0, 'N6.9', 'Inversione contabile ex art. 17 DPR 633/72', True, True);
INSERT INTO AliquoteIva (Codice, Descrizione, Percentuale, Natura, RiferimentoNormativo, ConcorreAlBollo, Attiva) VALUES ('FC', 'Fuori campo IVA', 0, 'N2.2', 'Operazione fuori campo IVA', True, True);

INSERT INTO UnitaMisura (Codice, Descrizione, Decimali) VALUES ('NR', 'Numero', 0);
INSERT INTO UnitaMisura (Codice, Descrizione, Decimali) VALUES ('PZ', 'Pezzi', 0);
INSERT INTO UnitaMisura (Codice, Descrizione, Decimali) VALUES ('CF', 'Confezione', 0);
INSERT INTO UnitaMisura (Codice, Descrizione, Decimali) VALUES ('KG', 'Chilogrammi', 3);
INSERT INTO UnitaMisura (Codice, Descrizione, Decimali) VALUES ('LT', 'Litri', 3);
INSERT INTO UnitaMisura (Codice, Descrizione, Decimali) VALUES ('MT', 'Metri', 2);
INSERT INTO UnitaMisura (Codice, Descrizione, Decimali) VALUES ('MQ', 'Metri quadrati', 2);
INSERT INTO UnitaMisura (Codice, Descrizione, Decimali) VALUES ('MC', 'Metri cubi', 3);
INSERT INTO UnitaMisura (Codice, Descrizione, Decimali) VALUES ('ORE', 'Ore', 2);
INSERT INTO UnitaMisura (Codice, Descrizione, Decimali) VALUES ('GG', 'Giorni', 0);

INSERT INTO CategorieArticoli (Codice, Descrizione, Attiva) VALUES ('GEN', 'Generica', True);
INSERT INTO CategorieArticoli (Codice, Descrizione, Attiva) VALUES ('SERV', 'Servizi', True);

INSERT INTO Listini (Codice, Descrizione, PrezziIvati, Attivo) VALUES ('BASE', 'Listino base - prezzi netti', False, True);
INSERT INTO Listini (Codice, Descrizione, PrezziIvati, Attivo) VALUES ('PUBB', 'Prezzi al pubblico - IVA inclusa', True, True);

INSERT INTO Pagamenti (Codice, Descrizione, NumeroRate, GiorniPrimaRata, IntervalloGiorni, FineMese, GiorniDopoFineMese, SpeseIncasso, ModalitaPagamentoFE, CondizioniPagamentoFE, Attivo) VALUES ('CONT', 'Contanti', 1, 0, 0, False, 0, 0, 'MP01', 'TP02', True);
INSERT INTO Pagamenti (Codice, Descrizione, NumeroRate, GiorniPrimaRata, IntervalloGiorni, FineMese, GiorniDopoFineMese, SpeseIncasso, ModalitaPagamentoFE, CondizioniPagamentoFE, Attivo) VALUES ('VISTA', 'Rimessa diretta a vista', 1, 0, 0, False, 0, 0, 'MP05', 'TP02', True);
INSERT INTO Pagamenti (Codice, Descrizione, NumeroRate, GiorniPrimaRata, IntervalloGiorni, FineMese, GiorniDopoFineMese, SpeseIncasso, ModalitaPagamentoFE, CondizioniPagamentoFE, Attivo) VALUES ('BB30', 'Bonifico 30 gg data fattura', 1, 30, 0, False, 0, 0, 'MP05', 'TP02', True);
INSERT INTO Pagamenti (Codice, Descrizione, NumeroRate, GiorniPrimaRata, IntervalloGiorni, FineMese, GiorniDopoFineMese, SpeseIncasso, ModalitaPagamentoFE, CondizioniPagamentoFE, Attivo) VALUES ('BB30FM', 'Bonifico 30 gg fine mese', 1, 30, 0, True, 0, 0, 'MP05', 'TP02', True);
INSERT INTO Pagamenti (Codice, Descrizione, NumeroRate, GiorniPrimaRata, IntervalloGiorni, FineMese, GiorniDopoFineMese, SpeseIncasso, ModalitaPagamentoFE, CondizioniPagamentoFE, Attivo) VALUES ('BB6090', 'Bonifico 60/90 gg fine mese', 2, 60, 30, True, 0, 0, 'MP05', 'TP01', True);
INSERT INTO Pagamenti (Codice, Descrizione, NumeroRate, GiorniPrimaRata, IntervalloGiorni, FineMese, GiorniDopoFineMese, SpeseIncasso, ModalitaPagamentoFE, CondizioniPagamentoFE, Attivo) VALUES ('BB3M', 'Bonifico 30/60/90 gg', 3, 30, 30, False, 0, 0, 'MP05', 'TP01', True);
INSERT INTO Pagamenti (Codice, Descrizione, NumeroRate, GiorniPrimaRata, IntervalloGiorni, FineMese, GiorniDopoFineMese, SpeseIncasso, ModalitaPagamentoFE, CondizioniPagamentoFE, Attivo) VALUES ('RB30FM', 'RiBa 30 gg fine mese', 1, 30, 0, True, 0, 3, 'MP12', 'TP02', True);
INSERT INTO Pagamenti (Codice, Descrizione, NumeroRate, GiorniPrimaRata, IntervalloGiorni, FineMese, GiorniDopoFineMese, SpeseIncasso, ModalitaPagamentoFE, CondizioniPagamentoFE, Attivo) VALUES ('CARTA', 'Carta di credito', 1, 0, 0, False, 0, 0, 'MP08', 'TP02', True);

-- Ciclo attivo
INSERT INTO TipiDocumento (Codice, Descrizione, Verso, SegnoMagazzino, SegnoContabile, GeneraScadenze, Numerato, TipoDocumentoFE, Attivo) VALUES ('FTV', 'Fattura di vendita', 1, -1, 1, True, True, 'TD01', True);
INSERT INTO TipiDocumento (Codice, Descrizione, Verso, SegnoMagazzino, SegnoContabile, GeneraScadenze, Numerato, TipoDocumentoFE, Attivo) VALUES ('FTD', 'Fattura differita', 1, 0, 1, True, True, 'TD24', True);
INSERT INTO TipiDocumento (Codice, Descrizione, Verso, SegnoMagazzino, SegnoContabile, GeneraScadenze, Numerato, TipoDocumentoFE, Attivo) VALUES ('NCV', 'Nota di credito a cliente', 1, 1, -1, True, True, 'TD04', True);
INSERT INTO TipiDocumento (Codice, Descrizione, Verso, SegnoMagazzino, SegnoContabile, GeneraScadenze, Numerato, TipoDocumentoFE, Attivo) VALUES ('DDT', 'Documento di trasporto', 1, -1, 0, False, True, NULL, True);
INSERT INTO TipiDocumento (Codice, Descrizione, Verso, SegnoMagazzino, SegnoContabile, GeneraScadenze, Numerato, TipoDocumentoFE, Attivo) VALUES ('PRV', 'Preventivo', 1, 0, 0, False, True, NULL, True);
INSERT INTO TipiDocumento (Codice, Descrizione, Verso, SegnoMagazzino, SegnoContabile, GeneraScadenze, Numerato, TipoDocumentoFE, Attivo) VALUES ('ORV', 'Ordine da cliente', 1, 0, 0, False, True, NULL, True);

-- Ciclo passivo
INSERT INTO TipiDocumento (Codice, Descrizione, Verso, SegnoMagazzino, SegnoContabile, GeneraScadenze, Numerato, TipoDocumentoFE, Attivo) VALUES ('FTA', 'Fattura di acquisto', -1, 1, 1, True, False, 'TD01', True);
INSERT INTO TipiDocumento (Codice, Descrizione, Verso, SegnoMagazzino, SegnoContabile, GeneraScadenze, Numerato, TipoDocumentoFE, Attivo) VALUES ('NCA', 'Nota di credito da fornitore', -1, -1, -1, True, False, 'TD04', True);
INSERT INTO TipiDocumento (Codice, Descrizione, Verso, SegnoMagazzino, SegnoContabile, GeneraScadenze, Numerato, TipoDocumentoFE, Attivo) VALUES ('DDA', 'Bolla di carico da fornitore', -1, 1, 0, False, False, NULL, True);
INSERT INTO TipiDocumento (Codice, Descrizione, Verso, SegnoMagazzino, SegnoContabile, GeneraScadenze, Numerato, TipoDocumentoFE, Attivo) VALUES ('ORA', 'Ordine a fornitore', -1, 0, 0, False, True, NULL, True);

-- Movimenti di magazzino non legati a un documento
INSERT INTO TipiDocumento (Codice, Descrizione, Verso, SegnoMagazzino, SegnoContabile, GeneraScadenze, Numerato, TipoDocumentoFE, Attivo) VALUES ('INV', 'Rettifica di inventario', 0, 1, 0, False, True, NULL, True);

-- Riga segnaposto per i dati dell'azienda. Va completata al primo avvio:
-- senza partita IVA e regime fiscale la fattura elettronica non parte.
INSERT INTO Aziende (RagioneSociale, RegimeFiscale, Nazione, IdPaeseTrasmittente, ProgressivoInvio, Attiva) VALUES ('Da configurare', 'RF01', 'IT', 'IT', 0, True);

-- Amministratore senza password: al primo accesso l'applicazione obbliga a
-- impostarla. Meglio di una password predefinita che nessuno cambia.
INSERT INTO Utenti (NomeUtente, NomeCompleto, HashPassword, Salt, Iterazioni, Ruolo, Attivo, CreatoIl) VALUES ('admin', 'Amministratore', NULL, NULL, 0, 'amministratore', True, Now());
