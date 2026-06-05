/* ============================================================
   TRUCK FILL OPTIMISATION — SLIDE DECK ENGINE
   Navigation, Animations, Counter Effects
   ============================================================ */

(function () {
  'use strict';

  // ---------- State ----------
  let currentSlide = 0;
  let totalSlides = 0;
  let isTransitioning = false;
  const TRANSITION_MS = 700;

  // ---------- DOM References ----------
  const slides = document.querySelectorAll('.slide');
  const progressFill = document.querySelector('.progress-fill');
  const dotsContainer = document.querySelector('.nav-dots');
  const prevBtn = document.getElementById('navPrev');
  const nextBtn = document.getElementById('navNext');
  const counterCurrent = document.querySelector('.current-num');
  const counterTotal = document.querySelector('.total-num');

  totalSlides = slides.length;

  // ---------- Initialise ----------
  function init() {
    // Set counter total
    if (counterTotal) counterTotal.textContent = String(totalSlides).padStart(2, '0');

    // Create dots
    buildDots();

    // Show first slide
    goToSlide(0, false);

    // Keyboard
    document.addEventListener('keydown', onKeyDown);

    // Touch swipe
    let touchStartX = 0;
    document.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    document.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) > 50) {
        if (dx < 0) nextSlide();
        else prevSlide();
      }
    }, { passive: true });

    // Nav buttons
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  }

  // ---------- Build Navigation Dots ----------
  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  // ---------- Navigate ----------
  function goToSlide(index, animate = true) {
    if (isTransitioning && animate) return;
    if (index < 0 || index >= totalSlides) return;

    isTransitioning = true;

    const prev = slides[currentSlide];
    const next = slides[index];

    // Determine direction
    const goingForward = index > currentSlide;

    if (animate && prev !== next) {
      // Exit current
      prev.classList.remove('active');
      prev.classList.add(goingForward ? 'exit-left' : '');

      // Prepare next
      next.style.transform = goingForward ? 'translateX(60px)' : 'translateX(-60px)';
      next.style.opacity = '0';
      next.style.visibility = 'visible';

      // Force reflow
      void next.offsetWidth;

      // Animate in
      next.classList.add('active');
      next.style.transform = '';
      next.style.opacity = '';

      setTimeout(() => {
        prev.classList.remove('exit-left');
        prev.style.transform = '';
        isTransitioning = false;
      }, TRANSITION_MS);
    } else {
      // No animation (init)
      slides.forEach(s => {
        s.classList.remove('active', 'exit-left');
        s.style.transform = '';
        s.style.opacity = '';
      });
      next.classList.add('active');
      isTransitioning = false;
    }

    currentSlide = index;
    updateUI();
    triggerSlideAnimations(index);
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  // ---------- Update UI ----------
  function updateUI() {
    // Progress bar
    const pct = ((currentSlide) / (totalSlides - 1)) * 100;
    if (progressFill) progressFill.style.width = pct + '%';

    // Dots
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.nav-dot') : [];
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));

    // Counter
    if (counterCurrent) counterCurrent.textContent = String(currentSlide + 1).padStart(2, '0');

    // Arrow states
    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;
  }

  // ---------- Keyboard ----------
  function onKeyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      prevSlide();
    }
  }

  // ---------- Per-Slide Animations ----------
  const animatedSlides = new Set();

  function triggerSlideAnimations(index) {
    // Only run once per slide visit (fill bars, counters)
    if (animatedSlides.has(index)) return;
    animatedSlides.add(index);

    const slide = slides[index];

    // Animate fill bars
    const fillBars = slide.querySelectorAll('.fill-bar-level[data-fill]');
    fillBars.forEach((bar, i) => {
      setTimeout(() => {
        bar.style.width = bar.getAttribute('data-fill') + '%';
      }, 300 + i * 150);
    });

    // Animate counter numbers
    const counters = slide.querySelectorAll('[data-count-to]');
    counters.forEach((el) => {
      const target = parseFloat(el.getAttribute('data-count-to'));
      const suffix = el.getAttribute('data-count-suffix') || '';
      const prefix = el.getAttribute('data-count-prefix') || '';
      const decimals = el.getAttribute('data-count-decimals') ? parseInt(el.getAttribute('data-count-decimals')) : 0;
      animateCounter(el, 0, target, 1400, prefix, suffix, decimals);
    });

    // Animate SVG ring charts
    const rings = slide.querySelectorAll('.util-ring-fill[data-ring-pct]');
    rings.forEach((ring) => {
      const pct = parseFloat(ring.getAttribute('data-ring-pct'));
      const circumference = 2 * Math.PI * 38; // r=38
      const offset = circumference - (pct / 100) * circumference;
      ring.style.strokeDasharray = circumference;
      ring.style.strokeDashoffset = circumference;
      setTimeout(() => {
        ring.style.strokeDashoffset = offset;
      }, 400);
    });
  }

  // ---------- Counter Animation ----------
  function animateCounter(el, start, end, duration, prefix, suffix, decimals) {
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;

      el.textContent = prefix + current.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ---------- Init on DOM Ready ----------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ---------- Expose for Lucide ----------
  window.slideDeckReady = true;
})();
