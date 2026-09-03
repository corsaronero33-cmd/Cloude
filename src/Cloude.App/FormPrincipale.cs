namespace Cloude.App;

public partial class FormPrincipale : Form
{
    public FormPrincipale()
    {
        InitializeComponent();
    }

    private void vociClienti_Click(object sender, EventArgs e)
    {
        using var finestra = new FormClienti();
        finestra.ShowDialog(this);
    }

    private void vociEsci_Click(object sender, EventArgs e)
    {
        Close();
    }

    private void vociInfo_Click(object sender, EventArgs e)
    {
        MessageBox.Show(
            "Cloude\r\nGestionale in sviluppo.\r\n\r\nDatabase:\r\n"
            + Cloude.Dati.Database.PercorsoFile,
            "Informazioni", MessageBoxButtons.OK, MessageBoxIcon.Information);
    }
}
