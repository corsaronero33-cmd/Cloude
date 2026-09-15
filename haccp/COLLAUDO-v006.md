# Collaudo v006 — motore completo

Verifica sul file salvato in XML, archiviato in `haccp/ddr/v006/`.

## Le due correzioni sono fatte

| | Esito |
|---|---|
| `Inserisci da dispositivo` -> `RigheRicevimento::CodiceScansionato` | **corretto** |
| `Imposta variabile [ $idNC ; NonConformita::Id ]` prima di `Chiudi finestra` | **presente**, e nella posizione giusta |

Lo script `20` e' passato da 47 a 48 passi: quello aggiunto e' esattamente
quel passo, nessun altro e' stato toccato.

## Niente si e' rotto altrove

21 tabelle, 79 occorrenze, 42 relazioni, 25 liste valori, 13 funzioni,
5 script, 27 formati.

Chiavi primarie a posto su tutte e 21 le tabelle. Eliminazione a cascata
ancora solo fra `RIC|Ricevimenti` e `RIC|RigheRicevimento`, dove deve stare.
Conteggio dei passi invariato sugli altri quattro script.

## Resta una rifinitura

`Rilevazioni::gValore` e' ancora di tipo **Testo**, dovrebbe essere
**Numero**: e' il campo in cui l'operatore scrive la temperatura. Non blocca
niente, perche' FileMaker converte da solo quando il valore finisce nel campo
`Valore`, ma un `3,5o` battuto male passerebbe senza protestare.

Da fare quando capita, non e' urgente.

---

## Stato del progetto

Il **motore e' completo**. Il file sa:

- caricare la propria configurazione e riconoscere chi lo sta usando;
- giudicare una misura confrontandola con i limiti del punto di controllo,
  senza avere nessun limite scritto dentro il codice;
- aprire da solo una non conformita' quando la misura esce dai limiti,
  portandosi dentro l'azione correttiva prevista, con gravita' alta sui CCP,
  e legandola alla rilevazione in entrambe le direzioni;
- leggere lotto e scadenza dal codice a barre di un cartone;
- calcolare scadenze effettive, semafori e validita' di una partita IVA.

Quello che manca e' **l'interfaccia**: oggi tutto questo si comanda dai
formati automatici dell'importazione, che nessun operatore potrebbe usare.

Prossimo passo: `13-LAYOUT.md`, a partire dal ricevimento merci su iPhone.
