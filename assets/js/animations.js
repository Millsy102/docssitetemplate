// ===== BEAMFLOW ANIMATIONS =====

class BeamFlowAnimations {
  constructor() {
    this.particles = [];
    this.animationFrames = [];
    this.isAnimating = false;
    this.init();
  }

  init() {
    this.setupParticleSystem();
    this.setupScrollAnimations();
    this.setupTypingAnimations();
    this.setupParallaxEffects();
    this.setupHoverAnimations();
    this.setupLoadingAnimations();
  }

  // ===== PARTICLE SYSTEM =====
  setupParticleSystem() {
    const particleContainer = document.getElementById('particles');
    if (!particleContainer) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    particleContainer.appendChild(canvas);

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = particleContainer.offsetWidth;
      canvas.height = particleContainer.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * -3 - 1;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.color = `hsl(${Math.random() * 60 + 200}, 70%, 60%)`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.005;

        if (this.y < -10 || this.opacity <= 0) {
          this.reset();
        }
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 10;
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Create particles
    for (let i = 0; i < 50; i++) {
      this.particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      this.particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };
    animate();
  }

  // ===== SCROLL ANIMATIONS =====
  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements with animation attributes
    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });
  }

  animateElement(element) {
    const animation = element.getAttribute('data-animate');
    const delay = element.getAttribute('data-delay') || 0;
    const duration = element.getAttribute('data-duration') || 1000;

    setTimeout(() => {
      element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      
      switch (animation) {
        case 'fadeIn':
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
          break;
        case 'fadeInUp':
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
          break;
        case 'fadeInLeft':
          element.style.opacity = '1';
          element.style.transform = 'translateX(0)';
          break;
        case 'fadeInRight':
          element.style.opacity = '1';
          element.style.transform = 'translateX(0)';
          break;
        case 'scaleIn':
          element.style.opacity = '1';
          element.style.transform = 'scale(1)';
          break;
        case 'slideInUp':
          element.style.transform = 'translateY(0)';
          break;
        case 'slideInDown':
          element.style.transform = 'translateY(0)';
          break;
        case 'slideInLeft':
          element.style.transform = 'translateX(0)';
          break;
        case 'slideInRight':
          element.style.transform = 'translateX(0)';
          break;
      }
    }, delay);
  }

  // ===== TYPING ANIMATIONS =====
  setupTypingAnimations() {
    const typingElements = document.querySelectorAll('[data-typing]');
    
    typingElements.forEach(element => {
      const text = element.getAttribute('data-typing');
      const speed = element.getAttribute('data-typing-speed') || 100;
      const delay = element.getAttribute('data-typing-delay') || 0;
      
      setTimeout(() => {
        this.typeText(element, text, speed);
      }, delay);
    });
  }

  typeText(element, text, speed) {
    let index = 0;
    element.textContent = '';
    
    const type = () => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(type, speed);
      } else {
        // Add blinking cursor effect
        element.classList.add('typing-complete');
      }
    };
    
    type();
  }

  // ===== PARALLAX EFFECTS =====
  setupParallaxEffects() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const speed = element.getAttribute('data-parallax') || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    });
  }

  // ===== HOVER ANIMATIONS =====
  setupHoverAnimations() {
    // Magnetic effect for buttons
    const magneticElements = document.querySelectorAll('[data-magnetic]');
    
    magneticElements.forEach(element => {
      element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        element.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
      });
      
      element.addEventListener('mouseleave', () => {
        element.style.transform = 'translate(0, 0)';
      });
    });

    // Ripple effect for buttons
    const rippleElements = document.querySelectorAll('[data-ripple]');
    
    rippleElements.forEach(element => {
      element.addEventListener('click', (e) => {
        this.createRipple(e, element);
      });
    });
  }

  createRipple(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  // ===== LOADING ANIMATIONS =====
  setupLoadingAnimations() {
    // Skeleton loading
    const skeletonElements = document.querySelectorAll('.skeleton');
    
    skeletonElements.forEach(element => {
      element.style.animationDelay = Math.random() * 2 + 's';
    });

    // Progress bars
    const progressBars = document.querySelectorAll('[data-progress]');
    
    progressBars.forEach(bar => {
      const progress = bar.getAttribute('data-progress');
      const duration = bar.getAttribute('data-duration') || 2000;
      
      setTimeout(() => {
        bar.style.width = progress + '%';
      }, 500);
    });
  }

  // ===== ADVANCED ANIMATIONS =====

  // Morphing shapes
  morphShape(element, targetShape, duration = 1000) {
    const startShape = element.getAttribute('d') || '';
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Simple linear interpolation (you can use more sophisticated algorithms)
      const currentShape = this.interpolatePath(startShape, targetShape, progress);
      element.setAttribute('d', currentShape);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  interpolatePath(startPath, endPath, progress) {
    // This is a simplified interpolation - in practice, you'd want a more sophisticated algorithm
    return startPath; // Placeholder
  }

  // Floating animation
  addFloatingAnimation(element, amplitude = 10, frequency = 2) {
    const startY = parseFloat(getComputedStyle(element).transform.split(',')[5]) || 0;
    let time = 0;
    
    const animate = () => {
      time += 0.016; // 60fps
      const y = startY + Math.sin(time * frequency) * amplitude;
      element.style.transform = `translateY(${y}px)`;
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  // Pulse animation
  addPulseAnimation(element, scale = 1.1, duration = 1000) {
    const originalScale = element.style.transform;
    
    element.style.transition = `transform ${duration}ms ease-in-out`;
    element.style.transform = `scale(${scale})`;
    
    setTimeout(() => {
      element.style.transform = originalScale;
    }, duration);
  }

  // Shake animation
  addShakeAnimation(element, intensity = 10, duration = 500) {
    const originalTransform = element.style.transform;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = elapsed / duration;
      
      if (progress < 1) {
        const shake = Math.sin(progress * 20) * intensity * (1 - progress);
        element.style.transform = `${originalTransform} translateX(${shake}px)`;
        requestAnimationFrame(animate);
      } else {
        element.style.transform = originalTransform;
      }
    };
    
    requestAnimationFrame(animate);
  }

  // Bounce animation
  addBounceAnimation(element, height = 50, duration = 1000) {
    const originalTransform = element.style.transform;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = elapsed / duration;
      
      if (progress < 1) {
        const bounce = Math.sin(progress * Math.PI) * height * (1 - progress);
        element.style.transform = `${originalTransform} translateY(${-bounce}px)`;
        requestAnimationFrame(animate);
      } else {
        element.style.transform = originalTransform;
      }
    };
    
    requestAnimationFrame(animate);
  }

  // ===== UTILITY FUNCTIONS =====

  // Easing functions
  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  easeOutBounce(t) {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  }

  // Color interpolation
  interpolateColor(color1, color2, factor) {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    
    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Stop all animations
  stopAllAnimations() {
    this.animationFrames.forEach(frame => {
      cancelAnimationFrame(frame);
    });
    this.animationFrames = [];
  }

  // Pause/resume animations
  pauseAnimations() {
    this.isAnimating = false;
  }

  resumeAnimations() {
    this.isAnimating = true;
  }
}

// ===== CSS ANIMATION HELPERS =====

// Add CSS animation class
function addAnimationClass(element, className, duration = 1000) {
  element.classList.add(className);
  setTimeout(() => {
    element.classList.remove(className);
  }, duration);
}

// Trigger CSS animation
function triggerAnimation(element, animationName, duration = 1000) {
  element.style.animation = `${animationName} ${duration}ms ease-in-out`;
  element.addEventListener('animationend', () => {
    element.style.animation = '';
  }, { once: true });
}

// ===== INITIALIZATION =====

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.beamFlowAnimations = new BeamFlowAnimations();
});

// Export for use in other modules
window.BeamFlowAnimations = BeamFlowAnimations;
