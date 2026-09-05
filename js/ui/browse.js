// AmpVault — Browse View Module
import { ampIconSVG, heartIcon, compareIcon, formatType } from '../utils.js';
import { state, applyFilters, isFilterActive } from '../state.js';

let gridEl, countEl, emptyEl, indicatorEl, indicatorTextEl;

function renderAmpCard(amp, index = 0) {
  const isFav = state.favorites.includes(amp.id);
  const isCompare = state.compareList.includes(amp.id);

  return `
    <article class="amp-card" data-id="${amp.id}" data-type="${amp.type}" 
             style="animation-delay: ${Math.min(index * 50, 400)}ms"
             tabindex="0" role="button" aria-label="View details for ${amp.brand} ${amp.name}">
      <div class="amp-card__visual">
        <span class="amp-card__badge">${formatType(amp.type)}</span>
        <div class="amp-card__actions">
          <button class="amp-card__action-btn ${isFav ? 'favorited' : ''}" 
                  data-action="favorite" data-id="${amp.id}"
                  aria-label="${isFav ? 'Remove from' : 'Add to'} favorites" title="${isFav ? 'Unsave' : 'Save'}">
            ${heartIcon(isFav)}
          </button>
          <button class="amp-card__action-btn ${isCompare ? 'compared' : ''}"
                  data-action="compare" data-id="${amp.id}"
                  aria-label="${isCompare ? 'Remove from' : 'Add to'} comparison" title="${isCompare ? 'Uncompare' : 'Compare'}">
            ${compareIcon(isCompare)}
          </button>
        </div>
        <div class="amp-card__amp-icon">${ampIconSVG(amp.type, 80)}</div>
        <div class="amp-card__glow"></div>
      </div>
      <div class="amp-card__body">
        <div class="amp-card__brand">${amp.brand}</div>
        <h3 class="amp-card__name">${amp.name}</h3>
        <div class="amp-card__specs">
          <span class="amp-card__spec"><span class="amp-card__spec-label">Power</span> ${typeof amp.wattage === 'number' ? amp.wattage + 'W' : amp.wattage}</span>
          <span class="amp-card__spec"><span class="amp-card__spec-label">Speaker</span> ${amp.speaker.split(' ')[0]}</span>
        </div>
        <div class="amp-card__tags">
          ${amp.genres.slice(0, 3).map(g => `<span class="amp-card__tag">${g}</span>`).join('')}
        </div>
      </div>
      <div class="amp-card__footer">
        <span class="amp-card__price">$${amp.price.toLocaleString()}</span>
        <span class="amp-card__rating">${ampIconSVG ? '' : ''}★ ${amp.rating}</span>
      </div>
    </article>
  `;
}

export function renderGrid(target, amps) {
  if (amps.length === 0) {
    target.innerHTML = '';
    return false;
  }
  target.innerHTML = amps.map((amp, i) => renderAmpCard(amp, i)).join('');
  return true;
}

export function refreshBrowseView() {
  if (!gridEl) return;
  const amps = applyFilters();
  const hasResults = renderGrid(gridEl, amps);

  countEl.textContent = `${amps.length} amplifier${amps.length !== 1 ? 's' : ''}`;
  emptyEl.hidden = hasResults;
  gridEl.style.display = hasResults ? '' : 'none';

  updateFilterIndicator();
}

function updateFilterIndicator() {
  const active = isFilterActive();
  indicatorEl.classList.toggle('visible', active);
  if (active) {
    const parts = [];
    const f = state.filters;
    if (f.type !== 'all') parts.push(f.type);
    if (f.form !== 'all') parts.push(f.form);
    if (f.genre !== 'all') parts.push(f.genre);
    if (f.tone !== 'all') parts.push(f.tone);
    if (f.search.trim()) parts.push(`"${f.search.trim()}"`);
    if (f.wattMin > 1 || f.wattMax < 600) parts.push(`${f.wattMin}-${f.wattMax}W`);
    if (f.priceMin > 0 || f.priceMax < 5000) parts.push(`$${f.priceMin}-$${f.priceMax}`);
    indicatorTextEl.textContent = `Active: ${parts.join(', ')}`;
  }
}

export function showLoadingSkeleton() {
  const grid = document.getElementById('ampGrid');
  const empty = document.getElementById('emptyState');
  if (!grid) return;
  const skeletonHTML = Array(6).fill('').map(() => `
    <div class="skeleton-card">
      <div class="skeleton-card__visual"></div>
      <div class="skeleton-card__body">
        <div class="skeleton-line skeleton-line--short"></div>
        <div class="skeleton-line skeleton-line--long"></div>
        <div class="skeleton-line skeleton-line--medium"></div>
        <div style="display:flex;gap:6px;margin-top:4px">
          <span class="skeleton-line skeleton-line--tag"></span>
          <span class="skeleton-line skeleton-line--tag"></span>
        </div>
      </div>
    </div>
  `).join('');
  grid.innerHTML = skeletonHTML;
  grid.style.display = '';
  if (empty) empty.hidden = true;
}

export function initBrowseView(callbacks) {
  gridEl = document.getElementById('ampGrid');
  countEl = document.getElementById('ampCount');
  emptyEl = document.getElementById('emptyState');
  indicatorEl = document.getElementById('filterIndicator');
  indicatorTextEl = document.getElementById('filterIndicatorText');
  indicatorClearBtn = document.getElementById('filterIndicatorClear');
  
  if (gridEl) {
    gridEl.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        e.stopPropagation();
        callbacks.onAction(actionBtn.dataset.action, actionBtn.dataset.id);
        return;
      }
      const card = e.target.closest('.amp-card');
      if (card) callbacks.onCardClick(card.dataset.id);
    });

    gridEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.amp-card');
        if (card) { e.preventDefault(); callbacks.onCardClick(card.dataset.id); }
      }
    });
  }

  if (indicatorClearBtn) {
    indicatorClearBtn.addEventListener('click', callbacks.onClearFilters);
  }
}

let indicatorClearBtn;
