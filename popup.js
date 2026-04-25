// popup.js v2 — Plain English mode, Block/Clear per tracker

const MSG = { GET_SITE_DATA:'GET_SITE_DATA', COOKIE_BASELINE:'COOKIE_BASELINE', COOKIE_AUDIT:'COOKIE_AUDIT', CLEAR_SITE:'CLEAR_SITE' };
const FINDING_TYPE = { TRACKER:'tracker', LEAK:'leak', DARK_PATTERN:'dark_pattern', FINGERPRINT:'fingerprint', COOKIE:'cookie' };

let currentHostname = '';
let plainEnglishMode = false;
let blockedTrackers = new Set();

// ── Mode toggle ────────────────────────────────────────────────────────────
document.getElementById('modeToggle').addEventListener('change', (e) => {
  plainEnglishMode = e.target.checked;
  document.getElementById('modeLabel').textContent = plainEnglishMode ? 'Plain' : 'Dev';
  document.body.classList.toggle('plain-english', plainEnglishMode);
  loadAndRender();
});

// ── Helpers ────────────────────────────────────────────────────────────────
function scoreColor(s) {
  if (s >= 80) return '#22c55e';
  if (s >= 60) return '#f59e0b';
  if (s >= 40) return '#ef4444';
  return '#a855f7';
}
function scoreGrade(s) {
  if (s >= 80) return 'A'; if (s >= 60) return 'B'; if (s >= 40) return 'C'; if (s >= 20) return 'D'; return 'F';
}

function verdictText(record) {
  const trackers = record.findings.filter(f => f.type === FINDING_TYPE.TRACKER);
  const leaks    = record.findings.filter(f => f.type === FINDING_TYPE.LEAK);
  const dps      = record.findings.filter(f => f.type === FINDING_TYPE.DARK_PATTERN);
  const fps      = record.findings.filter(f => f.type === FINDING_TYPE.FINGERPRINT);
  const s = record.score;

  if (s >= 80) return { text: 'This site looks clean. No major privacy issues detected so far.', cls: 'green' };

  const parts = [];
  if (trackers.length) {
    const names = [...new Set(trackers.map(f => f.detail?.name))].slice(0,3).join(', ');
    parts.push(`${trackers.length} company${trackers.length>1?'s are':'is'} tracking you (${names})`);
  }
  if (leaks.length) parts.push(`your data was sent out before you clicked Submit`);
  if (fps.length) parts.push(`this site is fingerprinting your device`);
  if (dps.length) parts.push(`${dps.length} dark pattern${dps.length>1?'s were':'was'} found trying to trick you`);

  const text = parts.length ? `⚠️ ${parts.join(', and ')}.` : 'Some privacy issues detected.';
  return { text, cls: s >= 60 ? 'amber' : 'red' };
}

function trafficLight(s) {
  if (s >= 80) return `<div class="traffic"><div class="tl tl-r"></div><div class="tl tl-a"></div><div class="tl tl-g on"></div></div>`;
  if (s >= 50) return `<div class="traffic"><div class="tl tl-r"></div><div class="tl tl-a on"></div><div class="tl tl-g"></div></div>`;
  return `<div class="traffic"><div class="tl tl-r on"></div><div class="tl tl-a"></div><div class="tl tl-g"></div></div>`;
}

function pill(text, cls) { return `<span class="pill ${cls}">${text}</span>`; }
function badgePill(n, cls) { return `<span class="pill ${cls}" style="font-size:10px">${n}</span>`; }

// ── Score section ──────────────────────────────────────────────────────────
function renderScore(record) {
  const s = record.score;
  const color = scoreColor(s);
  const circ = 2 * Math.PI * 34;
  const offset = circ * (1 - s/100);
  const trackers = record.findings.filter(f=>f.type===FINDING_TYPE.TRACKER);
  const leaks    = record.findings.filter(f=>f.type===FINDING_TYPE.LEAK);
  const dps      = record.findings.filter(f=>f.type===FINDING_TYPE.DARK_PATTERN);
  const fps      = record.findings.filter(f=>f.type===FINDING_TYPE.FINGERPRINT);
  const verdict  = verdictText(record);

  const summaryPills = [
    trackers.length ? pill(`${trackers.length} tracker${trackers.length>1?'s':''}`, 'pill-red') : '',
    leaks.length    ? pill(`${leaks.length} leak${leaks.length>1?'s':''}`, 'pill-amber') : '',
    dps.length      ? pill(`${dps.length} dark pattern${dps.length>1?'s':''}`, 'pill-purple') : '',
    fps.length      ? pill(`${fps.length} fingerprint${fps.length>1?'s':''}`, 'pill-blue') : '',
    (!trackers.length&&!leaks.length&&!dps.length&&!fps.length) ? pill('Clean','pill-green') : '',
  ].join('');

  return `
    <div class="score-wrap">
      <div class="ring-wrap">
        <svg width="76" height="76" viewBox="0 0 76 76">
          <circle class="ring-bg" cx="38" cy="38" r="34"/>
          <circle class="ring-fg" cx="38" cy="38" r="34" stroke="${color}"
            stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
        </svg>
        <div class="ring-num" style="color:${color}">${s}<div class="ring-sub">/ 100</div></div>
      </div>
      <div class="score-meta">
        <div class="score-site">${currentHostname}</div>
        ${plainEnglishMode
          ? `${trafficLight(s)}<div class="verdict ${verdict.cls}">${verdict.text}</div>`
          : `<div style="font-size:11px;color:${color};margin-bottom:6px;font-weight:600">${scoreGrade(s)} — ${s>=80?'Private':s>=60?'Low Risk':s>=40?'Risky':'Dangerous'}</div>`
        }
        <div class="pills">${summaryPills}</div>
      </div>
    </div>`;
}

// ── Tracker section ────────────────────────────────────────────────────────
function renderTrackerRow(f) {
  const name = f.detail?.name || '?';
  const isBlocked = blockedTrackers.has(name);
  const blockDomains = f.detail?.blockDomains || [];

  return `
    <div class="f-row" id="tracker-${name.replace(/\s+/g,'_')}">
      <div class="f-top">
        <span class="f-name">${name}${isBlocked ? ' <span style="color:#86efac;font-size:9px">● BLOCKED</span>' : ''}</span>
        <div class="f-badges">
          ${f.detail?.dpdpa ? '<span class="pill pill-purple" style="font-size:9px">DPDPA</span>' : ''}
          <span class="pill ${f.detail?.risk==='high'?'pill-red':'pill-amber'}">${f.detail?.risk||'?'}</span>
        </div>
      </div>
      <div class="f-explain">${f.detail?.plainEnglish || ''}</div>
      <div class="f-meta">
        <span>${f.detail?.cat||''}</span>
      </div>
      <div class="f-actions">
        <button class="act-btn btn-block ${isBlocked?'blocked':''}" 
          data-tracker="${name}" 
          data-domains='${JSON.stringify(blockDomains)}'
          data-blocked="${isBlocked}">
          ${isBlocked ? '✓ Unblock' : '🚫 Block'}
        </button>
        <button class="act-btn btn-cookies" 
          data-clear-tracker="${name}"
          data-domains='${JSON.stringify(blockDomains)}'>
          🍪 Clear cookies
        </button>
      </div>
    </div>`;
}

function renderSection(title, findings, renderRow, badgeCls) {
  const id = 'sec-' + title.replace(/\W+/g,'_').toLowerCase();
  const count = findings.length;
  return `
    <div class="section" id="${id}">
      <div class="sec-hdr" data-sec="${id}">
        <span class="sec-title">${title}</span>
        <div class="sec-right">
          ${badgePill(count, count>0?badgeCls:'pill-gray')}
          <span class="sec-arrow">▼</span>
        </div>
      </div>
      <div class="sec-body">
        ${count===0
          ? '<div class="empty">None detected</div>'
          : findings.slice(0,8).map(renderRow).join('') + (count>8?`<div class="f-row"><span class="empty">+${count-8} more</span></div>`:'')
        }
        ${count>0 && title==='Trackers Detected' ? `
          <div class="disclaimer">
            <strong>What blocking does:</strong> Stops this tracker from loading on future pages.<br>
            <strong>What it cannot do:</strong> Data already sent to their servers cannot be recalled. Trackers built into a site's own server code are invisible to us.
          </div>` : ''}
      </div>
    </div>`;
}

// ── Cookie section ─────────────────────────────────────────────────────────
function renderCookieSec(record) {
  const audit = record.cookieAudit;
  const verdictHtml = !audit
    ? '<span style="color:#374151;font-size:11px">Not audited yet</span>'
    : audit.verdict==='fail'
      ? `<span class="pill pill-red">❌ FAIL — tracking cookies set</span>`
      : audit.verdict==='partial'
        ? `<span style="color:#fde68a;font-size:11px">⚠️ PARTIAL</span>`
        : `<span style="color:#86efac;font-size:11px">✅ PASS</span>`;
  return `
    <div class="cookie-sec">
      <div class="cookie-title">Cookie Consent Audit</div>
      <div class="cookie-row">${verdictHtml}
        <div class="cookie-btns">
          <button class="c-btn c-btn-b" id="baselineBtn">📸 Baseline</button>
          <button class="c-btn c-btn-a" id="auditBtn" disabled>🔍 Audit</button>
        </div>
      </div>
      <div class="cookie-help">1. Click Baseline → 2. Click Reject All on the banner → 3. Click Audit</div>
    </div>`;
}

// ── Main render ────────────────────────────────────────────────────────────
function renderMain(record) {
  const trackers = record.findings.filter(f=>f.type===FINDING_TYPE.TRACKER);
  const leaks    = record.findings.filter(f=>f.type===FINDING_TYPE.LEAK);
  const dps      = record.findings.filter(f=>f.type===FINDING_TYPE.DARK_PATTERN);
  const fps      = record.findings.filter(f=>f.type===FINDING_TYPE.FINGERPRINT);

  document.getElementById('main').innerHTML = `
    ${renderScore(record)}
    <div>
      ${renderSection('Trackers Detected', trackers, renderTrackerRow, 'pill-red')}
      ${renderSection('Form Leaks', leaks, f=>`
        <div class="f-row">
          <div class="f-top">
            <span class="f-name">${f.detail?.fieldId||'field'}</span>
            <span class="pill ${f.detail?.thirdParty?'pill-red':'pill-amber'}">${f.detail?.thirdParty?'3rd party':'same domain'}</span>
          </div>
          <div class="f-explain">Your <strong>${f.detail?.fieldId}</strong> was sent to <strong>${f.detail?.domain}</strong>${f.detail?.thirdParty?' — an external company you never agreed to share with':''} before you clicked Submit.</div>
          <div class="f-meta"><span>→ ${f.detail?.domain||'?'}</span></div>
        </div>`, 'pill-amber')}
      ${renderSection('Dark Patterns', dps, f=>`
        <div class="f-row">
          <div class="f-top">
            <span class="f-name">${f.detail?.name||'?'}</span>
            <span class="pill ${f.severity==='critical'?'pill-red':'pill-amber'}">${f.severity}</span>
          </div>
          <div class="f-dp-msg">${f.detail?.message || ''}</div>
          <div class="f-meta"><span style="color:#4b5563">Found: &ldquo;${(f.detail?.preview||'').slice(0,55)}${(f.detail?.preview||'').length>55?'…':''}&rdquo;</span></div>
        </div>`, 'pill-purple')}
      ${renderSection('Fingerprinting', fps, f=>`
        <div class="f-row">
          <div class="f-top">
            <span class="f-name">${f.detail?.kind||'?'} fingerprinting</span>
            <span class="pill pill-blue">detected</span>
          </div>
          <div class="f-explain">This site is reading your browser's ${f.detail?.kind==='canvas'?'graphics engine':'technical properties'} to create a unique ID for your device — without cookies. Clearing your history won't help.</div>
          <div class="f-meta"><span>${f.detail?.method||''}</span></div>
        </div>`, 'pill-blue')}
    </div>
    ${renderCookieSec(record)}
    <div class="footer">
      <span class="footer-note">DPDPA 2023 · India Edition</span>
      <button class="clear-btn" id="clearBtn">Clear data</button>
    </div>`;

  // Apply plain english class to body
  document.body.classList.toggle('plain-english', plainEnglishMode);

  bindEvents();

  // Auto-open sections with findings
  ['sec-trackers_detected','sec-form_leaks','sec-dark_patterns','sec-fingerprinting'].forEach(id => {
    const sec = document.getElementById(id);
    if (sec && sec.querySelector('.f-row')) sec.classList.add('open');
  });

  // Event delegation for section header clicks (avoids inline onclick / CSP issues)
  const mainEl = document.getElementById('main');
  mainEl.removeEventListener('click', mainEl._secHandler);
  mainEl._secHandler = (e) => {
    const hdr = e.target.closest('[data-sec]');
    if (hdr) toggleSec(hdr.dataset.sec);
  };
  mainEl.addEventListener('click', mainEl._secHandler);
}

function bindEvents() {
  document.getElementById('clearBtn')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: MSG.CLEAR_SITE, hostname: currentHostname }, () => loadAndRender());
  });

  // Block / Unblock buttons
  document.querySelectorAll('.btn-block').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.tracker;
      const domains = JSON.parse(btn.dataset.domains || '[]');
      const isBlocked = btn.dataset.blocked === 'true';
      btn.disabled = true;
      btn.textContent = '⏳';
      if (isBlocked) {
        chrome.runtime.sendMessage({ type: 'UNBLOCK_TRACKER', trackerName: name }, () => {
          blockedTrackers.delete(name);
          loadAndRender();
        });
      } else {
        chrome.runtime.sendMessage({ type: 'BLOCK_TRACKER', trackerName: name, blockDomains: domains }, (res) => {
          if (res?.ok) blockedTrackers.add(name);
          loadAndRender();
        });
      }
    });
  });

  // Clear cookies buttons
  document.querySelectorAll('.btn-cookies').forEach(btn => {
    btn.addEventListener('click', () => {
      const domains = JSON.parse(btn.dataset.domains || '[]');
      btn.disabled = true;
      btn.textContent = '⏳ Clearing…';
      chrome.runtime.sendMessage({ type: 'CLEAR_COOKIES', blockDomains: domains }, (res) => {
        btn.textContent = res?.cleared > 0 ? `✓ Cleared ${res.cleared}` : '✓ None found';
        setTimeout(() => { btn.textContent = '🍪 Clear cookies'; btn.disabled = false; }, 2000);
      });
    });
  });

  // Cookie audit
  const baselineBtn = document.getElementById('baselineBtn');
  const auditBtn = document.getElementById('auditBtn');
  baselineBtn?.addEventListener('click', () => {
    baselineBtn.textContent = '✓ Done!';
    baselineBtn.disabled = true;
    auditBtn.disabled = false;
    chrome.runtime.sendMessage({ type: MSG.COOKIE_BASELINE }, () => {});
  });
  auditBtn?.addEventListener('click', () => {
    auditBtn.textContent = '⏳';
    auditBtn.disabled = true;
    chrome.runtime.sendMessage({ type: MSG.COOKIE_AUDIT }, () => setTimeout(loadAndRender, 500));
  });
}

function toggleSec(id) {
  document.getElementById(id)?.classList.toggle('open');
}
window.toggleSec = toggleSec;

// ── Load ───────────────────────────────────────────────────────────────────
function loadAndRender() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.url) { document.getElementById('main').innerHTML = '<div class="loading">No page loaded.</div>'; return; }
    try { currentHostname = new URL(tab.url).hostname.replace(/^www\./, ''); }
    catch { document.getElementById('main').innerHTML = '<div class="loading">Cannot analyse this page.</div>'; return; }

    // Get blocked list first
    chrome.runtime.sendMessage({ type: 'GET_BLOCKED' }, (res) => {
      if (res?.blocked) blockedTrackers = new Set(res.blocked);
      chrome.runtime.sendMessage({ type: MSG.GET_SITE_DATA, hostname: currentHostname }, (record) => {
        if (!record) { document.getElementById('main').innerHTML = '<div class="loading">No data yet. Browse a few pages.</div>'; return; }
        renderMain(record);
      });
    });
  });
}

document.getElementById('historyBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('pages/history.html') });
});

loadAndRender();
setInterval(loadAndRender, 4000);
