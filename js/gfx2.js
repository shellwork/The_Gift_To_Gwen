// 高分辨率（640×360）画面工具：调色板、抖动渐变、光照、新版角色精灵与头像
const HD = (() => {
  const { R, P, line, circle, ellipse, alpha, text } = GFX;

  // ---------- 调色板：暗部偏紫、亮部偏暖 ----------
  const PAL = {
    wood: ['#4a2f2a', '#6b4434', '#8f5e40', '#b37b51', '#d29e6c', '#e8c08e'],
    cream: ['#b8957e', '#d4b396', '#e8cfb0', '#f4e3c8', '#fbf0dc', '#fff8ec'],
    pink: ['#9a5566', '#c27482', '#df9aa3', '#efbcc0', '#f9dcdc', '#fff0ee'],
    leaf: ['#24443e', '#2f5d4b', '#3f7a58', '#5c9e6c', '#86c08a', '#b8dcaa'],
    sky: ['#6aa6d6', '#86bde4', '#a6d2ef', '#c8e5f7', '#e6f4fc'],
    metal: ['#14141a', '#202028', '#30303a', '#45454f', '#62626e', '#8e8e9c'],
    white: ['#9d9aa8', '#c3bfc8', '#dcd8dc', '#eeebea', '#f8f6f2', '#ffffff'],
    blue: ['#2b3a64', '#3c5590', '#5677b8', '#7d9fd4', '#a9c4e8'],
    gold: ['#8a5a1e', '#b8822e', '#e0ae48', '#f6d27a', '#fff0b8'],
    shadow: '#3a2a4a',
  };

  // ---------- 抖动 ----------
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
  const bay = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];
  function dith(x, y, w, h, c, a) {
    const ctx = GFX.ctx; ctx.fillStyle = c;
    x = Math.round(x); y = Math.round(y);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (bay(x + i, y + j) < a) ctx.fillRect(x + i, y + j, 1, 1);
  }
  // 竖直方向抖动渐变：a0 → a1
  function dgradV(x, y, w, h, c, a0, a1) {
    const ctx = GFX.ctx; ctx.fillStyle = c;
    x = Math.round(x); y = Math.round(y);
    for (let j = 0; j < h; j++) {
      const a = a0 + (a1 - a0) * (j / Math.max(1, h - 1));
      if (a <= 0) continue;
      if (a >= 1) { ctx.fillRect(x, y + j, w, 1); continue; }
      for (let i = 0; i < w; i++) if (bay(x + i, y + j) < a) ctx.fillRect(x + i, y + j, 1, 1);
    }
  }
  function dgradH(x, y, w, h, c, a0, a1) {
    const ctx = GFX.ctx; ctx.fillStyle = c;
    x = Math.round(x); y = Math.round(y);
    for (let i = 0; i < w; i++) {
      const a = a0 + (a1 - a0) * (i / Math.max(1, w - 1));
      if (a <= 0) continue;
      for (let j = 0; j < h; j++) if (a >= 1 || bay(x + i, y + j) < a) ctx.fillRect(x + i, y + j, 1, 1);
    }
  }
  // 逐行/逐列的半透明渐变（用于柔和的环境光遮蔽）
  function fadeV(x, y, w, h, c, a0, a1) { const ctx = GFX.ctx; const o = ctx.globalAlpha; ctx.fillStyle = c; for (let j = 0; j < h; j++) { ctx.globalAlpha = o * (a0 + (a1 - a0) * (j / Math.max(1, h - 1))); ctx.fillRect(Math.round(x), Math.round(y) + j, Math.round(w), 1); } ctx.globalAlpha = o; }
  function fadeH(x, y, w, h, c, a0, a1) { const ctx = GFX.ctx; const o = ctx.globalAlpha; ctx.fillStyle = c; for (let i = 0; i < w; i++) { ctx.globalAlpha = o * (a0 + (a1 - a0) * (i / Math.max(1, w - 1))); ctx.fillRect(Math.round(x) + i, Math.round(y), 1, Math.round(h)); } ctx.globalAlpha = o; }
  // 光晕：分成三圈台阶
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1, 7), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
  function glow(cx, cy, r, c, a = 0.35) {
    if (!(r > 0) || !(a > 0) || !isFinite(cx + cy)) return;
    const ctx = GFX.ctx, g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    // 小光晕：三级台阶（像素风）；大光晕：平滑过渡（台阶放大后会变成一圈圈很假的圆盘）
    if (r <= 56) { g.addColorStop(0, rgba(c, a)); g.addColorStop(0.3, rgba(c, a)); g.addColorStop(0.3, rgba(c, a * 0.55)); g.addColorStop(0.62, rgba(c, a * 0.55)); g.addColorStop(0.62, rgba(c, a * 0.22)); g.addColorStop(1, rgba(c, a * 0.22)); g.addColorStop(1, rgba(c, 0)); }
    else { g.addColorStop(0, rgba(c, a)); g.addColorStop(0.3, rgba(c, a * 0.6)); g.addColorStop(0.65, rgba(c, a * 0.2)); g.addColorStop(1, rgba(c, 0)); }
    ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  // 带高光和暗面的矩形（立体感）
  function box(x, y, w, h, ramp, o = {}) {
    const b = o.base ?? 3;
    R(x, y, w, h, ramp[b]);
    R(x, y, w, 1, ramp[b + 1] || ramp[b]);
    R(x, y + h - 1, w, 1, ramp[b - 2] || ramp[0]);
    R(x + w - 1, y + 1, 1, h - 2, ramp[b - 1]);
    if (o.outline) { R(x - 1, y, 1, h, o.outline); R(x + w, y, 1, h, o.outline); R(x, y - 1, w, 1, o.outline); R(x, y + h, w, 1, o.outline); }
  }

  // ---------- 光照层：先整体压暗，再点亮局部 ----------
  let lc = null, lg = null;
  function lightBegin(w, h, ambient) {
    if (!lc || lc.width !== w || lc.height !== h) { lc = document.createElement('canvas'); lc.width = w; lc.height = h; lg = lc.getContext('2d'); }
    lg.globalCompositeOperation = 'source-over';
    lg.fillStyle = ambient; lg.fillRect(0, 0, w, h);
    lg.globalCompositeOperation = 'lighter';
    return lg;
  }
  function lightAdd(cx, cy, r, color, steps = 5) {
    const real = GFX.ctx; GFX.setCtx(lg);
    for (let s = steps; s >= 1; s--) { lg.globalAlpha = 0.22; circle(cx, cy, Math.round((r * s) / steps), color); }
    lg.globalAlpha = 1; GFX.setCtx(real);
  }
  function lightApply(ctx, x = 0, y = 0) {
    const o = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(lc, x, y);
    ctx.globalCompositeOperation = o;
  }

  // ---------- 精灵 ----------
  function sprite(rows, pal) {
    const h = rows.length, w = Math.max(...rows.map((r) => r.length));
    const mk = (flip) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d');
      rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const ch = r[x]; if (ch === '.' || ch === ' ') continue; g.fillStyle = pal[ch] || '#f0f'; g.fillRect(flip ? w - 1 - x : x, y, 1, 1); } });
      return c;
    };
    return { w, h, n: mk(false), f: mk(true) };
  }
  const swap = (rows, at, repl) => rows.map((r, i) => (repl[i - at] !== undefined ? repl[i - at] : r));

  // ===== Gwen（24×42）=====
  const GW_PAL = {
    a: '#4a2a1e', h: '#7b4a2c', H: '#9a5f36', w: '#c4884f',
    k: '#f8d9c2', K: '#e9b79c', e: '#2e1f22', i: '#6e4632', o: '#ffffff', b: '#f5a7a7', m: '#c45f5e',
    d: '#fdfaf4', D: '#e6dfd3', F: '#cbbfb0', r: '#e2d2bc', s: '#9b7a66', S: '#6a4c40',
  };
  const GW_BODY = [
    '.........aaaaaa.........',
    '.......aahhhhhhaa.......',
    '......ahhhHHHHhhha......',
    '.....ahhHHwwwHHhhha.....',
    '....ahhHHwwHHHhhhhha....',
    '...ahhhHHHHhhhhhhhhha...',
    '...ahhhhhhhhhhhhhhhha...',
    '..ahhhhhhhhhhhhhhhhhha..',
    '..ahhhhhkkhhhhhkkkhhha..',
    '..ahhhkkkkkhhkkkkkkhha..',
    '..ahhkkkkkkkkkkkkkkhha..',
    '..ahhkkeekkkkkkeekkhha..',
    '..ahhkkeokkkkkkeokkhha..',
    '..ahhkkiikkkkkkiikkhha..',
    '..ahhkbbkkkkkkkkbbkhha..',
    '..ahhkkkkkkmmkkkkkkhha..',
    '..ahhhkkkkkkkkkkkkhhha..',
    '..ahhhhKkkkkkkkkKhhhha..',
    '..ahhhhh.KkkkkK.hhhhha..',
    '..ahhhhddddddddddhhhha..',
    '.aHhhhddddddddddddhhhHa.',
    '..ahHkddDddddddDddkHha..',
    '.aHhhkdDddddddddDdkhhHa.',
    '..awhkdDddddddddDdkhwa..',
    '..ahHkdrrrrrrrrrrdkHha..',
    '.aHhhkddddddddddddkhhHa.',
    '..awhkdDddddddddDdkhwa..',
    '..ahHkdDddddddddDdkHha..',
    '...aHkdDddddddddDdkHa...',
    '...awkdDddddddddDdkwa...',
    '....aKdDddddddddDdKa....',
    '.....dDDddddddddDDd.....',
    '....ddDddddddddddDdd....',
    '....dDddddddddddddDd....',
    '...ddDddddDddDddddDdd...',
    '...dDdddddDddDdddddDd...',
    '..ddDddddDddddDddddDdd..',
    '..dDdddddDddddDdddddDd..',
    '..FFFFFFFFFFFFFFFFFFFF..',
  ];
  const GW_LEGS = {
    idle: ['........KK....KK........', '........kk....kk........', '.......Sss....ssS.......', '.......SSS....SSS.......'],
    a: ['......KK.......KK.......', '.....kk.........kk......', '....Sss..........ssS....', '....SSS..........SSS....'],
    b: ['.........KKKK...........', '.........kkkk...........', '........SssSss..........', '........SSSSSS..........'],
  };
  const GW_BLINK = ['..ahhkkkkkkkkkkkkkkhha..', '..ahhkkeekkkkkkeekkhha..', '..ahhkkkkkkkkkkkkkkhha..'];

  // ===== Baiding（24×42）=====
  const BD_PAL = {
    a: '#121218', h: '#1f1f27', H: '#34343f', w: '#4c4c5a',
    k: '#f4d3bb', K: '#e2b398', e: '#1b1b24', o: '#ffffff', g: '#5a6280', G: '#9aa6c8', m: '#b8645e',
    t: '#24242c', T: '#34343e', p: '#f4a6c0', y: '#ffe08a', c: '#8fd0e8',
    n: '#8a8a96', N: '#6e6e7a', M: '#a4a4b0', s: '#f2f2f2', S: '#b8b8c4',
  };
  const BD_BODY = [
    '........aaaaaaa.........',
    '......aahhhhhhhaa.......',
    '.....ahhhHHhhhhhha......',
    '....ahhHHwhhhhhhhha.....',
    '...ahhhhhhhhhhhhhhha....',
    '...ahhhhhhhhhhhhhhhha...',
    '...ahhhhhhhhhhhhhhhha...',
    '...ahkhhhkhhhhkhhhkha...',
    '...akkkhkkkkhkkkkkkka...',
    '...akkkkkkkkkkkkkkkka...',
    '...kkggggggggggggggkk...',
    '...kkgGkkkgkkgGkkkgkk...',
    '...kkgkeekgkkgkeekgkk...',
    '...kkggggggkkggggggkk...',
    '...kkkkkkkkkkkkkkkkkk...',
    '....kkkkkkkmmkkkkkkk....',
    '....kkkkkkkkkkkkkkkk....',
    '.....KkkkkkkkkkkkkK.....',
    '........KkkkkkK.........',
    '......ttttTTTTtttt......',
    '....tttttttttttttttt....',
    '...ttttttttttttttttttt..',
    '...kttttppppyyptttttk...',
    '...kttttpyyyyppttttk....',
    '...kttttpcpppcpttttk....',
    '...kttttpppccpptttk.....',
    '...kttttttppptttttk.....',
    '...KttttttttttttttK.....',
    '....kttttttttttttk......',
    '....KtttttttttttttK.....',
    '.....nnnnnnnnnnnnn......',
    '.....nnnnnnNnnnnnn......',
    '.....nnnnnnNnnnnnn......',
    '.....nnnnnnNnnnnnn......',
    '.....nnnnnnNnnnnnn......',
    '.....nnnnn..nnnnnn......',
    '.....nnnnn..nnnnnn......',
    '.....Nnnnn..nnnnnN......',
  ];
  const BD_LEGS = {
    idle: ['.....nnnnn..nnnnn.......', '.....MnnnN..MnnnN.......', '.....sssss..sssss.......', '.....SSSSS..SSSSS.......'],
    a: ['....nnnnn....nnnnn......', '...MnnnN......MnnnN.....', '...sssss......sssss.....', '...SSSSS......SSSSS.....'],
    b: ['.......nnnnnnnn.........', '.......MnnnnnnN.........', '.......ssssssss.........', '.......SSSSSSSS.........'],
  };
  const BD_BLINK = ['...kkggggggggggggggkk...', '...kkgGkkkgkkgGkkkgkk...', '...kkgkKKkgkkgkKKkgkk...', '...kkggggggkkggggggkk...'];

  // ===== 猫（白色长毛猫，趴着）=====
  const CAT_PAL = { o: '#a89c92', w: '#fdfbf7', W: '#ece5dc', V: '#d6ccc0', p: '#f2b4bc', b: '#7ab0d8', e: '#2e2a30', n: '#ee9aa6', z: '#b8aca2' };
  const CAT = [
    '.o......o.........................',
    '.oo....oo.........................',
    '.opo..opo.........................',
    'owwwwwwwwo........................',
    'owwwwwwwwwo.......................',
    'owbewwbewwo.......................',
    'owwwwnwwwwwoooooooooooooo.........',
    'oWwwwzwwwwwwwwwwwwwwwwwwwoo.......',
    'oWWwwwwwwwwwwwwwwwwwwwwwwwwo......',
    '.oWWwwwwwwwwwwwwwwwwwwwwwwwWo.....',
    '.oWWWwwwwwwwwwwwwwwwwwwwwwWWo.....',
    '..oWWWWwwwwwwwwwwwwwwwwwWWWVo.....',
    '..oVWWWWWWwwwwwwwwwWWWWWWVVo......',
    '...owwoowwoVVVVVVVVowwoowwo.......',
    '....oo..oo..oooooooo.oo..oo.......',
  ];
  const CAT_SLEEP = swap(CAT, 5, ['owzzwwzzwwo.......................']);

  // ===== 头像（40×40）=====
  const PORTRAIT_GWEN = [
    '...............aaaaaaaaaa...............',
    '.............aahhhhhhhhhhaa.............',
    '...........aahhhHHHHHHhhhhhaa...........',
    '..........ahhhHHHwwwHHHhhhhhha..........',
    '.........ahhHHHwwwHHHHhhhhhhhha.........',
    '........ahhHHHwwHHHHhhhhhhhhhhha........',
    '.......ahhHHHHHHHhhhhhhhhhhhhhhha.......',
    '......ahhhHHHHhhhhhhhhhhhhhhhhhhha......',
    '.....ahhhhhhhhhhhhhhhhhhhhhhhhhhhha.....',
    '.....ahhhhhhhhhhhhhhhhkkhhhhhhhhhha.....',
    '....ahhhhhhhhhhhhhhhhkkkkhhhhhhhhhha....',
    '....ahhhhhkhhhhhhhhhkkkkkkhhhhhhhhha....',
    '....ahhhhkkkhhhhhhhkkkkkkkkhhhhhhhha....',
    '...ahhhhkkkkkhhhhhkkkkkkkkkkhhhhhhhha...',
    '...ahhhhhhkkkkkkkkkkkkkkkkkkkkhhhhhha...',
    '...ahhhhhkkkhhhhkkkkkkkkhhhhkkkhhhhha...',
    '...ahhhhhkkkkkkkkkkkkkkkkkkkkkkhhhhha...',
    '...ahhhhhkkkaaaaakkkkkkaaaaakkkhhhhha...',
    '...ahhhhhkkkeoeeekkkkkkeoeeekkkhhhhha...',
    '...aHhhhhkkkeooiekkkkkkeooiekkkhhhhHa...',
    '...ahhhhhkkkeiiiekkkkkkeiiiekkkhhhhha...',
    '...ahhhhhkkkeiiiekkkkkkeiiiekkkhhhhha...',
    '...aHhhhhkkkkeeekkkkkkkkeeekkkkhhhhHa...',
    '...ahhhhhkkkkkkkkkkkkkkkkkkkkkkhhhhha...',
    '...ahhhhhkkbbbkkkkkKKkkkkkbbbkkhhhhha...',
    '...aHhhhhkbbbbkkkkkkkkkkkkbbbbkhhhhHa...',
    '...ahhhhhkkkkkkkkkkkkkkkkkkkkkkhhhhha...',
    '...ahhhhhkkkkkkkkkmmmmkkkkkkkkkhhhhha...',
    '...aHhhhhhkkkkkkkkkbbkkkkkkkkkhhhhhHa...',
    '...ahhhhhhhKkkkkkkkkkkkkkkkkKhhhhhhha...',
    '..ahhhhhhhhhKKkkkkkkkkkkkKKhhhhhhhhhha..',
    '..ahhhhhhhhhhhKKKkkkkkKKKhhhhhhhhhhhha..',
    '..ahhhhhhhhhhh...KkkkkK...hhhhhhhhhhha..',
    '.ahhhhhhhhhhh....KkkkkK....hhhhhhhhhhha.',
    '.ahhhhhhhhhhhddddKkkkkKddddhhhhhhhhhhha.',
    '.aHhhhhhhhhhdddddDkkkDdddddhhhhhhhhhhHa.',
    'ahhhhhhhhhhddddddddddddddddddhhhhhhhhhha',
    'ahhHhhhhhhdddDddddddddddddDdddhhhhhHhhha',
    'ahhhhhhhhddddDddddddddddddDddddhhhhhhhha',
    'aHhhhhhhdddddDddddddddddddDdddddhhhhhHha',
  ];
  const GW_FACES = {
    normal: null,
    happy: { at: 17, rows: [
      '...ahhhhhkkkkkkkkkkkkkkkkkkkkkkhhhhha...',
      '...ahhhhhkkkkaaakkkkkkkkaaakkkkhhhhha...',
      '...aHhhhhkkkaekeakkkkkkaekeakkkhhhhHa...',
      '...ahhhhhkkkekkkekkkkkkekkkekkkhhhhha...',
      '...ahhhhhkkkkkkkkkkkkkkkkkkkkkkhhhhha...',
      '...aHhhhhkkkkkkkkkkkkkkkkkkkkkkhhhhHa...',
      '...ahhhhhkkkkkkkkkkkkkkkkkkkkkkhhhhha...',
      '...ahhhhhkkbbbkkkkkKKkkkkkbbbkkhhhhha...',
      '...aHhhhhkbbbbkkkkkkkkkkkkbbbbkhhhhHa...',
      '...ahhhhhkkkkkkkkmmmmmmkkkkkkkkhhhhha...',
      '...ahhhhhkkkkkkkkmbbbbmkkkkkkkkhhhhha...',
      '...aHhhhhhkkkkkkkkmmmmkkkkkkkkhhhhhHa...',
    ] },
    surprised: { at: 26, rows: [
      '...ahhhhhkkkkkkkkkkkkkkkkkkkkkkhhhhha...',
      '...ahhhhhkkkkkkkkkkmmkkkkkkkkkkhhhhha...',
      '...aHhhhhhkkkkkkkkmkkmkkkkkkkkhhhhhHa...',
    ] },
  };
  const GW_PORTRAIT_PAL = Object.assign({}, GW_PAL);

  const SP = {};
  function build() {
    const mk = (body, legs, pal, blink, blinkAt) => {
      const f = {};
      for (const k in legs) f[k] = sprite(body.concat(legs[k]), pal);
      f.blink = sprite(swap(body, blinkAt, blink).concat(legs.idle), pal);
      return f;
    };
    SP.gwen = mk(GW_BODY, GW_LEGS, GW_PAL, GW_BLINK, 11);
    SP.me = mk(BD_BODY, BD_LEGS, BD_PAL, BD_BLINK, 10);
    SP.cat = { awake: sprite(CAT, CAT_PAL), sleep: sprite(CAT_SLEEP, CAT_PAL) };
    SP.portrait = {};
    for (const k in GW_FACES) { const f = GW_FACES[k]; SP.portrait['Gwen:' + k] = sprite(f ? swap(PORTRAIT_GWEN, f.at, f.rows) : PORTRAIT_GWEN, GW_PORTRAIT_PAL); }
  }

  // 画高清角色：x 是中心，y 是脚底。上半身会随呼吸轻微起伏。
  function drawActor(a, t) {
    const set = SP[a.sprite]; if (!set) return GFX.drawActor(a);
    const ctx = GFX.ctx;
    let fr = set.idle;
    if (a.walking) fr = [set.a, set.b, set.a, set.b][Math.floor(a.anim * 8) % 4];
    else if ((Math.floor((a.anim + (a.seed || 0)) * 10) % 38) === 0) fr = set.blink;
    const img = a.dir < 0 ? fr.f : fr.n;
    const x = Math.round(a.x - fr.w / 2), y = Math.round(a.y - fr.h);
    // 接触阴影
    alpha(0.22, () => ellipse(a.x, a.y, 9, 2, PAL.shadow));
    const split = 30;
    const breath = !a.walking && Math.sin(a.anim * 2.4 + (a.seed || 0)) > 0.6 ? 1 : 0;
    const bob = a.walking && (Math.floor(a.anim * 8) % 2) ? -1 : 0;
    ctx.drawImage(img, 0, split, fr.w, fr.h - split, x, y + split + bob, fr.w, fr.h - split);
    ctx.drawImage(img, 0, 0, fr.w, split, x, y + breath + bob, fr.w, split);
    if (a.extra) a.extra(ctx, x, y + bob, a.dir, t);
  }

  // Gwen 的包（拿到之后才显示）：斜挎带 + 包
  function gwenBag(ctx, x, y, dir) {
    const fx = (px) => (dir < 0 ? x + 23 - px : x + px);
    const strap = '#8a6446';
    for (let i = 0; i <= 12; i++) P(fx(7 + i), y + 19 + Math.round(i * 0.85), strap);
    const bx = dir < 0 ? fx(23) : fx(17);
    R(bx, y + 29, 7, 7, '#c9a27a'); R(bx, y + 29, 7, 1, '#e0c29a'); R(bx, y + 35, 7, 1, '#a07a55'); R(bx + 3, y + 31, 1, 2, '#f4e6d0');
  }

  function drawCat(x, y, t, sleeping) {
    const s = sleeping ? SP.cat.sleep : SP.cat.awake;
    GFX.ctx.drawImage(s.n, Math.round(x), Math.round(y));
    // 尾巴：从身体后端翘起、慢慢摆动
    const bx = x + 27, by = y + 8;
    const sw = Math.sin(t * 1.6) * 3;
    const pts = [];
    for (let i = 0; i <= 10; i++) { const k = i / 10; pts.push([bx + k * 7 + sw * k * k, by - Math.sin(k * 2.4) * 9 - k * 2]); }
    pts.forEach(([px, py]) => { R(px - 2, py - 1, 4, 3, '#a89c92'); });
    pts.forEach(([px, py], i) => { R(px - 1, py, 3, 2, i > 8 ? '#ece5dc' : '#fdfbf7'); });
  }

  // ---------- Flex（高清，104×92 机身 + 28 高推车）----------
  // st: { mood: 'idle'|'error'|'ok'|'run'|'sleep', gx: 0..1, dip }
  const MOOD = {
    idle: { scr: '#5aa9e6', bar: '#7cc4ff' }, error: { scr: '#e34b4b', bar: '#ff5a5a' }, ok: { scr: '#3fbf6f', bar: '#4fe08a' },
    run: { scr: '#5aa9e6', bar: '#7cc4ff' }, sleep: { scr: '#2b3550', bar: '#5b6a9a' }, love: { scr: '#ff8fb3', bar: '#ff8fb3' },
  };
  function flex(x, y, st, t, opt = {}) {
    const m = MOOD[st.mood] || MOOD.idle;
    const W = 104, Hh = 92;
    // 推车
    R(x + 4, y + Hh, W - 8, 6, '#5d6b77'); R(x + 4, y + Hh, W - 8, 1, '#8a98a4'); R(x + 4, y + Hh + 5, W - 8, 1, '#3d4852');
    for (const lx of [x + 10, x + W - 14]) { R(lx, y + Hh + 6, 4, 18, '#4a5560'); R(lx, y + Hh + 6, 1, 18, '#6d7a86'); }
    R(x + 10, y + Hh + 16, W - 20, 3, '#4a5560');
    for (const wx of [x + 12, x + W - 12]) { circle(wx, y + Hh + 25, 3, '#22222a'); P(wx, y + Hh + 25, '#6d7a86'); }
    // 机身
    R(x, y, W, Hh, '#6f7a84');
    R(x + 1, y + 1, W - 2, Hh - 2, '#f4f6f8');
    R(x + 1, y + 1, W - 2, 9, '#e6eaee'); R(x + 1, y + 1, W - 2, 1, '#ffffff'); R(x + 1, y + 10, W - 2, 1, '#b8c2ca');
    R(x + 1, y + 11, 7, 58, '#e6eaee'); R(x + W - 8, y + 11, 7, 58, '#d3d9de'); R(x + 7, y + 11, 1, 58, '#b8c2ca'); R(x + W - 8, y + 11, 1, 58, '#b8c2ca');
    // 玻璃窗里面
    const gx0 = x + 8, gy0 = y + 11, gw = W - 16, gh = 58;
    R(gx0, gy0, gw, gh, '#d2e6ee'); fadeV(gx0, gy0, gw, 20, '#8fb2c2', 0.45, 0);
    R(gx0, gy0 + 2, gw, 5, '#5d6b77'); R(gx0, gy0 + 2, gw, 1, '#8a98a4');
    // 甲板 + 耗材
    R(gx0 + 2, gy0 + 40, gw - 4, 16, '#b8c2ca'); R(gx0 + 2, gy0 + 40, gw - 4, 1, '#dfe5ea'); R(gx0 + 2, gy0 + 55, gw - 4, 1, '#8a98a4');
    const lab = [['tip', '#f2c14e'], ['plate', '#f7a8c4'], ['tip', '#7ec8e3'], ['res', '#9ad8f0']];
    lab.forEach(([k, c], i) => {
      const lx = gx0 + 4 + i * 21, ly = gy0 + 33;
      R(lx, ly, 18, 9, '#ffffff'); R(lx, ly + 8, 18, 1, '#9aa6ad'); R(lx + 17, ly, 1, 9, '#c9d2d8');
      if (k === 'tip') for (let a = 0; a < 4; a++) for (let b = 0; b < 2; b++) R(lx + 2 + a * 4, ly + 2 + b * 3, 2, 2, c);
      else if (k === 'plate') for (let a = 0; a < 6; a++) for (let b = 0; b < 2; b++) P(lx + 2 + a * 3, ly + 3 + b * 3, c);
      else { R(lx + 2, ly + 2, 14, 5, c); R(lx + 2, ly + 2, 14, 1, '#d8f2fb'); }
    });
    // 龙门 + 移液头
    const px = gx0 + 6 + (st.gx ?? 0.3) * (gw - 24), dip = st.dip || 0;
    R(px, gy0 + 4, 14, 11, '#3d4852'); R(px, gy0 + 4, 14, 1, '#6d7a86'); R(px + 2, gy0 + 7, 3, 2, m.bar);
    R(px + 3, gy0 + 15, 8, 12 + dip, '#e8ecef'); R(px + 3, gy0 + 15, 1, 12 + dip, '#ffffff'); R(px + 10, gy0 + 15, 1, 12 + dip, '#b8c2ca');
    R(px + 5, gy0 + 27 + dip, 4, 5, '#f4f4f4'); P(px + 6, gy0 + 32 + dip, '#d0d8dc');
    // 玻璃反光
    alpha(0.4, () => { for (let i = 0; i < 3; i++) line(gx0 + 6 + i * 4, gy0 + gh - 2, gx0 + 28 + i * 4, gy0 + 2, '#ffffff'); line(gx0 + 60, gy0 + gh - 2, gx0 + 76, gy0 + 20, '#ffffff'); });
    // 贴在玻璃上的两只眼睛
    for (const ex of [x + 36, x + 68]) {
      const ey = y + 32;
      circle(ex, ey, 8, '#2b2238'); circle(ex, ey, 7, '#ffffff'); P(ex - 3, ey - 4, '#ffffff');
      if (st.mood === 'sleep') { R(ex - 5, ey, 11, 2, '#2b2238'); continue; }
      // 爱心眼：粉色小爱心，一跳一跳
      if (st.mood === 'love') { const beat = Math.sin(t * 6) > 0.3 ? 1 : 0; ['.###...###.', '#####.#####', '###########', '###########', '.#########.', '..#######..', '...#####...', '....###....', '.....#.....'].forEach((row, j) => [...row].forEach((c, i) => c === '#' && R(ex - 5 + i, ey - 4 + j - beat, 1, 1, j > 5 ? '#e0306a' : '#ff5a8a'))); R(ex - 4, ey - 3 - beat, 2, 2, '#ffd0e0'); continue; }
      const look = st.mood === 'error' ? Math.sin(t * 11) * 2 : Math.sin(t * 0.8) * 2;
      const up = st.mood === 'ok' ? -2 : st.mood === 'error' ? 1 : 0;
      circle(ex + Math.round(look), ey + up, 3, '#2b2238'); P(ex + Math.round(look) - 1, ey + up - 1, '#ffffff');
    }
    // 前面板 + 状态灯条（嘴）
    R(x + 1, y + 69, W - 2, 22, '#eaeef1'); R(x + 1, y + 69, W - 2, 1, '#b8c2ca'); R(x + 1, y + 90, W - 2, 1, '#c9d2d8');
    const mx = x + 30, my = y + 79, mw = 44;
    const gl = st.mood === 'run' ? 0.55 + Math.sin(t * 8) * 0.45 : st.mood === 'error' ? (Math.floor(t * 4) % 2 ? 1 : 0.45) : 1;
    alpha(gl * 0.25, () => R(mx - 4, my - 4, mw + 8, 11, m.bar));
    alpha(gl, () => {
      if (st.mood === 'ok' || st.mood === 'love') { R(mx + 4, my + 2, mw - 8, 3, m.bar); R(mx, my - 1, 4, 3, m.bar); R(mx + mw - 4, my - 1, 4, 3, m.bar); }
      else if (st.mood === 'error') { R(mx + 4, my - 1, mw - 8, 3, m.bar); R(mx, my + 2, 4, 3, m.bar); R(mx + mw - 4, my + 2, 4, 3, m.bar); }
      else R(mx, my, mw, 3, m.bar);
      R(mx + 2, my + (st.mood === 'ok' || st.mood === 'love' ? 2 : st.mood === 'error' ? -1 : 0), 6, 1, '#ffffff');
    });
    R(x + 8, y + 84, 10, 3, '#c9d2d8'); text('FLEX', x + W - 24, y + 83, '#9aa6ad');
    // 触摸屏（右上角支架）
    R(x + W - 18, y - 6, 3, 7, '#6d7a86');
    R(x + W - 30, y - 22, 28, 18, '#2b2f36'); R(x + W - 30, y - 22, 28, 1, '#4a5058');
    const blink = st.mood === 'error' && Math.floor(t * 4) % 2;
    R(x + W - 28, y - 20, 24, 14, blink ? '#8a2a2a' : m.scr);
    if (st.mood === 'error') { R(x + W - 17, y - 18, 2, 6, '#ffffff'); R(x + W - 17, y - 10, 2, 2, '#ffffff'); }
    else if (st.mood === 'ok') { line(x + W - 22, y - 13, x + W - 19, y - 10, '#ffffff', 2); line(x + W - 19, y - 10, x + W - 12, y - 17, '#ffffff', 2); }
    else if (st.mood === 'run') { R(x + W - 26, y - 12, 20, 2, '#2b3550'); R(x + W - 26, y - 12, Math.round(((t * 0.4) % 1) * 20), 2, '#ffffff'); R(x + W - 26, y - 17, 12, 2, '#d8ecff'); }
    else if (st.mood === 'love') { ['.#.#.', '#####', '#####', '.###.', '..#..'].forEach((row, j) => [...row].forEach((c, i) => c === '#' && R(x + W - 21 + i * 2, y - 19 + j * 2, 2, 2, '#ffffff'))); }
    else if (st.mood === 'idle') { R(x + W - 26, y - 18, 10, 2, '#d8ecff'); R(x + W - 26, y - 14, 16, 1, '#a8d0f0'); R(x + W - 26, y - 11, 12, 1, '#a8d0f0'); }
    if (opt.glow !== false && st.mood !== 'sleep') alpha(0.12, () => circle(x + W - 16, y - 13, 18, m.scr));
  }
  // Flex 的发光部分（夜里压暗之后再画一次）
  function flexEmissive(x, y, st, t) {
    const m = MOOD[st.mood] || MOOD.idle;
    const blink = st.mood === 'error' && Math.floor(t * 4) % 2;
    R(x + 104 - 28, y - 20, 24, 14, blink ? '#8a2a2a' : m.scr);
    glow(x + 104 - 16, y - 13, 30, m.scr, 0.28);
    const gl = st.mood === 'run' ? 0.55 + Math.sin(t * 8) * 0.45 : 1;
    alpha(gl, () => glow(x + 52, y + 80, 34, m.bar, 0.3));
  }

  function ot2(x, y, t) {
    const W = 64, Hh = 58;
    R(x, y, W, Hh, '#6d7783');
    R(x + 1, y + 1, W - 2, Hh - 2, '#eef1f4'); R(x + 1, y + 1, W - 2, 1, '#ffffff');
    R(x + 4, y + 6, W - 8, 32, '#9fb3bf'); R(x + 5, y + 7, W - 10, 30, '#d9edf2'); fadeV(x + 5, y + 7, W - 10, 12, '#8fb2c2', 0.4, 0);
    R(x + 5, y + 9, W - 10, 3, '#5d6b77');
    R(x + 7, y + 28, W - 14, 7, '#b8c2ca');
    for (let i = 0; i < 3; i++) { R(x + 9 + i * 16, y + 25, 13, 5, ['#f2c14e', '#ffffff', '#7ec8e3'][i]); R(x + 9 + i * 16, y + 29, 13, 1, '#9aa6ad'); }
    const gx = x + 10 + (Math.sin(t * 0.7) * 0.5 + 0.5) * 34;
    R(gx, y + 11, 9, 9, '#3d4852'); R(gx + 3, y + 20, 3, 5, '#e8ecef');
    alpha(0.4, () => { line(x + 8, y + 36, x + 20, y + 9, '#ffffff'); line(x + 12, y + 36, x + 24, y + 9, '#ffffff'); });
    R(x + 1, y + 40, W - 2, Hh - 41, '#2f6fa3'); R(x + 1, y + 40, W - 2, 1, '#5a8fc0');
    text('OT-2', x + W / 2 - 15, y + 45, '#ffffff', 2);
  }

  return { rgba, PAL, dith, dgradV, dgradH, fadeV, fadeH, glow, box, lightBegin, lightAdd, lightApply, build, SP, drawActor, gwenBag, drawCat, sprite, bay, flex, flexEmissive, ot2 };
})();
