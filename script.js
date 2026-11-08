// Nav background on scroll
const nav = document.getElementById('siteNav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu toggle
const toggle = document.getElementById('navToggle');
toggle.addEventListener('click', () => document.body.classList.toggle('menu-open'));
document.querySelectorAll('.nav__links a').forEach((link) => {
  link.addEventListener('click', () => document.body.classList.remove('menu-open'));
});

// Reveal-on-scroll
const revealItems = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealItems.forEach((item) => io.observe(item));

// Gallery: glides on its own at the logo row's pixel speed, loops seamlessly,
// pauses on hover and for a moment after any swipe or arrow tap.
const galleryTrack = document.getElementById('galleryTrack');
const galleryPrev = document.getElementById('galleryPrev');
const galleryNext = document.getElementById('galleryNext');
if (galleryTrack && galleryPrev && galleryNext) {
  const originals = [...galleryTrack.children];
  originals.forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('img').forEach((img) => { img.alt = ''; });
    galleryTrack.appendChild(clone);
  });

  // Photos download only once the gallery is near the screen, so the opening
  // screen gets the connection first. Never loading="lazy": iPhone Safari skips
  // lazy images laid out to the side of a scrolling row.
  const loadPhotos = () => galleryTrack.querySelectorAll('img[data-src]').forEach((img) => {
    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
    img.removeAttribute('data-srcset');
  });
  const photoIo = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { loadPhotos(); photoIo.disconnect(); }
  }, { rootMargin: '1200px 0px' });
  photoIo.observe(galleryTrack);

  // Sizes are measured once and again on resize, never per frame: reading
  // layout every frame made phones stutter while scrolling the page.
  let half = 0, speed = 40;
  const measure = () => {
    half = galleryTrack.scrollWidth / 2;
    const t = document.querySelector('.partners__track');
    if (t) {
      const secs = parseFloat(getComputedStyle(t).animationDuration) || 48;
      speed = (t.scrollWidth / 2) / secs; // same pixels per second as the logo row
    }
  };
  measure();
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', measure);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pos = 0, last = 0, hovering = false, holdUntil = 0, visible = false, running = false;
  const hold = (ms) => { holdUntil = performance.now() + ms; };

  const scrollAmount = () => galleryTrack.clientWidth * 0.9;
  galleryPrev.addEventListener('click', () => {
    hold(3000);
    const back = () => galleryTrack.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    if (galleryTrack.scrollLeft < scrollAmount()) {
      galleryTrack.scrollLeft += half;
      requestAnimationFrame(back);
    } else back();
  });
  galleryNext.addEventListener('click', () => {
    hold(3000);
    galleryTrack.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
  });
  galleryTrack.addEventListener('mouseenter', () => { hovering = true; });
  galleryTrack.addEventListener('mouseleave', () => { hovering = false; });
  ['pointerdown', 'touchstart', 'wheel'].forEach((ev) =>
    galleryTrack.addEventListener(ev, () => hold(2500), { passive: true }));

  const tick = (now) => {
    if (!visible) { running = false; last = 0; return; } // off screen: no work at all
    const dt = last ? Math.min(now - last, 100) / 1000 : 0;
    last = now;
    const paused = hovering || now < holdUntil;
    if (paused) {
      pos = galleryTrack.scrollLeft;
    } else {
      if (Math.abs(galleryTrack.scrollLeft - pos) > 3) pos = galleryTrack.scrollLeft;
      pos += speed * dt;
      if (half > 0 && pos >= half) pos -= half;
      galleryTrack.scrollLeft = pos;
    }
    requestAnimationFrame(tick);
  };
  if (!reduced) {
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !running) { running = true; measure(); requestAnimationFrame(tick); }
    }).observe(galleryTrack);
  }
}

// Background photos below the fold load only as they come near the screen.
const lazyBgs = document.querySelectorAll('[data-bg]');
const bgIo = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.backgroundImage = `url('${entry.target.dataset.bg}')`;
        bgIo.unobserve(entry.target);
      }
    });
  },
  { rootMargin: '600px 0px' }
);
lazyBgs.forEach((el) => bgIo.observe(el));

// Partner logos: decode every logo before it slides into view, and heal a bad
// cached copy (a "not found" kept from before a logo existed) by fetching it
// once more around the browser cache.
document.querySelectorAll('.partners__set img').forEach((img) => {
  const retry = () => {
    if (img.dataset.retried) return;
    img.dataset.retried = '1';
    img.src = img.getAttribute('src') + '&r=' + Date.now();
  };
  img.addEventListener('error', retry);
  if (img.complete && img.naturalWidth === 0) retry();
  else if (img.decode) img.decode().catch(() => {});
});

// Soundtrack: the Spotify player loads only as it nears the screen, so it
// never slows the opening. The link inside stays if scripts are off.
const soundtrack = document.getElementById('soundtrack');
if (soundtrack) {
  const stIo = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    stIo.disconnect();
    const f = document.createElement('iframe');
    f.src = soundtrack.dataset.embed;
    f.title = 'Lovely Day by Bill Withers on Spotify';
    f.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    f.loading = 'eager';
    soundtrack.replaceChildren(f);
  }, { rootMargin: '400px 0px' });
  stIo.observe(soundtrack);
}
