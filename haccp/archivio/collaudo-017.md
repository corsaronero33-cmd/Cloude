# Collaudo 017 — Revisione 16, lo script `20` e' a posto. I record vuoti no.

Scheda di lavoro:
<https://claude.ai/artifact/6z2L966mmMiMQz4Vqi1pwG>

Domanda di partenza, testuale: *"mi ritrovo dei record (tutti vuoti pero')
sul formato dove registro le rilevazioni, il quale contiene solo campi
globali. Come Mai? E' normale?"*

**Risposta corta: il contatore e' normale, i record vuoti no, e non li ha
creati lo script `20`.**

---

## 1. Lo script `20`, verificato passo per passo

Tutte e cinque le correzioni del collaudo 016 risultano applicate, nell'ordine
giusto:

| | Correzione | Dove si legge |
|---|---|---|
| 5 | `Salva record/richieste` come primo passo | riga 12 |
| 6 | `RIL\|Rilevazioni::gIdPuntoControllo` nel primo controllo | riga 15 |
| — | il secondo controllo chiede il dato giusto per il tipo di punto | riga 20 |
| — | `Blocca finestra` prima del salvataggio | riga 26 |
| 2 | `$nome` da `RIL\|PuntiControllo::Descrizione` | riga 45 |
| 4 | `Vai al formato [ NonConformita ]` invece di `Nuova finestra` | riga 56 |
| 4 | `Vai al formato [ Z_RIL Rilevazioni ]` invece di `Chiudi finestra` | riga 67 |
| 3 | chiusura comune: `Vai al formato` + 4 svuotamenti + salva | righe 74-80 |
| 2 | `"Rilevazione registrata: " & $nome & " - conforme."` | riga 88 |
| — | `Vai al campo [ gIdPuntoControllo ]` in fondo | riga 91 |

La struttura e' quella voluta: un `Se` che **fa** il lavoro in piu', la
chiusura comune, un `Se` che **dice** la cosa diversa.

### Due residui da togliere

**`20 - Rilevazioni - Registra Copia`** e' ancora nel file: e' la vecchia
versione, con la finestra `nc`, i doppioni e il messaggio senza nome. Fare una
copia prima di rifare uno script e' giusto; lasciarla nel file dopo, no. Va
**eliminata**: finche' c'e', e' uno script che qualcuno puo' lanciare.

**`Blocca finestra` compare due volte**, alla riga 26 (quella giusta) e alla
riga 55, dentro il ramo della non conformita' — resto della vecchia versione,
dove serviva prima di aprire la finestra. Adesso la riga 55 non fa niente:
la finestra e' gia' bloccata dalla 26. Si cancella.

---

## 2. Perche' un formato di soli campi globali ha un contatore di record

**Perche' un formato non contiene record: e' una finestra su una tabella.**

`D_Rilevazioni registra` e' basato sull'occorrenza `RIL|Rilevazioni`, cioe'
guarda la tabella `Rilevazioni` — **la stessa dove finiscono le rilevazioni
registrate**. Il contatore in alto a sinistra conta i record di quella
tabella, non quello che e' disegnato sopra.

I campi globali sono un'altra cosa: **non appartengono a nessun record**.
Valgono uno per tutto il file, e si vedono uguali da qualunque record.
Un formato che mostra solo globali resta comunque agganciato alla sua tabella.

Quindi: contatore e frecce di scorrimento su quella maschera sono **normali**.
Quelli che scorrono sono le rilevazioni.

## 3. Perche' quei record sono vuoti, e chi li ha creati

Non lo script `20`: la riga 29 crea il record e le sei righe dopo lo
riempiono subito. E non `93 - Utilita - Nuovo`, che non ha pulsanti su questa
maschera. Gli unici passi `Nuovo record/richiesta` del file sono questi:

| Script | Riga | Su quale formato |
|---|---|---|
| `20 - Rilevazioni - Registra` | 29 | `Z_RIL Rilevazioni` |
| `20 - Rilevazioni - Registra` | 58 | `NonConformita` |
| `20 - Rilevazioni - Registra Copia` | 27 | `Z_RIL Rilevazioni` |
| `93 - Utilita - Nuovo` | 10 | quello di partenza |
| `96 - Impresa - Apri la scheda` | 7 | `D_Impresa scheda` |

Li ha creati **la mano**: il pulsante **+** della barra degli strumenti,
`Ctrl+N`, oppure `Record > Nuovo record` dal menu. Sulla maschera, stando in
Modalita' Scheda, basta una di queste tre strade.

**E non ci si accorge, per una ragione precisa.** `D_Rilevazioni registra` ha
**una parte sola, l'Intestazione: non ha il Corpo**. Il Corpo e' la parte che
FileMaker disegna una volta per record. Senza Corpo, un record nuovo **non si
vede**: a schermo non cambia niente, il contatore passa da 12 a 13 e nessuno
guarda il contatore. Per questo si sono accumulati.

Questa non e' una svista del formato: la parte unica e' voluta, ed e' spiegata
nella scheda 18 — i campi globali nel Corpo non si vedrebbero affatto a
tabella vuota.

## 4. Perche' FileMaker li salva senza protestare

Perche' per FileMaker **non sono vuoti**. Letto dal DDR:

| Campo | Auto-immissione | Convalida |
|---|---|---|
| `Id` | calcolo `Get (UUID)` | **Non vuoto**, univoco |
| `CreatoIl` | data e ora di creazione | — |
| `CreatoDa` | nome account di creazione | — |
| `IdPuntoControllo` | — | **nessuna** |
| `DataOra` | — | **nessuna** |

Il record nasce con `Id`, `CreatoIl` e `CreatoDa` gia' compilati da soli.
L'unico campo con `Non vuoto` e' `Id`, che si riempie da se'. Quindi la
convalida passa, FileMaker salva, e nessuno dice niente.

**La rete di sicurezza che manca:** `Non vuoto` su `IdPuntoControllo` e su
`DataOra`. Con quelle due, un record senza niente dentro non si salva piu' da
nessuna strada — ne' dal **+**, ne' da `Ctrl+N`, ne' da un'importazione, ne'
dalla vecchia copia dello script. Lo script `20` non ne soffre: riempie tutti
i campi **prima** di salvare.

Lasciare spuntato *"Consenti all'utente di ignorare durante l'immissione
dati"*: su una maschera senza Corpo FileMaker non puo' mostrare quale campo
manca, e un blocco senza via d'uscita sarebbe peggio del difetto. Quello che
serve e' che il record vuoto diventi **visibile** invece di nascere in
silenzio.

## 5. Alla consegna la strada si chiude da se'

Con i menu nascosti a tutti gli account e la barra degli strumenti via, il
**+**, `Ctrl+N` e `Record > Nuovo record` non esistono per l'operatore:
l'unico modo di creare una rilevazione resta il pulsante `REGISTRA`.
Il problema e' del collaudo, non della consegna — ma i record vuoti gia' nati
restano nel registro e vanno tolti a mano.

### Come si tolgono

Da `Admin` (il set `Operatore` non ha l'eliminazione su `Rilevazioni`):

1. andare su **`Z_RIL Rilevazioni`**, che ha il Corpo e mostra tutti i campi;
2. `Ctrl+F` per la Modalita' Trova, scrivere **`=`** da solo nel campo
   `IdPuntoControllo` e dare Invio — `=` e' l'operatore di FileMaker per
   "campo vuoto";
3. **guardare il set trovato prima di toccarlo**: `DataOra`, `Valore` ed
   `Esito` devono essere vuoti anche loro. Se un record ha qualcosa dentro,
   fermarsi;
4. `Record > Elimina record trovati`.

Il numero di record eliminati e' la misura di quante volte e' stato premuto
il **+**: vale annotarlo nel prossimo DDR.

---

## Resta aperto

- le sei etichette di colonna del collaudo 014;
- lo stile del tema (`Titolo Riquadro` / `Titolo maschera`) — si puo' lasciare;
- i quattro disallineamenti verticali da 2 punti;
- `D_Rilevazioni elenco`, la seconda maschera della tappa 6.
