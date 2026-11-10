// 部署版的启动器：先显示密码盘，用密码解密台词（story），成功后再按顺序加载游戏脚本
// 这样看网页源代码也读不到信和台词的内容（密码只有 4 位，挡得住随手查看，挡不住专门破解）
(() => {
  const SCRIPTS = window.__SCRIPTS || [];
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function decrypt(pass) {
    const P = window.__PAYLOAD;
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(P.salt), iterations: P.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(P.iv) }, key, b64(P.data));
    return new TextDecoder().decode(buf);
  }
  function load(code) {
    const s = document.createElement('script'); s.textContent = code; document.body.appendChild(s);
    let i = 0;
    const next = () => { if (i >= SCRIPTS.length) return; const e = document.createElement('script'); e.src = SCRIPTS[i++]; e.onload = next; document.body.appendChild(e); };
    window.__BOOTED = true;
    next();
  }
  async function tryPass(pass) { try { const code = await decrypt(pass); window.__BOOT_KEY = pass; load(code); return true; } catch (e) { return false; } }

  // 游戏自己刷新时（再玩一次、倒计时结束）不用再输
  const kept = sessionStorage.getItem('gwen1126-k'); sessionStorage.removeItem('gwen1126-k');
  (async () => {
    if (kept && (await tryPass(kept))) return;
    // 密码盘（和游戏里的样式一样）
    const vw = innerWidth, vh = innerHeight, s0 = Math.min(vw / 640, vh / 360);
    const wrap = document.createElement('div');
    wrap.style.cssText = `position:fixed;inset:0;--u:${2 * s0}px;--fs:${12 * Math.max(1, Math.round((12.8 * s0) / 12))}px;--fs2:${12 * Math.max(1, Math.round((10 * s0) / 12))}px;font-size:var(--fs);z-index:200`;
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
    wrap.innerHTML = `<div class="gate"><div class="panel gate-box"><div class="gate-icon"><span></span></div><div class="gate-t">实验室门禁</div><div class="gate-sub">PROTOCOL #1126 · 仅限受邀人员</div><div class="gate-dots">${'<i></i>'.repeat(4)}</div><div class="gate-msg">提示：Gwen，密码是你的生日（4 位数字，月 + 日）</div><div class="gate-keys">${keys.map((k) => (k ? `<button class="btn small" data-k="${k}">${k === 'del' ? '⌫' : k}</button>` : '<span></span>')).join('')}</div></div></div>`;
    document.body.appendChild(wrap);
    const dots = wrap.querySelectorAll('.gate-dots i'), msg = wrap.querySelector('.gate-msg'), box = wrap.querySelector('.gate-box');
    let v = '', busy = false;
    const show = () => dots.forEach((d, i) => d.classList.toggle('on', i < v.length));
    const check = async () => {
      busy = true;
      if (await tryPass(v)) { box.classList.add('ok'); msg.textContent = '验证通过，欢迎你，Gwen！'; setTimeout(() => { wrap.querySelector('.gate').classList.add('out'); setTimeout(() => wrap.remove(), 450); }, 700); return; }
      box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); msg.textContent = '密码不对哦，再想想～'; msg.classList.add('bad');
      setTimeout(() => { v = ''; show(); busy = false; }, 700);
    };
    const press = (k) => { if (busy) return; if (k === 'del') v = v.slice(0, -1); else if (k === 'ok') { if (v.length === 4) check(); } else if (v.length < 4) { v += k; if (v.length === 4) setTimeout(check, 200); } show(); };
    wrap.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => press(b.dataset.k)));
    addEventListener('keydown', (e) => { if (!wrap.isConnected) return; if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('del'); else if (e.key === 'Enter') press('ok'); });
  })();
})();
