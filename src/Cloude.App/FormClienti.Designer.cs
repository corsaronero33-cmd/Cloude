namespace Cloude.App;

partial class FormClienti
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
        pannelloAlto = new Panel();
        etichettaRicerca = new Label();
        casellaRicerca = new TextBox();
        griglia = new DataGridView();
        pannelloBasso = new Panel();
        etichettaConteggio = new Label();
        pulsanteNuovo = new Button();
        pulsanteModifica = new Button();
        pulsanteDisattiva = new Button();
        pulsanteChiudi = new Button();
        pannelloAlto.SuspendLayout();
        ((System.ComponentModel.ISupportInitialize)griglia).BeginInit();
        pannelloBasso.SuspendLayout();
        SuspendLayout();
        //
        // pannelloAlto
        //
        pannelloAlto.Controls.Add(casellaRicerca);
        pannelloAlto.Controls.Add(etichettaRicerca);
        pannelloAlto.Dock = DockStyle.Top;
        pannelloAlto.Location = new Point(0, 0);
        pannelloAlto.Name = "pannelloAlto";
        pannelloAlto.Padding = new Padding(10);
        pannelloAlto.Size = new Size(880, 48);
        pannelloAlto.TabIndex = 0;
        //
        // etichettaRicerca
        //
        etichettaRicerca.AutoSize = true;
        etichettaRicerca.Location = new Point(13, 16);
        etichettaRicerca.Name = "etichettaRicerca";
        etichettaRicerca.Size = new Size(50, 15);
        etichettaRicerca.TabIndex = 0;
        etichettaRicerca.Text = "Cerca:";
        //
        // casellaRicerca
        //
        casellaRicerca.Location = new Point(69, 13);
        casellaRicerca.Name = "casellaRicerca";
        casellaRicerca.Size = new Size(320, 23);
        casellaRicerca.TabIndex = 1;
        casellaRicerca.TextChanged += casellaRicerca_TextChanged;
        //
        // griglia
        //
        griglia.AllowUserToAddRows = false;
        griglia.AllowUserToDeleteRows = false;
        griglia.AllowUserToResizeRows = false;
        griglia.ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.AutoSize;
        griglia.Dock = DockStyle.Fill;
        griglia.EditMode = DataGridViewEditMode.EditProgrammatically;
        griglia.Location = new Point(0, 48);
        griglia.MultiSelect = false;
        griglia.Name = "griglia";
        griglia.ReadOnly = true;
        griglia.RowHeadersVisible = false;
        griglia.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
        griglia.Size = new Size(880, 434);
        griglia.TabIndex = 1;
        griglia.CellDoubleClick += griglia_CellDoubleClick;
        //
        // pannelloBasso
        //
        pannelloBasso.Controls.Add(etichettaConteggio);
        pannelloBasso.Controls.Add(pulsanteNuovo);
        pannelloBasso.Controls.Add(pulsanteModifica);
        pannelloBasso.Controls.Add(pulsanteDisattiva);
        pannelloBasso.Controls.Add(pulsanteChiudi);
        pannelloBasso.Dock = DockStyle.Bottom;
        pannelloBasso.Location = new Point(0, 482);
        pannelloBasso.Name = "pannelloBasso";
        pannelloBasso.Size = new Size(880, 48);
        pannelloBasso.TabIndex = 2;
        //
        // etichettaConteggio
        //
        etichettaConteggio.AutoSize = true;
        etichettaConteggio.Location = new Point(13, 16);
        etichettaConteggio.Name = "etichettaConteggio";
        etichettaConteggio.Size = new Size(0, 15);
        etichettaConteggio.TabIndex = 0;
        //
        // pulsanteNuovo
        //
        pulsanteNuovo.Anchor = AnchorStyles.Top | AnchorStyles.Right;
        pulsanteNuovo.Location = new Point(430, 11);
        pulsanteNuovo.Name = "pulsanteNuovo";
        pulsanteNuovo.Size = new Size(100, 27);
        pulsanteNuovo.TabIndex = 1;
        pulsanteNuovo.Text = "&Nuovo";
        pulsanteNuovo.UseVisualStyleBackColor = true;
        pulsanteNuovo.Click += pulsanteNuovo_Click;
        //
        // pulsanteModifica
        //
        pulsanteModifica.Anchor = AnchorStyles.Top | AnchorStyles.Right;
        pulsanteModifica.Location = new Point(538, 11);
        pulsanteModifica.Name = "pulsanteModifica";
        pulsanteModifica.Size = new Size(100, 27);
        pulsanteModifica.TabIndex = 2;
        pulsanteModifica.Text = "&Modifica";
        pulsanteModifica.UseVisualStyleBackColor = true;
        pulsanteModifica.Click += pulsanteModifica_Click;
        //
        // pulsanteDisattiva
        //
        pulsanteDisattiva.Anchor = AnchorStyles.Top | AnchorStyles.Right;
        pulsanteDisattiva.Location = new Point(646, 11);
        pulsanteDisattiva.Name = "pulsanteDisattiva";
        pulsanteDisattiva.Size = new Size(100, 27);
        pulsanteDisattiva.TabIndex = 3;
        pulsanteDisattiva.Text = "&Disattiva";
        pulsanteDisattiva.UseVisualStyleBackColor = true;
        pulsanteDisattiva.Click += pulsanteDisattiva_Click;
        //
        // pulsanteChiudi
        //
        pulsanteChiudi.Anchor = AnchorStyles.Top | AnchorStyles.Right;
        pulsanteChiudi.Location = new Point(760, 11);
        pulsanteChiudi.Name = "pulsanteChiudi";
        pulsanteChiudi.Size = new Size(100, 27);
        pulsanteChiudi.TabIndex = 4;
        pulsanteChiudi.Text = "&Chiudi";
        pulsanteChiudi.UseVisualStyleBackColor = true;
        pulsanteChiudi.Click += pulsanteChiudi_Click;
        //
        // FormClienti
        //
        AutoScaleDimensions = new SizeF(7F, 15F);
        AutoScaleMode = AutoScaleMode.Font;
        CancelButton = pulsanteChiudi;
        ClientSize = new Size(880, 530);
        Controls.Add(griglia);
        Controls.Add(pannelloBasso);
        Controls.Add(pannelloAlto);
        MinimizeBox = false;
        Name = "FormClienti";
        StartPosition = FormStartPosition.CenterParent;
        Text = "Clienti";
        Load += FormClienti_Load;
        pannelloAlto.ResumeLayout(false);
        pannelloAlto.PerformLayout();
        ((System.ComponentModel.ISupportInitialize)griglia).EndInit();
        pannelloBasso.ResumeLayout(false);
        pannelloBasso.PerformLayout();
        ResumeLayout(false);
    }

    private Panel pannelloAlto;
    private Label etichettaRicerca;
    private TextBox casellaRicerca;
    private DataGridView griglia;
    private Panel pannelloBasso;
    private Label etichettaConteggio;
    private Button pulsanteNuovo;
    private Button pulsanteModifica;
    private Button pulsanteDisattiva;
    private Button pulsanteChiudi;
}
