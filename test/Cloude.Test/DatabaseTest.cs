using System.Globalization;
using Cloude.Dati;
using Cloude.Nucleo;
using Dapper;
using Microsoft.Data.Sqlite;
using Xunit;

namespace Cloude.Test;

// Ogni test parte da un file di database nuovo, creato in una cartella
// temporanea e cancellato alla fine.
public class DatabaseTest : IDisposable
{
    private readonly string _fileDatabase;

    public DatabaseTest()
    {
        _fileDatabase = Path.Combine(
            Path.GetTempPath(), "cloude_test_" + Guid.NewGuid().ToString("N") + ".db");

        Database.PercorsoFile = _fileDatabase;
        Database.ApplicaMigrazioni();
    }

    public void Dispose()
    {
        // SQLite tiene le connessioni in un pool e il file resta aperto:
        // senza questa riga la cancellazione fallisce su Windows.
        SqliteConnection.ClearAllPools();
        try { File.Delete(_fileDatabase); } catch { /* file gia' sparito */ }
    }

    [Fact]
    public void LeMigrazioniCreanoLeTabelle()
    {
        using var connessione = Database.Apri();

        var tabelle = new HashSet<string>(connessione.Query<string>(
            "SELECT name FROM sqlite_master WHERE type = 'table'"));

        Assert.Contains("clienti", tabelle);
        Assert.Contains("articoli", tabelle);
        Assert.Contains("documenti", tabelle);
        Assert.Contains("righe_documento", tabelle);
        Assert.Contains("_migrazioni", tabelle);
    }

    [Fact]
    public void LeMigrazioniNonSiRiapplicanoDueVolte()
    {
        // Il programma chiama ApplicaMigrazioni a ogni avvio: se non fosse
        // idempotente, il secondo avvio esploderebbe su "table already exists".
        Database.ApplicaMigrazioni();
        Database.ApplicaMigrazioni();

        using var connessione = Database.Apri();
        int quante = connessione.ExecuteScalar<int>("SELECT COUNT(*) FROM _migrazioni");

        Assert.Equal(1, quante);
    }

    [Fact]
    public void ImportiCorrettiAncheConWindowsInItaliano()
    {
        // QUESTO E' IL TEST CHE MI PREOCCUPAVA.
        // Su un PC configurato in italiano il separatore decimale e' la virgola.
        // Se la conversione fra numero e testo usasse le impostazioni locali,
        // il valore 1234,56 salvato come "1234.56" verrebbe riletto come
        // 123456: un errore di un fattore cento su ogni importo.
        var culturaPrecedente = Thread.CurrentThread.CurrentCulture;
        try
        {
            Thread.CurrentThread.CurrentCulture = new CultureInfo("it-IT");
            Thread.CurrentThread.CurrentUICulture = new CultureInfo("it-IT");

            using var connessione = Database.Apri();

            var articolo = new Articolo
            {
                Codice = "ART001",
                Descrizione = "Articolo di prova",
                PrezzoVendita = 1234.56m,
                PrezzoAcquisto = 0.05m,
                AliquotaIva = 22m,
                Giacenza = 7.125m
            };

            connessione.Execute(@"
                INSERT INTO articoli (Codice, Descrizione, PrezzoVendita,
                                      PrezzoAcquisto, AliquotaIva, Giacenza)
                VALUES (@Codice, @Descrizione, @PrezzoVendita,
                        @PrezzoAcquisto, @AliquotaIva, @Giacenza)", articolo);

            var riletto = connessione.QueryFirst<Articolo>(
                "SELECT * FROM articoli WHERE Codice = 'ART001'");

            Assert.Equal(1234.56m, riletto.PrezzoVendita);
            Assert.Equal(0.05m, riletto.PrezzoAcquisto);
            Assert.Equal(22m, riletto.AliquotaIva);
            Assert.Equal(7.125m, riletto.Giacenza);
        }
        finally
        {
            Thread.CurrentThread.CurrentCulture = culturaPrecedente;
            Thread.CurrentThread.CurrentUICulture = culturaPrecedente;
        }
    }

    [Fact]
    public void ClienteSalvatoRilettoUguale()
    {
        using var connessione = Database.Apri();

        var cliente = new Cliente
        {
            Codice = "C001",
            RagioneSociale = "Rossi Costruzioni Srl",
            PartitaIva = "12345678903",
            Indirizzo = "Via Roma 1",
            Cap = "20100",
            Comune = "Milano",
            Provincia = "MI",
            CodiceDestinatario = "ABC1234",
            ScontoPredefinito = 5.5m
        };

        int id = ClientiDb.Inserisci(connessione, cliente);
        Assert.True(id > 0);

        var riletto = ClientiDb.Leggi(connessione, id);

        Assert.NotNull(riletto);
        Assert.Equal("Rossi Costruzioni Srl", riletto.RagioneSociale);
        Assert.Equal("12345678903", riletto.PartitaIva);
        Assert.Equal("MI", riletto.Provincia);
        Assert.Equal(5.5m, riletto.ScontoPredefinito);
        Assert.True(riletto.Attivo);
    }

    [Fact]
    public void RicercaClienteTrovaPerDenominazioneEPerPartitaIva()
    {
        using var connessione = Database.Apri();

        ClientiDb.Inserisci(connessione, new Cliente
        { RagioneSociale = "Bianchi Spa", PartitaIva = "12345678903" });
        ClientiDb.Inserisci(connessione, new Cliente
        { Cognome = "Verdi", Nome = "Luigi", CodiceFiscale = "BBBTTT20H12X122H" });

        Assert.Single(ClientiDb.Cerca(connessione, "Bianchi"));
        Assert.Single(ClientiDb.Cerca(connessione, "12345678903"));
        Assert.Single(ClientiDb.Cerca(connessione, "Verdi"));
        Assert.Empty(ClientiDb.Cerca(connessione, "Nessuno"));
    }

    [Fact]
    public void ClienteDisattivatoSpariceDallElenco()
    {
        using var connessione = Database.Apri();

        int id = ClientiDb.Inserisci(connessione,
            new Cliente { RagioneSociale = "Da Chiudere Srl" });

        Assert.Single(ClientiDb.Elenca(connessione));

        ClientiDb.Disattiva(connessione, id);

        Assert.Empty(ClientiDb.Elenca(connessione));
        Assert.Single(ClientiDb.Elenca(connessione, soloAttivi: false));
    }

    [Fact]
    public void DocumentoSalvatoConLeSueRighe()
    {
        using var connessione = Database.Apri();

        var cliente = new Cliente
        {
            RagioneSociale = "Rossi Costruzioni Srl",
            PartitaIva = "12345678903",
            Comune = "Milano"
        };
        ClientiDb.Inserisci(connessione, cliente);

        var documento = new Documento
        {
            Tipo = TipoDocumento.Fattura,
            Anno = 2026,
            Numero = DocumentiDb.ProssimoNumero(connessione, TipoDocumento.Fattura, 2026),
            Data = new DateTime(2026, 3, 10)
        };
        DocumentiDb.ImpostaCliente(documento, cliente);

        documento.Righe.Add(new RigaDocumento
        { Descrizione = "Consulenza", Quantita = 10m, PrezzoUnitario = 80m, AliquotaIva = 22m });
        documento.Righe.Add(new RigaDocumento
        { Descrizione = "Trasferta", Quantita = 1m, PrezzoUnitario = 150.50m, AliquotaIva = 22m });

        int id = DocumentiDb.Salva(connessione, documento);

        var riletto = DocumentiDb.Leggi(connessione, id);

        Assert.NotNull(riletto);
        Assert.Equal("1", riletto.Numero);
        Assert.Equal("Rossi Costruzioni Srl", riletto.ClienteDenominazione);
        Assert.Equal(2, riletto.Righe.Count);
        Assert.Equal(150.50m, riletto.Righe[1].PrezzoUnitario);

        // Le righe devono tornare numerate da 1 e in ordine.
        Assert.Equal(1, riletto.Righe[0].Numero);
        Assert.Equal(2, riletto.Righe[1].Numero);

        var totali = CalcoloDocumento.Calcola(riletto.Righe);
        Assert.Equal(950.50m, totali.TotaleImponibile);
        Assert.Equal(209.11m, totali.TotaleImposta);
    }

    [Fact]
    public void ModificaDocumentoNonLasciaRigheVecchie()
    {
        using var connessione = Database.Apri();

        var documento = new Documento
        {
            Tipo = TipoDocumento.Fattura,
            Anno = 2026,
            Numero = "1",
            Data = new DateTime(2026, 3, 10),
            ClienteDenominazione = "Cliente Prova"
        };
        documento.Righe.Add(new RigaDocumento { Descrizione = "A", PrezzoUnitario = 10m });
        documento.Righe.Add(new RigaDocumento { Descrizione = "B", PrezzoUnitario = 20m });
        documento.Righe.Add(new RigaDocumento { Descrizione = "C", PrezzoUnitario = 30m });

        int id = DocumentiDb.Salva(connessione, documento);

        // Tolgo una riga e risalvo.
        documento.Righe.RemoveAt(1);
        DocumentiDb.Salva(connessione, documento);

        var riletto = DocumentiDb.Leggi(connessione, id);

        Assert.Equal(2, riletto.Righe.Count);
        Assert.Equal("A", riletto.Righe[0].Descrizione);
        Assert.Equal("C", riletto.Righe[1].Descrizione);
    }

    [Fact]
    public void LaNumerazioneProsegueDaUltimoNumeroUsato()
    {
        using var connessione = Database.Apri();

        Assert.Equal("1", DocumentiDb.ProssimoNumero(connessione, TipoDocumento.Fattura, 2026));

        for (int i = 1; i <= 12; i++)
        {
            var documento = new Documento
            {
                Tipo = TipoDocumento.Fattura,
                Anno = 2026,
                Numero = i.ToString(),
                Data = new DateTime(2026, 1, 1),
                ClienteDenominazione = "Cliente"
            };
            documento.Righe.Add(new RigaDocumento { Descrizione = "x", PrezzoUnitario = 1m });
            DocumentiDb.Salva(connessione, documento);
        }

        // Deve dare 13 e non 10: la colonna e' testo, ma il confronto va fatto
        // sui numeri, altrimenti "9" risulterebbe maggiore di "12".
        Assert.Equal("13", DocumentiDb.ProssimoNumero(connessione, TipoDocumento.Fattura, 2026));

        // Anno nuovo, numerazione da capo.
        Assert.Equal("1", DocumentiDb.ProssimoNumero(connessione, TipoDocumento.Fattura, 2027));
    }

    [Fact]
    public void NonSiPossonoAvereDueFattureConLoStessoNumeroNelloStessoAnno()
    {
        using var connessione = Database.Apri();

        for (int volta = 0; volta < 2; volta++)
        {
            var documento = new Documento
            {
                Tipo = TipoDocumento.Fattura,
                Anno = 2026,
                Numero = "1",
                Data = new DateTime(2026, 1, 1),
                ClienteDenominazione = "Cliente"
            };
            documento.Righe.Add(new RigaDocumento { Descrizione = "x", PrezzoUnitario = 1m });

            if (volta == 0)
                DocumentiDb.Salva(connessione, documento);
            else
                Assert.Throws<SqliteException>(() => DocumentiDb.Salva(connessione, documento));
        }
    }

    [Fact]
    public void EliminandoIlDocumentoSparisconoAncheLeRighe()
    {
        using var connessione = Database.Apri();

        var documento = new Documento
        {
            Tipo = TipoDocumento.Fattura,
            Anno = 2026,
            Numero = "1",
            Data = new DateTime(2026, 3, 10),
            ClienteDenominazione = "Cliente"
        };
        documento.Righe.Add(new RigaDocumento { Descrizione = "A", PrezzoUnitario = 10m });

        int id = DocumentiDb.Salva(connessione, documento);
        DocumentiDb.Elimina(connessione, id);

        Assert.Null(DocumentiDb.Leggi(connessione, id));

        int righeRimaste = connessione.ExecuteScalar<int>(
            "SELECT COUNT(*) FROM righe_documento WHERE DocumentoId = @id", new { id });
        Assert.Equal(0, righeRimaste);
    }
}
