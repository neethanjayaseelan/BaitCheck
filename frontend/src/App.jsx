import { useState } from 'react'

import Header from './components/Header'
import MessageSheet from './components/MessageSheet'
import Verdict from './components/Verdict'
import Examples from './components/Examples'
import Findings from './components/Findings'
import HowItWorks from './components/HowItWorks'
import ScamNews from './components/ScamNews'
import { analyzeLocally, findIndicators, riskLevel } from './lib/analysis'

// Backend API base URL (set VITE_API_URL in frontend/.env to override)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Taken from data/phishingdata.csv (links are defanged with hxxp:// and [.])
const EXAMPLES = [
  { name: 'Mailbox full', text: 'Dear Customer, Your mailbox storage is full. You must re-validate your account immediately to avoid losing incoming messages. Visit hxxp://mailbox-upgrade-center[.]test to keep your account active.' },
  { name: 'Sign-in alert', text: 'Security Alert: We detected a sign-in attempt from an unknown device. If this was not you, confirm your account now at hxxp://account-review-secure[.]test.' },
  { name: 'Missed delivery', text: 'Your package could not be delivered due to an address issue. To reschedule delivery, confirm your details here: hxxp://parcel-fix-center[.]test' },
  { name: 'Bank lockout', text: 'Final Warning: Your banking profile will be locked today unless you verify your identity at hxxp://banking-auth-check[.]test/login' },
  { name: 'Team update', text: 'Hi Emma, I uploaded the revised slides to the shared folder. Please review before our 2 PM meeting. Thanks, Daniel' },
]

async function scoreWithModel(text) {
  const response = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Backend request failed')

  const probability =
    typeof data.probability === 'number' ? data.probability : parseFloat(data.score) / 100
  return { probability, riskLevel: data.riskLevel || riskLevel(probability), source: 'model' }
}

export default function App() {
  const [message, setMessage] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    const text = message.trim()
    if (!text) return
    setLoading(true)
    let scored
    try {
      scored = await scoreWithModel(text)
    } catch (error) {
      console.error('Model unavailable, using keyword rules:', error)
      scored = analyzeLocally(text)
    }
    setResult({ ...scored, text, findings: findIndicators(text) })
    setLoading(false)
  }

  const handleExample = (text) => {
    setMessage(text)
    setResult(null)
  }

  const handleEdit = () => setResult(null)

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header />

      <main className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <section className="pt-12 sm:pt-16">
          <h1 className="max-w-[18ch] text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            Is this message a phishing attempt?
          </h1>
          <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-muted">
            Paste an email or text. Baitcheck scores it with a trained model and highlights the
            phrases scammers tend to use.
          </p>
        </section>

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">
          <div>
            <div aria-live="polite">{result && <Verdict result={result} />}</div>
            <MessageSheet
              message={message}
              onChange={setMessage}
              result={result}
              loading={loading}
              onCheck={handleCheck}
              onEdit={handleEdit}
            />
          </div>

          <aside className="lg:pt-1">
            {result ? (
              <Findings findings={result.findings} riskLevel={result.riskLevel} />
            ) : (
              <Examples examples={EXAMPLES} onPick={handleExample} />
            )}
          </aside>
        </div>

        <ScamNews />
        <HowItWorks />
      </main>
    </div>
  )
}
