# Scheda 13 — `D_PuntiControllo` (tappa 3)

Scheda di lavoro con le spunte:
<https://claude.ai/artifact/TwBbUExwCuU8ZT8yf26qP2>

Prerequisito: le altre cinque anagrafiche costruite, la sicurezza chiusa.

L'ultima anagrafica, e l'unica che **il programma legge da solo** mentre
lavora. Diciannove campi, tre riquadri, due campi collegati.

---

## Due decisioni prese in questa scheda

**1. La larghezza di progetto e' `960`**, contenuto che chiude a **936**,
margine 24 a sinistra. `D_PuntiControllo` nasce gia' cosi' e diventa il metro
su cui riportare gli altri dieci formati alla tappa 5.

960 perche' ci sta su un portatile da 1366 punti. `D_Operatori elenco` e'
arrivato a 1248 solo perche' le sette colonne sono larghe il doppio del
necessario.

**2. I 33 punti si caricano a mano, una volta sola.** Sono gia' **dentro il
file**, nella tabella `ModelliPuntoControllo`, importati al montaggio: si
importa da `Haccp.fmp12` a `Haccp.fmp12`, non da un file esterno. Alla tappa
11 li copiera' lo script di impianto.

## Il formato

| Parte | Altezza |
|---|---|
| Intestazione | 100 |
| Corpo | 740 |
| Pie' di pagina | 38 |

| | Rettangolo | Titolo sopra |
|---|---|---|
| Riquadro 1 — `IDENTIFICAZIONE` | x 24, y **16**, largh. 912, alto **194** | y **4** |
| Riquadro 2 — `COSA SI MISURA, E QUANDO` | x 24, y **226**, largh. 912, alto **194** | y **214** |
| Riquadro 3 — `QUANDO IL LIMITE SALTA` | x 24, y **436**, largh. 912, alto **190** | y **424** |
| `Note` | campo x 24, y **664**, largh. 912, alto **60** | y **642** |

Il terzo riquadro ha il bordo di un colore diverso: i primi due dicono *com'e'
fatto* il controllo, il terzo dice **cosa fare quando qualcosa va storto**.

## I diciannove campi

X **44 / 143 / 489 / 588**, passo **40**. Campi di sinistra larghi **330**, di
destra **348**, cosi' la colonna destra **chiude a 936** — misura vincolante.

| Y | Etichetta | Campo | Etichetta | Campo |
|---|---|---|---|---|
| **Riquadro 1** | | | | |
| 42 | Codice | `Codice` | Tipo | `Tipo` — discesa `vl_TipoPuntoControllo` |
| 82 | Descrizione | `Descrizione` | Fase | `Fase` — discesa `vl_FasePuntoControllo` |
| 122 | Reparto | `IdReparto` — **comparsa** `vl_Reparti` | Attrezzatura | `IdAttrezzatura` — **comparsa** `vl_Attrezzature` |
| 162 | Ordine | `Ordine` | Attivo | `Attivo` — discesa `vl_SiNo` |
| **Riquadro 2** | | | | |
| 252 | Grandezza | `Grandezza` — discesa `vl_Grandezza` | Unita mis. | `UnitaMisura` — discesa `vl_UnitaMisuraControllo` |
| 292 | Limite min | `LimiteMin` | Limite max | `LimiteMax` |
| 332 | Frequenza | `Frequenza` — discesa `vl_Frequenza` | — | — |
| 372 | Orario att. 1 | `OrarioAtteso1` | Orario att. 2 | `OrarioAtteso2` |
| **Riquadro 3** | | | | |
| 452 | etichetta `Azione correttiva` a x 44 | | | |
| 474 | campo `AzioneCorrettiva` x 44, largo **872**, alto **86** | | | |
| 562 | Richiede foto | `RichiedeFoto` — discesa `vl_SiNo` | Richiede firma | `RichiedeFirma` — discesa `vl_SiNo` |

**Due comparse e sette discese.** `IdReparto` e `IdAttrezzatura` contengono un
IDUU: con la discesa si vedrebbero trentasei caratteri appena usciti dal
campo. Gli altri sette contengono la parola che si legge.

**`IdAttrezzatura` resta vuoto su due terzi dei punti, ed e' giusto:** si
compila solo quando il controllo e' su una macchina precisa.

**`LimiteMin` e `LimiteMax` restano vuoti sui controlli visivi** — diciassette
su trentatre'. Lo script `20` e' gia' scritto per questo caso.

## L'elenco: sette colonne

| Colonna | X | Largh. | Campo | Ricerca rapida |
|---|---|---|---|---|
| `Apri` | 24 | 51 | gia' li' | — |
| Codice | 85 | 75 | `Codice` | **accesa** |
| Descrizione | 170 | 330 | `Descrizione` | **accesa** |
| Tipo | 510 | 50 | `Tipo` | **accesa** |
| Fase | 570 | 125 | `Fase` | **accesa** |
| Reparto | 705 | 130 | **`PCO\|Reparti::Descrizione`** | spenta |
| Attivo | 845 | 91 | `Attivo` | spenta |

**`Tipo` nella ricerca rapida vale la spunta:** scrivendo `CCP` escono i dodici
punti critici, quelli che un'ispezione guarda per primi.

**Reparto e' un campo collegato e la ricerca rapida ci va spenta.** FileMaker
dovrebbe seguire la relazione record per record. Vale come regola generale:
spenta su tutti i campi collegati.

**La frequenza non va nell'elenco.** L'elenco risponde a *che cosa
controlliamo e dove*; *ogni quanto* si guarda aprendo il punto. Con sette
colonne si chiude esatti a 936.

## Caricare i 33 punti

**I modelli sono gia' nel file.** Si verifica scegliendo il formato tecnico
`ModelliPuntoControllo` nella casella `Formato`: il contatore deve dire 33.

Stando sul formato **`D_PuntiControllo elenco`**: `File › Importa record ›
File...` e si sceglie **`Haccp.fmp12` stesso**. FileMaker chiede da quale
tabella leggere: `ModelliPuntoControllo`. Poi **corrispondenza per nome**, e
quindici campi si accoppiano da soli.

### Perche' due tabelle e non una

`ModelliPuntoControllo` e' l'analisi HACCP di *un ristorante con cucina
qualsiasi*: resta uguale in ogni file venduto. `PuntiControllo` e'
l'autocontrollo di *questo* locale: i suoi reparti, le sue attrezzature, i
suoi limiti. Copiare dai modelli al vivo **e' l'impianto di un cliente
nuovo** — farlo a mano adesso serve anche a capire cosa dovra' fare lo script
della tappa 11.

### Le quattro colonne da non associare

| Colonna | Perche' |
|---|---|
| `CodiceTipoAttivita` | dice a quale **tipo di locale** serve il modello |
| `Reparto` | e' un **codice** (`CUC`), mentre `IdReparto` vuole l'IDUU di questo locale |
| `PerOgniAttrezzaturaTipo` | non e' un dato: e' l'istruzione *moltiplica per ogni apparecchio* |
| `ParametroRichiesto` | in `PuntiControllo` non esiste |

### Le tre cose che l'importazione non puo' fare

- `Attivo` resta vuoto: si riempie con `Sostituisci contenuto campo`, valore `Si`.
- **I reparti a mano**, dalla tendina: 24 su 33 sono `Cucina`, poi cella
  pesce (2), magazzino secco (2), sala (2), locale rifiuti (1) e due che
  dipendono dall'apparecchio. La tabella completa, e i quindici reparti da
  caricare prima, stanno in `14-reparti-dei-punti.md`.
- **Gli otto controlli per attrezzatura si moltiplicano**: abbattitore 3,
  friggitrice 2, frigorifero 1, congelatore 1, vetrina 1 — ma **quante copie
  servono lo dice l'anagrafica delle attrezzature**, non il modello. Due
  abbattitori fanno sei punti. `Ctrl+D` duplica, e il `Codice` va cambiato: e'
  quello che comparira' sul registro accanto a ogni temperatura.

**Prima di importare, una copia del file.** Un'importazione con le colonne
associate male non si annulla.

## Collaudo

Quindici prove nella pagina. Le due che contano:

- **10.9** — i limiti vanno confrontati **uno per uno con il manuale di
  autocontrollo del locale**. I numeri dei modelli sono valori di riferimento
  tipici di un ristorante con cucina, non il manuale di *questo* ristorante, e
  dove i due divergono **vince il manuale**.
- **10.15** — esci e rientra come operatore: l'elenco si vede, `+ Nuovo` ed
  `Elimina` devono essere rifiutati.

---

## Poi

DDR e verifica, poi la **tappa 4**: `Impresa` e `Parametri`, due schede
piccole che chiudono gli ultimi due pulsanti del menu.
