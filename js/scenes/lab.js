// 第一章：实验室（白天）+ Flex 报错事件；LAB 也给终章（夜晚）复用。高清 640×360，场景宽 1120。
const LAB = (() => {
  const { R, P, line, circle, ellipse, alpha, text } = GFX;
  const W = 1240, BASE = 244;
  const LIGHTS = [120, 360, 600, 840, 1080];
  const FLEX_X = 984, FLEX_Y = 124;
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  let bg = null, light = null;

  function paint() {
    const c = document.createElement('canvas'); c.width = W; c.height = 360;
    const g = c.getContext('2d'); const real = GFX.ctx; GFX.setCtx(g);
    const MT = HD.PAL.metal;
    // ---- 墙 ----
    R(0, 0, W, BASE, '#e4ecee');
    for (let y = 22, r = 0; y < 198; y += 14, r++) { R(0, y, W, 1, '#d8e2e5'); for (let x = (r % 2) * 22; x < W; x += 44) R(x, y, 1, 14, '#d8e2e5'); }
    R(0, 198, W, 38, '#cfdade'); R(0, 198, W, 2, '#bccacf'); R(0, 200, W, 1, '#e8f0f2');
    R(0, 236, W, 8, '#8fa2aa'); R(0, 236, W, 1, '#b4c4ca'); R(0, 243, W, 1, '#6f828a');
    HD.fadeV(0, 16, W, 40, '#9aaab4', 0.22, 0);
    // ---- 天花板 ----
    R(0, 0, W, 16, '#eef2f3'); for (let x = 0; x < W; x += 50) R(x, 0, 1, 16, '#d2dadd'); R(0, 15, W, 1, '#c3ccd0');
    // ---- 地板 ----
    // 地砖：越往下越宽（透视），缝也随之张开
    for (let y = BASE, r = 0; y < 360; y += 18, r++) {
      const f = 1 + ((y + 9 - BASE) / 116) * 0.55, tw = 36 * f;
      for (let k = -24; k < 60; k++) { const x0 = Math.round(W / 2 + (k * 36 + (r % 2) * 18 - W / 2) * f); R(x0, y, Math.ceil(tw) + 1, 18, (k + r) % 2 ? '#c9d3d6' : '#c2cdd1'); R(x0, y, 1, 18, '#b2bec2'); }
    }
    for (let y = BASE; y < 360; y += 18) R(0, y, W, 1, '#b2bec2');
    for (let i = 0; i < 260; i++) P(rnd(i) * W, BASE + 2 + rnd(i + 500) * 114, rnd(i + 9) > 0.5 ? '#b8c3c7' : '#d6dee0');
    HD.fadeV(0, BASE, W, 16, '#5a6a78', 0.3, 0);
    // 线槽
    R(0, 300, W, 3, '#b8c2c8'); R(0, 300, W, 1, '#d6dee2');

    // ===== 门 + EXIT + 白大褂 =====
    R(20, 136, 68, 108, '#8a98a2'); R(22, 138, 64, 106, '#a9b6be');
    R(26, 142, 56, 102, '#7d93a6'); R(26, 142, 56, 2, '#9fb2c2'); R(80, 142, 2, 102, '#6a7e90');
    R(36, 152, 12, 40, '#5a6e80'); R(37, 153, 10, 38, '#bfe0ee'); alpha(0.5, () => line(38, 188, 45, 156, '#ffffff'));
    R(66, 196, 12, 4, '#c9d2d8'); R(66, 196, 3, 8, '#c9d2d8'); R(26, 228, 56, 14, '#9aa8b2');
    R(32, 120, 44, 13, '#1f7a4a'); R(33, 121, 42, 11, '#2fae62'); text('EXIT', 39, 123, '#ffffff', 2);
    // 灭火器
    R(96, 208, 12, 28, '#d23a3a'); R(96, 208, 3, 28, '#f06a6a'); R(99, 202, 6, 6, '#2b2238'); R(104, 200, 8, 3, '#2b2238'); R(95, 232, 14, 4, '#9a2a2a');
    // 白大褂挂钩
    R(112, 132, 40, 4, '#8a98a2');
    for (const [hx, cc] of [[118, '#fbfbfd'], [136, '#f4f6fa']]) {
      R(hx + 2, 136, 2, 4, '#5d6b77');
      HD.box(hx - 4, 140, 18, 56, ['#9da6b8', '#c3c9d6', '#dde1ea', cc, '#ffffff', '#ffffff']);
      R(hx + 4, 142, 2, 40, '#c3c9d6'); R(hx - 4, 150, 3, 40, '#e6eaf0'); R(hx + 11, 150, 3, 40, '#d3d8e2');
      R(hx + 7, 162, 5, 5, '#c3c9d6'); R(hx + 8, 158, 1, 6, '#3b6fd1');
    }

    // ===== Gwen 的工位 =====
    HD.box(160, 204, 150, 6, ['#9aa4ac', '#b8c2ca', '#dfe5ea', '#f2f5f7', '#ffffff']);
    R(164, 210, 4, 34, '#9aa6ad'); R(302, 210, 4, 34, '#9aa6ad');
    HD.box(258, 210, 40, 32, ['#9aa4ac', '#b8c2ca', '#cfd8de', '#e2e8ec', '#f4f6f8']); R(262, 220, 32, 1, '#b8c2ca'); R(274, 214, 8, 2, '#8a98a2'); R(274, 226, 8, 2, '#8a98a2');
    HD.fadeV(168, 210, 90, 8, '#5a6a78', 0.25, 0);
    // 显示器
    R(198, 152, 62, 42, '#2b2f36'); R(198, 152, 62, 1, '#4a5058'); R(226, 194, 6, 6, '#3d4248'); R(214, 200, 30, 4, '#3d4248');
    // 便利贴
    R(260, 156, 9, 9, '#ffe36e'); R(261, 158, 6, 1, '#c9a020'); R(261, 161, 5, 1, '#c9a020');
    R(189, 160, 9, 9, '#a9e0d8'); R(190, 162, 6, 1, '#5aa89f');
    // 键盘鼠标
    R(206, 199, 40, 5, '#d8dee2'); for (let i = 0; i < 9; i++) R(208 + i * 4, 200, 3, 1, '#b8c2ca'); R(252, 200, 6, 4, '#d8dee2');
    // SLAS 合影相框
    R(166, 180, 22, 24, '#8f5e40'); R(168, 182, 18, 18, '#efe2c8'); HD.dgradV(168, 182, 18, 10, '#bfd8e8', 1, 1);
    for (let i = 0; i < 5; i++) { circle(170 + i * 3.5, 191, 1, ['#3a2a20', '#7b4a2c', '#1f1f27', '#5a3e30', '#2a2a30'][i]); R(169 + i * 3.5, 193, 3, 6, ['#3c5280', '#fdfaf4', '#24242c', '#3f4f72', '#80404a'][i]); }
    R(172, 204, 10, 1, '#5a3a2a'); R(176, 200, 2, 4, '#6b4434');
    // 墙上的置物架 + 文件夹
    HD.box(176, 118, 120, 4, ['#9aa4ac', '#b8c2ca', '#dfe5ea', '#f2f5f7', '#ffffff']); R(180, 122, 3, 5, '#9aa6ad'); R(289, 122, 3, 5, '#9aa6ad');
    [['#3b6fd1', 24], ['#e34b4b', 22], ['#f2c14e', 26], ['#2f9e5a', 24], ['#9a63c9', 22], ['#ffffff', 25]].forEach(([c, h], i) => { R(182 + i * 9, 118 - h, 8, h, c); R(182 + i * 9, 118 - h, 1, h, '#ffffff66'); R(183 + i * 9, 118 - h + 6, 6, 6, '#ffffff'); R(186 + i * 9, 118 - 5, 2, 2, '#2b2238'); });
    R(238, 104, 18, 14, '#d9946a'); R(238, 104, 18, 2, '#e8ae80'); circle(247, 100, 7, '#5c9e6c'); circle(243, 97, 4, '#86c08a');
    for (let i = 0; i < 3; i++) { const vx = 242 + i * 5; for (let y = 0; y < 14 + i * 6; y++) P(vx + Math.round(Math.sin((y + i * 3) * 0.4)), 118 + y, '#3f7a58'); }
    R(264, 98, 22, 20, '#ffffff'); R(264, 98, 22, 4, '#5677b8'); R(267, 105, 16, 1, '#c9d2d8'); R(267, 108, 12, 1, '#c9d2d8'); R(267, 111, 14, 1, '#c9d2d8');
    // 安全海报
    R(110, 64, 40, 52, '#ffffff'); R(110, 64, 40, 10, '#f2c14e'); text('SAFETY', 112, 67, '#2b2238');
    circle(130, 88, 9, '#5677b8'); R(122, 86, 16, 4, '#2b2238'); R(123, 87, 6, 2, '#bfe3f5'); R(131, 87, 6, 2, '#bfe3f5');
    R(114, 102, 32, 1, '#c9d2d8'); R(114, 106, 26, 1, '#c9d2d8'); R(114, 110, 30, 1, '#c9d2d8');
    R(536, 150, 28, 30, '#ffffff'); R(536, 150, 28, 30, '#ffffff'); circle(550, 162, 8, '#f2c14e'); circle(550, 162, 3, '#2b2238'); R(540, 174, 20, 2, '#e34b4b');
    // 笔筒 + 多肉
    R(282, 186, 10, 18, '#f7c6d6'); R(282, 186, 10, 2, '#ffd8e4'); R(284, 178, 1, 8, '#3b6fd1'); R(287, 176, 1, 10, '#2b2238'); R(289, 180, 1, 6, '#e34b4b');
    R(296, 192, 10, 12, '#e8ae80'); R(296, 192, 10, 2, '#f4c8a0'); circle(301, 188, 5, '#6a9f80'); circle(299, 186, 2, '#86c08a'); circle(304, 189, 2, '#5c8a6a');
    // 办公椅
    HD.box(318, 196, 28, 30, ['#2a3450', '#3a4870', '#4a5a8a', '#5c6ea0', '#7a8cc0']);
    R(316, 222, 32, 7, '#3a4870'); R(316, 222, 32, 1, '#5c6ea0'); R(330, 229, 4, 10, '#30303a'); R(318, 239, 28, 2, '#30303a'); circle(320, 242, 2, '#20202a'); circle(344, 242, 2, '#20202a');

    // ===== 白板 =====
    R(364, 60, 160, 112, '#9aa6ad'); R(366, 62, 156, 108, '#fbfdfd'); R(366, 62, 156, 2, '#ffffff');
    R(362, 170, 164, 5, '#b8c2ca'); R(362, 170, 164, 1, '#dfe5ea');
    R(380, 166, 14, 4, '#3b6fd1'); R(398, 166, 14, 4, '#e34b4b'); R(416, 166, 14, 4, '#2f9e5a');
    const ink = '#3b6fd1', red = '#e34b4b';
    const boxT = (x, y, w, s, c) => { R(x, y, w, 18, c); R(x + 1, y + 1, w - 2, 16, '#fbfdfd'); text(s, x + 5, y + 4, c, 2); };
    boxT(376, 74, 44, 'LLM', ink); boxT(454, 74, 54, 'FLEX', ink); boxT(412, 118, 66, 'AGENT', red);
    line(420, 83, 452, 83, ink); line(448, 80, 452, 83, ink); line(448, 86, 452, 83, ink);
    line(398, 92, 420, 117, ink); line(482, 92, 466, 117, ink);
    line(380, 150, 512, 150, red); line(380, 154, 440, 158, ink); line(450, 157, 508, 153, red);
    circle(498, 132, 7, red); circle(498, 132, 5, '#fbfdfd'); text('?', 497, 130, red);
    for (let i = 0; i < 3; i++) { line(390 + i * 6, 104 - i * 2, 410 + i * 8, 108, '#9aa6ad'); }
    R(502, 64, 14, 12, '#ffe36e'); circle(509, 64, 1, red);

    // ===== 生物安全垃圾桶 =====
    R(540, 214, 20, 30, '#d23a3a'); R(538, 210, 24, 5, '#b02a2a'); R(540, 214, 3, 30, '#f06a6a');
    circle(550, 228, 4, '#ffe0e0'); circle(550, 228, 2, '#d23a3a');

    // ===== 长实验台 + 试剂架 =====
    const bx0 = 572, bx1 = 800;
    for (const sy of [104, 140]) { HD.box(bx0, sy, bx1 - bx0, 4, ['#7a8890', '#9aa6ad', '#b8c2ca', '#d3dbe0', '#eef2f4']); R(bx0 + 4, sy + 4, 3, 6, '#9aa6ad'); R(bx1 - 7, sy + 4, 3, 6, '#9aa6ad'); }
    // 瓶瓶罐罐
    const bottles = [['#c98a3a', '#2b2238', 14, 22], ['#eef6f8', '#3b6fd1', 10, 18], ['#eef6f8', '#e34b4b', 10, 20], ['#c98a3a', '#2b2238', 12, 18], ['#f4f0e6', '#2f9e5a', 16, 14], ['#eef6f8', '#f2c14e', 8, 16], ['#dbeef6', '#9a63c9', 12, 22], ['#c98a3a', '#3b6fd1', 10, 16], ['#f4f0e6', '#e34b4b', 20, 12], ['#eef6f8', '#2f9e5a', 10, 20], ['#c98a3a', '#2b2238', 14, 20], ['#dbeef6', '#f7a8c4', 10, 14]];
    let bx = bx0 + 8;
    bottles.forEach(([b, cap, w, h], i) => {
      const yb = i < 7 ? 104 : 140; if (i === 7) bx = bx0 + 12;
      R(bx, yb - h, w, h, b); R(bx, yb - h, 1, h, '#ffffff88'); R(bx + w - 1, yb - h, 1, h, '#00000022');
      R(bx + 2, yb - h - 3, w - 4, 3, cap); R(bx + 1, yb - h + Math.round(h * 0.35), w - 2, Math.max(4, Math.round(h * 0.3)), '#ffffff'); R(bx + 2, yb - h + Math.round(h * 0.35) + 1, w - 5, 1, '#9aa6ad');
      bx += w + 6 + (i % 3) * 3;
    });
    // 盒子
    HD.box(bx0 + 130, 118, 34, 22, ['#8a6a4a', '#a8825c', '#c9a27a', '#dcbd98', '#efd8b8']); R(bx0 + 138, 124, 18, 6, '#ffffff');
    HD.box(bx0 + 168, 124, 26, 16, ['#5a6a8a', '#6a7aa0', '#7d8fb8', '#9aaad0', '#b8c4e0']);
    HD.box(bx0 + 150, 86, 40, 18, ['#8a6a4a', '#a8825c', '#c9a27a', '#dcbd98', '#efd8b8']);
    // 台面（黑色环氧树脂）+ 柜子
    R(bx0 - 2, 191, bx1 - bx0 + 4, 5, '#3e4452'); R(bx0 - 2, 191, bx1 - bx0 + 4, 1, '#5e6676'); for (let x = bx0 + 10; x < bx1; x += 37) R(x, 193, 8, 1, '#4c5462');   // 台面顶面
    R(bx0 - 4, 196, bx1 - bx0 + 8, 8, '#2a2e36'); R(bx0 - 4, 196, bx1 - bx0 + 8, 1, '#6a7080'); R(bx0 - 4, 203, bx1 - bx0 + 8, 1, '#16181e');
    R(bx0, 204, bx1 - bx0, 40, '#9fb0b8'); R(bx0, 204, bx1 - bx0, 1, '#7a8a92');
    for (let x = bx0 + 4; x < bx1 - 8; x += 56) { HD.box(x, 208, 52, 32, ['#7a8a92', '#9aaab2', '#b4c2c8', '#c8d4d9', '#dfe7ea']); R(x + 22, 214, 8, 2, '#7a8a92'); }
    HD.fadeV(bx0, 204, bx1 - bx0, 6, '#2a2e36', 0.4, 0);
    // 台面上的东西：笔记本、枪头盒、移液枪架、离心管架
    R(632, 191, 32, 5, '#2f6fa3'); R(634, 189, 30, 3, '#fffaf0'); R(633, 191, 1, 5, '#1f4f80'); R(640, 189, 1, 3, '#c9d6e6'); R(650, 189, 1, 3, '#c9d6e6');
    for (const [tx, c] of [[676, '#7ec8e3'], [702, '#f2c14e']]) { HD.box(tx, 182, 22, 14, ['#5a6a7a', '#7a8a9a', '#c9d2d8', '#e2e8ec', '#f4f6f8']); R(tx + 1, 182, 20, 3, c); for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) P(tx + 4 + i * 4, 187 + j * 4, '#9aa6ad'); }
    R(732, 194, 20, 2, '#9aa6ad'); R(741, 160, 2, 34, '#9aa6ad'); R(734, 160, 16, 3, '#9aa6ad');
    for (const [px, c] of [[736, '#f28b82'], [746, '#7ec8e3']]) { R(px - 1, 164, 4, 6, c); R(px, 170, 2, 18, '#e8ecef'); R(px, 188, 2, 4, '#c9d2d8'); }
    R(760, 186, 30, 10, '#f4f4f4'); R(760, 186, 30, 1, '#ffffff'); for (let i = 0; i < 6; i++) { R(763 + i * 4, 180, 3, 8, ['#f7a8c4', '#7ec8e3', '#f2c14e', '#b9a3d6', '#9ef0b0', '#ffffff'][i]); R(763 + i * 4, 180, 3, 1, '#ffffff'); }

    // ===== 冰箱（4°C）=====
    R(816, 146, 64, 98, '#7c8a94'); R(818, 148, 60, 94, '#e9eef0');
    R(822, 154, 46, 80, '#9fb3bf'); R(823, 155, 44, 78, '#d8ecf2');
    for (const sy of [174, 194, 214]) { R(823, sy, 44, 2, '#b8c8d0'); }
    const racks = ['#f7a8c4', '#7ec8e3', '#f2c14e', '#9ef0b0', '#b9a3d6', '#ffffff'];
    for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) R(826 + i * 7, 160 + r * 20 + (r ? 0 : 2), 4, r === 3 ? 8 : 12, racks[(i + r * 2) % 6]);
    alpha(0.45, () => { line(826, 230, 846, 158, '#ffffff'); line(832, 230, 852, 158, '#ffffff'); });
    R(870, 170, 3, 40, '#9aa6ad'); R(870, 170, 1, 40, '#c9d2d8');
    R(828, 236, 22, 4, '#2b2f36'); text('4.0', 830, 236, '#ff6a5a');
    R(850, 140, 26, 8, '#ffe36e'); text('4C', 856, 141, '#5a4200');
    R(822, 154, 10, 10, '#f7a8c4'); R(823, 156, 7, 1, '#d97a96');

    // ===== OT-2 台子 =====
    R(886, 204, 92, 5, '#9aa6ad'); R(886, 204, 92, 1, '#c9d2d8'); R(890, 209, 4, 35, '#7a8a92'); R(970, 209, 4, 35, '#7a8a92'); R(890, 230, 84, 3, '#7a8a92');
    // ===== 窗户（Baiding 工位上方）=====
    R(1106, 54, 104, 100, '#8a98a2'); R(1108, 56, 100, 96, '#6d7a86');
    // ===== Baiding 的工位 =====
    HD.box(1100, 204, 104, 6, ['#6b4434', '#8f5e40', '#b37b51', '#d29e6c', '#e8c08e']);
    R(1104, 210, 4, 34, '#6b4434'); R(1196, 210, 4, 34, '#6b4434');
    R(1120, 156, 56, 40, '#22252c'); R(1120, 156, 56, 1, '#4a5058'); R(1145, 196, 6, 6, '#3d4248'); R(1134, 202, 28, 3, '#3d4248');
    R(1176, 160, 10, 10, '#ffe36e'); R(1177, 162, 7, 1, '#8a6a20'); R(1177, 165, 5, 1, '#8a6a20');
    R(1128, 199, 34, 5, '#2b2f36'); for (let i = 0; i < 8; i++) R(1130 + i * 4, 200, 3, 2, ['#f4a6c0', '#ffe08a', '#8fd0e8'][i % 3]);
    // 椅子 + 搭着的外套
    HD.box(1184, 196, 22, 30, ['#202028', '#2a2a34', '#3a3a46', '#4a4a58', '#5a5a6a']);
    R(1182, 194, 26, 14, '#5a4a6a'); R(1182, 194, 26, 2, '#7a6a8a'); R(1186, 208, 6, 22, '#5a4a6a'); R(1198, 208, 6, 18, '#4a3a5a');
    R(1190, 226, 4, 12, '#30303a'); R(1182, 238, 22, 2, '#30303a');

    // 墙角阴影
    HD.fadeH(0, 16, 24, BASE - 16, '#5a6a78', 0.18, 0);
    // ---- 通风管道 + 吊架 ----
    R(0, 17, W, 10, '#d0d8dc'); R(0, 17, W, 2, '#eef2f3'); R(0, 25, W, 2, '#a8b4ba');
    for (let x = 30; x < W; x += 96) { R(x, 16, 3, 12, '#b4c0c6'); R(x + 1, 12, 1, 5, '#8a98a2'); }
    for (const vx of [250, 760]) { R(vx, 27, 18, 7, '#b8c4ca'); for (let k = 0; k < 4; k++) R(vx + 2 + k * 4, 28, 2, 5, '#8a98a2'); }
    // ---- 急救箱、洗眼器标识、生物安全标识 ----
    R(934, 50, 22, 18, '#fbfbfd'); R(934, 50, 22, 2, '#d8dee2'); R(934, 66, 22, 2, '#b8c2ca'); R(943, 53, 4, 12, '#2fae62'); R(939, 57, 12, 4, '#2fae62');
    R(800, 120, 34, 14, '#2fae62'); text('EYE', 806, 123, '#ffffff'); R(800, 120, 34, 1, '#4fe08a');
    R(1040, 40, 18, 16, '#ffd23f'); R(1040, 40, 18, 1, '#fff0a0'); R(1047, 44, 4, 4, '#2b2238'); R(1043, 50, 3, 3, '#2b2238'); R(1052, 50, 3, 3, '#2b2238');
    // ---- 实验台尽头的水槽 ----
    R(806, 192, 34, 6, '#8a98a2'); R(808, 193, 30, 4, '#4a5560'); R(808, 193, 30, 1, '#2a3440');
    R(820, 176, 3, 17, '#b8c4ca'); R(820, 176, 12, 3, '#b8c4ca'); R(830, 178, 2, 4, '#b8c4ca'); R(812, 186, 4, 7, '#d8dee2'); R(816, 188, 4, 5, '#b8c4ca');
    // ---- 台面后面的气体管路和插座 ----
    for (const [px, vc] of [[600, '#ffd23f'], [652, '#3b6fd1'], [742, '#e34b4b']]) { R(px, 150, 2, 46, '#a8b4ba'); R(px - 2, 172, 6, 4, vc); R(px + 2, 173, 4, 2, '#5d6b77'); }
    for (let x = 580; x < 830; x += 34) { R(x, 186, 10, 6, '#e8eef0'); R(x + 2, 188, 2, 2, '#5d6b77'); R(x + 6, 188, 2, 2, '#5d6b77'); }
    // ---- 生活痕迹：咖啡杯、手套盒、胶带、冰箱上的便利贴、地上的黄色警示胶带和磨痕 ----
    R(598, 184, 8, 12, '#ffffff'); R(597, 182, 10, 3, '#3a3a46'); R(599, 188, 6, 3, '#8a5a3a'); R(606, 186, 2, 5, '#ffffff');
    HD.box(612, 184, 16, 12, ['#2a4a8a', '#3b6fd1', '#5a8ae0', '#86aaf0', '#c8dcff']); R(615, 184, 10, 2, '#e8f0ff');
    circle(722, 193, 3, '#f2c14e'); circle(722, 193, 1, '#2a2e36');
    for (const [nx, ny, nc] of [[856, 178, '#ffe36e'], [848, 196, '#f7a8c4']]) { R(nx, ny, 10, 9, nc); R(nx, ny, 10, 1, '#ffffff88'); R(nx + 2, ny + 3, 6, 1, '#8a7a5a'); R(nx + 2, ny + 5, 4, 1, '#8a7a5a'); }
    for (let x = 960; x < 1110; x += 12) { R(x, 318, 8, 3, '#f2c14e'); R(x + 8, 318, 4, 3, '#2b2238'); }
    for (const [sx, sy, sw] of [[300, 296, 20], [520, 326, 26], [760, 288, 18], [1180, 330, 22], [90, 312, 16]]) { R(sx, sy, sw, 1, '#a8b4b8'); R(sx + 4, sy + 1, sw - 9, 1, '#b4c0c4'); }
    // ---- 天花板日光灯 + 光锥 ----
    for (const lx of LIGHTS) {
      R(lx - 42, 1, 84, 10, '#aab6bc'); R(lx - 40, 2, 80, 8, '#f4f8f8'); R(lx - 38, 3, 76, 2, '#ffffff'); R(lx - 38, 7, 76, 2, '#ffffff');
      for (let k = -30; k <= 30; k += 15) R(lx + k, 2, 1, 8, '#c9d3d6');
      FX.cone(g, lx, 11, 76, 220, 230, '#fffbe8', 0.07);
    }
    // ---- 亮面地砖：家具倒影 + 顶灯光池 + 墙脚暗边 ----
    FX.reflect(g, c, BASE, 70, 0.16);
    for (const lx of LIGHTS) FX.pool(g, lx, 300, 96, 16, '#fff8e0', 0.09);
    FX.ao(g, 0, BASE, W, 12, 0.22);
    GFX.setCtx(real);
    return FX.bake(c, FX.BAKE.lab);
  }

  function paintLight() {
    const c = document.createElement('canvas'); c.width = W; c.height = 360;
    const g = c.getContext('2d'); const real = GFX.ctx; GFX.setCtx(g);
    g.fillStyle = '#272b56'; g.fillRect(0, 0, W, 360);
    g.globalCompositeOperation = 'lighter';
    const L = (x, y, r, col, n = 6, a = 0.2) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); const k = Math.min(1, n * a * 0.55); gr.addColorStop(0, HD.rgba(col, k)); gr.addColorStop(0.45, HD.rgba(col, k * 0.6)); gr.addColorStop(1, HD.rgba(col, 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
    L(54, 128, 46, '#1e5a36', 5, 0.25);
    L(1158, 104, 90, '#2a3060', 5, 0.25);
    L(1150, 180, 120, '#5a4426', 6, 0.22);
    L(1036, 120, 110, '#283a5a', 5, 0.22);
    L(686, 80, 170, '#5a5030', 7, 0.2);
    L(686, 230, 120, '#3a3420', 5, 0.18);
    L(229, 172, 60, '#1a2a40', 4, 0.2);
    g.globalCompositeOperation = 'source-over';
    GFX.setCtx(real);
    return c;
  }

  // 每帧的动态部分
  function draw(ctx, t, o) {
    const n = o.night;
    if (!bg) bg = paint();
    ctx.drawImage(bg, 0, 0);
    // 日光灯光锥里飘着的灰尘
    if (!n) for (const lx of LIGHTS) for (let i = 0; i < 6; i++) { const y = 30 + ((t * (5 + i) + i * 37) % 170), x = lx + Math.sin(t * 0.4 + i * 2.1) * (20 + y * 0.25); alpha(0.5 * Math.sin((y - 30) / 170 * Math.PI), () => P(x, y, '#ffffff')); }
    // 窗外
    const wx = 1110, wy = 58, ww = 96, wh = 92;
    if (n) {
      HD.dgradV(wx, wy, ww, wh, '#141a3c', 1, 1); HD.dgradV(wx, wy, ww, wh, '#2a2a5a', 0, 1);
      for (let i = 0; i < 14; i++) alpha(0.5 + Math.sin(t * 2 + i) * 0.4, () => P(wx + 4 + rnd(i) * 88, wy + 4 + rnd(i + 30) * 50, '#ffffff'));
      circle(wx + 72, wy + 20, 8, '#fff3c9'); circle(wx + 75, wy + 17, 7, '#1a2048');
      for (let i = 0; i < 9; i++) { const h = 14 + rnd(i + 7) * 24, x0 = wx + i * 11; R(x0, wy + wh - h, 10, h, '#0e1230'); for (let y = wy + wh - h + 3; y < wy + wh - 2; y += 4) for (let xx = x0 + 2; xx < x0 + 9; xx += 3) if (rnd(xx * 7 + y) > 0.6) P(xx, y, '#ffd66b'); }
    } else {
      HD.dgradV(wx, wy, ww, wh, '#86bde4', 1, 1); HD.dgradV(wx, wy, ww, wh, '#d0ebf8', 0, 1);
      ellipse(wx + 24, wy + 18, 12, 3, '#ffffff'); ellipse(wx + 70, wy + 30, 9, 2, '#ffffff');
      R(wx + 10, wy + 40, 40, 52, '#c99a7a'); R(wx + 10, wy + 40, 40, 3, '#8a4a3a'); for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) R(wx + 14 + k * 9, wy + 48 + r * 11, 5, 6, '#e8f4fa');
      R(wx + 56, wy + 56, 36, 36, '#d8d0c4'); for (let k = 0; k < 3; k++) R(wx + 60 + k * 11, wy + 62, 6, 26, '#9fc4da');
      circle(wx + 8, wy + 84, 10, '#5c9e6c'); circle(wx + 90, wy + 80, 12, '#6aa878'); circle(wx + 84, wy + 74, 6, '#86c08a');
    }
    R(wx + ww / 2 - 1, wy, 3, wh, '#8a98a2'); R(wx, wy + wh / 2 - 1, ww, 2, '#8a98a2');
    R(wx - 6, wy + wh + 2, ww + 12, 4, '#b8c2ca');
    if (!n) alpha(0.3, () => { line(wx + 6, wy + 40, wx + 22, wy + 8, '#ffffff'); line(wx + 60, wy + 86, wx + 80, wy + 50, '#ffffff'); });
    // Gwen 的显示器
    if (n) { R(200, 154, 58, 38, '#10141e'); }
    else {
      R(200, 154, 58, 38, '#e8f2f8'); R(200, 154, 58, 6, '#5677b8');
      for (let i = 0; i < 8; i++) { const h = 6 + Math.round((Math.sin(i * 1.3 + 2 + Math.sin(t * 0.7 + i) * 0.5) * 0.5 + 0.5) * 16); R(206 + i * 6, 186 - h, 4, h, i % 2 ? '#7ec8e3' : '#f7a8c4'); }
      if (Math.floor(t * 1.5) % 2) R(250, 156, 4, 2, '#4fe08a');
      R(204, 186, 50, 1, '#2b2238');
    }
    // Baiding 的终端
    R(1122, 158, 52, 36, '#11131a');
    for (let i = 0; i < 7; i++) R(1125, 161 + i * 4, 4 + ((i * 7 + Math.floor(t * 2)) % 30), 2, i === 6 ? '#ffffff' : '#9ef0b0');
    if (Math.floor(t * 2) % 2) R(1125 + 4 + ((6 * 7 + Math.floor(t * 2)) % 30), 185, 3, 2, '#ffffff');
    // 墙上的钟
    const cx = 330, cy = 40;
    circle(cx, cy, 13, '#5d6b77'); circle(cx, cy, 11, '#fbfdfd');
    for (let i = 0; i < 12; i++) P(cx + Math.round(Math.cos(i * 0.5236) * 9), cy + Math.round(Math.sin(i * 0.5236) * 9), '#9aa6ad');
    const hr = n ? 11.4 : 9.6;
    line(cx, cy, cx + Math.cos(-1.57 + (hr / 12) * 6.283) * 5, cy + Math.sin(-1.57 + (hr / 12) * 6.283) * 5, '#2b2238', 2);
    line(cx, cy, cx + Math.cos(-1.57 + t * 0.06) * 8, cy + Math.sin(-1.57 + t * 0.06) * 8, '#2b2238');
    P(cx, cy, '#e34b4b');
    // 创新点灯泡
    const bx = 686;
    R(bx, 16, 1, 46, '#7c8a94'); R(bx - 6, 60, 13, 6, '#5d6b77'); R(bx - 6, 60, 13, 1, '#8a98a4');
    if (o.bulbOn) {
      HD.glow(bx, 76, 40, '#fff3a0', 0.4 + Math.sin(t * 3) * 0.05);
      ellipse(bx, 75, 8, 10, '#ffe14a'); ellipse(bx - 1, 73, 5, 7, '#fff6b0'); P(bx - 3, 70, '#ffffff'); P(bx - 3, 71, '#ffffff');
      for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283 + t * 0.3; alpha(0.6, () => R(bx + Math.cos(a) * 18, 75 + Math.sin(a) * 18, 2, 2, '#fff3a0')); }
    } else {
      ellipse(bx, 75, 8, 10, n ? '#4a5070' : '#e6ebee'); ellipse(bx - 2, 72, 3, 5, n ? '#5a6080' : '#ffffff');
      R(bx - 1, 70, 1, 8, n ? '#5a6080' : '#b8c2ca'); R(bx + 1, 70, 1, 8, n ? '#5a6080' : '#b8c2ca');
    }
    R(bx - 4, 84, 9, 3, '#9aa6ad'); R(bx - 3, 87, 7, 2, '#7c8a94');
    // 资金罐
    const jx = 590, jy = 166;
    R(jx, jy, 26, 30, n ? '#5a6a90' : '#d6eef5'); R(jx - 1, jy - 4, 28, 5, '#9aa6ad'); R(jx - 1, jy - 4, 28, 1, '#c9d2d8');
    R(jx + 3, jy + 8, 20, 12, '#fff6c0'); text('$', jx + 11, jy + 11, '#c98a1a');
    for (let i = 0; i < 4; i++) R(jx + 4 + i * 5, jy + 24 - (i % 2), 4, 2, '#ffd23f');
    R(jx + 6, jy + 22, 10, 2, '#9ad08a');
    alpha(0.5, () => R(jx + 2, jy + 2, 2, 24, '#ffffff'));
    // OT-2 + Flex
    HD.ot2(900, 146, t);
    HD.flex(FLEX_X, FLEX_Y, o.flex, t);
  }

  // 夜晚：整体压暗（人物也一起），再把发光的东西画回来
  function nightFg(ctx, t, o) {
    if (!light) light = paintLight();
    const op = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(light, 0, 0); ctx.globalCompositeOperation = op;
    R(33, 121, 42, 11, '#2fae62'); text('EXIT', 39, 123, '#ffffff', 2); HD.glow(54, 127, 26, '#4fe08a', 0.22);
    R(1122, 158, 52, 36, '#11131a');
    for (let i = 0; i < 7; i++) R(1125, 161 + i * 4, 4 + ((i * 7 + Math.floor(t * 2)) % 30), 2, i === 6 ? '#ffffff' : '#9ef0b0');
    HD.glow(1148, 176, 36, '#9ef0b0', 0.12);
    if (o.bulbOn) { HD.glow(686, 76, 46, '#fff3a0', 0.3); ellipse(686, 75, 8, 10, '#ffe14a'); ellipse(685, 73, 5, 7, '#fff6b0'); }
    HD.flexEmissive(FLEX_X, FLEX_Y, o.flex, t);
    // Flex 屏幕的光洒在地上：运行时蓝光一闪一闪，跑完是绿光
    { const m = o.flex && o.flex.mood, col = m === 'ok' ? '#4fe08a' : m === 'error' ? '#ff5a5a' : '#5aa9e6', a = m === 'run' ? 0.22 + Math.sin(t * 8) * 0.08 : m === 'ok' ? 0.22 : 0.1;
      const op2 = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'lighter'; FX.pool(ctx, FLEX_X + 52, 292, 150, 26, col, a); HD.glow(FLEX_X + 52, 190, 120, col, a * 0.5); ctx.globalCompositeOperation = op2; }
    // 台灯
    const lx = 1110, ly = 176;
    R(lx, 196, 12, 8, '#3a3a46'); line(lx + 6, 196, lx + 2, 180, '#3a3a46', 2); line(lx + 2, 180, lx + 14, ly, '#3a3a46', 2); R(lx + 10, ly - 4, 14, 7, '#4a4a58');
    alpha(0.16, () => { for (let i = 0; i < 26; i++) R(lx + 12 - i * 0.7, ly + 3 + i, 14 + i * 1.4, 1, '#ffe2a8'); });
  }

  // 前景：地面反光 + 凳子 + 纸箱（画在人物之后）
  function fgProps(t, night) {
    if (!night) for (let x = 60; x < W; x += 250) alpha(0.1, () => { R(x + 10, 262, 70, 2, '#ffffff'); R(x + 20, 270, 50, 1, '#ffffff'); R(x + 30, 278, 30, 1, '#ffffff'); });
    // 实验凳
    const sx = 470, sy = 342;
    ellipse(sx, sy - 34, 18, 5, '#2a3450'); ellipse(sx, sy - 35, 16, 4, '#3a4870'); R(sx - 2, sy - 30, 4, 22, '#9aa6ad');
    for (const dx of [-16, 16]) line(sx, sy - 10, sx + dx, sy, '#7a8a92', 2); circle(sx - 16, sy + 1, 2, '#30303a'); circle(sx + 16, sy + 1, 2, '#30303a');
    alpha(0.25, () => ellipse(sx, sy + 3, 22, 3, '#2a3048'));
    // 纸箱
    const bx = 1150, by = 350;
    HD.box(bx, by - 30, 56, 30, ['#8a6a4a', '#a8825c', '#c9a27a', '#dcbd98', '#efd8b8']);
    R(bx + 26, by - 30, 4, 30, '#e8d8b8'); R(bx + 8, by - 22, 14, 8, '#ffffff'); text('TIPS', bx + 9, by - 20, '#3b6fd1');
    alpha(0.25, () => ellipse(bx + 28, by + 2, 32, 3, '#2a3048'));
  }

  // 前景视差层（离镜头最近，比背景移动得快）：推车、地上的线缆、绿植、纸箱，都压暗一点
  function fgNear(t) {
    // 地上的线缆
    for (const [x0, x1] of [[200, 520], [1180, 1420]]) for (let x = x0; x < x1; x += 2) { const y = 350 + Math.round(Math.sin(x * 0.03) * 3 + Math.sin(x * 0.011) * 3); R(x, y, 2, 2, '#56606c'); R(x, y, 2, 1, '#7a8694'); }
    // 推车（左）
    const cx = 120;
    R(cx, 318, 92, 6, '#5a6672'); R(cx, 318, 92, 1, '#8a96a2'); R(cx + 4, 324, 3, 36, '#4a5560'); R(cx + 85, 324, 3, 36, '#4a5560');
    R(cx + 10, 300, 26, 18, '#2c5aa0'); R(cx + 10, 300, 26, 2, '#4a7ac0'); R(cx + 40, 304, 18, 14, '#d8dee2'); R(cx + 62, 296, 8, 22, '#b8c4ca'); R(cx + 63, 292, 6, 4, '#e34b4b');
    // 绿植（中）
    for (const [lx, ly, r, c] of [[760, 340, 26, '#2f6a45'], [742, 332, 18, '#3c8a56'], [782, 330, 20, '#3c8a56'], [764, 318, 14, '#5aa86e']]) GFX.ellipse(lx, ly, r, Math.round(r * 0.6), c);
    R(746, 340, 36, 20, '#7a5a44'); R(746, 340, 36, 2, '#9a7a60');
    // 纸箱（右）
    HD.box(1380, 312, 70, 48, ['#5a4632', '#7a5e44', '#9a7a5a', '#b8966e', '#cfb08a']); R(1412, 312, 6, 48, '#c9b28e');
    HD.box(1450, 326, 50, 34, ['#5a4632', '#7a5e44', '#9a7a5a', '#b8966e', '#cfb08a']);
  }

  return { draw, nightFg, fgProps, fgNear, FLEX_X, FLEX_Y, W };
})();

(() => {
  const S = STORY.lab, FS = STORY.flex;
  const LANE = 256;
  const FLEX_SX = () => LAB.FLEX_X + 52 - G.camX;
  let st;
  const SEEN_IDS = ['photo', 'whiteboard', 'jar', 'notebook', 'bulb', 'fridge', 'ot2', 'partnerDesk', 'window'];
  const EXPLORE = ['whiteboard', 'jar', 'notebook', 'bulb', 'fridge', 'ot2', 'partnerDesk', 'window'];
  const explored = () => EXPLORE.filter((k) => (G.flags.labSeen || {})[k]).length;

  // 「好奇宝宝」：实验室里带「!」的东西（含合影）都看过
  function checkCurious() { const ls = G.flags.labSeen || {}; if (SEEN_IDS.every((k) => ls[k])) G.achieve('curious'); }
  async function seen(id) {
    G.flags.labSeen = G.flags.labSeen || {};
    const first = !G.flags.labSeen[id];
    G.flags.labSeen[id] = true; G.persist();
    checkCurious();
    if (G.flags.lab_boston || G.flags.lab_photoReady || !first || !EXPLORE.includes(id)) return;
    const left = EXPLORE.length - explored();
    if (left > 0) { G.toast(S.exploreLeft.replace('{n}', left), 2200); return; }
    await recall();
  }
  // 其他东西都看完了：Gwen 突然想起来，自己走到照片前
  async function recall() {
    G.flags.lab_photoReady = true; G.persist();
    await G.wait(400);
    G.gwen.face = 'surprised';
    await G.tween(G.gwen, { hop: 8 }, 120); await G.tween(G.gwen, { hop: 0 }, 160);
    await G.talk(S.photoRecall);
    G.gwen.face = null;
    await G.walk(G.gwen, 186); G.gwen.dir = -1;
    G.flags.labSeen.photo = true; G.persist();
    checkCurious();   // 自动走到照片前也算看过，这里要补一次检查
    await G.wait(300);
    await G.talk(S.photo);
    G.goto('boston', { fade: 900, trans: 'iris' });
  }

  G.def('lab', {
    k: 1, width: LAB.W, floor: LANE, minX: 40, maxX: 1210, bgm: 'lab', checkpoint: true,
    grade: { c: '#bfe0ff', a: 0.14, vig: 0.24 },
    fgPar(ctx, t) { LAB.fgNear(t); },
    hint: () => !G.flags.lab_boston ? (G.flags.lab_photoReady ? '看看工位上的那张合影' : S.exploreLeft.replace('{n}', EXPLORE.length - explored())) : !G.flags.lab_flex ? 'Flex 好像出问题了' : '去组会吧（左边的门）',
    setup(opt) {
      st = { flex: { mood: 'idle', gx: 0.3, dip: 0 }, bulb: 0, errT: 0 };
      checkCurious();   // 之前的存档已经全看过的，回到实验室时补发
      G.showRack(true);
      G.gwen = G.actor({ sprite: 'gwen', x: opt.from === 'boston' ? 200 : 60, y: LANE, speed: 110, bag: true, seed: 0.3 });
      if (G.flags.lab_flex) { st.flex.mood = 'ok'; this.partner = G.actor({ sprite: 'me', x: 1100, y: LANE, dir: -1, seed: 0.7 }); }
      else this.partner = null;
      if (G.flags.lab_boston && !G.flags.lab_flex) st.flex.mood = 'error';
      const lab = this;
      const O = (o) => { const ob = G.obj(Object.assign({ label: S.labels[o.id] }, o, { onTap: async () => {
        await o.onTap();
        if (o.id === 'bulb' && !G.flags.lab_bulb) { ob.seen = false; return; } // 没点亮之前「!」一直在
        if (SEEN_IDS.includes(o.id)) await seen(o.id);
      } })); return ob; };

      O({ id: 'door', x: 26, y: 142, w: 56, h: 102, stand: 54, hint: false, onTap: async () => {
        if (!G.flags.lab_flex) return G.talk(S.doorBlocked);
        AU.sfx('door'); G.gwen.visible = false; await G.wait(250); G.goto('boss');
      } });
      O({ id: 'photo', x: 166, y: 180, w: 22, h: 24, stand: 180, hint: !!(G.flags.lab_photoReady || G.flags.lab_boston), onTap: async () => {
        if (G.flags.lab_boston) return G.talk(S.photoAgain);
        if (!G.flags.lab_photoReady) { await G.talk(S.photoEarly); G.toast(S.exploreLeft.replace('{n}', EXPLORE.length - explored()), 2400); return; }
        await G.talk(S.photo);
        G.goto('boston', { fade: 900, trans: 'iris' });
      } });
      O({ id: 'whiteboard', x: 364, y: 60, w: 160, h: 112, stand: 444, onTap: () => G.talk(S.whiteboard) });
      O({ id: 'jar', x: 588, y: 160, w: 30, h: 36, stand: 603, onTap: () => G.talk(S.jar) });
      O({ id: 'notebook', x: 630, y: 184, w: 36, h: 14, stand: 648, onTap: () => G.talk(S.notebook) });
      O({ id: 'bulb', x: 672, y: 56, w: 28, h: 34, stand: 686, onTap: async () => {
        if (G.flags.lab_bulb) return G.talk(S.bulbAgain);
        if (st.bulb === 0) await G.say(S.bulbOff[0], S.bulbOff[1]);
        if (st.bulb < S.bulbTries.length) { AU.sfx('click'); G.toast(S.bulbTries[st.bulb], 1600); setTimeout(() => G.toast(S.bulbRetry, 2000), 350); st.bulb++; return; }
        G.flags.lab_bulb = true; G.persist();
        AU.sfx('ding');
        G.burst(686, 76, 20, ['#fff3a0', '#ffffff'], { speed: 50, life: 0.8, g: 0 });
        await G.talk(S.bulbOn);
        G.achieve('bulb');
      } });
      O({ id: 'fridge', x: 816, y: 146, w: 64, h: 98, stand: 848, onTap: () => G.talk(S.fridge) });
      O({ id: 'ot2', x: 900, y: 146, w: 64, h: 58, stand: 932, onTap: () => G.talk(G.flags.lab_flex ? S.ot2After : S.ot2) });
      O({ id: 'flex', x: LAB.FLEX_X, y: LAB.FLEX_Y - 22, w: 104, h: 142, stand: 1000, hint: false, onTap: () => lab.tapFlex() });
      O({ id: 'partnerDesk', x: 1118, y: 154, w: 60, h: 50, stand: 1148, onTap: () => G.talk(S.partnerDesk) });
      O({ id: 'window', x: 1110, y: 58, w: 96, h: 92, stand: 1148, onTap: () => G.talk(S.window) });
      // 区分 Flex 和 OT-2 的点击：Flex 在后面定义，优先命中
      if (!G.flags.lab_boston) G.setGoal(G.flags.lab_photoReady ? 'photo' : null);
      else if (!G.flags.lab_flex) G.setGoal('flex');
      else G.setGoal('door');
      const ls = G.flags.labSeen || {};
      G.objects.forEach((o) => { if (ls[o.id]) o.seen = true; });
    },

    async start(opt) {
      if (!G.flags.lab_entered) {
        G.flags.lab_entered = true; G.persist();
        await G.wait(300);
        await G.talk(S.enter);
        if (!G.flags.lab_photoReady) G.toast(S.exploreTip, 3000);
      }
      if (G.flags.lab_boston && !G.flags.lab_flex && !G.flags.lab_errShown) {
        G.flags.lab_errShown = true; G.persist();
        await G.wait(700);
        AU.sfx('error'); G.shake = 3;
        G.gwen.face = 'surprised'; G.gwen.hop = 0;
        await G.tween(G.gwen, { hop: 8 }, 120); await G.tween(G.gwen, { hop: 0 }, 160);
        await G.walk(G.gwen, 960);
        // 镜头推向报错的 Flex
        await G.zoomTo(1.14, FLEX_SX(), 170, 500);
        await G.talk(FS.start);
        G.zoomTo(1, null, null, 500);
        G.gwen.face = null;
      }
    },

    async tapFlex() {
      if (st.flex.mood !== 'error') return G.talk(G.flags.lab_flex ? S.flexHappy : S.flexIdle);
      // 自己先排查：试过的选项变灰，前两个都试过之后才轮到 agent
      const tried = new Set();
      for (;;) {
        const opts = FS.options.map((o, i) => i < 2 ? { t: o, off: tried.has(i), done: true } : { t: tried.size < 2 ? o + FS.agentLocked : o, off: tried.size < 2 });
        const c = await G.choose(FS.question, opts);
        if (c === 0) { AU.sfx('beep'); await G.talk(FS.restart); AU.sfx('error'); tried.add(0); }
        else if (c === 1) { await G.talk(FS.tip); tried.add(1); }
        else break;
      }
      // Gwen 走到 Baiding 的工位，自己跑 agent
      await G.talk(FS.fixStart);
      // 坐到 Baiding 的椅子上，对着他的电脑打字
      await G.walk(G.gwen, 1194); G.gwen.dir = -1;
      G.gwen.sit = true; G.gwen.pose = 'type'; G.gwen.y = LANE - 14;
      AU.sfx('type');
      await terminal();
      G.gwen.sit = false; G.gwen.pose = undefined; G.gwen.y = LANE;
      await G.wait(150);
      await G.walk(G.gwen, 1000); G.gwen.dir = 1;
      st.flex.mood = 'idle'; AU.sfx('beep');
      G.toast(FS.pipetteTip, 3000);
      for (let i = 0; i < 4; i++) {
        await G.waitTap();
        G.clearTap();
        const gx = 0.05 + i * 0.3;
        await G.tween(st.flex, { gx }, 220);
        await G.tween(st.flex, { dip: 8 }, 120);
        AU.sfx('pipette');
        G.burst(LAB.FLEX_X + 8 + 6 + gx * 80 + 7, LAB.FLEX_Y + 11 + 36, 8, ['#7ec8e3', '#ffffff', '#f7a8c4'], { speed: 22, life: 0.6, g: 60, size: 2 });
        G.toast(`加样 ${i + 1} / 4`, 900);
        await G.tween(st.flex, { dip: 0 }, 120);
      }
      st.flex.mood = 'ok';
      AU.sfx('success');
      G.gwen.face = 'happy';
      G.burst(LAB.FLEX_X + 52, LAB.FLEX_Y + 60, 30, ['#4fe08a', '#ffd66b', '#ffffff'], { speed: 90, life: 1, g: 60, size: 2 });
      await G.wait(600);
      await G.talk(FS.done);
      G.gwen.face = null;
      G.achieve('flex');
      // Baiding 这时候才到
      const me = this.partner = G.actor({ sprite: 'me', x: 1270, y: LANE, dir: -1, speed: 110, seed: 0.7 });
      await G.walk(me, 1100); me.dir = -1;
      await G.walk(G.gwen, 1030); G.gwen.dir = 1;
      for (const [who, line] of FS.meet) {
        if (who === 'Gwen') G.gwen.face = line.includes('有用') ? 'happy' : null;
        if (who === 'Baiding') me.face = 'happy';
        await G.say(who, line, { face: (who === 'Gwen' && line.includes('有用')) || who === 'Baiding' ? 'happy' : undefined });
      }
      G.gwen.face = null; me.face = null;
      await G.gainReagent(1);
      G.flags.lab_flex = true; G.persist();
      await G.wait(700);
      await G.notify(FS.notifyFrom, FS.notifyMsg, FS.notifySub);
      await G.talk(FS.goMeeting);
      G.toast(FS.goTip, 3000);
      G.setGoal('door');
    },

    update(dt) {
      if (st.flex.mood === 'error') { st.errT -= dt; if (st.errT <= 0) { st.errT = 3.2; if (!G.dialogOpen()) AU.sfx('error'); } }
      if (st.flex.mood === 'ok' && !G.locked) st.flex.gx = 0.5 + Math.sin(G.t * 0.6) * 0.35;
    },
    draw(ctx, t) { LAB.draw(ctx, t, { night: false, flex: st.flex, bulbOn: G.flags.lab_bulb }); },
    drawFg(ctx, t) {
      LAB.fgProps(t, false);
      if (st.flex.mood === 'error') alpha(0.06 + Math.sin(t * 8) * 0.04, () => GFX.R(G.camX, 0, 640, 360, '#ff3030'));
    },
  });
  const { alpha } = GFX;

  async function terminal() {
    const e = G.el('<div class="terminal" style="left:50%;top:14%;transform:translateX(-50%)"></div>');
    for (const [k, line] of FS.terminal) {
      const d = document.createElement('div'); if (k) d.className = k; e.appendChild(d);
      for (let i = 1; i <= line.length; i++) { d.textContent = line.slice(0, i); if (i % 3 === 0) AU.sfx('click'); await G.wait(14); }
      await G.wait(260);
    }
    await G.wait(900);
    e.remove();
  }
})();
