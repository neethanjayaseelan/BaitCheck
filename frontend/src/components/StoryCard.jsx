export default function StoryCard({ story, match = false }) {
  return (
    <article className={match ? 'card match' : 'card'}>
      <div className="meta">
        <span className="pill">{story.tag}</span>
        <span>{story.date}</span>
        <span>· {story.src}</span>
      </div>
      <h3>{story.title}</h3>
      <p>{story.body}</p>
      <div className="tell">{story.tell}</div>
      <a className="readmore" href={story.url} target="_blank" rel="noreferrer">
        Read on {story.src} →
      </a>
    </article>
  )
}
