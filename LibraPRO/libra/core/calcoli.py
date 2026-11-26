"""Calcoli di base dei documenti: righe, sconti, riepilogo IVA, totali.

Tutti gli importi sono Decimal (mai float) e i prezzi sono al netto di IVA.
"""

from decimal import Decimal, ROUND_HALF_UP

DUE_DECIMALI = Decimal("0.01")


def arrotonda(valore):
    """Arrotonda a 2 decimali con la regola commerciale (0,005 -> 0,01)."""
    return valore.quantize(DUE_DECIMALI, rounding=ROUND_HALF_UP)


def applica_sconti(prezzo, sconti=""):
    """Applica sconti in cascata scritti come testo, es. "10+5".

    100 con "10+5" diventa 100 * 0,90 * 0,95 = 85,50.
    Una stringa vuota significa nessuno sconto.
    """
    risultato = prezzo
    if sconti.strip() == "":
        return risultato

    for pezzo in sconti.split("+"):
        percentuale = Decimal(pezzo.strip().replace(",", "."))
        if percentuale < 0 or percentuale > 100:
            raise ValueError(f"Sconto non valido: {pezzo}")
        risultato = risultato * (100 - percentuale) / 100
    return risultato


def importo_riga(quantita, prezzo_unitario, sconti=""):
    """Importo netto di una riga, arrotondato a 2 decimali."""
    prezzo_scontato = applica_sconti(prezzo_unitario, sconti)
    return arrotonda(quantita * prezzo_scontato)


def riepilogo_iva(righe):
    """Raggruppa le righe per aliquota e calcola imponibile e imposta.

    Ogni riga e' un dizionario con le chiavi:
    "quantita", "prezzo", "aliquota" e, facoltativa, "sconti".

    Restituisce un dizionario {aliquota: {"imponibile": ..., "imposta": ...}}.
    L'imposta si calcola sul totale imponibile di ciascuna aliquota, non riga
    per riga: e' quello che richiede la fattura elettronica.
    """
    riepilogo = {}
    for riga in righe:
        aliquota = riga["aliquota"]
        importo = importo_riga(riga["quantita"], riga["prezzo"], riga.get("sconti", ""))
        if aliquota not in riepilogo:
            riepilogo[aliquota] = {"imponibile": Decimal("0"), "imposta": Decimal("0")}
        riepilogo[aliquota]["imponibile"] += importo

    for aliquota, valori in riepilogo.items():
        valori["imposta"] = arrotonda(valori["imponibile"] * aliquota / 100)

    return riepilogo


def totale_documento(riepilogo):
    """Totale imponibile, totale IVA e totale documento da un riepilogo IVA."""
    imponibile = Decimal("0")
    imposta = Decimal("0")
    for valori in riepilogo.values():
        imponibile += valori["imponibile"]
        imposta += valori["imposta"]
    return {"imponibile": imponibile, "imposta": imposta, "totale": imponibile + imposta}
