 // Basic interactive behavior: smooth scroll, year, contact toast
document.addEventListener('DOMContentLoaded', () => {
  // set current year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior: 'smooth', block: 'start'});
      }
    });
  });

  // Floating subtle animations for hero decorations
  const decor = document.querySelector('.decor');
  if (decor) {
    let t = 0;
    function animate() {
      t += 0.002;
      const x = Math.sin(t) * 6;
      const y = Math.cos(t * 0.8) * 6;
      decor.style.transform = `translateX(calc(-50% + ${x}px)) translateY(${y}px)`;
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  // Contact form simulate submit and show a lightweight toast
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      // simulate network delay
      setTimeout(() => {
        submitBtn.textContent = 'Sent ✅';
        form.reset();
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message ✈️';
        }, 1400);
        showToast('Thanks — your message was sent (simulated).');
      }, 900);
    });
  }

  // Simple toast
  function showToast(msg){
    let t = document.createElement('div');
    t.className = 'site-toast';
    t.textContent = msg;
    Object.assign(t.style, {
      position:'fixed',right:'20px',bottom:'20px',padding:'12px 16px',
      background:'linear-gradient(90deg,#5eead4,#a78bfa)',color:'#06121a',borderRadius:'10px',
      boxShadow:'0 8px 30px rgba(0,0,0,0.4)',fontWeight:700
    });
    document.body.appendChild(t);
    setTimeout(()=> t.style.opacity = '0', 2500);
    setTimeout(()=> t.remove(), 3100);
  }

  // tiny mouse parallax on hero
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      const decorEl = document.querySelector('.decor');
      if (decorEl) decorEl.style.transform += ` translate3d(${dx * 10}px, ${dy * 10}px, 0)`;
    });
    hero.addEventListener('mouseleave', () => {
      const decorEl = document.querySelector('.decor');
      if (decorEl) decorEl.style.transform = 'translateX(-50%)';
    });
  }
});

  /* ---------- Left-nav Smooth Scroll + Active Section Highlight ---------- */
  const navButtons = document.querySelectorAll('.left-nav .nav-btn');
  const sections = [...document.querySelectorAll('section[id]')];

  // smooth scroll
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-target');
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // highlight logic using IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const navBtn = document.querySelector(`.nav-btn[data-target="${id}"]`);
      if (entry.isIntersecting) {
        navButtons.forEach(b => b.classList.remove('active'));
        if (navBtn) navBtn.classList.add('active');
      }
    });
  }, { root: null, threshold: 0.45 });

  sections.forEach(section => observer.observe(section));


  /* === Skills with Filters & Animated Meters === */
(function(){
  const section = document.getElementById('skills');
  if(!section) return;

  const cards = section.querySelectorAll('.skill-card');
  const filters = section.querySelectorAll('.filter-btn');

  // Reveal + animate meters
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const card = entry.target;
        card.classList.add('is-visible');
        const fill = card.querySelector('.skill-fill');
        const percent = +card.dataset.level;
        const label = card.querySelector('.skill-percent');
        if(fill){
          setTimeout(()=>{
            fill.style.width = percent + '%';
            if(label){
              let start = 0;
              const dur = 1000;
              const st = performance.now();
              (function animate(now){
                const t = Math.min(1,(now-st)/dur);
                const val = Math.round(t*percent);
                label.textContent = val + '%';
                if(t<1) requestAnimationFrame(animate);
              })(performance.now());
            }
          },150);
        }
        obs.unobserve(card);
      }
    });
  },{threshold:0.3});
  cards.forEach(c=>obs.observe(c));

  // Filter buttons
  filters.forEach(btn=>{
    btn.addEventListener('click',()=>{
      filters.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category;
      cards.forEach(card=>{
        if(cat==='all' || card.dataset.category===cat){
          card.classList.remove('hide');
        }else{
          card.classList.add('hide');
        }
      });
    });
  });

  // Tilt on hover
  cards.forEach(card=>{
    card.addEventListener('mousemove',(e)=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left)/r.width - 0.5;
      const y = (e.clientY - r.top)/r.height - 0.5;
      card.style.transform = `rotateY(${x*10}deg) rotateX(${-y*10}deg) scale(1.05)`;
    });
    card.addEventListener('mouseleave',()=>card.style.transform='');
  });
})();


  // Reveal the heading and description on scroll
  const headerEls = section.querySelectorAll('.reveal-title, .reveal-text');
  const headerObs = new IntersectionObserver((entries, o)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        o.unobserve(entry.target);
      }
    });
  },{threshold:0.3});
  headerEls.forEach(el => headerObs.observe(el));



  /* === Projects: Reveal on Scroll Animation === */
 
