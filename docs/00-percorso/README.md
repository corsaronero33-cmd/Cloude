# Percorso: diventare programmatore costruendo il gestionale

## L'obiettivo

**Diventare un programmatore professionista.** Non "imparare quel tanto che
basta per mantenere il prodotto": l'obiettivo dichiarato dal committente e'
il mestiere, per intero.

Il gestionale e' il mezzo, non il fine. Ed e' un mezzo migliore di qualunque
corso, per una ragione che non si compra: ha **utenti veri, soldi veri e
vincoli di correttezza fiscale**. La debolezza tipica di chi impara a
programmare da autodidatta e' non aver mai dovuto mantenere in produzione
qualcosa da cui dipendono altre persone. Qui succedera' dal primo cliente.

## Cosa distingue un professionista

Non la quantita' di sintassi che ricorda. Queste cinque:

1. Scrive codice che **altri possono mantenere**, non solo codice che
   funziona.
2. Sa **perche'**, non solo come: puo' difendere una scelta e scartarne
   un'altra con un argomento.
3. Sa **leggere e correggere codice che non ha scritto lui**.
4. Sa **stimare**, e sa riconoscere quando non sa.
5. Si prende la **responsabilita' della correttezza in produzione**.

Il percorso e' costruito per arrivare a queste, non per coprire un elenco di
argomenti.

## Chi scrive il codice: la regola che conta

E' il punto piu' importante del documento. Se continuo a scrivere io e tu a
leggere, impari a **leggere**, che e' il 30% del mestiere. Si scrive codice
per imparare a scrivere codice. Quindi il rapporto cambia nel tempo, a tappe
dichiarate:

| Fase | Chi scrive | Cosa fa l'altro |
| --- | --- | --- |
| **A** — moduli 0-5 | io, quasi tutto | tu leggi tutto e mi spieghi cosa fa; scrivi gli esercizi |
| **B** — moduli 6-9 | **a meta'** | tu scrivi usando i test come specifica, io rivedo riga per riga |
| **C** — moduli 10+ | **tu, quasi tutto** | io faccio il revisore e l'avvocato del diavolo |

Nella fase B la divisione non e' casuale: **tu prendi i pezzi dove un errore
non costa** (anagrafiche, maschere, report, importazioni) e **io prendo i
pezzi dove un errore costa caro** (XML fiscale, driver del registratore
telematico, concorrenza sulla numerazione). Man mano che i tuoi test
diventano affidabili, i pezzi rischiosi passano anche a te.

### Il costo, detto chiaramente

Questo **rallenta il prodotto**. Codice scritto da chi sta imparando, piu' la
revisione, piu' le riscritture, costa in tempo. Non c'e' modo di avere
insieme la massima velocita' di consegna e la massima crescita tua: sono due
obiettivi che competono per le stesse serate.

La divisione per rischio sopra e' il compromesso che minimizza il danno, ma
resta un compromesso, e la proporzione la decidi tu. Se a un certo punto
serve consegnare, si sposta l'ago su di me per qualche settimana e poi si
torna: basta dirlo, non e' un fallimento.

## La revisione del codice

Dalla fase B in avanti, **ogni cosa che scrivi passa da una revisione** fatta
come si fa fra professionisti: non "va bene", ma rilievi puntuali con il
motivo e la gravita'. All'inizio severita' bassa (solo cio' che e' sbagliato),
poi crescente (anche cio' che e' fragile, poco chiaro, o che un collega
fatichera' a mantenere).

E' il meccanismo che fa la differenza fra chi programma da dieci anni ed e'
bravo e chi programma da dieci anni e ha ripetuto dieci volte il primo anno.

---

# I moduli

## Parte I — Le fondamenta: saper leggere e far girare

| # | Modulo | Cosa sai fare dopo | Serate |
| --- | --- | --- | --- |
| 0 | **Gli attrezzi** | hai gli strumenti installati e un tuo programma che gira | 1 |
| 1 | **Il linguaggio, le basi** | tipi, `if`, cicli, metodi, classi; perche' i soldi sono `decimal` | 3-4 |
| 2 | **I test come maestro** | scrivi un test, lo vedi fallire, lo fai passare | 1-2 |
| 3 | **Il database, le basi** | leggi e scrivi SQL a mano, capisci le migrazioni | 3-4 |
| 4 | **L'interfaccia** | disegni una form, colleghi una griglia, gestisci gli eventi | 3-4 |
| 5 | **Git e debugger** | rami e conflitti senza paura; fermare il programma e guardarci dentro | 2 |

**Fine della parte I: leggi tutto il codice del prodotto e modifichi i pezzi
semplici.** Circa 2-3 mesi a due o tre serate per settimana.

## Parte II — Scrivere: l'autonomia

Qui si gira la manopola: cominci a scrivere tu.

| # | Modulo | Contenuto |
| --- | --- | --- |
| 6 | **Oggetti, davvero** | incapsulamento, interfacce, composizione contro ereditarieta', collezioni e LINQ, `null` e i tipi nullable, eccezioni fatte bene |
| 7 | **Progettare** | separazione delle responsabilita', perche' la logica sta fuori dalla UI, quando astrarre e **quando non astrarre**, iniezione delle dipendenze |
| 8 | **Dati, davvero** | modellazione e normalizzazione, indici, transazioni e livelli di isolamento, leggere un piano di esecuzione, concorrenza |
| 9 | **Test, davvero** | unitari contro integrazione, doppi di test, la testabilita' come pressione sul progetto |
| 10 | **Concorrenza e asincronia** | `async`/`await`, condizioni di corsa, cosa succede davvero quando due casse salvano insieme |
| 11 | **Leggere le specifiche** | le specifiche Epson del registratore e quelle dell'Agenzia delle Entrate, come esercizio reale: saper leggere un documento tecnico ostile e cavarne codice |

**Fine della parte II: scrivi moduli interi da solo, con revisione.** Circa
6-9 mesi.

## Parte III — Il mestiere

Da qui non e' piu' un corso con una fine: e' pratica deliberata su un
prodotto vivo.

| # | Modulo | Contenuto |
| --- | --- | --- |
| 12 | **Codice mantenibile** | nomi, refactoring, revisione del codice da entrambi i lati |
| 13 | **Diagnostica in produzione** | logging, riprodurre un bug da una telefonata, cosa chiedere al cliente |
| 14 | **Sicurezza** | validazione degli input, SQL injection, gestione dei segreti, privilegi minimi, GDPR per quel che ci riguarda |
| 15 | **Rilascio e operazioni** | versioni, installer, aggiornamenti automatici, backup e **ripristino provato**, telemetria |
| 16 | **Il costo delle cose** | strutture dati e complessita' quanto basta per ragionare sulle prestazioni invece di indovinare |
| 17 | **Leggere codice non tuo** | una libreria del nostro stack, aperta, letta e capita fino in fondo |

**Livello professionista solido: 18-30 mesi dall'inizio**, con pratica
regolare. E' una stima onesta, non una promessa: dipende quasi solo dalle ore
che ci metti davvero.

---

## Come funziona ogni modulo

1. **Leggi** una lezione breve, scritta per chi viene da FileMaker.
2. **Scrivi** l'esercizio. Dalla parte II in avanti, l'esercizio e' un pezzo
   vero del prodotto, non un giocattolo.
3. **I test ti dicono se e' giusto**, in mezzo secondo, senza chiedere a me.
4. **Mi spieghi cosa fa**, a parole tue. E dalla fase B, **io rivedo cio' che
   hai scritto** e ne discutiamo i rilievi.

Se un punto non e' chiaro si torna indietro. Nel software le lacune non
restano ferme: si sommano.

## Cosa resta fuori

Poco, e per ragioni precise:

- **XAML e WPF**: abbiamo scelto WinForms per l'interfaccia. Se un giorno
  serve, si aggiunge.
- **Programmazione web e mobile**: fuori ambito per questo prodotto. Il
  giorno che vuoi una versione cloud, e' il modulo successivo.
- **Informatica teorica** oltre quel che serve a ragionare sui costi:
  algoritmi da concorso, teoria dei linguaggi, matematica discreta. Utili, ma
  non sulla strada critica.

Tutto il resto che avevo escluso in una versione precedente di questo
documento — `async`/`await`, i generics, LINQ, l'iniezione delle dipendenze,
i pattern di progetto — **e' rientrato**, perche' escluderlo aveva senso solo
con l'obiettivo piu' piccolo di prima.

## Stato

Vedi `diario.md`.
