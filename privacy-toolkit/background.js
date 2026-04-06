// background.js — Service Worker (Manifest V3)
// Owns ALL state. Intercepts network via webRequest. Receives findings from content.js.

import { matchTracker, SCORE_WEIGHTS } from './modules/trackerDB.js';
import { MSG, FINDING_TYPE, SEV, makeFinding, makeSiteRecord } from './modules/dataModel.js';

// ── State ──────────────────────────────────────────────────────────────────
const STATE = { sites: {}, cookieBaselines: {} };

async function loadState() {
  const data = await chrome.storage.local.get('pm_sites');
  if (data.pm_sites) STATE.sites = data.pm_sites;
}

async function saveState() {
  await chrome.storage.local.set({ pm_sites: STATE.sites });
}

function getSiteRecord(hostname) {
  if (!STATE.sites[hostname]) STATE.sites[hostname] = makeSiteRecord(hostname);
  STATE.sites[hostname].lastVisit = Date.now();
  return STATE.sites[hostname];
}

// ── Privacy Score Engine ───────────────────────────────────────────────────
function recalcScore(record) {
  let penalty = 0;
  const seen = new Set();
  record.findings.forEach(f => {
    const key = f.type + ':' + (f.detail?.name || f.detail?.fieldId || f.detail?.kind || f.detail?.name || '?');
    if (seen.has(key)) return;
    seen.add(key);
    switch (f.type) {
      case FINDING_TYPE.TRACKER:
        penalty += f.detail?.risk === 'high' ? SCORE_WEIGHTS.tracker_high : SCORE_WEIGHTS.tracker_medium; break;
      case FINDING_TYPE.LEAK:
        penalty += f.detail?.thirdParty ? SCORE_WEIGHTS.leak_thirdparty : SCORE_WEIGHTS.leak_samedomain; break;
      case FINDING_TYPE.DARK_PATTERN:
        penalty += f.severity === SEV.CRITICAL ? SCORE_WEIGHTS.darkpattern_critical : SCORE_WEIGHTS.darkpattern_warning; break;
      case FINDING_TYPE.FINGERPRINT:
        penalty += ({ canvas: SCORE_WEIGHTS.fingerprint_canvas, webgl: SCORE_WEIGHTS.fingerprint_webgl, font: SCORE_WEIGHTS.fingerprint_font })[f.detail?.kind] || 10; break;
      case FINDING_TYPE.COOKIE:
        penalty += f.detail?.verdict === 'fail' ? SCORE_WEIGHTS.cookie_fail : SCORE_WEIGHTS.cookie_partial; break;
    }
  });
  record.score = Math.max(0, 100 - penalty);
}

function addFinding(hostname, finding) {
  const record = getSiteRecord(hostname);
  const isDupe = record.findings.some(f =>
    f.type === finding.type &&
    f.detail?.name === finding.detail?.name &&
    f.detail?.kind === finding.detail?.kind &&
    f.detail?.fieldId === finding.detail?.fieldId
  );
  if (isDupe) return false;
  record.findings.push(finding);
  recalcScore(record);
  saveState();
  updateBadge(hostname, record);
  return true;
}

// ── Badge ──────────────────────────────────────────────────────────────────
async function updateBadge(hostname, record) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab) return;
  try {
    const tabHost = new URL(tab.url).hostname.replace(/^www\./, '');
    if (tabHost !== hostname) return;
  } catch { return; }

  const score = record.score;
  const count = record.findings.length;
  let color, text;
  if (score >= 80)      { color = '#22c55e'; text = '✓'; }
  else if (score >= 60) { color = '#f59e0b'; text = String(Math.min(count, 99)); }
  else if (score >= 40) { color = '#ef4444'; text = String(Math.min(count, 99)); }
  else                  { color = '#7c3aed'; text = '!!'; }

  chrome.action.setBadgeText({ text, tabId: tab.id });
  chrome.action.setBadgeBackgroundColor({ color, tabId: tab.id });
}

// ── webRequest — network-level tracker interception ────────────────────────
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.tabId < 0) return;
    const tracker = matchTracker(details.url);
    if (!tracker) return;
    chrome.tabs.get(details.tabId, (tab) => {
      if (chrome.runtime.lastError || !tab?.url) return;
      let pageHost;
      try { pageHost = new URL(tab.url).hostname.replace(/^www\./, ''); } catch { return; }
      let reqHost;
      try { reqHost = new URL(details.url).hostname.replace(/^www\./, ''); } catch { return; }
      if (reqHost === pageHost || reqHost.endsWith('.' + pageHost)) return;

      const finding = makeFinding(
        FINDING_TYPE.TRACKER,
        tracker.risk === 'high' ? SEV.CRITICAL : SEV.WARNING,
        pageHost,
        { name: tracker.name, cat: tracker.cat, risk: tracker.risk, dpdpa: tracker.dpdpa, url: details.url }
      );
      const isNew = addFinding(pageHost, finding);
      if (isNew) {
        chrome.tabs.sendMessage(details.tabId, { type: 'NEW_FINDING', finding }).catch(() => {});
      }
    });
  },
  { urls: ['<all_urls>'] }
);

// ── Cookie Audit ───────────────────────────────────────────────────────────
async function snapshotCookies(hostname) {
  const cookies = await chrome.cookies.getAll({ domain: hostname });
  const map = {};
  cookies.forEach(c => { map[c.name] = { domain: c.domain, httpOnly: c.httpOnly }; });
  return map;
}

async function runCookieAudit(hostname) {
  const baseline = STATE.cookieBaselines[hostname];
  if (!baseline) return { error: 'No baseline' };
  const after = await snapshotCookies(hostname);
  const newCookies = Object.keys(after).filter(k => !baseline[k]);
  const trackingRe = /^(_ga|gtm|_gid|amplitude|mixpanel|hotjar|clarity|fbp|_fbq|cto_|__utm)/i;
  const newTracking = newCookies.filter(k => trackingRe.test(k));
  delete STATE.cookieBaselines[hostname];

  const verdict = newTracking.length > 0 ? 'fail' : newCookies.length > 0 ? 'partial' : 'pass';
  const auditResult = { verdict, newTracking, newAll: newCookies, ts: Date.now() };
  const record = getSiteRecord(hostname);
  record.cookieAudit = auditResult;

  if (verdict !== 'pass') {
    addFinding(hostname, makeFinding(
      FINDING_TYPE.COOKIE,
      verdict === 'fail' ? SEV.CRITICAL : SEV.WARNING,
      hostname,
      auditResult
    ));
  }
  saveState();
  return auditResult;
}

// ── Message Handler ────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const hostname = sender.tab ? (() => {
    try { return new URL(sender.tab.url).hostname.replace(/^www\./, ''); } catch { return null; }
  })() : null;

  switch (msg.type) {
    case MSG.FINDING: {
      if (!hostname) { sendResponse({ ok: false }); return; }
      const isNew = addFinding(hostname, msg.finding);
      sendResponse({ ok: true, isNew });
      break;
    }
    case MSG.GET_SITE_DATA: {
      const host = msg.hostname || hostname;
      sendResponse(host ? (STATE.sites[host] || makeSiteRecord(host)) : null);
      break;
    }
    case MSG.GET_ALL_DATA: {
      sendResponse(STATE.sites);
      break;
    }
    case MSG.COOKIE_BASELINE: {
      if (!hostname) { sendResponse({ ok: false }); return; }
      snapshotCookies(hostname).then(snap => {
        STATE.cookieBaselines[hostname] = snap;
        sendResponse({ ok: true, count: Object.keys(snap).length });
      });
      return true;
    }
    case MSG.COOKIE_AUDIT: {
      if (!hostname) { sendResponse({ ok: false }); return; }
      runCookieAudit(hostname).then(sendResponse);
      return true;
    }
    case MSG.CLEAR_SITE: {
      const host = msg.hostname || hostname;
      if (host) delete STATE.sites[host];
      saveState();
      sendResponse({ ok: true });
      break;
    }
    case MSG.CLEAR_ALL: {
      STATE.sites = {};
      saveState();
      sendResponse({ ok: true });
      break;
    }
  }
  return true;
});

// ── Tab events → update badge ──────────────────────────────────────────────
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    const host = new URL(tab.url).hostname.replace(/^www\./, '');
    const record = STATE.sites[host];
    if (record) updateBadge(host, record);
    else chrome.action.setBadgeText({ text: '', tabId });
  } catch {}
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  try {
    const host = new URL(tab.url).hostname.replace(/^www\./, '');
    const record = STATE.sites[host];
    if (record) updateBadge(host, record);
    else chrome.action.setBadgeText({ text: '', tabId });
  } catch {}
});

loadState();
console.log('[Privacy Monitor] Service worker started.');
