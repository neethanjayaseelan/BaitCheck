// Six major phishing attacks from the last ten years, newest first.
// These are fixed stories, so this section needs no backend or internet connection.
const STORIES = [
  {
    year: '2024',
    method: 'Video call',
    title: 'Deepfake video call costs engineering firm Arup $25 million',
    summary:
      "A finance worker in Hong Kong joined a video call with what looked like the company's CFO and colleagues. Everyone else on the call was an AI-generated fake. The worker made 15 transfers totalling HK$200 million (about $25.6 million).",
    lesson:
      'A familiar face is no longer proof. Confirm money requests through a separate channel you already trust.',
    source: 'CNN',
    url: 'https://abc17news.com/money/cnn-business-consumer/2024/05/16/british-engineering-giant-arup-revealed-as-25-million-deepfake-scam-victim/',
  },
  {
    year: '2023',
    method: 'Phone call',
    title: "One phone call to the help desk shuts down MGM's casinos",
    summary:
      'Attackers found an MGM employee on LinkedIn, phoned the IT help desk pretending to be them, and got the password and MFA reset. Ransomware followed and disrupted hotels and casinos for about ten days. MGM estimated the hit at about $100 million.',
    lesson:
      "Phishing isn't only email. Anyone who can reset a password needs a strict way to check who is calling.",
    source: 'Netwrix',
    url: 'https://netwrix.com/en/resources/blog/mgm-cyber-attack/',
  },
  {
    year: '2022',
    method: 'Text message',
    title: 'Fake login texts steal nearly 10,000 work logins at 130+ companies',
    summary:
      'Employees at Twilio, Cloudflare and other companies got texts linking to fake Okta sign-in pages. Passwords and two-step codes typed there went straight to the attackers. Researchers at Group-IB counted 9,931 stolen logins across more than 130 organisations.',
    lesson:
      'Texted codes can be phished too. Never sign in from a link in a text. Open the app or type the address yourself.',
    source: 'TechCrunch',
    url: 'https://techcrunch.com/2022/08/25/twilio-hackers-group-ib/',
  },
  {
    year: '2020',
    method: 'Phone call',
    title: 'Phone phishing of Twitter staff hijacks famous accounts',
    summary:
      'Attackers phoned Twitter employees and tricked them into giving up access to internal tools. They targeted 130 accounts and tweeted a bitcoin scam from 45 of them, including those of Barack Obama, Joe Biden and Elon Musk.',
    lesson:
      'Attackers go after staff with access, not only you. "Send money and get double back" is always a scam.',
    source: 'X (Twitter) blog',
    url: 'https://blog.x.com/en_us/topics/company/2020/an-update-on-our-security-incident',
  },
  {
    year: '2019',
    method: 'Fake invoices',
    title: 'Fake invoices take over $100 million from Facebook and Google',
    summary:
      'A Lithuanian man posed as hardware supplier Quanta Computer and emailed forged invoices and contracts. Google wired over $23 million and Facebook nearly $100 million between 2013 and 2015. He pleaded guilty in 2019. Google says it recovered its money and Facebook most of it.',
    lesson:
      'Even the biggest tech companies have paid fake invoices. Confirm new or changed bank details by phone.',
    source: 'NPR',
    url: 'https://www.npr.org/2019/03/25/706715377',
  },
  {
    year: '2016',
    method: 'Email',
    title: 'A fake Google alert exposes a US presidential campaign',
    summary:
      "John Podesta, chairman of Hillary Clinton's campaign, got an email that looked like a Google security alert telling him to change his password. The link was a shortened Bitly address leading to a fake Google login page. An IT aide meant to call the email \"illegitimate\" but typed \"legitimate\". Thousands of his emails were later published.",
    lesson: 'Never change a password from a link in an email. Go to the site yourself.',
    source: 'Sophos News',
    url: 'https://news.sophos.com/en-us/2016/12/16/dnc-chief-podesta-led-to-phishing-link-thanks-to-a-typo/',
  },
]

export default function ScamNews() {
  return (
    <section id="news" className="mt-24 scroll-mt-8 border-t border-rule pt-10">
      <h2 className="text-2xl font-semibold tracking-tight">Six phishing attacks that made history</h2>
      <p className="mt-2 max-w-[65ch] leading-relaxed text-muted">
        Major phishing cases from the last ten years. Each one started with a single message, call
        or link that someone trusted.
      </p>

      <ul className="mt-8 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        {STORIES.map((story) => (
          <li key={story.url} className="border-t border-rule py-5">
            <div className="flex justify-between gap-4 text-xs text-muted">
              <span>{story.method}</span>
              <span>{story.year}</span>
            </div>
            <h3 className="mt-2 font-semibold leading-snug">{story.title}</h3>
            <p className="mt-2 text-sm leading-relaxed">{story.summary}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              <span className="font-semibold">Lesson:</span> {story.lesson}
            </p>
            <a
              href={story.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block rounded text-sm font-semibold hover:underline"
            >
              Read more on {story.source}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
