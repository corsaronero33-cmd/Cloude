# Collaudo 012 — `HACCP_Revisione_11.xml`

**Tappa 3 chiusa: nessun difetto aperto.** Tutti e dodici i passi del
collaudo 011 risultano eseguiti nel file.

| Correzione chiesta | Come risulta |
|---|---|
| Il campo del riquadro 3 era `OrarioAtteso1` | ora e' **`AzioneCorrettiva`**, x 167, largo 802 |
| `IdAttrezzatura` aveva `vl_TipoAttrezzatura` | ora **`vl_Attrezzature`**, controllo Menu a comparsa |
| Etichetta `Richiede Foto` ripetuta a destra | ora **`Richiede Firma`** |
| Oggetto testo vuoto a y 268 | tolto |
| Oggetto testo vuoto a y 619 | tolto |
| Set `Operatore`, tabelle future | ora `View: ReadWrite`, **modifica e creazione negate** |
| Etichette di colonna a y 113 / 115 | ora **tutte a y 114** |

## Una colonna aggiunta di tua iniziativa

Sull'elenco c'e' ora **`O. ATTESO 1`** (`OrarioAtteso1`, x 797, largo 131), e
l'etichetta ha la stessa X e la stessa larghezza del campo. Otto colonne.

Utile: fa vedere a colpo d'occhio quali controlli hanno un orario fissato e
quali no, che e' esattamente la cosa da decidere col ristoratore.

**Da verificare a mano:** la Ricerca rapida su quella colonna dovrebbe essere
**spenta** — cercare un orario non serve, e un campo in piu' nella ricerca
rapida la rallenta. Le spunte non finiscono nell'export.

## Larghezze aggiornate

`D_PuntiControllo elenco` e' passato da 1126 a **1271** per fare posto alla
colonna nuova: e' diventato il formato piu' largo del file, davanti a
`D_Operatori elenco` (1248).

Non cambia niente oggi. Alla **tappa 5** sara' il primo da ridistribuire.

## Stato

| | |
|---|---|
| Tappe chiuse | 0, 1, 2, **3** |
| Difetti aperti | nessuno |
| In panchina | le voci della `TABELLA-DI-MARCIA.md`, invariate |
