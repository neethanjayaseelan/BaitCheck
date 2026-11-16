import StoryCard from './StoryCard'

const SEVERITY_LABEL = { high: 'High risk', med: 'Warning', low: 'Minor' }

const HEADLINE = {
  bad: (kind) => `Very likely a phishing ${kind}`,
  mid: () => 'Be careful with this one',
  good: () => 'No major warning signs found',
}

const ADVICE = {
  bad: "Don't click any links, reply or pay. If it claims to be a company you use, go to their site or app yourself.",
  mid: "Something's off. Check with the company directly using a number or site you already know.",
  good: "That doesn't prove it's safe. If it asks for money or a login, still go to the site yourself.",
}

export const levelOf = (score) => (score >= 50 ? 'bad' : score >= 20 ? 'mid' : 'good')

// Shows a checker result: verdict, where a link goes, findings and any matching story.
// `result` is { score, findings, matches, where?, sourceNote? }.
export default function Result({ result, kind }) {
  const level = levelOf(result.score)

  return (
    <div className="result">
      <div className={`verdict ${level}`}>
        <div className="gauge" aria-label={`Risk score ${result.score} out of 100`}>
          {result.score}
        </div>
        <div>
          <h3>{HEADLINE[level](kind)}</h3>
          <p>{ADVICE[level]}</p>
        </div>
      </div>

      {result.where && (
        <div className="where">
          <span className="lbl">This link really goes to</span>
          <span className="host">
            {result.where.sub}
            <b>{result.where.root}</b>
          </span>
          <small>
            {result.where.trusted
              ? 'This is a well-known website. Still be careful if the message asks you to enter a code or pay.'
              : 'The highlighted part is the actual website. Everything else in the link is just decoration.'}
          </small>
        </div>
      )}

      {result.findings.length > 0 ? (
        <>
          <p className="subhead">What we found ({result.findings.length})</p>
          <ul className="findings">
            {result.findings.map((finding) => (
              <li className="finding" key={finding.title}>
                <span className={`sev ${finding.sev}`}>{SEVERITY_LABEL[finding.sev]}</span>
                <div>
                  <b>{finding.title}</b>
                  {/* Details are built in lib/checks.js with all user text escaped. */}
                  <span dangerouslySetInnerHTML={{ __html: finding.detail }} />
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <ul className="findings">
          <li className="finding">
            <span className="sev pass">Clear</span>
            <div>
              <b>None of our checks were triggered</b>
              <span>Sender, links and wording looked normal.</span>
            </div>
          </li>
        </ul>
      )}

      {result.matches.length > 0 && (
        <>
          <p className="subhead">A major real attack used the same trick</p>
          {result.matches.map((story) => (
            <StoryCard key={story.id} story={story} match />
          ))}
        </>
      )}

      <p className="note">
        The score is out of 100 and adds up the warning signs found. It's a quick check, not a
        guarantee.{result.sourceNote ? ` ${result.sourceNote}` : ''}
      </p>
    </div>
  )
}
