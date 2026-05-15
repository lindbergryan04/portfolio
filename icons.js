// icons.js — Y2K pixel art SVG icons and UI elements

// Window title bar control dots (macOS classic style)
export const windowControls = `
<span class="window-controls">
  <span class="dot dot-close"></span>
  <span class="dot dot-min"></span>
  <span class="dot dot-max"></span>
</span>`;

// Skull icon — 16x16 pixel art
export const skull = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" class="icon icon-skull">
  <rect x="4" y="1" width="8" height="2" fill="currentColor"/>
  <rect x="3" y="3" width="1" height="1" fill="currentColor"/>
  <rect x="12" y="3" width="1" height="1" fill="currentColor"/>
  <rect x="2" y="4" width="1" height="4" fill="currentColor"/>
  <rect x="13" y="4" width="1" height="4" fill="currentColor"/>
  <rect x="3" y="8" width="1" height="2" fill="currentColor"/>
  <rect x="12" y="8" width="1" height="2" fill="currentColor"/>
  <rect x="4" y="10" width="2" height="1" fill="currentColor"/>
  <rect x="10" y="10" width="2" height="1" fill="currentColor"/>
  <rect x="5" y="3" width="2" height="3" fill="currentColor"/>
  <rect x="9" y="3" width="2" height="3" fill="currentColor"/>
  <rect x="7" y="5" width="2" height="3" fill="currentColor"/>
  <rect x="5" y="11" width="1" height="2" fill="currentColor"/>
  <rect x="7" y="11" width="1" height="2" fill="currentColor"/>
  <rect x="9" y="11" width="1" height="2" fill="currentColor"/>
  <rect x="4" y="13" width="8" height="1" fill="currentColor"/>
</svg>`;

// Crosshair / target icon — 16x16
export const crosshair = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" class="icon icon-crosshair">
  <rect x="7" y="0" width="2" height="5" fill="currentColor"/>
  <rect x="7" y="11" width="2" height="5" fill="currentColor"/>
  <rect x="0" y="7" width="5" height="2" fill="currentColor"/>
  <rect x="11" y="7" width="5" height="2" fill="currentColor"/>
  <rect x="6" y="6" width="4" height="4" fill="none" stroke="currentColor" stroke-width="1"/>
</svg>`;

// Cursor arrow — 12x16
export const cursor = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 16" width="12" height="16" class="icon icon-cursor">
  <polygon points="0,0 0,12 3,9 6,15 8,14 5,8 9,8" fill="currentColor"/>
</svg>`;

// Folder icon — 16x14
export const folder = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 14" width="16" height="14" class="icon icon-folder">
  <rect x="0" y="2" width="7" height="2" fill="currentColor"/>
  <rect x="0" y="4" width="16" height="10" fill="currentColor" opacity="0.8"/>
  <rect x="1" y="5" width="14" height="8" fill="currentColor" opacity="0.4"/>
</svg>`;

// Terminal prompt icon — 16x12
export const terminal = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 12" width="16" height="12" class="icon icon-terminal">
  <rect x="0" y="0" width="16" height="12" fill="none" stroke="currentColor" stroke-width="1"/>
  <polygon points="2,2 2,6 5,4" fill="currentColor"/>
  <rect x="6" y="5" width="5" height="1" fill="currentColor"/>
</svg>`;

// Mail icon — 16x12
export const mail = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 12" width="16" height="12" class="icon icon-mail">
  <rect x="0" y="0" width="16" height="12" fill="none" stroke="currentColor" stroke-width="1"/>
  <polyline points="0,0 8,6 16,0" fill="none" stroke="currentColor" stroke-width="1"/>
</svg>`;

// Star / asterisk — 8x8
export const star = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" width="8" height="8" class="icon icon-star">
  <rect x="3" y="0" width="2" height="8" fill="currentColor"/>
  <rect x="0" y="3" width="8" height="2" fill="currentColor"/>
  <rect x="1" y="1" width="2" height="2" fill="currentColor"/>
  <rect x="5" y="1" width="2" height="2" fill="currentColor"/>
  <rect x="1" y="5" width="2" height="2" fill="currentColor"/>
  <rect x="5" y="5" width="2" height="2" fill="currentColor"/>
</svg>`;

// Dot separator
export const dotSep = `<span class="dot-sep">•</span>`;

// Section number watermark
export function sectionNumber(num) {
  return `<div class="section-watermark">${String(num).padStart(2, '0')}</div>`;
}

// Create a window panel
export function createWindow(title, bodyContent, statusText = '') {
  const statusBar = statusText
    ? `<div class="window-statusbar">${statusText}</div>`
    : '';
  return `
<div class="window">
  <div class="window-titlebar">
    ${windowControls}
    <span class="window-title">${title}</span>
  </div>
  <div class="window-body">
    ${bodyContent}
  </div>
  ${statusBar}
</div>`;
}
