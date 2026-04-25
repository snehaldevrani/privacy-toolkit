// modules/trackerDB.js — v2
// Added: plainEnglish descriptions, blockDomains for declarativeNetRequest

export const TRACKER_DB = [
  // ── India-specific ────────────────────────────────────────────────────
  {
    name: 'CleverTap',
    domains: ['clevertap.com','wzrkt.com','aps.clevrtap.com'],
    blockDomains: ['clevertap.com','wzrkt.com'],
    risk: 'high', cat: 'India CRM', dpdpa: true,
    plainEnglish: 'CleverTap tracks everything you tap and scroll on this app. It reports your behaviour back to the company so they can target you with push notifications and offers.',
  },
  {
    name: 'WebEngage',
    domains: ['webengage.com','wepushnotif.com'],
    blockDomains: ['webengage.com','wepushnotif.com'],
    risk: 'high', cat: 'India CRM', dpdpa: true,
    plainEnglish: 'WebEngage records your activity on this site and builds a profile of you. It\'s used to send you personalised marketing without you realising your behaviour was being watched.',
  },
  {
    name: 'MoEngage',
    domains: ['moengage.com','cdn.moengage.com','moe-edge.com'],
    blockDomains: ['moengage.com','moe-edge.com'],
    risk: 'high', cat: 'India CRM', dpdpa: true,
    plainEnglish: 'MoEngage is watching what you browse, click, and buy. This data is used to send you targeted notifications and emails — even after you leave the site.',
  },
  {
    name: 'Netcore/Smartech',
    domains: ['netcoresmartech.com','smartech.co.in','pepipost.com'],
    blockDomains: ['netcoresmartech.com','smartech.co.in'],
    risk: 'high', cat: 'India CRM', dpdpa: true,
    plainEnglish: 'Netcore collects your browsing behaviour to build a marketing profile. Your activity on this site is being shared with their servers.',
  },
  {
    name: 'InMobi',
    domains: ['inmobi.com','cf.id.inmobi.com','inappsdk.com'],
    blockDomains: ['inmobi.com','cf.id.inmobi.com'],
    risk: 'high', cat: 'India Ad Net.', dpdpa: true,
    plainEnglish: 'InMobi is one of India\'s largest ad networks. It\'s tracking you here to show you targeted ads across other apps and websites you visit.',
  },
  {
    name: 'Kaleyra',
    domains: ['kaleyra.com'],
    blockDomains: ['kaleyra.com'],
    risk: 'medium', cat: 'India Messaging', dpdpa: false,
    plainEnglish: 'Kaleyra is a messaging platform that may be collecting your contact details or session data for communication purposes.',
  },

  // ── Session Recorders ─────────────────────────────────────────────────
  {
    name: 'Hotjar',
    domains: ['hotjar.com','static.hotjar.com'],
    blockDomains: ['hotjar.com'],
    risk: 'high', cat: 'Session Rec.', dpdpa: false,
    plainEnglish: 'Hotjar is recording a video of everything you do on this page — every click, scroll, and mouse movement. Think of it as someone watching over your shoulder right now.',
  },
  {
    name: 'Microsoft Clarity',
    domains: ['clarity.ms','c.clarity.ms'],
    blockDomains: ['clarity.ms'],
    risk: 'high', cat: 'Session Rec.', dpdpa: false,
    plainEnglish: 'Microsoft Clarity is recording your entire session on this site. It captures where you click, how far you scroll, and what confuses you — and sends that to Microsoft.',
  },
  {
    name: 'FullStory',
    domains: ['fullstory.com','edge.fullstory.com'],
    blockDomains: ['fullstory.com'],
    risk: 'high', cat: 'Session Rec.', dpdpa: false,
    plainEnglish: 'FullStory records a complete replay of your session. Every action you take on this page is being captured and stored on their servers.',
  },
  {
    name: 'LogRocket',
    domains: ['logrocket.com','cdn.logrocket.io'],
    blockDomains: ['logrocket.com'],
    risk: 'high', cat: 'Session Rec.', dpdpa: false,
    plainEnglish: 'LogRocket is recording your session including what you type in forms, where you click, and what errors you see. This is a full session replay tool.',
  },

  // ── Ad Tracking ───────────────────────────────────────────────────────
  {
    name: 'Meta Pixel',
    domains: ['connect.facebook.net','graph.facebook.com'],
    blockDomains: ['connect.facebook.net'],
    risk: 'high', cat: 'Ad Tracking', dpdpa: false,
    plainEnglish: 'Facebook knows you visited this site — even if you didn\'t click anything. This data goes to Meta and is used to show you ads on Instagram and Facebook later.',
  },
  {
    name: 'Google Ads',
    domains: ['googleadservices.com','doubleclick.net','googlesyndication.com'],
    blockDomains: ['googleadservices.com','doubleclick.net'],
    risk: 'high', cat: 'Ad Tracking', dpdpa: false,
    plainEnglish: 'Google is tracking this visit to build your ad profile. This is why you see ads for things you\'ve searched or browsed follow you around the internet.',
  },
  {
    name: 'Criteo',
    domains: ['criteo.com','static.criteo.net'],
    blockDomains: ['criteo.com'],
    risk: 'high', cat: 'Ad Retargeting', dpdpa: false,
    plainEnglish: 'Criteo specialises in retargeting — showing you ads for products you\'ve looked at. It\'s recording what you view here to follow you with ads elsewhere.',
  },
  {
    name: 'Trade Desk',
    domains: ['adsrvr.org','thetradedesk.com'],
    blockDomains: ['adsrvr.org','thetradedesk.com'],
    risk: 'high', cat: 'Ad Tracking', dpdpa: false,
    plainEnglish: 'The Trade Desk is an advertising platform tracking your visit here. Your browsing data is being sold to advertisers who want to target people like you.',
  },
  {
    name: 'LinkedIn Insight',
    domains: ['snap.licdn.com'],
    blockDomains: ['snap.licdn.com'],
    risk: 'medium', cat: 'Ad Tracking', dpdpa: false,
    plainEnglish: 'LinkedIn knows you visited this site. They use this to show you targeted ads on LinkedIn and to help this site\'s advertisers reach professionals like you.',
  },
  {
    name: 'Taboola',
    domains: ['taboola.com','cdn.taboola.com'],
    blockDomains: ['taboola.com'],
    risk: 'high', cat: 'Content Ad', dpdpa: false,
    plainEnglish: 'Taboola powers those "recommended for you" article links at the bottom of news sites. It\'s tracking what you read to build a profile of your interests.',
  },
  {
    name: 'Outbrain',
    domains: ['outbrain.com','widgets.outbrain.com'],
    blockDomains: ['outbrain.com'],
    risk: 'high', cat: 'Content Ad', dpdpa: false,
    plainEnglish: 'Outbrain is tracking what content you read to build an interest profile. Like Taboola, it powers "sponsored" content links and shares your data with advertisers.',
  },

  // ── Analytics ─────────────────────────────────────────────────────────
  {
    name: 'Google Analytics',
    domains: ['google-analytics.com','googletagmanager.com'],
    blockDomains: ['google-analytics.com','googletagmanager.com'],
    risk: 'medium', cat: 'Analytics', dpdpa: false,
    plainEnglish: 'Google Analytics tells this website how you found them, what you clicked, and how long you stayed. That data also flows to Google and adds to your profile.',
  },
  {
    name: 'Mixpanel',
    domains: ['mixpanel.com','api.mixpanel.com'],
    blockDomains: ['mixpanel.com'],
    risk: 'medium', cat: 'Analytics', dpdpa: false,
    plainEnglish: 'Mixpanel tracks every action you take on this product — what buttons you click, what features you use, how often you come back.',
  },
  {
    name: 'Amplitude',
    domains: ['amplitude.com','api2.amplitude.com'],
    blockDomains: ['amplitude.com'],
    risk: 'medium', cat: 'Analytics', dpdpa: false,
    plainEnglish: 'Amplitude is recording your behaviour on this site to help the company understand how users like you interact with their product.',
  },
  {
    name: 'Segment',
    domains: ['segment.com','cdn.segment.com','api.segment.io'],
    blockDomains: ['segment.com','api.segment.io'],
    risk: 'high', cat: 'Data Pipeline', dpdpa: false,
    plainEnglish: 'Segment is a data pipeline that collects your activity here and forwards it to dozens of other tools — analytics, advertising, CRM. One tracker, many destinations.',
  },
  {
    name: 'Heap',
    domains: ['heap.io','heapanalytics.com'],
    blockDomains: ['heap.io','heapanalytics.com'],
    risk: 'medium', cat: 'Analytics', dpdpa: false,
    plainEnglish: 'Heap automatically records every click, tap, and swipe you make on this site — even things the developer didn\'t explicitly choose to track.',
  },

  // ── Fingerprinting ────────────────────────────────────────────────────
  {
    name: 'FingerprintJS',
    domains: ['fingerprintjs.com','fp.fingerprintjs.com','fpjs.io'],
    blockDomains: ['fingerprintjs.com','fpjs.io'],
    risk: 'high', cat: 'Fingerprinting', dpdpa: false,
    plainEnglish: 'FingerprintJS creates a unique ID for your device using technical details about your browser. This lets them identify you even if you clear cookies or use incognito.',
  },
  {
    name: 'MaxMind',
    domains: ['maxmind.com','geoip2.maxmind.com'],
    blockDomains: ['geoip2.maxmind.com'],
    risk: 'medium', cat: 'Geo Tracking', dpdpa: false,
    plainEnglish: 'MaxMind is looking up your precise location based on your IP address. Your city and approximate location is being logged for this visit.',
  },
];

export function matchTracker(url) {
  const s = url.toLowerCase();
  return TRACKER_DB.find(t => t.domains.some(d => s.includes(d))) || null;
}

export const SCORE_WEIGHTS = {
  tracker_high: 12,
  tracker_medium: 6,
  leak_thirdparty: 25,
  leak_samedomain: 8,
  darkpattern_critical: 15,
  darkpattern_warning: 8,
  fingerprint_canvas: 18,
  fingerprint_webgl: 14,
  fingerprint_font: 10,
  cookie_fail: 20,
  cookie_partial: 8,
};
