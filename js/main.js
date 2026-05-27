/* ===== THREE.JS SCENE ===== */
const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
camera.position.z = 30;

// Particle system
const count = 1400;
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);
const palette = [[0.49, 0.36, 0.99], [0.28, 0.79, 0.9], [1.0, 0.42, 0.62]];
for (let i = 0; i < count; i++) {
  positions[i*3]   = (Math.random() - 0.5) * 120;
  positions[i*3+1] = (Math.random() - 0.5) * 120;
  positions[i*3+2] = (Math.random() - 0.5) * 60;
  const c = palette[Math.floor(Math.random() * palette.length)];
  colors[i*3] = c[0]; colors[i*3+1] = c[1]; colors[i*3+2] = c[2];
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
const pMat = new THREE.PointsMaterial({ size: 0.14, vertexColors: true, transparent: true, opacity: 0.75 });
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

// Floating wireframe shapes
const shapeDefs = [
  { geo: new THREE.TorusKnotGeometry(3, 0.7, 80, 16), pos: [20, 6, -12], color: 0x7C5CFC },
  { geo: new THREE.IcosahedronGeometry(2.5, 1),        pos: [-22, -8, -15], color: 0x48CAE4 },
  { geo: new THREE.OctahedronGeometry(2.2),             pos: [18, -12, -8],  color: 0xFF6B9D },
  { geo: new THREE.TorusGeometry(2.5, 0.5, 12, 40),    pos: [-20, 12, -14], color: 0x7C5CFC },
];
const shapes = shapeDefs.map(({ geo, pos, color }) => {
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.22 }));
  mesh.position.set(...pos);
  scene.add(mesh);
  return mesh;
});

const mouse = { x: 0, y: 0 };
document.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
});

let t = 0;
(function animate() {
  requestAnimationFrame(animate);
  t += 0.004;
  particles.rotation.y = t * 0.04;
  particles.rotation.x = t * 0.015;
  shapes.forEach((s, i) => {
    s.rotation.x = t * (0.25 + i * 0.1);
    s.rotation.y = t * (0.2 + i * 0.12);
  });
  camera.position.x += (mouse.x * 3 - camera.position.x) * 0.03;
  camera.position.y += (mouse.y * 2 - camera.position.y) * 0.03;
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
})();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ===== SCROLL REVEAL ===== */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));

/* ===== COUNTER ===== */
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current);
    }, 25);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

/* ===== SKILL BARS ===== */
const skillBarObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.skill-fill').forEach(bar => {
      bar.style.width = bar.dataset.width + '%';
    });
    skillBarObserver.unobserve(entry.target);
  });
}, { threshold: 0.3 });
const skillsSection = document.querySelector('.skills-bars');
if (skillsSection) skillBarObserver.observe(skillsSection);

/* ===== PORTFOLIO FILTER ===== */
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

/* ===== TESTIMONIALS SLIDER ===== */
let cur = 0;
const tCards = document.querySelectorAll('.testimonial-card');
const tDots  = document.querySelectorAll('.t-dot');

function showSlide(n) {
  tCards.forEach(c => c.classList.remove('active'));
  tDots.forEach(d => d.classList.remove('active'));
  tCards[n].classList.add('active');
  tDots[n].classList.add('active');
}
document.querySelector('.t-next')?.addEventListener('click', () => { cur = (cur + 1) % tCards.length; showSlide(cur); });
document.querySelector('.t-prev')?.addEventListener('click', () => { cur = (cur - 1 + tCards.length) % tCards.length; showSlide(cur); });
tDots.forEach((d, i) => d.addEventListener('click', () => { cur = i; showSlide(i); }));
setInterval(() => { cur = (cur + 1) % tCards.length; showSlide(cur); }, 5500);

/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  const sections = document.querySelectorAll('section[id]');
  let active = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) active = s.id; });
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + active));
});

/* ===== HAMBURGER ===== */
document.getElementById('hamburger')?.addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

/* ===== 3D CARD TILT ===== */
document.querySelectorAll('.service-card, .portfolio-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `translateY(-8px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ===== CONTACT FORM ===== */
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('[type="submit"]');
  btn.innerHTML = 'Message Sent! &#10003;';
  btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
  setTimeout(() => {
    btn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
    btn.style.background = '';
    e.target.reset();
  }, 3000);
});
