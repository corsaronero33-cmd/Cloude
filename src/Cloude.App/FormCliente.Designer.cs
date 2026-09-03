namespace Cloude.App;

// Questo file lo genera normalmente il designer di Visual Studio quando
// trascini i controlli con il mouse. Aprendo FormCliente.cs in Visual Studio
// e premendo Maiusc+F7 vedi la finestra e puoi spostare i campi: le modifiche
// finiscono qui dentro. Non c'e' bisogno di scriverlo a mano.
partial class FormCliente
{
    private System.ComponentModel.IContainer components = null;

    protected override void Dispose(bool disposing)
    {
        if (disposing && (components != null))
            components.Dispose();

        base.Dispose(disposing);
    }

    private void InitializeComponent()
    {
        etichettaCodice = new Label();
        casellaCodice = new TextBox();
        etichettaRagioneSociale = new Label();
        casellaRagioneSociale = new TextBox();
        etichettaCognome = new Label();
        casellaCognome = new TextBox();
        etichettaNome = new Label();
        casellaNome = new TextBox();
        etichettaPartitaIva = new Label();
        casellaPartitaIva = new TextBox();
        etichettaCodiceFiscale = new Label();
        casellaCodiceFiscale = new TextBox();
        etichettaIndirizzo = new Label();
        casellaIndirizzo = new TextBox();
        etichettaCap = new Label();
        casellaCap = new TextBox();
        etichettaComune = new Label();
        casellaComune = new TextBox();
        etichettaProvincia = new Label();
        casellaProvincia = new TextBox();
        etichettaNazione = new Label();
        casellaNazione = new TextBox();
        etichettaCodiceDestinatario = new Label();
        casellaCodiceDestinatario = new TextBox();
        etichettaPecDestinatario = new Label();
        casellaPecDestinatario = new TextBox();
        etichettaEmail = new Label();
        casellaEmail = new TextBox();
        etichettaTelefono = new Label();
        casellaTelefono = new TextBox();
        etichettaScontoPredefinito = new Label();
        casellaScontoPredefinito = new TextBox();
        etichettaNote = new Label();
        casellaNote = new TextBox();
        spuntaAttivo = new CheckBox();
        pulsanteSalva = new Button();
        pulsanteAnnulla = new Button();
        SuspendLayout();
        //
        // etichettaCodice
        //
        etichettaCodice.AutoSize = true;
        etichettaCodice.Location = new Point(14, 24);
        etichettaCodice.Name = "etichettaCodice";
        etichettaCodice.Text = "Codice:";
        //
        // casellaCodice
        //
        casellaCodice.Location = new Point(150, 20);
        casellaCodice.Name = "casellaCodice";
        casellaCodice.Size = new Size(120, 23);
        //
        // etichettaRagioneSociale
        //
        etichettaRagioneSociale.AutoSize = true;
        etichettaRagioneSociale.Location = new Point(14, 55);
        etichettaRagioneSociale.Name = "etichettaRagioneSociale";
        etichettaRagioneSociale.Text = "Ragione sociale:";
        //
        // casellaRagioneSociale
        //
        casellaRagioneSociale.Location = new Point(150, 51);
        casellaRagioneSociale.Name = "casellaRagioneSociale";
        casellaRagioneSociale.Size = new Size(430, 23);
        //
        // etichettaCognome
        //
        etichettaCognome.AutoSize = true;
        etichettaCognome.Location = new Point(14, 86);
        etichettaCognome.Name = "etichettaCognome";
        etichettaCognome.Text = "Cognome:";
        //
        // casellaCognome
        //
        casellaCognome.Location = new Point(150, 82);
        casellaCognome.Name = "casellaCognome";
        casellaCognome.Size = new Size(200, 23);
        //
        // etichettaNome
        //
        etichettaNome.AutoSize = true;
        etichettaNome.Location = new Point(470, 86);
        etichettaNome.Name = "etichettaNome";
        etichettaNome.Text = "Nome:";
        //
        // casellaNome
        //
        casellaNome.Location = new Point(580, 82);
        casellaNome.Name = "casellaNome";
        casellaNome.Size = new Size(200, 23);
        //
        // etichettaPartitaIva
        //
        etichettaPartitaIva.AutoSize = true;
        etichettaPartitaIva.Location = new Point(14, 117);
        etichettaPartitaIva.Name = "etichettaPartitaIva";
        etichettaPartitaIva.Text = "Partita IVA:";
        //
        // casellaPartitaIva
        //
        casellaPartitaIva.Location = new Point(150, 113);
        casellaPartitaIva.Name = "casellaPartitaIva";
        casellaPartitaIva.Size = new Size(150, 23);
        //
        // etichettaCodiceFiscale
        //
        etichettaCodiceFiscale.AutoSize = true;
        etichettaCodiceFiscale.Location = new Point(470, 117);
        etichettaCodiceFiscale.Name = "etichettaCodiceFiscale";
        etichettaCodiceFiscale.Text = "Codice fiscale:";
        //
        // casellaCodiceFiscale
        //
        casellaCodiceFiscale.Location = new Point(580, 113);
        casellaCodiceFiscale.Name = "casellaCodiceFiscale";
        casellaCodiceFiscale.Size = new Size(200, 23);
        //
        // etichettaIndirizzo
        //
        etichettaIndirizzo.AutoSize = true;
        etichettaIndirizzo.Location = new Point(14, 148);
        etichettaIndirizzo.Name = "etichettaIndirizzo";
        etichettaIndirizzo.Text = "Indirizzo:";
        //
        // casellaIndirizzo
        //
        casellaIndirizzo.Location = new Point(150, 144);
        casellaIndirizzo.Name = "casellaIndirizzo";
        casellaIndirizzo.Size = new Size(430, 23);
        //
        // etichettaCap
        //
        etichettaCap.AutoSize = true;
        etichettaCap.Location = new Point(14, 179);
        etichettaCap.Name = "etichettaCap";
        etichettaCap.Text = "CAP:";
        //
        // casellaCap
        //
        casellaCap.Location = new Point(150, 175);
        casellaCap.Name = "casellaCap";
        casellaCap.Size = new Size(90, 23);
        //
        // etichettaComune
        //
        etichettaComune.AutoSize = true;
        etichettaComune.Location = new Point(470, 179);
        etichettaComune.Name = "etichettaComune";
        etichettaComune.Text = "Comune:";
        //
        // casellaComune
        //
        casellaComune.Location = new Point(580, 175);
        casellaComune.Name = "casellaComune";
        casellaComune.Size = new Size(200, 23);
        //
        // etichettaProvincia
        //
        etichettaProvincia.AutoSize = true;
        etichettaProvincia.Location = new Point(14, 210);
        etichettaProvincia.Name = "etichettaProvincia";
        etichettaProvincia.Text = "Provincia:";
        //
        // casellaProvincia
        //
        casellaProvincia.Location = new Point(150, 206);
        casellaProvincia.Name = "casellaProvincia";
        casellaProvincia.Size = new Size(60, 23);
        //
        // etichettaNazione
        //
        etichettaNazione.AutoSize = true;
        etichettaNazione.Location = new Point(470, 210);
        etichettaNazione.Name = "etichettaNazione";
        etichettaNazione.Text = "Nazione:";
        //
        // casellaNazione
        //
        casellaNazione.Location = new Point(580, 206);
        casellaNazione.Name = "casellaNazione";
        casellaNazione.Size = new Size(60, 23);
        //
        // etichettaCodiceDestinatario
        //
        etichettaCodiceDestinatario.AutoSize = true;
        etichettaCodiceDestinatario.Location = new Point(14, 241);
        etichettaCodiceDestinatario.Name = "etichettaCodiceDestinatario";
        etichettaCodiceDestinatario.Text = "Cod. destinatario:";
        //
        // casellaCodiceDestinatario
        //
        casellaCodiceDestinatario.Location = new Point(150, 237);
        casellaCodiceDestinatario.Name = "casellaCodiceDestinatario";
        casellaCodiceDestinatario.Size = new Size(110, 23);
        //
        // etichettaPecDestinatario
        //
        etichettaPecDestinatario.AutoSize = true;
        etichettaPecDestinatario.Location = new Point(470, 241);
        etichettaPecDestinatario.Name = "etichettaPecDestinatario";
        etichettaPecDestinatario.Text = "PEC destinatario:";
        //
        // casellaPecDestinatario
        //
        casellaPecDestinatario.Location = new Point(580, 237);
        casellaPecDestinatario.Name = "casellaPecDestinatario";
        casellaPecDestinatario.Size = new Size(240, 23);
        //
        // etichettaEmail
        //
        etichettaEmail.AutoSize = true;
        etichettaEmail.Location = new Point(14, 272);
        etichettaEmail.Name = "etichettaEmail";
        etichettaEmail.Text = "Email:";
        //
        // casellaEmail
        //
        casellaEmail.Location = new Point(150, 268);
        casellaEmail.Name = "casellaEmail";
        casellaEmail.Size = new Size(260, 23);
        //
        // etichettaTelefono
        //
        etichettaTelefono.AutoSize = true;
        etichettaTelefono.Location = new Point(470, 272);
        etichettaTelefono.Name = "etichettaTelefono";
        etichettaTelefono.Text = "Telefono:";
        //
        // casellaTelefono
        //
        casellaTelefono.Location = new Point(580, 268);
        casellaTelefono.Name = "casellaTelefono";
        casellaTelefono.Size = new Size(180, 23);
        //
        // etichettaScontoPredefinito
        //
        etichettaScontoPredefinito.AutoSize = true;
        etichettaScontoPredefinito.Location = new Point(14, 303);
        etichettaScontoPredefinito.Name = "etichettaScontoPredefinito";
        etichettaScontoPredefinito.Text = "Sconto predef. %:";
        //
        // casellaScontoPredefinito
        //
        casellaScontoPredefinito.Location = new Point(150, 299);
        casellaScontoPredefinito.Name = "casellaScontoPredefinito";
        casellaScontoPredefinito.Size = new Size(90, 23);
        //
        // etichettaNote
        //
        etichettaNote.AutoSize = true;
        etichettaNote.Location = new Point(14, 334);
        etichettaNote.Name = "etichettaNote";
        etichettaNote.Text = "Note:";
        //
        // casellaNote
        //
        casellaNote.Location = new Point(150, 330);
        casellaNote.Multiline = true;
        casellaNote.Name = "casellaNote";
        casellaNote.ScrollBars = ScrollBars.Vertical;
        casellaNote.Size = new Size(670, 70);
        //
        // spuntaAttivo
        //
        spuntaAttivo.AutoSize = true;
        spuntaAttivo.Checked = true;
        spuntaAttivo.Location = new Point(150, 412);
        spuntaAttivo.Name = "spuntaAttivo";
        spuntaAttivo.Text = "Cliente attivo";
        spuntaAttivo.UseVisualStyleBackColor = true;
        //
        // pulsanteSalva
        //
        pulsanteSalva.Anchor = AnchorStyles.Bottom | AnchorStyles.Right;
        pulsanteSalva.Location = new Point(640, 452);
        pulsanteSalva.Name = "pulsanteSalva";
        pulsanteSalva.Size = new Size(105, 30);
        pulsanteSalva.Text = "&Salva";
        pulsanteSalva.UseVisualStyleBackColor = true;
        pulsanteSalva.Click += pulsanteSalva_Click;
        //
        // pulsanteAnnulla
        //
        pulsanteAnnulla.Anchor = AnchorStyles.Bottom | AnchorStyles.Right;
        pulsanteAnnulla.DialogResult = DialogResult.Cancel;
        pulsanteAnnulla.Location = new Point(755, 452);
        pulsanteAnnulla.Name = "pulsanteAnnulla";
        pulsanteAnnulla.Size = new Size(105, 30);
        pulsanteAnnulla.Text = "&Annulla";
        pulsanteAnnulla.UseVisualStyleBackColor = true;
        //
        // FormCliente
        //
        AcceptButton = pulsanteSalva;
        AutoScaleDimensions = new SizeF(7F, 15F);
        AutoScaleMode = AutoScaleMode.Font;
        CancelButton = pulsanteAnnulla;
        ClientSize = new Size(870, 502);
        FormBorderStyle = FormBorderStyle.FixedDialog;
        Controls.Add(etichettaCodice);
        Controls.Add(casellaCodice);
        Controls.Add(etichettaRagioneSociale);
        Controls.Add(casellaRagioneSociale);
        Controls.Add(etichettaCognome);
        Controls.Add(casellaCognome);
        Controls.Add(etichettaNome);
        Controls.Add(casellaNome);
        Controls.Add(etichettaPartitaIva);
        Controls.Add(casellaPartitaIva);
        Controls.Add(etichettaCodiceFiscale);
        Controls.Add(casellaCodiceFiscale);
        Controls.Add(etichettaIndirizzo);
        Controls.Add(casellaIndirizzo);
        Controls.Add(etichettaCap);
        Controls.Add(casellaCap);
        Controls.Add(etichettaComune);
        Controls.Add(casellaComune);
        Controls.Add(etichettaProvincia);
        Controls.Add(casellaProvincia);
        Controls.Add(etichettaNazione);
        Controls.Add(casellaNazione);
        Controls.Add(etichettaCodiceDestinatario);
        Controls.Add(casellaCodiceDestinatario);
        Controls.Add(etichettaPecDestinatario);
        Controls.Add(casellaPecDestinatario);
        Controls.Add(etichettaEmail);
        Controls.Add(casellaEmail);
        Controls.Add(etichettaTelefono);
        Controls.Add(casellaTelefono);
        Controls.Add(etichettaScontoPredefinito);
        Controls.Add(casellaScontoPredefinito);
        Controls.Add(etichettaNote);
        Controls.Add(casellaNote);
        Controls.Add(spuntaAttivo);
        Controls.Add(pulsanteSalva);
        Controls.Add(pulsanteAnnulla);
        MaximizeBox = false;
        MinimizeBox = false;
        Name = "FormCliente";
        StartPosition = FormStartPosition.CenterParent;
        Text = "Cliente";
        Load += FormCliente_Load;
        ResumeLayout(false);
        PerformLayout();
    }

    private Label etichettaCodice;
    private TextBox casellaCodice;
    private Label etichettaRagioneSociale;
    private TextBox casellaRagioneSociale;
    private Label etichettaCognome;
    private TextBox casellaCognome;
    private Label etichettaNome;
    private TextBox casellaNome;
    private Label etichettaPartitaIva;
    private TextBox casellaPartitaIva;
    private Label etichettaCodiceFiscale;
    private TextBox casellaCodiceFiscale;
    private Label etichettaIndirizzo;
    private TextBox casellaIndirizzo;
    private Label etichettaCap;
    private TextBox casellaCap;
    private Label etichettaComune;
    private TextBox casellaComune;
    private Label etichettaProvincia;
    private TextBox casellaProvincia;
    private Label etichettaNazione;
    private TextBox casellaNazione;
    private Label etichettaCodiceDestinatario;
    private TextBox casellaCodiceDestinatario;
    private Label etichettaPecDestinatario;
    private TextBox casellaPecDestinatario;
    private Label etichettaEmail;
    private TextBox casellaEmail;
    private Label etichettaTelefono;
    private TextBox casellaTelefono;
    private Label etichettaScontoPredefinito;
    private TextBox casellaScontoPredefinito;
    private Label etichettaNote;
    private TextBox casellaNote;
    private CheckBox spuntaAttivo;
    private Button pulsanteSalva;
    private Button pulsanteAnnulla;
}
