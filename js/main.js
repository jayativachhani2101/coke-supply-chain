/**
 * Coca-Cola Main Application Interactions
 * Wires up sticky navigation, count-up statistics, carbonation background engines, and page scroll listeners.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 1. Initialize Bubble Background Engine
  initBubbleBackground();

  // 2. Initialize Mini Hero Visual Canvas
  initHeroVisualCanvas();

  // 3. Initialize Custom Leaflet Map Hub
  if (typeof initGlobalMap === 'function') {
    initGlobalMap();
  }

  // 4. Initialize Interactive Supply Chain Player
  let simulatorInstance;
  if (typeof SupplyChainSimulator === 'function') {
    simulatorInstance = new SupplyChainSimulator('supplyChainCanvas');
  }

  // 5. Scroll Interaction Listeners
  initScrollListeners();

  // 6. Stats Count-Up Animation triggers
  initStatsCounters();

  // 7. Responsive Mobile Menu
  initMobileMenu();
});

/**
 * Generates floating background bubble physics
 */
function initBubbleBackground() {
  const container = document.getElementById('bubbleBg');
  if (!container) return;

  const bubbleCount = 45;
  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    
    // Vary size, positioning, animation duration, and delay for natural feel
    const size = Math.random() * 25 + 6;
    const duration = Math.random() * 10 + 10;
    const delay = Math.random() * -15; // Start mid-way for instant layout fill
    const left = Math.random() * 100;
    
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${left}%`;
    bubble.style.animationDuration = `${duration}s`;
    bubble.style.animationDelay = `${delay}s`;
    
    container.appendChild(bubble);
  }
}

/**
 * Renders a gorgeous mini visual inside the hero section representing a floating soda can structure
 */
function initHeroVisualCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }
  
  window.addEventListener('resize', resize);
  resize();

  // Load real Coca-Cola can image
  const canImg = new Image();
  canImg.src = 'assets/coca_cola_can.png';
  let canImgLoaded = false;
  canImg.onload = () => {
    canImgLoaded = true;
  };

  // Floating can parameters
  let angle = 0;
  let bubbles = [];

  // Generate initial bubbles inside hero visual
  for (let i = 0; i < 20; i++) {
    bubbles.push({
      x: Math.random() * width,
      y: Math.random() * height + height,
      r: Math.random() * 4 + 1.5,
      speedY: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.3
    });
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw glowing background grid
    ctx.strokeStyle = 'rgba(244, 0, 9, 0.03)';
    ctx.lineWidth = 1;
    const spacing = 15;
    for (let x = 0; x < width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Draw rising soda bubbles
    bubbles.forEach(b => {
      ctx.fillStyle = `rgba(244, 0, 9, ${b.alpha})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();

      // Physics
      b.y -= b.speedY;
      b.x += Math.sin(b.y * 0.05) * 0.25;

      // Loop bounds
      if (b.y < -10) {
        b.y = height + 10;
        b.x = Math.random() * width;
      }
    });

    // 3. Draw a floating high-fidelity photorealistic Coca-Cola Can
    angle += 0.015;
    const floatOffset = Math.sin(angle) * 15;
    const cx = width * 0.5;
    const cy = height * 0.45 + floatOffset;

    if (canImgLoaded) {
      // Outer can glow
      ctx.shadowBlur = 40;
      ctx.shadowColor = 'rgba(244, 0, 9, 0.35)';
      
      const canWidth = 150;
      const canHeight = 220;
      const rx = cx - canWidth / 2;
      const ry = cy - canHeight / 2;

      // Draw the premium coke can image
      ctx.drawImage(canImg, rx, ry, canWidth, canHeight);
      ctx.shadowBlur = 0; // Reset shadow
    } else {
      // Elegant fallback cylinder while image loads
      const canWidth = 100;
      const canHeight = 170;
      const rx = cx - canWidth / 2;
      const ry = cy - canHeight / 2;

      ctx.fillStyle = 'var(--coke-red)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(rx, ry, canWidth, canHeight, 12) : ctx.rect(rx, ry, canWidth, canHeight);
      ctx.fill();
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

/**
 * Initializes navbar sticky transitions and page scroll viewport highlighting
 */
function initScrollListeners() {
  const header = document.querySelector('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    // Sticky navbar toggle class
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Highlight navigation links dynamically based on scroll location
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -40% 0px', // Trigger when section fills majority of center screen
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });
}

/**
 * Counts statistics numbers smoothly when they roll into view
 */
function initStatsCounters() {
  const statNumbers = document.querySelectorAll('.stat-count');
  
  const countUp = (element) => {
    const target = parseFloat(element.getAttribute('data-target'));
    const isFloat = element.getAttribute('data-float') === 'true';
    const suffix = element.getAttribute('data-suffix') || '';
    const duration = 2000; // 2 seconds
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const rate = Math.min(progress / duration, 1);
      
      // Smooth Easing out function
      const easeOutQuad = (t) => t * (2 - t);
      const easedRate = easeOutQuad(rate);
      
      const current = easedRate * target;
      
      if (isFloat) {
        element.innerText = current.toFixed(1) + suffix;
      } else {
        element.innerText = Math.floor(current).toLocaleString() + suffix;
      }

      if (rate < 1) {
        requestAnimationFrame(animate);
      } else {
        if (isFloat) {
          element.innerText = target.toFixed(1) + suffix;
        } else {
          element.innerText = target.toLocaleString() + suffix;
        }
      }
    };

    requestAnimationFrame(animate);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        obs.unobserve(entry.target); // Trigger count up only once
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(num => observer.observe(num));
}

/**
 * Mobile Hamburger Menu toggling
 */
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const links = document.querySelectorAll('.nav-link');

  if (!toggle || !menu) return;

  const toggleMenu = () => {
    toggle.classList.toggle('open');
    menu.classList.toggle('open');
  };

  toggle.addEventListener('click', toggleMenu);

  links.forEach(link => {
    link.addEventListener('click', () => {
      if (menu.classList.contains('open')) {
        toggleMenu();
      }
    });
  });
}
