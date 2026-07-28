import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function polygonGeometry(THREE, points, depth, bevelSize = 0.06) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => {
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize,
    bevelThickness: bevelSize,
    curveSegments: 8
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return geometry;
}

async function initialiseThreeProduct(root, canvas) {
  const THREE = await import('three');
  if (!canvas || !window.WebGLRenderingContext) throw new Error('WebGL unavailable');

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0.1, 8.6);

  const product = new THREE.Group();
  product.position.set(0, -0.3, 0);
  product.rotation.set(-0.06, -0.3, 0.015);
  product.scale.setScalar(0.86);
  scene.add(product);

  const matteBlack = new THREE.MeshStandardMaterial({
    color: 0x202225,
    roughness: 0.92,
    metalness: 0.12
  });
  const charcoalBlack = new THREE.MeshStandardMaterial({
    color: 0x191b1d,
    roughness: 0.96,
    metalness: 0.06
  });

  const pieces = [
    [
      [[-2.72, 0.62], [1.82, 0.62], [2.42, 0.34], [2.34, -0.2], [-2.58, -0.2], [-2.76, 0.08]],
      0.82,
      matteBlack,
      0.055
    ],
    [
      [[-2.2, -0.22], [2.13, -0.22], [1.78, -0.72], [0.62, -0.78], [0.3, -1.08], [-1.7, -1.0], [-2.15, -0.62]],
      0.72,
      charcoalBlack,
      0.05
    ],
    [
      [[-1.48, -0.78], [-0.22, -0.9], [-0.48, -2.52], [-1.66, -2.56], [-1.94, -1.2]],
      0.68,
      charcoalBlack,
      0.065
    ]
  ];

  pieces.forEach(([points, depth, material, bevel]) => {
    const geometry = polygonGeometry(THREE, points, depth, bevel);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    product.add(mesh);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry, 24),
      new THREE.LineBasicMaterial({ color: 0x62666a, transparent: true, opacity: 0.52 })
    );
    product.add(edges);
  });

  const ambient = new THREE.AmbientLight(0xffffff, 0.035);
  const key = new THREE.DirectionalLight(0xffffff, 0.42);
  key.position.set(-4.5, 4, 5);
  const rim = new THREE.DirectionalLight(0xf28c18, 0.9);
  rim.position.set(-5, 1.4, -2.5);
  const fill = new THREE.DirectionalLight(0x63717a, 0.12);
  fill.position.set(4, -2, 4);
  scene.add(ambient, key, rim, fill);

  let frame = 0;
  let inViewport = true;
  let pageVisible = !document.hidden;

  const render = () => renderer.render(scene, camera);
  const loop = () => {
    frame = 0;
    render();
    if (inViewport && pageVisible) frame = window.requestAnimationFrame(loop);
  };
  const resume = () => {
    if (!frame && inViewport && pageVisible) frame = window.requestAnimationFrame(loop);
  };

  const observer = new IntersectionObserver(([entry]) => {
    inViewport = entry.isIntersecting;
    if (!inViewport && frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
    resume();
  }, { threshold: 0.01 });
  observer.observe(root);

  const onVisibility = () => {
    pageVisible = !document.hidden;
    if (!pageVisible && frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
    resume();
  };
  document.addEventListener('visibilitychange', onVisibility);

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();
  resume();

  return {
    product,
    ambient,
    key,
    rim,
    fill,
    render,
    cleanup() {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      product.traverse((child) => {
        child.geometry?.dispose?.();
        if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose());
        else child.material?.dispose?.();
      });
      matteBlack.dispose();
      charcoalBlack.dispose();
      renderer.dispose();
    }
  };
}

function buildScrollTimeline(root, scene, compact) {
  const hero = root.querySelector('[data-cinematic-hero]');
  const productLayer = root.querySelector('[data-cinematic-product]');
  const highlight = root.querySelector('[data-cinematic-highlight]');
  const panels = gsap.utils.toArray(root.querySelectorAll('[data-cinematic-panel]'));
  const callouts = root.querySelector('[data-cinematic-callouts]');
  const calloutItems = gsap.utils.toArray(root.querySelectorAll('.cinematic-callout'));
  const interfaceLines = root.querySelector('[data-cinematic-interface]');
  const scrollCue = root.querySelector('[data-cinematic-scroll-cue]');

  gsap.set(panels, { autoAlpha: 0, y: 26 });
  gsap.set([callouts, interfaceLines], { autoAlpha: 0 });
  gsap.set(calloutItems, { autoAlpha: 0, y: 12 });

  const timeline = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      scrub: compact ? 0.35 : 0.65,
      invalidateOnRefresh: true
    }
  });

  timeline
    .to(scrollCue, { autoAlpha: 0, duration: 0.04 }, 0.03)
    .to(hero, { autoAlpha: 0, y: -36, duration: 0.09 }, 0.08)
    .to(productLayer, { scale: compact ? 1.03 : 1.1, yPercent: compact ? 4 : 1, duration: 0.2 }, 0.09)
    .to(root, { '--cinematic-bg': '#151515', duration: 0.28 }, 0.12)
    .fromTo(highlight, { xPercent: -160, opacity: 0 }, { xPercent: 170, opacity: 0.68, duration: 0.22 }, 0.15)
    .to(interfaceLines, { autoAlpha: 1, duration: 0.08 }, 0.2);

  if (scene) {
    timeline
      .to(scene.product.scale, { x: 0.98, y: 0.98, z: 0.98, duration: 0.22 }, 0.1)
      .to(scene.product.rotation, { y: compact ? -0.12 : 0.17, x: -0.02, duration: 0.4 }, 0.11)
      .to(scene.ambient, { intensity: 0.34, duration: 0.2 }, 0.1)
      .to(scene.key, { intensity: 3.3, duration: 0.2 }, 0.1)
      .to(scene.rim, { intensity: 4.2, duration: 0.2 }, 0.1)
      .to(scene.fill, { intensity: 1.05, duration: 0.2 }, 0.1)
      .to(scene.rim.position, { x: 5.5, duration: 0.28 }, 0.13);
  } else {
    timeline.to(root.querySelector('.fictional-product'), { rotationY: compact ? 4 : 10, duration: 0.38 }, 0.11);
  }

  const panelStarts = [0.23, 0.39, 0.55, 0.7];
  panels.forEach((panel, index) => {
    const start = panelStarts[index];
    timeline
      .to(panel, { autoAlpha: 1, y: 0, duration: 0.045 }, start)
      .to(panel, { autoAlpha: 0, y: -22, duration: 0.045 }, start + 0.105);
  });

  timeline
    .to(callouts, { autoAlpha: 1, duration: 0.04 }, 0.77)
    .to(calloutItems, { autoAlpha: 1, y: 0, duration: 0.055, stagger: 0.012 }, 0.78)
    .to(calloutItems, { autoAlpha: 0, y: -8, duration: 0.045, stagger: 0.008 }, 0.9)
    .to([callouts, interfaceLines], { autoAlpha: 0, duration: 0.04 }, 0.93)
    .to(productLayer, { xPercent: compact ? 24 : 38, scale: 0.9, opacity: 0, duration: 0.09 }, 0.91)
    .to(root, { '--cinematic-glow-opacity': 0, duration: 0.08 }, 0.92);

  return () => {
    timeline.scrollTrigger?.kill();
    timeline.kill();
  };
}

export async function initialiseCinematic(root, { reducedMotion = false } = {}) {
  if (!root) return () => {};

  const loader = root.querySelector('[data-cinematic-loader]');
  const product = root.querySelector('[data-cinematic-product]');
  const compact = window.matchMedia('(max-width: 700px)').matches;
  let scene = null;
  let destroyed = false;

  if (!compact && !reducedMotion) {
    try {
      scene = await initialiseThreeProduct(root, root.querySelector('[data-cinematic-canvas]'));
      if (destroyed) {
        scene.cleanup();
        return () => {};
      }
      root.classList.add('cinematic--webgl');
    } catch {
      root.classList.add('cinematic--fallback');
    }
  } else {
    root.classList.add(reducedMotion ? 'cinematic--reduced' : 'cinematic--fallback');
  }

  root.classList.add('cinematic--ready');

  if (reducedMotion) {
    loader.hidden = true;
    return () => {
      destroyed = true;
      scene?.cleanup();
    };
  }

  const entrance = gsap.timeline();
  entrance
    .to(loader, { autoAlpha: 0, duration: 0.42, delay: 0.12, ease: 'power2.out' })
    .fromTo(product, { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.72, ease: 'power3.out' }, 0.28);

  const destroyScroll = buildScrollTimeline(root, scene, compact);
  ScrollTrigger.refresh();

  return () => {
    destroyed = true;
    entrance.kill();
    destroyScroll();
    scene?.cleanup();
  };
}
