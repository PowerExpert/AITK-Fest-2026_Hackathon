const steps = [
  {
    n: '01',
    title: 'Загрузите резюме',
    bullets: ['Текстом или файлом — PDF, DOCX, фото', 'Распознаём текст автоматически, если нужно'],
    meta: '~30 секунд',
    offset: 'up',
  },
  {
    n: '02',
    title: 'Получите match',
    bullets: ['Сверяем навыки со списком дефицитных профессий региона', 'Показываем % совпадения по каждой вакансии'],
    meta: 'мгновенно',
    offset: 'down',
  },
  {
    n: '03',
    title: 'Идите по плану',
    bullets: ['Если навыков не хватает — короткий маршрут переквалификации', 'Курсы, сертификаты, сроки'],
    meta: 'от 2 недель',
    offset: 'up',
  },
] as const

export default function HowItWorks() {
  return (
    <section className="how" id="how">
      <svg className="how__squiggle" viewBox="0 0 1200 500" preserveAspectRatio="none">
        <path
          d="M-50,120 C150,40 250,260 450,180 C650,100 750,320 950,220 C1080,160 1150,260 1250,200"
          fill="none"
          stroke="#4F5530"
          strokeWidth="2"
          opacity="0.35"
        />
      </svg>

      <div className="wrap">
        <p className="how__label">как это работает</p>

        <div className="how__grid">
          {steps.map((s) => (
            <div className={`step-card step-card--${s.offset}`} key={s.n}>
              <span className="step-card__n">{s.n}</span>
              <h3>{s.title}</h3>
              <ul>
                {s.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <p className="step-card__meta">{s.meta}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
