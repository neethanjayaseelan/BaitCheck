import { useRef, useState } from 'react'

import Result from './Result'
import { analyzeEmail } from '../lib/checks'
import { combineScores, modelFinding, modelProbability } from '../lib/api'

const EXAMPLE = {
  from: 'Google <no-reply@google-security-alerts.com>',
  subject: 'Someone has your password',
  body: 'Hi John,\n\nSomeone just used your password to try to sign in to your Google Account.\n\nGoogle stopped this sign-in attempt. You should change your password immediately.\n\nCHANGE PASSWORD: http://bit.ly/3-example\n\nBest,\nThe Gmail Team',
}

const EMPTY = { from: '', subject: '', body: '' }

export function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export default function EmailChecker({ onGo }) {
  const [fields, setFields] = useState(EMPTY)
  const [result, setResult] = useState(null)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const resultRef = useRef(null)

  const update = (name) => (event) => setFields({ ...fields, [name]: event.target.value })

  const check = async (email) => {
    if (!email.from.trim() && !email.subject.trim() && !email.body.trim()) {
      setResult(null)
      setNotice('Paste the sender, subject or email text first, or press "Try an example".')
      return
    }
    setNotice('')
    setLoading(true)

    // Rules run in the browser. The trained model adds its opinion when the backend is running.
    const rules = analyzeEmail(email.from, email.subject, email.body)
    let checked
    try {
      const probability = await modelProbability(`${email.subject}\n${email.body}`.trim() || email.from)
      const score = combineScores(rules.score, probability)
      checked = {
        ...rules,
        score,
        findings: [...rules.findings, modelFinding(probability)],
        matches: score >= 20 ? rules.matches : [],
        sourceNote: 'Scored by the warning-sign rules and the trained model together.',
      }
    } catch (error) {
      console.error('Model unavailable, using rules only:', error)
      checked = {
        ...rules,
        sourceNote: "The trained model isn't running, so this score uses the warning-sign rules only.",
      }
    }

    setResult(checked)
    setLoading(false)
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    check(fields)
  }

  const handleExample = () => {
    setFields(EXAMPLE)
    check(EXAMPLE)
  }

  const handleClear = () => {
    setFields(EMPTY)
    setResult(null)
    setNotice('')
  }

  return (
    <>
      <div className="hero">
        <p className="eyebrow">Email checker</p>
        <h1>Is this email safe to click?</h1>
        <p className="lede">
          Paste a message you're not sure about. Baitcheck looks for the signs real scams use, scores
          the wording with a trained model, and tells you which famous attack used the same trick.
        </p>
      </div>

      <div className="why">
        <span>
          <b>Why bother?</b> Phishing has cost Facebook, Google and MGM around $100 million each.
          Every case started with one message someone trusted.
        </span>
        <button className="btn" type="button" onClick={() => onGo('news')}>
          See the stories →
        </button>
      </div>

      <section aria-label="Check an email">
        <form className="form" onSubmit={handleSubmit}>
          <div className="row2">
            <div className="field">
              <label htmlFor="from">
                Sender's email address <small>(the part in &lt; &gt;)</small>
              </label>
              <input
                id="from"
                className="mono"
                type="text"
                value={fields.from}
                onChange={update('from')}
                placeholder="no-reply@google-security-alerts.com"
                autoComplete="off"
                spellCheck="false"
              />
            </div>
            <div className="field">
              <label htmlFor="subject">Subject line</label>
              <input
                id="subject"
                type="text"
                value={fields.subject}
                onChange={update('subject')}
                placeholder="Someone has your password"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="body">
              Email text and links <small>(paste the whole thing)</small>
            </label>
            <textarea
              id="body"
              value={fields.body}
              onChange={update('body')}
              placeholder="Someone just used your password to try to sign in..."
            />
          </div>
          <div className="actions">
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? 'Checking…' : 'Check this email'}
            </button>
            <button className="btn" type="button" onClick={handleExample} disabled={loading}>
              Try an example
            </button>
            <button className="btn" type="button" onClick={handleClear}>
              Clear
            </button>
            <span className="privacy">
              <LockIcon />
              Checked on your own computer. Nothing is sent to the internet.
            </span>
          </div>
        </form>

        <div ref={resultRef} aria-live="polite" style={{ scrollMarginTop: '5rem' }}>
          {notice && <p className="empty" style={{ marginTop: 18 }}>{notice}</p>}
          {result && <Result result={result} kind="email" />}
        </div>
      </section>
    </>
  )
}
