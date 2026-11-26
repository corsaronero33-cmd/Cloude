"""Collaudo del collegamento al database."""

from libra.db.connessione import versione_server

try:
    print("Collegato a:", versione_server())
except Exception as errore:
    print("Collegamento NON riuscito.")
    print(type(errore).__name__, "-", errore)
