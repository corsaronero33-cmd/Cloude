# Scheda 12 — Rimettiamo in ordine

Scheda di lavoro con le spunte:
<https://claude.ai/artifact/4AWsfB9RG5n5zx8tJ3r35z>

Scritta dopo tre sintomi comparsi tutti insieme entrando per la prima volta
con un account non amministratore. Hanno **una causa sola**.

---

## Il guasto

Il set di privilegi dell'account di prova era **creato ma non compilato**. Un
set nuovo di FileMaker nasce con formati visibili, script eseguibili, menu
completi e **nessun accesso ai record**.

| Sintomo | Causa |
|---|---|
| `<Nessun accesso>` in ogni colonna, `?` sui numerici | il set non vede i record di `Reparti`. I record ci sono: il contatore li conta |
| In testata il nome dell'account invece di nome e cognome | lo script `02` non vede `Operatori`, non trova nessuno, ripiega — come deve |
| *"La maschera ... non c'e' ancora"*, ma la maschera si apre | `Vai al formato` torna un errore di accesso negato, e il controllo dello script `90` lo scambia per un formato mancante |
| Barra dei menu completa | la prova del nove: un set compilato avrebbe `Solo modifica` |

**Niente e' rotto e niente e' perso.** Manca il contenuto di una finestra.

## La riparazione

1. Entra con l'account di accesso completo.
2. `Gestisci › Sicurezza › Avanzate...`, scheda **Account**: guarda **quale set**
   ha l'account di prova.
3. Scheda **Set di privilegi**, doppio clic: Formati *tutti visualizzabili*,
   Liste valori *tutte visualizzabili*, Script *tutti eseguibili*, Comandi di
   menu **Solo modifica**.
4. **Accesso ai record → Personalizzato**: clic sulla prima tabella,
   **Maiusc+clic** sull'ultima, e per tutte `Visualizza si, Modifica no, Crea
   no, Elimina no`.
5. **Ctrl+clic** sulle sette dei registri — `Rilevazioni`, `Ricevimenti`,
   `RigheRicevimento`, `Sanificazioni`, `NonConformita`, `Lotti`, `Utilizzi` —
   e per loro `Visualizza si, Modifica si, Crea si, Elimina **no**`.
6. Ultima colonna **Accesso ai campi**: deve dire **tutti** su ogni riga.

La verifica si fa **uscendo e rientrando** con l'account di prova. Devono
tornare tre cose insieme: i dati, il nome in testata, e il messaggio che non
compare piu'.

## Debito aperto da qui

**Lo script `90` dice la stessa frase per due guasti diversi**: *formato che
non esiste* e *formato che non posso leggere*. Va distinto — ma dopo che la
sicurezza e' a posto, non durante.

## Le tre regole

1. **La sicurezza si prova sempre uscendo e rientrando.** Un permesso sbagliato
   non si vede dall'account di accesso completo. Finche' non hai rifatto il
   login come operatore, quella parte non e' collaudata: e' solo scritta.
2. **Una finestra per volta, letta fino in fondo prima di OK.** La finestra dei
   privilegi ha sette tendine e una lista di ventisei tabelle, ed e' l'unica in
   cui premere OK a meta' non da' nessun errore e rompe tutto il resto.
3. **Chiuso un pezzo: DDR e verifica.** E' il metodo che ha retto per nove giri.
   Era stato sospeso per andare piu' svelti sulla sicurezza, ed e' li' che ci si
   e' persi.

**E una regola per chi scrive le guide.** La fase 1 di `10-sicurezza.md` era
una tabella di valori, non una sequenza di passi: per una finestra con
ventisei righe dentro non basta. Va riscritta clic per clic, come tutte le
altre.
