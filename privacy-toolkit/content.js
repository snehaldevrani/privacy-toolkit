// content.js — injected into every page
// Detects: form leaks, dark patterns, fingerprinting
// Shows in-page notifications
// Communicates with background.js via chrome.runtime.sendMessage

(function () {
  'use strict';
  if (window.__pmLoaded) return;
  window.__pmLoaded = true;

  const FINDING_TYPE = { TRACKER:'tracker', LEAK:'leak', DARK_PATTERN:'dark_pattern', FINGERPRINT:'fingerprint', COOKIE:'cookie' };
  const SEV = { CRITICAL:'critical', WARNING:'warning', INFO:'info' };

  function makeFinding(type, severity, detail) {
    return { id:`${type}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, type, severity, site: location.hostname.replace(/^www\./,''), timestamp: Date.now(), detail };
  }

  const _once = new Set();
  function once(key, fn) { if (!_once.has(key)) { _once.add(key); fn(); } }

  const pageDomain = location.hostname.replace(/^www\./, '');
  function isThirdParty(url) {
    try {
      const d = new URL(url, location.href).hostname.replace(/^www\./, '');
      return d !== pageDomain && !d.endsWith('.' + pageDomain) && !pageDomain.endsWith('.' + d);
    } catch { return false; }
  }

  function reportFinding(finding) {
    chrome.runtime.sendMessage({ type: 'FINDING', finding }, (resp) => {
      if (chrome.runtime.lastError) return;
      if (resp?.isNew) showNotif(finding);
    });
  }

  // Listen for tracker findings from background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'NEW_FINDING') showNotif(msg.finding);
  });

  // ══════════════════════════════════════════════════════
  // NOTIFICATION SYSTEM
  // ══════════════════════════════════════════════════════
  function ensureStyles() {
    if (document.getElementById('pm-styles')) return;
    const s = document.createElement('style');
    s.id = 'pm-styles';
    s.textContent = `
      #pm-stack{position:fixed;top:16px;right:16px;width:304px;z-index:2147483646;display:flex;flex-direction:column;gap:8px;pointer-events:none;font-family:-apple-system,'Segoe UI',sans-serif}
      .pm-n{background:#0d0d18;border-radius:10px;padding:11px 13px;font-size:12px;color:#e2e8f0;border-left:3px solid #ef4444;pointer-events:auto;opacity:0;transform:translateX(12px);transition:opacity .22s,transform .22s;box-shadow:0 8px 28px rgba(0,0,0,.55)}
      .pm-n.in{opacity:1;transform:translateX(0)}.pm-n.out{opacity:0;transform:translateX(12px)}
      .pm-n[data-s=warning]{border-left-color:#f59e0b}.pm-n[data-s=info]{border-left-color:#3b82f6}
      .pm-nt{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:3px}
      .pm-ntitle{font-weight:600;font-size:12px;color:#fca5a5;flex:1;line-height:1.3}
      .pm-n[data-s=warning] .pm-ntitle{color:#fde68a}.pm-n[data-s=info] .pm-ntitle{color:#93c5fd}
      .pm-nx{background:none;border:none;color:#4b5563;font-size:13px;cursor:pointer;padding:0;line-height:1}
      .pm-nx:hover{color:#9ca3af}
      .pm-nb{font-size:11px;color:#94a3b8;line-height:1.5}.pm-nb strong{color:#cbd5e1;font-weight:500}
      .pm-bar{height:2px;margin-top:8px;background:rgba(239,68,68,.2);border-radius:1px;transform-origin:left;animation:pm-drain 6s linear forwards}
      .pm-n[data-s=warning] .pm-bar{background:rgba(245,158,11,.2)}.pm-n[data-s=info] .pm-bar{background:rgba(59,130,246,.2)}
      @keyframes pm-drain{to{transform:scaleX(0)}}
      .pm-hl{outline:2px solid #ef4444!important;outline-offset:2px!important}
      .pm-hl[data-w]{outline-color:#f59e0b!important}
    `;
    document.head?.appendChild(s) || document.documentElement.appendChild(s);
  }

  let stack;
  function ensureStack() {
    if (stack && document.contains(stack)) return;
    stack = document.createElement('div');
    stack.id = 'pm-stack';
    (document.body || document.documentElement).appendChild(stack);
  }

  function showNotif(finding) {
    ensureStyles();
    ensureStack();

    const level = finding.severity === SEV.CRITICAL ? 'critical' : finding.severity === SEV.WARNING ? 'warning' : 'info';
    const titles = {
      tracker: `🔍 Tracker: ${finding.detail?.name || 'Unknown'}`,
      leak: finding.detail?.thirdParty ? '🚨 Data sent to 3rd party' : '⚠️ Data sent before Submit',
      dark_pattern: `🎭 Dark Pattern: ${finding.detail?.name || ''}`,
      fingerprint: `👁️ Fingerprinting: ${finding.detail?.kind || ''}`,
      cookie: finding.detail?.verdict === 'fail' ? '❌ Reject All ignored' : finding.detail?.verdict === 'partial' ? '⚠️ Cookies set after rejection' : '✅ Cookie rejection respected',
    };
    const bodies = {
      tracker: `<strong>${finding.detail?.cat}</strong> — ${finding.detail?.dpdpa ? 'DPDPA-relevant. ' : ''}Recording your activity.`,
      leak: `Field <strong>${finding.detail?.fieldId}</strong> → <strong>${finding.detail?.domain}</strong>${finding.detail?.thirdParty ? ' (external!)' : ''}`,
      dark_pattern: finding.detail?.preview || '',
      fingerprint: `Browser ${finding.detail?.kind} fingerprinting detected.`,
      cookie: finding.detail?.verdict === 'fail'
        ? `${finding.detail?.newTracking?.length} tracking cookie(s) set anyway: <strong>${(finding.detail?.newTracking||[]).slice(0,3).join(', ')}</strong>`
        : finding.detail?.verdict === 'partial'
        ? `${finding.detail?.newAll?.length} cookie(s) appeared after rejection.`
        : 'No new cookies set after rejecting.',
    };

    const el = document.createElement('div');
    el.className = 'pm-n';
    el.setAttribute('data-s', level);
    el.innerHTML = `<div class="pm-nt"><span class="pm-ntitle">${titles[finding.type]||finding.type}</span><button class="pm-nx">✕</button></div><div class="pm-nb">${bodies[finding.type]||''}</div><div class="pm-bar"></div>`;
    stack.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));

    function dismiss() { el.classList.remove('in'); el.classList.add('out'); setTimeout(() => el.remove(), 250); }
    el.querySelector('.pm-nx').addEventListener('click', dismiss);
    const t = setTimeout(dismiss, 6000);
    el.querySelector('.pm-bar').addEventListener('animationend', () => { clearTimeout(t); dismiss(); });
  }

  // ══════════════════════════════════════════════════════
  // MODULE 1 — FORM LEAK DETECTION
  // ══════════════════════════════════════════════════════
  const fieldValues = new Map();

  function isSensitive(input) {
    const a = [input.type, input.name, input.id, input.placeholder, input.autocomplete].join(' ').toLowerCase();
    return /email|phone|mobile|tel|name|address|password|dob|birth|credit|card|cvv|pan|aadhaar|aadhar|ifsc|upi|pincode|zip|salary|income/.test(a);
  }

  function maskValue(v, type) {
    if (!v) return '';
    if (type === 'password') return '••••••••';
    if (type === 'email') { const [l,d] = v.split('@'); return (l||'').slice(0,2)+'***@'+(d||'?'); }
    if (v.length <= 4) return '••••';
    return v.slice(0,2) + '•'.repeat(Math.min(v.length-4,8)) + v.slice(-2);
  }

  function checkPayload(rawBody, destUrl) {
    const payload = decodeURIComponent(typeof rawBody === 'string' ? rawBody : '').toLowerCase();
    let destHost;
    try { destHost = new URL(destUrl, location.href).hostname; } catch { destHost = destUrl.slice(0,40); }
    const isTP = isThirdParty(destUrl);
    fieldValues.forEach((data, id) => {
      if (!data.value || data.value.length < 3) return;
      const v = data.value.toLowerCase();
      if (!payload.includes(v) && !(v.length > 6 && payload.includes(v.slice(0,6)))) return;
      once('leak:'+id+':'+destHost, () => {
        const finding = makeFinding(FINDING_TYPE.LEAK, isTP ? SEV.CRITICAL : SEV.WARNING, {
          fieldId: id, maskedValue: maskValue(data.value, data.fieldType),
          domain: destHost, thirdParty: isTP,
        });
        reportFinding(finding);
      });
    });
  }

  // Patch fetch & XHR as secondary layer (background webRequest is primary)
  const _fetch = window.fetch;
  window.fetch = function(input, init={}) {
    const url = typeof input === 'string' ? input : input?.url;
    if (init.body && url) checkPayload(init.body, url);
    return _fetch.apply(this, [input, init]);
  };

  const _xhrOpen = XMLHttpRequest.prototype.open;
  const _xhrSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(m, url, ...r) { this._pmUrl = url; return _xhrOpen.apply(this,[m,url,...r]); };
  XMLHttpRequest.prototype.send = function(body) { if (body && this._pmUrl) checkPayload(body, this._pmUrl); return _xhrSend.apply(this,[body]); };

  function watchField(input) {
    if (input._pmWatched || !isSensitive(input)) return;
    input._pmWatched = true;
    const id = input.id || input.name || input.placeholder || input.type || 'field';
    const type = input.type || 'text';
    const update = () => fieldValues.set(id, { value: input.value, fieldType: type });
    input.addEventListener('input', update);
    input.addEventListener('change', update);
  }

  function scanFields() { document.querySelectorAll('input,textarea').forEach(watchField); }
  function observeFields() {
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType !== 1) return;
      if (n.tagName === 'INPUT' || n.tagName === 'TEXTAREA') watchField(n);
      n.querySelectorAll?.('input,textarea').forEach(watchField);
    }))).observe(document.documentElement, { childList:true, subtree:true });
  }

  // ══════════════════════════════════════════════════════
  // MODULE 2 — DARK PATTERN DETECTION
  // ══════════════════════════════════════════════════════
  document.addEventListener('click', e => { if (e.target.type === 'checkbox') e.target._pmUserChecked = true; }, true);

  const DP_CHECKS = [
    {
      name: 'Pre-checked consent',
      level: SEV.CRITICAL,
      run() {
        const re = /newsletter|offer|deal|promotion|marketing|subscribe|partner|third.?party/i;
        return [...document.querySelectorAll('input[type="checkbox"]:checked')]
          .filter(cb => !cb._pmUserChecked)
          .filter(cb => {
            const label = cb.closest('label') || document.querySelector(`label[for="${cb.id}"]`);
            return re.test((label || cb.parentElement || cb).textContent);
          });
      },
      message: () => 'Consent box was pre-checked. Under DPDPA 2023, consent must be your active choice.',
    },
    {
      name: 'Confirmshaming',
      level: SEV.WARNING,
      run() {
        const re = /no,?\s+i\s+don'?t\s+want|no\s+thanks?,?\s+i\s+(hate|prefer|don'?t)|i\s+don'?t\s+want\s+to\s+(save|get|receive)|नहीं.{0,20}(चाहिए|पसंद)/i;
        return [...document.querySelectorAll('a,button,[role="button"]')].filter(el => re.test(el.textContent.trim()));
      },
      message: el => `"${el.textContent.trim().slice(0,55)}" — guilt-trip language on decline button.`,
    },
    {
      name: 'Fake urgency',
      level: SEV.WARNING,
      run() {
        const re = /only\s+\d+\s+(seat|room|item|ticket|left|spot)|selling\s+fast|almost\s+gone|\d+\s+people?\s+(are\s+|)(viewing|watching)|सीमित.{0,10}समय|जल्दी\s+करें/i;
        const found = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = walker.nextNode())) {
          if (re.test(n.textContent) && n.parentElement && !n.parentElement._pmDp) found.push(n.parentElement);
        }
        return found;
      },
      message: el => `"${el.textContent.trim().slice(0,55)}" — artificial scarcity/urgency.`,
    },
    {
      name: 'Hidden cost',
      level: SEV.WARNING,
      run() {
        const re = /convenience\s+fee|platform\s+fee|service\s+charge|booking\s+fee|handling\s+charge|processing\s+fee/i;
        const found = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = walker.nextNode())) {
          if (re.test(n.textContent) && n.parentElement && !n.parentElement._pmDp) found.push(n.parentElement);
        }
        return found;
      },
      message: el => `"${el.textContent.trim().slice(0,55)}" — E-Commerce Rules require upfront price disclosure.`,
    },
    {
      name: 'Oversized accept button',
      level: SEV.CRITICAL,
      run() {
        const accept = /\b(accept\s+all|allow\s+all|agree|ok,?\s*continue)\b/i;
        const reject = /\b(reject\s+all|decline|refuse|no\s+thanks?|only\s+necessary)\b/i;
        const btns = [...document.querySelectorAll('button,a,[role="button"]')];
        const aBtn = btns.find(b => accept.test(b.textContent));
        const rBtn = btns.find(b => reject.test(b.textContent));
        if (!aBtn || !rBtn) return [];
        const aA = aBtn.getBoundingClientRect().width * aBtn.getBoundingClientRect().height;
        const rA = rBtn.getBoundingClientRect().width * rBtn.getBoundingClientRect().height;
        return aA > rA * 2.5 ? [rBtn] : [];
      },
      message: () => 'Reject button is much smaller than Accept — deliberate misdirection.',
    },
  ];

  function runDarkPatterns() {
    DP_CHECKS.forEach(check => {
      let elements;
      try { elements = check.run(); } catch { return; }
      elements.forEach(el => {
        if (!el || !document.contains(el) || el._pmDp) return;
        el._pmDp = true;
        el.classList.add('pm-hl');
        if (check.level === SEV.WARNING) el.setAttribute('data-w', '');
        const preview = el.textContent.trim().slice(0, 60);
        once('dp:'+check.name+':'+preview, () => {
          reportFinding(makeFinding(FINDING_TYPE.DARK_PATTERN, check.level, {
            name: check.name, level: check.level, preview, message: check.message(el),
          }));
        });
      });
    });
  }

  // ══════════════════════════════════════════════════════
  // MODULE 3 — FINGERPRINT DETECTION
  // ══════════════════════════════════════════════════════
  function detectFingerprinting() {
    // Canvas fingerprinting
    const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
    const origGetImageData = CanvasRenderingContext2D.prototype.getImageData;

    HTMLCanvasElement.prototype.toDataURL = function(...args) {
      once('fp:canvas', () => {
        reportFinding(makeFinding(FINDING_TYPE.FINGERPRINT, SEV.CRITICAL, { kind: 'canvas', method: 'toDataURL' }));
      });
      return origToDataURL.apply(this, args);
    };

    CanvasRenderingContext2D.prototype.getImageData = function(...args) {
      once('fp:canvas:getImageData', () => {
        reportFinding(makeFinding(FINDING_TYPE.FINGERPRINT, SEV.CRITICAL, { kind: 'canvas', method: 'getImageData' }));
      });
      return origGetImageData.apply(this, args);
    };

    // WebGL fingerprinting
    const origGetParam = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(param) {
      // UNMASKED_VENDOR_WEBGL = 37445, UNMASKED_RENDERER_WEBGL = 37446
      if (param === 37445 || param === 37446) {
        once('fp:webgl', () => {
          reportFinding(makeFinding(FINDING_TYPE.FINGERPRINT, SEV.CRITICAL, { kind: 'webgl', method: 'getParameter' }));
        });
      }
      return origGetParam.apply(this, [param]);
    };

    // Font enumeration fingerprinting
    if (document.fonts && document.fonts.check) {
      let fontCheckCount = 0;
      const origCheck = document.fonts.check.bind(document.fonts);
      document.fonts.check = function(...args) {
        fontCheckCount++;
        if (fontCheckCount > 10) {
          once('fp:font', () => {
            reportFinding(makeFinding(FINDING_TYPE.FINGERPRINT, SEV.WARNING, { kind: 'font', method: 'fonts.check', count: fontCheckCount }));
          });
        }
        return origCheck(...args);
      };
    }
  }

  // ══════════════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════════════
  function init() {
    ensureStyles();
    detectFingerprinting();
    scanFields();
    observeFields();

    if (document.body) {
      runDarkPatterns();
    } else {
      document.addEventListener('DOMContentLoaded', runDarkPatterns);
    }

    // Re-scan every 4s for SPAs and dynamically injected content
    setInterval(() => {
      scanFields();
      runDarkPatterns();
    }, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
