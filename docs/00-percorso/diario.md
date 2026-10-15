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

## Sessioni

### 2026-10-15 — Impostazione

Fatto: analisi degli stack, scelta di C#/.NET + WinForms + PostgreSQL,
definizione dello scope, impostazione del percorso didattico.

Prodotto: `CLAUDE.md`, `docs/00-percorso/` (percorso, glossario, lezione 0),
`docs/01-scelta-linguaggio/` (confronto C# / VB.NET).

Prossimo passo: modulo 0 (installazione attrezzi) da parte del committente,
poi schema del database di magazzino.

Didattica: nessun modulo ancora completato.
