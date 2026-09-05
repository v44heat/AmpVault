// AmpVault — Detail Panel Module
import { ampIconSVG, heartIcon, formatType } from '../utils.js';
import { state } from '../state.js';

let overlayEl, contentEl, closeBtn;

function glowColor(type) {
  const colors = { 'tube': '#ff8844', 'solid-state': '#4488cc', 'modeling': '#44cc88', 'hybrid': '#cc44aa' };
  return colors[type] || '#ff8844';
}

export function openDetail(id, callbacks) {
  const amp = state.amps.find(a => a.id === id);
  if (!amp) return;

  const isFav = state.favorites.includes(amp.id);
  const isCompare = state.compareList.includes(amp.id);

  contentEl.innerHTML = `
    <div class="detail__hero detail__hero--${amp.type}">
      <div class="amp-card__badge" style="position:absolute;top:16px;left:16px;font-size:0.7rem">${formatType(amp.type)}</div>
      ${ampIconSVG(amp.type, 140)}
      <div class="detail__hero-glow" style="background: ${glowColor(amp.type)}"></div>
    </div>
    <div class="detail__body">
      <div class="detail__brand">${amp.brand}</div>
      <h2 class="detail__name">${amp.name}</h2>
      <p class="detail__tagline">${amp.tagline}</p>
      
      <div class="detail__price-row">
        <span class="detail__price">$${amp.price.toLocaleString()}</span>
        <span class="detail__rating">${Array(5).fill(0).map((_, i) => `<svg width="14" height="14" viewBox="0 0 14 14" fill="${i < Math.floor(amp.rating) ? 'currentColor' : 'none'}"><path d="M7 1l1.76 3.57 3.94.57-2.85 2.78.67 3.93L7 10.07l-3.52 1.85.67-3.93L1.3 5.14l3.94-.57z" stroke="currentColor" stroke-width="1"/></svg>`).join('')} ${amp.rating}</span>
        <div class="detail__actions">
          <button class="btn ${isFav ? 'btn--primary' : 'btn--outline'}" id="detailFav" data-id="${amp.id}">
            ${heartIcon(isFav)} ${isFav ? 'Saved' : 'Save'}
          </button>
          <button class="btn ${isCompare ? 'btn--primary' : 'btn--outline'}" id="detailCompare" data-id="${amp.id}">
            Compare
          </button>
        </div>
      </div>

      <div class="detail__section">
        <h3 class="detail__section-title">Description</h3>
        <p class="detail__desc">${amp.description}</p>
      </div>

      <div class="detail__section">
        <h3 class="detail__section-title">Specifications</h3>
        <div class="detail__specs-grid">
          <div class="detail__spec"><div class="detail__spec-label">Power</div><div class="detail__spec-value">${typeof amp.wattage === 'number' ? amp.wattage + 'W' : amp.wattage}</div></div>
          <div class="detail__spec"><div class="detail__spec-label">Technology</div><div class="detail__spec-value">${formatType(amp.type)}</div></div>
          <div class="detail__spec"><div class="detail__spec-label">Speakers</div><div class="detail__spec-value">${amp.speaker}</div></div>
          <div class="detail__spec"><div class="detail__spec-label">Impedance</div><div class="detail__spec-value">${amp.impedance}</div></div>
          <div class="detail__spec"><div class="detail__spec-label">Channels</div><div class="detail__spec-value">${amp.channels}</div></div>
          <div class="detail__spec"><div class="detail__spec-label">Weight</div><div class="detail__spec-value">${amp.weight}</div></div>
          <div class="detail__spec"><div class="detail__spec-label">Dimensions</div><div class="detail__spec-value">${amp.dimensions}</div></div>
          <div class="detail__spec"><div class="detail__spec-label">Form</div><div class="detail__spec-value">${amp.form.charAt(0).toUpperCase() + amp.form.slice(1)}</div></div>
        </div>
      </div>

      <div class="detail__section">
        <h3 class="detail__section-title">Tone Character</h3>
        <div class="detail__tone-viz">
          ${Object.entries({ warm: 'Warmth', bright: 'Brightness', crunch: 'Crunch', gain: 'Gain', clean: 'Clean' }).map(([key, label]) => `
            <div class="detail__tone-row">
              <span class="detail__tone-label">${label}</span>
              <div class="detail__tone-bar">
                <div class="detail__tone-fill ${key}" style="width: 0%" data-target="${amp.tones[key] * 10}"></div>
              </div>
              <span class="detail__tone-value">${amp.tones[key]}/10</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="detail__section">
        <h3 class="detail__section-title">Best Genres</h3>
        <div class="detail__genres">
          ${amp.genres.map(g => `<span class="detail__genre-tag">${g.charAt(0).toUpperCase() + g.slice(1)}</span>`).join('')}
        </div>
      </div>

      <div class="detail__section">
        <h3 class="detail__section-title">Key Features</h3>
        <ul style="list-style:none;padding:0;margin:0;font-size:0.9rem;line-height:2;color:var(--ink-soft)">
          ${amp.features.map(f => `<li style="padding:2px 0">✦ ${f}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  overlayEl.hidden = false;
  document.body.style.overflow = 'hidden';

  // Animate tone bars
  requestAnimationFrame(() => {
    setTimeout(() => {
      contentEl.querySelectorAll('.detail__tone-fill').forEach(bar => {
        bar.style.width = bar.dataset.target + '%';
      });
    }, 100);
  });

  // Wire buttons
  document.getElementById('detailFav')?.addEventListener('click', (e) => {
    e.stopPropagation();
    callbacks.onToggleFavorite(amp.id);
    const isNowFav = state.favorites.includes(amp.id);
    const btn = e.currentTarget;
    btn.className = `btn ${isNowFav ? 'btn--primary' : 'btn--outline'}`;
    btn.innerHTML = `${heartIcon(isNowFav)} ${isNowFav ? 'Saved' : 'Save'}`;
  });

  document.getElementById('detailCompare')?.addEventListener('click', (e) => {
    e.stopPropagation();
    callbacks.onToggleCompare(amp.id);
    const isNowComp = state.compareList.includes(amp.id);
    const btn = e.currentTarget;
    btn.className = `btn ${isNowComp ? 'btn--primary' : 'btn--outline'}`;
  });
}

export function closeDetail() {
  overlayEl.hidden = true;
  document.body.style.overflow = '';
}

export function initDetailPanel() {
  overlayEl = document.getElementById('detailOverlay');
  contentEl = document.getElementById('detailContent');
  closeBtn = document.getElementById('detailClose');

  closeBtn?.addEventListener('click', closeDetail);
  overlayEl?.addEventListener('click', (e) => {
    if (e.target === overlayEl) closeDetail();
  });
}
