# Tabella di marcia — da qui alla consegna

Pagina con lo stesso contenuto, piu' leggibile:
<https://claude.ai/artifact/7XnevvYVZU5pPmpdkpMcDZ>

**Il piano sta qui, e solo qui.** Sostituisce `DA-FARE.md`, che aveva finito
per contenere meta' piano e meta' appunti.

Dodici tappe, in ordine di dipendenza. Ognuna finisce con **una cosa che
funziona** e con un DDR da verificare.

---

## Le dodici tappe

| | Tappa | Finisce quando | |
|---|---|---|---|
| 0 | Le fondamenta | 26 tabelle, 42 relazioni, 23 liste valori, 13 funzioni, gli script del motore | **fatto** |
| 1 | Il menu e cinque anagrafiche | Reparti, Attrezzature, Fornitori, Prodotti, Operatori: elenco e scheda, ricerca, navigazione | **fatto** |
| 2 | Account e permessi | due set di privilegi, login all'apertura, script `94` che crea gli account | **fatto** |
| 3 | Punti di controllo | l'ultima anagrafica | **fatto** — `archivio/collaudo-012.md` |
| 4 | Impresa e Parametri | il menu e' completo: tredici pulsanti, tredici destinazioni | **fatto** — `archivio/collaudo-013.md` |
| 5 | Le larghezze | quindici formati a 1020, tutti chiusi a 996 | **fatto** — `archivio/collaudo-014.md` |
| 6 | Le rilevazioni | si misura una temperatura, il programma dice se e' a norma e apre da solo la non conformita' | **fatto** — `archivio/collaudo-019.md` |
| **7** | **Sanificazioni e non conformita'** | **gli altri due registri del quotidiano** | **← sei qui** |
| 8 | Ricevimenti e lotti | il **passo indietro** della rintracciabilita': da un lotto al DDT e al fornitore | |
| 9 | Le stampe | i registri in PDF per l'ispezione — **qui il lavoro diventa consegnabile** | |
| 10 | Il telefono | FileMaker Go: rilevazione al volo, codice a barre, firma | |
| 11 | La consegna | menu nascosti, blocco della rilevazione, impianto di un locale nuovo | |

**Perche' le larghezze alla 5 e non in fondo.** Dalla 6 alla 8 nascono sei
formati nuovi: se la misura di progetto si decide dopo, vanno rifatti tutti.
Mezza giornata adesso contro due poi.

**Perche' le stampe alla 9.** Un registro HACCP che non si stampa non serve a
niente davanti a un'ispezione. La 10 e la 11 rendono il lavoro piacevole e
rivendibile; la 9 lo rende **consegnabile**.

---

## Tappa 6 — Le rilevazioni

**Qui si smette di costruire i dati di contorno e si costruisce il
programma.**

La maschera con cui un cuoco, col guanto ancora addosso, segna che il frigo e'
a 3 gradi. Il programma confronta con `LimiteMin` e `LimiteMax` del punto di
controllo, scrive l'esito, e **se e' fuori limite apre da solo la non
conformita'** mostrando l'`AzioneCorrettiva` caricata alla tappa 3.

**Lo script `20 - Rilevazioni - Registra` e' scritto e collaudato dal primo
giorno** (`08-SCRIPT.md`): gira sul formato tecnico `Z_RIL Rilevazioni`. Alla
tappa 6 gli si mette davanti una faccia.

Due maschere, una scheda di lavoro ciascuna. **DDR a fine tappa.**

### `D_Rilevazioni registra` — `guide/18-rilevazioni-registra.md`

<https://claude.ai/artifact/EDoUvUjqFjFpL63ceLzBqE>

Porta con se' tre cose nuove: una **relazione da un campo globale**
(`RIL|PuntoScelto`) che fa vedere i limiti **prima** di registrare; un formato
con **una sezione sola**, perche' i campi globali nel corpo non si vedrebbero a
tabella vuota; e la coda dello script `20` da rifare.

**Montata, e corretta due volte.**

- `archivio/collaudo-015.md` — il pulsante creava un record vuoto e restava
  sul formato tecnico.
- `archivio/collaudo-016.md` — <https://claude.ai/artifact/6z2L966mmMiMQz4Vqi1pwG>
  i due rami dello script non si comportavano allo stesso modo. Causa vera: i
  due campi del valore sovrapposti **senza** le formule *Nascondi oggetto
  se*, per cui su un punto a temperatura il numero non si poteva digitare
  e l'esito usciva vuoto. Piu' la chiusura dello script scritta due volte, il
  messaggio del "Registrato" senza il nome del punto, e la finestra della non
  conformita' che lampeggiava con la propria barra dei menu.

- `archivio/collaudo-017.md` — <https://claude.ai/artifact/BY9HDSVmQ6XWKU9hwwPTvJ>
  Revisione 16: lo script `20` verificato passo per passo, **tutte le
  correzioni applicate**. Resta da togliere la copia dello script e un
  `Blocca finestra` di troppo. E la risposta ai record vuoti sulla maschera:
  non li crea lo script, li crea il **+** della barra degli strumenti, e non
  si vedono perche' il formato non ha il Corpo.

**Nota sul collaudo 016:** il suo primo rilievo, dato come il piu' grave, era
un errore di lettura del DDR ed e' stato **ritirato**. Da li' la regola
*"Mai dire manca senza una prova in positivo"* in `CLAUDE.md`.

- `archivio/collaudo-018.md` — Revisione 19: **niente da correggere**, e
  `0 record` vuoti. Chiusi anche i quattro punti rimasti dal collaudo 014: le
  sei etichette di colonna allineate al loro campo, i quattro disallineamenti
  verticali via.

- `archivio/collaudo-019.md` — Revisione 20: **`D_Rilevazioni elenco` montata
  e funzionante**, collaudo superato. Verificati nel DDR il Riassunto parziale
  raggruppato su `Giorno`, i due calcoli **memorizzati**, l'ordinamento,
  `Passa al modo Trova` senza Pausa, i parametri dei due pulsanti, il trigger e il
  rosso `#DD0000` della formattazione condizionale. Un difetto solo: il piede
  contava `{{TotalRecordCount}}` invece di `{{FoundCount}}`, che si vede solo
  dopo aver premuto il filtro. Piu' due passi disattivati da cancellare dentro
  lo script `91`.

**La tappa 6 e' chiusa.** Si misura una temperatura, il programma la confronta
con i limiti del punto, scrive l'esito, apre da solo la non conformita' con
l'azione correttiva, e il registro si legge per giornate con i fuori limite in
rosso.

### `D_Rilevazioni elenco` — `guide/19-rilevazioni-elenco.md`

<https://claude.ai/artifact/XmgzrxFqHYdJafeuqan71A>

Il registro: sola lettura, per data decrescente, raggruppato per giorno.

Porta con se' tre cose nuove: una **sezione Riassunto parziale**, che compare una
volta per gruppo e **solo se i record sono ordinati sul campo del gruppo**; due
**campi calcolati memorizzati** (`Giorno`, `Ora`), perche' `DataOra` e' diverso
su ogni record e quindi non raggruppa; e il **primo colore di allarme** del
progetto, la formattazione condizionale rossa sui fuori limite.

Nessuna relazione nuova: l'ancora `RIL` ha gia' `PuntiControllo`, `Operatori`,
`NonConformita`, `Attrezzature` e `PuntoScelto`.

### Tre cose nuove rispetto alle anagrafiche:

- la maschera non serve a **consultare** ma a **registrare**: si apre vuota e
  si chiude salvando;
- l'elenco delle rilevazioni e' un **registro**, quindi si legge per data e
  non si modifica;
- e' la prima maschera che un **operatore** usera' davvero, quindi la prova
  che conta e' farla usare a qualcuno che non l'ha costruita.

**Debito n. 1, spostato alla tappa 7 con una ragione.** Gli script `01`, `02`
e `10` girano sui formati nati dall'importazione, e dalla tappa 6 lo fa anche
lo script `20`, che per creare la non conformita' va sul formato
`NonConformita`. Quindi il debito e' cresciuto, non diminuito.

Si paga alla tappa 7, non prima, perche' e' la tappa che costruisce la
maschera delle non conformita': quel formato lo si tocca comunque. Il lavoro e'
piccolo e vale per tutti e quattro gli script insieme: **rinominare i formati
di importazione usati dagli script** con il prefisso `Z_` e l'ancora davanti
(`NonConformita` -> `Z_NCF NonConformita`, e cosi' per quelli di `01`, `02`,
`10`). FileMaker segue i formati per identificativo interno, quindi i
riferimenti negli script non si rompono.

Rinominarli adesso, a tappa 6 ancora aperta, vorrebbe dire toccare lo script
`20` due volte.

---

## Tappa 7 — Non conformita' e sanificazioni

**Gli altri due registri del quotidiano.** Alla tappa 6 le non conformita'
hanno cominciato a nascere da sole; qui imparano a **chiudersi**. Poi il
piano di sanificazione e il suo registro.

E' la tappa piu' larga: due meta', una maschera per scheda.

### 7a — Non conformita'

| Scheda | Maschera | Cosa fa |
|---|---|---|
| 20 | `D_NonConformita elenco` — `guide/20-nonconformita-elenco.md`, <https://claude.ai/artifact/RsvVpw9yn9GgPvfg2twiUY> | tutte le non conformita', **le aperte in cima e in rosso**, filtro *Solo aperte*. Piu' il debito n. 1 |
| 21 | `D_NonConformita scheda` — `guide/21-nonconformita-scheda.md`, <https://claude.ai/artifact/KUKhCxVnhfHBESUYo3i2Nf> | si legge cosa e' successo e il **Responsabile la chiude**: esito della verifica, efficacia, data e firma. Da qui nascono anche quelle a mano (reclamo, ispezione, analisi) |

Una non conformita' aperta e non chiusa e' **il primo rilievo che fa un
ispettore** (`02-DATI.md`). L'elenco deve mostrarle prima di tutto il resto.

### 7b — Sanificazioni

| Scheda | Maschera | Cosa fa |
|---|---|---|
| 22 | il piano di sanificazione | cosa si pulisce, con cosa, ogni quanto: nasce dai modelli importati come i punti di controllo alla tappa 3 |
| 23 | `D_Sanificazioni registra` | l'operatore segna cosa ha fatto oggi |
| 24 | `D_Sanificazioni elenco` | il registro |

La 7b si progetta **dopo** la 7a, con il DDR in mano: prima di disegnare il
piano va visto se `PianoSanificazione` e' gia' popolato o va generato dai
modelli.

### Fatto

- `archivio/collaudo-020.md` — Revisione 21: **debito n. 1 pagato**, gli
  script `01`, `02`, `20` seguono i formati rinominati; `D_NonConformita elenco`
  giusta salvo l'etichetta `GRAVITÀ` e il rosso. Corretto un mio errore: nei
  collaudi `MRossi` e' **Responsabile**, l'Operatore e' **`P_Pippo`**.

### Debito n. 1 — pagato nella scheda 20

Tre formati nati dall'importazione sono attraversati da uno script:
`Parametri` (script `01`), `Operatori` (`02`), `NonConformita` (`20`). Si
rinominano `Z_Parametri`, `Z_Operatori`, `Z_NonConformita`, cosi' nella
cartella `TECNICI` si distinguono dai diciotto che sono solo resti
dell'importazione. Alla consegna, chi fa pulizia saprebbe di non toccarli: con
`Imposta cattura errori` attivo, uno di quei tre cancellato fermerebbe lo
script **senza dire niente**.

Solo rinominare, non ripuntare sulle occorrenze-ancora: FileMaker segue i
formati per identificativo interno, quindi i riferimenti negli script non si
rompono; ripuntarli vorrebbe dire rifare a mano i campi di tre script che
funzionano, senza un guasto da togliere.

---

## In panchina

Non sono dimenticanze: ognuna ha un momento in cui conviene farla.

| Cosa | Rientra alla tappa |
|---|---|
| Script `95 - Reimposta password` (si duplica il `94`) | 11 |
| Impostazioni di FileMaker sul computer del cliente: avvisi di aggiornamento e annunci spenti, *All'avvio, apri il file*, file **fuori** da OneDrive/Dropbox, cartella dei dati esclusa dall'antivirus — nate dall'avvio lento: spegnere avvisi di aggiornamento e annunci ha portato l'avvio **da 20 a 6 secondi**; tre-quattro secondi sono il minimo della 22, <https://claude.ai/artifact/FSuheH9hognnyYBuQXiBGr> | 11 |
| Blocco della rilevazione dopo il salvataggio — con il meccanismo della scheda 21: permesso *Limitati* sul set e script con accesso completo | 11 |
| Lo script `10` non aggancia il prodotto dal GTIN | 8 |
| Controllo di completezza della riga di ricevimento (lotto, scadenza) | 8 |
| Le tabelle di fase 2 vuote: manca il **passo avanti** della rintracciabilita' | 11 |
| Lo stile `Titolo Riquadro` del tema (il ritocco rimasto, sotto) | 9 |

**L'unica voce che tocca un obbligo di legge** e' il passo avanti della
rintracciabilita': oggi si sa da dove viene un lotto, non in quale
preparazione e' finito. Va chiusa **prima** della consegna al cliente.

### Ritocco rimasto

Lo stile del tema si chiama ancora `Titolo Riquadro` e veste i quindici
titoli delle maschere; `Titolo maschera` esiste ma non lo usa nessuno. Si
chiude applicando il secondo ai quindici titoli ed eliminando il primo —
oppure **si lascia**: e' un nome interno, non cambia niente. Rientra alla
tappa 9, quando gli stili serviranno per le stampe.

---

## Le quattro regole del percorso

1. **Una tappa per volta**, e si finisce prima di cominciare la prossima. E'
   quando si aprono due cantieri che non si capisce piu' da dove viene un
   guasto.
2. **Fine tappa: DDR, e si verifica.** Dieci giri di verifica, dieci difetti
   veri trovati. Saltarlo e' costato una serata.
3. **La sicurezza si prova uscendo e rientrando.** Dall'account di accesso
   completo tutto funziona sempre: non prova niente.
4. **Una scheda di lavoro per maschera**, con le spunte. Si lavora a sessioni,
   e si deve poter riprendere senza rileggere tutto.

---

## Dove sta cosa — cinque posti, non di piu'

| Se cerchi | Guarda |
|---|---|
| **Il piano** | questo documento |
| **Come si costruisce una maschera** | `guide/`, numerate nell'ordine di montaggio |
| **Com'e' fatto il database** | i nove numerati, da `01-ANALISI` a `09-MASCHERE` |
| **Cosa risulta nel file vero** | `archivio/collaudo-NNN.md`, l'ultimo e' il `010` |
| **Le regole di scrittura** | `CLAUDE.md` |

Se una cosa non e' in uno di questi cinque posti, non esiste.
