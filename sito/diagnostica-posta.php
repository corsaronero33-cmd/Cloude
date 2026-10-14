<?php
// ============================================================================
// Diagnostica della posta.
//
// Serve a rispondere a una domanda sola: le credenziali che il gestionale
// manda sono le stesse che funzionano nella webmail?
//
// Nel riquadro in alto c'e' quello che il server legge da configurazione.php
// (la password non viene mai mostrata: solo la sua forma). Nel riquadro sotto
// si possono provare altri valori scrivendoli a mano, senza ricaricare il
// file: se scritti a mano funzionano e nel file no, il problema e' nel file.
//
// Quando la posta va, questo file si puo' cancellare dal server.
// ============================================================================

declare(strict_types=1);

require_once __DIR__ . '/comune.php';
require_once __DIR__ . '/posta.php';
require_once __DIR__ . '/layout.php';

richiedi_amministratore();

/**
 * Descrive una password senza rivelarla: quasi sempre il guaio e' uno spazio
 * di troppo preso col copia-incolla, o un carattere che PHP interpreta.
 */
function forma_password(string $pw): array
{
  $note = [];
  if ($pw === '') $note[] = 'VUOTA';
  if ($pw !== trim($pw)) $note[] = 'ha spazi all\'inizio o alla fine';
  if (str_contains($pw, ' ')) $note[] = 'contiene uno spazio';
  if (str_contains($pw, '\\')) $note[] = 'contiene una barra rovesciata \\ (da raddoppiare nel file)';
  if (str_contains($pw, "'")) $note[] = 'contiene un apostrofo (da far precedere da \\ nel file)';
  if (preg_match('/[^\x20-\x7E]/', $pw)) $note[] = 'contiene caratteri non inglesi (accenti, simboli)';

  return [
    'lunghezza' => strlen($pw),
    'inizia'    => $pw === '' ? '' : mb_substr($pw, 0, 1),
    'finisce'   => $pw === '' ? '' : mb_substr($pw, -1),
    'note'      => $note,
  ];
}

$conf = conf('posta');
$esito = null;
$dialogo = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verifica_gettone();

  // I valori scritti nel form valgono per questa sola richiesta:
  // configurazione.php non viene toccato. `manda_email` guarda qui per primo.
  $GLOBALS['POSTA_DI_PROVA'] = [
    'server'        => p('server'),
    'porta'         => (int) p('porta', '465'),
    'sicurezza'     => p('sicurezza', 'ssl'),
    'utente'        => p('utente'),
    'password'      => (string) ($_POST['password'] ?? ''),
    'mittente'      => p('mittente') ?: p('utente'),
    'nome_mittente' => 'Gestione Assistenza',
    'destinatari'   => p('destinatari'),
  ];

  try {
    $esito = manda_email(
      array_map('trim', explode(',', p('destinatari'))),
      'Prova dal gestionale',
      '<p>Se leggi questo, la posta funziona.</p>',
    );
    $dialogo = (string) ($esito['dialogo'] ?? '');
  } finally {
    unset($GLOBALS['POSTA_DI_PROVA']);
  }
}

$forma = forma_password((string) ($conf['password'] ?? ''));

intestazione('Diagnostica della posta', 'Serve a capire perche\' il server rifiuta le credenziali');
?>

<div class="scheda">
  <h2 style="margin-top:0">Che cosa c'è in configurazione.php</h2>
  <table>
    <tr><td>Server</td><td><code><?= h((string) ($conf['server'] ?? '')) ?></code></td></tr>
    <tr><td>Porta e sicurezza</td>
        <td><code><?= (int) ($conf['porta'] ?? 0) ?></code> ·
            <code><?= h((string) ($conf['sicurezza'] ?? '')) ?></code>
            <?php $pa = (int) ($conf['porta'] ?? 0); $si = (string) ($conf['sicurezza'] ?? '');
                  if (($pa === 465 && $si !== 'ssl') || ($pa === 587 && $si !== 'starttls')): ?>
              <span class="pillola scadute">accoppiata insolita: 465 va con ssl, 587 con starttls</span>
            <?php endif ?></td></tr>
    <tr><td>Utente</td>
        <td><code><?= h((string) ($conf['utente'] ?? '')) ?></code>
            <?php if (!str_contains((string) ($conf['utente'] ?? ''), '@')): ?>
              <span class="pillola scadute">non è un indirizzo completo</span>
            <?php endif ?></td></tr>
    <tr><td>Mittente</td>
        <td><code><?= h((string) ($conf['mittente'] ?? '')) ?></code>
            <?php if (($conf['mittente'] ?? '') !== ($conf['utente'] ?? '')): ?>
              <span class="pillola sette">diverso dall'utente: molti server lo rifiutano</span>
            <?php endif ?></td></tr>
    <tr><td>Password</td>
        <td><?= (int) $forma['lunghezza'] ?> caratteri,
            da <code><?= h($forma['inizia']) ?></code> a <code><?= h($forma['finisce']) ?></code>
            <?php foreach ($forma['note'] as $nota): ?>
              <br><span class="pillola scadute"><?= h($nota) ?></span>
            <?php endforeach ?></td></tr>
  </table>
  <p class="sotto">Confronta la lunghezza e le due lettere con la password che usi nella
    webmail: se non combaciano, il file è diverso da quello che credi.</p>
</div>

<div class="scheda">
  <h2 style="margin-top:0">Prova con altri valori</h2>
  <p class="sotto">Questi non vengono salvati da nessuna parte: servono solo a questa
    prova. Se qui funziona, il guaio è in <code>configurazione.php</code>.</p>
  <form method="post">
    <?= campo_gettone() ?>
    <div class="campi">
      <div><label>Server</label>
        <input type="text" name="server" value="<?= h(p('server') ?: (string) ($conf['server'] ?? '')) ?>"></div>
      <div><label>Porta</label>
        <input type="number" name="porta" value="<?= h(p('porta') ?: (string) ($conf['porta'] ?? 465)) ?>"></div>
      <div><label>Sicurezza</label>
        <select name="sicurezza">
          <?php $sc = p('sicurezza') ?: (string) ($conf['sicurezza'] ?? 'ssl'); ?>
          <option value="ssl" <?= $sc === 'ssl' ? 'selected' : '' ?>>ssl (porta 465)</option>
          <option value="starttls" <?= $sc === 'starttls' ? 'selected' : '' ?>>starttls (porta 587)</option>
          <option value="no" <?= $sc === 'no' ? 'selected' : '' ?>>nessuna (sconsigliata)</option>
        </select></div>
      <div><label>Utente <span class="aiuto">L'indirizzo email completo</span></label>
        <input type="text" name="utente" value="<?= h(p('utente') ?: (string) ($conf['utente'] ?? '')) ?>"></div>
      <div><label>Password <span class="aiuto">Va riscritta a ogni prova: per sicurezza
          il campo non si ricorda</span></label>
        <input type="password" name="password" autocomplete="off" required></div>
      <div><label>Mittente</label>
        <input type="text" name="mittente" value="<?= h(p('mittente') ?: (string) ($conf['mittente'] ?? '')) ?>"></div>
      <div class="larga"><label>Manda a</label>
        <input type="text" name="destinatari" value="<?= h(p('destinatari') ?: (string) ($conf['destinatari'] ?? '')) ?>"></div>
    </div>
    <div class="azioni"><button type="submit">Prova adesso</button></div>
  </form>

  <?php if ($esito !== null): ?>
    <p class="<?= $esito['ok'] ? 'fatto' : 'errore' ?>" style="margin-top:14px">
      <?= h($esito['messaggio']) ?>
    </p>
    <p class="sotto">
      Ho provato con:
      <code><?= h(p('utente')) ?></code> su
      <code><?= h(p('server')) ?>:<?= (int) p('porta') ?></code>
      (<?= h(p('sicurezza')) ?>), password di
      <b><?= strlen((string) ($_POST['password'] ?? '')) ?> caratteri</b>.
    </p>
  <?php endif ?>

  <?php if ($dialogo !== ''): ?>
    <h3 style="font-size:14px;margin-top:16px">La conversazione col server</h3>
    <p class="sotto">La password non compare: dove è passata, c'è scritto «nascosto».
      Questo pezzo si può copiare e mandare a chi ti assiste.</p>
    <pre style="overflow-x:auto;background:#f1f5f9;padding:12px;border-radius:8px;font-size:13px"><?= h($dialogo) ?></pre>
  <?php endif ?>
</div>

<?php piede(); ?>
