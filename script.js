/* ===== PLAYER'S CHOICE — shared header/footer, retro cursor, animated backgrounds ===== */
(() => {
  const page = document.body.dataset.page;

  /* ---------- Social icons (simple inline SVG) ---------- */
  const S = {
    facebook:['https://www.facebook.com/PlayersChoiceMB/','<svg viewBox="0 0 24 24"><path d="M14 8V6c0-.9.6-1 1-1h3V1h-4c-4 0-5 3-5 5v2H6v4h3v11h5V12h3.5l.5-4z"/></svg>'],
    instagram:['https://www.instagram.com/playerschoicemb/?hl=en','<svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm5 3.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 2a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM17.5 5a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>'],
    tiktok:['https://www.tiktok.com/@playerschoicemb','<svg viewBox="0 0 24 24"><path d="M16 2c.3 2.6 1.8 4.2 4.4 4.4v3.3c-1.6.1-3-.4-4.4-1.3v6.4c0 8-8.8 10.5-12.2 4.8-2.2-3.7-.8-10.1 6.5-10.4v3.5c-.6.1-1.2.2-1.7.4-1.6.5-2.5 1.5-2.2 3.3.5 3.4 6.8 4.4 6.3-2.2V2z"/></svg>'],
    youtube:['https://www.youtube.com/@PlayersChoiceMB','<svg viewBox="0 0 24 24"><path d="M23 7.2a3 3 0 00-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 001 7.2 31 31 0 00.5 12 31 31 0 001 16.8a3 3 0 002.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 002.1-2.1 31 31 0 00.5-4.8 31 31 0 00-.5-4.8zM9.7 15V9l5.8 3z"/></svg>'],
    ebay:['https://www.ebay.com/str/playerschoicemb','eBay'],
    whatnot:['https://www.whatnot.com/user/players_choice','<b style="font-size:16px">W</b>']
  };
  const socials = Object.entries(S).map(([k,[u,i]]) =>
    `<a href="${u}" target="_blank" rel="noopener" aria-label="${k}" title="${k}">${i}</a>`).join('');

  const links = [['index.html','Home','home'],['arcade.html','Arcade','arcade'],['gallery.html','Gallery','gallery'],['contact.html','Contact','contact']];
  const menu = links.map(([h,t,k]) => `<li><a href="${h}" class="${k===page?'active':''}">${t}</a></li>`).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <canvas id="bg" aria-hidden="true"></canvas>
    <div class="crt" aria-hidden="true"></div>
    <div id="cursor" aria-hidden="true"><svg viewBox="0 0 14 14" shape-rendering="crispEdges">
      <path fill="#000" d="M0 0h2v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1H7v1h1v1h1v2H7v-1H6v-1H5v-1H4v1H3v1H2v1H0z"/>
      <path fill="#fff" d="M1 2h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1H6v1h1v1h1v1H7v-1H6v-1H5v-1H4v-1H3v1H2v1H1z"/>
      <path fill="#29f3ff" d="M1 2h1v1H1zM1 3h1v1H1z"/></svg></div>
    <header>
      <div class="topbar">
        <span><span class="blink">●</span> OPEN Mon–Sat 10am–7pm · Sun 12pm–6pm</span>
        <span>Tel: <a href="tel:8432720268">843-272-0268</a> · <a href="mailto:Playerschoicenmb@gmail.com">Playerschoicenmb@gmail.com</a></span>
      </div>
      <nav class="nav">
        <a class="logo" href="index.html"><img src="images/logo.png" alt="Player's Choice — Buy • Sell • Trade"></a>
        <ul class="menu">${menu}</ul>
        <div class="socials">${socials}</div>
      </nav>
    </header>`);

  document.body.insertAdjacentHTML('beforeend', `
    <footer>
      <div class="hi">HI-SCORE: SERVING MYRTLE BEACH SINCE 2010</div>
      <div>10177 N Kings Hwy, Myrtle Beach, SC 29572 · Located in the <a style="color:var(--yellow)" href="https://www.mymallmyrtlebeach.com/" target="_blank" rel="noopener">Myrtle Beach Mall</a></div>
      <div class="socials">${socials}</div>
      <div>© ${new Date().getFullYear()} Player's Choice · Buy • Sell • Trade</div>
    </footer>`);

  /* ---------- Retro cursor + pixel trail + click burst ---------- */
  const cur = document.getElementById('cursor');
  const colors = ['#ff2a2a','#ffe14d','#29f3ff','#ff3df2','#3dff6e'];
  let last = 0;
  addEventListener('mousemove', e => {
    cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px';
    const now = performance.now();
    if (now - last > 28) { last = now; spark(e.clientX, e.clientY, 0, 0, 500); }
    cur.classList.toggle('hover', !!e.target.closest('a,button,input,textarea,.tile,.game'));
  });
  addEventListener('mousedown', e => {
    cur.classList.add('click');
    for (let i = 0; i < 14; i++) {
      const a = (Math.PI * 2 * i) / 14, v = 40 + Math.random() * 40;
      spark(e.clientX, e.clientY, Math.cos(a) * v, Math.sin(a) * v, 600);
    }
    const p = document.createElement('div');
    p.className = 'pop'; p.textContent = ['+25¢','+100','1UP!','+500','COMBO!'][Math.random()*5|0];
    p.style.left = e.clientX + 10 + 'px'; p.style.top = e.clientY - 10 + 'px';
    document.body.appendChild(p); setTimeout(() => p.remove(), 800);
    blip();
  });
  addEventListener('mouseup', () => cur.classList.remove('click'));
  function spark(x, y, dx, dy, t) {
    const s = document.createElement('div');
    s.className = 'spark';
    s.style.left = x + 'px'; s.style.top = y + 'px';
    s.style.background = colors[Math.random() * colors.length | 0];
    document.body.appendChild(s);
    s.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${dx}px,${dy + (dx?0:14)}px) scale(.3)`,opacity:0}],
      {duration:t,easing:'steps(6)'}).onfinish = () => s.remove();
  }
  // tiny 8-bit click sound (only after user interaction, very quiet)
  let ac;
  function blip(){
    try{
      ac = ac || new (window.AudioContext||window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain();
      o.type='square'; o.frequency.setValueAtTime(880,ac.currentTime); o.frequency.exponentialRampToValueAtTime(1760,ac.currentTime+.06);
      g.gain.setValueAtTime(.03,ac.currentTime); g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+.09);
      o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime+.1);
    }catch(_){}
  }

  /* ---------- Animated backgrounds (one per page) ---------- */
  const c = document.getElementById('bg'), x = c.getContext('2d');
  let W, H;
  const fit = () => { W = c.width = innerWidth; H = c.height = innerHeight; x.imageSmoothingEnabled = false; };
  fit(); addEventListener('resize', fit);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const px = (sprite, ox, oy, s, col) => {
    sprite.forEach((row, j) => [...row].forEach((ch, i) => {
      if (ch !== '.') { x.fillStyle = col[ch] || col; x.fillRect(ox + i * s, oy + j * s, s, s); }
    }));
  };

  /* HOME — space-shooter: starfield + marching invaders + player ship */
  function invaders() {
    const stars = Array.from({length:180}, () => ({x:Math.random()*W, y:Math.random()*H, z:Math.random()*3+.5}));
    const A = ['..1.....1..','...1...1...','..1111111..','.11.111.11.','11111111111','1.1111111.1','1.1.....1.1','...11.11...'];
    const B = ['..1.....1..','1..1...1..1','1.1111111.1','111.111.111','11111111111','.111111111.','..1.....1..','.1.......1.'];
    const ship = ['.....1.....','....111....','....111....','.111111111.','11111111111','11111111111'];
    let t = 0, shots = [], shipX = W/2;
    return () => {
      x.fillStyle = '#04030c'; x.fillRect(0,0,W,H);
      stars.forEach(s => { s.y += s.z*.6; if (s.y > H) { s.y = 0; s.x = Math.random()*W; }
        x.fillStyle = s.z > 2.5 ? '#fff' : s.z > 1.5 ? '#8a8aff' : '#3b3b7a'; x.fillRect(s.x|0, s.y|0, s.z|0||1, s.z|0||1); });
      const s = Math.max(3, W/420|0), cols = Math.min(10, W/(s*16)|0), rows = 4;
      const sw = cols*s*16, off = Math.sin(t/120)*(W-sw)/2*.9, frame = (t/30|0)%2;
      const pal = ['#ff3df2','#29f3ff','#3dff6e','#ffe14d'];
      x.globalAlpha = .55;
      for (let r=0;r<rows;r++) for (let k=0;k<cols;k++)
        px(frame?A:B, (W-sw)/2 + off + k*s*16, 90 + r*s*12 + Math.sin(t/200)*20, s, pal[r]);
      shipX += (W/2 + Math.sin(t/90)*W*.35 - shipX)*.05;
      px(ship, shipX - s*5.5, H - s*14, s, '#ff2a2a');
      if (t % 40 === 0) shots.push({x:shipX, y:H - s*15});
      shots = shots.filter(b => (b.y -= 7) > 0);
      x.fillStyle = '#ffe14d'; shots.forEach(b => x.fillRect(b.x - s/2, b.y, s, s*3));
      x.globalAlpha = 1; t++;
    };
  }

  /* ARCADE — maze chase: neon maze, pellets, a yellow chomper and ghosts */
  function mazeChase() {
    const cell = 40; let t = 0;
    const ghosts = ['#ff2a2a','#ff9ad5','#29f3ff','#ffb347'];
    return () => {
      x.fillStyle = '#000'; x.fillRect(0,0,W,H);
      x.globalAlpha = .45; x.strokeStyle = '#2121ff'; x.lineWidth = 4; x.shadowColor = '#2121ff'; x.shadowBlur = 10;
      for (let y = cell*2; y < H; y += cell*4) for (let xx = (y/cell%8?cell*2:-cell*2); xx < W; xx += cell*6) {
        x.beginPath(); x.roundRect(xx, y, cell*3, cell*1.4, 8); x.stroke();
      }
      x.shadowBlur = 0;
      const lanes = []; for (let y = cell; y < H; y += cell*4) lanes.push(y - cell*.2 + cell*.2);
      lanes.forEach((ly, li) => {
        const dir = li % 2 ? -1 : 1, speed = 2.2, span = W + 400;
        let pos = ((t*speed + li*260) % span) - 200; if (dir < 0) pos = W - pos;
        // pellets ahead of chomper
        x.fillStyle = '#ffd8a8';
        for (let p = 20; p < W; p += 28) { const ahead = dir > 0 ? p > pos : p < pos; if (ahead) x.fillRect(p-2, ly-2, 5, 5); }
        if ((t/20|0)%2) { x.beginPath(); x.arc(dir>0?W-30:30, ly, 8, 0, 7); x.fill(); }
        // chomper
        const m = Math.abs(Math.sin(t/5))*.7;
        x.fillStyle = '#ffe14d'; x.beginPath();
        const base = dir > 0 ? 0 : Math.PI;
        x.moveTo(pos, ly); x.arc(pos, ly, 15, base + m/2, base + Math.PI*2 - m/2); x.fill();
        // ghosts following
        for (let g = 0; g < 2; g++) {
          const gx = pos - dir*(60 + g*44), col = ghosts[(li+g)%4];
          x.fillStyle = col; x.beginPath(); x.arc(gx, ly-2, 14, Math.PI, 0); x.lineTo(gx+14, ly+13);
          for (let w = 0; w < 4; w++) x.lineTo(gx+14 - (w+.5)*7, ly + ((w+t/6|0)%2?7:13));
          x.lineTo(gx-14, ly+13); x.fill();
          x.fillStyle='#fff'; x.fillRect(gx-8, ly-6, 6, 7); x.fillRect(gx+2, ly-6, 6, 7);
          x.fillStyle='#22f'; x.fillRect(gx-7+dir*2, ly-4, 3, 4); x.fillRect(gx+3+dir*2, ly-4, 3, 4);
        }
      });
      x.globalAlpha = 1; t++;
    };
  }

  /* GALLERY — outrun-style synth sunset with scrolling neon grid road */
  function outrun() {
    let t = 0;
    const stars = Array.from({length:90}, () => [Math.random(), Math.random()*.5, Math.random()]);
    return () => {
      const hz = H*.55;
      const sky = x.createLinearGradient(0,0,0,hz);
      sky.addColorStop(0,'#090024'); sky.addColorStop(.7,'#3a0a5e'); sky.addColorStop(1,'#ff3d8b');
      x.fillStyle = sky; x.fillRect(0,0,W,hz);
      stars.forEach(([a,b,c]) => { x.fillStyle = `rgba(255,255,255,${.3+.7*Math.abs(Math.sin(t/40+c*9))})`; x.fillRect(a*W, b*hz, 2, 2); });
      // sun with stripes
      const r = Math.min(W,H)*.22, cx = W/2, cy = hz - r*.35;
      const sun = x.createLinearGradient(0,cy-r,0,cy+r); sun.addColorStop(0,'#ffe14d'); sun.addColorStop(1,'#ff2a6d');
      x.save(); x.beginPath(); x.arc(cx,cy,r,0,7); x.clip(); x.fillStyle = sun; x.fillRect(cx-r,cy-r,r*2,r*2);
      x.fillStyle = '#3a0a5e';
      for (let i = 0; i < 7; i++) { const yy = cy + r*.1 + i*r*.14 + (t*.4 % (r*.14)); x.fillRect(cx-r, yy, r*2, 2 + i*1.4); }
      x.restore();
      // mountains
      x.fillStyle = '#12002b'; x.beginPath(); x.moveTo(0,hz);
      for (let i = 0; i <= 20; i++) x.lineTo(i*W/20, hz - (Math.sin(i*1.7)*.5+.6)*H*.08*(i%3?1:1.8));
      x.lineTo(W,hz); x.fill();
      // ground
      x.fillStyle = '#0a0018'; x.fillRect(0,hz,W,H-hz);
      x.strokeStyle = '#ff3df2'; x.lineWidth = 2; x.shadowColor = '#ff3df2'; x.shadowBlur = 12;
      for (let i = -24; i <= 24; i++) { x.beginPath(); x.moveTo(W/2 + i*12, hz); x.lineTo(W/2 + i*W*.16, H); x.stroke(); }
      for (let i = 0; i < 18; i++) {
        const p = ((i + (t*.03)%1) / 18); const yy = hz + Math.pow(p,2.2)*(H-hz);
        x.globalAlpha = p; x.beginPath(); x.moveTo(0,yy); x.lineTo(W,yy); x.stroke();
      }
      x.globalAlpha = 1; x.shadowBlur = 0;
      x.fillStyle = 'rgba(4,3,12,.35)'; x.fillRect(0,0,W,H);
      t++;
    };
  }

  /* CONTACT — falling-block puzzle: tetrominoes raining down a dark well */
  function blocks() {
    const S2 = 28, shapes = [[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]]];
    const cols = ['#29f3ff','#ffe14d','#b84dff','#3d6bff','#ff9a3d','#ff2a2a','#3dff6e'];
    let pieces = [], t = 0;
    const spawn = () => { const k = Math.random()*7|0; pieces.push({k, x:(Math.random()*(W/S2-4)|0)*S2, y:-S2*4, v:1+Math.random()*1.8, r:Math.random()*4|0}); };
    const rot = (m, n) => { for (let i = 0; i < n; i++) m = m[0].map((_,c) => m.map(r => r[c]).reverse()); return m; };
    return () => {
      x.fillStyle = '#05040f'; x.fillRect(0,0,W,H);
      x.strokeStyle = 'rgba(41,243,255,.06)'; x.lineWidth = 1;
      for (let gx = 0; gx < W; gx += S2) { x.beginPath(); x.moveTo(gx,0); x.lineTo(gx,H); x.stroke(); }
      for (let gy = 0; gy < H; gy += S2) { x.beginPath(); x.moveTo(0,gy); x.lineTo(W,gy); x.stroke(); }
      if (t % 26 === 0 && pieces.length < 40) spawn();
      x.globalAlpha = .5;
      pieces = pieces.filter(p => {
        p.y += p.v; const m = rot(shapes[p.k], p.r), col = cols[p.k];
        m.forEach((row,j) => row.forEach((v,i) => { if (!v) return;
          const bx = p.x + i*S2, by = (p.y/S2|0)*S2 + j*S2;
          x.fillStyle = col; x.fillRect(bx, by, S2-2, S2-2);
          x.fillStyle = 'rgba(255,255,255,.45)'; x.fillRect(bx, by, S2-2, 4); x.fillRect(bx, by, 4, S2-2);
          x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(bx, by+S2-6, S2-2, 4);
        }));
        return p.y < H + S2;
      });
      x.globalAlpha = 1; t++;
    };
  }

  const bgs = {home:invaders, arcade:mazeChase, gallery:outrun, contact:blocks};
  const draw = (bgs[page] || invaders)();
  if (!CanvasRenderingContext2D.prototype.roundRect) CanvasRenderingContext2D.prototype.roundRect = function(a,b,w,h){this.rect(a,b,w,h)};
  const loop = () => { if (!document.hidden) draw(); if (!reduce) requestAnimationFrame(loop); };
  loop();
})();
