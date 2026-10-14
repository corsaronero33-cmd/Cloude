# Gestione Assistenza — versione PHP + MySQL

Gestionale per un centro di assistenza tecnica: verifiche periodiche dei
registratori telematici, scadenze dei contratti e abbonamenti, interventi con
rapportino firmato dal cliente.

È un sito normale: PHP e MySQL, niente da compilare, niente da installare sul
computer. Si carica su un hosting con FTP e funziona. Per aggiornarlo si
sovrascrivono i file. Si apre dal telefono e dal PC con il browser.

---

## 1. Che cosa serve

Un hosting condiviso qualunque, con:

- **PHP 8.0** o più recente
- **MySQL** (o MariaDB) con **phpMyAdmin**
- una **casella di posta** sul tuo dominio (per gli avvisi)
- il **cron** (tutti gli hosting seri ce l'hanno; se non c'è, c'è un modo
  alternativo spiegato più sotto)

Sono le cose che offre qualunque piano da 20–30 euro l'anno.

---

## 2. Installazione, la prima volta

1. **Crea il database** dal pannello dell'hosting (di solito: *Database MySQL*
   → *Crea nuovo database*, poi crea un utente e assegnalo al database con
   tutti i permessi). Segnati i quattro valori: host, nome del database,
   utente, password.

2. **Prepara la configurazione.** Sul tuo computer, rinomina
   `configurazione.esempio.php` in `configurazione.php` e riempilo: i quattro
   valori del database, i dati della tua azienda, quelli della casella di
   posta. È l'unico file da modificare.

3. **Carica tutto** via FTP (FileZilla va benissimo) nella cartella pubblica
   dell'hosting — di solito si chiama `public_html`, `htdocs` o `www`.

4. **Apri** `https://iltuosito.it/installa.php` nel browser. La pagina ti dice
   se l'hosting ha quello che serve, crea le tabelle e ti fa creare il tuo
   accesso da amministratore.

5. **Entra** e comincia: prima i clienti, poi gli apparecchi (con la data
   dell'ultima verifica), poi i contratti. Lo scadenzario si riempie da solo.

> `installa.php` si può lasciare dov'è: dopo il primo accesso chiede di essere
> amministratore. Serve ancora quando un aggiornamento porta tabelle nuove.

---

## 3. Gli avvisi per email

Ogni mattina parte un messaggio con le scadenze in ritardo e quelle della
settimana. Se non c'è niente da segnalare non parte niente.

I dati della posta stanno in `configurazione.php` e sono quelli della tua
casella, gli stessi che metteresti in Outlook:

```php
'posta' => [
  'server'    => 'smtp.tuodominio.it',
  'porta'     => 465,          // 465 con 'ssl', 587 con 'starttls'
  'sicurezza' => 'ssl',
  'utente'    => 'info@tuodominio.it',
  'password'  => '...',
  'mittente'  => 'info@tuodominio.it',
  'destinatari' => 'tuo@indirizzo.it, socio@indirizzo.it',
],
```

Poi, in `Impostazioni`, il pulsante **Manda una prova adesso**: arriva subito, e
se qualcosa non va la risposta dice esattamente che cosa (server sbagliato,
password rifiutata, destinatario non valido).

**Per mandarlo ogni mattina da solo**, nel pannello dell'hosting cerca *Cron
Jobs* (o *Operazioni pianificate*) e aggiungi:

```
php /home/tuoutente/public_html/avvisi.php
```

alle 7:00 di ogni giorno. Il percorso esatto te lo dice la pagina
`Impostazioni`, in fondo al riquadro degli avvisi: è già scritto, basta
copiarlo.

Se il tuo hosting non sa lanciare PHP dal cron ma sa chiamare un indirizzo
web, usa questo:

```
https://iltuosito.it/avvisi.php?chiave=la-parola-che-hai-messo-in-configurazione
```

---

## 4. Aggiornare

Quando ti mando una versione nuova:

1. **Fai una copia del database** da phpMyAdmin (*Esporta* → *Esegui*): è un
   file `.sql` che si rimette com'è se qualcosa va storto. Fallo sempre, ci
   vogliono dieci secondi.
2. **Sovrascrivi i file** via FTP — tutti tranne `configurazione.php`, che è
   tuo e non viene mai toccato.
3. Se te lo dico, **apri `installa.php`** e premi *Crea o aggiorna le tabelle*:
   aggiunge quello che manca senza toccare i dati che ci sono.

Nessuna compilazione, nessuna cache da svuotare, nessun servizio esterno.

---

## 5. Com'è fatto dentro

Ogni pagina è un file. Si apre, si legge, si cambia.

| File | A che serve |
| --- | --- |
| `configurazione.php` | **L'unico file tuo.** Database, azienda, posta |
| `comune.php` | Collegamento al database, sessione, funzioni di aiuto |
| `vocabolario.php` | Tipi di apparecchio, di contratto, di intervento: le tendine |
| `date_it.php` | Date all'italiana e somma dei mesi fatta col calendario |
| `scadenze.php` | **Le regole dello scadenzario**, in un posto solo |
| `schema.php` | Le tabelle del database |
| `installa.php` | Crea le tabelle e il primo accesso |
| `entra.php`, `esci.php` | Accesso |
| `index.php` | La pagina iniziale: che cosa scade |
| `clienti.php` | Clienti e sedi |
| `apparecchi.php` | Registratori telematici e altri apparecchi |
| `contratti.php` | Contratti, abbonamenti, rinnovi |
| `interventi.php` | Il rapportino, con righe e firma |
| `rapportino.php` | La versione da stampare o salvare in PDF |
| `impostazioni.php` | Regole, utenti, avvisi |
| `esporta.php` | Esportazione CSV per Excel |
| `avvisi.php` | L'email del mattino (la chiama il cron) |
| `posta.php` | Il pezzo che parla col server di posta |
| `prove.php` | Le prove automatiche |
| `stile.css`, `app.js` | Aspetto e il poco JavaScript che serve |

### Due regole che vale la pena conoscere

**La prossima verifica non è memorizzata.** Si ricava ogni volta dall'ultima
verifica (o, se manca, dalla messa in servizio) sommando i mesi di cadenza che
stanno in `Impostazioni`. Se la norma cambiasse la cadenza, cambi un numero e
tutte le scadenze si ricalcolano.

**Il rapportino non è un PDF generato da una libreria**, è una pagina
impaginata per l'A4: si stampa o si salva in PDF dal browser. Una cosa in meno
da aggiornare, e il foglio viene come lo vedi.

---

## 6. Le prove automatiche

```
php prove.php
```

Girano su un database temporaneo, non toccano i tuoi dati e non mandano email.
Provano le date (il 31 gennaio più un mese, il 29 febbraio, gli anni
bisestili), le regole delle fasce di scadenza, il numero progressivo dei
rapportini e che un nome scritto con le virgolette non rompa l'email.

Se tocchi qualcosa e vuoi sapere se hai rotto niente, lancia questo.

---

## 7. Se qualcosa non va

**"Non riesco a collegarmi al database"** — i quattro valori in
`configurazione.php`. Attenzione: su molti hosting il nome del database e
dell'utente cominciano col nome del tuo account (tipo `tuoaccount_assistenza`).

**Pagina bianca** — l'hosting nasconde gli errori. Nel pannello cerca *Error
log*, oppure aggiungi temporaneamente in cima a `comune.php`:
`ini_set('display_errors', '1'); error_reporting(E_ALL);` — e ricordati di
toglierlo.

**L'email non parte** — apri `diagnostica-posta.php`: mostra che cosa sta
leggendo da `configurazione.php` (senza rivelare la password), lascia provare
altri valori scritti a mano e stampa la conversazione col server di posta.
`Impostazioni` mostra invece gli ultimi cinque tentativi con
la risposta del server di posta. Le cause più comuni: porta e sicurezza non
abbinate (465 va con `ssl`, 587 con `starttls`), oppure la password della
casella cambiata.

**Il cron non parte** — qualche hosting vuole il percorso completo di PHP
(`/usr/local/bin/php` invece di `php`). Il pannello di solito lo scrive.
