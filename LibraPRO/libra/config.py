"""Impostazioni locali della postazione, lette da libra.ini."""

import configparser
from pathlib import Path

# La cartella LibraPRO: due livelli sopra questo file (libra/config.py).
CARTELLA_PROGETTO = Path(__file__).resolve().parent.parent
FILE_IMPOSTAZIONI = CARTELLA_PROGETTO / "libra.ini"


def leggi_impostazioni(percorso=FILE_IMPOSTAZIONI):
    """Legge libra.ini e restituisce le impostazioni del database."""
    if not percorso.exists():
        raise FileNotFoundError(
            f"Manca {percorso.name}: copia libra.ini.esempio come libra.ini"
        )

    ini = configparser.ConfigParser()
    ini.read(percorso, encoding="utf-8")
    sezione = ini["database"]
    return {
        "host": sezione.get("host", "localhost"),
        "porta": sezione.getint("porta", 5432),
        "nome": sezione["nome"],
        "utente": sezione["utente"],
        "password": sezione["password"],
    }
