/**
 * Counting Animation Effect
 * Animates numbers from 0 to target values with a smooth counting effect
 */

class CountingAnimation {
  constructor() {
    this.animated = false;
    this.init();
  }

  init() {
    // Check if element is in viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animated) {
          this.startCounting();
          this.animated = true;
        }
      });
    });

    // Observe the stats section
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }
  }

  startCounting() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    // Stagger the animations for better visual effect
    statNumbers.forEach((statNumber, index) => {
      const targetText = statNumber.textContent;
      const target = this.extractNumber(targetText);
      const suffix = this.extractSuffix(targetText);
      
      if (target > 0) {
        // Stagger start times for smoother overall effect
        setTimeout(() => {
          statNumber.classList.add('counting');
          this.animateNumber(statNumber, 0, target, suffix);
        }, index * 100); // 100ms delay between each number
      }
    });
  }

  extractNumber(text) {
    // Extract numeric value from text like "50+", "$1B+", etc.
    const match = text.match(/[\d.]+/);
    if (match) {
      const num = parseFloat(match[0]);
      if (text.includes('B')) return num * 1000000000;
      if (text.includes('M')) return num * 1000000;
      if (text.includes('K')) return num * 1000;
      return num;
    }
    return 0;
  }

  extractSuffix(text) {
    // Extract suffix like "+", "B+", etc.
    const match = text.match(/[^\d.]+$/);
    return match ? match[0] : '';
  }

  animateNumber(element, start, end, suffix) {
    const duration = 1200; // Even faster for smoother feel
    const startTime = performance.now();
    const steps = 60; // More steps for smoother counting
    let currentStep = 0;
    
    const updateNumber = () => {
      currentStep++;
      const progress = currentStep / steps;
      
      // Simple linear easing for maximum smoothness
      const current = Math.floor(start + (end - start) * progress);
      
      // Format the number based on suffix
      let displayValue = current.toString();
      if (suffix.includes('B')) {
        displayValue = (current / 1000000000).toFixed(1) + 'B';
      } else if (suffix.includes('M')) {
        displayValue = (current / 1000000).toFixed(1) + 'M';
      } else if (suffix.includes('K')) {
        displayValue = (current / 1000).toFixed(1) + 'K';
      }
      
      element.textContent = displayValue + suffix;
      
      // Continue animation with fixed step timing
      if (currentStep < steps) {
        setTimeout(updateNumber, duration / steps);
      } else {
        // Ensure final value is exact
        const finalValue = this.formatNumber(end, suffix);
        element.textContent = finalValue;
        
        // Smooth transition back to normal state
        element.classList.remove('counting');
        element.classList.add('final');
        
        // Remove final class immediately
        element.classList.remove('final');
      }
    };
    
    // Start the animation
    updateNumber();
  }

  formatNumber(num, suffix) {
    if (suffix.includes('B')) {
      return (num / 1000000000).toFixed(1) + 'B';
    } else if (suffix.includes('M')) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (suffix.includes('K')) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}

// Initialize counting animation when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  new CountingAnimation();
});
