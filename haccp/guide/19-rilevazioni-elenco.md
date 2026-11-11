# Scheda 19 — `D_Rilevazioni elenco` (tappa 6, seconda di due)

Il **registro**: quello che un ispettore apre e legge. Sola lettura, i giorni
piu' recenti in cima, raggruppato per giornata.

<https://claude.ai/artifact/XmgzrxFqHYdJafeuqan71A>

## Due cose che la rendono diversa dagli altri elenchi

### 1. Non si apre niente, e non si scrive niente

Negli altri elenchi la prima colonna e' il pulsante `Apri` che porta alla
scheda. Qui no: **una rilevazione non si modifica**. E' un atto registrato con
data, ora e operatore; correggerla a mano vorrebbe dire falsificare il
registro. Se un valore e' sbagliato si registra un'altra rilevazione.

Quindi: nessun pulsante `Apri`, la prima colonna comincia a x **24**, e a
tutti i campi si **toglie l'immissione**.

### 2. Serve una parte nuova: il Riepilogo iniziale

Un registro si legge per giornate. FileMaker lo fa con un
**Riepilogo iniziale** (*Leading Sub-summary*): una parte che compare **una
volta per gruppo**, ma **solo se i record sono ordinati sul campo del
gruppo**.

E qui sta il motivo dei due campi nuovi della fase 1: il gruppo non puo'
essere `DataOra`, che e' una marca temporale al secondo e quindi diversa su
ogni record. Serve un campo che valga **lo stesso per tutte le rilevazioni
dello stesso giorno**.

> Attenzione a non confondere **Riepilogo iniziale** con **Intestazione**:
> nell'elenco delle parti sono vicini. Quello giusto e' il solo che, quando lo
> selezioni, **accende l'elenco dei campi a destra** chiedendoti su quale
> campo raggruppare.

## Fase 1 — Due campi calcolati e un riepilogo

`File > Gestisci > Database > Campi`, tabella **`Rilevazioni`**.

| Campo | Tipo | Risultato | Formula |
|---|---|---|---|
| `Giorno` | **Calcolo** | **Data** | `GetAsDate ( DataOra )` |
| `Ora` | **Calcolo** | **Ora** | `GetAsTime ( DataOra )` |
| `ConteggioRilevazioni` | **Riepilogo** | — | **Conteggio di** `Id` |

Su `Giorno`, dentro `Opzioni > Archiviazione`, controllare che
**&laquo;Non memorizzare, calcola quando necessario&raquo; NON sia
spuntato**: un calcolo non memorizzato **non si puo' usare per ordinare**, e
senza ordinamento il Riepilogo iniziale non compare mai. E' il punto in cui
questa maschera si rompe in silenzio.

Perche' campi calcolati e non auto-immissione: un calcolo si ricalcola da se'
e **non si puo' sporcare a mano**. Un valore auto-immesso puo' restare vecchio
se qualcuno tocca `DataOra` da un altro formato.

`ConteggioRilevazioni` e' un campo **Riepilogo**: messo nel Corpo conterebbe
tutto, messo nel Riepilogo iniziale conta **il gruppo**. E' quello che serve:
*"12 rilevazioni"* accanto alla data.

## Fase 2 — Il formato

`Formati > Nuovo formato`, **Vista Elenco**, occorrenza **`RIL|Rilevazioni`**,
tema **`Haccp`**, larghezza **1020**.

`Imposta parti...`, quattro parti in quest'ordine:

| Parte | Alta | Da y | A y |
|---|---|---|---|
| **Intestazione** | 143 | 0 | 143 |
| **Riepilogo iniziale**, raggruppato su `Giorno` | 40 | 143 | 183 |
| **Corpo** | 30 | 183 | 213 |
| **Pie' di pagina** | 40 | 213 | 253 |

L'intestazione e' blu perche' lo e' nel tema: non si colora a mano.

Dentro l'intestazione, come su tutti gli altri elenchi:

| Oggetto | X | Y | Largh. | Alt. |
|---|---|---|---|---|
| rettangolo **bianco** (fascia delle etichette) | 0 | 110 | 1020 | 32 |
| titolo `Registro delle rilevazioni`, stile *Titolo maschera* | 24 | 16 | 300 | 35 |
| `<<$$UTENTE.Nome>>`, testo bianco, allineato a destra | 741 | 18 | 255 | 32 |

Il rettangolo bianco va **mandato indietro**, se no copre le etichette.

## Fase 3 — I tre pulsanti

Tutti a y **57**, alti **35**.

| Pulsante | X | Largh. | Script | Parametro |
|---|---|---|---|---|
| `← Menu` | 24 | 84 | `90 - Utilita - Vai a` | `"D_Menu"` |
| `Tutte` | 109 | 117 | `91 - Rilevazioni - Entra nell'elenco` | *nessuno* |
| `Solo non conformi` | 230 | 160 | `91 - Rilevazioni - Entra nell'elenco` | `"nonconformi"` |

Due pulsanti e **un solo script**, che si comporta in due modi secondo il
parametro. Non due script: la regola e' la stessa dello script `90`.

Perche' questi due e non una casella di ricerca: in un registro HACCP la
domanda che si fa un ispettore e' *"fammi vedere i fuori limite"*. Una
ricerca a testo libero su un registro serve dopo, quando i record sono
migliaia, e si fara' alla tappa 9 con le stampe.

## Fase 4 — Le colonne

Etichette nell'intestazione a y **114**, alte **24**, sulla fascia bianca.
Campi nel corpo a y **184**, alti **28**. **Stessa X e stessa larghezza fra
etichetta e campo**: e' la relazione che vale, non il numero.

| Etichetta | X | Largh. | Campo |
|---|---|---|---|
| `Ora` | 24 | 70 | `RIL\|Rilevazioni::Ora` |
| `Punto di controllo` | 94 | 290 | `RIL\|PuntiControllo::Descrizione` |
| `Valore` | 384 | 100 | `RIL\|Rilevazioni::Valore` |
| `Unita` | 484 | 80 | `RIL\|PuntiControllo::UnitaMisura` |
| `Esito` | 564 | 120 | `RIL\|Rilevazioni::Esito` |
| `Operatore` | 684 | 150 | `RIL\|Operatori::NomeCompleto` |
| `Note` | 834 | 162 | `RIL\|Rilevazioni::Note` |

L'ultima chiude a **996**, come tutte le altre quindici maschere.

**A tutti e sette i campi si toglie l'immissione**: Ispettore > Dati >
Comportamento > togliere la spunta a *Consenti l'immissione nel campo*.
E' il modo piu' semplice e piu' solido di rendere il registro di sola
lettura: non dipende da chi e' entrato.

**Sulle rilevazioni visive `Valore` e `Unita` restano vuote**, ed e' giusto:
il dato sta in `Esito`. Un punto visivo non ha un numero ne' un'unita' di
misura. Non si mettono due campi sovrapposti per riempire quella casella con
la stessa parola che c'e' gia' nella colonna accanto.

Nel **Riepilogo iniziale**:

| Oggetto | X | Y | Largh. | Alt. |
|---|---|---|---|---|
| `RIL\|Rilevazioni::Giorno`, grassetto, formato data lungo | 24 | 150 | 500 | 26 |
| `RIL\|Rilevazioni::ConteggioRilevazioni`, a destra | 760 | 150 | 100 | 26 |
| testo `rilevazioni` | 866 | 150 | 130 | 26 |

Nel **Pie' di pagina**, copiato dagli altri elenchi: `Record`
`{{RecordNumber}}` `Di` `{{FoundCount}}` a y **220**.

## Fase 5 — L'unico colore nuovo del progetto

Sul campo `Esito`: `Formato > Formattazione condizionale`, condizione
**La formula e' vera**:

```
RIL|Rilevazioni::Esito = "non conforme"
```

Aspetto: **grassetto** e **testo rosso `#DD0000`**.

E' il quarto caso in cui si scrive un codice colore a mano (vedi `CLAUDE.md`,
*I colori non si dettano*), e si usa **quel** rosso perche' e' quello che il
tema usa gia' per i numeri negativi: il file resta con un rosso solo.

Un registro in cui i fuori limite si trovano a occhio, senza leggere, e' la
differenza fra un elenco e un registro.

## Fase 6 — Lo script `91` e il trigger

Nuovo script **`91 - Rilevazioni - Entra nell'elenco`**:

```
Imposta acquisizione errori [ Attivato ]
Imposta variabile [ $cosa ; Get ( ParametroScript ) ]

Mostra tutti i record

Se [ $cosa = "nonconformi" ]
   Modalita' Trova
   Imposta campo [ RIL|Rilevazioni::Esito ; "non conforme" ]
   Esegui trova
   Se [ Get ( ConteggioTrovati ) = 0 ]
      Mostra tutti i record
      Mostra finestra personalizzata
          [ "Nessuna non conformita'" ;
            "Non ci sono rilevazioni fuori limite. Mostro tutto il registro." ]
   Fine se
Fine se

Ordina record [ Ripristina ; Senza finestra di dialogo ]
   Giorno    discendente
   DataOra   discendente
Vai al record [ Primo ]
```

`Imposta acquisizione errori` **prima** del trova: senza di quello, zero
record trovati fa comparire la finestra di FileMaker e lo script si ferma li'.

L'ordinamento con `Giorno` **per primo** non e' una scelta estetica: e' la
condizione perche' il Riepilogo iniziale compaia. Senza, le parti ci sono ma
non si vedono.

`Vai al record [ Primo ]` perche' dopo un ordinamento il record corrente puo'
essere a meta' elenco, e il registro va aperto in cima.

**Trigger:** Formati > `Imposta trigger di script...` >
**`OnLayoutEnter`** > `91 - Rilevazioni - Entra nell'elenco`, **senza
parametro**. Entrando dal menu si vede tutto; il filtro lo si chiede con il
pulsante.

**Sul menu:** `D_Menu`, il pulsante `Rilevazioni` punta a
`"D_Rilevazioni registra"` e si lascia com'e' — chi entra deve segnare una
temperatura. Il registro si raggiunge dal pulsante `Registro` che e' **gia**'
sulla maschera di registrazione, e che fino ad ora rispondeva *"non ancora
pronto"*.

## Fase 7 — Collaudo

1. Dal menu, `Rilevazioni`, poi `Registro`: **non dice piu' &laquo;non ancora
   pronto&raquo;** e si apre l'elenco.
2. I record sono raggruppati per giornata, con la **data in testa a ogni
   gruppo** e il numero di rilevazioni accanto.
3. I **giorni piu' recenti sono in cima**, e dentro ogni giorno l'ora piu'
   recente e' la prima.
4. La colonna `Ora` mostra **solo l'ora**, non data e ora.
5. Il conteggio di ogni gruppo corrisponde alle righe che vedi sotto.
6. Clic in un campo qualsiasi: **il cursore non entra**, non si puo' scrivere.
7. Una riga con esito `non conforme` si vede **rossa e in grassetto** senza
   doverla leggere.
8. Una rilevazione su un punto **visivo**: `Valore` e `Unita` vuote, `Esito`
   pieno, `Punto di controllo` e `Operatore` pieni.
9. `Solo non conformi`: restano le sole righe fuori limite, sempre raggruppate
   per giorno.
10. `Tutte`: torna tutto il registro.
11. Con un file in cui **non** ci sono non conformita', `Solo non conformi`
    dice *"Nessuna non conformita'"* e mostra tutto, **senza** lasciare
    l'elenco vuoto.
12. Registra una rilevazione nuova dalla maschera di registrazione, poi apri
    il registro: la rilevazione nuova e' **la prima riga del primo gruppo**.
13. Rientra come `MRossi` (set `Operatore`): l'elenco si apre, si legge, e
    non si scrive. Il pulsante `Solo non conformi` funziona anche a lui.

Il 6 e il 13 sono quelli che contano: un registro HACCP che si puo' correggere
dall'elenco non e' un registro.

## Poi

Con questa la **tappa 6 e' chiusa**: si misura una temperatura, il programma
dice se e' a norma, apre da solo la non conformita', e il registro si legge.

Tappa 7: `Sanificazioni e non conformita'` — le non conformita' che oggi
nascono da sole hanno bisogno di una maschera dove si chiudono, con la verifica
di efficacia e la firma di chi l'ha fatta.
