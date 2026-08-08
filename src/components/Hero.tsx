import StatsCounter from './StatsCounter'

function BridgeArt() {
  return (
    <svg
      className="hero-art"
      viewBox="0 0 1200 460"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EBE0C9" />
          <stop offset="52%" stopColor="#D9C6A0" />
          <stop offset="100%" stopColor="#8B5A34" />
        </linearGradient>
        <pattern id="grain" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.6" fill="#33291E" opacity="0.06" />
        </pattern>
      </defs>

      <rect width="1200" height="460" fill="url(#skyGrad)" />
      <rect width="1200" height="460" fill="url(#grain)" />

      <circle cx="1000" cy="90" r="46" fill="#F6F1E6" opacity="0.55" />

      {/* hand-drawn birds */}
      <path d="M110,86 q10,-14 20,0 q10,-14 20,0" stroke="#33291E" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.4" />
      <path d="M165,118 q8,-11 16,0 q8,-11 16,0" stroke="#33291E" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.3" />
      <path d="M210,72 q7,-10 14,0 q7,-10 14,0" stroke="#33291E" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.28" />

      {/* water */}
      <rect x="0" y="368" width="1200" height="92" fill="#4F5530" opacity="0.16" />
      <path d="M0,382 q60,10 120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0" stroke="#4F5530" strokeWidth="1.4" fill="none" opacity="0.22" />

      {/* left bank */}
      <path d="M0,352 L0,460 L372,460 L372,378 Q300,336 216,356 Q132,380 0,352 Z" fill="#4F5530" />
      <text x="34" y="422" className="hero-art__label">ищут работу</text>
      <text x="34" y="444" className="hero-art__label hero-art__label--strong">334 100</text>

      {/* right bank */}
      <path d="M1200,352 L1200,460 L828,460 L828,378 Q900,336 984,356 Q1068,380 1200,352 Z" fill="#33291E" />
      <text x="1166" y="422" textAnchor="end" className="hero-art__label">дефицит кадров</text>
      <text x="1166" y="444" textAnchor="end" className="hero-art__label hero-art__label--strong">рядом</text>

      {/* pylons */}
      <rect x="330" y="222" width="12" height="150" fill="#33291E" />
      <rect x="858" y="222" width="12" height="150" fill="#33291E" />
      <rect x="322" y="212" width="28" height="12" rx="3" fill="#33291E" />
      <rect x="850" y="212" width="28" height="12" rx="3" fill="#33291E" />

      {/* deck */}
      <path d="M170,360 Q600,296 1030,360" stroke="#F6F1E6" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M170,360 Q600,296 1030,360" stroke="#8B5A34" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />

      {/* cables — left fan */}
      <line x1="336" y1="222" x2="190" y2="358" stroke="#F6F1E6" strokeWidth="2" opacity="0.85" />
      <line x1="336" y1="222" x2="235" y2="349" stroke="#F6F1E6" strokeWidth="2" opacity="0.85" />
      <line x1="336" y1="222" x2="280" y2="340" stroke="#F6F1E6" strokeWidth="2" opacity="0.85" />
      <line x1="336" y1="222" x2="320" y2="333" stroke="#F6F1E6" strokeWidth="2" opacity="0.85" />
      <line x1="336" y1="222" x2="470" y2="313" stroke="#F6F1E6" strokeWidth="1.6" opacity="0.6" />

      {/* cables — right fan */}
      <line x1="864" y1="222" x2="1010" y2="358" stroke="#F6F1E6" strokeWidth="2" opacity="0.85" />
      <line x1="864" y1="222" x2="965" y2="349" stroke="#F6F1E6" strokeWidth="2" opacity="0.85" />
      <line x1="864" y1="222" x2="920" y2="340" stroke="#F6F1E6" strokeWidth="2" opacity="0.85" />
      <line x1="864" y1="222" x2="880" y2="333" stroke="#F6F1E6" strokeWidth="2" opacity="0.85" />
      <line x1="864" y1="222" x2="730" y2="313" stroke="#F6F1E6" strokeWidth="1.6" opacity="0.6" />

      {/* figures crossing */}
      <g fill="#C9A876">
        <circle cx="470" cy="311" r="5" />
        <rect x="468" y="316" width="4" height="10" rx="2" />
      </g>
      <g fill="#F6F1E6">
        <circle cx="600" cy="298" r="5" />
        <rect x="598" y="303" width="4" height="10" rx="2" />
      </g>
      <g fill="#C9A876">
        <circle cx="730" cy="311" r="5" />
        <rect x="728" y="316" width="4" height="10" rx="2" />
      </g>
    </svg>
  )
}

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <div className="hero-art-wrap">
          <BridgeArt />
        </div>

        <div className="hero-row">
          <div className="hero-row__left">
            <h1 className="hero-name">Көпір</h1>
            <a href="./check.html" className="btn btn--primary">
              Проверить резюме →
            </a>
            <StatsCounter />
          </div>

          <div className="hero-side">
            <div className="hero-eyebrow">
              ИИ-навигатор
              <br />
              рынка труда
            </div>
            <p className="hero-script">
              Ваш мост
              <br />к нужной профессии
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
