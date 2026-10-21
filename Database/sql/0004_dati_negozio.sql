-- ---------------------------------------------------------------------------
-- 0004_dati_negozio.sql - dati di servizio della parte negozio.
--
-- I reparti si collegano alle aliquote con una INSERT ... SELECT, perche'
-- gli Id dei contatori automatici non si conoscono in anticipo e scriverli
-- a mano sarebbe una scommessa sull'ordine di inserimento.
--
-- La cassa precaricata usa il registratore 'simulato': il gestionale
-- funziona dal primo avvio, senza hardware collegato, e scrive gli
-- scontrini su file invece che su carta. Quando arriva il registratore
-- vero si cambiano TipoRt, IndirizzoRt e PortaRt su questa riga.
-- ---------------------------------------------------------------------------

INSERT INTO VariantiTipi (Codice, Descrizione, Posizione, Attivo) VALUES ('TAGLIA', 'Taglia', 10, True);
INSERT INTO VariantiTipi (Codice, Descrizione, Posizione, Attivo) VALUES ('COLORE', 'Colore', 20, True);

-- Taglie alfabetiche. Posizione tiene l'ordine giusto: la S viene prima
-- della M, che in ordine alfabetico non succede.
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, 'XS', 'XS', 10, True FROM VariantiTipi WHERE Codice = 'TAGLIA';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, 'S', 'S', 20, True FROM VariantiTipi WHERE Codice = 'TAGLIA';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, 'M', 'M', 30, True FROM VariantiTipi WHERE Codice = 'TAGLIA';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, 'L', 'L', 40, True FROM VariantiTipi WHERE Codice = 'TAGLIA';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, 'XL', 'XL', 50, True FROM VariantiTipi WHERE Codice = 'TAGLIA';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, 'XXL', 'XXL', 60, True FROM VariantiTipi WHERE Codice = 'TAGLIA';

-- Taglie numeriche per le calzature, sullo stesso asse ma piu' in fondo.
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, '35', '35', 135, True FROM VariantiTipi WHERE Codice = 'TAGLIA';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, '36', '36', 136, True FROM VariantiTipi WHERE Codice = 'TAGLIA';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, '37', '37', 137, True FROM VariantiTipi WHERE Codice = 'TAGLIA';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, '38', '38', 138, True FROM VariantiTipi WHERE Codice = 'TAGLIA';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, '39', '39', 139, True FROM VariantiTipi WHERE Codice = 'TAGLIA';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, '40', '40', 140, True FROM VariantiTipi WHERE Codice = 'TAGLIA';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, '41', '41', 141, True FROM VariantiTipi WHERE Codice = 'TAGLIA';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, '42', '42', 142, True FROM VariantiTipi WHERE Codice = 'TAGLIA';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, '43', '43', 143, True FROM VariantiTipi WHERE Codice = 'TAGLIA';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, '44', '44', 144, True FROM VariantiTipi WHERE Codice = 'TAGLIA';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, '45', '45', 145, True FROM VariantiTipi WHERE Codice = 'TAGLIA';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, '46', '46', 146, True FROM VariantiTipi WHERE Codice = 'TAGLIA';

INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, 'NERO', 'Nero', 10, True FROM VariantiTipi WHERE Codice = 'COLORE';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, 'BIANCO', 'Bianco', 20, True FROM VariantiTipi WHERE Codice = 'COLORE';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, 'GRIGIO', 'Grigio', 30, True FROM VariantiTipi WHERE Codice = 'COLORE';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, 'BLU', 'Blu', 40, True FROM VariantiTipi WHERE Codice = 'COLORE';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, 'ROSSO', 'Rosso', 50, True FROM VariantiTipi WHERE Codice = 'COLORE';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, 'VERDE', 'Verde', 60, True FROM VariantiTipi WHERE Codice = 'COLORE';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, 'MARRONE', 'Marrone', 70, True FROM VariantiTipi WHERE Codice = 'COLORE';
INSERT INTO VariantiValori (IdTipo, Codice, Descrizione, Posizione, Attivo) SELECT Id, 'BEIGE', 'Beige', 80, True FROM VariantiTipi WHERE Codice = 'COLORE';

-- Reparti del registratore. I numeri devono combaciare con quelli
-- configurati nella stampante fiscale.
INSERT INTO Reparti (Numero, Descrizione, IdAliquotaIva, Attivo) SELECT 1, 'Reparto 1 - IVA 22%', Id, True FROM AliquoteIva WHERE Codice = '22';
INSERT INTO Reparti (Numero, Descrizione, IdAliquotaIva, Attivo) SELECT 2, 'Reparto 2 - IVA 10%', Id, True FROM AliquoteIva WHERE Codice = '10';
INSERT INTO Reparti (Numero, Descrizione, IdAliquotaIva, Attivo) SELECT 3, 'Reparto 3 - IVA 5%', Id, True FROM AliquoteIva WHERE Codice = '5';
INSERT INTO Reparti (Numero, Descrizione, IdAliquotaIva, Attivo) SELECT 4, 'Reparto 4 - IVA 4%', Id, True FROM AliquoteIva WHERE Codice = '4';
INSERT INTO Reparti (Numero, Descrizione, IdAliquotaIva, Attivo) SELECT 5, 'Reparto 5 - Esente art. 10', Id, True FROM AliquoteIva WHERE Codice = 'ES10';

INSERT INTO ContiCassa (Codice, Descrizione, Tipo, SaldoIniziale, Attivo) VALUES ('CASSA', 'Cassa del negozio', 'cassa', 0, True);
INSERT INTO ContiCassa (Codice, Descrizione, Tipo, SaldoIniziale, Attivo) VALUES ('BANCA', 'Conto corrente', 'banca', 0, True);

-- Causali della prima nota. Automatica marca quelle che il programma usa
-- da solo: non vanno cancellate, altrimenti la chiusura di cassa non sa
-- piu' con che causale registrare l'incasso.
INSERT INTO CausaliPrimaNota (Codice, Descrizione, Segno, Automatica, Attiva) VALUES ('INCVEND', 'Incasso vendite del giorno', 1, True, True);
INSERT INTO CausaliPrimaNota (Codice, Descrizione, Segno, Automatica, Attiva) VALUES ('INCFATT', 'Incasso fattura cliente', 1, True, True);
INSERT INTO CausaliPrimaNota (Codice, Descrizione, Segno, Automatica, Attiva) VALUES ('PAGFORN', 'Pagamento fornitore', -1, True, True);
INSERT INTO CausaliPrimaNota (Codice, Descrizione, Segno, Automatica, Attiva) VALUES ('VERSBAN', 'Versamento in banca', -1, False, True);
INSERT INTO CausaliPrimaNota (Codice, Descrizione, Segno, Automatica, Attiva) VALUES ('PRELBAN', 'Prelievo dalla banca', 1, False, True);
INSERT INTO CausaliPrimaNota (Codice, Descrizione, Segno, Automatica, Attiva) VALUES ('FONDO', 'Fondo cassa iniziale', 1, False, True);
INSERT INTO CausaliPrimaNota (Codice, Descrizione, Segno, Automatica, Attiva) VALUES ('SPESEV', 'Spese varie', -1, False, True);
INSERT INTO CausaliPrimaNota (Codice, Descrizione, Segno, Automatica, Attiva) VALUES ('AFFITTO', 'Affitto locali', -1, False, True);
INSERT INTO CausaliPrimaNota (Codice, Descrizione, Segno, Automatica, Attiva) VALUES ('UTENZE', 'Utenze', -1, False, True);
INSERT INTO CausaliPrimaNota (Codice, Descrizione, Segno, Automatica, Attiva) VALUES ('STIPENDI', 'Stipendi e compensi', -1, False, True);
INSERT INTO CausaliPrimaNota (Codice, Descrizione, Segno, Automatica, Attiva) VALUES ('IMPOSTE', 'Imposte e contributi', -1, False, True);
INSERT INTO CausaliPrimaNota (Codice, Descrizione, Segno, Automatica, Attiva) VALUES ('PRELSOC', 'Prelievo del titolare', -1, False, True);
INSERT INTO CausaliPrimaNota (Codice, Descrizione, Segno, Automatica, Attiva) VALUES ('RESOCLI', 'Rimborso a cliente', -1, True, True);

-- Causali di magazzino per i movimenti che non nascono da un documento.
INSERT INTO CausaliMagazzino (Codice, Descrizione, Segno, Attiva) VALUES ('CARFORN', 'Carico da fornitore', 1, True);
INSERT INTO CausaliMagazzino (Codice, Descrizione, Segno, Attiva) VALUES ('SCAVEND', 'Scarico per vendita', -1, True);
INSERT INTO CausaliMagazzino (Codice, Descrizione, Segno, Attiva) VALUES ('RESOCLI', 'Reso da cliente', 1, True);
INSERT INTO CausaliMagazzino (Codice, Descrizione, Segno, Attiva) VALUES ('RESOFOR', 'Reso a fornitore', -1, True);
INSERT INTO CausaliMagazzino (Codice, Descrizione, Segno, Attiva) VALUES ('RETTPIU', 'Rettifica inventario in aumento', 1, True);
INSERT INTO CausaliMagazzino (Codice, Descrizione, Segno, Attiva) VALUES ('RETTMENO', 'Rettifica inventario in diminuzione', -1, True);
INSERT INTO CausaliMagazzino (Codice, Descrizione, Segno, Attiva) VALUES ('ROTTURA', 'Rottura o deterioramento', -1, True);
INSERT INTO CausaliMagazzino (Codice, Descrizione, Segno, Attiva) VALUES ('OMAGGIO', 'Omaggio a cliente', -1, True);
INSERT INTO CausaliMagazzino (Codice, Descrizione, Segno, Attiva) VALUES ('USOINT', 'Uso interno', -1, True);
INSERT INTO CausaliMagazzino (Codice, Descrizione, Segno, Attiva) VALUES ('SCADUTO', 'Scarico per scadenza', -1, True);

-- Prima cassa, con registratore simulato: si lavora subito, senza hardware.
INSERT INTO Casse (Codice, Descrizione, Postazione, TipoRt, IndirizzoRt, PortaRt, TimeoutRtMs, IdContoCassa, Attiva) SELECT 'CASSA1', 'Cassa 1', '', 'simulato', '', 0, 10000, Id, True FROM ContiCassa WHERE Codice = 'CASSA';

INSERT INTO Parametri (Chiave, Contenuto, Descrizione) VALUES ('RepartoPredefinito', '1', 'Numero del reparto RT usato quando l''articolo non ne indica uno');
INSERT INTO Parametri (Chiave, Contenuto, Descrizione) VALUES ('ScontrinoRestoSoloContanti', '1', 'Consente il resto solo sui pagamenti in contanti');
INSERT INTO Parametri (Chiave, Contenuto, Descrizione) VALUES ('CartellaLogRt', '', 'Cartella dove il registratore simulato scrive gli scontrini');
INSERT INTO Parametri (Chiave, Contenuto, Descrizione) VALUES ('ChiusuraGeneraPrimaNota', '1', 'Alla chiusura di cassa registra l''incasso in prima nota');
