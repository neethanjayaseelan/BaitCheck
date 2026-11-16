import { useEffect, useState } from 'react'

import Header from './components/Header'
import EmailChecker from './components/EmailChecker'
import LinkChecker from './components/LinkChecker'
import ScamNews from './components/ScamNews'
import { STORIES } from './lib/stories'

const VIEWS = ['check', 'link', 'news']

const viewFromHash = () => {
  const name = window.location.hash.slice(1)
  return VIEWS.includes(name) ? name : 'check'
}

export default function App() {
  const [view, setView] = useState(viewFromHash)

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const go = (next) => {
    setView(next)
    window.history.replaceState(null, '', `#${next}`)
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <Header view={view} onChange={go} storyCount={STORIES.length} />

      {/* Each view stays mounted so what you typed is still there when you switch back. */}
      <main className="wrap">
        <div role="tabpanel" id="view-check" aria-labelledby="tab-check" hidden={view !== 'check'}>
          <EmailChecker onGo={go} />
        </div>
        <div role="tabpanel" id="view-link" aria-labelledby="tab-link" hidden={view !== 'link'}>
          <LinkChecker onGo={go} />
        </div>
        <div role="tabpanel" id="view-news" aria-labelledby="tab-news" hidden={view !== 'news'}>
          <ScamNews onGo={go} />
        </div>
      </main>

      <footer>
        <div className="wrap">
          <span>
            The checkers are a quick pattern check, not a guarantee. A clean result doesn't prove a
            message is safe, so when in doubt, go to the company's site yourself.
          </span>
          <span>
            Scam summaries are written from public reporting. Follow each link for the original
            article.
          </span>
        </div>
      </footer>
    </>
  )
}
