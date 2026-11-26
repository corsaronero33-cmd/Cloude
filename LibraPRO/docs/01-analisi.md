# Libra PRO — Analisi funzionale e scelte tecniche

> Documento di partenza del progetto. Descrive **cosa** deve fare Libra PRO
> (prendendo come riferimento le funzioni di un gestionale tipo Danea Easyfatt),
> **come** lo costruiamo e **in che ordine**.
>
> Libra PRO è un prodotto autonomo: nome, grafica, testi e codice sono nostri.
> Di Easyfatt prendiamo solo l'idea di *quali funzioni* servono a un piccolo
> commerciante, non interfaccia, icone o materiale.

---

## 1. A chi serve

Negozi e piccole aziende con 1–10 postazioni in rete locale:

| Tipo di attività | Cosa gli serve in più rispetto alla base |
| --- | --- |
| Supermercato / alimentari | Vendita veloce a barcode, articoli a peso (barcode bilancia), reparti IVA, offerte a tempo, molti articoli |
| Abbigliamento | Varianti **taglia/colore** (griglia), stagioni/collezioni, etichette con barcode per variante, resi e cambi |
| Calzature | Come abbigliamento, con numerazioni (35–46, mezze misure) |
| Ferramenta / generico | Unità di misura multiple, listini multipli, vendita a privati e a partita IVA |
| Bar / ristorazione leggera | Tasti rapidi, reparti, scontrino veloce |

Il programma deve avere **una sola base** e dei **profili attività** che
accendono o spengono funzioni (es. "griglia taglie" solo per abbigliamento e
calzature). Niente versioni diverse da mantenere.

---

## 2. Moduli funzionali

### 2.1 Anagrafiche
- **Clienti** e **fornitori** (stessa tabella, con un flag): ragione sociale,
  P.IVA, codice fiscale, indirizzi (sede + destinazioni diverse), contatti,
  **codice destinatario SDI / PEC**, condizioni di pagamento, listino
  applicato, sconti, banca d'appoggio, note.
- Controllo formale di P.IVA e codice fiscale.
- **Agenti** con percentuale di provvigione.
- Tabelle di supporto: aliquote IVA e **nature di esenzione** (N1…N7),
  pagamenti (rimessa diretta, bonifico, Ri.Ba. 30/60/90…), banche, vettori,
  unità di misura, categorie merceologiche, reparti.

### 2.2 Articoli e magazzino
- Articolo: codice, descrizione, categoria, marca, fornitore abituale,
  unità di misura, aliquota IVA, **reparto RT**, uno o più **barcode**.
- **Listini multipli** (es. 1 = pubblico IVA inclusa, 2 = rivenditori, …)
  con ricarico automatico sul costo.
- **Varianti** taglia/colore con griglia: ogni combinazione ha la sua
  giacenza e il suo barcode.
- **Lotti e scadenze** (alimentari) e **matricole/numeri di serie**.
- **Movimenti di magazzino** generati dai documenti (mai a mano sulla
  giacenza): carico, scarico, reso, rettifica inventariale.
- Più **magazzini/depositi** (es. negozio + magazzino).
- Scorta minima e proposta di **ordine a fornitore** per i sottoscorta.
- Inventario (anche da terminalino barcode), valorizzazione a costo medio /
  ultimo costo.
- **Stampa etichette** con barcode e prezzo.

### 2.3 Documenti
Tutti i documenti condividono la stessa struttura (testata + righe + totali +
scadenze), cambia solo il **tipo**:

| Documento | Muove il magazzino | Fiscale |
| --- | --- | --- |
| Preventivo | No | No |
| Ordine cliente | No (impegna) | No |
| DDT (documento di trasporto) | Sì | No |
| Fattura immediata / accompagnatoria | Sì | **Sì, XML SDI** |
| Fattura differita (da più DDT) | No (già fatto dal DDT) | **Sì, XML SDI** |
| Nota di credito | Sì (rientro) | **Sì, XML SDI** |
| Fattura proforma | No | No |
| Ordine a fornitore | No (in arrivo) | No |
| Arrivo merce / fattura d'acquisto | Sì (carico) | Ricevuta da SDI |
| **Vendita al banco** (scontrino) | Sì | **Sì, tramite RT** |

Funzioni comuni:
- **Trasformazione** di un documento in un altro (preventivo → ordine →
  DDT → fattura) mantenendo il collegamento.
- Numerazione automatica per tipo, anno e **sezionale** (es. 1/A, 1/B).
- Sconti in cascata (es. 10+5%), spese di trasporto/incasso, bollo virtuale
  automatico sopra 77,47 € su operazioni esenti, ritenuta d'acconto,
  split payment, reverse charge.
- Stampa PDF con layout personalizzabile e logo, invio via e-mail.

### 2.4 Fatturazione elettronica
- Generazione del file **XML FatturaPA** (formato FPR12 verso privati, FPA12
  verso PA) dai documenti fiscali, con validazione contro lo schema XSD
  ufficiale prima dell'invio.
- Invio e ricezione tramite **intermediario** (un provider con API) oppure
  esportazione del file per caricamento manuale sul portale *Fatture e
  Corrispettivi*. La PEC verso SDI richiede un accreditamento: la lasciamo
  per ultima o non la facciamo.
- Gestione delle **ricevute SDI** (consegnata, scartata, mancata consegna…)
  e stato del documento.
- Importazione delle **fatture passive** XML (anche .p7m firmate) con
  creazione automatica del fornitore e, a scelta, carico di magazzino.

### 2.5 Vendita al banco (POS) e registratore telematico
- Schermata **touch-friendly** separata dal resto del gestionale: lettura
  barcode, ricerca rapida, tasti reparto, quantità, sconto riga/totale,
  pagamento misto (contanti + carta), calcolo resto.
- Barcode **a peso/prezzo** delle bilance (prefissi 2x).
- Clienti fidelity (punti, sconti dedicati) — fase successiva.
- Invio del **documento commerciale** all'RT, che lo stampa e trasmette da
  solo i corrispettivi all'Agenzia delle Entrate.
- Operazioni RT: chiusura giornaliera (**Z**), lettura (X), reso e annullo
  (riferiti a matricola RT, numero di chiusura e numero documento), apertura
  cassetto, codice **lotteria degli scontrini**, documento commerciale valido
  come fattura (con C.F./P.IVA del cliente).
- Fattura da scontrino (fattura riepilogativa che richiama il documento
  commerciale).

Dettaglio tecnico sull'RT nel paragrafo 4.

### 2.6 Pagamenti e contabilità leggera
- **Scadenzario** clienti e fornitori generato dalle condizioni di pagamento.
- Registrazione incassi e pagamenti, insoluti, solleciti.
- **Prima nota** cassa/banca semplice.
- Esportazione flussi bancari **Ri.Ba.** e **SEPA** (fase avanzata).
- Esportazione dati per il commercialista (CSV / Excel).

### 2.7 Statistiche e stampe
- Venduto per periodo, cliente, articolo, categoria, agente, reparto.
- Margini (prezzo di vendita − costo), articoli più/meno venduti.
- Registro corrispettivi e riepilogo IVA del periodo.
- Esportazione di qualsiasi elenco in Excel.

### 2.8 Sistema
- **Utenti e permessi** (es. il cassiere non vede i costi né le statistiche).
- Gestione di più **aziende** nello stesso archivio (fase avanzata).
- Backup e ripristino del database con un clic, backup automatico.
- Importazione da Excel di articoli e clienti (indispensabile per chi passa
  da un altro gestionale).
- Registro delle operazioni (chi ha fatto cosa).

---

## 3. Scelta del linguaggio: Python

### Confronto

| Criterio | twinBASIC | Python |
| --- | --- | --- |
| Facilità per chi inizia | Buona (sintassi VB6) | **Ottima**, sintassi più pulita |
| Maturità | Ancora in sviluppo (beta), un solo sviluppatore principale | Stabile da decenni |
| Documentazione e tutorial in italiano | Pochi | **Moltissimi** |
| Librerie per database in rete | ADO/ODBC, datate | psycopg, SQLAlchemy |
| XML FatturaPA + validazione XSD | A mano | **lxml**, pronto |
| PDF, barcode, Excel, e-mail | Componenti esterni o a mano | reportlab/Qt, python-barcode, openpyxl, smtplib |
| Comunicazione con RT via rete (HTTP/XML, TCP) | Possibile, faticoso | **requests / socket**, poche righe |
| Interfaccia grafica | Designer stile VB6, molto comodo | PySide6 (Qt) + Qt Designer, comodo |
| Futuro (web, app, cloud) | Limitato | Aperto |
| Licenza commerciale | Serve la versione a pagamento per alcune funzioni | Tutto gratuito (PySide6 è LGPL) |

### Consiglio: **Python + PySide6 (Qt) + PostgreSQL**

Python è il linguaggio più usato al mondo per insegnare a programmare: si
legge quasi come l'inglese, perdona gli errori più di altri e per ogni
problema che incontreremo (XML, PDF, stampanti, rete) esiste già una libreria
collaudata. twinBASIC è simpatico se si viene da VB6, ma per un gestionale
commerciale che dovrà durare anni conviene uno strumento maturo.

### Strumenti

| Cosa | Strumento | Perché |
| --- | --- | --- |
| Linguaggio | Python 3.12+ | Semplice, stabile |
| Editor | **VS Code** con estensione Python | Gratuito, suggerimenti e debug passo-passo |
| Interfaccia | **PySide6** (Qt for Python) | Finestre native Windows, griglie, stampa |
| Disegno finestre | **Qt Designer** (incluso in PySide6) | Si disegnano le maschere col mouse, come in VB |
| Database | **PostgreSQL** su un PC "server" | Gratuito, multiutente reale, robusto |
| Accesso al DB | **SQLAlchemy** + **Alembic** | Tabelle come classi Python, aggiornamenti dello schema versionati |
| XML fatture | **lxml** | Generazione e validazione XSD |
| PDF | Qt (QTextDocument → PDF) con modelli HTML **Jinja2** | Layout modificabili senza toccare il codice |
| Excel | openpyxl | Import/export |
| Barcode | python-barcode | Etichette |
| Distribuzione | PyInstaller + installer Inno Setup | Un `.exe` da installare sui client |
| Test | pytest | Verifichiamo i calcoli (IVA, totali, arrotondamenti) |

---

## 4. Architettura

```
            Rete locale (LAN)
 ┌──────────────────────────────────────────┐
 │  PC SERVER                               │
 │  ┌───────────────┐                       │
 │  │ PostgreSQL    │◄─── backup automatico │
 │  └──────▲────────┘                       │
 └─────────┼────────────────────────────────┘
           │ TCP 5432
   ┌───────┼──────────┬──────────────┐
   │       │          │              │
┌──┴───┐ ┌─┴────┐ ┌───┴──┐       ┌───┴──┐
│Ufficio│ │Cassa1│ │Cassa2│  ...  │ PC 10│   ← Libra PRO (client)
└───────┘ └──┬───┘ └──┬───┘       └──────┘
             │ HTTP/TCP│
          ┌──┴──┐   ┌──┴──┐
          │ RT 1│   │ RT 2│   ← registratori telematici in rete
          └─────┘   └─────┘
```

- **Client "grasso" + database condiviso**: ogni postazione ha Libra PRO
  installato e si collega direttamente a PostgreSQL. Con 10 postazioni è la
  soluzione più semplice e affidabile; non serve un server applicativo.
- La concorrenza (due persone che salvano lo stesso documento, la
  numerazione delle fatture) la gestisce PostgreSQL con **transazioni** e
  **lock**: la numerazione si assegna dentro la transazione di salvataggio,
  così due casse non possono mai prendere lo stesso numero.
- Ogni cassa ha nella sua configurazione locale l'indirizzo del **proprio RT**.

### Struttura del codice

Il codice è diviso in strati, così la logica (calcoli, regole fiscali) si
può provare senza aprire finestre:

```
libra/
  app.py                 avvio del programma
  config.py              impostazioni locali (indirizzo DB, RT della cassa)
  db/                    connessione, modelli delle tabelle, migrazioni
  core/                  logica pura: calcolo righe, IVA, arrotondamenti,
                         numerazione, trasformazione documenti
  fisco/
    fatturapa/           generazione e lettura XML, schemi XSD
    rt/                  driver dei registratori telematici
      base.py            interfaccia comune
      epson.py           Epson (protocollo XML su HTTP)
      rch.py             RCH
      custom.py          Custom
      simulatore.py      RT finto per provare senza hardware
  ui/                    finestre (file .ui di Qt Designer + codice)
  stampe/                modelli HTML dei documenti
tests/                   test automatici
```

### Registratori telematici (RT)

Il software **non** trasmette i corrispettivi: lo fa l'RT da solo. Libra PRO
deve soltanto mandare all'RT i comandi giusti. Ogni marca usa un protocollo
diverso, quindi scriviamo un'**interfaccia comune** e un **driver per
marca**:

```python
class RegistratoreTelematico:
    def stampa_documento_commerciale(self, righe, pagamenti, lotteria=None): ...
    def reso(self, riferimento, righe): ...
    def annullo(self, riferimento): ...
    def chiusura_giornaliera(self): ...
    def lettura_giornaliera(self): ...
    def apri_cassetto(self): ...
    def stato(self): ...
```

| Marca | Collegamento tipico | Protocollo |
| --- | --- | --- |
| Epson (FP-81 II RT, FP-90 III) | Rete | XML su HTTP (servizio `fpmate`) — ben documentato, **partiamo da qui** |
| RCH (Print!F, Swing) | Rete / seriale | Comandi XML/testuali propri |
| Custom (K3, Q3X, Big…) | Rete / seriale | Protocollo Custom con comandi testuali |
| Ditron, Olivetti, Micrelec… | Vari | Da valutare caso per caso |

Le specifiche dei protocolli si ottengono dai produttori (manuali
"protocollo di comunicazione" per sviluppatori). Il **simulatore** ci
permette di sviluppare e provare tutta la cassa prima di avere un RT
vero sul tavolo.

---

## 5. Piano di lavoro (e di studio)

Ogni fase insegna una parte di Python **mentre** costruisce un pezzo reale
del programma. Nessuna teoria fine a sé stessa.

| Fase | Cosa costruiamo | Cosa impari |
| --- | --- | --- |
| 0 | Installazione: Python, VS Code, PostgreSQL, Git | Terminale, ambiente virtuale, primo programma |
| 1 | Calcolo di una riga di documento e dei totali IVA (solo codice, niente finestre) | Variabili, tipi, `Decimal` per i soldi, funzioni, `if`, cicli, liste, dizionari |
| 2 | Classi `Articolo`, `Documento`, `Riga` + test automatici | Classi e oggetti, moduli, pytest |
| 3 | Database: tabelle articoli/clienti, inserimento e ricerca | SQL di base, SQLAlchemy, transazioni |
| 4 | Prima finestra: elenco e scheda articoli | PySide6, Qt Designer, segnali e slot |
| 5 | Anagrafica clienti/fornitori con controllo P.IVA e C.F. | Validazioni, finestre di dialogo |
| 6 | Documenti: fattura con righe, totali, numerazione, PDF | Griglie (tabelle Qt), modelli Jinja2, stampa |
| 7 | Movimenti di magazzino e giacenze | Logica di dominio, query aggregate |
| 8 | **Vendita al banco** con simulatore RT | Interfaccia touch, gestione eventi tastiera/barcode |
| 9 | Driver RT Epson reale | Rete, HTTP, XML |
| 10 | Fattura elettronica XML + validazione + importazione passive | lxml, XSD, file |
| 11 | Utenti, permessi, multi-postazione, backup | Sicurezza, concorrenza, lock |
| 12 | Varianti taglia/colore, lotti, etichette | Modelli dati più complessi |
| 13 | Scadenzario, statistiche, export Excel | Report, openpyxl |
| 14 | Installer e distribuzione | PyInstaller, Inno Setup |

Dopo la fase 8 Libra PRO è già usabile in un negozio per vendere e fare
fatture semplici; il resto si aggiunge un pezzo alla volta.

---

## 6. Punti di attenzione

- **Soldi sempre con `Decimal`**, mai con numeri in virgola mobile:
  `0.1 + 0.2` in virgola mobile fa `0.30000000000000004`.
- **Arrotondamenti IVA**: si calcola l'imposta sul totale imponibile di
  ciascuna aliquota, arrotondando a 2 decimali (come richiede l'XML SDI).
- **Le specifiche FatturaPA cambiano**: teniamo gli schemi XSD in una
  cartella separata e aggiornabile.
- **Nomi e marchi**: niente riferimenti a Danea/Easyfatt nell'interfaccia,
  nei file o nella documentazione distribuita.
- **Backup**: un gestionale che perde dati è peggio di nessun gestionale;
  il backup automatico va fatto presto, non alla fine.
