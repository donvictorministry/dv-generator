/**
 * DV-GENERATOR MODULE: verse-paste.js
 * Bible verse paste box + font size, font color (hex), bold, italic.
 * Self-contained: delete this file and its <script> tag to remove the feature.
 */
(function () {
  'use strict';
  if (!window.DV) return;

  const DEFAULT = { t: '', z: 30, c: '#FFFFFF', b: 0, i: 0 };
  const state = Object.assign({}, DEFAULT);

  function normHex(value) {
    let h = String(value).replace(/#/g, '').trim();
    if (!/^[0-9a-fA-F]+$/.test(h)) return null;
    if (h.length === 3) h = h.split('').map(ch => ch + ch).join('');
    return h.length === 6 ? '#' + h.toUpperCase() : null;
  }

  // ---------- Styles ----------
  const style = document.createElement('style');
  style.id = 'dvVerseStyle';
  style.textContent = `
    .dvv-text { height: 50dvh; min-height: 200px; resize: none; line-height: 1.5; font-family: inherit; }
    .dvv-row { display: flex; flex-direction: column; gap: 8px; }
    .dvv-row input[type="range"] { width: 100%; height: 8px; }
    .dvv-colorrow { display: grid; grid-template-columns: auto 64px 1fr; gap: 10px; align-items: center; }
    .dvv-colorrow input[type="color"] { width: 64px; height: 48px; border: none; padding: 0; background: transparent; cursor: pointer; }
    .dvv-style { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .dvv-tog.on { background: var(--primary); color: #ffffff; border-color: var(--primary); }
    .dvv-note { color: var(--text-muted); }
  `;
  document.head.appendChild(style);

  // ---------- UI ----------
  const card = document.createElement('section');
  card.className = 'mobile-card';
  card.id = 'dvVerseCard';
  card.innerHTML = `
    <span class="card-caption">Bible Verse (Paste &amp; Style)</span>
    <textarea id="dvVerseText" class="std-input dvv-text" maxlength="500" placeholder="Paste Bible verse here..."></textarea>
    <div class="dvv-row">
      <label for="dvVerseSize" class="form-label">Font Size: <strong id="dvVerseSizeVal">30px</strong></label>
      <input type="range" id="dvVerseSize" min="18" max="44" value="30" step="1">
    </div>
    <div class="dvv-colorrow">
      <label for="dvVerseColor" class="form-label">Font Color:</label>
      <input type="color" id="dvVerseColor" value="#ffffff">
      <input type="text" id="dvVerseHex" class="std-input hex-input" value="#FFFFFF" maxlength="7" autocapitalize="characters" autocomplete="off" spellcheck="false" aria-label="Verse Font Hex Color Code">
    </div>
    <div class="dvv-style">
      <button type="button" id="dvVerseBold" class="secondary-btn dvv-tog" aria-pressed="false"><strong>Bold</strong></button>
      <button type="button" id="dvVerseItalic" class="secondary-btn dvv-tog" aria-pressed="false"><em>Italic</em></button>
    </div>
    <p id="dvVerseNote" class="dvv-note"></p>
  `;

  const viewport = document.querySelector('.android-viewport');
  const footer = viewport.querySelector('.mobile-footer');
  viewport.insertBefore(card, footer);

  const text = card.querySelector('#dvVerseText');
  const size = card.querySelector('#dvVerseSize');
  const sizeVal = card.querySelector('#dvVerseSizeVal');
  const color = card.querySelector('#dvVerseColor');
  const hex = card.querySelector('#dvVerseHex');
  const boldBtn = card.querySelector('#dvVerseBold');
  const italicBtn = card.querySelector('#dvVerseItalic');
  const note = card.querySelector('#dvVerseNote');

  function paintToggles() {
    boldBtn.classList.toggle('on', !!state.b);
    boldBtn.setAttribute('aria-pressed', state.b ? 'true' : 'false');
    italicBtn.classList.toggle('on', !!state.i);
    italicBtn.setAttribute('aria-pressed', state.i ? 'true' : 'false');
  }

  function pushUpdate() {
    window.DV.updatePreview();
  }

  text.addEventListener('input', () => { state.t = text.value; pushUpdate(); });

  size.addEventListener('input', () => {
    state.z = +size.value;
    sizeVal.textContent = `${state.z}px`;
    pushUpdate();
  });

  color.addEventListener('input', () => {
    state.c = color.value.toUpperCase();
    hex.value = state.c;
    hex.classList.remove('invalid');
    pushUpdate();
  });

  hex.addEventListener('input', () => {
    const h = normHex(hex.value);
    hex.classList.toggle('invalid', !h);
    if (h) {
      state.c = h;
      color.value = h.toLowerCase();
      pushUpdate();
    }
  });

  hex.addEventListener('blur', () => {
    hex.value = normHex(hex.value) || state.c;
    hex.classList.remove('invalid');
  });

  boldBtn.addEventListener('click', () => { state.b = state.b ? 0 : 1; paintToggles(); pushUpdate(); });
  italicBtn.addEventListener('click', () => { state.i = state.i ? 0 : 1; paintToggles(); pushUpdate(); });

  // ---------- State bridge (saved in History and in deep links) ----------
  window.DV.registerExtension('verse', {
    get() {
      return { t: state.t, z: state.z, c: state.c, b: state.b, i: state.i };
    },
    set(o) {
      const v = Object.assign({}, DEFAULT, o || {});
      state.t = String(v.t || '').slice(0, 500);
      state.z = Math.min(44, Math.max(18, parseInt(v.z, 10) || DEFAULT.z));
      state.c = normHex(v.c) || DEFAULT.c;
      state.b = v.b ? 1 : 0;
      state.i = v.i ? 1 : 0;
      text.value = state.t;
      size.value = state.z;
      sizeVal.textContent = `${state.z}px`;
      color.value = state.c.toLowerCase();
      hex.value = state.c;
      hex.classList.remove('invalid');
      paintToggles();
    }
  });

  // ---------- Canvas renderer (OG / Twitter banners) ----------
  window.DV.hooks.afterRender.push(function (c, w, h, st, isWide) {
    const isPreview = c.canvas === window.DV.canvas;
    const v = st.x && st.x.verse;
    const body = v ? String(v.t || '') : '';

    if (!isWide) {
      if (isPreview) note.textContent = 'The verse is drawn on the WhatsApp/Facebook OG and Twitter / X banners.';
      return;
    }
    if (!body.trim()) {
      if (isPreview) note.textContent = '';
      return;
    }

    const fsize = Math.min(44, Math.max(18, parseInt(v.z, 10) || 30));
    const fcolor = normHex(v.c) || '#FFFFFF';
    const font = `${v.i ? 'italic ' : ''}${v.b ? 'bold ' : ''}${fsize}px -apple-system, sans-serif`;

    const emblemY = (h - 220) / 2;
    const x = 390;
    const maxW = w - 90 - x;
    const top = emblemY + 175;
    const bottom = h - 52;
    const lh = Math.round(fsize * 1.3);

    c.save();

    // Replace the footer tagline area with the verse block
    c.fillStyle = '#090d16';
    c.fillRect(380, emblemY + 160, w - 48 - 380, h - 48 - (emblemY + 160));

    c.font = font;
    c.fillStyle = fcolor;
    c.textBaseline = 'alphabetic';

    const lines = [];
    body.slice(0, 500).split(/\r?\n/).forEach((par) => {
      const words = par.trim().split(/\s+/).filter(Boolean);
      if (!words.length) return;
      let line = '';
      words.forEach((wd) => {
        const test = line ? line + ' ' + wd : wd;
        if (c.measureText(test).width > maxW && line) {
          lines.push(line);
          line = wd;
        } else {
          line = test;
        }
      });
      if (line) lines.push(line);
    });

    const maxLines = Math.max(1, Math.floor((bottom - top) / lh));
    let trimmed = false;
    if (lines.length > maxLines) {
      trimmed = true;
      lines.length = maxLines;
      let last = lines[maxLines - 1];
      while (last.length > 1 && c.measureText(last + '…').width > maxW) last = last.slice(0, -1);
      lines[maxLines - 1] = last.replace(/[\s,;:.]+$/, '') + '…';
    }

    lines.forEach((ln, i) => c.fillText(ln, x, top + fsize + i * lh, maxW));
    c.restore();

    if (isPreview) {
      note.textContent = trimmed
        ? `Verse trimmed to fit the banner (max ${maxLines} lines). Reduce the font size to show it all.`
        : `Verse fits the banner (${lines.length} of ${maxLines} lines).`;
    }
  });

  paintToggles();
  window.DV.updatePreview();
})();