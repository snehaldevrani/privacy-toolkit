// popup.js
const MSG = { GET_SITE_DATA:'GET_SITE_DATA', COOKIE_BASELINE:'COOKIE_BASELINE', COOKIE_AUDIT:'COOKIE_AUDIT', CLEAR_SITE:'CLEAR_SITE' };
const FINDING_TYPE = { TRACKER:'tracker', LEAK:'leak', DARK_PATTERN:'dark_pattern', FINGERPRINT:'fingerprint', COOKIE:'cookie' };

let currentHostname = '';

function scoreColor(s) {
  if (s >= 80) return '#22c55e';
  if (s >= 60) return '#f59e0b';
  if (s >= 40) return '#ef4444';
  return '#a855f7';
}
function scoreGrade(s) {
  if (s >= 80) return 'A';
  if (s >= 60) return 'B';
  if (s >= 40) return 'C';
  if (s >= 20) return 'D';
  return 'F';
}
function scoreLabel(s) {
  if (s >= 80) return 'Private';
  if (s >= 60) return 'Low Risk';
  if (s >= 40) return 'Risky';
  if (s >= 20) return 'Dangerous';
  return 'Critical';
}
function pill(text, cls) { return `<span class="score-count-pill ${cls}">${text}</span>`; }
function badgePill(text, cls) { return `<span class="section-badge ${cls}">${text}</span>`; }

function renderScore(record) {
  const s = record.score;
  const color = scoreColor(s);
  const grade = scoreGrade(s);
  const label = scoreLabel(s);
  const circumference = 2 * Math.PI * 34;
  const offset = circumference * (1 - s / 100);

  const trackers = record.findings.filter(f => f.type === FINDING_TYPE.TRACKER);
  const leaks    = record.findings.filter(f => f.type === FINDING_TYPE.LEAK);
  const dps      = record.findings.filter(f => f.type === FINDING_TYPE.DARK_PATTERN);
  const fps      = record.findings.filter(f => f.type === FINDING_TYPE.FINGERPRINT);

  const pillsHtml = [
    trackers.length ? pill(`${trackers.length} tracker${trackers.length>1?'s':''}`, 'pill-red') : '',
    leaks.length    ? pill(`${leaks.length} leak${leaks.length>1?'s':''}`, 'pill-amber') : '',
    dps.length      ? pill(`${dps.length} dark pattern${dps.length>1?'s':''}`, 'pill-purple') : '',
    fps.length      ? pill(`${fps.length} fingerprint${fps.length>1?'s':''}`, 'pill-blue') : '',
    (!trackers.length && !leaks.length && !dps.length && !fps.length) ? pill('Clean so far', 'pill-green') : '',
  ].join('');

  return `
    <div class="score-section">
      <div class="score-ring-wrap">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle class="score-ring-bg" cx="40" cy="40" r="34"/>
          <circle class="score-ring-fg" cx="40" cy="40" r="34"
            stroke="${color}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"/>
        </svg>
        <div class="score-number" style="color:${color}">
          ${s}<div class="score-label">/ 100</div>
        </div>
      </div>
      <div class="score-meta">
        <div class="score-site">${currentHostname}</div>
        <div class="score-grade ${grade}">${grade} — ${label}</div>
        <div class="score-counts">${pillsHtml}</div>
      </div>
    </div>`;
}

function renderSection(title, findings, renderRow, badgeClass) {
  const count = findings.length;
  const id = 'sec-' + title.replace(/\s+/g,'');
  return `
    <div class="section" id="${id}">
      <div class="section-header" onclick="toggleSection('${id}')">
        <span class="section-title">${title}</span>
        <span style="display:flex;align-items:center">
          ${badgePill(count, count > 0 ? badgeClass : 'pill-gray')}
          <span class="section-arrow">▼</span>
        </span>
      </div>
      <div class="section-body">
        ${count === 0
          ? '<div class="empty">None detected</div>'
          : findings.slice(0,8).map(renderRow).join('') + (count > 8 ? `<div class="finding-row"><span class="empty">+ ${count-8} more</span></div>` : '')
        }
      </div>
    </div>`;
}

function renderCookieSection(record) {
  const audit = record.cookieAudit;
  const verdictHtml = !audit
    ? '<span class="cookie-verdict" style="color:#374151">Not audited yet</span>'
    : audit.verdict === 'fail'
      ? `<span class="cookie-verdict pill-red" style="padding:2px 7px;border-radius:4px;background:rgba(239,68,68,.15);font-size:11px;">❌ FAIL — tracking cookies set</span>`
      : audit.verdict === 'partial'
        ? `<span class="cookie-verdict" style="color:#fde68a;">⚠️ PARTIAL — some cookies set</span>`
        : `<span class="cookie-verdict" style="color:#86efac;">✅ PASS — rejection honoured</span>`;

  return `
    <div class="cookie-section">
      <div class="cookie-title">Cookie Consent Audit</div>
      <div class="cookie-row">
        ${verdictHtml}
        <div class="cookie-btns">
          <button class="cookie-btn btn-baseline" id="baselineBtn">📸 Baseline</button>
          <button class="cookie-btn btn-audit" id="auditBtn" disabled>🔍 Audit</button>
        </div>
      </div>
      <div class="cookie-help">1. Click Baseline → 2. Click Reject All on the banner → 3. Click Audit</div>
    </div>`;
}

function renderMain(record) {
  const trackers    = record.findings.filter(f => f.type === FINDING_TYPE.TRACKER);
  const leaks       = record.findings.filter(f => f.type === FINDING_TYPE.LEAK);
  const darkPatterns= record.findings.filter(f => f.type === FINDING_TYPE.DARK_PATTERN);
  const fingerprints= record.findings.filter(f => f.type === FINDING_TYPE.FINGERPRINT);

  const html = `
    ${renderScore(record)}
    <div class="sections">
      ${renderSection('Trackers Detected', trackers, f => `
        <div class="finding-row">
          <span class="finding-name">${f.detail?.name||'?'}</span>
          <span class="finding-meta">${f.detail?.cat||''}</span>
          <span class="score-count-pill ${f.detail?.risk==='high'?'pill-red':'pill-amber'}">${f.detail?.risk||'?'}</span>
        </div>`, 'pill-red')}
      ${renderSection('Form Leaks', leaks, f => `
        <div class="finding-row">
          <span class="finding-name">${f.detail?.fieldId||'field'}</span>
          <span class="finding-meta">→ ${f.detail?.domain||'?'}</span>
          <span class="score-count-pill ${f.detail?.thirdParty?'pill-red':'pill-amber'}">${f.detail?.thirdParty?'3rd party':'same domain'}</span>
        </div>`, 'pill-amber')}
      ${renderSection('Dark Patterns', darkPatterns, f => `
        <div class="finding-row">
          <span class="finding-name">${f.detail?.name||'?'}</span>
          <span class="finding-meta" style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${f.detail?.preview||''}</span>
          <span class="score-count-pill ${f.severity==='critical'?'pill-red':'pill-amber'}">${f.severity||'?'}</span>
        </div>`, 'pill-purple')}
      ${renderSection('Fingerprinting', fingerprints, f => `
        <div class="finding-row">
          <span class="finding-name">${f.detail?.kind||'?'} fingerprinting</span>
          <span class="finding-meta">${f.detail?.method||''}</span>
          <span class="score-count-pill pill-blue">detected</span>
        </div>`, 'pill-blue')}
    </div>
    ${renderCookieSection(record)}
    <div class="footer">
      <span class="footer-note">DPDPA 2023 · India Edition</span>
      <button class="clear-btn" id="clearBtn">Clear data</button>
    </div>`;

  document.getElementById('main').innerHTML = html;
  bindEvents();
}

function bindEvents() {
  document.getElementById('clearBtn')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: MSG.CLEAR_SITE, hostname: currentHostname }, () => loadAndRender());
  });

  const baselineBtn = document.getElementById('baselineBtn');
  const auditBtn = document.getElementById('auditBtn');

  baselineBtn?.addEventListener('click', () => {
    baselineBtn.textContent = '⏳ Captured!';
    baselineBtn.disabled = true;
    auditBtn.disabled = false;
    chrome.runtime.sendMessage({ type: MSG.COOKIE_BASELINE }, () => {});
  });

  auditBtn?.addEventListener('click', () => {
    auditBtn.textContent = '⏳ Auditing…';
    auditBtn.disabled = true;
    chrome.runtime.sendMessage({ type: MSG.COOKIE_AUDIT }, () => {
      setTimeout(loadAndRender, 500);
    });
  });

  document.querySelectorAll('.section-header').forEach(h => {
    h.addEventListener('click', () => {
      const sec = h.closest('.section');
      sec.classList.toggle('open');
    });
  });
}

function toggleSection(id) {
  document.getElementById(id)?.classList.toggle('open');
}

function loadAndRender() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.url) { document.getElementById('main').innerHTML = '<div class="loading">No page loaded.</div>'; return; }
    try {
      currentHostname = new URL(tab.url).hostname.replace(/^www\./, '');
    } catch {
      document.getElementById('main').innerHTML = '<div class="loading">Cannot analyse this page.</div>';
      return;
    }
    chrome.runtime.sendMessage({ type: MSG.GET_SITE_DATA, hostname: currentHostname }, (record) => {
      if (!record) { document.getElementById('main').innerHTML = '<div class="loading">No data yet.</div>'; return; }
      renderMain(record);
      // Auto-open sections that have findings
      ['sec-TrackersDetected','sec-FormLeaks','sec-DarkPatterns','sec-Fingerprinting'].forEach(id => {
        const sec = document.getElementById(id);
        if (sec && sec.querySelector('.finding-row:not(.empty)')) sec.classList.add('open');
      });
    });
  });
}

document.getElementById('historyBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('pages/history.html') });
});

loadAndRender();
// Auto-refresh every 3s while popup is open
setInterval(loadAndRender, 3000);
