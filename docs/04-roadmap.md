# Roadmap

Quello che c'e' oggi e' il **nucleo fiscale piu' il livello dati**. Da qui
in avanti, nell'ordine in cui conviene procedere e con il perche'.

## Fatto

* Schema dell'archivio, 20 tabelle, con migrazioni versionate.
* Dati di base: aliquote e nature IVA, unita' di misura, condizioni di
  pagamento, tipi di documento.
* Aritmetica monetaria esatta e arrotondamento commerciale.
* Motore di calcolo del documento: sconti in cascata e in piede, prezzi
  ivati con scorporo, riepilogo per aliquota e natura, bollo virtuale,
  cassa previdenziale, ritenuta d'acconto, scissione dei pagamenti.
* Validazione del documento, separata dal calcolo.
* Scadenzario con rate, fine mese e quadratura garantita.
* Accesso ai dati con parametri, recordset scollegati, transazioni corte e
  ripetizione automatica sui conflitti di blocco.
* Numerazione dei documenti sicura in multiutenza.
* Hash delle password con sale per utente e 25.000 iterazioni.
* Suite di test del nucleo fiscale, che gira senza archivio.

## 1. Repository e maschere delle anagrafiche

Il livello che manca fra il dominio e le maschere: una classe per entita'
(`SoggettiRepo`, `ArticoliRepo`) che traduce fra righe di archivio e
oggetti, applica i valori predefiniti e gestisce `Revisione` per la
concorrenza ottimistica.

Poi le maschere di clienti, fornitori e articoli: elenco con ricerca,
scheda, salvataggio. Si parte da qui perche' sono le piu' semplici e
servono a fissare lo stile di tutte le altre (griglia, pulsanti, gestione
degli errori, messaggio quando un altro utente ha salvato prima).

## 2. Maschera del documento

Il pezzo piu' impegnativo dell'interfaccia. Griglia delle righe con
inserimento rapido da codice o da codice a barre, totali che si aggiornano
a ogni tasto chiamando `Calcola`, lettura del prezzo dal listino del
cliente, `Validazione` alla conferma, numerazione chiesta solo al momento
della conferma.

## 3. Stampa e PDF

Senza stampa il gestionale non si usa. Da valutare in questo ordine:

* disegno diretto sull'oggetto `Printer`: nessuna dipendenza, controllo
  totale, piu' lavoro per ogni modulo;
* un motore di report di terze parti, che costa una licenza e una
  dipendenza da distribuire;
* generazione di HTML e stampa dal browser, che e' la via piu' rapida per
  arrivare a un PDF decente.

Serve comunque un meccanismo di **modelli di stampa** modificabili: ogni
azienda vuole il suo logo e il suo piede.

## 4. Fattura elettronica

Il modulo che trasforma un documento nell'XML `FatturaPA`. Lo schema e il
motore di calcolo sono gia' predisposti: `DocumentiRiepilogoIva` ha la
forma dei blocchi `DatiRiepilogo`, le nature IVA sono in anagrafica, i
codici `TD*` e `MP*` sono nelle tabelle di servizio, `Money.FormatInvariant`
produce i numeri nel formato che pretende lo SDI.

Da fare: generazione dell'XML, nome del file con progressivo univoco,
validazione contro lo schema XSD prima dell'invio, gestione degli stati
(generata, inviata, consegnata, scartata) e delle notifiche.

Due dettagli che si scoprono tardi:

* quando il **bollo e' addebitato** al cliente, nella fattura elettronica
  va in `DatiBollo` e, se compare come addebito, anche come riga con natura
  `N1`. Oggi il motore tiene il bollo fuori dal riepilogo: va deciso li'.
* il canale di trasmissione va scelto: intermediario, oppure invio diretto
  allo SDI, che richiede l'accreditamento e la firma.

## 5. Magazzino e scadenzario

Generazione dei movimenti alla conferma dei documenti, secondo
`TipiDocumento.SegnoMagazzino`. Ricalcolo della giacenza dai movimenti,
inventario, sottoscorta. Scadenzario con incassi e pagamenti parziali,
estratto conto per cliente, distinta RiBa.

## 6. Utenti e permessi

Maschera di accesso, cambio password, ruoli (`amministratore`, `vendite`,
`magazzino`, `sololettura`) con i controlli nei punti che contano:
modificare un documento confermato, cambiare i prezzi, vedere i costi.
`Crypto.twin` e la tabella `Utenti` sono pronti, manca il resto.

## Cose piccole che migliorano la vita

* **Scadenze fuori agosto**: molte aziende non vogliono scadenze ad agosto
  e le spostano a settembre. Oggi `CalcoloScadenze` non lo prevede; sarebbe
  un parametro in piu' sulla condizione di pagamento.
* **Omaggi con rivalsa IVA**: oggi un omaggio azzera l'imponibile e resta
  in stampa. Il caso dell'omaggio con IVA addebitata al cliente va gestito
  a parte.
* **Evasione dei documenti**: da DDT a fattura differita, da ordine a DDT.
  Lo schema ha gia' `IdDocumentoOrigine`.
* **Registro delle attivita'**: la tabella `LogAttivita` c'e', va riempita.
* **Avviso di manutenzione**: la tabella `Sessioni` c'e', serve il ping
  periodico e la finestra che chiede a tutti di uscire.
