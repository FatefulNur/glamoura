/* Glamoura shared helpers: header, theme, storage, formatting, copy, service worker */
(function () {
  var TOOLS = [
    ['calc.html', 'অর্ডার ক্যালকুলেটর'],
    ['price.html', 'দাম নির্ধারণ'],
    ['reconcile.html', 'Pathao হিসাব'],
    ['split.html', 'Extra Cost ভাগ'],
    ['lot.html', 'লট প্ল্যানার'],
    ['messages.html', 'মেসেজ'],
    ['checklist.html', 'Checklist'],
    ['guide.html', 'গাইড']
  ];

  var G = {
    store: {
      get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
      set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
    },
    // ৳ 1,234  (Bengali digits, bn-BD grouping)
    taka: function (x) {
      x = Number(x) || 0;
      var s = Math.abs(x).toLocaleString('bn-BD', { maximumFractionDigits: 2 });
      return (x < 0 ? '−' : '') + '৳' + s;
    },
    bn: function (x) { return String(x).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[d]; }); },
    num: function (v) { var x = parseFloat(String(v).replace(/,/g, '')); return isFinite(x) ? x : 0; },
    // Today's date key in Asia/Dhaka (YYYY-MM-DD)
    today: function () {
      try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date()); }
      catch (e) { return new Date().toISOString().slice(0, 10); }
    },
    copy: function (text, btn) {
      var done = function () { if (btn) { var t = btn.textContent; btn.textContent = 'কপি হয়েছে ✓'; setTimeout(function () { btn.textContent = t; }, 1400); } };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
      function fallback() {
        var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    },
    esc: function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); },
    theme: function (t) {
      if (t) { G.store.set('gl-theme', t); }
      t = G.store.get('gl-theme', '');
      if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme');
    },
    header: function (current) {
      var bar = document.getElementById('bar');
      if (!bar) return;
      bar.className = 'bar';
      bar.innerHTML = '<a class="brand" href="index.html"><b>Glamoura</b></a>' +
        (current !== 'index.html' ? '<a class="nl" href="index.html">← সব টুল</a>' : '') +
        '<button type="button" id="themeBtn" aria-label="থিম বদলান">◐ থিম</button>';
      document.getElementById('themeBtn').onclick = function () {
        var cur = document.documentElement.getAttribute('data-theme');
        var dark = cur ? cur === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
        G.theme(dark ? 'light' : 'dark');
      };
    },
    tools: TOOLS
  };

  G.theme();
  document.addEventListener('DOMContentLoaded', function () {
    var f = location.pathname.split('/').pop() || 'index.html';
    G.header(f);
  });
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
  window.G = G;
})();
