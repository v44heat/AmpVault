// AmpVault — Main Entry Point
import { state, toggleFavorite, toggleCompare, saveFavorites, saveCompare, applyFilters, resetFilters } from './state.js';
import { initBrowseView, refreshBrowseView, showLoadingSkeleton } from './ui/browse.js';
import { initCompareView, renderCompareView, updateCompareBadge } from './ui/compare.js';
import { initFavoritesView, refreshFavoritesView, updateFavBadge } from './ui/favorites.js';
import { initDetailPanel, openDetail, closeDetail } from './ui/detail.js';
import { initKeyboard, initKeyboardNavDetection } from './keyboard.js';

// --- Toast System ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast__icon">${type === 'warning' ? '⚠' : type === 'success' ? '✓' : '◆'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 250);
  }, 2000);
}

// --- View Switching ---
function switchView(view) {
  state.view = view;
  document.querySelectorAll('.topbar__btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

  if (view === 'browse') {
    document.getElementById('browseView').classList.add('active');
    refreshBrowseView();
  } else if (view === 'compare') {
    document.getElementById('compareView').classList.add('active');
    renderCompareView();
  } else if (view === 'favorites') {
    document.getElementById('favoritesView').classList.add('active');
    refreshFavoritesView();
  }
}

// --- Card Action Handler ---
function handleCardAction(action, id) {
  if (action === 'favorite') {
    const added = toggleFavorite(id);
    saveFavorites();
    updateFavBadge();
    refreshCurrentView();
    showToast(added ? 'Added to saved' : 'Removed from saved');
  } else if (action === 'compare') {
    const result = toggleCompare(id);
    saveCompare();
    updateCompareBadge();
    refreshCurrentView();
    if (!result.success) {
      showToast('Maximum 4 amps for comparison', 'warning');
    } else {
      showToast(result.added ? 'Added to comparison' : 'Removed from comparison');
    }
  }
}

function refreshCurrentView() {
  if (state.view === 'browse') refreshBrowseView();
  else if (state.view === 'compare') renderCompareView();
  else if (state.view === 'favorites') refreshFavoritesView();
}

// --- Filter Wiring ---
function wireFilters() {
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const filterType = chip.dataset.filter;
      const value = chip.dataset.value;
      chip.closest('.filter-chips').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.filters[filterType] = value;
      refreshBrowseView();
    });
  });

  // Wattage range
  const wattMin = document.getElementById('wattMin');
  const wattMax = document.getElementById('wattMax');
  const wattMinLabel = document.getElementById('wattMinLabel');
  const wattMaxLabel = document.getElementById('wattMaxLabel');

  function updateWattRange() {
    let min = parseInt(wattMin.value), max = parseInt(wattMax.value);
    if (min > max) { [min, max] = [max, min]; wattMin.value = min; wattMax.value = max; }
    state.filters.wattMin = min; state.filters.wattMax = max;
    wattMinLabel.textContent = min + 'W'; wattMaxLabel.textContent = max + 'W';
    refreshBrowseView();
  }
  wattMin?.addEventListener('input', updateWattRange);
  wattMax?.addEventListener('input', updateWattRange);

  // Price range
  const priceMin = document.getElementById('priceMin');
  const priceMax = document.getElementById('priceMax');
  const priceMinLabel = document.getElementById('priceMinLabel');
  const priceMaxLabel = document.getElementById('priceMaxLabel');

  function updatePriceRange() {
    let min = parseInt(priceMin.value), max = parseInt(priceMax.value);
    if (min > max) { [min, max] = [max, min]; priceMin.value = min; priceMax.value = max; }
    state.filters.priceMin = min; state.filters.priceMax = max;
    priceMinLabel.textContent = '$' + min.toLocaleString(); priceMaxLabel.textContent = '$' + max.toLocaleString();
    refreshBrowseView();
  }
  priceMin?.addEventListener('input', updatePriceRange);
  priceMax?.addEventListener('input', updatePriceRange);

  // Search
  let searchTimeout;
  const searchInput = document.getElementById('searchInput');
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.filters.search = searchInput.value;
      refreshBrowseView();
    }, 200);
  });

  // Sort
  document.getElementById('sortSelect')?.addEventListener('change', (e) => {
    state.sort = e.target.value;
    refreshBrowseView();
  });

  // Clear all
  function doResetFilters() {
    resetFilters();
    const si = document.getElementById('searchInput');
    if (si) si.value = '';
    document.getElementById('wattMin').value = 1;
    document.getElementById('wattMax').value = 600;
    document.getElementById('priceMin').value = 0;
    document.getElementById('priceMax').value = 5000;
    document.getElementById('wattMinLabel').textContent = '1W';
    document.getElementById('wattMaxLabel').textContent = '600W';
    document.getElementById('priceMinLabel').textContent = '$0';
    document.getElementById('priceMaxLabel').textContent = '$5,000';
    document.querySelectorAll('.filter-chips').forEach(fc => {
      fc.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      fc.querySelector('.chip[data-value="all"]')?.classList.add('active');
    });
    refreshBrowseView();
    showToast('Filters cleared');
  }

  document.getElementById('clearFilters')?.addEventListener('click', doResetFilters);
  document.getElementById('emptyReset')?.addEventListener('click', doResetFilters);
  document.getElementById('filterIndicatorClear')?.addEventListener('click', doResetFilters);

  return doResetFilters;
}

// --- Navigation Wiring ---
function wireNav() {
  document.querySelectorAll('.topbar__btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  document.getElementById('clearCompare')?.addEventListener('click', () => {
    state.compareList = [];
    saveCompare();
    updateCompareBadge();
    renderCompareView();
    showToast('Comparison cleared');
  });

  document.getElementById('goBrowse')?.addEventListener('click', () => switchView('browse'));
  document.getElementById('goBrowseFav')?.addEventListener('click', () => switchView('browse'));

  // Mobile sidebar toggle
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 900 && document.getElementById('sidebar').classList.contains('open')) {
      if (!document.getElementById('sidebar').contains(e.target) && e.target !== document.getElementById('sidebarToggle')) {
        document.getElementById('sidebar').classList.remove('open');
      }
    }
  });

  // Scroll to top
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// --- Export ---
function handleExport() {
  const favAmps = state.favorites.map(id => state.amps.find(a => a.id === id)).filter(Boolean);
  if (favAmps.length === 0) { showToast('No favorites to export'); return; }
  const exportData = favAmps.map(a => ({
    brand: a.brand, name: a.name, type: a.type, wattage: a.wattage,
    price: a.price, rating: a.rating, genres: a.genres, tones: a.tones, features: a.features
  }));
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = 'ampvault-favorites.json'; link.click();
  URL.revokeObjectURL(url);
  showToast(`Exported ${favAmps.length} saved amplifier${favAmps.length !== 1 ? 's' : ''}`);
}

// --- INIT ---
function init() {
  const searchInput = document.getElementById('searchInput');
  const sidebar = document.getElementById('sidebar');
  const detailOverlay = document.getElementById('detailOverlay');

  // Init modules
  initDetailPanel();
  initBrowseView({
    onCardClick: (id) => openDetail(id, { onToggleFavorite: (fid) => { toggleFavorite(fid); saveFavorites(); updateFavBadge(); refreshCurrentView(); }, onToggleCompare: (cid) => { toggleCompare(cid); saveCompare(); updateCompareBadge(); refreshCurrentView(); } }),
    onAction: handleCardAction,
    onClearFilters: () => { /* placeholder - wired in wireFilters */ }
  });
  initCompareView({ onRemove: (id) => { toggleCompare(id); saveCompare(); updateCompareBadge(); renderCompareView(); showToast('Removed from comparison'); } });
  initFavoritesView({
    onCardClick: (id) => openDetail(id, { onToggleFavorite: (fid) => { toggleFavorite(fid); saveFavorites(); updateFavBadge(); refreshCurrentView(); }, onToggleCompare: (cid) => { toggleCompare(cid); saveCompare(); updateCompareBadge(); refreshCurrentView(); } }),
    onAction: handleCardAction,
    onExport: handleExport
  });

  wireFilters();
  wireNav();
  updateCompareBadge();
  updateFavBadge();

  // Keyboard
  initKeyboard({
    onSearchFocus: () => { searchInput?.focus(); searchInput?.select(); },
    onSwitchView: switchView,
    onEscape: () => {
      if (!detailOverlay?.hidden) { closeDetail(); }
      else if (sidebar?.classList.contains('open')) { sidebar.classList.remove('open'); }
      else if (document.activeElement?.tagName === 'INPUT') { document.activeElement.blur(); }
    }
  });
  initKeyboardNavDetection();

  // Initial render with skeleton delay
  setTimeout(() => refreshBrowseView(), 300);
}

// Run
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
