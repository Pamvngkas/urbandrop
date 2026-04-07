/* ═══════════════════════════════════════
   js/cart.js
   TUGAS: NAOMI
   Commit: "feat: cart logic, sidebar render, localStorage persistence"
   ═══════════════════════════════════════ */

/* ─── Cart State ─── */
let cart = getFromStorage("ud_cart", []);

/* ─── Cart Operations ─── */
function addToCart(product, size = null, qty = 1) {
  const variant = size || (product.sizes && product.sizes[0]) || "One Size";
  const key = `${product.id}-${variant}`;
  const existing = cart.find((item) => item.key === key);

  if (existing) {
    existing.qty = Math.min(existing.qty + qty, 10); // max 10 per item
  } else {
    cart.push({
      key,
      id: product.id,
      name: product.name,
      price: product.price,
      emoji: product.emoji,
      size: variant,
      qty,
    });
  }

  persistCart();
  renderCartSidebar();
  updateCartBadge();
}

function removeFromCart(key) {
  cart = cart.filter((item) => item.key !== key);
  persistCart();
  renderCartSidebar();
  updateCartBadge();
}

function updateQty(key, delta) {
  const item = cart.find((i) => i.key === key);
  if (!item) return;
  item.qty = Math.max(1, Math.min(item.qty + delta, 10));
  persistCart();
  renderCartSidebar();
}

function clearCart() {
  cart = [];
  persistCart();
  renderCartSidebar();
  updateCartBadge();
}

function persistCart() {
  saveToStorage("ud_cart", cart);
}

/* ─── Cart Totals ─── */
function getCartSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartTotal(couponDiscount = 0) {
  const subtotal = getCartSubtotal();
  const shipping = subtotal >= 150000 ? 0 : 25000;
  return subtotal + shipping - couponDiscount;
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

/* ─── Update Badge ─── */
function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}

/* ─── Render Cart Sidebar ─── */
function renderCartSidebar() {
  const body = document.getElementById("cartBody");
  const footer = document.getElementById("cartFooter");
  if (!body) return;

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛍️</div>
        <h4>Keranjang kosong</h4>
        <p>Yuk mulai belanja produk favoritmu!</p>
        <a href="${window.location.pathname.includes("pages") ? "../index.html" : "index.html"}" class="btn btn--primary">
          Mulai Belanja
        </a>
      </div>
    `;
    if (footer) footer.innerHTML = "";
    return;
  }

  /* Items */
  body.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item" data-key="${item.key}">
      <div class="cart-item__img">${item.emoji}</div>
      <div class="cart-item__details">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__variant">Ukuran: ${item.size}</p>
        <div class="cart-item__price-row">
          <span class="cart-item__price">${formatRupiah(item.price * item.qty)}</span>
          <div class="qty-control">
            <button class="qty-btn qty-dec" data-key="${item.key}">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn qty-inc" data-key="${item.key}">+</button>
          </div>
        </div>
        <button class="cart-item__remove" data-key="${item.key}">Hapus</button>
      </div>
    </div>
  `,
    )
    .join("");

  /* Bind item actions */
  body.querySelectorAll(".qty-dec").forEach((btn) => {
    btn.addEventListener("click", () => updateQty(btn.dataset.key, -1));
  });
  body.querySelectorAll(".qty-inc").forEach((btn) => {
    btn.addEventListener("click", () => updateQty(btn.dataset.key, +1));
  });
  body.querySelectorAll(".cart-item__remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeFromCart(btn.dataset.key);
      showToast("Item dihapus dari keranjang");
    });
  });

  /* Footer */
  if (!footer) return;
  const subtotal = getCartSubtotal();
  const shipping = subtotal >= 150000 ? 0 : 25000;
  const total = subtotal + shipping;

  footer.innerHTML = `
    <div class="coupon-row">
      <input type="text" id="couponInput" placeholder="Kode promo..." />
      <button class="btn btn--ghost btn--sm" id="couponApply">Pakai</button>
    </div>
    <div class="cart-summary">
      <div class="cart-summary__row">
        <span class="label">Subtotal (${getCartCount()} item)</span>
        <span>${formatRupiah(subtotal)}</span>
      </div>
      <div class="cart-summary__row">
        <span class="label">Ongkos kirim</span>
        <span>${shipping === 0 ? '<span class="free-tag">GRATIS</span>' : formatRupiah(shipping)}</span>
      </div>
      <div class="cart-summary__row" id="discountRow" style="display:none">
        <span class="label">Diskon promo</span>
        <span id="discountAmount" style="color:var(--accent-2)"></span>
      </div>
      <div class="cart-summary__row total">
        <span class="label">Total</span>
        <strong id="cartTotal">${formatRupiah(total)}</strong>
      </div>
    </div>
    <a href="${window.location.pathname.includes("pages") ? "checkout.html" : "pages/checkout.html"}" class="btn btn--primary btn--full">
      Lanjut Checkout →
    </a>
    ${subtotal < 150000 ? `<p style="font-size:12px;color:var(--muted);text-align:center;margin-top:10px">Tambah ${formatRupiah(150000 - subtotal)} lagi untuk gratis ongkir</p>` : ""}
  `;

  /* Coupon logic */
  const couponInput = document.getElementById("couponInput");
  const couponApply = document.getElementById("couponApply");
  const VALID_COUPONS = { URBANDROP50: 0.5, HEMAT20: 0.2, NEWUSER: 0.1 };

  couponApply?.addEventListener("click", () => {
    const code = couponInput?.value.trim().toUpperCase();
    const discount = VALID_COUPONS[code];
    if (discount) {
      const amount = Math.round(subtotal * discount);
      document.getElementById("discountRow").style.display = "flex";
      document.getElementById("discountAmount").textContent =
        `-${formatRupiah(amount)}`;
      document.getElementById("cartTotal").textContent = formatRupiah(
        total - amount,
      );
      saveToStorage("ud_coupon", { code, discount });
      showToast(`🎉 Kode "${code}" berhasil! Diskon ${discount * 100}%`);
    } else {
      showToast("❌ Kode promo tidak valid");
    }
  });
}

/* ─── Cart Sidebar Open/Close ─── */
function openCart() {
  document.getElementById("cartSidebar")?.classList.add("open");
  document.getElementById("cartOverlay")?.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  document.getElementById("cartSidebar")?.classList.remove("open");
  document.getElementById("cartOverlay")?.classList.remove("open");
  document.body.style.overflow = "";
}

/* ─── Bind UI ─── */
document.addEventListener("DOMContentLoaded", () => {
  renderCartSidebar();
  updateCartBadge();

  document.getElementById("cartToggle")?.addEventListener("click", openCart);
  document.getElementById("cartClose")?.addEventListener("click", closeCart);
  document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
});

// Ekspor global
window.cart = cart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQty = updateQty;
window.clearCart = clearCart;
window.getCartSubtotal = getCartSubtotal;
window.getCartTotal = getCartTotal;
window.getCartCount = getCartCount;
window.updateCartBadge = updateCartBadge;
window.renderCartSidebar = renderCartSidebar;
window.openCart = openCart;
window.closeCart = closeCart;
