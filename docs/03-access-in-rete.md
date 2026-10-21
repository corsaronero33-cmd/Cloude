# Access su rete locale: cosa serve e cosa rompe

Cinque o sette postazioni su un `.accdb` in cartella condivisa funzionano
bene. Quasi tutti i gestionali Access che vanno male in rete vanno male per
una delle ragioni in questa pagina.

## Il motore ACE, e l'architettura giusta

L'applicazione parla con l'archivio attraverso **ACE**, il motore di
database di Microsoft Access. Va installato su **ogni postazione**, non sul
server: il server condivide solo un file.

Se sulla postazione c'e' gia' Microsoft Access (anche la sola versione
Runtime) ACE c'e' gia'. Altrimenti si installa il
*Microsoft Access Database Engine* redistribuibile.

**L'architettura deve combaciare.** Un eseguibile a 64 bit non parla con un
ACE a 32 bit, e viceversa: l'errore e' "provider non registrato" e sembra
un guasto quando invece e' solo questo.

| Sulla postazione c'e' | Compilare il progetto |
| --- | --- |
| Office / Access a 32 bit | **win32** |
| Office / Access a 64 bit | win64 |
| Niente Office, parco macchine misto | **win32** piu' ACE a 32 bit |

Con un parco misto conviene win32 per tutti: un eseguibile a 32 bit gira
anche su Windows a 64 bit, e un ACE a 32 bit si installa accanto a un
Office a 64 bit solo con l'opzione `/quiet` del pacchetto redistribuibile
(l'installazione normale si rifiuta). Un solo binario per tutti vale la
piccola scomodita'.

## Il percorso dell'archivio

Nel file `Gestionale.ini` accanto all'eseguibile:

```ini
[Archivio]
Percorso=\\SERVER\Gestionale\Dati\Gestionale.accdb
Password=
CartellaSql=

[Postazione]
Nome=UFFICIO1
```

**Forma UNC, non lettera di unita' mappata.** `X:\Gestionale.accdb`
funziona finche' su tutte le postazioni la X punta allo stesso posto, e
prima o poi su una non e' cosi': il risultato e' un errore che sembra un
guasto dell'archivio. `\\SERVER\...` e' uguale per tutti.

La cartella condivisa deve dare **modifica** a tutti gli utenti, non sola
lettura: ACE crea accanto all'archivio un file di lock `.laccdb` e deve
poterlo scrivere e cancellare. Una condivisione in sola lettura da' un
errore che parla di archivio esclusivo e non di permessi.

## Le cinque regole, e dove sono applicate

Sono tutte dentro `Sources/Database.twin`, cosi' nessuno le aggira per
sbaglio.

**1. Una connessione per postazione, aperta all'avvio.**
Aprire e chiudere la connessione a ogni query obbliga il motore a rileggere
il file di lock ogni volta, ed e' la prima causa di lentezza di un
gestionale Access in rete. Si apre al login e si chiude all'uscita.

**2. Blocco a livello di record, non di pagina.**
Nella stringa di connessione c'e' `Jet OLEDB:Database Locking Mode=1`. Con
il blocco di pagina (il valore 0, che e' il predefinito) due utenti che
modificano due clienti diversi si aspettano a vicenda solo perche' le due
righe stanno vicine nel file. La modalita' la decide **la prima postazione
che apre l'archivio**: tutte devono usare la stessa stringa, e se una
versione vecchia dell'eseguibile resta in giro il blocco torna di pagina
per tutti.

**3. I recordset di lettura nascono scollegati.**
`OpenRecordset` crea un cursore lato client, legge, e poi si stacca dalla
connessione. Una griglia agganciata a un cursore lato server tiene un
blocco aperto per tutto il tempo in cui l'utente guarda l'elenco, magari
fino a domani mattina. Per i pochi casi in cui serve scorrere un insieme
grande senza portarselo in memoria c'e' `OpenLiveRecordset`, da chiudere
appena finito.

**4. Query sempre con parametri.**
Non e' solo per le injection. Una data concatenata nell'SQL dipende dalle
impostazioni locali della postazione, e il `03/04` di una diventa il
`04/03` di un'altra. Lo stesso vale per il separatore decimale degli
importi. Con i parametri il tipo arriva al motore senza passare per il
testo.

**5. Transazioni corte, con ripetizione automatica.**
Una transazione aperta mentre l'utente compila una maschera blocca gli
altri. Si apre quando si salva e si chiude subito. I conflitti di blocco in
rete capitano e non sono errori: sono due postazioni che hanno chiesto la
stessa cosa nello stesso istante. `Database.Execute` riprova cinque volte
con attesa crescente, e solo dopo si lamenta.

## La numerazione dei documenti

Il progressivo delle fatture deve essere continuo e senza buchi, e due
postazioni che emettono nello stesso secondo non devono prendere lo stesso
numero. La strada sbagliata e':

```sql
SELECT MAX(Numero) + 1 FROM Documenti WHERE Anno = 2026
```

Fra la lettura e l'inserimento c'e' il tempo perche' un'altra postazione
faccia la stessa lettura. `Numeratore.twin` usa invece una tabella di
contatori e un comando che legge e scrive insieme:

```sql
UPDATE Numeratori SET UltimoNumero = UltimoNumero + 1 WHERE ...
```

L'`UPDATE` prende il blocco sulla riga del contatore e lo tiene per tutta
la transazione, quindi il secondo che arriva aspetta e poi legge il valore
nuovo. L'indice unico su tipo, serie e anno chiude l'ultima fessura: se due
postazioni provano a creare lo stesso contatore nello stesso istante, una
prende un errore di chiave duplicata e il `Numeratore` riprova.

**Il numero si chiede alla conferma del documento, non all'apertura della
maschera.** Un numero chiesto e poi abbandonato e' un buco nella
numerazione, e i buchi nelle fatture vanno spiegati. Se il salvataggio va
male subito dopo, `RilasciaSeUltimo` riporta indietro il contatore, ma solo
se nel frattempo nessun altro ha numerato.

## Backup e manutenzione

Un archivio Access **si corrompe**. Non spesso, ma succede: un calo di
tensione sul server, un cavo di rete che balla, una postazione che si
spegne a meta' di una scrittura. Il piano di manutenzione non e' opzionale.

**Backup.** Copia automatica del `.accdb` almeno una volta al giorno, con
la storia di qualche settimana e non una copia sola che si sovrascrive. Il
file si copia solo quando nessuno e' collegato, quindi di notte: una copia
fatta a archivio aperto puo' contenere una scrittura a meta'. Un
accorgimento utile: se accanto all'archivio esiste il file `.laccdb` e non
e' vuoto, c'e' ancora qualcuno collegato.

**Compattamento.** Ogni mese, o quando il file cresce vistosamente. Access
non restituisce lo spazio dei record cancellati finche' non si compatta, e
un file gonfio e' un file lento. Si fa a archivio chiuso, dopo un backup.

**Antivirus.** Escludere la cartella dell'archivio dalla scansione in
tempo reale. Un antivirus che apre il `.accdb` mentre ACE ci sta scrivendo
e' una delle cause tipiche di lentezza improvvisa e di corruzione.

**Ricerche e indici.** Gli indici che servono ci sono gia' nello schema. Se
una ricerca per descrizione articolo diventa lenta, il problema non e'
l'indice: e' una query con `LIKE '%qualcosa%'`, che nessun indice puo'
aiutare. Si risolve cercando per inizio di parola (`LIKE 'qualcosa%'`) o
tenendo in archivio una colonna normalizzata.

## Cosa non si risolve

Una **VPN** o un **Wi-Fi instabile** non si sistemano con nessuna
impostazione. ACE legge il file a blocchi come fosse un disco locale: una
disconnessione a meta' di una scrittura corrompe l'archivio. Con sedi
remote serve un desktop remoto sul server, oppure un vero server di
database.

Oltre le dieci postazioni contemporanee, o oltre il gigabyte di archivio,
conviene spostarsi su SQL Server Express. Lo schema e' stato scritto per
quel giorno: vedere la fine di [01-architettura.md](01-architettura.md).

## Preparare l'archivio

Dal server o da una postazione, una volta sola:

```
cscript //nologo CreaDatabase.vbs \\SERVER\Gestionale\Dati\Gestionale.accdb
```

Lo script sta in `Database/Tools/`. Crea il file e gli applica le
migrazioni di `Database/sql/`. Anche qui conta l'architettura: con ACE a 32
bit va usato `C:\Windows\SysWOW64\cscript.exe`, con ACE a 64 bit
`C:\Windows\System32\cscript.exe`.

L'utente `admin` nasce **senza password**, cosi' non resta in giro una
password predefinita che nessuno cambia: la prima cosa che l'applicazione
dovra' fare al primo accesso e' chiedere di impostarla.

A regime lo stesso lavoro lo fara' l'applicazione da sola, con
`Database.CreateDatabase` e `Migrator.Apply`.
