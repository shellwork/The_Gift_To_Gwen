// 过场：开车去学校（匹兹堡街景）→ Scaife Hall。高清 640×360。
(() => {
  const { R, P, line, circle, ellipse, alpha, text } = GFX;
  const S = STORY.drive;
  const END = 2240, ROAD = 300, LANE = 292;
  let st, skyBg = null;
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  function paintSky() {
    const c = document.createElement('canvas'); c.width = 640; c.height = 240;
    const g = c.getContext('2d'); const real = GFX.ctx; GFX.setCtx(g);
    const cols = ['#78b2e0', '#84b9e3', '#90c0e6', '#9cc8ea', '#a8cfed', '#b6d8f0', '#c4e0f3', '#d2e8f6', '#e0eff8', '#eef5f8'];
    const bh = 236 / cols.length;
    cols.forEach((col, i) => { R(0, Math.floor(i * bh), 640, Math.ceil(bh) + 1, col); if (i) HD.dith(0, Math.floor(i * bh) - 3, 640, 3, col, 0.5); });
    HD.glow(540, 50, 120, '#fff6d8', 0.35);
    circle(540, 50, 18, '#fff6c0'); circle(540, 50, 14, '#ffffff'); HD.glow(540, 50, 50, '#fff6c8', 0.5);
    // 淡淡的阳光光束
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) { const a = 1.95 + i * 0.2; g.fillStyle = 'rgba(255,248,220,0.022)'; g.beginPath(); g.moveTo(540, 50); g.lineTo(540 + Math.cos(a) * 300, 50 + Math.sin(a) * 300); g.lineTo(540 + Math.cos(a + 0.06) * 300, 50 + Math.sin(a + 0.06) * 300); g.fill(); }
    g.restore();
    GFX.setCtx(real);
    return FX.bake(c, FX.BAKE.sky);
  }

  // 一块可以无缝重复的横向长条：fn(ox) 里按 ox 偏移画，左右各再画一遍，接缝处就不会断
  function tile(w, h, fn) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const real = GFX.ctx; GFX.setCtx(c.getContext('2d'));
    for (const ox of [-w, 0, w]) fn(ox);
    GFX.setCtx(real);
    return FX.bake(c, FX.BAKE.drive);
  }
  // 按视差把长条贴到屏幕上
  function blit(c, off, y) { const w = c.width, x = -(((off % w) + w) % w); GFX.ctx.drawImage(c, Math.round(x), y); if (x + w < 640) GFX.ctx.drawImage(c, Math.round(x + w), y); }

  let L = null;
  function paintLayers() {
    L = {};
    // 第 1 层：远山，山坡上一排排小房子，Mt. Washington 的缆车
    L.hills = tile(1600, 120, (ox) => {
      for (let x = 0; x < 1600; x++) { const h = 54 + Math.sin(x * 0.0079) * 18 + Math.sin(x * 0.023) * 7; R(ox + x, 112 - h, 1, h + 8, '#a6c3cc'); R(ox + x, 112 - h, 1, 1, '#c2d8de'); }
      for (let x = 0; x < 1600; x++) { const h = 40 + Math.sin(x * 0.0078 + 2) * 16 + Math.sin(x * 0.031) * 6; R(ox + x, 120 - h, 1, h, '#8fbf98'); R(ox + x, 120 - h, 1, 2, '#acd6ae'); }
      for (let i = 0; i < 120; i++) {
        const X = i * 13.3, h = 40 + Math.sin(X * 0.0078 + 2) * 16 + Math.sin(X * 0.031) * 6;
        for (let row = 0; row < 3; row++) {
          if (rnd(i * 3 + row) < 0.35) continue;
          const hx = ox + X + row * 4, hy = 120 - h + 6 + row * 11 + rnd(i + row) * 3, cc = ['#e8b4a0', '#f4dcb0', '#c9d8e6', '#e9c4d0', '#d8c0a8', '#fff0d8', '#b8d0e0'][(i + row * 3) % 7];
          R(hx, hy, 10, 8, cc); R(hx - 1, hy - 3, 12, 3, ['#a0625a', '#7a5a5a', '#5a6a7a'][(i + row) % 3]); P(hx + 2, hy + 3, '#7fa6bf'); P(hx + 6, hy + 3, '#7fa6bf');
        }
        if (rnd(i + 70) > 0.6) { circle(ox + X + 6, 120 - h + 4, 5, ['#d8843a', '#e8a840', '#5c9e6c', '#c8642a'][i % 4]); }
      }
      // 缆车（Duquesne Incline）
      const ix = ox + 980; line(ix, 116, ix + 46, 70, '#6a5a4a', 2); R(ix + 18, 88, 9, 7, '#c8402a'); R(ix + 19, 89, 7, 2, '#ffd98a');
    });
    // 第 2 层：市中心天际线（PPG Place 的尖顶、US Steel 黑色高楼、Cathedral of Learning）
    L.city = tile(1800, 140, (ox) => {
      const base = 136;
      for (let i = 0; i < 64; i++) {
        const x = ox + i * 28 + rnd(i) * 8, bw = 20 + Math.floor(rnd(i + 3) * 14), bh = 26 + Math.floor(rnd(i + 9) * 52);
        const col = ['#a9bccd', '#b8c4cf', '#9fb2c4', '#c4c9d0', '#aeb8c6'][i % 5];
        R(x, base - bh, bw, bh, col); R(x, base - bh, 2, bh, '#c8d6e2'); R(x + bw - 3, base - bh, 3, bh, '#90a2b4');
        if (i % 4 === 1) { R(x + bw / 2 - 1, base - bh - 8, 2, 8, '#8a9aaa'); P(x + bw / 2 - 1, base - bh - 9, '#e05050'); }
        if (i % 5 === 2) R(x - 1, base - bh, bw + 2, 3, '#8a9aaa');
        for (let wy = base - bh + 5; wy < base - 4; wy += 5) for (let wx = x + 4; wx < x + bw - 4; wx += 4) if (rnd(wy * 3 + wx * 7 + i) > 0.4) R(wx, wy, 2, 2, '#dde8f0');
      }
      // US Steel Tower
      { const x = ox + 420; R(x, base - 118, 40, 118, '#4a4e58'); R(x, base - 118, 40, 2, '#6a7080'); for (let y = base - 112; y < base; y += 6) R(x + 3, y, 34, 1, '#5a606c'); R(x + 36, base - 118, 4, 118, '#3a3e48'); }
      // PPG Place（玻璃尖顶）
      { const x = ox + 520; R(x, base - 96, 46, 96, '#5a7088'); for (let k = 0; k < 6; k++) { const px = x + k * 8; for (let j = 0; j < 12; j++) R(px + Math.floor(j / 3), base - 96 - j, 8 - Math.floor(j / 3) * 2, 1, '#6a8aa6'); } for (let y = base - 92; y < base; y += 4) for (let k = 0; k < 6; k++) R(x + 2 + k * 8, y, 1, 3, '#a8c4dc'); }
      // Cathedral of Learning（哥特式高塔）
      { const x = ox + 1320; R(x, base - 130, 30, 130, '#c8b896'); R(x - 6, base - 60, 42, 60, '#bfae8a'); for (let k = 0; k < 4; k++) R(x + 3 + k * 7, base - 130, 2, 128, '#d8caa8'); for (let j = 0; j < 14; j++) R(x + 15 - (14 - j) / 2, base - 144 + j, 14 - j > 0 ? 14 - j : 1, 1, '#b8a682'); R(x + 14, base - 150, 2, 8, '#a89672'); }
    });
    // 第 3 层：河对岸的秋天树林
    L.far = tile(1400, 40, (ox) => {
      for (let i = 0; i < 110; i++) { const x = ox + i * 13 + rnd(i + 20) * 6, r = 6 + rnd(i) * 5; circle(x, 30 - r * 0.4, r, ['#c8642a', '#d8843a', '#e8a840', '#7aa86a', '#b05a3a'][i % 5]); circle(x - 2, 28 - r * 0.6, r * 0.55, ['#e08a3a', '#f2b04a', '#ffd06a', '#9cc88a', '#d07a4a'][i % 5]); }
      R(ox, 34, 1400, 6, '#6a9a6a');
    });
    // 第 4 层：近处的行道树（4 种形状）、路灯、护栏
    L.near = tile(1500, 110, (ox) => {
      for (let i = 0; i < 16; i++) {
        const x = ox + i * 94 + rnd(i) * 30, kind = i % 4, c = [['#d8843a', '#f2b04a', '#a8562a'], ['#c8642a', '#e08a3a', '#8a3a1a'], ['#5c9e6c', '#86c08a', '#3a6a4a'], ['#e8a840', '#ffd06a', '#b87a20']][(i * 3) % 4];
        if (kind === 0) { R(x + 8, 70, 5, 26, '#6a4a34'); circle(x + 10, 56, 18, c[2]); circle(x + 8, 52, 16, c[0]); circle(x + 3, 46, 9, c[1]); circle(x + 18, 54, 10, c[0]); }
        else if (kind === 1) { R(x + 8, 74, 4, 22, '#6a4a34'); for (let r = 0; r < 40; r++) { const w = Math.round((r / 40) * 13); R(x + 10 - w, 36 + r, w * 2 + 1, 1, r % 8 < 2 ? c[1] : c[2]); } }
        else if (kind === 2) { R(x + 9, 72, 4, 24, '#6a4a34'); ellipse(x + 11, 50, 11, 24, c[2]); ellipse(x + 9, 46, 9, 20, c[0]); ellipse(x + 6, 40, 4, 10, c[1]); }
        else { ellipse(x + 12, 88, 18, 9, c[2]); ellipse(x + 10, 85, 15, 7, c[0]); ellipse(x + 6, 82, 7, 3, c[1]); }
      }
      // 路灯
      for (let i = 0; i < 5; i++) { const x = ox + 150 + i * 300; R(x, 34, 3, 62, '#4a5058'); R(x, 34, 16, 3, '#4a5058'); R(x + 12, 36, 8, 4, '#3a3e46'); R(x + 13, 39, 6, 2, '#fff2c0'); R(x - 3, 94, 9, 3, '#3a3e46'); }
      // 护栏
      R(ox, 92, 1500, 3, '#c9ced6'); R(ox, 92, 1500, 1, '#eef1f4'); R(ox, 97, 1500, 2, '#aab0ba');
      for (let x = 0; x < 1500; x += 30) R(ox + x, 92, 3, 14, '#8a909a');
    });
    // 黄色自锚式悬索桥（匹兹堡的「三姐妹桥」）
    L.bridge = tile(460, 110, () => {});
    { const real = GFX.ctx; GFX.setCtx(L.bridge.getContext('2d')); L.bridge.getContext('2d').clearRect(0, 0, 460, 110);
      const y0 = 86;
      for (const tx of [100, 360]) { R(tx - 3, 22, 7, y0 - 22 + 18, '#d9a620'); R(tx - 3, 22, 2, y0 - 4, '#f2c230'); R(tx - 6, 20, 13, 4, '#c8961a'); }
      // 主缆
      const cab = (x) => x < 100 ? y0 - 6 - (x / 100) * 58 : x > 360 ? y0 - 6 - ((460 - x) / 100) * 58 : 24 + Math.pow((x - 230) / 130, 2) * 52;
      for (let x = 0; x < 460; x++) { R(x, Math.round(cab(x)), 1, 2, '#f2c230'); if (x % 10 === 0) R(x, Math.round(cab(x)), 1, y0 - Math.round(cab(x)), '#e0b02a'); }
      // 桥面 + 桁架
      R(0, y0, 460, 4, '#d9a620'); R(0, y0, 460, 1, '#ffd860'); R(0, y0 + 9, 460, 2, '#b8901a');
      for (let x = 0; x < 460; x += 10) { line(x, y0 + 4, x + 10, y0 + 9, '#c8961a'); line(x, y0 + 9, x + 10, y0 + 4, '#c8961a'); }
      for (const tx of [100, 360]) { R(tx - 5, y0 + 11, 11, 13, '#9a9488'); }
      GFX.setCtx(real); FX.bake(L.bridge, FX.BAKE.drive); }
  }
  const wrap = (v, m) => ((v % m) + m) % m;

  function suv(x, y, t, v, driver = true) {
    // 深色 SUV，侧面，朝右；y 是轮子底部
    const b = y - 10;
    R(x + 6, b - 38, 104, 26, '#2a2e34'); // 车身上半
    R(x + 22, b - 56, 70, 20, '#2a2e34'); R(x + 26, b - 58, 62, 3, '#3a3f47');
    R(x + 30, b - 61, 50, 3, '#1a1c20'); // 车顶行李架
    // 车窗
    R(x + 28, b - 54, 30, 16, '#7fa6bf'); R(x + 62, b - 54, 26, 16, '#7fa6bf'); R(x + 59, b - 55, 3, 18, '#2a2e34');
    HD.dgradV(x + 28, b - 54, 60, 16, '#cfe6f2', 0.8, 0);
    // 车窗上滑过的反光（随车速移动）
    const gx = wrap(t * (20 + v * 0.6), 160) - 30;
    for (const [w0, w1] of [[28, 58], [62, 88]]) for (let k = 0; k < 2; k++) { const lx = x + 28 + gx + k * 6; if (lx > x + w0 && lx + 8 < x + w1) alpha(0.55 - k * 0.2, () => line(lx, b - 40, lx + 8, b - 52, '#ffffff')); }
    // 司机：Gwen 的侧影
    if (driver) circle(x + 74, b - 46, 5, '#7b4a2c'); if (driver) { R(x + 70, b - 46, 8, 8, '#7b4a2c'); P(x + 78, b - 46, '#f8d9c2'); R(x + 77, b - 45, 2, 3, '#f8d9c2'); }
    // 车身
    R(x, b - 22, 116, 18, '#33383f'); R(x, b - 22, 116, 2, '#5a606a'); R(x + 2, b - 12, 112, 1, '#22262c');
    // 车身上映出的天空和高光
    R(x + 26, b - 58, 62, 1, '#8a98a8'); R(x + 6, b - 37, 104, 1, '#6a7480'); alpha(0.5, () => R(x + 8 + gx * 0.6, b - 20, 18, 1, '#c8d4e0'));
    R(x + 6, b - 38, 104, 2, '#4a5058');
    line(x + 60, b - 36, x + 60, b - 6, '#1e2126'); line(x + 30, b - 36, x + 28, b - 6, '#1e2126');
    R(x + 44, b - 28, 8, 2, '#9aa0aa'); R(x + 72, b - 28, 8, 2, '#9aa0aa');
    R(x + 92, b - 44, 6, 6, '#2a2e34'); // 后视镜
    R(x + 110, b - 32, 6, 6, '#fff6d0'); R(x + 110, b - 32, 6, 1, '#ffffff'); if (v > 3) HD.glow(x + 118, b - 29, 16, '#fff6d0', 0.3);
    R(x, b - 32, 4, 8, '#e05050');
    R(x + 104, b - 14, 12, 4, '#22262c'); R(x, b - 14, 10, 4, '#22262c');
    // 轮子
    for (const wx of [x + 26, x + 92]) {
      R(wx - 14, b - 20, 28, 6, '#1e2126');
      circle(wx, b - 1, 11, '#141418'); circle(wx, b - 1, 6, '#8a909a'); circle(wx, b - 1, 4, '#5a606a');
      const a = t * v * 0.12;
      for (let k = 0; k < 5; k++) { const aa = a + k * 1.2566; line(wx, b - 1, wx + Math.cos(aa) * 5, b - 1 + Math.sin(aa) * 5, '#c8ccd2'); }
      P(wx, b - 1, '#2b2f36');
    }
    alpha(0.25, () => ellipse(x + 58, y + 1, 62, 3, '#2a2438'));
  }

  G.def('drive', {
    k: 1, width: 640, floor: LANE, minX: 300, maxX: 600, bgm: 'drive', checkpoint: true, noWalk: true, fixedCam: true,
    grade: { c: '#ffd9a0', a: 0.15, vig: 0.2 },
    setup() {
      if (!skyBg) skyBg = paintSky();
      this.noWalk = true;
      st = { d: 0, v: 0, honks: 0, honkT: 0, arrived: false, sq: false, oncoming: [], ocT: 1.5 };
    },
    async start() { G.toast(S.tip, 3600); },
    onTap() {
      if (st.arrived) return false;
      AU.sfx('honk'); st.honkT = 0.4; st.honks++;
      if (st.honks === 1) G.achieve('honk');
      return true;
    },
    update(dt) {
      if (st.honkT > 0) st.honkT -= dt;
      // 对向车道的车：从右边开过来
      st.ocT -= dt;
      if (st.ocT <= 0 && st.d < END - 700) {   // 快到时不再来车，下车时对面车道是空的
        st.ocT = 2 + Math.random() * 3; st.oncoming.push({ x: 680, v: 140 + Math.random() * 60, c: ['#c95b6a', '#5677b8', '#e8e2d8', '#2c3036', '#6a9a7a', '#e0ae48'][Math.floor(Math.random() * 6)] }); }
      st.oncoming = st.oncoming.filter((o) => (o.x -= (o.v + st.v) * dt) > -80);
      if (!st.arrived) {
        const target = st.d < END - 340 ? 180 : Math.max(0, (END - st.d) * 0.55 + 8);
        st.v += (target - st.v) * Math.min(1, dt * 2);
        st.d += st.v * dt;
        if (!st.sq && st.d > 860) { st.sq = true; G.toast(S.squirrel); }
        if (st.d >= END - 0.5) { st.d = END; this.arrive(); }
      }
    },
    async arrive() {
      st.arrived = true; st.v = 0;
      G.run(async () => {
        await G.wait(400);
        AU.sfx('door');
        G.gwen = G.actor({ sprite: 'gwen', x: 290, y: LANE, speed: 110, bag: true, seed: 0.3 });
        await G.walk(G.gwen, 330);
        await G.talk(S.arrive);
        this.noWalk = false;
        G.obj({
          id: 'door', label: S.labels.door, x: 430, y: 196, w: 56, h: 80, stand: 458, goal: true,
          onTap: async () => { AU.sfx('door'); G.gwen.visible = false; await G.wait(250); this.noWalk = true; G.goto('lab'); },
        });
      });
    },
    exit() { this.noWalk = true; },

    draw(ctx, t) {
      const d = st.d;
      if (!L) paintLayers();
      ctx.drawImage(skyBg, 0, 0);
      // 云：远处小而慢，近处大而有阴影
      for (let i = 0; i < 5; i++) { const x = wrap(i * 190 - d * 0.02 - t * 2, 950) - 150, y = 26 + (i % 3) * 12; alpha(0.8, () => { ellipse(x, y, 26, 4, '#ffffff'); ellipse(x + 14, y - 2, 14, 4, '#ffffff'); }); }
      for (let i = 0; i < 4; i++) {
        const x = wrap(i * 260 - d * 0.05 - t * 5, 1040) - 200, y = 58 + (i % 2) * 22;
        ellipse(x + 4, y + 6, 46, 8, '#d8e6f0'); ellipse(x, y, 42, 10, '#ffffff'); ellipse(x + 22, y - 7, 24, 10, '#ffffff'); ellipse(x - 18, y - 3, 18, 8, '#ffffff'); ellipse(x - 8, y + 5, 30, 4, '#e6eff6');
      }
      blit(L.hills, d * 0.06, 104);
      blit(L.city, d * 0.16, 86);
      // 河面
      R(0, 222, 640, 24, '#6ea8cc'); HD.fadeV(0, 222, 640, 24, '#9ccce4', 0.7, 0.1);
      blit(L.far, d * 0.3, 184);
      // 桥（每隔一段出现一座）和它在水里的倒影
      const bx0 = d * 0.45;
      for (let k = Math.floor(bx0 / 1100) - 1; k <= Math.floor(bx0 / 1100) + 1; k++) {
        const x = Math.round(k * 1100 + 260 - bx0);
        if (x > 660 || x < -480) continue;
        ctx.drawImage(L.bridge, x, 132);
        ctx.save(); ctx.globalAlpha = 0.22; ctx.translate(x, 222 + 26); ctx.scale(1, -0.28); ctx.drawImage(L.bridge, 0, 0); ctx.restore();
      }
      // 波光
      for (let i = 0; i < 34; i++) { const x = wrap(i * 41 - d * 0.45 + Math.sin(t * 1.3 + i) * 4, 700) - 30, y = 226 + (i % 5) * 4; alpha(0.45 + Math.sin(t * 3 + i * 1.7) * 0.35, () => R(x, y, 6 + (i % 3) * 4, 1, '#e8f6fc')); }
      // 一艘小船，慢慢开
      { const bxp = wrap(900 - d * 0.45 - t * 6, 1600) - 200; if (bxp > -60 && bxp < 680) { R(bxp, 234, 30, 4, '#f4f0e8'); R(bxp + 2, 238, 26, 2, '#c84a3a'); R(bxp + 8, 228, 12, 6, '#ffffff'); R(bxp + 10, 230, 3, 2, '#7fa6bf'); alpha(0.4, () => R(bxp - 14, 240, 14, 1, '#ffffff')); } }
      // 河岸草地
      R(0, 244, 640, 32, '#7ab07a'); R(0, 244, 640, 2, '#9ccc94'); HD.fadeV(0, 262, 640, 14, '#5a8a5a', 0, 0.5);
      for (let i = 0; i < 60; i++) P(wrap(rnd(i + 900) * 640 - d * 0.85, 640), 250 + rnd(i + 950) * 22, '#94c48c');
      blit(L.near, d * 0.85, 180);
      // 人行道 + 马路（两条车道，对面车道有车开过来）
      R(0, 276, 640, 20, '#d8d2c4'); for (let i = 0; i < 20; i++) R(wrap(i * 40 - d, 680) - 20, 276, 1, 20, '#c4bdae'); R(0, 276, 640, 2, '#e8e2d4'); FX.ao(GFX.ctx, 0, 294, 640, 4, 0.25);
      R(0, 296, 640, 64, '#55555f'); R(0, 296, 640, 2, '#45454f');
      for (let i = 0; i < 200; i++) P(wrap(rnd(i) * 640 - d, 640), 300 + rnd(i + 50) * 58, '#62626c');
      for (let i = 0; i < 10; i++) R(wrap(i * 88 - d, 792) - 60, 318, 40, 3, '#f4f0e0');
      R(0, 356, 640, 2, '#e8e2d4');
      // 对向车流
      for (const oc of st.oncoming) {
        const x = Math.round(oc.x);
        R(x, 298, 62, 9, oc.c); R(x + 10, 290, 38, 9, oc.c); R(x + 13, 292, 14, 6, '#9cc6dc'); R(x + 30, 292, 14, 6, '#9cc6dc');
        R(x, 298, 62, 1, '#ffffff66'); R(x, 300, 4, 3, '#fff6d0'); circle(x + 14, 308, 5, '#141418'); circle(x + 48, 308, 5, '#141418'); circle(x + 14, 308, 2, '#8a909a'); circle(x + 48, 308, 2, '#8a909a');
      }
      // 松鼠
      const sqx = 1280 - d;
      if (sqx > -20 && sqx < 680) { const hop = Math.abs(Math.sin(t * 8)) * 3; R(sqx, 268 - hop, 10, 7, '#a0703e'); R(sqx + 8, 264 - hop, 6, 6, '#a0703e'); P(sqx + 12, 266 - hop, '#2b2238'); R(sqx - 6, 256 - hop, 6, 12, '#b8834c'); R(sqx - 8, 254 - hop, 4, 6, '#b8834c'); }
      // Scaife Hall
      const sh = END + 280 - d;
      if (sh < 660) {
        // 主楼：浅色石材 + 玻璃幕墙（窗玻璃映着天空）+ 金属竖框
        R(sh, 64, 352, 212, '#e9e4da'); R(sh, 64, 352, 3, '#ffffff'); R(sh + 348, 64, 4, 212, '#cfc8ba');
        R(sh, 64, 352, 26, '#3a3f47'); R(sh, 88, 352, 2, '#2a2e34'); text('SCAIFE HALL', sh + 110, 72, '#fffaf0', 2);
        for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
          const wx = sh + 12 + c * 42, wy = 100 + r * 36;
          HD.dgradV(wx, wy, 32, 24, '#6f9ab8', 1, 1); HD.dgradV(wx, wy, 32, 24, '#b8d8ec', 0.9, 0);
          R(wx + 15, wy, 2, 24, '#8a929c'); R(wx, wy, 32, 1, '#5a626c'); R(wx, wy + 24, 32, 2, '#c8c0b2');
          alpha(0.35, () => { line(wx + 3, wy + 20, wx + 10, wy + 3, '#ffffff'); line(wx + 20, wy + 20, wx + 25, wy + 8, '#ffffff'); });
          if ((r * 8 + c) % 5 === 2) R(wx + 4, wy + 14, 8, 10, '#e8d8b0');   // 有人开着灯
        }
        // 底层：深色石材基座 + 大门雨棚
        R(sh, 244, 352, 32, '#c9c0b0'); R(sh, 244, 352, 2, '#ddd6c8');
        R(sh + 122, 196, 108, 80, '#3a3f47'); HD.dgradV(sh + 126, 200, 100, 76, '#8ab8d4', 1, 1); HD.dgradV(sh + 126, 200, 100, 76, '#d4ecf8', 0.8, 0); R(sh + 175, 200, 3, 76, '#3a3f47');
        alpha(0.5, () => { line(sh + 136, 268, sh + 152, 208, '#ffffff'); line(sh + 186, 268, sh + 202, 208, '#ffffff'); });
        R(sh + 104, 184, 144, 8, '#5a606a'); R(sh + 104, 184, 144, 2, '#8a909a'); R(sh + 108, 192, 3, 52, '#5a606a'); R(sh + 241, 192, 3, 52, '#5a606a'); FX.ao(GFX.ctx, sh + 110, 192, 132, 8, 0.25);
        R(sh + 150, 186, 52, 4, '#c8102e');   // 红色校徽条
        // 自行车架 + 两辆自行车
        R(sh + 262, 262, 40, 2, '#8a909a'); for (let k = 0; k < 4; k++) R(sh + 264 + k * 12, 256, 1, 8, '#8a909a');
        for (const [bx, bc] of [[sh + 268, '#3b6fd1'], [sh + 288, '#c84a3a']]) { GFX.ctx.strokeStyle = '#2b2238'; circle(bx, 268, 5, '#2b2238'); circle(bx, 268, 4, '#e9e4da'); circle(bx + 14, 268, 5, '#2b2238'); circle(bx + 14, 268, 4, '#e9e4da'); line(bx, 268, bx + 7, 260, bc, 2); line(bx + 7, 260, bx + 14, 268, bc, 2); line(bx + 4, 259, bx + 10, 259, bc, 2); }
        // 门口的树和花坛
        for (const tx2 of [sh + 40, sh + 320]) { R(tx2 - 14, 264, 32, 10, '#8a7a68'); R(tx2 - 14, 264, 32, 2, '#a8988a'); R(tx2, 240, 4, 26, '#6a4a34'); circle(tx2 + 2, 230, 16, '#c8642a'); circle(tx2 - 4, 224, 10, '#e08a3a'); circle(tx2 + 10, 228, 9, '#d8843a'); }
        R(sh - 8, 272, 368, 4, '#c4bdae');
      }
      // 车
      const bob = st.v > 10 ? Math.round(Math.sin(t * 20) * 0.6) : 0;
      suv(180, 330 + bob, t, st.v, !G.gwen);
      if (st.honkT > 0) { R(266, 248, 40, 18, '#fffaf0'); R(265, 249, 1, 16, '#2b2238'); R(306, 249, 1, 16, '#2b2238'); R(266, 247, 40, 1, '#2b2238'); R(266, 266, 40, 1, '#2b2238'); text('BEEP', 270, 252, '#e34b4b', 2); R(276, 267, 4, 4, '#fffaf0'); }
    },
  });
})();
