/**
 * Animations Manager
 * Handles scroll reveal, counters, parallax, and micro-interactions
 */

class AnimationManager {
  constructor() {
    this.observers = [];
    this.countersTriggered = false;
    this.init();
  }

  init() {
    this.setupScrollReveal();
    this.setupCounters();
    this.setupNavScroll();
    this.setupParallax();
    this.setupHoverEffects();
  }

  // ---- Scroll Reveal via IntersectionObserver ----
  setupScrollReveal() {
    const options = {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, options);

    const selectors = ['.reveal', '.reveal-left', '.reveal-right', '.reveal-scale'];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => revealObserver.observe(el));
    });

    this.observers.push(revealObserver);
  }

  // ---- Animated Number Counters ----
  setupCounters() {
    const counterOptions = { threshold: 0.5 };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          this.animateCounter(entry.target);
        }
      });
    }, counterOptions);

    document.querySelectorAll('[data-counter]').forEach(el => {
      counterObserver.observe(el);
    });

    this.observers.push(counterObserver);
  }

  animateCounter(el) {
    const target = parseInt(el.dataset.counter, 10);
    const duration = 2000;
    const suffix = el.dataset.suffix || '';
    const start = performance.now();

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(easeOut(progress) * target);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }

  // ---- Nav Scroll Behaviour ----
  setupNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          nav.classList.toggle('nav--scrolled', window.scrollY > 60);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Initialise on load
    nav.classList.toggle('nav--scrolled', window.scrollY > 60);
  }

  // ---- Subtle Parallax for Hero ----
  setupParallax() {
    const heroBg = document.querySelector('.hero__bg');
    if (!heroBg) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrollY * 0.35}px)`;
      }
    }, { passive: true });
  }

  // ---- Hover micro-interactions ----
  setupHoverEffects() {
    // Service cards tilt
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
        card.style.transform = `perspective(800px) rotateX(${-y}deg) rotateY(${x}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

    // Button ripple effect
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;

        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${e.clientX - rect.left - size / 2}px;
          top: ${e.clientY - rect.top - size / 2}px;
          background: rgba(255,255,255,0.25);
          border-radius: 50%;
          transform: scale(0);
          animation: rippleAnim 0.6s linear;
          pointer-events: none;
        `;

        if (!document.getElementById('rippleStyle')) {
          const style = document.createElement('style');
          style.id = 'rippleStyle';
          style.textContent = `
            @keyframes rippleAnim {
              to { transform: scale(1); opacity: 0; }
            }
          `;
          document.head.appendChild(style);
        }

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // ---- Gallery Lightbox ----
  setupLightbox() {
    const items = document.querySelectorAll('.gallery__item');
    if (!items.length) return;

    const overlay = document.createElement('div');
    overlay.innerHTML = `
      <div id="lightbox" style="
        position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9998;
        display:flex;align-items:center;justify-content:center;
        opacity:0;transition:opacity 0.3s;padding:1rem;
      ">
        <button id="lb-close" style="
          position:absolute;top:1.5rem;right:1.5rem;
          background:rgba(255,255,255,0.1);border:none;color:#fff;
          font-size:1.5rem;width:3rem;height:3rem;border-radius:50%;
          cursor:pointer;display:flex;align-items:center;justify-content:center;
        ">✕</button>
        <img id="lb-img" src="" alt="" style="
          max-width:90vw;max-height:85vh;object-fit:contain;
          border-radius:8px;box-shadow:0 25px 60px rgba(0,0,0,0.5);
        ">
      </div>`;

    document.body.appendChild(overlay);

    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lb-img');

    items.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lb.style.display = 'flex';
        requestAnimationFrame(() => { lb.style.opacity = '1'; });
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLb = () => {
      lb.style.opacity = '0';
      setTimeout(() => { lb.style.display = 'none'; }, 300);
      document.body.style.overflow = '';
    };

    document.getElementById('lb-close').addEventListener('click', closeLb);
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });
  }

  destroy() {
    this.observers.forEach(obs => obs.disconnect());
  }
}

// Expose globally
const animations = new AnimationManager();
// Lightbox initialised after DOM ready
document.addEventListener('DOMContentLoaded', () => animations.setupLightbox());