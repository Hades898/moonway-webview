/* Moonway Creations — deck behavior
   Chapters snap on desktop, flow free on mobile.
   Keyboard: ↓ → PgDn Space next · ↑ ← PgUp prev · Home/End · F fullscreen · I index · Esc close */

(function () {
  "use strict";

  const chapters = Array.from(document.querySelectorAll(".ch"));
  const railBtns = Array.from(document.querySelectorAll(".rail button"));
  const counter = document.querySelector(".counter");
  const overlay = document.querySelector(".index-overlay");
  const total = chapters.length;
  let current = 0;

  const pad = (n) => String(n + 1).padStart(2, "0");

  function setCurrent(i) {
    current = i;
    if (counter) {
      counter.innerHTML =
        "<b>" + pad(i) + "</b>&thinsp;/&thinsp;" + String(total).padStart(2, "0") +
        "&nbsp;&nbsp;·&nbsp;&nbsp;" + (chapters[i].dataset.title || "");
    }
    railBtns.forEach((b, j) => {
      b.classList.toggle("on", j === i);
      if (j === i) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    });
    const theme = chapters[i].dataset.theme || "paper";
    ["on-photo", "on-split", "on-split-flip"].forEach((c) => document.body.classList.remove(c));
    if (theme !== "paper") document.body.classList.add("on-" + theme);
    document.body.classList.toggle("mast-dark", chapters[i].dataset.mast === "dark");
  }

  /* reveal + active-chapter tracking */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          const i = chapters.indexOf(e.target);
          if (e.intersectionRatio >= 0.5 && i > -1) setCurrent(i);
        }
      });
    },
    { threshold: [0.12, 0.5] }
  );
  chapters.forEach((c) => io.observe(c));

  /* stagger children reveals */
  chapters.forEach((c) => {
    Array.from(c.querySelectorAll("[data-reveal]")).forEach((el, i) => {
      el.style.setProperty("--d", (i * 0.12).toFixed(2) + "s");
    });
  });

  /* mobile: chapters are taller than the screen, so reveal each block as it
     arrives instead of all at once with the chapter */
  if (window.matchMedia("(max-width: 899px)").matches) {
    const elIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.setProperty("--d", "0s");
            e.target.classList.add("in");
            elIo.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => elIo.observe(el));
  }

  /* keyboard jumps: mandatory scroll-snap cancels smooth programmatic
     scrolls in Chrome, so suspend snap for the ride and restore after. */
  let targetIdx = null;
  let snapTimer = null;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function go(i) {
    i = Math.max(0, Math.min(total - 1, i));
    targetIdx = i;
    document.documentElement.style.scrollSnapType = "none";
    chapters[i].scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      document.documentElement.style.scrollSnapType = "";
      targetIdx = null;
    }, reduced ? 80 : 950);
  }

  const at = () => (targetIdx === null ? current : targetIdx);

  /* keyboard */
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const active = document.activeElement;
    const tag = active && active.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    /* keep Space as button activation, and let the wall scroll natively */
    if (e.key === " " && (tag === "BUTTON" || tag === "A")) return;
    if (active && active.closest && active.closest(".wall")) return;

    if (overlay && overlay.classList.contains("open")) {
      if (e.key === "Escape" || e.key.toLowerCase() === "i") toggleIndex(false);
      if (e.key === "Tab") trapTab(e);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
      case "PageDown":
      case " ":
        e.preventDefault();
        go(at() + 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault();
        go(at() - 1);
        break;
      case "Home":
        e.preventDefault();
        go(0);
        break;
      case "End":
        e.preventDefault();
        go(total - 1);
        break;
      case "f":
      case "F":
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen().catch(() => {});
        break;
      case "i":
      case "I":
        toggleIndex(true);
        break;
    }
  });

  /* index overlay: modal focus handling */
  let indexOpener = null;
  let scrollLock = 0;
  const inertables = ["header.top", "nav.rail", "main", ".counter", ".kbd-hint"]
    .map((s) => document.querySelector(s))
    .filter(Boolean);

  function trapTab(e) {
    const focusables = Array.from(overlay.querySelectorAll("a[href], button"));
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function toggleIndex(open) {
    if (!overlay) return;
    if (open) {
      indexOpener = document.activeElement;
      overlay.classList.add("open");
      document.body.classList.add("index-open");
      scrollLock = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = -scrollLock + "px";
      document.body.style.width = "100%";
      overlay.setAttribute("aria-hidden", "false");
      /* focus once the overlay is actually visible (styles applied), and only
         then inert the page — inert on the opener's ancestor would otherwise
         async-blur focus back to <body> */
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const f = overlay.querySelector("a, button");
          if (f) f.focus();
          inertables.forEach((el) => (el.inert = true));
        })
      );
    } else {
      inertables.forEach((el) => (el.inert = false));
      document.body.classList.remove("index-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollLock);
      if (indexOpener && indexOpener.focus) indexOpener.focus();
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
      indexOpener = null;
    }
  }

  document.querySelectorAll("[data-index-open]").forEach((b) =>
    b.addEventListener("click", () => toggleIndex(true))
  );
  document.querySelectorAll("[data-index-close]").forEach((b) =>
    b.addEventListener("click", () => toggleIndex(false))
  );
  if (overlay) {
    let downY = null;
    overlay.addEventListener("pointerdown", (e) => { downY = e.clientY; });
    overlay.addEventListener("click", (e) => {
      const moved = downY !== null && Math.abs(e.clientY - downY) > 12;
      downY = null;
      if (e.target === overlay && !moved) toggleIndex(false);
    });
    overlay.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => toggleIndex(false))
    );
  }

  /* rail jumps */
  railBtns.forEach((b, i) => b.addEventListener("click", () => go(i)));

  /* services: hover swaps the visual (desktop) */
  const svcFigs = Array.from(document.querySelectorAll(".svc-visual figure"));
  document.querySelectorAll(".svc-list .svc").forEach((row) => {
    row.addEventListener("mouseenter", () => {
      const k = row.dataset.visual;
      svcFigs.forEach((f) => f.classList.toggle("on", f.dataset.key === k));
    });
  });

  /* gallery walls: arrows, disabled states, mobile progress (one per category chapter) */
  document.querySelectorAll(".ch-wall").forEach((section) => {
    const wall = section.querySelector(".wall");
    if (!wall) return;
    const btns = Array.from(section.querySelectorAll(".wall-nav button"));
    const bar = section.querySelector(".wall-progress i");

    btns.forEach((b) => {
      b.addEventListener("click", () => {
        const dir = b.dataset.dir === "next" ? 1 : -1;
        wall.scrollBy({ left: dir * Math.round(wall.clientWidth * 0.7), behavior: "smooth" });
      });
    });

    function wallState() {
      const max = wall.scrollWidth - wall.clientWidth;
      btns.forEach((b) => {
        if (b.dataset.dir === "prev") b.disabled = wall.scrollLeft <= 4;
        else b.disabled = wall.scrollLeft >= max - 4;
      });
      if (bar && max > 0) {
        const frac = wall.clientWidth / wall.scrollWidth;
        bar.style.width = (frac * 100).toFixed(1) + "%";
        bar.style.left = ((wall.scrollLeft / wall.scrollWidth) * 100).toFixed(1) + "%";
      }
    }

    wall.addEventListener("scroll", wallState, { passive: true });
    window.addEventListener("resize", wallState);
    wallState();
  });

  /* lightbox: tap any gallery photo to see it full screen */
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Photo viewer");
  lb.setAttribute("aria-hidden", "true");
  lb.innerHTML =
    '<button class="index-btn lb-close" aria-label="Close photo">Close</button>' +
    '<img alt=""><figcaption></figcaption>';
  document.body.appendChild(lb);
  const lbImg = lb.querySelector("img");
  const lbCap = lb.querySelector("figcaption");
  let lbOpener = null;

  function biggestSource(fig) {
    const src = fig.querySelector("source[type='image/avif']");
    const img = fig.querySelector("img");
    const set = (src || img).getAttribute("srcset") || "";
    const parts = set.split(",").map((s) => s.trim().split(" ")[0]);
    return parts[parts.length - 1] || (img && img.currentSrc);
  }

  function openLightbox(fig) {
    const url = biggestSource(fig);
    if (!url) return;
    lbOpener = document.activeElement;
    const img = fig.querySelector("img");
    lbImg.src = url;
    lbImg.alt = img ? img.alt : "";
    const cap = fig.querySelector("figcaption") || fig.querySelector(".caption");
    if (cap) {
      const strong = cap.querySelector("strong");
      if (strong) {
        const title = strong.textContent.trim();
        const rest = cap.textContent.replace(strong.textContent, "").replace(/^[\s—–-]+/, "").trim();
        lbCap.textContent = rest ? title + " — " + rest : title;
      } else {
        lbCap.textContent = cap.textContent.trim();
      }
    } else {
      lbCap.textContent = img ? img.alt : "";
    }
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    lb.querySelector(".lb-close").focus();
  }

  function closeLightbox() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    if (lbOpener && lbOpener.focus) lbOpener.focus();
    lbOpener = null;
  }

  document.addEventListener("click", (e) => {
    const fig = e.target.closest(".strip figure, .wall figure, .hero-object, .about-object, .svc-visual figure, .ch-collage figure, .collage-grid figure");
    if (fig) openLightbox(fig);
  });
  lb.addEventListener("click", (e) => {
    if (e.target === lb || e.target.closest(".lb-close") || e.target === lbImg) closeLightbox();
  });
  const deckKeys = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "PageDown", "PageUp", "Home", "End", " ", "Escape", "f", "F", "i", "I"];
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (deckKeys.includes(e.key)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.key === "Escape" || e.key === " ") closeLightbox();
    }
  }, true);

  /* archive collage: gentle scroll drift (desktop, motion allowed) */
  const collage = document.querySelector(".ch-collage");
  if (collage && !reduced && window.matchMedia("(min-width: 900px) and (pointer: fine)").matches) {
    const tiles = Array.from(collage.querySelectorAll("figure[data-speed]"));
    let ticking = false;
    function drift() {
      const r = collage.getBoundingClientRect();
      const p = (window.innerHeight - r.top) / (window.innerHeight + r.height) - 0.5;
      tiles.forEach((t) => {
        const s = parseFloat(t.dataset.speed || "1");
        t.style.transform = "translateY(" + (p * (s - 1) * 220).toFixed(1) + "px)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(drift); }
    }, { passive: true });
    drift();
  }

  /* six worlds: tap flips on touch, second tap (or the go link) jumps */
  document.querySelectorAll(".flip-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      const hoverable = window.matchMedia("(hover: hover)").matches;
      if (!hoverable && !card.classList.contains("flipped")) {
        e.preventDefault();
        document.querySelectorAll(".flip-card.flipped").forEach((c) => { if (c !== card) c.classList.remove("flipped"); });
        card.classList.add("flipped");
        return;
      }
      const target = document.querySelector(card.dataset.target);
      if (target) {
        const i = chapters.indexOf(target);
        if (i > -1) go(i);
      }
    });
  });

  /* mobile masthead yields while scrolling down so photography gets the full frame */
  if (window.matchMedia("(max-width: 899px)").matches) {
    let lastY = window.scrollY, mTick = false;
    window.addEventListener("scroll", () => {
      if (mTick) return;
      mTick = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (!document.body.classList.contains("index-open")) {
          if (y > 240 && y > lastY + 6) document.body.classList.add("mast-away");
          else if (y < lastY - 6 || y < 120) document.body.classList.remove("mast-away");
        }
        lastY = y;
        mTick = false;
      });
    }, { passive: true });
  }

  setCurrent(0);
})();
