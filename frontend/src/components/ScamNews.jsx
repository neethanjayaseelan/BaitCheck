import { useCallback, useEffect, useState } from 'react'

const timeAgo = (iso) => {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  const days = Math.round(hours / 24)
  return `${days} ${days === 1 ? 'day' : 'days'} ago`
}

export default function ScamNews({ apiUrl }) {
  const [state, setState] = useState({ status: 'loading', stories: [] })

  const load = useCallback(async () => {
    setState({ status: 'loading', stories: [] })
    try {
      const response = await fetch(`${apiUrl}/news?limit=9`)
      const data = await response.json()
      if (!response.ok || !data.stories?.length) throw new Error(data.error || 'No stories')
      setState({ status: 'ready', stories: data.stories })
    } catch (error) {
      console.error('Could not load news:', error)
      setState({ status: 'error', stories: [] })
    }
  }, [apiUrl])

  useEffect(() => {
    load()
  }, [load])

  return (
    <section id="news" className="mt-24 scroll-mt-8 border-t border-rule pt-10" aria-busy={state.status === 'loading'}>
      <h2 className="text-2xl font-semibold tracking-tight">Phishing in the news</h2>
      <p className="mt-2 max-w-[65ch] leading-relaxed text-muted">
        Recent phishing and scam stories reported by news outlets in six countries and two security
        news sites. Refreshed every 30 minutes.
      </p>

      {state.status === 'error' && (
        <div className="mt-8 max-w-[65ch]">
          <p className="leading-relaxed">
            News stories couldn't be loaded. They come through the backend, so check that it's
            running and connected to the internet.
          </p>
          <button type="button" onClick={load} className="btn-secondary mt-4">
            Try again
          </button>
        </div>
      )}

      {state.status !== 'error' && (
        <ul className="mt-8 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {state.status === 'loading'
            ? Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="border-t border-rule py-5" aria-hidden="true">
                  <div className="h-3 w-24 rounded bg-rule" />
                  <div className="mt-3 h-4 w-full rounded bg-rule/70" />
                  <div className="mt-2 h-4 w-2/3 rounded bg-rule/70" />
                </li>
              ))
            : state.stories.map((story) => (
                <li key={story.url} className="border-t border-rule py-5">
                  <div className="flex justify-between gap-4 text-xs text-muted">
                    <span>{story.region || 'Security news'}</span>
                    <time dateTime={story.published}>{timeAgo(story.published)}</time>
                  </div>
                  <a
                    href={story.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block rounded font-semibold leading-snug hover:underline"
                  >
                    {story.title}
                  </a>
                  <p className="mt-1.5 text-sm text-muted">{story.source}</p>
                </li>
              ))}
        </ul>
      )}
    </section>
  )
}
