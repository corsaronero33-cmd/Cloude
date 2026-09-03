using Dapper;
using Microsoft.Data.Sqlite;
using Cloude.Nucleo;

namespace Cloude.Dati;

// ---------------------------------------------------------------------------
// ACCESSO ALLA TABELLA CLIENTI
//
// Il SQL e' scritto a mano e si legge per intero qui sotto: quello che chiedi
// al database e' esattamente quello che vedi. Non c'e' nessuno strato che
// genera query al posto tuo e che poi devi indovinare quando qualcosa e' lento.
//
// Le stringhe con @nome dentro sono parametri: Dapper li sostituisce in modo
// sicuro. Non concatenare MAI il testo digitato dall'utente dentro una query,
// altrimenti chi scrive un apice nel campo ricerca puo' cancellarti le tabelle.
// ---------------------------------------------------------------------------

public static class ClientiDb
{
    private const string Campi = @"
        Id, Codice, RagioneSociale, Nome, Cognome, PartitaIva, CodiceFiscale,
        Indirizzo, Cap, Comune, Provincia, Nazione, CodiceDestinatario,
        PecDestinatario, Email, Telefono, ScontoPredefinito, Note, Attivo";

    public static List<Cliente> Elenca(SqliteConnection connessione, bool soloAttivi = true)
    {
        string sql = "SELECT " + Campi + " FROM clienti";
        if (soloAttivi) sql += " WHERE Attivo = 1";
        sql += " ORDER BY RagioneSociale, Cognome, Nome";

        return connessione.Query<Cliente>(sql).AsList();
    }

    // Ricerca libera su codice, denominazione e partita IVA.
    public static List<Cliente> Cerca(SqliteConnection connessione, string testo)
    {
        if (string.IsNullOrWhiteSpace(testo))
            return Elenca(connessione);

        string sql = "SELECT " + Campi + @" FROM clienti
                      WHERE Attivo = 1 AND (
                            Codice          LIKE @f
                         OR RagioneSociale  LIKE @f
                         OR Cognome         LIKE @f
                         OR Nome            LIKE @f
                         OR PartitaIva      LIKE @f
                         OR CodiceFiscale   LIKE @f)
                      ORDER BY RagioneSociale, Cognome, Nome";

        return connessione.Query<Cliente>(sql, new { f = "%" + testo.Trim() + "%" }).AsList();
    }

    // Torna null se l'Id non esiste.
    public static Cliente Leggi(SqliteConnection connessione, int id)
    {
        string sql = "SELECT " + Campi + " FROM clienti WHERE Id = @id";
        return connessione.QueryFirstOrDefault<Cliente>(sql, new { id });
    }

    // Inserisce e torna l'Id assegnato dal database.
    public static int Inserisci(SqliteConnection connessione, Cliente cliente)
    {
        const string sql = @"
            INSERT INTO clienti (
                Codice, RagioneSociale, Nome, Cognome, PartitaIva, CodiceFiscale,
                Indirizzo, Cap, Comune, Provincia, Nazione, CodiceDestinatario,
                PecDestinatario, Email, Telefono, ScontoPredefinito, Note, Attivo)
            VALUES (
                @Codice, @RagioneSociale, @Nome, @Cognome, @PartitaIva, @CodiceFiscale,
                @Indirizzo, @Cap, @Comune, @Provincia, @Nazione, @CodiceDestinatario,
                @PecDestinatario, @Email, @Telefono, @ScontoPredefinito, @Note, @Attivo);

            SELECT last_insert_rowid();";

        int id = connessione.ExecuteScalar<int>(sql, cliente);
        cliente.Id = id;
        return id;
    }

    public static void Aggiorna(SqliteConnection connessione, Cliente cliente)
    {
        const string sql = @"
            UPDATE clienti SET
                Codice             = @Codice,
                RagioneSociale     = @RagioneSociale,
                Nome               = @Nome,
                Cognome            = @Cognome,
                PartitaIva         = @PartitaIva,
                CodiceFiscale      = @CodiceFiscale,
                Indirizzo          = @Indirizzo,
                Cap                = @Cap,
                Comune             = @Comune,
                Provincia          = @Provincia,
                Nazione            = @Nazione,
                CodiceDestinatario = @CodiceDestinatario,
                PecDestinatario    = @PecDestinatario,
                Email              = @Email,
                Telefono           = @Telefono,
                ScontoPredefinito  = @ScontoPredefinito,
                Note               = @Note,
                Attivo             = @Attivo
            WHERE Id = @Id";

        connessione.Execute(sql, cliente);
    }

    // Disattiva invece di cancellare: un cliente che compare su fatture gia'
    // emesse non si puo' far sparire, o le fatture restano senza intestatario.
    public static void Disattiva(SqliteConnection connessione, int id)
    {
        connessione.Execute("UPDATE clienti SET Attivo = 0 WHERE Id = @id", new { id });
    }

    // Cancellazione vera. Da usare solo se il cliente non e' mai stato usato:
    // la funzione controlla e rifiuta in caso contrario.
    public static bool Elimina(SqliteConnection connessione, int id)
    {
        int usato = connessione.ExecuteScalar<int>(
            "SELECT COUNT(*) FROM documenti WHERE ClienteId = @id", new { id });

        if (usato > 0) return false;

        connessione.Execute("DELETE FROM clienti WHERE Id = @id", new { id });
        return true;
    }
}
