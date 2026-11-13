import { HIGH_RISK, MEDIUM_RISK } from '../lib/analysis'

const COPY = {
  High: {
    title: 'Likely phishing',
    advice: "Don't click links or reply. If it claims to be from a company you use, contact them through their official website or app.",
    tone: 'text-danger',
    fill: 'bg-danger',
  },
  Medium: {
    title: 'Looks suspicious',
    advice: 'Some signs of phishing. Check who really sent it before you click anything or share details.',
    tone: 'text-caution',
    fill: 'bg-caution',
  },
  Low: {
    title: 'No strong signs of phishing',
    advice: "That isn't a guarantee. Stay careful with unexpected requests for money or personal details.",
    tone: 'text-safe',
    fill: 'bg-safe',
  },
}

export default function Verdict({ result }) {
  const copy = COPY[result.riskLevel]
  const percent = Math.round(result.probability * 100)

  return (
    <section className="mb-6" aria-label="Result">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className={`text-3xl font-semibold tracking-tight ${copy.tone}`}>{copy.title}</h2>
        <p className="text-sm text-muted">
          <span className="text-2xl font-semibold tabular-nums text-ink">{percent}%</span> chance of phishing
        </p>
      </div>

      <div className="relative mt-4" role="img" aria-label={`Phishing score ${percent} out of 100`}>
        <div className="h-2 overflow-hidden rounded-full bg-rule">
          <div className={`meter-fill h-full rounded-full ${copy.fill}`} style={{ width: `${percent}%` }} />
        </div>
        {[MEDIUM_RISK, HIGH_RISK].map((t) => (
          <span key={t} className="absolute -top-1 h-4 w-px bg-muted/50" style={{ left: `${t * 100}%` }} />
        ))}
        <div className="relative mt-1.5 h-4 text-xs text-muted">
          <span className="absolute left-0">Low</span>
          <span className="absolute" style={{ left: `${MEDIUM_RISK * 100}%` }}>&nbsp;Suspicious</span>
          <span className="absolute" style={{ left: `${HIGH_RISK * 100}%` }}>&nbsp;Likely phishing</span>
        </div>
      </div>

      <p className="mt-4 max-w-[65ch] leading-relaxed">{copy.advice}</p>
      {result.source === 'model' && (
        <p className="mt-2 text-sm text-muted">Score from the trained model.</p>
      )}
      {result.source === 'rules' && (
        <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-caution">
          The model server isn't running, so this score is based on keywords only. Start the backend
          (python backend/server.py) for a model score.
        </p>
      )}
    </section>
  )
}
