// 背景音乐乐谱（由 audio.js 实时合成）
// 记号：音名 C5 / F#4 / Bb3，「=」延长上一个音，「-」休止，「|」小节线（只为好读）
// 鼓：k 底鼓 / s 军鼓 / h 闭镲 / o 开镲 / c 吊镲
// 和弦后面的 :n 是这个和弦占几个八分音符（默认一小节）
// 每个声部：v 音色（sq 方波 / p25 / p12 窄脉冲 / tri 三角 / sine 正弦 / drum 鼓），rate 每拍几格（2=八分音符，4=十六分音符）
const TRACKS_SRC = (() => {
  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const nm = (m) => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
  const Q = { '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], sus4: [0, 5, 7], sus2: [0, 2, 7], add9: [0, 4, 7, 14], dim: [0, 3, 6] };
  const acc = (a) => (a === '#' ? 1 : a === 'b' ? -1 : 0);
  function chord(spec) {
    const [name, len] = spec.split(':');
    const m = /^([A-G])([#b]?)(maj7|m7|m|7|sus4|sus2|add9|dim)?(?:\/([A-G])([#b]?))?$/.exec(name);
    if (!m) throw new Error('bad chord ' + spec);
    const r = SEMI[m[1]] + acc(m[2]);
    return { r, iv: Q[m[3] || ''], b: m[4] ? SEMI[m[4]] + acc(m[5]) : r, len: len ? +len : null };
  }
  const prog = (s) => s.trim().split(/\s+/).filter((x) => x !== '|').map(chord);
  // 从 lo（MIDI）往上取和弦音，转位自然衔接
  const tonesFrom = (c, lo) => { const out = []; for (let m = lo; m < lo + 36; m++) if (c.iv.some((i) => (((m - c.r - i) % 12) + 12) % 12 === 0)) out.push(m); return out; };
  const midi = (n) => { const m = /^([A-G])([#b]?)(-?\d)$/.exec(n); return (+m[3] + 1) * 12 + SEMI[m[1]] + acc(m[2]); };

  // 分解和弦：pat 是和弦音序号（0 最低），'-' 休止，'=' 延长
  function arp(cs, L, pat, lo) {
    const out = [];
    prog(cs).forEach((c) => { const n = c.len ? Math.round(c.len * L / 8) : L, t = tonesFrom(c, midi(lo)); for (let i = 0; i < n; i++) { const p = pat[i % pat.length]; out.push(p === '-' || p === '=' ? p : nm(t[p])); } });
    return out.join(' ');
  }
  // 低音：R 根音（斜杠和弦取低音）/ 5 五度 / 8 高八度 / 3 三度
  function bass(cs, L, pat, oct = 2) {
    const out = [], P = pat.trim().split(/\s+/);
    prog(cs).forEach((c) => {
      const n = c.len ? Math.round(c.len * L / 8) : L; let R = 12 * (oct + 1) + c.b; if (c.b >= 7) R -= 12;
      for (let i = 0; i < n; i++) { const p = P[i % P.length]; out.push(p === 'R' ? nm(R) : p === '5' ? nm(R + 7) : p === '8' ? nm(R + 12) : p === '3' ? nm(R + c.iv[1]) : p); }
    });
    return out.join(' ');
  }
  // 长音铺底：每个和弦取一个和弦音一直延长
  function pad(cs, L, idx, lo) {
    const out = [];
    prog(cs).forEach((c) => { const n = c.len ? Math.round(c.len * L / 8) : L; out.push(nm(tonesFrom(c, midi(lo))[idx])); for (let i = 1; i < n; i++) out.push('='); });
    return out.join(' ');
  }
  const rep = (s, n) => Array(n).fill(s).join(' ');
  const rest = (n) => rep('-', n);
  const J = (...a) => a.join(' ');

  // 旋律变形工具
  const SEM_OF = (n) => midi(n);
  const tr = (s, k) => s.replace(/\b([A-G][#b]?-?\d)\b/g, (n) => nm(SEM_OF(n) + k));          // 移调
  const toks = (s) => s.trim().split(/\s+/);
  const aug = (s) => toks(s).map((t) => (t === '|' ? t : t === '-' ? '- -' : t + ' =')).join(' '); // 节奏放慢一倍
  // 断奏：短音只留一格，长音留两格，其余变成休止
  const stacc = (s) => { const a = toks(s), out = []; for (let i = 0; i < a.length; i++) { const t = a[i]; if (t === '|' || t === '-' || t === '=') { out.push(t === '=' ? '-' : t); continue; } let n = 0; for (let j = i + 1; j < a.length && (a[j] === '=' || a[j] === '|'); j++) if (a[j] === '=') n++; out.push(t); let k = 0; for (let j = i + 1; j < a.length && (a[j] === '=' || a[j] === '|'); j++) { if (a[j] === '|') { out.push('|'); continue; } k++; out.push(n >= 3 && k === 1 ? '=' : '-'); } i += a.slice(i + 1).findIndex((x) => x !== '=' && x !== '|') === -1 ? a.length : a.slice(i + 1).findIndex((x) => x !== '=' && x !== '|'); } return out.join(' '); };
  const pulse = (s) => { const a = toks(s); let last = '-'; return a.map((t) => { if (t === '|') return t; if (t === '=') return last; last = t === '-' ? '-' : t; return t; }).join(' '); }; // 长音改成连续八分音符

  // ================= 主题（所有场景配乐共用） =================
  // A 段 8 小节：上行的分解和弦 + 两步下行，第 4 小节半终止，第 8 小节回到主音
  const TA = J(
    '| E5 = G5 = C6 = B5 A5 | G5 = = = E5 = = = | F5 = A5 = C6 = B5 A5 | G5 = = = = = - - |',
    '| E5 = G5 = B5 = A5 G5 | A5 = = = C6 = = = | D6 = C6 = B5 = A5 = | C6 = = = = = - - |');
  const TAc = 'C Am F G Em Am Dm7:4 G:4 C';
  // B 段 8 小节：回应，结尾停在属和弦，接回 A 段
  const TB = J(
    '| A5 = = = G5 = F5 = | G5 = = = F5 = E5 = | E5 = = = G5 = B5 = | A5 = = = = = - - |',
    '| F5 = = = A5 = D6 = | D6 = C6 = B5 = G5 = | E5 = G5 = C6 = = = | B5 = = = D6 = - - |');
  const TBc = 'F G Em Am Dm7 G C/E:4 F:4 G';
  // B 段的收束版（片尾用）：最后两小节落回主音
  const TBend = J(
    '| A5 = = = G5 = F5 = | G5 = = = F5 = E5 = | E5 = = = G5 = B5 = | A5 = = = = = - - |',
    '| F5 = = = A5 = D6 = | D6 = C6 = B5 = G5 = | F5 = = = E5 = D5 = | C5 = = = = = - - |');
  const TBendc = 'F G Em Am Dm7 G Dm7:4 G:4 C';

  // ================= 标题 / 倒计时：主题 A，八音盒 =================
  const title = { bpm: 72, echo: { t: 0.75, fb: 0.34, wet: 0.32 }, ch: [
    { v: 'sine', vol: 0.065, env: 'pluck', n: TA },
    { v: 'sine', vol: 0.028, env: 'pluck', rate: 4, n: arp(TAc, 16, [0, 2, 1, 2, 3, 2, 1, 2], 'E4') },
    { v: 'tri', vol: 0.08, n: bass(TAc, 8, 'R = = = 5 = = =') },
    { v: 'p12', vol: 0.01, env: 'pad', n: pad(TAc, 8, 1, 'G4') },
  ] };

  // ================= 家：主题 A + B，轻快 =================
  const homeC = TAc + ' ' + TBc;
  const home = { bpm: 104, echo: { t: 0.5, fb: 0.2, wet: 0.14 }, ch: [
    { v: 'p25', vol: 0.04, n: J(TA, TB) },
    { v: 'p12', vol: 0.017, env: 'pluck', n: arp(homeC, 8, [0, 1, 2, 1, 0, 1, 2, 1], 'G4') },
    { v: 'tri', vol: 0.11, n: bass(homeC, 8, 'R - R 5 8 - 5 -') },
    { v: 'drum', vol: 0.5, n: rep('k - h - s - h h | k - h k s - h -', 8) },
  ] };

  // ================= 开车：主题改成连续八分音符，往前冲 =================
  const driveC = homeC;
  const drive = { bpm: 136, echo: { t: 0.75, fb: 0.18, wet: 0.1 }, ch: [
    { v: 'sq', vol: 0.028, n: J(pulse(TA), TB) },
    { v: 'p12', vol: 0.015, env: 'pluck', rate: 4, n: arp(driveC, 16, [0, 1, 2, 1], 'E4') },
    { v: 'tri', vol: 0.11, n: bass(driveC, 8, 'R R 8 R R R 8 R') },
    { v: 'drum', vol: 0.55, n: rep('k - h - s - h k | k - h - s h h -', 8) },
  ] };

  // ================= 实验室：主题移到 G 大调，断奏，好奇又忙碌 =================
  const labC = 'G Em C D Bm Em Am7:4 D:4 G   C D Bm Em Am7 D G/B:4 C:4 D';
  const lab = { bpm: 112, echo: { t: 0.75, fb: 0.25, wet: 0.16 }, ch: [
    { v: 'p25', vol: 0.036, env: 'pluck', n: tr(J(stacc(TA), stacc(TB)), -5) },
    { v: 'sine', vol: 0.03, env: 'pluck', n: arp(labC, 8, [2, '-', 1, 2, '-', 2, 1, '-'], 'D5') },
    { v: 'tri', vol: 0.1, n: bass(labC, 8, 'R = 5 = R = 5 8') },
    { v: 'drum', vol: 0.36, n: rep('k - h - s - h - | k - h k s - h h', 8) },
  ] };

  // ================= SLAS 回忆：主题 A，换成大七和弦，连奏，怀念 =================
  const flashC = 'Cmaj7 Am7 Fmaj7 G Em7 Am7 Dm7:4 G:4 Cmaj7';
  const flash = { bpm: 80, echo: { t: 0.75, fb: 0.36, wet: 0.32 }, ch: [
    { v: 'tri', vol: 0.075, vib: 1, n: TA },
    { v: 'sine', vol: 0.03, env: 'pluck', rate: 4, n: arp(flashC, 16, [0, 1, 2, 3, 2, 1, 2, 3], 'C4') },
    { v: 'sine', vol: 0.085, n: bass(flashC, 8, 'R = = = 5 = = =') },
    { v: 'p12', vol: 0.011, env: 'pad', n: pad(flashC, 8, 2, 'E4') },
  ] };

  // ================= 组会 Boss 战：主题放到 A 小调，快速连击 =================
  const bossA = TA.replace('| G5 = = = = = - - |', '| G#5 = = = = = - - |');
  const bossC = 'Am F Dm E Em Am Dm:4 E:4 Am';
  const boss = { bpm: 160, echo: { t: 0.5, fb: 0.12, wet: 0.08 }, ch: [
    { v: 'sq', vol: 0.03, n: J(pulse(bossA), tr(pulse(bossA), -12)) },
    { v: 'p12', vol: 0.02, n: J(rest(64), tr(bossA, -5)) },
    { v: 'tri', vol: 0.11, n: bass(bossC + ' ' + bossC, 8, 'R 8 R 8 R 8 R 8') },
    { v: 'drum', vol: 0.6, n: rep('k h s h k k s h', 15) + ' k s k s s s c -' },
  ] };

  // ================= 傍晚街道：主题移到 F 大调，暖色、慢一点 =================
  const streetC = 'F Dm Bb C Am Dm Gm7:4 C7:4 F   Bb C Am Dm Gm7 C F/A:4 Bb:4 C';
  const street = { bpm: 86, echo: { t: 0.75, fb: 0.28, wet: 0.2 }, ch: [
    { v: 'p25', vol: 0.034, vib: 1, n: tr(J(TA, TB), -7) },
    { v: 'tri', vol: 0.034, env: 'pluck', n: arp(streetC, 8, [0, 2, 1, 2, 0, 2, 1, 2], 'A3') },
    { v: 'tri', vol: 0.1, n: bass(streetC, 8, 'R = = 5 8 = 5 =') },
    { v: 'drum', vol: 0.3, n: rep('k - h - s - h - | k - h h s - h o', 8) },
  ] };

  // ================= 深夜实验室：主题前半句放慢一倍，只剩几个音 =================
  const nightC = 'Cmaj7:16 Am7:16 Fmaj7:16 G:8 Gsus4:8';
  const night = { bpm: 66, echo: { t: 0.75, fb: 0.42, wet: 0.36 }, ch: [
    { v: 'tri', vol: 0.06, vib: 1, n: aug(TA.split('|').slice(0, 5).join('|') + '|') },
    { v: 'sine', vol: 0.026, env: 'pluck', rate: 4, n: arp(nightC, 16, [0, 1, 2, 3, 4, 3, 2, 1], 'C4') },
    { v: 'sine', vol: 0.08, n: bass(nightC, 8, 'R = = = = = = = 5 = = = = = = =') },
  ] };

  // ================= 休息室：期待、要有惊喜了 =================
  // 明亮的大调，旋律一路往上走；钟表一样轻轻的滴答声
  const revealC = 'C F/C G/B C Am F Dm7 G   F G Em Am Dm7 Em F G';
  const reveal = { bpm: 96, echo: { t: 0.75, fb: 0.3, wet: 0.26 }, ch: [
    { v: 'sine', vol: 0.06, env: 'pluck', n: J(
      '| G5 - E5 - G5 - C6 - | A5 - F5 - A5 - C6 - | B5 - G5 - D6 - B5 - | C6 = = = - - G5 - |',
      '| E6 - C6 - A5 - C6 - | D6 - C6 - A5 - F5 - | F5 - A5 - C6 - D6 - | D6 = = = B5 = G5 = |',
      '| C6 = A5 = F5 = A5 = | D6 = B5 = G5 = B5 = | E6 = = = D6 = B5 = | C6 = = = = = E5 = |',
      '| F5 = A5 = D6 = F6 = | E6 = D6 = B5 = G5 = | A5 = C6 = F6 = A6 = | G6 = = = = = - - |') },
    { v: 'tri', vol: 0.045, n: J(rest(64),
      '| A4 = = = = = = = | B4 = = = = = = = | G4 = = = = = = = | A4 = = = = = = = |',
      '| A4 = = = = = = = | B4 = = = = = = = | C5 = = = = = = = | D5 = = = B4 = = = |') },
    { v: 'p25', vol: 0.016, env: 'pluck', n: arp(revealC, 8, [0, 2, 1, 2, 0, 2, 1, 2], 'E4') },
    { v: 'tri', vol: 0.085, env: 'pluck', n: bass(revealC, 8, 'R - - - 5 - - -') },
    { v: 'drum', vol: 0.22, n: J(rep('h - h - h - h -', 8), rep('k - h - h - h -', 6), 'k - h - s - h - | k - s - s s s s') },
  ] };

  // ================= 生日歌（3/4 拍） =================
  const bdMel = '| G4 G4 | A4 = G4 = C5 = | B4 = = = G4 G4 | A4 = G4 = D5 = | C5 = = = G4 G4 | G5 = E5 = C5 = | B4 = A4 = F5 F5 | E5 = C5 = D5 = | C5 = = = = = - - - -';
  const bdC = 'C G G C C F G C';
  const birthday = { bpm: 108, echo: { t: 0.5, fb: 0.2, wet: 0.16 }, ch: [
    { v: 'sq', vol: 0.042, n: J(bdMel, bdMel) },
    { v: 'p12', vol: 0.02, n: J(rest(54), '- -', arp(bdC, 6, [0, 2, 1, 2, 0, 2], 'E5'), '- - - -') },
    { v: 'tri', vol: 0.11, n: J(rep(J('- -', bass(bdC, 6, 'R = 5 = 5 ='), 'C3 = = ='), 2)) },
    { v: 'drum', vol: 0.4, n: J(rep(J('- -', rep('k - h - h -', 8), 'k - - -'), 1), rep(J('- -', rep('k - s - s -', 7), 'k - s - s s', 'c - - -'), 1)) },
  ] };

  // ================= 片尾字幕：主题完整走一遍，最后用 IV–I 收住 =================
  // 前奏 2 小节 → A 段（安静）→ B 段（鼓进来，逐渐推高）→ A 段再现（全部声部，情绪最满）→ 尾声
  const endTag = '| A5 = = = = = = = | G5 = = = = = = = |';
  const endC = J('C G/B', TAc, TBc, TAc, 'F C');
  const ending = { bpm: 76, loop: 8, echo: { t: 0.75, fb: 0.36, wet: 0.3 }, ch: [
    { v: 'tri', vol: 0.075, vib: 1, n: J(rest(16), TA, TB, tr(TA, -12), tr(endTag, -12)) },
    { v: 'p25', vol: 0.038, vib: 1, n: J(rest(16 + 128), TA, endTag) },
    { v: 'sine', vol: 0.03, env: 'pluck', rate: 4, n: J(arp(J('C G/B', TAc), 16, [0, 1, 2, 3, 2, 1, 2, 3], 'C4'), arp(J(TBc, TAc), 16, [0, 2, 1, 3, 2, 4, 3, 5], 'C4'), arp('F C', 16, [0, 1, 2, 3, 4, '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '='], 'C4')) },
    { v: 'tri', vol: 0.1, n: J(bass(J('C G/B', TAc), 8, 'R = = = 5 = = ='), bass(J(TBc, TAc), 8, 'R = R 5 8 = 5 ='), bass('F C', 8, 'R = = = = = = =')) },
    { v: 'p12', vol: 0.011, env: 'pad', n: pad(endC, 8, 1, 'E4') },
    { v: 'drum', vol: 0.36, n: J(rest(16 + 64), rep('h - h - h - h -', 7), 'h - h - s - s s', 'c - h - s - h - | k - h - s - h h', rep('k - h - s - h - | k - h k s - h h', 2), 'k - h - s - h - | k - s - s s s s', 'c - - - - - - - | - - - - - - - -') },
  ] };

  // ================= 隐藏结局：ユメセカイ（按 Baiding 提供的简谱，1=Eb，4/4；谱上 ♩=96，按原曲放慢到 82） =================
  // 播放时跳过开头的副歌，从第 10 小节（主歌）开始；放完后也回到主歌
  // 简谱记号：数字是音级，后面 ' 表示高八度（'' 两个八度），. 表示低八度（: 两个八度），前面 # / b / n 是升 / 降 / 还原
  // 每个音写成「音/时值」，时值以十六分音符为单位；和弦用 + 连接（从低到高）；0 是休止
  const EB = 63, DEG = [0, 2, 4, 5, 7, 9, 11];
  function jp(tok) {
    const m = /^([#bn]?)([1-7])((?:'|\.|:)*)$/.exec(tok);
    if (!m) throw new Error('bad note ' + tok);
    let v = EB + DEG[+m[2] - 1] + (m[1] === '#' ? 1 : m[1] === 'b' ? -1 : 0);
    for (const c of m[3]) v += c === "'" ? 12 : c === '.' ? -12 : -24;
    return v;
  }
  function score(s) { return s.split('|').map((b) => b.trim()).filter(Boolean).flatMap((b) => b.split(/\s+/).map((e) => { const [n, d] = e.split('/'); return { notes: n === '0' ? [] : n.split('+').map(jp).sort((a, b) => a - b), d: +d }; })); }
  // 把一串和弦事件拆成声部：pick(notes) 选出这个声部要弹的音
  function voiceOf(evs, pick) { return evs.map((e) => { const m = e.notes.length ? pick(e.notes) : null; return (m == null ? '-' : nm(m)) + ' =' .repeat(0) + (m == null ? ' -'.repeat(e.d - 1) : ' ='.repeat(e.d - 1)); }).join(' '); }
  const top = (n) => n[n.length - 1], low = (n) => (n.length > 1 ? n[0] : null), mid = (n) => (n.length > 2 ? n[n.length - 2] : null);
  const lowOnly = (n) => n[0], hiLH = (n) => (n.length > 1 ? n[n.length - 1] : null);

  const B14 = "3.+5./2 1/2 1/2 1/2 7./2 1/1 2/3 7./2", B15 = "1/8 0/2 1/2 7./1 6./1 5./2", B16 = "6./6 7./1 1/7 6./2";
  const B22 = "4.+6./2 3/2 3/2 3/1 4/3 3/2 2/2 1/2";
  // 副歌（开头那段）：第 2–8 小节，后面第 30–36 小节原样再唱一遍
  const CHORUS = [
    "3+5+1'+2'+3'/2 4'/2 5'/2 6'/2 5'/2 4'/2 3'/2 2'/2",
    "2+4+6+3'/6 4'/1 3'/2 2'/6 0/1",
    "5+1'+3'/2 4'/2 5'/2 6'/2 5'/2 4'/2 3'/2 4'/2",
    "#6+2'+5'/6 1'/1 #6'/2 6'/2 5'/2 4'/2 3'/2",
    "2'/1 1'/4 5/2 4+5+7/2 1'/2 2'/2 7/2",
    "3+5+7+2'+3'/6 2'/1 5+2'/3 1'/2 3'/2 1'/2",
    "0/4 3'/2 1'/2 0/3 1'/1 7/2 1'/2",
  ];
  const yumeRH = [
    "0/8 0/2 0/1 1'/1 2'/1 1'/1 7/1 1'/1",
    ...CHORUS,
    "1'/16",
    "5.+1+3+5/4 1+3+5+1'/4 7.+2+5+7/4 6.+7.+2+6/4",
    "5.+1+3+5/4 1+3+5+1'/4 5.+7.+2/2 4/2 5.+1+3/1 2/1 1/2",
    "1+4+6/6 1+4+#5+1'/8 6/1 7/1",
    "4+6+1'/2 7/2 1'/2 7/2 0/2 6/2 5/4",
    B14, B15, B16,
    "1/4 #5./4 5./4 4./4",
    B14, B15, B16,
    "1/4 #5./4 1/4 2/4",
    B22,
    "4.+5.+7.+2/2 3/1 4/3 3/2 2/8",
    "5.+7./2 3/2 3/2 3/1 4/3 3/2 2/2 1/2",
    "2/2 1/4 5./2 6./2 1/6",
    B22,
    "5.+7.+2/2 3/1 4/3 3/2 2/4 5./2 6./2",
    "2.+4.+1/2 6./2 2.+4.+1/2 6./2 3.+5.+1/2 1/2 3.+5.+2/2 1/2",
    "1+4+6/4 5/4 0/3 1'/1 2'/1 1'/1 7/1 1'/1",
    ...CHORUS,
    "1+3+6+1'/4 3+6/4 6.+1+2+#4/8 3'/2 1'/2",
    "0/4 3'/2 1'/2 0/3 1'/1 7/2 1'/2",
    "1'/16",
  ].join(' | ');
  const L14 = "1:/2 5:/2 3./2 5:/2 1:/2 5:/2 3./2 5:/2", L15 = "3:/2 1./2 5./2 1./2 3:/2 1./2 5./2 1./2", L16 = "4:/2 1./2 4./2 1./2 4:/2 1./2 4./2 1./2";
  const L17 = "4:/2 1./2 2./2 1./2 5:/2 7:/2 2./2 7:/2";
  const syn = (c) => [2, 4, 2, 2, 4, 2].map((d) => c + '/' + d).join(' ');
  const L2 = "1./2 1/2 2+3+5/2 1/2 2+3+5/2 1/2 2+3+5/2 1/2", L3 = "7:/2 7./2 2+4+6/2 7./2 2+3+5/2 7./2 2+3+5/2 7./2", L4 = "6:/2 6./2 1+3+5/2 6./2 1+3+5/2 6./2 1+3+5/2 6./2";
  const yumeLH = [
    "0/16", L2, L3, L4,
    "5:/2 5./2 #6.+2+4/2 5./2 6.+1+3/2 5./2 6.+1+3/2 5./2",
    "4:/2 4./2 6.+1/2 4./2 4:/2 4./2 5.+7.+2/2 4./2",
    "3:/2 3./2 5.+7.+2/2 3./2 6:/2 3./2 5.+1/2 3./2",
    "2:/2 2./2 4.+6.+1/2 2./2 5:+2.+4.+6./8",
    "1:+5.+3/16",
    "1:/2 5:/2 3./4 7:/2 5:/2 2./4",
    "6:/2 6:/2 3./4 5:/2 5:/2 3./4",
    "4:/2 1./2 4./2 4:+4./8 0/2",
    "5:/2 2./2 4./2 5:/4 2./2 5./4",
    L14, L15, L16, L17, L14, L15, L16, L17,
    syn('4:+1.+4.'), syn('4:+5:+2.'), syn('3:+7:+2.'),
    "6:+3./2 6:+3./4 6:+3./2 5:+3./2 5:+3./4 5:+3./2",
    syn('4:+1.+4.'), syn('5:+2.'),
    "2:+1./2 6:/2 2:+1./2 6:/2 3:+2./4 3:+2./4",
    "4:/2 1./2 4./2 6./2 5:+2.+5.+7./8",
    "1:+1./2 1/2 2+3+5/2 1/2 2+3+5/2 1/2 2+3+5/2 1/2", L3, L4,
    "5:+5./2 5./2 #6.+2+4/2 5./2 1./2 6./2 1.+3+5/2 1./2",
    "4:+4./2 4./2 5.+6.+1/2 4./2 4:/2 4./2 5.+7.+2/2 4./2",
    "3:+3./2 3./2 5.+7.+2/2 3./2 6:/2 3./2 5.+1/2 3./2",
    "2:+2./2 4./2 6.+1/2 2./2 5:/2 2./2 4.+5.+7./2 2./2",
    "6:+3./4 5:+3./4 #4:+2./8 0/4",
    "2+4+1'/2 0/2 0/4 5.+2+4/2 0/2 0/4",
    "1./2 5./2 1/2 2/2 1+2+3+5/8",
  ].join(' | ');
  const RH = score(yumeRH), LH = score(yumeLH);
  const yume = { bpm: 82, start: 36, loop: 36, echo: { t: 0.75, fb: 0.3, wet: 0.26 }, ch: [
    { v: 'p25', vol: 0.042, vib: 1, rate: 4, n: voiceOf(RH, top) },
    { v: 'p12', vol: 0.018, rate: 4, n: voiceOf(RH, low) },
    { v: 'tri', vol: 0.03, rate: 4, n: voiceOf(RH, mid) },
    { v: 'tri', vol: 0.1, rate: 4, n: voiceOf(LH, lowOnly) },
    { v: 'sine', vol: 0.03, env: 'pluck', rate: 4, n: voiceOf(LH, hiLH) },
  ] };

  return { title, home, drive, lab, flash, boss, street, night, reveal, birthday, ending, yume };
})();
