import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';

const lerp = (start, end, amount) => start + (end - start) * amount;
const modulo = (value, length) => ((value % length) + length) % length;

function createTextTexture(gl, text, font, colour) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const maxWidth = 360;
  const words = text.split(' ');
  const lines = [];
  let line = '';

  context.font = font;
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);

  const visibleLines = lines.slice(0, 2);
  const widestLine = Math.max(...visibleLines.map((value) => context.measureText(value).width), 1);
  canvas.width = Math.ceil(widestLine + 36);
  canvas.height = Math.max(66, visibleLines.length * 34 + 22);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = font;
  context.fillStyle = colour;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  visibleLines.forEach((value, index) => {
    const offset = (index - (visibleLines.length - 1) / 2) * 34;
    context.fillText(value, canvas.width / 2, canvas.height / 2 + offset);
  });

  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class GalleryTitle {
  constructor({ gl, parent, text, colour, font }) {
    const geometry = new Plane(gl);
    const { texture, width, height } = createTextTexture(gl, text, font, colour);
    const program = new Program(gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 colour = texture2D(tMap, vUv);
          if (colour.a < 0.1) discard;
          gl_FragColor = colour;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    this.mesh = new Mesh(gl, { geometry, program });
    const ratio = width / height;
    const titleWidth = 0.92;
    this.mesh.scale.set(titleWidth, Math.min(0.28, Math.max(0.14, titleWidth / ratio)), 1);
    this.mesh.position.y = -0.73;
    this.mesh.setParent(parent);
  }
}

class GalleryMedia {
  constructor({
    geometry,
    gl,
    item,
    index,
    length,
    scene,
    screen,
    viewport,
    bend,
    textColor,
    borderRadius,
    font
  }) {
    this.extra = 0;
    this.geometry = geometry;
    this.gl = gl;
    this.item = item;
    this.index = index;
    this.length = length;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    this.bend = bend;
    this.borderRadius = borderRadius;
    this.createShader();
    this.createMesh();
    this.title = new GalleryTitle({ gl, parent: this.plane, text: item.text, colour: textColor, font });
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      transparent: true,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) + cos(p.y * 2.0 + uTime)) * (0.08 + abs(uSpeed) * 0.32);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          float planeAspect = uPlaneSizes.x / uPlaneSizes.y;
          float imageAspect = uImageSizes.x / uImageSizes.y;
          vec2 contain = vec2(1.0);
          if (planeAspect > imageAspect) contain.x = imageAspect / planeAspect;
          else contain.y = planeAspect / imageAspect;

          vec2 imageUv = (vUv - 0.5) / contain + 0.5;
          vec4 colour = vec4(0.025, 0.025, 0.03, 1.0);
          if (imageUv.x >= 0.0 && imageUv.x <= 1.0 && imageUv.y >= 0.0 && imageUv.y <= 1.0) {
            colour = texture2D(tMap, imageUv);
          }
          float distance = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float alpha = 1.0 - smoothstep(-0.002, 0.002, distance);
          gl_FragColor = vec4(colour.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [1, 1] },
        uSpeed: { value: 0 },
        uTime: { value: Math.random() * 100 },
        uBorderRadius: { value: this.borderRadius }
      }
    });

    const image = new Image();
    image.decoding = 'async';
    image.src = this.item.image;
    image.onload = () => {
      texture.image = image;
      this.program.uniforms.uImageSizes.value = [image.naturalWidth, image.naturalHeight];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    this.plane.setParent(this.scene);
  }

  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) this.viewport = viewport;
    const scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (900 * scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (1100 * scale)) / this.screen.width;
    this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = this.screen.width < 640 ? 0.85 : 1.35;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }

  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x;
    const halfWidth = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const bend = Math.abs(this.bend);
      const radius = (halfWidth * halfWidth + bend * bend) / (2 * bend);
      const effectiveX = Math.min(Math.abs(x), halfWidth);
      const arc = radius - Math.sqrt(radius * radius - effectiveX * effectiveX);
      this.plane.position.y = this.bend > 0 ? -arc : arc;
      this.plane.rotation.z = (this.bend > 0 ? -1 : 1) * Math.sign(x) * Math.asin(effectiveX / radius);
    }

    const speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.035;
    this.program.uniforms.uSpeed.value = speed;
    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    const before = this.plane.position.x + planeOffset < -viewportOffset;
    const after = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && before) this.extra -= this.widthTotal;
    if (direction === 'left' && after) this.extra += this.widthTotal;
  }
}

class CircularGalleryApp {
  constructor(container, items, options) {
    this.container = container;
    this.items = items;
    this.scrollSpeed = options.scrollSpeed;
    this.scroll = { ease: options.scrollEase, current: 0, target: 0, last: 0 };
    this.running = true;
    this.visible = true;
    this.createRenderer();
    this.createCamera();
    this.scene = new Transform();
    this.geometry = new Plane(this.gl, { heightSegments: 40, widthSegments: 80 });
    this.onResize();
    const doubled = items.concat(items);
    this.medias = doubled.map((item, index) => new GalleryMedia({
      geometry: this.geometry,
      gl: this.gl,
      item,
      index,
      length: doubled.length,
      scene: this.scene,
      screen: this.screen,
      viewport: this.viewport,
      bend: options.bend,
      textColor: options.textColor,
      borderRadius: options.borderRadius,
      font: options.font
    }));
    this.addEventListeners();
    this.update();
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 1.5)
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.canvas.setAttribute('aria-hidden', 'true');
    this.container.append(this.gl.canvas);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  onResize = () => {
    this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
    if (!this.screen.width || !this.screen.height) return;
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    this.viewport = { width: height * this.camera.aspect, height };
    this.medias?.forEach((media) => media.onResize({ screen: this.screen, viewport: this.viewport }));
  };

  announce() {
    const width = this.medias?.[0]?.width;
    if (!width) return;
    const index = modulo(Math.round(this.scroll.target / width), this.items.length);
    const status = this.container.parentElement?.querySelector('[data-gallery-status]');
    if (status) status.textContent = `${index + 1} of ${this.items.length}: ${this.items[index].text}`;
  }

  snap() {
    const width = this.medias?.[0]?.width;
    if (!width) return;
    this.scroll.target = Math.round(this.scroll.target / width) * width;
    this.announce();
  }

  step(direction) {
    const width = this.medias?.[0]?.width;
    if (!width) return;
    this.scroll.target += direction * width;
    this.snap();
  }

  onKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.step(1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.step(-1);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      this.scroll.target = 0;
      this.snap();
    }
    if (event.key === 'End') {
      event.preventDefault();
      this.scroll.target = (this.items.length - 1) * this.medias[0].width;
      this.snap();
    }
  };

  onWheel = (event) => {
    if (!event.shiftKey && Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    const delta = event.shiftKey ? event.deltaY : event.deltaX;
    this.scroll.target += Math.sign(delta) * this.scrollSpeed * 0.45;
    window.clearTimeout(this.wheelTimer);
    this.wheelTimer = window.setTimeout(() => this.snap(), 140);
  };

  onPointerDown = (event) => {
    this.dragging = true;
    this.dragStart = event.clientX;
    this.dragPosition = this.scroll.current;
    this.container.setPointerCapture?.(event.pointerId);
    this.container.classList.add('is-dragging');
  };

  onPointerMove = (event) => {
    if (!this.dragging) return;
    const distance = (this.dragStart - event.clientX) * (this.scrollSpeed * 0.025);
    this.scroll.target = this.dragPosition + distance;
  };

  onPointerUp = (event) => {
    if (!this.dragging) return;
    this.dragging = false;
    this.container.releasePointerCapture?.(event.pointerId);
    this.container.classList.remove('is-dragging');
    this.snap();
  };

  onVisibility = () => { this.running = !document.hidden; };

  update = () => {
    if (this.running && this.visible) {
      this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
      const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
      this.medias.forEach((media) => media.update(this.scroll, direction));
      this.renderer.render({ scene: this.scene, camera: this.camera });
      this.scroll.last = this.scroll.current;
    }
    this.raf = window.requestAnimationFrame(this.update);
  };

  addEventListeners() {
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(this.container);
    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
    }, { threshold: 0.01 });
    this.visibilityObserver.observe(this.container);
    this.container.addEventListener('keydown', this.onKeyDown);
    this.container.addEventListener('wheel', this.onWheel, { passive: false });
    this.container.addEventListener('pointerdown', this.onPointerDown);
    this.container.addEventListener('pointermove', this.onPointerMove);
    this.container.addEventListener('pointerup', this.onPointerUp);
    this.container.addEventListener('pointercancel', this.onPointerUp);
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.clearTimeout(this.wheelTimer);
    this.resizeObserver?.disconnect();
    this.visibilityObserver?.disconnect();
    this.container.removeEventListener('keydown', this.onKeyDown);
    this.container.removeEventListener('wheel', this.onWheel);
    this.container.removeEventListener('pointerdown', this.onPointerDown);
    this.container.removeEventListener('pointermove', this.onPointerMove);
    this.container.removeEventListener('pointerup', this.onPointerUp);
    this.container.removeEventListener('pointercancel', this.onPointerUp);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.gl?.canvas?.remove();
  }
}

export async function mountCircularGallery(container, {
  items = [],
  bend = 2,
  textColor = '#ffffff',
  borderRadius = 0.08,
  scrollSpeed = 1.4,
  scrollEase = 0.035,
  font = '700 26px "Barlow Condensed"'
} = {}) {
  if (!container || !items.length || !window.WebGLRenderingContext) return null;
  await document.fonts?.load?.(font);

  try {
    const app = new CircularGalleryApp(container, items, {
      bend,
      textColor,
      borderRadius,
      scrollSpeed,
      scrollEase,
      font
    });
    container.dataset.ready = 'true';
    delete container.dataset.loading;
    container.parentElement?.querySelector('[data-gallery-fallback]')?.setAttribute('hidden', '');
    app.announce();
    return () => {
      app.destroy();
      delete container.dataset.ready;
      delete container.dataset.loading;
      container.parentElement?.querySelector('[data-gallery-fallback]')?.removeAttribute('hidden');
    };
  } catch {
    delete container.dataset.loading;
    container.dataset.failed = 'true';
    return null;
  }
}
