# Etichette

Programma per stampare le etichette delle confezioni prodotte dal laboratorio
di sushi: lotto, data di produzione, data di scadenza, ingredienti con
allergeni evidenziati, codice a barre.

Da scrivere in **C#** con Visual Studio 2026.

## Stato

Il repository e' vuoto: si riparte da zero.

C'era una versione in twinBASIC, abbandonata perche' il linguaggio e' ancora
in beta e non esiste materiale per impararlo. Resta nella storia di git, al
commit `b025f3b`, se un giorno servisse qualcosa da li':

```
git show b025f3b --stat
git checkout b025f3b -- Sources/
```

## Il formato dell'etichetta

| | |
| --- | --- |
| Supporto | 60 x 120 mm, verticale, adesiva |
| Stampante | Astra TT |
| Prodotti | 65 |
| Codice a barre | EAN-13, uno per prodotto |
| Quantita' | numero di pezzi, non peso netto |

## Il percorso

Lo sviluppo segue un percorso passo per passo, tenuto come documento a parte.
Finche' non arriva in fondo, le etichette del negozio continuano a uscire
dall'applicazione FileMaker esistente.
