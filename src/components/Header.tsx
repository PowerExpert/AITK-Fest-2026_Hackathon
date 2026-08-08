import { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="header">
      <div className="wrap header__row">
        <a href="#top" className="logo">
          <span className="logo__dot" />
          Көпір
        </a>

        <nav className={`nav ${open ? 'nav--open' : ''}`}>
          <a href="#vacancies" onClick={() => setOpen(false)}>Вакансии</a>
          <a href="#how" onClick={() => setOpen(false)}>Как это работает</a>
          <a href="#about" onClick={() => setOpen(false)}>О проекте</a>
          <a href="#contacts" onClick={() => setOpen(false)}>Контакты</a>
          <a href="/check.html" className="btn btn--primary btn--sm nav__cta" onClick={() => setOpen(false)}>
            Проверить резюме
          </a>
        </nav>

        <a href="/check.html" className="btn btn--primary btn--sm header__cta">
          Проверить резюме
        </a>

        <button
          className={`burger ${open ? 'burger--open' : ''}`}
          aria-label="Открыть меню"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
