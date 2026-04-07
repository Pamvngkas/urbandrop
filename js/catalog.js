/* ─── Render single product card HTML ─── */
function renderProductCard(product) {
  const hasDiscount = product.discount > 0;
  const badgeMap = {
    sale: '<span class="badge badge--sale">Sale</span>',
    new:  '<span class="badge badge--new">Baru</span>',
    hit:  '<span class="badge badge--hit">Hits</span>',
  };

  return `
    <div class="product-card" data-id="${product.id}" data-animate>
      <div class="product-card__img-wrap">
        ${product.badge ? `<div class="product-card__badges">${badgeMap[product.badge] || ''}</div>` : ''}
        <div class="product-card__img-placeholder">${product.emoji}</div>
        <button class="product-card__wish" data-id="${product.id}" aria-label="Wishlist" title="Tambah Wishlist">
          ♡
        </button>
        <div class="product-card__actions">
          <button class="btn btn--white btn--sm add-to-cart-btn" data-id="${product.id}">
            + Keranjang
          </button>
          <a href="pages/product.html?id=${product.id}" class="btn btn--primary btn--sm">
            Lihat
          </a>
        </div>
      </div>
      <div class="product-card__info">
        <p class="product-card__cat">${product.category}</p>
        <h3 class="product-card__name">${product.name}</h3>
        <div class="product-card__rating">
          <span class="stars">${renderStars(product.rating)}</span>
          <span>${product.rating} (${product.reviewCount})</span>
        </div>
        <div class="product-card__pricing">
          <span class="product-card__price">${formatRupiah(product.price)}</span>
          ${hasDiscount ? `<span class="product-card__price--original">${formatRupiah(product.originalPrice)}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

/* ─── Render grid of products ─── */
function renderProductGrid(products, container) {
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state__icon">🔍</div>
        <h3>Produk tidak ditemukan</h3>
        <p>Coba kata kunci atau filter yang berbeda</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(renderProductCard).join('');

  // Re-init scroll animations for newly rendered cards
  initScrollAnimations();

  // Bind add to cart buttons
  container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const product = PRODUCTS.find(p => p.id === id);
      if (product && typeof addToCart === 'function') {
        addToCart(product);
        showToast(`✅ ${product.name} ditambahkan ke keranjang!`);
        // Pop animation on badge
        const badge = document.getElementById('cartBadge');
        if (badge) {
          badge.classList.add('pop');
          setTimeout(() => badge.classList.remove('pop'), 300);
        }
      }
    });
  });

  // Bind wishlist buttons
  container.querySelectorAll('.product-card__wish').forEach(btn => {
    const id = parseInt(btn.dataset.id);
    const wishlist = getFromStorage('ud_wishlist', []);
    if (wishlist.includes(id)) btn.classList.add('active');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlist(id, btn);
    });
  });
}

/* ─── Wishlist toggle ─── */
function toggleWishlist(id, btn) {
  let wishlist = getFromStorage('ud_wishlist', []);
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(w => w !== id);
    btn.classList.remove('active');
    btn.textContent = '♡';
    showToast('Dihapus dari wishlist');
  } else {
    wishlist.push(id);
    btn.classList.add('active');
    btn.textContent = '♥';
    showToast('❤️ Ditambahkan ke wishlist!');
  }
  saveToStorage('ud_wishlist', wishlist);
}

/* ─── Catalog Page Logic ─── */
function initCatalogPage() {
  const catalogGrid    = document.getElementById('catalogGrid');
  const countEl        = document.getElementById('productCount');
  const sortSelect     = document.getElementById('sortSelect');
  const filterResetBtn = document.getElementById('filterReset');
  const searchLabel    = document.getElementById('searchLabel');

  if (!catalogGrid) return;

  let activeFilters = {
    categories: [],
    priceMin: 0,
    priceMax: Infinity,
    search: ''
  };

  /* ── Parse URL params ── */
  const params = new URLSearchParams(window.location.search);
  const catParam    = params.get('cat');
  const searchParam = params.get('search');

  if (catParam && catParam !== 'all') {
    activeFilters.categories = [catParam];
    // Check matching checkbox
    const cb = document.querySelector(`.filter-cat[value="${catParam}"]`);
    if (cb) cb.checked = true;
  }
  if (searchParam) {
    activeFilters.search = searchParam.toLowerCase();
    if (searchLabel) searchLabel.textContent = `Hasil untuk: "${searchParam}"`;
  }

  /* ── Apply filters & sort ── */
  function applyFilters() {
    let filtered = [...PRODUCTS];

    // Category
    if (activeFilters.categories.length > 0) {
      filtered = filtered.filter(p => activeFilters.categories.includes(p.category));
    }

    // Price
    filtered = filtered.filter(p =>
      p.price >= activeFilters.priceMin &&
      p.price <= activeFilters.priceMax
    );

    // Search
    if (activeFilters.search) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(activeFilters.search) ||
        p.category.toLowerCase().includes(activeFilters.search)
      );
    }

    // Sort
    const sortVal = sortSelect ? sortSelect.value : 'default';
    switch (sortVal) {
      case 'price-asc':  filtered.sort((a,b) => a.price - b.price); break;
      case 'price-desc': filtered.sort((a,b) => b.price - a.price); break;
      case 'rating':     filtered.sort((a,b) => b.rating - a.rating); break;
      case 'newest':     filtered.sort((a,b) => b.id - a.id); break;
      case 'sale':       filtered.sort((a,b) => b.discount - a.discount); break;
    }

    renderProductGrid(filtered, catalogGrid);
    if (countEl) countEl.textContent = `${filtered.length} produk`;
  }

  /* ── Category checkboxes ── */
  document.querySelectorAll('.filter-cat').forEach(cb => {
    cb.addEventListener('change', () => {
      activeFilters.categories = [...document.querySelectorAll('.filter-cat:checked')].map(c => c.value);
      applyFilters();
    });
  });

  /* ── Price filter ── */
  const priceMinInput = document.getElementById('priceMin');
  const priceMaxInput = document.getElementById('priceMax');
  const applyPrice = debounce(() => {
    activeFilters.priceMin = parseInt(priceMinInput?.value) || 0;
    activeFilters.priceMax = parseInt(priceMaxInput?.value) || Infinity;
    applyFilters();
  }, 500);
  priceMinInput?.addEventListener('input', applyPrice);
  priceMaxInput?.addEventListener('input', applyPrice);

  /* ── Sort ── */
  if (sortSelect) sortSelect.addEventListener('change', applyFilters);

  /* ── Reset filters ── */
  if (filterResetBtn) {
    filterResetBtn.addEventListener('click', () => {
      activeFilters = { categories: [], priceMin: 0, priceMax: Infinity, search: '' };
      document.querySelectorAll('.filter-cat').forEach(cb => cb.checked = false);
      if (priceMinInput) priceMinInput.value = '';
      if (priceMaxInput) priceMaxInput.value = '';
      if (sortSelect)    sortSelect.value = 'default';
      applyFilters();
    });
  }

  /* ── View toggle (grid/list) ── */
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;
      catalogGrid.classList.toggle('catalog-grid--list', view === 'list');
    });
  });

  // Initial render
  applyFilters();
}

// Ekspor global
window.renderProductGrid = renderProductGrid;
window.renderProductCard = renderProductCard;

// Auto-init catalog page
document.addEventListener('DOMContentLoaded', initCatalogPage);
