/**
 * Format angka ke rupiah
 * @param {number} num
 * @returns {string}
 */
function formatRupiah(num) {
  return 'Rp' + num.toLocaleString('id-ID');
}

/**
 * Render bintang rating HTML
 * @param {number} rating
 * @returns {string}
 */
function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

/**
 * Simpan data ke localStorage
 * @param {string} key
 * @param {*} value
 */
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage error:', e);
  }
}

/**
 * Ambil data dari localStorage
 * @param {string} key
 * @param {*} fallback
 * @returns {*}
 */
function getFromStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

/**
 * Tampilkan toast notification
 * @param {string} message
 * @param {number} duration ms
 */
function showToast(message, duration = 2800) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

/**
 * Debounce fungsi
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Setup scroll animation observer
 */
function initScrollAnimations() {
  const els = document.querySelectorAll('[data-animate]');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });
  els.forEach(el => obs.observe(el));
}

/**
 * Generate order ID unik
 * @returns {string}
 */
function generateOrderId() {
  return 'UD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2,4).toUpperCase();
}

// Ekspor global
window.formatRupiah = formatRupiah;
window.renderStars  = renderStars;
window.saveToStorage = saveToStorage;
window.getFromStorage = getFromStorage;
window.showToast = showToast;
window.debounce  = debounce;
window.initScrollAnimations = initScrollAnimations;
window.generateOrderId = generateOrderId;


/* ═══════════════════════════════════════
   js/main.js
   TUGAS: RAKHA UKTA (PM & Lead Dev)
   Commit: "feat: app entry point, init all modules"
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Init scroll animations
  initScrollAnimations();

  // Render featured products di homepage
  const featuredGrid = document.getElementById('featuredGrid');
  if (featuredGrid && window.PRODUCTS) {
    const featured = PRODUCTS.filter(p => p.featured);
    renderProductGrid(featured, featuredGrid);
  }

  // Render testimonials di homepage
  const testiTrack = document.getElementById('testiTrack');
  if (testiTrack && window.TESTIMONIALS) {
    renderTestimonials(TESTIMONIALS, testiTrack);
  }

  // Init cart badge
  if (typeof updateCartBadge === 'function') updateCartBadge();

  // Search functionality
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) return;
      // Redirect ke catalog dengan query
      window.location.href = `pages/catalog.html?search=${encodeURIComponent(q)}`;
    }, 600));
  }
});
