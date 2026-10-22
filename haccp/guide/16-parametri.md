# Scheda 16 — `D_Parametri elenco` (tappa 4, seconda di due)

Scheda di lavoro con le spunte:
<https://claude.ai/artifact/MMV8Wh1bEVjgf2jUT89kgB>

Venti righe chiave/valore, raggruppate per categoria, **modificabili
direttamente nell'elenco**. Con questa il menu e' completo.

---

## Come e' fatta

| | Le altre | Questa |
|---|---|---|
| Scheda | c'e' | **no**: si scrive nell'elenco |
| Ricerca | casella + `92` | **no**: sono venti righe |
| `+ Nuovo` | c'e' | **no** |
| Righe | tutte uguali | **raggruppate per categoria** |

**Niente `+ Nuovo`, ed e' una decisione di prodotto.** Aggiungere un parametro
significa che il *programma* impara a leggerlo: e' lavoro dello sviluppatore,
dal formato tecnico. Un parametro creato dal cliente sarebbe una riga che
nessuno script guarda mai.

## I sei parametri bloccati

Non otto, come avevo detto prima: **sei**, contati nel file.

| Chiave | Perche' |
|---|---|
| `VersioneSchema` | cambiata a mano, **il file non e' piu' aggiornabile** |
| `TipoAttivita` | deciso all'impianto; cambiarlo dopo non riconverte niente |
| `NomeProdotto` | e' il nome del prodotto, non del locale |
| `ColorePrimario` | deve restare coerente con il tema |
| `BloccaRilevazioneDopoSalvataggio` | e' la garanzia che un registro non si riscrive |
| `RisoluzioneFoto` | alzarla gonfia il file senza che si capisca perche' |

## Fase 1 — Lo script `91 - Parametri - Entra nell'elenco`

```
Mostra tutti i record
Ordina record [ PAR|Parametri::Categoria crescente ;
                PAR|Parametri::Chiave crescente ] [ Senza finestra di dialogo ]
```

Niente `Imposta campo`: su `Parametri` non c'e' `gCerca`.

**L'ordinamento e' il motore del raggruppamento.** Il sottoriepilogo compare
**solo se i record sono ordinati per il campo su cui si raggruppa**. Senza
l'ordinamento per `Categoria` le fasce non si vedono e sembra che la parte non
funzioni: e' l'inghippo numero uno dei sottoriepiloghi.

## Fase 2 — Il formato e la parte nuova

Si duplica `D_PuntiControllo elenco`, occorrenza **`PAR|Parametri`**, nome
esatto `D_Parametri elenco`. Si cancellano casella di ricerca, `Tutti`,
`+ Nuovo` e `Apri`: resta solo `← Menù`.

### Le "parti" di un formato

Un formato FileMaker non e' un foglio unico: e' fatto di **fasce orizzontali
sovrapposte**, e ognuna si chiama *parte*. Sono quelle con la linguetta grigia
sul bordo sinistro quando si e' in Modifica formato.

| Parte | Quante volte compare | Da noi contiene |
|---|---|---|
| Intestazione | una sola, in cima | fascia blu, titolo, pulsanti, etichette di colonna |
| Corpo | **una per record** | la riga dell'elenco |
| Pie' di pagina | una sola, in fondo | il contatore |
| **Sottoriepilogo** | **una per gruppo** | il nome della categoria |

**La parte nuova:** in **Modifica formato** (in Modo Usa quel menu non c'e'),
`Formati › Imposta parti...` apre l'elenco delle fasce del formato. `Crea...`
apre la finestra **Parte**: si sceglie **Sottoriepilogo durante
l'ordinamento** e nella colonna di destra il campo **`Categoria`**.

> **Sopra `Corpo` ce ne sono due**, e l'altra e' `Riepilogo iniziale`, che
> compare **una volta sola in cima** e mostra il valore del primo record. Si
> distinguono con certezza da una cosa: selezionando quella giusta **si
> accende l'elenco dei campi a destra**, perche' FileMaker chiede su cosa
> raggruppare. Se non chiede nessun campo, e' quella sbagliata.

Alta 34, sfondo `#E7EEF5`, dentro il campo `Categoria` in grassetto.

**Scorciatoia:** doppio clic sulla linguetta grigia di una parte apre la
stessa finestra, gia' puntata su quella. Serve per cambiare tipo o altezza di
una fascia che esiste; per crearne una nuova serve `Imposta parti... ›
Crea...`.

Sopra e non sotto: il sottoriepilogo iniziale fa da **titolo** del gruppo, il
finale da **totale**. I totali serviranno alle stampe.

**Il campo nella fascia e' il campo della tabella**, non un testo scritto a
mano: FileMaker ci mette il valore del gruppo.

## Fase 3 — Le quattro colonne

| Colonna | X | Largh. | Campo |
|---|---|---|---|
| Chiave | 24 | 260 | `Chiave` |
| Descrizione | 294 | 430 | `Descrizione` |
| Tipo | 734 | 90 | `Tipo` |
| **Valore** | 834 | 160 | **due campi sovrapposti** |

Su `Chiave`, `Descrizione` e `Tipo`: **togliere `Consenti l'immissione nel
campo`**. Sono di sola lettura per tutti.

**La chiave e' il nome con cui lo script `01` cerca il parametro.** Cambiarla
da `BonificaPesce` a `Bonifica pesce` non da' nessun errore, e da quel momento
il modulo resta spento per sempre.

## Fase 4 — I due campi `Valore` sovrapposti

Due copie dello stesso campo nella stessa posizione: una scrivibile, una
bloccata.

| | Campo A — scrivibile | Campo B — bloccato |
|---|---|---|
| Immissione | consentita | **tolta** |
| Sfondo | bianco | **grigio chiaro**, bordi spenti |

Quale si vede, per chi:

| Chi guarda | I 14 modificabili | I 6 bloccati |
|---|---|---|
| accesso completo | bianchi | bianchi |
| `Responsabile` | bianchi | **grigi** |
| `Operatore` | **grigi** | **grigi** |

Campo A, *Nascondi oggetto quando*:

```
Get ( NomeSetPrivilegi ) = "Operatore"
or ( Get ( NomeSetPrivilegi ) = "Responsabile"
     and PAR|Parametri::ModificabileDalCliente = "No" )
```

Campo B, l'opposto:

```
not ( Get ( NomeSetPrivilegi ) = "Operatore"
or ( Get ( NomeSetPrivilegi ) = "Responsabile"
     and PAR|Parametri::ModificabileDalCliente = "No" ) )
```

Si legge come una frase: *nascondi la casella scrivibile se chi guarda e'
l'operatore — sempre, qualunque parametro — **oppure** se e' il responsabile e
quel parametro e' bloccato.*

**Le regole sono due, diverse fra loro.** Per l'**operatore** nessun parametro
si tocca mai: configurare il programma non e' lavoro di chi compila i
registri. Per il **responsabile** si toccano i quattordici ma non i sei: e'
lui che accende e spegne i moduli del suo locale, ma non deve poter rompere il
file. Una formula che conoscesse una regola sola lascerebbe all'operatore i
quattordici bianchi — ed e' l'errore con cui questa scheda e' nata.

**Per l'operatore il grigio e' coerenza, per il responsabile e' l'unica
protezione.** Nel set `Operatore` la tabella `Parametri` e' gia' in sola
lettura. Il `Responsabile` invece puo' modificare tutte le tabelle: sui sei
parametri di sistema quella casella nascosta e' l'unica cosa che lo ferma, e
regge perche' non ha accesso a Modifica formato.

**Nei calcoli, solo i nomi che abbiamo dato noi.** La prima versione
confrontava con `[Accesso completo]`: sbagliata, perche' quel nome e' tradotto
solo nell'interfaccia mentre `Get ( NomeSetPrivilegi )` restituisce il valore
inglese.

**Perche' due campi e non una spunta.** *Consenti l'immissione nel campo* e'
una proprieta' fissa dell'oggetto, non si puo' calcolare. *Nascondi oggetto
quando* e' un calcolo e si valuta riga per riga. Sovrapporre due oggetti e
accenderne uno solo e' il modo di ottenere un campo "a volte scrivibile".

**Il grigio e' l'unica cosa che l'utente vede:** senza, clicca, non succede
niente, e pensa che il programma sia rotto.

## Fase 5 — Collaudo

Undici prove. Le tre che contano:

- **5.7** chiude un ritocco vecchio: `ColorePrimario` vale ancora `#1F4E5F`,
  va `#1B3A5C`. Con l'accesso completo la casella e' bianca.
- **5.10** come operatore: **tutte e venti** grigie, nessuna esclusa.
- **5.11** come **responsabile**: quattordici bianche, sei grigie. E' l'unica
  prova che verifica davvero la formula — dal proprio account tutto e' bianco,
  da operatore tutto e' grigio, e solo dal responsabile si vede la differenza.

---

## Fine tappa 4

Tutti e tredici i pulsanti del menu portano da qualche parte, le sette
anagrafiche sono complete. **DDR per tutte e due le maschere insieme.**

Poi la **tappa 5** (le larghezze) e la **tappa 6**, dove si smette di
costruire i dati di contorno e si costruisce il programma.
