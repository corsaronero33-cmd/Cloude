namespace Cassa.Core.Vendite;

/// <summary>
/// Una riga dello scontrino.
///
/// I prezzi di un negozio sono prezzi al pubblico, quindi IVA compresa:
/// l'imponibile non si somma, si ricava per scorporo.
/// </summary>
public sealed class RigaVendita
{
    public string Descrizione { get; init; } = "";
    public decimal Quantita { get; init; }              // anche 0,350 (kg)
    public decimal PrezzoUnitarioLordo { get; init; }   // IVA compresa
    public decimal ScontoPercentuale { get; init; }     // da 0 a 100
    public decimal AliquotaIva { get; init; }           // 22, 10, 5, 4, 0

    public decimal TotaleLordo =>
        Arrotonda(Quantita * PrezzoUnitarioLordo * (1m - ScontoPercentuale / 100m));

    public decimal Imponibile =>
        Arrotonda(TotaleLordo / (1m + AliquotaIva / 100m));

    // L'imposta si ricava per DIFFERENZA, non ricalcolandola a parte.
    // Cosi' imponibile + imposta fa sempre esattamente il totale lordo.
    // Arrotondando le due voci separatamente si rischia un centesimo di
    // scarto: il registratore telematico lo rifiuta, e lo scontrino non esce.
    public decimal Imposta => TotaleLordo - Imponibile;

    // Arrotondamento commerciale: 0,005 va a 0,01.
    // ATTENZIONE: Math.Round in .NET per default arrotonda "al pari"
    // (0,125 -> 0,12 invece di 0,13). Non e' quello che vuole il fisco
    // italiano, quindi MidpointRounding.AwayFromZero va messo sempre.
    private static decimal Arrotonda(decimal valore) =>
        Math.Round(valore, 2, MidpointRounding.AwayFromZero);
}
