// AmpVault — Favorites View Module
import { state } from '../state.js';
import { renderGrid } from './browse.js';

let gridEl, emptyEl, countEl;

export function refreshFavoritesView() {
  if (!gridEl) return;
  const amps = state.favorites.map(id => state.amps.find(a => a.id === id)).filter(Boolean);
  const hasResults = renderGrid(gridEl, amps);

  gridEl.style.display = hasResults ? '' : 'none';
  emptyEl.hidden = hasResults;
  countEl.textContent = `${amps.length} saved`;
}

export function updateFavBadge() {
  const badge = document.getElementById('favBadge');
  const count = state.favorites.length;
  if (badge) { badge.hidden = count === 0; badge.textContent = count; }
}

export function initFavoritesView(callbacks) {
  gridEl = document.getElementById('favGrid');
  emptyEl = document.getElementById('favEmpty');
  countEl = document.getElementById('favCount');

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

  // Export button
  const exportBtn = document.getElementById('exportFavs');
  if (exportBtn) {
    exportBtn.addEventListener('click', callbacks.onExport);
  }
}
