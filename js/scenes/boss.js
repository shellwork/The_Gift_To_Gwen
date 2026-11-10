// 第二章：组会 Boss 战（Bex）。高清 640×360。
(() => {
  const { R, P, line, circle, ellipse, alpha, text } = GFX;
  const S = STORY.boss;
  let st, hud, bg = null;

  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  // 预生成一团乱的图
  const messy = [];
  for (let k = 0; k < 6; k++) { const pts = []; let y = 60 + Math.random() * 60; for (let i = 0; i <= 24; i++) { y += (Math.random() - 0.5) * 34; y = Math.max(50, Math.min(150, y)); pts.push(y); } messy.push(pts); }

  function paint() {
    const c = document.createElement('canvas'); c.width = 640; c.height = 360;
    const g = c.getContext('2d'); const real = GFX.ctx; GFX.setCtx(g);
    // 墙
    R(0, 0, 640, 250, '#d6dee8'); for (let x = 0; x < 640; x += 32) R(x, 18, 1, 210, '#ccd5e0');
    R(0, 0, 640, 18, '#e6ecf2'); R(0, 16, 640, 2, '#b8c2cc');
    R(0, 228, 640, 22, '#b8c4d0'); R(0, 228, 640, 2, '#9aa8b6');
    HD.fadeV(0, 18, 640, 40, '#7a8aa0', 0.25, 0);
    // 地毯
    R(0, 250, 640, 110, '#6a7488'); for (let y = 252; y < 360; y += 6) for (let x = (y / 6) % 2 ? 0 : 6; x < 640; x += 12) P(x, y, '#76809a');
    HD.fadeV(0, 250, 640, 16, '#3a4058', 0.4, 0);
    // 左边：窗户和城市
    R(20, 40, 130, 150, '#8a98a8'); R(24, 44, 122, 142, '#a6c4dc'); HD.dgradV(24, 44, 122, 142, '#dcecf6', 0, 1);
    for (let i = 0; i < 9; i++) { const h = 30 + hash(i) * 70, x = 24 + i * 14; R(x, 186 - h, 12, h, '#8a9ab0'); for (let y = 190 - h; y < 182; y += 6) for (let wx = x + 2; wx < x + 11; wx += 4) P(wx, y, '#c8d8e8'); }
    R(83, 44, 4, 142, '#8a98a8'); R(24, 112, 122, 4, '#8a98a8');
    R(14, 190, 142, 6, '#c8d0d8');
    // 右边：书架
    R(492, 40, 136, 188, '#6b4434'); R(496, 44, 128, 180, '#8f5e40');
    for (let r = 0; r < 4; r++) {
      const sy = 44 + r * 45;
      R(496, sy + 41, 128, 4, '#6b4434');
      let x = 500;
      while (x < 618) { const w = 5 + Math.floor(hash(x + r * 7) * 6), h = 24 + Math.floor(hash(x * 3 + r) * 14); R(x, sy + 41 - h, w, h, ['#c95b6a', '#5677b8', '#e0ae48', '#6a9f80', '#b9a3d6', '#e8e2d8', '#3a4a6a'][Math.floor(hash(x + r) * 7)]); R(x, sy + 41 - h, 1, h, '#ffffff33'); x += w + 1; }
    }
    // 投影幕
    R(176, 46, 288, 6, '#7c8a94'); R(182, 52, 276, 162, '#ffffff'); R(182, 214, 276, 3, '#c9d2db'); R(318, 214, 4, 8, '#7c8a94'); R(318, 18, 4, 28, '#9aa6ad');
    // 植物
    R(162, 210, 20, 30, '#d9946a'); R(162, 210, 20, 3, '#e8ae80'); circle(172, 198, 12, '#5c9e6c'); circle(166, 192, 7, '#86c08a'); circle(180, 196, 6, '#3f7a58');
    GFX.setCtx(real);
    return FX.bake(c, FX.BAKE.boss);
  }

  function figure(t) {
    const ox = 182, oy = 50; const my = (v) => oy + 4 + (v - 40) * 0.82;
    text(st.clean ? 'FIG 1  BEAUTIFUL' : 'FIG 1', ox + 12, oy + 10, '#2b2238', 2);
    line(ox + 24, oy + 30, ox + 24, oy + 146, '#2b2238'); line(ox + 24, oy + 146, ox + 256, oy + 146, '#2b2238');
    for (let i = 0; i < 6; i++) { R(ox + 20, oy + 36 + i * 20, 4, 1, '#2b2238'); R(ox + 40 + i * 40, oy + 146, 1, 4, '#2b2238'); }
    if (!st.clean) {
      const cols = ['#e34b4b', '#3b6fd1', '#2f9e5a', '#f0a14a', '#9a63c9', '#d4537e'];
      messy.forEach((pts, k) => { for (let i = 0; i < pts.length - 1; i++) line(ox + 28 + i * 9.5, my(pts[i]), ox + 28 + (i + 1) * 9.5, my(pts[i + 1]), cols[k]); });
      for (let i = 0; i < 9; i++) { const x = ox + 40 + i * 24, y = oy + 62 + ((i * 37) % 50); line(x, y - 18, x, y + 18, '#555'); R(x - 2, y - 2, 5, 5, '#2b2238'); }
      text('???', ox + 210, oy + 40, '#e34b4b', 2);
    } else {
      for (let i = 0; i < 24; i++) { const x = ox + 28 + i * 9.5, f = (k) => oy + 138 - k * 4 - Math.sin(k * 0.5) * 3; line(x, f(i), x + 9.5, f(i + 1), '#2f9e5a', 2); }
      for (let i = 0; i < 7; i++) { const x = ox + 36 + i * 32, y = oy + 134 - i * 14.5; R(x - 2, y - 2, 5, 5, '#3b6fd1'); line(x, y - 5, x, y + 5, '#3b6fd1'); }
      text('P<0.001', ox + 170, oy + 40, '#2f9e5a', 2);
      for (let i = 0; i < 6; i++) { const a = t * 2 + i; alpha(0.6, () => R(ox + 200 + Math.cos(a) * 30, oy + 80 + Math.sin(a) * 20, 3, 3, '#ffd66b')); }
    }
  }

  // 窗外：慢慢飘过的云，偶尔一架飞机
  function windowSky(t) {
    for (let i = 0; i < 3; i++) { const x = 24 + ((t * (3 + i) + i * 50) % 160) - 30, y = 52 + i * 9; GFX.ctx.save(); GFX.ctx.beginPath(); GFX.ctx.rect(24, 44, 122, 60); GFX.ctx.clip(); ellipse(x, y, 14, 3, '#ffffff'); ellipse(x + 8, y - 2, 8, 3, '#ffffff'); GFX.ctx.restore(); }
    const k = (t % 20) / 6; if (k < 1) { const x = 24 + k * 122, y = 60 - k * 8; R(x, y, 5, 1, '#5a6a80'); P(x + 2, y - 1, '#5a6a80'); alpha(0.5, () => R(x - 14 * k, y, 14 * k, 1, '#ffffff')); }
  }
  // 投影仪的光束，光里有灰尘
  function beam(t) {
    const ctx = GFX.ctx; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(320, 0, 320, 214); gr.addColorStop(0, 'rgba(255,250,230,0.12)'); gr.addColorStop(1, 'rgba(255,250,230,0.03)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(312, 0); ctx.lineTo(328, 0); ctx.lineTo(458, 52); ctx.lineTo(458, 214); ctx.lineTo(182, 214); ctx.lineTo(182, 52); ctx.closePath(); ctx.fill(); ctx.restore();
    for (let i = 0; i < 16; i++) { const y = 10 + ((t * (4 + (i % 4)) + i * 23) % 190), w = 16 + (y / 214) * 260, x = 320 + Math.sin(i * 2.3 + t * 0.3) * w * 0.45; alpha(0.45 * Math.sin((y / 200) * Math.PI), () => P(x, y, '#ffffff')); }
  }
  function table(t) {
    // 前景的会议桌
    R(0, 296, 640, 10, '#a77b5a'); R(0, 296, 640, 2, '#c89a74'); R(0, 306, 640, 54, '#8a6242');
    for (let x = 0; x < 640; x += 40) R(x, 306, 1, 54, '#7a5436');
    HD.fadeV(0, 306, 640, 10, '#3a2418', 0.4, 0);
    // 笔记本电脑、咖啡杯、本子
    for (const [x, c] of [[60, '#c3c6cf'], [420, '#3a3f47']]) { R(x, 270, 54, 30, c); R(x + 3, 273, 48, 24, '#2a3050'); R(x - 6, 298, 66, 4, c); R(x + 8, 278, 20, 2, '#9ef0b0'); R(x + 8, 283, 30, 1, '#5a8ab0'); R(x + 8, 287, 24, 1, '#5a8ab0'); }
    for (const x of [190, 300, 560]) { R(x, 284, 14, 14, '#ffffff'); R(x + 14, 287, 3, 7, '#ffffff'); R(x + 1, 285, 12, 2, '#6a4a30'); for (let k = 0; k < 4; k++) alpha(0.5 - k * 0.1, () => P(x + 7 + Math.round(Math.sin(t * 3 + k + x) * 1.5), 280 - k * 2 - ((t * 6) % 3), '#ffffff')); }
    R(230, 292, 40, 6, '#fffaf0'); R(230, 292, 40, 1, '#c9d6e6'); R(512, 290, 30, 8, '#ffe36e');
    // 散落的打印稿和笔、笔记本电脑上的便利贴
    R(340, 294, 30, 5, '#f4f4f8'); R(344, 292, 30, 5, '#ffffff'); R(347, 294, 20, 1, '#9aa6ad'); line(380, 297, 394, 293, '#3b6fd1', 2); R(102, 274, 8, 7, '#ffe36e'); R(462, 276, 8, 7, '#f7a8c4');
  }

  G.def('boss', {
    k: 1, width: 640, floor: 290, bgm: 'boss', checkpoint: true, noWalk: true, fixedCam: true,
    grade: { c: '#ffe6c0', a: 0.12, vig: 0.28 },
    setup() {
      if (!bg) bg = paint();
      st = { gHp: 100, bHp: 100, bMax: 90, coffee: 3, quizI: 0, atkI: 0, agentUsed: false, turn: 0, clean: false, piHit: 0 };
      G.gwen = G.actor({ sprite: 'gwen', x: 112, y: 300, scale: 1.25, dir: 1, bag: true, seed: 0.3 });
      st.pi = G.actor({ sprite: 'pi', x: 520, y: 296, scale: 1.5, dir: -1, seed: 0.6 });
    },
    async start() {
      await G.wait(400);
      await G.talk(S.intro);
      hud = G.el(`<div>
        <div class="hpbar left">Gwen<div class="bar"><div class="fill g"></div></div></div>
        <div class="hpbar right boss">${S.name}<div class="bar"><div class="fill b"></div></div></div></div>`);
      syncHud();
      while (st.bHp > 0) {
        await playerTurn();
        if (st.bHp <= 0) break;
        await G.wait(400);
        await bossTurn();
        st.turn++;
      }
      await ending();
    },
    update(dt) {
      if (st.piHit > 0) st.piHit -= dt;
      st.pi.y = 296 + Math.round(Math.sin(G.t * 2) * 1);
      // 被反驳时身体往后一仰
      st.pi.x = 520 + Math.round(Math.max(0, st.piHit) * 16);
      st.pi.alpha = st.piHit > 0 && Math.floor(st.piHit * 20) % 2 ? 0.35 : 1;
    },
    draw(ctx, t) {
      ctx.drawImage(bg, 0, 0);
      figure(t);
      windowSky(t);
      beam(t);
      R(310, 0, 20, 8, '#3a3f47'); R(316, 6, 8, 2, '#fff6c0');
    },
    drawFg(ctx, t) {
      table(t);
      if (st.thinking) {
        const x = 548, y = 122;
        R(x, y, 40, 20, '#fffaf0'); R(x - 1, y + 1, 1, 18, '#2b2238'); R(x + 40, y + 1, 1, 18, '#2b2238'); R(x, y - 1, 40, 1, '#2b2238'); R(x, y + 20, 40, 1, '#2b2238');
        R(x + 6, y + 21, 4, 3, '#fffaf0'); R(x + 3, y + 25, 3, 2, '#fffaf0');
        const n = Math.floor(t * 3) % 4; for (let i = 0; i < 3; i++) R(x + 10 + i * 8, y + 8, 4, 4, i < n ? '#2b2238' : '#c9c0b4');
      }
    },
  });

  function syncHud() {
    if (!hud) return;
    hud.querySelector('.fill.g').style.width = st.gHp + '%';
    hud.querySelector('.fill.b').style.width = Math.max(0, st.bHp) + '%';
  }
  function popNum(x, y, txt, cls) {
    const e = G.el(`<div class="dmg ${cls || ''}" style="left:${(x / 640) * 100}%;top:${(y / 360) * 100}%">${txt}</div>`);
    setTimeout(() => e.remove(), 1000);
  }
  function hitBoss(n, crit) {
    st.bHp = Math.max(0, st.bHp - n * 100 / st.bMax); st.piHit = 0.5; G.shake = crit ? 3 : 1.5;
    AU.sfx(crit ? 'crit' : 'hit');
    popNum(480, 150, (crit ? '暴击 ' : '') + '-' + n, crit ? 'crit' : '');
    G.burst(520, 200, crit ? 30 : 14, crit ? ['#ffd66b', '#ffffff', '#ff8a6a'] : ['#ffffff', '#c9d2db'], { speed: crit ? 120 : 70, life: 0.6, g: 80, size: 2 });
    syncHud();
  }
  async function gwenHop() { await G.tween(G.gwen, { hop: 10 }, 120); await G.tween(G.gwen, { hop: 0 }, 160); }

  // 像素图标（代替 emoji）
  let iconsReady = false;
  function makeIcons() {
    if (iconsReady) return; iconsReady = true;
    const mk = (fn) => { const c = document.createElement('canvas'); c.width = 16; c.height = 16; const real = GFX.ctx; GFX.setCtx(c.getContext('2d')); fn(); GFX.setCtx(real); return c.toDataURL(); };
    const I = {
      data: mk(() => { R(1, 1, 14, 14, '#ffffff'); R(1, 1, 14, 1, '#2b2238'); R(1, 14, 14, 1, '#2b2238'); R(1, 1, 1, 14, '#2b2238'); R(14, 1, 1, 14, '#2b2238'); R(3, 9, 2, 4, '#3b6fd1'); R(6, 6, 2, 7, '#e34b4b'); R(9, 8, 2, 5, '#2f9e5a'); R(12, 4, 1, 9, '#f2c14e'); }),
      coffee: mk(() => { R(3, 4, 9, 11, '#2b2238'); R(4, 5, 7, 9, '#3a2a20'); R(4, 5, 7, 2, '#f4efe6'); R(4, 9, 7, 3, '#3d7a5a'); R(2, 2, 11, 2, '#2b2238'); R(3, 3, 9, 1, '#ffffff'); R(10, 0, 1, 3, '#2f9e5a'); }),
      quiz: mk(() => { circle(8, 6, 5, '#2b2238'); circle(8, 6, 4, '#ffe14a'); R(6, 11, 5, 3, '#9aa6ad'); R(6, 14, 5, 1, '#2b2238'); P(6, 4, '#ffffff'); R(7, 5, 2, 1, '#fff6b0'); }),
      agent: mk(() => { R(3, 4, 10, 9, '#2b2238'); R(4, 5, 8, 7, '#e8ecef'); R(5, 7, 2, 2, '#3b6fd1'); R(9, 7, 2, 2, '#3b6fd1'); R(6, 10, 4, 1, '#4fe08a'); R(7, 1, 2, 3, '#2b2238'); P(8, 0, '#e34b4b'); R(1, 7, 2, 3, '#2b2238'); R(13, 7, 2, 3, '#2b2238'); }),
    };
    const css = Object.entries(I).map(([k, u]) => `.pic-${k}{background-image:url(${u})}`).join('');
    const el = document.createElement('style'); el.textContent = css; document.head.appendChild(el);
  }

  function pickAction() {
    makeIcons();
    return new Promise((res) => {
      const A = S.actions;
      const canAgent = !st.agentUsed;   // 大招从第一回合就能用
      const box = G.el(`<div class="actions">
        <button class="btn" data-k="data"><i class="pic pic-data"></i>${A.data.name}<span class="d">${A.data.desc}</span></button>
        <button class="btn" data-k="coffee" ${st.coffee ? '' : 'disabled'}><i class="pic pic-coffee"></i>${A.coffee.name} ×${st.coffee}<span class="d">${A.coffee.desc}</span></button>
        <button class="btn" data-k="quiz"><i class="pic pic-quiz"></i>${A.quiz.name}<span class="d">${A.quiz.desc}</span></button>
        <button class="btn ${canAgent ? 'primary' : ''}" data-k="agent" ${canAgent ? '' : 'disabled'}><i class="pic pic-agent"></i>${A.agent.name}<span class="d">${st.agentUsed ? '已使用' : A.agent.desc}</span></button></div>`);
      box.querySelectorAll('button').forEach((b) => {
        b.addEventListener('pointerdown', (e) => e.stopPropagation());
        b.addEventListener('click', (e) => { e.stopPropagation(); if (b.disabled) return; AU.sfx('select'); box.remove(); res(b.dataset.k); });
      });
    });
  }

  async function playerTurn() {
    if (st.gHp < 35 && st.coffee) G.toast(S.lowHp, 2400);
    const k = await pickAction();
    if (k === 'data') {
      G.gwen.pose = 'reach'; gwenHop();
      await G.say('', S.dataMsgs[rnd(0, S.dataMsgs.length - 1)]);
      G.gwen.pose = null;
      hitBoss(rnd(14, 19));
      await G.wait(500);
    } else if (k === 'coffee') {
      st.coffee--; st.gHp = Math.min(100, st.gHp + 32); syncHud();
      AU.sfx('heal'); popNum(110, 180, '+32', 'heal');
      G.gwen.face = 'happy';
      G.burst(112, 220, 16, ['#9ef0b0', '#ffffff'], { speed: 40, life: 0.8, g: -40, size: 2 });
      await G.say('', S.coffeeMsg);
      G.gwen.face = null;
    } else if (k === 'quiz') {
      const q = S.quiz[st.quizI % S.quiz.length]; st.quizI++;
      st.thinking = true;
      await G.say('Bex', q.say);
      st.thinking = false;
      const order = Math.random() < 0.5 ? [0, 1] : [1, 0];
      const c = await G.choose(S.quizAsk, order.map((i) => q.options[i]));
      if (order[c] === q.answer) { G.gwen.face = 'happy'; await G.say('', S.quizRight, { sub: q.options[q.answer] }); hitBoss(rnd(26, 32), true); G.achieve('quiz'); await G.wait(500); G.gwen.face = null; }
      else { G.gwen.face = 'meh'; await G.say('', S.quizWrong, { sub: q.options[q.answer] }); G.gwen.face = null; }
    } else if (k === 'agent') {
      st.agentUsed = true;
      G.gwen.pose = 'up';
      for (const l of S.agentLines) { if (l.who === 'Bex') st.pi.face = 'happy'; await G.say(l.who, l.say, l.sub ? { sub: l.sub } : {}); }
      G.gwen.pose = null; st.pi.face = null;
      hitBoss(rnd(38, 42), true);
      G.burst(520, 180, 40, ['#ffd66b', '#ffffff', '#81d8d0'], { speed: 110, life: 1, g: 40, size: 2 });
      await G.wait(600);
    }
  }

  async function bossTurn() {
    const a = S.attacks[st.atkI % S.attacks.length]; st.atkI++;
    st.thinking = true;
    st.pi.pose = 'wave';
    await G.say('Bex', a.say, { sub: a.sub });
    st.pi.pose = null;
    st.thinking = false;
    let d = rnd(14, 20);
    AU.sfx('hurt'); G.shake = 1.2;
    G.gwen.face = 'surprised';
    if (st.gHp - d < 10) { d = Math.max(0, st.gHp - 10); st.gHp = 10; syncHud(); popNum(110, 170, '-' + d); await G.say('', S.clamp); }
    else { st.gHp -= d; syncHud(); popNum(110, 170, '-' + d); await G.wait(400); }
    G.gwen.face = null;
  }

  async function ending() {
    AU.bgm(null);
    await G.wait(600);
    for (const l of S.ending) {
      if (l.say.startsWith('This figure')) { st.clean = true; AU.sfx('ding'); st.pi.face = 'happy'; CHR.emote(st.pi, '!'); }
      if (l.who === 'Gwen') G.gwen.face = 'happy';
      await G.say(l.who, l.say, l.sub ? { sub: l.sub } : {});
    }
    G.gwen.face = null; st.pi.face = null;
    hud && hud.remove(); hud = null;
    AU.bgm('lab');
    G.achieve('boss');
    await G.gainReagent(2);
    G.goto('street', { fade: 900 });
  }
})();
