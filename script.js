// ==========================================================================
// ProResume — interactions
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Page loader ---- */
  const loader = document.getElementById('pageLoader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 300);
  });
  // Fallback in case 'load' already fired
  setTimeout(() => loader.classList.add('hidden'), 1200);

  /* ---- Navbar shrink / blur on scroll ---- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 12) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  /* ---- Cursor-following ambient glow (hero) ---- */
  const glow = document.getElementById('cursorGlow');
  const hero = document.querySelector('.hero');
  let glowActive = false;
  const showGlow = () => { glowActive = true; glow.classList.add('active'); };
  const hideGlow = () => { glowActive = false; glow.classList.remove('active'); };
  if (hero && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('mouseenter', showGlow);
    hero.addEventListener('mouseleave', hideGlow);
    window.addEventListener('mousemove', (e) => {
      if (!glowActive) return;
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    }, { passive: true });
  }

  /* ---- Cursor-aware card lighting (feature / template / testimonial / price cards) ---- */
  const lightableCards = document.querySelectorAll('.feature-card, .template-card, .testi-card, .price-card, .dash-card');
  lightableCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(15,15,15,0.035), transparent 60%), var(--card)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = 'var(--card)';
    });
  });

  /* ---- Scroll reveal (Intersection Observer) ---- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const group = el.parentElement;
        const siblings = group ? Array.from(group.querySelectorAll('[data-reveal]')) : [el];
        const delayIndex = siblings.indexOf(el);
        setTimeout(() => el.classList.add('in-view'), Math.min(delayIndex, 6) * 70);
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---- ATS score ring animation (hero) ---- */
  const ring = document.querySelector('.dash-ats .ring-val');
  if (ring) {
    const circumference = 2 * Math.PI * 17;
    ring.style.strokeDasharray = circumference;
    const targetOffset = circumference * (1 - 0.92);
    const ringObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => { ring.style.strokeDashoffset = targetOffset; });
          ringObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });
    ringObserver.observe(document.querySelector('.hero-visual'));
  }

  /* ---- Number counters ---- */
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const duration = 1200;
      const start = performance.now();
      const isInt = Number.isInteger(target);
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = isInt ? Math.round(value) : value.toFixed(1);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => counterObserver.observe(c));

  /* ---- Button ripple + magnetic hover ---- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });

    if (window.matchMedia('(pointer: fine)').matches) {
      btn.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
        this.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('mouseleave', function () {
        this.style.transform = '';
      });
    }
  });

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        if (openItem !== item) openItem.classList.remove('open');
      });
      item.classList.toggle('open', !isOpen);
    });
  });

  /* ---- Smooth anchor scrolling with navbar offset ---- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 100;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

});