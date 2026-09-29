# Scheda 10 — Account e permessi

Scheda di lavoro con le spunte:
<https://claude.ai/artifact/U66NL1vifx8HbmCJEVKz73>

Prerequisito: `09-operatori.md` completata — gli account si creano dalla
scheda dell'operatore, quindi quella scheda deve esistere.

E' la piu' delicata del progetto: tocca la sicurezza del file. Va fatta
**nell'ordine**, e la fase 3 contiene **l'unica cosa irreversibile** di tutto
il lavoro.

---

## Prima — cosa comporta nascondere i menu

Alla consegna i menu saranno nascosti a tutti. Da quel momento **quello che
non e' un pulsante su un formato non esiste**. Inventario onesto:

| Serve | Con i menu | Oggi |
|---|---|---|
| Uscire dal programma | `File › Esci` | c'e': `Esci` sul menu |
| Creare una scheda | `Ctrl+N` | c'e': `+ Nuovo` |
| Cancellare | `Record › Elimina` | c'e': `Elimina` |
| Cercare | `Ctrl+F` | c'e': la casella |
| Mostrare tutti | `Ctrl+J` | c'e': `Tutti` |
| **Annullare le modifiche** | `Record › Ripristina` | **manca** |
| **Salvare senza cliccare fuori** | `Record › Conferma` | **manca** |
| **Cambiare la propria password** | `File › Cambia password` | **manca** |

Le tre righe che mancano sono la **fase 7**.

**La password e' quella che fa male.** FileMaker chiede di cambiarla al primo
accesso da solo, e quella finestra compare anche senza menu. Ma **dopo**,
senza un pulsante nostro, una password non si cambia piu' — ne' quando un
dipendente se ne va, ne' quando qualcuno se l'e' fatta vedere.

**Una raccomandazione cambiata.** In una sessione precedente avevo indicato
menu **`Minimo`** per l'operatore. Sbagliato: `Minimo` toglie anche `Annulla`,
`Taglia`, `Copia` e `Incolla`, e un cuoco che sbaglia a digitare una
temperatura non ha modo di tornare indietro. Va usato **`Solo modifica`**:
lascia i comandi di scrittura e toglie tutto il resto — niente Elimina, niente
Trova, niente Gestisci, niente Modifica formato. La sicurezza e' identica,
l'usabilita' no.

---

## Fase 1 — I due set di privilegi

Si fanno **prima** degli account: un account senza set gia' pronto non si puo'
creare.

`File › Gestisci › Sicurezza`, poi `Avanzate...`: si apre la finestra con le
tre schede `Account`, `Set di privilegi`, `Privilegi estesi`.

### Set `Responsabile` — il titolare

| Voce | Cosa scegliere |
|---|---|
| Accesso ai record | Creazione, modifica ed eliminazione in tutte le tabelle |
| Formati | Tutti visualizzabili (non modificabili) |
| Liste valori | Tutte visualizzabili (non modificabili) |
| Script | Tutti eseguibili (non modificabili) |
| Comandi di menu disponibili | **Solo modifica** |
| Stampa / esportazione | spuntate — servono per i registri dell'ispezione |
| Gestione account estesa | Nessuno |

### Set `Operatore` — chi compila

| Voce | Cosa scegliere |
|---|---|
| Accesso ai record | **Personalizzato** — vedi sotto |
| Formati | Tutti visualizzabili |
| Liste valori | Tutte visualizzabili |
| Script | Tutti eseguibili |
| Comandi di menu disponibili | **Solo modifica** |
| Consenti stampa | spuntata |
| Consenti esportazione | **NON** spuntata |
| Gestione account estesa | Nessuno |

### L'accesso ai record dell'operatore, tabella per tabella

| Tabelle | Vis. | Mod. | Crea | Elim. |
|---|---|---|---|---|
| **I registri** — `Rilevazioni`, `Ricevimenti`, `RigheRicevimento`, `Sanificazioni`, `NonConformita`, `Lotti`, `Utilizzi` | si | si | si | **NO** |
| **Anagrafiche e configurazione** — `Reparti`, `Attrezzature`, `PuntiControllo`, `Fornitori`, `Prodotti`, `Operatori`, `Impresa`, `Parametri`, `PianoSanificazione`, i `Modelli*`, `TipiAttivita`, `Allergeni` | si | no | no | no |

**La colonna che conta e' l'ultima.** Un registro HACCP da cui chi compila
puo' cancellare non vale niente davanti a un ispettore: la domanda non e'
"cosa c'e' scritto", e' "cosa potrebbe essere stato tolto". Togliendo
l'eliminazione, una registrazione sbagliata si corregge — e la correzione
resta — ma non sparisce.

**Esportazione spenta sull'operatore, accesa sul responsabile.** Con
l'esportazione accesa chiunque puo' tirarsi fuori tutta l'anagrafica fornitori
in un file. Al responsabile serve per l'ispezione; al cuoco no.

## Fase 2 — I privilegi estesi, la trappola

Scheda `Privilegi estesi`, riga **`fmapp`** (*Accesso tramite rete
FileMaker*): doppio clic, spunta `Responsabile` e `Operatore`.

**Un set di privilegi nuovo nasce senza nessun privilegio esteso.** Se il file
e' ospitato e questa spunta manca, l'utente non riesce ad aprirlo e il
messaggio di errore non dice perche'.

## Fase 3 — Il tuo accesso, e l'apertura automatica

> **Leggi tutta la fase prima di iniziarla.** Qui si mette la password
> all'amministratore. **Claris non recupera un file di cui si e' persa la
> password di accesso completo**: non esiste procedura, non esiste assistenza,
> il file diventa illeggibile per sempre. Scrivi la password dove scrivi le
> cose che non si perdono, **prima** di premere OK.

1. Scheda `Account`: oggi c'e' `Admin`, accesso completo, **nessuna
   password**. E' il default di FileMaker.
2. Scrivi da qualche parte la password che stai per mettere.
3. Doppio clic su `Admin`, metti la password, OK. Lascia il set
   `[Accesso completo]`.
4. **L'apertura automatica.** `File › Opzioni file › scheda Apri`: togli la
   spunta *"Accedi utilizzando: Nome account e password"* con dentro `Admin`.
5. Chiudi e riapri il file: **deve chiederti nome account e password**.

**Il passo 4 e' quello che rende veri tutti gli altri.** Finche' il file si
apre da solo come `Admin`, ogni set di privilegi e' decorazione: chiunque apra
il file e' amministratore. Ed e' anche il motivo per cui, senza questo passo,
il collaudo della fase 8 non puo' funzionare.

## Fase 4 — I campi nuovi su `Operatori`

| Campo | Tipo | Archiviazione |
|---|---|---|
| `Ruolo` | Testo | normale |
| `gNomeAccount` | Testo | **globale** |
| `gPassword` | Testo | **globale** |

Lista valori `vl_Ruoli`, valori personalizzati, due righe: `Operatore` e
`Responsabile`.

**`Ruolo` non e' `Mansione`.** `Mansione` dice **che lavoro fa** la persona —
Cuoco, Aiuto cucina, Lavapiatti — ed e' testo libero. `Ruolo` dice **cosa puo'
fare nel programma**, ha due soli valori e deve corrispondere **lettera per
lettera** al nome del set di privilegi. Tenerli in due campi significa che il
giorno in cui un aiuto cucina diventa responsabile HACCP si cambia una
tendina, non si riscrive niente.

**I due campi globali non finiscono mai in un record.** Servono solo a far
parlare la finestra di dialogo con lo script, e la password ci resta dentro
per qualche secondo: lo script la cancella appena ha finito.

## Fase 5 — Lo script `94 - Operatori - Crea account`

**Il numero `94` e' nuovo** perche' fa una cosa che non esiste su nessun'altra
tabella. Sta nella decina delle utilita' di formato, con il `90`, il `92` e il
`93`.

```
# === 94 - OPERATORI - CREA ACCOUNT ===
# Crea l'account FileMaker dell'operatore corrente e lo scrive in
# AccountFileMaker. Nelle proprieta' dello script deve essere spuntato
# "Esegui script con privilegi di accesso completo".
# Chiamato dal pulsante "Crea account" di D_Operatori scheda.

Imposta acquisizione errori [ Attivato ]

# --- 1. si controlla prima di toccare la sicurezza ---
Se [ IsEmpty ( OPE|Operatori::Cognome ) or IsEmpty ( OPE|Operatori::Nome ) ]
    Mostra finestra di dialogo personalizzata
        [ "Manca il nome" ; "Compila cognome e nome prima di creare l'account." ]
    Esci dallo script [ ]
Fine se
Se [ IsEmpty ( OPE|Operatori::Ruolo ) ]
    Mostra finestra di dialogo personalizzata
        [ "Manca il ruolo" ; "Scegli se questa persona e' Operatore o Responsabile." ]
    Esci dallo script [ ]
Fine se
Se [ not IsEmpty ( OPE|Operatori::AccountFileMaker ) ]
    Mostra finestra di dialogo personalizzata
        [ "Account gia' collegato" ;
          "Questa persona usa gia' l'account " & OPE|Operatori::AccountFileMaker & "." ]
    Esci dallo script [ ]
Fine se

# --- 2. si propone un nome e si chiede conferma ---
Imposta campo [ OPE|Operatori::gNomeAccount ;
    Lower ( Left ( OPE|Operatori::Nome ; 1 ) & OPE|Operatori::Cognome ) ]
Imposta campo [ OPE|Operatori::gPassword ; "" ]
Mostra finestra di dialogo personalizzata
    [ Titolo: "Nuovo account"
      Messaggio: "Account per " & OPE|Operatori::Cognome & " " & OPE|Operatori::Nome &
                 ", ruolo " & OPE|Operatori::Ruolo & "."
      Pulsante 1: "Crea"   Pulsante 2: "Annulla"
      Campo immissione 1: OPE|Operatori::gNomeAccount  etichetta "Nome account"
      Campo immissione 2: OPE|Operatori::gPassword     etichetta "Password iniziale"
          con "Usa carattere password" spuntato ]
Se [ Get ( UltimaSceltaMessaggio ) <> 1 ]
    Esci dallo script [ ]
Fine se
Se [ IsEmpty ( OPE|Operatori::gNomeAccount ) or Length ( OPE|Operatori::gPassword ) < 8 ]
    Mostra finestra di dialogo personalizzata
        [ "Dati insufficienti" ;
          "Serve un nome account e una password di almeno 8 caratteri." ]
    Esci dallo script [ ]
Fine se

# --- 3. si crea l'account. Due rami, e non per pigrizia: vedi la nota. ---
Se [ OPE|Operatori::Ruolo = "Responsabile" ]
    Aggiungi account [ Nome: OPE|Operatori::gNomeAccount ;
                       Password: OPE|Operatori::gPassword ;
                       Set di privilegi: Responsabile ;
                       Scadenza password: Attivata ]
Altrimenti
    Aggiungi account [ Nome: OPE|Operatori::gNomeAccount ;
                       Password: OPE|Operatori::gPassword ;
                       Set di privilegi: Operatore ;
                       Scadenza password: Attivata ]
Fine se
Se [ Get ( UltimoErrore ) <> 0 ]
    Mostra finestra di dialogo personalizzata
        [ "Account non creato" ;
          "FileMaker ha risposto con l'errore " & Get ( UltimoErrore ) &
          ". Quasi sempre vuol dire che un account con quel nome esiste gia'." ]
    Imposta campo [ OPE|Operatori::gPassword ; "" ]
    Esci dallo script [ ]
Fine se

# --- 4. si collega, si salva, si pulisce ---
Imposta campo [ OPE|Operatori::AccountFileMaker ; OPE|Operatori::gNomeAccount ]
Conferma record/richieste [ Senza finestra di dialogo ]
Imposta campo [ OPE|Operatori::gPassword ; "" ]
Imposta campo [ OPE|Operatori::gNomeAccount ; "" ]
Mostra finestra di dialogo personalizzata
    [ "Account creato" ;
      "L'account e' attivo. Alla prima entrata verra' chiesto di cambiare la password." ]
```

**Il passo che lo fa funzionare:** nell'Area di lavoro Script, con lo script
aperto, `Script › Impostazioni script` e spunta **"Esegui script con privilegi
di accesso completo"**. Senza, lo script fallisce anche in mano al titolare:
creare account e' un'operazione riservata.

**I due rami dell'`Aggiungi account` non sono una ripetizione inutile.** Il
set di privilegi in quel passo si sceglie da **una tendina**, non si calcola.
Scrivendo i due rami a mano, lo script **non e' fisicamente in grado** di
creare un account con `[Accesso completo]`: il paletto non e' una convenzione
che qualcuno puo' dimenticare, e' una cosa che non c'e' nel codice. Per questo
lo script si puo' far girare con i privilegi pieni senza che sia un buco.

**Due nomi da verificare nella tua versione.** `Get ( UltimaSceltaMessaggio )`
e `Aggiungi account` sono tradotti, e la traduzione puo' variare. In inglese
sono `Get ( LastMessageChoice )` e `Add Account`, categoria `Account`.

## Fase 6 — I pulsanti sulla scheda operatore

Il corpo passa da **230** a **290** per fargli posto.

| Pulsante | X | Y | L | A | Azione |
|---|---|---|---|---|---|
| `Crea account` | 24 | 226 | 150 | 35 | `94 - Operatori - Crea account` |
| `Reimposta password` | 184 | 226 | 180 | 35 | `95 - Operatori - Reimposta password` |

Tutti e due, `Ispettore › Dati › Nascondi oggetto quando`:

```
Get ( NomeSetPrivilegi ) = "Operatore"
```

Sul solo `Crea account`, la condizione diventa:

```
Get ( NomeSetPrivilegi ) = "Operatore"
or not IsEmpty ( OPE|Operatori::AccountFileMaker )
```

Il campo `Ruolo` va aggiunto alla scheda (controllo **Menu a discesa**, lista
`vl_Ruoli`), e la colonna `Ruolo` all'elenco al posto di `Account FM`.

**Il pulsante nascosto non e' sicurezza, e' pulizia.** Quello che impedisce
davvero a un operatore di creare account e' il **set di privilegi**: la vera
barriera e' la fase 1. Questa fase serve a non mostrare a un cuoco un pulsante
che non deve premere.

## Fase 7 — I tre pulsanti che i menu si portano via

### Sulle schede — tutte e sei

| Pulsante | Azione | Perche' |
|---|---|---|
| `Salva` | `Conferma record/richieste`, senza finestra | FileMaker salva da solo cliccando fuori, ma chi non e' pratico non lo sa e resta col dubbio |
| `Annulla modifiche` | `Ripristina record/richiesta`, con la finestra | e' l'unico modo di tornare indietro su una scheda gia' pasticciata |

Si aggiungono nell'intestazione, a destra di `Elimina`: `Salva` a x **390**,
`Annulla modifiche` a x **512**, y 57, alti 35. Si collaudano sulla scheda
degli operatori, poi si copiano sulle altre cinque.

### Sul menu — per tutti

`Cambia password` su `D_Menu`, azione `Esegui passo script › Cambia password`
con la finestra di dialogo, alla sinistra di `Esci`, che deve continuare a
chiudere a **936**. Nessuna condizione di nascondimento: serve a tutti.

**Senza questo pulsante le password del locale non si cambiano piu'.** E' il
motivo per cui, il giorno che un dipendente se ne va litigando, il titolare
non ha modo di chiudergli l'accesso da solo.

## Fase 8 — Collaudo

Il collaudo vero si fa **uscendo dal file e rientrando come un altro**: e'
l'unico modo di vedere quello che vedra' il cliente.

1. Su un operatore di prova, `Ruolo` = `Operatore`, premi `Crea account`.
2. La finestra propone un nome tipo `mrossi`. Password di almeno otto
   caratteri, conferma.
3. Compare "Account creato", e `Account FM` **si e' riempito da solo**.
4. Ripremi `Crea account` sullo stesso record: il pulsante non c'e' piu'.
5. In `Gestisci › Sicurezza` l'account c'e', con il set `Operatore`.
6. **Chiudi e riapri il file**, entrando con l'account nuovo: FileMaker deve
   chiedere subito di cambiare la password.
7. La barra dei menu e' **ridotta**: niente Record, Formati, Strumenti.
8. Su `Reparti`, `Elimina` deve essere **rifiutato**.
9. Modificare la descrizione di un reparto: **non deve essere possibile**.
10. Sulla scheda operatore, `Crea account` e `Reimposta password` non si
    vedono.
11. In testata compare **il nome della persona**: lo script `02` ha trovato il
    record.
12. `Cambia password` dal menu: si apre la finestra di FileMaker e funziona.
13. `Esci` chiude il programma. Rientra con l'accesso completo.

**La 8.8 e la 8.9 valgono il lavoro.** Se l'operatore riesce a cancellare un
reparto o a cambiare un limite critico, i permessi non sono impostati: torna
alla tabella della fase 1.

**La 8.6 non funziona se hai saltato la fase 3, passo 4.** Con l'apertura
automatica attiva il file si riapre sempre come `Admin`.

---

## Quello che resta fuori, di proposito

| Cosa | Quando |
|---|---|
| **Il blocco della registrazione dopo il salvataggio.** Nei parametri c'e' gia' `BloccaRilevazioneDopoSalvataggio=Si`, che oggi non legge nessuno. Si realizza con l'accesso ai record limitato da calcolo su `Rilevazioni` | **alla consegna**, non adesso: mentre costruisci ti bloccherebbe le prove e non sapresti se e' un guasto o il permesso |
| Lo script `95 - Operatori - Reimposta password`, gemello del `94` con `Reimposta password account` al posto di `Aggiungi account` e senza i due rami | quando il `94` e' collaudato: si duplica e si cambia un passo |

Il calcolo per il blocco, gia' pronto:

```
Rilevazioni::CreatoDa = Get ( NomeAccount )
and GetAsDate ( Rilevazioni::CreatoIl ) = Get ( DataCorrente )
```

---

## Poi

Resta **Punti di controllo**, l'ultima anagrafica — e adesso si costruisce
gia' sapendo **cosa l'operatore potra' premere e cosa no**.
