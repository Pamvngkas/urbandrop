function renderTestimonials(data, container) {
  if (!container || !data) return;

  container.innerHTML = data.map(t => `
    <div class="testi-card" data-animate>
      <div class="testi-card__stars">
        ${'<span>★</span>'.repeat(t.rating)}${'<span style="opacity:.3">★</span>'.repeat(5 - t.rating)}
      </div>
      <p class="testi-card__text">${t.text}</p>
      <div class="testi-card__author">
        <div class="testi-avatar" style="background:${t.avatarColor};color:${t.textColor}">
          ${t.initials}
        </div>
        <div>
          <p class="testi-card__name">${t.name}</p>
          <p class="testi-card__product">${t.product}</p>
        </div>
      </div>
    </div>
  `).join('');

  initScrollAnimations();
}

window.renderTestimonials = renderTestimonials;
