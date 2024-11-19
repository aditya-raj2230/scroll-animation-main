class PageTransition {
    constructor() {
      this.isTransitioning = false;
      this.currentScroll = 0;
      this.targetScroll = window.innerHeight;
      this.duration = 1000; // 1 second transition
      this.easing = t => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; // Cubic easing
      
      // Create wrapper for smooth scroll effect
      this.wrapper = document.createElement('div');
      this.wrapper.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 200vh;
        transform: translateY(0);
        will-change: transform;
      `;
  
      // Create containers for current and next page
      this.currentPage = document.createElement('div');
      this.nextPage = document.createElement('div');
      
      this.currentPage.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
      `;
      
      this.nextPage.style.cssText = `
        position: absolute;
        top: 100vh;
        left: 0;
        width: 100%;
        height: 100vh;
      `;
  
      this.wrapper.appendChild(this.currentPage);
      this.wrapper.appendChild(this.nextPage);
      
      // Move body contents to current page container
      while (document.body.children.length > 0) {
        this.currentPage.appendChild(document.body.children[0]);
      }
      document.body.appendChild(this.wrapper);
    }
  
    async transition(nextPageUrl) {
      if (this.isTransitioning) return;
      this.isTransitioning = true;
  
      // Load next page content
      const response = await fetch(nextPageUrl);
      const html = await response.text();
      const parser = new DOMParser();
      const nextDoc = parser.parseFromString(html, 'text/html');
      
      // Prepare next page
      this.nextPage.innerHTML = '';
      Array.from(nextDoc.body.children).forEach(child => {
        this.nextPage.appendChild(child);
      });
  
      // Animate scroll
      const startTime = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        const easedProgress = this.easing(progress);
        
        const translateY = -(this.targetScroll * easedProgress);
        this.wrapper.style.transform = `translateY(${translateY}px)`;
  
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.completeTransition(nextPageUrl);
        }
      };
  
      requestAnimationFrame(animate);
    }
  
    completeTransition(url) {
      // Update URL without reload
      window.history.pushState({}, '', url);
      
      // Move next page content to current page
      this.currentPage.innerHTML = this.nextPage.innerHTML;
      this.nextPage.innerHTML = '';
      
      // Reset position
      this.wrapper.style.transform = 'translateY(0)';
      
      this.isTransitioning = false;
      
      // Reinitialize any necessary scripts
      this.initializePageScripts();
    }
  
    initializePageScripts() {
      // Re-initialize Three.js scene and other scripts
      if (typeof initScene === 'function') {
        initScene();
      }
    }
  }
  
  // Initialize the transition system
  const pageTransition = new PageTransition();
  
  // Update scroll handlers
  function handlePageTransition(direction) {
    if (direction === 'down') {
      pageTransition.transition('product.html');
    } else if (direction === 'up') {
      pageTransition.transition('index.html');
    }
  }