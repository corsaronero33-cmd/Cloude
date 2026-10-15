# Modulo 0 — Gli attrezzi

**Obiettivo della serata:** avere gli strumenti installati e **un tuo
programma che gira** e calcola lo scorporo dell'IVA di una riga di scontrino.
Nient'altro. Non impari il linguaggio stasera: metti su il banco di lavoro.

Tempo: una serata, due se l'installazione fa i capricci.

---

## 1. Cosa installi, e perche'

Tre cose, in questo ordine.

### Visual Studio Community

E' gratuita e **contiene tutto il resto**: il compilatore C#, il designer
visuale delle finestre, il debugger. Prendi l'edizione **Community** piu'
recente dal sito di Microsoft.

> **Sulla licenza, dato che venderai il prodotto.** La licenza di Visual
> Studio Community consente a **uno sviluppatore individuale di creare
> proprie applicazioni, anche a pagamento**. Dentro un'organizzazione il
> limite e' di **cinque utenti**, e la Community non e' utilizzabile dalle
> organizzazioni che Microsoft definisce *enterprise*: oltre **250 PC o
> utenti**, oppure oltre **un milione di dollari** di ricavi annui. Tu sei
> lontanissimo da quelle soglie, quindi sei a posto; ricontrolla il giorno
> che l'azienda cresce, e in ogni caso l'autorita' e' il testo di licenza
> della versione che installi, non questa nota.

Durante l'installazione ti chiede quali *workload* vuoi. Spunta:

- **Sviluppo di applicazioni desktop .NET** (`.NET desktop development`)

Quella sola basta: porta dentro l'SDK di .NET, WinForms con il suo designer e
il debugger. Sono alcuni GB, mettila a scaricare e vai a cena.

> **Nota sulle versioni.** .NET esce con una versione nuova ogni anno, e una
> ogni due e' **LTS** (supporto a lungo termine, tre anni). Per un prodotto
> da vendere si usa sempre una LTS. Quale sia la LTS corrente la verifichiamo
> insieme quando installi, cosi' non andiamo a memoria.

### PostgreSQL

Scarica l'installer per Windows dal sito di PostgreSQL. Durante
l'installazione:

- lascia spuntato **pgAdmin** (e' il programma per guardare dentro al
  database: e' il tuo equivalente della finestra di gestione del database di
  FileMaker);
- ti chiede una **password per l'utente `postgres`**. Scrivila da qualche
  parte. Serve ogni volta e non si recupera comodamente.
- porta: lascia **5432**, quella standard.

Stasera non ci fai niente. Serve installato per il modulo 3.

### Git

Scaricalo da `git-scm.com`, installazione tutta avanti-avanti. Visual Studio
lo usa da solo, quindi non devi imparare comandi stasera.

Git e' lo **storico del progetto**: ogni salvataggio importante resta per
sempre e si puo' tornare indietro. E' il motivo per cui puoi smanettare sul
codice senza paura di rompere niente in modo definitivo — e come vedrai e'
anche il posto dove tengo la memoria del progetto fra una sessione e l'altra.

---

## 2. Il primo programma

Apri Visual Studio e fai **Crea un nuovo progetto**. Nella ricerca scrivi
`console`, scegli **App console** con il linguaggio **C#**, e dai un nome:
`PrimoCalcolo`.

Ti si apre un file `Program.cs` con una riga dentro. **Cancella tutto** e
incolla questo:

```csharp
// Una riga di scontrino: 2 confezioni a 1,30 euro, IVA 22%.
decimal quantita = 2m;
decimal prezzoUnitarioLordo = 1.30m;
decimal aliquotaIva = 22m;

// Il totale di riga, arrotondato al centesimo.
decimal totaleLordo = Math.Round(
    quantita * prezzoUnitarioLordo, 2, MidpointRounding.AwayFromZero);

// Lo scorporo: il prezzo ha l'IVA dentro, l'imponibile si ricava dividendo.
decimal imponibile = Math.Round(
    totaleLordo / (1m + aliquotaIva / 100m), 2, MidpointRounding.AwayFromZero);

// L'imposta per differenza, cosi' le tre voci quadrano sempre al centesimo.
decimal imposta = totaleLordo - imponibile;

Console.WriteLine($"Totale      {totaleLordo,8:N2}");
Console.WriteLine($"Imponibile  {imponibile,8:N2}");
Console.WriteLine($"IVA 22%     {imposta,8:N2}");
```

Premi **F5**. Deve comparire una finestra nera con:

```
Totale          2,60
Imponibile      2,13
IVA 22%         0,47
```

Se vedi quei tre numeri, il banco di lavoro e' in piedi. Verifica a mente:
2,13 + 0,47 = 2,60. Quadra, ed e' quadrato **per costruzione**, non per
fortuna.

### Cos'hai appena letto, riga per riga

**`// commento`** — tutto cio' che segue `//` e' per gli umani, il
compilatore lo ignora.

**`decimal quantita = 2m;`** — dichiari una variabile dicendo **di che tipo
e'**. Questa e' la differenza piu' visibile rispetto a FileMaker, dove un
campo lo definisci nella struttura e poi lo usi. Qui lo dici nel codice, e il
compilatore ti blocca **prima di eseguire** se provi a metterci dentro una
cosa di tipo sbagliato. Sembra una seccatura, e invece e' il tuo primo
collaudatore gratuito.

**`decimal`** — il tipo per i soldi. Conta in centesimi esatti. Esiste anche
`double`, che e' piu' veloce ma approssima: `0,1 + 0,2` in `double` non fa
esattamente `0,3`. Su un gestionale **non si usa mai `double` per un importo**.

**Il suffisso `m`** in `2m` e `1.30m` significa "questo numero e' un
`decimal`". Senza `m`, C# lo interpreta come `double` e si rifiuta di
assegnarlo. Te lo scordereai per le prime due settimane, e il compilatore te
lo ricordera' ogni volta.

**Il punto decimale** — nel **codice** si scrive `1.30` con il punto, sempre,
indipendentemente dalla lingua del computer. Nell'**output** vedi `2,60` con
la virgola, perche' Windows e' configurato in italiano. Due mondi diversi: il
codice e' in "notazione macchina", cio' che l'utente vede segue le
impostazioni locali. Non confonderli.

**`Math.Round(valore, 2, MidpointRounding.AwayFromZero)`** — arrotonda a 2
decimali, con il mezzo centesimo **verso l'alto**. Il terzo parametro non e'
pignoleria: lo vedi nell'esercizio.

**`$"Totale {totaleLordo,8:N2}"`** — il `$` davanti alle virgolette abilita i
segnaposto fra graffe. Dentro: `totaleLordo` e' il valore, `,8` dice
"incolonna in 8 caratteri", `:N2` dice "formato numerico con 2 decimali".

**Nessun `Main`** — negli esempi che trovi in giro vedrai un
`static void Main(string[] args)` che racchiude tutto. Nelle versioni recenti
di C# in un file di programma puoi scrivere le istruzioni direttamente. E'
la stessa cosa, con meno cerimonia.

---

## 3. L'esercizio

Nel codice sopra, sostituisci le prime tre righe con queste:

```csharp
decimal quantita = 0.5m;
decimal prezzoUnitarioLordo = 2.89m;
decimal aliquotaIva = 22m;
```

Mezzo chilo a 2,89 euro: 1,445 euro, un mezzo centesimo esatto. Esegui e
annota il totale.

Ora **togli il terzo parametro** dalla prima `Math.Round`, lasciando solo
`Math.Round(quantita * prezzoUnitarioLordo, 2)`. Esegui di nuovo.

**Il totale cambia di un centesimo.**

Il motivo: il comportamento di default di `Math.Round` in .NET e'
l'arrotondamento **"al pari"** — di fronte a un mezzo centesimo va verso la
cifra pari, quindi 1,445 diventa 1,44. L'arrotondamento **commerciale**, che
e' quello che vuole il fisco italiano, porta il mezzo centesimo sempre verso
l'alto: 1,45.

Tieni a mente la forma di questo errore, perche' e' la piu' pericolosa che
incontrerai: **non da' nessun messaggio, non si schianta, non si vede.**
Produce soltanto totali sbagliati di un centesimo, che scopri quando un
cliente ti chiama perche' il registratore telematico rifiuta lo scontrino, o
perche' la chiusura di cassa non torna. Il mestiere, in buona parte, e'
sapere dove stanno questi.

---

## 4. Cosa riportarmi

Alla fine della serata dimmi:

1. I tre numeri che ti stampa il primo programma.
2. I due totali dell'esercizio, prima e dopo aver tolto il parametro.
3. Quale versione di .NET ti ha installato Visual Studio (la trovi in
   **Progetto > Proprieta'**, voce *Framework di destinazione*).
4. **Dove ti sei bloccato o cosa non ti e' tornato**, anche se e' una
   sciocchezza. Serve a me per calibrare il modulo 1, e una domanda che non
   fai e' una lacuna che resta.
