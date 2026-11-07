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

  const loopWidth = () => galleryTrack.scrollWidth / 2;
  // Same pixels per second as the Partners & Sponsors marquee.
  const logoSpeed = () => {
    const t = document.querySelector('.partners__track');
    if (!t) return 40;
    const secs = parseFloat(getComputedStyle(t).animationDuration) || 48;
    return (t.scrollWidth / 2) / secs;
  };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let pos = 0, last = 0, hovering = false, holdUntil = 0, visible = true;
  const hold = (ms) => { holdUntil = performance.now() + ms; };

  const scrollAmount = () => galleryTrack.clientWidth * 0.9;
  galleryPrev.addEventListener('click', () => {
    hold(3000);
    const back = () => galleryTrack.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    if (galleryTrack.scrollLeft < scrollAmount()) {
      galleryTrack.scrollLeft += loopWidth();
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
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(galleryTrack);

  const tick = (now) => {
    const dt = last ? Math.min(now - last, 100) / 1000 : 0;
    last = now;
    const half = loopWidth();
    const paused = reduced || hovering || !visible || now < holdUntil;
    if (paused || Math.abs(galleryTrack.scrollLeft - pos) > 3) pos = galleryTrack.scrollLeft;
    if (!paused) pos += logoSpeed() * dt;
    if (!paused) {
      if (half > 0 && pos >= half) pos -= half;
      galleryTrack.scrollLeft = pos;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
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
