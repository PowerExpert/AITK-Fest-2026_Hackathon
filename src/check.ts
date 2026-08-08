import './index.css'
import './check.css'

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
`

// ---------- element refs ----------
const resumeInput = document.getElementById('resumeInput') as HTMLTextAreaElement
const fileInput = document.getElementById('fileInput') as HTMLInputElement
const fileName = document.getElementById('fileName') as HTMLSpanElement
const regionSelect = document.getElementById('regionSelect') as HTMLSelectElement
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement
const loadingState = document.getElementById('loadingState') as HTMLDivElement
const loadingText = document.getElementById('loadingText') as HTMLSpanElement
const errorState = document.getElementById('errorState') as HTMLDivElement
const resultsBlock = document.getElementById('results') as HTMLDivElement
const resultsSummary = document.getElementById('resultsSummary') as HTMLParagraphElement
const nowJobs = document.getElementById('nowJobs') as HTMLDivElement
const planJobs = document.getElementById('planJobs') as HTMLDivElement

// ---------- helpers ----------
function escapeHtml(str: unknown): string {
  const d = document.createElement('div')
  d.textContent = str == null ? '' : String(str)
  return d.innerHTML
}

function showError(message: string) {
  errorState.textContent = message
  errorState.style.display = 'block'
}
function hideError() {
  errorState.style.display = 'none'
}
function setLoading(on: boolean, text?: string) {
  loadingState.style.display = on ? 'flex' : 'none'
  if (text) loadingText.textContent = text
  submitBtn.disabled = on
}

// ---------- file text extraction ----------
async function extractFromTxt(file: File): Promise<string> {
  return await file.text()
}

async function extractFromPdf(file: File): Promise<string> {
  const pdfjsLib = (window as any).pdfjsLib
  if (!pdfjsLib) throw new Error('Библиотека для чтения PDF не загрузилась. Проверьте интернет-соединение и обновите страницу.')
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((it: any) => it.str).join(' ') + '\n'
  }
  return text.trim()
}

async function extractFromDocx(file: File): Promise<string> {
  const mammoth = (window as any).mammoth
  if (!mammoth) throw new Error('Библиотека для чтения DOCX не загрузилась. Проверьте интернет-соединение и обновите страницу.')
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return (result.value || '').trim()
}

async function extractFromImage(file: File): Promise<string> {
  const Tesseract = (window as any).Tesseract
  if (!Tesseract) throw new Error('Библиотека распознавания текста не загрузилась. Проверьте интернет-соединение и обновите страницу.')
  const { data } = await Tesseract.recognize(file, 'rus+eng', {
    logger: (m: any) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        fileName.textContent = `Распознаём текст на фото… ${Math.round(m.progress * 100)}%`
      }
    }
  })
  return (data.text || '').trim()
}

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0]
  if (!file) return

  hideError()
  fileName.style.color = ''
  fileName.textContent = 'Обрабатываем файл…'
  submitBtn.disabled = true

  try {
    const name = file.name.toLowerCase()
    let text = ''

    if (name.endsWith('.txt')) {
      text = await extractFromTxt(file)
    } else if (name.endsWith('.pdf') || file.type === 'application/pdf') {
      text = await extractFromPdf(file)
    } else if (name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
      text = await extractFromDocx(file)
    } else if (file.type.startsWith('image/')) {
      text = await extractFromImage(file)
    } else {
      throw new Error('Формат не поддерживается. Загрузите PDF, DOCX, фото или .txt.')
    }

    if (!text) {
      throw new Error('Не удалось найти текст в файле. Попробуйте другой файл или вставьте текст вручную.')
    }

    resumeInput.value = text
    fileName.textContent = `${file.name} — текст распознан (${text.length} симв.)`
  } catch (err) {
    fileName.textContent = err instanceof Error ? err.message : 'Не получилось обработать файл.'
    fileName.style.color = 'var(--danger)'
  } finally {
    submitBtn.disabled = false
  }
})

// ---------- prompt ----------
function buildSystemPrompt(region: string): string {
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
- Пиши по-русски, конкретно, без общих фраз вроде "развивайте себя". Указывай реальные типы курсов/сертификатов там, где это уместно, но не выдумывай конкретные названия компаний-курсов.
- Если из описания видно, что человек уже близок к дефицитной профессии, честно скажи это в summary.
- Никогда не отвечай ничего, кроме JSON объекта.`
}

// ---------- render ----------
function renderJobCard(job: any, type: 'now' | 'plan'): string {
  const isNow = type === 'now'
  let planHtml = ''
  if (!isNow && job.plan && job.plan.length) {
    planHtml = `
      <div class="job-card__plan">
        <div class="job-card__plan-title">план переквалификации</div>
        <ul>${job.plan.map((step: string) => `<li>${escapeHtml(step)}</li>`).join('')}</ul>
        ${job.timeline ? `<div class="job-card__timeline">срок: <b>${escapeHtml(job.timeline)}</b></div>` : ''}
      </div>`
  }
  return `
    <div class="job-card ${isNow ? 'job-card--now' : 'job-card--plan'}">
      <div class="job-card__head">
        <div class="job-card__title">${escapeHtml(job.title)}</div>
        <div class="job-card__match">${escapeHtml(job.match || '')}</div>
      </div>
      <div class="job-card__why">${escapeHtml(job.why)}</div>
      ${planHtml}
    </div>`
}

// ---------- main analyze call ----------
async function analyze() {
  const text = resumeInput.value.trim()
  if (!text) {
    showError('Опишите опыт или загрузите резюме — поле пустое.')
    return
  }

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    showError(
      'Не настроен API-ключ. Создайте файл .env.local в корне проекта со строкой VITE_ANTHROPIC_API_KEY=ваш_ключ и перезапустите npm run dev.'
    )
    return
  }

  hideError()
  resultsBlock.style.display = 'none'
  setLoading(true, 'Анализируем резюме…')

  const region = regionSelect.value
  const systemPrompt = buildSystemPrompt(region)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Вот мой опыт и навыки:\n\n${text}` }]
      })
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      if (response.status === 401) {
        throw new Error('API-ключ отклонён (401). Проверьте значение VITE_ANTHROPIC_API_KEY в .env.local.')
      }
      throw new Error(`Ошибка запроса к модели (${response.status}). ${detail.slice(0, 200)}`)
    }

    const data = await response.json()
    const textBlock = (data.content || []).find((b: any) => b.type === 'text')
    if (!textBlock) throw new Error('Модель не вернула текстовый ответ.')

    let clean = textBlock.text.trim()
    clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '')
    const parsed = JSON.parse(clean)

    resultsSummary.textContent = parsed.summary || ''
    nowJobs.innerHTML =
      (parsed.now || []).map((j: any) => renderJobCard(j, 'now')).join('') ||
      '<p class="checker__empty">Прямых совпадений без доучивания не найдено — смотрите план ниже.</p>'
    planJobs.innerHTML =
      (parsed.plan || []).map((j: any) => renderJobCard(j, 'plan')).join('') ||
      '<p class="checker__empty">Дополнительный план не потребовался.</p>'

    resultsBlock.style.display = 'block'
    resultsBlock.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch (err) {
    console.error(err)
    const message = err instanceof Error ? err.message : String(err)
    showError('Не получилось выполнить анализ: ' + message)
  } finally {
    setLoading(false)
  }
}

submitBtn.addEventListener('click', analyze)