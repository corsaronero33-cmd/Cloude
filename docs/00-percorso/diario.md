# Diario di bordo

La memoria del progetto sta qui, non nella conversazione. Si aggiorna alla
fine di ogni sessione di lavoro.

---

## Decisioni prese

| Data | Decisione | Motivo in breve |
| --- | --- | --- |
| 2026-10-15 | Scope ridotto a cassa + magazzino + KPI per negozianti | piu' vendibile e realizzabile di un clone generalista |
| 2026-10-15 | Stack C# / .NET + WinForms + PostgreSQL | compilato e tipizzato per i calcoli fiscali; WinForms per il designer visuale; PostgreSQL per il multiutente senza corruzione dati |
| 2026-10-15 | Scartati twinBASIC e Access | twinBASIC e' in beta e di un solo autore; Access si corrompe come DB multiutente su dati fiscali |
| 2026-10-15 | RT: pilotare hardware esistente (Epson per primo) | nessuna certificazione richiesta; la soluzione software certificata (PEM/PEL) e' un obiettivo successivo |
| 2026-10-15 | Fattura elettronica: solo generazione XML, nessuna conservazione | scelta del committente |
| 2026-10-15 | **Xojo valutato e scartato** | vedi la nota qui sotto: e' una scelta buona per consegnare in fretta, sbagliata per l'obiettivo dichiarato di diventare programmatore professionista |
| 2026-10-15 | **Obiettivo didattico: programmatore professionista**, non "saper mantenere il prodotto" | correzione esplicita del committente. Comporta le tre fasi su chi scrive il codice, la revisione sistematica, e il rientro di async, generics, LINQ, DI e pattern nel programma |

## Questioni aperte

- [ ] **Che RT hanno i negozi di riferimento?** (Epson, RCH, Custom, Ditron?)
      Determina quale driver scrivere per primo.
- [ ] **C'e' un cliente pilota** disposto a fare da cavia?
- [ ] **Procurare un RT fisico** da banco di lavoro (Epson FP-81II usata,
      ~300-500 euro). L'integrazione non si sviluppa alla cieca.
- [ ] **Specifiche del PC di sviluppo del committente** (RAM, CPU, SSD o
      disco meccanico). Serve per decidere se Visual Studio e' usabile o se
      si lavora con VS Code + CLI. Non presumere: chiedere.
- [ ] Confermare se PostgreSQL/pgAdmin e Git sono stati installati: nel
      modulo 0 ha riportato solo il programma, l'esercizio e la versione, e
      le due caselle restano non spuntate perche' non vanno presunte.
- [ ] Nome definitivo del prodotto.
- [ ] Sbloccare `builds.dotnet.microsoft.com` e `api.nuget.org` nella policy
      di rete dell'ambiente cloud, per poter compilare e testare il motore qui.
- [ ] Verificare sulle fonti ufficiali dell'Agenzia delle Entrate: versione
      corrente dello schema FatturaPA, e data di operativita' della soluzione
      software certificata.

## Nota: perche' non Xojo

Sollevato dal committente, e omesso per errore nel confronto iniziale fra
gli stack: andava incluso. Xojo **puo'** costruire questo prodotto (designer
visuale maturo, PostgreSQL supportato, HTTP e XML per il registratore
telematico) ed e' davvero piu' semplice da imparare, soprattutto per chi
viene da FileMaker. Scartato per quattro motivi, in ordine di peso:

1. **L'obiettivo e' il mestiere, non il prodotto.** Xojo e' un ambiente
   proprietario di nicchia: si diventa sviluppatori Xojo, non programmatori
   nel senso del mercato. Le fonti non danno dati solidi sulla domanda, ma
   tutti i segnali indicano un mercato minuscolo, fatto di consulenti e
   freelance. Con C# la competenza e' trasferibile.
2. **Il tipo per i soldi.** `Currency` e' fixed-point a **4 decimali**
   (la documentazione Xojo dice esplicitamente di non usare `Double` per gli
   importi). Quattro decimali bastano ai centesimi ma sono stretti sui
   calcoli intermedi, e sul forum ci sono segnalazioni (2023) di
   arrotondamenti inattesi su valori come 32,175, con chi sostiene che
   tronchi; non ho trovato documentazione ufficiale sul trattamento dei casi
   di parita'. Per software che deve quadrare al centesimo con la memoria
   fiscale di un RT certificato, "non e' documentato come arrotonda" e' un
   problema. In C# `decimal` ha 28-29 cifre significative e
   `MidpointRounding` esplicito.
3. **Costo ricorrente e dipendenza da un fornitore unico.** La licenza per
   distribuire ad altri e' a pagamento: dopo la revisione del luglio 2025 le
   fonti indicano Desktop 499 $/anno, Pro 999 $/anno, Pro Plus 1.999 $/anno
   (gli aggregatori mostrano cifre piu' basse, probabilmente anteriori: da
   verificare su xojo.com). E' un costo fisso prima del primo cliente, dove
   .NET costa zero, e un cambio di prezzo o di strategia dell'azienda
   diventa un problema del nostro prodotto.
4. **La storia recente.** Critiche diffuse su stabilita' e rilasci, e
   soprattutto la transizione **API 2.0** (2020-2021) che per molti ha
   richiesto di riscrivere codice di produzione senza percorso di
   aggiornamento. Fonti: forum e blog di ex utenti di lungo corso, quindi
   esperienze e non dati misurati, ma convergenti.

**Quando sarebbe stata la scelta giusta:** se l'obiettivo fosse stato
consegnare in fretta e mantenere senza voler imparare il mestiere. In quel
caso andava proposto seriamente.

Se il committente volesse riaprire la questione, il costo del cambio e'
ancora quasi nullo (due serate investite).

## Nota: il peso dell'ambiente, e Lazarus

Il committente osserva che .NET gli sembra pesante e chiede ambienti piu'
rapidi da imparare e da usare. Osservazione **in parte corretta**, e va
distinta:

- **Visual Studio 2026 e' pesante**: Microsoft dichiara 4 GB di RAM minimi,
  16 GB raccomandati, 64 GB per il meglio, e 20-50 GB di disco per
  un'installazione tipica, con SSD raccomandato.
- **.NET come piattaforma non lo e'**: l'SDK e' una frazione di quei numeri e
  l'applicazione **compilata** gira in decine di MB e parte in meno di un
  secondo, che per un PC da negozio e' un vantaggio, non un problema.

Quindi la leva e' **l'IDE, non la piattaforma**. Tre configurazioni possibili,
da scegliere in base all'hardware reale:

1. **VS Code + dotnet CLI** &mdash; leggerissimo, ma **senza designer
   WinForms**: le maschere si scrivono a mano. Nota di licenza: l'estensione
   C# base e' MIT, il **C# Dev Kit** segue il modello Visual Studio (gratuito
   per individui e piccole realta', a pagamento sopra 250 PC o un milione di
   dollari di ricavi).
2. **Ibrido** &mdash; VS Code per libreria di dominio, test e logica; Visual
   Studio aperto solo quando si toccano le maschere. Probabilmente il miglior
   compromesso.
3. **Visual Studio pieno**, se la macchina ha almeno 16 GB e un SSD.

### Lazarus / Free Pascal come alternativa leggera

E' la risposta onesta a "leggero + RAD + gratis", e va sul tavolo: IDE di
qualche centinaio di MB (il minimo dichiarato per la 4.8 parte da Windows
2000), designer visuale RAD classico, eseguibili nativi singoli e piccoli
senza runtime da installare dal cliente, nessun costo di licenza, comunita'
viva (Lazarus 4.8 rilasciata l'11 giugno 2026) e molto piu' grande di quella
di Xojo. Object Pascal e' fortemente tipizzato e leggibile, con lunga
tradizione nel gestionale.

Contro, applicando **lo stesso metro usato per scartare Xojo**:

- il tipo `Currency` di Object Pascal e' fixed point a **4 decimali**, cioe'
  **lo stesso limite contestato a Xojo**. Si aggira con interi scalati o
  librerie dedicate, ma e' lavoro in piu' su cui si puo' sbagliare, dove
  `decimal` di C# non chiede niente;
- ecosistema molto piu' piccolo di .NET: per PDF, grafici e simili le opzioni
  ci sono ma sono meno curate;
- il mercato freelance Object Pascal e' piccolo e invecchia;
- **l'assistente e' meno affidabile in Object Pascal che in C#**: meno
  materiale su cui e' stato addestrato significa piu' codice da correggere, e
  su questo progetto genera molto codice.

Da verificare prima di un eventuale passaggio: componenti database per
PostgreSQL, libreria di stampa PDF e di grafici all'altezza dei KPI.

**Raccomandazione attuale:** restare su C# e risolvere il peso cambiando IDE,
non piattaforma. Se l'hardware risultasse davvero inadeguato, la seconda
scelta e' **Lazarus**, non Xojo.

## Riferimenti fissi

| Cosa | Dove |
| --- | --- |
| Manuale leggibile (pagina web) | https://claude.ai/artifact/2kBUSYQ3KW5qFQxUKZvZwK |
| Sorgente della pagina | `docs/manuale/index.html` |
| Repository, branch di lavoro | `corsaronero33-cmd/Cloude`, branch `ccr-64a51a7b-wapao4` |

La pagina si aggiorna ripubblicando quel file con lo strumento Artifact: lo
stesso percorso file mantiene lo stesso URL.

## Sessioni

### 2026-10-15 (notte) — Stack confermato, manuale spuntabile

Stack **confermato dal committente**: Visual Studio + C#. Chiusa la
discussione su Xojo, Lazarus e il peso dell'ambiente; non serve riaprirla
salvo richiesta sua.

Su sua richiesta il manuale e' ora **spuntabile**: 30 caselle (18 moduli del
percorso, 6 passi del modulo 0, 6 del modulo 1) e un pannello di avanzamento
con i conteggi e le barre. Le spunte stanno nella capacita' `db`
dell'artefatto (`progresso/manuale`, campo `voci`), non nella pagina, cosi'
sopravvivono alle ripubblicazioni; copia locale nel browser come rete di
sicurezza. Verificato con una rilettura dell'archivio dopo la scrittura.

Seminate come fatte **solo** le quattro voci che ha effettivamente
riportato: Visual Studio installato, primo programma, esercizio
dell'arrotondamento, risultati comunicati. PostgreSQL e Git restano da
spuntare a lui, e per questo `mod-0` non e' spuntato.

Resta aperto il suo compito: il metodo `PrezzoDiVendita` e le tre domande.
Prossima consegna mia: il modello dati del magazzino.

### 2026-10-15 (sera) — Modulo 0 superato, consegnato il modulo 1a

Il committente ha installato gli attrezzi e svolto il modulo 0. Riscontro:

- i tre numeri dello scorporo: **2,60 / 2,13 / 0,47**, corretti;
- l'esercizio sull'arrotondamento: **1,45** e **1,44**, corretti, quindi ha
  visto la differenza fra arrotondamento commerciale e "al pari";
- versione installata: **.NET 10.0**, che e' l'attuale LTS. Nessuna azione.
- non si e' bloccato da nessuna parte.

Consegnato `lezione-01-metodi.md` (modulo 1a, "Dai calcoli ai metodi"):
metodi con parametri tipizzati e valore di ritorno, `static`, `public`,
`void`, `==` contro `=`, e un `Verifica.Controlla` scritto a mano come
anticipazione di xUnit al modulo 2.

Esercizio assegnato: scrive **lui** il metodo `PrezzoDiVendita`
(costo netto + ricarico + aliquota -> prezzo al pubblico), che serve davvero
al carico da fattura fornitore. Tre casi attesi dati, il terzo (3,33 / 35% /
22% -> 5,48) e' costruito per far emergere l'errore di arrotondare
l'imponibile intermedio, che darebbe 5,49.

Tutti i valori attesi della lezione sono stati **verificati con un calcolo
indipendente** in `Decimal`/ROUND_HALF_UP prima della consegna.

Da fare al rientro: leggere il suo codice e fargli la **prima revisione**,
anche se i controlli sono verdi. E' il primo codice che scrive lui.

Tre domande di verifica poste sul modulo 0: il suffisso `m`, punto contro
virgola fra codice e output, e perche' l'imposta si calcola per differenza.

### 2026-10-15 — Impostazione

Fatto: analisi degli stack, scelta di C#/.NET + WinForms + PostgreSQL,
definizione dello scope, impostazione del percorso didattico.

Prodotto: `CLAUDE.md`, `docs/00-percorso/` (percorso, glossario, lezione 0),
`docs/01-scelta-linguaggio/` (confronto C# / VB.NET).

Prossimo passo: modulo 0 (installazione attrezzi) da parte del committente,
poi schema del database di magazzino.

Emerso a fine sessione: il committente **non riesce a leggere i file
Markdown**. Aggiunta la pagina web del manuale come versione leggibile, e
annotata in `CLAUDE.md` la regola di tenerla aggiornata.

Il committente ha corretto l'obiettivo didattico: vuole diventare
programmatore professionista. Percorso riscritto in tre parti (fondamenta,
autonomia, mestiere), aggiunta la regola su **chi scrive il codice** per
fase, dichiarato il costo in velocita' di consegna che questo comporta.

Didattica: nessun modulo ancora completato. Modulo 0 consegnato, in attesa
che venga svolto. **Fase A**: scrivo io, lui legge e spiega.
