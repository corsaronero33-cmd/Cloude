# Collaudo v009 — Attrezzature e menu

Fonte: `ddr/v009/HACCP_Revisione_7.xml` (22/09/2026).

**Esito: tre cose da sistemare, una da decidere.** Niente di rotto nella
logica: le tre correzioni sono un pulsante mancante, un pulsante che fa la
cosa sbagliata e due spazi di troppo.

---

## Verificato e a posto

| | |
|---|---|
| `D_Attrezzature scheda` | occorrenza `ATT\|Attrezzature`, tema HACCP, titolo "Attrezzatura" |
| `IdReparto` | **Pop-up Menu** con `vl_Reparti` — la correzione e' applicata |
| `Tipo`, `Attivo` | restano **Drop-down List**, com'e' giusto |
| `D_Attrezzature elenco` | colonna Reparto = `ATT\|Reparti::Descrizione`, il campo correlato |
| Allineamento colonne | **tutte e quattro**: etichetta e campo con la stessa X e la stessa larghezza |
| Trigger formato | `OnLayoutEnter` -> `91 - Attrezzature - Entra nell'elenco` |
| Trigger casella | `92 - Utilita - Cerca`, parametro `ATT\|Attrezzature::gCerca` |
| Pulsanti | `← Elenco` -> `"D_Attrezzature elenco"`, `Apri` -> `"D_Attrezzature scheda"`, `Tutti` -> lo script 91 giusto |
| `D_Menu` | dodici pulsanti, tutti con il parametro giusto |
| Accenti | etichetta `Non Conformità` con l'accento, parametro `"D_NonConformita elenco"` senza: **la trappola e' stata evitata** |

### Una cosa fatta meglio della specifica

Le **etichette della colonna destra** hanno larghezze diverse (132, 141, 98,
110) ma **finiscono tutte a 610**. E' esattamente il principio delle misure
vincolanti: il numero cambia, la relazione regge. Stessa cosa a sinistra, dove
finiscono tutte a 136.

### Una miglioria da adottare

Le due date usano **Drop-down Calendar**, che non avevo indicato. E' la scelta
giusta: su un campo data il calendario a tendina evita meta' degli errori di
battitura.

**Diventa standard: ogni campo di tipo Data prende il Drop-down Calendar.**
Riguardera' `DataQualifica` e `DataProssimaVerifica` sui fornitori,
`DataAssunzione` e `DataCessazione` sugli operatori.

---

## 1. Manca `+ Nuovo` su tutti e due gli elenchi

`D_Reparti elenco` e `D_Attrezzature elenco` hanno tre pulsanti: `Menù`,
`Tutti`, `Apri`. **`+ Nuovo` non c'e' piu'** — probabilmente e' stato tolto
per far posto alla casella di ricerca.

**La conseguenza.** Con l'elenco **vuoto** non c'e' nessun modo di creare il
primo record: alla scheda si arriva solo con `Apri`, e senza righe non c'e'
niente su cui premere. Oggi si rimedia con `Ctrl+N`, ma alla consegna la barra
degli strumenti sara' nascosta.

**Come si rimedia.** Un `+ Nuovo` nell'intestazione, accanto a `Menù`.
Se lo spazio manca perche' la casella di ricerca e' larga 763, la casella si
stringe: e' il numero meno vincolante di tutta la maschera.

Va fatto su tutti e due gli elenchi **prima** di duplicare le altre quattro
anagrafiche, se no si moltiplica per cinque.

---

## 2. Il pulsante `Esci` del menu non esce

```
Button 'Esci' -> 90 - Utilita - Vai a   PAR = "D_Reparti elenco"
```

Va all'elenco dei reparti. E' l'effetto della duplicazione: il pulsante ha
preso l'aspetto giusto e **anche l'azione del pulsante da cui e' nato**.

Deve essere: azione **Esegui passo script** -> `Esci dall'applicazione`,
nessun parametro.

---

## 3. Due spazi in fondo al nome dello script

```
"91 - Attrezzature - Entra nell'elenco  "
```

Cosmetico: FileMaker collega gli script per identificatore, non per nome,
quindi tutto funziona. Ma il giorno in cui uno script venisse chiamato **per
nome** dentro un calcolo, non verrebbe trovato, e la causa sarebbe invisibile
a occhio.

Rinominalo togliendo i due spazi.

---

## 4. Da decidere: le larghezze divergono

E' il **vincolo numero 6** di `../CLAUDE.md`: elenco e scheda della stessa
anagrafica larghi uguali.

| Formato | Il contenuto chiude a |
|---|---|
| `D_Reparti scheda` | 452 |
| `D_Reparti elenco` | 685 |
| `D_Menu` | 725 |
| `D_Attrezzature elenco` | 959 |
| `D_Attrezzature scheda` | **984** |

Fra scheda ed elenco delle attrezzature ballano 25 punti; fra reparti e
attrezzature ne ballano 500.

**Non e' un guasto**: FileMaker non ridimensiona la finestra da solo. Il
sintomo vero e' che, con la finestra aperta per stare comoda sulle
attrezzature, sui reparti resti con mezza finestra grigia a destra; e
viceversa, se la stringi per i reparti, sulle attrezzature compare la barra di
scorrimento orizzontale.

### La proposta

**Larghezza di progetto: 960. Il contenuto chiude a 936**, cioe' 24 dal bordo,
come il margine sinistro.

960 perche' e' la misura che le attrezzature hanno chiesto davvero, e
`PuntiControllo` non chiedera' di meno.

Cosa cambia, formato per formato:

| Formato | Cosa fare |
|---|---|
| `D_Attrezzature elenco` | colonna `Reparto` da largh. 250 a **227**; `<<$$UTENTE.Nome>>` a x 681; `Tutti` a x 858. Rettangolo bianco e linea restano a tutta larghezza |
| `D_Attrezzature scheda` | riquadri e `Note` da largh. 950 a **912**, partendo da x 24; `<<$$UTENTE.Nome>>` a x 681 |
| `D_Menu` | quattro pulsanti larghi **216** a x 24 / 256 / 488 / 720; le tre linee da x 24 larghe 912 |
| `D_Reparti elenco` | allarga l'ultima colonna fino a 936 |
| `D_Reparti scheda` | allarga i campi, o lascia l'aria a destra: e' una scheda da quattro campi |

**Quando.** Prima di duplicare Fornitori: ogni anagrafica nata da Attrezzature
eredita la sua larghezza, e correggerne cinque costa cinque volte tanto.

---

## Piccolezza

Nel riquadro 1 della scheda il passo verticale e' **40, 43, 43** invece che
costante (le Y sono 42, 82, 125, 168). Nel riquadro 2 e' costante a 40. Tre
punti non si vedono, ma se ci metti mano scegli 40 e mettili a 42, 82, 122,
162.
