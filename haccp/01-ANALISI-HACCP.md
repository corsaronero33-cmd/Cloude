# Analisi HACCP per la ristorazione

Documento di riferimento per il modello dati. Serve a stabilire **cosa** il
programma deve registrare e **perche'**, prima di decidere come.

---

## 1. Riferimenti normativi

| Norma | Cosa impone |
|---|---|
| Reg. (CE) 852/2004 | Igiene dei prodotti alimentari. L'art. 5 obbliga l'operatore a predisporre e applicare procedure basate sui principi HACCP e a **conservarne le registrazioni** |
| Reg. (CE) 178/2002 | Art. 18: rintracciabilita' in tutte le fasi. Art. 19: obbligo di ritiro/richiamo e informazione alle autorita' |
| Reg. (CE) 853/2004 | Norme specifiche per alimenti di origine animale. Include il trattamento di bonifica del pesce destinato al consumo crudo |
| Reg. (UE) 1169/2011 | Informazioni al consumatore. Allegato II: i 14 allergeni da dichiarare |
| Reg. (CE) 2073/2005 | Criteri microbiologici applicabili ai prodotti alimentari |
| Reg. (UE) 1379/2013 | Etichettatura dei prodotti della pesca: denominazione, zona FAO, metodo di produzione, attrezzo |
| D.Lgs. 193/2007 | Sanzioni italiane per le violazioni dei regolamenti sopra |
| D.Lgs. 18/2023 | Qualita' delle acque destinate al consumo umano |

Il riferimento metodologico e' il **Codex Alimentarius**, che stabilisce i sette
principi HACCP.

---

## 2. I sette principi, tradotti in tabelle

Questo e' il ponte fra la norma e il database. Ogni principio deve avere un
posto dove vivere, altrimenti l'applicazione non copre l'autocontrollo.

| Principio | Dove vive nel programma |
|---|---|
| 1. Analisi dei pericoli | Documentale (manuale di autocontrollo), allegato nel file |
| 2. Individuazione dei CCP | Tabella `PuntiControllo` |
| 3. Limiti critici | Campi `LimiteMin` / `LimiteMax` in `PuntiControllo` |
| 4. Monitoraggio | Tabella `Rilevazioni` |
| 5. Azioni correttive | Tabella `NonConformita`, piu' `AzioneCorrettiva` in `PuntiControllo` |
| 6. Verifica | Tarature termometri, tamponi superficiali, analisi, riesame periodico |
| 7. Documentazione e registrazioni | Tutto il resto, piu' le stampe PDF per l'ispezione |

**Il punto 3 e' quello che decide l'architettura.** I limiti critici stanno in
una tabella di configurazione, non dentro le formule: cosi' quando la ASL
locale o il consulente chiede di stringere una temperatura, si cambia un
record, non si riapre il programma.

---

## 3. Flusso del ristorante e pericoli per fase

Le fasi tipiche di un locale con cucina, in ordine.

| # | Fase | Pericoli principali | Tipo |
|---|---|---|---|
| 1 | Approvvigionamento / qualifica fornitore | Fornitore non idoneo, prodotto senza riconoscimento CE | PRP |
| 2 | **Ricevimento merci** | Rottura catena del freddo, prodotto scaduto, imballo non integro, lotto assente | **CCP** |
| 3 | Stoccaggio ambiente | Infestanti, umidita', contaminazione da chimici | PRP |
| 4 | **Stoccaggio refrigerato** | Moltiplicazione microbica per temperatura fuori limite | **CCP** |
| 5 | **Stoccaggio congelato** | Scongelamento parziale, ricongelamento | **CCP** |
| 6 | Scongelamento | Scongelamento a temperatura ambiente, sgocciolamento su altri alimenti | CP |
| 7 | Lavorazione a freddo / preparazione | Contaminazione crociata, tempi lunghi a temperatura ambiente, allergeni | CP |
| 8 | **Cottura** | Mancata riduzione della carica microbica al cuore | **CCP** |
| 9 | **Abbattimento / raffreddamento rapido** | Permanenza prolungata fra +65 e +10 gradi | **CCP** |
| 10 | **Mantenimento a caldo** | Temperatura sotto i 63 gradi | **CCP** |
| 11 | Mantenimento a freddo / buffet | Temperatura sopra i limiti, esposizione prolungata | CP |
| 12 | **Rigenerazione** | Riscaldamento insufficiente al cuore | **CCP** |
| 13 | **Bonifica pesce da consumare crudo** | Anisakis vitale | **CCP** |
| 14 | Frittura | Composti polari oltre il limite | CP |
| 15 | Servizio | Contaminazione, allergeni non dichiarati | CP |
| 16 | Sanificazione | Residui di detergente, disinfezione inefficace | PRP |
| 17 | Gestione rifiuti | Attrazione infestanti, contaminazione | PRP |

**CCP** = punto critico di controllo (la perdita di controllo e' un rischio
diretto per la salute e non recuperabile a valle).
**CP** = punto di controllo.
**PRP** = prerequisito / buona prassi igienica.

Quali fasi siano davvero CCP dipende dal locale: un bar senza cucina non ha
la fase 8. La tabella `PuntiControllo` permette di attivare e disattivare
ciascuno senza toccare il programma.

---

## 4. Limiti critici di riferimento

Valori tipici. **Da confermare sul manuale di autocontrollo del locale.**

### Ricevimento

| Categoria | Limite di accettazione | Respingere oltre |
|---|---|---|
| Carni fresche | 0 / +4 gradi | +6 |
| Carni macinate e preparazioni | 0 / +2 gradi | +4 |
| Pollame | 0 / +4 gradi | +6 |
| Pesce fresco | 0 / +2 gradi, in ghiaccio fondente | +4 |
| Latticini e derivati | 0 / +4 gradi | +6 |
| Congelati e surgelati | -18 gradi, tolleranza di trasporto -15 | -12 |
| Ortofrutta | ambiente o refrigerato secondo prodotto | - |
| Secco / ambiente | integro, entro il TMC | - |

Si controlla inoltre: integrita' dell'imballo, presenza di **lotto** e di
**data di scadenza o TMC**, etichettatura conforme, bollo CE per i prodotti di
origine animale, pulizia del mezzo di trasporto.

### Conservazione

| Ambiente | Limite |
|---|---|
| Cella / frigorifero positivo | 0 / +4 gradi |
| Cella pesce | 0 / +2 gradi |
| Congelatore | uguale o inferiore a -18 gradi |
| Magazzino secco | fino a +25 gradi, asciutto e ventilato |

### Trattamenti termici

| Fase | Limite critico |
|---|---|
| Cottura | almeno +75 gradi al cuore (equivalenti: 70 gradi per 2 minuti, 65 gradi per 10 minuti) |
| Mantenimento a caldo | almeno +63 gradi |
| Raffreddamento rapido | da +65 a +10 gradi entro 2 ore, poi in frigorifero |
| Congelamento in abbattitore | al cuore fino a -18 gradi entro 4 ore |
| Rigenerazione | almeno +75 gradi al cuore, in tempi rapidi |
| Scongelamento | in frigorifero a +4 gradi, mai a temperatura ambiente |
| Bonifica anisakis | -20 gradi per almeno 24 ore in tutte le parti del prodotto, oppure -35 gradi per almeno 15 ore |
| Olio di frittura | composti polari non oltre il 25% |

La bonifica del pesce e' l'unico CCP con un obbligo di **attestazione al
consumatore**: nel menu deve comparire l'indicazione del trattamento.

---

## 5. Rintracciabilita': cosa serve davvero

L'art. 18 del Reg. 178/2002 impone di sapere, per ogni alimento:

- **un passo indietro**: da chi l'ho ricevuto, quando, quale lotto;
- **un passo avanti**: a chi l'ho ceduto.

Per un ristorante il passo avanti **si ferma prima del consumatore finale**:
l'obbligo di identificare il destinatario non si applica alla vendita al
consumatore. Quello che serve dimostrare e':

> dato un lotto in ingresso, in quale giornata e in quale preparazione e'
> stato impiegato — e, all'inverso, dato un piatto servito in una certa data,
> quali lotti ci sono finiti dentro.

Questo e' esattamente il compito della tabella `Utilizzi`, che lega `Lotti` a
`Preparazioni`. Senza quella tabella si ha solo il passo indietro, cioe' meta'
dell'obbligo.

Casi in cui il passo avanti diventa completo e va tracciato per davvero:

- catering e banqueting fuori sede;
- fornitura ad altre attivita' (semilavorati ceduti a un altro locale);
- vendita di prodotti confezionati da asporto con marchio proprio.

### Perche' non basta conservare i DDT

Conservare i documenti di trasporto copre il passo indietro solo se, alla
richiesta "questo lotto di cozze e' sotto richiamo, dove e' finito?", si sa
rispondere entro poche ore. Con i DDT in un raccoglitore si risponde in un
giorno. Con `Utilizzi` si risponde in dieci secondi, ed e' il motivo per cui
il ristoratore sta pagando questo lavoro.

---

## 6. Registri da tenere

| Registro | Frequenza tipica | Obbligatorio |
|---|---|---|
| Ricevimento merci | ad ogni consegna | si' |
| Temperature frigoriferi e congelatori | 1-2 volte al giorno | si' |
| Temperature di cottura / mantenimento / abbattimento | ad ogni ciclo o a campione | si' |
| Bonifica pesce da consumare crudo | ad ogni trattamento | si', se applicabile |
| Sanificazione | secondo piano (giornaliero / settimanale / mensile) | si' |
| Non conformita' e azioni correttive | all'evenienza | si' |
| Olio di frittura | ad ogni verifica / sostituzione | si', se applicabile |
| Lotta agli infestanti | secondo contratto, di norma trimestrale | si' |
| Formazione del personale | all'assunzione e al rinnovo | si' |
| Taratura termometri | annuale | si' |
| Manutenzione attrezzature | secondo piano | si' |
| Analisi acqua (se non da acquedotto) | annuale | se applicabile |
| Tamponi superficiali | secondo piano di verifica | consigliato |
| Ritiro rifiuti e oli esausti | ad ogni ritiro | si' |
| Campioni pasto conservati 72 ore | giornaliero | dipende dalla ASL |

L'ultima riga va verificata: **e' una prescrizione locale**, non nazionale.
Da chiedere al consulente HACCP del locale.

---

## 7. Allergeni

I 14 dell'Allegato II del Reg. (UE) 1169/2011:

1. Cereali contenenti glutine
2. Crostacei
3. Uova
4. Pesce
5. Arachidi
6. Soia
7. Latte (incluso il lattosio)
8. Frutta a guscio
9. Sedano
10. Senape
11. Semi di sesamo
12. Anidride solforosa e solfiti oltre 10 mg/kg
13. Lupini
14. Molluschi

Nel programma vivono come tabella di anagrafica, collegata ai `Prodotti` e,
attraverso le `Ricette`, propagata alle `Preparazioni`. Il valore pratico e'
poter stampare la scheda allergeni del menu senza ricompilarla a mano ogni
volta che cambia un ingrediente.

---

## 8. Requisiti che l'ispettore verifica sul registro informatico

Un registro digitale e' accettato, ma deve reggere tre domande.

1. **Chi ha scritto questo dato e quando?** Servono account nominali per
   operatore e campi di sistema non modificabili.
2. **E' stato modificato dopo?** Serve che un record chiuso non si possa
   ritoccare in silenzio: blocco dopo il salvataggio e registro delle
   modifiche.
3. **Me lo puoi stampare?** Serve l'esportazione in PDF dei registri per
   periodo, subito, senza collegarsi a internet se possibile.

Sono tre requisiti di progetto, non rifiniture da aggiungere alla fine.

---

## 9. Cosa chiedere al ristoratore prima di partire

Domande brevi, ma ognuna sposta il modello dati.

1. Che dispositivi usa il personale: iPhone, iPad, oppure Android?
   (Da questa dipende tutto: vedi la discussione sulle licenze.)
2. C'e' copertura Wi-Fi nella zona di ricevimento merci e nelle celle?
3. Quante persone compilano i registri, e devono avere accessi distinti?
4. Ha gia' un **manuale di autocontrollo**? Chiedere copia: da li' si
   ricavano i CCP reali, le frequenze e i limiti critici del locale.
5. Quali attrezzature vanno monitorate, con quale numerazione le chiamano gia'
   (frigo 1, cella carne...)? Usiamo i loro nomi, non i nostri.
6. Fa pesce da consumare crudo o marinato? Fa abbattimento?
7. Fa catering, asporto confezionato, o fornisce altri locali?
8. La ASL competente chiede la conservazione dei campioni pasto?
9. Quanti fornitori abituali e quante consegne al giorno? (dimensiona il
   ricevimento merci: 3 consegne al giorno o 30 cambiano l'interfaccia)
10. Chi e' il consulente HACCP e possiamo parlarci? E' l'interlocutore che
    valida l'analisi, e averlo dalla nostra parte evita rifacimenti.
