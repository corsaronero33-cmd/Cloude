namespace Cloude.Nucleo;

// ---------------------------------------------------------------------------
// MOTORE DI CALCOLO DEL DOCUMENTO
//
// "static class" vuol dire: contenitore di funzioni, non un oggetto da creare.
// Si chiamano cosi':   var t = CalcoloDocumento.Calcola(righe);
// E' l'equivalente di un modulo .prg di Clipper pieno di FUNCTION.
//
// Tutte le funzioni qui dentro sono pure: stessi dati in ingresso -> stesso
// risultato, nessuna lettura di file, nessuna variabile globale. Per questo
// si riescono a collaudare con i test automatici senza database.
// ---------------------------------------------------------------------------

public static class CalcoloDocumento
{
    // Arrotondamento commerciale a 2 decimali: 0,005 va a 0,01.
    //
    // Nota importantissima: gli importi sono di tipo "decimal" e mai "double".
    // Il tipo double lavora in base 2 e non sa rappresentare esattamente 0,10:
    // sommando dieci volte 0,10 non ottiene 1,00 ma 0,9999999999999999. Su una
    // fattura questo diventa uno scarto di un centesimo che il Sistema di
    // Interscambio scarta. Il tipo decimal lavora in base 10 ed e' esatto.
    public static decimal Arrotonda(decimal valore)
    {
        return Math.Round(valore, 2, MidpointRounding.AwayFromZero);
    }

    // Imponibile di una singola riga, sconto gia' applicato.
    public static decimal ImponibileRiga(RigaDocumento riga)
    {
        decimal lordo = riga.Quantita * riga.PrezzoUnitario;
        decimal sconto = lordo * riga.ScontoPercentuale / 100m;
        return Arrotonda(lordo - sconto);
    }

    // Calcola riepilogo IVA e totali di un documento intero.
    public static TotaliDocumento Calcola(List<RigaDocumento> righe)
    {
        var totali = new TotaliDocumento();
        if (righe == null || righe.Count == 0)
            return totali;

        // Primo giro: sommo gli imponibili raggruppando per aliquota + natura.
        // Il dizionario mi serve solo a ritrovare in fretta il gruppo giusto;
        // i gruppi veri e propri stanno nella lista totali.Riepiloghi.
        var indice = new Dictionary<string, RiepilogoIva>();

        foreach (var riga in righe)
        {
            string chiave = ChiaveRiepilogo(riga.AliquotaIva, riga.NaturaIva);

            RiepilogoIva gruppo;
            if (!indice.TryGetValue(chiave, out gruppo))
            {
                gruppo = new RiepilogoIva
                {
                    AliquotaIva = riga.AliquotaIva,
                    NaturaIva = riga.NaturaIva
                };
                indice[chiave] = gruppo;
                totali.Riepiloghi.Add(gruppo);
            }

            gruppo.Imponibile += ImponibileRiga(riga);
        }

        // Secondo giro: l'imposta si calcola UNA VOLTA SOLA sul totale
        // imponibile di ogni aliquota, non riga per riga.
        //
        // Non e' un dettaglio estetico: con tre righe da 10,10 euro al 22%,
        // l'IVA riga per riga fa 2,22 x 3 = 6,66, mentre sul totale fa
        // 30,30 x 22% = 6,67. Il tracciato FatturaPA impone il secondo
        // risultato, e un controllo del Sistema di Interscambio verifica
        // proprio questa quadratura. Sbagliare qui significa fatture scartate.
        foreach (var gruppo in totali.Riepiloghi)
        {
            gruppo.Imponibile = Arrotonda(gruppo.Imponibile);
            gruppo.Imposta = Arrotonda(gruppo.Imponibile * gruppo.AliquotaIva / 100m);

            totali.TotaleImponibile += gruppo.Imponibile;
            totali.TotaleImposta += gruppo.Imposta;
        }

        totali.TotaleDocumento = totali.TotaleImponibile + totali.TotaleImposta;

        // Ordino i riepiloghi per aliquota crescente, cosi' la stampa e il file
        // XML escono sempre uguali a parita' di dati. La riga qui sotto e' il
        // modo di C# per dire "ordina usando questo criterio di confronto".
        totali.Riepiloghi.Sort((a, b) =>
        {
            int confronto = a.AliquotaIva.CompareTo(b.AliquotaIva);
            if (confronto != 0) return confronto;
            return string.Compare(a.NaturaIva, b.NaturaIva, StringComparison.Ordinal);
        });

        return totali;
    }

    // Chiave di raggruppamento. Uso il formato fisso a 2 decimali perche'
    // 22 e 22,00 devono finire nello stesso gruppo.
    private static string ChiaveRiepilogo(decimal aliquota, string natura)
    {
        string a = aliquota.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture);
        return a + "|" + (natura ?? "");
    }
}
