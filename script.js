/* ================================================================
   AGENCYYO — Premium SEO & GEO-First Web Studio
   script.js | All Interactions & Animations
   ================================================================ */
'use strict';

/* ----------------------------------------------------------------
   BOOTSTRAP
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize EmailJS when DOM is ready and EmailJS library is loaded
  if (typeof emailjs !== 'undefined') {
    emailjs.init('8dnyGyk_DkscsVTZ5');
  }

  initHeader();
  initMobileMenu();
  initScrollReveal();
  initCounters();
  initResultBars();
  initFAQ();
  initContactForm();
  initActiveNav();
  initSmoothScroll();
  initFooterYear();
  initTechTicker();
  initHeroFloatCards();
  initCardTilt();
  initProgressBar();
  initBackToTop();
});

/* ----------------------------------------------------------------
   1. HEADER — sticky scroll state
---------------------------------------------------------------- */
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  let ticking = false;
  const update = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };

  update();
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { update(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
}

/* ----------------------------------------------------------------
   2. MOBILE MENU — slide panel
---------------------------------------------------------------- */
function initMobileMenu() {
  const toggle   = document.querySelector('[data-menu-toggle]');
  const menu     = document.getElementById('mobile-menu');
  const backdrop = document.querySelector('[data-menu-backdrop]');
  const closeBtn = document.querySelector('[data-menu-close]');
  const navLinks = document.querySelectorAll('[data-nav-link]');
  if (!toggle || !menu) return;

  let isOpen = false;

  const open = () => {
    isOpen = true;
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    backdrop?.classList.add('visible');
    document.body.style.overflow = 'hidden';
    // Stagger links in
    menu.querySelectorAll('.mobile-nav-link').forEach((link, i) => {
      link.style.opacity   = '0';
      link.style.transform = 'translateX(16px)';
      setTimeout(() => {
        link.style.transition = 'opacity 260ms ease, transform 260ms ease';
        link.style.opacity    = '1';
        link.style.transform  = 'translateX(0)';
      }, 60 + i * 40);
    });
  };

  const close = () => {
    isOpen = false;
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    backdrop?.classList.remove('visible');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => isOpen ? close() : open());
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  navLinks.forEach(link => link.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) close(); });
}

/* ----------------------------------------------------------------
   3. SCROLL REVEAL — IntersectionObserver
---------------------------------------------------------------- */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal-up, .reveal-fade');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });

  els.forEach(el => obs.observe(el));
}

/* ----------------------------------------------------------------
   4. ANIMATED COUNTERS
---------------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('.counter[data-target]');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animate = (el) => {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const start    = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(easeOut(progress) * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
}

/* ----------------------------------------------------------------
   5. RESULT BARS — animate height on scroll into view
---------------------------------------------------------------- */
function initResultBars() {
  const bars = document.querySelectorAll('.rbar span');
  if (!bars.length) return;

  bars.forEach(bar => {
    const target = bar.style.getPropertyValue('--h') || '50%';
    bar.style.setProperty('--h', '0%');

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          bar.style.transition = 'height 750ms cubic-bezier(0.34,1.56,0.64,1)';
          bar.style.setProperty('--h', target);
        }, 80);
        obs.disconnect();
      }
    }, { threshold: 0.3 });

    obs.observe(bar);
  });
}

/* ----------------------------------------------------------------
   6. FAQ — accordion behaviour
---------------------------------------------------------------- */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        items.forEach(other => { if (other !== item && other.open) other.open = false; });
      }
    });
  });
}

/* ----------------------------------------------------------------
   7. CONTACT FORM — EmailJS integration
---------------------------------------------------------------- */
function initContactForm() {
  const form   = document.querySelector('[data-contact-form]');
  const status = document.querySelector('[data-form-status]');
  if (!form || !status) return;

  // Real-time email validation
  const emailInput = form.querySelector('[name="email"]');
  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      const valid = isValidEmail(emailInput.value);
      emailInput.style.borderColor = emailInput.value && !valid ? '#dc2626' : '';
      emailInput.style.boxShadow   = emailInput.value && !valid ? '0 0 0 3px rgba(220,38,38,0.1)' : '';
    });
    emailInput.addEventListener('focus', () => {
      emailInput.style.borderColor = '';
      emailInput.style.boxShadow   = '';
    });
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name    = form.querySelector('[name="name"]');
    const email   = form.querySelector('[name="email"]');
    const company = form.querySelector('[name="company"]');
    const service = form.querySelector('[name="service"]');
    const message = form.querySelector('[name="message"]');
    const submitBtn = form.querySelector('.btn-submit');
    const btnText   = submitBtn?.querySelector('.btn-text');

    // Validate required fields
    if (!name?.value.trim() || !email?.value.trim() || !service?.value.trim() || !message?.value.trim()) {
      showStatus(status, '⚠ Please fill in all required fields.', 'error');
      form.style.animation = 'shake 400ms ease';
      setTimeout(() => form.style.animation = '', 420);
      return;
    }
    if (!isValidEmail(email.value)) {
      showStatus(status, '⚠ Please enter a valid email address.', 'error');
      email.focus();
      return;
    }

    // Disable submit button and show loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Sending…';
    }

    try {
      // Send email using EmailJS
      const response = await emailjs.send('service_j7ex91g', 'template_s97paeh', {
        from_name: name.value.trim(),
        from_email: email.value.trim(),
        company: company?.value.trim() || '',
        service: service.value,
        message: message.value.trim(),
        to_email: 'hello@agencyyo.com'
      });

      if (response.status === 200) {
        showStatus(status, '✓ Thank you! Your message has been sent successfully.', 'success');
        if (submitBtn) {
          submitBtn.style.background = 'linear-gradient(135deg,#059669,#047857)';
          setTimeout(() => { submitBtn.style.background = ''; }, 2800);
        }
        form.reset();
      } else {
        throw new Error('Email send failed');
      }
    } catch (error) {
      console.error('EmailJS Error:', error);
      showStatus(status, '✗ Something went wrong. Please email us at hello@agencyyo.com', 'error');
    } finally {
      // Re-enable submit button
      if (submitBtn) {
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Send Message';
      }
    }
  });
}

function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function showStatus(el, msg, type) {
  el.textContent = msg;
  el.className   = `form-status ${type}`;
  setTimeout(() => { el.textContent = ''; el.className = 'form-status'; }, 6000);
}

/* ----------------------------------------------------------------
   8. ACTIVE NAV — highlight link for current section
---------------------------------------------------------------- */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, {
    rootMargin: `-${Math.round(window.innerHeight * 0.38)}px 0px -${Math.round(window.innerHeight * 0.38)}px 0px`,
    threshold: 0
  });

  sections.forEach(s => obs.observe(s));
}

/* ----------------------------------------------------------------
   9. SMOOTH SCROLL — anchor links
---------------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href   = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH - 8, behavior: 'smooth' });
    });
  });
}

/* ----------------------------------------------------------------
   10. FOOTER YEAR
---------------------------------------------------------------- */
function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ----------------------------------------------------------------
   11. TECH TICKER — reduced motion respect
---------------------------------------------------------------- */
function initTechTicker() {
  const inner = document.querySelector('.ticker-track');
  if (!inner) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    inner.style.animation = 'none';
  }
}

/* ----------------------------------------------------------------
   12. HERO FLOAT CARDS — entrance animation
---------------------------------------------------------------- */
function initHeroFloatCards() {
  document.querySelectorAll('.hero-float-card').forEach((card, i) => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(14px) scale(0.96)';
    setTimeout(() => {
      card.style.transition = 'opacity 500ms ease, transform 500ms cubic-bezier(0.34,1.56,0.64,1)';
      card.style.opacity    = '1';
      card.style.transform  = '';
    }, 1000 + i * 180);
  });
}

/* ----------------------------------------------------------------
   13. CARD TILT — subtle 3D tilt on hover (desktop only)
---------------------------------------------------------------- */
function initCardTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window) return;

  const cards = document.querySelectorAll('.project-card, .result-card, .testimonial-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const tiltX = ((e.clientY - cy) / (r.height / 2)) * -3;
      const tiltY = ((e.clientX - cx) / (r.width  / 2)) *  3;
      card.style.transform  = `translateY(-4px) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      card.style.transition = 'transform 80ms linear';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'all 350ms ease';
    });
  });
}

/* ----------------------------------------------------------------
   14. READING PROGRESS BAR
---------------------------------------------------------------- */
function initProgressBar() {
  const bar = document.createElement('div');
  bar.id = 'read-progress';
  bar.setAttribute('aria-hidden', 'true');
  Object.assign(bar.style, {
    position: 'fixed', top: '0', left: '0', height: '2px',
    width: '0%', background: 'linear-gradient(90deg,#4f46e5,#7c3aed)',
    zIndex: '9999', transition: 'width 80ms linear', pointerEvents: 'none',
  });
  document.body.prepend(bar);

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const total   = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = total > 0 ? `${Math.min((window.scrollY / total) * 100, 100).toFixed(1)}%` : '0%';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ----------------------------------------------------------------
   15. BACK-TO-TOP BUTTON
---------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.id        = 'back-to-top';
  btn.type      = 'button';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" width="16" height="16"><path d="M4 10l4-4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  Object.assign(btn.style, {
    position: 'fixed', bottom: '1.5rem', right: '1.5rem',
    width: '44px', height: '44px', borderRadius: '50%',
    background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
    color: '#fff', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: '0', transform: 'translateY(12px) scale(0.9)',
    transition: 'opacity 280ms ease, transform 280ms ease, box-shadow 200ms ease',
    boxShadow: '0 4px 18px rgba(79,70,229,0.38)',
    zIndex: '500', pointerEvents: 'none',
  });

  document.body.appendChild(btn);
  let visible = false;

  const toggle = () => {
    const show = window.scrollY > 500;
    if (show === visible) return;
    visible = show;
    btn.style.opacity       = show ? '1' : '0';
    btn.style.transform     = show ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.9)';
    btn.style.pointerEvents = show ? 'auto' : 'none';
  };

  window.addEventListener('scroll', toggle, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  btn.addEventListener('mouseenter', () => btn.style.boxShadow = '0 8px 28px rgba(79,70,229,0.52)');
  btn.addEventListener('mouseleave', () => btn.style.boxShadow = '0 4px 18px rgba(79,70,229,0.38)');
}

/* ----------------------------------------------------------------
   16. INJECT shake @keyframes
---------------------------------------------------------------- */
(function() {
  if (document.getElementById('ag-animations')) return;
  const s = document.createElement('style');
  s.id = 'ag-animations';
  s.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`;
  document.head.appendChild(s);
})();
