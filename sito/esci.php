<?php
declare(strict_types=1);
require_once __DIR__ . '/comune.php';
avvia_sessione();
$_SESSION = [];
session_destroy();
reindirizza('entra.php');
