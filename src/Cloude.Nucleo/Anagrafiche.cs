namespace Cloude.Nucleo;

// ---------------------------------------------------------------------------
// STRUTTURE DATI
//
// Queste classi non contengono logica: sono solo contenitori di campi, come
// un record di un DBF in Clipper o una scheda di FileMaker. Tutto cio' che
// "fa qualcosa" sta nei moduli di funzioni (CalcoloDocumento, Validazioni,
// ClientiDb, ...), non qui dentro.
//
// I campi sono scritti come "public string Nome { get; set; }" invece che
// come semplici variabili perche' e' l'unica forma che la griglia di WinForms
// e la libreria Dapper sanno leggere e scrivere in automatico. Trattali
// mentalmente come normali campi.
// ---------------------------------------------------------------------------

public class Cliente
{
    public int Id { get; set; }

    // Codice cliente visibile all'utente (es. "C00123"). Puo' essere vuoto.
    public string Codice { get; set; } = "";

    // Persona giuridica -> RagioneSociale valorizzata.
    // Persona fisica    -> Nome + Cognome valorizzati.
    // La fattura elettronica vuole l'uno o l'altro, mai entrambi.
    public string RagioneSociale { get; set; } = "";
    public string Nome { get; set; } = "";
    public string Cognome { get; set; } = "";

    public string PartitaIva { get; set; } = "";
    public string CodiceFiscale { get; set; } = "";

    public string Indirizzo { get; set; } = "";
    public string Cap { get; set; } = "";
    public string Comune { get; set; } = "";
    public string Provincia { get; set; } = "";
    public string Nazione { get; set; } = "IT";

    // Recapito per la fattura elettronica. Ne serve almeno uno dei due.
    // CodiceDestinatario: 7 caratteri (6 per la Pubblica Amministrazione).
    // "0000000" = il cliente ritira la fattura dal cassetto fiscale.
    public string CodiceDestinatario { get; set; } = "";
    public string PecDestinatario { get; set; } = "";

    public string Email { get; set; } = "";
    public string Telefono { get; set; } = "";

    // Valori proposti in automatico quando si crea una fattura per questo
    // cliente. Servono a non ridigitare sempre le stesse cose.
    public decimal ScontoPredefinito { get; set; }

    public string Note { get; set; } = "";
    public bool Attivo { get; set; } = true;
}

public class Articolo
{
    public int Id { get; set; }

    public string Codice { get; set; } = "";
    public string Barcode { get; set; } = "";
    public string Descrizione { get; set; } = "";
    public string Categoria { get; set; } = "";

    // Unita' di misura secondo la codifica usata in fattura (PZ, KG, MT, ORE...)
    public string UnitaMisura { get; set; } = "PZ";

    public decimal PrezzoVendita { get; set; }
    public decimal PrezzoAcquisto { get; set; }

    // Aliquota in percentuale: 22 significa 22%, non 0,22.
    public decimal AliquotaIva { get; set; } = 22m;

    // Compilata SOLO quando AliquotaIva vale 0: dice al Sistema di
    // Interscambio *perche'* non c'e' IVA (N1 escluse, N2 non soggette,
    // N3 non imponibili, N4 esenti, N5 regime del margine, N6 inversione
    // contabile, N7 IVA assolta in altro stato UE).
    public string NaturaIva { get; set; } = "";

    public decimal Giacenza { get; set; }
    public bool Attivo { get; set; } = true;
}
