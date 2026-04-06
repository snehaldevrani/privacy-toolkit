// modules/trackerDB.js
export const TRACKER_DB = [
  // India-specific
  { name:'CleverTap',        domains:['clevertap.com','wzrkt.com','aps.clevrtap.com'],                    risk:'high',   cat:'India CRM',       dpdpa:true  },
  { name:'WebEngage',        domains:['webengage.com','wepushnotif.com'],                                  risk:'high',   cat:'India CRM',       dpdpa:true  },
  { name:'MoEngage',         domains:['moengage.com','cdn.moengage.com','moe-edge.com'],                   risk:'high',   cat:'India CRM',       dpdpa:true  },
  { name:'Netcore/Smartech', domains:['netcoresmartech.com','smartech.co.in','pepipost.com'],              risk:'high',   cat:'India CRM',       dpdpa:true  },
  { name:'InMobi',           domains:['inmobi.com','cf.id.inmobi.com','inappsdk.com'],                     risk:'high',   cat:'India Ad Net.',    dpdpa:true  },
  { name:'Kaleyra',          domains:['kaleyra.com'],                                                       risk:'medium', cat:'India Messaging',  dpdpa:false },
  // Session recorders
  { name:'Hotjar',           domains:['hotjar.com','static.hotjar.com'],                                   risk:'high',   cat:'Session Rec.',     dpdpa:false },
  { name:'Microsoft Clarity',domains:['clarity.ms','c.clarity.ms'],                                        risk:'high',   cat:'Session Rec.',     dpdpa:false },
  { name:'FullStory',        domains:['fullstory.com','edge.fullstory.com'],                               risk:'high',   cat:'Session Rec.',     dpdpa:false },
  { name:'LogRocket',        domains:['logrocket.com','cdn.logrocket.io'],                                 risk:'high',   cat:'Session Rec.',     dpdpa:false },
  // Ad tracking
  { name:'Meta Pixel',       domains:['connect.facebook.net','graph.facebook.com'],                        risk:'high',   cat:'Ad Tracking',      dpdpa:false },
  { name:'Google Ads',       domains:['googleadservices.com','doubleclick.net','googlesyndication.com'],   risk:'high',   cat:'Ad Tracking',      dpdpa:false },
  { name:'Criteo',           domains:['criteo.com','static.criteo.net'],                                   risk:'high',   cat:'Ad Retargeting',   dpdpa:false },
  { name:'Trade Desk',       domains:['adsrvr.org','thetradedesk.com'],                                    risk:'high',   cat:'Ad Tracking',      dpdpa:false },
  { name:'LinkedIn Insight', domains:['snap.licdn.com'],                                                   risk:'medium', cat:'Ad Tracking',      dpdpa:false },
  { name:'Taboola',          domains:['taboola.com','cdn.taboola.com'],                                    risk:'high',   cat:'Content Ad',       dpdpa:false },
  { name:'Outbrain',         domains:['outbrain.com','widgets.outbrain.com'],                              risk:'high',   cat:'Content Ad',       dpdpa:false },
  // Analytics
  { name:'Google Analytics', domains:['google-analytics.com','googletagmanager.com'],                     risk:'medium', cat:'Analytics',         dpdpa:false },
  { name:'Mixpanel',         domains:['mixpanel.com','api.mixpanel.com'],                                  risk:'medium', cat:'Analytics',         dpdpa:false },
  { name:'Amplitude',        domains:['amplitude.com','api2.amplitude.com'],                               risk:'medium', cat:'Analytics',         dpdpa:false },
  { name:'Segment',          domains:['segment.com','cdn.segment.com','api.segment.io'],                   risk:'high',   cat:'Data Pipeline',     dpdpa:false },
  { name:'Heap',             domains:['heap.io','heapanalytics.com'],                                      risk:'medium', cat:'Analytics',         dpdpa:false },
  // Fingerprinting
  { name:'FingerprintJS',    domains:['fingerprintjs.com','fp.fingerprintjs.com','fpjs.io'],               risk:'high',   cat:'Fingerprinting',   dpdpa:false },
  { name:'MaxMind',          domains:['maxmind.com','geoip2.maxmind.com'],                                 risk:'medium', cat:'Geo Tracking',     dpdpa:false },
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
