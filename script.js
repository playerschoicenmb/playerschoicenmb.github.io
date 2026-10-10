/* ===== PLAYER'S CHOICE — status, menu, retro cursor, animated backgrounds =====
   The header and footer are written directly in each HTML page, so they always show,
   even if this file fails to load. */
(() => {
  const page = document.body.dataset.page;

  /* ---------- mobile menu ---------- */
  const burger = document.querySelector('.burger'), menu = document.getElementById('menu');
  if (burger && menu) burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', open);
  });

  /* ---------- live OPEN / CLOSED status (store time, US Eastern) ---------- */
  function status() {
    const el = document.getElementById('status'), t = document.getElementById('statusTxt');
    if (!el || !t) return;
    const now = new Date(new Date().toLocaleString('en-US', {timeZone:'America/New_York'}));
    const d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    const [o, c] = d === 0 ? [12, 18] : [10, 19];
    const fmt = x => (x > 12 ? x - 12 : x) + (x >= 12 ? 'pm' : 'am');
    if (h >= o && h < c) { el.className = 'is-open'; t.textContent = `OPEN NOW · until ${fmt(c)} today`; }
    else {
      const before = h < o, nd = before ? d : (d + 1) % 7;
      el.className = 'is-closed';
      t.textContent = `CLOSED · opens ${before ? 'today' : (nd === 0 ? 'Sunday' : 'tomorrow')} at ${fmt(nd === 0 ? 12 : 10)}`;
    }
  }
  status(); setInterval(status, 60000);

  /* ---------- retro cursor (desktop mouse only) ---------- */
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (fine && !reduce) {
    const cur = document.createElement('div');
    cur.id = 'cursor';
    cur.innerHTML = `<svg viewBox="0 0 14 14" shape-rendering="crispEdges" aria-hidden="true">
      <path fill="#000" d="M0 0h2v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1H7v1h1v1h1v2H7v-1H6v-1H5v-1H4v1H3v1H2v1H0z"/>
      <path fill="#fff" d="M1 2h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1H6v1h1v1h1v1H7v-1H6v-1H5v-1H4v-1H3v1H2v1H1z"/>
      <path fill="#29f3ff" d="M1 2h1v2H1z"/></svg>`;
    document.body.appendChild(cur);
    // only hide the normal cursor AFTER the custom one is on the page and the mouse has moved
    let armed = false;
    const colors = ['#ff2a2a','#ffe14d','#29f3ff','#ff3df2','#3dff6e'];
    let last = 0;
    addEventListener('mousemove', e => {
      if (!armed) { armed = true; document.documentElement.classList.add('fx-cursor'); }
      cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px';
      const now = performance.now();
      if (now - last > 30) { last = now; spark(e.clientX, e.clientY, 0, 14, 500); }
      cur.classList.toggle('hover', !!(e.target.closest && e.target.closest('a,button,input,textarea,.tile')));
    });
    // when the mouse is over an embedded video (iframe) or leaves the window, give back the normal cursor
    document.addEventListener('mouseleave', () => cur.style.display = 'none');
    document.addEventListener('mouseenter', () => cur.style.display = '');
    addEventListener('mousedown', e => {
      cur.classList.add('click');
      for (let i = 0; i < 12; i++) {
        const a = Math.PI * 2 * i / 12, v = 40 + Math.random() * 40;
        spark(e.clientX, e.clientY, Math.cos(a) * v, Math.sin(a) * v, 600);
      }
      const p = document.createElement('div');
      p.className = 'pop'; p.textContent = ['+25¢','+100','1UP!','+500'][Math.random() * 4 | 0];
      p.style.left = e.clientX + 10 + 'px'; p.style.top = e.clientY - 10 + 'px';
      document.body.appendChild(p); setTimeout(() => p.remove(), 800);
    });
    addEventListener('mouseup', () => cur.classList.remove('click'));
    function spark(x, y, dx, dy, t) {
      const s = document.createElement('div');
      s.className = 'spark';
      s.style.left = x + 'px'; s.style.top = y + 'px';
      s.style.background = colors[Math.random() * colors.length | 0];
      document.body.appendChild(s);
      s.animate([{transform:'translate(0,0)', opacity:1}, {transform:`translate(${dx}px,${dy}px) scale(.3)`, opacity:0}],
        {duration:t, easing:'steps(6)'}).onfinish = () => s.remove();
    }
  }

  /* ---------- animated backgrounds (one per page) ---------- */
  const c = document.getElementById('bg');
  if (!c) return;
  const x = c.getContext('2d');
  let W, H;
  const fit = () => { W = c.width = innerWidth; H = c.height = innerHeight; };
  fit(); addEventListener('resize', fit);
  const px = (sprite, ox, oy, s, col) => sprite.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch !== '.') { x.fillStyle = col; x.fillRect(ox + i * s, oy + j * s, s, s); }
  }));

  function invaders() {   // HOME: space shooter
    const stars = Array.from({length:180}, () => ({x:Math.random()*W, y:Math.random()*H, z:Math.random()*3+.5}));
    const A = ['..1.....1..','...1...1...','..1111111..','.11.111.11.','11111111111','1.1111111.1','1.1.....1.1','...11.11...'];
    const B = ['..1.....1..','1..1...1..1','1.1111111.1','111.111.111','11111111111','.111111111.','..1.....1..','.1.......1.'];
    const ship = ['.....1.....','....111....','.111111111.','11111111111','11111111111'];
    let t = 0, shots = [], sx = W / 2;
    return () => {
      x.fillStyle = '#04030c'; x.fillRect(0, 0, W, H);
      stars.forEach(s => { s.y += s.z * .6; if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
        x.fillStyle = s.z > 2.5 ? '#fff' : s.z > 1.5 ? '#8a8aff' : '#3b3b7a'; x.fillRect(s.x, s.y, 2, 2); });
      const s = Math.max(3, W / 420 | 0), cols = Math.min(10, W / (s * 16) | 0), sw = cols * s * 16;
      const off = Math.sin(t / 120) * (W - sw) / 2 * .9, f = (t / 30 | 0) % 2, pal = ['#ff3df2','#29f3ff','#3dff6e','#ffe14d'];
      x.globalAlpha = .5;
      for (let r = 0; r < 4; r++) for (let k = 0; k < cols; k++) px(f ? A : B, (W - sw) / 2 + off + k * s * 16, 90 + r * s * 12, s, pal[r]);
      sx += (W / 2 + Math.sin(t / 90) * W * .35 - sx) * .05;
      px(ship, sx - s * 5.5, H - s * 12, s, '#ff2a2a');
      if (t % 40 === 0) shots.push({x:sx, y:H - s * 13});
      shots = shots.filter(b => (b.y -= 7) > 0);
      x.fillStyle = '#ffe14d'; shots.forEach(b => x.fillRect(b.x - s / 2, b.y, s, s * 3));
      x.globalAlpha = 1; t++;
    };
  }
  function maze() {       // ARCADE: maze chase
    let t = 0; const gh = ['#ff2a2a','#ff9ad5','#29f3ff','#ffb347'];
    return () => {
      x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
      x.globalAlpha = .45; x.strokeStyle = '#2121ff'; x.lineWidth = 4;
      for (let y = 80; y < H; y += 160) for (let xx = (y / 40 % 8 ? 80 : -80); xx < W; xx += 240) x.strokeRect(xx, y, 120, 56);
      for (let ly = 40, li = 0; ly < H; ly += 160, li++) {
        const dir = li % 2 ? -1 : 1; let pos = ((t * 2.2 + li * 260) % (W + 400)) - 200; if (dir < 0) pos = W - pos;
        x.fillStyle = '#ffd8a8';
        for (let p = 20; p < W; p += 28) if (dir > 0 ? p > pos : p < pos) x.fillRect(p - 2, ly - 2, 5, 5);
        const m = Math.abs(Math.sin(t / 5)) * .7, base = dir > 0 ? 0 : Math.PI;
        x.fillStyle = '#ffe14d'; x.beginPath(); x.moveTo(pos, ly); x.arc(pos, ly, 15, base + m / 2, base + Math.PI * 2 - m / 2); x.fill();
        for (let g = 0; g < 2; g++) {
          const gx = pos - dir * (60 + g * 44);
          x.fillStyle = gh[(li + g) % 4]; x.beginPath(); x.arc(gx, ly - 2, 14, Math.PI, 0); x.lineTo(gx + 14, ly + 13); x.lineTo(gx - 14, ly + 13); x.fill();
          x.fillStyle = '#fff'; x.fillRect(gx - 8, ly - 6, 6, 7); x.fillRect(gx + 2, ly - 6, 6, 7);
        }
      }
      x.globalAlpha = 1; t++;
    };
  }
  function outrun() {     // GALLERY: synthwave sunset
    let t = 0; const st = Array.from({length:90}, () => [Math.random(), Math.random() * .5, Math.random()]);
    return () => {
      const hz = H * .55, sky = x.createLinearGradient(0, 0, 0, hz);
      sky.addColorStop(0, '#090024'); sky.addColorStop(.7, '#3a0a5e'); sky.addColorStop(1, '#ff3d8b');
      x.fillStyle = sky; x.fillRect(0, 0, W, hz);
      st.forEach(([a, b, k]) => { x.fillStyle = `rgba(255,255,255,${.3 + .7 * Math.abs(Math.sin(t / 40 + k * 9))})`; x.fillRect(a * W, b * hz, 2, 2); });
      const r = Math.min(W, H) * .22, cx = W / 2, cy = hz - r * .35, sun = x.createLinearGradient(0, cy - r, 0, cy + r);
      sun.addColorStop(0, '#ffe14d'); sun.addColorStop(1, '#ff2a6d');
      x.save(); x.beginPath(); x.arc(cx, cy, r, 0, 7); x.clip(); x.fillStyle = sun; x.fillRect(cx - r, cy - r, r * 2, r * 2);
      x.fillStyle = '#3a0a5e'; for (let i = 0; i < 7; i++) x.fillRect(cx - r, cy + r * .1 + i * r * .14, r * 2, 2 + i * 1.4); x.restore();
      x.fillStyle = '#0a0018'; x.fillRect(0, hz, W, H - hz);
      x.strokeStyle = '#ff3df2'; x.lineWidth = 2;
      for (let i = -24; i <= 24; i++) { x.beginPath(); x.moveTo(W / 2 + i * 12, hz); x.lineTo(W / 2 + i * W * .16, H); x.stroke(); }
      for (let i = 0; i < 18; i++) { const p = (i + (t * .03) % 1) / 18, yy = hz + p * p * (H - hz);
        x.globalAlpha = p; x.beginPath(); x.moveTo(0, yy); x.lineTo(W, yy); x.stroke(); }
      x.globalAlpha = 1; x.fillStyle = 'rgba(4,3,12,.35)'; x.fillRect(0, 0, W, H); t++;
    };
  }
  function blocks() {     // CONTACT: falling blocks
    const S = 28, shapes = [[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]]];
    const cols = ['#29f3ff','#ffe14d','#b84dff','#3d6bff','#ff9a3d','#ff2a2a','#3dff6e'];
    let ps = [], t = 0;
    return () => {
      x.fillStyle = '#05040f'; x.fillRect(0, 0, W, H);
      if (t % 26 === 0 && ps.length < 40) ps.push({k:Math.random() * 7 | 0, x:(Math.random() * (W / S - 4) | 0) * S, y:-S * 4, v:1 + Math.random() * 1.8});
      x.globalAlpha = .5;
      ps = ps.filter(p => { p.y += p.v;
        shapes[p.k].forEach((row, j) => row.forEach((v, i) => { if (!v) return;
          const bx = p.x + i * S, by = (p.y / S | 0) * S + j * S;
          x.fillStyle = cols[p.k]; x.fillRect(bx, by, S - 2, S - 2);
          x.fillStyle = 'rgba(255,255,255,.45)'; x.fillRect(bx, by, S - 2, 4); x.fillRect(bx, by, 4, S - 2); }));
        return p.y < H + S; });
      x.globalAlpha = 1; t++;
    };
  }
  const draw = ({home:invaders, arcade:maze, gallery:outrun, contact:blocks}[page] || invaders)();
  const loop = () => { if (!document.hidden) draw(); requestAnimationFrame(loop); };
  if (reduce) draw(); else loop();
})();
