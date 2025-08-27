// ===== BEAMFLOW PARTICLE SYSTEM =====

class BeamFlowParticles {
  constructor() {
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
    this.animationFrame = null;
    this.mouse = { x: 0, y: 0, radius: 100 };
    this.init();
  }

  init() {
    this.setupCanvas();
    this.createParticles();
    this.addEventListeners();
    this.animate();
  }

  // ===== CANVAS SETUP =====
  setupCanvas() {
    const particleContainer = document.getElementById('particles');
    if (!particleContainer) return;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    particleContainer.appendChild(this.canvas);

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.offsetWidth;
    this.canvas.height = container.offsetHeight;
  }

  // ===== PARTICLE CREATION =====
  createParticles() {
    const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(new Particle(this.canvas.width, this.canvas.height));
    }
  }

  // ===== PARTICLE CLASS =====
  class Particle {
    constructor(canvasWidth, canvasHeight) {
      this.x = Math.random() * canvasWidth;
      this.y = Math.random() * canvasHeight;
      this.size = Math.random() * 3 + 1;
      this.speedX = Math.random() * 2 - 1;
      this.speedY = Math.random() * 2 - 1;
      this.opacity = Math.random() * 0.5 + 0.3;
      this.color = this.getRandomColor();
      this.originalX = this.x;
      this.originalY = this.y;
      this.angle = Math.random() * Math.PI * 2;
      this.velocity = Math.random() * 0.02 + 0.01;
      this.amplitude = Math.random() * 50 + 20;
    }

    getRandomColor() {
      const colors = [
        '#3b82f6', // Blue
        '#8b5cf6', // Purple
        '#06b6d4', // Cyan
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#ef4444'  // Red
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    update(mouse) {
      // Update position
      this.x += this.speedX;
      this.y += this.speedY;

      // Add floating motion
      this.angle += this.velocity;
      this.x = this.originalX + Math.sin(this.angle) * this.amplitude;
      this.y = this.originalY + Math.cos(this.angle) * this.amplitude;

      // Mouse interaction
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius) {
        const force = (mouse.radius - distance) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        const pushX = Math.cos(angle) * force * 2;
        const pushY = Math.sin(angle) * force * 2;
        
        this.x -= pushX;
        this.y -= pushY;
      }

      // Bounce off edges
      if (this.x > this.canvas.width || this.x < 0) {
        this.speedX = -this.speedX;
      }
      if (this.y > this.canvas.height || this.y < 0) {
        this.speedY = -this.speedY;
      }

      // Keep particles within bounds
      this.x = Math.max(0, Math.min(this.canvas.width, this.x));
      this.y = Math.max(0, Math.min(this.canvas.height, this.y));
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ===== ANIMATION LOOP =====
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(particle => {
      particle.update(this.mouse);
      particle.draw(this.ctx);
    });

    this.drawConnections();
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  // ===== CONNECTION LINES =====
  drawConnections() {
    const maxDistance = 150;
    
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          const opacity = (maxDistance - distance) / maxDistance;
          this.ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.3})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }

  // ===== EVENT LISTENERS =====
  addEventListeners() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = 0;
      this.mouse.y = 0;
    });

    this.canvas.addEventListener('click', (e) => {
      this.createExplosion(e.clientX, e.clientY);
    });
  }

  // ===== SPECIAL EFFECTS =====
  createExplosion(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    const centerX = x - rect.left;
    const centerY = y - rect.top;
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = Math.random() * 5 + 2;
      
      this.particles.push(new ExplosionParticle(
        centerX,
        centerY,
        Math.cos(angle) * velocity,
        Math.sin(angle) * velocity
      ));
    }
  }

  // ===== EXPLOSION PARTICLE =====
  class ExplosionParticle extends Particle {
    constructor(x, y, speedX, speedY) {
      super(0, 0);
      this.x = x;
      this.y = y;
      this.speedX = speedX;
      this.speedY = speedY;
      this.size = Math.random() * 4 + 2;
      this.opacity = 1;
      this.life = 100;
      this.color = '#f59e0b';
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedX *= 0.98;
      this.speedY *= 0.98;
      this.opacity -= 0.01;
      this.life--;
    }

    draw(ctx) {
      if (this.life > 0) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // ===== PARTICLE MANAGEMENT =====
  addParticles(count = 10) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(this.canvas.width, this.canvas.height));
    }
  }

  removeParticles(count = 10) {
    this.particles.splice(0, count);
  }

  clearParticles() {
    this.particles = [];
  }

  // ===== PERFORMANCE OPTIMIZATION =====
  optimizePerformance() {
    // Remove particles that are off-screen
    this.particles = this.particles.filter(particle => {
      return particle.x >= -50 && 
             particle.x <= this.canvas.width + 50 && 
             particle.y >= -50 && 
             particle.y <= this.canvas.height + 50;
    });

    // Limit total particles for performance
    const maxParticles = Math.floor((this.canvas.width * this.canvas.height) / 10000);
    if (this.particles.length > maxParticles) {
      this.particles.splice(maxParticles);
    }
  }

  // ===== THEME ADAPTATION =====
  updateTheme(theme) {
    this.particles.forEach(particle => {
      if (theme === 'dark') {
        // Brighter colors for dark theme
        particle.color = this.getBrightColor();
      } else {
        // Standard colors for light theme
        particle.color = this.getStandardColor();
      }
    });
  }

  getBrightColor() {
    const colors = [
      '#60a5fa', // Bright blue
      '#a78bfa', // Bright purple
      '#22d3ee', // Bright cyan
      '#34d399', // Bright emerald
      '#fbbf24', // Bright amber
      '#f87171'  // Bright red
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getStandardColor() {
    const colors = [
      '#3b82f6', // Blue
      '#8b5cf6', // Purple
      '#06b6d4', // Cyan
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#ef4444'  // Red
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // ===== UTILITY METHODS =====
  pause() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  resume() {
    if (!this.animationFrame) {
      this.animate();
    }
  }

  destroy() {
    this.pause();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// ===== PARTICLE EFFECTS =====

// Firework effect
class FireworkEffect {
  constructor(canvas, x, y) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.x = x;
    this.y = y;
    this.particles = [];
    this.createFirework();
  }

  createFirework() {
    const particleCount = 50;
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = Math.random() * 8 + 4;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      this.particles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: Math.random() * 3 + 1,
        color: color,
        life: 100,
        opacity: 1
      });
    }
  }

  update() {
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // Gravity
      particle.opacity -= 0.01;
      particle.life--;
    });

    this.particles = this.particles.filter(particle => particle.life > 0);
  }

  draw() {
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  isFinished() {
    return this.particles.length === 0;
  }
}

// ===== INITIALIZATION =====

// Initialize particle system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.beamFlowParticles = new BeamFlowParticles();
});

// Export for use in other modules
window.BeamFlowParticles = BeamFlowParticles;
window.FireworkEffect = FireworkEffect;
