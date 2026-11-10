// 闪回：一年前的 SLAS 展会（复古色调）。高清 640×360，场景宽 860。
(() => {
  const { R, P, line, circle, ellipse, alpha, text } = GFX;
  const S = STORY.boston;
  const W = 860, BASE = 244, LANE = 262;
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  let st, bg = null;

  function paint() {
    const c = document.createElement('canvas'); c.width = W; c.height = 360;
    const g = c.getContext('2d'); const real = GFX.ctx; GFX.setCtx(g);
    // 展馆：高高的天花板和桁架
    R(0, 0, W, BASE, '#d9d2c6'); HD.fadeV(0, 0, W, 120, '#8a8478', 0.5, 0);
    R(0, 0, W, 30, '#6a6458');
    for (let x = 0; x < W; x += 28) { line(x, 6, x + 14, 26, '#8a8478'); line(x + 14, 26, x + 28, 6, '#8a8478'); }
    R(0, 4, W, 3, '#8a8478'); R(0, 25, W, 3, '#8a8478');
    for (let x = 60; x < W; x += 140) { R(x, 30, 2, 18, '#5a5448'); R(x - 10, 48, 22, 6, '#f4efe4'); }
    // 从桁架上垂下来的赞助商竖幅
    for (const [bx, c1, c2, word] of [[96, '#2f9e5a', '#e8f4ec', 'LAB'], [560, '#d9483b', '#fbe8e4', 'AUTO']]) {
      R(bx, 28, 1, 6, '#6a6458'); R(bx + 33, 28, 1, 6, '#6a6458'); R(bx - 2, 33, 38, 2, '#8a8478');
      R(bx, 35, 34, 54, c1); R(bx + 2, 37, 30, 50, c2); R(bx, 85, 34, 4, c1);
      text(word, bx + 17 - GFX.textW(word, 2) / 2, 46, c1, 2); R(bx + 6, 64, 22, 2, c1); R(bx + 9, 70, 16, 2, c1);
    }
    // 远处的展台轮廓
    for (let i = 0; i < 12; i++) { const x = i * 76 + 10, h = 30 + rnd(i) * 26; R(x, 150 - h, 60, h, '#c9c1b2'); R(x, 150 - h, 60, 6, ['#9ab0c8', '#c8a0a0', '#a8c0a0'][i % 3]); }
    R(0, 150, W, 94, '#d2cabd');
    // 地毯
    FX.carpet(0, BASE, W, 116, ['#46527e', '#5a6896', '#e0b868', '#414c76']);
    R(0, BASE, W, 3, '#2a3458'); FX.ao(g, 0, BASE + 3, W, 16, 0.35);
    // 射灯打在地毯上的光
    for (let x = 60; x < W; x += 140) { FX.pool(g, x - 20, 294, 64, 14, '#fff0d0', 0.2); }
    // 展台 1：仪器
    booth(30, '#3b6fd1', 'ROBOLAB');
    // 展台 2：机械臂
    booth(270, '#2f9e5a', 'BIOTECH');
    // 茶歇台
    HD.box(496, 206, 104, 6, ['#a89e8c', '#c9bfae', '#e8e0d0', '#fffaf0', '#ffffff']);
    R(500, 212, 96, 32, '#c9bfae'); R(500, 212, 96, 2, '#b0a694'); for (let x = 504; x < 596; x += 10) R(x, 214, 1, 30, '#d8cfc0');
    R(508, 184, 16, 22, '#3a3a46'); R(510, 180, 12, 4, '#5a5a66'); R(524, 190, 4, 3, '#3a3a46');
    for (let i = 0; i < 5; i++) { R(534 + i * 9, 196, 7, 10, '#ffffff'); R(535 + i * 9, 197, 5, 2, '#7a4a2c'); }
    ellipse(584, 204, 12, 3, '#ffffff'); for (let i = 0; i < 5; i++) circle(576 + i * 4, 201, 2, '#c9a27a');
    // 合影背景墙
    R(624, 70, 200, 174, '#f4efe4'); R(624, 70, 200, 4, '#2f5f8a'); R(624, 240, 200, 4, '#c9bfae');
    for (let y = 84, r = 0; y < 236; y += 26, r++) for (let x = 634 + (r % 2) * 24; x < 816; x += 48) { text('SLAS', x, y, '#9ab0c8', 2); }
    R(620, 66, 4, 178, '#9a9286'); R(824, 66, 4, 178, '#9a9286');
    // 悬挂横幅
    R(250, 34, 240, 1, '#6a6458'); R(260, 35, 1, 16, '#6a6458'); R(479, 35, 1, 16, '#6a6458');
    R(256, 50, 228, 36, '#2f5f8a'); R(256, 50, 228, 4, '#d9483b'); text('SLAS', 326, 58, '#ffffff', 4); R(256, 84, 228, 2, '#1f4060');
    // 生活痕迹：掉在地毯上的传单、贴地的黑胶带、展台边的帆布袋、茶歇台上的纸杯
    R(214, 300, 14, 10, '#fffaf0'); R(214, 300, 14, 2, '#2f9e5a'); R(216, 304, 8, 1, '#9aa6ad'); R(216, 306, 6, 1, '#9aa6ad');
    R(0, 282, W, 3, '#262a3c'); for (let x = 0; x < W; x += 40) R(x + 10, 283, 12, 1, '#3a3e52');
    for (const tx of [222, 466]) { R(tx, 228, 14, 16, '#e8dcc0'); R(tx, 228, 14, 2, '#f4ecd8'); R(tx + 2, 220, 2, 9, '#c9b88f'); R(tx + 10, 220, 2, 9, '#c9b88f'); R(tx + 3, 233, 8, 6, ['#3b6fd1', '#d9483b'][tx > 300 ? 1 : 0]); }
    for (const cx of [590, 596]) { R(cx, 200, 5, 6, '#ffffff'); R(cx, 200, 5, 1, '#d9483b'); }
        // 展台、茶歇台底下的接触阴影
    for (const [x, w] of [[38, 184], [278, 184], [500, 96], [624, 200]]) FX.ao(g, x, BASE, w, 8, 0.3);
    GFX.setCtx(real);
    return FX.bake(c, FX.BAKE.boston);
  }
  // 前景视差层：隔离带立柱 + 绒绳、两侧的大盆栽
  function fgNear(t) {
    const posts = [40, 230, 420, 610, 800, 990, 1180];
    posts.forEach((x, i) => {
      if (i < posts.length - 1 && i % 3 !== 2) { const x2 = posts[i + 1]; for (let k = 0; k <= 40; k++) { const u = k / 40, px = x + (x2 - x) * u, py = 318 + Math.sin(u * Math.PI) * 14; R(px, py, 5, 4, '#7a1a2a'); R(px, py, 5, 1, '#b8324a'); } }
      R(x - 2, 316, 8, 44, '#8a8a92'); R(x - 2, 316, 2, 44, '#c9c9d2'); R(x - 5, 312, 14, 6, '#c9a24a'); R(x - 8, 354, 20, 6, '#6a6a72');
    });
    for (const px of [-10, 1240]) { for (const [dx, dy, r, c] of [[0, 330, 34, '#2a5a3a'], [-20, 316, 22, '#3a7a4e'], [22, 312, 24, '#3a7a4e'], [0, 296, 18, '#5a9a62']]) GFX.ellipse(px + dx, dy, r, Math.round(r * 0.7), c); R(px - 22, 336, 44, 24, '#5a4a40'); }
  }
  function booth(x, c, name) {
    R(x, 96, 200, 6, c); R(x, 102, 200, 90, '#f4efe4'); R(x + 4, 102, 4, 142, '#9a9286'); R(x + 192, 102, 4, 142, '#9a9286');
    R(x + 16, 110, 168, 26, c); text(name, x + 100 - GFX.textW(name, 2) / 2, 117, '#ffffff', 2);
    R(x + 20, 144, 70, 3, '#c9bfae'); R(x + 20, 152, 56, 3, '#c9bfae'); R(x + 20, 160, 64, 3, '#c9bfae');
    HD.box(x + 8, 216, 184, 28, ['#6a6458', '#9a9286', c, c, '#ffffff']); R(x + 8, 216, 184, 2, '#ffffff');
    R(x + 8, 210, 184, 6, '#e8e0d0');
  }

  // 展台后面的工作人员（穿展台颜色的 T 恤），站在柜台后，下半身被柜台挡住
  function staff(t) {
    for (const [x, k, sd, dir] of [[176, 'crowd8', 0.15, -1], [372, 'crowd9', 0.65, 1]]) {
      const a = st.staffA[k] || (st.staffA[k] = { sprite: k, x, y: 238, dir, anim: 0, seed: sd, badge: true, shadow: false });
      a.anim = t; a.dir = G.gwen && Math.abs(G.gwen.x - x) < 120 ? (G.gwen.x > x ? 1 : -1) : dir;
      CHR.drawActor(a, t);
    }
    // 把柜台重新盖上去
    for (const bx of [30, 270]) GFX.ctx.drawImage(bg, bx + 8, 208, 184, 36, bx + 8, 208, 184, 36);
  }
  function liveBooths(t) {
    // ROBOLAB：屏幕 + 仪器模型
    const x1 = 30;
    R(x1 + 110, 140, 70, 46, '#2b2f36'); R(x1 + 112, 142, 66, 42, '#5aa9e6');
    R(x1 + 116 + ((t * 30) % 50), 156, 8, 8, '#ffffff'); R(x1 + 116, 176, Math.round(((t * 0.3) % 1) * 58), 3, '#ffffff');
    HD.box(x1 + 30, 168, 64, 42, ['#6d7783', '#9aa6ad', '#dfe4e8', '#eef1f4', '#ffffff']);
    R(x1 + 34, 172, 56, 24, '#bfe3f5'); R(x1 + 40 + Math.sin(t) * 14 + 14, 174, 8, 10, '#3d4852'); R(x1 + 36, 198, 52, 8, '#2f6fa3');
    // BIOTECH：机械臂演示 + 宣传册
    const x2 = 270;
    const a = [1.6 + Math.sin(t * 1.2) * 0.4, -1.0 + Math.sin(t * 1.5) * 0.4, -0.6];
    arm(x2 + 60, 210, a);
    for (let i = 0; i < 3; i++) { R(x2 + 120 + i * 18, 186, 16, 24, '#fffaf0'); R(x2 + 122 + i * 18, 190, 12, 3, '#2f9e5a'); R(x2 + 122 + i * 18, 196, 10, 1, '#bbb'); R(x2 + 122 + i * 18, 200, 12, 1, '#bbb'); }
  }
  function arm(bx, by, a) {
    const L = [26, 22, 12];
    R(bx - 11, by - 4, 22, 4, '#1a1a20'); R(bx - 7, by - 9, 14, 5, '#22222a');
    let px = bx, py = by - 12, ang = a[0];
    const js = [[px, py]];
    for (let i = 0; i < 3; i++) {
      if (i > 0) ang += a[i];
      const nx = px + Math.cos(ang) * L[i], ny = py - Math.sin(ang) * L[i];
      line(px, py, nx, ny, '#16161c', [8, 7, 5][i]); line(px, py, nx, ny, '#3a3a44', [6, 5, 3][i]);
      px = nx; py = ny; js.push([px, py]);
    }
    js.slice(0, 3).forEach(([qx, qy]) => { circle(qx, qy, 4, '#16161c'); circle(qx, qy, 3, '#4a4a56'); });
  }
  function lights(t) {
    for (let x = 60; x < W; x += 140) alpha(0.12 + Math.sin(t * 1.3 + x) * 0.02, () => { for (let i = 0; i < 70; i++) R(x + 1 - i * 0.5, 54 + i * 1.2, i + 2, 1, '#fff6e0'); });
  }

  G.def('boston', {
    k: 1, width: W, floor: LANE, minX: 30, maxX: 830, bgm: 'flash',
    grade: { c: '#fff0d8', a: 0.12, vig: 0.26 },
    fgPar(ctx, t) { fgNear(t); },
    hint: () => (st.called ? '走到合影的位置' : '在展会里逛逛'),
    setup() {
      if (!bg) bg = paint();
      st = { called: false, timer: 0, crowd: 0, countdown: null, cap: 1, flashT: 0, staffA: {} };
      G.setFilter('sepia(.6) saturate(1.2) contrast(1.03) brightness(1.04)');
      G.gwen = G.actor({ sprite: 'gwen', x: 110, y: LANE, speed: 120, badge: true, seed: 0.3 });
      // 背景里走动的人
      st.walkers = [G.actor({ sprite: 'crowd5', x: 200, y: 250, speed: 40, badge: true, z: -1, seed: 0.2 }), G.actor({ sprite: 'crowd6', x: 560, y: 250, speed: 34, badge: true, z: -1, dir: -1, seed: 0.5 }), G.actor({ sprite: 'crowd2', x: 280, y: 249, speed: 46, badge: true, z: -1, seed: 0.8 })];
      st.walkers.forEach((w, i) => { w.home = [[150, 470], [440, 610], [40, 300]][i]; w.pause = 1 + i; });
      G.obj({ id: 'booth1', label: S.labels.booth1, x: 38, y: 100, w: 184, h: 116, stand: 132, onTap: () => G.talk(S.booth) });
      G.obj({ id: 'booth2', label: S.labels.booth2, x: 278, y: 100, w: 184, h: 116, stand: 370, onTap: () => G.talk(S.booth2) });
      G.obj({ id: 'coffee', label: S.labels.coffee, x: 500, y: 178, w: 100, h: 34, stand: 548, onTap: () => G.talk(S.coffee) });
      G.obj({ id: 'spot', label: S.labels.spot, x: 640, y: 250, w: 128, h: 30, stand: 692, hint: false, enabled: () => st.called, onTap: () => photo() });
    },
    async start() {
      await G.wait(2400);
      G.tween(st, { cap: 0 }, 900);
      await G.talk(S.intro);
    },
    update(dt) {
      if (!st.called && !G.locked) {
        st.timer += dt;
        const seenAny = G.objects.some((o) => o.seen);
        if (st.timer > 9 || (seenAny && st.timer > 1.5)) { st.called = true; G.run(callSeq); }
      }
      st.walkers.forEach((w) => {
        if (w.target !== null && w.target !== undefined) return;
        if (!w.looked) {
          // 停下来看看最近的展台，偶尔冒个小气泡
          w.looked = true;
          const near = [130, 370, 548].reduce((a, b) => (Math.abs(b - w.x) < Math.abs(a - w.x) ? b : a));
          w.dir = near >= w.x ? 1 : -1;
          if (Math.random() < 0.5) setTimeout(() => CHR.emote(w, ['♪', '?', '…', '!'][Math.floor(Math.random() * 4)]), 400);
        }
        w.pause -= dt; if (w.pause > 0) return;
        w.pause = 2.5 + Math.random() * 3; w.looked = false;
        G.walk(w, w.home[0] + Math.random() * (w.home[1] - w.home[0]));
      });
      if (st.flashT > 0) st.flashT -= dt;
    },
    draw(ctx, t) {
      ctx.drawImage(bg, 0, 0);
      liveBooths(t);
      staff(t);
      if (st.called && !st.shooting) alpha(0.5 + Math.sin(t * 4) * 0.3, () => { R(640, 276, 128, 2, '#fffaf0'); R(640, 268, 2, 10, '#fffaf0'); R(766, 268, 2, 10, '#fffaf0'); });
    },
    drawFg(ctx, t) {
      lights(t);
      if (st.josh && st.josh.pose === 'reach') { const jx = st.josh.x + 15, jy = st.josh.y - 48; R(jx, jy - 6, 6, 10, '#2b2238'); R(jx + 1, jy - 5, 4, 7, '#5aa9e6'); }
      // 偶尔有人在拍照的闪光
      if (Math.random() < 0.004) st.flashT = 0.08;
      if (st.flashT > 0) HD.glow(80 + Math.random() * 600, 180, 60, '#ffffff', 0.4);
      // 合影的闪光灯把所有人照亮
      if (st.bigFlash > 0) { const op = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'lighter'; HD.glow(712, 210, 240, '#ffffff', st.bigFlash * 0.7); if (st.josh) HD.glow(st.josh.x + 18, st.josh.y - 50, 60, '#ffffff', st.bigFlash); FX.pool(ctx, 712, 262, 200, 30, '#ffffff', st.bigFlash * 0.5); ctx.globalCompositeOperation = op; }
    },
    drawScreen(ctx, t) {
      if (st.cap > 0) alpha(st.cap, () => { const w = GFX.textW(S.caption, 4); R(320 - w / 2 - 12, 104, w + 24, 36, '#2b2238'); text(S.caption, 320 - w / 2, 112, '#fffaf0', 4); });
      if (st.countdown) { const s = st.countdown; const w = GFX.textW(s, 16); text(s, 320 - w / 2 + 4, 94, '#2b2238', 16); text(s, 320 - w / 2, 90, '#fffaf0', 16); }
    },
  });

  async function callSeq() {
    // Josh 举着手机走过来
    st.josh = G.actor({ sprite: 'josh', x: -30, y: LANE + 6, speed: 130, badge: true, seed: 0.9 });
    await G.walk(st.josh, 140);
    st.josh.pose = 'wave';
    await G.talk(S.call);
    st.josh.pose = null;
    G.walk(st.josh, 556).then(() => { st.josh.dir = 1; st.josh.pose = 'reach'; });
    st.crowd = [[650, 'crowd0'], [674, 'crowd1'], [730, 'crowd3'], [756, 'crowd4'], [782, 'crowd7']].map(([x, k], i) => {
      const a = G.actor({ sprite: k, x: x + 120, y: 252, speed: 110, badge: true, z: -1, seed: i * 0.37, dir: -1 });
      setTimeout(() => G.walk(a, x).then(() => (a.dir = x < 716 ? 1 : -1)), i * 260);
      return a;
    });
    G.setGoal('spot');
    G.toast(S.goPhoto, 3000);
  }

  async function photo() {
    G.setGoal(null); st.shooting = true;
    const me = G.actor({ sprite: 'me', x: 880, y: LANE, dir: -1, speed: 130, badge: true, seed: 0.7 });
    await G.walk(me, 720);
    G.gwen.dir = 1; me.dir = -1;
    await G.wait(300);
    G.gwen.face = 'happy'; me.face = 'happy'; st.crowd.forEach((a) => (a.face = 'happy'));
    // 镜头推近合影的人群
    G.zoomTo(1.16, 712 - G.camX, 230, 700);
    // Josh 举着手机，每数一下手跟着点一下
    for (const n of S.countdown) { st.countdown = n; AU.sfx('beep'); G.tween(st.josh, { hop: 3 }, 90).then(() => G.tween(st.josh, { hop: 0 }, 140)); await G.wait(650); }
    st.countdown = null;
    await G.talk(S.cheese);
    // 拍照之前先截一下画面
    const crop = document.createElement('canvas'); crop.width = 240; crop.height = 150;
    const cx = G.clamp(Math.round(712 - G.camX) - 120, 0, 400);
    crop.getContext('2d').drawImage(G.ctx.canvas, cx, 128, 240, 150, 0, 0, 240, 150);
    st.bigFlash = 1; G.tween(st, { bigFlash: 0 }, 1100);
    await G.flash();
    G.zoomTo(1, null, null, 600);
    const url = crop.toDataURL();
    const pol = G.el(`<div class="panel center" style="padding:calc(var(--u)*4) calc(var(--u)*4) calc(var(--u)*12);transform:translate(-50%,-50%) rotate(-3deg);animation:popc .4s ease-out;background:#fff">
      <img src="${url}" style="display:block;width:calc(var(--u)*150);image-rendering:pixelated;filter:sepia(.6) saturate(1.2)">
      <div style="position:absolute;left:0;right:0;bottom:calc(var(--u)*3);text-align:center;font-size:var(--fs2);color:#6a5a7a">SLAS</div></div>`);
    await Promise.race([G.waitTap(), G.wait(4000)]); G.clearTap();
    pol.remove();
    G.gwen.face = null; me.face = null;
    st.crowd.forEach((a, i) => { a.face = null; setTimeout(() => G.walk(a, 900 + i * 20), i * 200); });
    G.walk(st.josh, 900);
    await G.wait(900);
    await G.walk(me, 740); me.dir = -1;
    await G.talk(S.after);
    await scanQR();
    G.toast(S.added, 2600);
    G.achieve('social');
    await G.wait(400);
    await G.talk(S.outro);
    await G.gainReagent(0);
    G.flags.lab_boston = true; G.persist();
    G.goto('lab', { from: 'boston', fade: 900, trans: 'iris' });
  }

  async function scanQR() {
    const N = 21, cs = document.createElement('canvas'); cs.width = N; cs.height = N;
    const g = cs.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, N, N); g.fillStyle = '#1b1b24';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (Math.random() > 0.55) g.fillRect(x, y, 1, 1);
    const finder = (fx, fy) => { g.fillStyle = '#fff'; g.fillRect(fx - 1, fy - 1, 9, 9); g.fillStyle = '#1b1b24'; g.fillRect(fx, fy, 7, 7); g.fillStyle = '#fff'; g.fillRect(fx + 1, fy + 1, 5, 5); g.fillStyle = '#1b1b24'; g.fillRect(fx + 2, fy + 2, 3, 3); };
    finder(0, 0); finder(14, 0); finder(0, 14);
    const box = G.el(`<div class="panel center" style="padding:calc(var(--u)*6);text-align:center;cursor:pointer;animation:popc .3s ease-out">
      <div style="font-size:var(--fs2);color:#6a5a7a;margin-bottom:calc(var(--u)*3)">${S.qrTitle}</div>
      <div style="position:relative;display:inline-block">
        <img src="${cs.toDataURL()}" style="display:block;width:calc(var(--u)*64);image-rendering:pixelated;border:calc(var(--u)*2) solid #fff">
        <div class="scan" style="position:absolute;left:0;right:0;top:0;height:calc(var(--u)*1.5);background:#4fe08a;opacity:0"></div>
      </div>
      <div style="font-size:var(--fs2);margin-top:calc(var(--u)*3)">${S.scanTip}</div></div>`);
    await G.waitTap();
    const ln = box.querySelector('.scan');
    ln.style.opacity = 1; ln.style.transition = 'top .9s linear';
    AU.sfx('beep');
    requestAnimationFrame(() => (ln.style.top = 'calc(100% - var(--u) * 1.5)'));
    await G.wait(1000);
    AU.sfx('success');
    box.remove();
  }
})();
