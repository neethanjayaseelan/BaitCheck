// Shared analysis helpers. The regex patterns mirror backend/analyzer.py so the
// highlighted phrases match the indicators the API reports.

export const INDICATORS = {
  'Urgent language': {
    label: 'Pressure to act fast',
    pattern: /\b(urgent|act now|immediately|asap|limited time|final notice|now or never)\b/gi,
  },
  'Password request': {
    label: 'Asks for a login, password or code',
    pattern: /\b(password|login|code|verify|confirm|security question|account details|credentials)\b/gi,
  },
  'Suspicious links': {
    label: 'Contains links or link-style wording',
    pattern: /(https?|hxxps?):\/\/\S+|www\.\S+|click here|verify your|update your|confirm your/gi,
  },
  Impersonation: {
    label: 'Mentions a bank, brand or account team',
    pattern: /\b(bank|paypal|amazon|apple|microsoft|verification|security alert|account suspended|billing)\b/gi,
  },
}

export const HIGH_RISK = 0.7
export const MEDIUM_RISK = 0.4

export const riskLevel = (p) => (p > HIGH_RISK ? 'High' : p > MEDIUM_RISK ? 'Medium' : 'Low')

// Returns [{ indicator, phrases: [..unique matched text..] }] for every indicator found.
export function findIndicators(text) {
  return Object.entries(INDICATORS)
    .map(([indicator, { pattern }]) => {
      const phrases = [...new Set([...text.matchAll(pattern)].map((m) => m[0].toLowerCase()))]
      return { indicator, phrases }
    })
    .filter((item) => item.phrases.length > 0)
}

// Splits text into plain and highlighted segments, merging overlapping matches.
export function segmentText(text) {
  const ranges = []
  for (const [indicator, { pattern }] of Object.entries(INDICATORS)) {
    for (const m of text.matchAll(pattern)) {
      ranges.push({ start: m.index, end: m.index + m[0].length, indicator })
    }
  }
  ranges.sort((a, b) => a.start - b.start || b.end - a.end)

  const merged = []
  for (const r of ranges) {
    const last = merged[merged.length - 1]
    if (last && r.start < last.end) {
      last.end = Math.max(last.end, r.end)
      if (!last.indicators.includes(r.indicator)) last.indicators.push(r.indicator)
    } else {
      merged.push({ start: r.start, end: r.end, indicators: [r.indicator] })
    }
  }

  const segments = []
  let cursor = 0
  for (const r of merged) {
    if (r.start > cursor) segments.push({ text: text.slice(cursor, r.start) })
    segments.push({ text: text.slice(r.start, r.end), indicators: r.indicators })
    cursor = r.end
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) })
  return segments
}

// Keyword-only fallback used when the backend is not reachable.
export function analyzeLocally(text) {
  const found = findIndicators(text)
  const probability = Math.min(0.95, found.length * 0.24 + (text.length > 120 ? 0.04 : 0))
  return { probability, riskLevel: riskLevel(probability), source: 'rules' }
}
