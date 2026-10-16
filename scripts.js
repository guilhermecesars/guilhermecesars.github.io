/* Guilherme Cesar — portfolio v2 "Prisma". Vanilla JS, no dependencies. */
(() => {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ptr = { x: innerWidth / 2, y: innerHeight * 0.4, active: false };
  const root = document.documentElement;

  /* ---------- nav ---------- */
  function initNav() {
    const header = $('.site-header');
    const toggle = $('#navToggle');
    const nav = $('#mainNav');
    const onScroll = () => header && header.classList.toggle('is-scrolled', scrollY > 30);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    if (!toggle || !nav) return;
    const close = () => {
      nav.classList.remove('open'); toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
    };
    toggle.addEventListener('click', () => {
      const o = nav.classList.toggle('open');
      toggle.classList.toggle('open', o);
      toggle.setAttribute('aria-expanded', String(o));
      document.body.style.overflow = o ? 'hidden' : '';
    });
    $$('a', nav).forEach((a) => a.addEventListener('click', close));
    addEventListener('keydown', (e) => e.key === 'Escape' && close());

    const map = $$('a[href*="#"]', nav)
      .map((a) => ({ a, el: document.getElementById(a.getAttribute('href').split('#')[1] || '') }))
      .filter((x) => x.el);
    if (map.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        const m = map.find((x) => x.el === e.target);
        if (m) m.a.classList.toggle('is-active', e.isIntersecting);
      }), { rootMargin: '-45% 0px -50% 0px' });
      map.forEach((m) => io.observe(m.el));
    }
  }

  /* ---------- scroll: progress, reveal, statement, timeline ---------- */
  function initScroll() {
    const bar = $('.progress');
    const statement = $('.statement');
    const timeline = $('.timeline');
    let words = [];
    if (statement) {
      const walk = (node) => {
        Array.from(node.childNodes).forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((t) => {
              if (!t) return;
              if (/^\s+$/.test(t)) return frag.appendChild(document.createTextNode(t));
              const s = document.createElement('span'); s.className = 'w'; s.textContent = t; frag.appendChild(s); words.push(s);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) walk(n);
        });
      };
      walk(statement);
    }
    const update = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.transform = `scaleX(${h > 0 ? clamp(scrollY / h, 0, 1) : 0})`;
      if (statement && words.length) {
        const r = statement.getBoundingClientRect();
        const p = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35), 0, 1);
        const n = Math.round(p * words.length);
        words.forEach((w, i) => w.classList.toggle('on', i < n));
      }
      if (timeline) {
        const r = timeline.getBoundingClientRect();
        timeline.style.setProperty('--p', clamp((innerHeight * 0.65 - r.top) / r.height, 0, 1).toFixed(3));
      }
    };
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);

    const targets = $$('.reveal, .t-item');
    if (!('IntersectionObserver' in window)) return targets.forEach((t) => t.classList.add('is-visible'));
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible'); io.unobserve(e.target);
    }), { threshold: 0.15 });
    targets.forEach((t) => io.observe(t));
  }

  /* ---------- pointer: mesh, trail, magnetic, tilt, spotlight ---------- */
  function initPointer() {
    addEventListener('pointermove', (e) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.active = true; }, { passive: true });
    document.addEventListener('pointerleave', () => (ptr.active = false));

    // mesh spotlight follows with easing
    if (!reduce) {
      let x = ptr.x, y = ptr.y;
      (function loop() {
        x += (ptr.x - x) * 0.08; y += (ptr.y - y) * 0.08;
        root.style.setProperty('--mx', x.toFixed(1) + 'px');
        root.style.setProperty('--my', y.toFixed(1) + 'px');
        requestAnimationFrame(loop);
      })();
    }

    // neon trail
    const cv = $('#trail');
    if (cv && fine && !reduce) {
      const ctx = cv.getContext('2d');
      let w, h, dpr, last = null, hue = 330;
      const resize = () => { dpr = Math.min(devicePixelRatio || 1, 2); w = cv.width = innerWidth * dpr; h = cv.height = innerHeight * dpr; };
      resize(); addEventListener('resize', resize);
      (function loop() {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,0.09)';
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        if (ptr.active) {
          if (last) {
            hue = (hue + 2.2) % 360;
            ctx.strokeStyle = `hsla(${(hue % 120) + 300}, 100%, 62%, 0.55)`;
            ctx.lineWidth = 5 * dpr; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(last.x * dpr, last.y * dpr); ctx.lineTo(ptr.x * dpr, ptr.y * dpr); ctx.stroke();
          }
          last = { x: ptr.x, y: ptr.y };
        } else last = null;
        requestAnimationFrame(loop);
      })();
    }

    if (fine && !reduce) {
      $$('.btn, .magnetic').forEach((b) => {
        b.addEventListener('pointermove', (e) => {
          const r = b.getBoundingClientRect();
          b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.28}px, ${(e.clientY - r.top - r.height / 2) * 0.38}px)`;
        });
        b.addEventListener('pointerleave', () => (b.style.transform = ''));
      });
      const frame = $('.portrait-frame');
      if (frame) {
        frame.addEventListener('pointermove', (e) => {
          const r = frame.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
          frame.style.transform = `perspective(900px) rotateY(${px * 12}deg) rotateX(${-py * 12}deg)`;
        });
        frame.addEventListener('pointerleave', () => (frame.style.transform = ''));
      }
    }
    $$('.p-card').forEach((c) => c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--x', e.clientX - r.left + 'px'); c.style.setProperty('--y', e.clientY - r.top + 'px');
    }));
  }

  /* ---------- hero name ---------- */
  function initName() {
    const name = $('.name');
    if (!name) return;
    let idx = 0;
    $$('.row', name).forEach((row) => {
      const txt = row.textContent.trim();
      row.setAttribute('aria-hidden', 'true');
      row.textContent = '';
      const chars = Array.from(txt);
      chars.forEach((c, k) => {
        const s = document.createElement('span');
        s.className = 'ch'; s.textContent = c; s.style.setProperty('--i', idx++);
        s.style.setProperty('--t', (k / Math.max(1, chars.length - 1)).toFixed(2));
        row.appendChild(s);
      });
    });
    const letters = $$('.ch', name);
    if (reduce) return letters.forEach((l) => l.classList.add('ready'));
    setTimeout(() => letters.forEach((l) => l.classList.add('ready')), 2300);
    if (!fine) return;
    let rects = [];
    const measure = () => { rects = letters.map((l) => { const r = l.getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 + scrollY, w: r.width }; }); };
    setTimeout(measure, 2400); addEventListener('resize', measure);
    (function loop() {
      if (rects.length && ptr.active && scrollY < innerHeight) {
        letters.forEach((l, i) => {
          if (!l.classList.contains('ready')) return;
          const r = rects[i];
          const dx = ptr.x - r.cx, dy = ptr.y + scrollY - r.cy;
          const d = Math.hypot(dx, dy), R = 240;
          if (d < R) {
            const f = Math.pow(1 - d / R, 1.6);
            l.style.transform = `translate(${(-dx / (d || 1)) * f * 18}px, ${(-dy / (d || 1)) * f * 26}px) scale(${1 + f * 0.16}) rotate(${(-dx / R) * f * 14}deg)`;
          } else if (l.style.transform) l.style.transform = '';
        });
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- role typer ---------- */
  function initRole() {
    const el = $('.hero-role .txt');
    if (!el) return;
    const roles = (el.dataset.roles || '').split('|');
    if (reduce || roles.length < 2) return (el.textContent = roles[0] || '');
    let ri = 0, ci = 0, del = false;
    (function tick() {
      const w = roles[ri];
      ci += del ? -1 : 1;
      el.textContent = w.slice(0, ci);
      let d = del ? 35 : 75;
      if (!del && ci === w.length) { del = true; d = 1700; }
      else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; d = 300; }
      setTimeout(tick, d);
    })();
  }

  /* ---------- marquees ---------- */
  function initMarquees() {
    $$('.marquee').forEach((m) => {
      const track = $('.marquee-track', m), group = $('.marquee-group', m);
      if (!track || !group || reduce) return;
      const need = Math.max(2, Math.ceil((innerWidth * 2) / Math.max(group.offsetWidth, 1)) + 1);
      for (let i = 0; i < need; i++) { const c = group.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); }
      const dir = m.dataset.dir === 'right' ? 1 : -1;
      const base = parseFloat(m.dataset.speed || '0.8');
      const skew = m.dataset.skew !== undefined;
      let x = 0, last = scrollY, vis = true, sk = 0;
      if ('IntersectionObserver' in window) new IntersectionObserver((es) => (vis = es[0].isIntersecting)).observe(m);
      (function loop() {
        if (vis && !document.hidden) {
          const sv = scrollY - last; last = scrollY;
          x += dir * (base + Math.min(Math.abs(sv) * 0.15, 16));
          const w = group.offsetWidth;
          if (w) x = ((x % w) + w) % w - w;
          sk += ((clamp(sv * 0.35, -9, 9)) - sk) * 0.12;
          track.style.transform = `translate3d(${x}px,0,0)` + (skew ? ` skewX(${-sk.toFixed(2)}deg)` : '');
        } else last = scrollY;
        requestAnimationFrame(loop);
      })();
    });
  }

  /* ---------- pinned horizontal scroll ---------- */
  function initHScroll() {
    const wrap = $('.hscroll');
    if (!wrap) return;
    const track = $('.hscroll-track', wrap);
    const sticky = $('.hscroll-sticky', wrap);
    const mq = matchMedia('(min-width: 961px)');
    let max = 0;
    const layout = () => {
      if (!mq.matches || reduce) { wrap.style.height = ''; track.style.transform = ''; return; }
      max = Math.max(0, track.scrollWidth - innerWidth);
      wrap.style.height = max + innerHeight + 'px';
      render();
    };
    const render = () => {
      if (!mq.matches || reduce) return;
      const r = wrap.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, wrap.offsetHeight - innerHeight), 0, 1);
      track.style.transform = `translate3d(${-p * max}px,0,0)`;
    };
    layout();
    addEventListener('resize', layout);
    addEventListener('load', layout);
    addEventListener('scroll', render, { passive: true });
    mq.addEventListener?.('change', layout);
  }

  /* ---------- terminal typing ---------- */
  function initTerminal() {
    const body = $('.term-body');
    if (!body) return;
    const nodes = [];
    const collect = (n) => Array.from(n.childNodes).forEach((c) => {
      if (c.nodeType === 3) { nodes.push({ n: c, t: c.textContent }); }
      else if (c.nodeType === 1 && !c.classList.contains('caret')) collect(c);
    });
    collect(body);
    if (reduce) return;
    nodes.forEach((o) => (o.n.textContent = ''));
    let started = false;
    const run = async () => {
      for (const o of nodes) {
        for (let i = 0; i < o.t.length; i++) {
          o.n.textContent += o.t[i];
          await new Promise((r) => setTimeout(r, o.t[i] === '\n' ? 140 : 14 + Math.random() * 22));
        }
      }
    };
    new IntersectionObserver((es, io) => {
      if (es[0].isIntersecting && !started) { started = true; io.disconnect(); run(); }
    }, { threshold: 0.4 }).observe(body);
  }

  /* ---------- Garimpeiro calculator (illustrative) ---------- */
  function initCalc() {
    const calc = $('.calc');
    if (!calc) return;
    const f = (id) => $('#' + id, calc);
    const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const upd = () => {
      const custo = +f('c-custo').value, frete = +f('c-frete').value, venda = +f('c-venda').value;
      const imposto = (custo + frete) * 0.6;       // simplificação ilustrativa
      const taxa = venda * 0.18;                   // taxa de marketplace ilustrativa
      const lucro = venda - custo - frete - imposto - taxa;
      f('o-custo').textContent = brl(custo); f('o-frete').textContent = brl(frete); f('o-venda').textContent = brl(venda);
      f('r-imp').textContent = brl(imposto); f('r-taxa').textContent = brl(taxa);
      f('r-lucro').textContent = brl(lucro);
      f('r-mg').textContent = (venda ? (lucro / venda) * 100 : 0).toFixed(0) + '%';
      $('.calc-profit', calc).classList.toggle('neg', lucro < 0);
      f('r-label').textContent = lucro >= 0 ? 'Vale a pena ✓' : 'Não compensa ✗';
    };
    $$('input', calc).forEach((i) => i.addEventListener('input', upd));
    upd();
  }

  /* ---------- confetti + copy ---------- */
  function confetti(x, y) {
    if (reduce) return;
    let cv = $('#confetti');
    if (!cv) { cv = document.createElement('canvas'); cv.id = 'confetti'; document.body.appendChild(cv); }
    const ctx = cv.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    const colors = ['#ff4d8d', '#ffb020', '#c5f545', '#29d4f5', '#8b5cf6'];
    const ps = Array.from({ length: 110 }, () => {
      const a = Math.random() * Math.PI * 2, s = 4 + Math.random() * 11;
      return { x: x * dpr, y: y * dpr, vx: Math.cos(a) * s * dpr, vy: (Math.sin(a) * s - 6) * dpr, r: (4 + Math.random() * 6) * dpr, c: colors[(Math.random() * colors.length) | 0], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, life: 1 };
    });
    (function frame() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      let alive = false;
      ps.forEach((p) => {
        p.vy += 0.33 * dpr; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.rot += p.vr; p.life -= 0.0075;
        if (p.life > 0 && p.y < cv.height + 40) {
          alive = true; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.max(p.life, 0);
          ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore();
        }
      });
      if (alive) requestAnimationFrame(frame); else ctx.clearRect(0, 0, cv.width, cv.height);
    })();
  }

  function initCopy() {
    const btn = $('.mail-big');
    let toast = $('.toast');
    if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status'); document.body.appendChild(toast); }
    const say = (t) => { toast.textContent = t; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); };
    if (btn) btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const mail = btn.dataset.mail;
      try { await navigator.clipboard.writeText(mail); say('E-mail copiado! ✨'); }
      catch { location.href = 'mailto:' + mail; }
      const r = btn.getBoundingClientRect();
      confetti(r.left + r.width / 2, r.top + r.height / 2);
    });
    const logo = $('.logo');
    let clicks = 0, t;
    if (logo) logo.addEventListener('click', (e) => {
      clicks++; clearTimeout(t); t = setTimeout(() => (clicks = 0), 900);
      if (clicks >= 4) { e.preventDefault(); clicks = 0; confetti(e.clientX, e.clientY); say('Você achou o easter egg 🎉'); }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNav(); initScroll(); initPointer(); initName(); initRole();
    initHScroll(); initTerminal(); initCalc(); initCopy();
    const m = () => initMarquees();
    document.readyState === 'complete' ? m() : addEventListener('load', m);
  });
})();
