// 隐藏结局的特殊场景「梦的世界」
// 粉紫色夜空 + 极光 + 带光环的大星球 + 三层云 + 坐在小云朵上的回忆小物件 + 天空之镜（地面倒映整片天空）
// 终章（集齐成就后读信）和通关后的标题页共用
const DREAM = (() => {
  const { R, P, circle, ellipse, alpha, line } = GFX;
  const rnd = (i) => { const x = Math.sin(i * 77.3 + 11.9) * 43758.5453; return x - Math.floor(x); };
  const HEART = ['.#.#.', '#####', '#####', '.###.', '..#..'];
  const HEART_C = ['#ff8fb3', '#ff6f9a', '#ffb3d1', '#c9a3ff', '#9fd8ff', '#ffd66b', '#9ef0c8', '#ffb38a'];
  const STARS = Array.from({ length: 170 }, (_, i) => ({ x: rnd(i) * 640, y: Math.pow(rnd(i + 300), 1.5) * 230, s: rnd(i + 600) > 0.9 ? 2 : 1, p: rnd(i + 900) * 6, c: rnd(i + 1200) > 0.6 ? '#ffe6f2' : rnd(i + 1500) > 0.5 ? '#fff6d8' : '#e8e0ff' }));
  let bg = null, sprites = null, hover = null;

  function heart(x, y, s, c) { HEART.forEach((row, j) => [...row].forEach((ch, i) => ch === '#' && R(Math.round(x + i * s), Math.round(y + j * s), s, s, c))); }
  // 在一张小画布上画东西（画完自动描边、调色）
  function sprite(w, h, fn, bakeIt = true) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const real = GFX.ctx; GFX.setCtx(c.getContext('2d')); fn(); GFX.setCtx(real);
    return bakeIt ? FX.bake(c, { edge: 255, alphaEdge: true, contrast: 1.05, sat: 1.05, sAmt: 0.15, shadow: '#3a1a5a' }) : c;
  }

  // 一朵有体积的云：底部偏紫、顶部偏白、左上有亮边
  function puff(cx, cy, r, pal) {
    circle(cx, cy + r * 0.25, r, pal[0]);
    circle(cx - r * 0.1, cy, r * 0.92, pal[1]);
    circle(cx - r * 0.25, cy - r * 0.22, r * 0.62, pal[2]);
    circle(cx - r * 0.38, cy - r * 0.4, r * 0.28, pal[3]);
  }
  function cloudShape(w, h, seed, pal) {
    const n = Math.max(4, Math.round(w / 11));
    const pts = [];
    // 半径控制在高度的一半左右，云顶是圆的，不会被画布切平
    for (let i = 0; i < n; i++) { const k = (i + 0.5) / n, r = h * (0.22 + 0.3 * Math.sin(k * Math.PI)) * (0.85 + rnd(seed + i) * 0.3); pts.push([w * k, h - r * 0.95, r]); }
    for (const [x, y, r] of pts) circle(x, y + r * 0.25, r, pal[0]);
    for (const [x, y, r] of pts) circle(x - r * 0.1, y, r * 0.92, pal[1]);
    for (const [x, y, r] of pts) circle(x - r * 0.25, y - r * 0.22, r * 0.62, pal[2]);
    for (const [x, y, r] of pts) if (r > h * 0.4) circle(x - r * 0.38, y - r * 0.42, r * 0.26, pal[3]);
    R(0, h - 2, w, 2, pal[0]);
  }
  const CL_NEAR = ['#d79ac8', '#f6cfe4', '#ffeef7', '#ffffff'];
  const CL_MID = ['#c88ac0', '#eab8d8', '#f8dcec', '#fff4fa'];
  const CL_FAR = ['#a878b8', '#c898cc', '#dcb4dc', '#ecd0ea'];

  // ---------- 回忆漂浮物：这一年里的小东西 ----------
  function makeMemories() {
    const M = {};
    M.photo = sprite(22, 24, () => { R(1, 1, 20, 22, '#fffef6'); R(3, 3, 16, 13, '#9cc6e4'); R(3, 11, 16, 5, '#c8b898'); for (let i = 0; i < 4; i++) { circle(6 + i * 3.4, 10, 1.2, ['#5a3a2a', '#2b2238', '#7a4a2c', '#3a2a20'][i]); R(5 + i * 3.4, 11, 3, 4, ['#3c5280', '#fdfaf4', '#24242c', '#80404a'][i]); } R(6, 18, 10, 1, '#c9b8d8'); });
    M.flex = sprite(24, 22, () => { R(1, 4, 22, 16, '#eef2f4'); R(3, 6, 18, 9, '#bfe3f5'); R(1, 4, 22, 1, '#ffffff'); R(1, 18, 22, 2, '#c9d2d8'); for (const ex of [8, 15]) { heart(ex - 2, 8, 1, '#ff5a8a'); } R(8, 16, 8, 1, '#ff8fb3'); R(18, 0, 6, 4, '#2b2f36'); R(19, 1, 4, 2, '#ff8fb3'); });
    M.pizza = sprite(20, 18, () => { for (let r = 0; r < 15; r++) { const w = Math.round(18 - r * 1.15); R(1 + r * 0.55, 2 + r, w, 1, r < 2 ? '#c8935f' : '#f5c84c'); } R(1, 1, 18, 2, '#c8935f'); for (const [x, y] of [[5, 5], [10, 7], [8, 10], [13, 5]]) circle(x, y, 1.4, '#d9483b'); P(7, 8, '#5a9e5a'); P(12, 9, '#5a9e5a'); });
    M.coffee = sprite(14, 22, () => { R(2, 4, 10, 16, '#e8f4fa'); R(3, 7, 8, 12, '#3a2418'); R(3, 7, 8, 2, '#c8a070'); R(1, 2, 12, 3, '#ffffff'); R(8, 0, 2, 5, '#00704a'); circle(7, 13, 2, '#00704a'); P(7, 13, '#f4efe6'); R(2, 4, 1, 16, '#ffffff'); });
    M.bouquet = sprite(20, 24, () => { for (let r = 0; r < 12; r++) R(6 + r * 0.35, 11 + r, 8 - r * 0.6, 1, '#c9a27a'); R(7, 15, 6, 2, '#ff8fb3'); circle(6, 8, 4, '#f7a8c4'); circle(14, 7, 4, '#ffd23f'); P(13, 6, '#8a5a1a'); P(15, 6, '#8a5a1a'); circle(10, 4, 3.5, '#b9a3d6'); circle(4, 4, 2, '#5c9e6c'); circle(17, 11, 2, '#5c9e6c'); });
    M.tubes = sprite(24, 22, () => { R(1, 14, 22, 3, '#9aa6ad'); STORY.reagents.forEach((rg, i) => { const x = 2 + i * 4; R(x, 2, 3, 14, '#eef6f8'); R(x, 7, 3, 9, rg.color); R(x, 2, 3, 1, '#ffffff'); }); R(1, 17, 2, 4, '#9aa6ad'); R(21, 17, 2, 4, '#9aa6ad'); });
    M.mango = sprite(24, 18, () => { R(1, 3, 22, 14, '#f6c84a'); R(1, 3, 22, 3, '#ffe08a'); R(1, 15, 22, 2, '#d8a030'); circle(7, 10, 4, '#f6a03c'); P(6, 8, '#ffd08a'); R(7, 5, 2, 2, '#5a9e5a'); R(13, 8, 8, 1, '#c87a20'); R(13, 11, 6, 1, '#c87a20'); });
    M.yuzu = sprite(18, 18, () => { circle(9, 10, 7, '#f6b23c'); circle(8, 9, 5, '#ffc85a'); R(8, 1, 3, 3, '#5a9e5a'); R(10, 0, 4, 2, '#7fc07f'); P(6, 10, '#2b2238'); P(11, 10, '#2b2238'); R(8, 12, 2, 1, '#d0706e'); P(4, 12, '#f49a8a'); P(13, 12, '#f49a8a'); });
    M.car = sprite(26, 14, () => { R(2, 6, 22, 5, '#33383f'); R(6, 2, 13, 5, '#33383f'); R(7, 3, 5, 3, '#9cc6dc'); R(13, 3, 5, 3, '#9cc6dc'); R(22, 7, 2, 2, '#fff6d0'); circle(7, 11, 2.5, '#141418'); circle(19, 11, 2.5, '#141418'); P(7, 11, '#8a909a'); P(19, 11, '#8a909a'); });
    return M;
  }
  // 位置：避开人物、蛋糕和星球
  // 排成一道从左下往右上的弧线，右边两件放在星球旁边；都不挡人物和蛋糕
  const MEM = [
    ['car', 18, 138], ['photo', 66, 98], ['flex', 118, 66], ['pizza', 186, 40], ['coffee', 256, 30],
    ['bouquet', 320, 38], ['tubes', 382, 60], ['yuzu', 604, 40], ['mango', 604, 104],
].map(([k, x, y], i) => ({ k, x, y, p: i * 1.37 }));
  const memPos = (m, t) => ({ x: m.x, y: Math.round(m.y + Math.sin(t * 1.1 + m.p) * 3) });

  // ---------- 静态背景 ----------
  function paint(floor) {
    const c = document.createElement('canvas'); c.width = 640; c.height = 360;
    const real = GFX.ctx; GFX.setCtx(c.getContext('2d'));
    const bands = ['#160f44', '#1d1354', '#261863', '#311d72', '#40227f', '#52288b', '#672e95', '#7d379c', '#9542a1', '#ac50a5', '#c162a8', '#d576ac', '#e48daf', '#efa6b3', '#f6c0ba'];
    const bh = floor / bands.length;
    bands.forEach((col, i) => { R(0, Math.floor(i * bh), 640, Math.ceil(bh) + 1, col); if (i) HD.dith(0, Math.floor(i * bh) - 4, 640, 4, col, 0.5); });
    // 星云
    for (let i = 0; i < 1100; i++) { const k = rnd(i + 2000), x = k * 700 - 30, y = 30 + k * 110 + (rnd(i + 2100) - 0.5) * 70; if (rnd(i + 2200) < 0.5) P(x, y, rnd(i + 2300) > 0.5 ? '#7a42a8' : '#9a56b0'); if (rnd(i + 2400) < 0.06) P(x, y, '#d8b0e8'); }
    // 大星球：大气光晕 → 背面光环 → 球体（亮面、条纹、暗面）→ 坑 → 前面光环
    const px = 492, py = 92, pr = 44;
    HD.glow(px, py, 120, '#ffc8e6', 0.3);
    const ring = (front) => { for (let a = 0; a < 6.283; a += 0.003) { const x = px + Math.cos(a) * 84, y = py + Math.sin(a) * 15 - Math.cos(a) * 6; if ((Math.sin(a) >= 0) === front) { P(x, y, front ? '#fff0f8' : '#e8b0d0'); P(x, y + 1, front ? '#f2b8d8' : '#c890b8'); if (front && Math.abs(Math.cos(a)) > 0.6) P(x, y - 1, '#ffffff'); } } };
    ring(false);
    circle(px, py, pr + 1, '#a86a9a');
    circle(px, py, pr, '#e8a8cc');
    const g = c.getContext('2d');
    g.save(); g.beginPath(); g.arc(px, py, pr, 0, 6.283); g.clip();
    circle(px - 8, py - 8, pr - 2, '#ffd9ea');
    for (let y = py - pr; y < py + pr; y++) { const b = Math.floor((y - py + pr) / 7); if (b % 2) for (let x = px - pr; x < px + pr; x++) if ((x + y) % 3 && rnd(x * 3 + y) > 0.35) P(x, y, (x - px + 8) ** 2 + (y - py + 8) ** 2 < (pr - 2) ** 2 ? '#ffe6f1' : '#f0b6d4'); }
    circle(px - 16, py - 16, 16, '#fff1f7'); circle(px - 20, py - 20, 6, '#ffffff');
    for (const [cx, cy, r] of [[px + 16, py + 12, 7], [px - 18, py + 20, 5], [px + 24, py - 14, 4], [px + 4, py + 26, 3]]) { circle(cx, cy, r, '#e8a8cc'); circle(cx - 1, cy - 1, r - 2, '#f8c8de'); }
    g.restore();
    ring(true);
    // 小月亮
    HD.glow(34, 36, 30, '#fff3c9', 0.25); circle(34, 36, 10, '#fff3d8'); circle(39, 32, 9, '#1d1354');
    // 远处的浮空岛：左边一座带小房子和瀑布，右边一座带秋千
    island(76, 184, 92, true); island(586, 178, 64, false);
    // 地平线上的远云
    for (let i = 0; i < 46; i++) { const x = i * 15 - 10 + rnd(i) * 10, r = 6 + rnd(i + 9) * 9 + Math.sin(i * 0.5) * 3; puff(x, floor - 3 - r * 0.4 - rnd(i + 3) * 4, r, CL_FAR); }
    R(0, floor - 4, 640, 4, CL_FAR[1]);
    GFX.setCtx(real);
    return FX.bake(c, { edge: 30, contrast: 1.04, lift: 0, shadow: '#20104a', sAmt: 0.2, hi: '#fff0f8', hAmt: 0.06, sat: 1.06 });
  }
  function island(x, y, w, house) {
    for (let r = 0; r < 22; r++) { const k = r / 22, ww = w * (1 - k * k * 0.9); R(x - ww / 2, y + r, ww, 1, r < 4 ? '#c88ac0' : r < 12 ? '#9a62a4' : '#7a4a8c'); if (r > 4 && r % 3 === 0) for (let i = 0; i < ww; i += 7) P(x - ww / 2 + i + (r % 2) * 3, y + r, '#6a3a7a'); }
    R(x - w / 2, y - 3, w, 4, '#e8a8d8'); R(x - w / 2, y - 3, w, 1, '#ffd0ec');
    for (let k = 0; k < 4; k++) { const tx = x - w / 2 + 8 + k * (w - 16) / 3; R(tx, y - 14, 2, 12, '#6a3a7a'); circle(tx + 1, y - 17, 6, '#d88ac8'); circle(tx, y - 19, 4, '#f0b0e0'); P(tx - 1, y - 21, '#ffe0f4'); }
    if (house) { R(x - 8, y - 16, 16, 13, '#fff0e6'); for (let r = 0; r < 7; r++) R(x - 10 + r, y - 23 + r, 20 - r * 2, 1, '#e86a8a'); R(x - 2, y - 10, 4, 7, '#b86a8a'); R(x + 3, y - 13, 3, 3, '#ffe9a0'); }
    else { line(x - 6, y - 20, x - 6, y - 3, '#6a3a7a'); line(x + 8, y - 20, x + 8, y - 3, '#6a3a7a'); R(x - 7, y - 21, 16, 2, '#6a3a7a'); line(x - 2, y - 19, x - 2, y - 8, '#e8d0e8'); line(x + 4, y - 19, x + 4, y - 8, '#e8d0e8'); R(x - 3, y - 8, 8, 2, '#f7a8c4'); }
  }

  function makeSprites() {
    sprites = {
      mem: makeMemories(),
      cushion: sprite(30, 10, () => { for (const [x, r] of [[7, 4], [14, 5], [21, 4]]) puff(x, 6, r, CL_NEAR); R(4, 7, 22, 2, CL_NEAR[0]); }),
      mid: [0, 1, 2].map((i) => sprite([96, 128, 76][i], [34, 42, 28][i], () => cloudShape([96, 128, 76][i], [34, 42, 28][i], i * 10, CL_MID))),
      near: [0, 1].map((i) => sprite(200, 70, () => cloudShape(200, 70, 40 + i * 9, CL_NEAR))),
    };
  }

  // ---------- 每帧 ----------
  // o.floor：镜面开始的高度；o.ripples：要在脚下荡起涟漪的人物
  function draw(t, o = {}) {
    const floor = o.floor ?? 258;
    if (!bg || bg.floor !== floor) { bg = paint(floor); bg.floor = floor; }
    if (!sprites) makeSprites();
    const ctx = GFX.ctx;
    ctx.drawImage(bg, 0, 0, 640, floor, 0, 0, 640, floor);
    // 极光：两条缓缓起伏的光带
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let x = 0; x < 640; x += 3) {
      const yc = 64 + Math.sin(x * 0.011 + t * 0.22) * 20 + Math.sin(x * 0.029 - t * 0.16) * 7, it = 0.5 + 0.5 * Math.sin(x * 0.017 + t * 0.3);
      if (it < 0.25) continue;
      alpha(0.07 * it, () => R(x, yc - 18, 3, 12, '#5ad8c8')); alpha(0.11 * it, () => R(x, yc - 6, 3, 8, '#9ef0c8')); alpha(0.06 * it, () => R(x, yc + 2, 3, 14, '#ff9ad0'));
    }
    ctx.restore();
    // 星星
    STARS.forEach((s) => { if (s.y > floor - 30) return; const a = 0.4 + Math.sin(t * 2.2 + s.p) * 0.45; alpha(Math.max(0, a), () => R(s.x, s.y, s.s, s.s, s.c)); if (s.s > 1 && a > 0.7) alpha(a * 0.5, () => { R(s.x - 2, s.y + 0.5, 6, 1, s.c); R(s.x + 0.5, s.y - 2, 1, 6, s.c); }); });
    // 流星：每 3.5 秒一颗
    const sk = (t % 3.5) / 0.9;
    if (sk < 1) { const i = Math.floor(t / 3.5), x0 = 40 + rnd(i + 40) * 420, y0 = 10 + rnd(i + 50) * 50, x = x0 + sk * 150, y = y0 + sk * 58; for (let j = 0; j < 22; j++) alpha((1 - j / 22) * (1 - sk), () => R(x - j * 2.5, y - j, 2, 1, j < 3 ? '#ffffff' : '#ffd0ec')); }
    // 左边浮空岛的小瀑布
    for (let j = 0; j < 24; j++) { const y = 204 + ((t * 30 + j * 7) % 44), xx = 116 + Math.round(Math.sin(y * 0.3) * 0.6); alpha(0.7 * (1 - (y - 204) / 44), () => R(xx, y, 2, 3, j % 3 ? '#cfe6ff' : '#ffffff')); }
    // 中景的云：慢慢飘
    sprites.mid.forEach((c, i) => { const w = c.width, x = Math.round(((t * (4 + i * 2) + i * 230) % (640 + w)) - w), y = [196, 214, 204][i]; alpha(0.9, () => ctx.drawImage(c, x, y)); });
    // 偶尔有一朵高空的云慢慢飘过（在回忆小物件后面）
    { const c = sprites.mid[1], x = Math.round(((t * 6 + 900) % 1700) - c.width - 120); if (x > -c.width && x < 640) alpha(0.8, () => ctx.drawImage(c, x, 62)); }
    // 回忆漂浮物
    MEM.forEach((m) => {
      const c = sprites.mem[m.k], hv = hover === m, q = memPos(m, t), lift = hv ? 3 : 0, cx = q.x + c.width / 2, cy = q.y + c.height / 2;
      HD.glow(cx, cy - lift, hv ? 26 : 18, hv ? '#fff2fa' : '#ffe0f4', hv ? 0.42 : 0.2 + Math.sin(t * 2 + m.p) * 0.06);
      // 每件东西坐在一小朵云上，跟着一起浮动
      ctx.drawImage(sprites.cushion, Math.round(cx - sprites.cushion.width / 2), q.y + c.height - 4);
      ctx.drawImage(c, q.x, q.y - lift);
      if (hv) {
        // 悬停：往上浮起一点，周围有一圈转动的星光
        for (let k = 0; k < 6; k++) { const a = t * 2.4 + k * 1.047, rx = c.width * 0.75 + 4, ry = c.height * 0.6 + 4; const sx = Math.round(cx + Math.cos(a) * rx), sy = Math.round(cy - lift + Math.sin(a) * ry); R(sx, sy, 2, 2, k % 2 ? '#ffffff' : '#ffd6ee'); }
      } else if (Math.sin(t * 1.7 + m.p * 3) > 0.96) { R(q.x + c.width, q.y - 2, 1, 5, '#ffffff'); R(q.x + c.width - 2, q.y, 5, 1, '#ffffff'); }
    });
    // 往上飘的小光点
    for (let i = 0; i < 18; i++) { const sp = 8 + rnd(i + 70) * 12, y = floor - ((t * sp + rnd(i + 80) * 300) % 300), x = rnd(i + 90) * 640 + Math.sin(t * 0.8 + i) * 8; const a = Math.min(1, (floor - y) / 60) * 0.8; if (i % 3 === 0) alpha(a, () => heart(x, y, 1, HEART_C[i % HEART_C.length])); else alpha(a * 0.8, () => R(x, y, 2, 2, '#fff4fa')); }
    mirror(ctx, t, floor);
  }

  // 天空之镜：把地平线以上的画面倒过来映在地上，一行行轻微晃动，再罩一层紫色
  function mirror(ctx, t, floor) {
    const src = ctx.canvas, H = 360 - floor;
    if (G.lowFx) { ctx.save(); ctx.translate(0, floor * 2); ctx.scale(1, -1); ctx.drawImage(src, 0, floor - H, 640, H, 0, floor - H, 640, H); ctx.restore(); }
    else for (let y = 0; y < H; y += 2) {
      const sy = floor - 2 - y; if (sy < 0) break;
      const off = Math.round(Math.sin((floor + y) * 0.18 + t * 2.2) * (0.6 + y * 0.035));
      ctx.drawImage(src, 0, sy, 640, 2, off, floor + y, 640, 2);
    }
    alpha(0.28, () => R(0, floor, 640, H, '#5a2a7a'));
    HD.fadeV(0, floor, 640, H, '#2a1050', 0, 0.35);
    alpha(0.7, () => R(0, floor, 640, 1, '#ffe0f2')); alpha(0.35, () => R(0, floor + 1, 640, 1, '#ffb8de'));
    // 水面上的反光碎点
    for (let i = 0; i < 40; i++) { const x = (rnd(i + 500) * 640 + t * (6 + (i % 4) * 2)) % 640, y = floor + 4 + rnd(i + 600) * (H - 8); alpha(0.5 + Math.sin(t * 3 + i) * 0.4, () => R(x, y, 2 + (i % 3) * 2, 1, '#ffe8f6')); }
  }

  // 画在人物之后：倒影里的人物、涟漪、两侧的近景云
  function reflect(fn, floor = 258) { const ctx = GFX.ctx; ctx.save(); ctx.globalAlpha = 0.4; ctx.translate(0, floor * 2); ctx.scale(1, -1); fn(); ctx.restore(); }
  function drawFg(t, o = {}) {
    const floor = o.floor ?? 258, ctx = GFX.ctx;
    if (!sprites) makeSprites();
    (o.ripples || []).forEach((a, i) => {
      if (!a) return;
      FX.pool(ctx, a.x, floor + 1, 22, 3, '#ffb3d6', 0.3);
      for (const ph of [0, 1.1]) { const k = ((t + i * 0.7 + ph) % 2.2) / 2.2, rx = 6 + k * 34, ry = 1.5 + k * 5; alpha(0.55 * (1 - k), () => { for (let a2 = 0; a2 < 6.283; a2 += 0.18) P(Math.round(a.x + Math.cos(a2) * rx), Math.round(floor + 3 + Math.sin(a2) * ry), '#ffe0f2'); }); }
    });
    // 两侧框住画面的近景云（浮在镜面上）
    const n = sprites.near;
    ctx.drawImage(n[0], Math.round(-70 + Math.sin(t * 0.3) * 4), 300);
    ctx.drawImage(n[1], Math.round(520 + Math.sin(t * 0.25 + 1) * 4), 306);
  }

  // 人物身后的粉色轮廓光（让人物像被梦境的光照着）
  const rimCache = new Map();
  function rim(a, col = '#ff9ad0') {
    if (!a || !a.visible) return;
    const fr = CHR.frame(a.sprite, { ph: null, bag: a.bag, badge: a.badge, arms: a.pose }, a.scale || 1);
    const key = a.sprite + (a.dir < 0 ? 'f' : 'n') + (a.pose || '') + (a.bag ? 'b' : '') + col;
    let c = rimCache.get(key);
    if (!c) { c = document.createElement('canvas'); c.width = fr.w; c.height = fr.h; const g = c.getContext('2d'); g.drawImage(a.dir < 0 ? fr.f : fr.n, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, fr.w, fr.h); rimCache.set(key, c); }
    const x = Math.round(a.x - (a.dir < 0 ? fr.w - fr.fx : fr.fx)), y = Math.round(a.y - fr.fy - (a.hop || 0));
    const ctx = GFX.ctx, o = ctx.globalAlpha;
    HD.glow(a.x, a.y - 40, 46, col, 0.16);
    ctx.globalAlpha = o * 0.85; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1]]) ctx.drawImage(c, x + dx, y + dy); ctx.globalAlpha = o;
  }

  // 点到回忆漂浮物：冒出一句话
  function hit(p) {
    for (const m of MEM) { const c = sprites && sprites.mem[m.k]; if (!c) continue; const q = memPos(m, G.t); if (p.x >= q.x - 6 && p.x <= q.x + c.width + 6 && p.y >= q.y - 6 && p.y <= q.y + c.height + 6) return { m, q, c }; }
    return null;
  }
  function say(h) {
    const txt = (STORY.dream && STORY.dream.memories[h.m.k]) || '';
    if (!txt) return;
    G.layer.querySelectorAll('.toy-bubble').forEach((b) => b.remove());
    const lx = Math.min(520, Math.max(120, h.q.x + h.c.width / 2));
    const below = h.q.y < 60;
    const b = G.el(`<div class="toy-bubble dream-bubble${below ? ' below' : ''}" style="left:${(lx / 640) * 100}%;top:${((below ? h.q.y + h.c.height + 14 : h.q.y - 4) / 360) * 100}%">${txt}</div>`);
    AU.sfx('ding');
    G.burst(h.q.x + h.c.width / 2, h.q.y + h.c.height / 2, 12, ['#ffe0f4', '#ffffff', '#ffd66b'], { speed: 40, life: 0.7, g: 0, size: 1 });
    setTimeout(() => { b.classList.add('out'); setTimeout(() => b.remove(), 400); }, 2400);
  }
  function tap(p) { const h = hit(p); if (h) { say(h); return true; } return false; }
  // 鼠标悬停：返回是否停在某件东西上（用来把鼠标变成手指）
  function hoverAt(p) { const h = p ? hit(p) : null; const m = h ? h.m : null; if (m && m !== hover) AU.sfx('blip'); hover = m; return !!m; }

  // 提前把背景和小物件画好，避免切进梦境的那一刻卡一下
  function prepare(floor = 258) { if (!bg || bg.floor !== floor) { bg = paint(floor); bg.floor = floor; } if (!sprites) makeSprites(); }
  return { draw, drawFg, prepare, reflect, rim, tap, hoverAt, heart, HEART_C };
})();
