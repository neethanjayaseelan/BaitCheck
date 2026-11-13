export default function Examples({ examples, onPick }) {
  return (
    <section>
      <h2 className="text-sm font-semibold">Try an example</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Real-looking messages from the training data. Links are disabled.
      </p>
      <ul className="mt-4 divide-y divide-rule border-y border-rule">
        {examples.map((example) => (
          <li key={example.name}>
            <button
              type="button"
              onClick={() => onPick(example.text)}
              className="group w-full rounded py-3 text-left"
            >
              <span className="block text-[0.9375rem] font-medium group-hover:underline">{example.name}</span>
              <span className="mt-0.5 block truncate font-serif text-sm text-muted">{example.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
