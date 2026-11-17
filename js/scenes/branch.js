// 隐藏支线：跟着猫走进「回忆」
// 通关一次之后，第二轮序章摸猫第 5 次（或通关后的标题页摸猫 5 次）→ 猫带路 → 夜里的屋顶
// 屋顶的晾衣绳上夹着 5 张空白的拍立得，点一张就走进那段回忆（真实的地方，带一层旧照片的暖色调）
// 找回一段回忆，那张拍立得就慢慢显影；5 张都洗出来 → 大家来到屋顶拍一张新的合影（隐藏 CG）
// → 回到雪夜的蛋糕旁边，画面荡开变成「梦的世界」（这时才第一次出现）→ 对话 → 信的背面 → 隐藏片尾
const BRANCH = (() => {
  const { R, P, circle, ellipse, alpha, line } = GFX;
  const B = () => STORY.branch;
  const KEYS = ['photo', 'pizza', 'coffee', 'bouquet', 'mango'];
  const BGM = { photo: 'yumeSlas', pizza: 'yumePizza', coffee: 'yumeCafe', bouquet: 'yumeBloom', mango: 'yumeCake' };
  const rnd = (i) => { const x = Math.sin(i * 91.7 + 3.3) * 43758.5453; return x - Math.floor(x); };
  const flags = () => (G.flags.br = G.flags.br || {});
  const nGot = () => KEYS.filter((k) => flags()[k]).length;
  const sprite = (k) => DREAM.memSprite(k);   // 回忆小物件的像素图（和梦境里的是同一套）

  // ---------- 小工具 ----------
  function bubble(txt, x, y, ms = 2000) {
    G.layer.querySelectorAll('.toy-bubble').forEach((b) => b.remove());
    const b = G.el(`<div class="toy-bubble" style="left:${(x / 640) * 100}%;top:${(y / 360) * 100}%">${txt}</div>`);
    setTimeout(() => { b.classList.add('out'); setTimeout(() => b.remove(), 400); }, ms);
  }
  function tip(txt) {
    let e = G.layer.querySelector('.br-tip');
    if (!txt) { if (e) e.remove(); return; }
    if (!e) e = G.el('<div class="flip-hint br-tip"></div>');
    e.textContent = txt;
  }
  const hitActor = (a, p) => a && a.visible && p.x > a.x - 15 && p.x < a.x + 15 && p.y > a.y - 86 && p.y < a.y + 2;
  const catActor = (x, y) => G.actor({ x, y, dir: 1, speed: 120, cat: true, draw(ctx, t) { HD.drawCat(Math.round(this.x - 17), Math.round(this.y - 19 - (this.hop || 0)), t, false); } });
  function arrow(cx, top, t, ph = 0) {
    cx = Math.round(cx); top = Math.round(top + Math.sin(t * 5 + ph) * 3);
    R(cx - 6, top - 14, 14, 4, '#2b2238'); R(cx - 4, top - 10, 10, 2, '#2b2238'); R(cx - 2, top - 8, 6, 2, '#2b2238'); R(cx, top - 6, 2, 2, '#2b2238');
    R(cx - 4, top - 14, 10, 2, '#ffd66b'); R(cx - 2, top - 12, 6, 2, '#ffd66b'); R(cx, top - 10, 2, 2, '#ffd66b');
  }
  const shadow = (a) => { if (a && a.visible) alpha(0.25, () => ellipse(a.x, a.y + 1, 15, 3, '#1a1028')); };

  // ---------- 制作手记（不算成就，存在浏览器里，重玩也记得） ----------
  const NKEY = 'gwen1126-notes';
  const notes = () => { try { return JSON.parse(localStorage.getItem(NKEY) || '{}'); } catch (e) { return {}; } };
  function showNote(k) {
    const S = B();
    const p = G.el(`<div class="note-wrap"><div class="note-card"><i class="tape"></i><div class="nt">${S.noteTitle}</div><p>${S.notes[k]}</p><div class="ns">—— Baiding</div><button class="btn small">收好</button></div></div>`);
    p.addEventListener('pointerdown', (e) => e.stopPropagation());
    AU.sfx('pickup');
    return new Promise((res) => p.querySelector('button').addEventListener('click', (e) => { e.stopPropagation(); AU.sfx('click'); p.remove(); res(); }));
  }
  // 进过一次支线之后，成就界面里才会出现「制作手记」（和隐藏成就一样，之前完全看不到）
  const SKEY = 'gwen1126-branch';
  const seen = () => { try { return localStorage.getItem(SKEY) === '1' || Object.keys(notes()).length > 0; } catch (e) { return false; } };
  const markSeen = () => { try { localStorage.setItem(SKEY, '1'); } catch (e) {} };
  const unread = (k) => KEYS.includes(k) && seen() && !notes()[k];
  async function takeNote(k) {
    const n = notes(); n[k] = 1; try { localStorage.setItem(NKEY, JSON.stringify(n)); } catch (e) {}
    await showNote(k);
    G.toast(B().noteFound.replace('{n}', Object.keys(n).length), 2200);
  }
  function drawNote(at, k, t) {
    if (notes()[k]) return;
    const [x, y] = at, b = Math.round(Math.sin(t * 2 + 1) * 1.5);
    HD.glow(x + 5, y + 4 + b, 12, '#fff3c9', 0.3 + Math.sin(t * 3) * 0.08);
    R(x - 1, y - 1 + b, 13, 10, '#2b2238');
    R(x, y + b, 11, 8, '#fff8e8'); R(x, y + b, 11, 1, '#ffffff'); R(x + 7, y + b, 4, 3, '#e8d8b8'); R(x + 2, y + 3 + b, 5, 1, '#c8b8a0'); R(x + 2, y + 5 + b, 6, 1, '#c8b8a0');
    if (Math.sin(t * 1.3 + x) > 0.93) { R(x + 12, y - 4 + b, 1, 5, '#ffffff'); R(x + 10, y - 2 + b, 5, 1, '#ffffff'); }
  }
  const hitNote = (at, k, p) => { if (notes()[k]) return false; const [x, y] = at; return p.x > x - 8 && p.x < x + 19 && p.y > y - 8 && p.y < y + 16; };

  // ---------- 进入支线 ----------
  async function invite(from, onCat) {
    const S = B();
    await G.talk(S.catLead);
    const c = await G.choose(S.ask, [S.yes, S.no]);
    if (c !== 0) { await G.talk(S.decline); return false; }
    if (onCat) await onCat();
    markSeen();
    G.flags.br = {};
    G.persist();
    AU.sfx('whoosh');
    G.goto('roof', { trans: 'iris', fade: 1100, from });
    return true;
  }

  // ================= 屋顶：晾衣绳上的 5 张拍立得 =================
  const ROOF_LANE = 300, DOOR_X = 534;   // 楼梯间的门
  const PX = { photo: 92, pizza: 180, coffee: 268, bouquet: 356, mango: 444 };
  const LINE_A = 30, LINE_B = 484;   // 晾衣绳两根柱子
  const lineY = (x) => 98 + 26 * (1 - Math.pow((x - (LINE_A + LINE_B) / 2) / ((LINE_B - LINE_A) / 2), 2));   // 中间往下垂
  let roofBg = null;
  // 远处一座黄色的拱桥（和雪夜那座呼应）
  const bridgeY = (x) => 212 - 36 * Math.sin((Math.PI * (x - 96)) / 250);
  function paintRoof() {
    const c = document.createElement('canvas'); c.width = 640; c.height = 360;
    const real = GFX.ctx; GFX.setCtx(c.getContext('2d'));
    // ---- 夜空：顶上深蓝，往下慢慢透出城市的暖光 ----
    R(0, 0, 640, 240, '#0b0e2c');
    HD.dgradV(0, 0, 640, 120, '#141a44', 0, 1);
    R(0, 120, 640, 120, '#141a44');
    HD.dgradV(0, 110, 640, 110, '#2a2860', 0, 1);
    R(0, 220, 640, 20, '#2a2860');
    HD.dgradV(0, 170, 640, 60, '#5a3a72', 0, 0.85);
    // 星云一样的淡淡光带
    for (let i = 0; i < 900; i++) { const k = rnd(i + 2000), x = k * 700 - 30, y = 20 + k * 60 + (rnd(i + 2100) - 0.5) * 50; if (rnd(i + 2200) < 0.4) P(x, y, rnd(i + 2300) > 0.5 ? '#1e2456' : '#232a60'); }
    // 月亮：环形山、亮边、两圈光晕
    HD.glow(552, 60, 110, '#fff3c9', 0.14); HD.glow(552, 60, 44, '#fff3c9', 0.22);
    circle(552, 60, 19, '#c8b890'); circle(551, 59, 18, '#f2e6c4'); circle(548, 56, 15, '#fff6dc');
    for (const [x, y, r] of [[545, 54, 4], [558, 66, 3], [559, 52, 2], [547, 67, 2], [540, 62, 2]]) { circle(x, y, r, '#e6d6ae'); circle(x - 1, y - 1, r - 1, '#efe2bc'); }
    // 月亮旁边两缕薄云
    for (const [x, y, w] of [[470, 74, 120], [520, 88, 90]]) for (let i = 0; i < w; i += 2) { const h = Math.sin((i / w) * Math.PI); if (h > 0.2) { R(x + i, y, 2, 1, '#3a3a72'); if (h > 0.6) R(x + i, y - 1, 2, 1, '#4a4886'); } }
    // ---- 远处的城市：三层楼的剪影，越近越深、细节越多 ----
    const city = (y0, hMin, hMax, col, edge, win, seed, fancy) => {
      let x = -10, i = 0;
      while (x < 650) {
        const w = Math.round(28 + rnd(seed + i) * 46), h = Math.round(hMin + rnd(seed + i + 50) * (hMax - hMin)), top = y0 - h;
        R(x, top, w, h + 60, col); R(x, top, w, 1, edge); R(x + w - 2, top, 2, h + 60, edge);
        const kind = rnd(seed + i + 9);
        if (kind > 0.82) { R(x + w * 0.5 - 1, top - 14, 2, 14, col); P(x + w * 0.5 - 1, top - 15, '#ff5a5a'); }
        else if (kind > 0.66 && fancy) { const tx = x + 8; R(tx, top - 16, 2, 10, col); R(tx + 12, top - 16, 2, 10, col); R(tx - 2, top - 26, 18, 11, col); R(tx - 2, top - 26, 18, 1, edge); for (let r = 0; r < 5; r++) R(tx + r, top - 31 + r, 14 - r * 2, 1, col); }
        else if (kind > 0.5) { for (let r = 0; r < 6; r++) R(x + r * 2, top - 6 + r, w - r * 4, 1, col); }
        if (win) for (let wy = top + 6; wy < y0 + 30; wy += 8) for (let wx = x + 4; wx < x + w - 6; wx += 7) {
          const v = rnd(wx * 3.1 + wy * 7.7 + seed);
          if (v > 0.66) { R(wx, wy, 3, 4, v > 0.95 ? '#9fd8ff' : v > 0.9 ? '#ffc6e0' : win); P(wx, wy, '#fff6d8'); }
          else if (fancy && v > 0.5) R(wx, wy, 3, 4, '#2e2c5a');
        }
        x += w + 1; i++;
      }
    };
    city(196, 40, 96, '#232355', '#2e2e66', null, 10, false);
    city(214, 24, 64, '#1c1a48', '#26245a', '#d8b46a', 40, true);
    // 黄色拱桥：拱、吊杆、桥面和一排小灯
    for (let x = 96; x <= 346; x++) { const y = Math.round(bridgeY(x)); R(x, y, 1, 4, '#c8962a'); P(x, y, '#f0c048'); if ((x - 96) % 10 === 0 && y < 210) R(x, y + 3, 1, 214 - y, '#a07a28'); }
    R(70, 212, 300, 4, '#8a6a2a'); R(70, 212, 300, 1, '#e0b040');
    for (let x = 74; x < 370; x += 12) P(x, 211, '#fff0b0');
    city(226, 8, 26, '#15133a', '#1e1c4a', '#ffd88a', 80, true);
    // 霓虹招牌（亮光在每帧里画）
    R(300, 150, 64, 22, '#15133a'); R(302, 152, 60, 18, '#201c4a'); R(330, 172, 2, 30, '#15133a');
    // ---- 屋顶的矮墙：红砖 + 压顶石 + 一根落水管 ----
    R(0, 226, 640, 22, '#4e3a54');
    for (let r = 0; r < 5; r++) { const y = 228 + r * 4; for (let x = (r % 2) * 6 - 6; x < 640; x += 12) { R(x, y, 11, 3, rnd(x + y * 3) > 0.5 ? '#5e4460' : '#563e5a'); P(x, y, '#6a5070'); } }
    R(0, 222, 640, 5, '#8a86a8'); R(0, 222, 640, 1, '#b4b0cc'); R(0, 226, 640, 1, '#5e5a7a');
    for (let x = 0; x < 640; x += 40) R(x, 222, 1, 5, '#6a6688');
    R(0, 246, 640, 2, '#2a2034');
    R(222, 226, 4, 22, '#6a6688'); R(222, 226, 1, 22, '#8a86a8');
    for (let i = 0; i < 30; i++) P(rnd(i + 70) * 640, 244 + rnd(i + 71) * 3, '#4a6a4a');
    // ---- 地面：一块块方砖，越近越大；墙根有一圈碎石和阴影 ----
    R(0, 248, 640, 112, '#3a3452');
    let y = 248, hgt = 6, row = 0;
    while (y < 360) {
      const sx = row % 2 ? 0 : 18;
      R(0, y, 640, 1, '#2c2742');
      for (let i = -16; i <= 16; i++) { const x0 = 320 + (i * 36 + sx) * (1 + (y - 248) / 90); R(Math.round(x0), y, 1, hgt, '#2e2944'); }
      if (row % 2) HD.dith(0, y + 1, 640, hgt - 1, '#403a5a', 0.25);
      y += hgt; hgt = Math.round(hgt * 1.22) + 1; row++;
    }
    for (let i = 0; i < 140; i++) P(rnd(i + 900) * 640, 249 + rnd(i + 901) * 4, rnd(i) > 0.5 ? '#5a5472' : '#2a2438');
    HD.fadeV(0, 248, 640, 22, '#120e22', 0.5, 0);
    // 两摊积水，映着月亮
    for (const [px, py, rw] of [[150, 330, 46], [420, 342, 34]]) { ellipse(px, py, rw, 5, '#2a2a5a'); ellipse(px - 4, py - 1, rw - 8, 3, '#34346a'); R(px - rw * 0.5, py - 1, rw * 0.4, 1, '#5a5a9a'); }
    R(156, 328, 6, 2, '#e8dcb0'); R(158, 330, 3, 1, '#fff6dc');
    // ---- 左边：木箱、几盆植物、一张折叠椅 ----
    FX.block(64, 276, 30, 24, '#7a5a3e', { top: 5, side: 4 }); R(64, 286, 30, 1, '#5a3e2a'); R(78, 276, 1, 24, '#5a3e2a');
    for (const [px, h] of [[22, 30], [46, 20]]) {
      const blobs = Array.from({ length: 9 }, (_, k) => [px - 9 + rnd(k + px) * 18, 284 - 6 - rnd(k + px + 3) * h, 5 + rnd(k + px + 6) * 3]);
      blobs.forEach(([x, y, r]) => circle(x, y + 1, r, '#24443e'));
      blobs.forEach(([x, y, r]) => circle(x - 0.5, y, r - 0.5, '#2f5d4b'));
      blobs.forEach(([x, y, r]) => circle(x - 1.5, y - 1.5, r * 0.6, '#3f7a58'));
      blobs.forEach(([x, y, r]) => P(x - 2, y - 3, '#86c08a'));
      FX.block(px - 9, 300 - 16, 18, 16, '#a85a42', { top: 3, side: 3 });
    }
    // ---- 右边：楼梯间（小房子 + 一扇门 + 门口一盏壁灯） ----
    const sx0 = 492, sw = 100;
    FX.block(sx0, 150, sw, 150, '#5a5478', { top: 6, side: 8 });
    for (let yy = 160; yy < 296; yy += 12) R(sx0 + 2, yy, sw - 10, 1, '#524c6e');
    R(sx0 + 8, 160, 22, 14, '#2a2848'); R(sx0 + 9, 161, 20, 12, '#3a3868'); R(sx0 + 18, 161, 1, 12, '#2a2848');   // 通风百叶
    for (let k = 0; k < 5; k++) R(sx0 + 10, 163 + k * 2, 18, 1, '#24223e');
    R(sx0 + 70, 126, 4, 24, '#6a6488'); R(sx0 + 66, 126, 12, 3, '#8a86a8');   // 屋顶上的小烟囱
    const dx0 = DOOR_X - 18;
    R(dx0 - 3, 228, 42, 72, '#3e3858'); R(dx0, 231, 36, 69, '#24203a');
    R(dx0 + 2, 233, 32, 67, '#6a4a5a'); R(dx0 + 2, 233, 32, 1, '#8a6a7a'); R(dx0 + 8, 240, 20, 18, '#2a2240'); R(dx0 + 9, 241, 18, 16, '#ffd88a'); R(dx0 + 17, 241, 2, 16, '#6a4a5a'); R(dx0 + 9, 249, 18, 1, '#6a4a5a');
    R(dx0 + 28, 268, 3, 3, '#e0b040');
    R(dx0 + 4, 218, 28, 7, '#2a2848'); GFX.text('ROOF', dx0 + 8, 219, '#c8c0e8');
    R(DOOR_X - 3, 208, 6, 6, '#2b2238'); R(DOOR_X - 2, 209, 4, 4, '#ffe9a8');
    // 门口的小盆栽
    FX.block(dx0 + 44, 286, 12, 14, '#4a6a8a', { top: 3, side: 2 }); circle(dx0 + 50, 280, 6, '#3f7a58'); circle(dx0 + 48, 278, 3, '#5c9e6c');
    // ---- 晾衣绳的两根木柱（T 字形） ----
    for (const px of [LINE_A, LINE_B]) { FX.block(px - 2, 92, 5, 208, '#7a5a3e', { top: 0, side: 2, shadow: false }); R(px - 8, 90, 17, 4, '#8a6a4a'); R(px - 8, 90, 17, 1, '#aa8a62'); alpha(0.3, () => ellipse(px, 301, 8, 2, '#100c20')); }
    GFX.setCtx(real);
    return FX.bake(c, FX.BAKE.night);
  }
  // 一张拍立得：dev 0 = 空白，1 = 完全洗出来
  const MEM_BG = { photo: '#9cc6e4', pizza: '#ffe0a0', coffee: '#c8e8d8', bouquet: '#ffd6e6', mango: '#ffe6b0' };
  function polaroid(x, y, k, dev, t, hi) {
    x += Math.round(Math.sin(t * 1.3 + x * 0.05) * 1);
    if (hi) HD.glow(x, y + 18, 28, '#fff3c9', 0.22 + Math.sin(t * 2.5 + x) * 0.08);
    alpha(0.35, () => R(x - 13, y + 2, 30, 37, '#0a0818'));   // 投在夜色里的影子
    R(x - 15, y - 1, 30, 37, '#2b2238');
    R(x - 14, y, 28, 35, '#f4ecdc'); R(x - 14, y, 28, 1, '#ffffff'); R(x + 12, y + 1, 2, 34, '#ddd2bc'); R(x - 14, y + 33, 28, 2, '#ddd2bc');
    R(x - 11, y + 3, 22, 22, '#24223c');
    if (dev > 0) {
      alpha(dev, () => { R(x - 11, y + 3, 22, 22, MEM_BG[k]); HD.dgradV(x - 11, y + 3, 22, 22, '#ffffff', 0.25, 0); const c = sprite(k); const s = Math.min(1, 20 / Math.max(c.width, c.height)); GFX.ctx.drawImage(c, Math.round(x - (c.width * s) / 2), Math.round(y + 14 - (c.height * s) / 2), Math.round(c.width * s), Math.round(c.height * s)); });
      if (dev < 1) alpha((1 - dev) * 0.85, () => R(x - 11, y + 3, 22, 22, '#fff6e8'));
    } else {
      HD.dgradV(x - 11, y + 3, 22, 22, '#3a3860', 0, 0.8);
      const sy = (t * 14 + x) % 40; if (sy < 22) alpha(0.3, () => R(x - 11, y + 3 + sy, 22, 2, '#8a86b8'));
    }
    R(x - 8, y + 28, 16, 1, '#c8bca8'); R(x - 5, y + 31, 10, 1, '#c8bca8');
    R(x - 3, y - 5, 6, 7, '#2b2238'); R(x - 2, y - 4, 4, 6, '#c8a070'); R(x - 2, y - 4, 4, 1, '#e8c890'); P(x - 1, y - 1, '#8a6a40');   // 木夹子
  }
  function stringLights(t) {
    // 一串小彩灯：从左边的柱子顶挂到楼梯间屋檐，再垂下一段
    const pts = [];
    for (let x = LINE_A; x <= 492; x += 2) pts.push([x, Math.round(92 + 18 * Math.sin((Math.PI * (x - LINE_A)) / (492 - LINE_A)) + 4)]);
    pts.forEach(([x, y]) => P(x, y, '#1a1630'));
    pts.forEach(([x, y], i) => {
      if (i % 9 !== 4) return;
      const on = 0.75 + Math.sin(t * 2 + i * 0.7) * 0.25, col = ['#ffd66b', '#ff9ec4', '#9fd8ff', '#ffb38a', '#b9f0c8'][(i / 9 | 0) % 5];
      HD.glow(x, y + 2, 9, col, 0.3 * on); R(x - 1, y + 1, 3, 3, col); P(x, y + 1, '#ffffff');
    });
  }
  function drawRoof(t, devOf, o = {}) {
    if (!roofBg) roofBg = paintRoof();
    const ctx = GFX.ctx;
    ctx.drawImage(roofBg, 0, 0);
    // 星星
    for (let i = 0; i < 110; i++) { const x = rnd(i + 300) * 640, y = Math.pow(rnd(i + 400), 1.6) * 180, a = 0.4 + Math.sin(t * (1.5 + rnd(i) * 2) + i) * 0.4; if (a > 0.05) alpha(a, () => { const big = rnd(i + 7) > 0.9; R(x, y, big ? 2 : 1, big ? 2 : 1, rnd(i + 8) > 0.7 ? '#fff0d0' : '#e8e6ff'); if (big && a > 0.7) alpha(0.5, () => { R(x - 2, y + 0.5, 6, 1, '#ffffff'); R(x + 0.5, y - 2, 1, 6, '#ffffff'); }); }); }
    const sk = (t % 9) / 0.8;
    if (sk < 1) { const i = Math.floor(t / 9), x0 = 100 + rnd(i) * 300, y0 = 16 + rnd(i + 5) * 40; for (let j = 0; j < 18; j++) alpha((1 - j / 18) * (1 - sk), () => R(x0 + sk * 130 - j * 2.5, y0 + sk * 42 - j, 2, 1, j < 3 ? '#ffffff' : '#c8d0ff')); }
    // 桥上的灯一闪一闪、霓虹招牌
    for (let x = 100; x < 346; x += 25) { const y = Math.round(bridgeY(x)); if (Math.sin(t * 2 + x) > 0) P(x, y - 1, '#fff6c0'); }
    const neon = Math.sin(t * 17) > -0.9 ? 1 : 0.2;
    const op = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'lighter';
    HD.glow(332, 161, 40, '#ff6fae', 0.22 * neon);
    ctx.globalCompositeOperation = op;
    alpha(neon, () => { GFX.text('CAFE', 314, 156, '#ff8fc4'); R(306, 154, 52, 1, '#ff6fae'); R(306, 168, 52, 1, '#ff6fae'); });
    // 楼梯间的壁灯：一小片暖光照在门口地上；门开着的时候门里也透出光
    ctx.globalCompositeOperation = 'lighter';
    HD.glow(DOOR_X, 211, 30, '#ffd88a', 0.35);
    FX.pool(ctx, DOOR_X, 302, 44, 7, '#ffc070', 0.16);
    if (o.door) { HD.glow(DOOR_X, 266, 40, '#ffb060', 0.35 * o.door); FX.pool(ctx, DOOR_X - 10, 304, 50, 8, '#ffb060', 0.25 * o.door); }
    ctx.globalCompositeOperation = op;
    if (o.door) alpha(o.door, () => { R(DOOR_X - 16, 233, 32, 67, '#ffcf8a'); HD.dgradV(DOOR_X - 16, 233, 32, 67, '#ff9a5a', 0, 0.5); R(DOOR_X - 16, 233, 3, 67, '#6a4a5a'); });
    // 积水里的月亮微微晃
    for (const [px, py, rw] of [[150, 330, 46], [420, 342, 34]]) alpha(0.4 + Math.sin(t * 2 + px) * 0.2, () => R(px - rw * 0.3 + Math.round(Math.sin(t * 1.5 + px) * 3), py, rw * 0.5, 1, '#8a8ad0'));
    stringLights(t);
    for (let x = LINE_A; x < LINE_B; x += 1) P(x, Math.round(lineY(x)), x % 6 ? '#c8c0d8' : '#a8a0bc');
    KEYS.forEach((k) => polaroid(PX[k], Math.round(lineY(PX[k])) + 2, k, devOf(k), t, devOf(k) === 0));
  }

  let roof;
  G.def('roof', {
    k: 1, width: 640, floor: ROOF_LANE, minX: 70, maxX: 590, bgm: 'yumeHub', checkpoint: true,
    grade: { c: '#9fb0ff', a: 0.05, vig: 0.26 },
    setup(opt = {}) {
      // 刚找回来的那张先保持空白，等转场结束再开始显影（t0 = 无穷大 → 显影进度 0）
      roof = { dev: opt.got ? { k: opt.got, t0: Infinity } : null };
      const x0 = opt.got ? PX[opt.got] + 30 : 150;
      G.gwen = G.actor({ sprite: 'gwen', x: x0, y: ROOF_LANE, speed: 110, seed: 0.3 });
      roof.cat = catActor(x0 - 34, ROOF_LANE);
      KEYS.forEach((k) => {
        if (flags()[k]) return;
        const y = Math.round(lineY(PX[k]));
        G.obj({ id: 'p_' + k, label: B().portals[k], x: PX[k] - 16, y: y - 4, w: 32, h: 42, stand: PX[k] + 26, hint: false, onTap: () => enter(k) });
      });
    },
    async start(opt = {}) {
      const S = B();
      if (!flags().intro) {
        G.lock();
        await G.wait(700);
        G.gwen.face = 'surprised';
        await G.talk(S.hubIntro);
        G.gwen.face = null;
        flags().intro = true; G.persist();
        G.unlock();
        tip(S.hubTip);
        setTimeout(() => { if (G.scene === G.scenes.roof) tip(null); }, 6000);
      }
      if (opt.got) {
        // 刚找回来的回忆：那张拍立得慢慢显影
        G.lock();
        roof.dev.t0 = G.t;
        AU.sfx('heal');
        await G.wait(1800);
        roof.dev = null;
        AU.sfx('ding');
        G.burst(PX[opt.got], lineY(PX[opt.got]) + 16, 20, ['#fff3c9', '#ffffff', '#ffb3d1'], { speed: 50, life: 0.8, g: 0, size: 2 });
        G.toast(S.hubBack.replace('{name}', S.portals[opt.got]), 1800);
        G.unlock();
      }
      if (nGot() >= KEYS.length) return allBack();
      if (opt.got) setTimeout(() => { if (G.scene === G.scenes.roof) G.toast(S.hubLeft.replace('{n}', KEYS.length - nGot()), 2000); }, 1900);
    },
    exit() { tip(null); },
    update(dt) {
      const c = roof.cat, g = G.gwen, tx = g.x - 30 * g.dir;
      if (Math.abs(tx - c.x) > 4) { c.x += Math.sign(tx - c.x) * Math.min(Math.abs(tx - c.x), dt * (Math.abs(tx - c.x) > 40 ? 150 : 70)); c.dir = tx > c.x ? 1 : -1; }
      c.hop = Math.abs(tx - c.x) > 6 ? Math.abs(Math.sin(G.t * 12)) * 2 : 0;
    },
    draw(ctx, t) {
      drawRoof(t, (k) => (roof.dev && roof.dev.k === k ? G.clamp((G.t - roof.dev.t0) / 1.6, 0, 1) : flags()[k] ? 1 : 0));
      shadow(G.gwen);
    },
  });
  function enter(k) {
    AU.sfx('whoosh');
    G.goto('br_' + k, { trans: 'iris', fade: 800 });
  }
  async function allBack() {
    G.lock();
    await G.wait(800);
    await G.talk(B().allBack);
    G.goto('br_cg', { fade: 1000 });
  }

  // ================= 回忆小关的公共部分 =================
  // 每段回忆在它真实的地方（展馆、街道、休息室……），罩一层旧照片的暖色调：边缘压暗、角落漏光、细细的胶片颗粒和浮尘
  // cfg: { bg() → canvas, ox, lane, filter, note:[x,y], gx, gdir, setup, play, done, draw, drawFg, update, tap, hover }
  function level(k, cfg) {
    let st;
    G.def('br_' + k, {
      k: 1, width: 640, floor: cfg.lane, noWalk: true, fixedCam: true, bgm: BGM[k],
      grade: { c: '#ffd9a0', a: 0.07, vig: 0.4 },
      setup() {
        G.setFilter(cfg.filter);
        st = { k, t0: G.t, reward: null, busy: false };
        G.gwen = G.actor({ sprite: 'gwen', x: cfg.gx, y: cfg.lane, dir: cfg.gdir || 1, speed: 110, seed: 0.3 });
        cfg.setup(st);
        if (G.devJump) window.__br = st;
        G.onPointer = (e, p) => {
          if (G.dialogOpen() || st.busy) return false;
          if (hitNote(cfg.note, k, p)) { st.busy = true; takeNote(k).then(() => (st.busy = false)); return true; }
          return !!(cfg.tap && st.playing && cfg.tap(st, p));
        };
        G.onHover = (p) => !!p && !G.dialogOpen() && (hitNote(cfg.note, k, p) || !!(cfg.hover && st.playing && cfg.hover(st, p)));
      },
      async start() {
        const L = B()[k];
        await G.wait(600);
        await G.talk(L.intro);
        st.playing = true;
        await cfg.play(st);
        st.playing = false;
        tip(null);
        await G.wait(500);
        await (cfg.done ? cfg.done(st, L.done) : G.talk(L.done));
        await G.wait(300);
        st.reward = { t0: G.t };
        AU.sfx('pickup');
        bubble((STORY.dream && STORY.dream.memories[k]) || '', G.gwen.x, G.gwen.y - 150, 2600);
        await G.wait(2800);
        flags()[k] = true; G.persist();
        G.goto('roof', { trans: 'iris', fade: 900, got: k });
      },
      exit() { G.onPointer = null; G.onHover = null; tip(null); },
      update(dt) { cfg.update && cfg.update(st, dt); },
      draw(ctx, t) {
        ctx.drawImage(cfg.bg(), cfg.ox || 0, 0, 640, 360, 0, 0, 640, 360);
        cfg.draw && cfg.draw(st, t);
        G.actors.forEach((a) => a.sprite && shadow(a));
      },
      drawFg(ctx, t) {
        cfg.drawFg && cfg.drawFg(st, t);
        drawNote(cfg.note, k, t);
        if (st.reward) {
          const c = sprite(k), e = G.clamp((G.t - st.reward.t0) / 0.6, 0, 1), x = G.gwen.x, y = G.gwen.y - 104 - (1 - Math.pow(1 - e, 3)) * 18 + Math.sin(t * 2) * 2;
          HD.glow(x, y, 30, '#fff3c9', 0.45 * e);
          for (let i = 0; i < 6; i++) { const a = t * 2 + i * 1.047; R(Math.round(x + Math.cos(a) * 20), Math.round(y + Math.sin(a) * 14), 2, 2, i % 2 ? '#ffffff' : '#ffd6ee'); }
          alpha(e, () => ctx.drawImage(c, Math.round(x - c.width / 2), Math.round(y - c.height / 2)));
        }
      },
      // 旧照片的质感：角落漏光、浮尘、胶片颗粒（画在最上面，不跟镜头走）
      drawScreen(ctx, t) {
        const op = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'lighter';
        HD.glow(-20, -10, 230, '#ff9a5a', 0.16 + Math.sin(t * 0.7) * 0.04); HD.glow(660, 380, 200, '#ffcf8a', 0.1);
        ctx.globalCompositeOperation = op;
        for (let i = 0; i < 26; i++) { const x = (rnd(i) * 640 + t * (4 + (i % 5))) % 640, y = (rnd(i + 50) * 360 - t * (3 + (i % 3)) + 720) % 360; alpha(0.25 + Math.sin(t * 2 + i) * 0.15, () => R(x, y, 1 + (i % 2), 1 + (i % 2), '#fff4e0')); }
        const f = Math.floor(t * 12);
        for (let i = 0; i < 40; i++) alpha(0.07, () => P(rnd(f * 41 + i) * 640, rnd(f * 17 + i + 9) * 360, i % 2 ? '#ffffff' : '#1a1020'));
      },
    });
  }

  // 一张小圆桌
  function table(cx, top, w) {
    alpha(0.25, () => ellipse(cx, top + 46, w * 0.5, 4, '#1a1028'));
    R(cx - 2, top + 4, 4, 40, '#5a4a40'); R(cx - 12, top + 42, 24, 3, '#5a4a40');
    ellipse(cx, top + 2, w / 2, 6, '#c8b8a8'); ellipse(cx, top, w / 2, 5, '#f4ece4'); ellipse(cx - 4, top - 1, w / 2 - 8, 2, '#ffffff');
  }

  // 铺着桌布的小圆桌：checks = 红白格子（披萨店），否则是带蕾丝边的奶油色桌布
  function clothTable(cx, top, rx, checks, floorY) {
    alpha(0.28, () => ellipse(cx, floorY + 1, rx * 0.9, 4, '#1a1028'));
    R(cx - 2, top + 20, 5, floorY - top - 22, '#3a3440'); R(cx - 2, top + 20, 1, floorY - top - 22, '#5a5462'); R(cx - 14, floorY - 3, 29, 3, '#3a3440'); R(cx - 14, floorY - 3, 29, 1, '#5a5462');
    const ry = 8, cell = (x, y) => (checks ? (((Math.floor((x - cx) / 6) + Math.floor((y - top) / 4)) & 1) ? '#d9483b' : '#fff6ea') : '#fff4e6');
    // 桌面（椭圆）+ 垂下来的一圈桌布
    for (let y = -ry; y <= 22; y++) {
      const half = y <= 0 ? Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry))) : Math.round(rx * Math.sqrt(1 - Math.min(1, (y * y) / (ry * ry) * 0)) * (1 - y * 0.004));
      for (let x = cx - half; x < cx + half; x++) { let col = cell(x, top + y); if (y > 2 && x > cx + half - 6) col = checks ? (col === '#d9483b' ? '#a8302a' : '#e0d4c4') : '#e8dccb'; P(x, top + y, col); }
    }
    R(cx - rx, top - 1, rx * 2, 1, checks ? '#ffffff' : '#ffffff');
    HD.fadeV(cx - rx, top + 4, rx * 2, 18, '#2b1830', 0, 0.18);
    // 下摆：一圈小波浪
    for (let x = cx - rx; x < cx + rx; x += 6) { circle(x + 3, top + 22, 3, checks ? '#d9483b' : '#ffd6e6'); P(x + 3, top + 24, checks ? '#a8302a' : '#f2a8c4'); }
    R(cx - rx - 1, top - ry + 2, 1, ry + 20, '#2b2238'); R(cx + rx, top - ry + 2, 1, ry + 20, '#2b2238');
  }
  // 小铁椅：椅背一个弯圈
  function bistroChair(x, floorY, dir) {
    const c = '#3a3a48', h = '#6a6a7a';
    R(x - 8, floorY - 26, 17, 3, c); R(x - 8, floorY - 26, 17, 1, h);
    R(x - 7, floorY - 23, 2, 23, c); R(x + 6, floorY - 23, 2, 23, c);
    const bx = x + (dir > 0 ? -8 : 7);
    R(bx, floorY - 52, 2, 28, c);
    for (let a = 0; a < 3.14; a += 0.15) P(Math.round(bx + (dir > 0 ? 1 : -1) * Math.sin(a) * 7 + (dir > 0 ? 0 : 1)), Math.round(floorY - 52 + (1 - Math.cos(a)) * 6), h);
  }
  function lemonade(x, y) {
    R(x - 4, y - 14, 9, 15, '#2b2238'); R(x - 3, y - 13, 7, 13, '#fff6c0'); R(x - 3, y - 9, 7, 9, '#ffd84a'); R(x - 3, y - 13, 1, 13, '#ffffff'); P(x, y - 6, '#fff6c0'); P(x + 2, y - 3, '#fff6c0');
    R(x + 1, y - 19, 1, 8, '#ff6f9a'); R(x + 1, y - 19, 3, 1, '#ff6f9a'); circle(x - 2, y - 14, 2, '#7fc07f');
  }
  // 冷萃小推车：条纹遮阳棚、小黑板、氮气咖啡的龙头、木头车身和轮子
  function coldBrewCart(cx, t) {
    const top = 216, L = cx - 64, W = 128;
    // 遮阳棚的两根杆子
    R(L + 4, 150, 3, top - 150, '#5a3a2e'); R(L + W - 7, 150, 3, top - 150, '#5a3a2e');
    for (let i = 0; i < W + 8; i += 12) { R(L - 4 + i, 140, 6, 14, '#2f7a5a'); R(L + 2 + i, 140, 6, 14, '#f4efe6'); }
    for (let i = 0; i < W + 8; i += 12) { circle(L - 1 + i, 154, 3, '#2f7a5a'); circle(L + 5 + i, 154, 3, '#f4efe6'); }
    R(L - 5, 138, W + 10, 3, '#1f5a40'); R(L - 5, 138, W + 10, 1, '#4a9a72'); HD.fadeV(L, 157, W, 8, '#1a1028', 0.25, 0);
    // 小黑板招牌
    R(cx - 34, 116, 68, 22, '#5a3a2e'); R(cx - 32, 118, 64, 18, '#2a3a32'); GFX.text('COLD BREW', cx - 27, 123, '#f4efe6');
    // 车身
    FX.block(L, top, W, 36, '#8a5a3a', { top: 5, side: 6 });
    for (let x = L + 6; x < L + W - 8; x += 10) R(x, top + 4, 1, 30, '#7a4a30');
    R(L + 8, top + 10, W - 22, 10, '#2f7a5a'); R(L + 8, top + 10, W - 22, 1, '#4a9a72'); GFX.text('NITRO', cx - 18, top + 12, '#f4efe6');
    for (const wx of [L + 18, L + W - 22]) { circle(wx, top + 40, 9, '#2b2238'); circle(wx, top + 40, 8, '#3a3440'); circle(wx, top + 40, 3, '#8a8a98'); for (let a = 0; a < 6.28; a += 1.05) P(Math.round(wx + Math.cos(a + t) * 6), Math.round(top + 40 + Math.sin(a + t) * 6), '#6a6a7a'); }
    // 台面上：一叠杯子、吸管筒、氮气龙头
    for (let k = 0; k < 4; k++) { R(L + 10, top - 6 - k * 3, 12, 3, k % 2 ? '#e8f4fa' : '#d0e8f2'); }
    R(L + 9, top - 18, 14, 1, '#2b2238');
    R(L + 30, top - 14, 7, 14, '#c8c0b0'); for (let k = 0; k < 4; k++) R(L + 31 + k * 2, top - 20, 1, 7, ['#ff6f9a', '#9fd8ff', '#ffd23f', '#7fc07f'][k]);
    const tx = cx + 22;
    R(tx, top - 44, 5, 44, '#8e8e9c'); R(tx, top - 44, 1, 44, '#e0e0ea'); R(tx + 4, top - 44, 1, 44, '#5a5a66');
    R(cx + 2, top - 44, 22, 4, '#8e8e9c'); R(cx + 2, top - 44, 22, 1, '#e0e0ea');
    R(cx, top - 44, 4, 10, '#8e8e9c'); R(cx, top - 35, 4, 2, '#5a5a66');
    R(tx - 1, top - 58, 7, 14, '#1a1a22'); R(tx, top - 58, 2, 14, '#3a3a48');
    alpha(0.25, () => ellipse(cx, 262, 74, 4, '#1a1028'));
  }
  // 牛皮纸包着的花束：折痕、薄纸花边、粉色缎带蝴蝶结
  function wrapPaper(x, y) {
    for (let r = 0; r < 16; r++) { const w = 22 - r * 1.1; R(x - w / 2, y - 6 + r, w, 1, r < 2 ? '#f4e2c4' : r % 4 === 0 ? '#b8916a' : '#d2ac80'); }
    R(x - 12, y - 7, 24, 2, '#fff6fa'); for (let i = 0; i < 24; i += 4) P(x - 12 + i, y - 8, '#ffe0ee');
    line(x - 6, y - 4, x - 1, y + 9, '#b8916a'); line(x + 6, y - 4, x + 1, y + 9, '#b8916a');
    R(x - 5, y + 3, 10, 2, '#ff6f9a'); circle(x - 4, y + 3, 2, '#ff8fb3'); circle(x + 4, y + 3, 2, '#ff8fb3'); R(x - 1, y + 2, 2, 3, '#e0507a'); R(x - 3, y + 5, 2, 5, '#ff8fb3'); R(x + 1, y + 5, 2, 5, '#ff8fb3');
  }

  // ================= 1. 一年前的展会：把走散的大家叫回来 =================
  level('photo', {
    bg: () => BGS.boston(), ox: 180, lane: 262, filter: 'sepia(.32) saturate(1.1) contrast(.96) brightness(1.04)', note: [596, 150],
    gx: 360, gdir: -1,
    setup(st) {
      const L = 262;
      st.josh = G.actor({ sprite: 'josh', x: 150, y: L, dir: 1, speed: 100, seed: 0.9, badge: true });
      st.people = [
        G.actor({ sprite: 'me', x: 590, y: L, dir: -1, speed: 34, seed: 0.7, badge: true, range: [552, 616], slot: 410 }),
        G.actor({ sprite: 'crowd2', x: 500, y: L, dir: 1, speed: 28, seed: 0.4, badge: true, range: [470, 528], slot: 312 }),
        G.actor({ sprite: 'crowd5', x: 60, y: L, dir: 1, speed: 30, seed: 0.2, badge: true, range: [30, 92], slot: 456 }),
      ];
      st.people.forEach((a, i) => (a.wt = 1 + i));
      st.n = 0;
    },
    update(st, dt) {
      st.people.forEach((a) => {
        if (a.called || a.walking) return;
        a.wt -= dt;
        if (a.wt <= 0) { a.wt = 1.5 + Math.random() * 2; G.walk(a, a.range[0] + Math.random() * (a.range[1] - a.range[0])); }
      });
    },
    tap(st, p) {
      const a = st.people.find((x) => !x.called && hitActor(x, p));
      if (!a) return false;
      a.called = true; st.n++;
      AU.sfx('select'); CHR.emote(a, '!');
      bubble(B().photo.call[st.n - 1], a.x, a.y - 92, 1400);
      tip(B().photo.tip.replace('{n}', st.n));
      a.speed = 150;
      a.arrive = G.walk(a, a.slot).then(() => { a.dir = a.slot < 360 ? 1 : -1; a.face = 'happy'; });
      return true;
    },
    hover: (st, p) => st.people.some((x) => !x.called && hitActor(x, p)),
    async play(st) {
      tip(B().photo.tip.replace('{n}', 0));
      while (st.n < 3) await G.wait(100);
      await Promise.all(st.people.map((a) => a.arrive));
      G.gwen.face = 'happy'; st.josh.face = 'happy';
    },
    async done(st, lines) {
      await G.say(lines[0][0], lines[0][1]);
      await G.flash();
      for (const l of lines.slice(1)) await G.say(l[0], l[1], l[2]);
    },
    drawFg(st, t) { if (st.playing) st.people.forEach((a, i) => { if (!a.called) arrow(a.x, a.y - 90, t, i); }); },
    draw(st, t) {
      const x = st.josh.x + 12, y = st.josh.y - 52;
      R(x, y, 12, 8, '#2b2f36'); R(x + 1, y + 1, 10, 6, '#3d434c'); circle(x + 6, y + 4, 2.5, '#141418'); P(x + 5, y + 3, '#8ab4ff'); R(x + 8, y - 2, 3, 2, '#2b2f36');
    },
  });

  // ================= 2. 晴天的披萨：把飘起来的配料放回去 =================
  const PZ = { x: 420, y: 214 };
  level('pizza', {
    bg: () => BGS.street(), ox: 30, lane: 262, filter: 'sepia(.25) saturate(1.3) brightness(1.18) hue-rotate(-6deg)', note: [40, 226],
    gx: 340, gdir: 1,
    setup(st) {
      st.me = G.actor({ sprite: 'me', x: 500, y: 262, dir: -1, seed: 0.7 });
      const kinds = ['pep', 'basil', 'pep', 'mush', 'pep', 'basil'];
      const spots = [[-22, -2], [-6, 3], [12, -3], [26, 2], [2, -6], [-14, 5]];
      st.tops = kinds.map((kind, i) => ({ kind, hx: 60 + rnd(i) * 520, hy: 40 + rnd(i + 9) * 110, p: rnd(i + 20) * 6, tx: PZ.x + spots[i][0], ty: PZ.y + spots[i][1], placed: false, fly: null }));
      st.n = 0;
    },
    tap(st, p) {
      const o = st.tops.find((o) => !o.placed && !o.fly && Math.hypot(p.x - o.cx, p.y - o.cy) < 14);
      if (!o) return false;
      AU.sfx('select');
      o.fly = { t0: G.t, x0: o.cx, y0: o.cy };
      setTimeout(() => { o.placed = true; o.fly = null; st.n++; AU.sfx('blip'); G.burst(o.tx, o.ty, 6, ['#fff3a0', '#ffffff'], { speed: 24, life: 0.5, g: 0, size: 1 }); tip(B().pizza.tip.replace('{n}', st.n)); }, 520);
      return true;
    },
    hover: (st, p) => st.tops.some((o) => !o.placed && !o.fly && Math.hypot(p.x - o.cx, p.y - o.cy) < 14),
    async play(st) {
      tip(B().pizza.tip.replace('{n}', 0));
      while (st.n < st.tops.length) await G.wait(100);
      G.gwen.face = 'happy'; st.me.face = 'happy';
    },
    draw(st, t) {
      bistroChair(PZ.x - 62, 262, 1); bistroChair(PZ.x + 62, 262, -1);
      clothTable(PZ.x, PZ.y + 6, 54, true, 262);
      lemonade(PZ.x - 40, PZ.y + 6); lemonade(PZ.x + 42, PZ.y + 5);
      ellipse(PZ.x, PZ.y + 4, 48, 13, '#7a4a2e'); ellipse(PZ.x, PZ.y + 3, 47, 12, '#a86a3a'); R(PZ.x + 46, PZ.y + 1, 10, 4, '#a86a3a');
      ellipse(PZ.x, PZ.y + 2, 44, 12, '#a86a3a'); ellipse(PZ.x, PZ.y, 44, 12, '#d8a060'); ellipse(PZ.x, PZ.y - 1, 39, 9, '#f5c84c'); ellipse(PZ.x - 6, PZ.y - 3, 22, 4, '#ffe08a');
      for (let i = 0; i < 4; i++) line(PZ.x, PZ.y - 1, PZ.x + Math.cos(i * 0.785) * 38, PZ.y - 1 + Math.sin(i * 0.785) * 9, '#e0a83c');
      st.tops.forEach((o) => {
        let x, y;
        if (o.placed) { x = o.tx; y = o.ty; }
        else if (o.fly) { const e = G.clamp((G.t - o.fly.t0) / 0.5, 0, 1); x = o.fly.x0 + (o.tx - o.fly.x0) * e; y = o.fly.y0 + (o.ty - o.fly.y0) * e - Math.sin(e * Math.PI) * 30; }
        else { x = o.hx + Math.sin(t * 0.7 + o.p) * 16; y = o.hy + Math.sin(t * 1.1 + o.p * 2) * 8; HD.glow(x, y, 14, '#fff3c9', 0.3); }
        o.cx = x; o.cy = y;
        topping(o.kind, Math.round(x), Math.round(y), o.placed);
        if (!o.placed && !o.fly && st.playing) arrow(x, y - 8, t, o.p);
      });
    },
  });
  function topping(kind, x, y, flat) {
    if (kind === 'pep') { if (flat) { ellipse(x, y, 4, 2, '#b8322a'); P(x - 1, y - 1, '#e0605a'); } else { circle(x, y, 5, '#2b2238'); circle(x, y, 4, '#b8322a'); circle(x - 1, y - 1, 2, '#e0605a'); P(x + 2, y + 1, '#8a2018'); } }
    else if (kind === 'basil') { if (flat) { R(x - 2, y, 4, 1, '#3a8a3a'); P(x, y - 1, '#5aae5a'); } else { R(x - 4, y - 2, 8, 5, '#2b2238'); R(x - 3, y - 1, 6, 3, '#3a8a3a'); R(x - 2, y - 2, 4, 1, '#5aae5a'); } }
    else { if (flat) { R(x - 2, y - 1, 4, 2, '#e8dcc8'); P(x, y + 1, '#b8a890'); } else { R(x - 5, y - 4, 10, 5, '#2b2238'); R(x - 4, y - 3, 8, 3, '#e8dcc8'); R(x - 1, y, 2, 3, '#d8c8b0'); P(x - 3, y - 3, '#ffffff'); } }
  }

  // ================= 3. 续命咖啡：跟着节拍点三下 =================
  const CUP = { x: 320, y: 184 };
  const beatOf = (st) => { const pos = AU.position(); return pos ? pos.beat : ((G.t - st.t0) * 88) / 60; };   // 没声音时用自己的钟
  level('coffee', {
    bg: () => BGS.street(), ox: 560, lane: 262, filter: 'sepia(.3) saturate(1.05) brightness(1.06)', note: [600, 120],
    gx: 228, gdir: 1,
    setup(st) { st.n = 0; st.miss = 0; },
    tap(st) {
      if (st.n >= 3) return false;
      const b = beatOf(st), ph = b - Math.round(b), S = B().coffee;
      if (Math.abs(ph) < 0.22 || st.miss >= 2) {
        st.n++; st.miss = 0;
        AU.sfx('ding');
        bubble(S.good[(st.n - 1) % S.good.length], CUP.x, 106, 800);
        G.burst(CUP.x, CUP.y - 6, 12, ['#ffffff', '#c8a070', '#9fd8ff'], { speed: 50, life: 0.6, g: 30, size: 2 });
        if (st.n < 3) tip(S.tip.replace('{step}', S.steps[st.n]).replace('{n}', st.n));
      } else { st.miss++; AU.sfx('click'); bubble(S.miss, CUP.x, 106, 1100); }
      return true;
    },
    hover: () => true,
    async play(st) {
      const S = B().coffee;
      tip(S.tip.replace('{step}', S.steps[0]).replace('{n}', 0));
      while (st.n < 3) await G.wait(100);
      await G.wait(600);
      G.gwen.face = 'happy';
    },
    draw(st, t) {
      // 店门口的小吧台
      const cx = CUP.x;
      coldBrewCart(cx, st.n >= 3 ? t * 0 : 0);
      const x = cx - 9, y = CUP.y, n = st.n;
      R(x - 1, y - 1, 20, 33, '#2b2238');
      R(x, y, 18, 31, '#e8f4fa'); R(x + 1, y + 1, 16, 29, '#d0e8f2');
      if (n >= 2) R(x + 1, y + 7, 16, 23, '#3a2418');
      if (n >= 1) for (const [ix, iy] of [[3, 18], [9, 14], [5, 9], [11, 21]]) { R(x + ix, y + iy, 5, 5, n >= 2 ? '#6a4a38' : '#f4fbff'); P(x + ix, y + iy, '#ffffff'); }
      if (n >= 3) { R(x + 1, y + 4, 16, 5, '#c8a070'); R(x + 1, y + 4, 16, 1, '#e8c898'); for (let i = 0; i < 6; i++) { const by = y + 27 - ((t * 14 + i * 5) % 20); P(x + 3 + ((i * 5) % 12), by, '#8a6a50'); } }
      R(x - 1, y - 2, 20, 3, '#ffffff'); R(x + 12, y - 9, 2, 8, '#00704a'); R(x, y, 1, 31, '#ffffff');
      // 节拍圈：从外往里收，收到中间的一刻点下去
      if (st.playing && st.n < 3) {
        const b = beatOf(st), ph = b - Math.floor(b), r = Math.round(10 + (1 - ph) * 26), hy = 130, near = ph > 0.78 || ph < 0.22;
        for (let a = 0; a < 6.283; a += 0.1) P(Math.round(cx + Math.cos(a) * r), Math.round(hy + Math.sin(a) * r * 0.9), near ? '#fff3a0' : '#ffe0c0');
        HD.glow(cx, hy, 16, '#fff3c9', near ? 0.5 : 0.2);
        DREAM.heart(cx - 5, hy - 5, 2, near ? '#ff6f9a' : '#ffb3d1');
      }
    },
  });

  // ================= 4. 毕业那天：找回散落的 5 朵花（春天的草坪） =================
  let lawnBg = null;
  const CLOUD = ['#c8d4e6', '#e2e8f2', '#f4f6fa', '#ffffff'];
  // 照着 CMU 的 Mall 尽头画：Hamerschlag Hall（奶油色石头、绿铜山花、正中一个大拱门、后面一座白色圆塔）
  // 背景是匹兹堡：右边高高的 Cathedral of Learning，左边一根烟囱；草坪左边一棵大悬铃木
  const STONE = ['#a8987a', '#bcae90', '#d0c3a6', '#ded3b8', '#ece4cc'];
  const ROOFC = ['#7a8c84', '#93a49c', '#aebcb4', '#c4d0c8'];
  function stoneWall(x, y, w, h) {
    R(x, y, w, h, STONE[2]);
    for (let r = 0; r * 6 < h; r++) { R(x, y + r * 6 + 5, w, 1, STONE[1]); for (let bx = x + (r % 2) * 9; bx < x + w; bx += 18) R(bx, y + r * 6, 1, 5, STONE[1]); }
    HD.dith(x, y, w, h, STONE[3], 0.12);
  }
  function arched(x, y, w, h, glass = '#3a404c') {
    R(x - 1, y - w / 2 - 1, w + 2, h + w / 2 + 2, STONE[0]);
    R(x, y, w, h, STONE[4]); circle(x + w / 2, y, w / 2, STONE[4]);
    R(x + 1, y, w - 2, h - 1, glass); circle(x + w / 2, y, w / 2 - 1, glass);
    HD.dgradV(x + 1, y - w / 2, w - 2, h * 0.6, '#8a9cb0', 0.45, 0);
    R(x + w / 2 - 0.5, y - w / 2 + 1, 1, h + w / 2 - 2, STONE[3]); R(x + 1, y + h * 0.45, w - 2, 1, STONE[3]);
    R(x - 1, y + h - 1, w + 2, 2, STONE[4]);
  }
  // 低矮的四坡屋顶（浅灰绿的金属屋面）
  function hipRoof(x0, x1, y0, h) {
    for (let r = 0; r < h; r++) { const inset = Math.round((h - r) * 1.6); R(x0 + inset, y0 + r, x1 - x0 - inset * 2, 1, r < 2 ? ROOFC[3] : r % 4 === 0 ? ROOFC[1] : ROOFC[2]); }
    for (let x = x0 + 8; x < x1 - 8; x += 7) R(x, y0 + 3, 1, h - 3, ROOFC[1]);
    R(x0 - 2, y0 + h, x1 - x0 + 4, 3, STONE[4]); R(x0 - 2, y0 + h + 3, x1 - x0 + 4, 1, STONE[0]);
  }
  // 悬铃木：浅色斑驳的树干 + 一大团嫩绿的树冠
  function sycamore(x, base, s, crownOnly) {
    if (!crownOnly) { R(x - 4 * s, base - 70 * s, 8 * s, 70 * s, '#cfc8b8'); for (let i = 0; i < 14; i++) R(x - 4 * s + rnd(i + x) * 7 * s, base - rnd(i + x + 1) * 68 * s, 3 * s, 4 * s, i % 2 ? '#a8a090' : '#e6e0d2'); line(x, base - 50 * s, x - 30 * s, base - 90 * s, '#b8b0a0'); line(x, base - 58 * s, x + 26 * s, base - 96 * s, '#b8b0a0'); alpha(0.3, () => ellipse(x, base, 34 * s, 4 * s, '#2a4a2a')); }
    const blobs = Array.from({ length: 22 }, (_, i) => [x - 60 * s + rnd(i + x * 2) * 120 * s, base - 80 * s - rnd(i + x * 2 + 3) * 70 * s, (14 + rnd(i + x * 2 + 6) * 10) * s]);
    blobs.forEach(([bx, by, r]) => circle(bx, by + 3, r, '#4a7a3e'));
    blobs.forEach(([bx, by, r]) => circle(bx - 1, by, r - 1, '#6a9a4a'));
    blobs.forEach(([bx, by, r]) => circle(bx - 4, by - 4, r * 0.6, '#8cb85e'));
    blobs.forEach(([bx, by, r]) => circle(bx - 6, by - 7, r * 0.25, '#b4d47e'));
  }
  function paintLawn() {
    const c = document.createElement('canvas'); c.width = 640; c.height = 360;
    const real = GFX.ctx; GFX.setCtx(c.getContext('2d'));
    // ---- 五月的天：淡淡的蓝，往下有一点薄雾 ----
    ['#86b4e0', '#92bce4', '#9ec4e8', '#aacbea', '#b6d2ec', '#c2d8ee', '#cddeef', '#d8e4f0', '#e2e8f0'].forEach((col, i) => { R(0, i * 24, 640, 25, col); if (i) HD.dith(0, i * 24 - 2, 640, 2, col, 0.5); });
    for (const [x, y, n, r] of [[60, 44, 5, 10], [380, 30, 6, 11], [250, 70, 3, 8]]) for (let i = 0; i < n; i++) DREAM.puff(x + i * r * 1.3, y + Math.sin(i * 1.9) * 4, r + (i % 2) * 3, CLOUD);
    // ---- 远处的匹兹堡：一排灰蓝色的楼、一根烟囱、一座信号塔，右边是 Cathedral of Learning ----
    for (const [x, w, h] of [[150, 40, 50], [196, 26, 64], [228, 44, 40], [392, 30, 46], [430, 50, 58], [486, 34, 38], [590, 50, 52]]) { R(x, 214 - h, w, h, '#a8b0bc'); R(x, 214 - h, w, 1, '#c0c6d0'); for (let wy = 214 - h + 5; wy < 210; wy += 6) for (let wx = x + 3; wx < x + w - 3; wx += 5) R(wx, wy, 2, 3, '#8e98a6'); }
    R(176, 96, 12, 120, '#c8c4bc'); R(176, 96, 3, 120, '#dcd8d0'); R(176, 96, 12, 3, '#a8a49c');
    for (let y = 110; y < 214; y += 6) { line(452, y, 458, y + 6, '#8e98a6'); line(458, y, 452, y + 6, '#8e98a6'); } R(451, 104, 1, 110, '#8e98a6'); R(458, 104, 1, 110, '#8e98a6');
    // Cathedral of Learning：一层层收进去的哥特式高塔，竖向的细棱
    const cx0 = 548;
    const tiers = [[60, 214, 120], [50, 120, 70], [40, 70, 48], [30, 48, 34], [18, 34, 22]];
    tiers.forEach(([w, bot, top]) => { R(cx0 - w / 2, top, w, bot - top, '#b4aca4'); R(cx0 - w / 2, top, 3, bot - top, '#c8c0b6'); R(cx0 + w / 2 - 3, top, 3, bot - top, '#9a928a'); for (let x = cx0 - w / 2 + 6; x < cx0 + w / 2 - 4; x += 5) R(x, top + 2, 1, bot - top - 2, '#a49c94'); });
    R(cx0 - 1, 12, 2, 10, '#9a928a');
    for (let y = 130; y < 210; y += 8) for (let x = cx0 - 24; x < cx0 + 24; x += 5) R(x, y, 2, 4, '#8a8278');
    // 楼后面和两边的一排树（填满地平线到草坪之间）
    R(0, 208, 640, 36, '#5e8e4a');
    for (let i = 0; i < 60; i++) { const x = i * 11 + rnd(i + 400) * 6, r = 9 + rnd(i + 401) * 7; circle(x, 212 - r * 0.3, r, '#4e7e40'); circle(x - 2, 209 - r * 0.4, r * 0.65, '#6a9a52'); circle(x - 4, 206 - r * 0.5, r * 0.25, '#8cb866'); }
    HD.dgradV(0, 186, 640, 30, '#dfe6ee', 0.5, 0);
    // ---- 两侧的翼楼：低矮的四坡屋顶 + 一排拱窗 ----
    for (const [x0, x1] of [[96, 262], [378, 544]]) {
      hipRoof(x0, x1, 150, 18);
      stoneWall(x0, 171, x1 - x0, 66);
      R(x0, 171, x1 - x0, 3, STONE[4]);
      for (let i = 0; i < 6; i++) arched(x0 + 12 + i * ((x1 - x0 - 24) / 6) + 1, 196, 14, 30);
      R(x0, 228, x1 - x0, 9, STONE[1]); R(x0, 228, x1 - x0, 1, STONE[4]);
    }
    // ---- 后面的白色圆塔：高高的拱形开口 + 顶上一圈栏杆 + 更小的一层 ----
    const tx = 320;
    R(tx - 30, 92, 60, 22, STONE[3]); R(tx - 32, 90, 64, 3, STONE[4]);
    R(tx - 25, 40, 50, 52, STONE[3]);
    for (let i = 0; i < 6; i++) { const k = i / 5, ox = Math.round(tx - 22 + k * 40); const sh = Math.abs(k - 0.4); R(ox - 3, 50, 6, 36, sh < 0.2 ? '#4a4840' : '#5a5650'); circle(ox, 50, 3, sh < 0.2 ? '#4a4840' : '#5a5650'); R(ox + 3, 46, 2, 42, sh < 0.3 ? STONE[4] : STONE[2]); }
    R(tx - 25, 40, 4, 52, STONE[4]); R(tx + 21, 40, 4, 52, STONE[1]);
    R(tx - 28, 36, 56, 5, STONE[4]); for (let x = tx - 26; x < tx + 26; x += 3) R(x, 31, 1, 5, STONE[2]); R(tx - 28, 30, 56, 2, STONE[4]);
    R(tx - 13, 18, 26, 13, STONE[3]); R(tx - 13, 18, 3, 13, STONE[4]); R(tx - 15, 16, 30, 3, STONE[4]); R(tx - 1, 8, 2, 9, '#7a7468');
    // ---- 正中的门厅：绿铜边的山花、四根壁柱、一个大拱门（拱里是红色的马赛克，挂着横幅） ----
    const px0 = 258, pw = 124;
    for (let r = 0; r < 26; r++) { const w = pw + 8 - r * 4.8; R(tx - w / 2, 130 - r, w, 1, r < 2 ? '#4f7f6e' : STONE[3]); }
    for (let r = 0; r < 26; r++) { const w = pw + 8 - r * 4.8; R(tx - w / 2 - 2, 130 - r, 3, 1, '#4f7f6e'); R(tx + w / 2 - 1, 130 - r, 3, 1, '#4f7f6e'); }
    for (let r = 4; r < 22; r += 4) { const w = pw - 10 - r * 4.8; if (w > 8) R(tx - w / 2, 128 - r, w, 1, STONE[1]); }
    R(px0 - 4, 130, pw + 8, 4, STONE[4]); R(px0 - 4, 133, pw + 8, 1, STONE[0]);
    stoneWall(px0, 134, pw, 104);
    for (const ox of [px0 + 2, px0 + 18, pw + px0 - 30, pw + px0 - 14]) { R(ox, 136, 12, 100, STONE[3]); R(ox, 136, 2, 100, STONE[4]); R(ox + 10, 136, 2, 100, STONE[1]); R(ox - 1, 136, 14, 3, STONE[4]); }
    // 大拱门
    R(tx - 26, 160, 52, 78, STONE[0]); circle(tx, 162, 26, STONE[0]);
    R(tx - 24, 162, 48, 76, '#9a4a3e'); circle(tx, 162, 24, '#9a4a3e');
    for (let i = 0; i < 30; i++) P(tx - 22 + rnd(i + 5) * 44, 142 + rnd(i + 6) * 90, rnd(i) > 0.5 ? '#c86a52' : '#7a3a32');
    for (let a = 3.2; a < 6.25; a += 0.18) { R(Math.round(tx + Math.cos(a) * 21), Math.round(162 + Math.sin(a) * 21), 2, 2, '#e0b070'); }
    R(tx - 18, 168, 36, 70, '#5a2e2a');
    arched(tx - 10, 150, 20, 22, '#4a5260');
    R(tx - 9, 212, 18, 26, '#2e2630'); R(tx - 1, 212, 2, 26, '#5a4a4e');
    // 横幅：恭喜毕业（CMU 的红）
    R(tx - 15, 176, 30, 32, '#c41230'); R(tx - 15, 176, 30, 2, '#e8475e'); R(tx - 15, 206, 30, 2, '#8a0c20');
    GFX.text('CONGRATS', tx - 14, 182, '#ffffff'); GFX.text('GRADS', tx - 9, 192, '#ffffff'); DREAM.heart(tx - 3, 199, 1, '#ffd6e0');
    // ---- 前面的台阶和石头矮墙 ----
    R(80, 236, 480, 6, STONE[1]); R(80, 236, 480, 1, STONE[4]);
    for (let k = 0; k < 4; k++) { R(tx - 34 - k * 4, 238 + k * 4, 68 + k * 8, 4, k % 2 ? STONE[2] : STONE[3]); R(tx - 34 - k * 4, 238 + k * 4, 68 + k * 8, 1, STONE[4]); }
    for (const sx of [tx - 54, tx + 38]) { R(sx, 232, 16, 22, STONE[2]); R(sx, 232, 16, 2, STONE[4]); R(sx + 14, 232, 2, 22, STONE[0]); }
    // ---- 草坪：一大片嫩绿，中间一条横穿的人行道，右边弯过去 ----
    R(0, 242, 640, 118, '#6aa84e');
    for (let i = 0; i < 9; i++) { const y = 246 + i * 13; R(0, y, 640, 13, i % 2 ? '#72b056' : '#66a44a'); HD.dith(0, y, 640, 2, i % 2 ? '#66a44a' : '#72b056', 0.5); }
    HD.fadeV(0, 242, 640, 10, '#3a6a32', 0.4, 0);
    R(0, 254, 640, 9, '#d6d0c4'); R(0, 254, 640, 1, '#ece8de'); R(0, 262, 640, 1, '#b4ae a0'.replace(' ', ''));
    for (let x = 0; x < 640; x += 26) R(x, 255, 1, 7, '#c4beb2');
    for (let y = 263; y < 360; y++) { const w = 26 + (y - 263) * 0.5; R(tx - w / 2, y, w, 1, y % 5 ? '#d6d0c4' : '#c8c2b6'); }
    // 草地上的小雏菊和小草
    for (let i = 0; i < 120; i++) { const x = rnd(i + 30) * 640, y = 268 + rnd(i + 31) * 84; if (Math.abs(x - tx) < 30) continue; if (rnd(i + 32) > 0.78) { R(x, y, 1, 2, '#ffffff'); R(x - 1, y + 1, 3, 1, '#ffffff'); P(x, y + 1, '#ffd23f'); } else { P(x, y, '#4e8a3e'); P(x + 1, y - 1, '#4e8a3e'); P(x + 2, y, '#4e8a3e'); } }
    // 路边的长椅和黑色路灯
    FX.block(520, 270, 70, 5, '#8a6a4a', { top: 3, side: 2 }); R(520, 256, 70, 4, '#7a5a3e'); R(520, 262, 70, 4, '#7a5a3e');
    for (const lx of [524, 584]) { R(lx, 275, 3, 14, '#2b2f36'); R(lx, 258, 3, 14, '#2b2f36'); }
    for (const lx of [196, 446]) { R(lx, 214, 2, 42, '#2b2f36'); R(lx - 3, 206, 8, 9, '#2b2f36'); R(lx - 2, 207, 6, 7, '#fff3c9'); R(lx - 4, 204, 10, 2, '#3d434c'); }
    // 左边一棵大悬铃木（只露出一部分，框住画面），右边一棵小一点的
    sycamore(46, 262, 1.25);
    sycamore(618, 252, 0.8);
    // 最前面一排郁金香
    for (let i = 0; i < 46; i++) { const x = 6 + i * 14 + rnd(i) * 5, y = 344 + rnd(i + 3) * 8, col = ['#ff6f9a', '#ffd23f', '#b9a3d6', '#ff9a6a', '#ffffff'][i % 5]; R(x, y, 1, 14, '#3c7e4c'); R(x - 3, y + 5, 3, 2, '#5c9e6c'); R(x + 1, y + 7, 3, 2, '#5c9e6c'); R(x - 3, y - 6, 7, 6, '#2b2238'); R(x - 2, y - 5, 5, 5, col); R(x - 2, y - 6, 1, 2, col); R(x + 2, y - 6, 1, 2, col); P(x - 1, y - 4, '#ffffff'); }
    GFX.setCtx(real);
    return FX.bake(c, FX.BAKE.street);
  }
  // 风里飘着的小花瓣和悬铃木的绒毛
  function petals(t) {
    for (let i = 0; i < 22; i++) { const sp = 10 + rnd(i) * 10, y = (rnd(i + 40) * 360 + t * sp) % 380 - 20, x = (rnd(i + 80) * 700 + Math.sin(t * 0.9 + i) * 20 + t * 10) % 680 - 20; if (i % 3) { R(x, y, 2, 1, i % 2 ? '#ffd6e6' : '#fff6e0'); } else { P(x, y, '#ffffff'); P(x - 1, y, '#ffffff'); P(x + 1, y, '#ffffff'); P(x, y - 1, '#ffffff'); } }
  }
  const WRAP = { x: 396, y: 226 };
  level('bouquet', {
    bg: () => lawnBg || (lawnBg = paintLawn()), ox: 0, lane: 270, filter: 'sepia(.15) saturate(1.1) brightness(1.04)', note: [556, 248],
    gx: 236, gdir: 1,
    setup(st) {
      st.me = G.actor({ sprite: 'me', x: 408, y: 270, dir: -1, seed: 0.7 });
      const C = [['#f7a8c4', '#ff7aa8'], ['#ffd23f', '#e8a020'], ['#b9a3d6', '#8a6ab8'], ['#fff6fa', '#e8c8d8'], ['#ffb38a', '#e8704a']];
      const AT = [[92, 120], [610, 150], [180, 162], [372, 246], [468, 306]];
      st.flowers = AT.map(([x, y], i) => ({ x, y, c: C[i], p: i * 1.3, got: false, fly: null }));
      st.n = 0;
    },
    tap(st, p) {
      const f = st.flowers.find((f) => !f.got && !f.fly && Math.hypot(p.x - f.x, p.y - f.y) < 14);
      if (!f) return false;
      AU.sfx('select');
      f.fly = { t0: G.t };
      setTimeout(() => { f.got = true; f.fly = null; st.n++; AU.sfx('blip'); tip(B().bouquet.tip.replace('{n}', st.n)); G.burst(WRAP.x, WRAP.y - 10, 8, [f.c[0], '#ffffff'], { speed: 30, life: 0.6, g: 0, size: 1 }); }, 650);
      return true;
    },
    hover: (st, p) => st.flowers.some((f) => !f.got && !f.fly && Math.hypot(p.x - f.x, p.y - f.y) < 14),
    async play(st) {
      tip(B().bouquet.tip.replace('{n}', 0));
      while (st.n < 5) await G.wait(100);
      G.gwen.face = 'happy'; st.me.face = 'happy';
    },
    draw(st, t) { petals(t); },
    drawFg(st, t) {
      const x = WRAP.x, y = WRAP.y;
      st.flowers.forEach((f, i) => { if (f.got) flower(x - 8 + i * 4, y - 8 - (i % 2) * 4, f.c, 0.8); });
      wrapPaper(x, y);
      st.flowers.forEach((f) => {
        if (f.got) return;
        let fx = f.x, fy = f.y + Math.sin(t * 1.4 + f.p) * 1.5;
        if (f.fly) { const e = G.clamp((G.t - f.fly.t0) / 0.6, 0, 1); fx = f.x + (x - f.x) * e; fy = fy + (y - 10 - fy) * e - Math.sin(e * Math.PI) * 40; }
        if (Math.sin(t * 1.5 + f.p * 2) > 0.85) { R(fx + 7, fy - 9, 1, 5, '#ffffff'); R(fx + 5, fy - 7, 5, 1, '#ffffff'); }
        flower(Math.round(fx), Math.round(fy), f.c, 1.3);
        if (!f.fly && st.playing) arrow(fx, fy - 8, t, f.p);
      });
    },
  });
  function flower(x, y, c, s) {
    R(x, y + 2, 1, 6 * s, '#3c7e4c'); P(x + 1, y + 5, '#5fa06f');
    for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) circle(x + dx * s, y + dy * s, 2.2 * s, c[0]);
    circle(x, y, 1.5 * s, c[1]); P(x - 1, y - 1, '#ffffff');
  }

  // ================= 5. 夜里的小蛋糕：一层层叠起来（休息室） =================
  const PLATE = { x: 330, y: 222 };
  const LAYERS = [{ w: 64, h: 11, c: ['#e8c890', '#f3d9a0', '#c8a060'] }, { w: 58, h: 8, c: ['#f4ece0', '#fff8ee', '#e0d4c4'] }, { w: 52, h: 10, c: ['#f6c84a', '#ffe08a', '#d8a030'] }];
  level('mango', {
    bg: () => BGS.lounge(), ox: 0, lane: 256, filter: 'sepia(.22) saturate(1.15) brightness(1.08)', note: [96, 156],
    gx: 220, gdir: 1,
    setup(st) {
      st.me = G.actor({ sprite: 'me', x: 440, y: 256, dir: -1, seed: 0.7 });
      st.stack = []; st.drop = null; st.n = 0;
    },
    tap(st) {
      if (st.drop || st.n >= 3) return false;
      const x = PLATE.x + Math.sin(G.t * 2.1) * 92;
      AU.sfx('whoosh');
      st.drop = { x0: x, t0: G.t, i: st.n };
      setTimeout(() => {
        const off = Math.round((st.drop.x0 - PLATE.x) * 0.12);
        st.stack.push({ i: st.drop.i, off }); st.drop = null; st.n++;
        AU.sfx('clack'); G.shake = 1.5;
        tip(B().mango.tip.replace('{n}', st.n));
      }, 420);
      return true;
    },
    hover: () => true,
    async play(st) {
      tip(B().mango.tip.replace('{n}', 0));
      while (st.n < 3) await G.wait(100);
      await G.wait(300);
      st.topped = G.t; AU.sfx('ding');
      G.burst(PLATE.x, PLATE.y - 36, 22, ['#ffe08a', '#ffffff', '#ff8fb3'], { speed: 60, life: 0.9, g: 30, size: 2 });
      await G.wait(700);
      G.gwen.face = 'happy'; st.me.face = 'happy';
    },
    draw(st, t) {
      // 休息室的灯是暗的，只有桌上一点暖光
      alpha(0.45, () => R(0, 0, 640, 360, '#140c20'));
      const op = GFX.ctx.globalCompositeOperation; GFX.ctx.globalCompositeOperation = 'lighter';
      HD.glow(PLATE.x, PLATE.y - 30, 170, '#ffb070', 0.32);
      GFX.ctx.globalCompositeOperation = op;
      clothTable(PLATE.x, PLATE.y + 4, 46, false, 256);
      ellipse(PLATE.x, PLATE.y, 40, 5, '#e8dce8'); ellipse(PLATE.x, PLATE.y - 1, 38, 4, '#ffffff');
      let top = PLATE.y - 1;
      const layer = (L, x, y) => { R(x - L.w / 2 - 1, y - L.h - 1, L.w + 2, L.h + 2, '#2b2238'); R(x - L.w / 2, y - L.h, L.w, L.h, L.c[0]); R(x - L.w / 2, y - L.h, L.w, 2, L.c[1]); R(x - L.w / 2, y - 1, L.w, 1, L.c[2]); };
      st.stack.forEach((s) => { const L = LAYERS[s.i]; layer(L, PLATE.x + s.off, top); top -= L.h; });
      if (st.topped) {
        for (const [dx, dy] of [[-16, -3], [-6, -4], [6, -3], [16, -4], [0, -6]]) { R(PLATE.x + dx - 2, top + dy, 4, 4, '#f6a03c'); P(PLATE.x + dx - 2, top + dy, '#ffd08a'); }
        R(PLATE.x - 1, top - 16, 3, 10, '#ff8fb3'); const fl = Math.sin(t * 9) > 0 ? 1 : 0; R(PLATE.x - fl, top - 21, 2 + fl, 4, '#ffd66b'); P(PLATE.x, top - 22, '#ffffff');
        HD.glow(PLATE.x, top - 19, 22, '#ffd08a', 0.35);
      }
      if (st.playing && st.n < 3) {
        const i = st.drop ? st.drop.i : st.n, L = LAYERS[i];
        let x = st.drop ? st.drop.x0 : PLATE.x + Math.sin(G.t * 2.1) * 92, y = 120;
        if (st.drop) { const e = G.clamp((G.t - st.drop.t0) / 0.4, 0, 1); x = x + (PLATE.x + Math.round((st.drop.x0 - PLATE.x) * 0.12) - x) * e; y = 120 + (top - 120) * e * e; }
        else alpha(0.35, () => { for (let yy = 124; yy < top - 4; yy += 6) R(Math.round(x), yy, 1, 3, '#ffffff'); });
        layer(L, Math.round(x), Math.round(y));
      }
    },
  });

  // ================= 结尾：屋顶上的蛋糕、合影和许愿 =================
  // Baiding 先上来摆好桌子和珍珠蛋糕 → 大家上来合影（蛋糕在照片中间）→ 大家下楼 → 许愿 → 屋顶荡开变成梦
  const CAKE_DY = 54;   // 把终章那张桌子挪到屋顶上（屋顶的地面更低）
  let cg;
  G.def('br_cg', {
    k: 1, width: 640, floor: ROOF_LANE, noWalk: true, fixedCam: true, bgm: 'yumeHub',
    grade: { c: '#9fb0ff', a: 0.05, vig: 0.22 },
    setup() {
      cg = { flexX: 700, count: null, door: 0, cakeA: 0, flames: [0, 0, 0, 0, 0], wish: 0 };
      G.gwen = G.actor({ sprite: 'gwen', x: 300, y: ROOF_LANE, dir: 1, speed: 100, seed: 0.3 });
      cg.cat = catActor(196, ROOF_LANE);
      // 大家都从楼梯间的门里走出来
      cg.me = G.actor({ sprite: 'me', x: DOOR_X, y: ROOF_LANE, dir: -1, speed: 110, seed: 0.7, visible: false });
      cg.josh = G.actor({ sprite: 'josh', x: DOOR_X, y: ROOF_LANE, dir: -1, speed: 120, seed: 0.9, visible: false });
      cg.bex = G.actor({ sprite: 'pi', x: DOOR_X, y: ROOF_LANE, dir: -1, speed: 110, seed: 0.5, visible: false });
    },
    async start() {
      const S = B();
      G.lock();
      await G.wait(500);
      // 1. Baiding 先上来，摆好桌子，打开蛋糕，一根根点上蜡烛
      AU.sfx('door'); cg.door = 1; cg.me.visible = true;
      await G.walk(cg.me, 412); cg.me.dir = -1; cg.door = 0;
      G.gwen.dir = 1;
      await G.say(S.gather[0][0], S.gather[0][1], { face: 'happy' });
      await G.walk(G.gwen, 214); G.gwen.dir = 1;
      await G.say(S.cakeSet[0][0], S.cakeSet[0][1]);
      AU.sfx('whoosh');
      await G.tween(cg, { cakeA: 1 }, 700);
      G.burst(320, 212, 20, ['#ffe08a', '#ffffff', '#ff8fb3'], { speed: 60, life: 0.8, g: 20, size: 2 });
      for (let i = 0; i < 5; i++) { AU.sfx('blip'); await G.tween(cg.flames, { [i]: 1 }, 220); }
      await G.talk(S.cakeSet.slice(1));
      // 2. 其他人也上来了，围着蛋糕站好
      AU.sfx('door'); cg.door = 1;
      cg.josh.visible = true; G.walk(cg.josh, 170).then(() => (cg.josh.dir = 1));
      setTimeout(() => { cg.bex.visible = true; G.walk(cg.bex, 128).then(() => (cg.bex.dir = 1)); }, 500);
      G.tween(cg, { flexX: 410 }, 2400);
      await G.wait(3600);
      cg.door = 0; AU.sfx('door');
      cg.josh.dir = 1; cg.bex.dir = 1; G.gwen.dir = 1; cg.me.dir = -1;
      await G.talk(S.gather.slice(1, 3));
      await G.say(S.gather[3][0], S.gather[3][1]);
      [G.gwen, cg.me, cg.josh, cg.bex].forEach((a) => (a.face = 'happy'));
      await G.tween(cg.cat, { hop: 26 }, 220); cg.cat.visible = false;
      for (const n of [3, 2, 1]) { cg.count = { n, t0: G.t }; AU.sfx('beep'); await G.wait(700); }
      cg.count = null;
      cg.cat.visible = true; cg.cat.x = cg.flexX + 54; cg.cat.y = ROOF_LANE - 122; cg.cat.hop = 0;
      await G.wait(60);
      // 拍下这一刻：截下画面中间这一块，做成拍立得
      const snap = document.createElement('canvas'); snap.width = 400; snap.height = 210;
      snap.getContext('2d').drawImage(G.ctx.canvas, 112, 100, 400, 210, 0, 0, 400, 210);
      AU.sfx('flash');
      await G.flash();
      try { localStorage.setItem('gwen1126-cg', snap.toDataURL()); } catch (e) {}
      await G.wait(500);
      await card(snap);
      await G.wait(400);
      // 3. 大家道别下楼，Flex 也慢慢滑走，猫跳回 Gwen 脚边
      await G.talk(S.afterPhoto);
      cg.door = 1; AU.sfx('door');
      const gone = [cg.josh, cg.bex].map((a) => { a.speed = 120; return G.walk(a, DOOR_X).then(() => (a.visible = false)); });
      G.tween(cg, { flexX: 700 }, 2600);
      cg.cat.x = 180; cg.cat.y = ROOF_LANE;
      await Promise.all(gone);
      cg.door = 0; AU.sfx('door');
      G.gwen.face = null; cg.me.face = null;
      await G.wait(900);
      // 4. 许愿：Gwen 闭上眼睛，烛光越来越亮，整个屋顶荡开变成梦
      await G.talk(S.wish.slice(0, 2));
      G.gwen.face = 'blink';
      await G.say(S.wish[2][0], S.wish[2][1]);
      AU.sfx('heal');
      await G.tween(cg, { wish: 1 }, 1600);
      const frame = document.createElement('canvas'); frame.width = 640; frame.height = 360;
      frame.getContext('2d').drawImage(G.ctx.canvas, 0, 0);
      G.scenes.finale.bgm = 'yumeHub';
      G.goto('finale', { branch: true, noFade: true, snap: frame });
    },
    exit() { G.layer.querySelectorAll('.cg-wrap').forEach((e) => e.remove()); },
    draw(ctx, t) {
      drawRoof(t, () => 1, { door: cg.door || 0 });
      HD.flex(Math.round(cg.flexX), ROOF_LANE - 124, { mood: 'love', gx: 0.5, dip: 0 }, t);
      [G.gwen, cg.me, cg.josh, cg.bex].forEach(shadow);
    },
    drawFg(ctx, t) {
      // 桌子在大家前面（挡住腿），蛋糕上的烛光照亮周围
      if (cg.cakeA > 0) alpha(cg.cakeA, () => FIN_CAKE(0, CAKE_DY, t, { flames: cg.flames }));
      const lit = cg.flames.reduce((a, b) => a + b, 0) / 5;
      if (lit > 0) {
        const op = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'lighter';
        HD.glow(320, 200, 120 + cg.wish * 200, '#ffb860', (0.18 + cg.wish * 0.5) * lit);
        ctx.globalCompositeOperation = op;
      }
      if (cg.wish > 0) alpha(cg.wish * 0.55, () => R(0, 0, 640, 360, '#fff0f6'));
      if (cg.count) { const e = (G.t - cg.count.t0) / 0.7; alpha(1 - e * 0.6, () => GFX.text(String(cg.count.n), 312, 70 - e * 8, '#fff3a0', 5)); }
    },
  });
  function card(snap) {
    const S = B();
    const w = G.el(`<div class="cg-wrap"><div class="cg-card"><div class="cg-photo"></div><div class="cg-t">${S.photoTitle}</div><div class="cg-s">${S.photoSub}</div><div class="cg-tap">${S.photoTap}</div></div></div>`);
    snap.className = 'cg-img'; w.querySelector('.cg-photo').appendChild(snap);
    AU.sfx('pickup');
    return new Promise((res) => setTimeout(() => {
      w.classList.add('ready');
      w.addEventListener('pointerdown', (e) => { e.stopPropagation(); AU.sfx('select'); w.classList.add('out'); setTimeout(() => { w.remove(); res(); }, 450); }, { once: true });
    }, 1400));
  }

  // 开发用：直接进支线 / 某一关 / 直接拍合影
  function devStart(where) {
    markSeen();
    G.resetSave(); G.flags.br = { intro: true };
    if (where === 'cg') { KEYS.forEach((k) => (flags()[k] = true)); G.persist(); G.goto('br_cg'); return; }
    if (where && where !== 'hub') { G.goto('br_' + where); return; }
    G.flags.br = {}; G.persist(); G.goto('roof');
  }

  // 梦里（隐藏结局、通关后的标题页）：点到还没看过手记的那几件回忆，就打开那张手记
  DREAM.mark = unread;
  DREAM.onMem = (k) => { if (!unread(k)) return false; takeNote(k); return true; };

  return { invite, devStart, KEYS, notes, showNote, seen };
})();
