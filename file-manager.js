/**
 * DV-GENERATOR MODULE: file-manager.js
 * History button (right sidebar) + saved files: reopen in editor, share each PNG
 * individually, share a clean deep link, delete.
 * Self-contained: delete this file and its <script> tag to remove the feature.
 */
(function () {
  'use strict';
  if (!window.DV) return;

  const KEY = 'dv_files';
  const MAX_ITEMS = 100;

  const ICON_HISTORY = 'M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z';
  const ICON_SAVE = 'M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z';

  const loadItems = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (_) { return []; }
  };
  const saveItems = (items) => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); return true; }
    catch (_) { window.DV.showToast('Storage is full. Delete some saved files.', 'danger'); return false; }
  };
  const slug = (s) => (String(s || 'asset').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) || 'asset';
  const iconSvg = (d) => `<svg class="ui-icon" viewBox="0 0 24 24"><path fill="currentColor" d="${d}"/></svg>`;

  // ---------- Styles ----------
  const style = document.createElement('style');
  style.id = 'dvFileManagerStyle';
  style.textContent = `
    .dvfm-item { background: var(--surface); border: 2px solid var(--border); border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 10px; box-shadow: var(--card-shadow); }
    .dvfm-thumb { width: 100%; max-width: 320px; height: auto; align-self: center; background: #000000; border-radius: 10px; }
    .dvfm-name { font-weight: 800; overflow-wrap: anywhere; }
    .dvfm-meta { color: var(--text-muted); }
    .dvfm-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .dvfm-actions .secondary-btn, .dvfm-actions .primary-btn { padding: 12px 8px; }
    .dvfm-actions .dvfm-wide { grid-column: 1 / -1; }
    .dvfm-del.armed { background: var(--danger); color: #ffffff; border-color: var(--danger); }
    .dvfm-empty { color: var(--text-muted); text-align: center; padding: 24px 0; }
  `;
  document.head.appendChild(style);

  // ---------- Modal ----------
  const modal = document.createElement('div');
  modal.id = 'dvHistoryModal';
  modal.className = 'fullscreen-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `
    <header class="modal-header">
      <h2>History</h2>
      <button class="close-modal-btn" id="dvHistoryClose">Close</button>
    </header>
    <div class="modal-body" id="dvHistoryList"></div>
  `;
  document.body.appendChild(modal);
  const listEl = modal.querySelector('#dvHistoryList');
  modal.querySelector('#dvHistoryClose').addEventListener('click', () => modal.classList.remove('active'));

  // ---------- Actions ----------
  function makeBtn(label, cls, handler) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.textContent = label;
    b.addEventListener('click', handler);
    return b;
  }

  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function sharePng(item) {
    const p = window.DV.presets[item.st.p] || window.DV.presets.og_whatsapp;
    const blob = await window.DV.renderBlob(item.st);
    if (!blob) return;
    const name = `${slug(item.st.t)}-${p.filename}`;
    const file = new File([blob], name, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: name }); } catch (_) {}
    } else {
      downloadBlob(blob, name);
      window.DV.showToast('Direct sharing is unavailable here. PNG downloaded instead.', 'info');
    }
  }

  async function copyText(txt) {
    try {
      await navigator.clipboard.writeText(txt);
      window.DV.showToast('Deep link copied to clipboard!', 'success');
    } catch (_) {
      window.DV.showToast('Could not copy the link.', 'danger');
    }
  }

  async function shareLink(item) {
    const url = window.DV.link(item.st);
    if (navigator.share) {
      try { await navigator.share({ url }); } catch (_) {}
    } else {
      copyText(url);
    }
  }

  function openInEditor(item) {
    window.DV.applySettings(item.st);
    modal.classList.remove('active');
    window.DV.showToast('Opened in the editor', 'success');
  }

  function removeItem(id) {
    saveItems(loadItems().filter(i => i.id !== id));
    render();
  }

  // ---------- Rendering the list ----------
  function thumb(st, p) {
    const tmp = document.createElement('canvas');
    window.DV.renderToCanvas(tmp, p.w, p.h, st);
    const tw = Math.min(p.w, 320);
    const th = Math.round(p.h * tw / p.w);
    const t = document.createElement('canvas');
    t.width = tw;
    t.height = th;
    t.className = 'dvfm-thumb';
    t.getContext('2d').drawImage(tmp, 0, 0, tw, th);
    return t;
  }

  function buildCard(item) {
    const p = window.DV.presets[item.st.p] || window.DV.presets.og_whatsapp;
    const el = document.createElement('div');
    el.className = 'dvfm-item';

    const name = document.createElement('div');
    name.className = 'dvfm-name';
    name.textContent = (item.st.t || '').trim() || 'My App';

    const meta = document.createElement('div');
    meta.className = 'dvfm-meta';
    meta.textContent = `${p.label} • ${p.w} × ${p.h} px • ${new Date(item.ts).toLocaleDateString()}`;

    const actions = document.createElement('div');
    actions.className = 'dvfm-actions';

    const openBtn = makeBtn('Open in Editor', 'primary-btn dvfm-wide', () => openInEditor(item));
    const pngBtn = makeBtn('Share PNG', 'secondary-btn', () => sharePng(item));
    const linkBtn = makeBtn('Share Link', 'secondary-btn', () => shareLink(item));
    const copyBtn = makeBtn('Copy Link', 'secondary-btn', () => copyText(window.DV.link(item.st)));

    let armed = false;
    let timer = null;
    const delBtn = makeBtn('Delete', 'secondary-btn dvfm-del', () => {
      if (!armed) {
        armed = true;
        delBtn.textContent = 'Tap again to delete';
        delBtn.classList.add('armed');
        timer = setTimeout(() => {
          armed = false;
          delBtn.textContent = 'Delete';
          delBtn.classList.remove('armed');
        }, 3000);
      } else {
        clearTimeout(timer);
        removeItem(item.id);
      }
    });

    actions.append(openBtn, pngBtn, linkBtn, copyBtn, delBtn);
    el.append(thumb(item.st, p), name, meta, actions);
    return el;
  }

  function render() {
    listEl.textContent = '';
    const items = loadItems();
    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'dvfm-empty';
      empty.textContent = 'No saved files yet. Tap "Save to History" under the live preview.';
      listEl.appendChild(empty);
      return;
    }
    items.forEach(item => listEl.appendChild(buildCard(item)));
  }

  // ---------- Save button (under the live preview) ----------
  const renderActions = document.querySelector('.render-actions');
  if (renderActions) {
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.id = 'dvSaveBtn';
    saveBtn.className = 'secondary-btn';
    saveBtn.innerHTML = `${iconSvg(ICON_SAVE)}<span>Save to History</span>`;
    saveBtn.addEventListener('click', () => {
      const st = window.DV.getSettings();
      const sig = JSON.stringify(st);
      const items = loadItems();
      if (items.some(i => JSON.stringify(i.st) === sig)) {
        window.DV.showToast('This design is already in History.', 'info');
        return;
      }
      items.unshift({ id: Date.now().toString(36), ts: Date.now(), st });
      if (saveItems(items.slice(0, MAX_ITEMS))) window.DV.showToast('Saved to History', 'success');
    });
    renderActions.appendChild(saveBtn);
  }

  // ---------- History button (right sidebar) ----------
  const stack = document.querySelector('#rightSidebar .actions-stack');
  if (stack) {
    const histBtn = document.createElement('button');
    histBtn.type = 'button';
    histBtn.id = 'dvHistoryBtn';
    histBtn.className = 'utility-btn';
    histBtn.innerHTML = `${iconSvg(ICON_HISTORY)}History`;
    histBtn.addEventListener('click', () => {
      const overlay = document.getElementById('drawerOverlay');
      if (overlay) overlay.click();
      render();
      modal.classList.add('active');
    });
    stack.prepend(histBtn);
  }
})();