/**
 * Electrician Jhune — animations.js
 *
 * Fixes applied:
 * 1. Added IntersectionObserver for .reveal / .reveal-left / .reveal-right
 *    (previously MISSING — causing all section images to stay opacity:0 forever)
 * 2. Fixed lightbox selector: .gallery__item  (was: .gallery-item)
 * 3. Removed broken ES `export` — loaded as plain script, not a module
 */

// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────
(function initReveal() {
  const SELECTOR = '.reveal, .reveal-left, .reveal-right';
  const elements = document.querySelectorAll(SELECTOR);
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
})();


// ─── GALLERY LIGHTBOX ─────────────────────────────────────────────────────────
(function initLightbox() {
  // FIX: was '.gallery-item' — HTML uses '.gallery__item' (BEM double-underscore)
  const items = document.querySelectorAll('.gallery__item');
  if (!items.length) return;

  // Build overlay once
  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image lightbox');
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
    <img class="lightbox-img" src="" alt="">
  `;
  document.body.appendChild(overlay);

  const lbImg   = overlay.querySelector('.lightbox-img');
  const closeBtn = overlay.querySelector('.lightbox-close');

  function openLightbox(img) {
    requestAnimationFrame(() => {
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      overlay.classList.add('active');
      document.body.classList.add('no-scroll');
      closeBtn.focus();
    });
  }

  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  // Preload & bind clicks
  items.forEach((item) => {
    const img = item.querySelector('img');
    if (!img) return;
    // Make item keyboard-accessible
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `View image: ${img.alt}`);

    const preload = new Image();
    preload.src = img.src;

    item.addEventListener('click', () => openLightbox(img));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(img); }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
})();
