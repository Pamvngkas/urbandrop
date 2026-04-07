(function () {
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('mobileNav');
  const searchToggle = document.getElementById('searchToggle');
  const searchClose  = document.getElementById('searchClose');
  const searchBar    = document.getElementById('searchBar');
  const searchInput  = document.getElementById('searchInput');

  /* ── Navbar scroll effect ── */
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ── Hamburger Menu ── */
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  window.closeMobileNav = function () {
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    hamburger && hamburger.classList.remove('open');
    document.body.style.overflow = '';
  };

  /* ── Search Bar Toggle ── */
  if (searchToggle && searchBar) {
    searchToggle.addEventListener('click', () => {
      searchBar.classList.toggle('open');
      if (searchBar.classList.contains('open') && searchInput) {
        searchInput.focus();
      }
    });
  }
  if (searchClose && searchBar) {
    searchClose.addEventListener('click', () => {
      searchBar.classList.remove('open');
      if (searchInput) searchInput.value = '';
    });
  }

  /* ── Active nav link based on URL ── */
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && window.location.href.includes(href) && href !== '#') {
      link.classList.add('active');
    }
  });
})();
