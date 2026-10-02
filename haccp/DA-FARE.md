# Da fare

**Tutto quello che e' aperto sta qui dentro.** Se una cosa non e' in questa
pagina, o e' fatta o non esiste.

Tre sezioni: il **prossimo passo**, i **ritocchi** (piccoli, dalla verifica
del file reale), i **debiti** (rimandati di proposito, con il motivo).

---

## Prossimo passo

Dal collaudo `archivio/collaudo-010.md`, scheda di lavoro:
<https://claude.ai/artifact/Aef6CEKgMCueGZ2TAz863g>

**1. Il set `Responsabile`** — quattro caselle, e sblocca l'account `MRossi`
che oggi non riesce a entrare.

**2. Lo script `94`** — manca `Esci dallo script` nel ramo dell'errore: senza,
la scheda registra account che non esistono. Piu' tre sviste (`Lower`, il
calcolo `""`, un titolo).

**3. I pulsanti** — la condizione di nascondimento su `Reimposta Account`,
`Salva` e `Annulla Modifiche` sulle altre quattro schede, `Cambia password` su
`D_Menu`.

Poi **PuntiControllo**, l'ultima anagrafica.

---

## Ritocchi

| | Cosa | Dove |
|---|---|---|
| 1 | `91 - Attrezzature - Entra nell'elenco` ha due spazi in fondo al nome | Area di lavoro Script |
| 2 | `Apri` a x **1**: tocca il bordo, va a **24** | tutti gli elenchi |
| 3 | Etichette di colonna a y 113 / 114 / 115 | `D_Operatori elenco` |
| 4 | Lo stile si chiama `Titolo Riquadro` ma veste il titolo dell'intestazione: rinominalo **`Titolo maschera`** e risalva il tema | tema `HACCP` |
| 5 | Set `Operatore`, riga delle **tabelle future**: da scrivibile a sola visualizzazione | Sicurezza |
| 6 | `OnObjectSave` invece di `OnObjectExit` sulla casella di ricerca: evita che la ricerca riparta uscendo dal campo per cliccare `Apri` | gli elenchi |
| 7 | `ColorePrimario` vale `#1F4E5F`, il colore del tema vecchio: va `#1B3A5C` | tabella `Parametri` |

---

## Una sessione a se'

**Le larghezze.** Nessuna coppia scheda/elenco coincide — 492/684, 1018/968,
1018/968, 1004/1097, 1010/1248, e `D_Menu` a 731. La finestra salta a ogni
`Apri`. Si decide **una** larghezza di progetto, si riportano tutti e undici i
formati a quella e si rifanno le colonne: farlo in mezzo ad altro vuol dire
rifarlo.

---

## Aperto negli script

- **`90`** scambia *accesso negato* per *formato mancante*: e' quello che ha
  depistato la sera del 2 ottobre.
- **`93`** non controlla l'esito del `90`: se la scheda non esiste, `+ Nuovo`
  crea comunque un record sull'elenco.
- **`95 - Operatori - Reimposta password`** non esiste ancora: si duplica il
  `94` e si cambia un passo.

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
