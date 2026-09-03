using System.Data;
using System.Globalization;
using System.Reflection;
using Dapper;
using Microsoft.Data.Sqlite;

namespace Cloude.Dati;

// ---------------------------------------------------------------------------
// APERTURA DATABASE E MIGRAZIONI
//
// Uso SQLite: il database e' un singolo file sul disco, non c'e' niente da
// installare sul PC del cliente e la copia di sicurezza e' la copia di quel
// file. Quando servira' il multi-postazione si passera' a PostgreSQL: il SQL
// scritto a mano nei moduli *Db.cs e' quasi tutto gia' compatibile.
// ---------------------------------------------------------------------------

public static class Database
{
    // Percorso del file .db. Va impostato una volta all'avvio del programma.
    public static string PercorsoFile { get; set; } = "";

    private static bool _convertitoriRegistrati;

    public static SqliteConnection Apri()
    {
        if (string.IsNullOrWhiteSpace(PercorsoFile))
            throw new InvalidOperationException(
                "Database.PercorsoFile non e' stato impostato.");

        RegistraConvertitori();

        var connessione = new SqliteConnection("Data Source=" + PercorsoFile);
        connessione.Open();

        // Da attivare a ogni connessione: senza questo SQLite ignora le
        // chiavi esterne e ti lascia righe di fattura orfane.
        using (var comando = connessione.CreateCommand())
        {
            comando.CommandText = "PRAGMA foreign_keys = ON;";
            comando.ExecuteNonQuery();
        }

        return connessione;
    }

    // Esegue gli script .sql non ancora applicati, in ordine di nome.
    // E' sicuro chiamarla a ogni avvio: quelli gia' fatti vengono saltati.
    public static void ApplicaMigrazioni()
    {
        using var connessione = Apri();

        connessione.Execute(@"
            CREATE TABLE IF NOT EXISTS _migrazioni (
                nome         TEXT PRIMARY KEY,
                applicata_il TEXT NOT NULL
            );");

        var giaApplicate = new HashSet<string>(
            connessione.Query<string>("SELECT nome FROM _migrazioni"));

        foreach (var script in LeggiScript())
        {
            if (giaApplicate.Contains(script.Nome))
                continue;

            // Tutto lo script dentro una transazione: o passa intero o non
            // passa affatto. Un database rimasto a meta' di una migrazione e'
            // il modo piu' rapido per perdere i dati di un cliente.
            using var transazione = connessione.BeginTransaction();

            connessione.Execute(script.Sql, transaction: transazione);
            connessione.Execute(
                "INSERT INTO _migrazioni (nome, applicata_il) VALUES (@nome, @quando)",
                new
                {
                    nome = script.Nome,
                    quando = DateTime.Now.ToString("s", CultureInfo.InvariantCulture)
                },
                transazione);

            transazione.Commit();
        }
    }

    private static List<(string Nome, string Sql)> LeggiScript()
    {
        var risultato = new List<(string, string)>();
        var assembly = Assembly.GetExecutingAssembly();

        foreach (string risorsa in assembly.GetManifestResourceNames())
        {
            if (!risorsa.EndsWith(".sql", StringComparison.OrdinalIgnoreCase))
                continue;

            using var flusso = assembly.GetManifestResourceStream(risorsa);
            using var lettore = new StreamReader(flusso);
            risultato.Add((risorsa, lettore.ReadToEnd()));
        }

        // Ordine alfabetico = ordine di applicazione. Per questo gli script si
        // chiamano 001_, 002_, ... e non "aggiunta_colonna_note".
        risultato.Sort((a, b) => string.CompareOrdinal(a.Item1, b.Item1));
        return risultato;
    }

    // ------------------------------------------------------------------
    // Conversione degli importi.
    //
    // Le colonne degli importi sono TEXT (vedi il commento in 001_schema.sql).
    // Senza le due righe qui sotto, la conversione fra testo e numero userebbe
    // le impostazioni locali del PC: su una macchina italiana "1234.56" verrebbe
    // letto come 123456. I convertitori impongono sempre il formato con il
    // punto, indipendentemente da come e' configurato Windows.
    //
    // La classe qui sotto eredita da una classe di Dapper. E' l'unico punto di
    // tutto il progetto in cui succede: e' l'incastro richiesto dalla libreria,
    // non un modo di organizzare il codice.
    // ------------------------------------------------------------------
    private static void RegistraConvertitori()
    {
        if (_convertitoriRegistrati) return;

        SqlMapper.AddTypeHandler(new ConvertitoreDecimal());
        _convertitoriRegistrati = true;
    }

    private class ConvertitoreDecimal : SqlMapper.TypeHandler<decimal>
    {
        public override decimal Parse(object valore)
        {
            if (valore == null || valore is DBNull) return 0m;
            if (valore is decimal d) return d;
            if (valore is long l) return l;
            if (valore is double dbl) return (decimal)dbl;

            return decimal.Parse(
                Convert.ToString(valore, CultureInfo.InvariantCulture),
                NumberStyles.Any,
                CultureInfo.InvariantCulture);
        }

        public override void SetValue(IDbDataParameter parametro, decimal valore)
        {
            parametro.DbType = DbType.String;
            parametro.Value = valore.ToString(CultureInfo.InvariantCulture);
        }
    }
}
