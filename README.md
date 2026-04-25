# Privacy Monitor - India Edition

Real-time privacy auditing extension for Chrome. Detects trackers, fingerprinting, form leaks, dark patterns, and cookie violations with DPDPA 2023 alignment.

## Features

### Detection Engine
- **50+ Tracker Database**: Meta Pixel, Google Ads, Hotjar, session recorders, India-specific CRMs (CleverTap, WebEngage, MoEngage, InMobi)
- **Session Recording Detection**: Hotjar, Microsoft Clarity, FullStory, LogRocket
- **Form Leak Detection**: Catches when form data leaves the page before submission
- **Fingerprinting Detection**: Canvas, WebGL, and font fingerprinting
- **Dark Pattern Identification**: Aggressive dark UX patterns
- **Cookie Audit**: DPDPA-aligned cookie compliance checking

### Privacy Score System
- 0-100 scale with weighted penalty system
- Letter grades (A-F)
- Visual score rings with colour coding
- Traffic light indicator for quick assessment

### User Experience
- **Plain English Mode**: Non-technical explanations for everyday users
- **Developer Mode**: Technical details for power users
- **Per-tracker blocking**: Block specific trackers via declarativeNetRequest
- **In-page notifications**: Real-time alerts as trackers are detected
- **History dashboard**: Cross-site tracking analysis

### India-Specific Features
- **DPDPA 2023 Alignment**: Compliance with India's data privacy law
- **India-focused tracker database**: Local CRMs and ad networks
- **Complaint generation**: Template for filing DPDPA complaints
- **Local privacy resources**: Links to Indian privacy advocates

## Installation

### Development
1. Clone this repository
2. Open Chrome -> chrome://extensions/
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select this folder

### Users
Install from Chrome Web Store: [link to be added after review]

## Architecture

`
.
+-- background.js         # Service worker - score calculation, blocking
+-- content.js            # Page injection - detection & notifications
+-- popup.html/js         # Extension popup UI
+-- pages/
|   +-- history.html      # Dashboard - cross-site analysis
+-- modules/
|   +-- trackerDB.js      # 50+ tracker database
|   +-- dataModel.js      # Data structures
+-- icons/                # Extension icons
+-- manifest.json         # Extension configuration (MV3)
`

## How It Works

1. Content script runs on every page
2. Detects tracker beacons, form submissions, and fingerprinting APIs
3. Reports findings to the background service worker
4. Background calculates a privacy score with weighted penalties
5. Blocks trackers (if enabled) using declarativeNetRequest
6. Stores findings in local storage
7. Shows results in the popup and history dashboard

## Privacy Score Calculation

`
Base Score: 100
Penalties:
- High-risk tracker:      -15 each
- Session recording:      -25
- Form leak (3rd party):  -10
- Canvas fingerprinting:  -8
- Dark pattern:           -5 to -20
Final Score = Max(0, 100 - total_penalties)

Grade: A (80+) | B (60-79) | C (40-59) | D (20-39) | F (<20)
`

## Data Collection Policy

**Collected locally (never sent off-device):**
- Tracker domains detected on pages you visit
- Privacy scores per site
- Cookie audit results
- Form submission attempts

**Never collected:**
- Browsing history
- Personal data
- Passwords or sensitive information

**Storage:** All data is stored in chrome.storage.local. No servers, no cloud.

## Permissions

| Permission | Reason |
|---|---|
| webRequest | Monitor network requests for trackers |
| cookies | Audit cookie compliance (DPDPA) |
| storage | Save history locally |
| 	abs | Get current tab URL |
| scripting | Inject content detection on pages |
| larms | Schedule periodic cookie audits |
| declarativeNetRequest | Block tracker requests |

## Development

### Adding Trackers
Edit modules/trackerDB.js:
`javascript
{
  name: 'ExampleTracker',
  domains: ['example.com', 'cdn.example.com'],
  blockDomains: ['example.com'],
  risk: 'high',
  cat: 'Analytics',
  dpdpa: false,
  plainEnglish: 'ExampleTracker records your activity on this site.',
}
`

### Adding Detection Logic
Add new detection patterns to content.js.

### Modifying Score Weights
Edit the SCORE_WEIGHTS object in ackground.js.

## Roadmap

- [x] v1: Basic tracker detection
- [x] v2: Multi-detection (form leaks, fingerprinting, dark patterns, cookies)
- [ ] v3: Crowd-sourced site ratings
- [ ] v4: Privacy-friendly site recommendations
- [ ] v5: DPDPA complaint generator

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on reporting issues, adding trackers, improving detection logic, and translating the UI.

## License

AGPL-3.0 - see [LICENSE](LICENSE).