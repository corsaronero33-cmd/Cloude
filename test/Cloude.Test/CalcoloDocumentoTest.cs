using Cloude.Nucleo;
using Xunit;

namespace Cloude.Test;

// I test servono a bloccare le regole di calcolo: se fra sei mesi qualcuno
// (tu, io, o una modifica fatta di fretta) cambia il modo di arrotondare,
// qui salta fuori subito invece che in una fattura scartata dal Sistema di
// Interscambio.

public class CalcoloDocumentoTest
{
    private static RigaDocumento Riga(decimal quantita, decimal prezzo,
                                      decimal aliquota = 22m, decimal sconto = 0m,
                                      string natura = "")
    {
        return new RigaDocumento
        {
            Descrizione = "prova",
            Quantita = quantita,
            PrezzoUnitario = prezzo,
            AliquotaIva = aliquota,
            ScontoPercentuale = sconto,
            NaturaIva = natura
        };
    }

    [Fact]
    public void RigaSemplice()
    {
        var righe = new List<RigaDocumento> { Riga(2m, 100m) };
        var totali = CalcoloDocumento.Calcola(righe);

        Assert.Equal(200.00m, totali.TotaleImponibile);
        Assert.Equal(44.00m, totali.TotaleImposta);
        Assert.Equal(244.00m, totali.TotaleDocumento);
    }

    [Fact]
    public void ScontoApplicatoSullaRiga()
    {
        // 10 pezzi x 50,00 = 500,00 meno 10% = 450,00
        var righe = new List<RigaDocumento> { Riga(10m, 50m, sconto: 10m) };
        var totali = CalcoloDocumento.Calcola(righe);

        Assert.Equal(450.00m, totali.TotaleImponibile);
        Assert.Equal(99.00m, totali.TotaleImposta);
    }

    [Fact]
    public void ImpostaCalcolataSulTotaleDellAliquotaNonRigaPerRiga()
    {
        // Questo e' IL test importante.
        // Tre righe da 10,10: riga per riga l'IVA farebbe 2,22 x 3 = 6,66.
        // Sul totale imponibile fa 30,30 x 22% = 6,666 -> 6,67.
        // Il tracciato FatturaPA vuole 6,67 e il Sistema di Interscambio
        // verifica proprio questa quadratura.
        var righe = new List<RigaDocumento>
        {
            Riga(1m, 10.10m),
            Riga(1m, 10.10m),
            Riga(1m, 10.10m)
        };

        var totali = CalcoloDocumento.Calcola(righe);

        Assert.Equal(30.30m, totali.TotaleImponibile);
        Assert.Equal(6.67m, totali.TotaleImposta);
        Assert.Equal(36.97m, totali.TotaleDocumento);
    }

    [Fact]
    public void AliquoteDiverseFinisconoInRiepiloghiSeparati()
    {
        var righe = new List<RigaDocumento>
        {
            Riga(1m, 100m, aliquota: 22m),
            Riga(1m, 100m, aliquota: 10m),
            Riga(1m, 100m, aliquota: 22m)
        };

        var totali = CalcoloDocumento.Calcola(righe);

        Assert.Equal(2, totali.Riepiloghi.Count);

        // Ordinati per aliquota crescente: prima il 10%, poi il 22%.
        Assert.Equal(10m, totali.Riepiloghi[0].AliquotaIva);
        Assert.Equal(100.00m, totali.Riepiloghi[0].Imponibile);
        Assert.Equal(10.00m, totali.Riepiloghi[0].Imposta);

        Assert.Equal(22m, totali.Riepiloghi[1].AliquotaIva);
        Assert.Equal(200.00m, totali.Riepiloghi[1].Imponibile);
        Assert.Equal(44.00m, totali.Riepiloghi[1].Imposta);

        Assert.Equal(300.00m, totali.TotaleImponibile);
        Assert.Equal(54.00m, totali.TotaleImposta);
        Assert.Equal(354.00m, totali.TotaleDocumento);
    }

    [Fact]
    public void StessaAliquotaMaNaturaDiversaRestaSeparata()
    {
        var righe = new List<RigaDocumento>
        {
            Riga(1m, 100m, aliquota: 0m, natura: "N1"),
            Riga(1m, 100m, aliquota: 0m, natura: "N3")
        };

        var totali = CalcoloDocumento.Calcola(righe);

        Assert.Equal(2, totali.Riepiloghi.Count);
        Assert.Equal(200.00m, totali.TotaleImponibile);
        Assert.Equal(0.00m, totali.TotaleImposta);
    }

    [Fact]
    public void DocumentoVuotoDaTuttiZeri()
    {
        var totali = CalcoloDocumento.Calcola(new List<RigaDocumento>());

        Assert.Empty(totali.Riepiloghi);
        Assert.Equal(0m, totali.TotaleDocumento);
    }

    [Fact]
    public void ArrotondamentoCommercialeVersoLAlto()
    {
        // 0,005 deve andare a 0,01, non a 0,00 (che sarebbe l'arrotondamento
        // "bancario", il comportamento predefinito di .NET).
        Assert.Equal(0.01m, CalcoloDocumento.Arrotonda(0.005m));
        Assert.Equal(2.35m, CalcoloDocumento.Arrotonda(2.345m));
    }
}
