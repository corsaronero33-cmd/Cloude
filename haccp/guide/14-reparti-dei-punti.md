# Scheda 14 — Quale reparto a quale punto di controllo

Tabella completa con le spunte:
<https://claude.ai/artifact/Aoap5JQVJJFMnMNSMU9Kqq>

Appendice della tappa 3. Si usa al passo **9.8** di
`13-punticontrollo.md`.

---

## Prima: i reparti non ci sono

Al 3 ottobre `Reparti` conteneva **2 record di prova**. I reparti veri non
sono mai stati caricati: stanno in `ModelliReparto`, gia' dentro il file dal
montaggio.

**Si caricano tutti e quindici**, non i cinque che servono ai punti di
controllo: il piano di sanificazione, alla tappa 7, ne usa **quattordici**.

| Cod. | Reparto | Punti di controllo | Piano sanificazione |
|---|---|---|---|
| CUC | **Cucina** | 24 | 12 |
| PRE | Zona preparazioni fredde | — | — |
| LAV | Zona lavaggio | — | 1 |
| MAG | **Magazzino secco** | 2 | 1 |
| CEC | Cella carne | — | 1 |
| CEP | **Cella pesce** | 2 | 1 |
| CEL | Cella latticini e gastronomia | — | 1 |
| CEO | Cella ortofrutta | — | 1 |
| CON | Congelatore | — | 1 |
| BAR | Bar | — | 3 |
| SAL | **Sala** | 2 | 1 |
| RIF | **Locale rifiuti** | 1 | 2 |
| SPO | Spogliatoio personale | — | 1 |
| SEP | Servizi igienici personale | — | 1 |
| SEC | Servizi igienici clienti | — | 1 |

Procedura: cancellare i due record di prova, importare da `Haccp.fmp12` →
tabella `ModelliReparto` (senza `CodiceTipoAttivita`), `Attivo = Si`, e
**cancellare subito** quelli che il locale non ha.

**Il passo del cancellare si puo' fare solo adesso.** Finche' nessun record
punta a un reparto, cancellarlo non rompe niente. Fra una settimana quel
reparto sara' citato da venti record, e con il Menu a comparsa quei campi
diventerebbero **vuoti**, senza nessun messaggio.

---

## La tabella

| Codice | Descrizione | Tipo | Reparto |
|---|---|---|---|
| **Ricevimento** | | | |
| RIC-01 | Temperatura merce refrigerata in accettazione | CCP | Cucina |
| RIC-02 | Temperatura merce congelata in accettazione | CCP | Cucina |
| RIC-03 | Integrita imballo, etichettatura, lotto e scadenza | CP | Cucina |
| RIC-04 | Pulizia e idoneita del mezzo di trasporto | PRP | Cucina |
| **Conservazione** | | | |
| CON-01 | Temperatura frigorifero — *per ogni frigorifero* | CCP | **dove sta l'apparecchio** |
| CON-02 | Temperatura cella pesce | CCP | Cella pesce |
| CON-03 | Temperatura congelatore — *per ogni congelatore* | CCP | **dove sta l'apparecchio** |
| CON-04 | Temperatura e stato del magazzino secco | PRP | Magazzino secco |
| CON-05 | Separazione crudo cotto e ordine nelle celle | PRP | Cucina |
| CON-06 | Controllo scadenze e prodotti aperti | CP | Cucina |
| SCO-01 | Scongelamento in frigorifero | CP | Cucina |
| **Lavorazione** | | | |
| COT-01 | Temperatura al cuore in cottura | CCP | Cucina |
| ABB-01 | Temperatura al termine del raffreddamento rapido — *per ogni abbattitore* | CCP | Cucina |
| ABB-02 | Durata del ciclo di raffreddamento rapido — *per ogni abbattitore* | CCP | Cucina |
| ABB-03 | Congelamento in abbattitore — *per ogni abbattitore* | CCP | Cucina |
| MAN-01 | Mantenimento a caldo | CCP | Cucina |
| MAN-02 | Mantenimento a freddo in vetrina — *per ogni vetrina* | CP | Sala |
| RIG-01 | Rigenerazione | CCP | Cucina |
| BON-01 | Bonifica del pesce destinato al consumo crudo | CCP | Cella pesce |
| FRI-01 | Composti polari olio di frittura — *per ogni friggitrice* | CP | Cucina |
| FRI-02 | Sostituzione olio e pulizia friggitrice — *per ogni friggitrice* | PRP | Cucina |
| **Igiene e ambiente** | | | |
| SAN-01 | Verifica visiva dell esito della sanificazione | PRP | Cucina |
| INF-01 | Controllo postazioni e trappole antinfestanti | PRP | Magazzino secco |
| INF-02 | Integrita di zanzariere, chiusure e sifoni | PRP | Cucina |
| **Personale** | | | |
| PER-01 | Igiene e abbigliamento del personale | PRP | Cucina |
| PER-02 | Formazione del personale in corso di validita | PRP | Cucina |
| **Attrezzature** | | | |
| ATT-01 | Taratura dei termometri | PRP | Cucina |
| ATT-02 | Manutenzione programmata attrezzature del freddo | PRP | Cucina |
| **Verifiche** | | | |
| ACQ-01 | Potabilita dell acqua | PRP | Cucina |
| TAM-01 | Tamponi superficiali di verifica | PRP | Cucina |
| CAM-01 | Conservazione dei campioni pasto | PRP | Cucina |
| ALL-01 | Aggiornamento della scheda allergeni del menu | PRP | Sala |
| RIF-01 | Gestione rifiuti e oli esausti | PRP | Locale rifiuti |

## `CON-01` e `CON-03`: il reparto lo decide l'apparecchio

Sono gli unici due senza reparto nei modelli, e sono anche due di quelli da
moltiplicare. Il reparto di ogni copia e' **quello dell'apparecchio**: il frigo
della cucina va su Cucina, quello della cella carne su Cella carne, quello del
bar su Bar.

**Attenzione ai codici:** `CON-02` e `CON-03` sono gia' usati. Moltiplicando
`CON-01` servono codici liberi (`CON-01A`, `CON-01B`...).

**Non metterli tutti su Cucina per fare prima.** Il reparto e' il filtro con
cui si legge il registro: il giorno che serve stampare solo i controlli del
bar, o che un'ispezione chiede la catena del freddo in sala, quel campo o fa
il lavoro o non lo fa.

## Se il locale non ha quel reparto

| Se non c'e' | Punti | Dove vanno |
|---|---|---|
| Cella pesce | `CON-02`, `BON-01` | la cella dove il pesce sta davvero, o Cucina |
| Magazzino secco | `CON-04`, `INF-01` | Cucina, o la dispensa comunque si chiami |
| Sala | `MAN-02`, `ALL-01` | Cucina |
| Locale rifiuti | `RIF-01` | Cucina |

**Un controllo non si toglie perche' manca il locale.** Senza deposito rifiuti
separato, i rifiuti si gestiscono lo stesso e vanno dimostrati. Si sposta di
reparto, non si cancella.

**L'unico caso in cui un punto si disattiva** e' quando l'attivita' non viene
proprio fatta: niente abbattitore → `ABB-01/02/03`; niente friggitrice →
`FRI-01/02`; niente pesce crudo → `BON-01`. E anche allora si mette
`Attivo = No`, non si cancella: il giorno che comprano l'abbattitore basta
rimetterlo a `Si`, con i limiti gia' scritti.
