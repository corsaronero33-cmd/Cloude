using Cloude.Dati;

namespace Cloude.App;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();

        try
        {
            Database.PercorsoFile = PercorsoDatabase();
            Database.ApplicaMigrazioni();
        }
        catch (Exception errore)
        {
            MessageBox.Show(
                "Non riesco ad aprire il database.\r\n\r\n" + errore.Message,
                "Cloude", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }

        Application.Run(new FormPrincipale());
    }

    // Il database va in %APPDATA%\Cloude, cioe' nella cartella dell'utente.
    //
    // NON va messo accanto all'eseguibile in Program Files: da Windows Vista in
    // poi quella cartella e' di sola lettura per gli utenti normali, e il
    // programma andrebbe in errore su ogni salvataggio appena installato su un
    // PC dove l'utente non e' amministratore. E' uno degli inciampi piu' comuni
    // di chi porta su Windows moderno un programma nato negli anni '90.
    private static string PercorsoDatabase()
    {
        string cartella = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "Cloude");

        Directory.CreateDirectory(cartella);
        return Path.Combine(cartella, "cloude.db");
    }
}
