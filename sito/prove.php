<?php
// ============================================================================
// Le prove automatiche.  Si lanciano cosi':
//
//     php prove.php
//
// Girano su un database temporaneo (SQLite, un file che viene buttato alla
// fine): non toccano i tuoi dati e non mandano email a nessuno.
//
// Provano le cose che possono sbagliare in silenzio: l'aritmetica delle date,
// le regole con cui una scadenza entra in una fascia, il numero progressivo
// dei rapportini, e che un nome di cliente scritto con le virgolette non
// rompa l'email degli avvisi.
// ============================================================================

declare(strict_types=1);

$file_db = tempnam(sys_get_temp_dir(), 'prove') . '.sqlite';

$GLOBALS['CONFIGURAZIONE'] = [
  'db' => ['dsn' => 'sqlite:' . $file_db, 'utente' => null, 'password' => null],
  'azienda' => ['nome' => 'Assistenza di Prova'],
  'posta' => ['server' => '', 'destinatari' => '', 'mittente' => ''],
  'indirizzo_sito' => 'https://esempio.it',
  'chiave_avvisi' => 'x',
];

require_once __DIR__ . '/comune.php';
require_once __DIR__ . '/schema.php';
require_once __DIR__ . '/scadenze.php';
require_once __DIR__ . '/avvisi.php';
require_once __DIR__ . '/eliminazioni.php';

// --- il minimo indispensabile per contare i successi e gli errori ----------

$fatte = 0;
$sbagliate = [];

function prova(string $cosa, mixed $atteso, mixed $ottenuto): void
{
  global $fatte, $sbagliate;
  $fatte++;
  if ($atteso === $ottenuto) return;
  $sbagliate[] = sprintf(
    "  %s\n     atteso:   %s\n     ottenuto: %s",
    $cosa,
    var_export($atteso, true),
    var_export($ottenuto, true),
  );
}

function prova_vero(string $cosa, bool $ottenuto): void { prova($cosa, true, $ottenuto); }

// --- le date ----------------------------------------------------------------

prova('data italiana', '2026-03-10', data_iso('10/03/2026'));
prova('data con i trattini', '2026-03-10', data_iso('10-3-2026'));
prova('anno a due cifre', '2026-03-10', data_iso('10/3/26'));
prova('anno a due cifre, secolo scorso', '1998-03-10', data_iso('10/3/98'));
prova('data gia\' nel formato del database', '2026-03-10', data_iso('2026-03-10'));
prova('campo vuoto', null, data_iso(''));
prova('data che non esiste', null, data_iso('31/02/2026'));
prova('giorno impossibile', null, data_iso('45/01/2026'));
prova('testo qualunque', null, data_iso('domani'));
prova('ritorno a schermo', '10/03/2026', data_it('2026-03-10'));

// Il pezzo che sbaglia chi lo scrive di fretta: 31 gennaio piu' un mese.
prova('31 gennaio + 1 mese', '2026-02-28', aggiungi_mesi('2026-01-31', 1));
prova('31 gennaio + 1 mese in anno bisestile', '2028-02-29', aggiungi_mesi('2028-01-31', 1));
prova('29 febbraio + 24 mesi', '2026-02-28', aggiungi_mesi('2024-02-29', 24));
prova('fine anno', '2028-12-15', aggiungi_mesi('2026-12-15', 24));
prova('cambio d\'anno', '2027-01-31', aggiungi_mesi('2026-10-31', 3));
prova('mese con 30 giorni', '2026-04-30', aggiungi_mesi('2026-03-31', 1));

prova('giorni fra due date', 7, giorni_a('2026-10-20', '2026-10-13'));
prova('giorni di una data passata', -5, giorni_a('2026-10-08', '2026-10-13'));
prova('ora legale non sposta i giorni', 1, giorni_a('2026-03-29', '2026-03-28'));

prova('a parole, oggi', 'oggi', quando(0));
prova('a parole, in ritardo', 'in ritardo di 12 giorni', quando(-12));

// --- le fasce ---------------------------------------------------------------

prova('in ritardo', 'scadute', fascia(-1, 60));
prova('oggi e\' entro sette giorni', 'sette', fascia(0, 60));
prova('il settimo giorno', 'sette', fascia(7, 60));
prova('l\'ottavo giorno', 'mese', fascia(8, 60));
prova('il trentesimo', 'mese', fascia(30, 60));
prova('il trentunesimo', 'arrivo', fascia(31, 60));
prova('oltre il preavviso non si mostra', null, fascia(61, 60));

// --- il database ------------------------------------------------------------

foreach (tabelle() as $sql) db()->exec(adatta_ddl($sql));
foreach (impostazioni_di_partenza() as $k => $v) {
  q('insert into impostazioni (chiave, valore) values (?, ?)', [$k, $v]);
}

prova('impostazione di partenza', 24, mesi_verifica());

// Scrivere e rileggere nella stessa richiesta: sembra ovvio, e per un po' non
// ha funzionato (la copia in memoria non veniva aggiornata).
imposta('mesi_verifica', '36');
prova('un\'impostazione appena scritta si rilegge subito', 36, mesi_verifica());
prova('e anche direttamente', '36', impostazione('mesi_verifica'));
imposta('mesi_verifica', '24');
prova('rimessa com\'era', 24, mesi_verifica());

$adesso = date('Y-m-d H:i:s');
$cliente = salva_riga('clienti', [
  'ragione_sociale' => 'Bar "Il Sole" <di Rossi>',
  'creato_il' => $adesso, 'aggiornato_il' => $adesso,
]);

// Un apparecchio verificato 24 mesi meno 5 giorni fa: la prossima verifica
// cade fra cinque giorni, quindi deve stare nella fascia "entro 7 giorni".
$fraCinque = aggiungi_mesi(date('Y-m-d', strtotime('+5 days')), -24);
salva_riga('apparecchi', [
  'cliente_id' => $cliente, 'matricola' => 'AAA111', 'tipo' => 'rt',
  'data_ultima_verifica' => $fraCinque, 'verifica_trasmessa' => 0, 'collegato_pos' => 0,
  'stato' => 'attivo', 'creato_il' => $adesso, 'aggiornato_il' => $adesso,
]);

// Uno verificato troppo tempo fa: in ritardo.
salva_riga('apparecchi', [
  'cliente_id' => $cliente, 'matricola' => 'BBB222', 'tipo' => 'rt',
  'data_ultima_verifica' => aggiungi_mesi(date('Y-m-d', strtotime('-40 days')), -24),
  'verifica_trasmessa' => 1, 'collegato_pos' => 1,
  'stato' => 'attivo', 'creato_il' => $adesso, 'aggiornato_il' => $adesso,
]);

// Uno dismesso: non deve comparire, anche se la data direbbe di si'.
salva_riga('apparecchi', [
  'cliente_id' => $cliente, 'matricola' => 'CCC333', 'tipo' => 'rt',
  'data_ultima_verifica' => aggiungi_mesi(oggi(), -30),
  'verifica_trasmessa' => 1, 'collegato_pos' => 1,
  'stato' => 'dismesso', 'creato_il' => $adesso, 'aggiornato_il' => $adesso,
]);

// Uno senza nessuna data: non si puo' calcolare niente, quindi niente.
salva_riga('apparecchi', [
  'cliente_id' => $cliente, 'matricola' => 'DDD444', 'tipo' => 'rt',
  'verifica_trasmessa' => 0, 'collegato_pos' => 1,
  'stato' => 'attivo', 'creato_il' => $adesso, 'aggiornato_il' => $adesso,
]);

salva_riga('contratti', [
  'cliente_id' => $cliente, 'tipo' => 'software', 'descrizione' => 'Canone gestionale',
  'data_scadenza' => date('Y-m-d', strtotime('+20 days')), 'periodicita' => 'annuale',
  'stato' => 'attivo', 'rinnovo_automatico' => 0,
  'creato_il' => $adesso, 'aggiornato_il' => $adesso,
]);

// Un contratto chiuso non e' una scadenza.
salva_riga('contratti', [
  'cliente_id' => $cliente, 'tipo' => 'noleggio', 'descrizione' => 'Noleggio finito',
  'data_scadenza' => date('Y-m-d', strtotime('+3 days')), 'periodicita' => 'annuale',
  'stato' => 'chiuso', 'rinnovo_automatico' => 0,
  'creato_il' => $adesso, 'aggiornato_il' => $adesso,
]);

$voci = scadenzario();
$conti = riepilogo($voci);

prova('quante scadenze in tutto', 3, count($voci));
prova('una in ritardo', 1, $conti['scadute']);
prova('una entro sette giorni', 1, $conti['sette']);
prova('il contratto fra venti giorni', 1, $conti['mese']);
prova('la piu\' urgente viene per prima', 'scadute', $voci[0]['fascia']);
prova_vero('l\'apparecchio dismesso non compare',
  !in_array('CCC333', array_map(fn($v) => str_replace('Matricola ', '', $v['dettaglio']), $voci), true));
prova_vero('l\'apparecchio senza date non compare',
  !in_array('DDD444', array_map(fn($v) => str_replace('Matricola ', '', $v['dettaglio']), $voci), true));
prova('una verifica da trasmettere', 1, count(da_trasmettere()));
prova('un POS da collegare', 1, count(pos_da_collegare()));

// --- il numero del rapportino ----------------------------------------------

// --- il numero del rapportino ----------------------------------------------

require_once __DIR__ . '/numeri.php';

prova('il primo rapportino dell\'anno', date('Y') . '/001', prossimo_numero());
prova('poi il secondo', date('Y') . '/002', prossimo_numero());

// Un numero gia' uscito non deve tornare: si crea il 003, lo si cancella, e
// il prossimo dev'essere il 004 e non di nuovo il 003. E' la ragione per cui
// il contatore viene memorizzato invece di guardare solo l'archivio.
$terzo = salva_riga('interventi', [
  'numero' => prossimo_numero(), 'cliente_id' => $cliente, 'tipo' => 'assistenza',
  'stato' => 'chiuso', 'data' => oggi(), 'creato_il' => $adesso, 'aggiornato_il' => $adesso,
]);
prova('il terzo e\' uscito', date('Y') . '/003',
  (string) valore('select numero from interventi where id = ?', [$terzo]));

q('delete from interventi where id = ?', [$terzo]);
prova('cancellato il terzo, il prossimo e\' il quarto', date('Y') . '/004', prossimo_numero());

// L'anno scorso non sposta il contatore di quest'anno.
salva_riga('interventi', [
  'numero' => (date('Y') - 1) . '/099', 'cliente_id' => $cliente, 'tipo' => 'assistenza',
  'stato' => 'chiuso', 'data' => (date('Y') - 1) . '-12-30',
  'creato_il' => $adesso, 'aggiornato_il' => $adesso,
]);
prova('l\'anno scorso non c\'entra', date('Y') . '/005', prossimo_numero());

// --- il messaggio dell'avviso ----------------------------------------------

$m = messaggio_avviso($voci, da_trasmettere(), 'https://esempio.it', 'Assistenza di Prova');

prova_vero('l\'oggetto dice quante sono in ritardo', str_contains($m['oggetto'], '1 in ritardo'));
prova_vero('il messaggio nomina il cliente', str_contains($m['html'], 'Bar &quot;Il Sole&quot;'));
prova_vero('le virgolette e i segni del nome sono messi al sicuro',
  str_contains($m['html'], '&lt;di Rossi&gt;') && !str_contains($m['html'], '<di Rossi>'));
prova_vero('c\'e\' il pulsante per aprire il gestionale', str_contains($m['html'], 'https://esempio.it'));
prova('il conto delle scadute nel messaggio', 1, $m['scadute']);

$vuoto = messaggio_avviso([], [], '', 'X');
prova_vero('senza scadenze lo dice', str_contains($vuoto['html'], 'Niente in scadenza'));

// --- cancellare ------------------------------------------------------------
//
// E' l'unica parte che distrugge dati, quindi si prova due cose: che porti via
// tutto quello che deve, e che non tocchi niente di quello che non deve.

$conti = collegati_al_cliente($cliente);
prova('conta le sedi del cliente', 0, $conti['sedi']);
prova('conta gli apparecchi', 4, $conti['apparecchi']);
prova('conta i contratti', 2, $conti['contratti']);
prova_vero('conta anche gli interventi', $conti['interventi'] > 0);

prova('un solo apparecchio si dice al singolare', '1 apparecchio',
  descrivi_collegati(['sedi' => 0, 'apparecchi' => 1, 'contratti' => 0, 'interventi' => 0]));
prova('piu\' cose si elencano', '2 apparecchi, 1 contratto',
  descrivi_collegati(['sedi' => 0, 'apparecchi' => 2, 'contratti' => 1, 'interventi' => 0]));
prova('niente collegato, niente da dire', '',
  descrivi_collegati(['sedi' => 0, 'apparecchi' => 0, 'contratti' => 0, 'interventi' => 0]));

// Un secondo cliente, che deve restare intatto quando si cancella il primo.
$altro = salva_riga('clienti', [
  'ragione_sociale' => 'Cliente da non toccare',
  'creato_il' => $adesso, 'aggiornato_il' => $adesso,
]);
salva_riga('apparecchi', [
  'cliente_id' => $altro, 'matricola' => 'ZZZ999', 'tipo' => 'rt',
  'verifica_trasmessa' => 0, 'collegato_pos' => 0, 'stato' => 'attivo',
  'creato_il' => $adesso, 'aggiornato_il' => $adesso,
]);

// Un intervento con due righe, per vedere che spariscano anche quelle.
$conRighe = salva_riga('interventi', [
  'numero' => '2026/900', 'cliente_id' => $cliente, 'tipo' => 'assistenza',
  'stato' => 'chiuso', 'data' => oggi(), 'creato_il' => $adesso, 'aggiornato_il' => $adesso,
]);
foreach (['Manodopera', 'Ricambio'] as $voce) {
  salva_riga('intervento_righe', [
    'intervento_id' => $conRighe, 'descrizione' => $voce, 'quantita' => 1, 'prezzo' => 10,
  ]);
}
prova('le righe sono state scritte', 2,
  (int) valore('select count(*) from intervento_righe where intervento_id = ?', [$conRighe]));

elimina_intervento($conRighe);
prova('l\'intervento e\' sparito', 0,
  (int) valore('select count(*) from interventi where id = ?', [$conRighe]));
prova('e con lui le sue righe', 0,
  (int) valore('select count(*) from intervento_righe where intervento_id = ?', [$conRighe]));

$righePrima = (int) valore('select count(*) from intervento_righe');
elimina_cliente($cliente);

prova('il cliente e\' sparito', 0, (int) valore('select count(*) from clienti where id = ?', [$cliente]));
prova('i suoi apparecchi anche', 0, (int) valore('select count(*) from apparecchi where cliente_id = ?', [$cliente]));
prova('i suoi contratti anche', 0, (int) valore('select count(*) from contratti where cliente_id = ?', [$cliente]));
prova('i suoi interventi anche', 0, (int) valore('select count(*) from interventi where cliente_id = ?', [$cliente]));
prova('non restano righe orfane', 0, (int) valore('select count(*) from intervento_righe'));

// La parte che conta di piu': l'altro cliente non e' stato toccato.
prova('l\'altro cliente e\' ancora li\'', 1, (int) valore('select count(*) from clienti where id = ?', [$altro]));
prova('e il suo apparecchio pure', 1, (int) valore('select count(*) from apparecchi where cliente_id = ?', [$altro]));

// --- il tecnico che ha firmato dei rapportini ------------------------------
//
// Non si cancella: il suo nome sta su documenti gia' consegnati ai clienti.

$tecnico = salva_riga('utenti', [
  'email' => 'tecnico@prova.it', 'password_hash' => 'x', 'nome' => 'Tecnico di Prova',
  'ruolo' => 'tecnico', 'attivo' => 1, 'creato_il' => $adesso,
]);
prova('un tecnico appena creato non ha rapportini', 0, interventi_del_tecnico($tecnico));

$suo = salva_riga('interventi', [
  'numero' => '2026/901', 'cliente_id' => $altro, 'tecnico_id' => $tecnico,
  'tipo' => 'assistenza', 'stato' => 'chiuso', 'data' => oggi(),
  'creato_il' => $adesso, 'aggiornato_il' => $adesso,
]);
prova('dopo un rapportino, ne ha uno', 1, interventi_del_tecnico($tecnico));

elimina_intervento($suo);
prova('tolto il rapportino, torna a zero', 0, interventi_del_tecnico($tecnico));

// --- conclusione ------------------------------------------------------------

unlink($file_db);

echo "\n";
if ($sbagliate === []) {
  echo "TUTTO BENE: $fatte prove passate.\n";
  exit(0);
}
echo count($sbagliate), " prove sbagliate su $fatte:\n\n";
echo implode("\n\n", $sbagliate), "\n\n";
exit(1);
