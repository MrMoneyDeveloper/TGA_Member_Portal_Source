import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';
import * as THREE from 'three';
import { Alignment, Fit, Layout, Rive } from '@rive-app/webgl2';

gsap.registerPlugin(ScrollTrigger, Flip);

let cleanupCurrent = () => {};

function initialiseWebGL(canvas, reducedMotion) {
  if (!canvas || !window.WebGLRenderingContext) return () => {};

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.z = 7;
  const group = new THREE.Group();
  scene.add(group);

  const positions = [];
  const colours = [];
  const red = new THREE.Color('#c8102e');
  const yellow = new THREE.Color('#ffd100');
  const white = new THREE.Color('#f4f1e8');

  for (let index = 0; index < 900; index += 1) {
    const radius = 1.4 + Math.random() * 2.9;
    const angle = Math.random() * Math.PI * 2;
    const depth = (Math.random() - 0.5) * 4;
    positions.push(Math.cos(angle) * radius, (Math.random() - 0.5) * 5, Math.sin(angle) * radius + depth * 0.25);
    const colour = index % 9 === 0 ? yellow : index % 4 === 0 ? red : white;
    colours.push(colour.r, colour.g, colour.b);
  }

  // A subtle heart-shaped connection trace keeps the requested visual motif abstract and brand appropriate.
  for (let index = 0; index < 110; index += 1) {
    const t = (index / 109) * Math.PI * 2;
    const x = (16 * Math.sin(t) ** 3) / 18;
    const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 18;
    positions.push(x + 1.25, y - 0.25, 0.4);
    colours.push(red.r, red.g, red.b);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
  const particles = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.025, vertexColors: true, transparent: true, opacity: 0.78 }));
  group.add(particles);

  const orbital = new THREE.Mesh(
    new THREE.TorusGeometry(2.25, 0.018, 12, 160),
    new THREE.MeshStandardMaterial({ color: '#ffd100', emissive: '#735c00', roughness: 0.4, metalness: 0.55, transparent: true, opacity: 0.45 })
  );
  orbital.rotation.set(1.05, 0.25, 0.1);
  group.add(orbital);
  scene.add(new THREE.AmbientLight('#fff4c2', 0.7));
  const light = new THREE.PointLight('#c8102e', 6, 18);
  light.position.set(3, 2, 4);
  scene.add(light);

  const cursor = { x: 0, y: 0 };
  const onPointer = (event) => {
    cursor.x = (event.clientX / window.innerWidth - 0.5) * 2;
    cursor.y = (event.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1), false);
    camera.aspect = Math.max(rect.width, 1) / Math.max(rect.height, 1);
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  let frame = 0;
  const render = (time = 0) => {
    group.rotation.y += (cursor.x * 0.12 - group.rotation.y) * 0.025;
    group.rotation.x += (-cursor.y * 0.08 - group.rotation.x) * 0.025;
    particles.rotation.z = time * 0.000025;
    orbital.rotation.z = time * 0.00008;
    renderer.render(scene, camera);
    if (!reducedMotion) frame = requestAnimationFrame(render);
  };
  render();

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('resize', resize);
    geometry.dispose();
    particles.material.dispose();
    orbital.geometry.dispose();
    orbital.material.dispose();
    renderer.dispose();
  };
}

async function initialiseRive(canvas) {
  if (!canvas?.dataset.riveSrc) return () => {};
  const fallback = canvas.parentElement.querySelector('[data-rive-fallback]');

  try {
    const response = await fetch(canvas.dataset.riveSrc, { method: 'HEAD' });
    if (!response.ok) throw new Error('Rive asset unavailable');
    const rive = new Rive({
      src: canvas.dataset.riveSrc,
      canvas,
      autoplay: true,
      layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
      onLoad: () => { fallback.hidden = true; rive.resizeDrawingSurfaceToCanvas(); }
    });
    return () => rive.cleanup();
  } catch {
    canvas.hidden = true;
    fallback.hidden = false;
    return () => {};
  }
}

export async function initialisePublicEffects() {
  cleanupCurrent();
  const cleanups = [];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  cleanups.push(initialiseWebGL(document.querySelector('[data-webgl-scene]'), reducedMotion));
  cleanups.push(await initialiseRive(document.querySelector('[data-rive-canvas]')));

  if (!reducedMotion) {
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, anchors: true });
    const ticker = (time) => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    cleanups.push(() => { gsap.ticker.remove(ticker); lenis.destroy(); });

    gsap.utils.toArray('[data-reveal]').forEach((element) => {
      gsap.fromTo(element, { y: 42, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } });
    });
    gsap.utils.toArray('[data-parallax]').forEach((element) => {
      gsap.to(element, { yPercent: -12, ease: 'none', scrollTrigger: { trigger: element, scrub: 0.7, start: 'top bottom', end: 'bottom top' } });
    });
    cleanups.push(() => ScrollTrigger.getAll().forEach((trigger) => trigger.kill()));
  }

  const spotlightHandlers = [];
  document.querySelectorAll('[data-spotlight]').forEach((card) => {
    const handler = (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
    };
    card.addEventListener('pointermove', handler);
    spotlightHandlers.push([card, handler]);
  });
  cleanups.push(() => spotlightHandlers.forEach(([card, handler]) => card.removeEventListener('pointermove', handler)));

  cleanupCurrent = () => cleanups.forEach((cleanup) => cleanup());
}

export function flipCard(card) {
  const state = Flip.getState(card);
  card.classList.toggle('is-flipped');
  card.setAttribute('aria-pressed', String(card.classList.contains('is-flipped')));
  Flip.from(state, { duration: 0.55, ease: 'power2.inOut', absolute: true });
}

export function transitionChapter(current, next) {
  if (!current || !next || current === next) return;
  const state = Flip.getState([current, next]);
  current.hidden = true;
  next.hidden = false;
  Flip.from(state, { duration: 0.65, ease: 'power3.inOut', absolute: true, fade: true });
}

export function destroyPublicEffects() {
  cleanupCurrent();
  cleanupCurrent = () => {};
}
