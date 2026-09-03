using Cloude.Nucleo;
using Xunit;

namespace Cloude.Test;

public class ValidazioniTest
{
    // ----- Partita IVA ----------------------------------------------------

    [Theory]
    [InlineData("12345678903")]   // cifra di controllo calcolata a mano: 3
    [InlineData("00743110157")]
    public void PartitaIvaCorretta(string partitaIva)
    {
        Assert.True(Validazioni.PartitaIvaValida(partitaIva));
    }

    [Theory]
    [InlineData("12345678901")]   // ultima cifra sbagliata
    [InlineData("1234567890")]    // dieci cifre
    [InlineData("123456789034")]  // dodici cifre
    [InlineData("1234567890A")]   // contiene una lettera
    [InlineData("")]
    public void PartitaIvaSbagliata(string partitaIva)
    {
        Assert.False(Validazioni.PartitaIvaValida(partitaIva));
    }

    [Fact]
    public void PartitaIvaNullaNonFaEsplodereNiente()
    {
        Assert.False(Validazioni.PartitaIvaValida(null));
    }

    // ----- Codice fiscale -------------------------------------------------

    // BBBTTT20H12X122H e' l'esempio usato nella documentazione divulgativa
    // dell'algoritmo: somma posizioni dispari 46 + pari 65 = 111,
    // 111 diviso 26 da' resto 7, che corrisponde alla lettera H.
    [Theory]
    [InlineData("BBBTTT20H12X122H")]
    [InlineData("bbbttt20h12x122h")]   // minuscolo: deve funzionare lo stesso
    [InlineData("RSSMRA85M01H501Q")]
    public void CodiceFiscaleCorretto(string codiceFiscale)
    {
        Assert.True(Validazioni.CodiceFiscaleValido(codiceFiscale));
    }

    [Theory]
    [InlineData("BBBTTT20H12X122A")]   // carattere di controllo sbagliato
    [InlineData("BBBTTT20H12X122")]    // quindici caratteri
    [InlineData("BBBTTT20H12X122HH")]  // diciassette caratteri
    [InlineData("BBBTTT20H12X12-H")]   // carattere non ammesso
    [InlineData("")]
    public void CodiceFiscaleSbagliato(string codiceFiscale)
    {
        Assert.False(Validazioni.CodiceFiscaleValido(codiceFiscale));
    }

    [Fact]
    public void CodiceFiscaleNulloNonFaEsplodereNiente()
    {
        Assert.False(Validazioni.CodiceFiscaleValido(null));
    }

    // ----- Controllo del documento ----------------------------------------

    private static Documento DocumentoValido()
    {
        return new Documento
        {
            Tipo = TipoDocumento.Fattura,
            Anno = 2026,
            Numero = "1",
            Data = new DateTime(2026, 3, 10),
            ClienteDenominazione = "Rossi Costruzioni Srl",
            ClientePartitaIva = "12345678903",
            ClienteNazione = "IT",
            Righe =
            {
                new RigaDocumento
                {
                    Descrizione = "Consulenza",
                    Quantita = 1m,
                    PrezzoUnitario = 500m,
                    AliquotaIva = 22m
                }
            }
        };
    }

    [Fact]
    public void DocumentoCompletoNonDaErrori()
    {
        Assert.Empty(Validazioni.ControllaDocumento(DocumentoValido()));
    }

    [Fact]
    public void SegnalaClienteSenzaIdentificativoFiscale()
    {
        var documento = DocumentoValido();
        documento.ClientePartitaIva = "";
        documento.ClienteCodiceFiscale = "";

        var errori = Validazioni.ControllaDocumento(documento);

        Assert.Contains(errori, e => e.Contains("ne' partita IVA ne' codice fiscale"));
    }

    [Fact]
    public void SegnalaPartitaIvaNonValida()
    {
        var documento = DocumentoValido();
        documento.ClientePartitaIva = "12345678901";

        var errori = Validazioni.ControllaDocumento(documento);

        Assert.Contains(errori, e => e.Contains("partita IVA del cliente non e' valida"));
    }

    [Fact]
    public void SegnalaAliquotaZeroSenzaNatura()
    {
        var documento = DocumentoValido();
        documento.Righe[0].AliquotaIva = 0m;
        documento.Righe[0].NaturaIva = "";

        var errori = Validazioni.ControllaDocumento(documento);

        Assert.Contains(errori, e => e.Contains("senza codice natura"));
    }

    [Fact]
    public void SegnalaNaturaSuAliquotaDiversaDaZero()
    {
        var documento = DocumentoValido();
        documento.Righe[0].AliquotaIva = 22m;
        documento.Righe[0].NaturaIva = "N1";

        var errori = Validazioni.ControllaDocumento(documento);

        Assert.Contains(errori, e => e.Contains("solo con aliquota a zero"));
    }

    [Fact]
    public void SegnalaDocumentoSenzaRighe()
    {
        var documento = DocumentoValido();
        documento.Righe.Clear();

        var errori = Validazioni.ControllaDocumento(documento);

        Assert.Contains(errori, e => e.Contains("non ha righe"));
    }

    [Fact]
    public void RaccoglieTuttiGliErroriInsiemeNonSoloIlPrimo()
    {
        var documento = DocumentoValido();
        documento.Numero = "";
        documento.ClienteDenominazione = "";
        documento.Righe[0].Descrizione = "";

        var errori = Validazioni.ControllaDocumento(documento);

        Assert.True(errori.Count >= 3,
            "Ci si aspettano almeno 3 segnalazioni, trovate: " + errori.Count);
    }
}
