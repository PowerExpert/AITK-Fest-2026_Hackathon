function QrGlyph() {
  const cells = [
    [1, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1],
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 0, 1, 1, 0, 1, 1, 0, 1],
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1],
  ]
  const size = 9
  const cell = 8
  return (
    <svg width={size * cell} height={size * cell} className="qr-glyph" viewBox={`0 0 ${size * cell} ${size * cell}`}>
      <rect width={size * cell} height={size * cell} rx="8" fill="#F6F1E6" />
      {cells.map((row, y) =>
        row.map((v, x) =>
          v ? <rect key={`${x}-${y}`} x={x * cell + 6} y={y * cell + 6} width={cell - 2} height={cell - 2} rx="1.5" fill="#33291E" /> : null
        )
      )}
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="footer" id="contacts">
      <div className="wrap footer__grid">
        <div className="footer__col footer__col--brand">
          <div className="logo">
            <span className="logo__dot" />
            Көпір
          </div>
          <p className="footer__tag">мост между вашим опытом и профессией, где вы нужны</p>
          <QrGlyph />
        </div>

        <div className="footer__col">
          <p className="footer__heading">Ссылки</p>
          <a href="#top">Главная</a>
          <a href="#vacancies">Вакансии</a>
          <a href="#how">Как это работает</a>
          <a href="#about">О проекте</a>
        </div>

        <div className="footer__col">
          <p className="footer__heading">Контакты</p>
          <a href="tel:+70000000000">+7 (000) 000-00-00</a>
          <a href="mailto:hello@kopir.kz">hello@kopir.kz</a>
          <span className="footer__muted">Казахстан</span>
        </div>
      </div>

      <div className="wrap footer__bottom">
        <span>© 2026 Көпір</span>
        <span className="footer__muted">ИИ-навигатор «безработица vs дефицит кадров»</span>
      </div>
    </footer>
  )
}
