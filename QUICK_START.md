# Quick Start

## Load in Chrome

1. Open Chrome and go to chrome://extensions/
2. Toggle "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the privacy-monitor-fixed folder
5. The extension icon should appear in your toolbar

## Test Core Functionality

### Popup
Click the extension icon. You should see:
- Privacy score ring (0-100)
- Plain / Dev mode toggle
- Current site name and URL
- Findings sections (Trackers, Leaks, Dark Patterns, Fingerprinting)
- Counts per category

### Tracking Detection
1. Visit amazon.in and wait 2 seconds
2. Click the extension icon
3. You should see at least 2-3 trackers (CleverTap, Meta Pixel, etc.)
4. Toggle Plain mode: shows traffic light + plain English explanations
5. Toggle Dev mode: shows letter grades + technical details

### Blocking
1. On amazon.in, find a tracker in the list
2. Click the Block button - it should change to Unblock
3. Reload the page (Ctrl+R) - that tracker should not appear again

### History Dashboard
1. Visit 3-5 sites (mix of tracker-heavy and clean):
   - amazon.in
   - wikipedia.org
   - youtube.com
   - github.com
2. Right-click the extension icon and choose "Open in full page",
   or navigate to: chrome-extension://[ID]/pages/history.html
   (find [ID] on chrome://extensions/)
3. You should see:
   - Stats bar: sites visited, total trackers, cross-site trackers, average score
   - "Who followed you across sites" section (requires 2+ sites)
   - Site cards with colour-coded scores
   - Filter and search controls
4. Click any site card to open the detailed findings modal

### Notifications
Visit a tracker-heavy site. Within a few seconds you should see toast
notifications in the top-right corner of the page. They close automatically
after 6 seconds or when you click the X button.

## If Something Breaks

Open F12 -> Console on the affected page and look for red errors. Include
the error message, the URL you were testing on, and your Chrome version
when filing an issue.