"""Unico punto del programma che si collega al database."""

from sqlalchemy import URL, create_engine, text

from libra.config import leggi_impostazioni

_motore = None


def motore():
    """Restituisce il collegamento al database, creandolo la prima volta."""
    global _motore
    if _motore is None:
        imp = leggi_impostazioni()
        indirizzo = URL.create(
            "postgresql+psycopg",
            username=imp["utente"],
            password=imp["password"],
            host=imp["host"],
            port=imp["porta"],
            database=imp["nome"],
        )
        _motore = create_engine(indirizzo, pool_pre_ping=True)
    return _motore


def versione_server():
    """Chiede al server la sua versione: serve a collaudare il collegamento."""
    with motore().connect() as conn:
        return conn.execute(text("SELECT version()")).scalar_one()
