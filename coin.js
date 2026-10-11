/* ===== PLAYER'S CHOICE 8-BIT 3D COIN =====
   Uses players-choice-coin.png for both faces and builds a pixel sidewall
   from the coin's own outline. The angle comes straight from the clock,
   so the spin is perfectly smooth and loops forever with no jump. */
(() => {
  const canvases = [...document.querySelectorAll('canvas.coin25')];
  if (!canvases.length) return;

  const SRC = 'players-choice-coin.png';
  const PERIOD = 8000;        // ms per full turn (bigger = slower)
  const THICK = 0.10;         // coin thickness as a fraction of its size
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const img = new Image();
  img.src = SRC;

  // Solid-colour copies of the coin outline, used to build the sidewall
  function tinted(color) {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
    return c;
  }

  let edgeDark, edgeLight, edgeShadow, items = [];
  const face = document.createElement('canvas');   // scratch canvas for shading the face
  const fctx = face.getContext('2d');

  function setup(cv) {
    const size = cv.clientWidth || 160;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = cv.height = Math.round(size * dpr);
    const ctx = cv.getContext('2d');
    return { cv, ctx, px: cv.width };
  }

  function draw({ ctx, px }, angle) {
    const S = px;
    const D = S * 0.86;                    // coin diameter on screen
    const cx = S / 2, top = (S - D) / 2;
    const T = S * THICK;
    const c = Math.cos(angle), s = Math.sin(angle);
    const w = Math.max(D * Math.abs(c), 1);   // visible face width
    const frontX = cx + (T / 2) * s;          // centre of the front face
    const backX  = cx - (T / 2) * s;          // centre of the back face

    ctx.clearRect(0, 0, S, S);
    ctx.imageSmoothingEnabled = false;        // keep the 8-bit pixels crisp

    // ---- sidewall: stack of coin silhouettes between the two faces
    const steps = Math.max(1, Math.ceil(Math.abs(frontX - backX)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = backX + (frontX - backX) * t;
      // ridged pixel rim: alternate two golds every 2 device pixels
      const tex = (Math.floor(i / 2) % 2) ? edgeDark : edgeLight;
      ctx.drawImage(tex, x - w / 2, top, w, D);
    }
    // darken the outer edge slightly for depth
    if (steps > 1) {
      ctx.globalAlpha = 0.35;
      ctx.drawImage(edgeShadow, backX - w / 2, top, w, D);
      ctx.globalAlpha = 1;
    }

    // ---- visible face (artwork reads correctly on both sides)
    const fx = c >= 0 ? frontX : backX;
    if (w > 2) {
      const fw = Math.ceil(w), fh = Math.ceil(D);
      if (face.width !== fw || face.height !== fh) { face.width = fw; face.height = fh; }
      fctx.imageSmoothingEnabled = false;
      fctx.globalCompositeOperation = 'source-over';
      fctx.clearRect(0, 0, fw, fh);
      fctx.drawImage(img, 0, 0, fw, fh);
      // shade the face as it turns away from the viewer
      const shade = 0.42 * (1 - Math.abs(c));
      if (shade > 0.01) {
        fctx.globalCompositeOperation = 'source-atop';
        fctx.fillStyle = `rgba(60,25,0,${shade})`;
        fctx.fillRect(0, 0, fw, fh);
      }
      // moving glint
      fctx.globalCompositeOperation = 'source-atop';
      const gx = fw * (0.5 + 0.9 * Math.sin(angle * 2));
      const g = fctx.createLinearGradient(gx - fw * 0.25, 0, gx + fw * 0.25, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, 'rgba(255,255,255,.22)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      fctx.fillStyle = g;
      fctx.fillRect(0, 0, fw, fh);
      ctx.drawImage(face, fx - w / 2, top, w, D);
    }
  }

  const t0 = performance.now();
  function loop(now) {
    const angle = (((now - t0) % PERIOD) / PERIOD) * Math.PI * 2;
    if (!document.hidden) items.forEach(it => draw(it, angle));
    requestAnimationFrame(loop);
  }

  img.onload = () => {
    edgeLight  = tinted('#e8a317');
    edgeDark   = tinted('#a35f00');
    edgeShadow = tinted('#3a1d00');
    items = canvases.map(setup);
    addEventListener('resize', () => { items = canvases.map(setup); });
    if (reduce) items.forEach(it => draw(it, 0));
    else requestAnimationFrame(loop);
  };
})();
