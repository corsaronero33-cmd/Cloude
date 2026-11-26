from decimal import Decimal

import pytest

from libra.core.calcoli import (
    applica_sconti,
    arrotonda,
    importo_riga,
    riepilogo_iva,
    totale_documento,
)


def test_arrotonda_mezzo_centesimo_va_in_su():
    assert arrotonda(Decimal("2.345")) == Decimal("2.35")
    assert arrotonda(Decimal("2.344")) == Decimal("2.34")


def test_sconti_in_cascata():
    assert applica_sconti(Decimal("100"), "10+5") == Decimal("85.5")


def test_nessuno_sconto():
    assert applica_sconti(Decimal("100"), "") == Decimal("100")


def test_sconto_con_virgola():
    assert applica_sconti(Decimal("100"), "12,5") == Decimal("87.5")


def test_sconto_non_valido():
    with pytest.raises(ValueError):
        applica_sconti(Decimal("100"), "150")


def test_importo_riga():
    assert importo_riga(Decimal("3"), Decimal("9.99"), "10") == Decimal("26.97")


def test_riepilogo_e_totale():
    righe = [
        {"quantita": Decimal("2"), "prezzo": Decimal("10.00"), "aliquota": Decimal("22")},
        {"quantita": Decimal("1"), "prezzo": Decimal("5.50"), "aliquota": Decimal("22")},
        {"quantita": Decimal("4"), "prezzo": Decimal("1.25"), "aliquota": Decimal("4")},
    ]
    riepilogo = riepilogo_iva(righe)

    assert riepilogo[Decimal("22")]["imponibile"] == Decimal("25.50")
    assert riepilogo[Decimal("22")]["imposta"] == Decimal("5.61")
    assert riepilogo[Decimal("4")]["imponibile"] == Decimal("5.00")
    assert riepilogo[Decimal("4")]["imposta"] == Decimal("0.20")

    totali = totale_documento(riepilogo)
    assert totali["totale"] == Decimal("36.31")
