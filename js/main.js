/* =========================================================
   Azim Khan — 3D Portfolio  ·  main.js
   ========================================================= */

/* ===================== PRELOADER ===================== */
(function preloader() {
  const fill = document.getElementById('preloaderFill');
  const count = document.getElementById('preloaderCount');
  const loader = document.getElementById('preloader');
  let p = 0;
  const timer = setInterval(() => {
    p += Math.floor(Math.random() * 8) + 3;
    if (p >= 100) { p = 100; clearInterval(timer); finish(); }
    fill.style.width = p + '%';
    count.textContent = p;
  }, 90);
  function finish() {
    setTimeout(() => {
      loader.classList.add('done');
      document.body.classList.add('loaded');
    }, 350);
  }
})();

/* ===================== THREE.JS SCENE ===================== */
(function threeScene() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 1000);
  camera.position.z = 26;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  // --- Central interactive object: icosahedron + wireframe shell ---
  const group = new THREE.Group();
  scene.add(group);

  const coreGeo = new THREE.IcosahedronGeometry(6, 1);
  const core = new THREE.Mesh(
    coreGeo,
    new THREE.MeshBasicMaterial({ color: 0x8B5CF6, wireframe: true, transparent: true, opacity: 0.35 })
  );
  group.add(core);

  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(6.6, 1),
    new THREE.MeshBasicMaterial({ color: 0x22D3EE, wireframe: true, transparent: true, opacity: 0.12 })
  );
  group.add(shell);

  // vertex glow points on the core
  const glowGeo = new THREE.BufferGeometry();
  glowGeo.setAttribute('position', coreGeo.attributes.position.clone());
  const glow = new THREE.Points(
    glowGeo,
    new THREE.PointsMaterial({ color: 0xF472B6, size: 0.35, transparent: true, opacity: 0.9 })
  );
  group.add(glow);

  group.position.set(12, 0, 0);

  // --- Ambient particle field ---
  const COUNT = 1300;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const palette = [[0.545, 0.361, 0.965], [0.133, 0.827, 0.933], [0.957, 0.447, 0.714]];
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 130;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 90;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
    const c = palette[i % 3];
    colors[i * 3] = c[0]; colors[i * 3 + 1] = c[1]; colors[i * 3 + 2] = c[2];
  }
  const fieldGeo = new THREE.BufferGeometry();
  fieldGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  fieldGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const field = new THREE.Points(
    fieldGeo,
    new THREE.PointsMaterial({ size: 0.16, vertexColors: true, transparent: true, opacity: 0.7 })
  );
  scene.add(field);

  // --- Small orbiting wireframe accents ---
  const accents = [
    { g: new THREE.TorusGeometry(2, 0.4, 10, 30), p: [-24, 12, -18], c: 0x8B5CF6 },
    { g: new THREE.OctahedronGeometry(1.8),       p: [-20, -14, -12], c: 0x22D3EE },
  ].map(({ g, p, c }) => {
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: c, wireframe: true, transparent: true, opacity: 0.2 }));
    m.position.set(...p);
    scene.add(m);
    return m;
  });

  // --- Interaction state ---
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('mousemove', e => {
    mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
    mouse.ty = -(e.clientY / innerHeight - 0.5) * 2;
  });
  let scrollY = 0;
  addEventListener('scroll', () => { scrollY = window.scrollY; });

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.005;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    const scrollNorm = scrollY / innerHeight;

    group.rotation.y = t * 0.35 + mouse.x * 0.6;
    group.rotation.x = t * 0.12 + mouse.y * 0.4;
    shell.rotation.y = -t * 0.25;
    shell.rotation.x = t * 0.18;
    const s = 1 + Math.sin(t * 1.5) * 0.04;
    group.scale.setScalar(s);
    // drift the centerpiece as you scroll down
    group.position.y = -scrollNorm * 8;
    group.position.x = 12 - scrollNorm * 4;

    field.rotation.y = t * 0.03;
    field.rotation.x = t * 0.012;

    accents.forEach((a, i) => {
      a.rotation.x = t * (0.4 + i * 0.15);
      a.rotation.y = t * (0.3 + i * 0.2);
    });

    camera.position.x += (mouse.x * 2.5 - camera.position.x) * 0.04;
    camera.position.y += (mouse.y * 1.8 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  })();

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
})();

/* ===================== CUSTOM CURSOR ===================== */
(function cursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring || matchMedia('(hover:none)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  });
  (function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('[data-cursor], a, button').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
})();

/* ===================== MAGNETIC BUTTONS ===================== */
(function magnetic() {
  if (matchMedia('(hover:none)').matches) return;
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

/* ===================== SERVICE CARD SPOTLIGHT ===================== */
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* ===================== SCROLL REVEAL ===================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));

/* ===================== COUNTERS ===================== */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.target, 10);
    let cur = 0;
    const step = target / 55;
    const timer = setInterval(() => {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(timer); }
      el.textContent = Math.floor(cur);
    }, 24);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

/* ===================== SKILL BARS ===================== */
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.skill-fill').forEach(bar => {
      bar.style.width = bar.dataset.width + '%';
    });
    skillObserver.unobserve(entry.target);
  });
}, { threshold: 0.3 });
const skillsBars = document.querySelector('.skills-bars');
if (skillsBars) skillObserver.observe(skillsBars);

/* ===================== PORTFOLIO FILTER ===================== */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.portfolio-card').forEach(card => {
      const match = filter === 'all' || card.dataset.category.split(' ').includes(filter);
      card.classList.toggle('hidden', !match);
    });
  });
});

/* ===================== TESTIMONIALS ===================== */
(function testimonials() {
  let cur = 0;
  const cards = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.t-dot');
  if (!cards.length) return;

  function show(n) {
    cards.forEach(c => c.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    cards[n].classList.add('active');
    dots[n].classList.add('active');
  }
  document.querySelector('.t-next')?.addEventListener('click', () => { cur = (cur + 1) % cards.length; show(cur); });
  document.querySelector('.t-prev')?.addEventListener('click', () => { cur = (cur - 1 + cards.length) % cards.length; show(cur); });
  dots.forEach((d, i) => d.addEventListener('click', () => { cur = i; show(cur); }));
  setInterval(() => { cur = (cur + 1) % cards.length; show(cur); }, 6000);
})();

/* ===================== NAVBAR + SCROLL PROGRESS ===================== */
const navbar = document.getElementById('navbar');
const progress = document.getElementById('scrollProgress');
const sections = document.querySelectorAll('section[id]');
addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 40);

  const h = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (y / h) * 100 + '%';

  let active = '';
  sections.forEach(s => { if (y >= s.offsetTop - 120) active = s.id; });
  document.querySelectorAll('.nav-link').forEach(l =>
    l.classList.toggle('active', l.getAttribute('href') === '#' + active));
});

/* ===================== MOBILE NAV ===================== */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger?.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

/* ===================== CONTACT FORM ===================== */
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('[type="submit"]');
  const original = btn.innerHTML;
  btn.innerHTML = 'Message Sent ✓';
  btn.style.background = 'linear-gradient(120deg,#22c55e,#16a34a)';
  setTimeout(() => {
    btn.innerHTML = original;
    btn.style.background = '';
    e.target.reset();
  }, 3000);
});
