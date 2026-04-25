const FINDING_TYPE = {TRACKER:'tracker',LEAK:'leak',DARK_PATTERN:'dark_pattern',FINGERPRINT:'fingerprint',COOKIE:'cookie'};

let allSites = {};
let crossSiteTrackers = [];
let blockedTrackers = new Set();
let currentFilter = 'all';
let searchQuery = '';

function scoreColor(s){if(s>=80)return'#22c55e';if(s>=60)return'#f59e0b';if(s>=40)return'#ef4444';return'#a855f7';}
function scoreGrade(s){if(s>=80)return'A';if(s>=60)return'B';if(s>=40)return'C';if(s>=20)return'D';return'F';}
function timeAgo(ts){const d=Date.now()-ts;if(d<60000)return'just now';if(d<3600000)return Math.floor(d/60000)+'m ago';if(d<86400000)return Math.floor(d/3600000)+'h ago';return Math.floor(d/86400000)+'d ago';}

// ── Cross-site tracker section ─────────────────────────────────────────────
function renderCrossSite(trackers, totalSites) {
  if (!trackers || trackers.length === 0) {
    const needed = Math.max(0, 2 - totalSites);
    document.getElementById('crossSiteContent').innerHTML =
      `<div class="cross-empty">Visit ${needed} more site${needed!==1?'s':''} to see cross-site tracking analysis.</div>`;
    return;
  }

  const html = trackers.slice(0, 5).map(t => {
    const pct = Math.round((t.siteCount / t.totalSites) * 100);
    const isBlocked = blockedTrackers.has(t.name);
    const headline = `${t.name} followed you across <strong>${t.siteCount} of ${t.totalSites}</strong> sites you visited (${pct}% of your browsing).`;
    return `
      <div class="cross-card">
        <div class="cross-card-top">
          <span class="cross-tracker-name">${t.name}</span>
          <span class="cross-count-badge">${t.siteCount}/${t.totalSites} sites</span>
        </div>
        <div class="cross-headline">🔴 ${headline}</div>
        <div class="cross-sites">
          ${t.sites.slice(0,8).map(s=>`<span class="cross-site-pill">${s}</span>`).join('')}
          ${t.sites.length>8?`<span class="cross-site-pill">+${t.sites.length-8} more</span>`:''}
        </div>
        <button class="cross-block-btn ${isBlocked?'blocked':''}" data-tracker="${t.name}" data-blocked="${isBlocked}">
          ${isBlocked ? '✓ Blocked everywhere' : `🚫 Block ${t.name} everywhere`}
        </button>
      </div>`;
  }).join('');

  document.getElementById('crossSiteContent').innerHTML = html;

  // Bind block buttons
  document.querySelectorAll('.cross-block-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.tracker;
      const isBlocked = btn.dataset.blocked === 'true';
      btn.disabled = true;
      btn.textContent = '⏳';
      if (isBlocked) {
        chrome.runtime.sendMessage({ type: 'UNBLOCK_TRACKER', trackerName: name }, () => load());
      } else {
        // Find blockDomains from sites data
        let blockDomains = [];
        Object.values(allSites).forEach(record => {
          record.findings.filter(f=>f.type===FINDING_TYPE.TRACKER&&f.detail?.name===name).forEach(f=>{
            if(f.detail?.blockDomains) blockDomains = f.detail.blockDomains;
          });
        });
        chrome.runtime.sendMessage({ type: 'BLOCK_TRACKER', trackerName: name, blockDomains }, () => load());
      }
    });
  });
}

// ── Stats ──────────────────────────────────────────────────────────────────
function renderStats(sites, crossSite) {
  const arr = Object.values(sites);
  const totalTrackers = arr.reduce((s,r)=>s+r.findings.filter(f=>f.type===FINDING_TYPE.TRACKER).length,0);
  const crossCount = crossSite?.length || 0;
  const avgScore = arr.length ? Math.round(arr.reduce((s,r)=>s+r.score,0)/arr.length) : 100;
  document.getElementById('statSites').textContent = arr.length;
  document.getElementById('statTrackers').textContent = totalTrackers;
  document.getElementById('statCross').textContent = crossCount;
  const el = document.getElementById('statAvg');
  el.textContent = avgScore;
  el.style.color = scoreColor(avgScore);
}

// ── Filter + Grid ──────────────────────────────────────────────────────────
function filterSites(sites) {
  return Object.values(sites).filter(r => {
    if (searchQuery && !r.hostname.includes(searchQuery)) return false;
    if (currentFilter==='risky') return r.score<60;
    if (currentFilter==='trackers') return r.findings.some(f=>f.type===FINDING_TYPE.TRACKER);
    if (currentFilter==='leaks') return r.findings.some(f=>f.type===FINDING_TYPE.LEAK);
    if (currentFilter==='darkpatterns') return r.findings.some(f=>f.type===FINDING_TYPE.DARK_PATTERN);
    return true;
  }).sort((a,b)=>a.score-b.score);
}

function renderGrid() {
  const grid = document.getElementById('sitesGrid');
  const filtered = filterSites(allSites);
  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><div>No sites match this filter.</div></div>`;
    return;
  }
  grid.innerHTML = '';
  filtered.forEach(r => grid.appendChild(makeCard(r)));
}

function makeCard(record) {
  const s = record.score;
  const color = scoreColor(s);
  const trackers = record.findings.filter(f=>f.type===FINDING_TYPE.TRACKER);
  const leaks    = record.findings.filter(f=>f.type===FINDING_TYPE.LEAK);
  const dps      = record.findings.filter(f=>f.type===FINDING_TYPE.DARK_PATTERN);
  const fps      = record.findings.filter(f=>f.type===FINDING_TYPE.FINGERPRINT);

  const pills = [
    trackers.length?`<span class="pill pill-red">📡 ${trackers.length} tracker${trackers.length>1?'s':''}</span>`:'',
    leaks.length?`<span class="pill pill-amber">⚠️ ${leaks.length} leak${leaks.length>1?'s':''}</span>`:'',
    dps.length?`<span class="pill pill-purple">🎭 ${dps.length} pattern${dps.length>1?'s':''}</span>`:'',
    fps.length?`<span class="pill pill-blue">👁️ fingerprinted</span>`:'',
    (!trackers.length&&!leaks.length&&!dps.length&&!fps.length)?`<span class="pill pill-green">✓ Clean</span>`:'',
  ].join('');

  const div = document.createElement('div');
  div.className = 'site-card';
  div.innerHTML = `
    <div class="site-card-top">
      <div class="score-badge" style="color:${color};border-color:${color};background:${color}18">${scoreGrade(s)}</div>
      <div style="flex:1;min-width:0">
        <div class="site-name">${record.hostname}</div>
        <div class="site-date">Score ${s}/100 · ${timeAgo(record.lastVisit)}</div>
      </div>
    </div>
    <div class="site-pills">${pills}</div>`;
  div.addEventListener('click', () => openModal(record));
  return div;
}

// ── Modal ──────────────────────────────────────────────────────────────────
function openModal(record) {
  document.getElementById('modalTitle').textContent = record.hostname;
  const s = record.score;
  const color = scoreColor(s);
  const trackers = record.findings.filter(f=>f.type===FINDING_TYPE.TRACKER);
  const leaks    = record.findings.filter(f=>f.type===FINDING_TYPE.LEAK);
  const dps      = record.findings.filter(f=>f.type===FINDING_TYPE.DARK_PATTERN);
  const fps      = record.findings.filter(f=>f.type===FINDING_TYPE.FINGERPRINT);

  function group(title, items, render) {
    if (!items.length) return '';
    return `<div class="finding-group"><div class="fg-title">${title} (${items.length})</div>${items.map(render).join('')}</div>`;
  }

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-score-row">
      <div class="modal-score-num" style="color:${color}">${s}</div>
      <div>
        <div style="font-size:14px;font-weight:600;color:${color}">${scoreGrade(s)} Grade</div>
        <div style="font-size:11px;color:#374151">Last visited ${timeAgo(record.lastVisit)}</div>
        ${record.cookieAudit?`<div style="font-size:11px;margin-top:4px;color:${record.cookieAudit.verdict==='fail'?'#fca5a5':record.cookieAudit.verdict==='partial'?'#fde68a':'#86efac'}">Cookie audit: ${record.cookieAudit.verdict.toUpperCase()}</div>`:''}
      </div>
    </div>
    ${group('Trackers',trackers,f=>`
      <div class="fi">
        <div class="fi-left">
          <div>${f.detail?.name||'?'} <span style="color:#374151">(${f.detail?.cat||''})</span></div>
          <div class="fi-explain">${f.detail?.plainEnglish||''}</div>
        </div>
        <span class="pill ${f.detail?.risk==='high'?'pill-red':'pill-amber'}">${f.detail?.risk||'?'}</span>
      </div>`)}
    ${group('Form Leaks',leaks,f=>`
      <div class="fi">
        <div class="fi-left">
          <div>${f.detail?.fieldId||'field'} → ${f.detail?.domain||'?'}</div>
          <div class="fi-explain">Sent before Submit${f.detail?.thirdParty?' to an external company':''}</div>
        </div>
        <span class="pill ${f.detail?.thirdParty?'pill-red':'pill-amber'}">${f.detail?.thirdParty?'3rd party':'same'}</span>
      </div>`)}
    ${group('Dark Patterns',dps,f=>`
      <div class="fi">
        <div class="fi-left">
          <div>${f.detail?.name||'?'}</div>
          <div class="fi-explain">${f.detail?.message||f.detail?.preview||''}</div>
        </div>
        <span class="pill ${f.severity==='critical'?'pill-red':'pill-amber'}">${f.severity}</span>
      </div>`)}
    ${group('Fingerprinting',fps,f=>`
      <div class="fi">
        <div class="fi-left">
          <div>${f.detail?.kind||'?'} fingerprinting</div>
          <div class="fi-explain">Unique device ID created without cookies via ${f.detail?.method||'browser APIs'}</div>
        </div>
        <span class="pill pill-blue">detected</span>
      </div>`)}
    ${!trackers.length&&!leaks.length&&!dps.length&&!fps.length?'<div style="color:#2d3748;font-style:italic;font-size:12px;padding:20px 0;text-align:center">No issues detected.</div>':''}
  `;
  document.getElementById('modalOverlay').classList.add('open');
}

document.getElementById('modalClose').addEventListener('click',()=>document.getElementById('modalOverlay').classList.remove('open'));
document.getElementById('modalOverlay').addEventListener('click',e=>{if(e.target===document.getElementById('modalOverlay'))document.getElementById('modalOverlay').classList.remove('open');});

document.querySelectorAll('.filter-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter=btn.dataset.filter;
    renderGrid();
  });
});

document.getElementById('searchBox').addEventListener('input',e=>{searchQuery=e.target.value.trim().toLowerCase();renderGrid();});

document.getElementById('clearAllBtn').addEventListener('click',()=>{
  if(!confirm('Clear all privacy history?'))return;
  chrome.runtime.sendMessage({type:'CLEAR_ALL'},()=>{allSites={};renderStats({},[]); renderCrossSite([]); renderGrid();});
});

function load() {
  chrome.runtime.sendMessage({type:'GET_ALL_DATA'},(data)=>{
    allSites = data?.sites || {};
    crossSiteTrackers = data?.crossSiteTrackers || [];
    blockedTrackers = new Set(data?.blockedTrackers || []);
    renderStats(allSites, crossSiteTrackers);
    renderCrossSite(crossSiteTrackers, Object.keys(allSites).length);
    if(!Object.keys(allSites).length){
      document.getElementById('sitesGrid').innerHTML='<div class="empty-state"><div class="empty-icon">🛡️</div><div>No sites analysed yet. Browse some websites and come back.</div></div>';
      return;
    }
    renderGrid();
  });
}

load();
setInterval(load, 5000);
