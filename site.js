/* =========================================================
   site motion — shared by every page
   - Lenis smooth scroll
   - fit-to-width display headlines
   - word-by-word opacity fill on scroll (GSAP ScrollTrigger)
   - scroll-velocity pixelation on imagery
   - gif-style frame swap in the "get in touch" media
   ========================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------
     0. smooth scroll
     --------------------------------------------------------- */
  if (window.Lenis && !reduced) {
    var lenis = new window.Lenis({ duration: 1.05, smoothWheel: true });
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) {
        lenis.raf(t * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function loop(t) {
        lenis.raf(t);
        requestAnimationFrame(loop);
      })(0);
    }
  }

  /* ---------------------------------------------------------
     1. fit-to-width headlines
     Measures the rendered text once at a probe size, then
     scales the font-size so the line exactly fills its box.
     --------------------------------------------------------- */
  var fitEls = Array.prototype.slice.call(document.querySelectorAll("[data-fit]"));

  function textWidth(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    return range.getBoundingClientRect().width;
  }

  function fit(el) {
    var box = el.parentElement.getBoundingClientRect().width;
    if (!box) return;
    el.style.fontSize = "100px";
    var natural = textWidth(el);
    if (!natural) return;
    var size = (100 * box) / natural;
    el.style.fontSize = size + "px";
    // one correction pass — letter-spacing rounding drifts a little
    var got = textWidth(el);
    if (got) el.style.fontSize = (size * box) / got + "px";
  }

  function fitAll() {
    fitEls.forEach(fit);
    if (hasGsap) ScrollTrigger.refresh();
  }

  fitAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  window.addEventListener("resize", debounce(fitAll, 120));

  /* ---------------------------------------------------------
     2. word-by-word opacity fill
     --------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-reveal]"), function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach(function (word, i) {
      var span = document.createElement("span");
      span.className = "w";
      span.textContent = word;
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });

    if (reduced || !hasGsap) return;

    gsap.to(el.querySelectorAll(".w"), {
      opacity: 1,
      ease: "none",
      stagger: 1,
      scrollTrigger: {
        trigger: el,
        start: "top 78%",
        end: "bottom 58%",
        scrub: true
      }
    });
  });

  /* ---------------------------------------------------------
     3. scroll-velocity pixelation on work imagery
     Each image is painted through a canvas. The faster the page
     is scrolling, the fewer blocks the image is resampled to;
     when scrolling settles it resolves back to native detail.
     --------------------------------------------------------- */
  var MIN_BLOCKS = 14; // blocks across at peak velocity
  var MAX_VELOCITY = 4200; // px/s that maps to full pixelation
  var RISE = 0.32; // how quickly pixelation ramps up
  var FALL = 0.055; // how slowly it resolves again

  var tiles = [];

  function Tile(media) {
    var img = media.querySelector("img");
    if (!img) return null;

    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var tmp = document.createElement("canvas");
    var tctx = tmp.getContext("2d");
    media.appendChild(canvas);

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var lastBlocks = -1;
    var ready = false;

    function size() {
      var r = media.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      canvas.style.width = r.width + "px";
      canvas.style.height = r.height + "px";
      lastBlocks = -1;
      return true;
    }

    // source rect emulating object-fit: cover
    function coverRect() {
      var ir = img.naturalWidth / img.naturalHeight;
      var cr = canvas.width / canvas.height;
      var sw, sh;
      if (ir > cr) {
        sh = img.naturalHeight;
        sw = sh * cr;
      } else {
        sw = img.naturalWidth;
        sh = sw / cr;
      }
      return [(img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh];
    }

    function draw(amount) {
      if (!ready || !canvas.width) return;
      var native = canvas.width;
      // geometric ramp: native resolution -> coarse blocks
      var blocks = Math.round(native * Math.pow(MIN_BLOCKS / native, clamp(amount)));
      blocks = Math.max(MIN_BLOCKS, Math.min(native, blocks));
      if (blocks === lastBlocks) return;
      lastBlocks = blocks;

      var bh = Math.max(1, Math.round((blocks * canvas.height) / canvas.width));
      tmp.width = blocks;
      tmp.height = bh;

      var src = coverRect();
      tctx.imageSmoothingEnabled = true;
      tctx.clearRect(0, 0, blocks, bh);
      tctx.drawImage(img, src[0], src[1], src[2], src[3], 0, 0, blocks, bh);

      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tmp, 0, 0, blocks, bh, 0, 0, canvas.width, canvas.height);
    }

    function start() {
      if (!size()) return;
      ready = true;
      media.classList.add("px-ready");
      draw(0);
    }

    if (img.complete && img.naturalWidth) start();
    else img.addEventListener("load", start);

    return {
      onResize: function () {
        if (ready) {
          size();
          draw(0);
        }
      },
      update: function (amount) {
        // skip work for cards nowhere near the viewport
        var r = media.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        draw(amount);
      }
    };
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-px]"), function (m) {
    var tile = Tile(m);
    if (tile) tiles.push(tile);
  });

  window.addEventListener(
    "resize",
    debounce(function () {
      tiles.forEach(function (t) {
        t.onResize();
      });
    }, 150)
  );

  if (!reduced && tiles.length) {
    var lastY = window.scrollY;
    var lastT = performance.now();
    var velocity = 0;
    var amount = 0;
    var running = false;

    window.addEventListener(
      "scroll",
      function () {
        var now = performance.now();
        // clamp so a long idle gap (or a programmatic jump) still reads as fast
        var dt = Math.min(Math.max(now - lastT, 1), 100);
        velocity = (Math.abs(window.scrollY - lastY) / dt) * 1000;
        lastY = window.scrollY;
        lastT = now;
        if (!running) {
          running = true;
          requestAnimationFrame(tick);
        }
      },
      { passive: true }
    );

    var tick = function () {
      // velocity decays on its own if no scroll events arrive
      if (performance.now() - lastT > 90) velocity = 0;

      var target = clamp(velocity / MAX_VELOCITY);
      amount += (target - amount) * (target > amount ? RISE : FALL);
      if (amount < 0.002) amount = 0;

      tiles.forEach(function (t) {
        t.update(amount);
      });

      if (amount > 0 || velocity > 0) requestAnimationFrame(tick);
      else running = false;
    };
  }

  /* ---------------------------------------------------------
     4. "get in touch" frame swap
     Hard cuts between stills so it reads like a gif.
     --------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll(".cta-media"), function (box) {
    var frames = box.querySelectorAll("img");
    if (frames.length < 2) return;
    var i = 0;
    frames[0].classList.add("on");
    if (reduced) return;
    setInterval(function () {
      frames[i].classList.remove("on");
      i = (i + 1) % frames.length;
      frames[i].classList.add("on");
    }, 900);
  });

  /* ---------------------------------------------------------
     helpers
     --------------------------------------------------------- */
  function clamp(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }
})();

/* ---------------------------------------------------------
   mobile nav toggle — hamburger open/close
   --------------------------------------------------------- */
(function () {
  "use strict";
  var toggle = document.getElementById("nav-toggle");
  var links = document.getElementById("nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", function () {
    var isOpen = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  var navLinkEls = links.querySelectorAll("a");
  for (var i = 0; i < navLinkEls.length; i++) {
    navLinkEls[i].addEventListener("click", function () {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }
})();
