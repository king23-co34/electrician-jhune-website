// LIGHTBOX (Optimized)
export function setupLightbox() {
  const items = document.querySelectorAll('.gallery-item');

  if (!items.length) return;

  // Create lightbox once
  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.innerHTML = `
    <span class="lightbox-close">&times;</span>
    <img class="lightbox-img" src="" alt="">
  `;
  document.body.appendChild(overlay);

  const lb = overlay;
  const lbImg = lb.querySelector('.lightbox-img');
  const closeBtn = lb.querySelector('.lightbox-close');

  // ✅ Preload images (prevents decode lag on click)
  items.forEach(item => {
    const img = item.querySelector('img');
    if (!img) return;

    const preload = new Image();
    preload.src = img.src;
  });

  // ✅ Click handler (non-blocking)
  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (!img) return;

      // Defer heavy work
      requestAnimationFrame(() => {
        lbImg.src = img.src;
        lbImg.alt = img.alt;

        lb.classList.add('active');
        document.body.classList.add('no-scroll');
      });
    });
  });

  // ✅ Close handlers
  function closeLightbox() {
    lb.classList.remove('active');
    document.body.classList.remove('no-scroll');

    // Clear image AFTER animation (prevents flicker)
    setTimeout(() => {
      lbImg.src = '';
    }, 300);
  }

  closeBtn.addEventListener('click', closeLightbox);

  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
  }
