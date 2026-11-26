# Lezione 1 — Python per chi conosce VBA

Obiettivo: capire `libra/core/calcoli.py`, il primo pezzo vero di Libra PRO,
che calcola righe, sconti e IVA di un documento.

Per provare le cose al volo usa la **console interattiva**: nel terminale
scrivi `py` e Invio. Compare `>>>` e ogni riga che scrivi viene eseguita
subito, come la *Finestra Immediata* di VBA. Per uscire: `exit()`.

---

## 1. Le differenze che ti colpiranno subito

### Niente `Dim`, niente `End If`: conta il rientro

```vba
' VBA
Dim prezzo As Currency
prezzo = 10
If prezzo > 5 Then
    Debug.Print "caro"
Else
    Debug.Print "economico"
End If
```

```python
# Python
prezzo = 10
if prezzo > 5:
    print("caro")
else:
    print("economico")
```

- La variabile nasce quando le assegni un valore: niente `Dim`.
- Dopo `if`, `else`, `for`, `def` ci sono **i due punti** `:`.
- Il blocco è fatto dalle righe **rientrate di 4 spazi**. Il rientro non è
  estetica: è la sintassi. Il blocco finisce quando il rientro torna indietro.
  VS Code mette i 4 spazi da solo quando premi Tab.
- I commenti iniziano con `#` invece che con `'`.
- `Debug.Print` diventa `print(...)`.

### Maiuscole e minuscole contano

In VBA `Prezzo` e `prezzo` sono la stessa variabile. In Python **no**: sono
due variabili diverse. Convenzione: nomi in minuscolo con il trattino basso,
`prezzo_unitario`, `importo_riga`.

### Uguale e diverso

| VBA | Python |
| --- | --- |
| `a = b` (confronto) | `a == b` |
| `a <> b` | `a != b` |
| `And`, `Or`, `Not` | `and`, `or`, `not` |
| `"Ciao " & nome` | `"Ciao " + nome` oppure `f"Ciao {nome}"` |
| `ElseIf` | `elif` |
| `Nothing` / `Null` | `None` |
| `True` / `False` | `True` / `False` (uguali!) |

Le **f-string** (`f"..."`) sono il modo comodo di comporre testo: quello che
metti tra graffe viene calcolato e inserito.

```python
nome = "Mario"
totale = 48.79
print(f"Gentile {nome}, il totale è {totale} euro")
```

---

## 2. Funzioni: `def` al posto di `Function`

```vba
Function Doppio(ByVal x As Double) As Double
    Doppio = x * 2
End Function
```

```python
def doppio(x):
    return x * 2
```

- Il risultato si restituisce con **`return`**, non assegnandolo al nome
  della funzione. `return` esce subito dalla funzione (come `Exit Function`
  con il valore già impostato).
- Non esiste `Sub`: una funzione senza `return` restituisce `None`.
- I parametri possono avere un **valore predefinito**, come `Optional` in VBA:

```python
def importo_riga(quantita, prezzo_unitario, sconti=""):
    ...
```

Si può chiamare `importo_riga(2, 10)` oppure `importo_riga(2, 10, "10+5")`.

La stringa tra triple virgolette subito dopo `def` è la **docstring**: la
documentazione della funzione. VS Code la mostra quando ci passi sopra con
il mouse.

---

## 3. I soldi: `Decimal`, il cugino di `Currency`

In VBA per i soldi usavi (o avresti dovuto usare) `Currency`, perché
`Double` sbaglia i centesimi. In Python è uguale. Provalo nella console:

```python
>>> 0.1 + 0.2
0.30000000000000004
```

Questi numeri si chiamano **float** e in un gestionale non vanno mai usati
per gli importi. Si usa `Decimal`:

```python
>>> from decimal import Decimal
>>> Decimal("0.1") + Decimal("0.2")
Decimal('0.3')
```

Nota le **virgolette**: `Decimal("0.1")`, non `Decimal(0.1)`. Senza
virgolette passeresti prima per un float e ti porteresti dietro l'errore.

### Arrotondare

Attenzione: sia `Round` di VBA sia `round` di Python arrotondano "alla
banchiere" (`2,5` → `2`, `3,5` → `4`). Per le fatture vogliamo
l'arrotondamento commerciale (0,005 → 0,01). Per questo in `calcoli.py`
c'è:

```python
from decimal import Decimal, ROUND_HALF_UP

DUE_DECIMALI = Decimal("0.01")

def arrotonda(valore):
    return valore.quantize(DUE_DECIMALI, rounding=ROUND_HALF_UP)
```

`quantize` vuol dire "porta questo numero allo stesso numero di decimali di
`0.01`". `DUE_DECIMALI` è scritto in maiuscolo perché è una **costante**:
Python non lo impone, è una convenzione per dire "non modificarla".

### `import`

`from decimal import Decimal` è come aggiungere un **Riferimento** in VBA
(*Strumenti → Riferimenti*): rende disponibile codice che sta in un altro
modulo. Python ha centinaia di moduli già inclusi; `decimal` è uno di questi.

---

## 4. Liste e dizionari: array e `Scripting.Dictionary`

### Liste

```python
aliquote = [22, 10, 4]
aliquote.append(5)          # aggiunge in fondo, niente ReDim Preserve!
print(aliquote[0])          # 22: si parte da 0, come gli array VBA di default
print(len(aliquote))        # 4: quanti elementi
```

### Dizionari

Se hai usato `Scripting.Dictionary` in VBA, conosci già i dizionari: coppie
**chiave → valore**.

```python
riga = {"quantita": 2, "prezzo": 10, "aliquota": 22}
print(riga["prezzo"])           # 10
riga["sconti"] = "10"           # aggiunge una chiave nuova
print("sconti" in riga)         # True: equivale a .Exists("sconti")
print(riga.get("note", ""))     # "" se la chiave non c'è, invece di dare errore
```

In `calcoli.py` ogni riga di fattura è un dizionario e il documento è una
**lista di dizionari**. Più avanti useremo le classi, ma per iniziare è
la forma più semplice.

---

## 5. Cicli: `For Each` è la norma

```vba
For Each riga In righe
    totale = totale + riga("prezzo")
Next
```

```python
for riga in righe:
    totale = totale + riga["prezzo"]   # oppure: totale += riga["prezzo"]
```

In Python quasi sempre si cicla **direttamente sugli elementi**, non sugli
indici. Se ti serve il classico `For i = 1 To 10`:

```python
for i in range(1, 11):    # da 1 a 10: il secondo numero è escluso!
    print(i)
```

Per i dizionari, `.items()` dà chiave e valore insieme:

```python
for aliquota, valori in riepilogo.items():
    print(aliquota, valori["imposta"])
```

---

## 6. Errori: `raise` al posto di `Err.Raise`

```python
if percentuale < 0 or percentuale > 100:
    raise ValueError(f"Sconto non valido: {pezzo}")
```

`raise` interrompe la funzione e segnala l'errore a chi l'ha chiamata, come
`Err.Raise`. Chi chiama può intercettarlo con `try` / `except`, che è
l'equivalente pulito di `On Error GoTo`:

```python
try:
    prezzo = applica_sconti(Decimal("100"), "150")
except ValueError as errore:
    print("Attenzione:", errore)
```

---

## 7. Leggiamo `calcoli.py` insieme

Apri `libra/core/calcoli.py` in VS Code e seguilo con questa traccia.

**`applica_sconti(prezzo, sconti)`** — riceve ad esempio `100` e `"10+5"`.
- `sconti.strip()` toglie gli spazi all'inizio e alla fine (come `Trim`).
- `sconti.split("+")` spezza il testo in una lista: `["10", "5"]` (come
  `Split` di VBA).
- Per ogni pezzo: `.replace(",", ".")` accetta anche la virgola italiana,
  poi lo trasforma in `Decimal` e applica lo sconto.
- 100 × 0,90 = 90, poi 90 × 0,95 = 85,50.

**`importo_riga(quantita, prezzo_unitario, sconti)`** — sconta il prezzo,
moltiplica per la quantità e arrotonda. Usa le due funzioni precedenti:
piccoli pezzi che si compongono.

**`riepilogo_iva(righe)`** — è il cuore. Per ogni riga:
1. calcola l'importo;
2. se l'aliquota non è ancora nel riepilogo, crea la sua "casella" a zero;
3. somma l'importo all'imponibile di quella aliquota.

Poi, **alla fine**, calcola l'imposta per ogni aliquota sul totale
imponibile. Perché non riga per riga? Perché arrotondando ogni riga gli
errori di centesimo si sommano, e lo SDI controlla che l'imposta corrisponda
all'imponibile dell'aliquota.

**`totale_documento(riepilogo)`** — somma tutto e restituisce un dizionario
con imponibile, imposta e totale.

---

## 8. I test: il programma che controlla il programma

Apri `tests/test_calcoli.py`. Ogni funzione che inizia con `test_` è un
controllo automatico:

```python
def test_sconti_in_cascata():
    assert applica_sconti(Decimal("100"), "10+5") == Decimal("85.5")
```

`assert` vuol dire "questa cosa **deve** essere vera". Se non lo è, il test
fallisce e ti dice dove. Lanci tutti i test con:

```
py -m pytest
```

Perché ci servono: tra sei mesi cambieremo `calcoli.py` per aggiungere lo
scorporo IVA o il bollo. Rilanciando i test sapremo in un secondo se
abbiamo rotto qualcosa nelle fatture. In un gestionale questo vale oro.

In VS Code puoi anche aprire il pannello **Test** (icona della provetta a
sinistra): ti mostra ogni test con una spunta verde o una croce rossa.

---

## 9. Usare il debugger

Come in VBA con F8, puoi eseguire il codice un passo alla volta:

1. Apri `esempio_fattura.py`.
2. Clicca a sinistra del numero della riga `riepilogo = riepilogo_iva(righe)`:
   compare un pallino rosso (**punto di interruzione**, come F9 in VBA).
3. Premi **F5** e scegli *Python Debugger → Python File*.
4. L'esecuzione si ferma sul pallino. Usa:
   - **F11** per entrare dentro la funzione (come F8 in VBA)
   - **F10** per eseguire la riga senza entrarci (come Maiusc+F8)
   - **F5** per continuare
5. A sinistra, nel pannello *Variabili*, vedi il contenuto di ogni variabile,
   come la *Finestra Variabili locali*.

---

## 10. Esercizi

Falli in ordine, scrivendo tu il codice. Dopo ogni esercizio lancia
`py -m pytest`: i test esistenti devono restare verdi.

1. **Console.** Nella console `py` calcola l'IVA al 22% su 123,45 € con
   `Decimal` e arrotondala con `quantize`. Risultato atteso: `27.16`.

2. **Modifica l'esempio.** In `esempio_fattura.py` aggiungi una riga
   "Scarpe running", 1 pezzo, 79,90 €, sconto `"20"`, IVA 22%. Rilancia e
   controlla che il totale abbia senso.

3. **Nuova funzione.** In `calcoli.py` scrivi
   `def scorporo_iva(prezzo_ivato, aliquota):` che dato un prezzo IVA
   inclusa restituisce l'imponibile arrotondato.
   Formula: `prezzo_ivato * 100 / (100 + aliquota)`.
   Serve per il negozio, dove i prezzi sono esposti IVA inclusa.
   Esempio: 12,20 € al 22% → 10,00 €.

4. **Il tuo primo test.** In `test_calcoli.py` scrivi
   `test_scorporo_iva` che verifica l'esempio dell'esercizio 3 e un secondo
   caso a tua scelta (ad esempio 10,40 € al 4%).

5. **Bollo** (più impegnativo). Scrivi
   `def serve_bollo(riepilogo):` che restituisce `True` se la somma degli
   imponibili con aliquota 0 supera 77,47 €, altrimenti `False`.
   Suggerimento: cicla su `riepilogo.items()` e somma solo quando
   `aliquota == 0`.

Quando hai finito mandami il codice (o fai commit e push, vedi sotto) e lo
correggiamo insieme. Non preoccuparti degli errori: leggere i messaggi di
errore è metà del mestiere, e li impariamo a leggere insieme.

### Salvare il lavoro con Git

```
git add .
git commit -m "Lezione 1: esercizi"
git push
```

Al primo `push` Git aprirà il browser per farti accedere a GitHub.
