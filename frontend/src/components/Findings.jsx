import { INDICATORS } from '../lib/analysis'

export default function Findings({ findings, riskLevel }) {
  return (
    <section>
      <h2 className="text-sm font-semibold">What stood out</h2>

      {findings.length === 0 ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">
          None of the usual warning phrases appear in this message.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Highlighted in the message. These phrases don't prove phishing on their own.
          </p>
          <dl className="mt-4 space-y-4 border-t border-rule pt-4">
            {findings.map(({ indicator, phrases }) => (
              <div key={indicator}>
                <dt className="text-[0.9375rem] font-medium">{INDICATORS[indicator].label}</dt>
                <dd className="mt-1 font-serif text-sm leading-relaxed text-muted">
                  {phrases.slice(0, 4).map((p) => `“${p}”`).join(', ')}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}

      {riskLevel !== 'Low' && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold">If you received this</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted marker:text-rule">
            <li>Don't open links or attachments.</li>
            <li>Go to the company's site yourself instead of using the message.</li>
            <li>Report it to your email provider or IT team, then delete it.</li>
          </ul>
        </div>
      )}
    </section>
  )
}
