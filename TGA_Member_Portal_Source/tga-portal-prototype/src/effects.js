import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';
import * as THREE from 'three';
import { firearmSafetyItems } from './data.js';

gsap.registerPlugin(ScrollTrigger, Flip);

let cleanupCurrent = () => {};

function initialiseWebGL(canvas, reducedMotion) {
  if (!canvas || !window.WebGLRenderingContext) {
    canvas?.closest('.hero')?.classList.add('webgl-fallback');
    return () => {};
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    canvas.closest('.hero')?.classList.add('webgl-fallback');
    return () => {};
  }

  const compact = window.matchMedia('(max-width: 800px)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.2 : 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.z = 7;
  const group = new THREE.Group();
  scene.add(group);

  const particleCount = compact ? 260 : 680;
  const positions = new Float32Array(particleCount * 3);
  const colours = new Float32Array(particleCount * 3);
  const brass = new THREE.Color('#ffd100');
  const steel = new THREE.Color('#ffffff');
  const olive = new THREE.Color('#d3131d');

  for (let index = 0; index < particleCount; index += 1) {
    const radius = 1.2 + Math.random() * 3.4;
    const angle = Math.random() * Math.PI * 2;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = (Math.random() - 0.5) * 5.5;
    positions[index * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 1.2;
    const colour = index % 11 === 0 ? brass : index % 4 === 0 ? olive : steel;
    colours[index * 3] = colour.r;
    colours[index * 3 + 1] = colour.g;
    colours[index * 3 + 2] = colour.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colours, 3));
  const particleMaterial = new THREE.PointsMaterial({ size: compact ? 0.022 : 0.028, vertexColors: true, transparent: true, opacity: 0.56 });
  const particles = new THREE.Points(geometry, particleMaterial);
  group.add(particles);

  const ringMaterial = new THREE.MeshBasicMaterial({ color: '#d3131d', transparent: true, opacity: 0.42 });
  const rings = [1.25, 2.05, 2.85].map((radius, index) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.012 + index * 0.003, 8, 96), ringMaterial.clone());
    ring.rotation.set(1.08 + index * 0.08, 0.22 - index * 0.12, index * 0.35);
    group.add(ring);
    return ring;
  });

  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-3.8, 0.8, -0.4), new THREE.Vector3(3.8, 0.8, -0.4),
    new THREE.Vector3(0.9, -2.6, 0.2), new THREE.Vector3(0.9, 2.6, 0.2)
  ]);
  const lines = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.14 }));
  group.add(lines);

  const cursor = { x: 0, y: 0 };
  const onPointer = (event) => {
    cursor.x = (event.clientX / window.innerWidth - 0.5) * 2;
    cursor.y = (event.clientY / window.innerHeight - 0.5) * 2;
  };
  if (!coarsePointer && !reducedMotion) window.addEventListener('pointermove', onPointer, { passive: true });

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1), false);
    camera.aspect = Math.max(rect.width, 1) / Math.max(rect.height, 1);
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let frame = 0;
  let visible = true;
  let inViewport = true;
  const observer = new IntersectionObserver(([entry]) => { inViewport = entry.isIntersecting; if (inViewport && visible && !frame && !reducedMotion) frame = requestAnimationFrame(render); }, { threshold: 0.01 });
  observer.observe(canvas);
  const onVisibility = () => { visible = !document.hidden; if (visible && inViewport && !frame && !reducedMotion) frame = requestAnimationFrame(render); };
  document.addEventListener('visibilitychange', onVisibility);

  function render(time = 0) {
    frame = 0;
    group.rotation.y += (cursor.x * 0.055 - group.rotation.y) * 0.02;
    group.rotation.x += (-cursor.y * 0.035 - group.rotation.x) * 0.02;
    particles.rotation.z = time * 0.000015;
    rings.forEach((ring, index) => { ring.rotation.z = time * (0.000018 + index * 0.00001) * (index % 2 ? -1 : 1); });
    renderer.render(scene, camera);
    if (!reducedMotion && visible && inViewport) frame = requestAnimationFrame(render);
  }
  render();

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('resize', resize);
    geometry.dispose();
    particleMaterial.dispose();
    rings.forEach((ring) => { ring.geometry.dispose(); ring.material.dispose(); });
    lineGeometry.dispose();
    lines.material.dispose();
    renderer.dispose();
  };
}

async function initialiseRive(canvas) {
  if (!canvas?.dataset.riveSrc) return () => {};
  const fallback = canvas.parentElement.querySelector('[data-rive-fallback]');
  try {
    const response = await fetch(canvas.dataset.riveSrc, { method: 'HEAD' });
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || contentType.includes('text/html')) throw new Error('Approved Rive asset unavailable');
    const { Alignment, Fit, Layout, Rive } = await import('@rive-app/webgl2');
    const rive = new Rive({
      src: canvas.dataset.riveSrc,
      canvas,
      autoplay: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
      onLoad: () => { fallback.hidden = true; canvas.hidden = false; rive.resizeDrawingSurfaceToCanvas(); }
    });
    return () => rive.cleanup();
  } catch {
    canvas.hidden = true;
    fallback.hidden = false;
    return () => {};
  }
}

function initialiseSpotlights() {
  if (window.matchMedia('(pointer: coarse)').matches) return () => {};
  const handlers = [];
  document.querySelectorAll('[data-spotlight]').forEach((card) => {
    const handler = (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
    };
    card.addEventListener('pointermove', handler);
    handlers.push([card, handler]);
  });
  return () => handlers.forEach(([card, handler]) => card.removeEventListener('pointermove', handler));
}

function initialiseSafetyGallery(wrapper, reducedMotion) {
  const container = wrapper?.querySelector('[data-circular-gallery]');
  if (!wrapper || !container || reducedMotion || !window.WebGLRenderingContext) return () => {};

  let disposed = false;
  let galleryCleanup = null;
  let loading = false;

  const activate = async () => {
    if (disposed || loading || galleryCleanup) return;
    loading = true;
    container.dataset.loading = 'true';
    try {
      const { mountCircularGallery } = await import('./components/CircularGallery.js');
      const cleanup = await mountCircularGallery(container, {
        items: firearmSafetyItems,
        bend: 2,
        textColor: '#ffffff',
        borderRadius: 0.08,
        scrollSpeed: 1.4,
        scrollEase: 0.035,
        font: '700 26px "Barlow Condensed"'
      });
      if (disposed) cleanup?.();
      else galleryCleanup = cleanup;
    } catch {
      delete container.dataset.loading;
      container.dataset.failed = 'true';
    } finally {
      loading = false;
    }
  };

  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      activate();
    }, { rootMargin: '320px 0px' });
    observer.observe(wrapper);
  } else {
    activate();
  }

  return () => {
    disposed = true;
    observer?.disconnect();
    galleryCleanup?.();
    delete container.dataset.loading;
  };
}

export async function initialiseViewEffects(screen) {
  cleanupCurrent();
  const cleanups = [];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (screen === 'public') {
    cleanups.push(initialiseWebGL(document.querySelector('[data-webgl-scene]'), reducedMotion));
    cleanups.push(await initialiseRive(document.querySelector('[data-rive-canvas]')));
    cleanups.push(initialiseSafetyGallery(document.querySelector('[data-safety-gallery]'), reducedMotion));
  }

  if (!reducedMotion) {
    if (screen === 'public' && !window.matchMedia('(pointer: coarse)').matches) {
      const lenis = new Lenis({ duration: 0.9, smoothWheel: true, anchors: true });
      const ticker = (time) => lenis.raf(time * 1000);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);
      cleanups.push(() => { gsap.ticker.remove(ticker); lenis.destroy(); });
    }

    document.querySelectorAll('[data-reveal]').forEach((element) => {
      if (element.hidden || !element.getClientRects().length) return;
      gsap.fromTo(element, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out', scrollTrigger: screen === 'public' ? { trigger: element, start: 'top 90%', once: true } : undefined });
    });
    document.querySelectorAll('[data-parallax]').forEach((element) => {
      gsap.to(element, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: element, scrub: 0.6, start: 'top bottom', end: 'bottom top' } });
    });
    const journey = document.querySelector('[data-journey-list]');
    if (journey) gsap.fromTo(journey, { '--journey-progress': '0%' }, { '--journey-progress': '100%', ease: 'none', scrollTrigger: { trigger: journey, scrub: 0.5, start: 'top 78%', end: 'bottom 72%' } });
    cleanups.push(() => ScrollTrigger.getAll().forEach((trigger) => trigger.kill()));
  }

  cleanups.push(initialiseSpotlights());
  cleanupCurrent = () => cleanups.forEach((cleanup) => cleanup?.());
}

export function flipCard(card) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = Flip.getState(card);
  const expanded = !card.classList.contains('is-flipped');
  card.classList.toggle('is-flipped', expanded);
  card.setAttribute('aria-expanded', String(expanded));
  if (!reducedMotion) Flip.from(state, { duration: 0.42, ease: 'power2.inOut', absolute: true });
}

export function destroyViewEffects() {
  cleanupCurrent();
  cleanupCurrent = () => {};
}
