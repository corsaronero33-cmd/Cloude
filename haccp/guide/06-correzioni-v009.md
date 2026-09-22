# Scheda 06 — Tre correzioni e la larghezza

Scheda di lavoro con le spunte:
<https://claude.ai/artifact/NCa4r1SKiiqyJoSpXLMXBj>

Da `archivio/collaudo-009.md`. Quattro lavori, da fare **prima di duplicare
Fornitori**: ogni anagrafica nata da Attrezzature si porta dietro quello che
c'e' adesso.

---

## Lavoro 1 — Rimettere `+ Nuovo` sugli elenchi

Su tutti e due gli elenchi i pulsanti sono `Menù`, `Tutti`, `Apri`:
**`+ Nuovo` non c'e' piu'**. Con l'elenco **vuoto** non esiste nessun modo di
creare il primo record — alla scheda si arriva solo con `Apri`, e senza righe
non c'e' niente su cui premere.

**Non basta rimetterlo com'era.** Sull'elenco, `Nuovo record/richiesta` crea
una riga vuota in mezzo alle altre: ci si scrive stretto, e i campi con la
tendina sull'elenco non ci sono. Meglio che `+ Nuovo` **crei il record e apra
la scheda**.

### 1a — Lo script `93 - Utilita - Nuovo`

Uno solo per tutta l'applicazione, come il `90` e il `92`.

```
# Crea un record e apre la scheda ricevuta come parametro.
# Lo chiamano i pulsanti + Nuovo degli elenchi.

Nuovo record/richiesta

Se [ not IsEmpty ( Get ( ParametroScript ) ) ]
    Esegui script [ "90 - Utilita - Vai a" ;
                    Parametro: Get ( ParametroScript ) ]
Fine se
```

Il `93` riceve `"D_Attrezzature scheda"` e lo gira al `90`, che sa gia' come
spostarsi e come dire "non ancora pronto" se il formato non c'e'. Non
riscriviamo la navigazione: la chiamiamo.

### 1b — Il pulsante, su tutti e due gli elenchi

1. Su `D_Reparti elenco`, **stringi la casella di ricerca** di 130 punti
   circa, spostandone il bordo sinistro.
2. Seleziona `Menù`, **Ctrl+D**, e metti il duplicato subito a destra, stessa
   Y e stessa altezza.
3. Doppio clic: etichetta `+ Nuovo`, eventualmente l'icona del piu'.
4. Azione **Esegui script** › `93 - Utilita - Nuovo` › parametro
   `"D_Reparti scheda"`, **con le virgolette**.
5. Stessa cosa su `D_Attrezzature elenco`, parametro
   `"D_Attrezzature scheda"`.
6. **Prova:** cerchi `zzz` per svuotare l'elenco, poi `+ Nuovo`. Si crea un
   record e si apre la scheda.

Sulla scheda il `+ Nuovo` resta com'e': sei gia' li', non c'e' dove andare.

---

## Lavoro 2 — Il pulsante `Esci` non esce

Sul menu, `Esci` esegue lo script `90` con parametro `"D_Reparti elenco"`:
duplicandolo ha preso l'aspetto giusto **e anche l'azione** del pulsante da
cui e' nato.

1. Su `D_Menu`, doppio clic sul pulsante `Esci`.
2. Finestra **Imposta pulsante**, tendina **Azione**: da **Esegui script** a
   **Esegui passo script**.
3. Passo **`Esci dall'applicazione`**. Nessun parametro.
4. **Prova:** premi `Esci`. FileMaker si chiude.

E' lo stesso inciampo della fase 3c delle attrezzature, in un altro punto:
duplicando si eredita l'azione, non solo la faccia.

---

## Lavoro 3 — Due spazi di troppo nel nome dello script

Lo script si chiama `"91 - Attrezzature - Entra nell'elenco  "`.

1. `Script` › `Area di lavoro Script`, tasto destro › **Rinomina**.
2. **Fine**, poi **Backspace** due volte. Invio.

Oggi non rompe niente — FileMaker collega per identificatore — ma se un
domani lo script venisse chiamato **per nome** dentro un calcolo non verrebbe
trovato, e due spazi invisibili sono la causa piu' difficile da vedere che
esista.

---

## Lavoro 4 — Una larghezza sola: 960

Oggi il contenuto chiude a **452**, **685**, **725**, **959** e **984** a
seconda del formato.

**La regola nuova:** formato largo **960**, contenuto che chiude a **936** —
ventiquattro dal bordo, come a sinistra. Fondali (il rettangolo bianco delle
colonne, le linee) restano a **tutta larghezza**, da 0 a 960: sono sfondo, non
contenuto.

| Formato | Cosa fare |
|---|---|
| `D_Attrezzature elenco` | colonna `Reparto` da 250 a **227**, **e la stessa alla sua etichetta**; `<<$$UTENTE.Nome>>` a x 681; `Tutti` a x 858 |
| `D_Attrezzature scheda` | i due riquadri e `Note` da **x 24**, larghezza **912**; `<<$$UTENTE.Nome>>` a x 681; i campi della colonna destra accorciati di conseguenza |
| `D_Menu` | quattro pulsanti larghi **216** a **x 24 / 256 / 488 / 720**; le tre linee da x 24, larghe 912 |
| `D_Reparti elenco` | allarga l'ultima colonna e la sua etichetta fino a **936** |
| `D_Reparti scheda` | `<<$$UTENTE.Nome>>` a x 681; i campi possono restare dove sono |

**Prova:** allarga la finestra fino a vedere tutte le attrezzature, poi gira
fra menu, reparti, attrezzature e menu **senza toccarla**. Nessuna barra di
scorrimento orizzontale, e il bordo destro sempre allo stesso punto.

### Il conto della griglia del menu

| | |
|---|---|
| Larghezza utile | 936 − 24 = **912** |
| Quattro pulsanti | 4 × 216 = 864 |
| Tre spazi | 3 × 16 = 48 |
| Totale | 864 + 48 = **912** ✓ |

**Perche' 960 e non la misura piu' piccola.** Perche' 960 e' la larghezza che
le attrezzature hanno chiesto davvero, con quattordici campi su due colonne.
`PuntiControllo`, che ne ha diciannove, non chiedera' di meno. Allargare i
piccoli costa dieci minuti; stringere i grandi vuol dire rifare le griglie.

**E' l'unico dei quattro lavori che ha una scadenza.** Ogni anagrafica
duplicata da Attrezzature ne eredita la larghezza: farlo adesso sono dieci
minuti, farlo dopo Fornitori, Prodotti e Operatori sono quaranta.
