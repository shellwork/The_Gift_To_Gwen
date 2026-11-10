// 像素绘图工具 + 角色精灵 + 通用物件
const GFX = (() => {
  let ctx = null;
  const setCtx = (c) => (ctx = c);

  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const P = (x, y, c) => R(x, y, 1, 1, c);
  function line(x0, y0, x1, y1, c, th = 1) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy; const o = Math.floor(th / 2);
    ctx.fillStyle = c;
    for (let n = 0; n < 2000; n++) {
      ctx.fillRect(x0 - o, y0 - o, th, th);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  function circle(cx, cy, r, c) {
    ctx.fillStyle = c;
    for (let y = -r; y <= r; y++) {
      const w = Math.floor(Math.sqrt(r * r - y * y + r * 0.8));
      ctx.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1);
    }
  }
  function ellipse(cx, cy, rx, ry, c) {
    ctx.fillStyle = c;
    for (let y = -ry; y <= ry; y++) {
      const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry + 0.5))));
      ctx.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1);
    }
  }
  function bands(x, y, w, h, colors) {
    const bh = h / colors.length;
    colors.forEach((c, i) => R(x, y + Math.floor(i * bh), w, Math.ceil(bh) + 1, c));
  }
  function alpha(a, fn) { const o = ctx.globalAlpha; ctx.globalAlpha = a; fn(); ctx.globalAlpha = o; }

  // ---------- 3x5 pixel font ----------
  const F = {
    A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
    F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
    K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010',
    P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
    U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010',
    Z: '111001010100111', 0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
    4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111',
    9: '111101111001110', ' ': '000000000000000', '.': '000000000000010', '!': '010010010000010', '#': '101111101111101',
    ':': '000010000010000', '-': '000000111000000', '/': '001001010100100', '%': '101001010100101', '?': '110001010000010',
    '+': '000010111010000', '>': '100010001010100', '<': '001010100010001', '(': '010100100100010', ')': '010001001001010',
    "'": '010010000000000', ',': '000000000010100', '^': '010101000000000', '_': '000000000000111', '*': '000101010101000',
    '=': '000111000111000', '&': '010101010101011', '@': '010101111100011', '[': '110100100100110', ']': '011001001001011',
    '$': '011110010011110', '~': '000011110000000',
  };
  function text(str, x, y, c, s = 1) {
    str = String(str).toUpperCase();
    let cx = x;
    for (const ch of str) {
      const g = F[ch] || (ch === '✓' ? '000001001101010' : F['?']);
      for (let i = 0; i < 15; i++) if (g[i] === '1') R(cx + (i % 3) * s, y + Math.floor(i / 3) * s, s, s, c);
      cx += 4 * s;
    }
    return cx - x;
  }
  const textW = (str, s = 1) => String(str).length * 4 * s - s;

  // ---------- sprites ----------
  function makeSprite(rows, pal) {
    const h = rows.length, w = Math.max(...rows.map((r) => r.length));
    const make = (flip, tint) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d');
      rows.forEach((r, y) => {
        for (let x = 0; x < r.length; x++) {
          const ch = r[x]; if (ch === '.' || ch === ' ') continue;
          g.fillStyle = tint || pal[ch] || '#f0f';
          g.fillRect(flip ? w - 1 - x : x, y, 1, 1);
        }
      });
      return c;
    };
    return { w, h, n: make(false), f: make(true), make };
  }

  const SKIN = '#f7d5bd';
  const gwenBody = [
    '...hhhhhh...',
    '..hhHHHHhh..',
    '.hhhHhhhhhh.',
    '.hhkkkkkkhh.',
    'hhkkkkkkkkhh',
    'hhkekkkkekhh',
    'hhkbkkkkbkhh',
    'hhkkkmmkkkhh',
    'hhhkkkkkkhhh',
    'hHh..kk..hHh',
    'hhhddddddhhh',
    'hHddddddddhh',
    'hkddddddddkh',
    'hkddddddddkT',
    '.kddddddddtt',
    '..ddddddddtT',
    '..ddddddddtt',
    '.dddddddddd.',
    '.DDDDDDDDDD.',
  ];
  const gwenPal = { h: '#7b4a2c', H: '#a0663c', k: SKIN, e: '#3b2626', b: '#f4a3a3', m: '#d0706e', d: '#f6f3ec', D: '#d8d0c2', t: '#c9a27a', T: '#a07a55', s: '#6b4b3e' };
  const meBody = [
    '...pppppp...',
    '..pppPpppp..',
    '.pppppppPpp.',
    '.ppkpkppkpp.',
    '.pkkkkkkkkp.',
    '.kGGGkkGGGk.',
    '.kGeGGGGeGk.',
    '.kGGGkkGGGk.',
    '.kkkkmmkkkk.',
    '..kkkkkkkk..',
    '....kkkk....',
    '..bbbbbbbb..',
    '.bbbbbbbbbb.',
    '.kbbAAAAbbk.',
    '.kbbAYYAbbk.',
    '.kbbbAAbbbk.',
    '..bbbbbbbb..',
    '..aaaaaaaa..',
    '..aaaaaaaa..',
  ];
  const mePal = { p: '#1f1f27', P: '#3a3a48', k: SKIN, G: '#6a7290', e: '#16161e', m: '#c46a6a', b: '#26262e', A: '#f4a6c0', Y: '#ffe08a', a: '#8a8a96', w: '#f2f2f2' };
  const piBody = [
    '...gggggg...',
    '..ggGGgggg..',
    '.gggggggGgg.',
    '.ggkkkkkkgg.',
    'ggkkkkkkkkgg',
    'ggkekkkkekgg',
    'ggkbkkkkbkgg',
    'ggkkmmmmkkgg',
    'gggkkkkkkggg',
    'gg..kkkk..gg',
    '.gnnnwwnnng.',
    '.nnnnwwnnnn.',
    '.nnnnwwnnnn.',
    '.nnnnwwnnnn.',
    '.nnnnnnnnnn.',
    '.knnnnnnnnk.',
    '..aaaaaaaa..',
    '..aaaaaaaa..',
  ];
  const piPal = { g: '#5a3e30', G: '#7a5644', k: SKIN, e: '#2b2238', b: '#f2a8a8', m: '#c46a6a', n: '#3f4f72', w: '#f4f4f4', a: '#3a3a46' };

  const legs = {
    gwen: [['...kk..kk...', '...ss..ss...'], ['..kk....kk..', '..ss....ss..'], ['....kk.kk...', '....ss.ss...']],
    me: [['..aaa..aaa..', '..ww....ww..'], ['.aaa....aaa.', '.ww......ww.'], ['...aa.aa....', '...ww.ww....']],
    pi: [['...a....a...', '...s....s...'], ['..a......a..', '..s......s..'], ['....a..a....', '....s..s....']],
  };
  const SP = {};
  function build() {
    const mk = (key, body, pal) => {
      SP[key] = legs[key].map((l) => makeSprite(body.concat(l), { ...pal, w: pal.w || '#f2f2f2', s: pal.s || '#4a3a3a' }));
    };
    mk('gwen', gwenBody, gwenPal);
    mk('me', meBody, mePal);
    mk('pi', piBody, piPal);
    SP.cat = [makeSprite([
      '..P...P.........',
      '.PPw.wPP........',
      '.wPPPPPw........',
      '.wbPwPbw.......P',
      '.wwPnPww......PP',
      '..wwwwwwwwwwwPP.',
      '..wwWwwwwwwwwww.',
      '..wwWWWwwwwwwww.',
      '..ww.ww...ww.ww.',
    ], { P: '#a08878', w: '#f7f4ee', W: '#e4ddd2', b: '#6aa8e8', n: '#e8a0a8' }), makeSprite([
      '..P...P.........',
      '.PPw.wPP........',
      '.wPPPPPw........',
      '.wPPwPPw........',
      '.wwPnPww........',
      '..wwwwwwwwwwwwPP',
      '..wwWwwwwwwwwwwP',
      '..wwWWWwwwwwwww.',
      '..ww.ww...ww.ww.',
    ], { P: '#a08878', w: '#f7f4ee', W: '#e4ddd2', b: '#6aa8e8', n: '#e8a0a8' })];
  }

  // 画一个角色：x 是中心，y 是脚底
  function drawActor(a) {
    if (!a.visible) return;
    const frames = SP[a.sprite]; if (!frames) return;
    let fi = 0;
    if (a.walking) fi = 1 + (Math.floor(a.anim * 8) % 2);
    const s = frames[fi], sc = a.scale || 1;
    const bob = a.walking && fi === 1 ? -1 : 0;
    const img = a.dir < 0 ? s.f : s.n;
    const x = Math.round(a.x - (s.w * sc) / 2), y = Math.round(a.y - s.h * sc + bob * sc);
    if (a.shadow !== false) alpha(0.18, () => ellipse(a.x, a.y, 6 * sc, 1.5 * sc, '#000'));
    if (a.tint) { if (!s['t' + a.tint]) s['t' + a.tint] = s.make(false, a.tint); ctx.drawImage(s['t' + a.tint], x, y, s.w * sc, s.h * sc); }
    else ctx.drawImage(img, x, y, s.w * sc, s.h * sc);
    if (a.blink && Math.floor(a.anim * 2) % 7 === 0 && a.sprite !== 'cat') { /* tiny blink */ }
  }
  function drawSprite(key, frame, x, y, sc = 1, flip = false) {
    const s = SP[key][frame]; ctx.drawImage(flip ? s.f : s.n, Math.round(x), Math.round(y), s.w * sc, s.h * sc);
  }

  // ---------- 通用物件 ----------
  function flex(x, y, st, t) {
    // st: { mood: 'idle'|'error'|'ok'|'run'|'sleep', gx: 0..1, progress }
    const W = 64, H = 70;
    R(x, y, W, H, '#7f8a94');
    R(x + 1, y + 1, W - 2, H - 2, '#f3f5f7');
    R(x + 1, y + 1, W - 2, 6, '#dfe4e9');
    R(x + 4, y + 9, W - 8, 34, '#9fb3bf');
    R(x + 5, y + 10, W - 10, 32, '#d7eef4');
    // deck
    R(x + 7, y + 34, W - 14, 6, '#b8c2ca');
    const slots = ['#f2c14e', '#7ec8e3', '#e9e9e9', '#f28b82'];
    for (let i = 0; i < 4; i++) R(x + 9 + i * 12, y + 31, 9, 4, slots[i]);
    // gantry
    const gx = x + 8 + (st.gx ?? 0.3) * (W - 24);
    R(x + 5, y + 12, W - 10, 3, '#5d6b77');
    R(gx, y + 14, 7, 7, '#3d4852');
    R(gx + 2, y + 21, 3, 4 + (st.dip || 0), '#cfd6dc');
    P(gx + 3, y + 25 + (st.dip || 0), '#ffffff');
    // glass shine
    alpha(0.5, () => { line(x + 10, y + 40, x + 22, y + 12, '#ffffff'); line(x + 14, y + 40, x + 26, y + 12, '#ffffff'); });
    // front panel
    R(x + 1, y + 44, W - 2, H - 45, '#eef1f4');
    // touchscreen
    const scr = { idle: '#5aa9e6', error: '#e34b4b', ok: '#3fbf6f', run: '#5aa9e6', sleep: '#2b3550' }[st.mood];
    R(x + W - 18, y + 2, 15, 5, '#2b2f36');
    R(x + W - 17, y + 3, 13, 3, st.mood === 'error' && Math.floor(t * 4) % 2 ? '#8a2a2a' : scr);
    // eyes
    const ey = y + 49;
    for (const ex of [x + 20, x + 44]) {
      circle(ex, ey, 4, '#2b2238'); circle(ex, ey, 3, '#ffffff');
      if (st.mood === 'sleep') { R(ex - 3, ey, 7, 1, '#2b2238'); continue; }
      const look = st.mood === 'error' ? Math.sin(t * 9) * 1.2 : Math.sin(t * 0.8) * 1;
      R(ex - 1 + look, ey - 1 + (st.mood === 'ok' ? -1 : 0), 2, 2, '#2b2238');
    }
    // light-bar mouth
    const mc = { idle: '#7cc4ff', error: '#ff4d4d', ok: '#4fe08a', run: '#7cc4ff', sleep: '#5b6a9a' }[st.mood];
    const mx = x + 22, my = y + 59, mw = 20;
    const glow = st.mood === 'run' ? 0.6 + Math.sin(t * 8) * 0.4 : 1;
    alpha(glow, () => {
      if (st.mood === 'ok') { R(mx + 2, my + 1, mw - 4, 2, mc); R(mx, my - 1, 2, 2, mc); R(mx + mw - 2, my - 1, 2, 2, mc); }
      else if (st.mood === 'error') { R(mx + 2, my - 1, mw - 4, 2, mc); R(mx, my + 1, 2, 2, mc); R(mx + mw - 2, my + 1, 2, 2, mc); }
      else R(mx, my, mw, 2, mc);
    });
    // feet/cart
    R(x + 2, y + H, W - 4, 3, '#5d6b77');
    R(x + 4, y + H + 3, 4, 2, '#333'); R(x + W - 8, y + H + 3, 4, 2, '#333');
  }

  function ot2(x, y, t) {
    const W = 40, H = 40;
    R(x, y, W, H, '#6d7783');
    R(x + 1, y + 1, W - 2, H - 2, '#e8ebef');
    R(x + 3, y + 4, W - 6, 22, '#9fb3bf');
    R(x + 4, y + 5, W - 8, 20, '#d9edf2');
    R(x + 6, y + 19, W - 12, 4, '#b8c2ca');
    R(x + 8 + Math.sin(t * 0.7) * 6 + 6, y + 7, 5, 6, '#3d4852');
    R(x + 1, y + 28, W - 2, H - 29, '#2f6fa3');
    text('OT-2', x + 12, y + 31, '#ffffff');
  }

  // 6 自由度机械臂（黑色）
  function arm(bx, by, a, holding) {
    const L = [13, 11, 6];
    R(bx - 6, by - 3, 12, 3, '#2a2a2e'); R(bx - 4, by - 6, 8, 3, '#3a3a40');
    let px = bx, py = by - 6, ang = a[0];
    const pts = [[px, py]];
    for (let i = 0; i < 3; i++) {
      if (i > 0) ang += a[i];
      const nx = px + Math.cos(ang) * L[i], ny = py - Math.sin(ang) * L[i];
      line(px, py, nx, ny, i === 2 ? '#3a3a40' : '#1e1e22', i === 2 ? 2 : 3);
      px = nx; py = ny; pts.push([px, py]);
    }
    pts.slice(0, 3).forEach(([qx, qy]) => { R(qx - 1, qy - 1, 3, 3, '#5a5a66'); P(qx, qy, '#9aa0aa'); });
    // gripper
    const ga = ang + Math.PI / 2;
    const gx1 = px + Math.cos(ga) * 2, gy1 = py - Math.sin(ga) * 2, gx2 = px - Math.cos(ga) * 2, gy2 = py + Math.sin(ga) * 2;
    line(gx1, gy1, gx1 + Math.cos(ang) * 3, gy1 - Math.sin(ang) * 3, '#1e1e22');
    line(gx2, gy2, gx2 + Math.cos(ang) * 3, gy2 - Math.sin(ang) * 3, '#1e1e22');
    if (holding) keys(px + Math.cos(ang) * 3 - 2, py - Math.sin(ang) * 3);
    return [px, py];
  }
  function keys(x, y) { R(x, y, 4, 4, '#c9a640'); R(x + 1, y + 1, 2, 2, '#fff3b0'); R(x + 3, y + 1, 4, 2, '#9aa0aa'); R(x + 6, y + 1, 1, 3, '#9aa0aa'); }

  function bag(x, y) {
    line(x + 2, y, x + 4, y - 4, '#a07a55'); line(x + 8, y, x + 6, y - 4, '#a07a55'); R(x + 4, y - 5, 3, 1, '#a07a55');
    R(x, y, 11, 8, '#c9a27a'); R(x, y + 7, 11, 1, '#a07a55'); R(x + 1, y + 1, 9, 1, '#dcbd98'); R(x + 5, y + 3, 1, 2, '#f4e6d0');
  }

  function suv(x, y, t, moving) {
    // 深色 SUV，侧面，朝右
    R(x + 2, y - 18, 46, 12, '#2c3036');
    R(x + 8, y - 26, 30, 9, '#2c3036');
    R(x + 10, y - 25, 12, 7, '#9cc6dc'); R(x + 24, y - 25, 12, 7, '#9cc6dc');
    alpha(0.6, () => line(x + 12, y - 19, x + 16, y - 24, '#ffffff'));
    R(x + 23, y - 25, 1, 7, '#2c3036');
    R(x, y - 12, 50, 6, '#3a3f47');
    R(x + 46, y - 16, 3, 3, '#ffe9a0'); R(x + 1, y - 16, 2, 3, '#e05050');
    R(x + 26, y - 15, 3, 1, '#9aa0aa');
    for (const wx of [x + 11, x + 39]) {
      circle(wx, y - 4, 5, '#18181c'); circle(wx, y - 4, 2, '#9aa0aa');
      const a = moving ? t * 12 : 0;
      P(Math.round(wx + Math.cos(a) * 3), Math.round(y - 4 + Math.sin(a) * 3), '#5a5a66');
      P(Math.round(wx - Math.cos(a) * 3), Math.round(y - 4 - Math.sin(a) * 3), '#5a5a66');
    }
  }

  // 珍珠蛋糕（x 中心，y 底部）
  function cake(x, y, sc, flames, t, colors) {
    const S = (dx, dy, w, h, c) => R(x + dx * sc, y + dy * sc, w * sc, h * sc, c);
    S(-16, -2, 32, 2, '#e8e2f0'); // plate
    S(-13, -14, 26, 12, '#e8cfa8');
    S(-13, -14, 26, 3, '#f8eedc');
    S(-13, -8, 26, 1, '#f8eedc');
    S(-13, -5, 26, 2, '#cfae84');
    for (let i = -12; i < 13; i += 3) S(i, -12 + (i % 2 ? 1 : 0), 1, 2, '#a0643a');
    for (let i = -12; i < 13; i += 4) S(i, -16, 3, 2, '#fffaf0');
    [[-9, -17], [-4, -18], [2, -17], [7, -18], [-6, -15], [4, -15], [10, -16], [-1, -15]].forEach(([px, py]) => { S(px, py, 2, 2, '#2e1c14'); S(px, py, 1, 1, '#6a4a3a'); });
    const cx = [-10, -5, 0, 5, 10];
    cx.forEach((cxx, i) => {
      S(cxx - 0.5, -23, 1.5, 7, colors ? colors[i] : '#ffffff');
      const f = flames ? flames[i] : 0;
      if (f > 0.02) {
        const fl = Math.sin(t * 14 + i * 1.7) * 0.4;
        const fh = 3.5 * f;
        S(cxx - 0.8 + fl * 0.3, -23 - fh, 1.8, fh, '#ffb347');
        S(cxx - 0.3 + fl * 0.3, -23 - fh * 0.7, 0.8, fh * 0.6, '#fff4c2');
      }
    });
  }

  function pizza(x, y, r) {
    ellipse(x, y, r, Math.round(r * 0.45), '#d99a4e');
    ellipse(x, y, r - 2, Math.round(r * 0.45) - 1, '#f5c84c');
    [[-3, -1], [3, 1], [0, 2], [5, -1], [-5, 1]].forEach(([dx, dy]) => R(x + dx * r / 7, y + dy * r / 9, 2, 1, '#c8423a'));
    line(x - r + 2, y, x + r - 2, y, '#d99a4e');
  }

  return { setCtx, R, P, line, circle, ellipse, bands, alpha, text, textW, build, drawActor, drawSprite, SP, flex, ot2, arm, keys, bag, suv, cake, pizza, get ctx() { return ctx; } };
})();
