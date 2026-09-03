namespace Cloude.Nucleo;

// Codici documento del tracciato FatturaPA. Sono costanti di testo: le tengo
// qui in un posto solo per non ritrovarmele sparse come stringhe nel codice.
public static class TipoDocumento
{
    public const string Fattura           = "TD01";
    public const string Acconto           = "TD02";
    public const string NotaDiCredito     = "TD04";
    public const string NotaDiDebito      = "TD05";
    public const string Parcella          = "TD06";
    public const string FatturaSemplific  = "TD07";

    // Documenti interni, non trasmessi al Sistema di Interscambio.
    public const string Preventivo        = "PREV";
    public const string Ddt               = "DDT";
    public const string Ordine            = "ORD";
}

public class Documento
{
    public int Id { get; set; }

    public string Tipo { get; set; } = TipoDocumento.Fattura;

    // La numerazione riparte da 1 ogni anno, quindi il numero da solo non
    // identifica il documento: serve sempre la coppia Anno + Numero.
    // Numero e' testo e non intero perche' sono legittime numerazioni come
    // "12/A" o "2026-0007".
    public int Anno { get; set; }
    public string Numero { get; set; } = "";

    public DateTime Data { get; set; }

    public int ClienteId { get; set; }

    // ATTENZIONE - scelta importante.
    // Qui sotto ricopio i dati del cliente COSI' COM'ERANO il giorno in cui il
    // documento e' stato emesso, invece di leggerli ogni volta dall'anagrafica.
    // Motivo: se fra due anni il cliente cambia sede o ragione sociale, la
    // fattura vecchia deve continuare a mostrare l'indirizzo di allora, perche'
    // e' quello che e' stato trasmesso al Sistema di Interscambio e stampato.
    // Un gestionale che rilegge l'anagrafica riscrive la storia, ed e' un
    // problema serio in caso di verifica fiscale.
    public string ClienteDenominazione { get; set; } = "";
    public string ClientePartitaIva { get; set; } = "";
    public string ClienteCodiceFiscale { get; set; } = "";
    public string ClienteIndirizzo { get; set; } = "";
    public string ClienteCap { get; set; } = "";
    public string ClienteComune { get; set; } = "";
    public string ClienteProvincia { get; set; } = "";
    public string ClienteNazione { get; set; } = "IT";
    public string ClienteCodiceDestinatario { get; set; } = "";
    public string ClientePecDestinatario { get; set; } = "";

    public string Note { get; set; } = "";

    public List<RigaDocumento> Righe { get; set; } = new();
}

public class RigaDocumento
{
    public int Id { get; set; }
    public int DocumentoId { get; set; }

    // Numero progressivo della riga dentro al documento, partendo da 1.
    public int Numero { get; set; }

    // 0 = riga libera, non collegata a un articolo di magazzino.
    public int ArticoloId { get; set; }

    public string Codice { get; set; } = "";
    public string Descrizione { get; set; } = "";
    public string UnitaMisura { get; set; } = "PZ";

    public decimal Quantita { get; set; } = 1m;
    public decimal PrezzoUnitario { get; set; }

    // Sconto in percentuale sulla riga: 10 significa 10%.
    public decimal ScontoPercentuale { get; set; }

    public decimal AliquotaIva { get; set; } = 22m;
    public string NaturaIva { get; set; } = "";
}

// Una riga del riepilogo IVA in calce alla fattura: un rigo per ogni
// combinazione aliquota + natura presente nel documento.
public class RiepilogoIva
{
    public decimal AliquotaIva { get; set; }
    public string NaturaIva { get; set; } = "";
    public decimal Imponibile { get; set; }
    public decimal Imposta { get; set; }
}

public class TotaliDocumento
{
    public List<RiepilogoIva> Riepiloghi { get; set; } = new();
    public decimal TotaleImponibile { get; set; }
    public decimal TotaleImposta { get; set; }
    public decimal TotaleDocumento { get; set; }
}
