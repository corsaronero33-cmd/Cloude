# Modello dati

Tabelle, campi e relazioni. Deriva direttamente da `01-ANALISI-HACCP.md`.

---

## Idea portante: un solo registro dei monitoraggi

La tentazione e' fare una tabella per registro: temperature frigo, temperature
cottura, abbattimento, oli di frittura... Sono dieci tabelle quasi identiche,
dieci maschere da mantenere e dieci stampe da rifare ogni volta che il
consulente aggiunge un controllo.

Qui si fa diversamente:

- **`PuntiControllo`** descrive *cosa* si controlla: la fase, l'attrezzatura,
  il limite minimo e massimo, l'unita' di misura, la frequenza, l'azione
  correttiva prevista.
- **`Rilevazioni`** contiene *tutte* le misure, di qualunque tipo: punto di
  controllo, data e ora, valore, esito, operatore, foto, note.

Aggiungere un nuovo controllo (per esempio "temperatura vetrina dolci") vuol
dire creare **un record**, non una tabella. La maschera e la stampa
funzionano gia'.

Il prezzo di questa scelta e' che il valore rilevato e' un solo campo numerico:
se un controllo avesse bisogno di tre misure diverse contemporaneamente, non
ci sta. Nell'analisi non ne sono emersi, ma se ne salta fuori uno lo si tratta
come tre punti di controllo distinti.

---

## Fasi di consegna

Con la scadenza stretta si consegna per blocchi funzionanti, non tutto insieme.

**Fase 1 — il minimo che si puo' mettere in mano al cliente:**
`Impresa`, `Reparti`, `Attrezzature`, `Operatori`, `Fornitori`, `Prodotti`,
`Ricevimenti`, `RigheRicevimento`, `Lotti`, `PuntiControllo`, `Rilevazioni`,
`NonConformita`, `PianoSanificazione`, `Sanificazioni`, piu' le stampe dei
registri.

Con questa il locale e' gia' in regola sui registri quotidiani e sul passo
indietro della rintracciabilita'.

**Fase 2 — la rintracciabilita' completa e i registri periodici:**
`Preparazioni`, `Utilizzi`, `Ricette`, `RigheRicetta`, `Allergeni`,
`ProdottiAllergeni`, `Formazione`, `Manutenzioni`, `Disinfestazioni`,
`Analisi`, `Rifiuti`, `Log`.

**Fase 3 — quello che si aggiunge se serve:**
`CampioniPasto`, `Documenti`, cruscotto delle scadenze, avvisi.

**Trasversale, da mettere in fase 1 anche se sembra prematuro:**
`Parametri`, `TipiAttivita`, `ModelliReparto`, `ModelliPuntoControllo`,
`ModelliPianoSanificazione`. Servono perche' la soluzione va rivenduta ad
altri locali: le motivazioni e l'uso stanno in `04-PRODOTTO.md`. Sono poche
ore adesso e un rifacimento se aggiunte dopo.

---

## Convenzioni sui campi

Valgono per **tutte** le tabelle, e non si ripetono negli elenchi sotto.

| Campo | Tipo | Impostazione |
|---|---|---|
| `Id` | testo | chiave primaria, immissione automatica `Get(UUID)`, non modificabile, univoco, obbligatorio |
| `CreatoIl` | data e ora | immissione automatica alla creazione, non modificabile |
| `CreatoDa` | testo | immissione automatica alla creazione, nome account, non modificabile |
| `ModificatoIl` | data e ora | immissione automatica alla modifica, non modificabile |
| `ModificatoDa` | testo | immissione automatica alla modifica, nome account, non modificabile |

Le chiavi esterne si chiamano `Id` piu' il nome della tabella puntata al
singolare: `IdFornitore`, `IdLotto`, `IdPuntoControllo`.

Perche' UUID e non un numero progressivo: i record nascono anche su un
dispositivo mobile, e un progressivo assegnato dal server obbliga a essere
connessi nel momento esatto della creazione. L'UUID no.

---

## Anagrafiche e configurazione

### `Impresa`
Un record solo, ma tabella perche' domani i locali potrebbero essere due.

`RagioneSociale`, `IndirizzoSede`, `PartitaIva`, `CodiceFiscale`,
`NumeroRegistrazioneSanitaria`, `DataScia`, `Osa` (nome del responsabile,
operatore del settore alimentare), `ConsulenteHaccp`, `AslCompetente`,
`Telefono`, `Email`, `Logo` (contenitore),
`ManualeAutocontrollo` (contenitore, il PDF del manuale).

### `Reparti`
`Codice`, `Descrizione`, `Ordine`, `Attivo`.

Esempi: Cucina, Bar, Sala, Magazzino secco, Cella carne, Cella pesce,
Cella latticini, Congelatore, Spogliatoi.

### `Attrezzature`
`IdReparto`, `Codice`, `Descrizione`, `Tipo` (frigorifero / congelatore /
abbattitore / forno / friggitrice / lavastoviglie / vetrina / altro),
`Matricola`, `Marca`, `Modello`, `AnnoInstallazione`,
`TemperaturaMin`, `TemperaturaMax` (limiti nominali dell'apparecchio),
`DataUltimaManutenzione`, `DataProssimaManutenzione`, `Attivo`, `Note`.

Il codice e' quello che il personale usa gia' a voce: "Frigo 1", "Cella 2".

### `Operatori`
`Cognome`, `Nome`, `Mansione`, `AccountFileMaker`, `DataAssunzione`,
`DataCessazione`, `Attivo`, `Telefono`,
`FormazioneScadenza` (calcolato dalla formazione piu' recente),
`Firma` (contenitore, la firma acquisita una volta per il confronto).

`AccountFileMaker` e' il collegamento fra la persona e l'accesso: serve per
riempire automaticamente "chi ha registrato" senza chiederlo.

### `Fornitori`
`RagioneSociale`, `PartitaIva`, `Indirizzo`, `Cap`, `Citta`, `Provincia`,
`Telefono`, `Email`, `Referente`,
`CategorieFornite` (carne / pesce / ortofrutta / latticini / secco / bevande /
detergenti / servizi),
`NumeroRiconoscimentoCe` (per i prodotti di origine animale),
`Qualificato` (si'/no), `DataQualifica`, `DataProssimaVerifica`,
`Documenti` (contenitore: autocertificazioni, schede tecniche, certificati),
`Attivo`, `Note`.

La qualifica del fornitore e' un prerequisito che gli ispettori chiedono e che
quasi nessuno ha in ordine. Averla nel programma e' un argomento di vendita.

### `Prodotti`
Gli articoli che si acquistano, non i piatti del menu.

`Descrizione`, `Codice`, `IdFornitoreAbituale`, `Categoria`,
`UnitaMisura`, `TipoConservazione` (ambiente / refrigerato / congelato),
`TemperaturaMin`, `TemperaturaMax` (limiti di accettazione in ricevimento),
`RichiedeLotto` (si'/no), `RichiedeScadenza` (si'/no),
`GiorniValiditaDopoApertura`, `Gtin` (il codice a barre del prodotto),
`OrigineAnimale` (si'/no), `Attivo`, `Note`.

`TemperaturaMin` e `TemperaturaMax` qui servono al controllo automatico in
ricevimento: si scansiona, si digita la temperatura, il programma dice subito
se accettare o respingere.

### `Allergeni` — fase 2
`Numero` (1-14), `Descrizione`, `Note`.
Tabella fissa, si popola una volta.

### `ProdottiAllergeni` — fase 2
`IdProdotto`, `IdAllergene`, `Presenza` (contiene / puo' contenere tracce).

---

## Rintracciabilita'

### `Ricevimenti` — testata della consegna
`IdFornitore`, `NumeroDdt`, `DataDdt`, `DataOraRicevimento`,
`IdOperatore`, `Trasportatore`, `TargaMezzo`,
`TemperaturaVano` (del vano refrigerato del mezzo),
`PuliziaMezzo` (conforme / non conforme),
`EsitoComplessivo` (accettato / accettato parzialmente / respinto),
`FotoDdt` (contenitore), `Firma` (contenitore), `Note`.

### `RigheRicevimento`
`IdRicevimento`, `IdProdotto`, `Descrizione` (copiata, per storicizzare),
`Quantita`, `UnitaMisura`,
`Lotto`, `DataScadenza`, `TipoScadenza` (scadenza / TMC),
`TemperaturaRilevata`,
`ImballoIntegro` (si'/no), `EtichettaturaConforme` (si'/no),
`Esito` (accettato / respinto / accettato con riserva),
`MotivoRespingimento`,
`FotoEtichetta` (contenitore),
`CodiceScansionato` (la stringa grezza del codice a barre letto),
`Note`.

Il `Lotto` qui e' testo libero perche' e' quello che c'e' scritto sulla
confezione. Il record strutturato nasce dopo, in `Lotti`.

### `Lotti` — il centro del sistema
Un record per ogni lotto entrato o prodotto in casa.

`Codice` (il lotto del fornitore, oppure quello interno che generiamo noi),
`IdProdotto`, `IdFornitore`, `IdRigaRicevimento` (vuoto se lotto interno),
`Origine` (acquistato / prodotto internamente),
`DataIngresso`, `DataScadenza`, `TipoScadenza`,
`QuantitaIniziale`, `QuantitaResidua`, `UnitaMisura`,
`IdAttrezzatura` (dove sta fisicamente), `IdReparto`,
`DataApertura`, `ScadenzaDopoApertura` (calcolata),
`Stato` (in giacenza / esaurito / bloccato / smaltito),
`MotivoBlocco`, `Note`.

`Stato = bloccato` e' quello che si usa in caso di allerta o richiamo: si
blocca il lotto, e da li' si vede subito in quali preparazioni e' finito.

### `Preparazioni` — fase 2
Un piatto o un semilavorato prodotto in cucina.

`Data`, `IdRicetta` (facoltativo), `Descrizione`, `IdOperatore`,
`QuantitaProdotta`, `UnitaMisura`,
`LottoInterno` (generato: per esempio `P-20260905-001`),
`Destinazione` (servizio immediato / abbattimento / congelamento / conserva),
`DataScadenzaInterna`,
`Allergeni` (calcolato dai lotti impiegati), `Note`.

### `Utilizzi` — fase 2, ma decide il modello
`IdLotto`, `IdPreparazione`, `QuantitaImpiegata`, `UnitaMisura`,
`DataOra`, `IdOperatore`.

Tre campi e mezzo, ed e' la tabella che soddisfa il "passo avanti". Va
prevista **fin dal disegno iniziale** anche se si implementa in fase 2:
aggiungerla dopo significa rifare le relazioni.

### `Ricette` e `RigheRicetta` — fase 2
`Ricette`: `Descrizione`, `Categoria`, `Porzioni`, `Procedimento`,
`AllergeniCalcolati`, `Attivo`.
`RigheRicetta`: `IdRicetta`, `IdProdotto`, `Quantita`, `UnitaMisura`.

Servono a due cose pratiche: proporre in automatico i lotti da impiegare
quando si registra una preparazione, e produrre la scheda allergeni del menu.

---

## Monitoraggio

### `PuntiControllo` — la configurazione dell'autocontrollo
`Codice`, `Descrizione`,
`Tipo` (CCP / CP / PRP),
`Fase` (ricevimento / conservazione / cottura / abbattimento / mantenimento /
rigenerazione / bonifica / frittura / sanificazione / altro),
`IdAttrezzatura` (se il controllo riguarda un apparecchio),
`IdReparto`,
`Grandezza` (temperatura / tempo / percentuale / pH / visivo),
`UnitaMisura`,
`LimiteMin`, `LimiteMax`,
`Frequenza` (ad evento / giornaliera / due volte al giorno / settimanale /
mensile / trimestrale / annuale),
`OrarioAtteso1`, `OrarioAtteso2`,
`AzioneCorrettiva` (testo: cosa fare quando il limite e' superato),
`RichiedeFoto` (si'/no), `RichiedeFirma` (si'/no),
`Attivo`, `Ordine`, `Note`.

Un controllo visivo (per esempio "integrita' delle zanzariere") non ha limiti
numerici: `Grandezza = visivo` e l'esito e' conforme / non conforme.

### `Rilevazioni` — il registro unico
`IdPuntoControllo`, `DataOra`, `IdOperatore`,
`Valore` (numero), `ValoreTesto` (per i controlli visivi),
`Esito` (conforme / non conforme), calcolato ma **memorizzato**,
`IdNonConformita` (valorizzato se l'esito e' negativo),
`Foto` (contenitore), `Firma` (contenitore), `Note`,
`Bloccato` (si'/no: dopo il salvataggio non si modifica piu').

L'esito deve essere un campo **memorizzato**, non un calcolo al volo: se
domani si cambia il limite critico in `PuntiControllo`, le rilevazioni gia'
fatte devono continuare a raccontare cosa fu deciso quel giorno. Un calcolo
non memorizzato riscriverebbe la storia, ed e' esattamente cio' che un
registro non deve fare.

### `NonConformita`
`Data`, `Origine` (rilevazione / ricevimento / reclamo / verifica interna /
analisi / ispezione),
`IdRilevazione`, `IdRicevimento`, `IdLotto` (quello che c'entra),
`Descrizione`, `Gravita` (bassa / media / alta),
`AzioneCorrettiva`, `IdOperatoreRilevatore`, `IdResponsabile`,
`DataChiusura`, `EsitoVerifica`, `VerificaEfficacia`,
`Foto` (contenitore), `Note`.

Una non conformita' aperta e non chiusa e' il primo rilievo che fa un
ispettore. Il cruscotto deve mostrarle in evidenza.

---

## Sanificazione

### `PianoSanificazione`
`IdReparto`, `IdAttrezzatura`, `Area` (descrizione del punto da pulire),
`Frequenza`, `Prodotto`, `Dosaggio`, `TempoContatto`, `Modalita`,
`Dpi` (dispositivi di protezione richiesti), `Attivo`, `Ordine`.

### `Sanificazioni`
`IdPianoSanificazione`, `Data`, `IdOperatore`, `Eseguita` (si'/no),
`Esito` (conforme / non conforme), `IdNonConformita`, `Firma`, `Note`.

---

## Registri periodici — fase 2

### `Formazione`
`IdOperatore`, `TipoCorso`, `Ente`, `DataCorso`, `DataScadenza`,
`OreDurata`, `Attestato` (contenitore), `Note`.

### `Manutenzioni`
`IdAttrezzatura`, `Data`, `Tipo` (manutenzione / riparazione / **taratura**),
`Ditta`, `Descrizione`, `Esito`, `DataProssima`,
`Documento` (contenitore), `Costo`, `Note`.

La taratura dei termometri e' un tipo di manutenzione, non una tabella a
parte: e' la stessa cosa, fatta a uno strumento invece che a un frigorifero.

### `Disinfestazioni`
`Data`, `Ditta`, `Tipo` (derattizzazione / disinfestazione / monitoraggio),
`Postazioni` (numero), `EsitiTrappole`, `ProdottiUsati`,
`Rapporto` (contenitore), `Planimetria` (contenitore),
`DataProssima`, `Note`.

### `Analisi`
`Data`, `Tipo` (acqua / tampone superficiale / campione alimento),
`Laboratorio`, `PuntoPrelievo`, `Parametri`, `Esito`,
`RapportoProva` (contenitore), `IdNonConformita`, `Note`.

### `Rifiuti`
`Data`, `Tipo` (olio esausto / sottoprodotti di origine animale / organico /
imballaggi), `Quantita`, `UnitaMisura`, `DittaRitiro`,
`NumeroFormulario`, `Documento` (contenitore).

### `Log` — registro delle modifiche
`Tabella`, `IdRecord`, `Campo`, `ValorePrecedente`, `ValoreNuovo`,
`DataOra`, `Account`, `Dispositivo`.

---

## Configurazione di prodotto

Queste tabelle non contengono dati del locale: contengono il **prodotto**.
Spiegazione estesa in `04-PRODOTTO.md`.

### `Parametri` — chiave/valore
`Chiave`, `Valore`, `Tipo` (testo / numero / si-no / data), `Descrizione`,
`Categoria`, `ModificabileDalCliente`.

Accende e spegne i moduli (bonifica pesce, frittura, campioni pasto, ricette,
catering), contiene le soglie di avviso, la personalizzazione a video e la
chiave `VersioneSchema`.

Chiave/valore e non un campo per opzione: **aggiungere un'opzione deve essere
un record, non una modifica di schema**. Con quindici clienti installati, una
modifica di schema sono quindici migrazioni.

All'avvio uno script ribalta la tabella in variabili globali
(`$$PAR.BonificaPesce` e simili).

### `TipiAttivita`
`Codice`, `Descrizione`, `Note`, `Ordine`, `Attivo`.
Ristorante con cucina, pizzeria, bar, gastronomia con laboratorio, pasticceria,
mensa e catering, agriturismo.

### `ModelliReparto`, `ModelliPuntoControllo`, `ModelliPianoSanificazione`
Stessi campi delle tabelle vive corrispondenti, piu' `IdTipoAttivita`.

Sono la libreria di configurazioni pronte: all'impianto di un locale nuovo
vengono **copiate** nelle tabelle vive, che da quel momento il cliente
modifica per conto suo. In `ModelliPuntoControllo` vive l'analisi HACCP gia'
fatta, che e' il valore che il cliente compra.

### Campi liberi
Su `Prodotti`, `Fornitori`, `Lotti`, `Ricevimenti` e `Rilevazioni`:
`Libero1`, `Libero2`, `Libero3` (testo), con etichetta a video letta dai
`Parametri`.

Servono a dire di si' a una richiesta particolare di un cliente senza aprire
il suo file e biforcare il prodotto.

---

## Relazioni principali

```
Fornitori --< Ricevimenti --< RigheRicevimento --< Lotti
                                                     |
Prodotti  --< RigheRicevimento                       |
Prodotti  --< Lotti                                  |
                                                     v
                                    Lotti --< Utilizzi >-- Preparazioni
                                                                |
                                              Ricette --< RigheRicetta
                                                                |
                                              Ricette ----------+

Reparti   --< Attrezzature --< PuntiControllo --< Rilevazioni
                                                     |
                                                     v
                             Rilevazioni ----> NonConformita <---- Ricevimenti
                                                     ^
                                                     |
                                              Sanificazioni

Operatori --< Rilevazioni, Ricevimenti, Preparazioni, Sanificazioni, Formazione
Attrezzature --< Manutenzioni
```

Nel grafico delle relazioni di FileMaker ogni maschera avra' il proprio gruppo
di occorrenze: vedi `03-CONVENZIONI-FILEMAKER.md`.

---

## Le due decisioni da non sbagliare

1. **`Utilizzi` esiste dal primo giorno.** Anche vuota, anche non ancora
   collegata a una maschera. Senza, il "passo avanti" non c'e' e il progetto
   copre meta' dell'obbligo di legge.
2. **`Esito` in `Rilevazioni` e' memorizzato.** Un registro deve dire cosa fu
   deciso allora, non cosa si deciderebbe oggi.
