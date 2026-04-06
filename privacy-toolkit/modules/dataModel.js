// modules/dataModel.js
export const MSG = {
  FINDING:        'FINDING',
  GET_SITE_DATA:  'GET_SITE_DATA',
  GET_ALL_DATA:   'GET_ALL_DATA',
  COOKIE_BASELINE:'COOKIE_BASELINE',
  COOKIE_AUDIT:   'COOKIE_AUDIT',
  CLEAR_SITE:     'CLEAR_SITE',
  CLEAR_ALL:      'CLEAR_ALL',
};

export const FINDING_TYPE = {
  TRACKER:      'tracker',
  LEAK:         'leak',
  DARK_PATTERN: 'dark_pattern',
  FINGERPRINT:  'fingerprint',
  COOKIE:       'cookie',
};

export const SEV = {
  CRITICAL: 'critical',
  WARNING:  'warning',
  INFO:     'info',
};

export function makeFinding(type, severity, site, detail) {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    type, severity, site,
    timestamp: Date.now(),
    detail,
  };
}

export function makeSiteRecord(hostname) {
  return {
    hostname,
    score: 100,
    findings: [],
    firstVisit: Date.now(),
    lastVisit: Date.now(),
    cookieAudit: null,
  };
}
