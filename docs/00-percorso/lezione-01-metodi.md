# Modulo 1a — Dai calcoli ai metodi

Il codice del modulo 0 funziona, ma calcola **una** riga sola. Per calcolarne
un'altra devi riscriverlo tutto. Oggi lo trasformi in qualcosa di
riutilizzabile, e scrivi il tuo primo controllo automatico.

Tempo: una serata.

---

## Prima: tre domande sul modulo 0

Rispondimi a parole tue, anche sbagliando. Servono a me per sapere cosa hai
assorbito e cosa va ripreso. Se una risposta non la sai, scrivi "non lo so":
e' un'informazione utile, non una brutta figura.

1. Perche' ho scritto `2m` e non semplicemente `2`?
2. Nel codice ho scritto `1.30` con il **punto**, ma a schermo e' uscito
   `2,60` con la **virgola**. Perche' non e' un errore?
3. L'imposta l'ho calcolata come `totaleLordo - imponibile`, invece di
   `imponibile * 0,22`. Che problema evita questa scelta?

---

## Il problema

Guarda il codice del modulo 0 con occhio critico. Per calcolare la riga
successiva dello scontrino dovresti copiare e incollare tutto, cambiando i
numeri. Dieci righe di scontrino, dieci copie della stessa formula. E il
giorno che l'arrotondamento va corretto, va corretto in dieci posti &mdash;
cioe' in nove, perche' uno te lo dimentichi.

In FileMaker avresti fatto uno **script con parametri**. Qui si fa un
**metodo**, che e' la stessa idea con due differenze:

- i parametri hanno un **tipo dichiarato**, quindi il compilatore verifica
  che tu passi un importo dove serve un importo;
- il risultato **esce dal metodo** con `return`, invece di restare in una
  variabile globale che qualcun altro deve ricordarsi di leggere.

## Il codice

Crea un nuovo progetto console come l'altra volta, chiamalo `Calcoli`.
Cancella il contenuto di `Program.cs` e incolla questo.

```csharp
// I calcoli fiscali di base, raccolti in un posto solo.
// Da qui in avanti chiunque abbia bisogno di scorporare l'IVA chiama questi
// metodi, invece di riscrivere la formula: se un giorno la regola cambia,
// si cambia qui e cambia per tutti.
static class Calcoli
{
    // Arrotondamento commerciale a due decimali: il mezzo centesimo va in su.
    public static decimal Arrotonda(decimal valore)
    {
        return Math.Round(valore, 2, MidpointRounding.AwayFromZero);
    }

    // Il totale di una riga: quantita' per prezzo, meno lo sconto di riga.
    public static decimal TotaleRiga(
        decimal quantita, decimal prezzoLordo, decimal scontoPercentuale)
    {
        decimal lordo = quantita * prezzoLordo * (1m - scontoPercentuale / 100m);
        return Arrotonda(lordo);
    }

    // L'imponibile scorporato da un importo che ha l'IVA dentro.
    public static decimal Imponibile(decimal totaleLordo, decimal aliquotaIva)
    {
        return Arrotonda(totaleLordo / (1m + aliquotaIva / 100m));
    }

    // L'imposta, ricavata per differenza: cosi' imponibile + imposta fa
    // sempre esattamente il totale lordo, al centesimo.
    public static decimal Imposta(decimal totaleLordo, decimal aliquotaIva)
    {
        return totaleLordo - Imponibile(totaleLordo, aliquotaIva);
    }
}

// Un controllo automatico fatto in casa: confronta cio' che il calcolo
// restituisce con cio' che dovrebbe restituire, e lo dice.
static class Verifica
{
    public static void Controlla(string descrizione, decimal atteso, decimal ottenuto)
    {
        string esito = (atteso == ottenuto) ? "OK    " : "ERRORE";
        Console.WriteLine(
            $"{esito}  {descrizione,-30}  atteso {atteso,8:N2}   ottenuto {ottenuto,8:N2}");
    }
}

// --- il programma ---

Verifica.Controlla("2 pezzi a 1,30",
    2.60m, Calcoli.TotaleRiga(2m, 1.30m, 0m));

Verifica.Controlla("mezzo chilo a 2,89",
    1.45m, Calcoli.TotaleRiga(0.5m, 2.89m, 0m));

Verifica.Controlla("3 pezzi a 10,00 sconto 10%",
    27.00m, Calcoli.TotaleRiga(3m, 10.00m, 10m));

Verifica.Controlla("imponibile di 2,60 al 22%",
    2.13m, Calcoli.Imponibile(2.60m, 22m));

Verifica.Controlla("imposta di 2,60 al 22%",
    0.47m, Calcoli.Imposta(2.60m, 22m));

Verifica.Controlla("imponibile di 4,52 al 10%",
    4.11m, Calcoli.Imponibile(4.52m, 10m));

Verifica.Controlla("imposta di 4,52 al 10%",
    0.41m, Calcoli.Imposta(4.52m, 10m));
```

Premi F5. Devono comparire sette righe che cominciano tutte con `OK`.

## Cosa hai letto

**`static class Calcoli`** &mdash; una classe usata come **contenitore con un
nome**. Il `static` dice "questi metodi non hanno bisogno di un oggetto per
funzionare": sono formule, non cose. Gli oggetti veri (un articolo, una
vendita, che hanno uno stato e vivono nel tempo) arrivano al modulo 6; qui la
classe serve solo a dare un indirizzo ai calcoli, cosi' che si scriva
`Calcoli.Arrotonda(...)` e si sappia da dove viene.

**`public`** &mdash; chiunque, da fuori, puo' chiamare questo metodo. Il suo
opposto, `private`, nasconde un metodo all'esterno. Per ora lascia tutto
`public`: a cosa serve nascondere lo vedremo quando ci sara' qualcosa da
nascondere, al modulo 6.

**La firma di un metodo.** Leggila da sinistra:

```
public static decimal Imponibile(decimal totaleLordo, decimal aliquotaIva)
                 ^^^^^^^         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                 cosa restituisce          cosa gli devi dare
```

Il tipo davanti al nome e' quello del **risultato**; fra parentesi i
**parametri**, ognuno col suo tipo e col suo nome. Il compilatore usa questa
riga come un contratto: se chiami `Imponibile("due euro", 22m)` non ti
compila, perche' `"due euro"` e' testo e non un importo. In FileMaker un
errore cosi' lo scoprivi eseguendo lo script; qui non arrivi a eseguire.

**`return`** &mdash; restituisce il valore e termina il metodo. Tutto cio' che
sta dopo un `return` non viene eseguito.

**`void`** in `public static void Controlla(...)` &mdash; vuol dire "questo
metodo non restituisce niente": serve per l'effetto che produce, in questo
caso scrivere a schermo. E' il tipo di ritorno dei metodi che *fanno* invece
di *calcolare*.

**`string`** &mdash; il tipo del testo.

**`(atteso == ottenuto) ? "OK    " : "ERRORE"`** &mdash; e' un `if` compresso
in una sola espressione: si legge "se atteso e' uguale a ottenuto allora
`OK` altrimenti `ERRORE`". Nota il **doppio uguale**: `==` domanda *sono
uguali?*, il singolo `=` ordina *diventa uguale a*. Confonderli e' uno
degli errori piu' comuni dei primi mesi.

**`{descrizione,-30}`** &mdash; il meno significa allineato a sinistra in
trenta caratteri. Senza il meno, come in `{atteso,8:N2}`, allinea a destra:
per questo i numeri risultano incolonnati.

**`Imposta` chiama `Imponibile`.** Un metodo puo' usarne un altro, e dovrebbe:
la regola dell'imposta per differenza e' scritta **una volta sola**, e nessuno
puo' sbagliarla per distrazione.

## Quello che hai appena scritto e' un test

Quelle sette righe sono una suite di test, fatta a mano. Il meccanismo e'
tutto qui: dichiari cosa deve venire, esegui il calcolo, confronti. Al modulo
2 sostituiremo `Verifica.Controlla` con **xUnit**, che fa la stessa cosa in
modo serio, con il suo riepilogo e l'integrazione in Visual Studio.

Te lo faccio scrivere a mano prima proprio per questo: quando arriverai a
xUnit non lo prenderai per magia, saprai che dentro c'e' un confronto fra due
valori.

### Prova a romperlo

Prima di passare all'esercizio, cambia un valore atteso: metti `2.14m` al
posto di `2.13m`. Riesegui. Deve comparire una riga `ERRORE` con i due valori
a confronto. **Un test che non hai mai visto fallire non ti dice niente**: non
sai se funziona o se e' sempre verde per sbaglio. Rimetti `2.13m` e vai avanti.

---

## L'esercizio: lo scrivi tu

Serve al prodotto: quando carichi la merce da una fattura fornitore, il
programma deve **proporre il prezzo di vendita** partendo dal costo e dal
ricarico che il negoziante vuole applicare.

Aggiungi alla classe `Calcoli` un metodo con questa firma, e scrivine tu il
corpo:

```csharp
// Il prezzo di vendita al pubblico (IVA compresa) partendo dal costo netto
// di acquisto e dal ricarico desiderato.
public static decimal PrezzoDiVendita(
    decimal costoNetto, decimal ricaricoPercentuale, decimal aliquotaIva)
{
    // ...
}
```

Il ragionamento: al costo netto applichi il ricarico e ottieni l'imponibile di
vendita; all'imponibile aggiungi l'IVA e ottieni il prezzo da mettere sul
cartellino. Riusa `Arrotonda`.

Poi aggiungi questi tre controlli e fai venire tutti e tre `OK`:

```csharp
Verifica.Controlla("costo 4,10 ricarico 60% IVA 22%",
    8.00m, Calcoli.PrezzoDiVendita(4.10m, 60m, 22m));

Verifica.Controlla("costo 1,25 ricarico 35% IVA 10%",
    1.86m, Calcoli.PrezzoDiVendita(1.25m, 35m, 10m));

Verifica.Controlla("costo 3,33 ricarico 35% IVA 22%",
    5.48m, Calcoli.PrezzoDiVendita(3.33m, 35m, 22m));
```

### Se il terzo ti da' 5,49 invece di 5,48

Non e' un errore di distrazione, e' **il punto dell'esercizio**: significa che
hai arrotondato l'imponibile intermedio prima di aggiungere l'IVA.

```
arrotondando a metà:  3,33 x 1,35 = 4,4955 -> 4,50 -> x 1,22 = 5,49
arrotondando in fondo: 3,33 x 1,35 x 1,22 = 5,48451        -> 5,48
```

**Dove arrotondi cambia il risultato.** La regola, qui: si arrotonda **una
volta sola, alla fine**, sul valore che diventa un prezzo vero. L'imponibile
intermedio non e' un prezzo, e' un passaggio di conto: arrotondarlo butta via
precisione per niente e sposta il prezzo di un centesimo.

Attenzione che la regola **non** e' "arrotonda sempre in fondo e basta": sullo
scontrino l'imponibile di riga e' un importo che viene stampato e trasmesso,
quindi la' va arrotondato per forza. La regola vera e': *si arrotonda quando
un numero diventa un importo che qualcuno legge o riceve, non mentre lo stai
ancora calcolando.* Tienila a mente, torna in continuazione.

---

## Cosa riportarmi

1. Le risposte alle **tre domande** sul modulo 0.
2. **Il codice del tuo metodo `PrezzoDiVendita`**, incollato qui per intero.
   Non solo "funziona": voglio leggerlo. Anche se i tre controlli danno `OK`,
   su come e' scritto ci sara' qualcosa da dire, ed e' la prima volta che
   facciamo questa cosa.
3. L'output dei controlli.
4. Il terzo caso ti ha dato 5,48 o 5,49 al primo tentativo?
5. Cosa non ti e' tornato.
