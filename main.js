// ==========================================
// 1. CUSTOM CURSOR WITH DELAY
// ==========================================

// Handle hash navigation on page load (for cross-page links like Work from About page)
if (window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname.endsWith('/index.html')) {
  if (window.location.hash) {
    const targetId = window.location.hash;
    // Wait for DOM to be ready, then scroll to the target
    document.addEventListener('DOMContentLoaded', function() {
      const target = document.querySelector(targetId);
      if (target) {
        // Small delay to ensure page is fully rendered
        setTimeout(() => {
          const header = document.querySelector('.site-header');
          const headerOffset = header ? header.offsetHeight : 0;
          const targetTop = target.getBoundingClientRect().top + window.pageYOffset - Math.round(headerOffset * 0.9);
          window.scrollTo({ top: targetTop, behavior: 'smooth' });
          // Clean up URL after scrolling
          history.replaceState(null, '', window.location.pathname.replace('index.html', '') || '/');
        }, 100);
      }
    });
  }
}

const cursor = document.querySelector('.custom-cursor');
let cursorLabelEl = null;

// Build the pill interior (hidden until expanded)
if (cursor) {
  const labelEl = document.createElement('span');
  labelEl.className = 'cursor-label';
  labelEl.textContent = 'View Project';
  cursorLabelEl = labelEl;

  const arrowEl2 = document.createElement('img');
  arrowEl2.src = '../media/HeroPage/arrowAngleUp.svg';
  arrowEl2.alt = '';
  arrowEl2.className = 'cursor-arrow';

  // Arrow first, then label (matches screenshot: arrow → text)
  cursor.appendChild(arrowEl2);
  cursor.appendChild(labelEl);
}
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  const speed = 0.18;
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

      // After the last wall-pic entrance finishes (max delay 350ms + duration 400ms
      // + a small buffer), switch to the fast hover micro-transition.
      setTimeout(() => {
        wallPics.forEach(pic => {
          pic.classList.add('entrance-done');
        });
      }, 850);
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
    'section:not(#hero) h3:not(.case-body h3), ' +
    'section:not(#hero) h4, ' +
    'section:not(#hero) h5, ' +
    'section:not(#hero) h6, ' +
    'section:not(#hero) p:not(.case-meta), ' +
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
    '.about-cta-text, ' +
    '.about-cta-section .profile-card, ' +
    '.about-cta-section .about-hero-text, ' +
    '.about-cta-section .about-cta-btn, ' +
    '.about-page .about-hero-title, ' +
    '.about-page .about-hero-image, ' +
    '.skill-item, ' +
    '.case-section, ' +
    '.case-image, ' +
    '.case-hero-main-image--convoy img, .case-hero-main-image--vigil img, .case-hero-main-image--flock img, ' +
    '.floating-img-convoy-1, .floating-img-convoy-2, .floating-img-convoy-3, .floating-img-convoy-4, .floating-img-convoy-5, .floating-img-convoy-6, .floating-img-vigil-1, .floating-img-vigil-2, .floating-img-vigil-3, .floating-img-vigil-4, .floating-img-vigil-5, .floating-img-flock-1, .floating-img-flock-2, .floating-img-flock-3, .floating-img-flock-4, .floating-img-flock-5, ' +
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

// ==========================================
// ABOUT HERO TITLE — HOVER ROTATE
// "Who am I really?" → cycles through colorful role labels on hover.
// ==========================================
function initAboutTitleRotate() {
  const title = document.querySelector('.hero-title-rotate');
  if (!title) return;

  const stage = title.querySelector('.hero-rotate-stage');
  if (!stage) return;

  const items = Array.from(stage.querySelectorAll('.hero-rotate-text'));
  if (items.length < 2) return;

  // Respect users who've asked for reduced motion.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const defaultItem = items[0];
  const cycleItems = items.slice(1);

  const CYCLE_DELAY = 1400;
  let activeIndex = -1; // -1 = default
  let cycleTimer = null;
  let isHovered = false;

  function transitionTo(newItem) {
    const current = stage.querySelector('.hero-rotate-text.is-active');
    if (current === newItem) return;

    // Slide the currently active text up out of view.
    if (current) {
      current.classList.remove('is-active');
      current.classList.add('is-above');
    }

    // Snap the incoming text to its base position (translateY 100%) without
    // animating, then run the transition into the active position.
    newItem.classList.add('no-transition');
    newItem.classList.remove('is-above');
    void newItem.offsetWidth; // force reflow
    newItem.classList.remove('no-transition');
    void newItem.offsetWidth; // force reflow
    newItem.classList.add('is-active');
  }

  function nextCycle() {
    if (!isHovered) return;
    activeIndex = (activeIndex + 1) % cycleItems.length;
    transitionTo(cycleItems[activeIndex]);
    cycleTimer = setTimeout(nextCycle, CYCLE_DELAY);
  }

  title.addEventListener('mouseenter', () => {
    if (isHovered) return;
    isHovered = true;
    activeIndex = 0;
    transitionTo(cycleItems[0]);
    cycleTimer = setTimeout(nextCycle, CYCLE_DELAY);
  });

  title.addEventListener('mouseleave', () => {
    isHovered = false;
    if (cycleTimer) {
      clearTimeout(cycleTimer);
      cycleTimer = null;
    }
    activeIndex = -1;
    transitionTo(defaultItem);
  });
}

document.addEventListener('DOMContentLoaded', initAboutTitleRotate);

// Handle cursor pill-expand on case card hover
let hoveredElements = new Set();

function setupCursorHover(element) {
  element.addEventListener('mouseenter', () => {
    if (!cursor) return;
    const card = element.closest('.case-card');
    const label = card?.dataset.cursorLabel || 'View Project';
    const showArrow = card?.dataset.cursorArrow !== 'false';
    if (cursorLabelEl) {
      cursorLabelEl.textContent = label;
    }
    cursor.classList.toggle('no-arrow', !showArrow);
    hoveredElements.add(element);
    cursor.classList.add('expanded');
  });

  element.addEventListener('mouseleave', () => {
    if (!cursor) return;
    hoveredElements.delete(element);
    if (hoveredElements.size === 0) {
      cursor.classList.remove('expanded');
      cursor.classList.remove('no-arrow');
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
    // On case study pages, keep the black cursor dot visible,
    // but skip project-card hover pill behavior.
    return;
  }

  // Apply to case cards (entire card including image and text) - only on index page
  const caseCards = document.querySelectorAll('.case-card');
  caseCards.forEach(card => {
    setupCursorHover(card);
  });

  // Also apply to case figures and case body separately for better coverage
  const caseFigures = document.querySelectorAll('.case-figure');
  caseFigures.forEach(fig => {
    setupCursorHover(fig);
  });

  const caseBodies = document.querySelectorAll('.case-body');
  caseBodies.forEach(body => {
    setupCursorHover(body);
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initCaseStudyCursorHover);

// ==========================================
// WALL PHOTO CURSOR HOVER
// ==========================================
function initWallPicCursorHover() {
  const wallPics = document.querySelectorAll('.wall-pic[data-cursor-label]');
  if (!cursor || wallPics.length === 0) return;

  wallPics.forEach(pic => {
    pic.addEventListener('mouseenter', () => {
      if (cursorLabelEl) cursorLabelEl.textContent = pic.dataset.cursorLabel;
      // No arrow for photo labels
      cursor.classList.add('expanded', 'no-arrow');
    });

    pic.addEventListener('mouseleave', () => {
      cursor.classList.remove('expanded', 'no-arrow');
      if (cursorLabelEl) cursorLabelEl.textContent = 'View Project';
    });
  });
}

document.addEventListener('DOMContentLoaded', initWallPicCursorHover);

// ==========================================
// 2. VARIABLES & SCROLL SPY (Active Link)
// ==========================================
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.floating-nav ul li a');
const homeLink = document.querySelector('.nav-home-link');

const marker = document.querySelector('.nav-marker');

// Check if we're on the about page
const isAboutPage = window.location.pathname.includes('about.html');

function positionMarker(link) {
    if (!marker || !link) return;
    const markerSidePadding = 8;
    marker.style.left = `${link.offsetLeft - markerSidePadding}px`;
    marker.style.top = `${link.offsetTop}px`;
    marker.style.width = `${link.offsetWidth + markerSidePadding * 2}px`;
    marker.style.height = `${link.offsetHeight}px`;
    marker.style.opacity = '1';
}

function syncMarkerToActive() {
    const activeLink = document.querySelector('.floating-nav a.active');
    if (activeLink) positionMarker(activeLink);
}

// Suppress scroll spy while a programmatic smooth scroll is in flight, so
// intermediate sections don't briefly flash as active.
let isAutoScrolling = false;
let autoScrollTimer = null;

function setActiveNavLink(link) {
    if (!link) return;
    navLinks.forEach(a => {
        a.classList.remove('active');
        a.removeAttribute('aria-current');
    });
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
    positionMarker(link);
}

function updateActiveSection() {
    // Skip scroll spy on about page - keep the active class set in HTML
    if (isAboutPage) return;
    if (isAutoScrolling) return;
    
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
            positionMarker(a);
        }
    });
}

// Run immediately when page loads so the marker snaps to the right link, then
// enable transitions on the next frame so the initial placement doesn't slide
// in from (0,0).
document.addEventListener('DOMContentLoaded', () => {
    // If the page loaded with a hash that points at one of our nav sections
    // (e.g. coming from About → Work which lands at index.html#case-studies),
    // pre-activate that link BEFORE the marker becomes "ready". This places
    // the pill directly on the destination instead of letting scroll-spy first
    // place it on Home and then animate over.
    const hashLink = (!isAboutPage && window.location.hash)
        ? document.querySelector(`.floating-nav a[href="${window.location.hash}"]`)
        : null;

    if (isAboutPage) {
        syncMarkerToActive();
    } else if (hashLink) {
        isAutoScrolling = true;
        setActiveNavLink(hashLink);
        if (autoScrollTimer) clearTimeout(autoScrollTimer);
        autoScrollTimer = setTimeout(() => {
            isAutoScrolling = false;
            autoScrollTimer = null;
            updateActiveSection();
        }, 1500);
    } else {
        updateActiveSection();
    }
    requestAnimationFrame(() => {
        if (marker) marker.classList.add('ready');
    });
});

// Run whenever the user scrolls
window.addEventListener('scroll', updateActiveSection);

// Keep the marker aligned if the layout changes (resize / orientation)
window.addEventListener('resize', syncMarkerToActive);


// ==========================================
// 2. ANCHOR LINK NAVIGATION
// ==========================================

// Unified floating-nav click handler (capture phase). Ensures the active-pill
// always animates between Home / Work / About / Resume, regardless of whether
// the destination is a same-page anchor (e.g. #case-studies) or a different
// page (e.g. ../index.html or html/about.html).
document.addEventListener('click', function(e) {
  const a = e.target.closest('.floating-nav a');
  if (!a) return;
  // Resume opens in a new tab — let the browser handle it natively.
  if (a.target === '_blank') return;
  // Modifier-click → let browser open in a new tab/window normally.
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  const href = a.getAttribute('href');
  if (!href || href === '#') return;

  // Always pre-activate the clicked link so the marker animates immediately.
  setActiveNavLink(a);

  // Stop the generic anchor handler below from also firing for this click.
  e.preventDefault();
  e.stopPropagation();

  // Same-page anchor: smooth-scroll and lock scroll-spy for the duration.
  if (href.startsWith('#')) {
    const target = document.querySelector(href);
    if (!target) return;

    const header = document.querySelector('.site-header');
    const headerOffset = header ? header.offsetHeight : 0;
    const targetTop = target.getBoundingClientRect().top + window.pageYOffset - Math.round(headerOffset * 0.9);

    isAutoScrolling = true;
    if (autoScrollTimer) clearTimeout(autoScrollTimer);
    autoScrollTimer = setTimeout(() => {
      isAutoScrolling = false;
      autoScrollTimer = null;
      updateActiveSection();
    }, 750);

    // Defer the smooth scroll one frame so the marker transition kicks off
    // before the browser starts repainting scroll updates.
    requestAnimationFrame(() => {
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
    return;
  }

  // Cross-page navigation: wait for the pill animation (~0.45s) to play,
  // then navigate.
  setTimeout(() => {
    window.location.href = a.href;
  }, 450);
}, true);

// Generic anchor smooth-scroll handler for links OUTSIDE the floating nav
// (e.g. the case study hero "see more" arrow). Floating-nav anchors are
// already handled above and stop propagation so they don't reach here.
document.addEventListener('click', function(e) {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (!href || href === '#') return;

  const target = document.querySelector(href);
  if (!target) return;

  e.preventDefault();

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
  const caseNav = document.querySelector('.case-floating-nav');
  if (!caseNav) return;

  const caseNavLinks = caseNav.querySelectorAll('.case-nav-link');
  if (caseNavLinks.length === 0) return;

  const caseMarker = caseNav.querySelector('.case-nav-marker');

  // Get all section IDs from the nav links
  const sectionIds = Array.from(caseNavLinks).map(link => {
    const href = link.getAttribute('href');
    return href ? href.substring(1) : null;
  }).filter(Boolean);

  const firstSection = document.getElementById(sectionIds[0]);

  // Suppress scroll spy while a programmatic smooth scroll is in flight, so
  // intermediate sections don't briefly flash as active.
  let isAutoScrolling = false;
  let autoScrollFallbackTimer = null;
  let scrollEndProbeTimer = null;
  let scrollEndProbeListener = null;

  function releaseAutoScrollLock() {
    if (scrollEndProbeListener) {
      window.removeEventListener('scroll', scrollEndProbeListener);
      scrollEndProbeListener = null;
    }
    if (scrollEndProbeTimer) {
      clearTimeout(scrollEndProbeTimer);
      scrollEndProbeTimer = null;
    }
    if (autoScrollFallbackTimer) {
      clearTimeout(autoScrollFallbackTimer);
      autoScrollFallbackTimer = null;
    }
    isAutoScrolling = false;
  }

  // Lock scroll-spy until the smooth scroll truly settles. We listen for scroll
  // events and only release once 140ms pass with no further movement (i.e. the
  // smooth scroll has stopped), with a hard 3s fallback in case no scroll fires
  // (e.g. when the target is already in view).
  function lockUntilScrollSettles() {
    releaseAutoScrollLock();
    isAutoScrolling = true;

    scrollEndProbeListener = () => {
      if (scrollEndProbeTimer) clearTimeout(scrollEndProbeTimer);
      scrollEndProbeTimer = setTimeout(() => {
        releaseAutoScrollLock();
        updateActiveCaseSection();
      }, 140);
    };
    window.addEventListener('scroll', scrollEndProbeListener, { passive: true });

    autoScrollFallbackTimer = setTimeout(() => {
      releaseAutoScrollLock();
      updateActiveCaseSection();
    }, 3000);
  }

  function positionCaseMarker(link) {
    if (!caseMarker || !link) return;
    const sidePadding = 8;
    caseMarker.style.left = `${link.offsetLeft - sidePadding}px`;
    caseMarker.style.top = `${link.offsetTop}px`;
    caseMarker.style.width = `${link.offsetWidth + sidePadding * 2}px`;
    caseMarker.style.height = `${link.offsetHeight}px`;
    caseMarker.style.opacity = '1';
  }

  function hideCaseMarker() {
    if (!caseMarker) return;
    caseMarker.style.opacity = '0';
  }

  function setActiveCaseLink(link) {
    caseNavLinks.forEach(a => a.classList.remove('active'));
    if (link) {
      link.classList.add('active');
      positionCaseMarker(link);
    } else {
      hideCaseMarker();
    }
  }

  function updateActiveCaseSection() {
    if (isAutoScrolling) return;

    let current = null;

    if (firstSection) {
      const firstSectionTop = firstSection.offsetTop;
      if (window.scrollY >= (firstSectionTop - window.innerHeight * 0.4)) {
        sectionIds.forEach((id) => {
          const section = document.getElementById(id);
          if (section) {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - window.innerHeight * 0.4)) {
              current = id;
            }
          }
        });
      }
    }

    const matching = current
      ? Array.from(caseNavLinks).find(l => l.getAttribute('href') === `#${current}`)
      : null;
    setActiveCaseLink(matching || null);
  }

  // Pre-activate the matching case-nav link on click and lock scroll spy
  // for the duration of the smooth scroll.
  caseNav.addEventListener('click', (e) => {
    const a = e.target.closest('.case-nav-link');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    setActiveCaseLink(a);
    lockUntilScrollSettles();
  });

  window.addEventListener('scroll', updateActiveCaseSection, { passive: true });
  window.addEventListener('resize', () => {
    const active = caseNav.querySelector('.case-nav-link.active');
    if (active) positionCaseMarker(active);
  });

  updateActiveCaseSection();
  requestAnimationFrame(() => {
    if (caseMarker) caseMarker.classList.add('ready');
  });
}

document.addEventListener('DOMContentLoaded', initCaseStudyScrollSpy);

// ==========================================
// PARALLAX FLOATING IMAGES (Case Study Hero)
// ==========================================
function initParallaxFloatingImages() {
  const floatingImages = document.querySelectorAll('.floating-img-convoy-1, .floating-img-convoy-2, .floating-img-convoy-3, .floating-img-convoy-4, .floating-img-convoy-5, .floating-img-convoy-6, .floating-img-vigil-1, .floating-img-vigil-2, .floating-img-vigil-3, .floating-img-vigil-4, .floating-img-vigil-5, .floating-img-flock-1, .floating-img-flock-2, .floating-img-flock-3, .floating-img-flock-4, .floating-img-flock-5');
  
  if (floatingImages.length === 0) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  
  // Different parallax speeds for each image (larger = more movement).
  // Vigil gets stronger motion than Convoy without changing Convoy's feel.
  const defaultSpeeds = [0.45, 0.38, 0.19, 0.35, 0.28, 0.10]; // index 5 = convoy-6 (less dramatic)
  const vigilSpeeds = [0.6, 0.5, 0.32, 0.45, 0.28];

  floatingImages.forEach(img => {
    img.style.willChange = 'transform';
  });

  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;

    floatingImages.forEach((img, index) => {
      const vigilMatch = img.className.match(/floating-img-vigil-(\d+)/);
      const speed = vigilMatch
        ? vigilSpeeds[Number(vigilMatch[1]) - 1] || 0.4
        : defaultSpeeds[index] || 0.1;
      const yOffset = scrollY * speed;
      img.style.transform = `translate3d(0, ${yOffset}px, 0)`;
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
  const caseStudyLinks = document.querySelectorAll('a.case-card[href*="case-study"]');
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

// Initialize on case study pages
document.addEventListener('DOMContentLoaded', initCaseStudyNavSlideDown);

// ==========================================
// LOTTIE ANIMATION (Hero Screen)
// ==========================================
let lottieAnimation = null;
let animationInitialized = false;
let lottieRetryCount = 0;
const maxRetries = 40;

function initLottieAnimation() {
    if (animationInitialized) return;

    const container = document.getElementById('lottie-container');
    if (!container) {
        if (lottieRetryCount < maxRetries) {
            lottieRetryCount++;
            setTimeout(initLottieAnimation, 100);
        }
        return;
    }

    if (!window.lottie) {
        if (lottieRetryCount < maxRetries) {
            lottieRetryCount++;
            setTimeout(initLottieAnimation, 100);
        }
        return;
    }

    lottieRetryCount = 0;

    try {
        animationInitialized = true;
        lottieAnimation = lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: '../media/HeroPage/gmdesign06.json'
        });

        lottieAnimation.addEventListener('data_ready', () => {
            if (lottieAnimation && typeof lottieAnimation.setSpeed === 'function') {
                lottieAnimation.setSpeed(2);
            }
            setTimeout(() => {
                if (lottieAnimation) lottieAnimation.play();
            }, 500);
        });

        lottieAnimation.addEventListener('data_failed', () => {
            if (window.location.protocol === 'file:') {
                animationInitialized = true;
            } else {
                animationInitialized = false;
                setTimeout(() => {
                    if (!animationInitialized) initLottieAnimation();
                }, 1000);
            }
        });

    } catch (error) {
        if (window.location.protocol === 'file:') {
            animationInitialized = true;
        } else {
            animationInitialized = false;
            setTimeout(() => {
                if (!animationInitialized) initLottieAnimation();
            }, 1000);
        }
    }
}

function waitForLottie() {
    if (window.lottie) {
        initLottieAnimation();
    } else if (lottieRetryCount < maxRetries) {
        lottieRetryCount++;
        setTimeout(waitForLottie, 50);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForLottie);
} else {
    waitForLottie();
}

window.addEventListener('load', function() {
    if (!animationInitialized) waitForLottie();
});

// ==========================================
// LOADING COMPLETION EVENT
// ==========================================
window.loadingComplete = true;

function dispatchLoadingComplete() {
    var event;
    if (typeof CustomEvent === 'function') {
        event = new CustomEvent('loadingComplete');
    } else {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent('loadingComplete', false, false, null);
    }
    window.dispatchEvent(event);
}

document.addEventListener('DOMContentLoaded', dispatchLoadingComplete);
