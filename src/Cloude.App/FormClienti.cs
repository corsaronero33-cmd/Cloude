using Cloude.Dati;
using Cloude.Nucleo;

namespace Cloude.App;

public partial class FormClienti : Form
{
    // Struttura usata solo per riempire la griglia. Serve perche' la
    // denominazione da mostrare (ragione sociale oppure cognome + nome) e' il
    // risultato di una funzione, e la griglia sa leggere solo campi.
    // L'ordine dei campi qui sotto e' l'ordine delle colonne a video.
    private class RigaElenco
    {
        public int Id { get; set; }
        public string Codice { get; set; } = "";
        public string Denominazione { get; set; } = "";
        public string PartitaIva { get; set; } = "";
        public string CodiceFiscale { get; set; } = "";
        public string Comune { get; set; } = "";
        public string Provincia { get; set; } = "";
        public string Telefono { get; set; } = "";
    }

    public FormClienti()
    {
        InitializeComponent();
    }

    private void FormClienti_Load(object sender, EventArgs e)
    {
        AggiornaElenco();
    }

    private void AggiornaElenco()
    {
        using var connessione = Database.Apri();
        var clienti = ClientiDb.Cerca(connessione, casellaRicerca.Text);

        var righe = new List<RigaElenco>();
        foreach (var cliente in clienti)
        {
            righe.Add(new RigaElenco
            {
                Id = cliente.Id,
                Codice = cliente.Codice,
                Denominazione = Formattazione.Denominazione(cliente),
                PartitaIva = cliente.PartitaIva,
                CodiceFiscale = cliente.CodiceFiscale,
                Comune = cliente.Comune,
                Provincia = cliente.Provincia,
                Telefono = cliente.Telefono
            });
        }

        griglia.DataSource = null;
        griglia.DataSource = righe;

        SistemaColonne();
        etichettaConteggio.Text = righe.Count == 1
            ? "1 cliente"
            : righe.Count + " clienti";
    }

    private void SistemaColonne()
    {
        if (griglia.Columns.Count == 0) return;

        griglia.Columns["Id"].Visible = false;

        griglia.Columns["Codice"].HeaderText = "Codice";
        griglia.Columns["Codice"].Width = 80;

        griglia.Columns["Denominazione"].HeaderText = "Denominazione";
        griglia.Columns["Denominazione"].AutoSizeMode = DataGridViewAutoSizeColumnMode.Fill;

        griglia.Columns["PartitaIva"].HeaderText = "Partita IVA";
        griglia.Columns["PartitaIva"].Width = 110;

        griglia.Columns["CodiceFiscale"].HeaderText = "Codice fiscale";
        griglia.Columns["CodiceFiscale"].Width = 140;

        griglia.Columns["Comune"].HeaderText = "Comune";
        griglia.Columns["Comune"].Width = 140;

        griglia.Columns["Provincia"].HeaderText = "Pr.";
        griglia.Columns["Provincia"].Width = 40;

        griglia.Columns["Telefono"].HeaderText = "Telefono";
        griglia.Columns["Telefono"].Width = 110;
    }

    // Id del cliente sulla riga selezionata, oppure 0 se non c'e' selezione.
    private int IdSelezionato()
    {
        if (griglia.CurrentRow == null) return 0;

        var riga = griglia.CurrentRow.DataBoundItem as RigaElenco;
        return riga == null ? 0 : riga.Id;
    }

    private void casellaRicerca_TextChanged(object sender, EventArgs e)
    {
        AggiornaElenco();
    }

    private void pulsanteNuovo_Click(object sender, EventArgs e)
    {
        using var finestra = new FormCliente(0);
        if (finestra.ShowDialog(this) == DialogResult.OK)
            AggiornaElenco();
    }

    private void pulsanteModifica_Click(object sender, EventArgs e)
    {
        int id = IdSelezionato();
        if (id == 0) return;

        using var finestra = new FormCliente(id);
        if (finestra.ShowDialog(this) == DialogResult.OK)
            AggiornaElenco();
    }

    private void pulsanteDisattiva_Click(object sender, EventArgs e)
    {
        int id = IdSelezionato();
        if (id == 0) return;

        var risposta = MessageBox.Show(
            "Disattivare il cliente selezionato?\r\n\r\n"
            + "Il cliente sparisce dall'elenco ma resta collegato ai documenti "
            + "gia' emessi.",
            "Conferma", MessageBoxButtons.YesNo, MessageBoxIcon.Question);

        if (risposta != DialogResult.Yes) return;

        using (var connessione = Database.Apri())
            ClientiDb.Disattiva(connessione, id);

        AggiornaElenco();
    }

    private void griglia_CellDoubleClick(object sender, DataGridViewCellEventArgs e)
    {
        if (e.RowIndex < 0) return;
        pulsanteModifica_Click(sender, EventArgs.Empty);
    }

    private void pulsanteChiudi_Click(object sender, EventArgs e)
    {
        Close();
    }
}
