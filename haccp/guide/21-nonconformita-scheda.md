# Scheda 21 — `D_NonConformita scheda` (tappa 7, seconda)

Dove una non conformita' si legge per intero e **il Responsabile la chiude**.

<https://claude.ai/artifact/KUKhCxVnhfHBESUYo3i2Nf>

Nomi di menu, istruzioni e funzioni da `VOCABOLARIO-FILEMAKER.md`.

## Cosa cambia rispetto alle maschere fatte finora

**Tre persone, tre cose diverse sulla stessa scheda.**

| Account | Set | Sulla scheda |
|---|---|---|
| `Admin` | Accesso completo | tutto, sempre |
| `MRossi` | `Responsabile` | scrive e **chiude**; una chiusa **non la tocca piu'** |
| `P_Pippo` | `Operatore` | **legge**: non scrive, non crea, non chiude |

Finora le maschere erano uguali per tutti, o cambiavano con
*Nascondi oggetto se*. Qui serve qualcosa di piu' solido, perche' una non
conformita' chiusa e' un atto del registro: per questo si usano i **permessi
per tabella** del set di privilegi, gli stessi della tappa 2, e un'opzione
nuova sugli script: **Garantisci privilegi di accesso completo**.

### Perche' lo script `20` deve avere l'accesso completo

Lo script `20` crea la non conformita' quando l'operatore registra un fuori
limite, e lo fa **con i permessi di chi lo lancia**. Se all'Operatore si
toglie la creazione sulle non conformita' — ed e' giusto toglierla, la scheda
21 non e' roba sua — lo script `20` smetterebbe di crearle. Con
`Imposta cattura errori` attivo, **senza dire niente**: il fuori limite verrebbe
registrato e la non conformita' no.

Con **Garantisci privilegi di accesso completo** lo script gira con tutti i
permessi qualunque sia l'account. E' la soluzione che la documentazione
Claris indica per questo caso: *"e' possibile ignorare i privilegi per gli
script garantendo privilegi di accesso completo allo script nell'Area di
lavoro script"*.

Lo stesso vale per lo script `30` che chiude: deve poter scrivere la data di
chiusura anche nell'istante in cui il permesso del Responsabile la sta
bloccando.

**`Get ( NomeSetPrivilegiAccount )` dice comunque la verita'**: anche dentro
uno script con accesso completo restituisce il set dell'account vero
(`Operatore`, `Responsabile`). E' per questo che lo script `30` puo' fidarsi
del suo primo controllo.

## Fase 1 — Due ritocchi sull'elenco

Dal collaudo 020, su `D_NonConformita elenco`:

1. l'etichetta sopra `Gravita` dice `DATA`: scriverla **`GRAVITÀ`**, x **686**,
   larga **90**;
2. il rosso della formattazione condizionale su `Stato` e' `#FF2712`:
   portarlo a **`#DD0000`** (`Formattazione > Condizionale`).

## Fase 2 — Una lista e due convalide

`File > Gestisci > Liste valori`, nuova lista **`vl_EsitoVerifica`**, valori
personalizzati:

```
efficace
non efficace
```

`File > Gestisci > Database`, tabella `NonConformita`, campi **`Data`** e
**`Descrizione`**: `Opzioni > Verifica` > **Non vuoto**, *Solo durante
l'immissione dei dati*, e **togliere** la spunta a *Consenti all'utente di
ignorare*.

Qui si puo' essere severi, a differenza delle rilevazioni (scheda 17), perche'
questa maschera **ha il Corpo** e i campi si vedono: FileMaker puo' mostrare
quale manca. Senza queste due, `Nuova` premuto per sbaglio lascerebbe nel
registro una non conformita' vuota, rossa, aperta per sempre — e nessuno la
potrebbe cancellare, perche' una registrazione non si cancella.

Lo script `20` non ne soffre: riempie `Data` e `Descrizione` prima di
salvare, e *Solo durante l'immissione dei dati* non si applica agli script.

## Fase 3 — Lo script `30 - NonConformita - Chiudi`

Numero nuovo: `10` ricevimento, `20` rilevazioni, **`30` non conformita'**.

```
Imposta cattura errori [ Attivato ]
Salva record/richieste [ Con finestra di dialogo: Disattivato ]

# 1 - chi puo' chiudere
If [ Get ( NomeSetPrivilegiAccount ) = "Operatore" ]
   Mostra finestra personalizz. [ "Non autorizzato" ;
       "Una non conformita' la chiude il responsabile." ]
   Esci dallo script [ "" ]
End If

# 2 - gia' chiusa
If [ NOT EVuoto ( NCF|NonConformita::DataChiusura ) ]
   Mostra finestra personalizz. [ "Gia' chiusa" ;
       "Questa non conformita' e' chiusa dal " & NCF|NonConformita::DataChiusura & "." ]
   Esci dallo script [ "" ]
End If

# 3 - cosa manca, tutto in una volta
Imposta variabile [ $manca ; "" ]
If [ EVuoto ( NCF|NonConformita::Data ) ]
   Imposta variabile [ $manca ; $manca & "¶- la data" ]
End If
If [ EVuoto ( NCF|NonConformita::Descrizione ) ]
   Imposta variabile [ $manca ; $manca & "¶- la descrizione" ]
End If
If [ EVuoto ( NCF|NonConformita::AzioneCorrettiva ) ]
   Imposta variabile [ $manca ; $manca & "¶- l'azione correttiva" ]
End If
If [ EVuoto ( NCF|NonConformita::VerificaEfficacia ) ]
   Imposta variabile [ $manca ; $manca & "¶- come hai verificato che il problema e' risolto" ]
End If
If [ EVuoto ( NCF|NonConformita::EsitoVerifica ) ]
   Imposta variabile [ $manca ; $manca & "¶- l'esito della verifica" ]
End If
If [ NOT EVuoto ( $manca ) ]
   Mostra finestra personalizz. [ "Non si puo' ancora chiudere" ; "Manca:" & $manca ]
   Esci dallo script [ "" ]
End If

# 4 - non efficace: resta aperta
If [ NCF|NonConformita::EsitoVerifica = "non efficace" ]
   Mostra finestra personalizz. [ "Resta aperta" ;
       "Se l'azione non e' stata efficace la non conformita' non si chiude. Scrivi un'altra azione correttiva, verificala, e riprova." ]
   Esci dallo script [ "" ]
End If

# 5 - conferma
Mostra finestra personalizz. [ "Chiudere la non conformita'?" ;
    "Dopo la chiusura non si modifica piu'." ; pulsanti: "Chiudi" , "Annulla" ]
If [ Get ( SceltaUltimoMessaggio ) <> 1 ]
   Esci dallo script [ "" ]
End If

# 6 - chiudi
Imposta campo [ NCF|NonConformita::DataChiusura ; Get ( DataCorrente ) ]
Imposta campo [ NCF|NonConformita::IdResponsabile ; $$UTENTE.Id ]
Salva record/richieste [ Con finestra di dialogo: Disattivato ]
Mostra finestra personalizz. [ "Chiusa" ;
    "Non conformita' chiusa il " & Get ( DataCorrente ) & "." ]
```

**I controlli del punto 3 dicono tutto quello che manca in una volta sola**,
non uno per volta: e' la regola del progetto per le convalide.

Poi, nell'Area di lavoro script, **tasto destro sullo script >
`Garantisci privilegi di accesso completo`**.

## Fase 4 — Lo script `20` con l'accesso completo

Stessa cosa sullo script `20 - Rilevazioni - Registra`: tasto destro >
`Garantisci privilegi di accesso completo`. **Prima** della fase 5.

## Fase 5 — I permessi

`File > Gestisci > Sicurezza`, poi `Avanzate...`, scheda `Set di privilegi`.

**`Operatore`** > Modifica > `Record` > *Privilegi personalizzati*, riga
**`NonConformita`**:

| Visualizza | Modifica | Crea | Elimina |
|---|---|---|---|
| Si' | **No** | **No** | No |

**`Responsabile`** > Modifica > `Record`: oggi e' *Crea, modifica ed elimina
in tutte le tabelle*. Si passa a **Privilegi personalizzati**: le altre
tabelle restano **Si'** su tutte e quattro le colonne (controllarlo), e sulla
riga **`NonConformita`**:

| Visualizza | Modifica | Crea | Elimina |
|---|---|---|---|
| Si' | **Limitati** | Si' | **No** |

con la formula di *Limitati*:

```
EVuoto ( NonConformita::DataChiusura )
```

Se FileMaker propone un altro prefisso davanti a `DataChiusura`, va bene il
suo: conta il campo.

**Che cosa vuol dire.** Il Responsabile modifica una non conformita'
**finche' e' aperta**. Chiusa, la formula diventa falsa e FileMaker rifiuta
ogni modifica. E' il blocco del registro, per le non conformita': per le
rilevazioni arrivera' alla tappa 11, con lo stesso meccanismo.

`Admin` resta libero: e' il consulente, e deve poter correggere un errore.

## Fase 6 — Il formato

`Nuovo formato/resoconto`: **Visualizza come modulo**, occorrenza
`NCF|NonConformita`, tema `Haccp`, larghezza 1020. Nome esatto:
**`D_NonConformita scheda`** — e' quello che il pulsante `Apri` dell'elenco
chiama gia'.

Sezioni identiche a `D_PuntiControllo scheda`: Intestazione **100**, Corpo
**873**, Pie' di pagina **38**. Cosi' quello che si copia da li' cade al suo
posto.

Da `D_PuntiControllo scheda` si copiano: titolo, `<<$$UTENTE.Nome>>`, i
pulsanti **`Elenco`, `Nuovo`, `Salva`, `Annulla Modifiche`**, e i quattro
testi del pie' di pagina. **Non `Elimina`**: una registrazione non si
cancella. Titolo: `NON CONFORMITÀ`.

## Fase 7 — Le tre cornici

Il corpo e' **bianco**: un rettangolo bianco non stacca niente, quello che
raggruppa e' il **bordo**. La cornice giusta c'e' gia' su
`D_PuntiControllo scheda`: rettangolo con angoli a 5 pt (bordo e riempimento
dal tema) e titolo **sulla linea**, cioe' un testo alto 23 messo 12 sopra il
bordo, con fondo bianco che interrompe la linea sotto la scritta. Si copia
quella: su `D_PuntiControllo scheda` si selezionano la cornice di
`IDENTIFICAZIONE` e il suo titolo, Ctrl+C, e sulla scheda nuova Ctrl+V tre
volte. **Prima le cornici, poi i campi**, cosi' le cornici restano sotto.

Tutte e tre x **14**, larghe **982** (chiudono a 996), titolo a x 28.

Colonna sinistra: etichette x 28 larghe 131 allineate a destra, campi da
x **167**. Colonna destra: etichette che finiscono a 610, campi da x **621**
larghi 348. **Tutto chiude a 969.**

### `COSA È SUCCESSO` — cornice y 116, alta 232; titolo y 104

| Y | Etichetta | Campo | X | Largh. | Alt. | Controllo |
|---|---|---|---|---|---|---|
| 142 | Data | `Data` | 167 | 292 | 32 | **Calendario a discesa** |
| 142 | Origine | `Origine` | 621 | 348 | 32 | **Elenco a discesa** `vl_OrigineNonConformita` |
| 182 | Gravità | `Gravita` | 167 | 292 | 32 | **Elenco a discesa** `vl_Gravita` |
| 182 | Rilevata da | `IdOperatoreRilevatore` | 621 | 348 | 32 | **Menu a comparsa** `vl_Operatori` |
| 222 | Descrizione | `Descrizione` | 167 | 802 | 100 | Casella modifica |

### `COSA SI È FATTO` — cornice y 376, alta 130; titolo y 364

| Y | Etichetta | Campo | X | Largh. | Alt. |
|---|---|---|---|---|---|
| 402 | Azione correttiva | `AzioneCorrettiva` | 167 | 802 | 80 |

### `CHIUSURA` — cornice y 534, alta 216; titolo y 522

| Y | Etichetta | Campo | X | Largh. | Alt. | Controllo |
|---|---|---|---|---|---|---|
| 560 | Verifica | `VerificaEfficacia` | 167 | 802 | 80 | Casella modifica |
| 654 | Esito | `EsitoVerifica` | 167 | 292 | 32 | **Elenco a discesa** `vl_EsitoVerifica` |
| 654 | Stato | `Stato` | 621 | 348 | 32 | **accesso tolto** |
| 694 | Chiusa il | `DataChiusura` | 167 | 292 | 32 | **accesso tolto** |
| 694 | Chiusa da | `NCF\|OperatoreResponsabile::NomeCompleto` | 621 | 348 | 32 | **accesso tolto** |

**Le ultime tre si leggono e basta** (*accesso tolto* = Impostazioni › Dati ›
area Comportamento › **Accesso campo**: togliere la spunta del modo Usa): le
scrive lo script `30`. Chi le
potesse scrivere a mano potrebbe chiudere una non conformita' senza passare
dai controlli.

### Note

Etichetta `Note` x 14, y 778; campo `Note` x 14, y 800, **982** x 110.

## Fase 8 — I pulsanti

| Pulsante | Cosa fa | Nascondi oggetto se |
|---|---|---|
| `Elenco` (copiato) | **cambiare il parametro** in `"D_NonConformita elenco"` | — |
| `Nuova` (il `Nuovo` copiato, rinominato) | `Nuovo record/richiesta`, com'e' | `Get ( NomeSetPrivilegiAccount ) = "Operatore"` |
| `Salva`, `Annulla modifiche` | come sono | — |
| **`Chiudi la non conformità`** — x 756, y 57, 240 x 35 | script `30 - NonConformita - Chiudi` | `Get ( NomeSetPrivilegiAccount ) = "Operatore" OR NOT EVuoto ( NCF\|NonConformita::DataChiusura )` |

Il pulsante `Elenco` copiato si porta dietro `"D_PuntiControllo elenco"`:
e' il solito modo in cui la copia morde.

`Chiudi la non conformità` **sparisce** quando la non conformita' e' chiusa:
cosi' non si preme due volte, e a colpo d'occhio si vede se c'e' ancora
qualcosa da fare.

## Fase 9 — Il rosso

Sul campo `Stato`: la stessa regola dell'elenco,
`NCF|NonConformita::Stato = "aperta"`, grassetto, `#DD0000`.

## Fase 10 — Collaudo

Con **tre account**, in quest'ordine.

**Da `Admin`**

1. Elenco > `Apri` su una riga: si apre la scheda **di quella** non
   conformita'. Niente piu' *"non ancora pronto"*.
2. La `Descrizione` si legge per intera.
3. `Elenco` riporta all'elenco.

**Da `MRossi` (Responsabile)**

4. Apri una non conformita' aperta e premi `Chiudi la non conformità` **senza
   scrivere niente**: un messaggio solo che elenca **tutte** le cose che mancano
   (azione, verifica, esito).
5. Scrivi l'azione e la verifica, scegli **non efficace**, `Chiudi`:
   *"Resta aperta"*.
6. Scegli **efficace**, `Chiudi`, conferma: `Chiusa il` = oggi,
   `Chiusa da` = il tuo nome, `Stato` = `chiusa` non piu' rossa, **il pulsante
   `Chiudi` e' sparito**.
7. Prova a cambiare la `Descrizione` di quella chiusa: **FileMaker rifiuta**.
8. Su un'altra, aperta, premi `Chiudi` e poi `Annulla` nella conferma: resta
   aperta.
9. `Nuova`: scheda vuota. `Salva` subito: FileMaker chiede `Data` e
   `Descrizione` e non salva. Compilale, scegli `Origine` = `reclamo`, salva:
   nell'elenco compare **in cima, rossa**.
10. Elenco > `Solo aperte`: quella chiusa al punto 6 **non c'e'**.

**Da `P_Pippo` (Operatore)**

11. L'elenco si apre. `Apri` su una riga: la scheda si legge, ma **non si
    scrive**, e **non ci sono** ne' `Nuova` ne' `Chiudi`.
12. **La prova che conta:** dal menu `Rilevazioni` registra un valore **fuori
    limite**. Poi vai su `Non conformità`: **la nuova c'e'**, prima riga.
    Vuol dire che lo script `20` crea la non conformita' anche se l'Operatore
    non ha piu' il permesso di crearle: e' l'accesso completo della fase 4.

Se il 12 fallisce, la causa e' quasi certamente la fase 4 non fatta, o fatta
dopo la 5. E' il guasto piu' grave che questa scheda puo' produrre: un fuori
limite registrato senza la sua non conformita'.

## Poi

Con questa la **7a e' chiusa**. Mandami il DDR, e dimmi una cosa che il DDR
non dice: **quanti record ci sono nella tabella `PianoSanificazione`** (dal
formato `PianoSanificazione` nella cartella `TECNICI`, il contatore in alto).
Da quel numero dipende come si progetta la 7b.
