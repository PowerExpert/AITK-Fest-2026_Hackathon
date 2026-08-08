type Vacancy = {
  title: string
  match: number
  icon: 'spark' | 'bolt' | 'cross' | 'chip'
  tone: 'olive' | 'brown'
}

const vacancies: Vacancy[] = [
  { title: 'Сварщик', match: 94, icon: 'spark', tone: 'olive' },
  { title: 'Электромонтажник', match: 88, icon: 'bolt', tone: 'brown' },
  { title: 'Медсестра', match: 81, icon: 'cross', tone: 'olive' },
  { title: 'IT-специалист', match: 76, icon: 'chip', tone: 'brown' },
]

function Icon({ type }: { type: Vacancy['icon'] }) {
  switch (type) {
    case 'spark':
      return (
        <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M16 4v8M16 20v8M4 16h8M20 16h8M8 8l5.5 5.5M23 23l-5.5-5.5M8 24l5.5-5.5M23 9l-5.5 5.5" />
        </svg>
      )
    case 'bolt':
      return (
        <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
          <path d="M18 3 8 18h7l-1 11 12-17h-7l-1-9Z" />
        </svg>
      )
    case 'cross':
      return (
        <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M16 6v20M6 16h20" />
        </svg>
      )
    case 'chip':
      return (
        <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="14" height="14" rx="2" />
          <path d="M13 9V4M19 9V4M13 28v-5M19 28v-5M9 13H4M9 19H4M28 13h-5M28 19h-5" strokeLinecap="round" />
        </svg>
      )
  }
}

export default function Vacancies() {
  return (
    <section className="vacancies" id="vacancies">
      <div className="wrap">
        <p className="vacancies__label">вакансии сейчас</p>

        <div className="vacancies__grid">
          {vacancies.map((v) => (
            <div className="vcard" key={v.title}>
              <div className={`vcard__art vcard__art--${v.tone}`}>
                <div className="vcard__icon">
                  <Icon type={v.icon} />
                </div>
              </div>
              <div className="vcard__row">
                <span className="vcard__title">{v.title}</span>
                <span className="vcard__match">{v.match}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="vacancies__more">
          <svg className="squiggle" viewBox="0 0 600 40" preserveAspectRatio="none">
            <path d="M0,20 C60,2 100,38 160,20 C220,2 260,38 320,20 C380,2 420,38 480,20 C520,6 560,30 600,20" fill="none" stroke="#8B5A34" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <a href="#how" className="btn btn--outline">
            смотреть больше
          </a>
        </div>
      </div>
    </section>
  )
}
