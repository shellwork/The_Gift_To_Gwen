// 序章：早晨的家（高清 640×360 样板场景）
(() => {
  const { R, P, line, circle, ellipse, alpha, text } = GFX;
  const S = STORY.home;
  const W = 820, LANE = 256;
  let st, bg = null;

  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  // ---------- 机械臂（黑色 6 轴，简单 IK） ----------
  const ARM = { bx: 532, by: 206, L: [26, 22, 12] };
  function ik(tx, ty) {
    const sx = ARM.bx, sy = ARM.by - 12;
    const wx = tx, wy = ty - ARM.L[2];
    let dx = wx - sx, dy = sy - wy;
    let d = Math.hypot(dx, dy); const L1 = ARM.L[0], L2 = ARM.L[1];
    d = Math.min(d, L1 + L2 - 0.5);
    const a2 = Math.acos((d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2));
    const base = Math.atan2(dy, dx);
    const a1 = base + Math.atan2(L2 * Math.sin(a2), L1 + L2 * Math.cos(a2));
    const elbow = -a2;
    return [a1, elbow, -Math.PI / 2 - (a1 + elbow)];
  }
  const POSE_REST = [1.75, -1.25, -0.7];

  function drawArm(a, t, holding) {
    const { bx, by, L } = ARM;
    // 底座
    R(bx - 11, by - 4, 22, 4, '#1a1a20'); R(bx - 11, by - 4, 22, 1, '#3a3a44');
    R(bx - 7, by - 9, 14, 5, '#22222a'); R(bx - 7, by - 9, 14, 1, '#44444f');
    P(bx - 9, by - 2, '#62626e'); P(bx + 8, by - 2, '#62626e');
    R(bx - 4, by - 12, 8, 3, '#2a2a33');
    let px = bx, py = by - 12, ang = a[0];
    const joints = [[px, py]];
    for (let i = 0; i < 3; i++) {
      if (i > 0) ang += a[i];
      const nx = px + Math.cos(ang) * L[i], ny = py - Math.sin(ang) * L[i];
      const th = [6, 5, 3][i];
      line(px, py, nx, ny, '#16161c', th + 2);
      line(px, py, nx, ny, '#2a2a33', th);
      line(px + Math.cos(ang + 1.57) * (th / 2 - 1), py - Math.sin(ang + 1.57) * (th / 2 - 1), nx + Math.cos(ang + 1.57) * (th / 2 - 1), ny - Math.sin(ang + 1.57) * (th / 2 - 1), '#4a4a56', 1);
      px = nx; py = ny; joints.push([px, py]);
    }
    joints.slice(0, 3).forEach(([qx, qy], i) => { circle(qx, qy, i === 0 ? 5 : 4, '#16161c'); circle(qx, qy, i === 0 ? 4 : 3, '#3a3a44'); P(qx - 1, qy - 1, '#7a7a88'); });
    // 线缆
    const [j1x, j1y] = joints[1];
    for (let i = 0; i <= 8; i++) { const k = i / 8; P(bx + 6 + (j1x + 5 - bx - 6) * k, by - 8 + (j1y - by + 8) * k + Math.sin(k * 3.14) * 3, '#5a4a7a'); }
    // 夹爪
    const ga = ang + Math.PI / 2;
    for (const sgn of [1, -1]) {
      const gx = px + Math.cos(ga) * 2.5 * sgn, gy = py - Math.sin(ga) * 2.5 * sgn;
      line(gx, gy, gx + Math.cos(ang) * 5, gy - Math.sin(ang) * 5, '#16161c', 2);
    }
    // 指示灯
    P(bx + 3, by - 7, Math.floor(t * 2) % 2 ? '#7cf0a0' : '#3a8a5a');
    if (holding) keys(px + Math.cos(ang) * 6 - 3, py - Math.sin(ang) * 6);
  }
  function keys(x, y) {
    R(x, y, 6, 6, '#c9a640'); R(x + 1, y + 1, 4, 4, '#f6d27a'); R(x + 2, y + 2, 2, 2, '#8a6a20');
    R(x + 5, y + 2, 6, 2, '#a8a8b4'); R(x + 9, y + 3, 2, 3, '#a8a8b4'); R(x + 7, y + 3, 1, 2, '#a8a8b4');
    R(x - 3, y + 4, 4, 5, '#e98fa6'); P(x - 2, y + 5, '#ffd0dc');
  }

  // ---------- 静态背景（预渲染） ----------
  function paintBg() {
    const c = document.createElement('canvas'); c.width = W; c.height = 360;
    const g = c.getContext('2d'); const real = GFX.ctx; GFX.setCtx(g);
    const PW = HD.PAL.wood, PC = HD.PAL.cream, PK = HD.PAL.pink, PL = HD.PAL.leaf;

    // 墙纸
    R(0, 0, W, 240, PC[4]);
    for (let x = 0; x < W; x += 12) { R(x, 14, 6, 162, '#f8ead3'); }
    for (let y = 26; y < 172; y += 18) for (let x = (y / 18) % 2 ? 3 : 9; x < W; x += 12) { P(x, y, '#e9c9b8'); P(x - 1, y + 1, '#e9c9b8'); P(x + 1, y + 1, '#e9c9b8'); P(x, y + 2, '#e9c9b8'); P(x, y + 1, '#f2b8b8'); }
    HD.fadeV(0, 14, W, 30, '#b88a70', 0.18, 0);
    // 护墙板
    R(0, 176, W, 60, PC[3]); R(0, 176, W, 3, PW[4]); R(0, 179, W, 1, PW[2]);
    for (let x = 6; x < W; x += 46) { R(x, 186, 38, 42, PC[2]); R(x + 1, 187, 36, 40, PC[3]); R(x + 1, 187, 36, 1, PC[1]); R(x + 1, 226, 36, 1, PC[5]); }
    // 踢脚线 + 地板
    R(0, 236, W, 8, PW[3]); R(0, 236, W, 1, PW[5]); R(0, 243, W, 1, PW[1]);
    for (let y = 244, row = 0; y < 360; y += 11, row++) {
      R(0, y, W, 11, row % 2 ? PW[3] : '#ad774d');
      R(0, y, W, 1, PW[2]); R(0, y + 1, W, 1, row % 2 ? PW[4] : '#bf8a5b');
      const f = 1 + ((y - 244) / 116) * 0.5;   // 越靠近镜头，木板接缝越宽（透视）
      for (let x = (row * 37) % 70 - 140; x < W + 140; x += 70) { const xx = Math.round(W / 2 + (x - W / 2) * f); R(xx, y, 1, 11, PW[1]); R(xx + 1, y + 1, 1, 9, row % 2 ? PW[4] : '#bf8a5b'); }
      for (let i = 0; i < 26; i++) { const gx = rnd(row * 50 + i) * W, gy = y + 3 + Math.floor(rnd(row * 70 + i) * 6); R(gx, gy, 6 + rnd(i + row) * 10, 1, row % 2 ? '#a06c45' : '#9a6540'); }
    }
    HD.fadeV(0, 244, W, 14, PW[0], 0.35, 0);
    // 天花板木梁
    R(0, 0, W, 14, PW[2]); R(0, 0, W, 2, PW[1]); R(0, 12, W, 2, PW[0]); for (let x = 0; x < W; x += 60) R(x, 2, 1, 10, PW[1]);

    // ===== 窗户 =====
    const wx = 60, wy = 54, ww = 112, wh = 96;
    R(wx - 6, wy - 6, ww + 12, wh + 12, '#e9e2d8'); R(wx - 6, wy - 6, ww + 12, 2, '#ffffff'); R(wx - 6, wy + wh + 4, ww + 12, 2, '#c3bcb0');
    HD.dgradV(wx, wy, ww, wh, '#86bde4', 1, 1);
    HD.dgradV(wx, wy, ww, wh, '#c8e5f7', 0, 1);
    circle(wx + 84, wy + 22, 11, '#fff7d0'); circle(wx + 84, wy + 22, 8, '#ffffff');
    HD.glow(wx + 84, wy + 22, 22, '#fff6c8', 0.5);
    [[20, 26, 12], [36, 22, 8], [62, 40, 10], [72, 38, 6]].forEach(([cx, cy, r]) => { ellipse(wx + cx, wy + cy, r, Math.ceil(r / 3), '#ffffff'); });
    // 远处的山坡和房子
    for (let x = 0; x < ww; x++) { const h = 22 + Math.sin(x * 0.06) * 6 + Math.sin(x * 0.17) * 2; R(wx + x, wy + wh - h, 1, h, '#9cc7a8'); }
    const houseC = ['#e8b4a0', '#f4dcb0', '#c9d8e6', '#e9c4d0', '#d8c0a8'];
    for (let i = 0; i < 9; i++) { const hx = wx + 4 + i * 12, hy = wy + wh - 22 - Math.round(Math.sin(i * 0.8) * 5); R(hx, hy, 9, 9, houseC[i % 5]); R(hx - 1, hy - 3, 11, 3, '#a0625a'); P(hx + 3, hy + 3, '#ffe9a0'); P(hx + 6, hy + 3, '#7fa6bf'); }
    for (let i = 0; i < 8; i++) { const tx = wx + 6 + i * 14 + (i % 2) * 5; circle(tx, wy + wh - 8, 5, '#5c9e6c'); circle(tx - 2, wy + wh - 10, 3, '#86c08a'); }
    R(wx, wy + wh - 4, ww, 4, '#6a9f80');
    line(wx, wy + 30, wx + ww, wy + 36, '#5a6070'); // 电线
    R(wx + ww / 2 - 1, wy, 3, wh, '#f4efe8'); R(wx, wy + wh / 2 - 1, ww, 3, '#f4efe8');
    alpha(0.35, () => { for (let i = 0; i < 4; i++) line(wx + 10 + i * 4, wy + 40, wx + 26 + i * 4, wy + 8, '#ffffff'); line(wx + 70, wy + 90, wx + 92, wy + 56, '#ffffff'); });
    // 窗台
    R(wx - 10, wy + wh + 6, ww + 20, 5, '#f4efe8'); R(wx - 10, wy + wh + 11, ww + 20, 2, '#c3bcb0');
    R(wx + 8, wy + wh - 2, 10, 8, '#d9946a'); R(wx + 8, wy + wh - 2, 10, 2, '#e8ae80'); circle(wx + 13, wy + wh - 6, 5, PL[3]); circle(wx + 11, wy + wh - 8, 2, PL[4]);
    R(wx + 92, wy + wh, 8, 6, '#a9c4e8'); R(wx + 93, wy + wh - 3, 6, 4, '#f6d27a'); P(wx + 97, wy + wh - 2, '#2b2238');
    // 窗帘杆
    R(wx - 22, wy - 14, ww + 44, 3, PW[1]); circle(wx - 22, wy - 13, 3, PW[2]); circle(wx + ww + 22, wy - 13, 3, PW[2]);

    // ===== 床 =====
    FX.block(24, 152, 16, 90, PW[2], { top: 0, side: 3 }); R(28, 158, 8, 78, PW[3]); R(28, 158, 1, 78, PW[4]);
    circle(32, 150, 9, FX.dark(PW[2], 0.6)); circle(32, 150, 8, PW[2]); circle(31, 149, 5, PW[3]); P(29, 147, PW[5]);
    FX.block(40, 214, 160, 22, PW[2], { top: 0, side: 0 }); for (let x = 48; x < 196; x += 24) R(x, 220, 1, 12, PW[1]);
    R(44, 236, 4, 6, PW[1]); R(192, 236, 4, 6, PW[1]);
    R(40, 198, 158, 18, '#fbf7f0'); R(40, 214, 158, 2, '#d8d0c4');
    // 枕头
    for (const [px, py, c] of [[44, 186, '#fff8ee'], [48, 192, '#f6e8e0']]) { R(px, py, 34, 13, c); R(px + 1, py, 32, 1, '#ffffff'); R(px, py + 12, 34, 1, '#d8ccbe'); R(px + 3, py + 4, 1, 5, '#e8dcd0'); }
    // 被子（格子拼布）
    R(78, 188, 122, 32, PK[2]);
    for (let y = 0; y < 4; y++) for (let x = 0; x < 8; x++) { const c = (x + y) % 2 ? PK[3] : PK[2]; R(80 + x * 15, 190 + y * 7, 14, 6, c); if ((x * 3 + y) % 5 === 0) { P(86 + x * 15, 192 + y * 7, PK[4]); P(87 + x * 15, 193 + y * 7, PK[4]); } }
    R(78, 188, 122, 2, PK[4]); R(78, 218, 122, 2, PK[0]); R(78, 188, 2, 32, PK[1]);
    line(110, 192, 104, 218, PK[1]); line(150, 190, 158, 218, PK[1]);
    R(196, 196, 8, 40, PK[1]); R(198, 196, 2, 40, PK[0]);
    // 小黄鸡玩偶
    circle(64, 186, 6, '#ffd96a'); circle(64, 185, 5, '#ffe58f'); R(61, 184, 1, 1, '#2b2238'); R(66, 184, 1, 1, '#2b2238'); R(63, 186, 3, 2, '#f0a040'); R(58, 190, 12, 2, '#f2c04a');
    // 床底阴影
    alpha(0.28, () => R(40, 236, 160, 6, '#3a2a30'));

    // ===== 床头柜 + 台灯 =====
    R(212, 236, 3, 6, FX.dark(PW[1], 0.3)); R(241, 236, 3, 6, FX.dark(PW[1], 0.3));
    FX.block(210, 206, 36, 30, PW[3], { top: 4, shadow: false }); R(211, 220, 34, 1, PW[1]); R(211, 221, 34, 1, PW[4]);
    for (const ky of [212, 226]) { R(225, ky, 7, 3, FX.dark(PW[3], 0.5)); R(226, ky, 5, 2, '#e8c08e'); P(226, ky, '#fff0c8'); }
    R(222, 196, 12, 10, '#e8e2d8'); R(226, 186, 4, 10, '#b8a898');
    R(216, 174, 24, 13, '#f6e6c8'); R(216, 174, 24, 2, '#fff6e0'); R(216, 186, 24, 1, '#d8c4a0');
    // 闹钟
    R(236, 198, 9, 8, '#e98fa6'); R(237, 199, 7, 6, '#fff8ee'); P(240, 200, '#2b2238'); P(240, 201, '#2b2238'); P(241, 202, '#2b2238');

    // ===== 书架 =====
    for (const sy of [112, 150]) { R(258, sy, 98, 4, PW[3]); R(258, sy, 98, 1, PW[5]); R(258, sy + 4, 98, 1, PW[1]); R(262, sy + 4, 3, 4, PW[1]); R(349, sy + 4, 3, 4, PW[1]); }
    const books = [['#c95b6a', 18], ['#5677b8', 22], ['#e0ae48', 16], ['#6a9f80', 20], ['#b9a3d6', 24], ['#f2b8c6', 17], ['#e8e2d8', 21], ['#8f5e40', 19]];
    let bx = 264;
    books.forEach(([c, h], i) => { const w = 5 + (i % 3); R(bx, 112 - h, w, h, c); R(bx, 112 - h, 1, h, '#ffffff33'); R(bx + w - 1, 112 - h, 1, h, '#00000022'); R(bx + 1, 112 - h + 3, w - 2, 1, '#ffffff88'); R(bx + 1, 112 - 5, w - 2, 1, '#00000033'); bx += w + 1; });
    // 斜靠的书
    for (let i = 0; i < 18; i++) R(bx + 2 + Math.floor(i / 3), 112 - i, 5, 1, '#5aa9e6');
    // 小相框 + 蜡烛
    R(318, 92, 16, 20, PW[2]); R(320, 94, 12, 16, '#bfe3f5'); R(320, 104, 12, 6, '#9cc7a8'); circle(326, 100, 2, '#fff2a8');
    R(338, 102, 8, 10, '#f4ead8'); R(338, 102, 8, 2, '#e0d4bc'); R(341, 99, 2, 3, '#4a3a3a');
    // 下层：收纳盒 + 绿萝
    R(262, 132, 24, 18, '#e9c4a8'); R(262, 132, 24, 2, '#f6dcc4'); R(270, 138, 8, 4, '#c9a27a');
    R(290, 136, 16, 14, '#efe6da'); R(290, 136, 16, 2, '#ffffff');
    R(316, 138, 12, 12, '#d9946a'); R(316, 138, 12, 2, '#e8ae80');
    for (let i = 0; i < 4; i++) { const vx = 318 + i * 3; for (let y = 0; y < 18 + i * 9; y++) { P(vx + Math.round(Math.sin((y + i * 5) * 0.3) * 2), 140 + y, PL[2]); if (y % 5 === 0) { R(vx + Math.round(Math.sin((y + i * 5) * 0.3) * 2) - 1, 140 + y, 3, 2, PL[3 + (y % 2)]); } } }
    circle(322, 134, 6, PL[3]); circle(318, 132, 3, PL[4]);

    // ===== 日历（26 号被圈起来）=====
    R(372, 82, 32, 40, '#fffaf2'); R(372, 82, 32, 9, '#d9483b'); text('NOV', 382, 84, '#ffffff');
    R(386, 78, 4, 6, '#8a8a96');
    for (let r = 0; r < 5; r++) for (let d = 0; d < 7; d++) R(375 + d * 4, 94 + r * 5, 2, 2, r * 7 + d === 25 ? '#d9483b' : '#c9c0b4');
    circle(379, 115, 3, '#d9483b'); circle(379, 115, 2, '#fffaf2'); R(378, 114, 2, 2, '#d9483b');
    R(372, 122, 32, 1, '#d8ccbe');

    // ===== 软木板 =====
    R(420, 66, 84, 54, PW[2]); R(422, 68, 80, 50, '#c9a27a');
    for (let i = 0; i < 40; i++) P(424 + rnd(i) * 76, 70 + rnd(i + 9) * 46, '#b8915e');
    [[428, 74, '#fffaf0', '#bfe3f5'], [452, 72, '#fffaf0', '#f4c6c6'], [478, 76, '#fffaf0', '#c8e5c0']].forEach(([px, py, c, c2], i) => { R(px, py, 18, 21, c); R(px + 2, py + 2, 14, 13, c2); R(px + 4, py + 9, 6, 6, '#ffffff66'); circle(px + 9, py, 1, ['#e34b4b', '#3b6fd1', '#2f9e5a'][i]); });
    R(430, 100, 14, 12, '#ffe36e'); R(432, 103, 10, 1, '#c9a020'); R(432, 106, 8, 1, '#c9a020'); circle(437, 100, 1, '#e34b4b');
    R(450, 98, 16, 14, '#a9e0d8'); R(452, 101, 12, 1, '#5aa89f'); R(452, 104, 9, 1, '#5aa89f'); R(452, 107, 11, 1, '#5aa89f');
    R(472, 100, 26, 14, '#ffffff'); text('TODO', 474, 102, '#5677b8'); R(474, 109, 18, 1, '#c9c0b4');

    // ===== 书桌 =====
    FX.block(410, 211, 5, 31, PW[2], { top: 0, side: 2 }); FX.block(530, 211, 40, 31, PW[3], { top: 0, side: 4 });
    R(531, 225, 34, 1, PW[1]); R(531, 226, 34, 1, PW[4]); for (const ky of [216, 231]) { R(545, ky, 9, 3, FX.dark(PW[3], 0.5)); R(546, ky, 7, 2, '#e8c08e'); }
    HD.fadeV(416, 211, 113, 8, '#2a1e3e', 0.3, 0);
    FX.block(406, 205, 168, 6, PW[3], { top: 6, side: 0, shadow: false });
    for (let x = 414; x < 570; x += 23) R(x, 200, 6, 1, PW[4]);   // 桌面木纹
    // 台灯（弯臂）
    { const lc = '#e58fa8', lo = FX.dark(lc, 0.6);
      R(452, 199, 18, 6, lo); R(453, 200, 16, 4, lc); R(453, 200, 16, 1, FX.light(lc, 0.4));
      line(461, 200, 456, 184, lo, 4); line(456, 184, 468, 176, lo, 4); line(461, 200, 456, 184, lc, 2); line(456, 184, 468, 176, lc, 2); circle(456, 184, 2, lo); P(456, 184, FX.light(lc, 0.4));
      R(462, 170, 18, 11, lo); R(463, 171, 16, 9, lc); R(463, 171, 16, 2, FX.light(lc, 0.4)); R(463, 178, 16, 2, FX.dark(lc, 0.25)); R(465, 180, 12, 1, '#fff6c8'); }
    // 笔记本电脑
    R(478, 184, 30, 20, '#c3c6cf'); R(480, 186, 26, 16, '#2a3050'); R(474, 204, 38, 2, '#a8acb6');
    // 笔筒
    R(516, 194, 8, 12, '#a9c4e8'); R(517, 188, 1, 6, '#e34b4b'); R(519, 186, 1, 8, '#2b2238'); R(521, 189, 1, 5, '#2f9e5a');
    // 小绿植
    R(556, 196, 10, 10, '#f4ead8'); circle(561, 190, 6, PL[3]); circle(558, 187, 3, PL[4]); circle(564, 192, 3, PL[2]);

    // ===== 办公椅 =====
    FX.block(470, 213, 26, 26, '#5a6a8e', { top: 2, side: 3, shadow: false }); R(474, 218, 18, 1, '#7a8aac'); for (let y = 222; y < 236; y += 4) R(474, y, 18, 1, '#4e5c80');
    FX.block(463, 240, 40, 5, '#4e5c80', { top: 3, side: 0, shadow: false });
    R(481, 245, 4, 10, '#30303a'); R(482, 245, 1, 10, '#5a5a66');
    R(468, 255, 30, 3, '#22222c'); R(469, 255, 28, 1, '#4a4a58'); circle(470, 259, 2, '#18181e'); circle(483, 259, 2, '#18181e'); circle(496, 259, 2, '#18181e');
    FX.shadow(GFX.ctx, 483, 261, 20, 3, 0.3);

    // ===== 大龟背竹 =====
    R(594, 210, 26, 32, '#d9946a'); R(594, 210, 26, 3, '#e8ae80'); R(594, 238, 26, 4, '#b8724a');
    const leaves = [[600, 186, 14], [616, 176, 16], [590, 172, 12], [624, 196, 12], [606, 160, 13], [586, 196, 10]];
    leaves.forEach(([lx, ly, r], i) => { line(607, 210, lx, ly, PL[1], 2); ellipse(lx, ly, r, Math.round(r * 0.7), PL[2 + (i % 2)]); ellipse(lx - 2, ly - 2, r - 4, Math.round(r * 0.5), PL[3 + (i % 2)]); for (let k = -r + 3; k < r - 2; k += 4) R(lx + k, ly - 1, 1, 3, PL[1]); });

    // ===== 门 + 挂钩 + 鞋柜 =====
    R(690, 146, 64, 96, '#e9e2d8'); R(690, 146, 64, 2, '#ffffff');
    R(696, 152, 52, 90, PW[2]); R(696, 152, 52, 2, PW[4]);
    for (const [py, ph] of [[158, 34], [198, 38]]) { R(702, py, 40, ph, PW[3]); R(702, py, 40, 1, PW[1]); R(702, py + ph - 1, 40, 1, PW[4]); R(741, py, 1, ph, PW[4]); }
    circle(742, 198, 3, '#c9a640'); circle(742, 198, 2, '#f6d27a');
    R(760, 176, 6, 10, '#fffaf2'); R(762, 179, 2, 4, '#d8ccbe');
    R(694, 244, 56, 6, '#8a6a9a'); for (let x = 696; x < 748; x += 4) R(x, 245, 2, 4, '#a888b8');
    R(652, 150, 30, 4, PW[2]); R(656, 154, 2, 4, PW[1]); R(666, 154, 2, 4, PW[1]); R(676, 154, 2, 4, PW[1]);
    // 围巾
    R(673, 156, 7, 30, '#c95b6a'); for (let y = 158; y < 184; y += 4) R(673, y, 7, 1, '#e98a96'); R(673, 186, 2, 4, '#c95b6a'); R(677, 186, 2, 4, '#c95b6a');
    R(646, 222, 40, 20, PW[3]); R(646, 222, 40, 2, PW[5]); R(646, 231, 40, 1, PW[1]);
    R(650, 216, 14, 6, '#f2f2f2'); R(650, 220, 14, 2, '#c8c8d0'); R(668, 216, 14, 6, '#9b7a66'); R(668, 220, 14, 2, '#6a4c40');
    R(650, 234, 14, 6, '#e98fa6'); R(668, 234, 14, 6, '#e98fa6');

    // ===== 地上的小物件 =====
    // 拖鞋
    for (const sx of [208, 222]) { ellipse(sx, 252, 6, 3, '#f4c6c6'); ellipse(sx, 251, 5, 2, '#fde8e8'); R(sx - 3, 250, 6, 1, '#df9aa3'); }
    // 猫窝
    ellipse(352, 252, 20, 7, '#b9a3d6'); ellipse(352, 250, 16, 5, '#d8c8ec'); ellipse(352, 251, 12, 3, '#efe6f8');
    R(340, 248, 8, 3, '#fdfbf7'); P(342, 248, '#e8a0a8');
    // 猫碗
    ellipse(388, 254, 7, 3, '#5aa9e6'); ellipse(388, 253, 5, 2, '#c8a070'); ellipse(404, 254, 7, 3, '#5aa9e6'); ellipse(404, 253, 5, 2, '#bfe3f5');
    // 坐垫
    ellipse(560, 300, 22, 8, '#e0ae48'); ellipse(560, 298, 19, 6, '#f6d27a'); P(560, 298, '#b8822e');
    // 一摞书
    R(576, 244, 14, 4, '#5677b8'); R(577, 240, 13, 4, '#e98fa6'); R(576, 236, 12, 4, '#6a9f80'); R(576, 236, 12, 1, '#86c08a');

    // ===== 生活痕迹 =====
    // 床头柜上的水杯、书桌上的咖啡渍和便利贴、插座和充电线、地上一只袜子、木地板的磨痕
    R(212, 196, 6, 8, '#cfe6f2'); R(212, 196, 6, 1, '#ffffff'); R(213, 200, 4, 3, '#9cc6dc'); R(211, 196, 1, 8, '#8aa8bc'); R(218, 196, 1, 8, '#8aa8bc');
    ellipse(440, 203, 5, 1, '#8a5a3a'); ellipse(440, 203, 4, 1, PW[3]);
    R(512, 180, 8, 7, '#ffe36e'); R(512, 180, 8, 1, '#fff6b0'); R(513, 182, 5, 1, '#c8a030'); R(513, 184, 4, 1, '#c8a030');
    R(578, 222, 8, 10, '#f4efe6'); R(578, 222, 8, 1, '#ffffff'); R(580, 225, 1, 3, '#6a5a5a'); R(583, 225, 1, 3, '#6a5a5a');
    for (let k = 0; k < 22; k++) P(572 + Math.round(k * 0.45 + Math.sin(k * 0.35) * 2), 206 + k, '#3a3a46');
    R(176, 262, 9, 4, '#f4f4f8'); R(176, 262, 3, 4, '#c95b6a'); R(183, 258, 3, 5, '#f4f4f8'); P(177, 266, '#d8d8e0');
    for (const [sx, sy, sw] of [[262, 322, 22], [410, 296, 16], [120, 336, 26], [640, 318, 18]]) { R(sx, sy, sw, 1, '#9a6540'); R(sx + 3, sy + 1, sw - 8, 1, '#c8935f'); }
    // 墙角环境光遮蔽
    HD.fadeH(0, 14, 30, 230, '#7a5a5a', 0.16, 0);
    HD.fadeH(W - 30, 14, 30, 230, '#7a5a5a', 0, 0.16);
    GFX.setCtx(real);
    return FX.bake(c, FX.BAKE.home);
  }

  // ---------- 动态元素 ----------
  // 猫：睡着时肚子一起一伏；醒着时隔一会儿伸个懒腰、舔舔爪子
  function catAnim(ctx, t, sleeping) {
    const x = st.catX, y = 191;
    const cyc = (t + 3) % 9;
    let dy = 0, dx = 0, lick = false;
    if (sleeping) dy = Math.sin(t * 1.6) > 0.6 ? -1 : 0;                       // 呼吸：肚子起伏 1 像素
    else if (cyc < 1.1) { dx = -1; dy = 1; }                                    // 伸懒腰：往前探、身子压低
    else if (cyc > 4 && cyc < 5.6) lick = true;
    HD.drawCat(x + dx, y + dy, t, sleeping && Math.floor(t * 0.4) % 5 !== 0 ? true : sleeping);
    if (lick) { const up = Math.floor(t * 6) % 2; R(x + 3, y + 6 - up * 2, 3, 3, '#fdfbf7'); P(x + 3, y + 9 - up * 2, '#a89c92'); if (up) P(x + 2, y + 5, '#ee9aa6'); }
  }
  // 窗外偶尔飞过一只小鸟
  function bird(t) {
    const k = (t % 14) / 4; if (k > 1) return;
    const x = 60 + k * 112, y = 70 + Math.sin(k * 6) * 6, f = Math.floor(t * 8) % 2;
    R(x, y, 2, 1, '#4a4a58'); R(x + 3, y, 2, 1, '#4a4a58'); P(x + 2, y + 1, '#4a4a58'); if (f) { P(x - 1, y - 1, '#4a4a58'); P(x + 5, y - 1, '#4a4a58'); }
  }
  function curtains(t) {
    const wx = 60, wy = 54, ww = 112;
    for (const side of [0, 1]) {
      const x0 = side ? wx + ww - 2 : wx - 20;
      for (let y = 0; y < 104; y++) {
        const sway = Math.round(Math.sin(t * 1.2 + y * 0.05) * (y / 104) * 2);
        const tie = y > 62 && y < 70;
        const w = tie ? 12 : 22 - Math.round(Math.max(0, 66 - Math.abs(y - 66)) * 0.0);
        const x = x0 + (side ? sway : -sway) + (side ? 0 : (22 - w));
        R(x, wy - 12 + y, w, 1, HD.PAL.pink[2]);
        for (let f = 3; f < w; f += 6) R(x + f, wy - 12 + y, 2, 1, HD.PAL.pink[1]);
        R(x + (side ? 0 : w - 1), wy - 12 + y, 1, 1, HD.PAL.pink[3]);
      }
      R(x0 + (side ? 0 : 8), wy + 52, 14, 3, '#e0ae48');
    }
  }
  function sunbeam(t) {
    const a = 0.14 + Math.sin(t * 0.7) * 0.02;
    alpha(a, () => {
      for (let i = 0; i < 112; i++) {
        const x = 70 + i * 1.25, y = 250 + i * 0.95;
        if (y > 358) break;
        R(x, y, 120 - i * 0.2, 1, '#fff6c8');
      }
    });
    // 窗格的影子
    alpha(a * 0.9, () => { for (let i = 0; i < 26; i++) R(128 + i * 1.25, 252 + i * 0.95, 2, 1, '#c48a57'); });
    // 光束里的灰尘
    st.dust.forEach((d) => {
      d.x += Math.sin(t * 0.5 + d.p) * 0.05; d.y += d.v * 0.016; if (d.y > 250) d.y = 70;
      alpha(0.4 + Math.sin(t * 2 + d.p) * 0.3, () => P(d.x, d.y, '#fffbe0'));
    });
  }
  function stringLights(t) {
    for (let i = 0; i < 58; i++) {
      const x = 8 + i * 14, y = 18 + Math.round(Math.sin(i * 0.9) * 2 + Math.abs(Math.sin(i * 0.45)) * 4);
      if (i > 0) line(x - 14, 18 + Math.round(Math.sin((i - 1) * 0.9) * 2 + Math.abs(Math.sin((i - 1) * 0.45)) * 4), x, y, '#8a7a6a');
      const c = ['#ffd66b', '#f7a8c4', '#a9e0d8'][i % 3];
      const on = 0.55 + Math.sin(t * 2 + i * 1.3) * 0.45;
      alpha(on * 0.35, () => circle(x, y + 3, 4, c));
      R(x - 1, y + 1, 3, 4, c); P(x, y + 1, '#ffffff');
    }
  }
  function deskLive(t) {
    // 电脑屏幕
    R(480, 186, 26, 16, '#2a3050');
    R(482, 188, 10, 2, '#9ef0b0'); R(482, 192, 18, 1, '#5a8ab0'); R(482, 195, 14, 1, '#5a8ab0'); R(482, 198, 8, 1, '#f7a8c4');
    if (Math.floor(t * 1.5) % 2) R(491, 198, 2, 1, '#ffffff');
    // 台灯光
    FX.cone(GFX.ctx, 471, 181, 14, 34, 20, '#fff0b8', 0.22); FX.pool(GFX.ctx, 471, 201, 18, 2, '#fff0b8', 0.25);
    // 马克杯 + 热气
    R(504, 196, 9, 10, '#ffffff'); R(513, 198, 2, 5, '#ffffff'); R(505, 197, 7, 2, '#8a5a3a'); R(504, 205, 9, 1, '#d8d0c4'); R(506, 200, 4, 3, '#f7a8c4');
    for (let k = 0; k < 2; k++) for (let i = 0; i < 8; i++) { const y = 194 - i - ((t * 8 + k * 4) % 8); alpha(0.5 - i * 0.06, () => P(506 + k * 3 + Math.round(Math.sin(y * 0.6 + k) * 1.5), y, '#ffffff')); }
    // 时钟（墙上）
    const cx = 594, cy = 92;
    circle(cx, cy, 12, '#8f5e40'); circle(cx, cy, 10, '#fffaf2');
    for (let i = 0; i < 12; i++) P(cx + Math.round(Math.cos(i * 0.5236) * 8), cy + Math.round(Math.sin(i * 0.5236) * 8), '#c9c0b4');
    const mn = t * 0.05; line(cx, cy, cx + Math.cos(-1.57 + mn) * 7, cy + Math.sin(-1.57 + mn) * 7, '#2b2238');
    line(cx, cy, cx + Math.cos(-1.57 + 4.2) * 5, cy + Math.sin(-1.57 + 4.2) * 5, '#2b2238', 2);
    P(cx, cy, '#e34b4b');
  }

  G.def('home', {
    k: 1, width: W, floor: LANE, minX: 30, maxX: 790, bgm: 'home', checkpoint: true,
    grade: { c: '#ffcf8a', a: 0.22, vig: 0.22 },
    hint: () => !G.flags.h_protocol ? '猫好像压着什么' : !G.flags.h_keys ? '书桌上的机械臂好像想帮忙' : !G.flags.h_bag ? '门口挂着包' : '从门口出发吧',

    setup() {
      if (!bg) bg = paintBg();
      st = { catX: G.flags.h_protocol ? 452 : 416, arm: POSE_REST.slice(), holding: false, pets: 0, catAwake: 0,
        dust: Array.from({ length: 26 }, (_, i) => ({ x: 80 + rnd(i) * 150, y: 70 + rnd(i + 40) * 180, v: 2 + rnd(i + 80) * 4, p: rnd(i + 3) * 6 })) };
      const g = G.gwen = G.actor({ sprite: 'gwen', x: 150, y: LANE, speed: 95, seed: 0.3 });
      if (G.flags.h_bag) g.bag = true;
      if (G.flags.h_protocol) G.showRack(true);
      const L = S.labels;

      G.obj({ id: 'bed', label: L.bed, x: 40, y: 184, w: 160, h: 52, stand: 140, onTap: () => G.talk(S.bed) });
      G.obj({ id: 'window', label: L.window, x: 60, y: 54, w: 112, h: 96, stand: 116, onTap: () => G.talk(S.window) });
      G.obj({ id: 'shelf', label: L.shelf, x: 258, y: 88, w: 98, h: 66, stand: 306, onTap: () => G.talk(S.shelf) });
      G.obj({
        id: 'cat', label: L.cat, x: 0, y: 186, w: 40, h: 20, stand: 432,
        onTap: async () => {
          AU.sfx('meow'); st.catAwake = 3;
          if (!G.flags.h_protocol) {
            await G.talk(S.cat);
            AU.sfx('purr');
            await G.tween(st, { catX: 452 }, 900);
            await G.protocolCard();
            await G.talk(S.afterProtocol);
            G.flags.h_protocol = true; G.persist();
            G.showRack(true);
            G.toast(S.rackUnlocked, 3200);
            G.achieve('cat');
            G.setGoal('arm');
          } else {
            const v = S.catAgain[st.pets % S.catAgain.length];
            st.pets++; G.flags.h_pets = (G.flags.h_pets || 1) + 1; G.persist();
            await G.talk(v);
            if (G.flags.h_pets >= 5) G.achieve('cat5');
          }
        },
      });
      G.obj({
        id: 'arm', label: L.arm, x: 516, y: 160, w: 34, h: 46, stand: 512,
        onTap: async () => {
          if (!G.flags.h_protocol) return G.talk(S.needProtocol);
          if (G.flags.h_keys) { await G.tween(st.arm, { 0: 1.5, 1: -0.5, 2: -1.3 }, 300); AU.sfx('clack'); await G.tween(st.arm, { 0: POSE_REST[0], 1: POSE_REST[1], 2: POSE_REST[2] }, 300); return G.talk(S.armAgain); }
          AU.sfx('clack');
          await G.say(S.arm[0][0], S.arm[0][1]);
          const pk = ik(510, 200);
          await G.tween(st.arm, { 0: pk[0], 1: pk[1], 2: pk[2] }, 900);
          st.holding = true; AU.sfx('clack');
          await G.wait(250);
          const up = ik(508, 176);
          await G.tween(st.arm, { 0: up[0], 1: up[1], 2: up[2] }, 500);
          const give = ik(500, 204);
          AU.sfx('clack');
          await G.tween(st.arm, { 0: give[0], 1: give[1], 2: give[2] }, 600);
          await G.say(S.arm[1][0], S.arm[1][1]);
          st.holding = false;
          G.flags.h_keys = true; G.persist();
          AU.sfx('pickup'); G.toast(S.gotKeys);
          await G.say(S.arm[2][0], S.arm[2][1]);
          await G.tween(st.arm, { 0: POSE_REST[0], 1: POSE_REST[1], 2: POSE_REST[2] }, 800);
          await G.say(S.arm[3][0], S.arm[3][1]);
          G.setGoal(G.flags.h_bag ? 'door' : 'bag');
        },
      });
      G.obj({
        id: 'bag', label: L.bag, x: 652, y: 152, w: 22, h: 30, stand: 664, enabled: () => !G.flags.h_bag,
        onTap: async () => {
          if (!G.flags.h_protocol) return G.talk(S.needProtocol);
          AU.sfx('pickup');
          G.flags.h_bag = true; G.persist();
          G.gwen.bag = true;
          await G.talk(S.bag);
          G.setGoal(G.flags.h_keys ? 'door' : 'arm');
        },
      });
      G.obj({
        id: 'door', label: L.door, x: 696, y: 152, w: 52, h: 90, stand: 722, hint: false,
        onTap: async () => {
          if (!G.flags.h_protocol) return G.talk(S.needProtocol);
          if (!G.flags.h_keys) return G.talk(S.needKeys);
          if (!G.flags.h_bag) return G.talk(S.needBag);
          await G.talk(S.leave);
          AU.sfx('door');
          G.gwen.visible = false;
          await G.wait(300);
          G.goto('drive');
        },
      });
      G.setGoal(!G.flags.h_protocol ? 'cat' : !G.flags.h_keys ? 'arm' : !G.flags.h_bag ? 'bag' : 'door');
    },

    async start() {
      if (G.flags.h_started) return;
      G.flags.h_started = true; G.persist();
      await G.wait(400);
      await G.talk(S.wake);
      G.toast(S.tutorial, 4200);
    },

    update(dt) {
      const cat = G.objects.find((o) => o.id === 'cat'); if (cat) cat.x = st.catX - 2;
      if (st.catAwake > 0) st.catAwake -= dt;
    },

    draw(ctx, t) {
      ctx.drawImage(bg, 0, 0);
      bird(t);
      curtains(t);
      sunbeam(t);
      stringLights(t);
      deskLive(t);
      // Protocol 纸
      R(st.catX === 452 ? 418 : 420, 202, 26, 4, '#ffffff'); R(422, 203, 18, 1, '#cfd8e8');
      // 猫
      const sleeping = !G.flags.h_protocol && st.catAwake <= 0;
      catAnim(ctx, t, sleeping);
      if (sleeping) { const z = (t * 6) % 14; alpha(1 - z / 14, () => text('Z', st.catX + 4 + z * 0.4, 182 - z, '#a89c92')); }
      // 钥匙
      if (!G.flags.h_keys && !st.holding) keys(504, 200);
      // 机械臂（待机时轻微晃动）
      const a = st.arm.slice(); a[0] += Math.sin(t * 1.3) * 0.02; a[1] += Math.sin(t * 0.9) * 0.02;
      drawArm(a, t, st.holding);
      // 包
      if (!G.flags.h_bag) { line(659, 156, 662, 164, '#8a6446'); line(666, 156, 663, 164, '#8a6446'); R(656, 164, 14, 12, '#c9a27a'); R(656, 164, 14, 2, '#e0c29a'); R(656, 175, 14, 1, '#a07a55'); R(662, 168, 2, 3, '#f4e6d0'); }
      // 地毯
      R(240, 278, 170, 30, '#c9a8c8'); R(244, 281, 162, 24, '#e2c8de');
      for (let x = 250; x < 400; x += 12) { R(x, 286, 6, 2, '#c9a8c8'); R(x + 3, 296, 6, 2, '#c9a8c8'); }
      for (let x = 240; x < 410; x += 4) { P(x, 277, '#c9a8c8'); P(x + 2, 308, '#c9a8c8'); }
    },

    drawFg(ctx, t) {
      // 前景：画面边缘的绿植叶子，随镜头视差移动
      const off = G.camX * 0.25;
      const PL = HD.PAL.leaf;
      [[14, 352, 26], [40, 344, 20], [4, 330, 18]].forEach(([lx, ly, r], i) => { ellipse(lx - off + G.camX * 0, ly, r, Math.round(r * 0.55), PL[0]); ellipse(lx - off - 3, ly - 3, r - 6, Math.round(r * 0.4), PL[1]); });
      [[790, 350, 24], [770, 356, 18]].forEach(([lx, ly, r]) => { ellipse(lx + off * 0.6, ly, r, Math.round(r * 0.5), PL[0]); });
    },
  });

  // 提供给其他场景的 Protocol 卡片
  function protocolCard() {
    const p = S.protocol;
    const e = G.el(`<div class="protocol center"><h3>${p.title}</h3>${p.rows.map(([k, v]) => `<div><span class="k">${k}</span>${v}</div>`).join('')}<div class="tap">点击继续 ▸</div></div>`);
    AU.sfx('select');
    return G.waitTap().then(() => e.remove());
  }
  G.protocolCard = protocolCard;
})();
