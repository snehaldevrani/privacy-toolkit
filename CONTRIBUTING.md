# Contributing to Privacy Monitor

## Ways to Contribute

### 1. Report Issues
Found a tracker we missed, or a false alarm? File an issue with:
- A clear title
- What page you were on, what happened, what you expected
- Your OS, browser version, extension version

### 2. Add Tracker Detection
Add new entries to `modules/trackerDB.js`:

```javascript
{
  name: 'TrackingCo',
  domains: ['tracking.co', 'cdn.tracking.co'],
  blockDomains: ['tracking.co'],
  risk: 'high',  // 'high' or 'medium'
  cat: 'Analytics',
  dpdpa: false,
  plainEnglish: 'TrackingCo records your activity on this site.',
}
```

Requirements before submitting:
- Evidence of tracking (screenshot or network request)
- Domain names confirmed
- Plain English description is accurate and clear

### 3. Improve Detection Logic
Add new patterns to `content.js`:
- Form leak detection
- Fingerprinting scripts
- Dark patterns
- Cookie violations

### 4. Translation
Help translate UI strings and tracker descriptions to Hindi, Tamil, Telugu, Kannada, or Malayalam.

### 5. Testing
- Test on different sites and browsers
- Test blocking features
- Test the history dashboard
- Report edge cases

### 6. Documentation
Improve README, add tutorials, or document new APIs.

## Development Setup

```
1. git clone https://github.com/snehaldevrani/privacy-toolkit.git
2. cd privacy-monitor
3. Open chrome://extensions/
4. Enable Developer mode
5. Click "Load unpacked" and select this folder
```

## Testing Changes

1. Make your change
2. Reload extension (chrome://extensions -> Reload)
3. Test on relevant websites
4. Check console for errors (F12 -> Console)
5. Verify no performance regression

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b add-tracker-xyz`
3. Make and test your changes
4. Commit with a clear message: `Add TrackingCo to tracker DB`
5. Push and open a Pull Request with:
   - A clear title and description
   - Confirmation that you tested the change
   - Screenshots for UI changes

## Tracker Database Standards

For each new tracker entry, provide:
1. Confirmed tracking evidence (privacy policy link or network capture)
2. Correct block domains (only domains doing the tracking, not CDNs)
3. Plain English description a non-technical user can understand
4. Correct risk level: High (data sold/profiled) vs Medium (analytics only)
5. Category: Analytics, Ad Network, Session Recorder, CRM, etc.
6. DPDPA status: does it raise issues under India's data privacy law?

## India-Specific Notes

- Reference DPDPA 2023, not only GDPR, when describing legal implications
- Test with India-specific trackers (CleverTap, WebEngage, InMobi, etc.)
- Link to Indian privacy resources where relevant

## Code of Conduct

Be respectful and inclusive. No harassment, hate speech, or discrimination.