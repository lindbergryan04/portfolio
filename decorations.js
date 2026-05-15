// decorations.js — Y2K dark sci-fi decorative graphics layer

const ACCENT = '#cc0000';
const ACCENT_DIM = '#660000';
const BORDER = '#999999';
const isDesktop = window.matchMedia('(min-width: 768px)');
const isWide = window.matchMedia('(min-width: 1280px)');

// ============================================================
// 1. DARK PARTICLE FIELD — Canvas background
// ============================================================

class ParticleField {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'particle-field';
    this.ctx = this.canvas.getContext('2d');
    document.body.prepend(this.canvas);

    this.particles = [];
    this.frame = 0;
    this.pulseTimer = 0;
    this.pulseTarget = -1;
    this.pulsePhase = 0;

    this.resize();
    this.initParticles(60);
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: 1.5 + Math.random() * 2,
        opacity: 0.1 + Math.random() * 0.3,
        glow: i % 8 === 0,
      });
    }
  }

  update() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
    }

    // Pulse logic
    this.pulseTimer++;
    if (this.pulseTimer > 150) { // ~5s at 30fps
      this.pulseTimer = 0;
      this.pulseTarget = Math.floor(Math.random() * this.particles.length);
      this.pulsePhase = 0;
    }
    if (this.pulseTarget >= 0) {
      this.pulsePhase += 0.05;
      if (this.pulsePhase > Math.PI) {
        this.pulseTarget = -1;
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const pts = this.particles;

    // Draw connections
    ctx.lineWidth = 0.5;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const alpha = 0.06 * (1 - dist / 150);
          ctx.strokeStyle = `rgba(204, 0, 0, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    ctx.shadowColor = ACCENT;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      let size = p.size;
      let opacity = p.opacity;

      // Pulse effect
      if (i === this.pulseTarget) {
        const pulse = Math.sin(this.pulsePhase);
        size += pulse * 6;
        opacity = Math.min(1, opacity + pulse * 0.6);
        ctx.shadowBlur = pulse * 15;
      } else {
        ctx.shadowBlur = p.glow ? 6 : 0;
      }

      ctx.fillStyle = `rgba(204, 0, 0, ${opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  animate() {
    this.frame++;
    if (this.frame % 2 === 0) { // 30fps
      this.update();
      this.draw();
    }
    requestAnimationFrame(() => this.animate());
  }
}

// ============================================================
// 2. SCHEMATIC RAIL — Fixed left sidebar SVG
// ============================================================

function createSchematicRail() {
  const rail = document.createElement('div');
  rail.className = 'schematic-rail';

  const vh = window.innerHeight;
  const tickSpacing = 50;
  const tickCount = Math.floor(vh / tickSpacing);

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="55" height="${vh}" viewBox="0 0 55 ${vh}">`;

  // Vertical spine
  svgContent += `<line x1="15" y1="0" x2="15" y2="${vh}" stroke="${ACCENT}" stroke-width="1" stroke-opacity="0.2" stroke-dasharray="4 3"/>`;

  // Ticks and labels
  for (let i = 0; i <= tickCount; i++) {
    const y = i * tickSpacing;
    const hex = '0x' + (i * tickSpacing).toString(16).toUpperCase().padStart(3, '0');
    svgContent += `<line x1="10" y1="${y}" x2="20" y2="${y}" stroke="${ACCENT}" stroke-width="1" stroke-opacity="0.25"/>`;
    if (i % 2 === 0) {
      svgContent += `<text x="24" y="${y + 3}" fill="${ACCENT}" fill-opacity="0.3" font-family="Monocraft, monospace" font-size="7">${hex}</text>`;
    }
  }

  // Crosshair nodes at specific positions
  const nodes = [
    { y: Math.floor(vh * 0.15), label: 'NODE:0x7F' },
    { y: Math.floor(vh * 0.45), label: 'SYS:ACTIVE' },
    { y: Math.floor(vh * 0.75), label: 'SEC:01' },
  ];

  for (const node of nodes) {
    const ny = node.y;
    // Outer square
    svgContent += `<rect x="5" y="${ny - 10}" width="20" height="20" fill="none" stroke="${ACCENT}" stroke-width="1" stroke-opacity="0.25"/>`;
    // Inner square
    svgContent += `<rect x="9" y="${ny - 6}" width="12" height="12" fill="none" stroke="${ACCENT}" stroke-width="1" stroke-opacity="0.2"/>`;
    // Cross lines
    svgContent += `<line x1="15" y1="${ny - 14}" x2="15" y2="${ny + 14}" stroke="${ACCENT}" stroke-width="0.5" stroke-opacity="0.2"/>`;
    svgContent += `<line x1="1" y1="${ny}" x2="29" y2="${ny}" stroke="${ACCENT}" stroke-width="0.5" stroke-opacity="0.2"/>`;
    // Center dot
    svgContent += `<circle cx="15" cy="${ny}" r="2" fill="${ACCENT}" fill-opacity="0.4"/>`;
    // Label
    svgContent += `<text x="24" y="${ny + 3}" fill="${ACCENT}" fill-opacity="0.35" font-family="Monocraft, monospace" font-size="6">${node.label}</text>`;
  }

  svgContent += `</svg>`;

  // Scanner sweep element (CSS animated)
  const scanner = document.createElement('div');
  scanner.className = 'scanner-sweep';

  rail.innerHTML = svgContent;
  rail.appendChild(scanner);
  document.body.appendChild(rail);
}

// ============================================================
// 3. ASCII ART TERMINAL BANNER — Home page only
// ============================================================

function createAsciiBanner() {
  const lines = [
    '██████╗  ██╗         ██╗ ██╗ ██╗',
    '██╔══██╗ ██║        ██╔╝ ╚═╝ ╚═╝',
    '██████╔╝ ██║       ██╔╝  ██╗ ██╗',
    '██╔══██╗ ██║      ██╔╝   ╚═╝ ╚═╝',
    '██║  ██║ ███████╗ ╚═╝    ██╗ ██╗',
    '╚═╝  ╚═╝ ╚══════╝        ╚═╝ ╚═╝',
  ];

  const banner = document.createElement('div');
  banner.className = 'ascii-banner';

  const pre = document.createElement('pre');
  pre.className = 'ascii-pre';
  banner.appendChild(pre);

  // Insert before the page header
  const header = document.querySelector('.page-header');
  if (header) {
    header.parentNode.insertBefore(banner, header);
  } else {
    return;
  }

  // Typewriter reveal
  lines.forEach((line, i) => {
    setTimeout(() => {
      const div = document.createElement('div');
      div.className = 'ascii-line';
      const num = String(i + 1).padStart(3, '0');
      div.innerHTML = `<span class="ascii-linenum">${num} │</span> ${escapeHtml(line)}`;
      pre.appendChild(div);

      // After last line, add cursor and welcome message
      if (i === lines.length - 1) {
        setTimeout(() => {
          const cursorLine = document.createElement('div');
          cursorLine.className = 'ascii-line';
          cursorLine.innerHTML = `<span class="ascii-linenum">    │</span> <span class="cursor-blink"></span>`;
          pre.appendChild(cursorLine);

          // Welcome message
          const welcome = document.createElement('div');
          welcome.className = 'ascii-welcome';
          welcome.textContent = '> SYSTEM INITIALIZED // WELCOME';
          banner.appendChild(welcome);
        }, 200);
      }
    }, i * 100);
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============================================================
// 4. TECHNICAL SECTION DIVIDERS
// ============================================================

function upgradeDividers() {
  const dividers = document.querySelectorAll('.dashed-line');
  dividers.forEach((el, i) => {
    const variation = i % 3;
    const newEl = createDivider(variation, i + 1);
    el.replaceWith(newEl);
  });
}

function createDivider(variation, sectionNum) {
  const div = document.createElement('div');
  div.className = 'tech-divider';

  if (variation === 0) {
    // Crosshair
    div.innerHTML = `
      <div class="divider-line"></div>
      <div class="divider-center">
        <svg width="24" height="24" viewBox="0 0 24 24" class="divider-crosshair">
          <rect x="4" y="4" width="16" height="16" fill="none" stroke="${ACCENT}" stroke-width="1" opacity="0.5"/>
          <rect x="8" y="8" width="8" height="8" fill="none" stroke="${ACCENT}" stroke-width="1" opacity="0.35"/>
          <line x1="12" y1="0" x2="12" y2="24" stroke="${ACCENT}" stroke-width="0.5" opacity="0.4"/>
          <line x1="0" y1="12" x2="24" y2="12" stroke="${ACCENT}" stroke-width="0.5" opacity="0.4"/>
          <circle cx="12" cy="12" r="2" fill="${ACCENT}" opacity="0.6"/>
        </svg>
        <span class="divider-label">SEC:${String(sectionNum).padStart(2, '0')}</span>
      </div>
      <div class="divider-line"></div>
    `;
  } else if (variation === 1) {
    // Radar / concentric circles
    div.innerHTML = `
      <div class="divider-line"></div>
      <div class="divider-center">
        <svg width="28" height="28" viewBox="0 0 28 28" class="divider-radar">
          <circle cx="14" cy="14" r="12" fill="none" stroke="${ACCENT}" stroke-width="0.5" opacity="0.2"/>
          <circle cx="14" cy="14" r="8" fill="none" stroke="${ACCENT}" stroke-width="0.5" opacity="0.35"/>
          <circle cx="14" cy="14" r="4" fill="none" stroke="${ACCENT}" stroke-width="0.5" opacity="0.5"/>
          <circle cx="14" cy="14" r="1.5" fill="${ACCENT}" opacity="0.7"/>
          <line x1="14" y1="0" x2="14" y2="14" stroke="${ACCENT}" stroke-width="0.5" opacity="0.3" class="radar-hand"/>
        </svg>
      </div>
      <div class="divider-line"></div>
    `;
  } else {
    // Data stream ticker
    div.innerHTML = `
      <div class="divider-line"></div>
      <div class="divider-center">
        <div class="divider-ticker">
          <div class="divider-ticker-inner">0xDEADBEEF // SEC:${String(sectionNum).padStart(2, '0')} // STATUS:OK // 0xCAFEBABE // NODE:ACTIVE // 0xFF</div>
        </div>
      </div>
      <div class="divider-line"></div>
    `;
  }

  return div;
}

// ============================================================
// INIT
// ============================================================

function init() {
  // 1. Particle field (desktop only)
  if (isDesktop.matches) {
    new ParticleField();
  }

  // 2. Schematic rail (wide screens only)
  if (isWide.matches) {
    createSchematicRail();
  }

  // 3. ASCII banner (home page only)
  const path = location.pathname;
  if (path === '/' || path === '/index.html' || path === '/portfolio/' || path === '/portfolio/index.html') {
    createAsciiBanner();
  }

  // 4. Upgrade dividers on all pages
  upgradeDividers();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
