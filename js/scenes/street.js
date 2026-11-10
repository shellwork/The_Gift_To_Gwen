// 第三章：傍晚的街道（披萨 / 小店 / 咖啡 / 日料）。高清 640×360，场景宽 1640。
(() => {
  const { R, P, line, circle, ellipse, alpha, text } = GFX;
  const S = STORY.street;
  const W = 1640, BASE = 244, LANE = 262;
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  let st, bg = null;

  function paint() {
    const c = document.createElement('canvas'); c.width = W; c.height = 360;
    const g = c.getContext('2d'); const real = GFX.ctx; GFX.setCtx(g);
    // ---- 傍晚的天空 ----
    const sky = ['#5a4a8e', '#6a54980', '#7a5ea0', '#8c66a6', '#a46ea8', '#bc78a6', '#d4849e', '#e89494', '#f4a68a', '#f9b884', '#fbc888'].filter((x) => x.length === 7);
    const bh = 170 / sky.length;
    sky.forEach((col, i) => { R(0, Math.floor(i * bh), W, Math.ceil(bh) + 1, col); if (i) HD.dith(0, Math.floor(i * bh) - 3, W, 3, col, 0.5); });
    for (let i = 0; i < 14; i++) { const cx = rnd(i) * W, cy = 20 + rnd(i + 9) * 70, w = 30 + rnd(i + 5) * 60; ellipse(cx, cy, w, 4, '#f4b0b8'); ellipse(cx + 8, cy - 2, w * 0.6, 3, '#ffd0c8'); ellipse(cx - 4, cy + 2, w * 0.8, 2, '#c88aa8'); }
    // 远处的天际线
    for (let i = 0; i < 80; i++) {
      const x = i * 21 - 6, h = 30 + rnd(i + 40) * 60, w = 18;
      R(x, 170 - h, w, h + 10, '#8a72a8'); R(x, 170 - h, w, 1, '#a48cc0');
      for (let y = 174 - h; y < 168; y += 6) for (let wx = x + 3; wx < x + w - 2; wx += 4) if (rnd(wx * 7 + y * 13) > 0.72) R(wx, y, 2, 2, '#ffe39a');
    }
    R(0, 160, W, 84, '#6a5888'); HD.fadeV(0, 160, W, 84, '#3a2a50', 0, 0.6);
    for (let i = 0; i < 40; i++) { const x = rnd(i + 90) * W; R(x, 200 + rnd(i) * 30, 3, 4, '#ffd98a'); }
    // ---- 人行道 + 马路 ----
    R(0, BASE, W, 40, '#b8a6b2');
    for (let y = BASE, r = 0; y < BASE + 40; y += 8, r++) { R(0, y, W, 1, '#a494a2'); for (let x = (r % 2) * 12; x < W; x += 24) R(x, y, 1, 8, '#a494a2'); }
    for (let i = 0; i < 200; i++) P(rnd(i + 300) * W, BASE + 2 + rnd(i + 400) * 36, '#c8b8c4');
    R(0, 284, W, 4, '#d8ccd2'); R(0, 288, W, 2, '#8a7a8a');
    R(0, 290, W, 70, '#4a4560'); for (let i = 0; i < 300; i++) P(rnd(i + 600) * W, 292 + rnd(i + 700) * 66, '#56506c');
    for (let x = 20; x < W; x += 80) R(x, 326, 40, 3, '#e8dcc8');
    HD.fadeV(0, 290, W, 10, '#2a2438', 0.5, 0);
    // ---- 各家店 ----
    scaife(0); pizzaShop(200); cuteShop(440); coffeeShop(700); park(918); jpShop(1040); apartments(1290);
    HD.fadeV(0, BASE, W, 8, '#3a2a40', 0.3, 0);
    // 生活痕迹：井盖、人行道裂缝、消防栓、地上的落叶堆
    for (const mx of [380, 1200]) { GFX.ellipse(mx, 322, 16, 4, '#3a3550'); GFX.ellipse(mx, 321, 14, 3, '#5a5470'); for (let k = -10; k <= 10; k += 4) R(mx + k, 320, 2, 1, '#3a3550'); }
    for (const [cx, cy] of [[150, 268], [640, 274], [980, 266], [1460, 272]]) { for (let k = 0; k < 8; k++) P(cx + k * 2, cy + Math.round(Math.sin(k) * 1.5), '#8a7a8a'); }
    for (const hx of [610, 1390]) { R(hx, 252, 8, 14, '#c8402a'); R(hx - 2, 256, 12, 3, '#a8302a'); R(hx + 1, 248, 6, 4, '#c8402a'); R(hx + 2, 246, 4, 2, '#e05a40'); R(hx, 252, 2, 14, '#e86a50'); }
    for (const lx of [260, 920, 1560]) for (let k = 0; k < 9; k++) R(lx + (k % 5) * 3, 280 - Math.floor(k / 5) * 2, 3, 2, ['#e08a3a', '#f2b04a', '#c8642a'][k % 3]);
        // 人行道上的积水，映着店里的暖光
    for (const [px, pw] of [[120, 40], [330, 30], [560, 46], [820, 36], [1150, 44], [1420, 34]]) {
      GFX.ellipse(px, BASE + 26, pw, 4, '#8a7a96'); GFX.ellipse(px, BASE + 26, pw - 4, 3, '#a898b4');
      FX.pool(g, px, BASE + 26, pw, 4, '#ffd98a', 0.35);
    }
    FX.ao(g, 0, BASE, W, 10, 0.3);
    GFX.setCtx(real);
    return FX.bake(c, FX.BAKE.street);
  }
  const upper = (x, w, wall, y0 = 40) => {
    R(x, y0, w, BASE - y0, wall);
    for (let r = 0; r < 2; r++) for (let k = 0; k < Math.floor(w / 40); k++) {
      const wx = x + 12 + k * 40, wy = y0 + 14 + r * 36;
      R(wx - 2, wy - 2, 24, 28, '#ffffff33'); R(wx, wy, 20, 24, rnd(wx + wy) > 0.45 ? '#ffd98a' : '#5a4a6a'); R(wx + 9, wy, 2, 24, '#8a6a5a'); R(wx, wy + 11, 20, 2, '#8a6a5a');
      R(wx - 3, wy + 24, 26, 3, '#e8dcd0');
    }
  };
  function scaife(x) {
    R(x, 24, 180, BASE - 24, '#d8d0c4'); R(x, 24, 180, 3, '#efe8dc');
    for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) { R(x + 8 + k * 28, 44 + r * 34, 22, 26, '#7fa6bf'); R(x + 9 + k * 28, 45 + r * 34, 8, 3, '#a9c8db'); R(x + 8 + k * 28, 70 + r * 34, 22, 2, '#b8aea0'); }
    R(x, 24, 180, 12, '#3a3f47'); text('SCAIFE HALL', x + 46, 28, '#fffaf0');
    R(x + 50, 180, 80, 64, '#3a3f47'); R(x + 54, 184, 72, 60, '#9cc6dc'); R(x + 89, 184, 2, 60, '#3a3f47');
    alpha(0.5, () => { line(x + 60, 236, x + 72, 190, '#ffffff'); line(x + 100, 236, x + 112, 190, '#ffffff'); });
    R(x + 40, 174, 100, 6, '#5a606a');
  }
  function awning(x, w, y, c1, c2) {
    for (let i = 0; i < w; i += 12) { R(x + i, y, 6, 16, c1); R(x + i + 6, y, 6, 16, c2); }
    for (let i = 0; i < w; i += 12) { circle(x + i + 3, y + 16, 3, c1); circle(x + i + 9, y + 16, 3, c2); }
    R(x, y, w, 2, '#00000033'); HD.fadeV(x, y + 19, w, 6, '#000000', 0.2, 0);
  }
  function pizzaShop(x) {
    const w = 190;
    upper(x, w, '#a8524a', 50);
    for (let y = 52; y < BASE; y += 6) for (let i = (y / 6) % 2 ? 0 : 7; i < w; i += 14) R(x + i, y, 1, 6, '#94443e');
    for (let y = 52; y < BASE; y += 6) R(x, y, w, 1, '#94443e');
    R(x - 4, 44, w + 8, 8, '#6a2e2a');
    R(x + 10, 128, w - 20, 22, '#2b2238'); text('PIZZA', x + w / 2 - 19, 133, '#ffd66b', 2);
    awning(x + 6, w - 12, 152, '#d9483b', '#fff1e0');
    // 窗户：烤炉的暖光
    R(x + 12, 176, 104, 62, '#4a2a24'); R(x + 14, 178, 100, 58, '#ffcf8a'); HD.dgradV(x + 14, 178, 100, 58, '#ff9a5a', 0, 0.6);
    ellipse(x + 64, 222, 30, 14, '#8a4a3a'); ellipse(x + 64, 220, 22, 9, '#ff7a3a'); ellipse(x + 64, 219, 14, 5, '#ffd66b');
    R(x + 14, 206, 100, 3, '#c8935f');
    ellipse(x + 34, 204, 12, 3, '#d99a4e'); ellipse(x + 34, 203, 10, 2, '#f5c84c');
    R(x + 63, 178, 2, 58, '#4a2a24');
    // 门
    R(x + 128, 172, 50, 72, '#3a2a30'); R(x + 132, 176, 42, 68, '#6a4a3a'); R(x + 136, 180, 34, 30, '#ffcf8a'); R(x + 164, 214, 4, 4, '#ffd66b');
    text('OPEN', x + 141, 190, '#d9483b');
  }
  function cuteShop(x) {
    const w = 220;
    upper(x, w, '#f2c4d0', 60);
    R(x - 4, 54, w + 8, 8, '#d9849a');
    R(x + 30, 126, w - 60, 22, '#fff6ea'); R(x + 30, 126, w - 60, 2, '#d9849a'); text('CUTE SHOP', x + w / 2 - 35, 132, '#d9849a', 2);
    circle(x + 40, 137, 4, '#f7a8c4'); circle(x + w - 40, 137, 4, '#f7a8c4');
    for (let i = 0; i < w; i += 16) { ellipse(x + i + 8, 152, 8, 6, i % 32 ? '#fff6ea' : '#f7a8c4'); }
    // 橱窗
    R(x + 10, 162, 140, 80, '#c97a90'); R(x + 13, 165, 134, 74, '#fff2f4'); HD.dgradV(x + 13, 165, 134, 74, '#ffd8e4', 0, 1);
    R(x + 13, 214, 134, 6, '#e3a3b4'); R(x + 13, 214, 134, 1, '#ffffff');
    R(x + 20, 168, 120, 2, '#ffe0a0'); for (let i = 0; i < 10; i++) circle(x + 24 + i * 12, 172, 2, ['#ffd66b', '#f7a8c4', '#a9e0d8'][i % 3]);
    alpha(0.4, () => { line(x + 20, 236, x + 40, 170, '#ffffff'); line(x + 26, 236, x + 46, 170, '#ffffff'); });
    // 门
    R(x + 160, 168, 50, 76, '#c97a90'); R(x + 164, 172, 42, 72, '#ffe8ee'); R(x + 168, 178, 34, 30, '#bfe3f5'); circle(x + 199, 216, 2, '#d9849a');
    text('HELLO', x + 175, 214, '#d9849a');
  }
  function coffeeShop(x) {
    const w = 200;
    upper(x, w, '#5a7a68', 46);
    for (let y = 48; y < BASE; y += 8) R(x, y, w, 1, '#4e6e5c');
    R(x - 4, 40, w + 8, 8, '#2e4a3c');
    R(x + 24, 124, 152, 28, '#1e3932'); R(x + 24, 124, 152, 2, '#3a6a5a');
    circle(x + 42, 138, 10, '#f4efe6'); circle(x + 42, 138, 8, '#00704a');
    for (let k = 0; k < 5; k++) { const an = -Math.PI / 2 + k * 1.2566; line(x + 42, 138, x + 42 + Math.cos(an) * 5, 138 + Math.sin(an) * 5, '#f4efe6'); }
    text('STARBUCKS', x + 60, 132, '#f4efe6', 2);
    awning(x + 6, w - 12, 152, '#3d7a5a', '#e8efe4');
    R(x + 12, 176, 110, 62, '#2a3a30'); R(x + 14, 178, 106, 58, '#ffe0a8'); HD.dgradV(x + 14, 178, 106, 58, '#ffb070', 0, 0.5);
    R(x + 14, 212, 106, 4, '#8a6242');
    for (let i = 0; i < 5; i++) { R(x + 22 + i * 18, 200, 10, 12, '#ffffff'); R(x + 23 + i * 18, 202, 8, 3, '#6a4a30'); }
    // 门 + 黑板
    R(x + 132, 172, 52, 72, '#2a3a30'); R(x + 136, 176, 44, 68, '#4a6a58'); R(x + 140, 180, 36, 34, '#ffe0a8'); R(x + 170, 218, 4, 4, '#ffd66b');
  }
  function park(x) {
    // 小公园：树、长椅、路灯
    R(x, 210, 120, 34, '#6a8a5a'); for (let i = 0; i < 40; i++) P(x + rnd(i + 50) * 120, 212 + rnd(i + 60) * 30, '#7a9a6a');
    R(x + 30, 222, 50, 4, '#8a6242'); R(x + 30, 214, 50, 3, '#8a6242'); R(x + 34, 226, 3, 12, '#5a3a2a'); R(x + 73, 226, 3, 12, '#5a3a2a');
  }
  function jpShop(x) {
    const w = 230;
    R(x, 64, w, BASE - 64, '#5a3a2a');
    for (let i = 0; i < w; i += 8) R(x + i, 70, 3, BASE - 70, '#4a2e20');
    R(x - 8, 56, w + 16, 12, '#2a1c16'); for (let i = 0; i < w + 16; i += 8) R(x - 8 + i, 66, 6, 3, '#3a2820');
    R(x + 70, 82, 90, 28, '#2a1c16'); R(x + 72, 84, 86, 24, '#e8d8b0'); text('SUSHI', x + 96, 90, '#a8302a', 2);
    // 暖帘
    R(x + 40, 132, 150, 4, '#3a2418');
    for (let k = 0; k < 4; k++) { R(x + 42 + k * 37, 136, 35, 40, '#2e3f6e'); R(x + 42 + k * 37, 136, 35, 2, '#4a5c90'); }
    circle(x + 96, 154, 7, '#e8eef8'); circle(x + 96, 154, 5, '#2e3f6e'); circle(x + 134, 154, 7, '#e8eef8'); circle(x + 134, 154, 5, '#2e3f6e');
    // 里面的暖光
    R(x + 42, 176, 146, 68, '#ffcf7a'); HD.dgradV(x + 42, 176, 146, 68, '#e09a50', 0, 0.6);
    R(x + 42, 220, 146, 6, '#a8774f'); R(x + 42, 220, 146, 1, '#d8a878');
    for (let i = 0; i < 6; i++) { circle(x + 60 + i * 22, 214, 4, '#ffffff'); R(x + 56 + i * 22, 210, 8, 3, i % 2 ? '#f28b5b' : '#f6a07a'); }
    R(x + 113, 176, 4, 68, '#4a2e20');
    // 两侧的竹子
    for (const bx of [x + 12, x + w - 22]) { R(bx, 120, 8, 124, '#6a9a5a'); for (let y = 130; y < 240; y += 18) R(bx, y, 8, 2, '#4a7a3a'); ellipse(bx + 4, 118, 12, 5, '#5c8a4a'); }
  }
  function apartments(x) {
    upper(x, 200, '#8a7090', 30); R(x - 4, 26, 208, 6, '#6a5070');
    R(x + 80, 176, 44, 68, '#4a3a50'); R(x + 84, 180, 36, 64, '#ffd98a'); R(x + 101, 180, 2, 64, '#4a3a50');
    upper(x + 210, 140, '#a88a78', 60);
    // 公交站
    R(x + 230, 190, 2, 54, '#3a3550'); R(x + 230, 190, 60, 4, '#3a3550'); R(x + 288, 190, 2, 54, '#3a3550'); alpha(0.4, () => R(x + 232, 194, 56, 30, '#bfe3f5')); R(x + 240, 226, 40, 4, '#8a6242');
  }

  // ---------- 动态 ----------
  const LAMPS = [180, 420, 680, 910, 1030, 1280, 1500];
  const TREES = [402, 664, 940, 1020, 1520];
  // 路灯：天色渐暗，一盏接一盏亮起来（刚亮时会闪两下）
  function lamps(t) {
    if (st.t0 == null) st.t0 = t; st.lampT = t - st.t0;
    for (const [i, lx] of LAMPS.entries()) {
      const on = st.lampT - 1.2 - i * 0.9, lit = on > 0 && !(on < 0.35 && Math.floor(on * 14) % 2);
      if (on > 0 && !st.lampDing[i]) { st.lampDing[i] = true; if (Math.abs(lx - G.camX - 320) < 360) AU.sfx('click'); }
      R(lx, 156, 4, 88, '#3a3550'); R(lx - 1, 236, 6, 8, '#2a2540'); R(lx - 6, 150, 16, 6, '#3a3550'); R(lx - 4, 156, 12, 6, lit ? '#fff3c0' : '#8a8090');
      if (!lit) continue;
      const f = (0.32 + Math.sin(t * 3 + lx) * 0.02) * Math.min(1, on / 0.6);
      HD.glow(lx + 2, 160, 40, '#ffe39a', f);
      alpha(0.08, () => { for (let i = 0; i < 80; i++) R(lx + 2 - i * 0.45, 162 + i, i * 0.9 + 4, 1, '#ffe39a'); });
    }
  }
  function trees(t) {
    for (const tx of TREES) {
      R(tx - 3, 180, 6, 64, '#5a4040'); R(tx - 3, 180, 2, 64, '#6e5050');
      const cs = ['#c8642a', '#e08a3a', '#f2b04a', '#b8502a'];
      for (let k = 0; k < 7; k++) { const a = k * 0.9, r = 14 + (k % 3) * 4; circle(tx + Math.cos(a) * 14 + Math.sin(t + k) * 0.6, 164 + Math.sin(a) * 9, r, cs[k % 4]); }
      for (let k = 0; k < 10; k++) P(tx - 18 + rnd(k + tx) * 36, 150 + rnd(k + tx * 2) * 26, '#ffd68a');
    }
  }
  // 落叶：飘下来，落到人行道上之后被风吹着滚一段，再慢慢消失
  function leaves(t) {
    st.leaves.forEach((l) => {
      if (l.ground == null) {
        l.y += l.v * 0.016; l.x += Math.sin(t * 2 + l.p) * 0.4 - 0.2;
        if (l.y > l.gy) { l.ground = 0; l.y = l.gy; }
      } else {
        l.ground += 0.016; l.x += Math.max(0, 0.9 - l.ground * 0.3) * (0.6 + Math.sin(t * 3 + l.p) * 0.4);
        if (l.ground > 4) { l.ground = null; l.y = 150; l.gy = BASE + 6 + Math.random() * 30; l.x = TREES[Math.floor(Math.random() * TREES.length)] + (Math.random() - 0.5) * 30; }
      }
      const fl = l.ground != null ? Math.floor(l.x * 0.3) % 2 : Math.floor(t * 4 + l.p) % 2;
      alpha(l.ground != null && l.ground > 3 ? 4 - l.ground : 1, () => R(l.x, l.y, fl ? 3 : 2, fl ? 2 : 3, l.c));
    });
  }
  // 店里走动的人影（隔着玻璃，淡淡的）
  function shopPeople(t) {
    for (const [x0, x1, y, c, sp] of [[214, 314, 196, '#7a3a2a', 9], [714, 820, 194, '#6a4a30', 7], [732, 820, 198, '#5a3a28', 11]]) {
      const x = x0 + 8 + ((Math.sin(t * sp * 0.05 + x0) * 0.5 + 0.5) * (x1 - x0 - 16));
      alpha(0.35, () => { circle(x, y, 4, c); R(x - 6, y + 4, 12, 10, c); });
    }
  }
  function car(t) {
    if (!st.car) { if (Math.random() < 0.004) st.car = { x: G.camX - 80, v: 160 + Math.random() * 60, c: ['#c95b6a', '#5677b8', '#e8e2d8', '#2c3036'][Math.floor(Math.random() * 4)] }; return; }
    const c = st.car; c.x += c.v * 0.016; if (c.x > G.camX + 720) { st.car = null; return; }
    const x = c.x, y = 336;
    R(x + 8, y - 26, 44, 12, c.c); R(x, y - 16, 70, 12, c.c); R(x + 12, y - 24, 16, 9, '#bfe3f5'); R(x + 32, y - 24, 16, 9, '#bfe3f5');
    R(x + 66, y - 14, 4, 4, '#fff3c0'); HD.glow(x + 76, y - 12, 24, '#fff3c0', 0.35);
    circle(x + 16, y - 3, 6, '#18181c'); circle(x + 54, y - 3, 6, '#18181c'); circle(x + 16, y - 3, 2, '#9aa0aa'); circle(x + 54, y - 3, 2, '#9aa0aa');
  }
  // 小店橱窗里的三样东西
  function shopItems(t) {
    const x = 440;
    // 香水
    const px = x + 32;
    R(px, 194, 16, 20, '#f7c6d6'); R(px + 1, 195, 4, 16, '#ffffff'); R(px + 3, 186, 10, 8, '#d9b45a'); R(px + 5, 182, 6, 4, '#c9a040'); R(px, 212, 16, 2, '#d99ab0');
    alpha(0.5 + Math.sin(t * 3) * 0.4, () => { R(px + 12, 190, 1, 3, '#ffffff'); R(px + 11, 191, 3, 1, '#ffffff'); });
    // 柚子挂件
    const yx = x + 80, yy = 200 + Math.sin(t * 2) * 1.5;
    line(yx, 168, yx, yy - 11, '#c9a27a');
    circle(yx, yy, 11, '#f6b23c'); circle(yx - 2, yy - 2, 8, '#ffc85a'); for (let i = 0; i < 8; i++) P(yx - 6 + rnd(i) * 12, yy - 6 + rnd(i + 5) * 12, '#e8a030');
    R(yx - 2, yy - 13, 3, 3, '#5a9e5a'); R(yx + 1, yy - 15, 5, 3, '#7fc07f');
    R(yx - 5, yy - 1, 2, 2, '#2b2238'); R(yx + 3, yy - 1, 2, 2, '#2b2238'); R(yx - 1, yy + 3, 3, 1, '#d0706e'); R(yx - 8, yy + 2, 3, 1, '#f49a8a'); R(yx + 5, yy + 2, 3, 1, '#f49a8a');
    // 香薰蜡烛
    const cx = x + 118;
    R(cx, 196, 22, 18, '#f4c6c6'); R(cx, 196, 22, 3, '#ffe0e0'); R(cx + 3, 202, 16, 7, '#ffffff'); text('HBD', cx + 5, 203, '#d9849a');
    R(cx + 10, 190, 2, 6, '#4a3a3a'); const f = Math.sin(t * 10) * 0.6;
    ellipse(cx + 11 + f * 0.3, 186, 2, 4, '#ffb347'); P(cx + 11, 187, '#fff4c2'); HD.glow(cx + 11, 186, 10, '#ffcf7a', 0.3);
  }
  function coffeeSteam(t) {
    const x = 700;
    for (let i = 0; i < 5; i++) for (let k = 0; k < 6; k++) { const y = 198 - k * 2 - ((t * 6 + i) % 6); alpha(0.5 - k * 0.08, () => P(x + 27 + i * 18 + Math.round(Math.sin(y * 0.6 + i) * 1.2), y, '#ffffff')); }
    // 黑板
    R(x + 186, 212, 22, 30, '#6a4a30'); R(x + 188, 214, 18, 22, '#2b3a30'); text('NITRO', x + 188, 216, '#f4efe6'); R(x + 190, 224, 12, 1, '#9ef0b0'); R(x + 190, 228, 8, 1, '#f7a8c4');
    line(x + 186, 242, x + 190, 236, '#6a4a30'); line(x + 208, 242, x + 204, 236, '#6a4a30');
  }
  function lanterns(t) {
    for (const lx of [1062, 1248]) {
      HD.glow(lx, 116, 36, '#ff9a5a', 0.4 + Math.sin(t * 2 + lx) * 0.05);
      R(lx, 92, 1, 10, '#2b2238'); ellipse(lx, 116, 9, 14, '#d9483b'); ellipse(lx - 2, 114, 5, 10, '#f06a5a');
      for (let y = 106; y < 128; y += 4) R(lx - 8, y, 17, 1, '#a8302a');
      R(lx - 6, 101, 13, 3, '#2b2238'); R(lx - 6, 129, 13, 3, '#2b2238'); R(lx, 132, 1, 6, '#ffd66b');
    }
  }

  G.def('street', {
    k: 1, width: W, floor: LANE, minX: 40, maxX: 1600, bgm: 'street', checkpoint: true,
    grade: { c: '#ff9a6a', a: 0.16, c2: '#7a4ab0', a2: 0.25, vig: 0.3 },
    hint: () => !G.flags.s_pizza ? '披萨店的香味飘过来了' : !G.flags.s_coffee ? '前面有一家咖啡店' : '日料店的灯亮着',
    setup() {
      if (!bg) bg = paint();
      st = { items: {}, car: null, lampT: 0, lampDing: [], leaves: Array.from({ length: 22 }, (_, i) => ({ gy: BASE + 6 + rnd(i + 11) * 30, x: TREES[i % TREES.length] + (rnd(i) - 0.5) * 30, y: 150 + rnd(i + 3) * 90, v: 18 + rnd(i + 7) * 20, p: rnd(i + 9) * 6, c: ['#e08a3a', '#f2b04a', '#c8642a'][i % 3] })) };
      G.showRack(true);
      G.gwen = G.actor({ sprite: 'gwen', x: 110, y: LANE, speed: 120, bag: true, seed: 0.3 });
      G.obj({ id: 'pizza', label: S.labels.pizza, x: 200, y: 120, w: 190, h: 124, stand: 296, onTap: pizza });
      [['cup', 472, 182], ['yuzu', 508, 186], ['candle', 556, 184]].forEach(([k, x, y], i) => G.obj({ id: 'item_' + k, label: S.labels['item_' + k], x, y, w: 32, h: 34, stand: x + 16, onTap: () => item(i) }));
      G.obj({ id: 'coffee', label: S.labels.coffee, x: 700, y: 120, w: 200, h: 124, stand: 800, onTap: coffee });
      G.obj({ id: 'jp', label: S.labels.jp, x: 1040, y: 80, w: 230, h: 164, stand: 1150, onTap: japanese });
      if (G.flags.s_pizza) G.objects[0].seen = true;
      G.setGoal(!G.flags.s_pizza ? 'pizza' : !G.flags.s_coffee ? 'coffee' : 'jp');
    },
    async start() {
      await G.wait(400);
      await G.talk(S.intro);
    },
    draw(ctx, t) {
      ctx.drawImage(bg, 0, 0);
      shopPeople(t); trees(t); lamps(t); shopItems(t); coffeeSteam(t); lanterns(t);
    },
    drawFg(ctx, t) {
      leaves(t); car(t);
    },
  });

  // 回忆：画面从 Gwen 身上圆形收缩进去，再圆形展开
  async function memory(drawFn, filter, lines) {
    const at = () => ({ x: G.gwen.x - G.camX, y: G.gwen.y - 40 });
    await G.trans('iris', true, 800, at());
    G.vignette = drawFn; G.setFilter(filter);
    await G.trans('iris', false, 800);
    await G.talk(lines);
    await G.trans('iris', true, 800);
    G.vignette = null; G.setFilter('');
    await G.trans('iris', false, 800, at());
  }
  const vg = { gwen: { sprite: 'gwen', x: 200, y: 302, dir: 1, anim: 0, scale: 2, shadow: false, face: 'happy' }, me: { sprite: 'me', x: 440, y: 302, dir: -1, anim: 0, scale: 2, shadow: false } };
  function actors(t, gface, mface) {
    vg.gwen.anim = t; vg.me.anim = t + 0.7; vg.gwen.face = gface; vg.me.face = mface;
    CHR.drawActor(vg.gwen, t); CHR.drawActor(vg.me, t);
  }

  // 晴天的披萨午餐
  function pizzaMem(ctx, t) {
    R(0, 0, 640, 360, '#fff1d6');
    for (let x = 0; x < 640; x += 20) R(x, 0, 10, 300, '#fbe8c8');
    // 大窗户：阳光街景
    R(40, 30, 300, 180, '#c9a27a'); R(46, 36, 288, 168, '#bfe3f5'); HD.dgradV(46, 36, 288, 168, '#e8f6fc', 0, 1);
    circle(290, 76, 20, '#fff2a8'); circle(290, 76, 15, '#fffbe0'); HD.glow(290, 76, 50, '#fff6c8', 0.4);
    ellipse(110, 70, 26, 6, '#ffffff'); ellipse(124, 66, 14, 5, '#ffffff');
    R(60, 140, 60, 64, '#d9c0a0'); R(130, 124, 50, 80, '#c9b0d0'); R(190, 144, 70, 60, '#e0b8a8'); R(268, 150, 60, 54, '#c8d8c0');
    for (const [bx, by] of [[66, 150], [136, 134], [196, 154], [274, 160]]) for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) R(bx + k * 14, by + r * 16, 8, 10, '#f8f0e0');
    R(46, 196, 288, 8, '#a8cdb0');
    R(188, 36, 4, 168, '#c9a27a'); R(46, 118, 288, 4, '#c9a27a');
    // 墙上的小画 + 吊灯
    R(400, 60, 90, 8, '#c9a27a'); R(412, 36, 22, 24, '#7fb08f'); R(450, 32, 16, 28, '#f4c6c6'); R(470, 40, 14, 20, '#ffe08a');
    R(560, 0, 2, 50, '#5a4a3a'); ellipse(561, 56, 20, 8, '#d9483b'); HD.glow(561, 66, 40, '#ffe39a', 0.3);
    // 阳光
    alpha(0.18 + Math.sin(t) * 0.03, () => { for (let i = 0; i < 160; i++) R(60 + i * 1.6, 214 + i * 0.9, 260, 1, '#fff6c8'); });
    actors(t, 'happy', 'happy');
    // 桌子 + 披萨
    ctx.save(); ctx.translate(0, -50);
    R(60, 286, 520, 12, '#c58a5a'); R(60, 298, 520, 62, '#a8774f'); R(60, 285, 520, 2, '#e0a878');
    for (let x = 60; x < 580; x += 24) R(x, 300, 1, 60, '#96683f');
    ellipse(320, 290, 76, 16, '#e8e2d8'); ellipse(320, 288, 70, 14, '#ffffff');
    ellipse(320, 287, 60, 12, '#d99a4e'); ellipse(320, 286, 54, 10, '#f5c84c');
    for (let i = 0; i < 6; i++) line(320, 286, 320 + Math.cos(i * 1.047) * 54, 286 + Math.sin(i * 1.047) * 10, '#e0a840');
    [[-30, -3], [12, 4], [-6, 2], [34, -2], [-40, 3], [24, -5], [0, -6], [-18, 6]].forEach(([dx, dy]) => { ellipse(320 + dx, 286 + dy, 4, 2, '#c8423a'); P(319 + dx, 285 + dy, '#e86a5a'); });
    [[-22, 0], [28, 2], [6, -3]].forEach(([dx, dy]) => R(320 + dx, 286 + dy, 3, 1, '#3f7a58'));
    // 拉丝芝士
    const pull = 8 + Math.sin(t * 2) * 4;
    R(258, 270 - pull, 26, 6, '#f5c84c'); line(270, 276, 268, 286, '#f6d27a', 2); line(276, 276, 280, 286, '#f6d27a');
    R(140, 278, 18, 18, '#ffffff'); R(142, 280, 14, 4, '#c95b4a'); R(484, 278, 18, 18, '#ffffff'); R(486, 280, 14, 4, '#3a2a20');
    ctx.restore(); R(60, 310, 520, 50, '#a8774f');
  }
  // 日料店的夜晚
  function jpMem(ctx, t) {
    R(0, 0, 640, 360, '#5a3a2a');
    for (let x = 0; x < 640; x += 20) R(x, 0, 6, 250, '#4a2e20');
    R(0, 0, 640, 26, '#3a2418');
    for (const lx of [110, 320, 530]) {
      HD.glow(lx, 70, 70, '#ffb36b', 0.35 + Math.sin(t * 1.5 + lx) * 0.04);
      R(lx, 26, 2, 20, '#2b2238'); ellipse(lx, 70, 18, 24, '#d9483b'); ellipse(lx - 4, 66, 10, 18, '#f06a5a');
      for (let y = 52; y < 92; y += 6) R(lx - 16, y, 33, 1, '#a8302a');
      R(lx - 12, 44, 25, 4, '#2b2238'); R(lx - 12, 92, 25, 4, '#2b2238');
    }
    R(200, 120, 240, 80, '#2e3f6e'); R(318, 120, 4, 80, '#5a3a2a'); circle(260, 160, 12, '#e8eef8'); circle(260, 160, 9, '#2e3f6e'); circle(380, 160, 12, '#e8eef8'); circle(380, 160, 9, '#2e3f6e');
    vg.gwen.sit = vg.me.sit = true;   // 日料店：两个人坐在吧台前
    actors(t, null, null);
    vg.gwen.sit = vg.me.sit = false;
    ctx.save(); ctx.translate(0, -50);
    R(40, 286, 560, 12, '#c8935f'); R(40, 298, 560, 62, '#a8774f'); R(40, 285, 560, 2, '#e0b080');
    R(260, 272, 120, 16, '#2b2238'); R(262, 274, 116, 12, '#3a2a30');
    for (let i = 0; i < 6; i++) { R(270 + i * 18, 276, 14, 8, '#ffffff'); R(270 + i * 18, 272, 14, 6, i % 2 ? '#f28b5b' : '#f6a07a'); R(270 + i * 18, 274, 14, 1, '#ffd0b0'); }
    for (const cx of [200, 440]) { R(cx, 266, 16, 20, '#6a8a6a'); R(cx + 2, 268, 12, 4, '#9ab89a'); for (let k = 0; k < 6; k++) alpha(0.5 - k * 0.07, () => P(cx + 7 + Math.round(Math.sin(t * 3 + k) * 1.5), 262 - k * 2 - ((t * 6) % 3), '#ffffff')); }
    R(226, 282, 24, 2, '#c8a070'); R(392, 282, 24, 2, '#c8a070');
    ctx.restore(); R(40, 310, 560, 50, '#a8774f');
  }

  async function pizza() {
    if (G.flags.s_pizza) return G.talk(S.pizzaAgain);
    await G.talk(S.pizzaIn);
    await memory(pizzaMem, 'sepia(.3) saturate(1.25) brightness(1.05)', S.pizzaMem);
    G.flags.s_pizza = true; G.persist();
    G.achieve('pizza');
    G.setGoal(G.flags.s_coffee ? 'jp' : 'coffee');
  }
  async function item(i) {
    await G.talk(S.shopItems[i]);
    st.items[i] = true;
    G.flags.s_items = Object.assign(G.flags.s_items || {}, { [i]: true }); G.persist();   // 刷新页面也记得看过哪几样
    if (Object.keys(G.flags.s_items).length === 3) G.achieve('shop');
  }
  async function coffee() {
    await G.talk(S.coffee);
    AU.sfx('heal');
    G.burst(G.gwen.x, 200, 10, ['#9ef0b0', '#ffffff'], { speed: 30, life: 0.8, g: -30, size: 2 });
    if (!G.flags.s_coffee) { G.flags.s_coffee = true; G.persist(); G.achieve('coffee'); }
    G.setGoal(G.flags.s_pizza ? 'jp' : 'pizza');
  }
  async function japanese() {
    if (!G.flags.s_pizza || !G.flags.s_coffee) return G.talk(S.jpLocked);
    await G.talk(S.jpIn);
    AU.bgm('night');
    await memory(jpMem, 'sepia(.35) saturate(1.15) brightness(.98)', S.jpMem);
    await G.gainReagent(3);
    await G.wait(600);
    await G.notify(S.notifyFrom, S.notifyMsg);
    await G.talk(S.back);
    G.goto('finale', { fade: 1200 });
  }
})();
