/**
 * DV-GENERATOR - CLIENT CANVAS ENGINE
 * Pure Vanilla JavaScript • Zero External Dependencies
 */

// 1. Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}

// 2. Non-Blocking Async Toast Engine (Zero alert())
const toastContainer = document.getElementById('toastContainer');

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button style="border:none;background:transparent;color:inherit;font-weight:bold;cursor:pointer;font-size:var(--font-size);">✕</button>
  `;

  toast.querySelector('button').addEventListener('click', () => toast.remove());
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// 3. Sidebars & Modals
const leftMenuBtn = document.getElementById('leftMenuBtn');
const rightMenuBtn = document.getElementById('rightMenuBtn');
const leftSidebar = document.getElementById('leftSidebar');
const rightSidebar = document.getElementById('rightSidebar');
const drawerOverlay = document.getElementById('drawerOverlay');

function closeDrawers() {
  leftSidebar.classList.remove('open');
  rightSidebar.classList.remove('open');
  drawerOverlay.classList.remove('active');
}

leftMenuBtn.addEventListener('click', () => {
  leftSidebar.classList.add('open');
  drawerOverlay.classList.add('active');
});

rightMenuBtn.addEventListener('click', () => {
  rightSidebar.classList.add('open');
  drawerOverlay.classList.add('active');
});

drawerOverlay.addEventListener('click', closeDrawers);
document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', closeDrawers));

document.querySelectorAll('.nav-link-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    closeDrawers();
    const modal = document.getElementById(btn.getAttribute('data-modal'));
    if (modal) modal.classList.add('active');
  });
});

document.querySelectorAll('.close-modal-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.fullscreen-modal').forEach(m => m.classList.remove('active'));
  });
});

// Developer Bio 6-Line Clamp
const toggleBioBtn = document.getElementById('toggleBioBtn');
const devBioText = document.getElementById('devBioText');
toggleBioBtn.addEventListener('click', () => {
  const expanded = devBioText.classList.toggle('expanded');
  toggleBioBtn.textContent = expanded ? 'Show Less' : 'Show More';
});

// Partner Form -> Gmail App Redirect (No Backend)
document.getElementById('partnerForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const to = 'contact@iconforgepro.app';
  const org = document.getElementById('partnerOrg').value.trim();
  const email = document.getElementById('partnerEmail').value.trim();
  const message = document.getElementById('partnerMessage').value.trim();

  const subject = `Partnership Proposal — ${org}`;
  const body = `Organization: ${org}\nOfficial Email: ${email}\n\n${message}`;

  const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  if (/Android/i.test(navigator.userAgent)) {
    // Opens the Gmail app directly; falls back to the default mail app if Gmail is absent
    window.location.href =
      `intent:mailto:${to}#Intent;action=android.intent.action.SENDTO;package=com.google.android.gm;` +
      `S.android.intent.extra.SUBJECT=${encodeURIComponent(subject)};` +
      `S.android.intent.extra.TEXT=${encodeURIComponent(body)};` +
      `S.browser_fallback_url=${encodeURIComponent(mailto)};end`;
  } else {
    window.location.href = mailto;
  }

  showToast('Opening Gmail with your proposal...', 'success');
  e.target.reset();
  document.getElementById('modalPartner').classList.remove('active');
});

// 4. Theme & Font Scaling Engine (19px to 23px)
const darkModeCheckbox = document.getElementById('darkModeCheckbox');
const fontSlider = document.getElementById('fontSlider');
const fontSizeIndicator = document.getElementById('fontSizeIndicator');

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  darkModeCheckbox.checked = (theme === 'dark');
}

darkModeCheckbox.addEventListener('change', (e) => {
  const target = e.target.checked ? 'dark' : 'light';
  applyTheme(target);
  showToast(`Switched to ${target} mode`, 'info');
});

fontSlider.addEventListener('input', (e) => {
  const size = e.target.value;
  fontSizeIndicator.textContent = `${size}px`;
  document.documentElement.style.setProperty('--font-size', `${size}px`);
  localStorage.setItem('if_fontsize', size);
});

const savedFontSize = localStorage.getItem('if_fontsize') || '19';
fontSlider.value = savedFontSize;
fontSizeIndicator.textContent = `${savedFontSize}px`;
document.documentElement.style.setProperty('--font-size', `${savedFontSize}px`);

const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

// 5. Presets Catalog & Canvas State Engine
const PRESETS = {
  og_whatsapp: { w: 1200, h: 630, filename: 'og-image.png', label: 'WhatsApp & Facebook OG' },
  twitter_card: { w: 1200, h: 600, filename: 'twitter-card.png', label: 'Twitter / X Card' },
  pwa_512:     { w: 512,  h: 512, filename: 'icon512.png',  label: 'PWA Master & Store' },
  pwa_192:     { w: 192,  h: 192, filename: 'icon192.png',  label: 'Android PWA Home' },
  apple_touch: { w: 180,  h: 180, filename: 'apple-touch-icon.png', label: 'Apple Touch Icon' },
  chrome_128:  { w: 128,  h: 128, filename: 'icon128.png',  label: 'Chrome Web Store' },
  toolbar_48:  { w: 48,   h: 48,  filename: 'icon48.png',   label: 'Chrome Toolbar' },
  favicon_32:  { w: 32,   h: 32,  filename: 'favicon-32x32.png', label: 'Browser Favicon' },
  favicon_16:  { w: 16,   h: 16,  filename: 'favicon-16x16.png', label: 'Micro Favicon' }
};

const canvas = document.getElementById('forgeCanvas');
const ctx = canvas.getContext('2d');
const presetSelect = document.getElementById('presetSelect');
const appNameInput = document.getElementById('appNameInput');
const appSubtitleInput = document.getElementById('appSubtitleInput');
const emblemSelect = document.getElementById('emblemSelect');
const primaryColorInput = document.getElementById('primaryColor');
const secondaryColorInput = document.getElementById('secondaryColor');
const primaryHexInput = document.getElementById('primaryHex');
const secondaryHexInput = document.getElementById('secondaryHex');
const dimensionBadge = document.getElementById('dimensionBadge');
const downloadBtnText = document.getElementById('downloadBtnText');
const downloadCurrentBtn = document.getElementById('downloadCurrentBtn');
const batchDownloadBtn = document.getElementById('batchDownloadBtn');

// Vector Motif Drawing Library
function drawMotif(ctx, type, cx, cy, sz, color, accent = primaryColorInput.value) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, sz * 0.1);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (type === 'cross') {
    // Holy Cross Motif
    const barW = sz * 0.22;
    ctx.fillRect(cx - barW / 2, cy - sz / 2, barW, sz);
    ctx.fillRect(cx - sz / 2, cy - sz / 5, sz, barW);
  } else if (type === 'snippet') {
    // Snippet Card Motif
    const w = sz * 0.8;
    const h = sz * 0.9;
    ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
    ctx.fillStyle = accent;
    const lh = sz * 0.1;
    ctx.fillRect(cx - w * 0.35, cy - h * 0.25, w * 0.7, lh);
    ctx.fillRect(cx - w * 0.35, cy, w * 0.7, lh);
    ctx.fillRect(cx - w * 0.35, cy + h * 0.25, w * 0.45, lh);
  } else if (type === 'focus') {
    // Focus Ring Motif
    ctx.beginPath();
    ctx.arc(cx, cy, sz * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, sz * 0.15, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'shield') {
    // Security Shield Motif
    ctx.beginPath();
    ctx.moveTo(cx, cy - sz * 0.45);
    ctx.lineTo(cx + sz * 0.4, cy - sz * 0.2);
    ctx.lineTo(cx + sz * 0.4, cy + sz * 0.1);
    ctx.quadraticCurveTo(cx, cy + sz * 0.5, cx, cy + sz * 0.5);
    ctx.quadraticCurveTo(cx, cy + sz * 0.5, cx - sz * 0.4, cy + sz * 0.1);
    ctx.lineTo(cx - sz * 0.4, cy - sz * 0.2);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'lightning') {
    // Lightning Bolt Motif
    ctx.beginPath();
    ctx.moveTo(cx + sz * 0.1, cy - sz * 0.45);
    ctx.lineTo(cx - sz * 0.3, cy + sz * 0.05);
    ctx.lineTo(cx, cy + sz * 0.05);
    ctx.lineTo(cx - sz * 0.1, cy + sz * 0.45);
    ctx.lineTo(cx + sz * 0.3, cy - sz * 0.05);
    ctx.lineTo(cx, cy - sz * 0.05);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// Master Render Procedure
function renderAsset(targetCanvas, width, height, st = readSettings()) {
  targetCanvas.width = width;
  targetCanvas.height = height;
  const c = targetCanvas.getContext('2d');

  const title = (st.t || '').trim() || 'My App';
  const subtitle = (st.s || '').trim() || 'Mobile Knowledge';
  const motif = st.m;
  const col1 = st.a;
  const col2 = st.b;

  const isWide = width > height;

  if (isWide) {
    // ==========================================
    // 1. WIDE OPEN GRAPH BANNER (1200x630, 1200x600)
    // ==========================================
    c.fillStyle = '#090d16';
    c.fillRect(0, 0, width, height);

    // Glowing Outer Frame
    c.strokeStyle = col1;
    c.lineWidth = 8;
    c.strokeRect(30, 30, width - 60, height - 60);

    // Brand Emblem Card
    const emblemCardSize = 220;
    const emblemX = 120;
    const emblemY = (height - emblemCardSize) / 2;

    const grad = c.createLinearGradient(emblemX, emblemY, emblemX + emblemCardSize, emblemY + emblemCardSize);
    grad.addColorStop(0, col1);
    grad.addColorStop(1, col2);
    c.fillStyle = grad;

    c.beginPath();
    c.roundRect(emblemX, emblemY, emblemCardSize, emblemCardSize, 44);
    c.fill();

    // Center Motif inside Card
    drawMotif(c, motif, emblemX + emblemCardSize / 2, emblemY + emblemCardSize / 2, emblemCardSize * 0.55, '#ffffff', col1);

    // Title
    c.fillStyle = '#ffffff';
    c.font = 'bold 74px -apple-system, sans-serif';
    c.fillText(title, 390, emblemY + 80);

    // Subtitle
    c.fillStyle = col1;
    c.font = 'bold 36px -apple-system, sans-serif';
    c.fillText(subtitle, 390, emblemY + 140);

    // Footer Tagline
    c.fillStyle = '#94a3b8';
    c.font = '28px -apple-system, sans-serif';
    c.fillText('100% Offline PWA • Verified Clean PNG • Android-First', 390, emblemY + 195);

  } else {
    // ==========================================
    // 2. SQUARE APP ICON (512x512 down to 16x16)
    // ==========================================
    const grad = c.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, col1);
    grad.addColorStop(1, col2);
    c.fillStyle = grad;

    const radius = width * 0.22;
    c.beginPath();
    c.roundRect(0, 0, width, height, radius);
    c.fill();

    // Draw Central Motif Scaled Exactly
    drawMotif(c, motif, width / 2, height / 2, width * 0.55, '#ffffff', col1);
  }

  // Module hook point (feature modules draw here; safe when no module is loaded)
  if (window.DV) {
    window.DV.hooks.afterRender.forEach((fn) => {
      try { fn(c, width, height, st, isWide); } catch (_) {}
    });
  }
}

function updatePreview() {
  const current = PRESETS[presetSelect.value];
  dimensionBadge.textContent = `${current.w} × ${current.h} px`;
  downloadBtnText.textContent = `Download ${current.label} (PNG)`;
  renderAsset(canvas, current.w, current.h);
}

// Event Listeners for Live Re-rendering
[presetSelect, appNameInput, appSubtitleInput, emblemSelect, primaryColorInput, secondaryColorInput].forEach(el => {
  el.addEventListener('input', updatePreview);
  el.addEventListener('change', updatePreview);
});

// Hex Color Code Sync (Color Picker <-> Hex Field)
function normalizeHex(value) {
  let h = value.replace(/#/g, '').trim();
  if (!/^[0-9a-fA-F]+$/.test(h)) return null;
  if (h.length === 3) h = h.split('').map(ch => ch + ch).join('');
  return h.length === 6 ? '#' + h.toUpperCase() : null;
}

function bindHexField(colorInput, hexInput) {
  colorInput.addEventListener('input', () => {
    hexInput.value = colorInput.value.toUpperCase();
    hexInput.classList.remove('invalid');
  });

  hexInput.addEventListener('input', () => {
    const hex = normalizeHex(hexInput.value);
    hexInput.classList.toggle('invalid', !hex);
    if (hex) {
      colorInput.value = hex.toLowerCase();
      updatePreview();
    }
  });

  hexInput.addEventListener('blur', () => {
    const hex = normalizeHex(hexInput.value);
    hexInput.value = hex || colorInput.value.toUpperCase();
    hexInput.classList.remove('invalid');
  });
}

bindHexField(primaryColorInput, primaryHexInput);
bindHexField(secondaryColorInput, secondaryHexInput);

// Single PNG Download
downloadCurrentBtn.addEventListener('click', () => {
  const current = PRESETS[presetSelect.value];
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = current.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${current.filename} (${current.w}×${current.h})`, 'success');
  }, 'image/png');
});

// Batch Sequential Downloader (All 9 Sizes with One Tap)
batchDownloadBtn.addEventListener('click', async () => {
  showToast('Initiating Batch Generation for all 9 sizes...', 'info');
  const tempCanvas = document.createElement('canvas');
  const keys = Object.keys(PRESETS);

  for (let i = 0; i < keys.length; i++) {
    const item = PRESETS[keys[i]];
    renderAsset(tempCanvas, item.w, item.h);

    await new Promise(resolve => {
      tempCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setTimeout(resolve, 300);
      }, 'image/png');
    });
  }
  showToast('All 9 PNG assets generated & downloaded!', 'success');
});

// 6. Native App Installation, Web Share, Bluetooth & WhatsApp
let deferredPrompt = null;
const installAppBtn = document.getElementById('installAppBtn');
const shareAppBtn = document.getElementById('shareAppBtn');
const bluetoothShareBtn = document.getElementById('bluetoothShareBtn');
const bluetoothPngBtn = document.getElementById('bluetoothPngBtn');
const whatsappShareBtn = document.getElementById('whatsappShareBtn');
const whatsappPngBtn = document.getElementById('whatsappPngBtn');

const SHARE_TEXT = 'DV-Generator: client-side PNG and WhatsApp Open Graph asset generator.';

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installAppBtn.style.display = 'flex';
});

installAppBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt = null;
      showToast('DV-Generator Installed to Home Screen', 'success');
    }
  } else {
    showToast('App is ready offline or already installed.', 'info');
  }
});

async function shareAppLink() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'DV-Generator',
        text: SHARE_TEXT,
        url: window.location.href,
      });
      showToast('Shared successfully.', 'success');
    } catch (_) {}
  } else {
    navigator.clipboard.writeText(window.location.href);
    showToast('Direct URL copied to clipboard!', 'success');
  }
}

shareAppBtn.addEventListener('click', shareAppLink);

// Bluetooth: opens Android's Bluetooth sender directly (no permission prompt, no device scan)
bluetoothShareBtn.addEventListener('click', () => {
  if (!/Android/i.test(navigator.userAgent)) {
    shareAppLink();
    return;
  }

  let left = false;
  const onHide = () => { if (document.hidden) left = true; };
  document.addEventListener('visibilitychange', onHide);

  window.location.href =
    'intent:#Intent;action=android.intent.action.SEND;type=text/plain;package=com.android.bluetooth;' +
    `S.android.intent.extra.TEXT=${encodeURIComponent(SHARE_TEXT + ' ' + window.location.href)};end`;

  setTimeout(() => {
    document.removeEventListener('visibilitychange', onHide);
    if (!left) shareAppLink();
  }, 1500);
});

// WhatsApp: opens WhatsApp's own chat picker with the app link (no permission prompt)
whatsappShareBtn.addEventListener('click', () => {
  window.location.href = `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + ' ' + window.location.href)}`;
});

// Share the currently previewed PNG through Android's share sheet (Bluetooth & WhatsApp listed)
function shareCurrentPng() {
  const current = PRESETS[presetSelect.value];
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], current.filename, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: current.filename });
        showToast(`Shared ${current.filename}`, 'success');
      } catch (_) {}
    } else {
      showToast('PNG sharing is not supported on this browser.', 'danger');
    }
  }, 'image/png');
}

bluetoothPngBtn.addEventListener('click', shareCurrentPng);
whatsappPngBtn.addEventListener('click', shareCurrentPng);

// 7. Module Bridge + Deep Links (feature modules plug in here; each module is a deletable .js file)
function readSettings() {
  const x = {};
  Object.keys(DV.extensions).forEach((k) => {
    try { x[k] = DV.extensions[k].get(); } catch (_) {}
  });
  return {
    p: presetSelect.value,
    t: appNameInput.value,
    s: appSubtitleInput.value,
    m: emblemSelect.value,
    a: primaryColorInput.value,
    b: secondaryColorInput.value,
    x
  };
}

function applySettings(st) {
  if (!st || typeof st !== 'object') return;
  if (PRESETS[st.p]) presetSelect.value = st.p;
  if (typeof st.t === 'string') appNameInput.value = st.t.slice(0, 28);
  if (typeof st.s === 'string') appSubtitleInput.value = st.s.slice(0, 42);
  if (Array.from(emblemSelect.options).some(o => o.value === st.m)) emblemSelect.value = st.m;
  const a = normalizeHex(String(st.a || ''));
  const b = normalizeHex(String(st.b || ''));
  if (a) { primaryColorInput.value = a.toLowerCase(); primaryHexInput.value = a; }
  if (b) { secondaryColorInput.value = b.toLowerCase(); secondaryHexInput.value = b; }
  Object.keys(DV.extensions).forEach((k) => {
    try { DV.extensions[k].set((st.x && st.x[k]) || null); } catch (_) {}
  });
  updatePreview();
}

function b64uEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64uDecode(str) {
  const pad = '='.repeat((4 - (str.length % 4)) % 4);
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return new TextDecoder().decode(Uint8Array.from(bin, ch => ch.charCodeAt(0)));
}

const DV = window.DV = {
  presets: PRESETS,
  canvas,
  hooks: { afterRender: [] },
  extensions: {},
  showToast,
  updatePreview,
  getSettings: readSettings,
  applySettings,
  registerExtension(key, ext) { DV.extensions[key] = ext; },
  renderToCanvas(target, w, h, st) { renderAsset(target, w, h, st); },
  renderBlob(st) {
    const p = PRESETS[st.p] || PRESETS.og_whatsapp;
    const tmp = document.createElement('canvas');
    renderAsset(tmp, p.w, p.h, st);
    return new Promise(resolve => tmp.toBlob(resolve, 'image/png'));
  },
  link(st = readSettings()) {
    return location.origin + DV_BASE + b64uEncode(JSON.stringify(st)) + DV_SUFFIX;
  }
};

// Deep Link Opener: clean path links (mydomain.com/<code>-DVGen) via 404.html -> ?dvp=
// DV_KEEP must match dvKeep in 404.html: 1 for username.github.io/repo/, 0 for a custom domain
const DV_KEEP = 0;
const DV_SUFFIX = '-DVGen';
const DV_BASE = location.pathname.split('/').slice(0, 1 + DV_KEEP).join('/') + '/';

function openFromPath() {
  const q = new URLSearchParams(location.search).get('dvp');
  const rest = q !== null ? q : location.pathname.slice(DV_BASE.length);

  // Restore the clean address that 404.html turned into ?dvp=
  if (q !== null) history.replaceState(null, '', DV_BASE + rest + location.hash);

  const m = rest.match(/^([A-Za-z0-9_-]+)-DVGen(?:[?#]|$)/);
  if (!m) return;
  try {
    applySettings(JSON.parse(b64uDecode(m[1])));
    showToast('Opened shared design', 'success');
  } catch (_) {
    showToast('This shared link could not be opened.', 'danger');
  }
}

window.addEventListener('load', openFromPath);

// Initial Render
updatePreview();