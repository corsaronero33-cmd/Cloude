# Tabella di marcia — da qui alla consegna

Pagina con lo stesso contenuto, piu' leggibile:
<https://claude.ai/artifact/7XnevvYVZU5pPmpdkpMcDZ>

**Il piano sta qui, e solo qui.** Sostituisce `DA-FARE.md`, che aveva finito
per contenere meta' piano e meta' appunti.

Dodici tappe, in ordine di dipendenza. Ognuna finisce con **una cosa che
funziona** e con un DDR da verificare.

---

## Le dodici tappe

| | Tappa | Finisce quando | |
|---|---|---|---|
| 0 | Le fondamenta | 26 tabelle, 42 relazioni, 23 liste valori, 13 funzioni, gli script del motore | **fatto** |
| 1 | Il menu e cinque anagrafiche | Reparti, Attrezzature, Fornitori, Prodotti, Operatori: elenco e scheda, ricerca, navigazione | **fatto** |
| 2 | Account e permessi | due set di privilegi, login all'apertura, script `94` che crea gli account | **fatto** |
| 3 | Punti di controllo | l'ultima anagrafica | **fatto** — `archivio/collaudo-012.md` |
| **4** | **Impresa e Parametri** | **due schede piccole; chiudono i due pulsanti del menu che oggi non portano da nessuna parte** | **← sei qui**, `guide/15-impresa.md` |
| 5 | Le larghezze | tutti i formati a una misura sola (**1020**), ridistribuendo le colonne dei tre elenchi piu' larghi | |
| 6 | Le rilevazioni | si misura una temperatura, il programma dice se e' a norma e apre da solo la non conformita' | |
| 7 | Sanificazioni e non conformita' | gli altri due registri del quotidiano | |
| 8 | Ricevimenti e lotti | il **passo indietro** della rintracciabilita': da un lotto al DDT e al fornitore | |
| 9 | Le stampe | i registri in PDF per l'ispezione — **qui il lavoro diventa consegnabile** | |
| 10 | Il telefono | FileMaker Go: rilevazione al volo, codice a barre, firma | |
| 11 | La consegna | menu nascosti, blocco della rilevazione, impianto di un locale nuovo | |

**Perche' le larghezze alla 5 e non in fondo.** Dalla 6 alla 8 nascono sei
formati nuovi: se la misura di progetto si decide dopo, vanno rifatti tutti.
Mezza giornata adesso contro due poi.

**Perche' le stampe alla 9.** Un registro HACCP che non si stampa non serve a
niente davanti a un'ispezione. La 10 e la 11 rendono il lavoro piacevole e
rivendibile; la 9 lo rende **consegnabile**.

---

## Tappa 4 — Impresa e Parametri

Due maschere, una scheda di lavoro ciascuna. **Il DDR si fa a fine tappa**,
con tutte e due montate.

### `D_Impresa scheda` — `guide/15-impresa.md`

<https://claude.ai/artifact/XwN5T92X5WNoucdKtQmBsf>

L'unica maschera **senza elenco**: l'impresa e' un record solo. Niente
ricerca, niente `+ Nuovo`, niente `Elimina`, niente contatore.

Porta con se' tre cose nuove: due campi **Contenitore** (`Logo` e
`ManualeAutocontrollo`, memorizzati esternamente), lo script
**`96 - Impresa - Apri la scheda`** che porta sull'unico record e **lo crea se
la tabella e' vuota**, e il fatto che da qui in poi il menu mostra finalmente
il nome del locale invece di una riga bianca.

### `D_Parametri elenco` — dopo

Venti parametri chiave/valore, elenco editabile direttamente senza scheda.
La parte da progettare: **otto parametri non vanno toccati dal cliente**, fra
cui `VersioneSchema`, che cambiato a mano rende il file non aggiornabile. La
tabella ha gia' la colonna `ModificabileDalCliente`: si useranno **due campi
sovrapposti**, uno scrivibile e uno bloccato, e comparira' quello giusto a
seconda di chi guarda.

---

## In panchina

Non sono dimenticanze: ognuna ha un momento in cui conviene farla.

| Cosa | Rientra alla tappa |
|---|---|
| Script `95 - Reimposta password` (si duplica il `94`) | 11 |
| Script `90`: distinguere *formato che non esiste* da *formato che non posso leggere* | 5 |
| Script `93`: non controlla l'esito del `90` e crea il record comunque | 5 |
| Blocco della rilevazione dopo il salvataggio | 11 |
| Gli script sui formati nudi (`01`, `02`, `10`): da ripuntare sulle occorrenze | 6 |
| Lo script `10` non aggancia il prodotto dal GTIN | 8 |
| Controllo di completezza della riga di ricevimento (lotto, scadenza) | 8 |
| Le tabelle di fase 2 vuote: manca il **passo avanti** della rintracciabilita' | 11 |
| I sette ritocchi minori, elencati sotto | 5 |

**L'unica voce che tocca un obbligo di legge** e' il passo avanti della
rintracciabilita': oggi si sa da dove viene un lotto, non in quale
preparazione e' finito. Va chiusa **prima** della consegna al cliente.

### I sette ritocchi, da fare tutti insieme alla tappa 5

| | Cosa | Dove |
|---|---|---|
| 1 | `91 - Attrezzature - Entra nell'elenco` ha due spazi in fondo al nome | Script |
| 2 | `Apri` a x **1**: tocca il bordo, va a **24** | tutti gli elenchi |
| 3 | Etichette di colonna a y 113 / 114 / 115 | `D_Operatori elenco` |
| 4 | Lo stile si chiama `Titolo Riquadro` ma veste il titolo dell'intestazione: rinominalo `Titolo maschera` | tema `HACCP` |
| 5 | Set `Operatore`, riga delle tabelle future: da scrivibile a sola visualizzazione | Sicurezza |
| 6 | `OnObjectSave` invece di `OnObjectExit` sulla casella di ricerca | gli elenchi |
| 7 | `ColorePrimario` vale `#1F4E5F`, il colore del tema vecchio: va `#1B3A5C` | tabella `Parametri` |

---

## Le quattro regole del percorso

1. **Una tappa per volta**, e si finisce prima di cominciare la prossima. E'
   quando si aprono due cantieri che non si capisce piu' da dove viene un
   guasto.
2. **Fine tappa: DDR, e si verifica.** Dieci giri di verifica, dieci difetti
   veri trovati. Saltarlo e' costato una serata.
3. **La sicurezza si prova uscendo e rientrando.** Dall'account di accesso
   completo tutto funziona sempre: non prova niente.
4. **Una scheda di lavoro per maschera**, con le spunte. Si lavora a sessioni,
   e si deve poter riprendere senza rileggere tutto.

---

## Dove sta cosa — cinque posti, non di piu'

| Se cerchi | Guarda |
|---|---|
| **Il piano** | questo documento |
| **Come si costruisce una maschera** | `guide/`, numerate nell'ordine di montaggio |
| **Com'e' fatto il database** | i nove numerati, da `01-ANALISI` a `09-MASCHERE` |
| **Cosa risulta nel file vero** | `archivio/collaudo-NNN.md`, l'ultimo e' il `010` |
| **Le regole di scrittura** | `CLAUDE.md` |

Se una cosa non e' in uno di questi cinque posti, non esiste.
