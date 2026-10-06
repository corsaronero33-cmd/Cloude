"""
AppSheet non ha una funzione "aggiungi mesi". Si usa un giro di parole con
EOMONTH. Qui si provano le due versioni che si trovano in giro, confrontandole
con il risultato corretto, su tutte le date di vent'anni.

Semantica AppSheet:
  EOMONTH(d, n)  ultimo giorno del mese n mesi dopo d
  DAY(d)         il numero del giorno
  data + intero  somma giorni
"""
from calendar import monthrange
from datetime import date, timedelta

def eomonth(d, n):
    totale = d.year * 12 + (d.month - 1) + n
    anno, mese = divmod(totale, 12)
    return date(anno, mese + 1, monthrange(anno, mese + 1)[1])

def corretto(d, mesi):
    """Il risultato giusto: stesso giorno del mese, limitato all'ultimo
    disponibile (31 gennaio + 1 mese = 28 o 29 febbraio)."""
    totale = d.year * 12 + (d.month - 1) + mesi
    anno, mese = divmod(totale, 12)
    return date(anno, mese + 1, min(d.day, monthrange(anno, mese + 1)[1]))

def formula_semplice(d, mesi):
    "EOMONTH([D], mesi-1) + DAY([D])"
    return eomonth(d, mesi - 1) + timedelta(days=d.day)

def formula_sicura(d, mesi):
    "MIN(LIST(EOMONTH([D], mesi-1) + DAY([D]), EOMONTH([D], mesi)))"
    return min(eomonth(d, mesi - 1) + timedelta(days=d.day), eomonth(d, mesi))

for mesi in (12, 24, 36):
    sbagliate_semplice, sbagliate_sicura, esempi = 0, 0, []
    g = date(2015, 1, 1)
    while g < date(2035, 1, 1):
        atteso = corretto(g, mesi)
        if formula_semplice(g, mesi) != atteso:
            sbagliate_semplice += 1
            if len(esempi) < 3:
                esempi.append((g, atteso, formula_semplice(g, mesi)))
        if formula_sicura(g, mesi) != atteso:
            sbagliate_sicura += 1
        g += timedelta(days=1)
    print(f"cadenza {mesi} mesi, su 7305 date:")
    print(f"  formula semplice : {sbagliate_semplice} sbagliate")
    for g, atteso, ottenuto in esempi:
        print(f"      {g} -> atteso {atteso}, la formula dà {ottenuto}  (in RITARDO)")
    print(f"  formula sicura   : {sbagliate_sicura} sbagliate")
