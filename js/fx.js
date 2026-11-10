// 通用画面效果：色调、暗角、地面倒影、接触阴影、光池、地毯花纹
const FX = (() => {
  const { R, P, alpha } = GFX;

  // 整个画面叠一层色调（soft-light 不会让画面发灰）+ 四角压暗
  let vigCache = null;
  function grade(ctx, g) {
    if (!g) return;
    ctx.save();
    // 整屏色调已经去掉（会把画面搅灰），色温改在背景烘焙时处理；只保留很轻的暗角
    if (g.c && g.keepTint) { ctx.globalCompositeOperation = g.mode || 'soft-light'; ctx.globalAlpha = g.a ?? 0.2; ctx.fillStyle = g.c; ctx.fillRect(0, 0, 640, 360); }
    if (g.c2 && g.keepTint) { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = g.a2 ?? 0.15; const gr = ctx.createLinearGradient(0, 0, 0, 360); gr.addColorStop(0, g.c2); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, 640, 360); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    const v = Math.round((g.vig ?? 0.28) * 0.6 * 100) / 100;
    if (v > 0) {
      if (!vigCache || vigCache.v !== v) {
        const c = document.createElement('canvas'); c.width = 640; c.height = 360; const x = c.getContext('2d');
        const gr = x.createRadialGradient(320, 170, 140, 320, 180, 420);
        gr.addColorStop(0, 'rgba(14,8,32,0)'); gr.addColorStop(0.7, `rgba(14,8,32,${v * 0.45})`); gr.addColorStop(1, `rgba(14,8,32,${v})`);
        x.fillStyle = gr; x.fillRect(0, 0, 640, 360); vigCache = { v, c };
      }
      ctx.drawImage(vigCache.c, 0, 0);
    }
    ctx.restore();
  }

  // 把地面线以上的一条画面倒过来，淡淡地映在地上（亮面地砖用）
  function reflect(g, src, y0, h, a = 0.14, x0 = 0, w = src.width) {
    const tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h;
    const t = tmp.getContext('2d');
    t.save(); t.translate(0, h); t.scale(1, -1); t.drawImage(src, x0, y0 - h, w, h, 0, 0, w, h); t.restore();
    // 越往下越淡
    t.globalCompositeOperation = 'destination-in';
    const gr = t.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    t.fillStyle = gr; t.fillRect(0, 0, w, h);
    g.save(); g.globalAlpha = a; g.drawImage(tmp, x0, y0); g.restore();
  }

  // 柔和的椭圆阴影（家具、人物脚下）
  function shadow(g, cx, cy, rw, rh, a = 0.3, col = '20,16,40') {
    g.save(); g.translate(cx, cy); g.scale(1, rh / rw);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, rw);
    gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.6, `rgba(${col},${a * 0.55})`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.fillRect(-rw, -rw, rw * 2, rw * 2); g.restore();
  }
  // 墙脚 / 柜子底下的一条暗边（环境光遮蔽）
  function ao(g, x, y, w, h = 10, a = 0.3, col = '20,16,40', up = false) {
    const gr = g.createLinearGradient(0, y, 0, y + (up ? -h : h));
    gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.fillRect(x, up ? y - h : y, w, h);
  }
  // 地上的一圈光（顶灯、射灯）：三级台阶的椭圆
  function pool(g, cx, cy, rw, rh, col, a = 0.25) {
    g.save(); g.globalCompositeOperation = 'lighter'; g.translate(cx, cy); g.scale(1, rh / rw);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, rw);
    gr.addColorStop(0, HD.rgba(col, a)); gr.addColorStop(0.34, HD.rgba(col, a)); gr.addColorStop(0.34, HD.rgba(col, a * 0.55)); gr.addColorStop(0.68, HD.rgba(col, a * 0.55)); gr.addColorStop(0.68, HD.rgba(col, a * 0.22)); gr.addColorStop(1, HD.rgba(col, a * 0.22)); gr.addColorStop(1, HD.rgba(col, 0));
    g.fillStyle = gr; g.fillRect(-rw, -rw, rw * 2, rw * 2); g.restore();
  }
  // 从上往下的光锥：分三段台阶，边缘用棋盘格抖动收掉
  function cone(g, x, y, topW, botW, h, col, a = 0.12) {
    g.save(); g.globalCompositeOperation = 'lighter';
    const gr = g.createLinearGradient(0, y, 0, y + h);
    gr.addColorStop(0, HD.rgba(col, a)); gr.addColorStop(0.35, HD.rgba(col, a)); gr.addColorStop(0.35, HD.rgba(col, a * 0.6)); gr.addColorStop(0.7, HD.rgba(col, a * 0.6)); gr.addColorStop(0.7, HD.rgba(col, a * 0.28)); gr.addColorStop(1, HD.rgba(col, a * 0.28));
    g.fillStyle = gr;
    const inset = 3;
    g.beginPath(); g.moveTo(x - topW / 2 + inset, y); g.lineTo(x + topW / 2 - inset, y); g.lineTo(x + botW / 2 - inset, y + h); g.lineTo(x - botW / 2 + inset, y + h); g.closePath(); g.fill();
    // 边缘抖动
    g.fillStyle = HD.rgba(col, a * 0.45);
    for (let j = 0; j < h; j += 1) { const k = j / h, w = topW + (botW - topW) * k, l = Math.round(x - w / 2), r = Math.round(x + w / 2); for (let d = 0; d < inset; d++) if ((j + d) % 2 === 0) { g.fillRect(l + d, y + j, 1, 1); g.fillRect(r - 1 - d, y + j, 1, 1); } }
    g.restore();
  }

  // ---------- 物件画法：描边 + 三色阶 + 顶面 + 接触阴影 ----------
  // 颜色工具：暗面往紫蓝偏，亮面往暖黄偏（色相偏移）
  const hx = (h) => { const n = parseInt(h.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const toHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, k) => { const A = hx(a), B = hx(b); return toHex(A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k); };
  const dark = (c, k = 0.28) => mix(c, '#2a1e3e', k);
  const light = (c, k = 0.22) => mix(c, '#fff4dc', k);
  // 一个有体积的方块：顶面（t 像素高，往后缩一点）+ 正面 + 右侧暗面 + 描边 + 地面阴影
  function block(x, y, w, h, base, o = {}) {
    const t = o.top ?? 4, sd = o.side ?? 3, ol = o.outline ?? dark(base, 0.62);
    if (o.shadow !== false) shadowRect(x - 2, y + h, w + 6, 3);
    if (t > 0) { R(x + 1, y - t, w - 2, t, light(base, 0.3)); R(x + 1, y - t, w - 2, 1, light(base, 0.5)); R(x + 1, y - 1, w - 2, 1, light(base, 0.12)); }
    R(x, y, w, h, base);
    R(x, y, w, 1, light(base, 0.35));
    if (sd > 0) R(x + w - sd, y, sd, h, dark(base, 0.22));
    R(x, y + h - 2, w, 2, dark(base, 0.3));
    // 描边
    R(x - 1, y - t, 1, h + t, ol); R(x + w, y - t, 1, h + t, ol); R(x, y + h, w, 1, ol); if (t > 0) R(x, y - t - 1, w, 1, ol); else R(x, y - 1, w, 1, ol);
  }
  // 方形接触阴影（抖动过的）
  function shadowRect(x, y, w, h) { GFX.alpha(0.28, () => R(x, y, w, h, '#2a1e3e')); for (let i = 0; i < w; i += 2) GFX.alpha(0.18, () => P(x + i, y + h, '#2a1e3e')); }

  // ---------- 背景烘焙：自动描边 + 色相偏移 + 对比度（每张背景只算一次） ----------
  // p: { contrast, lift, shadow, sAmt, hi, hAmt, sat, edge }
  function bake(c, p = {}) {
    const g = c.getContext('2d'), w = c.width, h = c.height;
    const img = g.getImageData(0, 0, w, h), d = img.data, n = w * h;
    const L = new Float32Array(n), A = new Uint8Array(n);
    for (let i = 0; i < n; i++) { const j = i * 4; L[i] = d[j] * 0.299 + d[j + 1] * 0.587 + d[j + 2] * 0.114; A[i] = d[j + 3]; }
    const T = p.edge ?? 38, out = new Uint8Array(n);
    if (T > 0) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; if (A[i] < 128) continue;
      const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1];
      for (const q of nb) { if (q < 0) continue; if ((p.alphaEdge && A[q] < 128) || (A[q] >= 128 && L[q] - L[i] > T)) { out[i] = 1; break; } }
    }
    const S = hx(p.shadow || '#2a2050'), H = hx(p.hi || '#fff0d0');
    const gm = p.gamma ?? 1, k = p.contrast ?? 1.1, lift = p.lift ?? 0, sa = p.sAmt ?? 0.3, ha = p.hAmt ?? 0.12, sat = p.sat ?? 1.08;
    for (let i = 0; i < n; i++) {
      const j = i * 4; if (d[j + 3] === 0) continue;
      let r = d[j], gg = d[j + 1], b = d[j + 2];
      // 描边：往深紫色压
      if (out[i]) { r = r * 0.5 + 34 * 0.5; gg = gg * 0.5 + 26 * 0.5; b = b * 0.5 + 52 * 0.5; }
      const l = (r * 0.299 + gg * 0.587 + b * 0.114) / 255;
      // 暗部偏冷、亮部偏暖
      const ws = (1 - l) * (1 - l) * sa, wh = l * l * ha;
      r = r + (S[0] - r) * ws + (H[0] - r) * wh; gg = gg + (S[1] - gg) * ws + (H[1] - gg) * wh; b = b + (S[2] - b) * ws + (H[2] - b) * wh;
      // 饱和度 + 对比度
      const gr2 = r * 0.299 + gg * 0.587 + b * 0.114;
      r = gr2 + (r - gr2) * sat; gg = gr2 + (gg - gr2) * sat; b = gr2 + (b - gr2) * sat;
      r = (r - 128) * k + 128 + lift; gg = (gg - 128) * k + 128 + lift; b = (b - 128) * k + 128 + lift;
      if (gm !== 1) { r = r > 0 ? 255 * Math.pow(r / 255, gm) : 0; gg = gg > 0 ? 255 * Math.pow(gg / 255, gm) : 0; b = b > 0 ? 255 * Math.pow(b / 255, gm) : 0; }
      d[j] = r < 0 ? 0 : r > 255 ? 255 : r; d[j + 1] = gg < 0 ? 0 : gg > 255 ? 255 : gg; d[j + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
    }
    g.putImageData(img, 0, 0);
    return c;
  }
  // 各场景的烘焙参数
  const BAKE = {
    home: { gamma: 1.12, contrast: 1.12, lift: -6, shadow: '#3a2450', sAmt: 0.36, hi: '#fff0cc', hAmt: 0.14, sat: 1.12 },
    lab: { gamma: 1.45, contrast: 1.08, lift: -6, shadow: '#1e2c5a', sAmt: 0.42, hi: '#f2fbff', hAmt: 0.06, sat: 1.35 },
    boston: { gamma: 1.1, contrast: 1.12, lift: -6, shadow: '#262656', sAmt: 0.36, hi: '#fff0d4', hAmt: 0.1, sat: 1.12 },
    boss: { gamma: 1.2, contrast: 1.12, lift: -8, shadow: '#22305a', sAmt: 0.38, hi: '#fff4dc', hAmt: 0.08, sat: 1.15 },
    street: { contrast: 1.1, lift: -6, shadow: '#2a1648', sAmt: 0.36, hi: '#ffd8a8', hAmt: 0.16, sat: 1.1 },
    drive: { contrast: 1.08, lift: -4, shadow: '#283a6a', sAmt: 0.3, hi: '#fff2d0', hAmt: 0.1, sat: 1.12, alphaEdge: true },
    sky: { contrast: 1.05, lift: 0, shadow: '#1a1040', sAmt: 0.2, hi: '#fff0d0', hAmt: 0.06, sat: 1.05, edge: 0 },
    lounge: { contrast: 1.12, lift: -8, shadow: '#2a1a48', sAmt: 0.34, hi: '#ffe8c8', hAmt: 0.12, sat: 1.1 },
    night: { contrast: 1.1, lift: 0, shadow: '#141040', sAmt: 0.3, hi: '#fff0c8', hAmt: 0.08, sat: 1.1 },
  };

  // 展会地毯：深蓝底 + 菱形格子花纹，越往下格子越大（近大远小）
  function carpet(x0, y0, w, h, pal) {
    R(x0, y0, w, h, pal[0]);
    let y = y0, row = 0;
    while (y < y0 + h) {
      const k = (y - y0) / h, s = Math.round(9 + k * 12);
      if (row % 2) R(x0, y, w, s, pal[3]);
      for (let x = x0 - (row % 2) * s; x < x0 + w + s; x += s * 2) {
        const cx = x + s, cy = y + Math.round(s / 2), r = Math.round(s * 0.42);
        for (let d = -r; d <= r; d++) { const e = r - Math.abs(d); P(cx + d, cy - Math.round(e * 0.5), pal[1]); P(cx + d, cy + Math.round(e * 0.5), pal[1]); }
        R(cx - 1, cy, 2, 1, pal[2]);
      }
      y += s; row++;
    }
  }

  return { grade, reflect, shadow, ao, pool, cone, carpet, block, shadowRect, bake, BAKE, mix, dark, light };
})();
