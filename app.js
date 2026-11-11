(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const el = (t, a = {}, ...kids) => {
    const e = document.createElement(t);
    Object.entries(a).forEach(([n, v]) => (n in e ? (e[n] = v) : e.setAttribute(n, v)));
    e.append(...kids); return e;
  };
  const SL = [['x', 'X offset', -60, 60], ['y', 'Y offset', -60, 60], ['blur', 'Blur', 0, 100], ['spread', 'Spread', -40, 40]];
  const mk = (x, y, blur, spread, c, a, inset = false) => ({ x, y, blur, spread, c, a, inset });
  let layers = [mk(0, 10, 30, -5, '#000000', 0.25)];
  const PRESETS = [
    ['Soft', () => [mk(0, 10, 30, -5, '#000000', 0.25)]],
    ['Layered', () => [mk(0, 1, 2, 0, '#000000', 0.12), mk(0, 4, 8, 0, '#000000', 0.12), mk(0, 16, 32, 0, '#000000', 0.12)]],
    ['Lift', () => [mk(0, 2, 4, 0, '#000000', 0.2), mk(0, 20, 40, -10, '#000000', 0.35)]],
    ['Hard', () => [mk(8, 8, 0, 0, '#000000', 0.9)]],
    ['Glow', () => [mk(0, 0, 40, 4, '#4cc9f0', 0.7)]],
    ['Inset', () => [mk(0, 2, 6, 0, '#000000', 0.4, true)]],
    ['Neumorphic', () => [mk(10, 10, 20, 0, '#a3b1c6', 0.8), mk(-10, -10, 20, 0, '#ffffff', 0.9)]]
  ];

  const rgba = (l) => 'rgba(' + [1, 3, 5].map((i) => parseInt(l.c.slice(i, i + 2), 16)).join(', ') + ', ' + l.a + ')';
  const one = (l) => (l.inset ? 'inset ' : '') + l.x + 'px ' + l.y + 'px ' + l.blur + 'px ' + l.spread + 'px ' + rgba(l);
  function paint() {
    const v = layers.map(one);
    $('#box').style.boxShadow = v.join(', ');
    $('#css').textContent = 'box-shadow: ' + v.join(',\n    ') + ';';
    $('#canvas').style.background = $('#page').value;
    $('#box').style.background = $('#boxc').value;
  }
  function build() {
    const box = $('#layers'); box.textContent = '';
    layers.forEach((l, i) => {
      const f = el('fieldset', { className: 'layer' }, el('legend', {}, 'Layer ' + (i + 1)));
      SL.forEach(([k, label, min, max]) => {
        const o = el('output', {}, l[k] + 'px');
        const r = el('input', { type: 'range', min, max, value: l[k] });
        r.addEventListener('input', () => { l[k] = +r.value; o.textContent = l[k] + 'px'; paint(); });
        f.append(el('label', { className: 'rng' }, label, o, r));
      });
      const c = el('input', { type: 'color', value: l.c }); c.setAttribute('aria-label', 'Shadow color');
      c.addEventListener('input', () => { l.c = c.value; paint(); });
      const ao = el('output', {}, Math.round(l.a * 100) + '%');
      const a = el('input', { type: 'range', min: 0, max: 100, value: Math.round(l.a * 100) });
      a.addEventListener('input', () => { l.a = +a.value / 100; ao.textContent = a.value + '%'; paint(); });
      const ins = el('input', { type: 'checkbox', checked: l.inset });
      ins.addEventListener('change', () => { l.inset = ins.checked; paint(); });
      const rm = el('button', { type: 'button', disabled: layers.length <= 1 }, 'Remove');
      rm.addEventListener('click', () => { layers.splice(i, 1); build(); paint(); });
      f.append(el('div', { className: 'row2' }, c, el('label', { className: 'rng grow' }, 'Opacity', ao, a), el('label', { className: 'chk' }, ins, 'Inset'), rm));
      box.appendChild(f);
    });
    $('#add').disabled = layers.length >= 4;
  }
  const toast = (t) => { const e = $('#toast'); e.textContent = t; e.classList.add('show'); clearTimeout(toast.id); toast.id = setTimeout(() => e.classList.remove('show'), 1600); };

  $('#add').addEventListener('click', () => { layers.push(mk(0, 6, 16, 0, '#000000', 0.2)); build(); paint(); });
  $('#page').addEventListener('input', paint); $('#boxc').addEventListener('input', paint);
  $('#copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('#css').textContent); toast('CSS copied'); } catch { toast('Select the code and press Ctrl+C'); }
  });
  PRESETS.forEach(([name, make]) => {
    const b = el('button', { type: 'button' }, name);
    b.addEventListener('click', () => { layers = make(); build(); paint(); });
    $('#presets').appendChild(b);
  });

  const root = document.documentElement;
  try { root.dataset.theme = localStorage.getItem('shadowlab-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'); } catch { root.dataset.theme = 'dark'; }
  $('#theme').addEventListener('click', () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('shadowlab-theme', root.dataset.theme); } catch { /* ignore */ } });
  build(); paint();
})();
