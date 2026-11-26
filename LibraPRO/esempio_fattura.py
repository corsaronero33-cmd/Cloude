"""Prova a mano dei calcoli: stampa una piccola fattura a video."""

from decimal import Decimal

from libra.core.calcoli import importo_riga, riepilogo_iva, totale_documento

righe = [
    {"descrizione": "Maglia cotone", "quantita": Decimal("2"), "prezzo": Decimal("15.00"),
     "aliquota": Decimal("22"), "sconti": "10"},
    {"descrizione": "Calze (3 paia)", "quantita": Decimal("1"), "prezzo": Decimal("8.90"),
     "aliquota": Decimal("22")},
    {"descrizione": "Pane integrale", "quantita": Decimal("1.5"), "prezzo": Decimal("3.20"),
     "aliquota": Decimal("4")},
]

print(f"{'Descrizione':<20}{'Q.ta':>6}{'Prezzo':>9}{'Sconto':>8}{'Importo':>10}{'IVA':>5}")
print("-" * 58)
for riga in righe:
    sconti = riga.get("sconti", "")
    importo = importo_riga(riga["quantita"], riga["prezzo"], sconti)
    print(f"{riga['descrizione']:<20}{riga['quantita']:>6}{riga['prezzo']:>9}"
          f"{sconti:>8}{importo:>10}{riga['aliquota']:>4}%")

riepilogo = riepilogo_iva(righe)
print()
print("Riepilogo IVA")
for aliquota, valori in riepilogo.items():
    print(f"  {aliquota:>3}%  imponibile {valori['imponibile']:>8}  imposta {valori['imposta']:>6}")

totali = totale_documento(riepilogo)
print()
print(f"Totale imponibile {totali['imponibile']:>10}")
print(f"Totale IVA        {totali['imposta']:>10}")
print(f"TOTALE DOCUMENTO  {totali['totale']:>10}")
