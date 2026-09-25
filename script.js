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

// Room photos: pan on scroll instead of zoom on hover, so faces at the
// top of a tall photo come into view as the section scrolls through.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const roomFrames = Array.from(document.querySelectorAll('.room__frame'));

if (roomFrames.length && !reducedMotion) {
  let ticking = false;

  const updateRoomParallax = () => {
    const vh = window.innerHeight;
    roomFrames.forEach((frame) => {
      const img = frame.querySelector('img');
      const rect = frame.getBoundingClientRect();
      // 0 when the frame's top just entered the bottom of the viewport,
      // 1 when the frame's bottom just left the top of the viewport.
      const progress = (vh - rect.top) / (vh + rect.height);
      const clamped = Math.min(Math.max(progress, 0), 1);
      const maxShift = rect.height * 0.32; // matches the 132% image height
      img.style.transform = `translateY(${-maxShift * clamped}px)`;
    });
    ticking = false;
  };

  document.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateRoomParallax);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateRoomParallax);
  updateRoomParallax();
}
