// 入口：倒计时 → 标题 → 游戏
(() => {
  const { R, P, circle, ellipse, alpha, text } = GFX;
  const params = new URLSearchParams(location.search);
  const DEV = params.has('dev');
  const PREVIEW = DEV || params.has('preview');
  const unlockAt = new Date(STORY.unlockAt).getTime();

  const rnd = (i) => { const x = Math.sin(i * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); };
  const stars = Array.from({ length: 140 }, (_, i) => ({ x: rnd(i) * 640, y: rnd(i + 50) * 230, p: i, s: rnd(i + 90) > 0.88 ? 2 : 1 }));
  let bg = null;
  function paintBg() {
    const c = document.createElement('canvas'); c.width = 640; c.height = 360;
    const real = GFX.ctx; GFX.setCtx(c.getContext('2d'));
    const cols = ['#08081f', '#0c0c28', '#111232', '#16163c', '#1c1a46', '#231f52', '#2b245c', '#342a66', '#3e306e'];
    const bh = 270 / cols.length;
    cols.forEach((col, i) => { R(0, Math.floor(i * bh), 640, Math.ceil(bh) + 1, col); if (i) HD.dith(0, Math.floor(i * bh) - 3, 640, 3, col, 0.5); });
    for (let i = 0; i < 46; i++) { const x = i * 14 - 4, h = 20 + rnd(i + 300) * 56; R(x, 270 - h, 12, h, '#15133a'); for (let y = 274 - h; y < 266; y += 5) for (let wx = x + 2; wx < x + 11; wx += 3) if (rnd(wx * 7 + y) > 0.7) P(wx, y, '#ffd66b'); }
    R(0, 268, 640, 92, '#1b2440'); R(0, 268, 640, 2, '#2a3660');
    for (let i = 0; i < 80; i++) P(rnd(i + 700) * 640, 272 + rnd(i + 800) * 86, '#24305a');
    GFX.setCtx(real);
    return FX.bake(c, FX.BAKE.night);
  }
  function nightBg(t, mood) {
    if (!bg) bg = paintBg();
    GFX.ctx.drawImage(bg, 0, 0);
    stars.forEach((s) => alpha(0.4 + Math.sin(t * 2 + s.p) * 0.4, () => R(s.x, s.y, s.s, s.s, '#ffffff')));
    HD.glow(540, 60, 50, '#fff3c9', 0.2);
    circle(540, 60, 18, '#fff3c9'); circle(547, 53, 16, '#111232');
    toyFlex(476, 150, t, mood);
    toyCat(424, 254, t, mood === 'sleep');
  }

  // ---------- 标题页上可以点的 Flex 和猫 ----------
  const toys = { flexT: -99, catT: -99, fi: 0, ci: 0 };
  function toyFlex(x, y, t, base) {
    const k = t - toys.flexT, act = k < 1.8;
    const hop = k < 0.5 ? Math.sin((k / 0.5) * Math.PI) * 8 : 0;
    const mood = act ? (base === 'love' ? 'love' : 'ok') : base;
    HD.flex(x, Math.round(y - hop), { mood, gx: act ? 0.5 + Math.sin(t * 10) * 0.45 : 0.5 + Math.sin(t) * 0.3, dip: act ? Math.max(0, Math.sin(t * 12) * 7) : 0 }, t);
  }
  function toyCat(x, y, t, sleeping) {
    const k = t - toys.catT, act = k < 1.6;
    const hop = k < 0.45 ? Math.sin((k / 0.45) * Math.PI) * 7 : 0;
    HD.drawCat(x, Math.round(y - hop), t, sleeping && !act);
    if (act && !sleeping) alpha(Math.min(1, (1.6 - k) * 2), () => DREAM.heart(x + 8, y - 12 - k * 10, 1, '#ff8fb3'));
  }
  function bubble(txt, x, y) {
    G.layer.querySelectorAll('.toy-bubble').forEach((b) => b.remove());
    const b = G.el(`<div class="toy-bubble" style="left:${(x / 640) * 100}%;top:${(y / 360) * 100}%">${txt}</div>`);
    setTimeout(() => { b.classList.add('out'); setTimeout(() => b.remove(), 400); }, 2000);
  }
  // pos: { fx, fy, cx, cy }，mode: 'night' | 'sleep' | 'dream'
  function toyTap(p, pos, mode) {
    const T = STORY.title, t = G.t;
    if (p.x > pos.fx - 4 && p.x < pos.fx + 108 && p.y > pos.fy - 26 && p.y < pos.fy + 122) {
      if (t - toys.flexT < 0.5) return true;
      toys.flexT = t;
      const lines = mode === 'dream' ? T.flexDream : mode === 'sleep' ? T.flexSleep : T.flexTap;
      AU.sfx(mode === 'dream' ? 'heal' : 'success');
      bubble(lines[toys.fi++ % lines.length], pos.fx + 52, pos.fy - 30);
      G.burst(pos.fx + 52, pos.fy + 30, 22, mode === 'dream' ? ['#ff8fb3', '#ffd0e4', '#ffffff'] : ['#7cc4ff', '#ffffff', '#ffd66b'], { speed: 80, life: 0.9, g: 40, size: 2 });
      return true;
    }
    if (p.x > pos.cx - 4 && p.x < pos.cx + 40 && p.y > pos.cy - 10 && p.y < pos.cy + 22) {
      if (t - toys.catT < 0.5) return true;
      toys.catT = t;
      const lines = mode === 'sleep' ? T.catSleep : T.catTap;
      AU.sfx(toys.ci % 3 === 2 ? 'purr' : 'meow');
      bubble(lines[toys.ci++ % lines.length], pos.cx + 16, pos.cy - 14);
      G.burst(pos.cx + 16, pos.cy + 2, 10, ['#ffb3d1', '#ffffff'], { speed: 40, life: 0.7, g: 20, size: 1 });
      return true;
    }
    return false;
  }

  // 通关隐藏结局之后，标题页换成「梦的世界」
  const doneAll = () => G.hasSecret();
  G.def('title', {
    k: 1, width: 640, noWalk: true, fixedCam: true, bgm: 'title',
    draw(ctx, t) { if (doneAll()) { DREAM.draw(t, { floor: 292 }); toyFlex(476, 168, t, 'love'); toyCat(424, 272, t, false); } else nightBg(t, 'idle'); },
    drawFg(ctx, t) {
      if (doneAll()) { DREAM.reflect(() => { toyFlex(476, 168, t, 'love'); toyCat(424, 272, t, false); }, 292); DREAM.drawFg(t, { floor: 292, ripples: [{ x: 528, y: 292 }] }); }
      if (!doneAll() && t - toys.catT > 1.6 && Math.floor(t * 0.5) % 5 === 0) alpha(0.7, () => text('MEOW', 424, 236, '#fffaf0', 2));
    },
    onTap(p) { if (doneAll() && DREAM.tap(p)) return true; return doneAll() ? toyTap(p, { fx: 476, fy: 168, cx: 424, cy: 272 }, 'dream') : toyTap(p, { fx: 476, fy: 150, cx: 424, cy: 254 }, 'night'); },
  });
  G.def('countdown', {
    k: 1, width: 640, noWalk: true, fixedCam: true, bgm: 'title',
    draw(ctx, t) {
      nightBg(t, 'sleep');
      for (const [o, sc, x0, y0] of [[0, 4, 600, 140], [12, 2, 592, 132]]) { const z = (t * 8 + o) % 24; alpha(1 - z / 24, () => text(o ? 'z' : 'Z', x0 + z, y0 - z * 2, '#c9bfe8', sc)); }
    },
    onTap(p) { return toyTap(p, { fx: 476, fy: 150, cx: 424, cy: 254 }, 'sleep'); },
  });

  // ---------- 11.26 第一次打开：解锁动画 ----------
  // 倒计时归零 → 锁打开 → Flex 醒来、屏幕亮起打勾 → 猫醒了 → 彩带 → 「实验开始」→ 进入标题页
  const un = { flex: 'sleep', cat: true, t0: 0 };
  G.def('unlock', {
    k: 1, width: 640, noWalk: true, fixedCam: true, bgm: null,
    draw(ctx, t) {
      if (!bg) bg = paintBg();
      GFX.ctx.drawImage(bg, 0, 0);
      stars.forEach((s) => alpha(0.4 + Math.sin(t * 2 + s.p) * 0.4, () => R(s.x, s.y, s.s, s.s, '#ffffff')));
      HD.glow(540, 60, 50, '#fff3c9', 0.2); circle(540, 60, 18, '#fff3c9'); circle(547, 53, 16, '#111232');
      HD.flex(476, 150, { mood: un.flex, gx: un.flex === 'ok' ? 0.5 + Math.sin(t * 8) * 0.4 : 0.5, dip: un.flex === 'ok' ? Math.max(0, Math.sin(t * 10) * 6) : 0 }, t);
      HD.drawCat(424, 254, t, un.cat);
      if (un.flex !== 'sleep') HD.glow(528, 150, 60, un.flex === 'ok' ? '#4fe08a' : '#5aa9e6', 0.18);
    },
  });
  async function playUnlock() {
    G.goto('unlock', { noFade: true });
    Object.assign(un, { flex: 'sleep', cat: true });
    const U = STORY.unlock;
    const e = G.el(`<div class="title-screen left countdown unlock"><div class="logo">${STORY.countdown.title}</div>
      <div class="digits">${['天', '时', '分', '秒'].map((u) => `<div class="cell"><b>00</b><span>${u}</span></div>`).join('')}</div>
      <div class="gate-icon un-lock"><span></span></div>
      <div class="sub un-line">${U.line1}</div><div class="sub un-line2">${U.line2}</div></div>`);
    let skip = false;
    const tapSkip = (ev) => { ev.stopPropagation(); skip = true; };
    e.addEventListener('pointerdown', tapSkip);
    const w = (ms) => (skip ? Promise.resolve() : G.wait(ms));
    AU.unlock();
    await w(700);
    for (let i = 0; i < 3; i++) { AU.sfx('beep'); e.querySelectorAll('.cell').forEach((c) => c.classList.toggle('blink', i % 2 === 0)); await w(380); }
    e.querySelectorAll('.cell').forEach((c) => c.classList.add('zero'));
    AU.sfx('click'); e.querySelector('.un-lock').classList.add('open');   // 锁打开
    await w(600);
    un.flex = 'idle'; AU.sfx('beep');                                      // Flex 醒来，屏幕亮了
    await w(700);
    un.flex = 'ok'; un.cat = false; AU.sfx('success'); AU.sfx('meow');    // 屏幕打勾，猫醒了
    for (let k = 0; k < 4; k++) setTimeout(() => G.burst(80 + Math.random() * 480, -10, 40, ['#f7a8c4', '#ffd66b', '#81d8d0', '#b9a3d6', '#ffffff'], { speed: 120, life: 2.2, g: 70, size: 2, drag: 0.985 }), k * 220);
    e.querySelector('.un-line').classList.add('show');
    await w(900);
    AU.sfx('achieve'); e.querySelector('.un-line2').classList.add('show');
    await w(2600);
    localStorage.setItem('gwen1126-opened', '1');
    e.removeEventListener('pointerdown', tapSkip);
    await G.trans('mosaic', true, 600);
    e.remove();
    showTitle();
    await G.trans('mosaic', false, 600);
  }

  function showCountdown() {
    G.goto('countdown', { noFade: true });
    const C = STORY.countdown;
    const e = G.el(`<div class="title-screen left countdown"><div class="logo">${C.title}</div><div class="sub" style="margin:calc(var(--u)*2) 0 0">${C.line1}</div>
      <div class="digits">${['天', '时', '分', '秒'].map((u) => `<div class="cell"><b>--</b><span>${u}</span></div>`).join('')}</div>
      <div class="sub" style="margin:0">${C.line2}</div></div>`);
    const cells = e.querySelectorAll('.cell b');
    let iv = 0;
    const tick = () => {
      let ms = unlockAt - Date.now();
      // 倒计时到 0：不刷新页面（刷新后浏览器不让自动出声），直接在原地播解锁动画
      if (ms <= 0) { clearInterval(iv); if (!localStorage.getItem('gwen1126-opened')) playUnlock(); else showTitle(); return; }
      const s = Math.floor(ms / 1000);
      [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60].forEach((v, i) => (cells[i].textContent = String(v).padStart(2, '0')));
    };
    tick(); iv = setInterval(tick, 1000);
  }

  function showTitle() {
    const done = doneAll();
    G.scenes.title.bgm = done ? 'yume' : 'title';
    G.goto('title', { noFade: true });
    if (done) G.onHover = (p) => DREAM.hoverAt(p);
    const T = STORY.title;
    const has = G.save.scene && G.save.scene !== 'title';
    const e = G.el(`<div class="title-screen left"><div class="logo">${T.logo}</div><div class="sub">${T.sub}</div>
      ${done ? `<div class="done">${T.done}</div><div class="done-sub">${T.doneSub}</div>` : ''}
      <div class="menu">${has ? `<button class="btn primary cont">${T.cont}</button><button class="btn new">${T.start}</button>` : `<button class="btn primary new">${T.start}</button>`}${G.save.cleared ? `<button class="btn chap">${T.chapters}</button>` : ''}</div>
      <div class="tip">${T.tip}</div>
      ${DEV ? `<div class="dev">${['home', 'drive', 'lab', 'boston', 'boss', 'street', 'finale'].map((s) => `<button class="btn small" data-s="${s}">${s}</button>`).join('')}<button class="btn small" data-s="hidden">隐藏结局</button><button class="btn small" data-s="unlock">解锁动画</button><button class="btn small" data-s="resetAch">清空成就</button></div>` : ''}</div>`);
    const go = (scene) => { AU.unlock(); AU.sfx('select'); e.remove(); G.goto(scene); };
    e.querySelectorAll('button').forEach((b) => b.addEventListener('pointerdown', (ev) => ev.stopPropagation()));
    const nb = e.querySelector('.new');
    nb.addEventListener('click', () => { G.resetSave(); go('home'); });
    const cb = e.querySelector('.cont');
    if (cb) cb.addEventListener('click', () => go(G.save.scene));
    e.querySelectorAll('.dev button').forEach((b) => b.addEventListener('click', () => { e.remove(); devJump(b.dataset.s); }));
    const ch = e.querySelector('.chap');
    if (ch) ch.addEventListener('click', () => { AU.unlock(); AU.sfx('select'); chapterPanel(e); });
  }

  // 章节选择（通关后才有）：每章后面标出这一章的成就拿到了几个，方便补齐
  const CH_ACH = { home: ['cat', 'cat5'], drive: ['honk'], lab: ['bulb', 'curious', 'flex'], boston: ['social'], boss: ['quiz', 'boss'], street: ['pizza', 'shop', 'coffee'], finale: ['wish'] };
  function chapterPanel(titleEl) {
    const T = STORY.title;
    const rows = T.chapterList.map(([k, name]) => {
      const list = CH_ACH[k] || [], got = list.filter((a) => G.save.ach[a]).length;
      return `<button class="btn chap-row" data-s="${k}"><span>${name}</span><span class="ach-count ${got === list.length ? 'full' : ''}">★ ${got} / ${list.length}</span></button>`;
    }).join('');
    const p = G.el(`<div class="ach-panel-wrap"><div class="panel ach-panel chap-panel"><div class="t">${T.chapters}</div><div class="list">${rows}</div><div class="foot">${T.chaptersTip}</div><button class="btn small close">关闭</button></div></div>`);
    p.addEventListener('pointerdown', (ev) => ev.stopPropagation());
    p.querySelector('.close').addEventListener('click', () => { AU.sfx('click'); p.remove(); });
    p.querySelectorAll('.chap-row').forEach((b) => b.addEventListener('click', () => { AU.sfx('select'); p.remove(); titleEl.remove(); jumpTo(b.dataset.s); }));
  }

  function devJump(s) {
    if (s === 'resetAch') { G.save.ach = {}; G.save.cleared = false; G.persist(); sessionStorage.removeItem('gwen1126-test-secret'); localStorage.removeItem('gwen1126-opened'); G.reload(); return; }
    if (s === 'unlock') { G.layer.querySelectorAll('.title-screen').forEach((x) => x.remove()); return playUnlock(); }
    if (s !== 'hidden') return jumpTo(s);
    // 测试隐藏结局：直接到吹完蜡烛、信刚打开的时候，并临时当作成就已集齐（不写进存档）
    if (s === 'hidden') { G.testAllAch = true; G.testHiddenPending = true; jumpTo('finale'); return; }
  }
  // 跳到某一章：把前面章节的进度补好（试剂、剧情标记），成就保留
  function jumpTo(s) {
    if (!G.testHiddenPending) sessionStorage.removeItem('gwen1126-test-secret');
    const order = ['home', 'drive', 'lab', 'boston', 'boss', 'street', 'finale'];
    G.layer.querySelectorAll('.title-screen').forEach((x) => x.remove());
    G.resetSave();
    const idx = order.indexOf(s);
    if (idx > 0) Object.assign(G.flags, { h_protocol: true, h_keys: true, h_bag: true, h_started: true });
    if (idx > 2) G.flags.lab_entered = true;
    const rg = { lab: 0, boston: 0, boss: 2, street: 3, finale: 4 }[s] || 0;
    for (let i = 0; i < rg; i++) G.save.reagents[i] = true;
    if (s === 'boss' || s === 'street' || s === 'finale') Object.assign(G.flags, { lab_boston: true, lab_flex: true });
    if (s === 'finale') Object.assign(G.flags, { s_pizza: true, s_coffee: true });
    G.persist();
    AU.unlock(); AU.sfx('select');
    G.goto(s);
  }
  if (DEV) G.devJump = devJump;

  // ---------- 密码门禁：每次打开 / 手动刷新都要输入；游戏自己刷新（再玩一次、倒计时结束）时不用 ----------
  const PASS = null;   // 部署版本里会被构建脚本去掉（部署版的密码检查在 boot.js 里，用密码解密台词）
  G.reload = () => { sessionStorage.setItem('gwen1126-pass', '1'); if (window.__BOOT_KEY) sessionStorage.setItem('gwen1126-k', window.__BOOT_KEY); location.reload(); };
  function gate(done) {
    if (window.__BOOTED) return done();   // 部署版：boot.js 已经验证过密码
    const once = sessionStorage.getItem('gwen1126-pass');
    sessionStorage.removeItem('gwen1126-pass');
    if (once) return done();
    const S = STORY.gate;
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];   // 输满 4 位自动确认，不需要确认键
    const e = G.el(`<div class="gate"><div class="panel gate-box">
      <div class="gate-icon"><span></span></div>
      <div class="gate-t">${S.title}</div><div class="gate-sub">${S.sub}</div>
      <div class="gate-dots">${'<i></i>'.repeat(4)}</div>
      <div class="gate-msg">${S.hint}</div>
      <div class="gate-keys">${keys.map((k) => (k ? `<button class="btn small" data-k="${k}">${k === 'del' ? '⌫' : k}</button>` : '<span></span>')).join('')}</div></div></div>`);
    const dots = e.querySelectorAll('.gate-dots i'), msg = e.querySelector('.gate-msg'), box = e.querySelector('.gate-box');
    let v = '', busy = false;
    const show = () => dots.forEach((d, i) => d.classList.toggle('on', i < v.length));
    const check = async () => {
      busy = true;
      if (v === PASS) {
        AU.unlock(); AU.sfx('success');
        box.classList.add('ok'); msg.textContent = S.ok;
        await G.wait(900);
        e.classList.add('out'); document.removeEventListener('keydown', onKey, true);
        await G.wait(450); e.remove(); done();
        return;
      }
      AU.unlock(); AU.sfx('error');
      box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
      msg.textContent = S.wrong; msg.classList.add('bad');
      await G.wait(700); v = ''; show(); busy = false;
    };
    const press = (k) => {
      if (busy) return;
      AU.unlock();
      if (k === 'del') { v = v.slice(0, -1); AU.sfx('click'); }
      else if (k === 'ok') { if (v.length === 4) check(); else AU.sfx('click'); }
      else if (v.length < 4) { v += k; AU.sfx('blip'); if (v.length === 4) setTimeout(check, 200); }
      show();
    };
    e.addEventListener('pointerdown', (ev) => ev.stopPropagation());
    e.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => press(b.dataset.k)));
    const onKey = (ev) => { if (/^[0-9]$/.test(ev.key)) press(ev.key); else if (ev.key === 'Backspace') press('del'); else if (ev.key === 'Enter') press('ok'); else return; ev.preventDefault(); ev.stopPropagation(); };
    document.addEventListener('keydown', onKey, true);
  }

  // 片尾「再玩一次 / 回到标题」：原地回到标题页，不刷新页面，这样音乐能接着放
  G.backToTitle = async () => {
    G.lock();
    await G.trans('mosaic', true, 600);
    showTitle();
    await G.trans('mosaic', false, 600);
    while (G.locked) G.unlock();   // 结局里加过好几层锁，回到标题要全部解开，不然点不了 Flex 和猫
  };

  G.start();
  gate(() => {
    // iPhone 的静音开关会让网页没有声音，进来时提醒一次
    if (/iPhone|iPad/.test(navigator.userAgent) && !sessionStorage.getItem('gwen1126-ios')) { sessionStorage.setItem('gwen1126-ios', '1'); setTimeout(() => G.toast(STORY.title.iosTip, 4500), 800); }
    if (!PREVIEW && Date.now() < unlockAt) showCountdown();
    else if (!PREVIEW && !localStorage.getItem('gwen1126-opened')) playUnlock();
    else showTitle();
  });
})();
