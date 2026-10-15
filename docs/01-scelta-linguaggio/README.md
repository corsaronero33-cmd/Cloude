# Scelta del linguaggio: C# o VB.NET

Due file con **la stessa identica logica**, da leggere e confrontare prima di
decidere. Calcolano una riga di scontrino con prezzo al pubblico (IVA
compresa), sconto di riga e scorporo dell'IVA.

| File | Linguaggio |
| --- | --- |
| `RigaVendita.cs` | C# |
| `RigaVendita.vb` | VB.NET |

Girano **sulla stessa piattaforma** (.NET), usano le stesse librerie e si
possono perfino mischiare nella stessa soluzione: un progetto in VB.NET che
referenzia una libreria in C#, o viceversa. Quindi la scelta non e'
irreversibile.

## Cosa guardare

- **Leggibilita' a prima vista**: quale dei due capisci senza spiegazioni?
- **Lunghezza**: la versione VB.NET e' circa il 40% piu' lunga a parita' di
  logica, per via della sintassi delle proprieta' (`Get` / `End Get`).
- **Familiarita'**: `Dim`, `As Decimal`, `End Function` sono quelli del VB6.

## Due cose di dominio che valgono piu' della sintassi

Entrambi i file contengono due decisioni che non sono stilistiche:

1. **L'imposta si ricava per differenza** (`TotaleLordo - Imponibile`), non
   ricalcolandola. Se si arrotondano imponibile e imposta separatamente, la
   somma puo' sfasare di un centesimo rispetto al totale, e il registratore
   telematico rifiuta il documento.

2. **L'arrotondamento deve essere commerciale**
   (`MidpointRounding.AwayFromZero`). Il comportamento di default di
   `Math.Round` in .NET e' l'arrotondamento "al pari" (0,125 diventa 0,12,
   non 0,13), che non e' quello richiesto dal fisco italiano. E' un errore
   silenzioso: non da' eccezioni, da' solo totali sbagliati di un centesimo.

## Scelta consigliata

**C#**, per un motivo pratico e non ideologico: ogni risposta che cercherai
online nei prossimi anni (WinForms, PostgreSQL, driver Epson, grafici) e'
scritta in C#. VB.NET resta una via d'uscita legittima e supportata se la
sintassi di C# risultasse un ostacolo reale.

In entrambi i casi l'interfaccia va fatta in **WinForms**, non WPF: e' il
designer drag-and-drop già noto a chi viene dal VB6, ed e' pienamente
supportato sulle versioni correnti di .NET.
