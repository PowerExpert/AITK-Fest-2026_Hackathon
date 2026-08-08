export default function About() {
  return (
    <section className="about" id="about">
      <div className="wrap about__grid">
        <div className="about__art">
          <svg viewBox="0 0 320 380" className="about__glyph">
            <rect width="320" height="380" rx="18" fill="#EBE0C9" />
            <path
              d="M40,250 Q160,160 280,250"
              fill="none"
              stroke="#4F5530"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <line x1="90" y1="252" x2="90" y2="300" stroke="#4F5530" strokeWidth="6" strokeLinecap="round" />
            <line x1="230" y1="252" x2="230" y2="300" stroke="#4F5530" strokeWidth="6" strokeLinecap="round" />
            <circle cx="160" cy="185" r="7" fill="#8B5A34" />
            <circle cx="120" cy="205" r="5" fill="#8B5A34" opacity="0.7" />
            <circle cx="200" cy="205" r="5" fill="#8B5A34" opacity="0.7" />
          </svg>
          <svg className="about__doodle" viewBox="0 0 90 60">
            <path
              d="M6,42 Q6,10 30,10 Q54,10 54,32 Q54,50 34,50 Q18,50 18,36"
              fill="none"
              stroke="#8B5A34"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path d="M18,36 L10,34 M18,36 L14,44" stroke="#8B5A34" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        <div className="about__text">
          <p className="eyebrow">о проекте</p>
          <h2>Мост между цифрой и профессией</h2>
          <p>
            Көпір появился из одной цифры — 334,1 тыс. официально безработных в Казахстане при
            сохраняющемся дефиците кадров по востребованным профессиям. Мы решили, что проблема не в
            нехватке вакансий, а в нехватке match&#39;а между опытом человека и тем, что реально нужно
            рынку.
          </p>
          <p>
            Загружаете резюме — получаете подходящие вакансии прямо сейчас и, если навыков не хватает,
            короткий маршрут переквалификации: что выучить и где, чтобы попасть в дефицитную профессию
            за минимальное время.
          </p>
          <a href="#how" className="btn btn--primary">
            Как это работает →
          </a>
        </div>
      </div>
    </section>
  )
}
