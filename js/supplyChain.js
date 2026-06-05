/**
 * Coca-Cola Supply Chain Canvas Simulation
 * Acts as the interactive "Animated Video" player showcasing the supply chain stages.
 */
class SupplyChainSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Playback state
    this.isPlaying = false;
    this.progress = 0; // 0 to 100%
    this.activeStageIndex = 0;
    this.playbackSpeed = 0.05; // speed of progress advance per frame
    this.durationSeconds = 100; // imaginary duration
    
    // Node dimensions & layout
    this.nodes = [];
    this.particles = [];
    this.bubbles = [];
    this.truckX = 0;
    this.bottleFillLevel = 0;
    this.recycleRotation = 0;
    this.liquidFlowOffset = 0;
    
    // UI elements
    this.playBtn = document.getElementById('videoPlayBtn');
    this.centerPlayBtn = document.getElementById('centerPlayBtn');
    this.videoHud = document.getElementById('videoHud');
    this.progressBar = document.getElementById('progressBar');
    this.timeLabel = document.getElementById('timeLabel');
    this.volumeBtn = document.getElementById('volumeBtn');
    
    // Audio synthesizer (for interactive click/pop feedback)
    this.audioContext = null;
    this.isMuted = true;

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Create stage nodes geographically
    this.setupNodes();
    
    // Bind Event Listeners
    this.bindEvents();
    
    // Initialize particles and bubbles
    this.createBackgroundParticles();
    
    // Start Animation Loop
    this.animate();
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.width = rect.width;
    this.height = rect.height;
    this.setupNodes(); // Recalculate node spacing
  }

  setupNodes() {
    const count = COKE_DATA.supplyChainSteps.length;
    const padding = 60;
    const spacing = (this.width - padding * 2) / (count - 1);
    
    this.nodes = COKE_DATA.supplyChainSteps.map((step, idx) => {
      return {
        stepNumber: step.step,
        title: step.title,
        icon: step.icon,
        x: padding + spacing * idx,
        y: this.height * 0.55,
        radius: 28,
        glow: 0
      };
    });
  }

  bindEvents() {
    // Play/Pause button
    this.playBtn.addEventListener('click', () => this.togglePlay());
    if (this.centerPlayBtn) {
      this.centerPlayBtn.addEventListener('click', () => {
        this.togglePlay();
      });
    }

    // Canvas click to trigger node highlights
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Check click on nodes
      this.nodes.forEach((node, idx) => {
        const dist = Math.hypot(mouseX - node.x, mouseY - node.y);
        if (dist <= node.radius) {
          this.seekToStage(idx);
          this.triggerSound('nodeClick');
        }
      });
    });

    // Scrubber interaction
    this.progressBar.addEventListener('input', (e) => {
      this.progress = parseFloat(e.target.value);
      this.updateActiveStageByProgress();
      this.updateUI();
    });

    // Volume button
    this.volumeBtn.addEventListener('click', () => this.toggleMute());
    
    // Double click screen toggle play
    this.canvas.addEventListener('dblclick', () => this.togglePlay());

    // Step cards trigger sync
    document.querySelectorAll('.step-card').forEach((card, idx) => {
      card.addEventListener('click', () => {
        this.seekToStage(idx);
        this.triggerSound('nodeClick');
      });
    });
  }

  initAudio() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  toggleMute() {
    this.initAudio();
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.volumeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
    } else {
      this.volumeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`;
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    }
  }

  triggerSound(type) {
    if (this.isMuted || !this.audioContext) return;
    
    try {
      const osc = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      osc.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      if (type === 'nodeClick') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
        osc.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
      } else if (type === 'bubblePop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.04, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.08);
      }
    } catch (e) {
      console.log("Audio play error", e);
    }
  }

  togglePlay() {
    this.initAudio();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    this.isPlaying = !this.isPlaying;
    this.updateUI();
    
    if (this.isPlaying) {
      this.videoHud.classList.add('hidden');
    } else {
      this.videoHud.classList.remove('hidden');
    }
  }

  seekToStage(stageIndex) {
    this.activeStageIndex = stageIndex;
    this.progress = stageIndex * 20 + 5; // seek to beginning area of that stage
    this.updateUI();
    this.syncSidebarWithStage(stageIndex);
  }

  updateActiveStageByProgress() {
    const computedStage = Math.min(4, Math.floor(this.progress / 20));
    if (computedStage !== this.activeStageIndex) {
      this.activeStageIndex = computedStage;
      this.syncSidebarWithStage(computedStage);
    }
  }

  syncSidebarWithStage(stageIndex) {
    const stepCards = document.querySelectorAll('.step-card');
    const scrollContainer = document.querySelector('.steps-scroll-container');
    const videoInterface = document.querySelector('.video-interface');

    stepCards.forEach((card, idx) => {
      if (idx === stageIndex) {
        card.classList.add('active');
        // Auto-scroll active card into view within the scrollable panel
        if (scrollContainer) {
          const cardTop = card.offsetTop - scrollContainer.offsetTop;
          scrollContainer.scrollTo({
            top: cardTop - 8,
            behavior: 'smooth'
          });
        }
      } else {
        card.classList.remove('active');
      }
    });

    // Toggle red glow border on the video interface during active stages
    if (videoInterface) {
      videoInterface.classList.add('stage-active');
      clearTimeout(this._glowTimeout);
      this._glowTimeout = setTimeout(() => {
        videoInterface.classList.remove('stage-active');
      }, 2000);
    }
  }

  updateUI() {
    // Update Slider
    this.progressBar.value = this.progress;
    
    // Update Time Label
    const totalSeconds = this.durationSeconds;
    const currentSeconds = Math.round((this.progress / 100) * totalSeconds);
    const formatTime = (sec) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    this.timeLabel.innerText = `${formatTime(currentSeconds)} / ${formatTime(totalSeconds)}`;

    // Update Play Buttons SVGs
    const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
    const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    
    if (this.isPlaying) {
      this.playBtn.innerHTML = pauseIcon;
      if (this.centerPlayBtn) this.centerPlayBtn.style.display = 'none';
    } else {
      this.playBtn.innerHTML = playIcon;
      if (this.centerPlayBtn) {
        this.centerPlayBtn.style.display = 'flex';
        this.centerPlayBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>`;
      }
    }
  }

  createBackgroundParticles() {
    this.particles = [];
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        r: Math.random() * 2 + 1,
        speedX: Math.random() * 0.4 - 0.2,
        speedY: -Math.random() * 0.5 - 0.2,
        alpha: Math.random() * 0.5 + 0.2
      });
    }
    
    // Create dedicated liquid carbonation bubbles
    this.bubbles = [];
    for (let i = 0; i < 20; i++) {
      this.bubbles.push({
        x: Math.random() * this.width,
        y: this.height + 20,
        r: Math.random() * 5 + 2,
        speedY: Math.random() * 1.5 + 0.8,
        wiggle: Math.random() * 0.05,
        wiggleFreq: Math.random() * 0.05,
        cokeFluid: Math.random() > 0.4
      });
    }
  }

  animate() {
    // Increment frame progress if playing
    if (this.isPlaying) {
      this.progress += this.playbackSpeed;
      if (this.progress >= 100) {
        this.progress = 0;
        this.isPlaying = false;
        this.videoHud.classList.remove('hidden');
      }
      this.updateActiveStageByProgress();
      this.updateUI();
    }

    // Clear Canvas
    this.ctx.fillStyle = '#090a0d';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw grid mesh backdrop
    this.drawGrid();

    // Draw Flow Pipes (Liquid transport lines connecting stages)
    this.drawPipes();

    // Draw Particles moving in pipes
    this.drawPipeFlowParticles();

    // Draw active stage glowing zones
    this.drawStageFocusGlow();

    // Draw detailed animations inside active stage
    this.drawActiveStageVisuals();

    // Draw Nodes
    this.drawNodes();

    // Draw floating aesthetic background particles
    this.drawBackgroundParticles();

    // Request next frame
    requestAnimationFrame(() => this.animate());
  }

  drawGrid() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    this.ctx.lineWidth = 1;
    const size = 30;
    
    for (let x = 0; x < this.width; x += size) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    
    for (let y = 0; y < this.height; y += size) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  drawPipes() {
    this.liquidFlowOffset += 0.5;
    this.ctx.lineWidth = 6;
    
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const n1 = this.nodes[i];
      const n2 = this.nodes[i + 1];
      
      // Draw pipeline path
      this.ctx.beginPath();
      this.ctx.moveTo(n1.x, n1.y);
      
      // Control points for organic curving pipe
      const midX = (n1.x + n2.x) / 2;
      this.ctx.bezierCurveTo(midX, n1.y - 25, midX, n2.y + 25, n2.x, n2.y);
      
      // Dynamic pipe coloring (lit up if liquid is flowing through it)
      const isActivePipe = this.progress > (i * 20) + 10;
      this.ctx.strokeStyle = isActivePipe 
        ? 'rgba(244, 0, 9, 0.6)' 
        : 'rgba(255, 255, 255, 0.05)';
      this.ctx.stroke();
      
      // Inner fluid line
      if (isActivePipe) {
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.stroke();
        this.ctx.lineWidth = 6;
      }
    }
  }

  drawPipeFlowParticles() {
    if (!this.isPlaying) return;
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const n1 = this.nodes[i];
      const n2 = this.nodes[i + 1];
      const activeStageProgressRange = this.progress - (i * 20);
      
      if (activeStageProgressRange > 0 && activeStageProgressRange < 25) {
        // Compute position on bezier curve
        const t = (activeStageProgressRange % 20) / 20;
        const midX = (n1.x + n2.x) / 2;
        
        // Bezier formula
        const cx1 = midX;
        const cy1 = n1.y - 25;
        const cx2 = midX;
        const cy2 = n2.y + 25;
        
        const x = Math.pow(1-t, 3)*n1.x + 3*Math.pow(1-t, 2)*t*cx1 + 3*(1-t)*Math.pow(t, 2)*cx2 + Math.pow(t, 3)*n2.x;
        const y = Math.pow(1-t, 3)*n1.y + 3*Math.pow(1-t, 2)*t*cy1 + 3*(1-t)*Math.pow(t, 2)*cy2 + Math.pow(t, 3)*n2.y;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, 4, 0, Math.PI * 2);
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#fff';
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }
    }
  }

  drawStageFocusGlow() {
    const activeNode = this.nodes[this.activeStageIndex];
    if (!activeNode) return;
    
    // Pulsing spotlight on the current stage
    const gradient = this.ctx.createRadialGradient(
      activeNode.x, activeNode.y - 50, 10,
      activeNode.x, activeNode.y - 50, 180
    );
    gradient.addColorStop(0, 'rgba(244, 0, 9, 0.08)');
    gradient.addColorStop(1, 'rgba(7, 7, 8, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(activeNode.x, activeNode.y - 50, 180, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawNodes() {
    this.nodes.forEach((node, idx) => {
      const isActive = idx === this.activeStageIndex;
      
      // Node halo glow
      if (isActive) {
        node.glow += (1 - node.glow) * 0.1;
      } else {
        node.glow += (0 - node.glow) * 0.1;
      }

      if (node.glow > 0.01) {
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.radius + 6 * node.glow, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(244, 0, 9, ${0.4 * node.glow})`;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }

      // Main Outer Ring
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = isActive ? 'var(--coke-red)' : '#191c22';
      this.ctx.strokeStyle = isActive ? '#fff' : 'rgba(255, 255, 255, 0.1)';
      this.ctx.lineWidth = isActive ? 3 : 2;
      this.ctx.shadowBlur = isActive ? 15 : 0;
      this.ctx.shadowColor = 'var(--coke-red)';
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.shadowBlur = 0; // Reset shadow

      // Draw stage number text
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 15px var(--font-heading)';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(node.stepNumber.toString(), node.x, node.y);

      // Draw node mini-label underneath
      this.ctx.font = '500 11px var(--font-body)';
      this.ctx.fillStyle = isActive ? '#fff' : 'var(--text-secondary)';
      this.ctx.fillText(node.title, node.x, node.y + 42);
    });
  }

  drawActiveStageVisuals() {
    const x = this.width * 0.5;
    const y = this.height * 0.25;

    // Draw container boundary for current animation
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(x - 180, y - 60, 360, 110);
    this.ctx.clip();

    switch (this.activeStageIndex) {
      case 0:
        this.drawStage1Animation(x, y);
        break;
      case 1:
        this.drawStage2Animation(x, y);
        break;
      case 2:
        this.drawStage3Animation(x, y);
        break;
      case 3:
        this.drawStage4Animation(x, y);
        break;
      case 4:
        this.drawStage5Animation(x, y);
        break;
    }
    
    this.ctx.restore();
  }

  // Node 1: Raw Materials Sourcing (🌿)
  drawStage1Animation(x, y) {
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';

    // Draw raw material canisters (Cans / Glass structures)
    // Left canister (Aluminum outline)
    this.ctx.beginPath();
    this.ctx.roundRect ? this.ctx.roundRect(x - 60, y - 15, 25, 45, 4) : this.ctx.rect(x - 60, y - 15, 25, 45);
    this.ctx.stroke();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.fill();

    // Right canister (Water container outline)
    this.ctx.beginPath();
    this.ctx.roundRect ? this.ctx.roundRect(x - 25, y - 25, 30, 55, 8) : this.ctx.rect(x - 25, y - 25, 30, 55);
    this.ctx.stroke();
    this.ctx.fillStyle = 'rgba(76, 201, 240, 0.05)';
    this.ctx.fill();

    // Purified water level wave inside container
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.roundRect ? this.ctx.roundRect(x - 25, y - 25, 30, 55, 8) : this.ctx.rect(x - 25, y - 25, 30, 55);
    this.ctx.clip();
    
    this.ctx.beginPath();
    const waveOffset = Date.now() * 0.005;
    const waveHeight = Math.sin(waveOffset) * 2;
    this.ctx.moveTo(x - 25, y + 10 + waveHeight);
    this.ctx.quadraticCurveTo(x - 10, y + 10 - waveHeight, x + 5, y + 10 + waveHeight);
    this.ctx.lineTo(x + 5, y + 35);
    this.ctx.lineTo(x - 25, y + 35);
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgba(76, 201, 240, 0.35)'; // Cyan water
    this.ctx.fill();
    this.ctx.restore();

    // Floating natural ingredients: leaves (green) and sugar crystals (yellow/white)
    if (Math.random() < 0.12) {
      const isLeaf = Math.random() > 0.5;
      this.particles.push({
        x: x - 80 + Math.random() * 40,
        y: y - 40,
        r: isLeaf ? (Math.random() * 3 + 2) : (Math.random() * 2 + 1),
        speedY: Math.random() * 1 + 0.8,
        speedX: Math.random() * 0.4 - 0.2,
        isLeaf: isLeaf,
        isSugar: !isLeaf
      });
    }

    this.particles.forEach((p) => {
      if ((p.isLeaf || p.isSugar) && p.y < y + 30) {
        this.ctx.beginPath();
        if (p.isLeaf) {
          // Draw leaf shape
          this.ctx.fillStyle = '#72EFDD'; // Mint green leaf
          this.ctx.arc(p.x, p.y, p.r, 0, Math.PI, true);
          this.ctx.lineTo(p.x + p.r, p.y);
          this.ctx.fill();
        } else {
          // Draw sugar crystal (hexagon)
          this.ctx.fillStyle = 'rgba(255, 255, 200, 0.8)'; // Sweetener yellow
          this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          this.ctx.fill();
        }
        p.y += p.speedY;
        p.x += p.speedX;
      }
    });

    // Descriptive labels
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '600 12px var(--font-heading)';
    this.ctx.textAlign = 'left';
    this.ctx.fillText("GLOBAL RAW INGREDIENTS SOURCING", x + 20, y - 12);
    this.ctx.font = '400 10px var(--font-body)';
    this.ctx.fillStyle = 'var(--text-secondary)';
    this.ctx.fillText("Purified water (local) & sweeteners (global)", x + 20, y + 6);
    this.ctx.fillText("Sustainable PET, glass, and aluminum mining", x + 20, y + 22);
  }

  // Node 2: Manufacturing & Concentrate Production (🏭)
  drawStage2Animation(x, y) {
    // Draw mixing flasks & formula bubbles
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 2;
    
    // Flask outline shape
    this.ctx.beginPath();
    this.ctx.moveTo(x - 15, y - 40);
    this.ctx.lineTo(x + 15, y - 40);
    this.ctx.lineTo(x + 10, y - 20);
    this.ctx.lineTo(x + 35, y + 30);
    this.ctx.arc(x, y + 35, 40, 0.1, Math.PI - 0.1);
    this.ctx.lineTo(x - 35, y + 30);
    this.ctx.lineTo(x - 10, y - 20);
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    this.ctx.fill();
    this.ctx.stroke();

    // Boiling Concentrate level inside flask
    this.ctx.beginPath();
    const waveOffset = Date.now() * 0.003;
    const waveHeight = Math.sin(waveOffset) * 3;
    
    this.ctx.moveTo(x - 32, y + 15);
    this.ctx.quadraticCurveTo(x, y + 15 + waveHeight, x + 32, y + 15);
    this.ctx.lineTo(x + 35, y + 35);
    this.ctx.arc(x, y + 35, 40, 0.1, Math.PI - 0.1);
    this.ctx.lineTo(x - 35, y + 35);
    this.ctx.closePath();
    
    // Intense dark red secret formula concentrate
    const liquidGrad = this.ctx.createLinearGradient(x, y - 10, x, y + 40);
    liquidGrad.addColorStop(0, '#A30006');
    liquidGrad.addColorStop(1, '#530003');
    this.ctx.fillStyle = liquidGrad;
    this.ctx.fill();

    // Flask rising recipe particles
    if (Math.random() < 0.15) {
      this.bubbles.push({
        x: x + (Math.random() * 40 - 20),
        y: y + 35,
        r: Math.random() * 3 + 1,
        speedY: Math.random() * 1 + 0.5,
        cokeFluid: true
      });
      this.triggerSound('bubblePop');
    }

    this.bubbles.forEach((b, index) => {
      if (b.x > x - 30 && b.x < x + 30 && b.y > y - 40 && b.y < y + 40) {
        this.ctx.beginPath();
        this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
        this.ctx.fill();
        b.y -= b.speedY;
        
        // Wiggle
        b.x += Math.sin(b.y * 0.2) * 0.4;
      }
    });

    // Text details
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '600 12px var(--font-heading)';
    this.ctx.textAlign = 'left';
    this.ctx.fillText("SECRET MERCHANDISE 7X FORMULA", x + 55, y - 12);
    this.ctx.font = '400 10px var(--font-body)';
    this.ctx.fillStyle = 'var(--text-secondary)';
    this.ctx.fillText("High-density concentrate export plants", x + 55, y + 6);
    this.ctx.fillText("Saves logistics carbon vs finished weight", x + 55, y + 22);
  }

  // Node 3: High-speed Packaging & Carbonation
  drawStage3Animation(x, y) {
    // Monobloc filling carousel: Draw bottles moving along a track
    this.bottleFillLevel += this.isPlaying ? 0.4 : 0.1;
    if (this.bottleFillLevel > 30) this.bottleFillLevel = 0;
    
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.fillStyle = 'rgba(255,255,255,0.03)';
    
    // Draw 3 bottles
    const spacing = 45;
    for (let i = -1; i <= 1; i++) {
      const bx = x + i * spacing - 15;
      const by = y + 10;
      
      // Draw bottle outline
      this.ctx.beginPath();
      this.ctx.moveTo(bx - 8, by + 25);
      this.ctx.lineTo(bx - 8, by - 5);
      this.ctx.lineTo(bx - 4, by - 12);
      this.ctx.lineTo(bx - 4, by - 22);
      this.ctx.lineTo(bx + 4, by - 22);
      this.ctx.lineTo(bx + 4, by - 12);
      this.ctx.lineTo(bx + 8, by - 5);
      this.ctx.lineTo(bx + 8, by + 25);
      this.ctx.closePath();
      this.ctx.stroke();
      
      // Bottle cap (glow red)
      this.ctx.fillStyle = 'var(--coke-red)';
      this.ctx.fillRect(bx - 5, by - 25, 10, 4);

      // Fill simulation for middle bottle
      if (i === 0) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(bx - 8, by + 25);
        this.ctx.lineTo(bx - 8, by - 5);
        this.ctx.lineTo(bx - 4, by - 12);
        this.ctx.lineTo(bx - 4, by - 22);
        this.ctx.lineTo(bx + 4, by - 22);
        this.ctx.lineTo(bx + 4, by - 12);
        this.ctx.lineTo(bx + 8, by - 5);
        this.ctx.lineTo(bx + 8, by + 25);
        this.ctx.closePath();
        this.ctx.clip();
        
        // Fill dynamic amount
        const fillHeight = (this.bottleFillLevel / 30) * 45;
        this.ctx.fillStyle = '#9c0006';
        this.ctx.fillRect(bx - 9, by + 26 - fillHeight, 18, fillHeight);
        
        // Fizzing bubbles in filling bottle
        this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
        for (let b = 0; b < 4; b++) {
          this.ctx.beginPath();
          this.ctx.arc(
            bx - 5 + Math.random() * 10,
            by + 20 - Math.random() * fillHeight,
            1, 0, Math.PI * 2
          );
          this.ctx.fill();
        }
        
        this.ctx.restore();

        // Dispensing nozzle above middle bottle
        this.ctx.fillStyle = '#888';
        this.ctx.fillRect(bx - 3, by - 35, 6, 8);
        this.ctx.fillStyle = '#ff3b30';
        this.ctx.fillRect(bx - 1, by - 27, 2, 6); // pour stream
      } else {
        // Pre-filled soda inside other bottles
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(bx - 8, by + 25);
        this.ctx.lineTo(bx - 8, by - 5);
        this.ctx.lineTo(bx - 4, by - 12);
        this.ctx.lineTo(bx + 4, by - 12);
        this.ctx.lineTo(bx + 8, by - 5);
        this.ctx.lineTo(bx + 8, by + 25);
        this.ctx.closePath();
        this.ctx.clip();
        
        this.ctx.fillStyle = '#9c0006';
        this.ctx.fillRect(bx - 9, by - 8, 18, 35);
        this.ctx.restore();
      }
    }

    // Text stats
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '600 12px var(--font-heading)';
    this.ctx.textAlign = 'left';
    this.ctx.fillText("HIGH-SPEED FILLING CAROUSEL", x + 55, y - 10);
    this.ctx.font = '400 10px var(--font-body)';
    this.ctx.fillStyle = 'var(--text-secondary)';
    this.ctx.fillText("Capping speed: 1,600 cans/min", x + 55, y + 8);
    this.ctx.fillText("Co2 carbonation pressure locked", x + 55, y + 24);
  }

  // Node 4: Logistics & Smart Driving Truck
  drawStage4Animation(x, y) {
    // Dotted dynamic highway path
    this.truckX += this.isPlaying ? 1.2 : 0.4;
    if (this.truckX > 160) this.truckX = -120;
    
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.beginPath();
    this.ctx.moveTo(x - 150, y + 30);
    this.ctx.lineTo(x + 40, y + 30);
    this.ctx.stroke();

    // Dotted lane dividers
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(x - 150, y + 30);
    this.ctx.lineTo(x + 40, y + 30);
    this.ctx.stroke();
    this.ctx.setLineDash([]); // Reset dash

    // Draw Coca-Cola Logistics Truck
    const tx = x - 70 + this.truckX;
    const ty = y - 5;
    
    // Truck body (Coke Red trailer)
    this.ctx.fillStyle = 'var(--coke-red)';
    this.ctx.fillRect(tx, ty, 50, 22);
    
    // White wavy design detail on Coke truck (the iconic dynamic ribbon)
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(tx + 5, ty + 15);
    this.ctx.bezierCurveTo(tx + 18, ty + 18, tx + 32, ty + 8, tx + 45, ty + 12);
    this.ctx.stroke();

    // Cabin
    this.ctx.fillStyle = '#dcdcdc';
    this.ctx.beginPath();
    this.ctx.moveTo(tx + 50, ty + 4);
    this.ctx.lineTo(tx + 62, ty + 4);
    this.ctx.lineTo(tx + 66, ty + 12);
    this.ctx.lineTo(tx + 66, ty + 22);
    this.ctx.lineTo(tx + 50, ty + 22);
    this.ctx.closePath();
    this.ctx.fill();

    // Cabin glass window
    this.ctx.fillStyle = '#222';
    this.ctx.fillRect(tx + 55, ty + 6, 8, 7);

    // Wheels (spinning effect)
    this.ctx.fillStyle = '#000';
    const wheelRot = (Date.now() * 0.05) % (Math.PI * 2);
    const drawWheel = (wx, wy) => {
      this.ctx.beginPath();
      this.ctx.arc(wx, wy, 5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#444';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
      
      // Wheel rim dynamic tick
      this.ctx.beginPath();
      this.ctx.moveTo(wx, wy);
      this.ctx.lineTo(wx + Math.cos(wheelRot) * 4, wy + Math.sin(wheelRot) * 4);
      this.ctx.strokeStyle = '#999';
      this.ctx.stroke();
    };

    drawWheel(tx + 10, ty + 23);
    drawWheel(tx + 22, ty + 23);
    drawWheel(tx + 58, ty + 23);

    // Description text
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '600 12px var(--font-heading)';
    this.ctx.textAlign = 'left';
    this.ctx.fillText("SMART ROUTE GPS LOGISTICS", x + 50, y - 10);
    this.ctx.font = '400 10px var(--font-body)';
    this.ctx.fillStyle = 'var(--text-secondary)';
    this.ctx.fillText("EV & eco-diesel dynamic fleet", x + 50, y + 8);
    this.ctx.fillText("Real-time telemetry shelf sync", x + 50, y + 24);
  }

  // Node 5: Consumer Recyclability & Circular Economy
  drawStage5Animation(x, y) {
    this.recycleRotation += this.isPlaying ? 0.015 : 0.005;
    
    // Draw rotating recycling arrows
    this.ctx.save();
    this.ctx.translate(x - 5, y + 8);
    this.ctx.rotate(this.recycleRotation);
    
    this.ctx.strokeStyle = '#72EFDD';
    this.ctx.lineWidth = 3;
    
    // Draw 3-point circular arrows
    for (let r = 0; r < 3; r++) {
      this.ctx.rotate((Math.PI * 2) / 3);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 25, 0, Math.PI * 0.45);
      this.ctx.stroke();
      
      // Arrowhead
      this.ctx.save();
      this.ctx.translate(25, 3);
      this.ctx.rotate(-Math.PI * 0.35);
      this.ctx.beginPath();
      this.ctx.moveTo(-5, 0);
      this.ctx.lineTo(0, -6);
      this.ctx.lineTo(5, 0);
      this.ctx.fillStyle = '#72EFDD';
      this.ctx.fill();
      this.ctx.restore();
    }
    
    this.ctx.restore();

    // Draw a small soda bottle inside the recycling loop
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    const bx = x - 5;
    const by = y + 8;
    this.ctx.rect(bx - 3, by - 12, 6, 24);
    this.ctx.stroke();
    
    this.ctx.fillStyle = 'rgba(114, 239, 221, 0.2)';
    this.ctx.fillRect(bx - 2, by - 11, 4, 22);

    // Dynamic green leaf floating particles
    if (Math.random() < 0.1) {
      this.particles.push({
        x: x - 40 + Math.random() * 70,
        y: y + 20,
        r: Math.random() * 1.5 + 1,
        speedY: -Math.random() * 1 - 0.2,
        speedX: Math.random() * 1 - 0.5,
        isRecycle: true
      });
    }

    this.ctx.fillStyle = '#72EFDD';
    this.particles.forEach((p) => {
      if (p.isRecycle && p.y > y - 40) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        this.ctx.fill();
        p.y += p.speedY;
        p.x += p.speedX;
      }
    });

    // Narrative text
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '600 12px var(--font-heading)';
    this.ctx.textAlign = 'left';
    this.ctx.fillText("CIRCULAR CLOSED-LOOP", x + 55, y - 10);
    this.ctx.font = '400 10px var(--font-body)';
    this.ctx.fillStyle = 'var(--text-secondary)';
    this.ctx.fillText("Target: 100% equivalent recovery", x + 55, y + 8);
    this.ctx.fillText("Bottle-to-bottle food-grade rPET", x + 55, y + 24);
  }

  drawBackgroundParticles() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    this.particles.forEach((p) => {
      if (p.isWater || p.isRecycle) return; // Skip stage custom particles
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fill();
      
      p.x += p.speedX;
      p.y += p.speedY;
      
      // Loop bounds
      if (p.y < 0) {
        p.y = this.height;
        p.x = Math.random() * this.width;
      }
      if (p.x < 0 || p.x > this.width) {
        p.x = Math.random() * this.width;
      }
    });
  }
}
