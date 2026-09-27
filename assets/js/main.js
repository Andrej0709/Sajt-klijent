/* Auto Servis Vlada — interakcije (bez biblioteka) */
(function () {
  'use strict';

  clearTimeout(window.__jsFallback);

  var root = document.documentElement;
  var PHONE = '+381641200900';
  var PHONE_LABEL = '+381 64 1200900';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- Zaglavlje ---------- */
  var header = $('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobilni meni ---------- */
  var toggle = $('.menu-toggle');
  var menu = $('#mobile-menu');
  var outside = [$('#main'), $('.footer'), $('.action-bar')];

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
    menu.classList.toggle('is-open', open);
    header.classList.toggle('is-menu-open', open);
    root.classList.toggle('menu-open', open);
    outside.forEach(function (el) {
      if (!el) return;
      if (open) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
    });
    if (open) {
      var first = $('a', menu);
      if (first) first.focus({ preventScroll: true });
    }
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });
    var desktop = window.matchMedia('(min-width: 1000px)');
    var onDesktop = function (e) { if (e.matches) setMenu(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onDesktop);
    else if (desktop.addListener) desktop.addListener(onDesktop);
  }

  /* ---------- Aktivna stavka u navigaciji ---------- */
  var navLinks = $$('.nav a[href^="#"]');
  if (hasIO && navLinks.length) {
    var spyTargets = navLinks
      .map(function (a) { return $(a.getAttribute('href')); })
      .concat($('#pocetna'))
      .filter(Boolean);
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyTargets.forEach(function (el) { spy.observe(el); });
  }

  /* ---------- Pojavljivanje pri skrolovanju ---------- */
  var reveals = $$('.reveal');
  if (!hasIO || reduceMotion) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealIO.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { revealIO.observe(el); });
  }

  /* ---------- Radno vreme: otvoreno / zatvoreno (vreme u Beogradu) ---------- */
  var HOURS = { 0: null, 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [9, 17], 6: [9, 17] };
  var DAYS_ACC = ['nedelju', 'ponedeljak', 'utorak', 'sredu', 'četvrtak', 'petak', 'subotu'];

  function belgradeNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Belgrade', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
      }).formatToParts(new Date());
      var p = {};
      parts.forEach(function (part) { p[part.type] = part.value; });
      var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
      var hour = parseInt(p.hour, 10) % 24;
      if (day === -1 || isNaN(hour)) throw new Error('format');
      return { day: day, min: hour * 60 + parseInt(p.minute, 10) };
    } catch (err) {
      var d = new Date();
      return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function hh(h) { return (h < 10 ? '0' : '') + h + ':00'; }

  function getStatus(now) {
    var today = HOURS[now.day];
    if (today && now.min >= today[0] * 60 && now.min < today[1] * 60) {
      var left = today[1] * 60 - now.min;
      return {
        open: true,
        text: left <= 60 ? 'Otvoreno · zatvaramo za ' + left + ' min' : 'Otvoreno · radimo do ' + hh(today[1])
      };
    }
    if (today && now.min < today[0] * 60) {
      return { open: false, text: 'Zatvoreno · otvaramo danas u ' + hh(today[0]) };
    }
    for (var i = 1; i <= 7; i++) {
      var d = (now.day + i) % 7;
      if (HOURS[d]) {
        return { open: false, text: 'Zatvoreno · otvaramo ' + (i === 1 ? 'sutra' : 'u ' + DAYS_ACC[d]) + ' u ' + hh(HOURS[d][0]) };
      }
    }
    return { open: false, text: 'Zatvoreno' };
  }

  function renderStatus() {
    var now = belgradeNow();
    var status = getStatus(now);
    $$('[data-status]').forEach(function (el) {
      el.hidden = false;
      el.setAttribute('data-state', status.open ? 'open' : 'closed');
      var text = $('[data-status-text]', el);
      if (text) text.textContent = status.text;
    });
    $$('.hours tr[data-days]').forEach(function (row) {
      var days = row.getAttribute('data-days').split(',');
      row.classList.toggle('is-today', days.indexOf(String(now.day)) !== -1);
    });
  }
  renderStatus();
  setInterval(renderStatus, 60 * 1000);

  /* ---------- Dijagnostički panel u hero sekciji ---------- */
  (function () {
    var diag = $('[data-diag]');
    if (!diag) return;
    var svg = $('svg', diag);
    if (reduceMotion || !hasIO || !svg) {
      diag.classList.add('is-done');
      return;
    }

    var checks = $$('[data-check]', diag);
    var spots = $$('.hotspot', svg);
    var smil = $$('animate, animateTransform', svg);
    var bar = $('[data-diag-bar]', diag);
    var pct = $('[data-diag-pct]', diag);
    var status = $('[data-diag-status]', diag);
    var STEP = 720;
    var START = 1100;

    function setProgress(p) {
      bar.style.setProperty('--p', p.toFixed(3));
      pct.textContent = Math.round(p * 100) + '%';
    }

    checks.forEach(function (c) { c.classList.remove('is-done'); });
    setProgress(0);
    status.textContent = 'Povezivanje…';

    function step(i) {
      if (i >= checks.length) {
        status.textContent = 'Vozilo spremno za put';
        diag.classList.add('is-done');
        return;
      }
      checks[i].classList.add('is-active');
      if (spots[i]) spots[i].classList.add('is-active');
      setTimeout(function () {
        checks[i].classList.remove('is-active');
        checks[i].classList.add('is-done');
        if (spots[i]) {
          spots[i].classList.remove('is-active');
          spots[i].classList.add('is-done');
        }
        step(i + 1);
      }, STEP);
    }

    function run() {
      diag.classList.add('is-running');
      setTimeout(function () {
        status.textContent = 'Skeniranje sistema…';
        smil.forEach(function (a) { try { a.beginElement(); } catch (err) { /* stari browser */ } });
        var total = STEP * checks.length;
        var t0 = null;
        requestAnimationFrame(function tick(t) {
          if (t0 === null) t0 = t;
          var p = Math.min(1, (t - t0) / total);
          setProgress(p);
          if (p < 1) requestAnimationFrame(tick);
        });
        step(0);
      }, START);
    }

    var started = false;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !started) {
          started = true;
          run();
        }
        if (svg.pauseAnimations) {
          if (entry.isIntersecting) svg.unpauseAnimations();
          else svg.pauseAnimations();
        }
      });
    }, { threshold: 0.3 }).observe(diag);
  })();

  /* ---------- Svetlo koje prati kursor na karticama ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('[data-glow]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Upit porukom: priprema SMS-a ---------- */
  var form = $('[data-sms-form]');
  if (form) {
    var vozilo = form.elements.vozilo;
    var note = $('[data-form-note]', form);

    function setError(show) {
      var field = vozilo.closest('.field');
      field.classList.toggle('has-error', show);
      vozilo.setAttribute('aria-invalid', show ? 'true' : 'false');
      $('.field__error', field).hidden = !show;
    }

    function setNote(text, success) {
      note.textContent = text;
      note.classList.toggle('is-success', !!success);
    }

    function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
      return new Promise(function (resolve, reject) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        document.body.removeChild(ta);
        if (ok) resolve(); else reject(new Error('copy'));
      });
    }

    vozilo.addEventListener('input', function () {
      if (vozilo.value.trim()) setError(false);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!vozilo.value.trim()) {
        setError(true);
        vozilo.focus();
        return;
      }

      var lines = [
        'Zdravo Vlado,',
        'zanima me: ' + form.elements.usluga.value + '.',
        'Vozilo: ' + vozilo.value.trim()
      ];
      var opis = form.elements.opis.value.trim();
      if (opis) lines.push('Opis: ' + opis);
      var ime = form.elements.ime.value.trim();
      if (ime) lines.push('Pozdrav, ' + ime);
      var text = lines.join('\n');

      var ua = navigator.userAgent;
      var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      var isMobile = isIOS || /Android|Mobi/i.test(ua);

      if (isMobile) {
        window.location.href = 'sms:' + PHONE + (isIOS ? '&' : '?') + 'body=' + encodeURIComponent(text);
        setNote('Otvara se aplikacija za poruke — proverite tekst i pritisnite „Pošalji“.', true);
      } else {
        copyText(text).then(function () {
          setNote('Tekst poruke je kopiran. Pošaljite ga SMS-om ili Viberom na ' + PHONE_LABEL + ' — ili jednostavno pozovite.', true);
        }, function () {
          setNote('Pošaljite poruku na ' + PHONE_LABEL + ' ili pozovite.', false);
        });
      }
    });
  }

  /* ---------- Traka za brzi kontakt (mobilni) ---------- */
  var actionBar = $('.action-bar');
  var hero = $('.hero');
  if (actionBar) {
    if (hasIO && hero) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          actionBar.classList.toggle('is-visible', !entry.isIntersecting);
        });
      }, { rootMargin: '-35% 0px 0px 0px' }).observe(hero);
    } else {
      actionBar.classList.add('is-visible');
    }
  }

  /* ---------- Godina u podnožju ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
