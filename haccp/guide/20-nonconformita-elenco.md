# Scheda 20 — `D_NonConformita elenco` (tappa 7, prima)

L'elenco delle non conformita': **le aperte in cima e in rosso**, poi lo
storico. Piu', in apertura, il debito n. 1.

<https://claude.ai/artifact/RsvVpw9yn9GgPvfg2twiUY>

Le fasi sono nell'ordine in cui si costruisce (`CLAUDE.md`, *Uno script si
crea prima dei pulsanti che lo chiamano*): campo, script, formato, colonne,
colore, pulsanti, trigger, collaudo.

I nomi di menu, istruzioni e funzioni sono quelli di
`VOCABOLARIO-FILEMAKER.md`, verificati sulla documentazione Claris italiana.

## Fase 1 — Il debito: tre formati da rinominare

| Formato | Diventa | Lo usa |
|---|---|---|
| `Parametri` | `Z_Parametri` | script `01 - Utilita - Carica parametri` |
| `Operatori` | `Z_Operatori` | script `02 - Utilita - Riconosci operatore` |
| `NonConformita` | `Z_NonConformita` | script `20 - Rilevazioni - Registra` |

`File > Gestisci > Formati`, doppio clic sul formato, si apre
`Impostazione formato`: si cambia il nome in alto, OK.

**Perche'.** Nella cartella `TECNICI` ci sono ventuno formati nati
dall'importazione. Diciotto sono resti; questi tre li attraversa uno script.
Alla consegna, chi fa pulizia deve poterli distinguere a colpo d'occhio: con
`Imposta cattura errori` attivo, uno di questi cancellato fermerebbe lo
script **senza dire niente** — e il `02` e' quello che dice al programma chi
e' entrato.

**Perche' gli script non si rompono.** FileMaker segue i formati per
identificativo interno, non per nome: dopo la rinomina `Vai al formato`
mostra il nome nuovo da solo. Lo si verifica nel collaudo, registrando un
valore fuori limite.

**Perche' `Z_Parametri` e non `Z_PAR Parametri`.** Il prefisso con l'ancora
(`Z_RIL Rilevazioni`) dice su quale occorrenza sta il formato. Questi tre
stanno sull'occorrenza nuda (`Parametri`, non `PAR|Parametri`): scriverci
`PAR` sarebbe dire una cosa falsa.

## Fase 2 — Il campo `Stato`

`File > Gestisci > Database`, tabella **`NonConformita`**, campo nuovo:

| Campo | Tipo | Risultato | Formula |
|---|---|---|---|
| `Stato` | **Calcolo** | **Testo** | `If ( EVuoto ( DataChiusura ) ; "aperta" ; "chiusa" )` |

Memorizzato: in `Opzioni > Archiviazione` **non** deve essere spuntato
*Non memorizzare*. Serve a ordinare.

**Perche' un campo.** Fa due lavori con una formula sola: **ordina** (in
ordine alfabetico `aperta` viene prima di `chiusa`, quindi le aperte vanno in
cima senza altro) e **colora** (la formattazione condizionale della fase 5).

Una non conformita' e' aperta finche' nessuno ha scritto la data di chiusura.
La data la scrivera' la scheda 21, quando il Responsabile la chiude.

## Fase 3 — Lo script `91 - NonConformita - Entra nell'elenco`

E' **lo stesso** del registro, con un altro campo. Il modo piu' rapido e'
duplicarlo e cambiare cinque cose.

`Script > Area di lavoro script`, selezionare
`91 - Rilevazioni - Entra nell'elenco`, `Modifica > Duplica`.

| | Nella copia | Diventa |
|---|---|---|
| 1 | il nome | `91 - NonConformita - Entra nell'elenco` |
| 2 | `If [ $cosa = "nonconformi" ]` | `If [ $cosa = "aperte" ]` |
| 3 | `Imposta campo [ RIL\|Rilevazioni::Esito ; "==non conforme" ]` | `Imposta campo [ NCF\|NonConformita::Stato ; "==aperta" ]` |
| 4 | la finestra *"Nessuna non conformita'"* | titolo `Nessuna non conformita' aperta`, messaggio `Sono tutte chiuse. Mostro l'elenco completo.` |
| 5 | `Ordina i record`, *Specifica ordinamento* | **svuotare** e rifare: `Stato` **crescente**, poi `Data` **decrescente**, tutti e due da `NCF\|NonConformita` |

**Il punto 5 non e' facoltativo.** La copia si porta dietro l'ordinamento su
`RIL|Rilevazioni::Giorno`: girando su un formato di `NCF|NonConformita`
ordinerebbe su un campo che non c'entra, e l'elenco uscirebbe in un ordine
qualsiasi senza nessun messaggio. E' uno dei cinque modi in cui la
duplicazione morde in silenzio.

Alla fine **nessuna riga dello script deve nominare `RIL|`**.

Come deve risultare:

```
Imposta cattura errori [ Attivato ]
Imposta variabile [ $cosa ; Get ( ParametroScript ) ]
Mostra tutti i record
If [ $cosa = "aperte" ]
   Passa al modo Trova [ Pausa: Disattivato ]
   Imposta campo [ NCF|NonConformita::Stato ; "==aperta" ]
   Esegui la ricerca
   If [ Get ( ContoTrovati ) = 0 ]
      Mostra tutti i record
      Mostra finestra personalizzata [ "Nessuna non conformita' aperta" ;
          "Sono tutte chiuse. Mostro l'elenco completo." ]
   End If
End If
Ordina i record [ Ripristina ; Senza finestra di dialogo ]
   Stato   crescente
   Data    decrescente
Vai a Record/Richiesta/Pagina [ Primo ]
```

## Fase 4 — Il formato

`Nuovo formato/resoconto` (barra, in modo Formato scheda):
**Visualizza come lista**, occorrenza **`NCF|NonConformita`**, tema
**`Haccp`**, larghezza **1020**. Nome esatto: **`D_NonConformita elenco`** —
e' il nome che il pulsante del menu passa gia' come parametro.

Tre sezioni, come gli altri elenchi:

| Sezione | Alta |
|---|---|
| Intestazione | 143 |
| Corpo | 30 |
| Pie' di pagina | 38 |

**L'intestazione e il pie' di pagina si copiano**, non si ridisegnano. Da
`D_Attrezzature elenco`, in modo Formato scheda, si selezionano e si copiano:

- il **rettangolo bianco** (x 0, y 110) e la **linea** (x 0, y 101);
- il **titolo** e `<<$$UTENTE.Nome>>`;
- il pulsante **`← Menu`**;
- i quattro testi del pie' di pagina: `Record`, il numero, `Di`, il conteggio.

Si incollano su `D_NonConformita elenco`: FileMaker li rimette **alle stesse
coordinate**. Poi si cambia il testo del titolo in `Non conformita'`.

Copiare il pie' di pagina invece di riscriverlo toglie di mezzo il problema
del contatore: si porta dietro `{{FoundCount}}` gia' giusto.

Il pulsante `← Menu` copiato va bene cosi': il suo parametro e' `"D_Menu"`
per tutti.

## Fase 5 — Le colonne

| Etichetta | X | Largh. | Campo |
|---|---|---|---|
| `Data` | 81 | 100 | `NCF\|NonConformita::Data` |
| `Origine` | 181 | 120 | `NCF\|NonConformita::Origine` |
| `Descrizione` | 301 | 385 | `NCF\|NonConformita::Descrizione` |
| `Gravità` | 686 | 90 | `NCF\|NonConformita::Gravita` |
| `Stato` | 776 | 100 | `NCF\|NonConformita::Stato` |
| `Chiusa il` | 876 | 120 | `NCF\|NonConformita::DataChiusura` |

Etichette a y **114** alte 24, campi a y **144** alti 28, stessa X e
larghezza. L'ultima chiude a **996**.

**A tutti e sei i campi si toglie l'immissione**: l'elenco si legge, si
lavora nella scheda.

La `Descrizione` delle non conformita' nate da una rilevazione e' lunga
(*"Fuori limite: Frigo carni. Valore rilevato 7 °C, limiti ammessi da 0 a
4."*): nell'elenco si vede l'inizio, per intero la mostrera' la scheda.

Il pulsante **`Apri`** di riga si copia da `D_Attrezzature elenco` (x 24,
y 144, 51 x 29) e **si cambia il parametro** in
`"D_NonConformita scheda"`. Copiato si porta dietro
`"D_Attrezzature scheda"`: e' l'altro modo classico in cui la duplicazione
morde. Fino alla scheda 21 rispondera' *"non ancora pronto"*, ed e' giusto.

## Fase 6 — Il colore delle aperte

Sul campo `Stato`: `Formattazione > Condizionale`, `Aggiungi`, condizione
*La formula e' vera*:

```
NCF|NonConformita::Stato = "aperta"
```

**Grassetto**, testo **`#DD0000`**: lo stesso rosso del registro, il solo
del file.

## Fase 7 — I due pulsanti del filtro

Lo script c'e' gia' (fase 3), quindi adesso si possono collegare.

| Pulsante | X | Largh. | Script | Parametro |
|---|---|---|---|---|
| `Tutte` | 109 | 117 | `91 - NonConformita - Entra nell'elenco` | nessuno |
| `Solo aperte` | 230 | 160 | lo stesso | `"aperte"` |

Y **57**, alti **35**. Il parametro **fra virgolette**: e' un calcolo.

## Fase 8 — Il trigger

`Impostazione formato` > scheda **`Script trigger`** > doppio clic su
**`SuEntrataFormato`** > `91 - NonConformita - Entra nell'elenco`, **senza
parametro**.

Il pulsante `Non conformita'` del menu **non si tocca**: punta gia' a
`"D_NonConformita elenco"` dalla tappa 1, e fino ad oggi rispondeva *"non
ancora pronto"*.

## Fase 9 — Collaudo

1. Menu > `Non conformita'`: si apre l'elenco, niente piu' *"non ancora
   pronto"*.
2. Ci sono le non conformita' nate durante i collaudi della tappa 6, **tutte
   aperte**, in rosso, `Chiusa il` vuoto.
3. Ordinate per data, la piu' recente in cima.
4. `Solo aperte`: oggi sono tutte aperte, quindi l'elenco **non cambia** — ed
   e' giusto. Il caso *"Sono tutte chiuse"* si potra' provare solo dopo la
   scheda 21.
5. `Tutte`: tutto l'elenco.
6. Il contatore in fondo segue il filtro.
7. Clic in un campo: il cursore non entra.
8. `Apri` su una riga: *"non ancora pronto"*. Giusto fino alla scheda 21.
9. **La prova del debito:** dal menu `Rilevazioni`, registra un valore
   **fuori limite**. Poi torna su `Non conformita'`: la nuova e' **la prima
   riga**, `Origine` = `rilevazione`. Vuol dire che lo script `20` ha trovato
   `Z_NonConformita` anche col nome nuovo.
10. **La prova del `02`:** esci e rientra. In alto a destra c'e' ancora il tuo
    nome, non il nome dell'account. Vuol dire che lo script `02` ha trovato
    `Z_Operatori`.
11. Come `MRossi` (set `Operatore`): l'elenco si apre e si legge.

Il 9 e il 10 sono quelli che contano: provano che la rinomina non ha rotto
niente, ed e' una cosa che non si vede finche' non la si cerca.

## Poi

Scheda 21, `D_NonConformita scheda`: dove una non conformita' si legge per
intero e **il Responsabile la chiude** — esito della verifica, efficacia, data
e firma. Da li' nasceranno anche quelle a mano: reclamo, ispezione, analisi.
