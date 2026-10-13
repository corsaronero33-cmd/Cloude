/* ===========================================================================
   Il poco JavaScript che serve. Scritto a mano, senza librerie: si legge
   tutto in cinque minuti.

   Tre cose:
     1. le tendine collegate (cambi cliente, cambiano sedi e apparecchi);
     2. la firma del cliente col dito;
     3. la bozza del rapportino salvata nel telefono, nel caso cada la linea.
   =========================================================================== */

(function () {
  'use strict';

  // --- 1. tendine collegate -------------------------------------------------
  //
  // La tendina del cliente ha  data-collega="sede_id,apparecchio_id" : sono
  // gli id delle tendine da rifare quando cambia. I dati stanno in
  // window.ELENCHI, messi la' dalla pagina.

  function rifaiTendina(bersaglio, voci, clienteId) {
    var scelto = bersaglio.getAttribute('data-scelto') || '';
    var mie = voci.filter(function (v) { return String(v.cliente_id) === String(clienteId); });

    bersaglio.innerHTML = '';
    var vuota = document.createElement('option');
    vuota.value = '';
    vuota.textContent = mie.length ? '—' : '(nessuna per questo cliente)';
    bersaglio.appendChild(vuota);

    mie.forEach(function (v) {
      var o = document.createElement('option');
      o.value = v.id;
      o.textContent = v.etichetta || v.nome || v.matricola;
      if (String(v.id) === scelto) o.selected = true;
      bersaglio.appendChild(o);
    });
  }

  var sorgente = document.querySelector('[data-collega]');
  if (sorgente && window.ELENCHI) {
    var bersagli = sorgente.getAttribute('data-collega').split(',');
    sorgente.addEventListener('change', function () {
      bersagli.forEach(function (idBersaglio) {
        var b = document.getElementById(idBersaglio.trim());
        if (!b) return;
        var nome = b.getAttribute('data-elenco');
        var voci = (window.ELENCHI || {})[nome] || [];
        b.setAttribute('data-scelto', '');
        rifaiTendina(b, voci, sorgente.value);
      });
    });
  }

  // --- 2. la firma ----------------------------------------------------------

  var tela = document.getElementById('firma');
  if (tela) {
    var campo = document.getElementById('firma_png');
    var disegna = false;
    var vuota = true;
    var ctx = tela.getContext('2d');

    // Il canvas va dimensionato in pixel veri, altrimenti su telefono la
    // firma esce sfocata e spostata rispetto al dito.
    function misura() {
      var r = tela.getBoundingClientRect();
      var scala = window.devicePixelRatio || 1;
      var dati = vuota ? null : tela.toDataURL();
      tela.width = Math.round(r.width * scala);
      tela.height = Math.round(r.height * scala);
      ctx = tela.getContext('2d');
      ctx.scale(scala, scala);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#0f172a';
      if (dati) { var i = new Image(); i.onload = function () { ctx.drawImage(i, 0, 0, r.width, r.height); }; i.src = dati; }
    }
    misura();
    window.addEventListener('resize', misura);

    function punto(e) {
      var r = tela.getBoundingClientRect();
      var t = e.touches ? e.touches[0] : e;
      return { x: t.clientX - r.left, y: t.clientY - r.top };
    }
    function giu(e) { e.preventDefault(); disegna = true; var pt = punto(e); ctx.beginPath(); ctx.moveTo(pt.x, pt.y); }
    function muovi(e) {
      if (!disegna) return;
      e.preventDefault();
      var pt = punto(e);
      ctx.lineTo(pt.x, pt.y); ctx.stroke();
      vuota = false;
    }
    function su() {
      if (!disegna) return;
      disegna = false;
      if (campo && !vuota) campo.value = tela.toDataURL('image/png');
    }

    ['mousedown', 'touchstart'].forEach(function (n) { tela.addEventListener(n, giu, { passive: false }); });
    ['mousemove', 'touchmove'].forEach(function (n) { tela.addEventListener(n, muovi, { passive: false }); });
    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(function (n) { tela.addEventListener(n, su); });

    var pulisci = document.getElementById('pulisci-firma');
    if (pulisci) {
      pulisci.addEventListener('click', function () {
        ctx.clearRect(0, 0, tela.width, tela.height);
        vuota = true;
        if (campo) campo.value = '';
      });
    }
  }

  // --- 3. la bozza del rapportino ------------------------------------------
  //
  // Il form dell'intervento ha  data-bozza="chiave" . Ogni due secondi quello
  // che c'e' scritto finisce nella memoria del browser. Se la linea cade
  // mentre il tecnico compila, riaprendo la pagina il testo e' ancora la'.
  // Appena il salvataggio sul server riesce, la bozza viene buttata.

  var form = document.querySelector('form[data-bozza]');
  if (form && window.localStorage) {
    var chiave = 'bozza:' + form.getAttribute('data-bozza');

    function campi() {
      return Array.prototype.filter.call(
        form.querySelectorAll('input, select, textarea'),
        function (c) {
          return c.name && c.type !== 'hidden' && c.type !== 'password' && c.name !== 'firma_png';
        },
      );
    }

    function leggi() {
      var d = {};
      campi().forEach(function (c) {
        d[c.name] = c.type === 'checkbox' ? (c.checked ? 1 : 0) : c.value;
      });
      return d;
    }

    function scrivi(d) {
      campi().forEach(function (c) {
        if (!(c.name in d)) return;
        if (c.type === 'checkbox') c.checked = !!d[c.name];
        else c.value = d[c.name];
      });
    }

    var avvisoBozza = document.getElementById('avviso-bozza');
    try {
      var salvata = JSON.parse(localStorage.getItem(chiave) || 'null');
      if (salvata && avvisoBozza) {
        avvisoBozza.hidden = false;
        var riprendi = document.getElementById('riprendi-bozza');
        var butta = document.getElementById('butta-bozza');
        if (riprendi) riprendi.addEventListener('click', function () { scrivi(salvata); avvisoBozza.hidden = true; });
        if (butta) butta.addEventListener('click', function () { localStorage.removeItem(chiave); avvisoBozza.hidden = true; });
      }
    } catch (e) { /* memoria non disponibile: si lavora senza bozza */ }

    setInterval(function () {
      try { localStorage.setItem(chiave, JSON.stringify(leggi())); } catch (e) {}
    }, 2000);

    form.addEventListener('submit', function () {
      // Il salvataggio parte: la bozza non serve piu'. Se la richiesta non
      // arrivasse, la pagina non cambia e il salvataggio automatico qui sopra
      // la riscrive entro due secondi.
      try { localStorage.removeItem(chiave); } catch (e) {}
    });
  }
})();
