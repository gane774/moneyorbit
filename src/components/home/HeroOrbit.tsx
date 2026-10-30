'use client';

import { useEffect, useRef } from 'react';

/**
 * The hero's 3D scene: the name, made literal. Rupee notes in the seven
 * denomination colours orbit a coin. Scrolling out of the hero pulls the
 * orbit inward and the camera toward the coin, so the hero hands over to
 * Flow of Money, whose protagonist is that same single rupee.
 *
 * Three.js is imported dynamically so it never blocks the headline. The
 * render loop sleeps when the canvas is off screen or the tab is hidden,
 * and reduced-motion users get one still frame.
 */

const NOTES = [
  { v: '10', token: '--n10' },
  { v: '20', token: '--n20' },
  { v: '50', token: '--n50' },
  { v: '100', token: '--n100' },
  { v: '200', token: '--n200' },
  { v: '500', token: '--n500' },
  { v: '2000', token: '--n2000' },
];

function noteTexture(THREE: typeof import('three'), color: string, value: string, font: string) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 240;
  const g = c.getContext('2d')!;
  const r = 22;
  g.fillStyle = color;
  g.beginPath(); g.roundRect(0, 0, 512, 240, r); g.fill();
  // Paler watermark panel and a thin security thread, like the real notes.
  g.fillStyle = 'rgba(255,255,255,.22)';
  g.beginPath(); g.roundRect(330, 26, 158, 188, 14); g.fill();
  g.fillStyle = 'rgba(21,24,15,.25)';
  g.fillRect(300, 0, 6, 240);
  g.strokeStyle = 'rgba(255,255,255,.35)';
  g.lineWidth = 3;
  g.beginPath(); g.roundRect(12, 12, 488, 216, 14); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.92)';
  g.font = `800 ${value.length > 3 ? 78 : 92}px ${font}`;
  g.textBaseline = 'middle';
  g.fillText(`₹${value}`, 34, 124);
  g.font = `500 22px ${font}`;
  g.fillStyle = 'rgba(255,255,255,.7)';
  g.fillText('MONEYORBIT RESERVE', 36, 46);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function coinTexture(THREE: typeof import('three'), font: string) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(200, 180, 40, 256, 256, 260);
  grad.addColorStop(0, '#F4C566');
  grad.addColorStop(1, '#C98A1C');
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = 'rgba(90,55,5,.35)';
  g.lineWidth = 10;
  g.beginPath(); g.arc(256, 256, 214, 0, Math.PI * 2); g.stroke();
  g.fillStyle = 'rgba(90,55,5,.55)';
  g.font = `800 260px ${font}`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('₹', 256, 272);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function HeroOrbit() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import('three');
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (disposed) return;

      const css = getComputedStyle(document.documentElement);
      const font = css.getPropertyValue('--font-display').trim() || 'sans-serif';
      await document.fonts?.ready;
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NeutralToneMapping;
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;

      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
      camera.position.set(0, 0.4, 10);

      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(-3, 5, 6);
      scene.add(key, new THREE.AmbientLight(0xffffff, 0.35));

      /* The tilted orbital plane. */
      const orbit = new THREE.Group();
      orbit.rotation.set(-0.42, 0, 0.18);
      scene.add(orbit);

      const disposables: { dispose(): void }[] = [envTex, pmrem];
      const noteGeo = new THREE.PlaneGeometry(1.7, 0.8, 16, 1);
      // A slight bow along the long edge so the notes read as paper, not cards.
      const pos = noteGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        pos.setZ(i, -0.06 * (x * x));
      }
      noteGeo.computeVertexNormals();
      disposables.push(noteGeo);

      const RADIUS = 3.1;
      const notes: { mesh: import('three').Mesh; angle: number; bob: number }[] = [];
      const COUNT = 14;
      for (let i = 0; i < COUNT; i++) {
        const n = NOTES[i % NOTES.length];
        const tex = noteTexture(THREE, css.getPropertyValue(n.token).trim() || '#888', n.v, font);
        const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.62 });
        // The back is the same print flipped horizontally, so text never reads mirrored.
        const backTex = tex.clone();
        backTex.wrapS = THREE.RepeatWrapping;
        backTex.repeat.x = -1;
        backTex.needsUpdate = true;
        const backMat = new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.62, side: THREE.BackSide });
        disposables.push(tex, mat, backTex, backMat);
        const mesh = new THREE.Mesh(noteGeo, mat);
        mesh.add(new THREE.Mesh(noteGeo, backMat));
        orbit.add(mesh);
        notes.push({ mesh, angle: (i / COUNT) * Math.PI * 2, bob: Math.random() * Math.PI * 2 });
      }

      const coinGeo = new THREE.CylinderGeometry(0.78, 0.78, 0.14, 72);
      const faceTex = coinTexture(THREE, font);
      // Cylinder cap UVs run sideways once the coin is stood up to face the camera.
      faceTex.center.set(0.5, 0.5);
      faceTex.rotation = Math.PI / 2;
      faceTex.wrapS = THREE.RepeatWrapping;
      faceTex.repeat.x = -1;
      const face = new THREE.MeshStandardMaterial({ map: faceTex, metalness: 0.7, roughness: 0.3 });
      const rim = new THREE.MeshStandardMaterial({ color: 0xc98a1c, metalness: 0.9, roughness: 0.32 });
      const coin = new THREE.Mesh(coinGeo, [rim, face, face]);
      coin.rotation.x = Math.PI / 2;
      const coinPivot = new THREE.Group();
      coinPivot.add(coin);
      scene.add(coinPivot);
      disposables.push(coinGeo, faceTex, face, rim);

      /* ---------- sizing ---------- */
      const resize = () => {
        const w = host.clientWidth, h = host.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Pull back on narrow viewports so the whole orbit stays in frame.
        camera.zoom = Math.min(1, camera.aspect / 1.15);
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      /* ---------- input ---------- */
      const pointer = { x: 0, y: 0 }, eased = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      };
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (fine) window.addEventListener('pointermove', onMove, { passive: true });

      /* Scroll progress through the hero only: 0 at top, 1 once it has gone. */
      const hero = host.closest('section') as HTMLElement | null;
      const scrollP = () => {
        if (!hero) return 0;
        const r = hero.getBoundingClientRect();
        return Math.min(1, Math.max(0, -r.top / (r.height * 0.9)));
      };

      /* ---------- loop ---------- */
      let visible = true;
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); });
      io.observe(host);

      let raf = 0, last = performance.now(), t = 0, spin = 0;
      const frame = (now: number) => {
        raf = 0;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        t += dt;
        const p = scrollP();
        const pe = p * p * (3 - 2 * p); // smoothstep

        eased.x += (pointer.x - eased.x) * 0.05;
        eased.y += (pointer.y - eased.y) * 0.05;
        orbit.rotation.x = -0.42 + eased.y * 0.12 + pe * 0.3;
        orbit.rotation.z = 0.18 - eased.x * 0.1;

        // The orbit tightens and speeds up as the page scrolls on.
        spin += dt * (0.16 + pe * 1.4);
        const radius = RADIUS * (1 - 0.82 * pe);
        for (const n of notes) {
          const a = n.angle + spin;
          const x = Math.cos(a) * radius, z = Math.sin(a) * radius;
          n.mesh.position.set(x, Math.sin(t * 0.9 + n.bob) * 0.12, z);
          n.mesh.rotation.set(Math.sin(t * 0.6 + n.bob) * 0.25, -a + Math.PI / 2, 0.12);
          n.mesh.scale.setScalar(1 - 0.55 * pe);
        }

        coinPivot.rotation.y = Math.sin(t * 0.5) * 0.35 + eased.x * 0.3 + pe * Math.PI * 2;
        coinPivot.rotation.x = eased.y * 0.15;
        coinPivot.position.y = Math.sin(t * 0.8) * 0.06;

        camera.position.z = 10 - pe * 3.2;
        camera.position.x = eased.x * 0.35;
        camera.lookAt(0, 0, 0);
        host.style.opacity = String(1 - Math.max(0, (p - 0.75) / 0.25));

        renderer.render(scene, camera);
        if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(frame);
      };
      const kick = () => { if (!raf && !disposed) { last = performance.now(); raf = requestAnimationFrame(frame); } };
      const onVis = () => { if (!document.hidden) kick(); };
      document.addEventListener('visibilitychange', onVis);
      const onScroll = () => kick();
      if (reduced) window.addEventListener('scroll', onScroll, { passive: true });

      host.dataset.ready = '1';
      kick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect(); io.disconnect();
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('scroll', onScroll);
        document.removeEventListener('visibilitychange', onVis);
        disposables.forEach((d) => d.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => { disposed = true; cleanup(); };
  }, []);

  return <div ref={hostRef} className="hero-orbit" aria-hidden="true" />;
}
