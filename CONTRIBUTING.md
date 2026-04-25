# Contributing to Privacy Monitor

We're thrilled you want to help make the internet more private! Here's how:

## Code of Conduct

Be respectful, inclusive, and privacy-focused. No harassment, hate speech, or discrimination.

## Ways to Contribute

### 1. Report Issues
Found a tracker we missed? Privacy false alarm? File an issue:
- Title: Clear description
- Description: What page, what happened, expected vs actual
- Environment: OS, browser version, extension version

### 2. Add Tracker Detection
Spotted a new tracker? Add it to `modules/trackerDB.js`:

```javascript
{
  name: 'TrackingCo',
  domains: ['tracking.co', 'cdn.tracking.co'],
  blockDomains: ['tracking.co'],
  risk: 'high',  // 'high' or 'medium'
  cat: 'Analytics',
  dpdpa: false,  // Does it violate DPDPA?
  plainEnglish: 'TrackingCo is following you...',
}
```

**Requirements:**
- Evidence of tracking (screenshot, network request)
- Domain names confirmed
- Plain English description clear & accurate

### 3. Improve Detection
Add new detection patterns to `content.js`:
- Form leak detection
- Fingerprinting scripts
- Dark patterns
- Cookie violations

### 4. Translation
Help translate to Hindi, Tamil, Telugu, Kannada, Malayalam:
- UI strings
- Tracker descriptions
- Plain English explanations
- DPDPA guidance

### 5. Testing
- Test on different sites
- Test with different browsers
- Test blocking features
- Test history dashboard
- Report edge cases

### 6. Documentation
- Improve README
- Add tutorials
- Create video guides
- Document API

## Development Setup

```bash
# Clone repo
git clone https://github.com/yourusername/privacy-monitor.git
cd privacy-monitor

# Load in Chrome
1. chrome://extensions/
2. Developer mode ON
3. Load unpacked → select this folder
```

## Testing Your Changes

1. Make changes
2. Reload extension (chrome://extensions → Reload button)
3. Test on websites
4. Check console for errors (F12)
5. Verify no performance issues

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/tracker-xyz`
3. Make changes
4. Test thoroughly
5. Commit with clear message: `Add TrackingCo to tracker DB`
6. Push to your fork
7. Create Pull Request with:
   - Clear title
   - Description of changes
   - Why this matters
   - Testing confirmation
   - Screenshots if UI changes

## Coding Standards

### JavaScript
```javascript
// Use descriptive names
const isTracker = domain.includes('track');

// Add comments for complex logic
// Calculate penalty based on risk level
const penalty = f.detail?.risk === 'high' ? 15 : 10;

// Handle errors gracefully
try {
  const data = JSON.parse(json);
} catch (e) {
  console.warn('Parse error:', e);
}
```

### Comments
```javascript
// ── Section headers ────────────────────────────────
// Regular comments for code explanation
// TODO: improvements
// FIXME: known issues
```

## India-Specific Guidance

Since this is India-focused:
- Reference DPDPA 2023, not just GDPR
- Test with India-specific trackers (CleverTap, WebEngage, etc.)
- Use Indian examples in docs
- Link to Indian privacy resources
- Consider data sovereignty issues

## Tracker Database Standards

For new trackers, include:

1. **Confirmed tracking**: Link to tracker's privacy policy OR network evidence
2. **Block domains**: Which domains actually do tracking (vs delivery networks)
3. **Plain English**: Non-technical users should understand the risk
4. **Risk level**: High (selling data) vs Medium (analytics only)
5. **Category**: Analytics, Ad Network, Session Recorder, CRM, etc.
6. **DPDPA status**: Does it violate India's privacy law?

## Privacy Standards

Remember: **This extension protects privacy. Your contributions should too.**

- Don't collect user data
- Don't add telemetry without explicit opt-in
- Test that no data leaves users' devices
- Respect user consent
- Be transparent about what you detect

## Recognition

Contributors are recognized in:
- README.md
- GitHub releases
- Twitter acknowledgments

## Questions?

- Open a discussion
- Email: hello@privacymonitor.in
- Twitter: @PrivacyMonitor

---

**Together, let's make privacy the default.**
