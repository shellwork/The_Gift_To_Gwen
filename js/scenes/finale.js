// 终章：深夜实验室 → Flex 跑完 Protocol → 休息室的蛋糕 → 墙壁散开 → 雪夜星空 → 吹蜡烛 → 烟花 → 信 → 片尾
(() => {
  const { R, P, line, circle, ellipse, alpha, text } = GFX;
  const S = STORY.finale;
  const LANE = 256, CAKE_X = 320, CAKE_Y = 212;        // 蛋糕托盘底部
  const CAM = Math.min(LAB.FLEX_X + 52 - 320, LAB.W - 640);
  const CANDLES = [-24, -12, 0, 12, 24];
  let st, loungeBg = null, skyBg = null;

  const rnd = (i) => { const x = Math.sin(i * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); };
  const STARS = Array.from({ length: 170 }, (_, i) => ({ x: rnd(i) * 640, y: rnd(i + 100) * 200, s: rnd(i + 200) > 0.9 ? 2 : 1, p: rnd(i + 300) * 6, c: rnd(i + 400) > 0.8 ? '#ffe9c0' : rnd(i + 500) > 0.7 ? '#c8d8ff' : '#ffffff' }));

  // ---------- 星星拼字 ----------
  const BIG = {
    G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
    W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
    E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
    N: ['#...#', '##..#', '#.#.#', '#.#.#', '#..##', '#...#', '#...#'],
  };
  const CN = {
    柚: ['..#.....#..', '..#.....#..', '#####.#####', '..#...#.#.#', '.###..#.#.#', '#.#.#.#####', '..#...#.#.#', '..#...#.#.#', '..#...#####'],
    姐: ['..#...####.', '..#...#..#.', '#####.#..#.', '.#..#.####.', '.#.#..#..#.', '..#...#..#.', '.#.#..####.', '#...#.#..#.', '.....######'],
    生: ['..#..#.....', '.#...#.....', '.########..', '#....#.....', '.....#.....', '..#######..', '.....#.....', '.....#.....', '###########'],
    日: ['..#######..', '..#.....#..', '..#.....#..', '..#.....#..', '..#######..', '..#.....#..', '..#.....#..', '..#.....#..', '..#######..'],
    快: ['.#.....#...', '.#..#####..', '###....#.#.', '.#.....#.#.', '.#..#######', '.#.....#...', '.#....#.#..', '.#...#...#.', '.#..#.....#'],
    乐: ['......###..', '..####.....', '..#........', '..#........', '.#########.', '.....#.....', '..#..#..#..', '.#...#...#.', '....##.....'],
  };
  function glyphPts(str, cell, gap, y0, table, gw) {
    const chars = [...str].filter((c) => table[c]);
    const w = chars.length * gw * cell + (chars.length - 1) * gap;
    const x0 = 320 - w / 2, pts = [];
    chars.forEach((ch, li) => table[ch].forEach((row, y) => [...row].forEach((c, x) => c === '#' && pts.push({ x: Math.round(x0 + li * (gw * cell + gap) + x * cell), y: y0 + y * cell }))));
    return pts;
  }
  function starTargets() {
    const T = STORY.stars;
    const mk = (pts) => pts.map((p, i) => ({ ...p, sx: rnd(i * 3 + 7) * 640, sy: rnd(i * 5 + 11) * 200, d: rnd(i + 900) * 0.6, big: rnd(i + 77) > 0.82 }));
    return { names: mk(glyphPts(T.name, 8, 10, 14, BIG, 5).concat(glyphPts(T.nick, 6, 12, 84, CN, 11))), wish: mk(glyphPts(T.wish, 7, 14, 36, CN, 11)) };
  }

  G.def('finale', {
    k: 1, width: LAB.W, floor: LANE, minX: 40, maxX: 1200, bgm: 'night', checkpoint: true,
    grade: () => st.mode === 'lab' ? { vig: 0.34 } : st.mode === 'lounge' ? { c: '#ffb070', a: 0.12, vig: 0.3 } : st.mode === 'dream' || st.mode === 'toDream' ? { c: '#ffb3d6', a: 0.1, vig: 0.16 } : { vig: 0.24 },
    hint: () => (st.phase === 'talk' ? 'Baiding 在 Flex 旁边等你' : st.phase === 'load' ? '把试剂放进 Flex' : null),
    setup() {
      st = { phase: 'talk', flex: { mood: 'idle', gx: 0.5, dip: 0 }, orbs: [], cake: false, mode: 'lab', dissolve: 0, blocks: null, snap: null,
        flames: [1, 1, 1, 1, 1], out: [false, false, false, false, false], blow: 0, dark: 0, stars: null, starT: 0, rockets: [], sparks: [], flashes: [], fwT: 0,
        holding: false, sky: 0, lights: 0, glints: [], shoot: null,
        snow: Array.from({ length: 140 }, (_, i) => ({ x: rnd(i + 40) * 640, y: rnd(i + 80) * 360, v: 10 + rnd(i + 120) * 16, s: rnd(i + 160) > 0.75 ? 2 : 1, p: rnd(i + 200) * 6, f: rnd(i + 240) > 0.5 })) };
      this.fixedCam = false;
      if (G.devJump) window.__fin = st;
      G.showRack(true);
      G.gwen = G.actor({ sprite: 'gwen', x: 60, y: LANE, speed: 120, bag: true, seed: 0.3 });
      st.me = G.actor({ sprite: 'me', x: 1100, y: LANE, dir: -1, seed: 0.7 });
      G.obj({ id: 'me', label: S.labels.me, x: 1086, y: 176, w: 28, h: 80, stand: 1066, onTap: talk, enabled: () => st.phase === 'talk' });
      G.obj({ id: 'flex', label: S.labels.flex, x: LAB.FLEX_X, y: LAB.FLEX_Y - 22, w: 104, h: 142, stand: 1000, onTap: load, enabled: () => st.phase === 'load', hint: false });
      G.setGoal('me');
    },
    async start() {
      if (G.testHiddenPending) { G.testHiddenPending = false; return testHidden(); }
      await G.wait(500);
      await G.talk(S.enter);
    },
    exit() { G.onPointer = null; G.onPointerUp = null; G.onKey = null; G.onKeyUp = null; G.onKeyHold = null; if (AU.mic) AU.mic.stop(); },

    update(dt) {
      const t = G.t;
      st.orbs.forEach((o) => { o.k = Math.min(1, o.k + dt / o.dur); });
      if (st.flex.mood === 'run') { st.flex.gx = 0.5 + Math.sin(t * 3) * 0.45; st.flex.dip = Math.max(0, Math.sin(t * 6) * 8); }
      if (st.mode === 'dissolve') { st.dissolve = Math.min(1.25, st.dissolve + dt / 3); }
      // 雪
      st.snow.forEach((f) => { f.y += f.v * dt; f.x += Math.sin(t * 0.8 + f.p) * 8 * dt; if (f.y > 360) { f.y = -4; f.x = Math.random() * 640; } if (f.x < 0) f.x += 640; if (f.x > 640) f.x -= 640; });
      // 蛋糕旁边的闪光
      if (st.cake && (st.cover ?? 1) >= 1 && Math.random() < dt * 5) st.glints.push({ x: CAKE_X + (Math.random() - 0.5) * 130, y: 150 + Math.random() * 70, life: 0.7 });
      st.glints = st.glints.filter((g) => (g.life -= dt) > 0);
      // 流星
      if (st.mode === 'sky' && !st.shoot && Math.random() < dt * 0.12) st.shoot = { x: 120 + Math.random() * 400, y: 10 + Math.random() * 60, k: 0 };
      if (st.shoot) { st.shoot.k += dt * 1.4; if (st.shoot.k >= 1) st.shoot = null; }
      // 吹蜡烛
      if (st.phase === 'blow') {
        let blowing = st.holding;
        if (AU.mic) { const lv = AU.mic.level(); st.level = lv; if (lv > 0.05) blowing = true; }
        if (blowing) st.blow = Math.min(1, st.blow + dt / 1.4);
        else st.blow = Math.max(0, st.blow - dt / 5);
        const outN = st.out.filter(Boolean).length;
        st.blow = Math.max(st.blow, outN / 5);
        st.flames = st.flames.map((f, i) => {
          const th = (i + 1) / 5;
          if (st.blow >= th - 0.001) st.out[i] = true;
          if (st.out[i]) { if (f > 0.5) smoke(i); return 0; }
          return 1 - G.clamp((st.blow - (th - 0.2)) / 0.2, 0, 1) * 0.6;
        });
        const m = document.querySelector('.meter .fill'); if (m) m.style.width = st.blow * 100 + '%';
        if (st.out.every(Boolean)) blownOut();
      }
      if (st.dark > 0 && st.phase === 'party') { const to = st.darkTo ?? 0.35; st.dark += G.clamp(to - st.dark, -dt * 0.4, dt * 0.4); }
      // 烟花
      if (st.phase === 'party') {
        st.fwT -= dt;
        if (st.fwT <= 0) { st.fwT = st.hearts ? 0.8 + Math.random() * 1.3 : st.calm ? 1.8 + Math.random() * 2.2 : 0.45 + Math.random() * 0.8; launch(); if ((!st.calm || st.hearts) && Math.random() < 0.25) setTimeout(launch, 180); }
        st.rockets = st.rockets.filter((r) => {
          r.trail.push([r.x, r.y]); if (r.trail.length > 9) r.trail.shift();
          r.x += r.vx * dt; r.y += r.vy * dt; r.vy += 40 * dt;
          if (Math.random() < 0.6) st.sparks.push({ x: r.x, y: r.y, vx: (Math.random() - 0.5) * 12, vy: 20, life: 0.4, max: 0.4, c: '#ffd9a0', c2: '#ff9a4a', s: 1, g: 30, drag: 0.96 });
          if (r.y <= r.ty || r.vy > -20) { explode(r); return false; }
          return true;
        });
        if (st.stars) st.starT += dt;
      }
      st.sparks = st.sparks.filter((p) => {
        p.life -= dt; if (p.life <= 0) return false;
        p.px = p.x; p.py = p.y;
        p.vy += p.g * dt; p.vx *= p.drag; p.vy *= p.drag; p.x += p.vx * dt; p.y += p.vy * dt;
        return true;
      });
      st.flashes = st.flashes.filter((f) => (f.a -= dt * 2.2) > 0);
    },

    draw(ctx, t) {
      if (st.mode === 'lab') LAB.draw(ctx, t, { night: true, flex: st.flex, bulbOn: true });
      else if (st.mode === 'lounge') drawLounge(t);
      else if (st.mode === 'dream') { DREAM.draw(t); DREAM.rim(G.gwen); DREAM.rim(st.me); }
      else if (st.mode === 'toDream') drawToDream(t);
      else { drawSky(t); if (st.mode === 'dissolve') drawBlocks(); }
      if (st.cake) drawCakeTable(t);
    },
    drawFg(ctx, t) {
      // 梦境：天空之镜里的人物和蛋糕倒影、脚下的涟漪、两侧的近景云
      if (st.mode === 'dream') { DREAM.reflect(() => { if (st.cake) drawCakeTable(t); CHR.drawActor(G.gwen, t); CHR.drawActor(st.me, t); }); DREAM.drawFg(t, { ripples: [G.gwen, st.me] }); }
      if (st.mode === 'lounge' && (st.lt ?? 1) < 1) loungeDark(ctx, t);
      if (st.mode === 'lab') { LAB.fgProps(t, true); LAB.nightFg(ctx, t, { night: true, flex: st.flex, bulbOn: true }); }
      // 试剂光球
      st.orbs.forEach((o) => {
        if (o.k >= 1 || o.k < 0) return;
        const k = o.k, x = o.x0 + (o.x1 - o.x0) * k, y = o.y0 + (o.y1 - o.y0) * k - Math.sin(k * Math.PI) * 70;
        HD.glow(x, y, 14, o.c, 0.4); circle(x, y, 4, o.c); circle(x - 1, y - 1, 2, '#ffffff');
        for (let i = 1; i < 6; i++) { const kk = Math.max(0, k - i * 0.03); const tx = o.x0 + (o.x1 - o.x0) * kk, ty = o.y0 + (o.y1 - o.y0) * kk - Math.sin(kk * Math.PI) * 70; alpha(0.5 - i * 0.08, () => R(tx - 1, ty - 1, 2, 2, o.c)); }
      });
      if (st.mode === 'sky') snowBranches(t);
      if (st.mode === 'sky' || st.mode === 'dissolve') {
        // 前景雪
        st.snow.forEach((f, i) => { if (f.f) alpha(0.85, () => R(f.x, f.y, f.s, f.s, '#ffffff')); });
      }
      // 烛光照亮人物
      if (st.cake && st.flames.some((f) => f > 0) && st.mode !== 'lounge') {
        const op = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'lighter';
        const fl = 0.9 + Math.sin(t * 9) * 0.06;
        HD.glow(CAKE_X, 170, 150, st.magic ? '#6a2a6a' : '#7a4210', 0.42 * fl);
        if (st.mode === 'sky') FX.pool(ctx, CAKE_X, 258, 130, 16, '#ffa850', 0.22 * fl);   // 烛光照在雪地上
        ctx.globalCompositeOperation = op;
      }
      // 闪光
      st.glints.forEach((g) => { const a = Math.sin((g.life / 0.7) * Math.PI); alpha(a, () => { R(g.x, g.y - 2, 1, 5, '#fff6d0'); R(g.x - 2, g.y, 5, 1, '#fff6d0'); P(g.x, g.y, '#ffffff'); }); });
    },
    drawScreen(ctx, t) {
      if (st.dark > 0) alpha(st.dark, () => R(0, 0, 640, 360, '#05040d'));
      if (st.whiteout > 0) alpha(st.whiteout, () => R(0, 0, 640, 360, '#fff2f8'));
      if (st.mode === 'toDream') dreamSwirl(ctx, t);
      // 烟花光
      st.flashes.forEach((f) => { const op = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'lighter'; HD.glow(f.x, f.y, 170, f.c, f.a * 0.35); ctx.globalCompositeOperation = op; });
      st.rockets.forEach((r) => { r.trail.forEach(([x, y], i) => alpha(i / r.trail.length * 0.8, () => R(x, y, 2, 2, '#ffe0b0'))); R(r.x - 1, r.y - 1, 3, 3, '#ffffff'); });
      st.sparks.forEach((p) => {
        const k = p.life / p.max;
        const c = k > 0.75 ? '#ffffff' : k > 0.35 ? p.c : p.c2;
        if (p.glit && k < 0.5 && Math.random() < 0.5) return;
        alpha(Math.min(1, k * 1.6), () => { if (p.px !== undefined && p.s > 1) line(p.px, p.py, p.x, p.y, c); R(p.x, p.y, p.s, p.s, c); });
      });
      if (st.stars && st.phase === 'party') {
        const T = st.starT;
        const out = G.clamp((T - 8.5) / 1.2, 0, 1);
        const star = (s, i, T0, fade) => {
          const k = G.clamp((T - T0 - s.d) / 1.4, 0, 1); if (k <= 0 || fade <= 0) return;
          const e = 1 - Math.pow(1 - k, 3);
          const x = Math.round(s.sx + (s.x - s.sx) * e), y = Math.round(s.sy + (s.y - s.sy) * e + Math.sin(t * 1.5 + i * 0.3) * (k >= 1 ? 1 : 0)) - out * 10 * (T0 < 5 ? 1 : 0);
          const tw = 0.75 + Math.sin(t * 3 + i) * 0.25;
          alpha(fade * tw * Math.min(1, k * 2), () => {
            if (k < 1) alpha(0.5, () => line(x, y, Math.round(x - (s.x - s.sx) * 0.04), Math.round(y - (s.y - s.sy) * 0.04), '#ffe9b0'));
            R(x - 1, y, 5, 3, '#ffe9a0'); R(x, y - 1, 3, 5, '#ffe9a0'); R(x, y, 3, 3, '#fff8d8'); P(x + 1, y + 1, '#ffffff');
            if (s.big) { R(x + 1, y - 4, 1, 11, '#ffe39a'); R(x - 4, y + 1, 11, 1, '#ffe39a'); }
          });
          if (k >= 1) HD.glow(x + 1, y + 1, 7, '#fff0b0', 0.25 * fade);
        };
        const sa = st.starA ?? 1;
        st.stars.names.forEach((s, i) => star(s, i, 1.2, (1 - out) * sa));
        st.stars.wish.forEach((s, i) => star(s, i, 10, sa));
      }
    },
  });

  // ---------- 烟花 ----------
  // 隐藏结局：各种颜色的爱心烟花
  const HEART_FW = [['#ff8fb3', '#c0306a'], ['#ffb3d1', '#e0508a'], ['#c9a3ff', '#7a4ad0'], ['#9fd8ff', '#3a7ad0'], ['#ffd66b', '#d07a1a'], ['#9ef0c8', '#2a9a6a'], ['#ffb38a', '#d0502a'], ['#ffffff', '#ff8fb3']];
  const FW_C = [['#ff8fb3', '#c0306a'], ['#ffd66b', '#d07a1a'], ['#81d8d0', '#2a8a8a'], ['#b9a3ff', '#5a3ad0'], ['#ff9a6a', '#c03a2a'], ['#9ef0b0', '#2a9a5a'], ['#ffffff', '#8ab4ff']];
  function launch() {
    const x = 60 + Math.random() * 520;
    st.rockets.push({ x, y: 300, vx: (Math.random() - 0.5) * 30, vy: -(260 + Math.random() * 70), ty: 40 + Math.random() * 110, trail: [], c: st.hearts ? HEART_FW[Math.floor(Math.random() * HEART_FW.length)] : FW_C[Math.floor(Math.random() * FW_C.length)], type: st.hearts ? 'heart' : ['peony', 'peony', 'ring', 'willow', 'heart', 'double', 'crackle'][Math.floor(Math.random() * 7)], hs: 4.5 + Math.random() * 3 });
    AU.sfx('launch');
  }
  function explode(r) {
    AU.sfx('boom');
    const [c, c2] = r.c;
    st.flashes.push({ x: r.x, y: r.y, a: 1, c: c2 });
    const add = (vx, vy, o = {}) => st.sparks.push(Object.assign({ x: r.x, y: r.y, vx, vy, life: 1.6, max: 1.6, c, c2, s: 2, g: 26, drag: 0.975 }, o));
    const n = 70;
    if (r.type === 'ring') for (let i = 0; i < 48; i++) { const a = (i / 48) * 6.283; add(Math.cos(a) * 110, Math.sin(a) * 60, { life: 1.3, max: 1.3 }); }
    else if (r.type === 'heart') for (let i = 0; i < (st.hearts ? 96 : 60); i++) { const a = (i / (st.hearts ? 96 : 60)) * 6.283; const hx = 16 * Math.pow(Math.sin(a), 3), hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); add(hx * (st.hearts ? r.hs : 6.5), hy * (st.hearts ? r.hs : 6.5), { c: st.hearts ? c : '#ff8fb3', c2: st.hearts ? c2 : '#e0306a', life: 1.5, max: 1.5, g: 8, drag: 0.965 }); }
    else if (r.type === 'willow') for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, sp = 40 + Math.random() * 70; add(Math.cos(a) * sp, Math.sin(a) * sp, { c: '#ffe39a', c2: '#c08020', life: 2.6, max: 2.6, g: 34, drag: 0.955, glit: true }); }
    else {
      for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, sp = 60 + Math.random() * 80; add(Math.cos(a) * sp, Math.sin(a) * sp, { glit: r.type === 'crackle' }); }
      if (r.type === 'double') { const o = FW_C[Math.floor(Math.random() * FW_C.length)]; for (let i = 0; i < 36; i++) { const a = (i / 36) * 6.283; add(Math.cos(a) * 45, Math.sin(a) * 45, { c: o[0], c2: o[1], life: 1.2, max: 1.2 }); } }
    }
    for (let i = 0; i < 16; i++) { const a = Math.random() * 6.283; add(Math.cos(a) * 30, Math.sin(a) * 30, { c: '#ffffff', c2: c, s: 1, life: 0.7, max: 0.7 }); }
  }
  function smoke(i) {
    for (let k = 0; k < 8; k++) G.particles.push({ x: CAKE_X + CANDLES[i] + (Math.random() - 0.5) * 2, y: 146, vx: (Math.random() - 0.5) * 8, vy: -14 - Math.random() * 10, life: 1.6, max: 1.6, c: k % 2 ? '#9a9ab0' : '#c8c8d8', g: -6, s: 2, screen: false, drag: 0.99 });
  }

  // ---------- 休息室 ----------
  function paintLounge() {
    const c = document.createElement('canvas'); c.width = 640; c.height = 360;
    const g = c.getContext('2d'); const real = GFX.ctx; GFX.setCtx(g);
    const PW = HD.PAL.wood;
    // 墙
    R(0, 0, 640, 244, '#3e3660');
    for (let x = 0; x < 640; x += 16) R(x, 16, 8, 176, '#433a68');
    for (let y = 30; y < 190; y += 20) for (let x = (y / 20) % 2 ? 4 : 12; x < 640; x += 16) { P(x, y, '#5a4e86'); P(x - 1, y + 1, '#4e4478'); P(x + 1, y + 1, '#4e4478'); }
    R(0, 192, 640, 44, '#4a3a5a'); R(0, 192, 640, 3, '#6a5478'); for (let x = 8; x < 640; x += 52) { R(x, 200, 44, 30, '#43344f'); R(x, 200, 44, 1, '#5a4868'); }
    R(0, 236, 640, 8, '#2e2236'); R(0, 236, 640, 1, '#5a4868');
    R(0, 0, 640, 16, '#2a2440'); R(0, 14, 640, 2, '#1e1a30');
    // 地板
    for (let y = 244, r = 0; y < 360; y += 12, r++) { R(0, y, 640, 12, r % 2 ? '#5a3e3a' : '#62443e'); R(0, y, 640, 1, '#4a302e'); for (let x = (r * 41) % 80; x < 640; x += 80) R(x, y, 1, 12, '#4a302e'); }
    HD.fadeV(0, 244, 640, 20, '#1a1020', 0.45, 0);
    // 圆地毯
    ellipse(320, 268, 190, 26, '#7a4a6a'); ellipse(320, 268, 182, 23, '#a8668a'); ellipse(320, 268, 170, 20, '#c47ea0'); ellipse(320, 268, 150, 16, '#a8668a');
    for (let i = 0; i < 24; i++) { const a = (i / 24) * 6.283; P(320 + Math.cos(a) * 176, 268 + Math.sin(a) * 24, '#f0c0d4'); }
    // 窗户
    const wx = 34, wy = 44, ww = 150, wh = 132;
    R(wx - 8, wy - 8, ww + 16, wh + 16, PW[1]); R(wx - 6, wy - 6, ww + 12, wh + 12, PW[3]); R(wx - 6, wy - 6, ww + 12, 2, PW[4]);
    R(wx - 12, wy + wh + 6, ww + 24, 6, PW[3]); R(wx - 12, wy + wh + 6, ww + 24, 1, PW[5]); R(wx - 12, wy + wh + 11, ww + 24, 2, PW[1]);
    // 窗台上的小东西
    R(wx + 4, wy + wh - 4, 14, 10, '#d9946a'); R(wx + 4, wy + wh - 4, 14, 2, '#e8ae80'); circle(wx + 11, wy + wh - 9, 6, '#3f7a58'); circle(wx + 9, wy + wh - 11, 3, '#5c9e6c');
    R(wx + 120, wy + wh - 2, 10, 8, '#f4ead8'); R(wx + 124, wy + wh - 6, 2, 4, '#4a3a3a');
    // 软木板 + SLAS 合影
    R(206, 90, 70, 56, PW[1]); R(208, 92, 66, 52, '#b8915e');
    for (let i = 0; i < 30; i++) P(210 + rnd(i) * 62, 94 + rnd(i + 9) * 48, '#a07a4a');
    R(214, 98, 34, 28, '#fffdf8'); R(216, 100, 30, 20, '#d8c4a8');
    for (let i = 0; i < 6; i++) { circle(219 + i * 5, 109, 2, ['#3a2a20', '#7b4a2c', '#1f1f27', '#5a3e30', '#2a2a30', '#6a5040'][i]); R(217 + i * 5, 112, 5, 8, ['#3c5280', '#fdfaf4', '#24242c', '#3f4f72', '#80404a', '#4f8a6a'][i]); }
    text('SLAS', 223, 121, '#6a5a7a'); circle(231, 98, 1, '#e34b4b');
    R(252, 100, 18, 16, '#ffe36e'); R(254, 104, 14, 1, '#c9a020'); R(254, 107, 10, 1, '#c9a020'); circle(261, 100, 1, '#3b6fd1');
    R(252, 122, 18, 16, '#f7c6d6'); text('1126', 253, 128, '#c0306a');
    // 沙发
    const sx = 486;
    HD.box(sx, 168, 140, 34, ['#3a2448', '#5a3a6a', '#7a5090', '#9468a8', '#b088c4']);
    R(sx + 4, 172, 132, 2, '#a07ab8');
    HD.box(sx - 6, 196, 152, 30, ['#3a2448', '#5a3a6a', '#7a5090', '#9468a8', '#b088c4']);
    HD.box(sx - 10, 180, 14, 48, ['#3a2448', '#4a2e5a', '#6a4480', '#845c9c', '#a078b8']); HD.box(sx + 136, 180, 14, 48, ['#3a2448', '#4a2e5a', '#6a4480', '#845c9c', '#a078b8']);
    R(sx + 4, 200, 64, 2, '#9468a8'); R(sx + 72, 200, 64, 2, '#9468a8'); R(sx + 70, 198, 2, 26, '#5a3a6a');
    HD.box(sx + 14, 176, 26, 22, ['#a04a6a', '#c86a8a', '#e898b0', '#f6bccc', '#ffe0ea']); HD.box(sx + 96, 178, 24, 20, ['#2a6a6a', '#3a8a8a', '#5ab0b0', '#86d0cc', '#b8ece6']);
    // 毯子
    R(sx + 40, 196, 40, 34, '#e9c46a'); for (let y = 198; y < 230; y += 4) R(sx + 40, y, 40, 1, '#d4a848'); for (let x = sx + 42; x < sx + 80; x += 6) R(x, 228, 2, 4, '#e9c46a');
    R(sx - 4, 226, 4, 12, '#2a1e2a'); R(sx + 142, 226, 4, 12, '#2a1e2a');
    HD.fadeV(sx - 10, 228, 162, 12, '#120a18', 0.5, 0);
    // 会议屏幕
    R(492, 64, 124, 76, '#1b1d2a'); R(492, 64, 124, 1, '#3a3e50'); R(552, 140, 4, 8, '#1b1d2a');
    // 落地灯（底座）
    R(624, 238, 16, 4, '#2b2238'); R(631, 120, 3, 118, '#2b2238');
    // 绿植
    R(198, 212, 24, 30, '#c97a5a'); R(198, 212, 24, 3, '#e09a78'); R(198, 238, 24, 4, '#a05a3a');
    [[210, 190, 12], [200, 178, 10], [220, 172, 11], [212, 160, 9], [196, 198, 8], [226, 196, 9]].forEach(([lx, ly, r], i) => { line(210, 212, lx, ly, '#2f5d4b', 2); ellipse(lx, ly, r, Math.round(r * 0.6), ['#3f7a58', '#5c9e6c'][i % 2]); ellipse(lx - 2, ly - 2, r - 4, Math.round(r * 0.4), ['#5c9e6c', '#86c08a'][i % 2]); });
    HD.fadeH(0, 16, 30, 228, '#100818', 0.4, 0); HD.fadeH(610, 16, 30, 228, '#100818', 0, 0.4);
    GFX.setCtx(real);
    return FX.bake(c, FX.BAKE.lounge);
  }

  const BUNT = 'HAPPY BIRTHDAY';
  const BUNT_C = ['#f7a8c4', '#ffd66b', '#81d8d0', '#b9a3d6', '#ff9a8a', '#9ef0b0'];
  function drawLounge(t, snapshot) {
    if (!loungeBg) loungeBg = paintLounge();
    GFX.ctx.drawImage(loungeBg, 0, 0);
    // 窗外：雪夜城市
    const wx = 34, wy = 44, ww = 150, wh = 132;
    HD.dgradV(wx, wy, ww, wh, '#141a3c', 1, 1); HD.dgradV(wx, wy + 40, ww, wh - 40, '#3a3268', 0, 1);
    for (let i = 0; i < 20; i++) alpha(0.5 + Math.sin(t * 2 + i) * 0.4, () => P(wx + 4 + rnd(i + 3) * 140, wy + 4 + rnd(i + 33) * 60, '#ffffff'));
    circle(wx + 118, wy + 22, 10, '#fff3c9'); circle(wx + 122, wy + 18, 9, '#1a2048'); HD.glow(wx + 116, wy + 24, 22, '#fff3c9', 0.2);
    for (let i = 0; i < 14; i++) { const h = 20 + rnd(i + 7) * 46, x0 = wx + i * 11; R(x0, wy + wh - h, 10, h, '#10142e'); R(x0, wy + wh - h, 10, 2, '#e8eef8'); for (let y = wy + wh - h + 5; y < wy + wh - 3; y += 5) for (let xx = x0 + 2; xx < x0 + 9; xx += 3) if (rnd(xx * 7 + y) > 0.55) P(xx, y, rnd(xx + y) > 0.3 ? '#ffd66b' : '#ffb0c8'); }
    R(wx, wy + wh - 6, ww, 6, '#dfe6f4');
    st.snow.forEach((f) => { const x = wx + (f.x / 640) * ww, y = wy + (f.y / 360) * wh; R(x, y, 1, 1, '#ffffff'); });
    R(wx + ww / 2 - 2, wy, 4, wh, '#8f5e40'); R(wx, wy + 56, ww, 4, '#8f5e40'); R(wx + ww / 2 - 2, wy, 1, wh, '#b37b51');
    alpha(0.12, () => { line(wx + 8, wy + 50, wx + 30, wy + 8, '#ffffff'); line(wx + 90, wy + 120, wx + 120, wy + 70, '#ffffff'); });
    // 窗帘
    for (const side of [0, 1]) {
      const x0 = side ? wx + ww + 2 : wx - 26;
      for (let y = 0; y < 150; y++) {
        const sway = Math.round(Math.sin(t * 0.9 + y * 0.05) * (y / 150) * 1.5);
        const w = y > 96 && y < 104 ? 14 : 24;
        const x = x0 + sway + (side ? 0 : 24 - w);
        R(x, wy - 14 + y, w, 1, '#7a3e5a');
        for (let f = 3; f < w; f += 6) R(x + f, wy - 14 + y, 2, 1, '#5a2a44');
        R(x + (side ? 0 : w - 1), wy - 14 + y, 1, 1, '#9a5a78');
      }
      R(x0 + (side ? 0 : 10), wy + 82, 14, 3, '#e0ae48');
    }
    R(wx - 30, wy - 16, ww + 60, 3, '#6b4434');
    // 彩旗
    const bx0 = 230, bx1 = 620, bn = BUNT.length;
    const sag = (x) => 26 + Math.sin(((x - bx0) / (bx1 - bx0)) * Math.PI) * 18;
    for (let x = bx0; x < bx1; x++) P(x, sag(x), '#e8dcc8');
    [...BUNT].forEach((ch, i) => {
      if (ch === ' ') return;
      const px = bx0 + 14 + i * ((bx1 - bx0 - 28) / (bn - 1)), py = sag(px) + 1;
      const sw = Math.sin(t * 1.6 + i * 0.7) * 1.2;
      const c = BUNT_C[i % BUNT_C.length];
      GFX.ctx.fillStyle = c;
      for (let r = 0; r < 22; r++) { const w = Math.round(9 * (1 - r / 22)); R(px - w + sw * (r / 22), py + r, w * 2 + 1, 1, c); }
      R(px - 9, py, 19, 1, '#ffffff');
      text(ch, px - 2 + Math.round(sw * 0.3), py + 4, '#3e3660');
    });
    // 天花板的彩灯
    for (let i = 0; i < 46; i++) {
      const x = 6 + i * 14, y = 14 + Math.round(Math.abs(Math.sin(i * 0.5)) * 5);
      const c = ['#ffd66b', '#f7a8c4', '#a9e0d8', '#ffb38a'][i % 4];
      const on = 0.55 + Math.sin(t * 2.2 + i * 1.3) * 0.45;
      alpha(on * 0.3, () => circle(x, y + 3, 5, c));
      R(x - 1, y + 1, 3, 4, c); P(x, y + 1, '#ffffff');
    }
    // 会议屏幕：结果页
    R(496, 68, 116, 68, '#232a4e'); HD.dgradV(496, 68, 116, 68, '#3a3a7a', 0, 1);
    text('PROTOCOL #1126', 506, 74, '#fff6c0');
    text('RESULT', 506, 86, '#9ef0b0'); text('✓', 534, 86, '#9ef0b0');
    for (let i = 0; i < 10; i++) { const h = 6 + i * 3 + Math.round(Math.sin(t * 2 + i) * 1); R(506 + i * 9, 130 - h, 6, h, BUNT_C[i % 6]); }
    R(504, 130, 96, 1, '#9aa6c8');
    // 钟
    const ckx = 320, cky = 96;
    circle(ckx, cky, 13, '#6b4434'); circle(ckx, cky, 11, '#fffaf2');
    for (let i = 0; i < 12; i++) P(ckx + Math.round(Math.cos(i * 0.5236) * 9), cky + Math.round(Math.sin(i * 0.5236) * 9), '#c9c0b4');
    line(ckx, cky, ckx, cky - 8, '#2b2238', 2); line(ckx, cky, ckx + 1, cky - 9, '#2b2238'); P(ckx, cky, '#e34b4b');
    // 落地灯
    const lf = (0.92 + Math.sin(t * 2) * 0.03) * (st.lamp ?? 1);
    if (lf > 0) HD.glow(632, 112, 60, '#ffcf7a', 0.32 * lf);
    R(616, 98, 32, 18, '#f4dcb0'); R(616, 98, 32, 2, '#fff0d0'); R(616, 115, 32, 1, '#d8b888');
    if (lf > 0) alpha(0.14 * lf, () => { for (let i = 0; i < 90; i++) R(616 - i * 0.5, 116 + i, 32 + i, 1, '#ffd9a0'); });
    // 气球
    const balloons = [[236, 108, '#f7a8c4', 0], [258, 96, '#ffd66b', 1.3], [248, 124, '#81d8d0', 2.2], [404, 104, '#b9a3d6', 0.6], [424, 92, '#ff9a8a', 1.8], [418, 120, '#f7a8c4', 2.8]];
    balloons.forEach(([bx, by, c, p], i) => {
      const yy = by + Math.sin(t * 1.3 + p) * 3, xx = bx + Math.sin(t * 0.9 + p) * 1.5;
      const ax = i < 3 ? 262 : 382;
      for (let k = 0; k <= 20; k++) { const kk = k / 20; P(xx + (ax - xx) * kk + Math.sin(kk * 6 + t + p) * 2, yy + 13 + (214 - yy - 13) * kk, '#e8dcc8'); }
      ellipse(xx, yy, 10, 12, c); ellipse(xx - 2, yy - 2, 7, 9, shade(c, 1.12));
      ellipse(xx + 3, yy + 4, 5, 6, shade(c, 0.88));
      R(xx - 5, yy - 7, 2, 4, '#ffffff'); P(xx - 3, yy - 8, '#ffffff');
      R(xx - 1, yy + 12, 3, 2, shade(c, 0.8));
    });
  }
  let ldc = null;
  function loungeDark(ctx, t) {
    if (!ldc) { ldc = document.createElement('canvas'); ldc.width = 640; ldc.height = 360; }
    const g = ldc.getContext('2d'), lt = st.lt, k = 1 - lt, amb = Math.max(lt, st.lamp * 0.3);
    const a = [0x1c, 0x18, 0x38].map((v) => Math.round(v + (255 - v) * amb));
    g.globalCompositeOperation = 'source-over'; g.fillStyle = `rgb(${a.join(',')})`; g.fillRect(0, 0, 640, 360);
    g.globalCompositeOperation = 'lighter';
    const L = (x, y, r, c, al) => { if (al <= 0) return; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, HD.rgba(c, al)); gr.addColorStop(0.5, HD.rgba(c, al * 0.45)); gr.addColorStop(1, HD.rgba(c, 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
    L(110, 110, 180, '#2e3668', k);
    L(554, 102, 110, '#1e2a50', k);
    L(624, 130, 300, '#b07a40', st.lamp * k);
    const fsum = st.flames.reduce((p, q) => p + q, 0) / 5;
    L(CAKE_X, 150, 200, '#c08040', fsum * k);
    ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(ldc, 0, 0); ctx.globalCompositeOperation = 'source-over';
    // 发光的东西
    if (st.lamp > 0) alpha(st.lamp * k, () => { R(616, 98, 32, 18, '#f4dcb0'); R(616, 98, 32, 2, '#fff0d0'); });
    st.flames.forEach((f, i) => { if (f > 0.02) HD.glow(CAKE_X + CANDLES[i], 136, 14, '#ffcf7a', 0.5 * f * k); });
  }
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16); const r = Math.min(255, ((n >> 16) & 255) * k), g = Math.min(255, ((n >> 8) & 255) * k), b = Math.min(255, (n & 255) * k);
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  }

  // ---------- 星空 ----------
  function paintSky() {
    const c = document.createElement('canvas'); c.width = 640; c.height = 360;
    const g = c.getContext('2d'); const real = GFX.ctx; GFX.setCtx(g);
    const bands = ['#070720', '#0b0b2a', '#101036', '#161642', '#1d1a4e', '#261f5a', '#302464', '#3c2a6c', '#4a3074', '#5a3678', '#6a3e7a'];
    const bh = 236 / bands.length;
    bands.forEach((col, i) => { R(0, Math.floor(i * bh), 640, Math.ceil(bh) + 1, col); if (i > 0) HD.dith(0, Math.floor(i * bh) - 4, 640, 4, col, 0.5); });
    // 银河
    for (let i = 0; i < 1400; i++) {
      const k = rnd(i + 1000), x = k * 700 - 30, y = 200 - k * 190 + (rnd(i + 2000) - 0.5) * 60 * (1 - Math.abs(k - 0.5));
      const a = 1 - Math.abs(rnd(i + 2000) - 0.5) * 2;
      if (rnd(i + 3000) < a * 0.7) P(x, y, rnd(i + 4000) > 0.6 ? '#4a4290' : '#3a3478');
      if (rnd(i + 5000) < a * 0.15) P(x, y, '#c8c0f0');
    }
    // 远山 + 城市天际线
    for (let x = 0; x < 640; x++) { const h = 24 + Math.sin(x * 0.012) * 10 + Math.sin(x * 0.04) * 4; R(x, 200 - h, 1, h + 10, '#1e1846'); }
    for (let i = 0; i < 52; i++) {
      const x = i * 13 - 4, h = 18 + rnd(i + 30) * 50 + (i > 18 && i < 30 ? 26 : 0), w = 11;
      R(x, 214 - h, w, h, '#151236'); R(x, 214 - h, w, 1, '#2a2458');
      if (rnd(i + 50) > 0.7) { R(x + 5, 214 - h - 6, 1, 6, '#151236'); P(x + 5, 214 - h - 7, '#ff5a5a'); }
      for (let y = 214 - h + 4; y < 212; y += 4) for (let wx = x + 2; wx < x + w - 1; wx += 3) if (rnd(wx * 13 + y * 7) > 0.62) P(wx, y, rnd(wx + y * 3) > 0.25 ? '#ffd66b' : '#ffeaa8');
      R(x, 214 - h, w, 2, '#d8dff0');
    }
    // 河 + 黄色大桥
    R(0, 214, 640, 14, '#120f30');
    for (const [b0, b1] of [[20, 230], [360, 600]]) {
      R(b0, 208, b1 - b0, 3, '#c99a20'); R(b0, 207, b1 - b0, 1, '#f2c230');
      for (let i = 0; i <= b1 - b0; i += 2) { const y = 208 - Math.sin((i / (b1 - b0)) * Math.PI) * 28; R(b0 + i, y, 2, 1, '#f2c230'); if (i % 14 === 0) R(b0 + i, y, 1, 208 - y, '#a07a1a'); }
      R(b0 + 40, 196, 3, 18, '#c99a20'); R(b1 - 43, 196, 3, 18, '#c99a20');
    }
    // 雪地
    for (let x = 0; x < 640; x++) { const h = Math.sin(x * 0.02) * 4 + Math.sin(x * 0.07) * 2; R(x, 226 + h, 1, 360, '#8e97c8'); R(x, 226 + h, 1, 2, '#d8def6'); }
    HD.fadeV(0, 236, 640, 124, '#3a3e78', 0, 0.75);
    HD.dith(0, 236, 640, 10, '#aab2dc', 0.35);
    for (let i = 0; i < 90; i++) P(rnd(i + 600) * 640, 234 + rnd(i + 700) * 120, rnd(i + 800) > 0.5 ? '#e8eeff' : '#b8c2ec');
    // 风吹出来的雪纹
    for (let i = 0; i < 70; i++) { const x = rnd(i + 900) * 660 - 10, y = 246 + rnd(i + 950) * 110, w = 8 + rnd(i) * 22 * (0.6 + (y - 246) / 110); R(x, y, w, 1, '#a8b0dc'); R(x + 2, y + 1, w - 4, 1, '#7a84b8'); }
    // 雪堆：顶上亮、底下偏蓝
    for (const [dx, dy, dw] of [[30, 262, 70], [600, 258, 90], [150, 330, 120], [520, 340, 140]]) { ellipse(dx, dy + 3, dw / 2, 7, '#6a74a8'); ellipse(dx, dy, dw / 2 - 2, 7, '#c8d0f0'); ellipse(dx - dw * 0.12, dy - 2, dw * 0.3, 4, '#eef2ff'); }
    // 两串脚印：从画面两边走到桌子前
    for (let k = 0; k < 9; k++) { const x = 40 + k * 18, y = 300 - k * 4.4; R(x, y + (k % 2) * 3, 4, 2, '#7a84b8'); R(x + 1, y + (k % 2) * 3, 2, 1, '#5a64a0'); }
    for (let k = 0; k < 10; k++) { const x = 610 - k * 18, y = 306 - k * 4.8; R(x, y + (k % 2) * 3, 4, 2, '#7a84b8'); R(x + 1, y + (k % 2) * 3, 2, 1, '#5a64a0'); }
    // 雪人（围着红围巾）
    { const sx = 548, sy = 262; ellipse(sx, sy + 4, 16, 4, '#5a64a0'); circle(sx, sy - 6, 11, '#dfe6ff'); circle(sx - 3, sy - 9, 6, '#ffffff'); circle(sx, sy - 22, 8, '#e6ecff'); circle(sx - 2, sy - 24, 4, '#ffffff'); P(sx - 3, sy - 24, '#2b2238'); P(sx + 2, sy - 24, '#2b2238'); R(sx, sy - 22, 4, 1, '#f08a3a'); R(sx - 8, sy - 16, 16, 3, '#d9483b'); R(sx + 4, sy - 16, 3, 8, '#d9483b'); for (const k of [-1, 3]) P(sx, sy - 8 + k * 2, '#2b2238'); line(sx - 10, sy - 10, sx - 18, sy - 18, '#6a4a34'); line(sx + 10, sy - 10, sx + 17, sy - 17, '#6a4a34'); R(sx - 6, sy - 31, 12, 3, '#3a3a58'); R(sx - 4, sy - 37, 8, 6, '#3a3a58'); }
    // 路灯 + 盖着雪的长椅
    { const lx = 112; R(lx, 168, 3, 92, '#2a2a40'); R(lx - 7, 164, 17, 5, '#2a2a40'); R(lx - 5, 162, 13, 2, '#eef2ff'); R(lx - 4, 169, 11, 4, '#fff0c0'); R(lx - 3, 258, 9, 3, '#2a2a40'); }
    { const bx = 444; R(bx, 286, 52, 4, '#6a4a34'); R(bx, 284, 52, 2, '#eef2ff'); R(bx, 276, 52, 3, '#6a4a34'); R(bx, 274, 52, 2, '#eef2ff'); R(bx + 4, 290, 3, 10, '#3a2a28'); R(bx + 45, 290, 3, 10, '#3a2a28'); ellipse(bx + 26, 301, 30, 3, '#6a74a8'); }
    // 雪松
    for (const [tx, th] of [[26, 70], [58, 50], [600, 76], [570, 52], [628, 44]]) {
      for (let r = 0; r < th; r++) { const w = Math.round((r / th) * th * 0.32); R(tx - w, 236 - th + r, w * 2 + 1, 1, r % 9 < 2 ? '#e8eeff' : '#1a2a3a'); }
      R(tx - 2, 236, 4, 8, '#2a1e1a');
    }
    GFX.setCtx(real);
    return FX.bake(c, FX.BAKE.sky);
  }
  function drawSky(t) {
    if (!skyBg) skyBg = paintSky();
    GFX.ctx.drawImage(skyBg, 0, 0);
    STARS.forEach((s) => { const a = 0.45 + Math.sin(t * 2 + s.p) * 0.45; alpha(a, () => R(s.x, s.y, s.s, s.s, s.c)); if (s.s > 1 && a > 0.75) alpha(a * 0.5, () => { R(s.x - 2, s.y + 0.5, 6, 1, s.c); R(s.x + 0.5, s.y - 2, 1, 6, s.c); }); });
    // 月亮
    HD.glow(560, 54, 70, '#fff3c9', 0.2);
    circle(560, 54, 16, '#fff3c9'); circle(566, 48, 14, '#161642'); P(552, 50, '#fffbe8'); P(551, 58, '#f0e4b0');
    // 流星
    if (st.shoot) { const s = st.shoot, x = s.x + s.k * 120, y = s.y + s.k * 50; for (let i = 0; i < 18; i++) alpha((1 - i / 18) * (1 - s.k), () => R(x - i * 2.4, y - i, 2, 1, '#ffffff')); }
    // 河面倒影
    for (let i = 0; i < 40; i++) { const x = (rnd(i + 70) * 640 + Math.sin(t + i) * 2) | 0; alpha(0.4 + Math.sin(t * 3 + i) * 0.3, () => R(x, 216 + (i % 4) * 3, 4 + (i % 3) * 2, 1, i % 3 ? '#ffd66b' : '#f2c230')); }
    // 后景雪
    st.snow.forEach((f) => { if (!f.f) alpha(0.6, () => R(f.x, f.y, f.s, f.s, '#e8eeff')); });
    // 路灯的暖光 + 照在雪地上的一圈
    const ctx = GFX.ctx, op = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'lighter';
    HD.glow(116, 172, 34, '#ffd890', 0.35); FX.pool(ctx, 116, 262, 46, 8, '#ffcf80', 0.22);
    // 烟花把雪地和河面染上颜色
    st.flashes.forEach((f) => { FX.pool(ctx, f.x, 296, 150, 26, f.c, f.a * 0.18); FX.pool(ctx, f.x, 220, 90, 5, f.c, f.a * 0.3); });
    ctx.globalCompositeOperation = op;
    // 雪地上一闪一闪的反光
    for (let i = 0; i < 46; i++) { const x = rnd(i + 3000) * 640, y = 250 + rnd(i + 3100) * 108; const a = Math.sin(t * 2.5 + i * 1.9); if (a > 0.55) alpha((a - 0.55) * 2.2, () => { P(x, y, '#ffffff'); if (a > 0.85) { P(x - 1, y, '#dfe6ff'); P(x + 1, y, '#dfe6ff'); P(x, y - 1, '#dfe6ff'); } }); }
  }
  // 雪夜的近景：两侧压着雪的松枝
  function snowBranches(t) {
    const sw = Math.round(Math.sin(t * 0.8) * 1);
    for (const [bx, dir] of [[-6, 1], [646, -1]]) for (let k = 0; k < 4; k++) {
      const y = 300 + k * 16, len = 70 - k * 8;
      line(bx, y, bx + dir * len, y + Math.round(len * 0.18), '#3a2a28', 2);
      for (let i = 0; i < len; i += 5) { const x = bx + dir * i, yy = y + Math.round(i * 0.18) + (k % 2 ? sw : -sw), r = 7 - (i / len) * 4; ellipse(x, yy + 1, r + 1, r * 0.6 + 1, '#16302e'); ellipse(x, yy, r, r * 0.6, '#24443e'); ellipse(x - dir, yy - r * 0.5, r * 0.8, 1.5, '#eef2ff'); }
    }
  }

  function drawBlocks() {
    if (!st.blocks) return;
    const p = st.dissolve;
    for (const b of st.blocks) {
      const go = p - b.th;
      if (go > 0.35) continue;
      const lift = go > 0 ? go * go * 500 : 0, a = go > 0 ? Math.max(0, 1 - go / 0.35) : 1;
      alpha(a, () => GFX.ctx.drawImage(st.snap, b.x, b.y, 16, 16, b.x + (go > 0 ? Math.sin(b.th * 40) * go * 60 : 0), b.y - lift, 16, 16));
    }
  }

  // ---------- 蛋糕 ----------
  const DRIPS = Array.from({ length: 13 }, (_, i) => ({ x: -39 + i * 6.4 + rnd(i + 3) * 2.5, len: 4 + Math.round(rnd(i + 9) * rnd(i + 19) * 20), w: rnd(i + 29) > 0.5 ? 4 : 3 }));
  const PEARLS = (() => { const a = []; for (let i = 0; i < 46; i++) { const ang = rnd(i + 21) * 6.283, r = Math.sqrt(rnd(i + 33)); const x = Math.cos(ang) * r * 30, y = Math.sin(ang) * r * 5.5; a.push({ x, y: y - (1 - r) * 7, r: 2.6 + rnd(i + 44) * 0.8 }); } return a.sort((p, q) => p.y - q.y); })();
  function drawCake(t) {
    const x = CAKE_X, y = CAKE_Y;
    const top = y - 46, rx = 44, ry = 8;
    // 托盘
    ellipse(x, y + 1, 56, 7, '#a8822e'); ellipse(x, y, 56, 7, '#e0ae48'); ellipse(x, y - 1, 54, 6, '#f6d27a'); R(x - 40, y - 3, 10, 1, '#fff0b8');
    // 侧面（奶茶色，带黑糖虎纹）
    for (let i = -rx; i <= rx; i++) {
      const k = (i + rx) / (rx * 2);
      const ey = Math.sqrt(1 - (i / rx) ** 2) * ry;
      const col = k < 0.18 ? '#f2d6b0' : k < 0.6 ? '#e6c194' : k < 0.85 ? '#d4a878' : '#bf9060';
      R(x + i, top + ey, 1, (y - 4) - (top + ey) + Math.sqrt(1 - (i / rx) ** 2) * 4, col);
    }
    // 虎纹
    for (let s = 0; s < 9; s++) {
      const sx = -38 + s * 9.5;
      for (let yy = 0; yy < 30; yy++) { const xx = sx + Math.sin(yy * 0.28 + s) * 2.5 + yy * 0.12; if (Math.abs(xx) > rx - 2) continue; alpha(0.55, () => R(x + xx, top + 10 + yy, 2, 1, '#9a5a2a')); }
    }
    // 底部奶油珠边
    for (let i = -rx + 2; i <= rx - 2; i += 5) { const ey = Math.sqrt(1 - (i / rx) ** 2) * 4; circle(x + i, y - 5 + ey, 3, '#fffaf0'); P(x + i - 1, y - 6 + ey, '#ffffff'); P(x + i + 1, y - 3 + ey, '#e8d8c0'); }
    // 丝带 + 蝴蝶结
    for (let i = -rx; i <= rx; i++) { const ey = Math.sqrt(1 - (i / rx) ** 2) * 4; const k = (i + rx) / (rx * 2); R(x + i, y - 17 + ey, 1, 6, k < 0.2 ? '#ffc8da' : k > 0.8 ? '#d97a9a' : '#f7a8c4'); }
    for (let i = -rx; i <= rx; i += 3) { const ey = Math.sqrt(1 - (i / rx) ** 2) * 4; P(x + i, y - 15 + ey, '#ffe0ea'); }
    const bwx = x - 14, bwy = y - 12;
    ellipse(bwx - 6, bwy - 2, 6, 4, '#e88aaa'); ellipse(bwx - 6, bwy - 3, 5, 3, '#f7a8c4'); ellipse(bwx - 6, bwy - 2, 2, 1, '#c86a8a');
    ellipse(bwx + 6, bwy - 2, 6, 4, '#d97a9a'); ellipse(bwx + 6, bwy - 3, 5, 3, '#f0a0bc'); ellipse(bwx + 6, bwy - 2, 2, 1, '#b85a7a');
    R(bwx - 9, bwy - 5, 3, 1, '#ffe0ea');
    R(bwx - 3, bwy + 1, 3, 9, '#e88aaa'); R(bwx + 1, bwy + 1, 3, 8, '#d97a9a'); P(bwx - 3, bwy + 10, '#e88aaa');
    R(bwx - 2, bwy - 4, 5, 6, '#c86a8a'); R(bwx - 1, bwy - 3, 3, 4, '#f7a8c4'); P(bwx - 1, bwy - 3, '#ffe0ea');
    // 顶面
    ellipse(x, top, rx, ry, '#fff6ea'); ellipse(x - 2, top - 1, rx - 6, ry - 2, '#fffdf8');
    // 黑糖淋面 + 滴落
    ellipse(x, top + 0.5, rx - 6, ry - 2, '#8a4a20'); ellipse(x - 4, top - 1, rx - 16, ry - 4, '#a85a26');
    DRIPS.forEach((d, i) => {
      const ey = Math.sqrt(Math.max(0, 1 - ((d.x + 2) / rx) ** 2)) * ry;
      const yy = top + ey - 2;
      R(x + d.x, yy, d.w, d.len, '#7a3e1a'); circle(x + d.x + d.w / 2 - 0.5, yy + d.len, d.w / 2 + 0.6, '#7a3e1a');
      R(x + d.x + 1, yy + 1, 1, Math.max(1, d.len - 1), '#b8642a'); P(x + d.x + 1, yy + d.len, '#d8884a');
    });
    R(x - rx + 2, top + ry - 2, rx * 2 - 4, 1, '#8a4a20');
    // 珍珠堆
    PEARLS.forEach((p) => { circle(x + p.x, top - 3 + p.y, p.r, '#2a140c'); circle(x + p.x - 0.5, top - 3.5 + p.y, p.r - 1, '#4a2a1a'); P(x + p.x - 1, top - 4 + p.y, '#c8a090'); });
    PEARLS.forEach((p, i) => { if (i % 5 === 0) P(x + p.x - 1, top - 5 + p.y, '#ffffff'); });
    // 奶油花
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * 6.283 + 0.3, ex = Math.cos(a) * (rx - 4), ey = Math.sin(a) * (ry - 1);
      if (ey < -1) continue;
      const cx = x + ex, cy = top + ey - 1;
      circle(cx, cy, 4, '#f4e6d0'); circle(cx - 0.5, cy - 0.5, 3, '#fffaf0'); P(cx - 1, cy - 2, '#ffffff'); P(cx + 1, cy, '#e8d8c0'); P(cx, cy - 1, '#e8d8c0');
      circle(cx, cy - 4, 1.6, '#2a140c'); P(cx - 1, cy - 5, '#c8a090');
    }
    // 蜡烛
    const cols = STORY.reagents.map((r) => r.color);
    CANDLES.forEach((cx, i) => candle(x + cx, top - 2 - (i === 2 ? 2 : i % 2 ? 1 : 0), cols[i], st.flames[i], t, i));
    // 珍珠从前沿滚落几颗
    [[-20, 5], [-8, 7], [6, 6], [22, 5], [33, 3]].forEach(([dx, dy]) => { circle(x + dx, top + dy, 2.6, '#2a140c'); circle(x + dx - 0.5, top + dy - 0.5, 1.6, '#4a2a1a'); P(x + dx - 1, top + dy - 1, '#e8d0c0'); });
    // 巧克力牌
    const qx = x - 16, qy = top + 2;
    R(qx, qy - 11, 32, 12, '#3a1e12'); R(qx + 1, qy - 10, 30, 10, '#6a3a22'); R(qx + 1, qy - 10, 30, 1, '#9a5a34'); R(qx + 1, qy - 1, 30, 1, '#4a2616');
    text('GWEN', qx + 9, qy - 8, '#fff6ea'); P(qx + 3, qy - 8, '#f7a8c4'); P(qx + 28, qy - 8, '#f7a8c4');
  }
  function candle(cx, by, col, f, t, i) {
    const h = 20;
    R(cx - 2, by - h, 4, h, '#fffaf0');
    for (let k = 0; k < h; k += 4) R(cx - 2, by - h + k + ((k / 4) % 2 ? 0 : 0), 4, 2, col);
    R(cx - 2, by - h, 1, h, '#ffffff'); R(cx + 1, by - h, 1, h, '#00000022');
    R(cx, by - h - 3, 1, 3, '#3a2a2a');
    if (f > 0.02) {
      const fl = Math.sin(t * 13 + i * 1.7) * 0.6 + Math.sin(t * 7.3 + i) * 0.4;
      const fh = (9 + fl) * f, fx = cx + Math.round(fl * 0.6);
      const mg = st.magic ? (i % 2 ? ['#6fc8ff', '#d0f4ff', '#a8e4ff'] : ['#ff6fa8', '#ffd0f0', '#ffa8d0']) : ['#ff9a3a', '#ffd66b', '#ffcf7a'];   // 梦里的蜡烛是粉色和蓝色的魔法火苗
      HD.glow(fx, by - h - 6, 16 * f, mg[2], 0.35);
      ellipse(fx, by - h - 3 - fh / 2, Math.max(1, 2.6 * f), fh / 2 + 1, mg[0]);
      ellipse(fx, by - h - 2 - fh / 2.4, Math.max(1, 1.6 * f), fh / 2.6, mg[1]);
      R(fx, by - h - 3 - fh * 0.6, 1, Math.max(1, fh * 0.4), '#fffbe8');
    }
  }
  function drawCakeTable(t) {
    const x = CAKE_X;
    // 桌子：圆桌 + 蕾丝桌布
    const onSnow = st.mode === 'sky' || st.mode === 'dissolve';
    R(x - 6, 236, 12, 14, st.mode === 'dream' ? '#7a4a7a' : '#4a2e2a'); ellipse(x, 251, 26, 4, st.mode === 'dream' ? '#b07aa8' : onSnow ? '#4a4a80' : '#3a2420');
    ellipse(x, 216, 74, 8, '#e8e0f0');
    R(x - 74, 216, 148, 22, '#f4eef8');
    for (let i = -74; i < 74; i += 2) { const k = (i + 74) / 148; R(x + i, 216, 2, 22, k < 0.2 ? '#fffcff' : k > 0.78 ? '#d8cee6' : '#f4eef8'); }
    for (let i = -72; i < 74; i += 8) { circle(x + i + 3, 238, 4, '#f4eef8'); circle(x + i + 3, 239, 2, '#d8cee6'); }
    for (let i = -70; i < 72; i += 8) P(x + i + 3, 232, '#d8cee6');
    ellipse(x, 214, 74, 8, '#ffffff'); ellipse(x, 214, 70, 6, '#f8f2fc');
    // 彩纸屑
    for (let i = 0; i < 26; i++) { const a = rnd(i + 70) * 6.283, r = 56 + rnd(i + 90) * 12; R(x + Math.cos(a) * r, 214 + Math.sin(a) * 5, 2, 1, BUNT_C[i % 6]); }
    // 右边的空盘子，左边是「平时那一小块」
    ellipse(x + 62, 214, 8, 2, '#d8cee6'); ellipse(x + 62, 213, 7, 2, '#ffffff');
    plushBouquet(x - 70, 214);
    if ((st.lamp ?? 0) > 0.5 && (st.cover ?? 1) < 0.1) { const tw = Math.sin(t * 3) * 0.5 + 0.5; alpha(tw, () => { R(x - 56, 168, 1, 5, '#fff6d0'); R(x - 58, 170, 5, 1, '#fff6d0'); }); HD.glow(x - 70, 192, 26, '#ffe0a0', 0.25); }
    drawCake(t);
    // MangoMango 的盒子：先罩着蛋糕，掀开后放到地上
    if (st.mode === 'lounge' || st.mode === 'dissolve') {
      const k = st.cover ?? 1;
      let cx, bot;
      if (k < 0.45) { cx = x; bot = 214 - (k / 0.45) * 64; }
      else { const m = IO((k - 0.45) / 0.55); cx = x + (492 - x) * m; bot = 150 + (256 - 150) * m - Math.sin(m * Math.PI) * 30; }
      coverBox(cx, bot, k >= 1);
    }
    if (st.flames.some((f) => f > 0)) HD.glow(x, 150, 70, '#ffcf7a', 0.12 + Math.sin(t * 9) * 0.01);
  }
  // 毛绒花束（软乎乎的玩偶花，牛皮纸包着）
  function plushBouquet(px, py) {
    alpha(0.25, () => ellipse(px, py + 1, 12, 2, '#3a2a4a'));
    // 叶子
    ellipse(px - 9, py - 26, 5, 3, '#5c9e6c'); ellipse(px + 10, py - 27, 5, 3, '#4f8a60'); ellipse(px - 3, py - 40, 4, 3, '#6aac7a');
    // 花：郁金香、向日葵（带笑脸）、小紫花
    ellipse(px - 6, py - 33, 6, 7, '#f7a8c4'); ellipse(px - 7, py - 35, 4, 5, '#ffc8da'); R(px - 7, py - 40, 2, 3, '#e88aaa'); R(px - 3, py - 39, 2, 2, '#e88aaa');
    circle(px + 1, py - 43, 5, '#b9a3d6'); circle(px, py - 44, 3, '#d4c4ec'); P(px + 1, py - 43, '#fff6d0');
    for (let k = 0; k < 8; k++) { const an = k * 0.785; ellipse(px + 7 + Math.cos(an) * 6, py - 33 + Math.sin(an) * 6, 3, 3, '#ffd66b'); }
    circle(px + 7, py - 33, 4, '#a8703e'); circle(px + 6, py - 34, 3, '#c08a4e');
    P(px + 5, py - 34, '#2b2238'); P(px + 8, py - 34, '#2b2238'); R(px + 5, py - 32, 4, 1, '#2b2238'); P(px + 4, py - 33, '#f49a8a'); P(px + 9, py - 33, '#f49a8a');
    // 牛皮纸
    GFX.ctx.fillStyle = '#d8b48a';
    for (let r = 0; r < 24; r++) { const w = Math.round(13 - r * 0.42); R(px - w, py - 26 + r, w * 2 + 1, 1, r % 6 < 1 ? '#c8a47a' : '#d8b48a'); }
    line(px - 4, py - 25, px - 1, py - 3, '#b8946a'); line(px + 6, py - 25, px + 2, py - 4, '#b8946a');
    R(px - 12, py - 26, 25, 2, '#e8c8a0');
    // 蝴蝶结
    ellipse(px - 4, py - 15, 4, 2, '#f7a8c4'); ellipse(px + 4, py - 15, 4, 2, '#f7a8c4'); R(px - 1, py - 17, 3, 4, '#d97a9a'); R(px - 3, py - 13, 2, 5, '#e88aaa'); R(px + 2, py - 13, 2, 4, '#e88aaa');
  }
  function coverBox(cx, bot, landed) {
    const w = 118, h = 80, bx = Math.round(cx - w / 2), by = Math.round(bot - h);
    if (landed) alpha(0.3, () => ellipse(cx, bot + 1, 62, 4, '#120a18'));
    HD.box(bx, by, w, h, ['#a8701e', '#c08a2a', '#e0a83a', '#f6c94c', '#ffe08a']);
    R(bx, by, w, 8, '#e0a83a'); R(bx, by, w, 2, '#ffe08a'); R(bx, by + 8, w, 1, '#a8701e');
    R(bx + 2, by + 9, 3, h - 10, '#ffe08a');
    // 芒果 logo + 字
    const lx = bx + 26, ly = by + 42;
    ellipse(lx, ly, 13, 15, '#ff9a3a'); ellipse(lx - 4, ly - 4, 7, 9, '#ffc06a'); P(lx - 6, ly - 8, '#fff0d0');
    line(lx + 2, ly - 15, lx + 9, ly - 22, '#3f7a58', 2); ellipse(lx + 9, ly - 20, 5, 2, '#5c9e6c');
    text('MANGO', bx + 46, by + 30, '#6a3a10', 2); text('MANGO', bx + 46, by + 46, '#6a3a10', 2);
    R(bx + 46, by + 62, 62, 1, '#c08a2a');
  }
  const IO = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
  // ---------- 走廊过场 ----------
  const DOOR = { x: 468, y: 138, w: 64, h: 106 };
  let hallBg = null, hc = null;
  function paintHall() {
    const c = document.createElement('canvas'); c.width = 640; c.height = 360;
    const real = GFX.ctx; GFX.setCtx(c.getContext('2d'));
    R(0, 0, 640, 244, '#23264a'); for (let x = 0; x < 640; x += 40) R(x, 20, 1, 176, '#272a50');
    R(0, 196, 640, 40, '#1d2040'); R(0, 196, 640, 2, '#2e3260'); R(0, 236, 640, 8, '#15172e');
    R(0, 0, 640, 20, '#15172e'); for (let x = 70; x < 640; x += 200) { R(x, 18, 70, 3, '#3a3e62'); }
    for (let y = 244, r = 0; y < 360; y += 16, r++) for (let x = (r % 2) * -16; x < 640; x += 32) R(x, y, 32, 16, (x / 32 + r) % 2 ? '#1a1c36' : '#1d1f3a');
    for (let y = 244; y < 360; y += 16) R(0, y, 640, 1, '#141630');
    // 尽头的窗户（月光）
    R(584, 56, 46, 110, '#3a3e62'); R(588, 60, 38, 102, '#2a3468'); HD.dgradV(588, 60, 38, 102, '#4a5a9a', 0, 0.8);
    circle(612, 80, 5, '#e8e4c8'); circle(614, 78, 4, '#2a3468'); R(606, 60, 2, 102, '#3a3e62');
    alpha(0.12, () => { for (let i = 0; i < 90; i++) R(560 - i * 1.2, 250 + i, 60, 1, '#9aa8e0'); });
    // 两扇关着的门
    for (const [dx, n] of [[96, 'B103'], [280, 'B105']]) {
      R(dx - 4, 136, 68, 108, '#2a2c4c'); R(dx, 140, 60, 104, '#30335a'); R(dx, 140, 60, 2, '#3e4270'); R(dx + 50, 192, 6, 3, '#6a6e90');
      R(dx + 10, 150, 18, 30, '#20223e'); R(dx + 18, 122, 24, 10, '#3a3e62'); text(n, dx + 21, 124, '#9aa0c8');
    }
    // 公告板
    R(186, 92, 70, 50, '#4a3a3a'); R(188, 94, 66, 46, '#6a5040');
    R(192, 98, 18, 22, '#c8c8d8'); R(214, 96, 20, 16, '#c8b070'); R(236, 100, 14, 20, '#a8b8c8'); R(212, 116, 22, 18, '#c89aa8');
    // EXIT
    R(18, 120, 40, 12, '#1f5a3a'); text('EXIT', 23, 122, '#7cf0a0', 2); HD.glow(38, 126, 30, '#4fe08a', 0.18);
    // 目标门：门框 + 牌子
    R(DOOR.x - 6, DOOR.y - 6, DOOR.w + 12, DOOR.h + 6, '#2a2c4c'); R(DOOR.x - 4, DOOR.y - 4, DOOR.w + 8, DOOR.h + 4, '#3a3d66');
    R(DOOR.x + 12, DOOR.y - 22, 40, 12, '#3a3e62'); text('LOUNGE', DOOR.x + 14, DOOR.y - 20, '#c8c0e8');
    HD.fadeH(0, 20, 40, 224, '#05040d', 0.5, 0);
    GFX.setCtx(real);
    return FX.bake(c, FX.BAKE.night);
  }
  function drawHall(ctx, t) {
    const H = st.hall;
    if (!hallBg) hallBg = paintHall();
    if (!hc) { hc = document.createElement('canvas'); hc.width = 640; hc.height = 360; }
    const g = hc.getContext('2d'), real = GFX.ctx; GFX.setCtx(g);
    g.drawImage(hallBg, 0, 0);
    const { x, y, w, h } = DOOR, fl = 0.8 + Math.sin(t * 7) * 0.12 + Math.sin(t * 13) * 0.06;
    // 门后：黑着灯，只有一点点说不清的微光
    const o = H.door;
    R(x, y, w, h, '#16142c'); HD.dgradV(x, y, w, h, '#2a2650', 0, 0.8);
    for (let i = 0; i < 9; i++) alpha(0.35 + Math.sin(t * 2 + i * 1.7) * 0.3, () => R(x + 4 + i * 7, y + 10 + Math.sin(i) * 3, 2, 2, ['#8a7a5a', '#8a6a7a', '#6a8a8a'][i % 3]));
    for (let i = 0; i < 4; i++) { const px = x + 10 + i * 14; for (let r = 0; r < 10; r++) R(px - 5 + r * 0.5, y + 27 + r, 11 - r, 1, '#2e2a50'); }
    HD.glow(x + 46, y + 60, 26, '#4a5a9a', 0.25);
    // 门板：以左侧为轴往里开
    const pw = Math.round(w * (1 - 0.84 * o));
    R(x, y, pw, h, o > 0 ? '#2e3054' : '#3a3c66'); R(x, y, pw, 2, '#4a4e7a');
    if (o < 0.3) {
      R(x + 18, y + 12, 28, 34, '#2a2a4a'); alpha(fl * 0.6, () => R(x + 19, y + 13, 26, 32, '#4a5088')); R(x + 31, y + 12, 2, 34, '#3a3c66');
      R(x + w - 12, y + 56, 6, 3, '#9a9ec0');
      alpha(fl * 0.7, () => { R(x + 2, y + h - 2, w - 4, 2, '#7a80c0'); });
      HD.glow(x + w / 2, y + h, 40, '#6a70b0', 0.16 * fl);
    }
    // 地上的光
    if (o > 0) {
      alpha(0.14 * o, () => { for (let i = 0; i < 116; i++) R(x + pw - i * 0.9, y + h + i, w - pw + i * 2.2, 1, '#6a70b0'); });
    }
    H.b.anim = t + 0.7; H.g.anim = t;
    CHR.drawActor(H.b, t); CHR.drawActor(H.g, t);
    if (H.light > 0) alpha(H.light, () => R(0, 0, 640, 360, '#05040d'));
    // 暗角
    HD.fadeV(0, 300, 640, 60, '#05040d', 0, 0.6); HD.fadeV(0, 0, 640, 40, '#05040d', 0.5, 0);
    GFX.setCtx(real);
    const z = H.z, sw = 640 / z, sh = 360 / z;
    const sx = G.clamp(x + w / 2 - 40 - sw / 2, 0, 640 - sw), sy = G.clamp(y + h / 2 - sh / 2, 0, 360 - sh);
    ctx.drawImage(hc, sx, sy, sw, sh, 0, 0, 640, 360);
  }
  async function hallway() {
    const H = st.hall = { z: 1, door: 0, light: 0,
      g: { sprite: 'gwen', x: 90, y: 262, dir: 1, walking: true, anim: 0, speed: 84, bag: true, seed: 0.3 },
      b: { sprite: 'me', x: 30, y: 262, dir: 1, walking: true, anim: 0, speed: 84, seed: 0.7 } };
    G.vignette = drawHall;
    if (G.devJump) { window.__hall = H; window.__fin = st; }
    G.showRack(false);
    AU.bgm(null);
    await G.fadeIn(900);
    const lin = (k) => k, io = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
    let walking = true;
    (async () => { while (walking) { AU.sfx('step'); await G.wait(320); } })();
    G.tween(H, { z: 1.12 }, 4200, lin);
    G.tween(H.b, { x: 372 }, 4200, lin);
    await G.tween(H.g, { x: 440 }, 4200, lin);
    walking = false; H.g.walking = false; H.b.walking = false;
    await G.wait(800);
    H.g.face = 'surprised';
    await G.wait(500);
    await G.tween(H, { z: 1.7 }, 1600, io);
    H.g.face = null;
    await G.wait(500);
    AU.sfx('door');
    await G.tween(H, { door: 1 }, 1100, io);
    await G.wait(600);
    await G.tween(H, { light: 1, z: 2.2 }, 1100, (k) => k * k);
    await G.fadeOut(200);
  }

  // ---------- 流程 ----------
  async function talk() {
    G.setGoal(null);
    await G.talk(S.talk);
    await G.gainReagent(4);
    st.phase = 'load';
    G.setGoal('flex');
    G.toast(S.loadTip, 3000);
  }

  async function load() {
    st.phase = 'run';
    G.setGoal(null);
    G.scene.fixedCam = true;
    G.tween(G, { camX: CAM }, 800);
    STORY.reagents.forEach((r, i) => st.orbs.push({ x0: G.gwen.x, y0: 210, x1: LAB.FLEX_X + 52, y1: LAB.FLEX_Y + 40, c: r.color, k: -i * 0.25, dur: 1 }));
    AU.sfx('whoosh');
    await G.wait(2200);
    st.orbs = [];
    st.flex.mood = 'run';
    AU.sfx('beep');
    const panel = G.el(`<div class="terminal" style="left:50%;top:10%;transform:translateX(-50%);min-height:0"><div class="cmd">$ flex run protocol_1126.py</div><div class="p">${S.running} ... 0%</div><div class="dim bar"></div></div>`);
    for (let i = 0; i <= 20; i++) {
      panel.querySelector('.p').textContent = `${S.running} ... ${i * 5}%`;
      panel.querySelector('.bar').textContent = '█'.repeat(i) + '░'.repeat(20 - i);
      if (i % 4 === 0) AU.sfx('pipette');
      await G.wait(190);
    }
    const ok = document.createElement('div'); ok.className = 'cmd'; ok.textContent = '✓ Run completed successfully'; panel.appendChild(ok);
    const outp = document.createElement('div'); outp.textContent = S.output; panel.appendChild(outp);
    st.flex.mood = 'ok'; st.flex.dip = 0; st.flex.gx = 0.5;
    AU.sfx('success');
    G.burst(LAB.FLEX_X + 52, LAB.FLEX_Y + 60, 40, ['#4fe08a', '#ffd66b', '#ffffff'], { speed: 100, life: 1.1, g: 60, size: 2 });
    await G.wait(1200);
    panel.remove();
    await G.talk(S.success);
    await G.talk(S.goLounge);
    await G.fadeOut(700);
    // —— 走廊：走到门前，镜头推近，推门 ——
    await hallway();
    // —— 休息室 ——
    G.vignette = null;
    st.mode = 'lounge'; G.camX = 0;
    G.gwen.x = CAKE_X - 100; G.gwen.dir = 1; st.me.x = CAKE_X + 96; st.me.dir = -1;
    st.cake = true; st.lt = 0; st.lamp = 0; st.cover = 0; st.flames = [0, 0, 0, 0, 0];
    G.showRack(false);
    await G.fadeIn(1400);
    await G.wait(700);
    await G.talk(S.cakeDark);
    // Baiding 去开落地灯
    st.me.speed = 100;
    await G.walk(st.me, 596); st.me.dir = 1; await G.wait(300);
    AU.sfx('click'); await G.tween(st, { lamp: 1 }, 500);
    AU.bgm('reveal');
    await G.wait(500);
    await G.walk(st.me, CAKE_X + 96); st.me.dir = -1;
    await G.talk(S.cakeIntro);
    G.gwen.face = 'happy';
    await G.talk(S.cakeSmall);
    G.gwen.face = null; st.me.face = 'happy';
    await G.talk(S.cakeBig);
    st.me.face = null;
    // 掀开盒子
    AU.sfx('whoosh');
    await G.tween(st, { cover: 1 }, 1500, IO);
    G.burst(486, 254, 14, ['#c8b8c8', '#e8d8e0'], { speed: 30, life: 0.6, g: 20, size: 2 });
    await G.wait(500);
    // 蜡烛一根根亮起来
    const notes = ['blip', 'blip', 'blip', 'blip', 'ding'];
    for (let i = 0; i < 5; i++) { AU.sfx(notes[i]); G.tween(st.flames, { [i]: 1 }, 260); G.burst(CAKE_X + CANDLES[i], 140, 6, ['#ffd66b', '#ffffff'], { speed: 24, life: 0.5, g: 0, size: 1 }); await G.wait(420); }
    await G.wait(400);
    // 灯全亮
    AU.sfx('success');
    G.tween(st, { lt: 1 }, 1300);
    G.gwen.face = 'surprised';
    G.burst(CAKE_X, 150, 60, ['#f7a8c4', '#ffd66b', '#81d8d0', '#b9a3d6', '#ffffff'], { speed: 120, life: 1.6, g: 70, size: 2, drag: 0.97 });
    await G.tween(G.gwen, { hop: 10 }, 140); await G.tween(G.gwen, { hop: 0 }, 180);
    await G.wait(900);
    G.gwen.face = 'happy'; st.me.face = 'happy';
    await G.talk(S.cakeWish);
    G.gwen.face = null; st.me.face = null;
    // 墙壁散开 → 星空
    st.snap = document.createElement('canvas'); st.snap.width = 640; st.snap.height = 360;
    const sg = st.snap.getContext('2d');
    const realCtx = G.ctx;
    GFX.setCtx(sg); drawLounge(G.t); GFX.setCtx(realCtx);
    st.blocks = [];
    for (let y = 0; y < 360; y += 16) for (let x = 0; x < 640; x += 16) {
      const dc = Math.hypot(x - 320, y - 180) / 366;
      st.blocks.push({ x, y, th: dc * 0.7 + Math.random() * 0.3 });
    }
    st.mode = 'dissolve'; st.dissolve = 0;
    AU.sfx('whoosh');
    await G.wait(800); AU.sfx('whoosh');
    await G.wait(3200);
    st.mode = 'sky';
    G.gwen.face = 'happy';
    await G.wait(900);
    G.gwen.face = null;
    startBlow();
  }

  function startBlow() {
    st.phase = 'blow';
    G.lock();
    const ui = G.el(`<div class="blow-ui"><div class="title">${S.blowTitle}</div><div>${S.blowHint}</div>
      <div class="meter"><div class="fill"></div></div>
      <div class="row"><button class="btn small mic"><i class="ico ico-mic"></i>${S.micBtn}</button></div></div>`);
    st.ui = ui;
    const mic = ui.querySelector('.mic');
    mic.addEventListener('pointerdown', (e) => e.stopPropagation());
    mic.addEventListener('click', async (e) => {
      e.stopPropagation();
      try { await AU.startMic(); mic.innerHTML = '<i class="ico ico-mic"></i>麦克风已开启，对着它吹气吧'; mic.disabled = true; }
      catch (err) { mic.textContent = '没有麦克风权限，长按屏幕也可以'; mic.disabled = true; }
    });
    G.onPointer = (e) => { if (e.target.closest('button')) return true; st.holding = true; return true; };
    G.onPointerUp = () => (st.holding = false);
    G.onKey = () => { st.holding = true; return true; };
    G.onKeyHold = () => (st.holding = true);
    G.onKeyUp = () => (st.holding = false);
  }

  async function blownOut() {
    if (st.phase !== 'blow') return;
    st.phase = 'out'; st.holding = false;
    G.onPointer = null; G.onPointerUp = null; G.onKey = null; G.onKeyUp = null; G.onKeyHold = null;
    if (AU.mic) AU.mic.stop();
    st.ui && st.ui.remove();
    G.showRack(false);
    AU.sfx('blowout'); AU.bgm(null);
    for (let i = 0; i < 5; i++) smoke(i);
    await G.wait(900);
    await G.tween(st, { dark: 1 }, 700);
    G.achieve('wish');
    await G.wait(900);
    st.stars = starTargets();
    st.phase = 'party'; st.fwT = 0.2; st.starT = 0;
    G.gwen.face = 'happy'; st.me.face = 'happy';
    AU.bgm('birthday');
    G.flags.f_blown = true; G.persist();
    await G.wait(12500);
    openBtn();
  }

  // ---------- 信（正面 / 背面） ----------
  const allAch = () => G.testAllAch || Object.keys(STORY.achievements).every((k) => G.save.ach[k]);
  // 背面多一些装饰：两条和纸胶带、标题两侧的爱心、末尾的像素爱心
  const face = (L, cls) => { const back = cls.startsWith('back'); return `<div class="letter ${cls}">${back ? '<i class="tape t1"></i><i class="tape t2"></i>' : ''}<div class="head">${back ? `<span class="hh"></span>${L.head}<span class="hh"></span>` : L.head}</div><p>${L.to}</p>${L.paras.map(() => '<p></p>').join('')}<p class="sign"></p>${back ? '<div class="back-heart"></div>' : ''}<div class="btns hidden"><button class="btn primary"></button></div><div class="scroll-hint off"><span>▼ 向下滑动继续阅读</span></div></div>`; };

  function openBtn() {
    const b = G.el(`<div class="final-btns"><button class="btn primary"><i class="ico ico-mail"></i>${S.afterBlow}</button></div>`);
    b.querySelector('button').addEventListener('pointerdown', (e) => e.stopPropagation());
    b.querySelector('button').addEventListener('click', (e) => { e.stopPropagation(); AU.sfx('select'); b.remove(); letter(); });
  }

  // ---------- 信封：放下 → 火漆印弹开 → 封口翻开 → 信纸抽出来 ----------
  async function envelope() {
    const E = STORY.letter;
    const box = (vb, body) => `<svg viewBox="${vb}" preserveAspectRatio="none" shape-rendering="crispEdges">${body}</svg>`;
    const w = G.el(`<div class="env-wrap"><div class="env">
      <div class="env-back">${box('0 0 150 96', '<rect x="0.5" y="0.5" width="149" height="95" fill="#d8bd92" stroke="#2b2238"/><rect x="3" y="3" width="144" height="4" fill="#ccae80"/>')}</div>
      <div class="env-paper"><div class="ln"></div></div>
      <div class="env-front">${box('0 0 150 96', '<path d="M0.5 0.5 L75 62 L149.5 0.5 V95.5 H0.5 Z" fill="#f3e2c6" stroke="#2b2238"/><path d="M1.5 94.5 L62 56 M148.5 94.5 L88 56" stroke="#e0c69e" fill="none"/>')}<span class="to">${E.envTo}</span><span class="stamp">1126</span></div>
      <div class="env-flap">${box('0 0 150 62', '<path d="M0.5 0.5 H149.5 L75 61.5 Z" fill="#efdcbc" stroke="#2b2238"/>')}</div>
      <div class="env-seal">★</div></div></div>`);
    const ctl = { skip: false };
    w.addEventListener('pointerdown', (e) => { e.stopPropagation(); ctl.skip = true; });
    const wait = async (ms) => { const end = performance.now() + ms; while (!ctl.skip && performance.now() < end) await G.wait(30); };
    const step = (c, snd) => { w.classList.add(c); if (snd && !ctl.skip) AU.sfx(snd); };
    await wait(900);
    step('s1', 'click');          // 火漆印弹开
    await wait(450);
    step('s2', 'whoosh');         // 封口翻开
    await wait(320);
    step('s2b');                  // 翻过一半：露出封口内侧，退到信纸后面
    await wait(450);
    step('s3', 'pipette');        // 信纸抽出来
    await wait(1000);
    step('s4', 'ding');           // 信封落下，信纸展开
    await G.wait(ctl.skip ? 120 : 380);
    return w;
  }

  // 逐字打出一面信；点一下屏幕直接显示全文
  async function typeFace(box, L, ctl) {
    const hint = box.querySelector('.scroll-hint'), ps = box.querySelectorAll('p');
    let typing = true;
    const sync = () => hint.classList.toggle('off', typing || box.scrollHeight - box.scrollTop - box.clientHeight < 6);
    box.addEventListener('scroll', sync);
    const all = L.paras.concat([L.sign]);
    for (let k = 0; k < all.length; k++) {
      const el = ps[k + 1], s = [...all[k]];
      for (let i = 1; i <= s.length; i++) {
        if (ctl.skip) { el.textContent = all[k]; break; }
        el.textContent = s.slice(0, i).join('');
        if (i % 3 === 0) AU.sfx('blip');
        await G.wait(45);
        if (ctl.skip) { el.textContent = all[k]; break; }
      }
      if (!ctl.skip) { await G.wait(350); el.scrollIntoView({ block: 'nearest' }); }
    }
    typing = false;
    const btns = box.querySelector('.btns'); btns.classList.remove('hidden');
    // 一口气显示全文时回到开头，用提示引导往下读；逐字打完时停在末尾
    if (ctl.skip) box.scrollTop = 0; else btns.scrollIntoView({ block: 'nearest' });
    sync();
    return btns.querySelector('button');
  }

  // mode：undefined 第一次读 / 'again' 重读 / 'reveal' 隐藏结局里翻到背面
  async function letter(mode) {
    const L = STORY.letter, Hd = STORY.hidden;
    const open = allAch();
    // 第一次打开：先拆信封
    const env = mode ? null : await envelope();
    const wrap = G.el(`<div class="letter-wrap"><div class="letter-card">${face(L, 'front')}${face(Hd.back, 'back gone')}<button class="dogear" aria-label=""><svg viewBox="0 0 12 12" shape-rendering="crispEdges"><path d="M0.5 0.5H11.2L0.5 11.2Z" fill="#f1dcc6" stroke="#2b2238" stroke-width="1"/><path d="M1.5 9.4L9.4 1.5" stroke="#d9bfa5" stroke-width="1"/></svg></button></div></div>`);
    const card = wrap.querySelector('.letter-card'), front = wrap.querySelector('.front'), back = wrap.querySelector('.back'), ear = wrap.querySelector('.dogear');
    if (env) { wrap.classList.add('from-env'); card.classList.add('grow'); env.remove(); }
    const ctl = { skip: !!mode };
    wrap.addEventListener('pointerdown', (e) => { e.stopPropagation(); ctl.skip = true; });
    let side = 'front', flipping = false, backTyped = null;
    const close = () => { wrap.remove(); afterLetter(); };
    async function flip() {
      if (flipping) return; flipping = true;
      ear.classList.remove('glow');
      AU.sfx('whoosh');
      card.classList.add('turn');
      await G.wait(260);
      const toBack = side === 'front';
      front.classList.toggle('gone', toBack); back.classList.toggle('gone', !toBack);
      card.classList.toggle('on-back', toBack);
      side = toBack ? 'back' : 'front';
      card.classList.remove('turn');
      await G.wait(280);
      flipping = false;
      if (toBack && !backTyped) {
        const bctl = { skip: mode === 'again' };
        const bw = (e) => { if (!e.target.closest('.dogear')) bctl.skip = true; };
        back.addEventListener('pointerdown', bw);
        backTyped = typeFace(back, Hd.back, bctl);
        const b = await backTyped; b.textContent = Hd.back.btn;
        b.addEventListener('click', (e) => { e.stopPropagation(); AU.sfx('select'); close(); });
      }
    }
    ear.addEventListener('pointerdown', (e) => e.stopPropagation());
    ear.addEventListener('click', (e) => {
      e.stopPropagation();
      // 没集齐成就：小角只会轻轻翘一下，翻不过去
      if (!allAch() || (!st.hiddenDone && mode !== 'reveal')) { AU.sfx('click'); ear.classList.remove('peek'); void ear.offsetWidth; ear.classList.add('peek'); return; }
      flip();
    });
    const fb = await typeFace(front, L, ctl);
    if (mode === 'reveal') {
      // 这次不自动翻：折角一闪一闪，下面提示去点它
      fb.closest('.btns').classList.add('hidden');
      ear.classList.add('glow');
      const hint = document.createElement('div'); hint.className = 'flip-hint'; hint.textContent = Hd.flipHint; wrap.appendChild(hint);
      ear.addEventListener('click', () => hint.remove(), { once: true });
      return;
    }
    const hiddenNext = open && !st.hiddenDone;
    fb.textContent = st.hiddenDone || hiddenNext ? Hd.closeBtn : L.btn;
    fb.addEventListener('click', (e) => {
      e.stopPropagation(); AU.sfx('select'); wrap.remove();
      if (hiddenNext) hiddenEnding(); else afterLetter();
    });
  }
  G.showLetter = letter;
  function afterLetter() { if (st.hiddenDone && st.creditsDone) endScreen(); else credits(); }

  // 测试入口（?dev 标题页的「隐藏结局」按钮）：摆好吹完蜡烛后的雪夜，然后打开信
  async function testHidden() {
    G.setGoal(null); G.showRack(false); G.lock();
    G.scene.fixedCam = true; G.camX = 0;
    Object.assign(st, { mode: 'sky', cake: true, flames: [0, 0, 0, 0, 0], out: [true, true, true, true, true], phase: 'party', dark: 1, fwT: 0.3, starT: 0 });
    st.stars = starTargets();
    G.gwen.x = CAKE_X - 100; G.gwen.dir = 1; G.gwen.face = 'happy';
    st.me.x = CAKE_X + 96; st.me.dir = -1; st.me.face = 'happy';
    AU.bgm('birthday');
    await G.wait(6000);
    openBtn();
  }

  // ---------- 隐藏结局 ----------
  async function hiddenEnding() {
    st.hiddenDone = true; st.calm = true;
    // 合上信的一刻：弹出隐藏成就、换音乐、雪夜一块块散开变成「梦的世界」
    DREAM.prepare();
    G.achieveSecret();
    AU.fadeTo('yume', 2.2, 3.5, 1.4);
    await toDream();
    // 让她自己逛一会儿：可以点空中的小东西，走到 Baiding 身边点他，才开始对话
    G.gwen.face = 'happy'; st.me.face = 'happy';
    G.gwen.dir = 1; st.me.dir = -1;
    await freeRoam();
    st.me.face = null; G.gwen.dir = 1; st.me.dir = -1;
    await G.talk(STORY.hidden.talk);
    await G.wait(700);
    letter('reveal');
  }
  async function freeRoam() {
    const sc = G.scene; sc.minX = 40; sc.maxX = 600;
    while (G.locked) G.unlock();
    const hint = G.el(`<div class="flip-hint dream-hint">${STORY.hidden.dreamHint}</div>`);
    await new Promise((res) => {
      const o = G.obj({ id: 'meDream', label: 'Baiding', x: st.me.x - 16, y: 176, w: 32, h: 82, stand: st.me.x - 34, goal: true, onTap: async () => { o.hidden = true; res(); } });
      G.setGoal('meDream');
    });
    hint.remove();
    G.setGoal(null);
    G.lock();
  }
  // 进入梦境：雪夜像水面一样荡漾、慢慢变粉变透明，中间亮起柔光，星光和小爱心绕着画面旋转
  async function toDream() {
    st.starA = 1; G.tween(st, { starA: 0 }, 1400);
    st.snap = document.createElement('canvas'); st.snap.width = 640; st.snap.height = 360;
    const real = G.ctx; GFX.setCtx(st.snap.getContext('2d')); drawSky(G.t); GFX.setCtx(real);
    Object.assign(st, { mode: 'toDream', tw: 0, darkTo: 0, hearts: true, fwT: 2.5, magic: true });
    st.flames = [0, 0, 0, 0, 0]; st.out = [false, false, false, false, false];
    setTimeout(() => CANDLES.forEach((_, i) => setTimeout(() => { AU.sfx('blip'); G.tween(st.flames, { [i]: 1 }, 300); }, i * 260)), 2600);
    AU.sfx('whoosh');
    await G.tween(st, { tw: 1 }, 4200, (k) => k);
    Object.assign(st, { mode: 'dream', stars: null, snap: null });
    // 点一下漂在空中的回忆小物件，会冒出一句话
    G.onPointer = (e, p) => st.mode === 'dream' && !G.dialogOpen() && DREAM.tap(p);
    G.onHover = (p) => st.mode === 'dream' && DREAM.hoverAt(p);
  }
  const sstep = (a, b, x) => { const k = G.clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
  function drawToDream(t) {
    const k = st.tw, ctx = GFX.ctx;
    DREAM.draw(t);
    const a = 1 - sstep(0.3, 0.85, k), amp = 3 + sstep(0, 0.6, k) * 26;
    if (a > 0) alpha(a, () => {
      for (let y = 0; y < 360; y += 2) {
        const off = Math.sin(y * 0.045 + t * 5) * amp * (0.6 + 0.4 * Math.sin(y * 0.011 + t * 1.7));
        ctx.drawImage(st.snap, 0, y, 640, 2, Math.round(off), y, 640, 2);
      }
      alpha(sstep(0, 0.5, k) * 0.45, () => R(0, 0, 640, 360, '#f6b8d8'));
    });
  }
  function dreamSwirl(ctx, t) {
    const k = st.tw, glow = Math.sin(k * Math.PI);
    const op = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'lighter';
    HD.glow(320, 170, 380, '#ffc6e4', glow * 0.55);
    ctx.globalCompositeOperation = op;
    for (let i = 0; i < 70; i++) {
      const ang = rnd(i + 500) * 6.283 + k * (3 + rnd(i + 600) * 3), r = (40 + rnd(i + 700) * 300) * (1.1 - k * 0.5);
      const x = 320 + Math.cos(ang) * r * 1.3, y = 175 + Math.sin(ang) * r * 0.6;
      const al = glow * (0.5 + 0.5 * Math.sin(t * 6 + i));
      if (i % 4 === 0) alpha(al, () => DREAM.heart(x, y, 1, DREAM.HEART_C[i % DREAM.HEART_C.length]));
      else alpha(al, () => { R(x, y, 2, 2, '#fff6fb'); if (i % 3 === 0) { R(x - 2, y + 0.5, 6, 1, '#ffe0f0'); R(x + 0.5, y - 2, 1, 6, '#ffe0f0'); } });
    }
  }
  function endScreen() {
    const Hd = STORY.hidden;
    G.layer.querySelectorAll('.hidden-end').forEach((x) => x.remove());
    if (st.mode !== 'dream') st.darkTo = 0.6;
    G.el(`<div class="hidden-end"><div class="t">${Hd.end}</div><div class="s">${Hd.endSub}</div></div>`);
    finalButtons();
  }

  function credits() {
    const C = STORY.credits;
    const SA = STORY.secretAch, secret = G.hasSecret() ? `<span class="badge secret" data-k="${SA.id}">♥ ${SA.name}</span>` : '';
    const achs = secret + Object.entries(STORY.achievements).map(([k, a]) => `<span class="badge ${G.save.ach[k] ? '' : 'locked'}" data-k="${k}">${G.save.ach[k] ? '★ ' + a.name : '？？？'}</span>`).join('');
    const lines = (arr) => arr.map(([r, v]) => `<div class="line"><span class="r">${r}</span><span class="v">${v}</span></div>`).join('');
    const el = G.el(`<div class="credits"><div class="roll">
      <div class="h">${C.head}</div>
      <div class="h">CAST</div>${lines(C.cast)}
      <div class="h">STAFF</div>${lines(C.staff)}
      <div class="h">特别感谢</div>${C.thanks.map((x) => `<div>${x}</div>`).join('')}
      <div class="h">${C.achTitle}</div><div class="ach-tip">${C.achTip}</div><div class="badges">${achs}</div><div class="ach-hint"></div>
      <div style="margin-top:calc(var(--u)*16)">${C.last}</div>
      <div class="end">${C.end}</div></div></div>`);
    if (!st.hiddenDone) AU.bgm('ending');
    const roll = el.querySelector('.roll');
    const total = roll.offsetHeight + el.offsetHeight * 0.55;
    let y = 0, speed = 1, last = performance.now(), done = false;
    let pauseUntil = 0;
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const b = e.target.closest('.badge');
      if (b) {
        const a = STORY.achievements[b.dataset.k];
        el.querySelector('.ach-hint').textContent = b.classList.contains('secret') ? `♥ ${STORY.secretAch.name}：${STORY.secretAch.desc}` : G.save.ach[b.dataset.k] ? `★ ${a.name}：${a.desc}` : `提示：${a.hint}`;
        AU.sfx('select'); pauseUntil = performance.now() + 3500; return;
      }
      speed = 4;
    });
    el.addEventListener('pointerup', () => (speed = 1));
    const step = (now) => {
      const dt = (now - last) / 1000; last = now;
      if (now > pauseUntil) y = Math.min(total, y + dt * speed * el.offsetHeight * 0.075);
      roll.style.transform = `translateY(${-y}px)`;
      if (y < total) requestAnimationFrame(step);
      else if (!done) { done = true; st.creditsDone = true; G.save.cleared = true; G.persist(); G.syncFF(); if (st.hiddenDone) { el.remove(); endScreen(); } else finalButtons(); }
    };
    requestAnimationFrame(step);
  }

  function achPanel() {
    const C = STORY.credits;
    const rows = Object.entries(STORY.achievements).map(([k, a]) => G.save.ach[k]
      ? `<div class="row on"><span class="n">★ ${a.name}</span><span class="d">${a.desc}</span></div>`
      : `<div class="row off" data-k="${k}"><span class="n">？？？</span><span class="d">点击查看提示</span></div>`).join('');
    const n = Object.keys(STORY.achievements).filter((k) => G.save.ach[k]).length;
    const SA = STORY.secretAch, srow = G.hasSecret() ? `<div class="row on secret"><span class="n">♥ ${SA.name}</span><span class="d">${SA.desc}</span></div>` : '';
    const p = G.el(`<div class="ach-panel-wrap"><div class="panel ach-panel"><div class="t">${C.achTitle} ${n} / ${Object.keys(STORY.achievements).length}</div><div class="list">${srow}${rows}</div><div class="foot">${C.achKeep}</div><button class="btn small close">关闭</button></div></div>`);
    p.addEventListener('pointerdown', (e) => e.stopPropagation());
    p.querySelectorAll('.row.off').forEach((r) => r.addEventListener('click', () => { AU.sfx('select'); r.querySelector('.d').textContent = '提示：' + STORY.achievements[r.dataset.k].hint; r.classList.add('shown'); }));
    p.querySelector('.close').addEventListener('click', () => { AU.sfx('click'); p.remove(); });
  }

  function finalButtons() {
    const C = STORY.credits;
    const b = G.el(`<div class="final-btns"><button class="btn re">${C.reread}</button><button class="btn ach">${C.achBtn}</button><button class="btn primary replay">${st.hiddenDone ? C.toTitle : C.replay}</button></div>`);
    b.querySelectorAll('button').forEach((x) => x.addEventListener('pointerdown', (e) => e.stopPropagation()));
    b.querySelector('.re').addEventListener('click', () => { AU.sfx('select'); G.layer.querySelectorAll('.credits, .hidden-end').forEach((c) => c.remove()); b.remove(); letter('again'); });
    b.querySelector('.ach').addEventListener('click', () => { AU.sfx('select'); achPanel(); });
    b.querySelector('.replay').addEventListener('click', () => { AU.sfx('select'); G.resetSave(); G.backToTitle(); });  // 存档清空，成就（含隐藏成就）保留
  }
})();
