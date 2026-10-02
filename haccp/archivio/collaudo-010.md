# Collaudo 010 — `HACCP_Revisione_8.xml`

Scheda di lavoro con le correzioni:
<https://claude.ai/artifact/Aef6CEKgMCueGZ2TAz863g>

**Primo export che contiene la sicurezza e il corpo degli script.** I
precedenti portavano solo la struttura. Qui ci sono `AccountsCatalog`,
`PrivilegeSetsCatalog`, `ExtendedPrivilegesCatalog` e `StepsForScripts`: la
sicurezza e gli script si leggono riga per riga invece di dedurli dal
comportamento.

Restano fuori dall'export, come sempre: **le spunte della Ricerca rapida**
(zero occorrenze di `quickFind` nel file) e **i dati** delle tabelle.

---

## Verificato e a posto

| Cosa | Come risulta |
|---|---|
| Set `Operatore`, accesso ai record | tutte e **21** le tabelle elencate. Anagrafiche `ReadWrite/NoAccess/NoAccess/NoAccess`; i sette registri `ReadWrite/ReadWrite/ReadWrite/NoAccess`. `Fields access="ReadWrite"` ovunque |
| Set `Operatore`, resto | `Layouts/ValueLists/Scripts View="ReadOnly"`, `commands="Edit"`, `Print="True"`, `Export="False"`, `Password prohibitModification="False"` |
| `fmapp` | su `[Full Access]`, `[Data Entry Only]`, `[Read-Only Access]`, `Responsabile`, `Operatore` |
| Apertura automatica | `<Login type="-1">` — tolta |
| Campi nuovi su `Operatori` | `Ruolo`, `gNomeAccount` (globale), `gPassword` (globale) |
| `vl_Ruoli` | `Operatore` / `Responsabile`, identici ai nomi dei set |
| Script `93 - Utilita - Nuovo` | creato; `+ Nuovo` presente su tutti e cinque gli elenchi |
| `Esci` su `D_Menu` | passo `Exit Application` |
| `D_Operatori scheda` | due riquadri, `Ruolo` Drop-down List con `vl_Ruoli`, `AccountFileMaker` **Edit Box senza lista**, `Salva` = Commit *con finestra disattivata*, `Annulla Modifiche` = Revert *con finestra attiva*, `Elimina` con finestra |
| `Crea account` | → script `94`, con **tutte e due** le condizioni di nascondimento |
| `D_Operatori elenco` | sette colonne, `Ruolo` **accanto** ad `Account FM`; ogni etichetta ha la X e la larghezza del suo campo |
| I cinque trigger `OnObjectExit` | parametro `OCC|Tabella::gCerca` corretto su tutti |

**Chiusi:** il `+ Nuovo` mancante sugli elenchi, e l'`Esci` che tornava ai
reparti.

---

## 1. Il set `Responsabile` e' rimasto indietro — e un account e' bloccato

```xml
<PrivilegeSet id="4" name="Responsabile">
  <Other ... Print="False" Export="False" commands="Minimal">
    <Password prohibitModification="True"/>
```

| Voce | Adesso | Deve essere |
|---|---|---|
| Modifica della propria password | **vietata** | consentita, min. 8 |
| Comandi di menu | `Minimal` | `Edit` (Solo modifica) |
| Stampa | spenta | **accesa** |
| Esportazione | spenta | **accesa** |

E nel catalogo degli account:

```xml
<Account id="3" ...>
  <AccountName>MRossi</AccountName>
  <ChangePasswordOnNextLogin>True</ChangePasswordOnNextLogin>
  <PrivilegeSetReference id="4" name="Responsabile"/>
```

**`MRossi` e' gia' nel vicolo cieco**: cambio password obbligatorio piu' set
che lo vieta. Si sblocca spuntando la prima riga.

Stampa ed esportazione al responsabile servono: e' lui che davanti a
un'ispezione tira fuori i registri.

## 2. Script `94`: manca `Esci dallo script` nel ramo dell'errore

Passi 46-49, letti dall'export:

```
46  If [ Get ( LastError ) <> 0 ]
47    Show Custom Dialog [ "Account non creato" ... ]
48    Set Field [ gPassword ; "" ]
49  End If                      <- nessun Exit Script
52  Set Field [ AccountFileMaker ; gNomeAccount ]
53  Commit Records/Requests
```

**Quando `Aggiungi account` fallisce, lo script lo dice e poi scrive lo stesso
il nome in scheda.** Da quel momento l'operatore ha in anagrafica un account
che non esiste, e `Crea account` sparisce perche' il campo e' pieno: e' il
vicolo cieco incontrato a mano il 2 ottobre, ma che si crea da solo.

Finche' non e' corretto, un collaudo verde non prova niente.

## 3. Script `94`: altre tre

| Passo | C'e' scritto | Deve essere |
|---|---|---|
| 25 | `Left ( Nome ; 1 ) & ( Cognome )` | `Lower ( Left ( Nome ; 1 ) & Cognome )` |
| 26 | `gPassword & ""` | `""` |
| 20 | titolo `ATTENZIONE \|\|\|` | `ATTENZIONE !!!` |

Il `Lower` mancante spiega l'account `MRossi` invece di `mrossi`: non blocca
(FileMaker non distingue maiuscole nei nomi account) ma rende i nomi
disomogenei.

Il passo 26 non svuota: annullando la finestra, la password digitata resta nel
campo globale e **ricompare gia' scritta** alla creazione successiva.

## 4. Pulsanti mancanti

- `Reimposta Account` non ha **nessuna** condizione di nascondimento: un
  operatore lo vede.
- `Salva` e `Annulla Modifiche` esistono **solo** su `D_Operatori scheda`: da
  copiare sulle altre quattro.
- `Cambia password` manca su `D_Menu`.

## 5. Larghezze: nessuna coppia coincide

| | Scheda | Elenco |
|---|---|---|
| Reparti | 492 | 684 |
| Attrezzature | 1018 | 968 |
| Fornitori | 1018 | 968 |
| Prodotti | 1004 | 1097 |
| Operatori | 1010 | 1248 |
| `D_Menu` | 731 | — |

Vale il vincolo *elenco e scheda larghi uguali*: la finestra salta a ogni
`Apri`, su tutte e cinque. **Merita una sessione sua**, non una correzione in
mezzo ad altro.

## 6. Minuzie

- `91 - Attrezzature - Entra nell'elenco  ` ha ancora due spazi in fondo.
- `Apri` degli elenchi a x **1**: tocca il bordo, va a 24.
- `D_Operatori elenco`: etichette a y 113 / 114 / 115.
- Lo stile del tema si chiama ancora `Titolo Riquadro`.
- Set `Operatore`, riga `type="New"` (tabelle future): `ReadWrite` su modifica
  e creazione. Va a sola visualizzazione, o una tabella creata domani nascera'
  scrivibile dagli operatori senza che nessuno l'abbia deciso.

## 7. Aperto negli script

- **`90`** scambia *accesso negato* per *formato mancante*: e' quello che ha
  depistato la sera del 2 ottobre.
- **`93`** non controlla l'esito del `90`: se la scheda non esiste, `+ Nuovo`
  crea comunque un record sull'elenco.
