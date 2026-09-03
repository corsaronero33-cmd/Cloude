using System.Globalization;
using Cloude.Dati;
using Cloude.Nucleo;

namespace Cloude.App;

public partial class FormCliente : Form
{
    private readonly int _id;      // 0 = nuovo cliente
    private Cliente _cliente = new Cliente();

    public FormCliente(int id)
    {
        _id = id;
        InitializeComponent();
    }

    private void FormCliente_Load(object sender, EventArgs e)
    {
        if (_id == 0)
        {
            Text = "Nuovo cliente";
            _cliente = new Cliente();
        }
        else
        {
            Text = "Modifica cliente";
            using var connessione = Database.Apri();
            _cliente = ClientiDb.Leggi(connessione, _id) ?? new Cliente();
        }

        MostraDati();
    }

    // Dalla struttura dati ai campi a video.
    private void MostraDati()
    {
        casellaCodice.Text             = _cliente.Codice;
        casellaRagioneSociale.Text     = _cliente.RagioneSociale;
        casellaCognome.Text            = _cliente.Cognome;
        casellaNome.Text               = _cliente.Nome;
        casellaPartitaIva.Text         = _cliente.PartitaIva;
        casellaCodiceFiscale.Text      = _cliente.CodiceFiscale;
        casellaIndirizzo.Text          = _cliente.Indirizzo;
        casellaCap.Text                = _cliente.Cap;
        casellaComune.Text             = _cliente.Comune;
        casellaProvincia.Text          = _cliente.Provincia;
        casellaNazione.Text            = _cliente.Nazione;
        casellaCodiceDestinatario.Text = _cliente.CodiceDestinatario;
        casellaPecDestinatario.Text    = _cliente.PecDestinatario;
        casellaEmail.Text              = _cliente.Email;
        casellaTelefono.Text           = _cliente.Telefono;
        casellaScontoPredefinito.Text  = _cliente.ScontoPredefinito.ToString("0.##");
        casellaNote.Text               = _cliente.Note;
        spuntaAttivo.Checked           = _cliente.Attivo;
    }

    // Dai campi a video alla struttura dati.
    private void LeggiDati()
    {
        _cliente.Codice             = casellaCodice.Text.Trim();
        _cliente.RagioneSociale     = casellaRagioneSociale.Text.Trim();
        _cliente.Cognome            = casellaCognome.Text.Trim();
        _cliente.Nome               = casellaNome.Text.Trim();
        _cliente.PartitaIva         = casellaPartitaIva.Text.Trim();
        _cliente.CodiceFiscale      = casellaCodiceFiscale.Text.Trim().ToUpperInvariant();
        _cliente.Indirizzo          = casellaIndirizzo.Text.Trim();
        _cliente.Cap                = casellaCap.Text.Trim();
        _cliente.Comune             = casellaComune.Text.Trim();
        _cliente.Provincia          = casellaProvincia.Text.Trim().ToUpperInvariant();
        _cliente.Nazione            = casellaNazione.Text.Trim().ToUpperInvariant();
        _cliente.CodiceDestinatario = casellaCodiceDestinatario.Text.Trim().ToUpperInvariant();
        _cliente.PecDestinatario    = casellaPecDestinatario.Text.Trim();
        _cliente.Email              = casellaEmail.Text.Trim();
        _cliente.Telefono           = casellaTelefono.Text.Trim();
        _cliente.ScontoPredefinito  = LeggiDecimale(casellaScontoPredefinito.Text);
        _cliente.Note               = casellaNote.Text.Trim();
        _cliente.Attivo             = spuntaAttivo.Checked;

        if (string.IsNullOrEmpty(_cliente.Nazione))
            _cliente.Nazione = "IT";
    }

    private void pulsanteSalva_Click(object sender, EventArgs e)
    {
        LeggiDati();

        var errori = Controlla();
        if (errori.Count > 0)
        {
            MessageBox.Show(
                "Correggi questi punti prima di salvare:\r\n\r\n  - "
                + string.Join("\r\n  - ", errori),
                "Dati incompleti", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        try
        {
            using var connessione = Database.Apri();

            if (_cliente.Id == 0)
                ClientiDb.Inserisci(connessione, _cliente);
            else
                ClientiDb.Aggiorna(connessione, _cliente);
        }
        catch (Exception errore)
        {
            MessageBox.Show(
                "Salvataggio non riuscito.\r\n\r\n" + errore.Message,
                "Errore", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }

        DialogResult = DialogResult.OK;
        Close();
    }

    private List<string> Controlla()
    {
        var errori = new List<string>();

        bool haRagioneSociale = !string.IsNullOrWhiteSpace(_cliente.RagioneSociale);
        bool haPersona = !string.IsNullOrWhiteSpace(_cliente.Cognome);

        if (!haRagioneSociale && !haPersona)
            errori.Add("Serve la ragione sociale (azienda) oppure il cognome (persona fisica).");

        if (haRagioneSociale && haPersona)
            errori.Add("Compila la ragione sociale oppure cognome e nome, non tutti e due: "
                       + "la fattura elettronica accetta solo una delle due forme.");

        if (_cliente.PartitaIva.Length > 0
            && _cliente.Nazione == "IT"
            && !Validazioni.PartitaIvaValida(_cliente.PartitaIva))
            errori.Add("La partita IVA non e' valida.");

        if (_cliente.CodiceFiscale.Length > 0
            && _cliente.CodiceFiscale.Length == 16
            && !Validazioni.CodiceFiscaleValido(_cliente.CodiceFiscale))
            errori.Add("Il codice fiscale non e' valido.");

        if (_cliente.CodiceDestinatario.Length > 0
            && !Validazioni.CodiceDestinatarioValido(_cliente.CodiceDestinatario))
            errori.Add("Il codice destinatario deve essere di 6 o 7 caratteri.");

        if (_cliente.ScontoPredefinito < 0 || _cliente.ScontoPredefinito > 100)
            errori.Add("Lo sconto predefinito deve stare fra 0 e 100.");

        return errori;
    }

    // Accetta sia la virgola sia il punto come separatore decimale: l'utente
    // digita quello che ha sotto le dita, non quello che vuole il programma.
    private static decimal LeggiDecimale(string testo)
    {
        if (string.IsNullOrWhiteSpace(testo)) return 0m;

        string pulito = testo.Trim().Replace(',', '.');

        decimal valore;
        if (decimal.TryParse(pulito, NumberStyles.Any, CultureInfo.InvariantCulture, out valore))
            return valore;

        return 0m;
    }
}
