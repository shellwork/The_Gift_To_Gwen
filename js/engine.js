// 游戏引擎：画布、输入、对话、场景、存档、各种 UI
const G = (() => {
  const CW = 640, CH = 360;   // 实际画布分辨率
  let W = 320, H = 180, K = 2; // 当前场景的逻辑分辨率（旧场景按 2 倍放大）
  const stage = document.getElementById('stage');
  // 游戏画在 640×360 的离屏画布上；显示画布按整数倍放大成像素块，再交给浏览器平滑缩到屏幕大小
  // 这样每个像素大小都一样，不会出现忽宽忽窄
  const dv = document.getElementById('game');
  const cv = document.createElement('canvas');
  cv.width = CW; cv.height = CH;
  const dctx = dv.getContext('2d');
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  GFX.setCtx(ctx);
  const $ = (s) => document.querySelector(s);
  const ui = $('#ui'), layer = $('#layer');

  const G = {
    CW, CH, ctx, t: 0, camX: 0, scene: null, scenes: {}, actors: [], objects: [], particles: [],
    lockN: 0, scale: 3, shake: 0, lastInput: performance.now(), keys: {}, flags: {}, vignette: null,
    get locked() { return this.lockN > 0; },
  };

  // ---------- save ----------
  const SAVE_KEY = 'gwen1126-save';
  G.save = { scene: null, reagents: [false, false, false, false, false], ach: {}, flags: {} };
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s) G.save = Object.assign(G.save, s); } catch (e) {}
  G.flags = G.save.flags;
  G.persist = () => localStorage.setItem(SAVE_KEY, JSON.stringify(G.save));
  // 重新开始时保留已经解锁的成就，方便补齐
  G.resetSave = () => { const ach = G.save.ach || {}, cleared = !!G.save.cleared; G.save = { scene: null, reagents: [false, false, false, false, false], ach, cleared, flags: {} }; G.flags = G.save.flags; G.persist(); };

  // ---------- resize ----------
  function resize() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const s0 = Math.min(vw / CW, vh / CH);
    const s = (CW * s0) / 320;
    G.scale = s;
    stage.style.width = Math.floor(CW * s0) + 'px';
    stage.style.height = Math.floor(CH * s0) + 'px';
    stage.style.setProperty('--u', s + 'px');
    // 手机上显示画布最多放大 3 倍（再大肉眼看不出区别，只会更耗电）；卡顿时降到 2 倍
    const coarse = matchMedia('(pointer: coarse)').matches;
    const n = Math.max(1, Math.min(G.lowFx ? 2 : coarse ? 3 : 6, Math.ceil(s0 * (window.devicePixelRatio || 1))));
    if (dv.width !== CW * n) { dv.width = CW * n; dv.height = CH * n; dctx.imageSmoothingEnabled = false; }
    // 像素字体只在 12 的整数倍时清楚
    const fs = 12 * Math.max(1, Math.round((12.8 * s0) / 12));
    const fs2 = 12 * Math.max(1, Math.round((10 * s0) / 12));
    stage.style.setProperty('--fs', fs + 'px');
    stage.style.setProperty('--fs2', Math.min(fs2, fs) + 'px');
    const portrait = vh > vw && vw < 900 && matchMedia('(pointer: coarse)').matches;
    $('#rotate').classList.toggle('hidden', !portrait || G.portraitOk);
  }
  window.addEventListener('resize', resize);
  $('#btn-portrait').addEventListener('click', () => { G.portraitOk = true; resize(); });

  // ---------- helpers ----------
  // 快进（通关后第二遍才有）：等待时间缩短，对话一下打完并自动翻页
  G.ff = false;
  G.wait = (ms) => new Promise((r) => setTimeout(r, G.ff ? ms * 0.3 : ms));
  G.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  G.lock = () => G.lockN++;
  G.unlock = () => (G.lockN = Math.max(0, G.lockN - 1));
  G.run = async (fn) => { G.lock(); try { return await fn(); } finally { G.unlock(); } };
  G.el = (html, parent = layer) => { const d = document.createElement('div'); d.innerHTML = html.trim(); const e = d.firstChild; parent.appendChild(e); return e; };

  // tweens
  const tweens = [];
  G.tween = (obj, props, ms, ease = (k) => 1 - Math.pow(1 - k, 3)) => new Promise((res) => {
    const from = {}; for (const k in props) from[k] = obj[k];
    tweens.push({ obj, props, from, ms, t: 0, ease, res });
  });

  const CHR_WHO = { gwen: 'Gwen', me: 'Baiding', pi: 'Bex', josh: 'Josh' };
  // 每个人说话时打字音的音高不一样
  const VOICE = { Gwen: 1046, Baiding: 784, Bex: 659, Josh: 587, Flex: 1397 };
  // ---------- actors ----------
  G.actor = (o) => {
    const a = Object.assign({ x: 0, y: 150, dir: 1, visible: true, walking: false, anim: 0, speed: 55, scale: 1, target: null }, o);
    G.actors.push(a); return a;
  };
  G.walk = (a, x) => new Promise((res) => {
    if (Math.abs(a.x - x) < 1) { res(); return; }
    a.target = x; a._res = res; a.walking = true; a.dir = x > a.x ? 1 : -1;
  });

  // ---------- objects ----------
  // {id, x, y, w, h, hint, goal, enabled(), stand, onTap, draw}
  G.obj = (o) => { const ob = Object.assign({ hint: true, seen: false, goal: false, enabled: () => true }, o); G.objects.push(ob); return ob; };
  G.setGoal = (id) => { G.objects.forEach((o) => (o.goal = o.id === id)); };

  // ---------- dialog ----------
  const dlg = $('#dialog'), dName = dlg.querySelector('.name'), dText = dlg.querySelector('.text');
  const dPort = dlg.querySelector('.portrait'), dPortG = dPort.getContext('2d');
  function setPortrait(who, face) {
    const sp = who ? CHR.portrait(who, face) : null;
    dlg.classList.toggle('has-portrait', !!sp);
    dPort.classList.toggle('hidden', !sp);
    if (sp) {
      dPortG.clearRect(0, 0, 64, 64);
      const bgc = { Gwen: ['#f6e3d0', '#efd2bc'], Baiding: ['#dfe6f2', '#cdd6e8'], Bex: ['#e6e0f0', '#d6cee6'] }[who] || ['#f3e3cc', '#e8d4b8'];
      dPortG.fillStyle = bgc[0]; dPortG.fillRect(0, 0, 64, 64);
      dPortG.fillStyle = bgc[1]; for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 4 : 0; x < 64; x += 8) dPortG.fillRect(x, y, 2, 2);
      dPortG.drawImage(sp, 0, 0);
    }
  }
  const subEl = $('#subtitle'), subText = subEl.querySelector('.sub-text');
  let dState = null;
  G.say = (who, text, opt = {}) => new Promise((res) => {
    dlg.classList.remove('hidden');
    dlg.classList.toggle('narration', !who);
    dName.textContent = who || '';
    dText.textContent = '';
    setPortrait(who, opt.face);
    dlg.classList.add('typing');
    subEl.classList.add('hidden');
    const chars = [...text];
    let i = 0;
    const st = { done: false, res, opt };
    dState = st;
    // 让对应的人物张嘴、点头；问句冒一个问号气泡
    G.speaker = who; G.typing = true; G.lineId = (G.lineId || 0) + 1;
    const spk = who && G.actors.find((a) => CHR_WHO[a.sprite] === who && a.visible);
    if (spk && /？$|\?$/.test(text.trim())) CHR.emote(spk, '?');
    const finish = () => {
      clearInterval(st.iv); dText.textContent = text; dlg.classList.remove('typing'); st.done = true; G.typing = false;
      if (opt.sub) { subText.textContent = opt.sub; subEl.classList.remove('hidden'); AU.sfx('beep'); }
    };
    st.finish = finish;
    if (G.ff) { setTimeout(() => { finish(); setTimeout(() => { if (dState === st) advanceDialog(); }, opt.sub ? 900 : 450); }, 30); }
    st.iv = setInterval(() => {
      if (G.ff) return;
      i++; dText.textContent = chars.slice(0, i).join('');
      if (who && i % 2 === 0) AU.blip(VOICE[who] || 880);
      if (i >= chars.length) finish();
    }, opt.speed || 32);
  });
  function advanceDialog() {
    if (!dState) return false;
    if (!dState.done) { dState.finish(); return true; }
    const r = dState.res; dState = null; G.speaker = null; G.typing = false;
    dlg.classList.add('hidden'); subEl.classList.add('hidden');
    AU.sfx('click');
    r();
    return true;
  }
  G.talk = async (lines) => { for (const l of lines) await G.say(l[0], l[1], l[2]); };
  G.dialogOpen = () => !!dState;

  // choices
  const choicesEl = $('#choices');
  G.choose = (question, options) => new Promise((res) => {
    if (question) {
      dlg.classList.remove('hidden', 'narration', 'typing'); dName.textContent = ''; dText.textContent = question;
      dlg.classList.add('narration');
    }
    choicesEl.innerHTML = '';
    choicesEl.classList.remove('hidden');
    options.forEach((o, i) => {
      const b = document.createElement('button'); b.className = 'btn';
      if (typeof o === 'object') { b.textContent = o.t; if (o.off) { b.disabled = true; b.classList.add(o.done ? 'done' : 'locked'); } } else b.textContent = o;
      b.addEventListener('pointerdown', (e) => e.stopPropagation());
      b.addEventListener('click', (e) => {
        e.stopPropagation(); AU.sfx('select');
        choicesEl.classList.add('hidden'); dlg.classList.add('hidden');
        res(i);
      });
      choicesEl.appendChild(b);
    });
  });

  // wait for a tap anywhere
  let tapWaiter = null;
  G.waitTap = () => new Promise((r) => (tapWaiter = r));

  // ---------- toasts / achievements / reagents ----------
  const toastsEl = $('#toasts');
  G.toast = (text, ms = 2600) => {
    const e = document.createElement('div'); e.className = 'toast'; e.textContent = text; toastsEl.appendChild(e);
    setTimeout(() => { e.classList.add('out'); setTimeout(() => e.remove(), 400); }, ms);
  };
  G.achieve = (id) => {
    // 测试模式下，已经拿过的成就再次触发时提示一下，免得以为没触发
    if (G.save.ach[id]) { if (/[?&]dev/.test(location.search) && STORY.achievements[id]) G.toast('（成就「' + STORY.achievements[id].name + '」之前已经拿到了）', 1800); return; }
    const a = STORY.achievements[id]; if (!a) return;
    G.save.ach[id] = true; G.persist();
    AU.sfx('achieve');
    const e = document.createElement('div'); e.className = 'ach';
    e.innerHTML = `<div class="medal">★</div><div><div class="t1">成就解锁 · ${a.name}</div><div class="t2">${a.desc}</div></div>`;
    toastsEl.appendChild(e);
    setTimeout(() => { e.classList.add('out'); setTimeout(() => e.remove(), 400); }, 3200);
  };

  // 隐藏成就：不算在 13 个里，弹出粉色的特别提示（测试模式下只记在这次浏览里，不写进存档）
  G.hasSecret = () => !!(G.save.ach[STORY.secretAch.id] || sessionStorage.getItem('gwen1126-test-secret'));
  G.achieveSecret = () => {
    const A = STORY.secretAch;
    if (G.testAllAch) sessionStorage.setItem('gwen1126-test-secret', '1');
    else { G.save.ach[A.id] = true; G.persist(); }
    AU.sfx('secret');
    const e = document.createElement('div'); e.className = 'ach-secret';
    e.innerHTML = `<div class="spark s1">✦</div><div class="spark s2">✧</div><div class="spark s3">♥</div><div class="spark s4">✦</div>
      <div class="lbl">${A.label}</div><div class="nm"><span class="hrt">♥</span>${A.name}<span class="hrt">♥</span></div><div class="ds">${A.desc}</div>`;
    G.layer.appendChild(e);
    setTimeout(() => { e.classList.add('out'); setTimeout(() => e.remove(), 700); }, 5200);
  };

  const rack = $('#rack');
  G.showRack = (show = true) => {
    rack.classList.toggle('hidden', !show);
    if (!rack.children.length) {
      rack.innerHTML = '<span class="label">试剂</span>' + STORY.reagents.map((r) => `<div class="tube"><div class="liq" style="background:${r.color}"></div></div>`).join('');
    }
    G.updateRack();
  };
  G.updateRack = () => {
    const tubes = rack.querySelectorAll('.tube');
    G.save.reagents.forEach((v, i) => tubes[i] && tubes[i].classList.toggle('full', !!v));
    const n = G.save.reagents.filter(Boolean).length;
    const l = rack.querySelector('.label'); if (l) l.textContent = `试剂 ${n}/5`;
  };
  G.gainReagent = async (i) => {
    const r = STORY.reagents[i];
    AU.sfx('pickup');
    const e = G.el(`<div class="panel center reagent-pop">
      <div class="big-tube"><div class="liq" style="background:${r.color}"></div></div>
      <div class="t1">获得关键试剂 ${i + 1} / 5</div>
      <div class="t2">${r.name} · ${r.en}</div>
      <div class="t3">${r.desc}</div></div>`);
    await Promise.race([G.waitTap(), G.wait(3500)]);
    tapWaiter = null;
    e.remove();
    G.save.reagents[i] = true; G.persist();
    G.showRack(true);
  };

  G.notify = async (from, msg, sub) => {
    AU.sfx('notify');
    const e = G.el(`<div class="notify"><div class="from"><span><i class="ico ico-chat"></i>${from}</span><span>现在</span></div><div class="msg">${msg}</div>${sub ? `<div class="sub">潜台词：${sub}</div>` : ''}</div>`);
    await G.wait(500);
    await Promise.race([G.waitTap(), G.wait(5000)]);
    tapWaiter = null;
    e.style.transition = 'opacity .3s'; e.style.opacity = 0; setTimeout(() => e.remove(), 300);
  };

  // ---------- fade / filter ----------
  const fadeEl = $('#fade');
  // 像素转场：低分辨率画布放大，天然是一格一格的方块
  const trCv = document.createElement('canvas'); trCv.width = 128; trCv.height = 72; trCv.id = 'trans';
  stage.appendChild(trCv);
  const trG = trCv.getContext('2d');
  const hash = (x, y) => { const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return v - Math.floor(v); };
  function drawTrans(type, k, cx = 64, cy = 36) {
    trG.clearRect(0, 0, 128, 72);
    if (k <= 0) return;
    trG.fillStyle = '#0a0814';
    if (type === 'iris') {
      trG.fillRect(0, 0, 128, 72);
      const r = Math.max(0, (1 - k) * 80);
      trG.globalCompositeOperation = 'destination-out'; trG.beginPath(); trG.arc(cx, cy, r, 0, Math.PI * 2); trG.fill(); trG.globalCompositeOperation = 'source-over';
    } else {
      // 马赛克：方块从四周往中间、带一点随机地铺满
      for (let y = 0; y < 72; y += 4) for (let x = 0; x < 128; x += 4) {
        const edge = 1 - Math.hypot((x - 64) / 64, (y - 36) / 36) / 1.42;
        if (hash(x, y) * 0.45 + edge * 0.55 < k * 1.02) trG.fillRect(x, y, 4, 4);
      }
    }
  }
  G.trans = (type, out, ms = 500, at) => new Promise((res) => {
    const t0 = performance.now();
    const c = at ? [Math.round((at.x / W) * 128), Math.round((at.y / H) * 72)] : [64, 36];
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / ms), e = out ? k : 1 - k;
      drawTrans(type, e, c[0], c[1]);
      if (k < 1) requestAnimationFrame(step); else res();
    };
    step();
  });
  G.fadeOut = (ms = 500, white = false) => { fadeEl.classList.toggle('white', white); fadeEl.style.transitionDuration = ms + 'ms'; fadeEl.style.opacity = 1; return G.wait(ms); };
  G.fadeIn = (ms = 500) => { fadeEl.style.transitionDuration = ms + 'ms'; fadeEl.style.opacity = 0; return G.wait(ms); };
  G.flash = async () => { AU.sfx('flash'); fadeEl.classList.add('white'); fadeEl.style.transitionDuration = '60ms'; fadeEl.style.opacity = 1; await G.wait(90); fadeEl.style.transitionDuration = '700ms'; fadeEl.style.opacity = 0; await G.wait(700); fadeEl.classList.remove('white'); };
  // 镜头推近 / 拉回：z 倍数，(x, y) 是屏幕上的中心点
  // 镜头聚焦：用电影式的上下黑边代替放大（放大会把像素拉得大小不一）
  G.zoomTo = (z, x, y, ms = 500) => G.tween(G, { letterbox: z > 1 ? 1 : 0 }, ms, (k) => k * k * (3 - 2 * k));
  G.setFilter = (f) => { dv.style.filter = f || ''; stage.classList.toggle('vignette', !!f); };

  // ---------- scenes ----------
  G.def = (name, s) => (G.scenes[name] = Object.assign({ name, width: W, floor: 150, minX: 10, maxX: null }, s));
  G.goto = async (name, opt = {}) => {
    G.lock();
    const tr = opt.trans || 'mosaic';
    const at = G.gwen ? { x: G.gwen.x - G.camX, y: G.gwen.y - 40 } : null;
    if (!opt.noFade) await G.trans(tr, true, opt.fade || 600, tr === 'iris' ? at : null);
    if (G.scene && G.scene.exit) G.scene.exit();
    G.onHover = null;
    G.actors = []; G.objects = []; G.particles = []; G.vignette = null; G.setFilter(''); G.letterbox = 0; G.hoverObj = null; G.ripple = null;
    layer.innerHTML = '';
    rack.classList.add('hidden');
    $('#tip').classList.add('hidden');
    const s = G.scenes[name];
    G.scene = s; G.camX = 0; G.gwen = null;
    K = s.k || 2; W = CW / K; H = CH / K;
    if (s.checkpoint) { G.save.scene = name; G.persist(); }
    if (s.bgm !== undefined) AU.bgm(s.bgm);
    s.setup && s.setup(opt);
    if (G.gwen) G.camX = G.clamp(G.gwen.x - W / 2, 0, Math.max(0, s.width - W));
    if (opt.cam !== undefined) G.camX = opt.cam;
    if (!opt.noFade) { const at2 = G.gwen ? { x: G.gwen.x - G.camX, y: G.gwen.y - 40 } : null; await G.trans(tr, false, opt.fade || 600, tr === 'iris' ? at2 : null); }
    G.unlock();
    if (s.start) G.run(() => s.start(opt));
  };

  // ---------- input ----------
  function toGame(e) {
    const r = dv.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  }
  G.hitTest = (p) => {
    const wx = p.x + G.camX;
    for (let i = G.objects.length - 1; i >= 0; i--) {
      const o = G.objects[i];
      if (o.hidden || !o.enabled()) continue;
      const pad = 4;
      if (wx >= o.x - pad && wx <= o.x + o.w + pad && p.y >= o.y - pad && p.y <= o.y + o.h + pad) return o;
    }
    return null;
  };
  async function interact(o) {
    const g = G.gwen;
    if (g && o.stand !== false) {
      const sx = o.stand !== undefined ? o.stand : G.clamp(g.x, o.x - 6, o.x + o.w + 6);
      await G.walk(g, G.clamp(sx, G.scene.minX, (G.scene.maxX ?? G.scene.width - 10)));
      g.dir = (o.x + o.w / 2) >= g.x ? 1 : -1;
      // 伸手碰一下物品
      if (!g.pose && !g.sit) { g.pose = 'reach'; setTimeout(() => { if (g.pose === 'reach') g.pose = undefined; }, 380); }
    }
    o.seen = true;
    AU.sfx('select');
    await o.onTap();
  }
  G.interact = (o) => G.run(() => interact(o));

  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, .btn, .letter')) return;
    AU.unlock();
    G.lastInput = performance.now();
    if (G.onPointer && G.onPointer(e, toGame(e))) return;
    if (advanceDialog()) return;
    if (tapWaiter) { const t = tapWaiter; tapWaiter = null; t(toGame(e)); return; }
    if (G.locked || !G.scene || !G.gwen || G.scene.noWalk) { G.scene && G.scene.onTap && !G.locked && G.scene.onTap(toGame(e)); return; }
    const p = toGame(e);
    const o = G.hitTest(p);
    if (o) { G.interact(o); return; }
    if (G.scene.onTap && G.scene.onTap(p)) return;
    const tx = G.clamp(p.x + G.camX, G.scene.minX, G.scene.maxX ?? G.scene.width - 10);
    G.walk(G.gwen, tx);
    G.marker = { x: tx, t: 0.5 };
    G.ripple = { x: tx, y: G.gwen.y, t: 0 };
  });
  stage.addEventListener('pointerup', (e) => G.onPointerUp && G.onPointerUp(e));
  // 鼠标悬浮显示物品名
  const tipEl = $('#tip');
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const p = toGame(e);
    if (G.onHover && G.onHover(p)) { tipEl.classList.add('hidden'); dv.style.cursor = 'pointer'; return; }
    const o = !G.locked && !G.vignette && G.scene && G.gwen && !G.scene.noWalk ? G.hitTest(p) : null;
    G.hoverObj = o && o.enabled() ? o : null;
    if (o && o.label) {
      tipEl.textContent = o.label; tipEl.classList.remove('hidden');
      tipEl.style.left = (p.x / W) * 100 + '%'; tipEl.style.top = (p.y / H) * 100 + '%';
      dv.style.cursor = 'pointer';
    } else { tipEl.classList.add('hidden'); dv.style.cursor = ''; }
  });
  stage.addEventListener('pointerleave', () => { tipEl.classList.add('hidden'); G.hoverObj = null; if (G.onHover) G.onHover(null); });
  stage.addEventListener('pointercancel', (e) => G.onPointerUp && G.onPointerUp(e));

  window.addEventListener('keydown', (e) => {
    AU.unlock(); G.lastInput = performance.now();
    if (e.repeat && (e.key === ' ' || e.key === 'Enter')) { G.onKeyHold && G.onKeyHold(true); return; }
    G.keys[e.key] = true;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (G.onKey && G.onKey(e)) return;
      if (advanceDialog()) return;
      if (tapWaiter) { const t = tapWaiter; tapWaiter = null; t({ x: W / 2, y: H / 2, key: true }); return; }
      if (!G.locked && G.gwen) {
        let best = null, bd = 30;
        for (const o of G.objects) {
          if (o.hidden || !o.enabled()) continue;
          const d = Math.abs(o.x + o.w / 2 - G.gwen.x) - o.w / 2;
          if (d < bd) { bd = d; best = o; }
        }
        if (best) G.interact(best);
      }
    }
  });
  window.addEventListener('keyup', (e) => { G.keys[e.key] = false; if (e.key === ' ' || e.key === 'Enter') G.onKeyUp && G.onKeyUp(e); });

  // ---------- particles ----------
  G.burst = (x, y, n, colors, o = {}) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = (o.speed || 40) * (0.4 + Math.random() * 0.6);
      G.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0), life: (o.life || 1) * (0.6 + Math.random() * 0.4), max: o.life || 1, c: colors[i % colors.length], g: o.g ?? 30, s: o.size || 1, screen: !!o.screen, drag: o.drag ?? 0.98 });
    }
  };

  // ---------- loop ----------
  let last = performance.now();
  function frame(now) {
    const raw = (now - last) / 1000;
    const dt = Math.min(0.05, raw); last = now;
    G.t += dt;
    // 性能保底：连续几秒平均每帧超过 26ms，就自动减少特效
    if (!G.lowFx && raw < 0.1) { G._ema = (G._ema ?? 0.016) * 0.97 + raw * 0.03; if (G.t > 3 && G._ema > 0.026) { G.lowFx = true; resize(); console.log('lowFx on'); } }
    try { update(dt); draw(); dctx.imageSmoothingEnabled = false; dctx.drawImage(cv, 0, 0, dv.width, dv.height); }
    catch (err) { if (!G._errLogged) { console.error(err); G._errLogged = true; } window.__lastErr = String(err && err.stack || err); }
    requestAnimationFrame(frame);
  }
  function update(dt) {
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i]; tw.t += dt * 1000;
      const k = Math.min(1, tw.t / tw.ms), e = tw.ease(k);
      for (const p in tw.props) tw.obj[p] = tw.from[p] + (tw.props[p] - tw.from[p]) * e;
      if (k >= 1) { tweens.splice(i, 1); tw.res(); }
    }
    const s = G.scene; if (!s) return;
    // keyboard walking
    const g = G.gwen;
    if (g && !G.locked && !s.noWalk) {
      const l = G.keys.ArrowLeft || G.keys.a || G.keys.A, r = G.keys.ArrowRight || G.keys.d || G.keys.D;
      if (l || r) { g.target = null; g._res = null; g.walking = true; g.dir = r ? 1 : -1; g.x = G.clamp(g.x + g.dir * g.speed * dt, s.minX, s.maxX ?? s.width - 10); g.walkDist = (g.walkDist || 0) + g.speed * dt; g.kb = true; }
      else if (g.kb) { g.kb = false; g.walking = false; }
    }
    for (const a of G.actors) {
      a.anim += dt;
      if (a.target !== null && a.target !== undefined) {
        // 起步加速、快到时减速
        const d = a.target - a.x;
        a.v = Math.min(a.speed, (a.v || 0) + a.speed * dt * 7, 24 + Math.abs(d) * 5);
        const st = Math.max(a.v, 12) * dt * (G.ff ? 2.2 : 1);
        if (Math.abs(d) <= st) { a.x = a.target; a.target = null; a.walking = false; a.v = 0; const r = a._res; a._res = null; r && r(); }
        else {
          a.x += Math.sign(d) * st; a.dir = Math.sign(d); a.walking = true;
          const before = Math.floor((a.walkDist || 0) / 30); a.walkDist = (a.walkDist || 0) + st;
          // 每走一步脚下扬起一点灰
          if (a.dust !== false && (a.scale || 1) === 1 && !G.vignette && Math.floor(a.walkDist / 30) !== before) G.burst(a.x - a.dir * 5, a.y - 1, 3, ['#ffffff', '#e8e0d8'], { speed: 14, life: 0.45, g: -6, size: 1, drag: 0.9 });
        }
      }
      // 站久了的小动作：Gwen 看看手机，Baiding 推一下眼镜
      if (a.walking || a.pose || a.sit || G.locked || G.dialogOpen()) { a._still = 0; a._idlePose = undefined; }
      else {
        a._still = (a._still || 0) + dt;
        const fid = { gwen: ['phone', 2.6], me: ['glasses', 0.9] }[a.sprite];
        if (fid && a._still > 7 + ((a.seed || 0.5) * 5) % 4) { a._idlePose = fid[0]; if (a._still > 7 + ((a.seed || 0.5) * 5) % 4 + fid[1]) { a._idlePose = undefined; a._still = -Math.random() * 5; } }
      }
    }
    if (g) {
      const want = G.clamp(g.x - W / 2, 0, Math.max(0, s.width - W));
      if (!s.fixedCam) G.camX += (want - G.camX) * Math.min(1, dt * 5);
    }
    for (let i = G.particles.length - 1; i >= 0; i--) {
      const p = G.particles[i]; p.life -= dt;
      if (p.life <= 0) { G.particles.splice(i, 1); continue; }
      p.vy += p.g * dt; p.vx *= p.drag; p.vy *= p.drag; p.x += p.vx * dt; p.y += p.vy * dt;
    }
    if (G.marker) { G.marker.t -= dt; if (G.marker.t <= 0) G.marker = null; }
    if (G.ripple) G.ripple.t += dt;
    if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 10);
    s.update && s.update(dt);
    // idle hint
    if (!G.locked && s.hint && performance.now() - G.lastInput > 22000) { G.lastInput = performance.now(); const h = typeof s.hint === 'function' ? s.hint() : s.hint; if (h) G.toast('提示：' + h); }
  }
  function draw() {
    const s = G.scene;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CW, CH);
    if (!s) return;
    ctx.setTransform(K, 0, 0, K, 0, 0);
    const sh = G.shake > 0 ? Math.round((Math.random() - 0.5) * G.shake * 2) : 0;
    ctx.save();
    ctx.translate(sh, 0);
    if (G.vignette) { G.vignette(ctx, G.t); }
    else {
      const cam = Math.round(G.camX);
      ctx.save();
      ctx.translate(-cam, 0);
      s.draw && s.draw(ctx, G.t);
      for (const o of G.objects) if (!o.hidden && o.draw) o.draw(ctx, G.t);
      const acts = G.actors.filter((a) => a.visible).sort((a, b) => (a.z || 0) - (b.z || 0) || a.y - b.y);
      for (const a of acts) { if (a.draw) a.draw(ctx, G.t); else if (K === 1) CHR.drawActor(a, G.t); else GFX.drawActor(a); }
      s.drawFg && s.drawFg(ctx, G.t);
      // 前景视差层：离镜头更近，比背景移动得快一点
      if (s.fgPar) { ctx.save(); ctx.translate(-cam * (s.fgParK ?? 0.3), 0); s.fgPar(ctx, G.t); ctx.restore(); }
      if (!G.locked) drawMarkers();
      // 鼠标悬停的物品：四个角的小括号一闪一闪
      const ho = G.hoverObj;
      if (ho && !G.locked && !ho.hidden && G.objects.includes(ho)) {
        const p = 1 + Math.round(Math.sin(G.t * 8) * 1.5 + 1.5), x0 = Math.round(ho.x) - p, y0 = Math.round(ho.y) - p, x1 = Math.round(ho.x + ho.w) + p, y1 = Math.round(ho.y + ho.h) + p;
        for (const [cx, cy, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
          GFX.R(cx - (dx < 0 ? 6 : 0) - 1, cy - (dy < 0 ? 0 : 0) - 1, 8, 4, '#2b2238'); GFX.R(cx - (dx < 0 ? 2 : 0) - 1, cy - (dy < 0 ? 6 : 0) - 1, 4, 8, '#2b2238');
          GFX.R(cx - (dx < 0 ? 5 : 0), cy, 6, 2, '#fff6c0'); GFX.R(cx - (dx < 0 ? 1 : 0), cy - (dy < 0 ? 5 : 0), 2, 6, '#fff6c0');
        }
      }
      // 点地面的涟漪
      if (G.ripple) { const rp = G.ripple, k = rp.t / 0.45; if (k >= 1) G.ripple = null; else GFX.alpha(1 - k, () => { const rx = 4 + k * 16, ry = 1.5 + k * 5; for (let a = 0; a < 6.283; a += 0.25) GFX.R(Math.round(rp.x + Math.cos(a) * rx), Math.round(rp.y + Math.sin(a) * ry), 2, 1, '#ffffff'); }); }
      if (G.marker) { const f = K === 1 ? 2 : 1; GFX.alpha(G.marker.t * 2, () => { GFX.R(G.marker.x - 2 * f, s.floor + f, 5 * f, f, '#fff'); GFX.R(G.marker.x, s.floor, f, 3 * f, '#fff'); }); }
      for (const p of G.particles) if (!p.screen) GFX.alpha(Math.min(1, p.life / p.max * 1.5), () => GFX.R(p.x, p.y, p.s, p.s, p.c));
      ctx.restore();
    }
    if (!G.vignette && s.grade) FX.grade(ctx, typeof s.grade === 'function' ? s.grade() : s.grade);
    s.drawScreen && s.drawScreen(ctx, G.t);
    if (G.letterbox > 0) { const hb = Math.round(G.letterbox * 30); GFX.R(0, 0, W, hb, '#0a0814'); GFX.R(0, H - hb, W, hb, '#0a0814'); }
    for (const p of G.particles) if (p.screen) GFX.alpha(Math.min(1, p.life / p.max * 1.5), () => GFX.R(p.x, p.y, p.s, p.s, p.c));
    ctx.restore();
  }
  function drawMarkers() {
    const t = G.t, f = K === 1 ? 2 : 1;
    const Rf = (x, y, w, h, c) => GFX.R(x, y, w * f, h * f, c);
    for (const o of G.objects) {
      if (o.hidden || !o.enabled()) continue;
      const cx = Math.round(o.x + o.w / 2), top = o.y - 3 * f + Math.round(Math.sin(t * 5) * 1.5 * f);
      if (o.goal) {
        Rf(cx - 3 * f, top - 7 * f, 7, 2, '#2b2238'); Rf(cx - 2 * f, top - 5 * f, 5, 1, '#2b2238'); Rf(cx - 1 * f, top - 4 * f, 3, 1, '#2b2238'); Rf(cx, top - 3 * f, 1, 1, '#2b2238');
        Rf(cx - 2 * f, top - 7 * f, 5, 1, '#ffd66b'); Rf(cx - 1 * f, top - 6 * f, 3, 1, '#ffd66b'); Rf(cx, top - 5 * f, 1, 1, '#ffd66b');
        GFX.alpha(0.18 + Math.sin(t * 4) * 0.1, () => GFX.R(o.x - 1, o.y - 1, o.w + 2, o.h + 2, '#fff6c0'));
      } else if (o.hint && !o.seen) {
        Rf(cx - 2 * f, top - 9 * f, 5, 8, '#2b2238'); Rf(cx - 1 * f, top - 8 * f, 3, 6, '#fffaf0');
        Rf(cx, top - 7 * f, 1, 2, '#e34b4b'); Rf(cx, top - 4 * f, 1, 1, '#e34b4b');
      }
    }
  }

  // mute button
  const ffBtn = $('#btn-ff');
  G.syncFF = () => { ffBtn.classList.toggle('hidden', !G.save.cleared); ffBtn.classList.toggle('on', G.ff); };
  ffBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
  ffBtn.addEventListener('click', (e) => { e.stopPropagation(); G.ff = !G.ff; AU.sfx('select'); G.syncFF(); G.toast(G.ff ? '快进：开（对话会自动翻页）' : '快进：关', 1400); });
  const muteBtn = $('#btn-mute');
  const syncMute = () => muteBtn.classList.toggle('off', AU.muted);
  muteBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
  muteBtn.addEventListener('click', (e) => { e.stopPropagation(); AU.unlock(); AU.setMuted(!AU.muted); syncMute(); });
  syncMute();

  G.start = () => { GFX.build(); HD.build(); resize(); G.syncFF(); requestAnimationFrame(frame); };
  G.layer = layer;
  G.clearTap = () => (tapWaiter = null);
  Object.defineProperty(G, 'W', { get: () => W });
  Object.defineProperty(G, 'H', { get: () => H });
  Object.defineProperty(G, 'K', { get: () => K });
  return G;
})();
