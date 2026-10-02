# Da fare

**Tutto quello che e' aperto sta qui dentro.** Se una cosa non e' in questa
pagina, o e' fatta o non esiste.

Tre sezioni: il **prossimo passo**, i **ritocchi** (piccoli, dalla verifica
del file reale), i **debiti** (rimandati di proposito, con il motivo).

---

## Prossimo passo

**Compilare il set di privilegi**, sei passi: `guide/12-rimettiamo-in-ordine.md`.
Poi un DDR e un giro di verifica completo, prima di qualsiasi altra cosa.

Dopo, nell'ordine: `guide/11-operatori-accesso.md` (la scheda operatore
rifatta), lo script `93`, lo script `95`, e **PuntiControllo**.

### Aperto da stasera

Lo script `90` dice *"la maschera non c'e' ancora"* anche quando il formato
c'e' ma i record non sono leggibili: `Vai al formato` torna un errore di
accesso negato e il controllo lo scambia per un formato mancante. Va distinto
il caso del formato mancante da quello del permesso negato.

---

## Il resto della sicurezza

**Account e permessi** — scheda di lavoro con le spunte:
`guide/10-sicurezza.md`, e subito dopo `guide/11-operatori-accesso.md`, che
rifa' la scheda dell'operatore con il riquadro dell'accesso.

I due set di privilegi, gli account creati dalla scheda dell'operatore con lo
script `94`, e i pulsanti che devono esistere perche' **alla consegna i menu
saranno nascosti**. La fase 3 contiene l'unica cosa irreversibile del
progetto: leggila prima di farla.

Poi **PuntiControllo**, ultima anagrafica e la piu' importante: avra' una
scheda sua, e si costruira' gia' sapendo cosa l'operatore potra' premere.

---

## Ritocchi

Piccoli, nessuno blocca.

### Su `D_Operatori` — **stanno nella fase 1 di `guide/11-operatori-accesso.md`**

| | Cosa | Dove |
|---|---|---|
| 1 | Il campo `Account FM` ha ancora il controllo **Menu a comparsa** con `vl_Fornitori`, ereditato dalla duplicazione dei prodotti: va messo **Casella di modifica, nessuna lista** | `D_Operatori scheda` |
| 2 | Controlla gli altri campi di testo per lo stesso motivo: una duplicazione si porta dietro **il controllo**, non solo il campo | `D_Operatori scheda` |
| 3 | E' rimasto un oggetto `$$PARAMETRI` fuori posto in fondo al formato: cancellalo | `D_Operatori scheda` |
| 4 | Il titolo del riquadro dice `DATI DEL FPRODOTTO`: va `DATI DELL'OPERATORE` | `D_Operatori scheda` |
| 5 | `ColorePrimario` vale ancora `#1F4E5F`, il colore del tema vecchio: va `#1B3A5C` | tabella `Parametri` |

### Aperti da piu' giri

| | Cosa | Dove |
|---|---|---|
| 6 | **Manca `+ Nuovo`**: con l'elenco vuoto non si crea il primo record. Script `93` | tutti e due gli elenchi |
| 7 | Il pulsante **`Esci`** va all'elenco dei reparti invece di uscire: azione `Esegui passo script` -> `Esci dall'applicazione` | `D_Menu` |
| 8 | Due spazi in fondo al nome dello script `91 - Attrezzature - Entra nell'elenco` | Area di lavoro Script |
| 9 | **Da decidere:** larghezza di progetto **960**, contenuto che chiude a **936**. Oggi i formati chiudono a 452, 685, 725, 959 e 984 | tutti |

### Dalla verifica in `archivio/collaudo-007.md`

| | Cosa | Dove |
|---|---|---|
| A | `Apri` sta a x **1**, tocca il bordo: portalo a **24**, e con lui `Codice` a 85 e `Descrizione` a 264 (larghezza 276) | `D_Reparti elenco` |
| B | L'etichetta di colonna `Ordine` sta a y **113**, le altre tre a **115** | `D_Reparti elenco` |
| C | La scheda finisce a **452**, l'elenco a **685**: passando da una all'altra la finestra salta. Porta la scheda a 685 e `<<$$UTENTE.Nome>>` a x 425 | `D_Reparti scheda` |
| D | Lo stile si chiama `Titolo Riquadro` ma e' applicato al titolo dell'intestazione, e i riquadri non esistono piu': rinominalo **`Titolo maschera`** e risalva il tema | tema `HACCP` |
| E | `OnObjectExit` sulla casella di ricerca: funziona, ma `OnObjectSave` evita che la ricerca riparta uscendo dal campo per cliccare `Apri` | `D_Reparti elenco` |


Le misure a cui riportarsi stanno in `09-MASCHERE.md`, sezione *Misure
standard*.

---

## Debiti

Cose sapute, rimandate di proposito, con il motivo e il momento in cui vanno
chiuse. Non sono dimenticanze: sono decisioni di rinviare.

---

## 1. Gli script poggiano sui formati nudi

**Cosa.** Quattro script su cinque usano i formati nati dall'importazione:
`01` sta su `Parametri`, `02` su `Operatori`, `00` manda su `Rilevazioni`, e
lo `20` crea la non conformita' su `NonConformita`. Sono tutti formati
provvisori.

**Perche' rimandato.** Funzionano: quegli script leggono e scrivono soltanto
campi della propria tabella, quindi l'occorrenza nuda basta. Rifarli adesso
significherebbe rimettere le mani su script gia' finiti per un guadagno che
arriva due sessioni dopo.

**Quando si salda.** Nella sessione delle maschere (`09-MASCHERE.md`), insieme
alla pulizia dei 23 formati automatici. **Iniziata:** le maschere desktop si
costruiscono sulle occorrenze ancora, quindi i formati automatici diventano
cancellabili mano a mano che vengono sostituiti. Li' si creano i formati definitivi e
si ripuntano gli script tutti in una volta, con il file davanti.

**Cosa succede se si dimentica.** Cancellando i formati automatici i passi
`Vai al formato` diventano `<Formato mancante>` e gli script si fermano. Non
e' un danno ai dati, ma e' un'ora persa a capire perche'.

L'unico gia' a posto e' lo `20`, che sta su `Z_RIL Rilevazioni`: quello e' un
formato tecnico creato apposta, e resta.

---

## 2. Lo script 10 non aggancia il prodotto

**Cosa.** `10 - Ricevimento - Leggi etichetta` compila lotto e data di
scadenza dal codice a barre, ma non collega la riga al prodotto, che
l'operatore deve ancora scegliere a mano.

**Perche' rimandato.** Trovare il prodotto dal GTIN richiede una relazione in
piu' nel grafico, e come farla dipende da come si presentera' il ricevimento a
video.

**Quando si salda.** Sessione delle maschere, insieme al ricevimento merci su
iPhone.

---

## 3. I riferimenti di `RigheRicevimento` cambieranno occorrenza

**Cosa.** Lo script `10` scrive `RigheRicevimento::Lotto` e simili, che oggi
si risolvono sull'occorrenza nuda perche' lo script si lancia da quel formato.
Quando ci sara' la maschera del ricevimento, basata su `RIC|RigheRicevimento`,
quei riferimenti andranno riscritti con il prefisso `RIC|`.

**Perche' rimandato.** La maschera non esiste ancora.

**Quando si salda.** Stessa sessione delle altre due voci.

---

## 4. Manca il controllo di completezza della riga di ricevimento

**Cosa.** Nessuno verifica che una riga di ricevimento abbia lotto e scadenza
quando il prodotto li richiede. Lo script che legge l'etichetta riempie quello
che trova e avvisa soltanto se non ha capito niente, ed e' giusto cosi': un
avviso che scatta ad ogni consegna viene chiuso senza leggerlo, e da quel
momento non serve piu'.

**Dove va fatto.** Al salvataggio della riga, dove si puo' leggere da
`Prodotti::RichiedeLotto` e `Prodotti::RichiedeScadenza` se *quel* prodotto li
esige, e bloccare solo chi deve essere bloccato.

**Perche' rimandato.** Il salvataggio della riga non esiste ancora: oggi le
righe si creano a mano sul formato nudo.

**Quando si salda.** Sessione delle maschere, insieme al ricevimento merci.

**Cosa succede se si dimentica.** Si puo' chiudere un ricevimento senza il
lotto di un prodotto che lo richiede, e la rintracciabilita' di quella merce
si perde. E' il tipo di buco che si scopre durante un'allerta alimentare,
cioe' nel momento peggiore.

---

## 5. Le tabelle di fase 2 sono vuote

`Utilizzi` esiste ed e' collegata, ma niente la riempie: serve `Preparazioni`,
che e' di fase 2. Finche' non c'e', la rintracciabilita' copre il **passo
indietro** (fornitore, DDT, lotto) ma non il **passo avanti** (in quale
preparazione il lotto e' finito).

E' l'unico debito che tocca un obbligo di legge, quindi va chiuso prima della
consegna al cliente, non dopo.
