# Passo 5b — `D_Reparti elenco`

Pagina con il disegno in scala:
<https://claude.ai/artifact/3T9i9JSG3sa88ZKnC2hc1J>

Prerequisito: `01-reparti-scheda.md` finito e collaudato.

**Non si costruisce, si duplica.** La scheda porta gia' il tema `Haccp`,
l'intestazione scura, i pulsanti e il pie' di pagina. Qui cambiano il tipo di
vista e il corpo.

Formato largo **780**. Parti: Intestazione **128**, Corpo **32**,
Pie' di pagina **34**.

Le X delle colonne, che valgono per **tutti** gli elenchi del progetto:
**24 / 90 / 192 / 576 / 648**, ultima colonna che chiude a **756**.

> **Attenzione, misure superate.** Le coordinate di questo documento sono
> quelle *proposte*. Costruendo, le misure sono cambiate in meglio (campi piu'
> alti, pulsanti sul blu senza fascia bianca, niente riquadro). Le misure
> valide sono in **`../09-MASCHERE.md`, sezione *Misure standard***; il perche' di
> ogni differenza sta in `../archivio/collaudo-007.md`. Qui restano validi il **metodo**
> e le **motivazioni**.

---

## Fase 1 — Duplicare la scheda

1. `Visualizza` › `Modifica formato` (Ctrl+L), vai su `D_Reparti scheda`.
2. `Formati` › **Duplica formato**.
3. `Formati` › `Imposta formato`, scheda Generale:
   - **Nome formato:** `D_Reparti elenco`
   - **Visualizza come:** **Elenco** — e' il passo che cambia tutto
   - **Includi nel menu dei formati:** resta spento
4. Esci. Il formato ora ripete il corpo per ogni record: e' normale che per un
   attimo sembri un disastro, il corpo e' ancora alto 270.

**Perche' duplicare.** Ti porti dietro il tema, l'intestazione gia' colorata,
i pulsanti e i simboli del pie' di pagina: tre quarti del lavoro. Ripartendo
da `Nuovo formato`, alla terza maschera un dettaglio diverso ti scappa.

---

## Fase 2 — Svuotare il corpo

1. Nel Corpo seleziona tutto: rettangolo, titolo, linea, quattro etichette,
   quattro campi. **Canc.**
2. Parte **Corpo** › Ispettore › Posizione › **Altezza 32**.

> Copiare i campi invece di cancellarli si puo', ma se li porti dietro con
> altezza 29 e il bordo della scheda devi comunque rifare misure e aspetto.
> Ridisegnarli e' piu' pulito.

---

## Fase 3 — L'intestazione

### I ritocchi

1. Titolo: da `Reparto` a **`Reparti`**. L'elenco parla di tutti.
2. Pulsante **Elimina**: **cancellalo**.
3. Pulsante `← Elenco` → **`← Menu`**: cambia etichetta e parametro in
   `"D_Menu"`.
4. Parte **Intestazione** da 100 a **128**.
5. Rettangolo bianco dei pulsanti: da 44 a **72**.
6. **Linea** (con Maiusc premuto) da bordo a bordo a **y 100**.

**Perche' via Elimina.** Su una scheda cancelli il record che stai guardando.
Su un elenco cancelli la riga dove per caso e' finito il cursore, che spesso
non e' quella su cui hai l'occhio. In un registro HACCP un record cancellato
per sbaglio e' un buco in un obbligo di legge: si cancella dalla scheda, dopo
aver aperto il record e averlo letto.

### Geometria

| Oggetto | X | Y | Largh. | Alt. | Aspetto |
|---|---|---|---|---|---|
| **La parte Intestazione** | — | — | — | 128 | gia' scura: viene dal tema |
| Testo "Reparti" | 24 | 16 | 300 | 24 | stile `Titolo maschera` |
| Testo `<<$$UTENTE.Nome>>` | 456 | 20 | 300 | 20 | invariato |
| Rettangolo bianco | 0 | 56 | 780 | 72 | era 44, adesso 72 |
| Linea separatrice | 0 | 100 | 780 | 1 | lascia com'e' |
| Pulsante `← Menu` | 24 | 64 | 94 | 28 | parametro `"D_Menu"` |
| Pulsante `+ Nuovo` | 126 | 64 | 94 | 28 | invariato |

### Le etichette di colonna

Cinque oggetti testo, tutti a **y 104**, alti **16**, stile `Titolo riquadro`.

| Etichetta | X | Largh. | Note |
|---|---|---|---|
| *(nessuna, sopra il pulsante Apri)* | 24 | 54 | la colonna dei pulsanti non ha titolo |
| CODICE | 90 | 90 | |
| DESCRIZIONE | 192 | 372 | |
| ORD. | 576 | 60 | allineata a **destra**, come i numeri sotto |
| ATTIVO | 648 | 108 | |

**Titolo e campo devono avere la stessa X e la stessa larghezza**, altrimenti
l'intestazione scivola rispetto ai dati e si nota subito.

---

## Fase 4 — Il corpo: una riga sola

| Oggetto | X | Y | Largh. | Alt. | Aspetto |
|---|---|---|---|---|---|
| Pulsante `Apri` | 24 | 3 | 54 | 26 | stile normale di Apex |
| `REP\|Reparti::Codice` | 90 | 2 | 90 | 28 | senza bordo, senza riempimento |
| `REP\|Reparti::Descrizione` | 192 | 2 | 372 | 28 | senza bordo, senza riempimento |
| `REP\|Reparti::Ordine` | 576 | 2 | 60 | 28 | allineato a **destra**, senza bordo |
| `REP\|Reparti::Attivo` | 648 | 2 | 108 | 28 | campo normale, senza bordo |

Pulsante `Apri`: azione **Esegui script**, `90 - Utilita - Vai a`, parametro
`"D_Reparti scheda"` con le virgolette.

Le etichette che FileMaker crea insieme ai campi vanno **cancellate**: qui i
titoli stanno in intestazione.

**`Attivo` qui non e' una tendina.** In un elenco si legge, non si sceglie.

**Perche' via i bordi.** Sulla scheda il riquadro dice "qui si scrive", e sono
quattro. In un elenco di trenta reparti sarebbero centoventi riquadri: l'occhio
non vede piu' le righe, vede una rete.

**Il pulsante Apri non ha bisogno di sapere quale riga.** Cliccando nel corpo,
FileMaker rende corrente quel record prima di eseguire lo script.

> **Se alla scheda hai portato i campi a 31** perche' Apex blu li stringeva,
> qui: Corpo **34**, campi y 2 alt. **30**, pulsante Apri y 3 alt. **28**.

---

## Fase 5 — Righe alternate

1. Clicca l'etichetta grigia **Corpo**: selezioni la parte.
2. Ispettore › Aspetto: la tendina di **stato** in cima, che dice `Normale`,
   offre anche **Sfondo alternato**.
3. Con quello stato attivo, Riempimento appena piu' scuro del bianco.
4. Rimetti la tendina su `Normale` prima di toccare altro.

Apex blu potrebbe gia' portarsele: **guarda prima di fare questa fase**. Se la
voce non si trova, si salta — non e' essenziale.

---

## Fase 6 — Aprire l'elenco gia' ordinato

### Script `91 - Reparti - Ordina elenco`

| # | Passo | Impostazioni |
|---|---|---|
| 01 | *commento* | `# Ordina l'elenco dei reparti. Lo chiama il trigger OnLayoutEnter` `# del formato D_Reparti elenco.` |
| 02 | `Ordina record` | Criteri: `REP\|Reparti::Ordine` crescente, poi `REP\|Reparti::Codice` crescente. **Specifica criteri** spuntato, **con finestra di dialogo: No** |
| 03 | `Esci dallo script` | |

### Il trigger

`Formati` › `Imposta formato` › scheda **Trigger di script** › spunta
**OnLayoutEnter** e scegli `91 - Reparti - Ordina elenco`.

Un trigger e' uno script che parte da solo quando succede una certa cosa — qui,
quando entri nel formato. Non va chiamato da nessuna parte.

> **Da verificare alla prova 5.** Lo script `90` dopo `Vai al formato` esegue
> `Mostra tutti i record`, cioe' agisce **dopo** il trigger. L'ordinamento
> dovrebbe reggere. Se l'elenco risulta disordinato, fermarsi e segnalarlo:
> si risolve spostando l'ordinamento, ma va visto sul file reale.

---

## Fase 7 — Collaudo

Servono almeno due reparti: creati nel collaudo della scheda.

| # | Cosa fai | Deve succedere |
|---|---|---|
| 1 | Guardi l'elenco | Una riga per reparto, intestazione scura con le colonne sotto |
| 2 | Guardi le colonne | Ogni titolo sta **esattamente sopra** la sua colonna. Se e' sfalsato, una X e' sbagliata |
| 3 | Scorri con la rotellina | L'intestazione resta ferma, scorrono solo le righe |
| 4 | Guardi i campi | Nessun riquadro intorno ai dati |
| 5 | Guardi l'ordine | In ordine di `Ordine`. **Se non lo e', fermati e segnalalo** |
| 6 | Premi `Apri` sulla **seconda** riga | Si apre la scheda **su quel** reparto. E' la prova che conta piu' di tutte |
| 7 | Dalla scheda premi `← Elenco` | Torni all'elenco: adesso il pulsante funziona davvero |
| 8 | Premi `+ Nuovo` dall'elenco | Compare una riga vuota e ci si puo' scrivere |
| 9 | Premi `← Menu` | **"La maschera D_Menu non c'e' ancora"**. Giusto: il menu e' il prossimo |
| 10 | Guardi il pie' di pagina | Il contatore dice quanti reparti ci sono |

La prova 7 chiude un cerchio: elenco e scheda si parlano nei due versi.

---

## Poi

`D_Menu`. Poi e' tutta ripetizione: attrezzature, punti di controllo,
fornitori, prodotti, operatori si fanno duplicando questa coppia, cambiando
tabella e nomi dei campi.
