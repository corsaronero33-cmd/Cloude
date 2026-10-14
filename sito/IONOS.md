# Pubblicare il gestionale su IONOS

Procedura per **kronos-software.it**, hosting IONOS. Un'ora scarsa, quasi tutta
di attesa.

I nomi dei pulsanti nel pannello IONOS cambiano da una tariffa all'altra e con
la lingua dell'interfaccia: dove può capitare, scrivo tutte e due le diciture.
Se una voce non la trovi dove dico, mandami la foto della schermata.

---

## Dove metterlo

Dentro una cartella chiamata `assistenza`, non nella radice del sito. Così:

- il gestionale sta su `https://kronos-software.it/assistenza/`
- la radice `kronos-software.it` resta libera per il sito dell'azienda, che
  prima o poi vorrai fare

Se preferisci averlo direttamente su `kronos-software.it`, funziona lo stesso:
carichi i file nella radice invece che nella sottocartella. Cambia solo
l'indirizzo che scrivi in `configurazione.php`.

---

## Passo 1 — Il database (5 minuti)

Nel pannello IONOS: **Menu → Hosting**, scegli il contratto se ne hai più di
uno, e nel riquadro **Database** (*Databases*) premi **Crea database**
(*Create Database*). Se trovi solo **Gestisci** (*Manage*), entra lì e il
pulsante per crearne uno è nella pagina dopo.

Puoi scegliere **MariaDB** (è l'impostazione predefinita di IONOS per i
database nuovi) oppure MySQL: il gestionale funziona con tutti e due.

Appena creato, IONOS ti mostra quattro valori. **Copiali subito** in un file di
testo, servono al passo 4:

| Cosa | Com'è fatto |
| --- | --- |
| Nome host | qualcosa come `db5012345678.hosting-data.io` — **non** `localhost` |
| Nome del database | tipo `db5012345678` |
| Utente | tipo `dbu1234567` |
| Password | quella che hai scelto tu |

> Il nome host su IONOS **non è `localhost`**: il database sta su un'altra
> macchina. È l'errore più comune e dà "Non riesco a collegarmi al database".

Da qui in poi i dati del gestionale li potrai guardare con **phpMyAdmin**:
stesso riquadro Database, colonna **ADMIN**, pulsante **Apri** (*Open*).

---

## Passo 2 — La versione di PHP (2 minuti)

**Menu → Hosting → riquadro PHP → Gestisci** (*Open*). Scegli il dominio
`kronos-software.it` e imposta una versione **8.1 o più recente**. Salva.

Ci mette qualche minuto a diventare effettiva.

---

## Passo 3 — La casella di posta (5 minuti)

Serve una casella sul tuo dominio: è quella che manderà gli avvisi.

**Menu → Email → Crea indirizzo email**, per esempio
`gestionale@kronos-software.it`. Scegli una password e segnatela.

I dati per mandare la posta (documentazione IONOS):

| Cosa | Valore |
| --- | --- |
| Server in uscita | `smtp.ionos.com` |
| Porta | `465` con sicurezza `ssl` (alternativa: `587` con `starttls`) |
| Utente | l'indirizzo email **completo** |
| Password | quella della casella |

Se la casella che hai è su un dominio diverso o il tuo pannello mostra un
server diverso, usa quello che mostra il pannello: il gestionale ha un pulsante
di prova che ti dirà subito se è giusto.

---

## Passo 4 — Compilare `configurazione.php` (5 minuti)

Sul tuo computer, nella cartella del gestionale: fai una **copia** di
`configurazione.esempio.php`, chiamala **`configurazione.php`** e aprila con
Blocco note. Compila così:

```php
'db' => [
  'host'     => 'db5012345678.hosting-data.io',   // quello del passo 1
  'nome'     => 'db5012345678',
  'utente'   => 'dbu1234567',
  'password' => 'la-password-del-database',
],

'azienda' => [
  'nome'        => 'Kronos Software',
  'indirizzo'   => 'Via ..., Città (XX)',
  'piva'        => '...',
  'telefono'    => '...',
  'email'       => 'gestionale@kronos-software.it',
  'laboratorio' => 'Laboratorio abilitato n. ...',
],

'posta' => [
  'server'        => 'smtp.ionos.com',
  'porta'         => 465,
  'sicurezza'     => 'ssl',
  'utente'        => 'gestionale@kronos-software.it',
  'password'      => 'la-password-della-casella',
  'mittente'      => 'gestionale@kronos-software.it',
  'nome_mittente' => 'Gestione Assistenza',
  'destinatari'   => 'tuo@indirizzo.it',
],

'chiave_avvisi'  => 'una-parola-lunga-inventata-da-te',
'indirizzo_sito' => 'https://kronos-software.it/assistenza',
```

Due avvertenze da Blocco note: **salva in UTF-8** (menu *File → Salva con
nome*, in basso c'è *Codifica*) e controlla che non ci sia niente **prima** di
`<?php` — nemmeno una riga vuota.

La `chiave_avvisi` inventala lunga e senza spazi: è quella che fa partire
l'avviso del mattino, e serve al passo 7.

---

## Passo 5 — Caricare i file (10 minuti)

IONOS non accetta l'FTP semplice: si usa **SFTP**, che è la stessa cosa ma
cifrata. FileZilla lo fa senza problemi.

**Prendi i dati di accesso.** Pannello: **Menu → Hosting → riquadro SFTP &
SSH**. La prima volta il pulsante dice **Configura** (*Set Up*) e serve a
scegliere la password dell'utente principale; dopo dirà **Gestisci**
(*Manage*). Cliccando sul nome utente vedi:

| Cosa | Com'è fatto |
| --- | --- |
| Host | `accessNNNNNNNNN.webspace-data.io` |
| Nome utente | `uNNNNNNNN` |
| Porta | `22` |
| Protocollo | SFTP |

**In FileZilla**, apri *File → Gestore siti → Nuovo sito* e compila:

- Protocollo: **SFTP - SSH File Transfer Protocol** (non "FTP")
- Host: quello sopra, Porta: `22`
- Accesso: Normale, con utente e password

Alla prima connessione chiede di fidarti della chiave del server: sì.

**Carica.** Nel pannello di destra (il server) entra nella cartella del sito —
di solito è quella che contiene già un `index.html` o `index.htm` di IONOS.
Crea lì dentro una cartella **`assistenza`** ed entraci. Poi, dal pannello di
sinistra (il tuo computer), trascina dentro **tutti** i file del gestionale,
compreso `configurazione.php` che hai appena compilato e il file `.htaccess`.

> FileZilla a volte nasconde i file che cominciano con un punto. Se non vedi
> `.htaccess`, attiva *Server → Forza visualizzazione file nascosti*.

---

## Passo 6 — Installare (2 minuti)

Apri nel browser:

```
https://kronos-software.it/assistenza/installa.php
```

La pagina ti dice se l'hosting ha quello che serve, poi premi **Crea o
aggiorna le tabelle** e infine crea il tuo accesso da amministratore (nome,
email, password di almeno 8 caratteri).

Fatto questo sei dentro. Comincia dai clienti, poi gli apparecchi con la data
dell'ultima verifica, poi i contratti.

> **Se il browser non apre la pagina** e dice che non riesce a stabilire una
> connessione sicura, il certificato SSL del dominio non è ancora pronto. Apri
> `.htaccess` e metti un `#` davanti alle quattro righe del punto 1 (quelle con
> `RewriteEngine`, `RewriteCond` e `RewriteRule`), ricaricalo, e togli i
> cancelletti quando il certificato è attivo.

---

## Passo 7 — L'avviso del mattino (5 minuti)

Su IONOS il cron **chiama un indirizzo web**, non lancia un file: è proprio il
modo che il gestionale prevede.

1. Entra nel gestionale, **Impostazioni**, e premi **Manda una prova adesso**.
   Deve arrivarti l'email. Se non arriva, il messaggio in pagina dice il
   perché (server sbagliato, password rifiutata, destinatario non valido):
   quello è il momento di sistemare il passo 3.

   Se dice che le credenziali non sono accettate, apri
   `https://kronos-software.it/assistenza/diagnostica-posta.php`: ti mostra che
   cosa sta leggendo dal file (lunghezza della password, prima e ultima lettera,
   spazi di troppo) e ti lascia provare altri valori scrivendoli a mano, senza
   ricaricare niente. Se scritti a mano funzionano, il guaio è nel file.
   Quando la posta va, quel file si può cancellare dal server.

2. Poi, nel pannello IONOS: **Menu → Hosting → riquadro Cronjobs → Gestisci**
   (*Manage*), e aggiungi un lavoro che chiami ogni giorno alle **7:00**:

   ```
   https://kronos-software.it/assistenza/avvisi.php?chiave=una-parola-lunga-inventata-da-te
   ```

   (la stessa parola che hai messo in `configurazione.php`)

IONOS ferma un cronjob che dura più di 60 secondi: a questo ne bastano meno di
uno, perché legge le scadenze e manda un messaggio solo.

---

## Passo 8 — Due controlli finali

1. Apri `https://kronos-software.it/assistenza/configurazione.php`: deve dire
   **403** o *Forbidden*. Se invece ti mostra del testo con dentro le password,
   scrivimi subito.
2. Guarda che nella barra del browser ci sia il **lucchetto**.

---

## Quando ti mando una versione nuova

1. phpMyAdmin → *Esporta* → *Esegui*: scarica la copia del database. Dieci
   secondi, e ti salva la giornata se qualcosa va storto.
2. FileZilla: trascini i file nuovi sopra i vecchi e confermi *Sovrascrivi*.
   **Tranne `configurazione.php`**, che è tuo.
3. Se te lo dico, riapri `installa.php` e premi *Crea o aggiorna le tabelle*.

---

## Fonti

Le pagine ufficiali IONOS usate per questa guida:

- [Creare database MySQL/MariaDB](https://www.ionos.com/help/hosting/setting-up-mysql-databases/setting-up-mysql-or-mariadb-databases-in-your-ionos-account/)
- [Aprire phpMyAdmin](https://www.ionos.com/help/hosting/using-mysql-databases-for-web-projects/opening-phpmyadmin/)
- [Dati di connessione FTP/SFTP](https://www.ionos.com/help/hosting/setting-up-and-managing-ftp-access/connection-details-for-ftp/sftp-in-ionos-web-hosting/)
- [Cambiare versione di PHP](https://www.ionos.com/help/hosting/managing-php-versions-in-the-control-panel/displaying-or-changing-php-versions/)
- [Cron Job Manager](https://www.ionos.com/help/hosting/cron-jobs/cron-job-manager/)
- [Server di posta IMAP/POP3/SMTP](https://www.ionos.com/help/email/general-topics/ionos-mail-server-details-for-imap-pop3-and-smtp/)
