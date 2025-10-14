// Simple scroll effect for navbar
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});


// Put this at the end of body or in your script.js
(function () {
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('primaryNav');
  const navbar = document.getElementById('site-navbar');
  const navLinks = document.querySelectorAll('.nav-link');

  // toggle mobile menu
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // close menu when a link is clicked (mobile)
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // add scrolled class for glass + shadow on scroll
  const onScroll = () => {
    if (window.scrollY > 24) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  // highlight active link as you scroll
  const sections = [...document.querySelectorAll('section[id]')];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
      if (!navLink) return;
      if (entry.isIntersecting) {
        navLinks.forEach(n => n.classList.remove('active'));
        navLink.classList.add('active');
      }
    });
  }, { root: null, threshold: 0.52 });

  sections.forEach(s => observer.observe(s));
})();

// Hero animation trigger when in view
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("animate");
    }
  });
});

document.querySelectorAll(".hero-content, .buttons").forEach((el) => observer.observe(el));


/* Starfield animation for hero background
   - Lightweight, no libs
   - Auto-resizes on viewport change
   - Parallax reacts to pointer movement (gentle)
*/
(function () {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });

  let W = 0, H = 0, deviceRatio = window.devicePixelRatio || 1;
  let stars = [];
  const STAR_COUNT_BASE = 110; // base density - will scale with size
  const SHOOTING_PROB = 0.002; // per frame probability of a shooting star

  // pointer / parallax state
  const pointer = { x: 0.5, y: 0.5 };

  function setSize() {
    deviceRatio = window.devicePixelRatio || 1;
    W = canvas.clientWidth || canvas.offsetWidth || window.innerWidth;
    H = canvas.clientHeight || canvas.offsetHeight || Math.max(window.innerHeight * 0.8, 600);
    canvas.width = Math.round(W * deviceRatio);
    canvas.height = Math.round(H * deviceRatio);
    ctx.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function createStars() {
    stars = [];
    // scale number of stars by area
    const area = (W * H) / (1400 * 800); // normalize
    const count = Math.round(STAR_COUNT_BASE * Math.max(0.6, area));
    for (let i = 0; i < count; i++) {
      stars.push({
        x: rand(0, W),
        y: rand(0, H),
        r: rand(0.35, 1.6),           // radius
        baseAlpha: rand(0.2, 0.95),   // base brightness
        alpha: 0,
        twinkleSpeed: rand(0.002, 0.02),
        twinklePhase: rand(0, Math.PI * 2),
        driftX: rand(-0.02, 0.02),    // very slow drift
        driftY: rand(-0.02, 0.02)
      });
    }
  }

  // shooting star pool
  const shoots = [];

  function spawnShootingStar() {
    const startX = rand(0, W * 0.6);
    const startY = rand(0, H * 0.35);
    const length = rand(100, Math.min(W * 0.7, 380));
    const speed = rand(6, 18); // px per frame
    const angle = rand(Math.PI * 0.15, Math.PI * 0.35); // shallow downward
    shoots.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: length / speed + 8,
      length,
      alpha: 1
    });
  }

  // animate frame
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(60, now - last);
    last = now;
    // clear
    ctx.clearRect(0, 0, W, H);

    // parallax offset from pointer (gentle)
    const px = (pointer.x - 0.5) * 40; // pixels offset
    const py = (pointer.y - 0.5) * 25;

    // draw stars
    for (let s of stars) {
      // twinkle using sine wave
      s.twinklePhase += s.twinkleSpeed * (dt);
      const tw = Math.sin(s.twinklePhase) * 0.5 + 0.5;
      s.alpha = Math.max(0.05, Math.min(1, s.baseAlpha * (0.6 + 0.8 * tw)));

      // slow drift
      s.x += s.driftX * (dt * 0.03);
      s.y += s.driftY * (dt * 0.03);
      // wrap around
      if (s.x < -10) s.x = W + 10;
      if (s.x > W + 10) s.x = -10;
      if (s.y < -10) s.y = H + 10;
      if (s.y > H + 10) s.y = -10;

      // draw with parallax offset proportional to size
      const parRatio = (s.r / 1.6) * 0.6;
      const drawX = s.x + px * parRatio;
      const drawY = s.y + py * parRatio;

      ctx.beginPath();
      // soft radial star
      const g = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, s.r * 7);
      g.addColorStop(0, `rgba(255,255,255,${s.alpha})`);
      g.addColorStop(0.2, `rgba(200,210,255,${s.alpha * 0.6})`);
      g.addColorStop(1, `rgba(120,140,255,0)`);
      ctx.fillStyle = g;
      ctx.arc(drawX, drawY, s.r * 6, 0, Math.PI * 2);
      ctx.fill();

      // tiny center point for bright stars
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, s.alpha * 1.3)})`;
      ctx.beginPath();
      ctx.arc(drawX, drawY, Math.max(0.35, s.r * 0.3), 0, Math.PI * 2);
      ctx.fill();
    }

    // maybe spawn shooting stars rarely
    if (Math.random() < SHOOTING_PROB) spawnShootingStar();

    // animate shooting stars
    for (let i = shoots.length - 1; i >= 0; i--) {
      const st = shoots[i];
      st.life++;
      // position advance
      st.x += st.vx * (dt / 16.66);
      st.y += st.vy * (dt / 16.66);

      // fade
      st.alpha = 1 - st.life / st.maxLife;

      // draw trail
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const grad = ctx.createLinearGradient(st.x, st.y, st.x - st.vx * 1.8, st.y - st.vy * 1.8);
      grad.addColorStop(0, `rgba(255,255,255,${Math.max(0.2, st.alpha)})`);
      grad.addColorStop(1, `rgba(120,140,255,0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(st.x, st.y);
      ctx.lineTo(st.x - st.vx * 2, st.y - st.vy * 2);
      ctx.stroke();

      // head
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, st.alpha * 1.5)})`;
      ctx.beginPath();
      ctx.arc(st.x, st.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (st.life > st.maxLife) shoots.splice(i, 1);
    }

    requestAnimationFrame(frame);
  }

  // init function
  function init() {
    setSize();
    createStars();
    // start animation loop
    last = performance.now();
    requestAnimationFrame(frame);
  }

  // events
  window.addEventListener("resize", () => {
    setSize();
    createStars();
  }, { passive: true });

  // pointer parallax (works for touch too)
  function onPointer(e) {
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX ?? (e.touches && e.touches[0].clientX) ?? (rect.left + rect.width/2)) - rect.left;
    const py = (e.clientY ?? (e.touches && e.touches[0].clientY) ?? (rect.top + rect.height/2)) - rect.top;
    pointer.x = Math.max(0, Math.min(1, px / rect.width));
    pointer.y = Math.max(0, Math.min(1, py / rect.height));
  }
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("touchmove", onPointer, { passive: true });

  // pause animation when tab hidden to save CPU
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // stop pointer movement a bit
      pointer.x = 0.5; pointer.y = 0.5;
    }
  });

  // start
  init();
})();


// Scroll-triggered animations for About section
const scrollElements = document.querySelectorAll(
  ".fade-in-left, .slide-up, .fade-in-delay"
);

const observerOptions = {
  threshold: 0.3,
};

const onScrollAnimate = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("animate");
      observer.unobserve(entry.target);
    }
  });
};

const aboutObserver = new IntersectionObserver(onScrollAnimate, observerOptions);
scrollElements.forEach((el) => aboutObserver.observe(el));


