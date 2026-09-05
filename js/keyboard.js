// AmpVault — Keyboard Shortcuts Module

let onSearchFocus, onSwitchView, onEscape;

export function initKeyboard(options) {
  onSearchFocus = options.onSearchFocus;
  onSwitchView = options.onSwitchView;
  onEscape = options.onEscape;

  document.addEventListener('keydown', handleKeydown);
}

function handleKeydown(e) {
  const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT';

  // Escape
  if (e.key === 'Escape') {
    if (onEscape) onEscape();
    return;
  }

  // Cmd/Ctrl+K search focus
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    if (onSearchFocus) onSearchFocus();
    return;
  }

  // Number keys for view switching (1/2/3) when not in input
  if (!isInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
    if (e.key === '1' && onSwitchView) onSwitchView('browse');
    else if (e.key === '2' && onSwitchView) onSwitchView('compare');
    else if (e.key === '3' && onSwitchView) onSwitchView('favorites');
  }
}

// Keyboard navigation detection
let usingKeyboard = false;

export function initKeyboardNavDetection() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      usingKeyboard = true;
      document.body.classList.add('keyboard-nav');
    }
  });
  document.addEventListener('mousedown', () => {
    usingKeyboard = false;
    document.body.classList.remove('keyboard-nav');
  });
}
