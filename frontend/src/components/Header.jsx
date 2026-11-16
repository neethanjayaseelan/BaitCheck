const TABS = [
  { view: 'check', label: 'Email checker' },
  { view: 'link', label: 'Check links' },
  { view: 'news', label: 'Scam news' },
]

export function Logo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="7" stroke="currentColor" strokeWidth="2.2" fill="none" />
      <path d="M15.8 15.8 21 21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path
        d="M7.4 10.7l2.2 2.2 4-4.4"
        stroke="var(--accent)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export default function Header({ view, onChange, storyCount }) {
  return (
    <header className="topbar">
      <div className="wrap">
        <div className="brand">
          <Logo />
          Baitcheck
        </div>
        <div className="switch" role="tablist" aria-label="Choose a tool">
          {TABS.map((tab) => (
            <button
              key={tab.view}
              type="button"
              role="tab"
              id={`tab-${tab.view}`}
              aria-controls={`view-${tab.view}`}
              aria-selected={view === tab.view}
              onClick={() => onChange(tab.view)}
            >
              {tab.label}
              {tab.view === 'news' && <span className="count">{storyCount}</span>}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
