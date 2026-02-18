// ==========================================
// 1. CUSTOM CURSOR WITH DELAY
// ==========================================
const cursor = document.querySelector('.custom-cursor');
// Build the circle cursor via JS (no external SVG file)
let baseCircle = null;
if (cursor) {
  const svgNS = 'http://www.w3.org/2000/svg';
  baseCircle = document.createElementNS(svgNS, 'svg');
  baseCircle.setAttribute('width', '30');
  baseCircle.setAttribute('height', '30');
  baseCircle.setAttribute('viewBox', '0 0 30 30');
  const circle = document.createElementNS(svgNS, 'circle');
  circle.setAttribute('cx', '15');
  circle.setAttribute('cy', '15');
  circle.setAttribute('r', '15');
  circle.setAttribute('fill', '#ffffff');
  baseCircle.appendChild(circle);
  cursor.appendChild(baseCircle);
}
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  const speed = 0.09;
  cursorX += (mouseX - cursorX) * speed;
  cursorY += (mouseY - cursorY) * speed;
  
  if (cursor) {
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
  }
  
  requestAnimationFrame(animateCursor);
}

animateCursor();

// ==========================================
// HERO ENTRANCE ANIMATION
// ==========================================
function startHeroAnimations() {
  const navGroup = document.querySelector('.nav-group');
  const heroCaption = document.querySelector('.hero-container > .hero-caption');
  const heroImage = document.querySelector('.hero-image');
  const screenAnimation = document.querySelector('.screen-animation');
  const wallPics = document.querySelectorAll('.wall-pic');
  
  // Animate nav group first (drop down from top)
  setTimeout(() => {
    if (navGroup) navGroup.classList.add('animate-in');
  }, 100);
  
  // Animate caption, hero image, and screen animation together
  setTimeout(() => {
    if (heroCaption) {
      heroCaption.classList.add('animate-in');
    }
    if (heroImage) {
      heroImage.classList.add('animate-in');
    }
    if (screenAnimation) {
      screenAnimation.classList.add('animate-in');
    }
    
    // Then animate wall pictures after hero is done
    setTimeout(() => {
      wallPics.forEach(pic => {
        pic.classList.add('animate-in');
      });
    }, 300); // Wait for hero animation to mostly complete
  }, 100); // Small initial delay for page to settle
}

// Wait for loading screen to finish before starting animations
// Check if loading already completed (on page reload), otherwise wait for event
document.addEventListener('DOMContentLoaded', () => {
  if (window.loadingComplete) {
    startHeroAnimations();
  } else {
    window.addEventListener('loadingComplete', startHeroAnimations);
  }
});

// ==========================================
// CASE STUDY INTRO NAV (show only on green page)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const introSection = document.querySelector('.case-intro-section');
  const siteHeader = document.querySelector('.site-header');
  const caseLayout = document.querySelector('.case-layout');
  if (!introSection || !siteHeader) return;

  const body = document.body;
  if (caseLayout) {
    body.classList.add('case-study');
  }

  // Use scroll listener for reliable nav hide/show
  function updateNavVisibility() {
    // Hide nav as soon as any scrolling starts
    if (window.scrollY <= 10) {
      siteHeader.classList.add('case-intro-nav-visible');
    } else {
      siteHeader.classList.remove('case-intro-nav-visible');
    }
  }

  window.addEventListener('scroll', updateNavVisibility, { passive: true });
  // Initial check
  updateNavVisibility();
});

// ==========================================
// SCROLL FADE IN ANIMATION FOR ALL ELEMENTS
// ==========================================
function initScrollFadeAnimations() {
  // Select all elements that should fade in on scroll
  // Exclude hero section elements that should animate on page load
  const fadeElements = document.querySelectorAll(
    'section:not(#hero) h2, ' +
    'section:not(#hero) h3, ' +
    'section:not(#hero) h4, ' +
    'section:not(#hero) h5, ' +
    'section:not(#hero) h6, ' +
    'section:not(#hero) p, ' +
    '.section-title, ' +
    '.card:not(.case-card), ' +
    '.case-card, ' +
    '.case-content p, ' +
    '.case-content h3, ' +
    '.case-image-grid img, ' +
    '.case-template-grid img, ' +
    '.case-info-card, ' +
    '.result-item, ' +
    '.info-card-item, ' +
    '.case-list li, ' +
    '.about-text p, ' +
    '.about-photo, ' +
    '.skill-item, ' +
    '.case-section, ' +
    '.case-image, ' +
    '.case-hero-main-image--convoy img, .case-hero-main-image--mose img, .case-hero-main-image--flock img, ' +
    '.floating-img-convoy-1, .floating-img-convoy-2, .floating-img-convoy-3, .floating-img-convoy-4, .floating-img-convoy-5, .floating-img-convoy-6, .floating-img-mose-1, .floating-img-mose-2, .floating-img-mose-3, .floating-img-mose-4, .floating-img-mose-5, .floating-img-flock-1, .floating-img-flock-2, .floating-img-flock-3, .floating-img-flock-4, .floating-img-flock-5, ' +
    '.case-hero-title, ' +
    '.case-hero-subtitle, ' +
    '.case-hero-description'
  );

  if (fadeElements.length === 0) return;

  // Options for IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px', // Trigger when element is 80px from bottom of viewport
    threshold: 0.1 // Trigger when 10% of element is visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scroll-fade-in');
        // Unobserve after animation to improve performance
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Add fade class to all elements immediately to set initial state
  fadeElements.forEach(element => {
    element.classList.add('scroll-fade');
  });

  // Force a synchronous reflow to ensure the initial state is rendered
  void document.body.offsetHeight;

  // Wait for next frame to ensure CSS has been applied
  requestAnimationFrame(() => {
    // Wait one more frame to be absolutely sure
    requestAnimationFrame(() => {
      // Now check which elements are already in viewport
      fadeElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInViewport) {
          // Add a delay to ensure the initial opacity: 0 state is visible first
          setTimeout(() => {
            if (element.classList.contains('scroll-fade')) {
              element.classList.add('scroll-fade-in');
            }
          }, 150);
        } else {
          // Only observe elements not in viewport
          observer.observe(element);
        }
      });
    });
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initScrollFadeAnimations);

// Handle cursor expansion on case figure hover and case study sections (debounced so fast hops don't glitch)
let arrowEl = null;
let comingSoonEl = null;
let removeArrowTimeout = null;
let hoveredElements = new Set();
let isVigilHovered = false;

function setupCursorHover(element, isVigil = false) {
  element.addEventListener('mouseenter', () => {
    if (!cursor) return;

    // Clear any pending removal timeout
    if (removeArrowTimeout) {
      clearTimeout(removeArrowTimeout);
      removeArrowTimeout = null;
    }

    // Add this element to the set of hovered elements
    hoveredElements.add(element);

    if (isVigil) {
      // Handle Vigil card - show "Coming Soon!" pill
      isVigilHovered = true;
      
      // Create coming soon text if it doesn't exist
      if (!comingSoonEl) {
        comingSoonEl = document.createElement('span');
        comingSoonEl.classList.add('coming-soon-text');
        comingSoonEl.textContent = 'Coming Soon!';
      }
      
      // Add text to cursor if not already there
      if (!comingSoonEl.isConnected) {
        cursor.appendChild(comingSoonEl);
      }
      
      // Remove arrow if it exists
      if (arrowEl && arrowEl.isConnected) {
        arrowEl.remove();
      }

      // Expand cursor as pill
      cursor.classList.remove('expanded');
      cursor.classList.add('expanded-pill');
    } else {
      // Handle regular case cards - show arrow
      isVigilHovered = false;
      
      // Create arrow if it doesn't exist
      if (!arrowEl) {
        arrowEl = document.createElement('img');
        arrowEl.src = '../media/HeroPage/arrowAngleUp.svg';
        arrowEl.alt = '';
        arrowEl.classList.add('cursor-arrow');
      }
      
      // Add arrow to cursor if not already there
      if (!arrowEl.isConnected) {
        cursor.appendChild(arrowEl);
      }
      
      // Remove coming soon text if it exists
      if (comingSoonEl && comingSoonEl.isConnected) {
        comingSoonEl.remove();
      }

      // Expand cursor as circle
      cursor.classList.remove('expanded-pill');
      cursor.classList.add('expanded');
    }
  });
  
  element.addEventListener('mouseleave', () => {
    if (!cursor) return;
    
    // Remove this element from the set
    hoveredElements.delete(element);
    
    // Only collapse if no other elements are being hovered
    if (hoveredElements.size === 0) {
      cursor.classList.remove('expanded');
      cursor.classList.remove('expanded-pill');
      isVigilHovered = false;
      
      // Delay arrow/text removal to allow for quick movement between elements
      if (removeArrowTimeout) {
        clearTimeout(removeArrowTimeout);
      }
      removeArrowTimeout = setTimeout(() => {
        // Double-check no elements are hovered before removing elements
        if (hoveredElements.size === 0) {
          if (arrowEl && arrowEl.isConnected) {
            arrowEl.remove();
          }
          if (comingSoonEl && comingSoonEl.isConnected) {
            comingSoonEl.remove();
          }
        }
        removeArrowTimeout = null;
      }, 150);
    }
  });
}

function initCaseStudyCursorHover() {
  // Only apply cursor hover on index page (not on case study pages)
  // Check if we're on a case study page by looking for case-layout or case-study class
  const isCaseStudyPage = document.querySelector('.case-layout') !== null ||
                          document.body.classList.contains('case-study') ||
                          document.documentElement.classList.contains('case-study') ||
                          window.location.pathname.includes('case-study');
  
  if (isCaseStudyPage) {
    // On case study pages, don't set up cursor hover at all
    // Also hide the custom cursor completely
    if (cursor) {
      cursor.style.display = 'none';
    }
    return;
  }

  // Apply to case cards (entire card including image and text) - only on index page
  const caseCards = document.querySelectorAll('.case-card');
  caseCards.forEach(card => {
    const isVigil = card.classList.contains('vigil-card');
    setupCursorHover(card, isVigil);
  });

  // Also apply to case figures and case body separately for better coverage
  const caseFigures = document.querySelectorAll('.case-figure');
  caseFigures.forEach(fig => {
    const isVigil = fig.closest('.vigil-card') !== null;
    setupCursorHover(fig, isVigil);
  });

  const caseBodies = document.querySelectorAll('.case-body');
  caseBodies.forEach(body => {
    const isVigil = body.closest('.vigil-card') !== null;
    setupCursorHover(body, isVigil);
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initCaseStudyCursorHover);

// ==========================================
// 2. VARIABLES & SCROLL SPY (Active Link)
// ==========================================
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.floating-nav ul li a');
const homeLink = document.querySelector('.nav-home-link');

const marker = document.querySelector('.nav-marker');
const navList = document.querySelector('.floating-nav ul');

function updateActiveSection() {
    let current = "";
    
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        // Trigger point: Middle of the screen
        if (window.scrollY >= (sectionTop - window.innerHeight * 0.5)) {
            current = section.getAttribute("id");
        }
    });

    // Force Home at top
    if (window.scrollY < 100) {
        current = "hero";
    }

    // Update home link active state
    if (homeLink) {
        homeLink.classList.remove("active");
        homeLink.removeAttribute("aria-current");
        
        if (current === "hero") {
            homeLink.classList.add("active");
            homeLink.setAttribute("aria-current", "page");
        }
    }

    // Loop through links to handle Active Class AND Marker Movement
    navLinks.forEach((a) => {
        a.classList.remove("active");
        a.removeAttribute("aria-current");
        
        if (a.getAttribute("href") === `#${current}`) {
            a.classList.add("active");
            a.setAttribute("aria-current", "page");

            // --- ANIMATION LOGIC START ---
            if (marker && a.parentElement) {
                // Calculate position relative to the UL
                // We use offsetTop of the LI (parentElement) to catch the full area
                const parentLi = a.parentElement; 
                
                // Set the marker size and position to match the active link
                marker.style.height = `${a.offsetHeight}px`;
                marker.style.top = `${a.offsetTop}px`;
                marker.style.opacity = '1';
            }
            // --- ANIMATION LOGIC END ---
        }
    });
}

// Run immediately when page loads so "Home" is active
document.addEventListener('DOMContentLoaded', updateActiveSection);

// Run whenever the user scrolls
window.addEventListener('scroll', updateActiveSection);


// ==========================================
// 2. ANCHOR LINK NAVIGATION
// ==========================================
document.addEventListener('click', function(e) {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (!href || href === '#') return;

  const target = document.querySelector(href);
  if (!target) return;

  e.preventDefault();

  // compute header offset (account for fixed header/navbar)
  const header = document.querySelector('.site-header');
  const headerOffset = header ? header.offsetHeight : 0;

  const targetTop = target.getBoundingClientRect().top + window.pageYOffset - Math.round(headerOffset * 0.9);

  window.scrollTo({ top: targetTop, behavior: 'smooth' });
});


// ==========================================
// CASE STUDY SIDEBAR NAVIGATION
// ==========================================
function initCaseStudyNavigation() {
  const caseSidebar = document.querySelector('.case-sidebar');
  if (!caseSidebar) return; // Only run on case study pages
  
  const caseNavLinks = document.querySelectorAll('.case-nav-link');
  const caseSections = document.querySelectorAll('.case-section');
  
  function updateActiveCaseSection() {
    let current = "";
    
    caseSections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const scrollPosition = window.scrollY + window.innerHeight * 0.3; // Trigger when section is 30% from top
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute("id");
      }
    });
    
    // Update active link styling
    caseNavLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  }
  
  // Run on scroll and initially
  window.addEventListener('scroll', updateActiveCaseSection);
  updateActiveCaseSection();
}

// Initialize case study navigation when DOM is ready
document.addEventListener('DOMContentLoaded', initCaseStudyNavigation);

// Header hide-on-scroll and sidebar visibility (case study)
function initCaseStudyHeaderBehavior() {
  const header = document.querySelector('.site-header');
  const intro = document.querySelector('.case-intro-section');
  const sidebar = document.querySelector('.case-sidebar');
  if (!header && !sidebar) return;

  let lastY = window.scrollY;
  const delta = 8; // threshold to avoid jitter

  function update() {
    const y = window.scrollY;

    // header hide/show based on scroll direction
    if (header) {
      if (y > lastY + delta) {
        header.classList.add('hidden');
      } else if (y < lastY - delta) {
        header.classList.remove('hidden');
      }
    }

    // sidebar visibility: show after intro section is scrolled past
    if (sidebar && intro) {
      const headerHeight = header ? header.offsetHeight : 0;
      const threshold = intro.offsetTop + intro.offsetHeight - headerHeight - 20;
      if (y >= threshold) {
        sidebar.classList.add('visible');
      } else {
        sidebar.classList.remove('visible');
      }
    }

    lastY = y;
  }

  window.addEventListener('scroll', update, { passive: true });
  // initial check
  update();
}

document.addEventListener('DOMContentLoaded', initCaseStudyHeaderBehavior);

// ==========================================
// CASE STUDY SCROLL SPY (Active Nav Link)
// ==========================================
function initCaseStudyScrollSpy() {
  const caseNavLinks = document.querySelectorAll('.case-floating-nav .case-nav-link');
  if (caseNavLinks.length === 0) return;

  // Get all section IDs from the nav links
  const sectionIds = Array.from(caseNavLinks).map(link => {
    const href = link.getAttribute('href');
    return href ? href.substring(1) : null;
  }).filter(Boolean);

  // Get the first section to check if user has scrolled to it
  const firstSection = document.getElementById(sectionIds[0]);

  function updateActiveCaseSection() {
    let current = null; // No default - nothing highlighted initially

    // Only start highlighting when user reaches the first section
    if (firstSection) {
      const firstSectionTop = firstSection.offsetTop;
      
      // Check if user has scrolled to at least the first section
      if (window.scrollY >= (firstSectionTop - window.innerHeight * 0.4)) {
        sectionIds.forEach((id) => {
          const section = document.getElementById(id);
          if (section) {
            const sectionTop = section.offsetTop;
            // Trigger when section is 40% from the top of viewport
            if (window.scrollY >= (sectionTop - window.innerHeight * 0.4)) {
              current = id;
            }
          }
        });
      }
    }

    // Update active class on nav links
    caseNavLinks.forEach((link) => {
      link.classList.remove('active');
      if (current) {
        const href = link.getAttribute('href');
        if (href === `#${current}`) {
          link.classList.add('active');
        }
      }
    });
  }

  // Run on scroll
  window.addEventListener('scroll', updateActiveCaseSection, { passive: true });
  // Run on load
  updateActiveCaseSection();
}

document.addEventListener('DOMContentLoaded', initCaseStudyScrollSpy);

// Nav hide on scroll removed

// ==========================================
// PARALLAX FLOATING IMAGES (Case Study Hero)
// ==========================================
function initParallaxFloatingImages() {
  const floatingImages = document.querySelectorAll('.floating-img-convoy-1, .floating-img-convoy-2, .floating-img-convoy-3, .floating-img-convoy-4, .floating-img-convoy-5, .floating-img-convoy-6, .floating-img-mose-1, .floating-img-mose-2, .floating-img-mose-3, .floating-img-mose-4, .floating-img-mose-5, .floating-img-flock-1, .floating-img-flock-2, .floating-img-flock-3, .floating-img-flock-4, .floating-img-flock-5');
  
  if (floatingImages.length === 0) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  
  // Different parallax speeds for each image (larger = more movement)
  const speeds = [0.45, 0.38, 0.19, 0.35, 0.28, 0.10]; // index 5 = convoy-6 (less dramatic)
  
  let ticking = false;
  
  function updateParallax() {
    const scrollY = window.scrollY;
    
    floatingImages.forEach((img, index) => {
      const speed = speeds[index] || 0.1;
      const yOffset = scrollY * speed;
      img.style.transform = `translateY(${yOffset}px)`;
    });
    
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
  
  // Initial call
  updateParallax();
}

document.addEventListener('DOMContentLoaded', initParallaxFloatingImages);

// ==========================================
// LOGO BREAKDOWN SCROLL ANIMATION
// ==========================================
function initLogoBreakdownAnimation() {
  const annotations = document.querySelectorAll('.logo-annotation');
  
  if (annotations.length === 0) return;
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.3
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate all annotations when the breakdown section comes into view
        annotations.forEach(annotation => {
          annotation.classList.add('animate-in');
        });
      }
    });
  }, observerOptions);
  
  // Observe the logo breakdown container
  const logoBreakdown = document.querySelector('.logo-breakdown');
  if (logoBreakdown) {
    observer.observe(logoBreakdown);
  }
}

document.addEventListener('DOMContentLoaded', initLogoBreakdownAnimation);

// ==========================================
// BEFORE/AFTER IMAGE COMPARISON SLIDER
// ==========================================
function initImageComparison() {
  const containers = document.querySelectorAll('.comparison-container');
  
  containers.forEach(container => {
    const slider = container.querySelector('.comparison-slider');
    const beforeWrapper = container.querySelector('.comparison-before-wrapper');
    let isDragging = false;
    
    function updateSliderPosition(x) {
      const rect = container.getBoundingClientRect();
      let position = (x - rect.left) / rect.width;
      position = Math.max(0, Math.min(1, position));
      
      const percentage = position * 100;
      slider.style.left = percentage + '%';
      beforeWrapper.style.width = percentage + '%';
    }
    
    // Mouse events
    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateSliderPosition(e.clientX);
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      updateSliderPosition(e.clientX);
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    // Touch events
    container.addEventListener('touchstart', (e) => {
      isDragging = true;
      updateSliderPosition(e.touches[0].clientX);
    });
    
    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      updateSliderPosition(e.touches[0].clientX);
    });
    
    document.addEventListener('touchend', () => {
      isDragging = false;
    });
  });
}

document.addEventListener('DOMContentLoaded', initImageComparison);

// ==========================================
// CASE STUDY MOBILE HAMBURGER MENU (and index.html)
// ==========================================
function initCaseStudyMobileNav() {
  const hamburger = document.querySelector('.case-hamburger');
  const mobileNav = document.querySelector('.case-mobile-nav');
  
  if (!hamburger || !mobileNav) return;
  
  // Toggle menu on hamburger click
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
  });
  
  // Close menu when clicking a nav link
  const navLinks = mobileNav.querySelectorAll('.case-nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('active');
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', initCaseStudyMobileNav);

// ==========================================
// CASE STUDY NAV SLIDE ANIMATION
// ==========================================
function initCaseStudyNavTransition() {
  // Only run on index page
  const caseStudyLinks = document.querySelectorAll('a[href^="case-study-"]');
  if (caseStudyLinks.length === 0) return;

  const navGroup = document.querySelector('.nav-group');
  if (!navGroup) return;

  caseStudyLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetUrl = link.getAttribute('href');

      // Slide nav up out of view
      navGroup.classList.add('slide-up');

      // Navigate after animation completes
      setTimeout(() => {
        sessionStorage.setItem('navTransition', 'true');
        window.location.href = targetUrl;
      }, 400);
    });
  });
}

// Initialize on index page
document.addEventListener('DOMContentLoaded', initCaseStudyNavTransition);

// Slide down nav on case study pages
function initCaseStudyNavSlideDown() {
  // Only run on case study pages
  const caseNavGroup = document.querySelector('.case-nav-group');
  if (!caseNavGroup) return;

  // Check if we came from index with transition
  const shouldAnimate = sessionStorage.getItem('navTransition') === 'true';
  
  if (shouldAnimate) {
    // Slide down after a brief delay
    setTimeout(() => {
      caseNavGroup.classList.add('slide-down');
      sessionStorage.removeItem('navTransition');
    }, 100);
  } else {
    // Normal load - show immediately
    caseNavGroup.classList.add('slide-down');
  }
}

// ==========================================
// HERO CAPTION TYPING ANIMATION
// ==========================================
function startTypingAnimation() {
  const textEl = document.querySelector('.hero-caption-text');
  const cursorEl = document.querySelector('.hero-caption-cursor');
  if (!textEl) return;

  const fullText = 'Hey, welcome to my desk';
  const typingSpeed = 55;
  const pauseDuration = 2500;
  const deletingSpeed = 30;
  const loop = false;

  let charIndex = 0;
  let isDeleting = false;

  function type() {
    if (!isDeleting) {
      // Typing forward
      if (charIndex <= fullText.length) {
        const currentText = fullText.slice(0, charIndex);
        // Wrap "desk" in styled span if it appears
        const deskIndex = currentText.indexOf('desk');
        if (deskIndex !== -1) {
          const before = currentText.slice(0, deskIndex);
          const deskPart = currentText.slice(deskIndex);
          textEl.innerHTML = before + '<span class="caption-desk">' + deskPart + '</span>';
        } else {
          textEl.textContent = currentText;
        }
        charIndex++;
        setTimeout(type, typingSpeed);
      } else {
        // Done typing — stop (no looping)
        if (cursorEl) {
          // Keep cursor blinking for a moment, then hide
          setTimeout(() => {
            cursorEl.style.transition = 'opacity 0.5s ease';
            cursorEl.style.opacity = '0';
          }, 2000);
        }
      }
    }
  }

  type();
}

// Initialize on case study pages
document.addEventListener('DOMContentLoaded', initCaseStudyNavSlideDown);
