const STEPS = [
  {
    title: 'The model scores the message',
    body: 'A logistic regression classifier, trained on labelled phishing and normal messages, reads the text as TF-IDF word and phrase features and returns a probability.',
  },
  {
    title: 'Rules explain the score',
    body: 'Pattern checks find the phrases behind common scams: pressure to act fast, requests for logins, links, and messages pretending to be a bank or brand.',
  },
  {
    title: 'You decide what to do',
    body: 'The score is a second opinion, not a verdict. The training set is small, so treat a low score as “no obvious red flags,” not “safe.”',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mt-24 scroll-mt-8 border-t border-rule pt-10">
      <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
      <ol className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <span className="text-sm font-semibold tabular-nums text-muted">{i + 1}</span>
            <h3 className="mt-1 font-semibold">{step.title}</h3>
            <p className="mt-2 max-w-[42ch] text-[0.9375rem] leading-relaxed text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
      <p className="mt-12 text-sm text-muted">
        Built with React, Tailwind CSS, Flask and scikit-learn.
      </p>
    </section>
  )
}
