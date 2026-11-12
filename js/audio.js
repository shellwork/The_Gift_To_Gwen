// 8-bit 音效与背景音乐（Web Audio 实时合成，无外部文件）
const AU = (() => {
  let ctx = null, master, musicBus, sfxBus, noiseBuf;
  let muted = localStorage.getItem('gwen1126-mute') === '1';
  let cur = null, timer = null, nextT = 0, step = 0, trackName = null, pending = null;

  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function n2f(n) {
    const m = /^([A-G])(#|b)?(\d)$/.exec(n);
    if (!m) return 0;
    let s = NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    const midi = (parseInt(m[3]) + 1) * 12 + s;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      // 部署版的密码盘在点按键时就建好了 AudioContext（那时有用户点击，已经是可播放状态），这里直接接着用
      ctx = window.__AC || new AC();
      master = ctx.createGain(); master.gain.value = muted ? 0 : 0.6; master.connect(ctx.destination);
      musicBus = ctx.createGain(); musicBus.gain.value = 0.55; musicBus.connect(master);
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    if (pending) { const p = pending; pending = null; bgm(p); }
  }

  function tone(freq, t0, dur, o = {}) {
    if (!ctx || !freq) return;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t0 + dur);
    const v = o.vol ?? 0.1;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + (o.attack ?? 0.006));
    g.gain.setValueAtTime(v, t0 + Math.max(0.01, dur * (o.sus ?? 0.6)));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(o.bus || sfxBus);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  function noise(t0, dur, o = {}) {
    if (!ctx) return;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = o.filter || 'lowpass'; f.frequency.value = o.freq || 3000;
    if (o.freqTo) f.frequency.exponentialRampToValueAtTime(o.freqTo, t0 + dur);
    const g = ctx.createGain(); const v = o.vol ?? 0.15;
    g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(o.bus || sfxBus);
    src.start(t0); src.stop(t0 + dur + 0.02);
  }

  function seq(notes, gap, o) {
    const t = ctx.currentTime;
    notes.forEach((n, i) => n && tone(n2f(n), t + i * gap, o.dur || gap * 1.1, o));
  }

  function sfx(name) {
    if (!ctx && window.__AC) unlock();
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    switch (name) {
      case 'blip': tone(880 + Math.random() * 60, t, 0.03, { vol: 0.025 }); break;
      case 'select': tone(660, t, 0.06, { vol: 0.06 }); tone(990, t + 0.05, 0.08, { vol: 0.06 }); break;
      case 'step': noise(t, 0.03, { vol: 0.03, freq: 900 }); break;
      case 'pickup': seq(['C5', 'E5', 'G5', 'C6', 'E6'], 0.07, { vol: 0.07, type: 'square' }); break;
      case 'achieve': seq(['G5', 'C6', 'E6', 'G6'], 0.06, { vol: 0.05, type: 'triangle', dur: 0.25 }); tone(n2f('C7'), t + 0.25, 0.4, { vol: 0.03, type: 'sine' }); break;
      case 'error': tone(220, t, 0.18, { vol: 0.08 }); tone(220, t + 0.25, 0.18, { vol: 0.08 }); break;
      case 'honk': tone(392, t, 0.22, { vol: 0.07 }); tone(494, t, 0.22, { vol: 0.05 }); break;
      case 'meow': tone(700, t, 0.12, { type: 'sine', vol: 0.09, slide: 950 }); tone(950, t + 0.12, 0.2, { type: 'sine', vol: 0.08, slide: 560 }); break;
      case 'purr': for (let i = 0; i < 8; i++) noise(t + i * 0.07, 0.05, { vol: 0.05, freq: 300 }); break;
      case 'door': noise(t, 0.15, { vol: 0.1, freq: 600 }); tone(140, t, 0.12, { type: 'triangle', vol: 0.1 }); break;
      case 'click': tone(1400, t, 0.02, { vol: 0.04 }); break;
      case 'clack': noise(t, 0.04, { vol: 0.08, freq: 2500, filter: 'highpass' }); tone(300, t, 0.04, { vol: 0.04 }); break;
      case 'type': for (let i = 0; i < 6; i++) noise(t + i * 0.06 + Math.random() * 0.02, 0.02, { vol: 0.06, freq: 4000, filter: 'highpass' }); break;
      case 'hit': noise(t, 0.2, { vol: 0.2, freq: 1800, freqTo: 200 }); tone(160, t, 0.15, { vol: 0.1, slide: 60 }); break;
      case 'crit': noise(t, 0.3, { vol: 0.25, freq: 4000, freqTo: 200 }); seq(['C6', 'G6'], 0.05, { vol: 0.06 }); break;
      case 'hurt': tone(300, t, 0.2, { vol: 0.08, slide: 120 }); break;
      case 'heal': seq(['C5', 'E5', 'G5', 'E6'], 0.05, { vol: 0.05, type: 'triangle' }); break;
      case 'flash': noise(t, 0.35, { vol: 0.2, freq: 6000, filter: 'highpass' }); tone(1800, t, 0.05, { vol: 0.04 }); break;
      case 'beep': tone(1000, t, 0.08, { vol: 0.05 }); break;
      case 'pipette': tone(500, t, 0.08, { type: 'sine', vol: 0.08, slide: 1100 }); noise(t + 0.06, 0.05, { vol: 0.04, freq: 2000 }); break;
      case 'success': seq(['C5', 'E5', 'G5', 'C6', null, 'G5', 'C6'], 0.09, { vol: 0.07 }); break;
      case 'notify': tone(1320, t, 0.08, { type: 'sine', vol: 0.08 }); tone(1760, t + 0.1, 0.12, { type: 'sine', vol: 0.08 }); break;
      case 'launch': tone(300, t, 0.6, { type: 'triangle', vol: 0.04, slide: 1200 }); noise(t, 0.5, { vol: 0.04, freq: 1500, filter: 'highpass' }); break;
      case 'boom': noise(t, 0.8 + Math.random() * 0.4, { vol: 0.22, freq: 1200 + Math.random() * 800, freqTo: 80 }); break;
      case 'whoosh': noise(t, 0.5, { vol: 0.08, freq: 400, freqTo: 3000, filter: 'bandpass' }); break;
      case 'blowout': noise(t, 0.6, { vol: 0.12, freq: 800, freqTo: 200 }); break;
      case 'ding': tone(n2f('E6'), t, 0.6, { type: 'sine', vol: 0.08, sus: 0.1 }); tone(n2f('B6'), t, 0.5, { type: 'sine', vol: 0.03, sus: 0.1 }); break;
      case 'secret': seq(['C6', 'E6', 'G6', 'B6', 'C7', 'E7'], 0.07, { vol: 0.045, type: 'triangle', dur: 0.5 }); seq(['G5', null, 'C6', null, 'E6'], 0.09, { vol: 0.03, type: 'sine', dur: 0.8 }); tone(n2f('C7'), t + 0.45, 1.4, { vol: 0.03, type: 'sine', sus: 0.2 }); tone(n2f('G7'), t + 0.6, 1.2, { vol: 0.015, type: 'sine', sus: 0.2 }); break;
      case 'drop': tone(900, t, 0.1, { type: 'sine', vol: 0.08, slide: 400 }); break;
    }
  }

  // ---------- music ----------
  // 乐谱在 js/tracks.js；这里负责解析和合成：脉冲波音色、颤音、包络、鼓、回声
  const TRACKS = {};
  const DRUMS = { k: 1, s: 1, h: 1, o: 1, c: 1 };
  function parse(str, drum) {
    const tk = str.trim().split(/\s+/).filter((x) => x !== '|'), out = [];
    for (let i = 0; i < tk.length; i++) {
      if (tk[i] === '=') continue;
      let len = 1; while (tk[i + len] === '=') len++;
      if (drum) { if (DRUMS[tk[i]]) out.push({ i, d: tk[i] }); }
      else if (tk[i] !== '-') out.push({ i, len, f: n2f(tk[i]) });
    }
    return { steps: tk.length, notes: out };
  }
  for (const k in TRACKS_SRC) {
    const t = TRACKS_SRC[k];
    TRACKS[k] = { ...t, ch: t.ch.map((c) => { const p = parse(c.n, c.v === 'drum'); const rate = c.rate || 2; const m = {}; p.notes.forEach((x) => (m[x.i] = x)); return { ...c, rate, steps: p.steps, map: m, beats: p.steps / rate }; }) };
    TRACKS[k].beats = Math.max(...TRACKS[k].ch.map((c) => c.beats));
  }

  let waves = null, echo = null;
  function initMusic() {
    if (waves) return;
    const pulse = (d) => { const n = 48, re = new Float32Array(n), im = new Float32Array(n); for (let k = 1; k < n; k++) re[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * d); return ctx.createPeriodicWave(re, im); };
    waves = { p25: pulse(0.25), p12: pulse(0.125) };
    // 回声：音乐总线 → 延迟（带反馈、低通）→ 主音量
    const dl = ctx.createDelay(2), fb = ctx.createGain(), lp = ctx.createBiquadFilter(), wet = ctx.createGain();
    lp.type = 'lowpass'; lp.frequency.value = 2600; fb.gain.value = 0.3; wet.gain.value = 0;
    musicBus.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(wet); wet.connect(master);
    echo = { dl, fb, wet };
  }

  function voice(c, f, t0, dur, out) {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    if (c.v === 'p25' || c.v === 'p12') osc.setPeriodicWave(waves[c.v]);
    else osc.type = { sq: 'square', tri: 'triangle', sine: 'sine', saw: 'sawtooth' }[c.v] || 'square';
    osc.frequency.setValueAtTime(f, t0);
    const v = c.vol, end = t0 + dur;
    g.gain.setValueAtTime(0.0001, t0);
    if (c.env === 'pluck') {
      g.gain.exponentialRampToValueAtTime(v, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(v * 0.18, t0 + Math.min(dur, 0.09 + dur * 0.5));
    } else if (c.env === 'pad') {
      g.gain.linearRampToValueAtTime(v, t0 + Math.min(0.6, dur * 0.4));
      g.gain.setValueAtTime(v, t0 + dur * 0.75);
    } else {
      g.gain.exponentialRampToValueAtTime(v, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(v * 0.72, t0 + Math.min(dur * 0.5, 0.18));
      g.gain.setValueAtTime(v * 0.72, t0 + Math.max(0.02, dur * 0.8));
    }
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    // 长音加一点颤音
    if (c.vib && dur > 0.35) {
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 5.2; lg.gain.setValueAtTime(0, t0); lg.gain.linearRampToValueAtTime(f * 0.007, t0 + Math.min(0.5, dur * 0.6));
      lfo.connect(lg); lg.connect(osc.frequency); lfo.start(t0); lfo.stop(end + 0.02);
    }
    osc.connect(g); g.connect(out);
    osc.start(t0); osc.stop(end + 0.02);
  }
  function drum(d, t0, vol, out) {
    if (d === 'k') { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(150, t0); o.frequency.exponentialRampToValueAtTime(42, t0 + 0.13); g.gain.setValueAtTime(0.32 * vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16); o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + 0.18); }
    else if (d === 's') { noise(t0, 0.13, { vol: 0.12 * vol, freq: 1900, filter: 'bandpass', bus: out }); tone(190, t0, 0.06, { type: 'triangle', vol: 0.07 * vol, bus: out }); }
    else if (d === 'h') noise(t0, 0.035, { vol: 0.05 * vol, freq: 7500, filter: 'highpass', bus: out });
    else if (d === 'o') noise(t0, 0.16, { vol: 0.045 * vol, freq: 6500, filter: 'highpass', bus: out });
    else if (d === 'c') noise(t0, 1.1, { vol: 0.07 * vol, freq: 5000, filter: 'highpass', bus: out });
  }

  let trackGain = null;
  let playInfo = null;
  // fadeIn：新曲子从无声慢慢升起来的秒数
  function bgm(name, fromBeat, fadeIn) {
    if (trackName === name && fromBeat == null) return;
    stopBgm();
    if (!name) return;
    if (!ctx && window.__AC) { pending = null; unlock(); }   // 密码盘已经把声音打开了，直接放
    if (!ctx) { pending = name; return; }
    initMusic();
    trackName = name;
    const T = (cur = TRACKS[name]);
    if (!T) return;
    const out = (trackGain = ctx.createGain()); out.connect(musicBus);
    if (fadeIn) { out.gain.setValueAtTime(0.0001, ctx.currentTime); out.gain.exponentialRampToValueAtTime(1, ctx.currentTime + fadeIn); }
    else out.gain.value = 1;
    const beat = 60 / T.bpm;
    const e = T.echo || { t: 0.5, fb: 0.2, wet: 0.12 };
    echo.dl.delayTime.setValueAtTime(e.t * beat, ctx.currentTime); echo.fb.gain.setTargetAtTime(e.fb, ctx.currentTime, 0.1); echo.wet.gain.setTargetAtTime(e.wet, ctx.currentTime, 0.1);
    // 以十六分音符为最小格，每个声部按自己的 rate 走（每首曲子用自己的计数，淡出时旧曲子还能继续往下放）
    const TPB = 4, tick = beat / TPB, total = T.beats * TPB, loopAt = (T.loop || 0) * TPB;
    let st = Math.min(total - 1, Math.round((fromBeat ?? T.start ?? 0) * TPB)), nt = ctx.currentTime + 0.12;
    const info = (playInfo = { tick, TPB, step: st, t: nt, beats: T.beats, bpm: T.bpm });
    timer = setInterval(() => {
      if (!ctx) return;
      while (nt < ctx.currentTime + 0.3) {
        T.ch.forEach((c) => {
          const every = TPB / c.rate; if (st % every) return;
          const idx = (st / every) % c.steps, n = c.map[idx];
          if (!n) return;
          if (c.v === 'drum') drum(n.d, nt, c.vol, out);
          else if (n.f) voice(c, n.f, nt, n.len * beat / c.rate * 0.96, out);
        });
        info.step = st; info.t = nt;
        nt += tick; st++;
        if (st >= total) st = loopAt;
      }
    }, 50);
  }
  // fade：旧曲子淡出的秒数（这段时间里它继续播放，只是越来越轻）
  function stopBgm(fade) {
    const t = timer, g = trackGain;
    timer = null; trackName = null; trackGain = null; playInfo = null;
    if (!ctx) { if (t) clearInterval(t); return; }
    if (fade && g) {
      g.gain.setValueAtTime(g.gain.value, ctx.currentTime); g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + fade);
      setTimeout(() => { if (t) clearInterval(t); }, fade * 1000);
      setTimeout(() => g.disconnect(), fade * 1000 + 1500);
    } else {
      if (t) clearInterval(t);
      // 已经排好的音淡出，避免切歌时“咔”的一下
      if (g) { g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.12); setTimeout(() => g.disconnect(), 1200); }
    }
  }
  // 交叉淡化：旧曲子淡出，gap 秒后新曲子淡入
  function fadeTo(name, out = 2, fadeIn = 3, gap = 1) {
    stopBgm(out);
    setTimeout(() => { if (!trackName) bgm(name, undefined, fadeIn); }, gap * 1000);
  }

  function setMuted(m) {
    muted = m; localStorage.setItem('gwen1126-mute', m ? '1' : '0');
    if (master) master.gain.value = m ? 0 : 0.6;
  }

  // 麦克风吹气检测
  let mic = null;
  // 手机上打开麦克风后，系统会切到「通话模式」，声音从听筒出来、很小。
  // 用完麦克风后：关掉音轨、断开节点，并把网页的音频会话切回「播放」（iOS 16.4+ 支持 navigator.audioSession）
  function setSession(type) { try { if (navigator.audioSession) navigator.audioSession.type = type; } catch (e) {} }
  async function startMic() {
    unlock();
    setSession('play-and-record');
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }); }
    catch (e) { setSession('playback'); throw e; }
    const src = ctx.createMediaStreamSource(stream);
    const an = ctx.createAnalyser(); an.fftSize = 1024;
    src.connect(an);
    const buf = new Float32Array(an.fftSize);
    mic = {
      stream,
      level() { an.getFloatTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]; return Math.sqrt(s / buf.length); },
      stop() { stream.getTracks().forEach((t) => t.stop()); try { src.disconnect(); } catch (e) {} mic = null; releaseMic(); },
    };
    return mic;
  }

  // 麦克风关掉之后把声音切回扬声器。没有 audioSession 的老系统：重建一个 AudioContext（旧的那个会一直卡在通话模式）
  function releaseMic() {
    if (navigator.audioSession) { setSession('playback'); return; }
    if (!/iPhone|iPad|Android/i.test(navigator.userAgent) || !ctx) return;
    const old = ctx, name = trackName;
    stopBgm(); ctx = null; window.__AC = null; echo = null; waves = null;
    try { old.close(); } catch (e) {}
    unlock();
    if (name) bgm(name);
  }

  // 对话打字音：每个人音高不同，带一点随机起伏
  function blip(f) { if (!ctx || muted) return; tone(f * (0.97 + Math.random() * 0.06), ctx.currentTime, 0.032, { vol: 0.022, type: f > 1200 ? 'triangle' : 'square' }); }

  return {
    unlock, sfx, bgm, stopBgm, fadeTo, setMuted, startMic, blip,
    get muted() { return muted; },
    get running() { return !!ctx && ctx.state === 'running'; },
    get mic() { return mic; },
    get current() { return trackName; },
    // 试听页用：当前播放到第几拍、跳到某一拍
    position() { if (!timer || !playInfo || !ctx) return null; const p = playInfo; const b = (p.step - (p.t - ctx.currentTime) / p.tick) / p.TPB; return { beat: Math.max(0, b), beats: p.beats, bpm: p.bpm }; },
    seek(beat) { if (trackName) bgm(trackName, beat); },
    resumeBgm(name) { trackName = null; bgm(name); },
  };
})();
