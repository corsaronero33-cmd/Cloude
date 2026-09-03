using Dapper;
using Microsoft.Data.Sqlite;
using Cloude.Nucleo;

namespace Cloude.Dati;

// ---------------------------------------------------------------------------
// ACCESSO A DOCUMENTI E RIGHE
//
// Testata e righe si salvano sempre insieme, dentro una transazione: o si
// scrive tutto o non si scrive niente. Un documento salvato a meta' (testata
// senza righe, o righe senza testata) e' un dato sbagliato che poi si porta
// dietro per anni.
// ---------------------------------------------------------------------------

public static class DocumentiDb
{
    private const string CampiTestata = @"
        Id, Tipo, Anno, Numero, Data, ClienteId,
        ClienteDenominazione, ClientePartitaIva, ClienteCodiceFiscale,
        ClienteIndirizzo, ClienteCap, ClienteComune, ClienteProvincia,
        ClienteNazione, ClienteCodiceDestinatario, ClientePecDestinatario, Note";

    private const string CampiRiga = @"
        Id, DocumentoId, Numero, ArticoloId, Codice, Descrizione, UnitaMisura,
        Quantita, PrezzoUnitario, ScontoPercentuale, AliquotaIva, NaturaIva";

    // Elenco per la griglia principale: solo le testate, senza le righe.
    // Caricare anche le righe di mille fatture per mostrarne l'elenco sarebbe
    // sprecato: si caricano quando si apre il singolo documento.
    public static List<Documento> Elenca(SqliteConnection connessione, string tipo, int anno)
    {
        string sql = "SELECT " + CampiTestata + @" FROM documenti
                      WHERE Tipo = @tipo AND Anno = @anno
                      ORDER BY Data DESC, Id DESC";

        return connessione.Query<Documento>(sql, new { tipo, anno }).AsList();
    }

    // Documento completo di righe. Torna null se l'Id non esiste.
    public static Documento Leggi(SqliteConnection connessione, int id)
    {
        string sqlTestata = "SELECT " + CampiTestata + " FROM documenti WHERE Id = @id";
        var documento = connessione.QueryFirstOrDefault<Documento>(sqlTestata, new { id });
        if (documento == null) return null;

        string sqlRighe = "SELECT " + CampiRiga + @" FROM righe_documento
                           WHERE DocumentoId = @id ORDER BY Numero";
        documento.Righe = connessione.Query<RigaDocumento>(sqlRighe, new { id }).AsList();

        return documento;
    }

    // Inserisce se Id vale 0, altrimenti aggiorna. Torna l'Id del documento.
    public static int Salva(SqliteConnection connessione, Documento documento)
    {
        using var transazione = connessione.BeginTransaction();

        if (documento.Id == 0)
            documento.Id = InserisciTestata(connessione, transazione, documento);
        else
            AggiornaTestata(connessione, transazione, documento);

        // Righe: cancello e riscrivo. Su un documento con poche decine di righe
        // e' piu' semplice e piu' sicuro che stare a capire quali sono state
        // aggiunte, modificate o tolte nella finestra.
        connessione.Execute(
            "DELETE FROM righe_documento WHERE DocumentoId = @id",
            new { id = documento.Id }, transazione);

        const string sqlRiga = @"
            INSERT INTO righe_documento (
                DocumentoId, Numero, ArticoloId, Codice, Descrizione, UnitaMisura,
                Quantita, PrezzoUnitario, ScontoPercentuale, AliquotaIva, NaturaIva)
            VALUES (
                @DocumentoId, @Numero, @ArticoloId, @Codice, @Descrizione, @UnitaMisura,
                @Quantita, @PrezzoUnitario, @ScontoPercentuale, @AliquotaIva, @NaturaIva)";

        for (int i = 0; i < documento.Righe.Count; i++)
        {
            var riga = documento.Righe[i];
            riga.DocumentoId = documento.Id;
            riga.Numero = i + 1;              // rinumero sempre da 1, in ordine
            connessione.Execute(sqlRiga, riga, transazione);
        }

        transazione.Commit();
        return documento.Id;
    }

    public static void Elimina(SqliteConnection connessione, int id)
    {
        // Le righe se ne vanno da sole grazie a ON DELETE CASCADE nello schema,
        // a patto che PRAGMA foreign_keys sia attivo (lo fa Database.Apri).
        connessione.Execute("DELETE FROM documenti WHERE Id = @id", new { id });
    }

    // Primo numero libero per tipo e anno.
    //
    // Attenzione: fra questa lettura e il salvataggio un'altra postazione
    // potrebbe prendersi lo stesso numero. Per ora siamo mono-utente e va bene;
    // in ogni caso l'indice unico ux_documenti_numero nel database impedisce
    // che due documenti finiscano davvero con lo stesso numero.
    public static string ProssimoNumero(SqliteConnection connessione, string tipo, int anno)
    {
        // CAST serve perche' la colonna e' testo: senza, "10" verrebbe prima
        // di "9" nell'ordinamento alfabetico.
        int massimo = connessione.ExecuteScalar<int>(@"
            SELECT COALESCE(MAX(CAST(Numero AS INTEGER)), 0)
            FROM documenti WHERE Tipo = @tipo AND Anno = @anno",
            new { tipo, anno });

        return (massimo + 1).ToString();
    }

    private static int InserisciTestata(SqliteConnection connessione,
                                        SqliteTransaction transazione,
                                        Documento documento)
    {
        const string sql = @"
            INSERT INTO documenti (
                Tipo, Anno, Numero, Data, ClienteId,
                ClienteDenominazione, ClientePartitaIva, ClienteCodiceFiscale,
                ClienteIndirizzo, ClienteCap, ClienteComune, ClienteProvincia,
                ClienteNazione, ClienteCodiceDestinatario, ClientePecDestinatario, Note)
            VALUES (
                @Tipo, @Anno, @Numero, @Data, @ClienteId,
                @ClienteDenominazione, @ClientePartitaIva, @ClienteCodiceFiscale,
                @ClienteIndirizzo, @ClienteCap, @ClienteComune, @ClienteProvincia,
                @ClienteNazione, @ClienteCodiceDestinatario, @ClientePecDestinatario, @Note);

            SELECT last_insert_rowid();";

        return connessione.ExecuteScalar<int>(sql, documento, transazione);
    }

    private static void AggiornaTestata(SqliteConnection connessione,
                                        SqliteTransaction transazione,
                                        Documento documento)
    {
        const string sql = @"
            UPDATE documenti SET
                Tipo                      = @Tipo,
                Anno                      = @Anno,
                Numero                    = @Numero,
                Data                      = @Data,
                ClienteId                 = @ClienteId,
                ClienteDenominazione      = @ClienteDenominazione,
                ClientePartitaIva         = @ClientePartitaIva,
                ClienteCodiceFiscale      = @ClienteCodiceFiscale,
                ClienteIndirizzo          = @ClienteIndirizzo,
                ClienteCap                = @ClienteCap,
                ClienteComune             = @ClienteComune,
                ClienteProvincia          = @ClienteProvincia,
                ClienteNazione            = @ClienteNazione,
                ClienteCodiceDestinatario = @ClienteCodiceDestinatario,
                ClientePecDestinatario    = @ClientePecDestinatario,
                Note                      = @Note
            WHERE Id = @Id";

        connessione.Execute(sql, documento, transazione);
    }

    // Copia i dati del cliente dentro il documento. Da chiamare quando si
    // sceglie il cliente in fase di creazione, MAI dopo l'emissione.
    public static void ImpostaCliente(Documento documento, Cliente cliente)
    {
        documento.ClienteId                 = cliente.Id;
        documento.ClienteDenominazione      = Formattazione.Denominazione(cliente);
        documento.ClientePartitaIva         = cliente.PartitaIva;
        documento.ClienteCodiceFiscale      = cliente.CodiceFiscale;
        documento.ClienteIndirizzo          = cliente.Indirizzo;
        documento.ClienteCap                = cliente.Cap;
        documento.ClienteComune             = cliente.Comune;
        documento.ClienteProvincia          = cliente.Provincia;
        documento.ClienteNazione            = cliente.Nazione;
        documento.ClienteCodiceDestinatario = cliente.CodiceDestinatario;
        documento.ClientePecDestinatario    = cliente.PecDestinatario;
    }
}
