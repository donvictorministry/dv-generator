/**
 * DV-GENERATOR MODULE: share-hub.js
 * Share Hub (right sidebar): PNG file sharing and viral link sharing
 * (WhatsApp, Telegram, Facebook, Messenger, X, LinkedIn, SMS, Gmail, Bluetooth, Copy).
 * Every link is a deep link that reopens the exact design in DV-Generator.
 * Self-contained: delete this file and its <script> tag to remove the feature.
 */
(function () {
  'use strict';
  if (!window.DV) return;

  const enc = encodeURIComponent;
  const ICON_SHARE = 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92Z';

  function context() {
    const st = window.DV.getSettings();
    return {
      st,
      link: window.DV.link(st)
    };
  }

  function go(url) {
    if (/^https:/i.test(url)) window.open(url, '_blank', 'noopener');
    else window.location.href = url;
  }

  async function sendPng() {
    const { st } = context();
    const p = window.DV.presets[st.p] || window.DV.presets.og_whatsapp;
    const blob = await window.DV.renderBlob(st);
    if (!blob) return;
    const name = p.filename;
    const file = new File([blob], name, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: name }); } catch (_) {}
    } else {
      window.DV.showToast('PNG sharing is not supported on this browser.', 'danger');
    }
  }

  async function shareLinkSheet({ link }) {
    if (navigator.share) {
      try { await navigator.share({ url: link }); } catch (_) {}
    } else {
      copyLink({ link });
    }
  }

  async function copyLink({ link }) {
    try {
      await navigator.clipboard.writeText(link);
      window.DV.showToast('Deep link copied to clipboard!', 'success');
    } catch (_) {
      window.DV.showToast('Could not copy the link.', 'danger');
    }
  }

  function gmail({ link }) {
    const subject = 'DV-Generator';
    const body = link;
    const mailto = `mailto:?subject=${enc(subject)}&body=${enc(body)}`;
    if (/Android/i.test(navigator.userAgent)) {
      go(
        'intent:mailto:#Intent;action=android.intent.action.SENDTO;package=com.google.android.gm;' +
        `S.android.intent.extra.SUBJECT=${enc(subject)};S.android.intent.extra.TEXT=${enc(body)};` +
        `S.browser_fallback_url=${enc(mailto)};end`
      );
    } else {
      go(mailto);
    }
  }

  function bluetooth({ link }) {
    if (!/Android/i.test(navigator.userAgent)) { shareLinkSheet({ link }); return; }
    let left = false;
    const onHide = () => { if (document.hidden) left = true; };
    document.addEventListener('visibilitychange', onHide);
    go(
      'intent:#Intent;action=android.intent.action.SEND;type=text/plain;package=com.android.bluetooth;' +
      `S.android.intent.extra.TEXT=${enc(link)};end`
    );
    setTimeout(() => {
      document.removeEventListener('visibilitychange', onHide);
      if (!left) shareLinkSheet({ link });
    }, 1500);
  }

  const OPTIONS = [
    { label: 'Send PNG (Bluetooth, WhatsApp, any app)', color: '#0284c7', run: () => sendPng() },
    { label: 'Share Link (any app)', color: '#475569', run: shareLinkSheet },
    { label: 'WhatsApp', color: '#25d366', run: (c) => go(`https://wa.me/?text=${enc(c.link)}`) },
    { label: 'Telegram', color: '#229ed9', run: (c) => go(`https://t.me/share/url?url=${enc(c.link)}`) },
    { label: 'Facebook', color: '#1877f2', run: (c) => go(`https://www.facebook.com/sharer/sharer.php?u=${enc(c.link)}`) },
    { label: 'Messenger', color: '#0084ff', run: (c) => go(`fb-messenger://share?link=${enc(c.link)}`) },
    { label: 'X (Twitter)', color: '#000000', run: (c) => go(`https://twitter.com/intent/tweet?url=${enc(c.link)}`) },
    { label: 'LinkedIn', color: '#0a66c2', run: (c) => go(`https://www.linkedin.com/sharing/share-offsite/?url=${enc(c.link)}`) },
    { label: 'SMS', color: '#16a34a', run: (c) => go(`sms:?body=${enc(c.link)}`) },
    { label: 'Gmail', color: '#ea4335', run: gmail },
    { label: 'Bluetooth (Link)', color: '#0284c7', run: bluetooth },
    { label: 'Copy Deep Link', color: '#64748b', run: copyLink }
  ];

  // ---------- Styles ----------
  const style = document.createElement('style');
  style.id = 'dvShareHubStyle';
  style.textContent = `
    .dvsh-stack { display: flex; flex-direction: column; gap: 12px; }
    .dvsh-btn { width: 100%; border: none; cursor: pointer; padding: 16px; border-radius: 12px; font-weight: 800; color: #ffffff; text-align: center; }
    .dvsh-btn:active { opacity: 0.85; }
    .dvsh-note { color: var(--text-muted); }
  `;
  document.head.appendChild(style);

  // ---------- Modal ----------
  const modal = document.createElement('div');
  modal.id = 'dvShareHubModal';
  modal.className = 'fullscreen-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `
    <header class="modal-header">
      <h2>Share Hub</h2>
      <button class="close-modal-btn" id="dvShareHubClose">Close</button>
    </header>
    <div class="modal-body">
      <p class="dvsh-note">Every link below reopens this exact design in DV-Generator. The PNG option sends the image file itself.</p>
      <div class="dvsh-stack" id="dvShareHubList"></div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('#dvShareHubClose').addEventListener('click', () => modal.classList.remove('active'));

  const list = modal.querySelector('#dvShareHubList');
  OPTIONS.forEach((opt) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dvsh-btn';
    b.style.background = opt.color;
    b.textContent = opt.label;
    b.addEventListener('click', () => opt.run(context()));
    list.appendChild(b);
  });

  // ---------- Share Hub button (right sidebar) ----------
  const stack = document.querySelector('#rightSidebar .actions-stack');
  if (stack) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'dvShareHubBtn';
    btn.className = 'utility-btn';
    btn.innerHTML = `<svg class="ui-icon" viewBox="0 0 24 24"><path fill="currentColor" d="${ICON_SHARE}"/></svg>Share Hub`;
    btn.addEventListener('click', () => {
      const overlay = document.getElementById('drawerOverlay');
      if (overlay) overlay.click();
      modal.classList.add('active');
    });
    const anchor = document.getElementById('shareAppBtn');
    if (anchor) anchor.after(btn);
    else stack.appendChild(btn);
  }
})();