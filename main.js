// Always start at the top on load unless navigating to a deep-link section.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function ensurePageStartsAtTop() {
  const hash = window.location.hash;
  if (hash && hash !== '#hero') return;
  window.scrollTo(0, 0);
}

ensurePageStartsAtTop();
document.addEventListener('DOMContentLoaded', ensurePageStartsAtTop);
window.addEventListener('load', ensurePageStartsAtTop);

document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.bottom-blur')) {
    const bottomBlur = document.createElement('div');
    bottomBlur.className = 'bottom-blur';
    bottomBlur.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bottomBlur);
  }
});

// ==========================================
// 1. CUSTOM CURSOR WITH DELAY
// ==========================================

/** Root-relative asset prefix: pages in /html/ use ../ ; site root (index) uses '' */
function siteAssetPrefix() {
  return window.location.pathname.includes('/html/') ? '../' : '';
}

// Handle hash navigation on page load (for cross-page links like Work from About page)
if (window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname.endsWith('/index.html')) {
  if (window.location.hash && window.location.hash !== '#hero') {
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
  arrowEl2.src = siteAssetPrefix() + 'media/HeroPage/arrowAngleUp.svg';
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
  const speed = 0.26;
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
  const heroCanvas = document.querySelector('.hero-canvas');

  setTimeout(() => {
    if (navGroup) navGroup.classList.add('animate-in');
  }, 100);

  setTimeout(() => {
    if (heroCaption) heroCaption.classList.add('animate-in');
    if (heroCanvas) heroCanvas.classList.add('animate-in');

    // Wall pics start stacked in the center and spread out one by one.
    // The cursor + text box animation only begins once they've all landed.
    initWallPicsSpread(() => {
      initHeroCursorAnimation();
    });
  }, 100);
}

// ==========================================
// HERO WALL PICTURES — SPREAD ENTRANCE
// All images start layered in the center, then move one by one to
// their designated spots. Runs onComplete once the last picture lands.
// ==========================================
function initWallPicsSpread(onComplete) {
  const container = document.querySelector('.hero-canvas-inner');
  const wallPics = Array.from(document.querySelectorAll('.wall-pic'));
  const done = () => { if (typeof onComplete === 'function') onComplete(); };

  if (!container || wallPics.length === 0) {
    done();
    return;
  }

  // Reduced motion: drop the pictures straight into place.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    wallPics.forEach(pic => {
      pic.style.transition = 'none';
      pic.classList.add('animate-in', 'entrance-done');
    });
    done();
    return;
  }

  // Wait for the wall images so their measured positions are accurate
  // (loadingComplete fires before images necessarily finish decoding).
  function waitForImages(images) {
    const pending = images.filter(img => !(img.complete && img.naturalHeight > 0));
    if (pending.length === 0) return Promise.resolve();
    return new Promise(resolve => {
      let remaining = pending.length;
      const settle = () => { remaining -= 1; if (remaining <= 0) resolve(); };
      pending.forEach(img => {
        img.addEventListener('load', settle, { once: true });
        img.addEventListener('error', settle, { once: true });
      });
      // Safety net so the hero never gets stuck waiting on a stalled image.
      setTimeout(resolve, 1200);
    });
  }

  function runSpread() {
    const cx = container.clientWidth / 2;
    const cy = container.clientHeight / 2;
    const order = [2, 3, 4, 5, 6, 1];
    const PAUSE = 280;    // hold stacked in the center before spreading
    const STEP = 50;      // gap between each picture releasing
    const DURATION = 240; // travel time per picture
    const EASING = 'ease-out';
    const STACK_SCALE = 1.0;
    const STACK_SCALE_LANDSCAPE = 0.72;

    function stackScaleFor(pic) {
      // Eagles stays full size on top of the stack.
      if (pic.classList.contains('wall-pic-1')) return STACK_SCALE;
      const w = pic.naturalWidth;
      const h = pic.naturalHeight;
      if (w > 0 && h > 0 && w > h) return STACK_SCALE_LANDSCAPE;
      return STACK_SCALE * 0.86;
    }

    function picCenterInContainer(pic) {
      const containerRect = container.getBoundingClientRect();
      const picRect = pic.getBoundingClientRect();
      return {
        x: picRect.left - containerRect.left + picRect.width / 2,
        y: picRect.top - containerRect.top + picRect.height / 2,
      };
    }

    // Stack every picture in the center (no transition).
    wallPics.forEach(pic => {
      const { x: px, y: py } = picCenterInContainer(pic);
      const dx = cx - px;
      const dy = cy - py;
      const scale = stackScaleFor(pic);
      pic.style.transition = 'none';
      pic.style.transform = `translate(${dx}px, ${dy}px) scale(${scale}) rotate(0deg)`;
      pic.style.opacity = '1';
    });

    // Commit the stacked state before animating out.
    void container.offsetHeight;

    requestAnimationFrame(() => {
      wallPics.forEach(pic => {
        pic.style.transition = `transform ${DURATION}ms ${EASING}, opacity 0.2s ease-out, box-shadow 0.25s ease-out`;
        pic.style.transitionDelay = '0s';
      });

      // Hold the stack briefly, then release pictures one by one.
      order.forEach((n, i) => {
        const pic = container.querySelector('.wall-pic-' + n);
        if (!pic) return;
        setTimeout(() => {
          pic.style.transform = '';
          pic.classList.add('animate-in');
        }, PAUSE + i * STEP);
      });

      const total = PAUSE + (order.length - 1) * STEP + DURATION;
      setTimeout(() => {
        wallPics.forEach(pic => {
          pic.style.transition = '';
          pic.style.transitionDelay = '';
          pic.style.transform = '';
          pic.classList.add('entrance-done');
        });
        done();
      }, total + 80);
    });
  }

  waitForImages(wallPics).then(runSpread);
}

// ==========================================
// HERO CURSOR ANIMATION — plays once on load
// ==========================================
function initHeroCursorAnimation() {
  const stage = document.getElementById('hero-stage');
  if (!stage) return;

  const cursor   = document.getElementById('hero-cursor');
  const textbox  = document.getElementById('hero-textbox');
  const typed    = document.getElementById('hero-typed');
  const hint     = document.getElementById('hero-textbox-hint');
  const handles  = {
    tl: document.getElementById('hero-h-tl'),
    tr: document.getElementById('hero-h-tr'),
    bl: document.getElementById('hero-h-bl'),
    br: document.getElementById('hero-h-br'),
  };

  const FIRST_TEXT = "Hey, I’m Giuseppe";
  const FINAL_TEXT = "Welcome to my portfolio";
  const TYPE_CHAR_MS = 72;
  const DELETE_CHAR_MS = 48;
  const CURSOR_ENTRANCE_MS = 520;
  const BOX_H_PAD = 28;
  let measureCanvas;

  function measureTextWidth(text, fontSize) {
    if (!measureCanvas) measureCanvas = document.createElement('canvas');
    const ctx = measureCanvas.getContext('2d');
    ctx.font = `500 ${fontSize}px Inter, system-ui, -apple-system, sans-serif`;
    return ctx.measureText(text).width;
  }

  function lerp(a, b, t)    { return a + (b - a) * t; }
  function easeInOut(t)     { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
  function easeOut(t)       { return 1 - (1 - t) * (1 - t); }

  let animFrame;
  let animationComplete = false;

  function getMetrics() {
    const W = stage.offsetWidth;
    const H = stage.offsetHeight;
    if (W < 50 || H < 50) return null;

    const boxCX = W / 2;
    const boxCY = H / 2;
    const hs = Math.round(Math.max(13, Math.min(W, H) * 0.02));
    const edge = Math.max(16, Math.min(W, H) * 0.04);
    const maxW = W - edge * 2;
    const maxH = H - edge * 2;

    // Final box — scales with viewport, capped on large screens
    let finalW = Math.min(W * 0.78, 580, maxW);
    let finalH = Math.min(H * 0.31, 118, maxH);
    let finalFS = Math.min(finalH * 0.42, 48);

    while (finalFS > 14 && Math.max(
      measureTextWidth(FIRST_TEXT, finalFS),
      measureTextWidth(FINAL_TEXT, finalFS)
    ) + BOX_H_PAD > finalW) {
      finalFS -= 1;
    }
    finalH = Math.min(Math.max(finalFS / 0.42, finalFS + 16), maxH);

    const textW = Math.max(
      measureTextWidth(FIRST_TEXT, finalFS),
      measureTextWidth(FINAL_TEXT, finalFS)
    ) + BOX_H_PAD;
    finalW = Math.min(Math.max(finalW, textW), maxW);

    // Initial box — always smaller than final so the expand phase grows the box
    let targetW = Math.min(W * 0.41, finalW * 0.72, maxW);
    let targetH = Math.min(H * 0.20, finalH * 0.72, maxH);
    const targetFS = targetH * 0.4;

    targetW = Math.min(Math.max(targetW, 80), finalW * 0.82);
    targetH = Math.min(Math.max(targetH, 32), finalH * 0.82);

    const drawStartX   = boxCX - targetW / 2;
    const drawStartY   = boxCY - targetH / 2;
    const cursorStartX = drawStartX;
    const cursorStartY = drawStartY;
    const cursorEntranceX = W - edge * 1.5;
    const cursorEntranceY = H - edge * 1.5;
    const drawEndX     = boxCX + targetW / 2;
    const drawEndY     = boxCY + targetH / 2;
    const trHandleX    = boxCX + targetW / 2 - hs / 2;
    const trHandleY    = boxCY - targetH / 2 - hs / 2;
    const finalTrX     = boxCX + finalW / 2 - hs / 2;
    const finalTrY     = boxCY - finalH / 2 - hs / 2;

    return {
      W, H, hs, boxCX, boxCY,
      targetW, targetH, targetFS,
      finalW, finalH, finalFS,
      cursorStartX, cursorStartY,
      cursorEntranceX, cursorEntranceY,
      drawStartX, drawStartY,
      drawEndX, drawEndY,
      trHandleX, trHandleY,
      finalTrX, finalTrY,
    };
  }

  function setCursor(x, y) {
    cursor.style.left = `${x}px`;
    cursor.style.top  = `${y}px`;
  }

  function setCursorOpacity(op) {
    cursor.style.opacity = op;
  }

  function applyBox(cx, cy, w, h, fontSize, hs) {
    const left = cx - w / 2;
    const top  = cy - h / 2;
    textbox.style.left   = `${left}px`;
    textbox.style.top    = `${top}px`;
    textbox.style.width  = `${w}px`;
    textbox.style.height = `${h}px`;
    typed.style.fontSize = `${fontSize}px`;
    const ho = hs / 2;
    Object.values(handles).forEach(handle => {
      handle.style.width  = `${hs}px`;
      handle.style.height = `${hs}px`;
    });
    handles.tl.style.left = `${left - ho}px`;
    handles.tl.style.top  = `${top  - ho}px`;
    handles.tr.style.left = `${left + w - ho}px`;
    handles.tr.style.top  = `${top  - ho}px`;
    handles.bl.style.left = `${left - ho}px`;
    handles.bl.style.top  = `${top  + h - ho}px`;
    handles.br.style.left = `${left + w - ho}px`;
    handles.br.style.top  = `${top  + h - ho}px`;
    if (hint) {
      hint.style.left = `${left}px`;
      hint.style.top = `${top + h + 10}px`;
      hint.style.width = `${w}px`;
    }
  }

  function showBox(show) {
    const op = show ? '1' : '0';
    textbox.style.opacity = op;
    Object.values(handles).forEach(h => h.style.opacity = op);
  }

  function hideHint() {
    if (hint) hint.classList.remove('visible');
  }

  function showHint() {
    if (hint) hint.classList.add('visible');
  }

  function applyFinalState() {
    const m = getMetrics();
    if (!m) return;
    typed.textContent = FINAL_TEXT;
    applyBox(m.boxCX, m.boxCY, m.finalW, m.finalH, m.finalFS, m.hs);
    showBox(true);
    setCursorOpacity(0);
    showHint();
  }

  function runAnimation() {
    const m0 = getMetrics();
    if (!m0) return;

    animationComplete = false;

    // Phases:
    //  0 cursor enters from bottom-right (move + fade in)
    //  1 hold cursor at draw start
    //  2 drag down-right to draw the box
    //  3 type "Hey, I’m Giuseppe"
    //  4 hold after first line
    //  5 delete first line
    //  6 type "Welcome to my portfolio"
    //  7 hold after second line
    //  8 move cursor to top-right handle
    //  9 expand animation (cursor follows top-right handle)
    // 10 hold after expand
    // 11 cursor fade out
    const TYPE_FIRST_MS = FIRST_TEXT.length * TYPE_CHAR_MS;
    const DELETE_MS = FIRST_TEXT.length * DELETE_CHAR_MS;
    const TYPE_SECOND_MS = FINAL_TEXT.length * TYPE_CHAR_MS;
    const phases = [
      CURSOR_ENTRANCE_MS,
      250,
      640,
      TYPE_FIRST_MS,
      280,
      DELETE_MS,
      TYPE_SECOND_MS,
      320,
      480,
      720,
      400,
      400,
    ];
    const ends   = [];
    let acc = 0;
    phases.forEach(d => { acc += d; ends.push(acc); });

    showBox(false);
    hideHint();
    typed.textContent = '';
    setCursorOpacity(0);
    setCursor(m0.cursorEntranceX, m0.cursorEntranceY);

    let start = null;

    function pT(i, elapsed) {
      const s = i === 0 ? 0 : ends[i - 1];
      return Math.max(0, Math.min(1, (elapsed - s) / phases[i]));
    }

    function typedTextForElapsed(el) {
      if (el < ends[2]) return '';

      if (el < ends[3]) {
        const t = pT(3, el);
        return FIRST_TEXT.slice(0, Math.floor(t * FIRST_TEXT.length));
      }

      if (el < ends[4]) return FIRST_TEXT;

      if (el < ends[5]) {
        const t = pT(5, el);
        const remaining = Math.ceil((1 - t) * FIRST_TEXT.length);
        return FIRST_TEXT.slice(0, remaining);
      }

      if (el < ends[6]) {
        const t = pT(6, el);
        return FINAL_TEXT.slice(0, Math.floor(t * FINAL_TEXT.length));
      }

      return FINAL_TEXT;
    }

    function frame(ts) {
      const m = getMetrics();
      if (!m) {
        animFrame = requestAnimationFrame(frame);
        return;
      }

      if (!start) start = ts;
      const el = ts - start;
      const typedText = typedTextForElapsed(el);

      if (el < ends[0]) {
        // 0. Enter from bottom-right — move and fade in to draw start
        const p = easeOut(pT(0, el));
        setCursorOpacity(p);
        setCursor(
          lerp(m.cursorEntranceX, m.drawStartX, p),
          lerp(m.cursorEntranceY, m.drawStartY, p)
        );
        showBox(false);
      } else if (el < ends[1]) {
        // 1. Hold cursor at draw start
        setCursorOpacity(1);
        setCursor(m.drawStartX, m.drawStartY);
        showBox(false);
      } else if (el < ends[2]) {
        // 2. Drag down-right to draw the box
        setCursorOpacity(1);
        const p = easeInOut(pT(2, el));
        const w = lerp(0, m.targetW, p);
        const h = lerp(0, m.targetH, p);
        applyBox(m.drawStartX + w/2, m.drawStartY + h/2, w, h, m.targetFS, m.hs);
        showBox(true);
        setCursor(m.drawStartX + w, m.drawStartY + h);
        typed.textContent = '';
      } else if (el < ends[7]) {
        // 3–7. Type first line, delete it, then type welcome message
        setCursorOpacity(1);
        typed.textContent = typedText;
        applyBox(m.boxCX, m.boxCY, m.targetW, m.targetH, m.targetFS, m.hs);
        showBox(true);
        setCursor(m.drawEndX, m.drawEndY);
      } else if (el < ends[8]) {
        // 8. Move from bottom-right corner → top-right handle
        setCursorOpacity(1);
        typed.textContent = FINAL_TEXT;
        applyBox(m.boxCX, m.boxCY, m.targetW, m.targetH, m.targetFS, m.hs);
        showBox(true);
        const p = easeInOut(pT(8, el));
        setCursor(lerp(m.drawEndX, m.trHandleX, p), lerp(m.drawEndY, m.trHandleY, p));
      } else if (el < ends[9]) {
        // 9. Expand the box (cursor follows top-right handle)
        setCursorOpacity(1);
        typed.textContent = FINAL_TEXT;
        const p = easeInOut(pT(9, el));
        applyBox(m.boxCX, m.boxCY, lerp(m.targetW, m.finalW, p), lerp(m.targetH, m.finalH, p), lerp(m.targetFS, m.finalFS, p), m.hs);
        showBox(true);
        setCursor(lerp(m.trHandleX, m.finalTrX, p), lerp(m.trHandleY, m.finalTrY, p));
      } else if (el < ends[10]) {
        // 10. Hold after expand
        setCursorOpacity(1);
        typed.textContent = FINAL_TEXT;
        applyBox(m.boxCX, m.boxCY, m.finalW, m.finalH, m.finalFS, m.hs);
        showBox(true);
        setCursor(m.finalTrX, m.finalTrY);
      } else if (el < ends[11]) {
        // 11. Cursor fade out
        typed.textContent = FINAL_TEXT;
        applyBox(m.boxCX, m.boxCY, m.finalW, m.finalH, m.finalFS, m.hs);
        showBox(true);
        setCursor(m.finalTrX, m.finalTrY);
        setCursorOpacity(1 - pT(11, el));
      } else {
        animationComplete = true;
        applyFinalState();
        return;
      }

      animFrame = requestAnimationFrame(frame);
    }

    animFrame = requestAnimationFrame(frame);
  }

  function startWhenReady() {
    if (getMetrics()) {
      runAnimation();
    } else {
      requestAnimationFrame(startWhenReady);
    }
  }

  if (typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver(() => {
      if (animationComplete) applyFinalState();
    });
    resizeObserver.observe(stage);
  } else {
    window.addEventListener('resize', () => {
      if (animationComplete) applyFinalState();
    });
  }

  startWhenReady();
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
    '.work-card, ' +
    'section:not(#hero) h2, ' +
    'section:not(#hero) h3, ' +
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
    '.about-cta-link, ' +
    '.about-cta-text, ' +
    '.about-cta-section .profile-card, ' +
    '.about-cta-section .about-hero-text, ' +
    '.about-cta-section .about-cta-btn, ' +
    '.about-page .about-hero-title, ' +
    '.about-page .about-hero-image, ' +
    '.about-page .about-body-text, ' +
    '.about-page .about-contact-cta, ' +
    '.mac-window, ' +
    '.mac-photo-card, ' +
    '.resume-row, ' +
    '.resume-download, ' +
    '.case-section, ' +
    '.case-image, ' +
    '.problem-corey-meet, ' +
    '.problem-corey-dead, ' +
    '.problem-corey-health, ' +
    '.coral-research-img, ' +
    '.case-hero-main-image--convoy img, .case-hero-main-image--coral img, .case-hero-main-image--vigil img, .case-hero-main-image--flock img, ' +
    '.floating-img-convoy-1, .floating-img-convoy-2, .floating-img-convoy-3, .floating-img-convoy-4, .floating-img-convoy-5, .floating-img-convoy-6, .floating-img-coral-1, .floating-img-coral-2, .floating-img-coral-3, .floating-img-coral-4, .floating-img-coral-5, .floating-img-coral-6, .floating-img-vigil-1, .floating-img-vigil-2, .floating-img-vigil-3, .floating-img-vigil-4, .floating-img-vigil-5, .floating-img-flock-1, .floating-img-flock-2, .floating-img-flock-3, .floating-img-flock-4, .floating-img-flock-5, ' +
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
    if (element.tagName === 'H3' && element.closest('.case-body')) return;
    if (element.closest('.skills-carousel')) return;
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

// ==========================================
// SKILLS CAROUSEL — pixel-perfect seamless loop
// ==========================================
function initSkillsCarousel() {
  const carousels = document.querySelectorAll('.skills-carousel');
  if (carousels.length === 0) return;

  carousels.forEach((carousel) => {
    const items = carousel.querySelectorAll(':scope > .skill-item');
    if (items.length < 2 || items.length % 2 !== 0) return;

    const updateScrollDistance = () => {
      const halfIndex = items.length / 2;
      const loopPoint = items[halfIndex];
      if (!loopPoint) return;
      carousel.style.setProperty('--carousel-scroll', `-${loopPoint.offsetLeft}px`);
      carousel.classList.add('skills-carousel--ready');
    };

    const images = carousel.querySelectorAll('img');
    const imagePromises = [...images].map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    });

    Promise.all(imagePromises).then(updateScrollDistance);
    window.addEventListener('resize', updateScrollDistance, { passive: true });
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initScrollFadeAnimations);
document.addEventListener('DOMContentLoaded', initSkillsCarousel);

// ==========================================
// CASE STUDIES — TYPOGRAPHIC WIDOWS
// Tie last two words with NBSP on plain-text blocks so the last line
// cannot end with a single word (CSS text-wrap: pretty assists where supported).
// ==========================================
function normalizeSpacesForWidowFix(text) {
  return text.replace(/\u00A0/g, ' ').trim().replace(/\s+/g, ' ');
}

function tieLastTwoWords(text) {
  const trimmed = normalizeSpacesForWidowFix(text);
  if (!trimmed) return text;
  const words = trimmed.split(' ');
  if (words.length < 2) return text;
  const tail = words.slice(-2).join('\u00A0');
  const head = words.slice(0, -2).join(' ');
  return head ? `${head} ${tail}` : tail;
}

function initCaseStudyWidowPrevention() {
  const layout = document.querySelector('.case-layout');
  if (!layout) return;

  const selector = [
    'p',
    'li',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'figcaption',
    '.section-heading',
    '.section-intro',
    '.overview-project-title',
    '.overview-subtitle',
    '.overview-column-heading',
    '.overview-role-description',
    '.robot-comparison-caption',
    '.info-card-value',
    '.info-card-label',
    '.result-label'
  ].join(',');

  layout.querySelectorAll(selector).forEach((el) => {
    if (el.closest('footer')) return;
    if (el.dataset.widowTied === 'true') return;
    if (el.childElementCount > 0) return;

    const raw = el.textContent;
    if (!raw || !normalizeSpacesForWidowFix(raw)) return;

    el.textContent = tieLastTwoWords(raw);
    el.dataset.widowTied = 'true';
  });
}

document.addEventListener('DOMContentLoaded', initCaseStudyWidowPrevention);

// Handle cursor pill-expand on case card hover
let hoveredElements = new Set();

function setupCursorHover(element) {
  element.addEventListener('mouseenter', () => {
    if (!cursor) return;
    const card = element.closest('.case-card, .work-card');
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

  // Apply to both old case-cards and new work-cards
  document.querySelectorAll('.case-card, .work-card').forEach(card => {
    setupCursorHover(card);
  });

  // Also apply to case figures and case body separately for better coverage
  document.querySelectorAll('.case-figure, .work-card-image-wrap').forEach(el => {
    setupCursorHover(el);
  });

  document.querySelectorAll('.case-body').forEach(body => {
    setupCursorHover(body);
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initCaseStudyCursorHover);

// Prevent navigation for coming-soon cards while preserving hover states.
document.addEventListener('click', (e) => {
  const disabledCard = e.target.closest('.case-card[data-disabled="true"], .work-card[data-disabled="true"]');
  if (!disabledCard) return;
  e.preventDefault();
}, true);

// ==========================================
// WALL PHOTO CURSOR HOVER (about page mac photos only — not hero wall pics)
// ==========================================
function initWallPicCursorHover() {
  const photoCards = document.querySelectorAll('.mac-photo-card[data-cursor-label]');
  if (!cursor || photoCards.length === 0) return;

  photoCards.forEach(pic => {
    pic.addEventListener('mouseenter', () => {
      const label = pic.dataset.cursorLabel || '';
      if (cursorLabelEl) cursorLabelEl.textContent = label;
      const labelWidth = Math.min(Math.max(label.length * 7.5 + 36, 96), 320);
      cursor.style.setProperty('--cursor-expanded-width', `${labelWidth}px`);
      cursor.classList.add('expanded', 'no-arrow');
    });

    pic.addEventListener('mouseleave', () => {
      cursor.classList.remove('expanded', 'no-arrow');
      cursor.style.removeProperty('--cursor-expanded-width');
      if (cursorLabelEl) cursorLabelEl.textContent = 'View Project';
    });
  });
}

document.addEventListener('DOMContentLoaded', initWallPicCursorHover);

// ==========================================
// 2. NAV SCROLL SPY + CLICK HANDLING
// ==========================================
// Exclude #about — it is a CTA preview, not the full About page; Work stays active there.
const navSections = ['hero', 'case-studies']
  .map((id) => document.getElementById(id))
  .filter(Boolean);
const navLinks = document.querySelectorAll('.floating-nav ul li a');
const mainFloatingNav = document.querySelector('.floating-nav');
const mainNavList = mainFloatingNav?.querySelector('ul');
const mainNavMarker = mainFloatingNav?.querySelector('.nav-marker');
const isAboutPage = window.location.pathname.includes('about.html');
let activeNavHref = '';
let mainNavAutoScrolling = false;
let mainNavScrollEndTimer = null;

function positionMainNavMarker(link) {
  if (!mainNavMarker || !mainNavList || !link) return;
  const sidePadding = 8;
  const listRect = mainNavList.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  mainNavMarker.style.left = `${linkRect.left - listRect.left - sidePadding}px`;
  mainNavMarker.style.top = `${linkRect.top - listRect.top}px`;
  mainNavMarker.style.width = `${linkRect.width + sidePadding * 2}px`;
  mainNavMarker.style.height = `${linkRect.height}px`;
  mainNavMarker.style.opacity = '1';
}

function hideMainNavMarker() {
  if (!mainNavMarker) return;
  mainNavMarker.style.opacity = '0';
}

function setActiveNav(href) {
  if (href === activeNavHref) return;
  activeNavHref = href;

  let activeLink = null;
  navLinks.forEach((a) => {
    const match = a.getAttribute('href') === href;
    a.classList.toggle('active', match);
    if (match) {
      a.setAttribute('aria-current', 'page');
      activeLink = a;
    } else {
      a.removeAttribute('aria-current');
    }
  });

  if (activeLink) positionMainNavMarker(activeLink);
  else hideMainNavMarker();
}

function initMainNavMarker() {
  if (!mainNavMarker) return;

  const syncMarker = () => {
    const active = mainFloatingNav?.querySelector('a.active, a[aria-current="page"]');
    if (active) positionMainNavMarker(active);
  };

  requestAnimationFrame(() => {
    mainNavMarker.classList.add('ready');
    syncMarker();
  });

  // Re-sync after the nav entrance animation settles.
  setTimeout(syncMarker, 700);

  window.addEventListener('resize', syncMarker);
}

function lockMainNavUntilScrollSettles() {
  mainNavAutoScrolling = true;
  if (mainNavScrollEndTimer) clearTimeout(mainNavScrollEndTimer);
  mainNavScrollEndTimer = setTimeout(() => {
    mainNavAutoScrolling = false;
    updateActiveSection();
  }, 900);
}

function updateActiveSection() {
  if (isAboutPage || !navSections.length || mainNavAutoScrolling) return;

  // Section whose top has crossed this line (just below the nav) is "current".
  const line = Math.max(120, window.innerHeight * 0.25);
  let current = 'hero';

  navSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= line) {
      current = section.id;
    }
  });

  if (window.scrollY < 80) current = 'hero';

  setActiveNav('#' + current);
}

window.addEventListener('scroll', updateActiveSection, { passive: true });

function jumpToHash(hash, behavior = 'auto') {
  if (!hash || hash === '#' || hash === '#hero') return;
  const target = document.querySelector(hash);
  if (!target) return;
  const header = document.querySelector('.site-header');
  const offset = header ? header.offsetHeight : 0;
  const top = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - Math.round(offset * 0.9));
  window.scrollTo({ top, behavior });
}

function restoreSmoothScroll() {
  document.documentElement.style.scrollBehavior = '';
}

document.addEventListener('DOMContentLoaded', () => {
  initMainNavMarker();

  if (isAboutPage) return;
  const hash = window.location.hash;
  if (hash && hash !== '#hero') {
    jumpToHash(hash);
    restoreSmoothScroll();
    if (document.querySelector(`.floating-nav a[href="${hash}"]`)) {
      setActiveNav(hash);
    } else {
      updateActiveSection();
    }
  } else {
    updateActiveSection();
  }
});

// Re-snap after layout settles (images/fonts) so cross-page hash links land correctly.
window.addEventListener('load', () => {
  if (isAboutPage) return;
  const hash = window.location.hash;
  if (hash && hash !== '#hero') jumpToHash(hash);
}, { once: true });

document.addEventListener('click', function(e) {
  const a = e.target.closest('.floating-nav a');
  if (!a || a.target === '_blank') return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  const href = a.getAttribute('href');
  if (!href || href === '#') return;

  e.preventDefault();
  e.stopPropagation();

  if (href.startsWith('#')) {
    const target = document.querySelector(href);
    if (!target) return;
    setActiveNav(href);
    lockMainNavUntilScrollSettles();
    const header = document.querySelector('.site-header');
    const offset = header ? header.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.pageYOffset - Math.round(offset * 0.9);
    window.scrollTo({ top, behavior: 'smooth' });
  } else {
    setActiveNav(href);
    window.location.href = a.href;
  }
}, true);

// Generic anchor smooth-scroll handler for links OUTSIDE the floating nav
// (e.g. the case study hero "see more" arrow). Floating-nav anchors are
// already handled above and stop propagation so they don't reach here.
document.addEventListener('click', function(e) {
  // Special handling for "Get to know me" button to animate nav before navigating
  const aboutCtaBtn = e.target.closest('.about-cta-btn');
  if (aboutCtaBtn && aboutCtaBtn.getAttribute('href') === 'html/about.html') {
    const aboutNavLink = document.querySelector('.floating-nav a[href="html/about.html"]');
    if (aboutNavLink) {
      e.preventDefault();
      e.stopPropagation();
      setActiveNav('html/about.html');
      window.location.href = aboutCtaBtn.href;
      return;
    }
  }

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
  const floatingImages = document.querySelectorAll('.floating-img-convoy-1, .floating-img-convoy-2, .floating-img-convoy-3, .floating-img-convoy-4, .floating-img-convoy-5, .floating-img-convoy-6, .floating-img-coral-1, .floating-img-coral-2, .floating-img-coral-3, .floating-img-coral-4, .floating-img-coral-5, .floating-img-coral-6, .floating-img-vigil-1, .floating-img-vigil-2, .floating-img-vigil-3, .floating-img-vigil-4, .floating-img-vigil-5, .floating-img-flock-1, .floating-img-flock-2, .floating-img-flock-3, .floating-img-flock-4, .floating-img-flock-5');
  
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
      const coralMatch = img.className.match(/floating-img-coral-(\d+)/);
      const convoyMatch = img.className.match(/floating-img-convoy-(\d+)/);
      const flockMatch = img.className.match(/floating-img-flock-(\d+)/);
      const speed = vigilMatch
        ? vigilSpeeds[Number(vigilMatch[1]) - 1] || 0.4
        : coralMatch || convoyMatch || flockMatch
          ? defaultSpeeds[(Number((coralMatch || convoyMatch || flockMatch)[1]) - 1)] || 0.1
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
// RESULT NUMBERS COUNTER ANIMATION
// ==========================================
function initNumberCounters() {
  const numberElements = document.querySelectorAll('.result-number');
  if (numberElements.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const animateNumber = (element) => {
    const originalText = element.textContent;

    // Fade in effect for number container
    element.style.opacity = '1';
    
    // Fade in effect for text label underneath
    const label = element.nextElementSibling;
    if (label && label.classList.contains('result-label')) {
      label.style.opacity = '1';
    }

    // Clear the text content to prepare for individual characters
    element.textContent = '';
    const chars = originalText.split('');
    
    chars.forEach((char, charIndex) => {
      const charSpan = document.createElement('span');
      // Handle spaces to ensure they render correctly
      if (char === ' ') {
        charSpan.innerHTML = '&nbsp;';
      } else {
        charSpan.textContent = char;
      }
      
      // Start hidden
      charSpan.style.opacity = '0';
      charSpan.style.transition = 'opacity 0.2s ease-in';
      element.appendChild(charSpan);

      // Stagger the fade in for each character
      setTimeout(() => {
        charSpan.style.opacity = '1';
      }, charIndex * 100); // 100ms stagger between characters
    });
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateNumber(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  numberElements.forEach(element => {
    // Preserve initial exact width to avoid grid layout jumping during animation
    element.style.minWidth = `${element.offsetWidth}px`;
    element.style.display = 'inline-block';
    
    // Hide initially and set up transition for fade in
    element.style.opacity = '0';
    element.style.transition = 'opacity 0.4s ease-in';
    
    // Also hide the label under it initially
    const label = element.nextElementSibling;
    if (label && label.classList.contains('result-label')) {
      label.style.opacity = '0';
      label.style.transition = 'opacity 0.4s ease-in';
    }
    
    // pre-set to start num optionally, we do it inline here:
    // element.textContent = ...
    observer.observe(element);
  });
}

document.addEventListener('DOMContentLoaded', initNumberCounters);

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
  const caseStudyLinks = document.querySelectorAll(
    'a.case-card[href*="case-study"], a.work-card[href*="case-study"]'
  );
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
        // Hero no longer hosts the Lottie animation; bail out quietly.
        animationInitialized = true;
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
            path: siteAssetPrefix() + 'media/HeroPage/gmdesign06.json'
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
