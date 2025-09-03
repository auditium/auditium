/**
 * Client Logos Hover Isolation
 * Ensures each logo has isolated hover effects
 */

class ClientsHoverManager {
  constructor() {
    this.init();
  }

  init() {
    // Add unique IDs to each logo for better isolation
    const logos = document.querySelectorAll('.client-logo');
    logos.forEach((logo, index) => {
      logo.setAttribute('data-logo-id', `logo-${index}`);
      
      // Add event listeners for better control
      logo.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
      logo.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    });
  }

  handleMouseEnter(event) {
    const logo = event.currentTarget;
    const logoId = logo.getAttribute('data-logo-id');
    
    // Remove hover state from all other logos
    const allLogos = document.querySelectorAll('.client-logo');
    allLogos.forEach(otherLogo => {
      if (otherLogo !== logo) {
        otherLogo.classList.remove('hover-active');
      }
    });
    
    // Add hover state to current logo
    logo.classList.add('hover-active');
  }

  handleMouseLeave(event) {
    const logo = event.currentTarget;
    logo.classList.remove('hover-active');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  new ClientsHoverManager();
});
