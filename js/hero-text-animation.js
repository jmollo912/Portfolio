// Standalone recreation of the homepage hero typing + highlight sequence.
(() => {
  const stage = document.getElementById('hero-stage');
  const cursor = document.getElementById('hero-cursor');
  const textbox = document.getElementById('hero-textbox');
  const typed = document.getElementById('hero-typed');
  const sizer = document.getElementById('hero-typed-sizer');
  const replayBtn = document.getElementById('hero-replay');
  if (!stage || !textbox || !typed || !cursor || !replayBtn) return;

  const INTRO = 'hi my name is\nGiuseppe';
  const OUTRO = 'welcome to my\nportfolio';
  const TYPE_MS = 52;
  const DELETE_MS = 28;
  const HOLD_MS = 640;
  const WEIGHT_START = 450;
  const WEIGHT_END = 700;
  const SCALE_END = 1.5;

  let measureCanvas;
  let runId = 0;
  let timers = [];
  let rafId = 0;
  let playing = false;

  function measure(text, size, weight = WEIGHT_START) {
    if (!measureCanvas) measureCanvas = document.createElement('canvas');
    const ctx = measureCanvas.getContext('2d');
    ctx.font = `${weight} ${size}px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif`;
    return ctx.measureText(text).width;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
  }
  function easeOut(t) { return 1 - (1 - t) * (1 - t); }

  function fontSize() {
    const width = stage.offsetWidth;
    if (width < 50) return 0;
    const max = Math.min(width * 0.72, 560);
    const lines = ['hi my name is', 'Giuseppe', 'welcome to my', 'portfolio'];
    let size = Math.min(64, Math.floor(width * 0.055));
    while (size > 22 && lines.some((line) => measure(line, size) > max)) size -= 1;
    return size;
  }

  function later(fn, ms, id) {
    const timer = setTimeout(() => {
      if (id !== runId) return;
      fn();
    }, ms);
    timers.push(timer);
    return timer;
  }

  function setPlaying(next) {
    playing = next;
    replayBtn.disabled = next;
    replayBtn.setAttribute('aria-busy', next ? 'true' : 'false');
  }

  function setCursor(x, y, opacity) {
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
    if (opacity !== undefined) cursor.style.opacity = String(opacity);
  }

  function setWeight(el, weight) {
    const w = Math.round(weight * 10) / 10;
    el.style.fontWeight = String(Math.round(w));
    el.style.fontVariationSettings = `"wght" ${w}`;
  }

  function clearDynamicUi() {
    textbox.querySelectorAll('.hero-portfolio-highlight, .hero-weight-slider').forEach((el) => {
      el.remove();
    });
  }

  function stopRun() {
    runId += 1;
    timers.forEach(clearTimeout);
    timers = [];
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    clearDynamicUi();
    cursor.style.opacity = '0';
    typed.classList.remove('is-typing');
    typed.textContent = '';
    if (sizer) sizer.textContent = INTRO;
    setPlaying(false);
  }

  function layout(text, reserve, { typing = true, portfolioReady = false } = {}) {
    const size = fontSize();
    if (!size) return false;
    textbox.style.fontSize = `${size}px`;
    typed.classList.toggle('is-typing', typing && !portfolioReady);
    if (sizer && sizer.textContent !== reserve) sizer.textContent = reserve;
    if (!portfolioReady && typed.textContent !== text) typed.textContent = text;
    cursor.style.opacity = '0';
    return true;
  }

  function applyFinalState(finalWeight, finalScale) {
    typed.classList.remove('is-typing');
    const size = fontSize();
    if (!size) return;
    textbox.style.fontSize = `${size}px`;
    typed.innerHTML = 'welcome to my\n<span class="hero-portfolio">portfolio</span>';
    const word = typed.querySelector('.hero-portfolio');
    if (word) {
      setWeight(word, finalWeight);
      word.style.transformOrigin = 'center top';
      word.style.transform = `scale(${finalScale})`;
    }
    if (sizer) sizer.textContent = OUTRO;
    cursor.style.opacity = '0';
    clearDynamicUi();
    stage.setAttribute('aria-label', 'welcome to my portfolio');
    setPlaying(false);
  }

  function runPortfolioSequence(id) {
    typed.classList.remove('is-typing');
    typed.innerHTML = 'welcome to my\n<span class="hero-portfolio">portfolio</span>';
    const word = typed.querySelector('.hero-portfolio');
    if (!word) {
      applyFinalState(WEIGHT_END, SCALE_END);
      return;
    }

    setWeight(word, WEIGHT_START);
    word.style.transform = 'scale(1)';
    // Grow downward so "portfolio" never climbs into "welcome to my".
    word.style.transformOrigin = 'center top';

    const highlight = document.createElement('div');
    highlight.className = 'hero-portfolio-highlight';
    highlight.setAttribute('aria-hidden', 'true');
    const handles = ['tl', 'tr', 'bl', 'br'].map((name) => {
      const handle = document.createElement('span');
      handle.className = `hero-portfolio-handle hero-portfolio-handle--${name}`;
      highlight.appendChild(handle);
      return handle;
    });
    textbox.appendChild(highlight);

    const setHandlesVisible = (visible) => {
      handles.forEach((handle) => {
        handle.style.opacity = visible ? '1' : '0';
      });
    };
    setHandlesVisible(false);

    const slider = document.createElement('div');
    slider.className = 'hero-weight-slider';
    slider.setAttribute('aria-hidden', 'true');
    slider.innerHTML =
      '<div class="hero-weight-slider-track">' +
      '<div class="hero-weight-slider-fill"></div>' +
      '<div class="hero-weight-slider-knob"></div>' +
      '</div>';
    textbox.appendChild(slider);
    const fill = slider.querySelector('.hero-weight-slider-fill');
    const knob = slider.querySelector('.hero-weight-slider-knob');

    const padX = 22;
    // No top pad — keeps the highlight flush under "welcome to my".
    const padTop = 0;
    const padBottom = 22;
    let drawOrigin = { x: 0, y: 0 };
    let drawnSize = { w: 0, h: 0 };
    let finalWeight = WEIGHT_START;
    let finalScale = 1;

    const wordRectLocal = () => {
      const box = textbox.getBoundingClientRect();
      const current = word.getBoundingClientRect();
      return {
        left: current.left - box.left - textbox.clientLeft,
        top: current.top - box.top - textbox.clientTop,
        width: current.width,
        height: current.height,
      };
    };

    const syncHighlightOrigin = () => {
      const r = wordRectLocal();
      drawOrigin = { x: r.left - padX, y: r.top - padTop };
      drawnSize = { w: r.width + padX * 2, h: r.height + padTop + padBottom };
    };

    const setHighlightBox = (w, h) => {
      highlight.style.left = `${drawOrigin.x}px`;
      highlight.style.top = `${drawOrigin.y}px`;
      highlight.style.width = `${Math.max(0, w)}px`;
      highlight.style.height = `${Math.max(0, h)}px`;
    };

    const placeHighlightOnWord = () => {
      const r = wordRectLocal();
      highlight.style.left = `${r.left - padX}px`;
      highlight.style.top = `${r.top - padTop}px`;
      highlight.style.width = `${r.width + padX * 2}px`;
      highlight.style.height = `${r.height + padTop + padBottom}px`;
    };

    let scaleLayout = null;
    const placeScaledHighlight = (scale) => {
      const box = scaleLayout;
      // Keep the top edge locked; expand sideways from center and down only.
      const left = box.left - (box.width * (scale - 1)) / 2;
      const top = box.top;
      highlight.style.left = `${left - padX * scale}px`;
      highlight.style.top = `${top - padTop * scale}px`;
      highlight.style.width = `${box.width * scale + padX * 2 * scale}px`;
      highlight.style.height = `${box.height * scale + (padTop + padBottom) * scale}px`;
    };

    let sliderAnchor = null;
    const placeSlider = () => {
      const r = wordRectLocal();
      if (!sliderAnchor) {
        sliderAnchor = { width: Math.max(72, Math.min(110, r.width * 0.55)) };
        slider.style.width = `${sliderAnchor.width}px`;
      }
      slider.style.left = `${r.left + (r.width - sliderAnchor.width) / 2}px`;
      slider.style.top = `${r.top + r.height + padBottom + 18}px`;
    };

    const setSliderProgress = (p) => {
      const pct = Math.max(0, Math.min(1, p)) * 100;
      fill.style.width = `${pct}%`;
      knob.style.left = `${pct}%`;
    };

    const stagePoint = (clientX, clientY) => {
      const stageBox = stage.getBoundingClientRect();
      return { x: clientX - stageBox.left, y: clientY - stageBox.top };
    };

    const cursorAtHighlight = (edge) => {
      const hi = highlight.getBoundingClientRect();
      if (edge === 'tl') return stagePoint(hi.left, hi.top);
      if (edge === 'br') return stagePoint(hi.right, hi.bottom);
      return stagePoint(hi.right, hi.top);
    };

    const cursorAtKnob = () => {
      const k = knob.getBoundingClientRect();
      return stagePoint(k.left + k.width / 2, k.top + k.height / 2);
    };

    const dragPoint = (dx, dy) => {
      const box = textbox.getBoundingClientRect();
      return stagePoint(
        box.left + textbox.clientLeft + drawOrigin.x + dx,
        box.top + textbox.clientTop + drawOrigin.y + dy
      );
    };

    syncHighlightOrigin();
    setHighlightBox(0, 0);
    highlight.style.opacity = '0';
    setSliderProgress(0);
    slider.style.opacity = '0';
    placeSlider();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyFinalState(WEIGHT_END, SCALE_END);
      return;
    }

    const fadeInMs = 180;
    const holdBeforeDrawMs = 200;
    const drawMs = 680;
    const holdAfterDrawMs = 220;
    const toSliderMs = 380;
    const dragMs = 720;
    const toTrMs = 360;
    const scaleMs = 560;
    const holdScaleMs = 220;
    const cursorFadeMs = 260;
    const highlightFadeMs = 480;
    const started = performance.now();
    let entrance = null;

    const frame = (now) => {
      if (id !== runId) return;
      const elapsed = now - started;
      let mark = 0;

      if (elapsed < fadeInMs) {
        const p = elapsed / fadeInMs;
        syncHighlightOrigin();
        setHighlightBox(0, 0);
        highlight.style.opacity = '0';
        setHandlesVisible(false);
        const tl = dragPoint(0, 0);
        if (!entrance) {
          entrance = {
            x: tl.x + stage.offsetWidth * 0.08,
            y: tl.y + stage.offsetHeight * 0.1,
          };
        }
        setCursor(lerp(entrance.x, tl.x, easeOut(p)), lerp(entrance.y, tl.y, easeOut(p)), p);
        rafId = requestAnimationFrame(frame);
        return;
      }
      mark = fadeInMs;

      if (elapsed < mark + holdBeforeDrawMs) {
        syncHighlightOrigin();
        setHighlightBox(0, 0);
        highlight.style.opacity = '0';
        setHandlesVisible(false);
        const tl = dragPoint(0, 0);
        setCursor(tl.x, tl.y, 1);
        rafId = requestAnimationFrame(frame);
        return;
      }
      mark += holdBeforeDrawMs;

      // Draw TL → BR so the highlight's bottom-right corner rides with the cursor.
      if (elapsed < mark + drawMs) {
        const t = (elapsed - mark) / drawMs;
        const p = easeInOutCubic(t);
        const w = lerp(0, drawnSize.w, p);
        const h = lerp(0, drawnSize.h, p);
        setHighlightBox(w, h);
        const reveal = Math.min(1, t / 0.18);
        highlight.style.opacity = String(reveal);
        handles.forEach((handle) => { handle.style.opacity = String(reveal); });
        const tip = dragPoint(w, h);
        setCursor(tip.x, tip.y, 1);
        rafId = requestAnimationFrame(frame);
        return;
      }
      mark += drawMs;
      setHighlightBox(drawnSize.w, drawnSize.h);
      highlight.style.opacity = '1';
      setHandlesVisible(true);

      if (elapsed < mark + holdAfterDrawMs) {
        setCursor(cursorAtHighlight('br').x, cursorAtHighlight('br').y, 1);
        rafId = requestAnimationFrame(frame);
        return;
      }
      mark += holdAfterDrawMs;

      placeSlider();
      if (elapsed < mark + toSliderMs) {
        const p = easeInOut((elapsed - mark) / toSliderMs);
        slider.style.opacity = String(p);
        const from = cursorAtHighlight('br');
        const to = cursorAtKnob();
        setCursor(lerp(from.x, to.x, p), lerp(from.y, to.y, p), 1);
        setSliderProgress(0);
        rafId = requestAnimationFrame(frame);
        return;
      }
      mark += toSliderMs;
      slider.style.opacity = '1';

      if (elapsed < mark + dragMs) {
        const p = easeInOut((elapsed - mark) / dragMs);
        setSliderProgress(p);
        const weight = lerp(WEIGHT_START, WEIGHT_END, p);
        setWeight(word, weight);
        placeHighlightOnWord();
        placeSlider();
        const k = cursorAtKnob();
        setCursor(k.x, k.y, 1);
        rafId = requestAnimationFrame(frame);
        return;
      }
      mark += dragMs;
      setSliderProgress(1);
      setWeight(word, WEIGHT_END);
      finalWeight = WEIGHT_END;
      placeHighlightOnWord();
      placeSlider();

      if (elapsed < mark + toTrMs) {
        const p = easeInOut((elapsed - mark) / toTrMs);
        slider.style.opacity = String(1 - p);
        const from = cursorAtKnob();
        const to = cursorAtHighlight('br');
        setCursor(lerp(from.x, to.x, p), lerp(from.y, to.y, p), 1);
        rafId = requestAnimationFrame(frame);
        return;
      }
      mark += toTrMs;
      slider.style.opacity = '0';

      if (elapsed < mark + scaleMs) {
        if (!scaleLayout) {
          word.style.transform = 'scale(1)';
          word.style.transformOrigin = 'center top';
          scaleLayout = wordRectLocal();
        }
        const p = easeInOut((elapsed - mark) / scaleMs);
        const scale = lerp(1, SCALE_END, p);
        word.style.transform = `scale(${scale})`;
        placeScaledHighlight(scale);
        const br = cursorAtHighlight('br');
        setCursor(br.x, br.y, 1);
        rafId = requestAnimationFrame(frame);
        return;
      }
      mark += scaleMs;
      if (!scaleLayout) {
        word.style.transform = 'scale(1)';
        word.style.transformOrigin = 'center top';
        scaleLayout = wordRectLocal();
      }
      word.style.transform = `scale(${SCALE_END})`;
      finalScale = SCALE_END;
      placeScaledHighlight(SCALE_END);

      if (elapsed < mark + holdScaleMs) {
        setCursor(cursorAtHighlight('br').x, cursorAtHighlight('br').y, 1);
        rafId = requestAnimationFrame(frame);
        return;
      }
      mark += holdScaleMs;

      if (elapsed < mark + cursorFadeMs) {
        const p = (elapsed - mark) / cursorFadeMs;
        setCursor(cursorAtHighlight('br').x, cursorAtHighlight('br').y, 1 - p);
        rafId = requestAnimationFrame(frame);
        return;
      }
      mark += cursorFadeMs;
      setCursor(cursorAtHighlight('br').x, cursorAtHighlight('br').y, 0);

      const fadeElapsed = elapsed - mark;
      const p = Math.min(1, fadeElapsed / highlightFadeMs);
      highlight.style.opacity = String(1 - easeOut(p));
      if (p < 1) {
        rafId = requestAnimationFrame(frame);
        return;
      }

      highlight.remove();
      slider.remove();
      applyFinalState(finalWeight, finalScale);
    };

    rafId = requestAnimationFrame(frame);
  }

  function startAnimation() {
    stopRun();
    const id = runId;
    setPlaying(true);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyFinalState(WEIGHT_END, SCALE_END);
      return;
    }

    const boot = () => {
      if (id !== runId) return;
      if (!layout('', INTRO, { typing: true })) {
        rafId = requestAnimationFrame(boot);
        return;
      }

      let count = 0;

      const typeIntro = () => {
        if (id !== runId) return;
        layout(INTRO.slice(0, count), INTRO, { typing: true });
        if (count < INTRO.length) {
          count += 1;
          later(typeIntro, TYPE_MS, id);
        } else {
          later(deleteIntro, HOLD_MS, id);
        }
      };

      const deleteIntro = () => {
        if (id !== runId) return;
        if (count > 0) {
          count -= 1;
          layout(INTRO.slice(0, count), INTRO, { typing: true });
          later(deleteIntro, DELETE_MS, id);
        } else {
          later(typeOutro, 140, id);
        }
      };

      const typeOutro = () => {
        if (id !== runId) return;
        layout(OUTRO.slice(0, count), OUTRO, { typing: true });
        if (count < OUTRO.length) {
          count += 1;
          later(typeOutro, TYPE_MS, id);
        } else {
          runPortfolioSequence(id);
        }
      };

      typeIntro();
    };

    boot();
  }

  replayBtn.addEventListener('click', () => {
    if (playing) return;
    startAnimation();
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(startAnimation);
  } else {
    startAnimation();
  }
})();
