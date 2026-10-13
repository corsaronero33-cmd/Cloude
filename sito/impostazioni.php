<?php
// ============================================================================
// Impostazioni: le regole dello scadenzario, gli utenti, gli avvisi.
//
// Solo l'amministratore. Un tecnico non deve poter cambiare la cadenza delle
// verifiche di tutti, ne' creare accessi.
// ============================================================================

declare(strict_types=1);

require_once __DIR__ . '/comune.php';
require_once __DIR__ . '/layout.php';
require_once __DIR__ . '/avvisi.php';

richiedi_amministratore();

$prova = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verifica_gettone();
  $azione = p('azione');

  if ($azione === 'regole') {
    imposta('mesi_verifica', (string) max(1, (int) p('mesi_verifica', '24')));
    imposta('giorni_avviso', (string) max(1, (int) p('giorni_avviso', '60')));
    imposta('avvisi_attivi', p_spunta('avvisi_attivi') ? '1' : '0');
    avvisa('Impostazioni salvate.');
    reindirizza('impostazioni.php');
  }

  if ($azione === 'prova') {
    $prova = manda_avviso(true);
    // Niente reindirizzamento: l'esito va mostrato qui, con tutto il dettaglio.
  }

  if ($azione === 'nuovo_utente') {
    $nome = p('nome');
    $email = strtolower(p('email'));
    $pw = p('password');
    $ruolo = p('ruolo') === 'admin' ? 'admin' : 'tecnico';

    if ($nome === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($pw) < 8) {
      avvisa('Servono nome, email valida e password di almeno 8 caratteri.');
    } elseif (valore('select count(*) from utenti where email = ?', [$email])) {
      avvisa('C\'e\' gia\' un utente con questa email.');
    } else {
      salva_riga('utenti', [
        'email'         => $email,
        'password_hash' => password_hash($pw, PASSWORD_DEFAULT),
        'nome'          => $nome,
        'ruolo'         => $ruolo,
        'attivo'        => 1,
        'creato_il'     => date('Y-m-d H:i:s'),
      ]);
      avvisa("Utente $nome creato. Comunicagli email e password.");
    }
    reindirizza('impostazioni.php');
  }

  if ($azione === 'cambia_utente') {
    $idU = (int) p('id');
    $u = riga('select * from utenti where id = ?', [$idU]);
    if ($u === null) reindirizza('impostazioni.php');

    if (p('cosa') === 'attiva') {
      // Non ci si puo' disattivare da soli: resterebbe un gestionale senza
      // nessuno che possa rientrare.
      if ($idU === (int) utente()['id']) {
        avvisa('Non puoi disattivare il tuo stesso accesso.');
      } else {
        q('update utenti set attivo = ? where id = ?', [$u['attivo'] ? 0 : 1, $idU]);
        avvisa('Utente aggiornato.');
      }
    }
    if (p('cosa') === 'password') {
      $pw = p('password_nuova');
      if (strlen($pw) < 8) {
        avvisa('La password deve avere almeno 8 caratteri.');
      } else {
        q('update utenti set password_hash = ? where id = ?', [password_hash($pw, PASSWORD_DEFAULT), $idU]);
        avvisa('Password cambiata.');
      }
    }
    reindirizza('impostazioni.php');
  }
}

$utenti = righe('select * from utenti order by nome, email');
$registro = righe('select * from avvisi_log order by id desc limit 5');
$posta = conf('posta');

intestazione('Impostazioni');
?>

<div class="scheda">
  <h2 style="margin-top:0">Regole dello scadenzario</h2>
  <form method="post">
    <?= campo_gettone() ?>
    <input type="hidden" name="azione" value="regole">
    <div class="campi">
      <div><label>Cadenza della verifica periodica (mesi)
          <span class="aiuto">La norma vigente per i registratori telematici dice 24</span></label>
        <input type="number" name="mesi_verifica" min="1" value="<?= (int) mesi_verifica() ?>"></div>
      <div><label>Preavviso (giorni)
          <span class="aiuto">Da quanti giorni prima una scadenza compare</span></label>
        <input type="number" name="giorni_avviso" min="1" value="<?= (int) giorni_avviso() ?>"></div>
      <div class="larga"><label class="spunta">
        <input type="checkbox" name="avvisi_attivi" value="1" <?= impostazione('avvisi_attivi', '1') === '1' ? 'checked' : '' ?>>
        Avvisi per email attivi</label></div>
    </div>
    <div class="azioni"><button type="submit">Salva</button></div>
  </form>
  <p class="sotto">Cambiare la cadenza ricalcola subito tutte le prossime verifiche: non sono
    memorizzate, si ottengono dall'ultima verifica di ciascun apparecchio.</p>
</div>

<div class="scheda">
  <h2 style="margin-top:0">Avvisi per email</h2>
  <table>
    <tr><td>Casella che manda</td><td><?= h((string) ($posta['utente'] ?? '')) ?></td></tr>
    <tr><td>Server</td><td><?= h((string) ($posta['server'] ?? '')) ?>:<?= (int) ($posta['porta'] ?? 0) ?>
      (<?= h((string) ($posta['sicurezza'] ?? '')) ?>)</td></tr>
    <tr><td>Destinatari</td><td><?= h((string) ($posta['destinatari'] ?? '')) ?></td></tr>
  </table>
  <p class="sotto">Questi valori stanno in <code>configurazione.php</code>, non nel database:
    una password di posta non deve finire in una tabella.</p>

  <form method="post">
    <?= campo_gettone() ?>
    <input type="hidden" name="azione" value="prova">
    <div class="azioni"><button type="submit">Manda una prova adesso</button></div>
  </form>

  <?php if ($prova !== null): ?>
    <p class="<?= $prova['ok'] ? 'fatto' : 'errore' ?>" style="margin-top:12px">
      <?= h($prova['messaggio']) ?>
    </p>
  <?php endif ?>

  <?php if ($registro !== []): ?>
    <h3 style="font-size:14px;margin-top:16px">Ultimi invii</h3>
    <table>
      <tr><th>Quando</th><th>Esito</th><th>Scadute</th><th>Messaggio</th></tr>
      <?php foreach ($registro as $r): ?>
        <tr>
          <td><?= h(date('d/m/Y H:i', strtotime((string) $r['inviato_il']))) ?></td>
          <td><span class="pillola <?= $r['esito'] === 'inviato' ? 'ok' : 'scadute' ?>"><?= h($r['esito']) ?></span></td>
          <td><?= (int) $r['scadute'] ?></td>
          <td style="font-size:13px"><?= h(mb_strimwidth((string) $r['messaggio'], 0, 90, '…')) ?></td>
        </tr>
      <?php endforeach ?>
    </table>
  <?php endif ?>

  <p class="sotto" style="margin-top:12px">
    Per mandarlo ogni mattina da solo, nel pannello dell'hosting c'e' il <b>cron</b>:
    <code>php <?= h(__DIR__) ?>/avvisi.php</code>, alle 7:00.
    Se il tuo hosting non lo permette, va bene anche chiamare
    <code><?= h((string) conf('indirizzo_sito')) ?>/avvisi.php?chiave=…</code> con la parola
    che hai messo in configurazione.php.
  </p>
</div>

<div class="scheda">
  <h2 style="margin-top:0">Utenti</h2>
  <table>
    <tr><th>Nome</th><th>Email</th><th>Ruolo</th><th></th></tr>
    <?php foreach ($utenti as $u): ?>
      <tr>
        <td><?= h($u['nome']) ?><?= $u['attivo'] ? '' : ' <span class="pillola">disattivato</span>' ?></td>
        <td><?= h($u['email']) ?></td>
        <td><?= $u['ruolo'] === 'admin' ? 'amministratore' : 'tecnico' ?></td>
        <td>
          <form method="post" style="display:flex;gap:6px;flex-wrap:wrap">
            <?= campo_gettone() ?>
            <input type="hidden" name="azione" value="cambia_utente">
            <input type="hidden" name="id" value="<?= (int) $u['id'] ?>">
            <input type="hidden" name="cosa" value="attiva">
            <button type="submit" class="neutro"><?= $u['attivo'] ? 'Disattiva' : 'Riattiva' ?></button>
          </form>
          <form method="post" style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
            <?= campo_gettone() ?>
            <input type="hidden" name="azione" value="cambia_utente">
            <input type="hidden" name="id" value="<?= (int) $u['id'] ?>">
            <input type="hidden" name="cosa" value="password">
            <input type="password" name="password_nuova" placeholder="nuova password" minlength="8"
                   autocomplete="new-password" style="max-width:180px">
            <button type="submit" class="neutro">Cambia</button>
          </form>
        </td>
      </tr>
    <?php endforeach ?>
  </table>

  <h3 style="font-size:14px;margin-top:20px">Aggiungi un tecnico</h3>
  <form method="post">
    <?= campo_gettone() ?>
    <input type="hidden" name="azione" value="nuovo_utente">
    <div class="campi">
      <div><label>Nome e cognome</label><input type="text" name="nome" required></div>
      <div><label>Email</label><input type="email" name="email" required></div>
      <div><label>Password <span class="aiuto">Almeno 8 caratteri</span></label>
        <input type="text" name="password" minlength="8" required></div>
      <div><label>Ruolo</label>
        <select name="ruolo">
          <option value="tecnico">Tecnico</option>
          <option value="admin">Amministratore</option>
        </select></div>
    </div>
    <div class="azioni"><button type="submit">Crea l'utente</button></div>
  </form>
</div>

<div class="scheda">
  <h2 style="margin-top:0">Questo sito</h2>
  <table>
    <tr><td>PHP</td><td><?= h(PHP_VERSION) ?></td></tr>
    <tr><td>Database</td><td><?= h((string) db()->getAttribute(PDO::ATTR_DRIVER_NAME)) ?>
      <?= h((string) db()->getAttribute(PDO::ATTR_SERVER_VERSION)) ?></td></tr>
    <tr><td>Clienti / apparecchi / interventi</td>
      <td><?= (int) valore('select count(*) from clienti') ?> ·
          <?= (int) valore('select count(*) from apparecchi') ?> ·
          <?= (int) valore('select count(*) from interventi') ?></td></tr>
  </table>
  <div class="azioni">
    <?= bottone('esporta.php?cosa=clienti', 'Esporta i clienti in CSV', 'neutro') ?>
    <?= bottone('esporta.php?cosa=apparecchi', 'Esporta gli apparecchi', 'neutro') ?>
    <?= bottone('installa.php', 'Aggiorna le tabelle', 'neutro') ?>
  </div>
</div>

<?php piede(); ?>
