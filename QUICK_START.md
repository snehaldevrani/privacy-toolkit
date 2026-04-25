# Quick Start — Test Your Extension Now

## 1. Load in Chrome (2 minutes)

```
1. Open Chrome
2. Go to: chrome://extensions/
3. Toggle "Developer mode" (top right)
4. Click "Load unpacked"
5. Select your privacy-monitor-fixed folder
6. Done! You should see the icon in your toolbar
```

## 2. Test Core Functionality (10 minutes)

### Test Popup:
```
1. Click extension icon in toolbar
2. You should see:
   ✓ Privacy score ring (0-100)
   ✓ "Plain" / "Dev" mode toggle
   ✓ Site name and URL
   ✓ Findings sections (Trackers, Leaks, Dark Patterns, Fingerprinting)
   ✓ Pills showing counts (📡 3 trackers, ⚠️ 1 leak, etc.)
```

### Test Tracking Detection:
```
1. Visit: amazon.in
2. Wait 2 seconds
3. Click extension icon
4. Should see at least 2-3 trackers (CleverTap, Meta Pixel, etc.)
5. Hover over "Plain" mode toggle
6. Toggle ON → should show traffic light + plain English explanations
7. Toggle OFF → should show letter grades + technical info
```

### Test Blocking:
```
1. Still on amazon.in
2. Find "Meta Pixel" tracker
3. Click "🚫 Block" button
4. Button should change to "✓ Unblock"
5. Reload page (Ctrl+R)
6. Meta Pixel should NOT appear again (check webRequest)
```

### Test History Dashboard:
```
1. Visit 3-5 different websites (mix of good & bad):
   ✓ amazon.in (lots of trackers)
   ✓ wikipedia.org (clean)
   ✓ medium.com (decent)
   ✓ youtube.com (lots of tracking)
   ✓ reddit.com (lots of tracking)

2. Right-click extension icon → "Open in full page" 
   OR go to: chrome-extension://[ID]/pages/history.html
   (Find [ID] in chrome://extensions/)

3. You should see:
   ✓ Stats bar: Sites visited, Total trackers, Cross-site, Average score
   ✓ "Who followed you across sites" section (need 2+ sites)
   ✓ Site cards showing scores (green A, yellow B, red C/D)
   ✓ Filters: All, Risky, Has Trackers, Has Leaks, Dark Patterns
   ✓ Search box working
   ✓ Click a card → modal opens with detailed findings

4. Test each section:
   - Click filter "Risky" → only shows sites with score <60
   - Search "amazon" → filters to amazon.in
   - Click site card → see all trackers/leaks/patterns for that site
   - Close modal (X or click outside)
```

### Test Notifications:
```
1. Visit: news24x7.com or similar tracking-heavy site
2. Wait 2 seconds
3. You should see in-page toast notifications (top right)
4. Notifications show:
   ✓ Tracker name (in red/yellow/blue)
   ✓ Close X button
   ✓ Auto-dismiss after 6 seconds
5. Click X → notification closes immediately
```

### Check Console for Errors:
```
1. With popup open, press F12
2. Go to "Console" tab
3. You should see:
   ✓ "[Privacy Monitor v2] Service worker started."
   ✓ NO red ❌ errors
   ✓ Maybe some yellow ⚠️ warnings (OK)
```

---

## 3. What to Look For (Debugging)

### ✅ Working Correctly If:
- Extension loads without errors
- Popup shows privacy score
- Tracker list populates on tracking sites
- History page loads history
- Cross-site section shows trackers appearing 2+ sites
- Blocking toggles work
- Notifications appear on pages

### ❌ Not Working If:
- Popup shows empty sections
- History page shows "Loading..." forever
- Cross-site section blank even after 5+ sites
- Blocking doesn't persist
- Console has red errors

### Debug Steps:

**If popup is blank:**
1. Right-click extension → Inspect popup
2. Open console
3. Look for errors
4. Check if chrome.storage is accessible

**If history page shows no sites:**
1. Open DevTools on history page
2. Console should log data from background
3. Check if chrome.runtime.sendMessage works
4. Try visiting a site and immediately opening history

**If trackers not detected:**
1. Open DevTools on visited site
2. Network tab → look for tracker requests
3. Check if content.js is injected
4. Look at content script execution in background worker

---

## 4. First Improvements (Pick One)

### Option A: Add Export Button (Easiest - 30 min)
**File:** pages/history.html

Find:
```html
<div class="top-right">
    <button class="btn btn-danger" id="clearAllBtn">🗑 Clear All</button>
</div>
```

Replace with:
```html
<div class="top-right">
    <button class="btn" id="exportBtn" style="background:rgba(34,197,94,0.1);border-color:rgba(34,197,94,0.25);color:#86efac">📥 Export CSV</button>
    <button class="btn btn-danger" id="clearAllBtn">🗑 Clear All</button>
</div>
```

Then add before the `</script>` tag:
```javascript
document.getElementById('exportBtn').addEventListener('click', () => {
  let csv = 'Site,Score,Trackers,Leaks,Patterns,Fingerprints,Last Visit\n';
  Object.values(allSites).forEach(r => {
    const trackers = r.findings.filter(f=>f.type===FINDING_TYPE.TRACKER).length;
    const leaks = r.findings.filter(f=>f.type===FINDING_TYPE.LEAK).length;
    const dps = r.findings.filter(f=>f.type===FINDING_TYPE.DARK_PATTERN).length;
    const fps = r.findings.filter(f=>f.type===FINDING_TYPE.FINGERPRINT).length;
    const date = new Date(r.lastVisit).toISOString().split('T')[0];
    csv += `"${r.hostname}",${r.score},${trackers},${leaks},${dps},${fps},"${date}"\n`;
  });
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `privacy-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});
```

### Option B: Add Privacy Score Explanation (Medium - 1 hour)
Create `pages/scoring.html` explaining how scores are calculated.

### Option C: Add DPDPA Info Page (Easy - 45 min)
Create `pages/dpdpa.html` with your rights and how to file complaints.

---

## 5. Before Publishing

Run this checklist:

```
Code Quality:
☐ No console errors on real sites
☐ No unused code/imports
☐ Comments explain complex logic
☐ Consistent indentation

Functionality:
☐ Popup loads instantly
☐ History page loads within 2 seconds
☐ Blocking works after reload
☐ Notifications appear correctly
☐ Export works if added

Permissions:
☐ Only using permissions declared
☐ No overly broad permissions
☐ Explain why each permission needed

Privacy:
☐ No external API calls
☐ No user data leaves device
☐ All data in chrome.storage.local only
☐ Clear privacy policy

User Experience:
☐ Icons are clear
☐ Text is readable
☐ Dark mode consistent
☐ No layout breaks at any screen size
☐ Mobile responsive (if applicable)
```

---

## 6. Common Issues & Fixes

### Issue: Popup shows no trackers on Amazon
**Solution:**
1. Visit amazon.in specifically (not .com)
2. Wait 3 seconds
3. Click icon
4. If still blank, check console for errors
5. Verify manifest has `<all_urls>` in webRequest filter

### Issue: History page shows "Loading..." forever
**Solution:**
1. Make sure you visited at least 1 site
2. Check chrome://extensions → Privacy Monitor → Details → Manage → Check "Allow access to file URLs" if needed
3. Reload history page
4. Check console for chrome.runtime.sendMessage errors

### Issue: Tracker blocking doesn't work
**Solution:**
1. Check if tracker shows "BLOCKED" label
2. Reload page
3. Check Network tab → blocked requests should return 0 bytes
4. If not blocking, check declarativeNetRequest rules in background

### Issue: "Unsafe inline" Content Security Policy error
**Solution:**
This is expected for chrome extensions. You can ignore yellow warnings. Only fix red errors.

---

## 7. You're Ready When:

- ✅ Extension loads without errors
- ✅ Detects trackers on tracking sites
- ✅ History page shows cross-site tracking
- ✅ Blocking works
- ✅ Notifications appear
- ✅ No red console errors

**You've got ~80% of a publishable extension already!**

Next steps:
1. Test thoroughly (1-2 hours)
2. Fix any bugs (1-2 hours)  
3. Create Chrome Store graphics (1 hour)
4. Write store description (30 min)
5. Submit to Chrome Web Store (15 min)

---

## 8. Testing URLs

Use these to verify everything works:

```
Testing Detection:
- amazon.in → Should show CleverTap + Meta Pixel
- youtube.com → Should show 5+ trackers
- facebook.com → Should show Meta infrastructure
- reddit.com → Should show Segment + Meta

Testing Clean Sites:
- wikipedia.org → Should be clean or near-clean
- duckduckgo.com → Should show minimal tracking

Testing Forms:
- Any ecommerce checkout → Test form leak detection
```

---

**Ready to test? Load it now!**

After testing, update us with:
- ✓ What worked
- ✗ What didn't
- 💡 Ideas for improvements
- 🐛 Bugs found

Happy privacy building! 🛡️
