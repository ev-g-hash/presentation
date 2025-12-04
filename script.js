// Навигация между страницами
const pages = {
  greeting: document.getElementById('page-greeting'),
  gallery: document.getElementById('page-gallery'),
  code: document.getElementById('page-code')
};

function showPage(name){
  Object.values(pages).forEach(p=>{
    p.classList.remove('active');
    p.setAttribute('aria-hidden','true');
  });
  const target = pages[name];
  target.classList.add('active');
  target.removeAttribute('aria-hidden');

  // Запуск анимаций на первой странице
  if(name === 'greeting') {
    startConfetti();
  } else {
    stopConfetti();
  }
}

// Кнопки
document.getElementById('to-gallery').addEventListener('click', () => showPage('gallery'));
document.getElementById('to-code').addEventListener('click', () => {
  fillCodeBlock();
  showPage('code');
});
document.getElementById('back-to-greeting').addEventListener('click', () => showPage('greeting'));
document.getElementById('back-to-gallery').addEventListener('click', () => showPage('gallery'));
document.getElementById('to-greeting').addEventListener('click', () => showPage('greeting'));

// Печатная машинка
const typeEl = document.getElementById('typed');
const text = "Мой уважаемый друг! От всей души я поздравляю тебя с Днём Твоего Рождения!\nЖелаю тебе крепкого здоровья, долгих лет жизней, надежных и понимающих тебя друзей!";

let typeIdx = 0;
function typeStep(){
  if(typeIdx <= text.length){
    typeEl.textContent = text.slice(0, typeIdx);
    typeIdx++;
    setTimeout(typeStep, 28 + Math.random()*22);
  } else {
    // курсор после завершения
    const cur = document.createElement('span');
    cur.className = 'cursor';
    typeEl.appendChild(cur);
  }
}
setTimeout(typeStep, 600);

// Конфетти
const confettiCanvas = document.getElementById('confetti');
const ctx = confettiCanvas.getContext('2d');
let confettiParticles = [];
let confettiRAF = null;
let confettiTimer = null;

function resizeCanvas(){
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas, { passive: true });
resizeCanvas();

function rand(min, max){ 
  return Math.random() * (max - min) + min; 
}

function startConfetti(){
  stopConfetti();
  resizeCanvas();
  confettiParticles = [];
  const colors = ['#ffd166', '#06d6a0', '#ef476f', '#118ab2', '#8338ec', '#fb5607'];
  const count = Math.min(180, Math.floor((confettiCanvas.width * confettiCanvas.height) / 15000));
  
  for(let i=0; i<count; i++){
    confettiParticles.push({
      x: rand(0, confettiCanvas.width),
      y: rand(-confettiCanvas.height, 0),
      w: rand(4, 10),
      h: rand(8, 16),
      vy: rand(1.2, 2.8),
      vx: rand(-0.6, 0.6),
      rot: rand(0, Math.PI*2),
      vr: rand(-0.2, 0.2),
      color: colors[Math.floor(Math.random()*colors.length)],
      shape: Math.random() < 0.5 ? 'rect' : 'circle'
    });
  }
  
  const startTime = performance.now();
  
  function draw(){
    const now = performance.now();
    const elapsed = now - startTime;
    ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
    
    for(const p of confettiParticles){
      p.y += p.vy;
      p.x += p.vx;
      p.rot += p.vr;

      // рисование
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      
      if(p.shape === 'rect'){
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.w/2, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();

      // респавн сверху
      if(p.y > confettiCanvas.height + 20){
        p.y = rand(-confettiCanvas.height, 0);
        p.x = rand(0, confettiCanvas.width);
      }
    }
    confettiRAF = requestAnimationFrame(draw);
  }
  
  draw();
  confettiTimer = setTimeout(stopConfetti, 8000); // автоматическая остановка
}

function stopConfetti(){
  if(confettiRAF) cancelAnimationFrame(confettiRAF);
  confettiRAF = null;
  if(confettiTimer) clearTimeout(confettiTimer);
  confettiTimer = null;
  ctx && ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
}

// Лайтбокс для фото
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const gallery = document.getElementById('gallery');
let lightboxOpen = false;

gallery.addEventListener('click', (e) => {
  const img = e.target.closest('img');
  if(!img) return;
  lightboxImg.src = img.src;
  lightbox.classList.add('open');
  lightboxOpen = true;
  document.body.style.overflow = 'hidden';
});

lightbox.addEventListener('click', () => {
  closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && lightboxOpen){
    closeLightbox();
  }
});

function closeLightbox(){
  lightbox.classList.remove('open');
  lightboxOpen = false;
  document.body.style.overflow = '';
  setTimeout(()=> { lightboxImg.src = ''; }, 200);
}

// Код: собрать текущий HTML и подсветка простым экранированием
function fillCodeBlock(){
  const raw = document.documentElement.outerHTML;
  const escaped = raw
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
  const codeEl = document.getElementById('code-html');
  codeEl.innerHTML = escaped;
}

// Подготовим сразу, чтобы не было пустого блока при переходе
fillCodeBlock();

// Копирование кода
document.getElementById('copy-html').addEventListener('click', async () => {
  const raw = document.documentElement.outerHTML;
  try {
    await navigator.clipboard.writeText(raw);
    const btn = document.getElementById('copy-html');
    const prev = btn.textContent;
    btn.textContent = 'Скопировано!';
    setTimeout(()=> btn.textContent = prev, 1200);
  } catch (e) {
    alert('Не удалось скопировать. Выделите код вручную.');
  }
});

// Старт: сразу показываем первую страницу и запускаем конфетти
document.addEventListener('DOMContentLoaded', () => {
  showPage('greeting');
});