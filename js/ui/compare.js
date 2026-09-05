// AmpVault — Compare View Module
import { ampIconSVG, formatType } from '../utils.js';
import { state } from '../state.js';

const toneLabels = { warm: 'Warmth', bright: 'Brightness', crunch: 'Crunch', gain: 'Gain', clean: 'Clean Headroom' };

const specDefs = [
  { label: 'Technology', key: 'type', format: v => formatType(v) },
  { label: 'Form Factor', key: 'form', format: v => v.charAt(0).toUpperCase() + v.slice(1) },
  { label: 'Wattage', key: 'wattage', format: v => typeof v === 'number' ? `${v}W` : v },
  { label: 'Price', key: 'price', format: v => `$${v.toLocaleString()}` },
  { label: 'Rating', key: 'rating', format: v => `★ ${v}` },
  { label: 'Speakers', key: 'speaker' },
  { label: 'Impedance', key: 'impedance' },
  { label: 'Weight', key: 'weight' },
  { label: 'Channels', key: 'channels' },
];

let tableEl, tableWrapEl, emptyEl, countEl;

export function renderCompareView() {
  if (!tableEl) return;
  const amps = state.compareList.map(id => state.amps.find(a => a.id === id)).filter(Boolean);

  if (amps.length === 0) {
    tableWrapEl.hidden = true;
    emptyEl.hidden = false;
    return;
  }

  tableWrapEl.hidden = false;
  emptyEl.hidden = true;

  let html = `<thead><tr><th></th>`;
  amps.forEach(a => {
    html += `<th class="compare-table__amp-header">
      <div>${ampIconSVG(a.type, 40)}</div>
      <div class="compare-table__amp-brand">${a.brand}</div>
      <div class="compare-table__amp-name">${a.name}</div>
      <button class="compare-table__remove" data-remove="${a.id}" aria-label="Remove ${a.name} from comparison">✕</button>
    </th>`;
  });
  html += `</tr></thead><tbody>`;

  specDefs.forEach(spec => {
    html += `<tr><td class="compare-table__label">${spec.label}</td>`;
    amps.forEach(a => {
      const val = spec.format ? spec.format(a[spec.key]) : a[spec.key];
      html += `<td>${val}</td>`;
    });
    html += `</tr>`;
  });

  Object.entries(toneLabels).forEach(([key, label]) => {
    html += `<tr><td class="compare-table__label">${label}</td>`;
    amps.forEach(a => {
      const val = a.tones[key];
      let bars = '';
      for (let i = 0; i < 10; i++) {
        bars += `<span class="tone-bar__segment ${i < val ? 'filled' : ''}"></span>`;
      }
      html += `<td><div class="tone-bar">${bars}</div> <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--ink-muted)">${val}/10</span></td>`;
    });
    html += `</tr>`;
  });

  html += `<tr><td class="compare-table__label">Best For</td>`;
  amps.forEach(a => {
    html += `<td>${a.genres.map(g => `<span class="amp-card__tag">${g}</span>`).join(' ')}</td>`;
  });
  html += `</tr>`;

  html += `<tr><td class="compare-table__label">Key Features</td>`;
  amps.forEach(a => {
    html += `<td><ul style="list-style:none;padding:0;margin:0;font-size:0.82rem;line-height:1.7">${a.features.map(f => `<li>• ${f}</li>`).join('')}</ul></td>`;
  });
  html += `</tr></tbody>`;

  tableEl.innerHTML = html;

  // Wire remove buttons
  tableEl.querySelectorAll('.compare-table__remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (callbacks && callbacks.onRemove) callbacks.onRemove(btn.dataset.remove);
    });
  });
}

let callbacks;

export function updateCompareBadge() {
  const badge = document.getElementById('compareBadge');
  const countElRef = document.getElementById('compareCount');
  const count = state.compareList.length;
  if (badge) { badge.hidden = count === 0; badge.textContent = count; }
  if (countElRef) countElRef.textContent = `${count} selected`;
}

export function initCompareView(cb) {
  callbacks = cb;
  tableEl = document.getElementById('compareTable');
  tableWrapEl = document.getElementById('compareTableWrap');
  emptyEl = document.getElementById('compareEmpty');
  countEl = document.getElementById('compareCount');
}
