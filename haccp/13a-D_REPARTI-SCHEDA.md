# Passo 5a — `D_Reparti scheda`

Pagina con il disegno in scala e i pulsanti per copiare:
<https://claude.ai/artifact/EFA6wMJavrYWEY6wQXnQzu>

Prima maschera del progetto. Quattro campi, tre pulsanti, e **funziona da
sola**: appena finita si possono creare e modificare reparti senza che esista
nient'altro.

Si parte da qui non perche' i reparti siano importanti, ma perche' sono la
tabella piu' piccola del file: quello che si costruisce qui si duplica per
tutte le altre anagrafiche, quindi conviene farlo con calma e bene una volta.

**Le misure di questo documento diventano lo standard di tutto il progetto:**
etichette larghe 150 allineate a destra, campi a x 208, passo verticale 38,
campi alti 29. Tutte le schede avranno queste, ed e' il motivo per cui
sembreranno fatte dalla stessa mano.

Formato largo **780**. Parti: Intestazione **100**, Corpo **270**,
Pie' di pagina **34**.

---

## Fase 0 — Prima: sistemare lo script di navigazione

Il pulsante `← Elenco` puntera' a un formato che non esiste ancora. Perche'
non dia un errore brutto, allo script `90 - Utilita - Vai a` si aggiunge un
controllo che dice le cose con garbo.

| # | Passo | Impostazioni |
|---|---|---|
| 01 | `Imposta acquisizione errori` | Attivato — **nuovo** |
| 02 | `Imposta variabile` | `$formato` = `Get ( ParametroScript )` |
| 03 | `Se` | `IsEmpty ( $formato )` |
| 04 | &nbsp;&nbsp;`Esci dallo script` | |
| 05 | `Fine se` | |
| 06 | `Vai al formato` | Nome del formato per calcolo: `$formato` |
| 07 | `Se` | `Get ( UltimoErrore ) <> 0` — **nuovo** |
| 08 | &nbsp;&nbsp;`Mostra finestra di dialogo personalizzata` | Titolo `Non ancora pronto`; messaggio **come calcolo**: `"La maschera " & $formato & " non c'e' ancora."`; un solo pulsante, `OK` — **nuovo** |
| 09 | &nbsp;&nbsp;`Esci dallo script` | **nuovo** |
| 10 | `Fine se` | **nuovo** |
| 11 | `Mostra tutti i record` | |

Serve anche dopo: costruendo le maschere una per volta ci saranno sempre
pulsanti che puntano a qualcosa che arriva domani. Meglio un messaggio chiaro
che un errore di FileMaker.

---

## Fase 1 — Creare il formato vuoto

1. `Visualizza` › `Modifica formato` (Ctrl+L).
2. `Formati` › `Nuovo formato/rapporto`.
3. Nella finestra:
   - **Mostra record da:** `REP|Reparti` — l'occorrenza con la sigla, **non**
     la `Reparti` nuda.
   - **Nome formato:** `D_Reparti scheda`
   - **Tipo:** Modulo
4. Nella scelta dei campi **non aggiungerne nessuno**: si mettono a mano, cosi'
   finiscono dove vogliamo noi. Avanti fino a Fine.
5. `Formati` › `Imposta formato` › scheda Generale: togli la spunta
   **Includi nel menu dei formati**. Ci si arriva dai pulsanti.

### Altezze delle parti

Clicca l'etichetta grigia della parte sul bordo sinistro, poi Ispettore
(Ctrl+I) › scheda **Posizione** › Altezza.

| Parte | Altezza |
|---|---|
| Intestazione | 100 |
| Corpo | 270 |
| Pie' di pagina | 34 |

Se una parte non si lascia rimpicciolire e' perche' contiene un oggetto piu'
in basso: spostalo prima.

---

## Fase 2 — L'intestazione

Due fasce sovrapposte: sopra la barra scura con il titolo, sotto la barra
bianca con i pulsanti. **Questa si copiera' su tutte le altre maschere**, va
fatta bene.

Metodo, da qui in avanti sempre uguale: **disegna a occhio, poi scrivi i
numeri** nell'Ispettore, scheda Posizione.

| Oggetto | X | Y | Largh. | Alt. | Aspetto |
|---|---|---|---|---|---|
| Rettangolo barra | 0 | 0 | 780 | 56 | Riempimento `#1F4E5F`, nessun bordo |
| Testo "Reparto" | 24 | 16 | 300 | 24 | Segoe UI 15, semigrassetto, bianco |
| Testo `<<$$UTENTE.Nome>>` | 456 | 20 | 300 | 20 | 11 pt, bianco, allineato a destra |
| Rettangolo pulsanti | 0 | 56 | 780 | 44 | Riempimento bianco, bordo **solo sotto** 1 pt `#D5DDE1` |

Per il bordo di un lato solo: Ispettore › Aspetto › Bordo, accendi il lato di
sotto e spegni gli altri tre.

**Perche' la variabile di unione e non un campo.** `<<$$UTENTE.Nome>>` mostra
il contenuto della variabile globale che lo script di avvio ha riempito. E'
anche una verifica gratuita: se in alto a destra compare il nome,
`02 - Riconosci operatore` ha funzionato.

---

## Fase 3 — I tre pulsanti

Strumento **Pulsante**. Appena disegnato, FileMaker apre `Imposta pulsante`:
l'etichetta si scrive nel campo in alto di quella stessa finestra.

| Pulsante | X | Y | L | A | Azione | Impostazioni |
|---|---|---|---|---|---|---|
| `← Elenco` | 24 | 64 | 94 | 28 | Esegui script | `90 - Utilita - Vai a`, parametro `"D_Reparti elenco"` **con le virgolette** |
| `+ Nuovo` | 126 | 64 | 94 | 28 | Esegui passo script | `Nuovo record/richiesta` |
| `Elimina` | 228 | 64 | 94 | 28 | Esegui passo script | `Elimina record/richiesta`, finestra di conferma **attivata** |

Aspetto:

| Quale | Riempimento | Bordo | Testo |
|---|---|---|---|
| `+ Nuovo` (principale) | `#1F4E5F` | nessuno | bianco, 12,5 pt, semigrassetto |
| Gli altri due | bianco | 1 pt `#D5DDE1`, raggio 2 | `#1E2A32`, 12,5 pt |

> **Le virgolette nel parametro non sono facoltative.** Scrivendo
> `D_Reparti elenco` senza, FileMaker lo valuta come formula, non trova niente
> e il pulsante non fa nulla. Deve essere `"D_Reparti elenco"`.

> **Un pulsante principale solo.** In colore pieno ci va `+ Nuovo` e basta. Se
> si colora anche `Elimina`, l'occhio non sa dove andare — ed `Elimina` e'
> l'ultimo pulsante da rendere invitante.

---

## Fase 4 — Il corpo

Parte Corpo: riempimento `#F4F6F7`.

| Oggetto | X | Y | Largh. | Alt. | Aspetto |
|---|---|---|---|---|---|
| **Il riquadro** | | | | | |
| Rettangolo riquadro | 24 | 20 | 732 | 220 | Bianco, bordo 1 pt `#D5DDE1`, raggio 3 |
| Testo "DATI DEL REPARTO" | 44 | 32 | 320 | 16 | 10,5 pt semigrassetto, `#1F4E5F`, maiuscolo |
| Linea | 44 | 56 | 692 | 1 | 1 pt `#D5DDE1` |
| **Le etichette** — tutte larghe 150, allineate a destra, 12 pt `#6B7A83` | | | | | |
| "Codice" | 44 | 72 | 150 | 29 | centrata in verticale |
| "Descrizione" | 44 | 110 | 150 | 29 | |
| "Ordine" | 44 | 148 | 150 | 29 | |
| "Attivo" | 44 | 186 | 150 | 29 | |
| **I campi** — tutti alti 29, bianchi, bordo 1 pt `#D5DDE1`, raggio 2, testo 13 pt | | | | | |
| `REP\|Reparti::Codice` | 208 | 72 | 120 | 29 | |
| `REP\|Reparti::Descrizione` | 208 | 110 | 400 | 29 | |
| `REP\|Reparti::Ordine` | 208 | 148 | 80 | 29 | allineato a destra |
| `REP\|Reparti::Attivo` | 208 | 186 | 100 | 29 | `Formato` › `Controllo` › Menu a discesa, lista `vl_SiNo` |

Quando si disegna un campo, FileMaker crea in automatico la sua etichetta:
spostala e ridimensionala secondo la tabella, oppure cancellala e rifalla.

**Cosa NON mettere.** I cinque campi di sistema — `Id`, `CreatoIl`,
`CreatoDa`, `ModificatoIl`, `ModificatoDa` — restano fuori. Non servono a chi
compila, e `Id` e' un codice lungo che confonde. Il programma li riempie da
solo.

**Il passo di 38 non e' un numero a caso.** Campo alto 29 piu' 9 di aria.
Quando si aggiunge un campo, va a 38 dal precedente senza pensarci.

---

## Fase 5 — Il pie' di pagina

Parte: riempimento bianco, bordo **solo sopra** 1 pt `#D5DDE1`.

| Oggetto | X | Y | Largh. | Alt. | Aspetto |
|---|---|---|---|---|---|
| Testo contatore | 24 | 9 | 400 | 16 | 11 pt `#6B7A83` |

Contenuto: scrivi `Record`, poi `Inserisci` › `Simbolo` › **Numero record**,
poi `di`, poi `Inserisci` › `Simbolo` › **Conteggio record trovati**.

I simboli si inseriscono dal menu, non si scrivono a mano: nel formato si
vedono come `{{RecordNumber}}` e diventano numeri veri uscendo dalla modifica.

---

## Fase 6 — Salvare gli stili

E' il passaggio che fa risparmiare piu' tempo in assoluto. Uno stile e' un
aspetto salvato con un nome: si applica con un clic, e cambiandolo si
aggiornano tutti gli oggetti che lo usano **in tutte le maschere del file**.

Seleziona l'oggetto gia' formattato, Ispettore › scheda **Aspetto**, in cima
c'e' l'elenco degli stili del tema; dal menu con la freccia scegli
**Salva come nuovo stile**.

| Nome dello stile | Da quale oggetto salvarlo |
|---|---|
| `Etichetta` | l'etichetta "Codice" |
| `Campo` | il campo `Codice` |
| `Titolo riquadro` | il testo "DATI DEL REPARTO" |
| `Pulsante principale` | il pulsante `+ Nuovo` |
| `Pulsante secondario` | il pulsante `Elimina` |

Poi seleziona gli altri oggetti dello stesso genere e clicca lo stile
nell'elenco: diventano identici.

Alla fine: `Formati` › **Salva come tema**, nome **`Haccp`**. Da qui in avanti
tutte le maschere useranno questo tema e questi stili.

> Il giorno che il cliente dira' "le scritte sono piccole", si cambia lo stile
> `Etichetta` una volta e si aggiornano tutte le maschere. Senza stili si
> cambiano a mano una per una — e a quel punto si smette di cambiarle.

---

## Fase 7 — Collaudo

Esci dalla modifica formato (Ctrl+L).

| # | Cosa fai | Deve succedere |
|---|---|---|
| 1 | Guardi in alto a destra | C'e' il tuo nome. Se e' vuoto, esegui prima `00 - Avvio` |
| 2 | Premi `+ Nuovo` | Record vuoto, cursore nel primo campo |
| 3 | Scrivi `CUC`, `Cucina`, `10` | I campi accettano il testo |
| 4 | Clicchi su `Attivo` | Si apre la tendina con `Si` e `No` |
| 5 | Clicchi fuori dai campi | Il record si conferma; il contatore in basso si aggiorna |
| 6 | Premi `← Elenco` | Compare **"La maschera D_Reparti elenco non c'e' ancora"**. **E' giusto cosi'**: il messaggio dimostra che il pulsante e lo script funzionano |
| 7 | Premi `Elimina` e poi Annulla | Chiede conferma e non cancella niente |
| 8 | Crei un secondo reparto, `MAG` / `Magazzino secco` / `40` | Il contatore dice `Record 2 di 2` |

Se una prova non torna, ci si ferma li'. L'elenco si costruira' **duplicando
questa scheda**: un difetto qui se lo porterebbe dietro.

---

## Poi

`D_Reparti elenco`, che si costruisce duplicando questa e cambiando il tipo di
vista. Poi `D_Menu`. Poi si duplica tutto per attrezzature, punti di
controllo, fornitori, prodotti, operatori.
