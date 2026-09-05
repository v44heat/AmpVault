// AmpVault — State Management
import { AMPS } from './data.js';

const MAX_COMPARE = 4;

export const state = {
  amps: AMPS,
  filteredAmps: [...AMPS],
  view: 'browse',
  favorites: JSON.parse(localStorage.getItem('ampvault_favorites') || '[]'),
  compareList: JSON.parse(localStorage.getItem('ampvault_compare') || '[]'),
  filters: {
    type: 'all',
    form: 'all',
    genre: 'all',
    tone: 'all',
    wattMin: 1,
    wattMax: 600,
    priceMin: 0,
    priceMax: 5000,
    search: ''
  },
  sort: 'name'
};

export function saveFavorites() {
  localStorage.setItem('ampvault_favorites', JSON.stringify(state.favorites));
}

export function saveCompare() {
  localStorage.setItem('ampvault_compare', JSON.stringify(state.compareList));
}

export function toggleFavorite(id) {
  const idx = state.favorites.indexOf(id);
  if (idx > -1) {
    state.favorites.splice(idx, 1);
    return false; // removed
  } else {
    state.favorites.push(id);
    return true; // added
  }
}

export function toggleCompare(id) {
  const idx = state.compareList.indexOf(id);
  if (idx > -1) {
    state.compareList.splice(idx, 1);
    return { added: false, success: true };
  } else {
    if (state.compareList.length >= MAX_COMPARE) {
      return { added: false, success: false };
    }
    state.compareList.push(id);
    return { added: true, success: true };
  }
}

export function applyFilters() {
  let result = [...state.amps];
  const f = state.filters;

  if (f.type !== 'all') result = result.filter(a => a.type === f.type);
  if (f.form !== 'all') result = result.filter(a => a.form === f.form);
  if (f.genre !== 'all') result = result.filter(a => a.genres.includes(f.genre));
  if (f.tone !== 'all') result = result.filter(a => a.tones[f.tone] >= 6);

  result = result.filter(a => {
    if (typeof a.wattage !== 'number') return true;
    return a.wattage >= f.wattMin && a.wattage <= f.wattMax;
  });

  result = result.filter(a => a.price >= f.priceMin && a.price <= f.priceMax);

  if (f.search.trim()) {
    const q = f.search.toLowerCase().trim();
    result = result.filter(a =>
      a.brand.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.genres.some(g => g.includes(q)) ||
      a.type.includes(q) ||
      a.form.includes(q) ||
      a.tagline.toLowerCase().includes(q)
    );
  }

  result.sort((a, b) => {
    switch (state.sort) {
      case 'name': return a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name);
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'wattage-asc': return (typeof a.wattage === 'number' ? a.wattage : 999) - (typeof b.wattage === 'number' ? b.wattage : 999);
      case 'wattage-desc': return (typeof b.wattage === 'number' ? b.wattage : 0) - (typeof a.wattage === 'number' ? a.wattage : 0);
      case 'rating': return b.rating - a.rating;
      default: return 0;
    }
  });

  state.filteredAmps = result;
  return result;
}

export function isFilterActive() {
  const f = state.filters;
  return f.type !== 'all' || f.form !== 'all' || f.genre !== 'all' || f.tone !== 'all' ||
    f.wattMin > 1 || f.wattMax < 600 || f.priceMin > 0 || f.priceMax < 5000 || f.search.trim() !== '';
}

export function resetFilters() {
  state.filters = {
    type: 'all', form: 'all', genre: 'all', tone: 'all',
    wattMin: 1, wattMax: 600, priceMin: 0, priceMax: 5000, search: ''
  };
}
