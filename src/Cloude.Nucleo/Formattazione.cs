using System.Globalization;

namespace Cloude.Nucleo;

// Piccole funzioni di comodo usate un po' dappertutto.
public static class Formattazione
{
    private static readonly CultureInfo Italiano = new CultureInfo("it-IT");

    // Come va chiamato il cliente in stampa e in fattura: la ragione sociale
    // se c'e', altrimenti cognome e nome.
    public static string Denominazione(Cliente cliente)
    {
        if (cliente == null) return "";

        if (!string.IsNullOrWhiteSpace(cliente.RagioneSociale))
            return cliente.RagioneSociale.Trim();

        string completo = (cliente.Cognome + " " + cliente.Nome).Trim();
        return completo;
    }

    // Importo in formato italiano: 1.234,56
    public static string Importo(decimal valore)
    {
        return valore.ToString("#,##0.00", Italiano);
    }

    // Numero e anno insieme, come si legge sui documenti: 12/2026
    public static string NumeroDocumento(Documento documento)
    {
        if (documento == null) return "";
        return documento.Numero + "/" + documento.Anno;
    }
}
