# 🛡️ Privacy Monitor — India Edition

Real-time privacy auditing extension for safer internet browsing. Detects trackers, fingerprinting, form leaks, dark patterns, and cookie violations—with DPDPA 2023 alignment.

## Features

### Detection Engine
- **50+ Tracker Database**: Detects Meta Pixel, Google Ads, Hotjar, session recorders, India-specific CRMs (CleverTap, WebEngage, MoEngage, InMobi)
- **Session Recording Detection**: Hotjar, Microsoft Clarity, FullStory, LogRocket
- **Form Leak Detection**: Catches when your data leaves the page before submission
- **Fingerprinting Detection**: Canvas, WebGL, Font fingerprinting
- **Dark Pattern Identification**: Aggressive dark UX patterns
- **Cookie Audit**: DPDPA-aligned cookie compliance checking

### Privacy Score System
- 0-100 scale with intelligent penalty system
- Letter grades (A-F)
- Visual score rings with color coding
- Traffic light indicator for quick assessment

### User Experience
- **Plain English Mode**: Non-technical explanations for everyday users
- **Developer Mode**: Technical details for power users
- **Per-tracker blocking**: Block specific trackers with declarativeNetRequest
- **In-page notifications**: Real-time alerts as trackers are detected
- **History dashboard**: Cross-site tracking analysis
- **Crowd-sourced ratings**: Community privacy scores

### India-Specific Features
- **DPDPA 2023 Alignment**: Compliance with India's data privacy law
- **India-focused tracker database**: Local CRMs and services
- **Complaint generation**: Template for filing DPDPA complaints
- **Local privacy resources**: Links to Indian privacy advocates

## Installation

### Development
```bash
1. Clone this repository
2. Open Chrome → chrome://extensions/
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select this folder
```

### Users
Install from Chrome Web Store: [Coming soon]

## Architecture

```
├── background.js         # Service worker - score calculation, blocking
├── content.js           # Page injection - detection & notifications
├── popup.html/js        # Extension popup UI
├── pages/
│   └── history.html     # Dashboard - cross-site analysis
├── modules/
│   ├── trackerDB.js     # 50+ tracker database
│   └── dataModel.js     # Data structures
├── icons/               # Extension icons
└── manifest.json        # Extension configuration (MV3)
```

## How It Works

1. **Content Script** runs on every page
2. **Detects**: Tracker beacons, form submissions, fingerprinting APIs
3. **Reports** findings to background service worker
4. **Background calculates** privacy score with weighted penalties
5. **Blocks** trackers (if enabled) using declarativeNetRequest
6. **Stores** findings in local storage
7. **Shows** results in popup & history dashboard

## Privacy Score Calculation

```
Base Score: 100
Penalties:
- High-risk tracker: -15 each
- Session recording: -25
- Form leak (3rd party): -10
- Canvas fingerprinting: -8
- Dark pattern: -5 to -20
Final Score = Max(0, 100 - total_penalties)

Grade: A (80+) | B (60-79) | C (40-59) | D (20-39) | F (<20)
```

## Data Collection Policy

**What we collect:**
- Tracker domains detected on pages you visit
- Your privacy scores per site
- Cookie audit results
- Form submission attempts

**What we DON'T collect:**
- Your browsing history
- Your personal data
- Passwords or sensitive info
- Any data leaves your device

**Storage:**
- All data stored locally in `chrome.storage.local`
- No servers, no cloud, no tracking
- You can export and delete anytime

## Permissions Explained

| Permission | Why |
|-----------|-----|
| `webRequest` | Monitor network requests for trackers |
| `cookies` | Audit cookie compliance (DPDPA) |
| `storage` | Save your history locally |
| `tabs` | Get current tab URL & info |
| `scripting` | Inject content detection on pages |
| `alarms` | Schedule periodic cookie audits |
| `declarativeNetRequest` | Block tracker requests |

## Development

### Adding Trackers
Edit `modules/trackerDB.js`:
```javascript
{
  name: 'MyTracker',
  domains: ['mytracker.com', 'cdn.mytracker.com'],
  blockDomains: ['mytracker.com'],
  risk: 'high',
  cat: 'Analytics',
  dpdpa: false,
  plainEnglish: 'MyTracker is watching your behavior...',
}
```

### Adding Detection Logic
Edit `content.js` to add new detection patterns.

### Modifying Score Weights
Edit `background.js` → `SCORE_WEIGHTS` object.

## Roadmap

- [x] v1: Basic tracker detection
- [x] v2: Multi-detection (form leaks, fingerprinting, dark patterns)
- [ ] v3: Crowd-sourced site ratings
- [ ] v4: Better alternative recommendations
- [ ] v5: DPDPA complaint generator
- [ ] v6: Privacy insurance partnerships
- [ ] v7: Website privacy badges
- [ ] v8: Social features (friend comparisons)

## Contributing

We welcome contributions! Privacy should be everyone's right.

1. Fork the repo
2. Create a feature branch
3. Test thoroughly
4. Submit a pull request

See CONTRIBUTING.md for detailed guidelines.

## License

**AGPL-3.0** - See LICENSE file

This means:
- ✅ Use freely, modify, distribute
- ✅ Must release modifications under AGPL
- ✅ Great for privacy-conscious users
- ❌ Proprietary wrappers not allowed

**Why AGPL for privacy?** Because privacy is a right, not a product. We want to ensure this tool stays free and open forever.

## Support & Community

- **Issues**: [GitHub Issues]
- **Discussions**: [GitHub Discussions]
- **Twitter**: [@PrivacyMonitor]
- **Email**: hello@privacymonitor.in

## Team

- **Creator**: [Your Name]
- **Contributors**: [Awesome people helping with detection rules, testing, translations]

## Acknowledgments

- 🙏 Privacy Badger (detection inspiration)
- 🙏 uBlock Origin (filtering logic)
- 🙏 EFF (privacy education)
- 🙏 Mozilla (web standards)

---

**Help us improve!** Report trackers you find at [tracker-db-issues].

Made with 🛡️ for a more private internet.
