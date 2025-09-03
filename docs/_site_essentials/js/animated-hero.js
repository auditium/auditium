/**
 * AnimatedHero - Vanilla JavaScript Version
 * A premium, red-on-black animated hero background for blockchain
 * security/auditing sites. Uses HTML5 Canvas (2D) with a lightweight
 * flow-field particle network.
 */

class AnimatedHero {
  constructor(canvasId) {
    console.log('AnimatedHero constructor called with:', canvasId);
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(`Canvas with id '${canvasId}' not found`);
      return;
    }
    
    console.log('Canvas found:', this.canvas);
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.rafId = 0;
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.t = 0;
    this.particles = [];
    this.PARTICLES = 0;
    this.connectDistance = 0;
    
    this.init();
  }

  init() {
    this.resize();
    this.seedParticles();
    this.setupEventListeners();
    this.startAnimation();
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    
    this.width = parent.clientWidth;
    this.height = parent.clientHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    this.canvas.width = Math.max(1, Math.floor(this.width * this.dpr));
    this.canvas.height = Math.max(1, Math.floor(this.height * this.dpr));
    this.canvas.style.width = this.width + "px";
    this.canvas.style.height = this.height + "px";
    
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    
    // Recalculate particle count and connection distance
    this.PARTICLES = this.computeCount();
    this.connectDistance = Math.max(120, Math.min(220, Math.floor(this.width / 7)));
    this.seedParticles();
  }

  computeCount() {
    const target = Math.round((this.width * this.height) / 8000);
    return Math.max(80, Math.min(180, target));
  }

  seedParticles() {
    this.particles = new Array(this.PARTICLES).fill(0).map(() => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: 0,
      vy: 0,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resize());
  }

  startAnimation() {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mq.matches) {
      this.animate();
    } else {
      this.drawStatic();
    }
  }

  animate() {
    this.t += 0.0035;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update particle motion
    for (const p of this.particles) {
      const angle = Math.sin(p.y * 0.003 + this.t * 2 + p.phase) * Math.PI + 
                   Math.cos(p.x * 0.003 - this.t * 1.6);
      p.vx += Math.cos(angle) * 0.06;
      p.vy += Math.sin(angle) * 0.06;
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.x += p.vx;
      p.y += p.vy;

      // Wrap-around edges
      const margin = 60;
      if (p.x < -margin) p.x = this.width + margin;
      if (p.x > this.width + margin) p.x = -margin;
      if (p.y < -margin) p.y = this.height + margin;
      if (p.y > this.height + margin) p.y = -margin;
    }

    // Draw connections with additive blend
    this.ctx.globalCompositeOperation = "lighter";

    // Soft underglow - MADE BOLDER
    this.ctx.lineWidth = 4.0;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const q = this.particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < this.connectDistance) {
          const a = (1 - dist / this.connectDistance) * 0.15;
          this.ctx.strokeStyle = `rgba(255, 20, 32, ${a})`;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(q.x, q.y);
          this.ctx.stroke();
        }
      }
    }

    // Crisp bright lines - MADE BOLDER
    this.ctx.lineWidth = 2;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const q = this.particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < this.connectDistance) {
          const pulse = (Math.sin(this.t * 10 + (p.phase + j) * 0.5) + 1) * 0.5;
          const a = (1 - dist / this.connectDistance) * (0.6 + pulse * 0.4);
          this.ctx.strokeStyle = `rgba(255, 0, 48, ${a})`;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(q.x, q.y);
          this.ctx.stroke();
        }
      }
    }

    // Bright nodes - MADE BOLDER
    for (const p of this.particles) {
      const r = 2.0 + Math.abs(Math.sin(this.t * 2 + p.phase)) * 1.0;
      this.ctx.fillStyle = "rgba(255, 30, 40, 1.0)";
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Left-side dark gradient for copy space
    this.ctx.globalCompositeOperation = "source-over";
    const grad = this.ctx.createLinearGradient(0, 0, Math.max(1, this.width), 0);
    grad.addColorStop(0.0, "rgba(0,0,0,0.95)");
    grad.addColorStop(0.3, "rgba(0,0,0,0.8)");
    grad.addColorStop(0.55, "rgba(0,0,0,0.35)");
    grad.addColorStop(0.68, "rgba(0,0,0,0.08)");
    grad.addColorStop(1.0, "rgba(0,0,0,0.0)");
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.rafId = requestAnimationFrame(() => this.animate());
  }

  drawStatic() {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Subtle static vignette
    const g = this.ctx.createRadialGradient(
      this.width * 0.65, this.height * 0.5, 0,
      this.width * 0.65, this.height * 0.5, Math.max(this.width, this.height)
    );
    g.addColorStop(0, "rgba(255,0,32,0.08)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    window.removeEventListener('resize', () => this.resize());
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, looking for hero canvases...');
  
  // Initialize homepage hero
  const homepageHero = document.getElementById('homepage-hero');
  console.log('Homepage hero canvas:', homepageHero);
  if (homepageHero) {
    console.log('Creating AnimatedHero for homepage');
    new AnimatedHero('homepage-hero');
  }
  
  // Initialize demo page hero
  const demoHero = document.getElementById('animated-hero');
  console.log('Demo hero canvas:', demoHero);
  if (demoHero) {
    console.log('Creating AnimatedHero for demo page');
    new AnimatedHero('animated-hero');
  }
  
  console.log('AnimatedHero initialization complete');
});
