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
| 2026-10-15 | **Obiettivo didattico: programmatore professionista**, non "saper mantenere il prodotto" | correzione esplicita del committente. Comporta le tre fasi su chi scrive il codice, la revisione sistematica, e il rientro di async, generics, LINQ, DI e pattern nel programma |

## Questioni aperte

- [ ] **Che RT hanno i negozi di riferimento?** (Epson, RCH, Custom, Ditron?)
      Determina quale driver scrivere per primo.
- [ ] **C'e' un cliente pilota** disposto a fare da cavia?
- [ ] **Procurare un RT fisico** da banco di lavoro (Epson FP-81II usata,
      ~300-500 euro). L'integrazione non si sviluppa alla cieca.
- [ ] Nome definitivo del prodotto.
- [ ] Sbloccare `builds.dotnet.microsoft.com` e `api.nuget.org` nella policy
      di rete dell'ambiente cloud, per poter compilare e testare il motore qui.
- [ ] Verificare sulle fonti ufficiali dell'Agenzia delle Entrate: versione
      corrente dello schema FatturaPA, e data di operativita' della soluzione
      software certificata.

## Riferimenti fissi

| Cosa | Dove |
| --- | --- |
| Manuale leggibile (pagina web) | https://claude.ai/artifact/2kBUSYQ3KW5qFQxUKZvZwK |
| Sorgente della pagina | `docs/manuale/index.html` |
| Repository, branch di lavoro | `corsaronero33-cmd/Cloude`, branch `ccr-64a51a7b-wapao4` |

La pagina si aggiorna ripubblicando quel file con lo strumento Artifact: lo
stesso percorso file mantiene lo stesso URL.

## Sessioni

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
