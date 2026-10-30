# Scheda 17 — Tutti alla stessa misura (tappa 5)

Scheda di lavoro con le spunte:
<https://claude.ai/artifact/B1Z6cACD2TLeCmvs4mioqv>

L'unica tappa che **non costruisce niente**: mette in riga quindici formati.

---

## La regola

| | |
|---|---|
| Larghezza di tutti i formati | **1020** |
| Margine sinistro | **24** |
| Bordo destro: dove chiude tutto | **996** |

**Qui le misure non sono "di partenza".** Non perche' 1020 sia sacro — 1000 o
1024 vanno uguale — ma perche' il punto della tappa e' che siano **tutte
uguali**: una larghezza diversa su un formato solo rimette la finestra a
saltare.

**1020 viene dal file.** Le sei schede si sono assestate da sole fra 1004 e
1018 costruendo. Il 960 proposto a tavolino era sbagliato: il file vince sulla
guida.

## Le sei schede

Da 701 / 1004 / 1010 / 1018 a **1020**. Su ognuna, i tre oggetti che chiudono
al bordo destro:

| Oggetto | Come |
|---|---|
| `<<$$UTENTE.Nome>>` | largo 255, **x 741** |
| I rettangoli dei riquadri | x **24**, larghi **972** |
| I campi della colonna destra, `Note`, `AzioneCorrettiva` | fino a **996** |

`D_Reparti scheda` e' quella che cambia di piu' (da 701): dopo averla
allargata, i campi vanno ridistribuiti su due colonne.

Su `D_Impresa Scheda`, gia' che si apre: **rinominarlo con la *s* minuscola**.

## Gli elenchi

`Apri` a x **24** largo **51**, prima colonna a x **81**, ultima che chiude a
**996**. Colonne contigue.

### `D_Reparti elenco` — da 725

| Colonna | X | Largh. | fino a |
|---|---|---|---|
| `Apri` | 24 | 51 | 75 |
| Codice | 81 | 180 | 261 |
| Descrizione | 261 | 575 | 836 |
| Ordine | 836 | 80 | 916 |
| Attivo | 916 | 80 | **996** |

### `D_Attrezzature elenco` — da 968

| Colonna | X | Largh. | fino a |
|---|---|---|---|
| `Apri` | 24 | 51 | 75 |
| Codice | 81 | 170 | 251 |
| Descrizione | 251 | 320 | 571 |
| Tipo | 571 | 175 | 746 |
| Reparto | 746 | 250 | **996** |

### `D_Fornitori elenco` — da 968

| Colonna | X | Largh. | fino a |
|---|---|---|---|
| `Apri` | 24 | 51 | 75 |
| Ragione sociale | 81 | 340 | 421 |
| Partita IVA | 421 | 150 | 571 |
| Citta | 571 | 175 | 746 |
| Telefono | 746 | 150 | 896 |
| Qualificato | 896 | 100 | **996** |

### `D_Prodotti elenco` — da 1097

| Colonna | X | Largh. | fino a |
|---|---|---|---|
| `Apri` | 24 | 51 | 75 |
| Descrizione | 81 | 320 | 401 |
| Codice | 401 | 120 | 521 |
| GTIN | 521 | 150 | 671 |
| Fornitore | 671 | 225 | 896 |
| Conservazione | 896 | 100 | **996** |

Il GTIN resta a 150: sono quattordici cifre, ed e' il codice con cui si
trovera' un prodotto leggendolo col telefono.

### `D_Operatori elenco` — da 1248

| Colonna | X | Largh. | fino a |
|---|---|---|---|
| `Apri` | 24 | 51 | 75 |
| Cognome | 81 | 185 | 266 |
| Nome | 266 | 170 | 436 |
| Mansione | 436 | 170 | 606 |
| Ruolo | 606 | 120 | 726 |
| Account FM | 726 | 190 | 916 |
| Attivo | 916 | 80 | **996** |

### `D_PuntiControllo elenco` — da 1271

| Colonna | X | Largh. | fino a |
|---|---|---|---|
| `Apri` | 24 | 51 | 75 |
| Codice | 81 | 100 | 181 |
| Descrizione | 181 | 300 | 481 |
| Tipo | 481 | 60 | 541 |
| Fase | 541 | 140 | 681 |
| O. atteso 1 | 681 | 90 | 771 |
| Reparto | 771 | 160 | 931 |
| Attivo | 931 | 65 | **996** |

Otto colonne in 915 punti, il piu' stretto. `Tipo` a 60 perche' ci sta `CCP`;
`Descrizione` resta la piu' larga perche' e' l'unica che si legge.

### `D_Parametri elenco` — da 1295

Niente `Apri`: la prima colonna parte da 24.

| Colonna | X | Largh. | fino a |
|---|---|---|---|
| Chiave | 24 | 260 | 284 |
| Descrizione | 284 | 452 | 736 |
| Tipo | 736 | 100 | 836 |
| Valore — **tutti e due i campi** | 836 | 160 | **996** |

**I due campi `Valore` vanno spostati insieme**, selezionandoli con un
rettangolo di selezione: sono sovrapposti e se ne vede uno per volta, quindi
uno sfasamento di due punti si scopre mesi dopo. Il campo `Categoria` nella
fascia va a x 24, largo 260.

## `D_Menu` — da 731

Quattro colonne di pulsanti larghi **231**:

| Colonna | X | fino a |
|---|---|---|
| 1 | 24 | 255 |
| 2 | 271 | 502 |
| 3 | 518 | 749 |
| 4 | 765 | **996** |

Le tre linee sotto i titoli di gruppo: da 24 a 996.

## I due script che dicono la cosa sbagliata

### `90 - Utilita - Vai a`

Due novita': il controllo dell'**errore 105** (formato mancante) separato da
ogni altro errore, e l'`Esci dallo script` finale che restituisce `"ok"`.

```
Imposta acquisizione errori [ Attivato ]
Imposta variabile [ $formato ; Valore: Get ( ParametroScript ) ]
Se [ IsEmpty ( $formato ) ]
    Esci dallo script [ Risultato del testo: "" ]
Fine se
Vai al formato [ Nome del formato per calcolo: $formato ]
Imposta variabile [ $errore ; Valore: Get ( UltimoErrore ) ]
Se [ $errore = 105 ]
    Mostra finestra di dialogo personalizzata
        [ "Non ancora pronto" ; "La maschera " & $formato & " non c'e' ancora." ]
    Esci dallo script [ Risultato del testo: "" ]
Fine se
Se [ $errore <> 0 ]
    Mostra finestra di dialogo personalizzata
        [ "Accesso negato" ;
          "Non hai i permessi per aprire " & $formato & ". Errore " & $errore & "." ]
    Esci dallo script [ Risultato del testo: "" ]
Fine se
Mostra tutti i record
Esci dallo script [ Risultato del testo: "ok" ]
```

### `93 - Utilita - Nuovo`

```
Esegui script [ "90 - Utilita - Vai a" ; Parametro: Get ( ParametroScript ) ]
Se [ Get ( RisultatoScript ) <> "ok" ]
    Esci dallo script [ ]
Fine se
Nuovo record/richiesta
```

**Vanno cambiati insieme:** il `93` legge quello che il `90` restituisce.

## I ritocchi rimasti

- Lo stile del tema si chiama ancora `Titolo Riquadro`: rinominarlo
  **`Titolo maschera`** e risalvare il tema.
- Il trigger della casella di ricerca da `OnObjectExit` a **`OnObjectSave`**:
  cosi' la ricerca non riparte uscendo dal campo per cliccare `Apri`.
- Giro di controllo sulle spunte della **Ricerca rapida**: spente su tutti i
  campi collegati e su `O. atteso 1`.

## Collaudo

Otto prove. La prima e' quella che vale la tappa: **aprire tutte e tredici le
destinazioni dal menu e tornare indietro, senza che la finestra cambi mai
larghezza.**

La **6.9** e' l'unica che distingue il `93` vecchio dal nuovo: si copia il
pulsante `+ Nuovo`, gli si mette il parametro `"D_Pippo"` — un formato che non
esiste — e si guarda il **contatore**. Con il `93` vecchio sale di uno e nasce
una riga vuota in mezzo ai dati; con il nuovo non succede niente.

### Una prova che avevo scritto male

La prima versione della `6.8` diceva che da operatore un pulsante vietato
avrebbe risposto *"non hai i permessi"*. **Non puo' succedere:** nel set
`Operatore` tutti i formati sono visualizzabili e tutte le ventuno tabelle
leggibili, quindi non c'e' niente che gli venga rifiutato. E nel ramo del
formato mancante il messaggio nuovo e' **identico** al vecchio, quindi
guardandolo non si distinguerebbe comunque quale script sta girando.

I quattro pulsanti dei registri puntano a formati che arriveranno alla tappa
6: li' *"non c'e' ancora"* e' la risposta **giusta**.

**Il ramo "accesso negato" e' una rete per il futuro.** Si attivava il 3
ottobre, quando i privilegi erano vuoti. Da quando sono compilati non si
attiva piu', ed e' giusto cosi'.

---

## Poi

**Tappa 6: `D_Rilevazioni`.** Lo script `20` che confronta con i limiti,
scrive l'esito e apre da solo la non conformita' e' scritto e collaudato dal
primo giorno. Alla tappa 6 gli si mette davanti una faccia.
