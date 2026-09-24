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
