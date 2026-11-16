import { useRef, useState } from 'react'

import Result from './Result'
import { LockIcon } from './EmailChecker'
import { analyzeLink } from '../lib/checks'

const EXAMPLE = 'https://acme-okta.sso-help.net/login'

export default function LinkChecker({ onGo }) {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [notice, setNotice] = useState('')
  const resultRef = useRef(null)

  const check = (value) => {
    const checked = analyzeLink(value)
    if (!checked) {
      setResult(null)
      setNotice(
        value.trim()
          ? "That doesn't look like a link. Paste the full address, like https://example.com/page."
          : 'Paste a link first, or press "Try an example".'
      )
      return
    }
    setNotice('')
    setResult(checked)
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    check(url)
  }

  const handleExample = () => {
    setUrl(EXAMPLE)
    check(EXAMPLE)
  }

  const handleClear = () => {
    setUrl('')
    setResult(null)
    setNotice('')
  }

  return (
    <>
      <div className="hero">
        <p className="eyebrow">Link checker</p>
        <h1>Where does this link really go?</h1>
        <p className="lede">
          Paste a link from an email, text or QR code before you open it. Baitcheck shows the real
          website behind it and flags the tricks scammers use to disguise an address.
        </p>
      </div>

      <div className="why">
        <span>
          <b>Why bother?</b> In 2016, one shortened link in a fake Google alert led to a US campaign
          chairman's emails being published.
        </span>
        <button className="btn" type="button" onClick={() => onGo('news')}>
          See the stories →
        </button>
      </div>

      <section aria-label="Check a link">
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="url">
              Link to check{' '}
              <small>(copy it, don't click it: right-click or long-press, then "Copy link")</small>
            </label>
            <div className="linkrow">
              <input
                id="url"
                className="mono"
                type="text"
                inputMode="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder={EXAMPLE}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <button className="btn primary" type="submit">
                Check this link
              </button>
            </div>
          </div>
          <div className="actions">
            <button className="btn" type="button" onClick={handleExample}>
              Try an example
            </button>
            <button className="btn" type="button" onClick={handleClear}>
              Clear
            </button>
            <span className="privacy">
              <LockIcon />
              The link is only read, never opened.
            </span>
          </div>
        </form>

        <div ref={resultRef} aria-live="polite" style={{ scrollMarginTop: '5rem' }}>
          {notice && <p className="empty" style={{ marginTop: 18 }}>{notice}</p>}
          {result && <Result result={result} kind="link" />}
        </div>
      </section>
    </>
  )
}
