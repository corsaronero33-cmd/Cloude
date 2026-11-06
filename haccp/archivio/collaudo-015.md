# Diagnosi — `REGISTRA` crea un record vuoto

Scheda con le prove:
<https://claude.ai/artifact/SJRPNubRK8yEVAfBKNMxTh>

Due sintomi riferiti sul primo montaggio di `D_Rilevazioni registra`:

1. dopo aver premuto `REGISTRA` si resta sul formato tecnico finche' non si
   preme OK;
2. non registra niente: crea un record completamente vuoto.

---

## Quello che risulta nel file (Revisione 13)

Lo script `20` **e' corretto**: i target dei nove `Imposta campo` sono i campi
di `RIL|Rilevazioni`, le sorgenti sono i globali della stessa occorrenza,
`Z_RIL Rilevazioni` e' basato su `RIL|Rilevazioni` — stessa occorrenza, quindi
stesso record corrente. E i quattro campi di immissione risultano davvero
`global=True`.

Quel DDR e' pero' **precedente** al montaggio della maschera: il guasto sta in
qualcosa che non vede ancora.

## 1. Resta sul formato tecnico — errore nella scheda 18

La fase 2a diceva di mettere `Vai al formato [ Formato originale ]` **in
fondo**, cioe' dopo le finestre di dialogo. Quindi il messaggio esce mentre si
e' ancora su `Z_RIL`, e il ritorno avviene solo premendo OK.

Va spostato **prima** del `Se [ $esito = "non conforme" ]`, insieme ai quattro
`Imposta campo` che svuotano i globali. Conseguenza: la finestra del
"Registrato" non puo' piu' nominare il punto, che va salvato prima in una
variabile.

## 2. Record vuoto — la verifica che distingue

Il record nasce, quindi **i due controlli iniziali sono passati**: per lo
script i globali non erano vuoti. Ma i campi restano vuoti.

Si guarda invece di provare: compilare la maschera, **uscire dai campi senza
premere REGISTRA**, e leggere nel `Visualizzatore dati`
`RIL|Rilevazioni::gIdPuntoControllo` e `RIL|Rilevazioni::gValore`.

**Vuoti** — il guasto e' sulla maschera: ci sono finiti i campi **senza la
g**. E' l'unica spiegazione che tiene insieme *il record nasce* e *il record
e' vuoto*: scrivendo nei campi senza g su una maschera senza corpo i valori
non finiscono da nessuna parte, i globali restano con quello che c'era dalla
prova precedente — quindi i controlli passano — e i quattro `Imposta campo`
copiano globali vuoti.

**Pieni** — i valori si perdono dentro lo script: serve il DDR.

## 3. La riga che manca comunque

Primo passo del `20`, prima di `Imposta acquisizione errori`:

```
Conferma record/richieste [ Senza finestra di dialogo ]
```

Se l'operatore scrive `12` e preme **subito** REGISTRA senza uscire dal campo,
il cursore e' ancora dentro e quel valore puo' non essere acquisito. Una riga,
nessun effetto collaterale, e toglie una categoria intera di guasti "a volte
si' e a volte no".

**Potrebbe essere gia' la soluzione del caso "pieni"**, e spiegherebbe perche'
nel Visualizzatore dati i globali risultano pieni: per guardarli si esce dai
campi, e uscendo li si acquisisce.

## L'ordine in cui provarle

| | Cosa | Perche' prima |
|---|---|---|
| 1 | La riga `Conferma record/richieste` | un passo solo, e potrebbe chiudere tutto |
| 2 | Riprovare a registrare | se funziona, la 3 non serve |
| 3 | Il Visualizzatore dati | solo se non funziona ancora |
| 4 | L'ordine dei passi (sintomo 1) | e' cosmetico: dopo che registra |
