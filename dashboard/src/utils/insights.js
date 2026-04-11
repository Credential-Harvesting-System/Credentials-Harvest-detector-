import { normalizeRisk } from "./alertHelpers.js";

const KEYWORDS = [
  "login",
  "verify",
  "secure",
  "account",
  "update",
  "password",
  "fake",
  "phish",
];

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Most frequent keyword from domains + reasons among suspicious alerts. */
export function mostDetectedKeyword(alerts) {
  const counts = new Map();
  const suspicious = alerts.filter((a) => normalizeRisk(a) !== "LOW");
  const corpus = suspicious.length ? suspicious : alerts;
  for (const a of corpus) {
    const words = new Set([
      ...tokenize(a.domain),
      ...tokenize(a.reason),
    ]);
    for (const w of words) {
      if (KEYWORDS.includes(w)) {
        counts.set(w, (counts.get(w) || 0) + 1);
      }
    }
  }
  let best = null;
  let max = 0;
  for (const [w, c] of counts) {
    if (c > max) {
      max = c;
      best = w;
    }
  }
  return best && max > 0 ? { word: best, count: max } : null;
}

/** Domain label that appears most among CRITICAL + MEDIUM. */
export function topSuspiciousDomainPattern(alerts) {
  const high = alerts.filter((r) => {
    const rk = normalizeRisk(r);
    return rk === "CRITICAL" || rk === "MEDIUM";
  });
  const counts = new Map();
  for (const a of high) {
    const d = String(a.domain || "").toLowerCase() || "(unknown)";
    counts.set(d, (counts.get(d) || 0) + 1);
  }
  let best = null;
  let max = 0;
  for (const [d, c] of counts) {
    if (c > max) {
      max = c;
      best = d;
    }
  }
  return best && max > 0 ? { domain: best, count: max } : null;
}
