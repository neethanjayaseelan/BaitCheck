export default function Header() {
  return (
    <header className="border-b border-rule bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="/" className="flex items-center gap-2.5 rounded text-lg font-bold tracking-tight">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.5 4 5.5v6.2c0 4.6 3.3 8.6 8 9.8 4.7-1.2 8-5.2 8-9.8V5.5l-8-3Z" fill="#172033" />
            <path d="M8 12.2h8" stroke="#FFE27A" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Baitcheck
        </a>
        <nav className="flex items-center gap-4 text-sm sm:gap-6 font-medium text-muted">
          <a href="#news" className="rounded hover:text-ink">News</a>
          <a href="#how-it-works" className="rounded hover:text-ink">How it works</a>
          <a
            href="https://github.com/neethanjayaseelan/Baitcheck"
            className="rounded hover:text-ink"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  )
}
