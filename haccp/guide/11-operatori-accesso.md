# Scheda 11 — `D_Operatori`, rifatta

Scheda di lavoro con le spunte:
<https://claude.ai/artifact/6ys1XfGuPRoPM5XZFLN4aD>

Prerequisito: `09-operatori.md` costruita, `10-sicurezza.md` almeno letta.

La scheda dell'operatore diventa **l'unico posto da cui si distribuiscono i
permessi**. Serve un secondo riquadro, un campo nuovo, due pulsanti — e le
cinque correzioni rimaste aperte.

> **Queste misure vincono su quelle della fase 6 di `10-sicurezza.md`.** Li'
> avevo previsto una riga in piu' dentro il riquadro unico e il corpo a 290.
> Con un riquadro a se' i numeri cambiano, e la pagina della sicurezza e'
> stata allineata.

---

## Il formato finito

Larghezza **960**, contenuto che chiude a **936**. Intestazione **100**, corpo
**400**, pie' di pagina **38**.

| Parte | Cosa contiene |
|---|---|
| Intestazione | titolo, `<<$$UTENTE.Nome>>`, **cinque** pulsanti |
| Riquadro 1 — `DATI DELL'OPERATORE` | i sette campi della persona |
| Riquadro 2 — `ACCESSO AL PROGRAMMA` | `Ruolo`, `AccountFileMaker`, i due pulsanti |
| Pie' di pagina | il contatore dei record |

**Il secondo riquadro non e' estetica.** Il ruolo e l'account non dicono
niente sulla persona: dicono **cosa puo' fare dentro il programma**.
Separarli con un titolo significa che chi guarda la scheda capisce senza
spiegazioni dove finisce l'anagrafica e dove comincia la sicurezza — ed e'
l'unico punto del progetto in cui una casella sbagliata da' a qualcuno un
permesso che non deve avere.

## Fase 1 — Le cinque correzioni rimaste

Strascichi della duplicazione da `D_Prodotti`. Due di loro **falserebbero il
collaudo**, quindi si fanno per prime.

| | Cosa | Dove |
|---|---|---|
| 1 | `AccountFileMaker` ha ancora **Menu a comparsa** con `vl_Fornitori`: va **Casella di modifica**, nessuna lista | scheda |
| 2 | Stesso controllo su `Cognome`, `Nome`, `Mansione`, `Telefono` | scheda |
| 3 | Cancella l'oggetto `$$PARAMETRI` rimasto in fondo al formato | scheda |
| 4 | Titolo del riquadro: `DATI DEL FPRODOTTO` → `DATI DELL'OPERATORE` | scheda |
| 5 | `ColorePrimario` da `#1F4E5F` a `#1B3A5C` | tabella `Parametri` |

**Perche' il campo sembrava vuoto.** Il Menu a comparsa non mostra il valore
memorizzato: mostra **la riga corrispondente nella lista valori**. `ADMIN` non
e' fra i fornitori, quindi non c'era niente da mostrare. E' la quarta volta
che una duplicazione morde in silenzio: si porta dietro i campi, gli script, i
parametri dei pulsanti **e il controllo**.

**Il campo resta scrivibile a mano**, e deve restarlo: lo script `94` lo
riempie da solo per gli account nuovi, ma il tuo account e quelli che esistono
gia' li scrivi tu. Resta anche la convalida **Univoco**.

## Fase 2 — I tre campi nuovi

Gli stessi della fase 4 di `10-sicurezza.md`: `Ruolo` (Testo, normale),
`gNomeAccount` e `gPassword` (Testo, **globali**), lista `vl_Ruoli` con
`Operatore` e `Responsabile`.

**I due globali non si mettono sulla scheda.** Servono solo alla finestra di
dialogo dello script `94`, e la password ci sta dentro per qualche secondo.

## Fase 3 — Il corpo: due riquadri

| | Rettangolo | Titolo sopra |
|---|---|---|
| Riquadro 1 | x 24, y **16**, largh. 912, alto **194** | y **4** — `DATI DELL'OPERATORE` |
| Riquadro 2 | x 24, y **250**, largh. 912, alto **134** | y **238** — `ACCESSO AL PROGRAMMA` |

Parte **Corpo**: altezza da 230 a **400**. Il secondo rettangolo chiude a 384
(250 + 134), piu' i 16 di margine in basso che hanno tutte le altre schede.

Il secondo riquadro si fa **copiando il primo**: nasce gia' con lo stesso
stile del tema.

## Fase 4 — I nove campi

X di sempre **44 / 143 / 489 / 588**, passo **40**. Campi di sinistra larghi
**330**, di destra **348**, cosi' la colonna destra **chiude a 936** come su
tutte le altre maschere — e' la misura vincolante.

| Y | Etichetta (x 44) | Campo (x 143) | Etichetta (x 489) | Campo (x 588) | Controllo |
|---|---|---|---|---|---|
| **Riquadro 1** | | | | | |
| 42 | Cognome | `Cognome` | Data assunz. | `DataAssunzione` | calendario a destra |
| 82 | Nome | `Nome` | Data cessaz. | `DataCessazione` | calendario a destra |
| 122 | Mansione | `Mansione` | Attivo | `Attivo` | discesa `vl_SiNo` |
| 162 | Telefono | `Telefono` | — | — | — |
| **Riquadro 2** | | | | | |
| 276 | Ruolo | `Ruolo` | Account FM | `AccountFileMaker` | **discesa** `vl_Ruoli` / casella |

`AccountFileMaker` si **taglia** dal riquadro 1 e si incolla nel 2; le tre
date e `Attivo` salgono di una riga.

**`Ruolo` e' a discesa, non a comparsa**, e stavolta e' giusto: il campo
contiene **il valore stesso**, non un IDUU.

**Deve corrispondere lettera per lettera.** Lo script `94` confronta
`Ruolo = "Responsabile"` per scegliere il set di privilegi. Con
`responsabile` minuscolo o `Resp.` il confronto cade nell'`Altrimenti` e il
titolare si ritrova i permessi del cuoco, **senza nessun messaggio di
errore**.

## Fase 5 — I due pulsanti dentro il riquadro 2

| Pulsante | X | Y | L | A | Azione |
|---|---|---|---|---|---|
| `Crea account` | 143 | 326 | 150 | 35 | `94 - Operatori - Crea account` |
| `Reimposta password` | 303 | 326 | 180 | 35 | `95 - Operatori - Reimposta password` |

Partono da x **143**, allineati alla colonna dei campi. Su tutti e due,
`Ispettore › Dati › Nascondi oggetto quando`:

```
Get ( NomeSetPrivilegi ) = "Operatore"
```

Sul solo `Crea account`:

```
Get ( NomeSetPrivilegi ) = "Operatore"
or not IsEmpty ( OPE|Operatori::AccountFileMaker )
```

**Il pulsante resta visibile finche' il record non e' confermato**, e non e'
un guasto. *Nascondi oggetto quando* si ricalcola al **commit** del record e ai
refresh del formato, non a ogni lettera che scrivi: se compili `Account FM` e
premi subito `Crea account` senza uscire dal campo, il pulsante c'e' ancora. Lo
script invece legge il campo **come e' adesso**, anche non confermato, e si
ferma al terzo controllo. Per questo il controllo dentro lo script non e' un
doppione del nascondimento: il nascondimento e' in ritardo di un commit, il
controllo no.

**Il pulsante nascosto non e' sicurezza, e' pulizia.** Quello che impedisce
davvero a un cuoco di creare account e' il **set di privilegi**.

## Fase 6 — L'intestazione: `Salva` e `Annulla modifiche`

| Pulsante | X | L | Azione |
|---|---|---|---|
| `← Elenco` | 24 | 117 | c'e' gia' |
| `+ Nuovo` | 146 | 117 | c'e' gia' |
| `Elimina` | 268 | 117 | c'e' gia' |
| **`Salva`** | 390 | 117 | `Conferma record/richieste`, **senza** finestra |
| **`Annulla modifiche`** | 512 | **150** | `Ripristina record/richiesta`, **con** la finestra |

Y **57**, altezza **35**, come tutti gli altri. Si collaudano qui e poi si
copiano sulle altre cinque schede.

**Il quinto pulsante e' largo 150 e non 117**, e rompe di proposito il passo
di 122: l'etichetta in 117 punti va a capo o si taglia. Chiude a 662, ben
dentro i 936.

**La finestra di conferma su `Annulla modifiche` va lasciata accesa.** E'
l'unico passo di tutta l'applicazione che **butta via** quello che qualcuno ha
appena scritto.

## Fase 7 — L'elenco: sette colonne

| Colonna | X | Largh. | Campo | Ricerca rapida |
|---|---|---|---|---|
| `Apri` | 24 | 51 | gia' li' | — |
| Cognome | 85 | 190 | `Cognome` | **accesa** |
| Nome | 275 | 170 | `Nome` | **accesa** |
| Mansione | 445 | 180 | `Mansione` | **accesa** |
| Ruolo | 625 | 110 | `Ruolo` | spenta |
| Account FM | 735 | 110 | `AccountFileMaker` | spenta |
| Attivo | 845 | 91 | `Attivo` | spenta |

L'ultima chiude a **936**.

**`Account FM` resta, e correggo quello che avevo scritto nella scheda della
sicurezza.** Le due colonne dicono cose diverse: `Ruolo` dice **che permessi
dovrebbe avere** quella persona, `Account FM` dice **se l'account esiste
davvero**. Con tutte e due sotto gli occhi, una riga con il ruolo compilato e
l'account vuoto salta fuori da sola.

## Fase 8 — Collaudo

Dodici prove, nella pagina. Le prime cinque col tuo account, dalla sesta serve
lo script `94`. Le due che contano:

- **8.11** — crea due operatori di prova, uno per ruolo, e guardali in
  `Gestisci › Sicurezza`. E' l'unico modo di accorgersi che la parola nella
  lista valori non combacia con il nome del set di privilegi: il programma non
  lo dira' mai, perche' dal suo punto di vista non e' successo niente di
  anomalo.
- **8.2** — se `Account FM` sembra ancora vuoto pur avendo il dato nella
  tabella nuda, il controllo e' rimasto Menu a comparsa: fase 1, primo passo.

---

## Poi

La scheda dell'operatore e' completa. Resta **Punti di controllo**, l'ultima
anagrafica.
