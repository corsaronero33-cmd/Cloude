using Cloude.Dati;
using Cloude.Nucleo;

// ---------------------------------------------------------------------------
// PROGRAMMA DIMOSTRATIVO
//
// Non fa parte del gestionale: serve solo a vedere il motore in funzione senza
// aprire nessuna finestra. Crea un database temporaneo, ci mette dentro un
// cliente e una fattura, e stampa il risultato.
//
// Si lancia da riga di comando con:   dotnet run --project src/Cloude.Demo
// ---------------------------------------------------------------------------

string cartella = Path.Combine(Path.GetTempPath(), "cloude-demo");
Directory.CreateDirectory(cartella);

string fileDatabase = Path.Combine(cartella, "demo.db");
if (File.Exists(fileDatabase)) File.Delete(fileDatabase);

Database.PercorsoFile = fileDatabase;
Database.ApplicaMigrazioni();

Console.WriteLine("Database creato in: " + fileDatabase);
Console.WriteLine();

using var connessione = Database.Apri();

// --- Anagrafica -------------------------------------------------------------

var cliente = new Cliente
{
    Codice = "C001",
    RagioneSociale = "Rossi Costruzioni Srl",
    PartitaIva = "12345678903",
    Indirizzo = "Via Roma 15",
    Cap = "20121",
    Comune = "Milano",
    Provincia = "MI",
    CodiceDestinatario = "ABC1234"
};
ClientiDb.Inserisci(connessione, cliente);

Console.WriteLine("Cliente inserito: " + Formattazione.Denominazione(cliente)
                  + "  (Id " + cliente.Id + ")");
Console.WriteLine("Partita IVA valida: "
                  + (Validazioni.PartitaIvaValida(cliente.PartitaIva) ? "si" : "NO"));
Console.WriteLine();

// --- Fattura ----------------------------------------------------------------

int anno = 2026;

var fattura = new Documento
{
    Tipo = TipoDocumento.Fattura,
    Anno = anno,
    Numero = DocumentiDb.ProssimoNumero(connessione, TipoDocumento.Fattura, anno),
    Data = new DateTime(anno, 3, 10)
};
DocumentiDb.ImpostaCliente(fattura, cliente);

fattura.Righe.Add(new RigaDocumento
{
    Codice = "SRV01", Descrizione = "Consulenza tecnica", UnitaMisura = "ORE",
    Quantita = 12m, PrezzoUnitario = 65m, AliquotaIva = 22m
});
fattura.Righe.Add(new RigaDocumento
{
    Codice = "ART07", Descrizione = "Materiale di consumo", UnitaMisura = "PZ",
    Quantita = 3m, PrezzoUnitario = 10.10m, AliquotaIva = 22m
});
fattura.Righe.Add(new RigaDocumento
{
    Codice = "LIB01", Descrizione = "Manuale tecnico", UnitaMisura = "PZ",
    Quantita = 2m, PrezzoUnitario = 24m, AliquotaIva = 4m
});
fattura.Righe.Add(new RigaDocumento
{
    Descrizione = "Anticipo gia' fatturato", UnitaMisura = "PZ",
    Quantita = 1m, PrezzoUnitario = 100m, AliquotaIva = 0m, NaturaIva = "N2"
});

// --- Controlli prima di salvare ---------------------------------------------

var errori = Validazioni.ControllaDocumento(fattura);
if (errori.Count > 0)
{
    Console.WriteLine("Documento NON valido:");
    foreach (string errore in errori) Console.WriteLine("  - " + errore);
    return 1;
}

DocumentiDb.Salva(connessione, fattura);

// --- Rilettura dal database e stampa ----------------------------------------

var riletta = DocumentiDb.Leggi(connessione, fattura.Id);
var totali = CalcoloDocumento.Calcola(riletta.Righe);

Console.WriteLine("FATTURA n. " + Formattazione.NumeroDocumento(riletta)
                  + " del " + riletta.Data.ToString("dd/MM/yyyy"));
Console.WriteLine(riletta.ClienteDenominazione);
Console.WriteLine(riletta.ClienteIndirizzo + " - " + riletta.ClienteCap + " "
                  + riletta.ClienteComune + " (" + riletta.ClienteProvincia + ")");
Console.WriteLine("P.IVA " + riletta.ClientePartitaIva
                  + "   Cod. dest. " + riletta.ClienteCodiceDestinatario);
Console.WriteLine();

Console.WriteLine("  # " + "Descrizione".PadRight(28)
                  + "Q.ta".PadLeft(8) + "Prezzo".PadLeft(11)
                  + "IVA".PadLeft(6) + "Importo".PadLeft(12));
Console.WriteLine(new string('-', 78));

foreach (var riga in riletta.Righe)
{
    string aliquota = riga.AliquotaIva == 0
        ? riga.NaturaIva
        : Formattazione.Importo(riga.AliquotaIva).Replace(",00", "") + "%";

    Console.WriteLine(
        riga.Numero.ToString().PadLeft(3) + " "
        + Tronca(riga.Descrizione, 28).PadRight(28)
        + Formattazione.Importo(riga.Quantita).PadLeft(8)
        + Formattazione.Importo(riga.PrezzoUnitario).PadLeft(11)
        + aliquota.PadLeft(6)
        + Formattazione.Importo(CalcoloDocumento.ImponibileRiga(riga)).PadLeft(12));
}

Console.WriteLine(new string('-', 78));
Console.WriteLine();
Console.WriteLine("RIEPILOGO IVA");
Console.WriteLine("  " + "Aliquota".PadRight(12) + "Natura".PadRight(10)
                  + "Imponibile".PadLeft(14) + "Imposta".PadLeft(14));

foreach (var gruppo in totali.Riepiloghi)
{
    string aliquota = Formattazione.Importo(gruppo.AliquotaIva).Replace(",00", "") + "%";
    Console.WriteLine("  " + aliquota.PadRight(12)
                      + (gruppo.NaturaIva == "" ? "-" : gruppo.NaturaIva).PadRight(10)
                      + Formattazione.Importo(gruppo.Imponibile).PadLeft(14)
                      + Formattazione.Importo(gruppo.Imposta).PadLeft(14));
}

Console.WriteLine();
Console.WriteLine("  Totale imponibile" + Formattazione.Importo(totali.TotaleImponibile).PadLeft(20));
Console.WriteLine("  Totale imposta   " + Formattazione.Importo(totali.TotaleImposta).PadLeft(20));
Console.WriteLine("  TOTALE DOCUMENTO " + Formattazione.Importo(totali.TotaleDocumento).PadLeft(20));
Console.WriteLine();

return 0;

// Funzione locale di comodo per accorciare le descrizioni lunghe.
static string Tronca(string testo, int lunghezza)
{
    if (string.IsNullOrEmpty(testo)) return "";
    return testo.Length <= lunghezza ? testo : testo.Substring(0, lunghezza - 1) + ".";
}
