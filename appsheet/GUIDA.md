# Gestione assistenza in AppSheet

> Questo file e' la sorgente. La versione da usare mentre si lavora e'
> `guida.html`: stessa roba, piu' i pulsanti per copiare le formule e le
> caselle per spuntare i passaggi fatti. Pubblicata come artefatto, salva
> l'avanzamento nello spazio privato di chi la apre, quindi le spunte si
> ritrovano anche da un altro dispositivo.

Tutto il necessario per costruirla da solo: i fogli di partenza, le formule
verificate e l'ordine in cui montarla. L'app la fai tu nell'editor, cosi' resta
tua davvero.

## Perche' AppSheet ha senso qui

Le cose che nell'app scritta a mano sono costate piu' fatica, qui ci sono gia':

| Cosa serve | In AppSheet |
| --- | --- |
| Funziona senza rete e si risincronizza | compreso, va solo acceso |
| Firma del cliente sul rapportino | un tipo di colonna, `Signature` |
| Foto del guasto | un tipo di colonna, `Image` |
| Rapportino in PDF | modello in Google Documenti |
| Email giornaliera delle scadenze | una automazione a orario |
| Accessi per i tecnici | l'account Google che hanno gia' |
| Gira su telefono e su PC | si' |

Quello che scrivi tu sono le **formule**, e sono quelle del foglio di calcolo:
`IF`, `AND`, `TODAY()`. Terreno che conosci.

## Cosa costa davvero

Due costi, nessuno dei due nascosto ma tutti e due veri.

**Soldi, per sempre.** Si paga a utente al mese: il piano Starter (che include
email automatiche e generazione PDF, cioe' quello che ti serve) sta intorno ai
5 dollari per utente al mese, il Core intorno ai 10. Con tre persone sono circa
180-360 dollari l'anno, ogni anno. I prezzi sono stati ritoccati di recente:
controllali prima di decidere.

**Ci stai dentro.** I dati restano tuoi, nei fogli Google, e li esporti quando
vuoi. L'app no: la definizione vive nella piattaforma e non si porta via. Se un
domani Google cambia prezzi o chiude il servizio, i dati li hai, l'app la
rifai. Per un archivio di questa dimensione non e' un dramma, ma e' giusto
saperlo prima.

**Un limite tecnico da conoscere:** l'uso senza rete funziona, ma l'app va
aperta almeno una volta con la connessione, le foto arrivano sul telefono solo
se accendi la copia locale dei contenuti, e con molti dati diventa pesante. Per
qualche migliaio di righe sei abbondantemente dentro.

## Passo 1 — I fogli

**Un solo file di Google Fogli, con cinque schede dentro.** Non cinque file
separati: AppSheet legge ogni scheda come una tabella, e tenendole nello stesso
file le colleghi fra loro con un clic, le condividi una volta sola e ne fai una
copia di sicurezza sola.

In questa cartella ci sono cinque file CSV. Crea un foglio di calcolo nuovo su
Google Drive, aggiungi cinque schede in fondo e chiamale esattamente:

`Clienti` · `Apparecchi` · `Contratti` · `Interventi` · `Impostazioni`

Poi, per ognuna, incolla il contenuto del CSV corrispondente partendo dalla cella
`A1`. (Se preferisci, carica un CSV su Drive, aprilo con Fogli Google e copia la
scheda nel file principale con *Copia in → foglio di lavoro esistente*.)

Tre regole che valgono per tutte le schede, perche' AppSheet le legge cosi':

- le **intestazioni stanno nella riga 1**, senza righe vuote sopra e senza celle
  unite;
- **niente formule nelle celle.** Le colonne calcolate si fanno in AppSheet
  (passo 3): una formula scritta nel foglio verrebbe sovrascritta la prima volta
  che l'app salva una riga;
- se piu' avanti aggiungi o rinomini una colonna, in AppSheet fai
  **Regenerate schema** su quella tabella, altrimenti l'app continua a vedere la
  struttura vecchia.

Le righe di esempio servono a vedere l'app piena fin da subito: le cancelli
quando inserisci i tuoi. Le date sono scelte in modo che qualcosa risulti
scaduto, qualcosa in settimana e qualcosa piu' avanti.

In `Impostazioni` compila almeno `azienda_nome` e `avvisi_destinatari`.

## Passo 2 — L'app

Su appsheet.com: **Create → App → Start with existing data**, e scegli la scheda
`Clienti`. Poi da `Data → Add new data` aggiungi le altre quattro schede.

**Aggiungile tutte e cinque prima di toccare qualunque altra cosa**: i
collegamenti del punto 2.3 non si possono creare verso una tabella che l'app non
conosce ancora.

### 2.1 — La chiave (su tutte e cinque)

In `Data → Columns`, scheda per scheda: la colonna `ID` dev'essere la **Key**,
con `Initial value` impostato a `UNIQUEID()`. Su `Impostazioni` la chiave e'
`Chiave` invece di `ID`, e non serve `UNIQUEID()`: quelle righe le scrivi tu.

### 2.2 — L'etichetta (solo su Clienti e Apparecchi)

Spunta la casella **LABEL** su:

| Tabella | Colonna da marcare come LABEL |
| --- | --- |
| `Clienti` | `Ragione sociale` |
| `Apparecchi` | `Matricola` |

**Non saltare questo passaggio.** L'etichetta e' il nome con cui una riga si
presenta quando viene richiamata da un'altra parte. Senza, nei menu a tendina
del punto successivo ti ritroveresti a scegliere fra `C001`, `C002`, `C003`
invece che fra i nomi dei clienti, e l'app diventa inusabile sul campo.

### 2.3 — I collegamenti

Sono **quattro colonne in tre tabelle**. In `Data → Columns`, apri la colonna
con l'icona della matita, metti `Type` = **Ref** e, sotto `Type Details`,
imposta `Source table`:

| Tabella dove lavori | Colonna | Type | Source table |
| --- | --- | --- | --- |
| `Apparecchi` | `Cliente` | Ref | `Clienti` |
| `Contratti` | `Cliente` | Ref | `Clienti` |
| `Interventi` | `Cliente` | Ref | `Clienti` |
| `Interventi` | `Apparecchio` | Ref | `Apparecchi` |

Su `Clienti` e su `Impostazioni` non c'e' niente da collegare.

Attenzione a non confondersi con due colonne che **restano testo semplice**:
`Sede` in `Apparecchi` e `Tecnico` in `Interventi`. Non esistono tabelle
`Sedi` e `Tecnici`, quindi non c'e' niente a cui puntare.

Fatti i quattro collegamenti, in `Clienti` compaiono da sole delle colonne
tipo `Related Apparecchis`: non le hai create tu, le aggiunge AppSheet, e sono
quelle che fanno vedere gli apparecchi di un cliente aprendo la sua scheda.
Puoi rinominarle piu' tardi dalla vista.

I collegamenti non sono un vezzo: le formule del passo 5 e del passo 6 scrivono
`[Cliente].[Ragione sociale]`, cioe' "vai al cliente collegato e prendi la sua
ragione sociale". Se `Cliente` resta di tipo `Text`, quelle espressioni non
funzionano.

### 2.4 — I tipi che AppSheet indovina male

`Messa in servizio`, `Ultima verifica`, `Scadenza`, `Data`, `Data inizio`,
`Data trasmissione`, `Data dismissione` → **Date**;
`Collegato POS`, `Trasmessa AdE`, `Da fatturare`, `Fatturato`,
`Rinnovo automatico` → **Yes/No**;
`Firma` → **Signature**; `Foto` → **Image**;
`Importo`, `Ore` → **Decimal**.

## Passo 3 — Le formule

Sono il cuore. Si aggiungono in `Data → Columns → Add virtual column`, e
l'espressione va nel campo `App formula`.

### Sulla tabella Apparecchi

**`Base verifica`** — tipo Date. Da dove parte il conto: l'ultima verifica, o
in mancanza la messa in servizio.

```
IFS(
  ISNOTBLANK([Ultima verifica]), [Ultima verifica],
  ISNOTBLANK([Messa in servizio]), [Messa in servizio]
)
```

**`Mesi verifica`** — tipo Number. Legge la cadenza dalle impostazioni, cosi'
il giorno che la norma cambia correggi una cella sola.

```
NUMBER(ANY(SELECT(Impostazioni[Valore], [Chiave] = "mesi_verifica")))
```

**`Prossima verifica`** — tipo Date. **Questa e' la formula da copiare
esattamente.**

```
IF(
  ISBLANK([Base verifica]),
  "",
  MIN(LIST(
    EOMONTH([Base verifica], [Mesi verifica] - 1) + DAY([Base verifica]),
    EOMONTH([Base verifica], [Mesi verifica])
  ))
)
```

AppSheet non sa sommare mesi, quindi si gira intorno con `EOMONTH`. Nei forum
trovi la versione corta, senza `MIN(LIST(...))`:

```
EOMONTH([Base verifica], [Mesi verifica] - 1) + DAY([Base verifica])
```

**Non usarla.** L'ho provata su tutte le date di vent'anni: sbaglia sulle
verifiche fatte il 29 febbraio, e sbaglia **in avanti**. Un apparecchio
verificato il 29 febbraio 2024 risulterebbe in scadenza il 1 marzo 2026 invece
che il 28 febbraio: due giorni di ritardo su una scadenza fiscale, e
l'avviso ti arriva quando sei gia' fuori termine. Con `MIN(LIST(...))` il conto
e' esatto su tutte le date provate.

**`Giorni alla verifica`** — tipo Number.

```
IF(ISBLANK([Prossima verifica]), "", HOUR([Prossima verifica] - TODAY()) / 24)
```

La divisione per 24 non e' un errore: in AppSheet la differenza fra due date e'
una durata, non un numero, e `HOUR()` la trasforma in ore. Se una formula con
le date ti da' un risultato strano, e' la prima cosa da guardare.

**`Situazione`** — tipo Text. Serve a colorare gli elenchi.

```
IFS(
  ISBLANK([Prossima verifica]), "Date mancanti",
  [Giorni alla verifica] < 0,   "Scaduta",
  [Giorni alla verifica] <= 7,  "Entro 7 giorni",
  [Giorni alla verifica] <= 30, "Entro il mese",
  TRUE, "In regola"
)
```

### Sulla tabella Contratti

**`Giorni alla scadenza`** — Number: `HOUR([Scadenza] - TODAY()) / 24`

**`Situazione`** — Text:

```
IFS(
  [Giorni alla scadenza] < 0,   "Scaduto",
  [Giorni alla scadenza] <= 7,  "Entro 7 giorni",
  [Giorni alla scadenza] <= 30, "Entro il mese",
  TRUE, "In regola"
)
```

> Le colonne virtuali si ricalcolano **a ogni sincronizzazione**, non di minuto
> in minuto. Siccome dipendono da `TODAY()`, i giorni si aggiornano quando apri
> l'app. Per uno scadenzario va benissimo.

## Passo 4 — Lo scadenzario

In `Data → Slices` crea questi filtri, e poi una vista per ognuno
(`UX → Views`, tipo `deck` o `table`):

| Nome | Tabella | Row filter condition |
| --- | --- | --- |
| Verifiche in scadenza | Apparecchi | `AND(NOT(IN([Stato], LIST("Dismesso","Magazzino"))), ISNOTBLANK([Prossima verifica]), [Giorni alla verifica] <= 30)` |
| Date mancanti | Apparecchi | `AND([Stato] <> "Dismesso", ISBLANK([Base verifica]))` |
| Da adeguare al POS | Apparecchi | `AND([Stato] = "Attivo", NOT([Collegato POS]))` |
| Contratti in scadenza | Contratti | `AND(IN([Stato], LIST("Attivo","Scaduto")), [Giorni alla scadenza] <= 30)` |
| Da trasmettere ad AdE | Interventi | `AND([Tipo] = "Verifica periodica", [Stato] = "Chiuso", NOT([Trasmessa AdE]))` |

Ordina le prime per `Prossima verifica` crescente e colora per `Situazione`:
rosso su "Scaduta", ambra su "Entro 7 giorni".

**La vista che conta** e' "Verifiche in scadenza": mettila come schermata di
apertura (`UX → Options → Starting view`).

## Passo 5 — Il rapportino in PDF

Crea un Google Documento con l'intestazione della tua ditta e i segnaposto fra
doppie parentesi angolari:

```
Cliente: <<[Cliente].[Ragione sociale]>>
Apparecchio: <<[Apparecchio].[Matricola]>>   <<[Apparecchio].[Marca]>> <<[Apparecchio].[Modello]>>
Data: <<[Data]>>          Ore: <<[Ore]>>

Problema rilevato
<<[Problema]>>

Lavoro eseguito
<<[Lavoro eseguito]>>

Esito verifica: <<[Esito verifica]>>   Sigilli: <<[Sigilli]>>

Firma del cliente
<<[Firma]>>
```

Poi `Automation → Bot`, evento `Data change` su `Interventi`, azione
`Create a new file` con quel modello. Oppure, piu' semplice per cominciare, una
azione manuale sulla riga, cosi' il PDF lo generi quando vuoi tu.

## Passo 6 — L'avviso giornaliero

`Automation → Create new bot`, evento **Schedule** (ogni giorno, l'ora che
preferisci), azione **Send an email**. Nel corpo, una sezione per tipo:

```
IN RITARDO
<<Start: FILTER("Apparecchi", AND(ISNOTBLANK([Prossima verifica]), [Giorni alla verifica] < 0))>>
<<[Cliente].[Ragione sociale]>> - matricola <<[Matricola]>> - scaduta il <<[Prossima verifica]>>
<<End>>

ENTRO SETTE GIORNI
<<Start: FILTER("Apparecchi", AND([Giorni alla verifica] >= 0, [Giorni alla verifica] <= 7))>>
<<[Cliente].[Ragione sociale]>> - matricola <<[Matricola]>> - il <<[Prossima verifica]>>
<<End>>

CONTRATTI IN SCADENZA
<<Start: FILTER("Contratti", AND(IN([Stato], LIST("Attivo","Scaduto")), [Giorni alla scadenza] <= 30))>>
<<[Cliente].[Ragione sociale]>> - <<[Descrizione]>> - il <<[Scadenza]>>
<<End>>

DA TRASMETTERE ALL'AGENZIA
<<Start: FILTER("Interventi", AND([Tipo] = "Verifica periodica", [Stato] = "Chiuso", NOT([Trasmessa AdE])))>>
<<[Cliente].[Ragione sociale]>> - verifica del <<[Data]>>
<<End>>
```

Nel destinatario metti l'espressione che legge le impostazioni, cosi' cambi
indirizzo senza toccare l'automazione:

```
ANY(SELECT(Impostazioni[Valore], [Chiave] = "avvisi_destinatari"))
```

Conviene aggiungere una condizione al bot perche' non mandi niente quando non
c'e' niente: un messaggio che arriva solo quando serve si continua a leggere,
uno che arriva sempre si smette di aprire dopo due settimane.

## Passo 7 — Senza rete

`UX → Options`, accendi **Offline use** (e **Offline content caching** se
vuoi anche le foto sul telefono). Prova davvero: apri l'app, metti il telefono
in modalita' aereo, compila un rapportino con la firma, riaccendi la rete e
controlla che sia salito. Falla questa prova prima di darla ai tecnici.

## Se qualcosa non torna

- **Una formula con le date da' numeri assurdi** → manca `HOUR(...) / 24`.
- **`Mesi verifica` risulta vuoto** → nel foglio `Impostazioni` la chiave
  dev'essere scritta esattamente `mesi_verifica`, senza spazi.
- **Un elenco e' vuoto quando non dovrebbe** → nello slice, controlla che i
  valori di `Stato` nel foglio siano scritti come nella formula: `Attivo` con
  la A maiuscola.
- **Le righe nuove non si collegano al cliente** → la colonna `Cliente` non e'
  di tipo `Ref`.

## Cosa non ho messo, e perche'

Sedi multiple, magazzino ricambi e righe di materiale sul rapportino non ci
sono: su cinque tabelle l'app si monta in una sera, su otto no. La sede per ora
e' un campo di testo sull'apparecchio. Quando l'app sara' in uso e sapremo cosa
manca davvero, si aggiungono: in AppSheet aggiungere una tabella e' aggiungere
un foglio.
