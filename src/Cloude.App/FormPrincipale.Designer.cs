namespace Cloude.App;

partial class FormPrincipale
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
        menu = new MenuStrip();
        vociArchivi = new ToolStripMenuItem();
        vociClienti = new ToolStripMenuItem();
        separatoreArchivi = new ToolStripSeparator();
        vociEsci = new ToolStripMenuItem();
        vociAiuto = new ToolStripMenuItem();
        vociInfo = new ToolStripMenuItem();
        barraStato = new StatusStrip();
        etichettaStato = new ToolStripStatusLabel();
        menu.SuspendLayout();
        barraStato.SuspendLayout();
        SuspendLayout();
        //
        // menu
        //
        menu.Items.AddRange(new ToolStripItem[] { vociArchivi, vociAiuto });
        menu.Location = new Point(0, 0);
        menu.Name = "menu";
        menu.Size = new Size(900, 24);
        menu.TabIndex = 0;
        //
        // vociArchivi
        //
        vociArchivi.DropDownItems.AddRange(new ToolStripItem[] { vociClienti, separatoreArchivi, vociEsci });
        vociArchivi.Name = "vociArchivi";
        vociArchivi.Size = new Size(60, 20);
        vociArchivi.Text = "&Archivi";
        //
        // vociClienti
        //
        vociClienti.Name = "vociClienti";
        vociClienti.ShortcutKeys = Keys.Control | Keys.K;
        vociClienti.Size = new Size(180, 22);
        vociClienti.Text = "&Clienti";
        vociClienti.Click += vociClienti_Click;
        //
        // separatoreArchivi
        //
        separatoreArchivi.Name = "separatoreArchivi";
        separatoreArchivi.Size = new Size(177, 6);
        //
        // vociEsci
        //
        vociEsci.Name = "vociEsci";
        vociEsci.Size = new Size(180, 22);
        vociEsci.Text = "&Esci";
        vociEsci.Click += vociEsci_Click;
        //
        // vociAiuto
        //
        vociAiuto.DropDownItems.AddRange(new ToolStripItem[] { vociInfo });
        vociAiuto.Name = "vociAiuto";
        vociAiuto.Size = new Size(43, 20);
        vociAiuto.Text = "&Aiuto";
        //
        // vociInfo
        //
        vociInfo.Name = "vociInfo";
        vociInfo.Size = new Size(180, 22);
        vociInfo.Text = "&Informazioni";
        vociInfo.Click += vociInfo_Click;
        //
        // barraStato
        //
        barraStato.Items.AddRange(new ToolStripItem[] { etichettaStato });
        barraStato.Location = new Point(0, 528);
        barraStato.Name = "barraStato";
        barraStato.Size = new Size(900, 22);
        barraStato.TabIndex = 1;
        //
        // etichettaStato
        //
        etichettaStato.Name = "etichettaStato";
        etichettaStato.Size = new Size(39, 17);
        etichettaStato.Text = "Pronto";
        //
        // FormPrincipale
        //
        AutoScaleDimensions = new SizeF(7F, 15F);
        AutoScaleMode = AutoScaleMode.Font;
        ClientSize = new Size(900, 550);
        Controls.Add(barraStato);
        Controls.Add(menu);
        MainMenuStrip = menu;
        Name = "FormPrincipale";
        StartPosition = FormStartPosition.CenterScreen;
        Text = "Cloude";
        menu.ResumeLayout(false);
        menu.PerformLayout();
        barraStato.ResumeLayout(false);
        barraStato.PerformLayout();
        ResumeLayout(false);
        PerformLayout();
    }

    private MenuStrip menu;
    private ToolStripMenuItem vociArchivi;
    private ToolStripMenuItem vociClienti;
    private ToolStripSeparator separatoreArchivi;
    private ToolStripMenuItem vociEsci;
    private ToolStripMenuItem vociAiuto;
    private ToolStripMenuItem vociInfo;
    private StatusStrip barraStato;
    private ToolStripStatusLabel etichettaStato;
}
