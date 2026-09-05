// AmpVault — SVG & UI Utility Helpers

export function ampIconSVG(type, size = 60) {
  const colors = {
    'tube': { body: '#c4501a', accent: '#ff8844' },
    'solid-state': { body: '#3c648c', accent: '#66aadd' },
    'modeling': { body: '#3c8c50', accent: '#66cc88' },
    'hybrid': { body: '#8c3c78', accent: '#cc66aa' }
  };
  const c = colors[type] || colors['tube'];

  return `<svg width="${size}" height="${size * 0.7}" viewBox="0 0 80 56" fill="none">
    <rect x="4" y="4" width="72" height="48" rx="4" stroke="${c.body}" stroke-width="1.5" opacity="0.6"/>
    <rect x="8" y="8" width="64" height="30" rx="2" fill="${c.body}" opacity="0.15"/>
    <circle cx="24" cy="32" r="8" stroke="${c.accent}" stroke-width="1" opacity="0.7"/>
    <circle cx="24" cy="32" r="3" fill="${c.accent}" opacity="0.5"/>
    <circle cx="50" cy="28" r="4" stroke="${c.body}" stroke-width="1" opacity="0.5"/>
    <circle cx="62" cy="28" r="4" stroke="${c.body}" stroke-width="1" opacity="0.5"/>
    <circle cx="50" cy="38" r="4" stroke="${c.body}" stroke-width="1" opacity="0.5"/>
    <circle cx="62" cy="38" r="4" stroke="${c.body}" stroke-width="1" opacity="0.5"/>
    <line x1="8" y1="44" x2="72" y2="44" stroke="${c.body}" stroke-width="0.5" opacity="0.3"/>
    <rect x="10" y="46" width="60" height="3" rx="1.5" fill="${c.body}" opacity="0.1"/>
  </svg>`;
}

export function starSVG(filled = true) {
  const fill = filled ? 'currentColor' : 'none';
  return `<svg width="14" height="14" viewBox="0 0 14 14" fill="${fill}"><path d="M7 1l1.76 3.57 3.94.57-2.85 2.78.67 3.93L7 10.07l-3.52 1.85.67-3.93L1.3 5.14l3.94-.57z" stroke="currentColor" stroke-width="1"/></svg>`;
}

export function renderStars(rating) {
  const full = Math.floor(rating);
  let html = '';
  for (let i = 0; i < 5; i++) {
    html += starSVG(i < full);
  }
  return html;
}

export function heartIcon(filled) {
  if (filled) {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 14s-5.5-3.5-7-6.5C-.5 5 1 2 4 2c1.5 0 3 .8 4 2.5C9 2.8 10.5 2 12 2c3 0 4.5 3 3 5.5-1.5 3-7 6.5-7 6.5z"/></svg>`;
  }
  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 14s-5.5-3.5-7-6.5C-.5 5 1 2 4 2c1.5 0 3 .8 4 2.5C9 2.8 10.5 2 12 2c3 0 4.5 3 3 5.5-1.5 3-7 6.5-7 6.5z"/></svg>`;
}

export function compareIcon(active) {
  if (active) {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/></svg>`;
  }
  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v6M5 8h6"/></svg>`;
}

export function formatType(type) {
  return type === 'solid-state' ? 'Solid-State' : type.charAt(0).toUpperCase() + type.slice(1);
}
