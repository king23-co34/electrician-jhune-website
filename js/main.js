/**
 * Electrician Jhune — main.js
 *
 * Fixes applied:
 * 1. Mobile menu: selector was '.mobile-menu' → fixed to '.nav__mobile'
 * 2. toggleMobileMenu() was defined but NEVER bound to any click listener
 * 3. Nav scrolled class (nav--scrolled) was never applied → transparent nav on scroll
 * 4. Counter animation now wired up
 * 5. Sticky CTA bar visibility
 */

document.addEventListener('DOMContentLoaded', () => {

  // ─── MOBILE MENU ────────────────────────────────────────────────────────────
  const menuBtn    = document.getElementById('menu-btn');
  // FIX: was '.mobile-menu' — HTML has class 'nav__mobile'
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      menuBtn.classList.toggle('active', isOpen);
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a nav link is clicked
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!menuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }


  // ─── NAV SCROLL BEHAVIOR ────────────────────────────────────────────────────
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }


  // ─── ACTIVE NAV LINK ────────────────────────────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a, .nav__mobile a');

  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => {
              link.classList.toggle(
                'active',
                link.getAttribute('href') === `#${entry.target.id}`
              );
            });
          }
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach((s) => sectionObserver.observe(s));
  }


  // ─── HERO COUNTER ANIMATION ─────────────────────────────────────────────────
  const counters = document.querySelectorAll('[data-counter]');

  if (counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el     = entry.target;
          const target = parseInt(el.dataset.counter, 10);
          const suffix = el.dataset.suffix || '';
          const duration = 1400;
          const start  = performance.now();

          const tick = (now) => {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out quad
            const eased = 1 - (1 - progress) * (1 - progress);
            el.textContent = Math.floor(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => counterObserver.observe(c));
  }


  // ─── STICKY CTA BAR (mobile) ────────────────────────────────────────────────
  const stickyCta = document.getElementById('sticky-cta');

  if (stickyCta) {
    const onScroll = () => {
      const show = window.scrollY > 400;
      stickyCta.classList.toggle('visible', show);
      document.documentElement.classList.toggle('sticky-active', show);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  // ─── FOOTER YEAR ────────────────────────────────────────────────────────────
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
