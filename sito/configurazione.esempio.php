<?php
// ============================================================================
// COPIA QUESTO FILE in  configurazione.php  e riempi i tuoi dati.
//
// Questo e' il solo file da modificare per far partire il sito. Tutti gli
// altri non si toccano, cosi' un aggiornamento e' sempre "sovrascrivi tutto
// tranne questo".
// ============================================================================

return [

  // --- Database -------------------------------------------------------------
  // I quattro valori li trovi nel pannello dell'hosting, dove crei il
  // database MySQL. Il nome del database e dell'utente spesso cominciano col
  // nome del tuo account: non e' un errore, e' come li assegna l'hosting.
  'db' => [
    'host'     => 'localhost',
    'nome'     => 'nome_del_database',
    'utente'   => 'utente_del_database',
    'password' => 'password_del_database',
  ],

  // --- La tua azienda -------------------------------------------------------
  // Finisce in cima ai rapportini che consegni al cliente.
  'azienda' => [
    'nome'        => 'La Mia Assistenza S.r.l.',
    'indirizzo'   => 'Via Roma 1, 00100 Roma (RM)',
    'piva'        => '01234567890',
    'telefono'    => '06 1234567',
    'email'       => 'info@tuodominio.it',
    'laboratorio' => 'Laboratorio abilitato n. 123',
  ],

  // --- Posta (avvisi delle scadenze) ---------------------------------------
  // Sono i dati della TUA casella di posta, gli stessi che metti in Outlook o
  // nel telefono.
  //
  // ATTENZIONE AL NOME DEL SERVER: NON e' "smtp." seguito dal tuo dominio --
  // quel nome non esiste, e l'errore che si ottiene e' "Name or service not
  // known". E' il server del fornitore che ti ospita la posta, uguale per tutti
  // i suoi clienti: su IONOS e' `smtp.ionos.com`.
  //
  // Con un altro fornitore, il nome sta nel pannello della casella, alla voce
  // "impostazioni per i programmi di posta" (le stesse che metteresti in
  // Outlook): copia quello, non inventarlo.
  //
  //   porta 465 -> sicurezza 'ssl'       (la piu' comune)
  //   porta 587 -> sicurezza 'starttls'
  'posta' => [
    'server'     => 'smtp.ionos.com',
    'porta'      => 465,
    'sicurezza'  => 'ssl',
    // L'utente e' l'indirizzo email COMPLETO, e la casella deve esistere
    // davvero: va creata nel pannello dell'hosting, voce Email.
    'utente'     => 'info@tuodominio.it',
    'password'   => 'la-password-della-casella',
    'mittente'   => 'info@tuodominio.it',
    'nome_mittente' => 'Gestione Assistenza',

    // A chi mandare gli avvisi. Piu' indirizzi separati da virgola.
    'destinatari' => 'tuo@indirizzo.it',
  ],

  // --- Avvisi ---------------------------------------------------------------
  // Parola d'ordine per far partire gli avvisi da un indirizzo web, nel caso
  // il tuo hosting non permetta di lanciare PHP dal cron. Cambiala.
  'chiave_avvisi' => 'cambia-questa-parola',

  // --- Indirizzo del sito ---------------------------------------------------
  // Serve per il pulsante dentro l'email. Senza barra finale.
  'indirizzo_sito' => 'https://assistenza.tuodominio.it',
];
