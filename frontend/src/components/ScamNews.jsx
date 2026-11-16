import StoryCard from './StoryCard'
import { STORIES } from '../lib/stories'

const STATS = [
  { value: '1M+', label: 'imposter scam reports to the FTC in 2025, the top fraud type for the 9th year running' },
  { value: '$1.6B', label: 'lost to people posing as police and officials, Jan 2025 to Jul 2026 (FBI)' },
  { value: '2×', label: 'scam detections doubled from Q3 2025 to Q2 2026 (Akamai)' },
]

export default function ScamNews({ onGo }) {
  return (
    <>
      <div className="hero">
        <p className="eyebrow">Scam news · 2016 to 2024</p>
        <h1>Six phishing attacks that made history</h1>
        <p className="lede">
          Major phishing cases from the last ten years. Each one started with a single message, call
          or link that someone trusted. This is why it's worth checking before you click.
        </p>
        <div className="stats" role="list">
          {STATS.map((stat) => (
            <div className="stat" role="listitem" key={stat.value}>
              <b>{stat.value}</b>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <section aria-label="The six stories">
        <div className="feed">
          {STORIES.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      <section>
        <div className="cta">
          <b>Got a message that looks like one of these?</b>
          <span className="actions">
            <button className="btn primary" type="button" onClick={() => onGo('check')}>
              Check the email
            </button>
            <button className="btn" type="button" onClick={() => onGo('link')}>
              Check the link
            </button>
          </span>
        </div>
      </section>

      <section aria-labelledby="act-h">
        <h2 id="act-h">If you clicked or replied</h2>
        <ol className="steps">
          <li>
            <div>
              <b>Stop and disconnect</b>
              <span>Don't enter anything else. Close the page or hang up.</span>
            </div>
          </li>
          <li>
            <div>
              <b>Change your password from the real site</b>
              <span>Type the address yourself or use the official app. Sign out of other sessions.</span>
            </div>
          </li>
          <li>
            <div>
              <b>Call your bank if you shared card details</b>
              <span>Use the number on the back of your card, not one from the message.</span>
            </div>
          </li>
          <li>
            <div>
              <b>Report it</b>
              <span>
                US:{' '}
                <a href="https://reportfraud.ftc.gov" target="_blank" rel="noreferrer">
                  ReportFraud.ftc.gov
                </a>{' '}
                and the FBI's{' '}
                <a href="https://www.ic3.gov" target="_blank" rel="noreferrer">
                  ic3.gov
                </a>
                . Forward scam texts to 7726 (SPAM).
              </span>
            </div>
          </li>
        </ol>
      </section>
    </>
  )
}
