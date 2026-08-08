/* Interações da interface: navegação, acessibilidade, animações e simulador. */
/* ===== ELEMENTOS PRINCIPAIS ===== */
const body = document.body;
const topbar = document.querySelector('.topbar');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('nav');
const contrastButton = document.querySelector('#contrast');
let scale = 1;

/* ===== NAVEGAÇÃO E CABEÇALHO ===== */
window.addEventListener('scroll', () => topbar.classList.toggle('scrolled', window.scrollY > 20), { passive: true });
menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', open);
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  menuButton.textContent = open ? '×' : '☰';
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = '☰';
}));
/* ===== CONTROLES DE ACESSIBILIDADE ===== */
document.querySelectorAll('[data-font]').forEach(button => button.addEventListener('click', () => {
  scale = Math.min(1.2, Math.max(.9, scale + (button.dataset.font === 'up' ? .05 : -.05)));
  document.documentElement.style.setProperty('--font-scale', scale.toFixed(2));
}));
contrastButton.addEventListener('click', () => {
  const enabled = body.classList.toggle('high-contrast');
  contrastButton.setAttribute('aria-pressed', enabled);
});
document.querySelector('.back-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ===== ANIMAÇÕES AO ROLAR A PÁGINA ===== */
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(item => revealObserver.observe(item));

/* ===== SIMULADOR DE AQUECIMENTO ===== */
const fields = { sun: document.querySelector('#sunInput'), ambient: document.querySelector('#ambientInput'), water: document.querySelector('#waterInput') };
const outputs = { sun: document.querySelector('#sunValue'), ambient: document.querySelector('#ambientValue'), water: document.querySelector('#waterValue') };
function simulate() {
  const solar = Number(fields.sun.value);
  const ambient = Number(fields.ambient.value);
  const water = Number(fields.water.value);
  const gain = (solar / 100) * 5.2 + Math.max(0, ambient - water) * .13;
  const result = Math.min(40, water + Math.max(.15, gain));
  outputs.sun.textContent = `${solar}%`;
  outputs.ambient.textContent = `${ambient}°C`;
  outputs.water.textContent = `${water}°C`;
  document.querySelector('#resultTemp').textContent = result.toFixed(1);
  document.querySelector('#thermoFill').style.width = `${Math.min(100, Math.max(8, (result - 15) * 4))}%`;
  const ideal = solar >= 35 && ambient >= 18;
  const status = document.querySelector('#systemStatus');
  status.textContent = ideal ? '● Condições favoráveis — bomba ativada' : '● Baixa eficiência — bomba em espera';
  status.style.color = ideal ? '#85f6cd' : '#ffd370';
}
Object.values(fields).forEach(input => input.addEventListener('input', simulate));
simulate();

/* ===== CONTADORES DE IMPACTO ===== */
const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  const node = entry.target;
  const target = Number(node.dataset.count);
  const start = performance.now();
  const tick = now => { const progress = Math.min(1, (now - start) / 1300); node.textContent = (target * (1 - Math.pow(1 - progress, 3))).toFixed(target % 1 ? 1 : 0); if (progress < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  counterObserver.unobserve(node);
}), { threshold: .6 });
counters.forEach(counter => counterObserver.observe(counter));
