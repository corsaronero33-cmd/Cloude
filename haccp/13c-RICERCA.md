# Passo 5c — La ricerca sugli elenchi

Scheda di lavoro passo passo, con il disegno e i calcoli da copiare:
<https://claude.ai/artifact/M8YkvJgCjPHtiLcYYAxM81>

Prerequisiti: `13b-D_REPARTI-ELENCO.md` finito e i **cinque ritocchi** di
`COLLAUDO-v007.md` applicati (la casella va in un formato largo 685).

## Prima: oggi si cerca gia'

`Ctrl+F`, si scrive, `Invio`. La ricerca di FileMaker funziona e non e'
bloccato niente. Questa casella serve perche' **alla consegna la barra degli
strumenti sara' nascosta**: un ristoratore non deve imparare il Modo Trova per
trovare un fornitore.

## Il meccanismo: `Esegui ricerca rapida`

La prima stesura di questo documento entrava in Modo Trova e compilava due
richieste di ricerca a mano. Funzionava, ma era **lavoro inutile**: FileMaker
ha un passo che fa la stessa cosa da solo.

| | Modo Trova a mano | Ricerca rapida |
|---|---|---|
| Passi dello script | 23 | **14** |
| Script da scrivere | uno per tabella: sei | **uno solo** |
| Dove si decide su cosa cercare | dentro il codice | **sul formato**, con una spunta |
| Aggiungere un campo | si modifica lo script | si mette la spunta |
| Usa l'indice | no (l'asterisco davanti lo esclude) | **si'** |

**Come funziona davvero.** La Ricerca rapida non cerca in tutti i campi della
tabella: cerca nei campi **che stanno sul formato** e che hanno la spunta. Un
campo che non e' sul formato non verra' mai trovato.

**Cosa si perde.** Cerca "che comincia per", parola per parola. Su
`Magazzino secco`: `magazz` lo trova, `secco` lo trova, **`agazz` no**.

Non e' una perdita: e' quello che la gente si aspetta da una casella di
ricerca, ed e' **la soluzione del problema dei lotti** annotato nella prima
stesura. Cercando "comincia per", FileMaker usa l'indice.

---

## 1. Il campo

In `Reparti`, campo nuovo `gCerca`, tipo **Testo**, e in `Opzioni` ->
**Archiviazione** -> **Usa archiviazione globale (un valore per file)**.

Un campo globale vive **fuori dai record**: un valore per tutta la sessione,
non scritto da nessuna parte. Scrivi `cuc` nella casella e non hai sporcato
nessun reparto.

**Uno per tabella**: e' il campo che la casella mostra, e ogni elenco mostra
il suo. Lo script invece resta uno.

---

## 2. Lo script `92 - Utilita - Cerca`

Si chiama **Utilita** e non **Reparti** perche' non nomina nessuna tabella e
nessun campo: e' uno per tutta l'applicazione.

```
# === 92 - UTILITA - CERCA ===
# Ricerca rapida sul formato corrente. Uno per tutta l'applicazione.
# Non sa su quali campi cerca: si decide sul formato, con la spunta
# della Ricerca rapida nell'Ispettore.
# Parametro: il testo da cercare, passato dal trigger della casella.

Imposta variabile [ $cerca ; Valore: Get ( ParametroScript ) ]
Imposta acquisizione errori [ Attivato ]

Se [ IsEmpty ( $cerca ) ]
    Mostra tutti i record
    Esci dallo script [ Risultato del testo: "" ]
Fine se

Esegui ricerca rapida [ $cerca ]

Se [ Get ( UltimoErrore ) = 401 ]
    Mostra finestra di dialogo personalizzata
        [ "Nessun risultato" ;
          "Nessuna scheda contiene " & $cerca & "." ]
    Mostra tutti i record
Fine se
```

**401** e' il codice di "nessun record trovato". Senza l'acquisizione errori
comparirebbe la finestra di FileMaker, che parla di richieste e di criteri.

**Niente ordinamento in fondo:** FileMaker mantiene l'ordine dopo una ricerca,
come lo mantiene dopo un `Mostra tutti i record` — gia' verificato su questo
file con il trigger dell'elenco. La prova 6 del collaudo lo ricontrolla.

---

## 3. Lo script `91` cambia nome e guadagna un passo

Da `91 - Reparti - Ordina elenco` a **`91 - Reparti - Entra nell'elenco`**.
Adesso fa tre cose, e il nome deve dirlo.

```
# Azzera la ricerca, mostra tutti i reparti, li ordina.
# Lo chiamano il trigger OnLayoutEnter e il pulsante Tutti.

Imposta campo [ REP|Reparti::gCerca ; "" ]
Mostra tutti i record
Ordina record [ Ordine crescente, poi Codice crescente ; senza finestra ]
```

Il trigger non va ritoccato: punta allo stesso script, che ha solo cambiato
nome.

---

## 4. La casella sul formato

| Oggetto | X | Y | Largh. | Alt. | Aspetto |
|---|---|---|---|---|---|
| Campo `REP\|Reparti::gCerca` | 273 | 58 | 307 | 32 | riempimento **bianco**, raggio 3, segnaposto `Cerca...` |
| Pulsante `Tutti` | 585 | 58 | 95 | 35 | come gli altri pulsanti |

Chiudono a **680**, che e' il bordo destro del contenuto di questo formato:
ci finiscono anche `<<$$UTENTE.Nome>>` (425 + 255) e la colonna `Attivo`
(610 + 70). Il formato e' largo 685.

**Segnaposto:** Ispettore -> scheda **Dati** -> **Testo segnaposto** ->
`Cerca...`.

**Spunta della Ricerca rapida:** va **tolta** da questa casella (Ispettore ->
scheda Dati), altrimenti il programma cerca dentro la casella di ricerca.

### Il trigger, finestra per finestra

| # | Dove sei | Cosa fai |
|---|---|---|
| 1 | Sul formato, in modifica | Clicchi la casella `gCerca` per selezionarla |
| 2 | | Tasto destro -> **Imposta trigger di script...** (equivale a `Formati` -> `Imposta trigger di script`) |
| 3 | Finestra **Imposta trigger di script** | Nell'elenco degli eventi, spunta **OnObjectSave** |
| 4 | Finestra **Specifica script** (si apre da sola) | Scegli `92 - Utilita - Cerca` |
| 5 | Stessa finestra, in basso | Riquadro **Parametro script facoltativo**. Se accanto c'e' **Modifica...**, premilo: si apre la finestra di calcolo |
| 6 | Nel parametro | Scrivi `REP\|Reparti::gCerca` — **senza virgolette** |
| 7 | | OK fino a chiudere tutto |

**Qui le virgolette NON ci vanno, ed e' l'opposto di tutti gli altri parametri
del progetto.** Il riquadro del parametro e' un **calcolo**:

- `REP|Reparti::gCerca` -> FileMaker legge **il contenuto** della casella e
  passa allo script `cuc`;
- `"REP|Reparti::gCerca"` -> FileMaker passa allo script **quelle 21 lettere**,
  e lo script cerchera' i reparti che contengono la parola "REP".

La regola: **fra virgolette un testo fisso, senza virgolette il nome di un
campo**.

**Perche' OnObjectSave e non OnObjectExit.** `OnObjectSave` scatta solo se hai
**cambiato** il contenuto, uscendo con `Invio`, `Tab` o un clic fuori.
`OnObjectExit` scatterebbe ogni volta che esci, anche passandoci sopra con il
Tab senza scrivere niente, e rifarebbe la stessa ricerca a vuoto.

### Tutti i parametri del progetto, in un posto solo

| Chi chiama | Dove sta | Script | Parametro |
|---|---|---|---|
| Pulsante `← Elenco` | D_Reparti scheda | `90` | `"D_Reparti elenco"` |
| Pulsante `← Menù` | D_Reparti elenco | `90` | `"D_Menu"` |
| Pulsante `Apri` | D_Reparti elenco, nel corpo | `90` | `"D_Reparti scheda"` |
| **Trigger OnObjectSave** | sulla casella `gCerca` | `92` | `REP\|Reparti::gCerca` — **senza virgolette** |
| **Trigger OnLayoutEnter** | su D_Reparti elenco | `91` | *nessuno* |
| Pulsante `Tutti` | D_Reparti elenco | `91` | *nessuno* |
| Pulsanti `Nuovo`, `Elimina` | entrambi i formati | *passo script diretto* | *—* |

I primi tre passano **un testo fisso** (il nome di un formato) e vogliono le
virgolette. Il quarto passa **il contenuto di un campo** e non le vuole.

**Perche' il parametro esiste.** Lo script `92` non nomina nessun campo e
nessuna tabella: e' la casella che gli passa il proprio contenuto. Sull'elenco
dei fornitori bastera' scrivere `FOR|Fornitori::gCerca` nel parametro di
**quella** casella, senza toccare lo script.

### Il pulsante `Tutti`, finestra per finestra

E' un **pulsante** normale. Nasce duplicando `+ Nuovo` (Ctrl+D) per **ereditare
l'aspetto**: carattere bianco in grassetto, nessun riempimento. Disegnandolo
nuovo prenderebbe lo stile di serie del tema — chiaro con il bordo — e su
fondo blu sarebbe un'altra cosa.

**Misure**, Ispettore -> scheda Posizione:

| Voce | Valore |
|---|---|
| Posizione › Sinistra | 585 |
| Posizione › Superiore | 58 |
| Dimensioni › Larghezza | 95 |
| Dimensioni › Altezza | 35 |

Chiude a **680**, allineato con `<<$$UTENTE.Nome>>` sopra e con la colonna
`Attivo` sotto.

> La larghezza 95 serve perche' con il carattere del tema `HACCP` la parola
> "Tutti" in 73 viene tagliata. Se la allarghi ancora, sposta di conseguenza
> la X in modo che **chiuda sempre a 680**: e' quello il bordo, non la
> larghezza del pulsante.

**Etichetta e azione**, doppio clic -> finestra `Imposta pulsante`:

| # | Cosa c'e' nella finestra | Cosa ci metti |
|---|---|---|
| 1 | L'**icona**, in alto | C'e' il `+` ereditato da "Nuovo". Cliccala e scegli **nessuna icona** |
| 2 | Il **testo** del pulsante | Cancelli `Nuovo`, scrivi `Tutti` |
| 3 | Tendina **Azione** | **Esegui script** |
| 4 | Compare la riga dello script | Premi **Specifica** |
| 5 | Finestra **Specifica script** | `91 - Reparti - Entra nell'elenco` |
| 6 | **Parametro script facoltativo** | **Vuoto.** Niente, nemmeno due virgolette |
| 7 | | OK, OK |

**Senza icona, e non per fretta.** Gli altri due pulsanti hanno la freccia e il
piu' perche' *fanno succedere* qualcosa. `Tutti` **annulla**, e sta attaccato
alla casella: il solo testo lo fa leggere come la coda della ricerca invece
che come un terzo comando della barra.

**Chiama `91`, non `92`**, perche' deve fare esattamente le tre cose che fa
entrare nell'elenco — svuotare la casella, mostrare tutto, ordinare — e sono
gia' scritte.

> **Errore da non fare: chiamare `92` con parametro vuoto.** Sembra
> equivalente: `92` con `$cerca` vuoto fa `Mostra tutti i record` ed esce. Ma
> **non svuota la casella**: ti ritroveresti l'elenco completo con ancora
> scritto `cuc` nel riquadro, e non sapresti piu' se stai guardando tutto o un
> risultato.

> **Rifinitura che per ora non farei.** Ispettore -> scheda Dati -> **Nascondi
> oggetto quando**, calcolo `IsEmpty ( REP|Reparti::gCerca )`: il pulsante
> comparirebbe solo a ricerca attiva. E' elegante, ma un pulsante che va e
> viene si nota piu' di uno fermo, e `Tutti` serve anche ad annullare una
> ricerca fatta con `Ctrl+F`.

---

## 5. Scegliere su quali campi cerca

`Formati` -> `Imposta formato` -> Generale: **Abilita Ricerca rapida**
spuntato (di serie lo e').

Poi, campo per campo sul formato, Ispettore -> scheda **Dati** -> la spunta
della Ricerca rapida:

| Campo sul formato | Spunta | Perche' |
|---|---|---|
| `Codice` | **accesa** | e' il modo piu' veloce di trovare un reparto |
| `Descrizione` | **accesa** | e' quello che la gente ricorda |
| `Ordine` | spenta | cercando `10` salterebbero fuori i reparti con quell'ordine |
| `Attivo` | spenta | cercando `si` uscirebbero **tutti** i reparti attivi |
| `gCerca` | spenta | cercherebbe dentro se stessa |

**La regola per decidere.** Accendi la spunta sui campi che contengono valori
**diversi uno dall'altro** — un codice, un nome, una descrizione. Spegnila su
quelli con **poche parole ripetute su molti record** — `Si`/`No`, un tipo, uno
stato. Cercare in quelli non restringe: allarga.

E' l'unico errore possibile in questa pagina che **non da' nessun messaggio**:
restituisce risultati sbagliati senza che ci sia motivo di sospettare.

---

## 6. Collaudo

| # | Cosa fai | Deve succedere |
|---|---|---|
| 1 | Scrivi `cuc` e Invio | Resta il solo reparto Cucina |
| 2 | Premi `Tutti` | Tornano tutti, in ordine, e **la casella si svuota** |
| 3 | Scrivi `magazz` e Invio | Trova `Magazzino secco`: cerca anche nella descrizione |
| 4 | Scrivi `secco` e Invio | Trova `Magazzino secco`: cerca **ogni parola**, non solo la prima |
| 5 | Scrivi `si` e Invio | **Nessun risultato.** Se escono tutti i reparti, e' rimasta la spunta su `Attivo` |
| 6 | Crea `CEL` / `Cella frigo` / `20`, poi cerca `c` | Escono Cucina (10) e Cella frigo (20), **in quest'ordine**. Al contrario, l'ordinamento non regge alla ricerca |
| 7 | Scrivi `zzz` e Invio | "Nessuna scheda contiene zzz", e dopo l'OK ci sono di nuovo tutti |
| 8 | Svuoti la casella e Invio | Tornano tutti, senza messaggi |
| 9 | Cerchi, apri con `Apri`, torni con `← Elenco` | Tutti i record e casella vuota: il trigger ha rifatto `91` |
| 10 | Apri un reparto e guarda i campi | `gCerca` e' **vuoto** nel record |

La prova 10 dimostra il senso del campo globale. La prova 5 verifica le
spunte, ed e' quella che salva da un errore silenzioso.

---

## Quando si duplica

Per ogni anagrafica — **lo script `92` non si tocca**:

1. Campo `gCerca` globale nella sua tabella.
2. Casella e pulsante `Tutti` sull'elenco, alle stesse misure.
3. Nel parametro del trigger: `<OCC>|<Tabella>::gCerca`, quella di casa sua,
   **senza virgolette**. Per i fornitori: `FOR|Fornitori::gCerca`.
4. Un `Imposta campo` in cima al suo script `91`.
5. Le spunte della Ricerca rapida.

| Tabella | Spunta accesa su |
|---|---|
| Attrezzature | `Codice`, `Descrizione` |
| PuntiControllo | `Codice`, `Descrizione` — attenzione a `Tipo`, pochi valori ripetuti |
| Fornitori | `RagioneSociale`, `PartitaIva` |
| Prodotti | `Descrizione`, `Codice` |
| Operatori | `Cognome`, `Nome` |

---

## E sulla scheda?

**No.** Si cerca dove si guarda, e una scheda mostra un record solo.

Con la Ricerca rapida c'e' anche un motivo tecnico: cerca **nei campi che
stanno sul formato**, e la scheda ha campi diversi dall'elenco. La stessa
parola darebbe due risultati diversi a seconda di dove l'hai scritta.
