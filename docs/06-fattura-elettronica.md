# Fattura elettronica

Genera il file XML `FatturaPA` versione 1.2 da un documento in archivio.
`FormatoTrasmissione` FPR12 per i privati, FPA12 per la pubblica
amministrazione.

**Quello che fa e quello che non fa.** Produce il file e ne registra lo
stato. Non lo trasmette: l'invio allo SDI passa da un intermediario oppure
dal portale "Fatture e Corrispettivi", e la scelta del canale e' ancora
aperta (vedere in fondo).

## Due file, e la divisione e' il punto

| File | Cosa fa | Dipendenze |
| --- | --- | --- |
| `FatturaPaXml.twin` | Costruisce l'XML, legge i codici, valida i dati | **nessuna** |
| `FatturaElettronica.twin` | Legge l'archivio, scrive il file, aggiorna lo stato | Access |
| `XmlBuilder.twin` | Indentazione, protezione dei caratteri, accumulo delle righe | nessuna |

E' la stessa divisione del registratore telematico, per la stessa ragione:
`FatturaPaXml` e' un modulo di funzioni pure, quindi ha una suite di test
che gira **senza archivio**. Un generatore di XML che si puo' provare solo
avendo un documento vero in un database vero e' un generatore che non si
prova.

I dati viaggiano in `DatiFatturaElettronica`, che raccoglie quello che in
archivio sta sparso fra `Aziende`, `Soggetti`, `Documenti`,
`DocumentiRighe` e `Scadenze`. I totali non si ricopiano: si passa
l'oggetto `CalcoloDocumento` gia' calcolato, che e' lo stesso che ha
prodotto i numeri stampati sulla fattura di carta.

## Le tre cose su cui lo SDI e' inflessibile

Sono la causa della quasi totalita' degli scarti.

**1. L'ordine degli elementi.** Lo schema XSD e' una *sequenza*, non un
insieme. `DatiBollo` deve stare fra `DatiRitenuta` e
`DatiCassaPrevidenziale`, e se sta altrove il file viene scartato senza
molte spiegazioni. E' il tipo di errore che si introduce aggiungendo un
elemento "in fondo, tanto e' opzionale". Le funzioni di `FatturaPaXml`
seguono l'ordine dello schema dall'alto in basso, e c'e' un test che
verifica le posizioni relative dei blocchi.

**2. I numeri.** Punto come separatore decimale, sempre, qualunque sia la
lingua di Windows. Passano tutti da `Money.FormatInvariant`. Una virgola
decimale e' un errore che non si vede mai in sviluppo e si vede subito in
produzione, su una macchina italiana.

**3. Gli elementi vuoti.** Un elemento opzionale si **omette**. Scriverlo
vuoto (`<Provincia></Provincia>`) fa scartare il file. Per questo
`XmlBuilder.Elemento` salta i valori vuoti e solo `ElementoSempre` scrive
comunque.

## Il confronto dei totali, e perche' c'e'

`FatturaElettronica.Prepara` ricostruisce i totali ripassando le righe dal
motore di calcolo, e poi li **confronta** con quelli salvati sul documento.
Se non coincidono si ferma e dice che il documento va riconfermato.

Sembra pignoleria e non lo e'. Un documento confermato porta in archivio i
totali che sono stati stampati sulla carta e consegnati al cliente. Se un
domani una regola di arrotondamento cambia, ricalcolare in silenzio
produrrebbe un XML con numeri diversi da quelli della fattura di carta: due
documenti fiscali diversi con lo stesso numero. Meglio fermarsi.

## Il progressivo di invio

Lo SDI rifiuta un file con un progressivo gia' visto, **anche se il
contenuto e' diverso**. Quindi il progressivo passa dallo stesso schema del
`Numeratore`: un `UPDATE` che legge e scrive insieme, dentro una
transazione, cosi' due postazioni che generano nello stesso momento non
prendono lo stesso numero.

Si chiede solo quando il file si scrive davvero, non quando si apre la
maschera: un progressivo chiesto e abbandonato e' un buco.

Il nome del file e' `<IdPaese><IdCodice>_<Progressivo>.xml`, per esempio
`IT01234567890_00042.xml`.

## La codifica

L'XML dichiara UTF-8, quindi va scritto in UTF-8. `FatturaElettronica`
converte a mano, con tre rami e nessuna dipendenza: una ragione sociale con
una lettera accentata, scritta nella tabella codici della postazione dentro
un file che si dichiara UTF-8, basta a far scartare la fattura.

## Scelte di contenuto

**Le spese diventano righe.** Trasporto, incasso e imballo escono come
`DettaglioLinee`, non come `SpeseAccessorie` del riepilogo. Cosi' la somma
dei `PrezzoTotale` torna con l'`ImponibileImporto`, che e' il controllo piu'
facile da fare a mano quando qualcosa non quadra.

**La cassa previdenziale no.** Quella ha il suo blocco
`DatiCassaPrevidenziale` e non va *anche* in riga, altrimenti conta due
volte. L'imponibile del riepilogo la comprende, ed e' corretto cosi'.

**Gli sconti si dichiarano.** Il `PrezzoUnitario` resta quello di listino e
lo sconto esce come `ScontoMaggiorazione`: il cliente vede su che prezzo si
e' partiti.

**Nei documenti a prezzi di scaffale** l'XML porta comunque il netto: il
prezzo unitario viene scorporato e scritto con otto decimali, cosi' il
prodotto per la quantita' resta vicino al `PrezzoTotale`.

**`ImportoTotaleDocumento`** e' comprensivo di imposta e di bollo
addebitato, e **non** al netto della ritenuta: la ritenuta si legge nel suo
blocco, e quanto il cliente deve versare si ricava dalle scadenze.

## Un esempio completo

Cento bulloni scontati del dieci per cento, quattro ore di manodopera,
spese di incasso, pagamento a trenta giorni fine mese. E' quello che
stampa `App.Main`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica versione="FPR12" xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente>
        <IdPaese>IT</IdPaese>
        <IdCodice>01234567890</IdCodice>
      </IdTrasmittente>
      <ProgressivoInvio>00042</ProgressivoInvio>
      <FormatoTrasmissione>FPR12</FormatoTrasmissione>
      <CodiceDestinatario>ABC1234</CodiceDestinatario>
    </DatiTrasmissione>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>01234567890</IdCodice>
        </IdFiscaleIVA>
        <Anagrafica>
          <Denominazione>Ferramenta Rossi Srl</Denominazione>
        </Anagrafica>
        <RegimeFiscale>RF01</RegimeFiscale>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>Via Roma</Indirizzo>
        <NumeroCivico>10</NumeroCivico>
        <CAP>20100</CAP>
        <Comune>Milano</Comune>
        <Provincia>MI</Provincia>
        <Nazione>IT</Nazione>
      </Sede>
    </CedentePrestatore>
    <CessionarioCommittente>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>09876543210</IdCodice>
        </IdFiscaleIVA>
        <CodiceFiscale>09876543210</CodiceFiscale>
        <Anagrafica>
          <Denominazione>Bianchi Costruzioni Spa</Denominazione>
        </Anagrafica>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>Via Verdi</Indirizzo>
        <NumeroCivico>5</NumeroCivico>
        <CAP>00100</CAP>
        <Comune>Roma</Comune>
        <Provincia>RM</Provincia>
        <Nazione>IT</Nazione>
      </Sede>
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>TD01</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>2026-03-18</Data>
        <Numero>123/A</Numero>
        <ImportoTotaleDocumento>223.87</ImportoTotaleDocumento>
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <DatiBeniServizi>
      <DettaglioLinee>
        <NumeroLinea>1</NumeroLinea>
        <CodiceArticolo>
          <CodiceTipo>INTERNO</CodiceTipo>
          <CodiceValore>BULL-640</CodiceValore>
        </CodiceArticolo>
        <Descrizione>Bulloni 6x40 zincati</Descrizione>
        <Quantita>100.00</Quantita>
        <UnitaMisura>NR</UnitaMisura>
        <PrezzoUnitario>0.45</PrezzoUnitario>
        <ScontoMaggiorazione>
          <Tipo>SC</Tipo>
          <Percentuale>10.00</Percentuale>
        </ScontoMaggiorazione>
        <PrezzoTotale>40.50</PrezzoTotale>
        <AliquotaIVA>22.00</AliquotaIVA>
      </DettaglioLinee>
      <DettaglioLinee>
        <NumeroLinea>2</NumeroLinea>
        <CodiceArticolo>
          <CodiceTipo>INTERNO</CodiceTipo>
          <CodiceValore>MANO-OPE</CodiceValore>
        </CodiceArticolo>
        <Descrizione>Manodopera di posa</Descrizione>
        <Quantita>4.00</Quantita>
        <UnitaMisura>ORE</UnitaMisura>
        <PrezzoUnitario>35.00</PrezzoUnitario>
        <PrezzoTotale>140.00</PrezzoTotale>
        <AliquotaIVA>22.00</AliquotaIVA>
      </DettaglioLinee>
      <DettaglioLinee>
        <NumeroLinea>3</NumeroLinea>
        <Descrizione>Spese di incasso</Descrizione>
        <Quantita>1.00</Quantita>
        <UnitaMisura>NR</UnitaMisura>
        <PrezzoUnitario>3.00</PrezzoUnitario>
        <PrezzoTotale>3.00</PrezzoTotale>
        <AliquotaIVA>22.00</AliquotaIVA>
      </DettaglioLinee>
      <DatiRiepilogo>
        <AliquotaIVA>22.00</AliquotaIVA>
        <ImponibileImporto>183.50</ImponibileImporto>
        <Imposta>40.37</Imposta>
        <EsigibilitaIVA>I</EsigibilitaIVA>
      </DatiRiepilogo>
    </DatiBeniServizi>
    <DatiPagamento>
      <CondizioniPagamento>TP02</CondizioniPagamento>
      <DettaglioPagamento>
        <ModalitaPagamento>MP05</ModalitaPagamento>
        <DataScadenzaPagamento>2026-04-30</DataScadenzaPagamento>
        <ImportoPagamento>223.87</ImportoPagamento>
        <IBAN>IT60X0542811101000000123456</IBAN>
      </DettaglioPagamento>
    </DatiPagamento>
  </FatturaElettronicaBody>
</p:FatturaElettronica>
```

## Validazione

`FatturaPaXml.Validazione` restituisce l'elenco dei problemi e comprende i
rilievi del motore di calcolo: una fattura che non sta in piedi sulla carta
non sta in piedi nemmeno in XML. Controlla il regime fiscale del cedente,
il CAP di cinque cifre, l'identificazione del cliente, il codice
destinatario o la PEC, il tipo di ritenuta quando c'e' una ritenuta, la
quadratura delle scadenze col totale da pagare.

**Non sostituisce la validazione contro lo schema XSD.** Controlla quello
che dipende dai dati, non quello che dipende dalla forma. Prima della prima
trasmissione vera il file va validato contro lo schema ufficiale e provato
sul canale di prova dell'Agenzia delle Entrate. Un generatore scritto senza
aver mai visto una ricevuta dello SDI non e' un generatore collaudato, e
questo non lo e' ancora.

## Lo stato del documento

`Documenti.StatoFE` segue il ciclo: vuoto, `generata`, `inviata`,
`consegnata` oppure `scartata`. `NomeFileFE` e `ProgressivoFE` conservano
le coordinate del file trasmesso.

La tabella `LogFE` tiene l'XML prodotto e il messaggio di ogni operazione.
Serve quando una fattura viene scartata: si guarda il file che e' stato
mandato, invece di rigenerarlo e sperare che sia lo stesso.

## Quello che resta da fare

* **Il canale di trasmissione.** Tramite intermediario (Aruba, il
  commercialista) e' la strada normale: il gestionale deposita l'XML in una
  cartella condivisa, impostata nel parametro
  `CartellaFatturaElettronica`. L'invio diretto allo SDI richiede
  accreditamento e firma digitale, e vale la pena solo se l'accreditamento
  c'e' gia'.
* **Validazione contro l'XSD** prima dell'invio, e gestione delle
  notifiche di esito.
* **Il bollo addebitato.** Oggi esce in `DatiBollo`. Quando viene
  addebitato al cliente andrebbe anche come riga con natura `N1`: va
  deciso nel motore di calcolo, che oggi tiene il bollo fuori dal
  riepilogo.
* **La fattura da scontrino**, che per un negozio e' il caso piu'
  frequente: il cliente che chiede la fattura dopo aver pagato in cassa.
  La tabella `Documenti` ha gia' `IdVenditaOrigine` per il collegamento.
* **Le autofatture e il reverse charge** (TD16 e seguenti), per il ciclo
  passivo.

## Fonti

* [Agenzia delle Entrate - fatturazione elettronica, documentazione e schemi](https://www.agenziaentrate.gov.it/portale/web/guest/schede/comunicazioni/fatture-e-corrispettivi/sistema-di-interscambio-sdi)
* [Specifiche tecniche e schema XSD della FatturaPA](https://www.fatturapa.gov.it/it/norme-e-regole/documentazione-fattura-elettronica/)
