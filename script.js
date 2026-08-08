const DEFICIT_LIST = `
Официальный перечень дефицитных / наиболее востребованных профессий в Казахстане (обобщено по данным Минтруда РК и портала Enbek.kz, актуально на 2026 год, более 50 позиций в полном перечне):

ЗДРАВООХРАНЕНИЕ (острая нехватка, на одну вакансию приходится меньше одного резюме):
- акушер-гинеколог
- педиатр
- анестезиолог-реаниматолог
- онколог
- неонатолог
- эндокринолог
- врач общей практики / семейный врач
- средний медицинский персонал (медсёстры, фельдшеры) в регионах

IT И ЦИФРОВЫЕ ПРОФЕССИИ:
- разработчик программного обеспечения / программист приложений
- специалист по цифровой (кибер-)безопасности
- дата-инженер / аналитик данных
- IT-архитектор / системный администратор
- графический дизайнер (в т.ч. digital)

ИНЖЕНЕРИЯ И ПРОИЗВОДСТВО:
- инженер по автоматизации
- инженер-механик
- инженер-электрик
- оператор высокотехнологичного оборудования
- инженер по контролю качества / стандартизации

КРЕАТИВНАЯ ИНДУСТРИЯ И ПРОЧЕЕ:
- отдельные креативные и инженерные специальности из официального перечня Минтруда (перечень даёт право упрощённого трудоустройства и превышает 50 позиций)

Контекст: при этом в стране официально зарегистрировано около 334,1 тыс. безработных — то есть дефицит носит структурный характер (несовпадение навыков), а не характер нехватки рабочих мест как таковых.
`;

// ---------- element refs ----------
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const resumeInput = document.getElementById('resumeInput');
const submitBtn = document.getElementById('submitBtn');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const resultsBlock = document.getElementById('results');
const resultsSummary = document.getElementById('resultsSummary');
const nowJobs = document.getElementById('nowJobs');
const planJobs = document.getElementById('planJobs');

// ---------- mobile nav ----------
const navToggle = document.getElementById('navToggle');
const navLinksEl = document.querySelector('.navlinks');
if (navToggle && navLinksEl) {
  navToggle.addEventListener('click', () => {
    navLinksEl.classList.toggle('open');
    navToggle.classList.toggle('open');
  });
  navLinksEl.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinksEl.classList.remove('open');
      navToggle.classList.remove('open');
    });
  });
}

// ---------- nav shadow on scroll ----------
const siteNav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  if (siteNav) siteNav.classList.toggle('scrolled', window.scrollY > 12);
}, { passive: true });

// ---------- scroll-reveal animations ----------
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}

// ---------- animated stat counters ----------
function animateCount(el, target, suffix, duration) {
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    el.textContent = value.toLocaleString('ru-RU') + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const counters = document.querySelectorAll('[data-count]');
if ('IntersectionObserver' in window && counters.length) {
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        animateCount(el, target, suffix, 1400);
        cio.unobserve(el);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(el => cio.observe(el));
}

// ---------- resume file upload (.txt) ----------
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.txt')) {
    fileName.textContent = 'Пока поддерживается только .txt — скопируйте текст резюме в поле выше.';
    fileName.style.color = '#B24C32';
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    resumeInput.value = e.target.result;
    fileName.textContent = file.name + ' — загружено';
    fileName.style.color = '';
  };
  reader.readAsText(file, 'UTF-8');
});

// ---------- helpers ----------
function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str == null ? '' : String(str);
  return d.innerHTML;
}

function renderJobCard(job, type) {
  const isNow = type === 'now';
  let planHtml = '';
  if (!isNow && job.plan && job.plan.length) {
    planHtml = `
      <div class="job-plan">
        <div class="job-plan-title">План переквалификации</div>
        <ul>${job.plan.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ul>
        ${job.timeline ? `<div class="job-timeline">Ориентировочный срок: <b>${escapeHtml(job.timeline)}</b></div>` : ''}
      </div>`;
  }
  return `
    <div class="job-card ${isNow ? 'now' : 'plan'}">
      <div class="job-head">
        <div class="job-title">${escapeHtml(job.title)}</div>
        <div class="job-match">${escapeHtml(job.match || '')}</div>
      </div>
      <div class="job-why">${escapeHtml(job.why)}</div>
      ${planHtml}
    </div>`;
}

function buildSystemPrompt(region) {
  return `Ты — аналитик рынка труда, встроенный в сервис Көпір. Твоя задача: сопоставить описанный человеком опыт/навыки со списком реально дефицитных профессий Казахстана и вернуть строго JSON, без markdown, без пояснений вне JSON.

Вот официальный контекст по дефицитным профессиям, который нужно использовать как основу для матчинга (не выдумывай профессии вне духа этого списка, если только это не близкая по смыслу вариация):
${DEFICIT_LIST}

Регион пользователя: ${region}.

Формат ответа — ТОЛЬКО валидный JSON следующей структуры, без обратных кавычек и без текста до/после:
{
  "summary": "1-2 предложения, честно и по-человечески описывающие ситуацию этого конкретного человека и общий вывод",
  "now": [
    {"title": "название вакансии/роли", "match": "например Высокое совпадение", "why": "1-2 предложения, почему подходит именно с его опытом"}
  ],
  "plan": [
    {"title": "название дефицитной профессии-цели", "match": "например требует доучивания", "why": "почему это логичный следующий шаг с его текущим бэкграундом", "plan": ["шаг 1", "шаг 2", "шаг 3"], "timeline": "например 2-4 месяца"}
  ]
}

Требования:
- "now" — от 1 до 4 вакансий, которые подходят человеку УЖЕ СЕЙЧАС, без доучивания, с опорой на дефицитные/востребованные профессии, если это реалистично, либо честно близкие роли, если полного совпадения с дефицитным списком нет.
- "plan" — от 1 до 3 дефицитных профессий, которые реалистично достижимы для этого человека за короткий срок (недели-месяцы, не годы), с конкретным пошаговым планом (какие курсы, сертификаты, практика).
- Пиши по-русски, конкретно, без общих фраз вроде "развивайте себя". Указывай реальные типы курсов/сертификатов там, где это уместно (например конкретные направления: 1С, Python для аналитики, курсы по кибербезопасности и т.п.), но не выдумывай конкретные названия компаний-курсов.
- Если из описания видно, что человек уже close к дефицитной профессии, честно скажи это в summary.
- Никогда не отвечай ничего, кроме JSON объекта.`;
}

// ---------- main analyze call — real request to the Claude API ----------
async function analyze() {
  const text = resumeInput.value.trim();

  if (!text) {
    errorState.textContent = 'Опишите опыт или загрузите резюме — поле пустое.';
    errorState.style.display = 'block';
    return;
  }

  errorState.style.display = 'none';
  resultsBlock.style.display = 'none';
  loadingState.style.display = 'flex';
  submitBtn.disabled = true;

  const region = document.getElementById('regionSelect').value;
  const systemPrompt = buildSystemPrompt(region);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Вот мой опыт и навыки:\n\n${text}` }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Ошибка сети при обращении к модели (' + response.status + ')');
    }

    const data = await response.json();
    const textBlock = (data.content || []).find(b => b.type === 'text');
    if (!textBlock) throw new Error('Модель не вернула текстовый ответ.');

    let clean = textBlock.text.trim();
    clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
    const parsed = JSON.parse(clean);

    resultsSummary.textContent = parsed.summary || '';
    nowJobs.innerHTML = (parsed.now || []).map(j => renderJobCard(j, 'now')).join('')
      || '<p style="color:var(--ink-dim); font-size:14px;">Прямых совпадений без доучивания не найдено — смотрите план ниже.</p>';
    planJobs.innerHTML = (parsed.plan || []).map(j => renderJobCard(j, 'plan')).join('')
      || '<p style="color:var(--ink-dim); font-size:14px;">Дополнительный план не потребовался.</p>';

    resultsBlock.style.display = 'block';
    resultsBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    console.error(err);
    errorState.textContent = 'Не получилось выполнить анализ: ' + err.message + '. Попробуйте ещё раз.';
    errorState.style.display = 'block';
  } finally {
    loadingState.style.display = 'none';
    submitBtn.disabled = false;
  }
}

submitBtn.addEventListener('click', analyze);
