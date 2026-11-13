import { INDICATORS, segmentText } from '../lib/analysis'

export default function MessageSheet({ message, onChange, result, loading, onCheck, onEdit }) {
  const canCheck = message.trim().length > 0 && !loading

  if (result) {
    return (
      <div>
        <div className="sheet">
          <p className="whitespace-pre-wrap font-serif text-[1.0625rem] leading-[1.75]">
            {segmentText(result.text).map((segment, i) =>
              segment.indicators ? (
                <mark
                  key={i}
                  className="highlight"
                  title={segment.indicators.map((name) => INDICATORS[name].label).join('; ')}
                >
                  {segment.text}
                </mark>
              ) : (
                <span key={i}>{segment.text}</span>
              ),
            )}
          </p>
        </div>
        <div className="mt-4">
          <button type="button" onClick={onEdit} className="btn-secondary">
            Edit message
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onCheck()
      }}
    >
      <label htmlFor="message" className="sr-only">
        Message to check
      </label>
      <textarea
        id="message"
        rows={10}
        value={message}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && canCheck) onCheck()
        }}
        placeholder="Paste the message here, including the subject line if it has one."
        className="sheet block min-h-[16rem] w-full resize-y font-serif text-[1.0625rem] leading-[1.75] placeholder:text-muted/70"
      />
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="submit" disabled={!canCheck} className="btn-primary">
          {loading ? 'Checking…' : 'Check message'}
        </button>
        <p className="text-sm text-muted">
          Use sample text. Don't paste real passwords or account numbers.
        </p>
      </div>
    </form>
  )
}
