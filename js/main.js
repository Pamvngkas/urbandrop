document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. Scroll reveal animations ── */
  initScrollAnimations();

  /* ── 2. Featured products grid (homepage only) ── */
  const featuredGrid = document.getElementById('featuredGrid');
  if (featuredGrid && window.PRODUCTS) {
    const featured = window.PRODUCTS.filter(p => p.featured);
    if (typeof renderProductGrid === 'function') {
      renderProductGrid(featured, featuredGrid);
    }
  }

  /* ── 3. Testimonials (homepage only) ── */
  const testiTrack = document.getElementById('testiTrack');
  if (testiTrack && window.TESTIMONIALS) {
    if (typeof renderTestimonials === 'function') {
      renderTestimonials(window.TESTIMONIALS, testiTrack);
    }
  }

  /* ── 4. Cart badge on load ── */
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }

  /* ── 5. Search bar — redirect to catalog with query ── */
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    // Detect apakah sedang di subpage (pages/) atau root
    const isSubpage = window.location.pathname.includes('/pages/');
    const catalogPath = isSubpage ? 'catalog.html' : 'pages/catalog.html';

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = searchInput.value.trim();
        if (q) {
          window.location.href = `${catalogPath}?search=${encodeURIComponent(q)}`;
        }
      }
    });

    // Debounce auto-redirect setelah 800ms ketik
    searchInput.addEventListener('input', debounce((e) => {
      const q = e.target.value.trim();
      if (q.length >= 3) {
        window.location.href = `${catalogPath}?search=${encodeURIComponent(q)}`;
      }
    }, 800));
  }

  /* ── 6. Category pill active state dari URL ── */
  const params = new URLSearchParams(window.location.search);
  const activeCat = params.get('cat');
  if (activeCat) {
    document.querySelectorAll('.cat-pill').forEach(pill => {
      pill.classList.remove('cat-pill--active');
      const href = pill.getAttribute('href') || '';
      if (href.includes(`cat=${activeCat}`)) {
        pill.classList.add('cat-pill--active');
      }
    });
  }

  /* ── 7. Smooth scroll untuk anchor links (misal #featured) ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navbarH = document.getElementById('navbar')?.offsetHeight || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - navbarH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── 8. Aktif nav link berdasarkan scroll posisi ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  if (sections.length && navLinks.length) {
    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
      });
      navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        link.classList.toggle('active', href === '#' + current);
      });
    }, { passive: true });
  }

  /* ── 9. Countdown timer untuk promo banner (opsional) ── */
  const countdownEl = document.getElementById('promoCountdown');
  if (countdownEl) {
    // Set target: akhir hari ini 23:59
    const now    = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const tick   = setInterval(() => {
      const diff = target - new Date();
      if (diff <= 0) { clearInterval(tick); countdownEl.textContent = 'Berakhir!'; return; }
      const h  = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m  = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s  = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      countdownEl.textContent = `${h}:${m}:${s}`;
    }, 1000);
  }

});
