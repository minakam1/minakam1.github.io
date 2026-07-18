/* ============================================================
   poetry-in-noise · main.js  v11
   - 自定义像素光标
   - 鼠标墨迹 canvas
   - 打字机涌现
   - 实时时钟 + 时间问候
   - 4 套主题切换（持久化）
   - 模态层：折信 / 作品 / 帮助
   - 键盘快捷键
   - 票根 hover 错版印刷
   - 状态栏噪音频谱
   - 票根页面切换过渡（噪点扫描）
   - 标题乱码彩蛋
   - 「关于」随机诗轮播
   - Konami Code 彩蛋
   - 印章墨花粒子
   ============================================================ */

(() => {
  'use strict';

  /* ---------- 工具 ---------- */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const onReady = (fn) =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn, { once: true })
      : fn();
  const safe = (fn) => { try { fn(); } catch (e) { console.warn('[boot]', fn.name, e); } };

  /* ---------- 1. 实时时钟 + 时间问候 ---------- */
  function startClock() {
    const el = $('#clock');
    const greet = $('#greet');
    if (!el) return;

    const G = ['凌晨好。', '清晨好。', '上午好。', '午后好。', '傍晚好。', '夜里好。', '深夜好。'];
    const tick = () => {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      el.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      if (greet) {
        const h = d.getHours();
        let g;
        if (h < 5)       g = G[0];
        else if (h < 8)  g = G[1];
        else if (h < 12) g = G[2];
        else if (h < 14) g = G[3];
        else if (h < 18) g = G[4];
        else if (h < 22) g = G[5];
        else             g = G[6];
        greet.textContent = g;
      }
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 2. 自定义像素光标 ---------- */
  function startCursor() {
    const cursor = $('#cursor');
    if (!cursor) return;
    if (matchMedia('(hover: none)').matches) {
      cursor.style.display = 'none';
      return;
    }

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx, cy = ty;

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
    });

    const loop = () => {
      cx += (tx - cx) * 0.55;
      cy += (ty - cy) * 0.55;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    const interactives = 'a, button, .btn, .work, .note, [data-reveal], .tkt, .statusbar__btn, .modal__close';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactives)) cursor.classList.add('is-active');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactives)) cursor.classList.remove('is-active');
    });

    document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
    document.addEventListener('mouseenter', () => cursor.style.opacity = '1');
  }

  /* ---------- 3. 鼠标墨迹 canvas ---------- */
  function startInk() {
    const canvas = $('#ink');
    if (!canvas) return;
    if (matchMedia('(hover: none)').matches) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0, h = 0;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const ink = [];
    const MAX = 220;
    const RADIUS_MIN = 1;
    const RADIUS_MAX = 3;

    let lastSpawnX = 0, lastSpawnY = 0;
    window.addEventListener('mousemove', (e) => {
      const dx = e.clientX - lastSpawnX, dy = e.clientY - lastSpawnY;
      if (dx*dx + dy*dy < 16) return;
      lastSpawnX = e.clientX; lastSpawnY = e.clientY;

      const n = 4 + Math.floor(Math.random() * 5);
      for (let i = 0; i < n; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist  = Math.random() * 6;
        ink.push({
          x: e.clientX + Math.cos(angle) * dist,
          y: e.clientY + Math.sin(angle) * dist,
          r: RADIUS_MIN + Math.random() * (RADIUS_MAX - RADIUS_MIN),
          a: 0.85 + Math.random() * 0.15,
          life: 1.0,
          decay: 0.004 + Math.random() * 0.006,
          shape: Math.random() < 0.15 ? 'square' : 'dot'
        });
      }
      if (ink.length > MAX * 2) ink.splice(0, ink.length - MAX);
    });

    window.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      if (!t) return;
      for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist  = Math.random() * 14;
        ink.push({
          x: t.clientX + Math.cos(angle) * dist,
          y: t.clientY + Math.sin(angle) * dist,
          r: 2 + Math.random() * 3,
          a: 0.7,
          life: 1.0,
          decay: 0.006,
          shape: 'square'
        });
      }
    }, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      const cs = getComputedStyle(document.body);
      const col = cs.getPropertyValue('--ink').trim() || '#141414';
      for (let i = ink.length - 1; i >= 0; i--) {
        const p = ink[i];
        ctx.globalAlpha = p.a * p.life;
        ctx.fillStyle = col;
        if (p.shape === 'square') {
          const s = Math.max(1, Math.round(p.r));
          ctx.fillRect(Math.round(p.x - s/2), Math.round(p.y - s/2), s, s);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        p.life -= p.decay;
        if (p.life <= 0) ink.splice(i, 1);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(render);
    };
    render();
  }

  /* ---------- 4. 打字机效果 ---------- */
  function startTyping() {
    const targets = $$('[data-typed]');
    if (!targets.length) return;

    const collectTextNodes = (root) => {
      const out = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      let n;
      while ((n = walker.nextNode())) out.push(n);
      return out;
    };

    targets.forEach((el) => {
      const nodes = collectTextNodes(el);
      const lengths = nodes.map((n) => n.textContent.length);
      const full = nodes.map((n) => n.textContent).join('');
      el.dataset.typedFull = full;
      el.dataset.typedLengths = JSON.stringify(lengths);
      nodes.forEach((n) => { n.textContent = ''; });
      el.classList.add('is-typing');
    });

    targets.sort((a, b) => {
      const da = parseInt(a.dataset.typedDelay || '0', 10);
      const db = parseInt(b.dataset.typedDelay || '0', 10);
      return da - db;
    });

    const perChar = 36;

    const runOne = (el) => {
      const nodes = collectTextNodes(el);
      const lengths = JSON.parse(el.dataset.typedLengths || '[]');
      const text = el.dataset.typedFull || '';
      const beginAt = performance.now();
      const offsets = [];
      let acc = 0;
      for (let i = 0; i < lengths.length; i++) {
        offsets.push(acc);
        acc += lengths[i];
      }

      const tick = () => {
        const t = (performance.now() - beginAt) / perChar;
        const total = Math.min(text.length, Math.floor(t));

        let remaining = total;
        for (let i = 0; i < nodes.length; i++) {
          if (remaining <= 0) {
            nodes[i].textContent = '';
            continue;
          }
          const take = Math.min(lengths[i], remaining);
          nodes[i].textContent = text.slice(offsets[i], offsets[i] + take);
          remaining -= take;
        }

        if (total < text.length) {
          requestAnimationFrame(tick);
        } else {
          el.classList.remove('is-typing');
          el.classList.add('is-typed');
        }
      };
      tick();
    };

    targets.forEach((el) => {
      const delay = parseInt(el.dataset.typedDelay || '0', 10);
      setTimeout(() => runOne(el), delay);
    });
  }

  /* ---------- 5. 主题切换（6 套） ---------- */
  const THEMES = ['paper', 'ink', 'snow', 'copper', 'press', 'collage'];
  const THEME_LABELS = { paper: '米色', ink: '夜墨', snow: '雪', copper: '铜版', press: '夜报', collage: '拼贴' };
  const STORAGE_KEY = 'mimi.theme';

  function applyTheme(name) {
    if (!THEMES.includes(name)) name = 'paper';
    document.documentElement.setAttribute('data-theme', name);
    const btn = $('#themeBtn');
    if (btn) btn.title = `纸张: ${THEME_LABELS[name]} (1-6 切换)`;
    try { localStorage.setItem(STORAGE_KEY, name); } catch (e) {}
  }
  function cycleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'paper';
    const idx = THEMES.indexOf(cur);
    applyTheme(THEMES[(idx + 1) % THEMES.length]);
  }
  function startTheme() {
    let saved = 'paper';
    try { saved = localStorage.getItem(STORAGE_KEY) || 'paper'; } catch (e) {}
    applyTheme(saved);
    $('#themeBtn')?.addEventListener('click', cycleTheme);
  }

  /* ---------- 6. 模态层：折信 ---------- */
  function foldLetter(text) {
    // 居中折信
    const lines = (text || '').split('\n');
    const max = 14; // 信纸宽度（字符数）
    const wrapped = lines.flatMap(l => wrapText(l || ' ', max));
    const padded = wrapped.map(l => center(l, max));
    const top    = '─'.repeat(max + 2);
    const bottom = '─'.repeat(max + 2);
    const paper  = padded.length
      ? padded.map(l => '│ ' + l + ' │').join('\n')
      : '│ ' + center('（ 空 ）', max) + ' │';
    return [
      '┌' + top + '┐',
      paper,
      '└' + bottom + '┘',
    ].join('\n');
  }
  function wrapText(s, w) {
    if (s.length <= w) return [s];
    const out = [];
    let rest = s;
    while (rest.length > w) {
      out.push(rest.slice(0, w));
      rest = rest.slice(w);
    }
    if (rest.length) out.push(rest);
    return out;
  }
  function center(s, w) {
    if (s.length >= w) return s.slice(0, w);
    const pad = Math.floor((w - s.length) / 2);
    return ' '.repeat(pad) + s + ' '.repeat(w - s.length - pad);
  }

  function startLetter() {
    const stamp  = $('#stamp');
    const btn    = $('#letterBtn');
    const modal  = $('#letterModal');
    const input  = $('#letterInput');
    const fold   = $('#foldBtn');
    const paper  = $('#letterPaper');
    if (!modal) return;

    const open = () => {
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      paper.hidden = true;
      paper.textContent = '';
      input.value = '';
      setTimeout(() => input.focus(), 50);
    };
    const close = () => {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
    };

    stamp?.addEventListener('click', open);
    btn?.addEventListener('click', open);

    fold?.addEventListener('click', () => {
      const text = (input.value || '').trim() || '……';
      paper.textContent = foldLetter(text);
      paper.hidden = false;
    });

    modal.addEventListener('click', (e) => {
      if (e.target.matches('[data-close]')) close();
    });
  }

  /* ---------- 7. 作品展开 ---------- */
  const WORK_DETAIL = {
    '001': {
      title: '一本不会出版的小书',
      meta:  '2025 · 纸 / 64 页 / 手工锁线',
      body:  '写了一年的随笔。纸张发黄。不会卖给任何人，但欢迎来翻。'
    },
    '002': {
      title: '给陌生人的 100 封信',
      meta:  '2024 · 邮政 / 100 封手写信',
      body:  '在城市的各个角落写下的信，按地址投寄。其中 23 封被退回，5 封收到回信。'
    },
    '003': {
      title: '噪音作为材料',
      meta:  '2024 · 音频 / 12 段田野录音',
      body:  '采集了菜市场、雨夜、服务器机房、旧电视机白噪音，重新组织为可听的诗。'
    },
    '004': {
      title: '凌晨四点的网页',
      meta:  '2023 · web / 一个不存在的网站',
      body:  '只在凌晨 4:00 至 4:33 出现的页面。每 33 秒换一次内容。错过了就错过了。'
    }
  };

  function startWorkModal() {
    const modal = $('#workModal');
    if (!modal) return;
    const titleEl = $('#workTitle');
    const metaEl  = $('#workMeta');
    const bodyEl  = $('#workBody');
    const noEl    = $('#workNo');

    const open = (key) => {
      const d = WORK_DETAIL[key];
      if (!d) return;
      noEl.textContent   = '// ' + key;
      titleEl.textContent = d.title;
      metaEl.textContent  = d.meta;
      bodyEl.textContent  = d.body;
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
    };
    const close = () => {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
    };

    $$('#worksList .work').forEach((li) => {
      li.addEventListener('click', () => open(li.dataset.work));
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(li.dataset.work); }
      });
      li.tabIndex = 0;
      li.setAttribute('role', 'button');
    });

    modal.addEventListener('click', (e) => {
      if (e.target.matches('[data-close]')) close();
    });
  }

  /* ---------- 8. 帮助浮层 + 键盘快捷键 ---------- */
  function startHelp() {
    const modal = $('#helpModal');
    const btn   = $('#helpBtn');
    if (!modal) return;

    const open = () => {
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
    };
    const close = () => {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
    };
    btn?.addEventListener('click', () => {
      modal.hidden ? open() : close();
    });
    modal.addEventListener('click', (e) => {
      if (e.target.matches('[data-close]')) close();
    });
  }

  function startShortcuts() {
    document.addEventListener('keydown', (e) => {
      // 在输入框里不拦截
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'Escape') {
        $$('.modal').forEach(m => { m.hidden = true; m.setAttribute('aria-hidden', 'true'); });
        const easter = $('#easter');
        if (easter && !easter.hidden) easter.hidden = true;
        return;
      }
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        const m = $('#helpModal');
        if (!m) return;
        m.hidden ? (m.hidden = false, m.setAttribute('aria-hidden', 'false'))
                 : (m.hidden = true,  m.setAttribute('aria-hidden', 'true'));
        return;
      }
      if (e.key >= '1' && e.key <= '6') {
        applyTheme(THEMES[parseInt(e.key, 10) - 1]);
        return;
      }
    });
  }

  /* ---------- 9. REC 切换：单击静音/开启 ---------- */
  function startRecToggle() {
    const dot = $('#recDot');
    if (!dot) return;
    dot.style.cursor = 'pointer';
    dot.addEventListener('click', () => dot.classList.toggle('is-off'));
  }

  /* ---------- 10. 噪音频谱（状态栏）---------- */
  function startNoiseMeter() {
    const wrap = $('#noiseMeter');
    if (!wrap) return;
    const bars = $$('.statusbar__bar', wrap);
    if (!bars.length) return;
    const MAX = 12; // px
    const tick = () => {
      bars.forEach((b, i) => {
        const seed = (Date.now() / 90 + i * 13) % 100;
        const h = 2 + Math.round((Math.sin(seed / 9) * 0.5 + 0.5) * (MAX - 2));
        b.style.height = h + 'px';
        b.classList.toggle('is-peak', h > MAX - 3);
      });
    };
    tick();
    setInterval(tick, 110);
  }

  /* ---------- 11. 票根点击：噪点扫描过渡 ---------- */
  function startPageTransition() {
    const boot = $('#boot');
    const msg  = $('#bootMsg');
    if (!boot) return;

    const TICKETS_LABELS = {
      journal: 'JOURNAL · 日志',
      reading: 'READING · 读',
      sounds:  'SOUNDS · 听',
      gallery: 'GALLERY · 集',
      corner:  'CORNER · 角',
      write:   'WRITE · 寄',
      blog:    'BLOG · 博客',
    };

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a.tkt');
      if (!a) return;
      e.preventDefault();
      const href = a.getAttribute('href');
      const page = a.dataset.page;
      if (!href) return;
      if (msg) msg.textContent = (TICKETS_LABELS[page] || 'LOADING') + ' …';
      boot.classList.add('is-on');
      // 强制重启动画
      boot.querySelectorAll('.boot__scan, .boot__line, .boot__msg').forEach(el => {
        el.style.animation = 'none';
        // eslint-disable-next-line no-unused-expressions
        el.offsetHeight; // reflow
        el.style.animation = '';
      });
      setTimeout(() => { window.location.href = href; }, 520);
    });
  }

  /* ---------- 12. 标题乱码彩蛋 ---------- */
  function startTitleGlitch() {
    const title = $('.cover__left .title');
    if (!title) return;
    const orig = $$('.line', title).map(l => l.textContent);

    const CHARS = '!<>-_\\/[]{}—=+*^?#________';
    const scramble = (line, times = 6) => {
      let out = '';
      for (let i = 0; i < line.length; i++) {
        if (line[i] === ' ' || line[i] === '.') { out += line[i]; continue; }
        out += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      let frame = 0;
      const tick = () => {
        let cur = '';
        for (let i = 0; i < line.length; i++) {
          if (line[i] === ' ' || line[i] === '.') { cur += line[i]; continue; }
          cur += Math.random() < (frame / times) ? line[i] : CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        out = cur;
        return out;
      };
      return tick;
    };

    const play = () => {
      title.classList.remove('is-glitch');
      void title.offsetWidth;
      title.classList.add('is-glitch');
      const lines = $$('.line', title);
      const tickers = orig.map((o) => scramble(o));
      const T = 8;
      let f = 0;
      const iv = setInterval(() => {
        lines.forEach((l, i) => { l.textContent = tickers[i](); });
        f++;
        if (f >= T) {
          clearInterval(iv);
          lines.forEach((l, i) => { l.textContent = orig[i]; });
        }
      }, 45);
    };

    title.addEventListener('dblclick', play);
  }

  /* ---------- 13. 「关于」随机诗轮播 ---------- */
  const POEMS = [
    '在云端和云端之间，<br/>我租了一间带噪点的房间。<br/>信号差时，<br/>我以为是诗意。',
    '凌晨四点，<br/>城市的频率是 50Hz。<br/>我醒着，<br/>和电一起嗡。',
    '打印机吐出我的字，<br/>墨粉味像早春的雪。<br/>我把它叫作<br/>—— 劳动的诗意。',
    '我把日历撕成小方块，<br/>每一块都是一首诗的标题。<br/>到年底，<br/>还剩 73 个未写。',
    '所有未寄出的信<br/>都堆在云端，<br/>比邮局重一点，<br/>比心事轻一点。',
    '我在每一道划痕上签名，<br/>桌子、书脊、<br/>和清晨第一杯水，<br/>都认识我。',
  ];

  function startPoemRotator() {
    const el = $('#aboutText');
    const block = $('.block--about');
    if (!el || !block) return;

    let idx = 0;
    const next = () => {
      block.classList.add('is-fading');
      setTimeout(() => {
        idx = (idx + 1) % POEMS.length;
        el.innerHTML = POEMS[idx];
        block.classList.remove('is-fading');
      }, 380);
    };
    let timer = setInterval(next, 7000);
    block.addEventListener('mouseenter', () => clearInterval(timer));
    block.addEventListener('mouseleave', () => { timer = setInterval(next, 7000); });
  }

  /* ---------- 14. 印章墨花粒子 ---------- */
  function startStampBurst() {
    const stamp = $('#stamp');
    if (!stamp) return;
    stamp.addEventListener('click', () => {
      const rect = stamp.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const n = 26;
      const cs = getComputedStyle(document.body);
      const col = (cs.getPropertyValue('--stamp') || '#c8341f').trim();

      for (let i = 0; i < n; i++) {
        const p = document.createElement('span');
        const a = Math.random() * Math.PI * 2;
        const r = 30 + Math.random() * 80;
        const dx = Math.cos(a) * r;
        const dy = Math.sin(a) * r;
        const size = 2 + Math.floor(Math.random() * 4);
        p.style.cssText = `
          position: fixed; left: ${cx}px; top: ${cy}px;
          width: ${size}px; height: ${size}px;
          background: ${col}; opacity: 0.85;
          pointer-events: none; z-index: 10000;
          transform: translate(-50%, -50%);
          transition: transform .7s steps(8) cubic-bezier(.2,.7,.2,1), opacity .7s steps(4);
        `;
        document.body.appendChild(p);
        requestAnimationFrame(() => {
          p.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${Math.random()*360}deg)`;
          p.style.opacity = '0';
        });
        setTimeout(() => p.remove(), 800);
      }
    });
  }

  /* ---------- 15. Konami Code 彩蛋 ---------- */
  function startKonami() {
    const easter = $('#easter');
    const art   = $('#easterArt');
    if (!easter) return;
    const SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let pos = 0;
    const closed = () => easter.hidden;
    const close = () => { easter.hidden = true; };
    const open  = () => {
      if (art) art.textContent = makeEasterArt();
      easter.hidden = false;
    };

    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === '5' && !closed()) { e.preventDefault(); close(); return; }
      if (e.key === SEQ[pos]) {
        pos++;
        if (pos === SEQ.length) { pos = 0; open(); }
      } else {
        pos = (e.key === SEQ[0]) ? 1 : 0;
      }
    });
  }

  function makeEasterArt() {
    // 60×18 像素脸谱：随机 0/1 → # / 空格
    const W = 60, H = 18;
    const grid = [];
    for (let y = 0; y < H; y++) {
      let row = '';
      for (let x = 0; x < W; x++) {
        // 一个噪点脸
        const cx = W / 2, cy = H / 2;
        const dx = (x - cx) / cx, dy = (y - cy) / cy;
        const r2 = dx*dx + dy*dy;
        let v = Math.random();
        if (r2 > 0.9) v = 0;
        else if (r2 > 0.6 && (y === 6 || y === 7) && (x === 18 || x === 42)) v = 1; // 眼
        else if (r2 > 0.6 && y === 12 && x > 24 && x < 36) v = 1; // 嘴
        row += v > 0.5 ? '█' : ' ';
      }
      grid.push(row);
    }
    return grid.join('\n');
  }

  /* ---------- 16. 启动 ---------- */
  onReady(() => {
    safe(startClock);
    safe(startTheme);
    safe(startCursor);
    safe(startInk);
    safe(startTyping);
    safe(startLetter);
    safe(startWorkModal);
    safe(startHelp);
    safe(startShortcuts);
    safe(startRecToggle);
    safe(startNoiseMeter);
    safe(startPageTransition);
    safe(startTitleGlitch);
    safe(startPoemRotator);
    safe(startStampBurst);
    safe(startKonami);
  });
})();
