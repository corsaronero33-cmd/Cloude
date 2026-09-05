# Da lavoro su misura a prodotto rivendibile

Il primo cliente e' un ristorante reale con una scadenza. L'obiettivo dichiarato
e' pero' rivendere la stessa soluzione ad altri locali.

Questo documento contiene **solo le scelte che vanno prese adesso** perche'
dopo costerebbero un rifacimento. Tutto il resto (listino, sito, contratti,
assistenza) viene dopo che il primo cliente e' in produzione: la scadenza del
primo cliente resta la priorita'.

---

## La regola che decide tutto: mai biforcare

Il modo tipico in cui muore un verticale e' questo. Il cliente A chiede un
campo suo. Si apre il file di A e lo si aggiunge. Da quel momento A ha un file
diverso da tutti gli altri, e all'aggiornamento successivo o si salta A o si
rifa' la modifica a mano. Con cinque clienti si tiene botta. Con quindici si
smette di aggiornare, e il prodotto muore.

**Regola: esiste un solo file di prodotto.** Ogni richiesta di un cliente
diventa una di queste tre cose, mai una quarta:

1. un **parametro** di configurazione, spento per gli altri;
2. una **funzione standard** del prodotto, disponibile a tutti;
3. un **no**, motivato.

Quando la tentazione di aprire il file del cliente e' forte, vuol dire che
manca un parametro. Si aggiunge il parametro.

---

## Un file per cliente, non un file con dentro tutti i clienti

Ogni locale ha il suo `Haccp.fmp12` ospitato.

**Perche' non un file unico multi-cliente:** i dati di autocontrollo di un
ristorante non stanno accanto a quelli di un concorrente, il ripristino di un
backup di un cliente non deve toccare gli altri, un cliente che se ne va si
porta via il suo file e basta, e nessun errore di filtro puo' mostrare a uno i
dati di un altro. Per un dato sanitario e per il GDPR, l'isolamento fisico e'
l'argomento piu' semplice da sostenere.

Il prezzo e' che gli aggiornamenti sono N: si paga con il Data Migration Tool,
che e' scriptabile.

Resta previsto il caso del **gruppo con piu' locali**: un solo file con piu'
record in `Impresa`, perche' il titolare vuole vederli insieme. Il modello
gia' lo regge.

---

## Impianto di un nuovo cliente: da due giorni a un'ora

Senza preparazione, ogni nuovo locale significa inserire a mano decine di punti
di controllo, il piano di sanificazione, i reparti, le attrezzature. Sono due
giorni di lavoro non fatturabili, ripetuti ad ogni vendita, ed e' il motivo per
cui molti verticali non scalano.

La soluzione sono le **tabelle modello**: una libreria di configurazioni
pronte per tipo di attivita', che vive dentro il prodotto e viene copiata nei
dati del cliente al momento dell'impianto.

### Tabelle nuove

**`TipiAttivita`**
`Codice`, `Descrizione`, `Note`, `Ordine`, `Attivo`.

Esempi: ristorante con cucina, pizzeria, bar e caffetteria, gastronomia con
laboratorio, pasticceria, mensa e catering, agriturismo, pescheria,
macelleria.

**`ModelliReparto`**
`IdTipoAttivita`, `Codice`, `Descrizione`, `Ordine`.

**`ModelliPuntoControllo`**
Stessi campi di `PuntiControllo`, piu' `IdTipoAttivita`.
Qui vive il patrimonio vero del prodotto: l'analisi HACCP gia' fatta, con i
CCP giusti, i limiti critici, le frequenze e le azioni correttive scritte
bene. E' quello che il cliente non saprebbe fare e per cui paga.

**`ModelliPianoSanificazione`**
Stessi campi di `PianoSanificazione`, piu' `IdTipoAttivita`.

**`ModelliProdotto`** (facoltativa)
Un elenco base di derrate comuni per categoria, con temperature di
accettazione gia' impostate. Fa risparmiare la prima giornata di inserimento.

### Come si usa

Script `90 - Impianto - Inizializza da modello`:

1. si sceglie il tipo di attivita';
2. lo script copia `ModelliReparto`, `ModelliPuntoControllo` e
   `ModelliPianoSanificazione` nelle tabelle vive del cliente;
3. da li' in poi il cliente modifica **le sue copie**, e i modelli restano
   intatti per il cliente successivo.

La copia e' voluta, non e' una duplicazione da evitare: se il locale stringe un
limite critico, deve cambiare per lui e per nessun altro.

### Aggiornamento dei modelli

Quando la normativa cambia o si migliora l'analisi, i modelli si aggiornano nel
file di prodotto. I clienti gia' impiantati **non** vengono toccati in
automatico: si genera un avviso ("il modello per la tua attivita' e' cambiato,
vuoi vedere le differenze?") e si decide caso per caso. Sovrascrivere la
configurazione di un locale che l'ha tarata col proprio consulente sarebbe un
danno, non un aggiornamento.

---

## Parametri, non campi nuovi

**`Parametri`** — tabella chiave/valore.
`Chiave`, `Valore`, `Tipo` (testo / numero / si-no / data), `Descrizione`,
`Categoria`, `ModificabileDalCliente` (si'/no).

All'avvio uno script legge tutta la tabella e la ribalta in variabili globali
(`$$PAR.BonificaPesce`, `$$PAR.CampioniPasto`, ...), cosi' i controlli nei
layout e negli script sono immediati e non fanno accessi ripetuti.

**Il motivo per cui e' chiave/valore e non una tabella con un campo per
opzione:** aggiungere un'opzione nuova deve essere l'inserimento di **un
record**, non una modifica di schema. Una modifica di schema, con quindici
clienti, significa quindici migrazioni. Un record no.

Parametri che servono da subito:

| Chiave | Cosa accende |
|---|---|
| `BonificaPesce` | registro della bonifica anisakis |
| `Frittura` | registro degli oli di frittura |
| `Abbattimento` | registro di abbattimento e raffreddamento rapido |
| `CampioniPasto` | conservazione campioni 72 ore (prescrizione locale) |
| `Ricette` | ricettario e scheda allergeni |
| `Catering` | passo avanti completo verso il destinatario |
| `AnalisiAcqua` | registro potabilita' (locali con pozzo) |
| `FirmaObbligatoria` | firma richiesta su ogni registrazione |
| `GiorniAvvisoScadenza` | soglia del semaforo scadenze |
| `NomeProdotto`, `ColorePrimario` | personalizzazione a video |

---

## Campi liberi: la valvola di sfogo

Su `Prodotti`, `Fornitori`, `Lotti`, `Ricevimenti` e `Rilevazioni` si
prevedono `Libero1` ... `Libero3` (testo), con l'etichetta a video presa dai
`Parametri` (`etichetta.Prodotti.Libero1`).

Non e' elegante. E' la ragione per cui il commerciale puo' dire di si' a una
richiesta particolare senza che nessuno apra il file di quel cliente. Tre campi
liberi hanno salvato piu' verticali di qualunque architettura.

---

## Versione dello schema e aggiornamenti

`Parametri` contiene la chiave `VersioneSchema` (numero intero progressivo).

Script `99 - Manutenzione - Aggiorna schema`: legge la versione corrente e
applica in sequenza i passi mancanti, uno per versione, esattamente come gli
script numerati `001_`, `002_` di un database SQL.

```
Se VersioneSchema < 2 : popola Parametri.GiorniAvvisoScadenza = 7 ...
Se VersioneSchema < 3 : ricalcola ScadenzaDopoApertura sui lotti aperti ...
```

FileMaker non ha le migrazioni: ce le facciamo noi, e sono l'unico modo per
sapere in che stato e' il file di un cliente che non si vede da un anno.

Va da se': **un passo gia' rilasciato non si tocca mai piu'**, se ne aggiunge
uno nuovo.

---

## Protezione del lavoro

- Il cliente riceve un account amministratore **senza accesso completo**:
  gestisce utenti e configurazione, non apre la struttura del database.
- L'accesso completo resta a te, con password robusta, e non viaggia via email.
- Valutare la **cifratura del database a riposo** (Encryption At Rest): protegge
  il file se qualcuno se lo copia, ed e' anche un argomento di vendita verso il
  cliente sui dati del personale.
- I modelli (`ModelliPuntoControllo` e compagnia) sono il patrimonio del
  prodotto: nel file del cliente ci vanno **le copie**, e l'accesso alle
  tabelle modello resta chiuso.

---

## Aggiornamenti: come si spedisce la versione nuova

Si resta a **file unico** (vedi `03-CONVENZIONI-FILEMAKER.md`), ma da
rivenditore cambia lo strumento:

1. si sviluppa sulla copia di lavoro;
2. si prova;
3. per ogni cliente si esegue il **Data Migration Tool**: file nuovo vuoto piu'
   file del cliente, travaso, sostituzione sul server;
4. all'apertura, `99 - Manutenzione - Aggiorna schema` sistema i dati.

E' scriptabile: quindici clienti sono un ciclo, non quindici serate.

**Da verificare subito**, prima di andare avanti: che il Data Migration Tool
sia effettivamente ottenibile con la forma di adesione che sceglierai. Se non
lo fosse, la decisione sul file unico va riaperta **ora**, non a prodotto
fatto, perche' senza DMT e con molti clienti la separazione dati/interfaccia
torna a valere.

---

## Cosa non cambia

Il cuore resta identico: `Lotti`, `Utilizzi`, `Rilevazioni`, i limiti critici
letti da `PuntiControllo` invece che scritti nelle formule.

Quella scelta era gia' quella giusta per un cliente solo. Con quindici e'
l'unica praticabile: se i limiti fossero nelle formule, ogni locale con una
temperatura diversa sarebbe una biforcazione.

---

## Ordine di lavoro

1. Consegnare **il primo cliente**, in tempo. Rimane la priorita'.
2. Costruire il file gia' con: tabelle modello, `Parametri`, campi liberi,
   `VersioneSchema`. Sono poche ore e sono le uniche cose irreversibili.
3. Il primo cliente si impianta **usando la procedura di impianto**, non a
   mano: e' il collaudo della procedura stessa.
4. Solo dopo: listino, contratto di assistenza, materiale di vendita.
