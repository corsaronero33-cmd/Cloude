# Debiti tecnici da saldare

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

**Quando si salda.** Nella sessione delle maschere (`13-LAYOUT.md`), insieme
alla pulizia dei 23 formati automatici. Li' si creano i formati definitivi e
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

## 4. Le tabelle di fase 2 sono vuote

`Utilizzi` esiste ed e' collegata, ma niente la riempie: serve `Preparazioni`,
che e' di fase 2. Finche' non c'e', la rintracciabilita' copre il **passo
indietro** (fornitore, DDT, lotto) ma non il **passo avanti** (in quale
preparazione il lotto e' finito).

E' l'unico debito che tocca un obbligo di legge, quindi va chiuso prima della
consegna al cliente, non dopo.
