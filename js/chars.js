// 高清角色（约 78px 高）：用形状程序化绘制 + 自动描边，按姿势缓存成帧。
// 同一套绘制函数在 s=2 下生成对话头像。
const CHR = (() => {
  const FW = 64, FH = 92, FX = 32, FY = 90; // 帧尺寸；FX 中心；FY 脚底（本地坐标 30,84 对应这里）

  // ---------- 栅格化工具（本地坐标 × s）----------
  function D(g, ox, oy, s) {
    const X = (x) => ox + x * s, Y = (y) => oy + y * s;
    const d = {
      s, g,
      rect(x, y, w, h, c) {
        g.fillStyle = c;
        const x0 = Math.round(X(x)), y0 = Math.round(Y(y)), x1 = Math.round(X(x + w)), y1 = Math.round(Y(y + h));
        g.fillRect(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
      },
      px(x, y, c) { g.fillStyle = c; g.fillRect(Math.round(X(x)), Math.round(Y(y)), 1, 1); },
      ell(cx, cy, rx, ry, c) {
        g.fillStyle = c;
        const CX = X(cx), CY = Y(cy), RX = rx * s, RY = ry * s;
        for (let py = Math.floor(CY - RY); py <= Math.ceil(CY + RY); py++) {
          const dy = py + 0.5 - CY; if (Math.abs(dy) > RY) continue;
          const w = RX * Math.sqrt(1 - (dy * dy) / (RY * RY));
          const xa = Math.round(CX - w), xb = Math.round(CX + w);
          if (xb > xa) g.fillRect(xa, py, xb - xa, 1);
        }
      },
      poly(pts, c) {
        const P = pts.map(([x, y]) => [X(x), Y(y)]);
        let y0 = Infinity, y1 = -Infinity;
        for (const p of P) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
        g.fillStyle = c;
        for (let py = Math.floor(y0); py <= Math.ceil(y1); py++) {
          const y = py + 0.5, xs = [];
          for (let i = 0; i < P.length; i++) {
            const a = P[i], b = P[(i + 1) % P.length];
            if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
          }
          xs.sort((a, b) => a - b);
          for (let i = 0; i + 1 < xs.length; i += 2) { const xa = Math.round(xs[i]), xb = Math.round(xs[i + 1]); if (xb > xa) g.fillRect(xa, py, xb - xa, 1); }
        }
      },
      cap(x0, y0, x1, y1, r, c) {
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * s));
        for (let i = 0; i <= n; i++) { const k = i / n; d.ell(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, r, r, c); }
      },
      line(x0, y0, x1, y1, c) {
        x0 = Math.round(X(x0)); y0 = Math.round(Y(y0)); x1 = Math.round(X(x1)); y1 = Math.round(Y(y1));
        const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
        let err = dx + dy; g.fillStyle = c;
        for (let k = 0; k < 500; k++) {
          g.fillRect(x0, y0, 1, 1);
          if (x0 === x1 && y0 === y1) break;
          const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; }
        }
      },
    };
    return d;
  }

  // 自动描边：透明像素若挨着实体像素，填入该像素颜色的深紫色版本
  function outline(g, w, h) {
    const im = g.getImageData(0, 0, w, h), a = im.data, out = new Uint8ClampedArray(a);
    const N = [[0, -1], [-1, 0], [1, 0], [0, 1]];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4; if (a[i + 3]) continue;
      let best = -1;
      for (const [dx, dy] of N) {
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const j = (yy * w + xx) * 4; if (a[j + 3] > 200) { best = j; if (dy === -1) break; }
      }
      if (best >= 0) { out[i] = a[best] * 0.36 + 12; out[i + 1] = a[best + 1] * 0.3 + 8; out[i + 2] = a[best + 2] * 0.4 + 24; out[i + 3] = 255; }
    }
    im.data.set(out); g.putImageData(im, 0, 0);
  }

  // ---------- 调色板 ----------
  const SKIN = ['#a8665e', '#d4907c', '#efb59c', '#fbd3bc', '#ffe6d6'];
  const SPECS = {
    gwen: {
      hair: 'long', H: ['#3a2020', '#5a3426', '#7b4a2c', '#9a5f36', '#c4884f', '#dca26a'],
      skin: SKIN, top: 'dress', T: ['#a9a3b8', '#cfcad6', '#e8e4e6', '#f7f4ef', '#fffdf9'], sash: '#e6d4bc',
      shoes: ['#5a4038', '#7a5a4c', '#9b7a66', '#bb9a84'], eye: '#2e1f22', iris: '#6e4632', mouth: '#c45f5e', blush: '#f4a8a4',
      legX: [27.5, 33],
    },
    me: {
      hair: 'short', H: ['#0c0c12', '#16161e', '#22222c', '#363644', '#50506a'],
      skin: ['#a8665e', '#d19078', '#ebb497', '#f8cfb4', '#ffe2cf'], top: 'tee', T: ['#101016', '#19191f', '#24242d', '#33333f', '#474758'], print: true,
      bottom: 'pants', B: ['#4c4c5a', '#646474', '#7c7c8c', '#9898a6', '#b2b2be'],
      shoes: ['#9a9aa8', '#c8c8d2', '#ececf0', '#ffffff'], sneaker: true, eye: '#1b1b24', iris: '#3a2c2a', mouth: '#b8645e', glasses: '#3d4258',
      legX: [26.5, 33.5], wide: 1,
    },
    pi: {
      hair: 'bob', H: ['#22140f', '#3a2419', '#5a3e30', '#7a5644', '#9a7058', '#b88a6e'],
      skin: SKIN, top: 'blazer', T: ['#1c2338', '#2a3454', '#3f4f72', '#56698f', '#7286ad'], W: ['#c3bfc8', '#e2dee2', '#f4f2ef', '#ffffff'],
      bottom: 'pants', B: ['#1c1c24', '#26262f', '#33333f', '#45454f', '#5a5a66'],
      shoes: ['#1a1418', '#2a2026', '#3a2e34', '#56464e'], eye: '#2b2238', iris: '#4a3028', mouth: '#c0605e', blush: '#f2aaa4', earring: '#f2c94c',
      legX: [27, 33.5], face: 'smile',
    },
  };
  // Josh：白人男性，微胖，短发
  SPECS.josh = {
    hair: 'crew', H: ['#4a3420', '#6a4c2e', '#8a6640', '#a88254', '#c49e6c'],
    skin: ['#b8766a', '#dc9888', '#f2b8a4', '#fdd2c2', '#ffe8dc'], top: 'tee', T: ['#1e2c48', '#2a3c62', '#3a5282', '#506ca0', '#6c88bc'],
    bottom: 'pants', B: ['#6a5a40', '#86745a', '#a08e70', '#b8a688', '#d0c0a0'],
    shoes: ['#2a1e18', '#3a2a22', '#5a4434', '#7a5e48'], eye: '#2b2238', iris: '#4a6a90', mouth: '#b8645e', badge: true, blush: '#f2a8a0',
    legX: [25.6, 35], wide: 2.6, belly: true,
  };
  // 展会路人：随机组合
  const CROWD_HAIR = [['#1a1414', '#2a2020', '#3a2c28', '#54403a', '#6e5850'], ['#3a2418', '#5a3a26', '#7a5236', '#9a6c4a', '#b88a64'], ['#5a4a3a', '#7a6a50', '#a08c66', '#c4ae80', '#e0cc9a'], ['#2a2a30', '#3a3a44', '#55555f', '#74747e', '#9a9aa4']];
  const CROWD_TOP = [['#2a3a5c', '#3c5280', '#5677b8', '#7d9fd4', '#a9c4e8'], ['#5c2a34', '#80404a', '#a85a62', '#c87a80', '#e0a0a4'], ['#2a4a3a', '#3a6650', '#4f8a6a', '#70ac88', '#9acca8'], ['#4a4a52', '#66666e', '#86868e', '#a6a6ae', '#c6c6cc'], ['#5a4a2a', '#806a3c', '#a88a50', '#c8aa6c', '#e2c88e']];
  for (let i = 0; i < 10; i++) {
    const hs = ['short', 'bob', 'long', 'short', 'bun', 'short', 'bob', 'short', 'bun', 'short'][i];
    SPECS['crowd' + i] = {
      hair: hs, H: CROWD_HAIR[i % 4], skin: [SKIN, ['#7a4a38', '#9a6248', '#b87e5e', '#d49c7a', '#e8b896'], SKIN, ['#8a5a44', '#b07656', '#c99472', '#e2b090', '#f0c8aa']][i % 4],
      top: ['blazer', 'tee', 'shirt', 'tee', 'blazer', 'shirt', 'tee', 'blazer', 'tee', 'tee'][i], T: i >= 8 ? [['#1a4a8a', '#2a5ca8', '#3b6fd1', '#5a8ae0', '#86aaf0'], ['#1a6a3a', '#24844a', '#2f9e5a', '#4ab874', '#7ad098']][i - 8] : CROWD_TOP[i % 5], W: ['#c3bfc8', '#e2dee2', '#f4f2ef', '#ffffff'],
      bottom: i % 3 === 1 ? 'skirt' : 'pants', B: [['#22222c', '#2e2e3a', '#3a3a46', '#4e4e5c', '#62626e'], ['#3a4660', '#4a5878', '#5e6e90', '#7686a8', '#90a0c0'], ['#5a4e44', '#74665a', '#8e8070', '#a89a88', '#c0b4a0']][i % 3],
      shoes: ['#1a1418', '#2a2026', '#3a2e34', '#56464e'], eye: '#2b2238', iris: '#3a2c2a', mouth: '#b8645e', badge: true,
      legX: [27, 33.5], glasses: i % 4 === 3 ? '#4a4a58' : null, wide: hs === 'short' ? 1 : 0,
    };
  }

  // ---------- 绘制一个人 ----------
  function person(d, sp, P) {
    const walk = P.ph != null, ph = walk ? (P.ph / 8) * Math.PI * 2 : 0;
    const sw = walk ? Math.sin(ph) : 0, cw = walk ? Math.cos(ph) : 0;
    const bob = walk && Math.abs(cw) > 0.7 ? -1 : 0;
    const U = bob + (P.breath ? 1 : 0);   // 上半身偏移
    const L = bob;                          // 下半身偏移
    const K = sp.skin, T = sp.T, H = sp.H;
    const wd = sp.wide || 0;
    const tr = P.tr != null ? P.tr : walk ? -1.4 : 0;   // 头发、裙摆向后飘（走路停下后会晚半拍回弹）
    const sit = !!P.sit;

    // 腿的位置
    const stride = walk ? 4.6 : 0;
    const legs = [
      { x: sp.legX[0] - sw * stride, lift: walk ? Math.max(0, -cw) * 2.6 : 0, far: false },
      { x: sp.legX[1] + sw * stride, lift: walk ? Math.max(0, cw) * 2.6 : 0, far: true },
    ];
    // 手臂
    const shN = [21.5 - wd, 38 + U], shF = [38.5 + wd, 38 + U];
    const pose = P.arms || 'down';
    const armGeo = (side, sh) => {
      const swing = side < 0 ? sw * 3 : -sw * 3;
      if (pose === 'up') return { e: [sh[0] + side * 3.5, 30 + U], h: [sh[0] + side * 2, 21 + U] };
      if (pose === 'hold') return { e: [sh[0] + side * 0.5, 46 + U], h: [side < 0 ? 28.5 : 33.5, 46.5 + U] };
      if (pose === 'reach' && side < 0) return { e: [sh[0] + 7, 43 + U], h: [sh[0] + 15, 41 + U] };
      if (pose === 'phone' && side < 0) return { e: [sh[0] + 4, 47 + U], h: [sh[0] + 9, 42 + U] };
      if (pose === 'glasses' && side < 0) return { e: [sh[0] + 4, 33 + U], h: [26, 20.5 + U] };
      if (pose === 'type') return { e: [sh[0] + 5 + side * 0.5, 46 + U], h: [sh[0] + 12 + side, 47 + U + (P.wv % 2 ? -0.8 : 0) * (side < 0 ? 1 : -1)] };
      if (sit && pose === 'down') return { e: [sh[0] + 2 + side * 0.5, 46.5 + U], h: [sh[0] + 8, 55 + U] };
      if (pose === 'wave' && side < 0) return { e: [sh[0] - 4, 34 + U], h: [sh[0] - 3.5 + Math.sin((P.wv || 0) * 3) * 1.5, 25 + U] };
      return { e: [sh[0] + side * 1 + swing * 0.45, 46.5 + U], h: [sh[0] + side * 0.4 + swing, 54.5 + U] };
    };
    const drawArm = (side, far) => {
      const sh = side < 0 ? shN : shF, gm = armGeo(side, sh);
      const kk = far ? K[2] : K[3];
      const longSleeve = sp.top === 'blazer' || sp.top === 'shirt';
      const sc = sp.top === 'shirt' ? sp.W : T;
      const sleeveC = far ? sc[1] : sc[2];
      const inFront = !far && (pose === 'reach' || pose === 'hold');
      if (inFront) { d.cap(sh[0], sh[1] + 1, gm.e[0], gm.e[1], 2.6, T[0]); d.cap(gm.e[0], gm.e[1], gm.h[0], gm.h[1], 2.4, T[0]); }
      d.cap(sh[0], sh[1] + 1, gm.e[0], gm.e[1], 1.9, longSleeve ? sleeveC : kk);
      d.cap(gm.e[0], gm.e[1], gm.h[0], gm.h[1], 1.7, longSleeve ? sleeveC : kk);
      if (longSleeve) { const k = 0.78; d.cap(gm.e[0] + (gm.h[0] - gm.e[0]) * k, gm.e[1] + (gm.h[1] - gm.e[1]) * k, gm.h[0], gm.h[1], 1.6, kk); }
      d.ell(gm.h[0], gm.h[1] + 0.5, 2.1, 2.2, kk);
      if (!far) d.px(gm.h[0] - 1, gm.h[1] - 0.5, K[4]);
      if (!far && pose === 'phone') { d.rect(gm.h[0] - 1.4, gm.h[1] - 5, 3.4, 5.4, '#2b2238'); d.rect(gm.h[0] - 0.8, gm.h[1] - 4.4, 2.2, 3.6, '#7cc4ff'); }
    };

    // 1. 后面的头发
    if (sp.hair === 'long') {
      const pts = [];
      for (let y = 18; y <= 54; y += 2) { const k = (y - 18) / 36; pts.push([17.4 - Math.sin(y * 0.55) * 1.1 - k * 0.9 + tr * k, y + U * (1 - k)]); }
      for (let i = 0; i <= 8; i++) { const x = 18.5 + i * 3; pts.push([x + tr, 54.5 + (i % 2 ? 2 : 0) + (walk ? Math.sin(ph * 2 + i) * 0.6 : 0)]); }
      for (let y = 54; y >= 18; y -= 2) { const k = (y - 18) / 36; pts.push([43 + Math.sin(y * 0.55 + 1) * 1.1 + k * 0.9 + tr * k, y + U * (1 - k)]); }
      for (let a = 0; a <= 12; a++) { const an = (a / 12) * Math.PI; pts.push([30.2 + Math.cos(an) * 12.8, 19 + U - Math.sin(an) * 13]); }
      d.poly(pts, H[2]);
      d.ell(30.5, 40 + U, 9.5, 13, H[1]);
      // 卷发的发丝和高光
      for (const sx of [19.6, 40.8]) {
        for (let y = 24; y < 53; y++) { const k = (y - 18) / 36; d.px(sx + Math.sin(y * 0.5 + sx) * 1.2 + (sx < 30 ? -k : k) * 0.8 + tr * k, y + U * (1 - k), H[1]); }
        for (const cy of [30, 38, 46]) { const k = (cy - 18) / 36; const bx = sx + (sx < 30 ? -1.6 : 1.6) - Math.sin(cy * 0.5) * 0.8 + tr * k; d.px(bx, cy + U * (1 - k), H[3]); d.px(bx + (sx < 30 ? 1 : -1), cy + 1 + U * (1 - k), H[4]); }
      }
    } else if (sp.hair === 'bob') {
      d.poly([[17.6, 18 + U], [17.2, 28 + U], [18, 35 + U], [21, 37 + U], [39.6, 37 + U], [42.6, 35 + U], [43.4, 28 + U], [43, 18 + U], [30.3, 6 + U]], H[2]);
      d.ell(30.3, 19 + U, 12.8, 13, H[2]);
      d.ell(30.5, 33 + U, 8.5, 5, H[1]);
    } else if (sp.hair === 'bun') {
      d.ell(36, 8 + U, 5, 4.5, H[2]); d.px(34.5, 6.5 + U, H[3]);
    }

    // 2. 远侧手臂
    drawArm(1, true);

    // 3. 腿和鞋
    const S = sp.shoes;
    const hem = sp.top === 'dress' ? 75 : null;
    for (const lg of legs.slice().reverse()) {
      if (sit) {
        // 坐着：大腿往前平伸，小腿垂下来
        const hx = lg.far ? 33.6 + wd * 0.6 : 27 - wd * 0.6, kx = hx + 13, fy = 74, c = sp.bottom === 'pants' ? (lg.far ? sp.B[1] : sp.B[2]) : (lg.far ? K[2] : K[3]);
        if (sp.bottom === 'pants') { d.cap(hx, 59 + L, kx, 61 + L, 3.4, c); d.cap(kx, 61 + L, kx, fy - 4, 2.8, c); d.rect(kx - 2.6, fy - 5.5, 5.4, 2, lg.far ? sp.B[0] : sp.B[1]); }
        else d.cap(kx, 64, kx, fy - 3, 1.5, c);
        const x = kx;
        if (sp.sneaker) { d.poly([[x - 3, fy - 3.6], [x + 2, fy - 3.6], [x + 4.6, fy - 1.6], [x + 4.6, fy], [x - 3, fy]], lg.far ? S[1] : S[2]); d.rect(x - 3, fy - 1, 7.6, 1, S[0]); }
        else { d.poly([[x - 2.4, fy - 2.6], [x + 1.8, fy - 2.6], [x + 4, fy - 1.2], [x + 4, fy], [x - 2.4, fy]], lg.far ? S[1] : S[2]); }
        continue;
      }
      const fy = 84 + L - lg.lift, x = lg.x;
      if (sp.bottom === 'pants') {
        const B = sp.B, c = lg.far ? B[1] : B[2];
        const hx = lg.far ? 33.6 + wd * 0.6 : 27 - wd * 0.6;
        d.poly([[hx - 3.6, 56 + L], [hx + 3.6, 56 + L], [x + 2.9, fy - 4.5], [x - 2.7, fy - 4.5]], c);
        if (!lg.far) d.line(hx + 2.2, 58 + L, x + 1.6, fy - 6, B[1]);
        d.rect(x - 2.6, fy - 5.5, 5.4, 2, lg.far ? B[0] : B[1]);
      } else {
        const top = (hem || 66) - 2;
        d.cap(x, top + L, x, fy - 3, 1.5, lg.far ? K[2] : K[3]);
      }
      if (sp.sneaker) {
        d.poly([[x - 3, fy - 3.6], [x + 2, fy - 3.6], [x + 4.6, fy - 1.6], [x + 4.6, fy], [x - 3, fy]], lg.far ? S[1] : S[2]);
        d.rect(x - 3, fy - 1, 7.6, 1, S[0]); d.px(x, fy - 2.4, '#5677b8');
      } else {
        d.poly([[x - 2.4, fy - 2.6], [x + 1.8, fy - 2.6], [x + 4, fy - 1.2], [x + 4, fy], [x - 2.4, fy]], lg.far ? S[1] : S[2]);
        d.px(x + 1, fy - 2, S[3]);
      }
    }

    // 4. 下装 + 上身
    if (sp.bottom === 'skirt') {
      const B = sp.B;
      d.poly([[22.5, 55 + L], [38.5, 55 + L], [41 + tr * 0.5, 68 + L], [20 + tr * 0.5, 68 + L]], B[2]);
      d.poly([[34, 55 + L], [38.5, 55 + L], [41 + tr * 0.5, 68 + L], [36 + tr * 0.5, 68 + L]], B[1]);
    }
    if (sp.top === 'dress') {
      // 裙摆
      const hs = tr * 0.8, hw = walk ? Math.sin(ph * 2) * 0.6 : 0;
      if (sit) {
        // 坐着：裙子搭在腿上，垂到小腿
        d.poly([[23.4, 47.5 + U * 0.5], [36.8, 47.5 + U * 0.5], [47, 57], [51, 62], [50.6, 70], [42, 71.4], [26, 71.4], [21, 62]], T[3]);
        d.poly([[33.6, 47.5 + U * 0.5], [36.8, 47.5 + U * 0.5], [47, 57], [51, 62], [50.6, 70], [44, 70]], T[2]);
        d.line(28, 50 + U, 40, 60, T[2]); d.line(26, 60, 24, 70, T[2]); d.line(44, 62, 46, 70, T[1]);
        for (let x = 22; x < 50; x += 2) d.px(x, 70.6, T[2]);
      } else {
      const sk = [[23.4, 47.5 + U * 0.5], [36.8, 47.5 + U * 0.5], [44 + hs + hw, 75 + L]];
      for (let i = 0; i <= 14; i++) sk.push([44 + hs - i * 2 + hw * (1 - i / 14), 75 + L + ((i % 2) ? 0.9 : 0)]);
      d.poly(sk, T[3]);
      d.poly([[33.6, 47.5 + U * 0.5], [36.8, 47.5 + U * 0.5], [44 + hs + hw, 75 + L], [38.4 + hs, 75 + L]], T[2]);
      d.line(28, 49 + U, 24.5 + hs, 73 + L, T[2]); d.line(31.4, 49 + U, 31.6 + hs, 74 + L, T[2]); d.line(34.2, 49 + U, 38 + hs, 74 + L, T[1]);
      d.line(24.6, 49 + U, 18.6 + hs, 73 + L, T[4]);
      for (let x = 17.5; x < 43; x += 2) d.px(x + hs, 72.6 + L, T[2]);
      }
      // 上身
      d.poly([[21.6, 35.6 + U], [38.6, 35.6 + U], [36.8, 47.6 + U * 0.5], [23.4, 47.6 + U * 0.5]], T[3]);
      d.poly([[34.6, 36 + U], [38.6, 35.6 + U], [36.8, 47.6 + U * 0.5], [34, 47.6 + U * 0.5]], T[2]);
      d.ell(21.6, 38.4 + U, 3.7, 3.3, T[3]); d.ell(39, 38.4 + U, 3.7, 3.3, T[2]); d.px(20.6, 36.4 + U, T[4]); d.px(21.6, 36.2 + U, T[4]);
      d.rect(23.4, 46 + U * 0.5, 13.4, 2, sp.sash); d.rect(23.4, 46 + U * 0.5, 13.4, 1, '#f4e6d4');
      d.ell(24.6, 47.6 + U * 0.5, 1.6, 1.2, sp.sash); d.px(24.6, 49 + U * 0.5, '#d4bea0');
      d.ell(30.6, 35.4 + U, 3.4, 1.8, K[3]); d.rect(27.2, 35.4 + U, 6.8, 0.6, K[2]);
    } else {
      const top = sp.top, base = sp.top === 'shirt' ? sp.W : T, b = 2;
      const c0 = top === 'shirt' ? base[2] : T[b];
      const w0 = 19.6 - wd, w1 = 40.6 + wd;
      d.poly([[w0, 35.6 + U], [w1, 35.6 + U], [w1 - 0.6, 57 + L], [w0 + 0.6, 57 + L]], c0);
      d.poly([[w1 - 4, 36 + U], [w1, 35.6 + U], [w1 - 0.6, 57 + L], [w1 - 4.6, 57 + L]], top === 'shirt' ? base[1] : T[b - 1]);
      d.ell(w0 + 0.4, 39 + U, 4.2, 4, c0); d.ell(w1 - 0.4, 39 + U, 4.2, 4, top === 'shirt' ? base[1] : T[b - 1]);
      d.rect(w0 - 2, 36.4 + U, 4, 0.6, top === 'shirt' ? base[3] : T[b + 1]);
      if (top === 'tee') {
        d.ell(30.6, 35.6 + U, 3.4, 1.8, K[3]); d.rect(27.2, 36.6 + U, 6.8, 0.6, T[b + 1]);
        d.rect(w0 + 0.6, 55.6 + L, w1 - w0 - 1.2, 1.4, T[b - 1]);
        if (sp.print) {
          // 胸前的动漫小人
          const px = 30.6, py = 45 + U;
          d.ell(px, py, 4.8, 4.6, '#f4a6c0'); d.ell(px - 1, py - 1.6, 3, 2, '#ffc4d8');
          d.ell(px, py + 1.4, 3.2, 2.8, '#ffe6d4');
          d.rect(px - 2, py + 0.6, 1, 1.4, '#3c6ad0'); d.rect(px + 1, py + 0.6, 1, 1.4, '#3c6ad0');
          d.rect(px - 0.5, py + 3, 1.2, 0.6, '#e06a7a');
          d.rect(px - 4.4, py - 4.6, 2, 2, '#ffe08a'); d.rect(px + 3, py + 3.6, 1.6, 1.6, '#8fd0e8');
        }
      } else if (top === 'blazer') {
        const Wc = sp.W;
        d.poly([[27.2, 35.6 + U], [34, 35.6 + U], [30.6, 46 + U]], Wc[2]);
        d.poly([[28.4, 35.6 + U], [32.8, 35.6 + U], [30.6, 39 + U]], K[3]);
        d.line(27, 36 + U, 30.4, 46.6 + U, T[0]); d.line(34.2, 36 + U, 30.8, 46.6 + U, T[0]);
        d.line(26, 37 + U, 28.6, 41 + U, T[3]);
        d.px(30.6, 49 + U, '#f2c94c'); d.px(30.6, 53 + L, '#f2c94c');
        d.rect(w0 + 0.6, 56 + L, w1 - w0 - 1.2, 1, T[0]);
      } else if (top === 'shirt') {
        d.poly([[28, 35.6 + U], [33.2, 35.6 + U], [30.6, 38.6 + U]], K[3]);
        d.line(30.6, 39 + U, 30.6, 56 + L, base[1]);
        for (let y = 42; y < 56; y += 4) d.px(31.4, y + U, base[1]);
      }
      if (sp.belly) {
        d.ell(30.6, 50.5 + (U + L) / 2, 13.6, 7.8, c0); d.ell(35, 51 + (U + L) / 2, 9, 6.6, T[b - 1]); d.ell(29.6, 50 + (U + L) / 2, 9.4, 5.6, c0);
        d.px(25, 47 + U, T[b + 1]); d.px(26, 46.4 + U, T[b + 1]);
      }
      if (sp.bottom === 'pants') d.rect(w0 + 1, 56.4 + L, w1 - w0 - 2, 1, sp.B[0]);
    }

    // 包（单肩手提包，挂在近侧肩上）
    if (P.bag) {
      const bx = 11.8 - sw * 0.7, by = 45 + U;
      d.line(20.4, 35.4 + U, bx + 2.6, by + 0.4, '#8a6446'); d.line(23.6, 35.8 + U, bx + 7.4, by + 0.4, '#8a6446');
      d.line(21.4, 35.4 + U, bx + 3.4, by + 0.4, '#a07a55');
      d.poly([[bx + 0.8, by], [bx + 9.4, by], [bx + 10.8, by + 10], [bx - 0.6, by + 10]], '#c9a27a');
      d.poly([[bx + 7, by], [bx + 9.4, by], [bx + 10.8, by + 10], [bx + 8, by + 10]], '#b08a62');
      d.rect(bx + 0.8, by, 8.6, 2.2, '#e0c29a'); d.rect(bx - 0.6, by + 9, 11.4, 1, '#a07a55');
      d.rect(bx + 4, by + 2.2, 1.8, 2, '#f4e6d0'); d.px(bx + 1.4, by + 3, '#e8d0ac');
    }
    // 胸牌
    if (sp.badge || P.badge) {
      d.line(27.8, 36 + U, 29.6, 45 + U, '#3b6fd1'); d.line(33.4, 36 + U, 31.6, 45 + U, '#3b6fd1');
      d.rect(28.4, 45 + U, 4.6, 5.6, '#ffffff'); d.rect(28.4, 45 + U, 4.6, 1.6, '#2f5f8a'); d.rect(29.2, 47.8 + U, 3, 0.6, '#9aa6ad');
    }

    // 5. 近侧手臂
    drawArm(-1, false);

    // 6. 脖子 + 脸
    d.rect(28.6, 29.5 + U, 4, 6.5, K[2]); d.rect(28.6, 33.5 + U, 4, 1, K[1]);
    d.ell(31, 23 + U, 9.2, 9.6, K[2]);
    d.ell(30.4, 22.6 + U, 8.7, 9.1, K[3]);
    if (sp.belly) { d.ell(31, 26.4 + U, 9.8, 6.4, K[2]); d.ell(30.6, 25.8 + U, 9.4, 6, K[3]); d.line(27, 32 + U, 34.6, 32 + U, K[2]); }
    d.px(24.6, 19.6 + U, K[4]); d.px(25.6, 18.6 + U, K[4]);
    if (sp.hair === 'short' || sp.hair === 'crew' || sp.hair === 'bun') { d.ell(21.6, 24.6 + U, 1.7, 2.5, K[2]); d.px(21.4, 24.4 + U, K[1]); }

    // 7. 前面的头发
    if (sp.hair === 'long') {
      d.poly([[19, 20 + U], [19.4, 13 + U], [23, 9.4 + U], [30, 7.6 + U], [37, 9.4 + U], [41.2, 13 + U], [41.6, 20 + U],
        [39.6, 17 + U], [37.6, 18.6 + U], [35.4, 15.4 + U], [33, 17.4 + U], [30.6, 14.4 + U], [28, 16.6 + U], [25.6, 14 + U], [23, 17.2 + U], [21, 15.6 + U]], H[2]);
      d.poly([[22, 12 + U], [26, 9.8 + U], [32, 9.2 + U], [36.4, 10.4 + U], [34.4, 11.6 + U], [30, 11 + U], [25.4, 12.4 + U], [22.6, 13.6 + U]], H[3]);
      d.px(27, 10 + U, H[4]); d.px(28, 10 + U, H[4]); d.px(33, 9.6 + U, H[4]);
      d.line(30.6, 9 + U, 28.2, 15.6 + U, H[1]); d.line(35.2, 10 + U, 35.4, 15 + U, H[1]);
      // 两侧的卷发
      const lock = (side) => {
        const o = side < 0 ? 0 : 1, xs = side < 0 ? [19, 22.2, 21.6, 22.6, 20.4, 17.8, 17.4] : [41.6, 38.6, 39.2, 38.2, 40.4, 43, 43.4];
        d.poly([[xs[0], 15 + U], [xs[1], 17 + U], [xs[2], 26 + U], [xs[3], 32 + U], [xs[4], 39 + U + tr * 0.2], [xs[5], 34 + U], [xs[6], 26 + U]], H[2 + o * 0]);
        const sx = side < 0 ? 20.4 : 40.2;
        for (let y = 18; y < 37; y++) d.px(sx + Math.sin(y * 0.6) * 0.8, y + U, side < 0 ? H[3] : H[1]);
      };
      lock(-1); lock(1);
    } else if (sp.hair === 'short' || sp.hair === 'crew') {
      d.poly([[19.4, 25 + U], [18.8, 17 + U], [20.2, 11 + U], [24, 7 + U], [30.4, 5.4 + U], [36.4, 7 + U], [40.4, 10.6 + U], [42.2, 16 + U], [42, 22 + U],
        [40.4, 20.4 + U], [39.6, 16.4 + U], [37.2, 15 + U], [34.2, 16.2 + U], [31.4, 14 + U], [28.4, 16.6 + U], [25.4, 15 + U], [22.8, 17.4 + U], [21.8, 21.6 + U], [21.4, 25 + U]], H[2]);
      if (sp.hair === 'short') {
      d.poly([[23, 8 + U], [22.4, 5 + U], [27, 6.4 + U]], H[2]); d.poly([[29.4, 6 + U], [31.6, 4 + U], [34.4, 6.4 + U]], H[2]); d.poly([[36.4, 7.6 + U], [39.4, 6.6 + U], [39.6, 9.6 + U]], H[2]); d.poly([[40.4, 11 + U], [43.2, 13.6 + U], [41.8, 15.6 + U]], H[2]);
      }
      d.poly([[24, 9 + U], [29, 7.2 + U], [34.4, 8 + U], [32, 9.4 + U], [27, 9.6 + U]], H[3]);
      d.px(27, 8 + U, H[4]); d.px(30.4, 7.4 + U, H[4]);
      d.line(26, 10 + U, 24.4, 15 + U, H[1]); d.line(33, 10 + U, 33.8, 15 + U, H[1]);
    } else if (sp.hair === 'bob' || sp.hair === 'bun') {
      d.poly([[18.6, 22 + U], [19, 14 + U], [22.4, 9.4 + U], [30, 7.4 + U], [37.6, 9.4 + U], [41.6, 14 + U], [42, 22 + U],
        [40.4, 19 + U], [38.6, 14.6 + U], [34, 13.4 + U], [28, 15.6 + U], [23.4, 17.4 + U], [21.2, 20.6 + U]], H[2]);
      if (sp.hair === 'bob') {
        d.poly([[18.6, 20 + U], [21.2, 20 + U], [21.4, 30 + U], [22.6, 35 + U], [19.4, 36 + U], [17.6, 30 + U]], H[2]);
        d.poly([[42, 20 + U], [39.6, 20 + U], [39.6, 30 + U], [38.6, 35 + U], [41.8, 36 + U], [43.4, 30 + U]], H[1]);
      }
      d.poly([[22.6, 11.6 + U], [28, 9.2 + U], [34, 9.4 + U], [31, 10.8 + U], [25, 12.6 + U]], H[3]);
      d.px(27, 9.8 + U, H[4]);
    }

    // 8. 五官
    features(d, sp, P, U);
    if (sp.earring) d.px(21.4, 28 + U, sp.earring);
    // 推眼镜：手要画在脸前面
    if (pose === 'glasses') drawArm(-1, false);
  }

  function features(d, sp, P, U) {
    const s = d.s, e = sp.eye, ir = sp.iris, m = sp.mouth, K = sp.skin;
    const f = P.blink ? 'blink' : (P.face && P.face !== 'normal' ? P.face : (sp.face || 'normal'));
    const y = 22 + U;
    const eyes = [[27, -1], [35, 1]]; // 左眼起始列、外眼角方向
    const fine = s >= 2;
    for (const [x, side] of eyes) {
      const wing = side < 0 ? x - 1 : x + 2;
      if (f === 'blink') { d.rect(x - (side < 0 ? 1 : 0), y + 1.4, 3, 0.8, e); continue; }
      if (f === 'happy' || f === 'smile') { d.rect(x, y, 2, 1, e); d.px(x - 0.6, y + 1, e); d.px(x + 2.2, y + 1, e); if (fine) { d.px(x - 0.6, y + 1.5, e); d.px(x + 2.2, y + 1.5, e); } continue; }
      if (f === 'meh') { d.rect(wing < x ? x - 1 : x, y + 1, 3, 1, e); d.rect(x, y + 2, 2, 1, ir); continue; }
      if (f === 'surprised') { d.rect(x, y - 0.6, 2, 3.4, e); d.px(x, y - 0.4, '#ffffff'); if (fine) d.px(x + 0.5, y - 0.4, '#ffffff'); continue; }
      // normal
      d.rect(x, y, 2, 1, e); if (!sp.glasses) { d.px(wing, y, e); if (fine) d.px(wing, y + 0.5, e); }
      d.rect(x, y + 1, 2, 2, ir); d.rect(x + 1, y + 1, 1, 1, e);
      d.px(x, y + 1, '#ffffff');
      if (fine) { d.px(x + 0.5, y + 1, '#ffffff'); d.px(x + 1.5, y + 2.5, '#c9a08a'); d.rect(x, y + 1, 2, 0.5, e); d.px(x, y + 1.5, '#ffffff'); }
    }
    // 眉毛（表情）
    if (f === 'surprised') { d.rect(26.6, y - 3.4, 2.6, 0.8, sp.H[1]); d.rect(34.8, y - 3.4, 2.6, 0.8, sp.H[1]); }
    if (f === 'meh') { d.line(26.6, y - 2.4, 29, y - 2, sp.H[1]); d.line(34.4, y - 2, 36.8, y - 2.4, sp.H[1]); }
    // 腮红
    if (sp.blush) { d.rect(25, y + 4, 2.6, 1, sp.blush); d.rect(36, y + 4, 2.6, 1, sp.blush); if (fine) { d.rect(25.5, y + 3.5, 1.6, 0.5, sp.blush); d.rect(36.5, y + 3.5, 1.6, 0.5, sp.blush); } }
    // 鼻子
    d.px(32.2, y + 3.6, K[2]);
    // 嘴
    const my = 28 + U;
    if (P.talk && f !== 'surprised') { d.rect(30.6, my - 0.2, 3, 2, m); d.rect(31.2, my + 0.6, 1.8, 1, '#8a3a40'); if (fine) d.px(31.6, my + 1.2, '#e88a86'); }
    else if (f === 'happy') { d.rect(30, my, 4, 1, m); d.rect(30.8, my + 1, 2.4, 0.8, '#ef8c8c'); }
    else if (f === 'smile') { d.px(30, my, m); d.rect(31, my + 0.6, 2, 0.8, m); d.px(33, my, m); }
    else if (f === 'surprised') { d.rect(31, my, 2, 2, m); if (fine) d.rect(31.5, my + 0.5, 1, 1, '#7a3036'); }
    else if (f === 'meh') d.rect(30.6, my + 0.4, 3, 0.8, m);
    else { d.rect(31, my, 2, 1, m); if (fine) d.px(31.5, my + 0.5, '#e88a86'); }
    // 眼镜
    if (sp.glasses) {
      const g = sp.glasses;
      for (const x0 of [25.4, 33.4]) {
        d.rect(x0, y - 1, 5.6, 0.8, g); d.rect(x0, y + 3.2, 5.6, 0.8, g); d.rect(x0, y - 1, 0.8, 5, g); d.rect(x0 + 4.8, y - 1, 0.8, 5, g);
        d.px(x0 + 1.2, y, '#ffffff'); if (fine) d.px(x0 + 1.7, y, '#dfe8ff');
      }
      d.rect(31, y, 2.4, 0.8, g); d.rect(21.6, y + 0.2, 3.8, 0.8, g);
    }
  }

  // ---------- 缓存 ----------
  const cache = new Map();
  function frame(key, P, s = 1) {
    const sp = SPECS[key] || SPECS.gwen;
    const ck = `${key}|${s}|${P.ph}|${P.breath ? 1 : 0}|${P.blink ? 1 : 0}|${P.face || ''}|${P.arms || ''}|${P.bag ? 1 : 0}|${P.badge ? 1 : 0}|${P.wv || 0}|${P.tr ?? ''}|${P.talk ? 1 : 0}|${P.sit ? 1 : 0}`;
    let fr = cache.get(ck);
    if (fr) return fr;
    const w = Math.ceil(FW * s), h = Math.ceil(FH * s);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    person(D(g, (FX - 30) * s, (FY - 84) * s, s), sp, P);
    outline(g, w, h);
    const f = document.createElement('canvas'); f.width = w; f.height = h;
    const fg = f.getContext('2d'); fg.translate(w, 0); fg.scale(-1, 1); fg.drawImage(c, 0, 0);
    fr = { n: c, f, w, h, fx: FX * s, fy: FY * s };
    cache.set(ck, fr);
    return fr;
  }

  // a: { sprite, x, y(脚底), dir, walking, anim, seed, face, pose, bag, badge, scale, hop, sit }
  const WHO = { gwen: 'Gwen', me: 'Baiding', pi: 'Bex', josh: 'Josh' };
  function drawActor(a, t) {
    const s = a.scale || 1;
    const walk = a.walking;
    const dt = Math.min(0.05, Math.max(0, t - (a._t ?? t))); a._t = t;
    // 头发和裙摆：走路时往后飘，停下后用弹簧晚半拍回弹
    const want = walk ? -1.5 : 0;
    a._trv = ((a._trv || 0) + (want - (a._tr || 0)) * 90 * dt) * Math.pow(0.0008, dt);
    a._tr = (a._tr || 0) + a._trv * dt;
    const trq = Math.round(a._tr * 2.5) / 2.5;
    // 说话：正在说话的人嘴巴一张一合，每句开头点一下头
    const talking = G.speaker && WHO[a.sprite] === G.speaker;
    if (talking && G.lineId !== a._line) { a._line = G.lineId; a._nodT = t; }
    const mouth = talking && G.typing && Math.floor(t * 9) % 2 === 0;
    const P = {
      ph: walk ? Math.floor((a.walkDist != null ? a.walkDist : a.anim * (a.speed || 60)) / 7.5) % 8 : null,
      breath: !walk && Math.sin(a.anim * 2.2 + (a.seed || 0) * 7) > 0.25,
      blink: !walk && !a.face && !mouth && (Math.floor((a.anim + (a.seed || 0) * 3) * 10) % 41) === 0,
      face: a.face, arms: a.pose || a._idlePose, bag: a.bag, badge: a.badge, wv: (a.pose || a._idlePose) === 'wave' || a.pose === 'type' ? Math.floor(a.anim * 6) % 4 : 0,
      tr: trq === (walk ? -1.4 : 0) ? null : trq, talk: mouth, sit: a.sit,
    };
    // 表情变化时自动冒情绪气泡
    if (a.face !== a._lf) { const f = a.face; a._lf = f; if (f === 'surprised') emote(a, '!'); else if (f === 'meh') emote(a, '…'); else if (f === 'happy' && G.dialogOpen && G.dialogOpen()) emote(a, '♪'); }
    const fr = frame(a.sprite, P, s);
    const ctx = GFX.ctx;
    const hop = a.hop || 0;
    // 跳起：上升时拉长，落地时压扁一下
    if (hop === 0 && (a._lh || 0) > 2) a._land = t;
    const rising = hop > (a._lh || 0) + 0.01; a._lh = hop;
    // 落地时整个人往下沉 1 像素（不缩放，避免把像素拉坏）
    const land = a._land && t - a._land < 0.1 ? Math.max(1, Math.round(s)) : 0;
    a._ld = a.dir;
    const nod = a._nodT && t - a._nodT < 0.22 ? (t - a._nodT < 0.11 ? 1 : 0) * Math.max(1, Math.round(s)) : 0;
    const sitDy = a.sit ? Math.round(10 * s) : 0;
    if (a.shadow !== false) GFX.alpha(0.22 * (1 - Math.min(0.6, hop / 30)), () => GFX.ellipse(Math.round(a.x + (a.sit ? a.dir * 6 * s : 0)), Math.round(a.y), Math.round(12 * s), Math.max(2, Math.round(2.5 * s)), '#3a2a4a'));
    // 坐着时，身下画一把带轮子的椅子（靠背在身后）
    if (a.sit && a.chair !== false) {
      const R = GFX.R, d = a.dir, sy0 = Math.round(a.y - 21 * s), bx = Math.round(a.x - d * 17 * s), cx = Math.round(a.x - d * 2 * s);
      // 靠背：从身后露出来
      R(bx - 3 * s, sy0 - 34 * s, 7 * s, 30 * s, '#2a2a34'); R(bx - 3 * s, sy0 - 34 * s, 7 * s, 2 * s, '#5a5a6a'); R(bx + (d < 0 ? 3 : -3) * s, sy0 - 32 * s, 1 * s, 26 * s, '#3a3a46');
      R(Math.min(bx, a.x - d * 10 * s), sy0 - 6 * s, Math.abs(bx - (a.x - d * 10 * s)) + 2 * s, 4 * s, '#2a2a34');
      // 坐垫
      R(cx - 15 * s, sy0, 30 * s, 5 * s, '#2a2a34'); R(cx - 15 * s, sy0, 30 * s, 1 * s, '#5a5a6a');
      // 气压杆 + 五爪脚 + 轮子
      R(cx - 1 * s, sy0 + 5 * s, 3 * s, Math.round(a.y - sy0 - 8 * s), '#6a6a76');
      R(cx - 15 * s, a.y - 4 * s, 31 * s, 2 * s, '#30303a');
      for (const wx of [-14, 0, 15]) GFX.circle(cx + wx * s, a.y - 1 * s, 1.8 * s, '#1c1c24');
    }
    const x = Math.round(a.x - (a.dir < 0 ? fr.w - fr.fx : fr.fx)), y = Math.round(a.y - fr.fy - hop) + nod + sitDy + land;
    const img = a.dir < 0 ? fr.f : fr.n;
    const o = ctx.globalAlpha;
    if (a.alpha !== undefined) ctx.globalAlpha = o * a.alpha;
    ctx.drawImage(img, x, y);
    ctx.globalAlpha = o;
    drawEmote(a, t, s, hop - sitDy);
  }

  // ---------- 情绪气泡 ----------
  const ICONS = {
    '!': ['..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
    '?': ['.###.', '#...#', '...#.', '..#..', '.....', '..#..'],
    '♪': ['..###', '..#.#', '..#..', '..#..', '###..', '##...'],
    '…': ['.....', '.....', '.....', '.....', '.....', '#.#.#'],
    '♥': ['.....', '##.##', '#####', '#####', '.###.', '..#..'],
    'drop': ['..#..', '.###.', '.###.', '#####', '#####', '.###.'],
  };
  const ICON_C = { '!': '#e34b4b', '?': '#3b6fd1', '♪': '#d0407a', '…': '#5a4a6a', '♥': '#ff5a8a', drop: '#5aa9e6' };
  function emote(a, kind, dur = 1.4) { a._emo = { kind, t0: G.t, dur }; }
  function drawEmote(a, t, s, hop) {
    const e = a._emo; if (!e) return;
    const k = t - e.t0; if (k > e.dur) { a._emo = null; return; }
    const pop = k < 0.12 ? 0.6 + (k / 0.12) * 0.4 : 1, fade = k > e.dur - 0.25 ? (e.dur - k) / 0.25 : 1;
    const cx = Math.round(a.x + a.dir * 10 * s), top = Math.round(a.y - 92 * s - hop - Math.sin(Math.min(1, k * 6)) * 3);
    const w = Math.round(15 * pop), h = Math.round(13 * pop);
    GFX.alpha(fade, () => {
      const R = GFX.R;
      R(cx - w / 2 - 1, top - h, w + 2, h, '#2b2238'); R(cx - w / 2, top - h - 1, w, h + 2, '#2b2238');
      R(cx - w / 2, top - h, w, h, '#fffef6');
      R(cx - 1, top + 1, 3, 2, '#2b2238'); R(cx, top, 1, 2, '#fffef6');
      if (pop >= 1) ICONS[e.kind].forEach((row, j) => [...row].forEach((c, i) => c === '#' && R(cx - 5 + i * 2, top - h + 1 + j * 2, 2, 2, ICON_C[e.kind])));
    });
  }

  // 头像：s=2 渲染后裁出头肩
  const NAME = { Gwen: 'gwen', Baiding: 'me', Bex: 'pi' };
  const pcache = new Map();
  function portrait(who, face) {
    const key = NAME[who]; if (!key) return null;
    const ck = who + ':' + (face || '');
    if (pcache.has(ck)) return pcache.get(ck);
    const fr = frame(key, { ph: null, face: face && face !== 'normal' ? face : undefined, bag: false }, 2);
    const c = document.createElement('canvas'); c.width = 64; c.height = 64;
    const g = c.getContext('2d');
    g.drawImage(fr.n, (FX - 30) * 2 + 15 * 2, (FY - 84) * 2 + 4 * 2, 64, 64, 0, 0, 64, 64);
    pcache.set(ck, c);
    return c;
  }

  return { SPECS, frame, drawActor, portrait, emote, FW, FH };
})();
