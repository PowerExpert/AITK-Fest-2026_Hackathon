import './index.css'
import './check.css'
import { GEMINI_API_KEY, GEMINI_MODEL } from './config'
import { supabase, supabaseConfigured, type Profile, type ResumeCheck } from './lib/supabaseClient'

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

// ============================================================
// element refs
// ============================================================
const authSection = document.getElementById('authSection') as HTMLElement
const profileSection = document.getElementById('profileSection') as HTMLElement
const checkerSection = document.getElementById('checkerSection') as HTMLElement

const accountBar = document.getElementById('accountBar') as HTMLDivElement
const accountEmail = document.getElementById('accountEmail') as HTMLSpanElement
const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement

const authTabs = document.querySelectorAll<HTMLButtonElement>('.auth-tab')
const loginForm = document.getElementById('loginForm') as HTMLFormElement
const signupForm = document.getElementById('signupForm') as HTMLFormElement
const loginEmail = document.getElementById('loginEmail') as HTMLInputElement
const loginPassword = document.getElementById('loginPassword') as HTMLInputElement
const signupEmail = document.getElementById('signupEmail') as HTMLInputElement
const signupPassword = document.getElementById('signupPassword') as HTMLInputElement
const authLoading = document.getElementById('authLoading') as HTMLDivElement
const authError = document.getElementById('authError') as HTMLDivElement
const authNotice = document.getElementById('authNotice') as HTMLDivElement

const profileForm = document.getElementById('profileForm') as HTMLFormElement
const profileName = document.getElementById('profileName') as HTMLInputElement
const profileAge = document.getElementById('profileAge') as HTMLInputElement
const profileRegion = document.getElementById('profileRegion') as HTMLSelectElement
const profileLoading = document.getElementById('profileLoading') as HTMLDivElement
const profileError = document.getElementById('profileError') as HTMLDivElement

const historyBlock = document.getElementById('historyBlock') as HTMLDivElement
const historyList = document.getElementById('historyList') as HTMLDivElement

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
const resourcesList = document.getElementById('resourcesList') as HTMLDivElement
const downloadPdfBtn = document.getElementById('downloadPdfBtn') as HTMLButtonElement
const printDate = document.getElementById('printDate') as HTMLSpanElement

// ============================================================
// real retraining resources (Kazakhstan) — hard-coded, not AI-generated,
// so the links shown to the user are always accurate.
// ============================================================
const KZ_RESOURCES = [
  {
    title: 'Enbek.kz — электронная биржа труда',
    desc: 'Государственный портал вакансий и госпрограмм: подбор вакансий, регистрация как безработный, бесплатное обучение по госпрограммам.',
    url: 'https://enbek.kz'
  },
  {
    title: 'Skills Enbek — бесплатные онлайн-курсы',
    desc: 'Сотни бесплатных курсов по востребованным профессиям. Сертификат по итогам теста автоматически добавляется в резюме на Enbek.kz.',
    url: 'https://skills.enbek.kz'
  },
  {
    title: '«Бастау Бизнес» — обучение предпринимательству',
    desc: 'Бесплатное обучение основам бизнеса на платформе Skills Enbek с возможностью получить грант на старт своего дела.',
    url: 'https://business.enbek.kz/ru/bastau-business'
  }
] as const

function renderResources() {
  resourcesList.innerHTML = KZ_RESOURCES.map(
    (r) => `<div class="resource-card">
        <div class="resource-card__body">
          <div class="resource-card__title">${escapeHtml(r.title)}</div>
          <div class="resource-card__desc">${escapeHtml(r.desc)}</div>
        </div>
        <a class="resource-card__link" href="${r.url}" target="_blank" rel="noopener noreferrer">открыть →</a>
      </div>`
  ).join('')
}

downloadPdfBtn.addEventListener('click', () => {
  printDate.textContent = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  window.print()
})

// ============================================================
// helpers
// ============================================================
function escapeHtml(str: unknown): string {
  const d = document.createElement('div')
  d.textContent = str == null ? '' : String(str)
  return d.innerHTML
}
function showIn(el: HTMLElement, msg: string) {
  el.textContent = msg
  el.style.display = 'block'
}
function hideIn(el: HTMLElement) {
  el.style.display = 'none'
}
function setLoading(on: boolean, text?: string) {
  loadingState.style.display = on ? 'flex' : 'none'
  if (text) loadingText.textContent = text
  submitBtn.disabled = on
}

function showSection(section: 'auth' | 'profile' | 'checker') {
  authSection.hidden = section !== 'auth'
  profileSection.hidden = section !== 'profile'
  checkerSection.hidden = section !== 'checker'
}

// ============================================================
// AUTH
// ============================================================
let currentProfile: Profile | null = null

if (!supabaseConfigured) {
  showIn(authError, 'Supabase не настроен. Откройте src/config.ts и вставьте SUPABASE_URL и SUPABASE_ANON_KEY из вашего проекта на supabase.com.')
}

authTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    authTabs.forEach((t) => t.classList.remove('auth-tab--active'))
    tab.classList.add('auth-tab--active')
    const which = tab.dataset.tab
    loginForm.hidden = which !== 'login'
    signupForm.hidden = which !== 'signup'
    hideIn(authError)
    authNotice.style.display = 'none'
  })
})

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  hideIn(authError)
  authLoading.style.display = 'flex'
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.value.trim(),
      password: loginPassword.value
    })
    if (error) throw error
    // onAuthStateChange handles the rest
  } catch (err) {
    showIn(authError, err instanceof Error ? err.message : 'Не удалось войти.')
  } finally {
    authLoading.style.display = 'none'
  }
})

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  hideIn(authError)
  authLoading.style.display = 'flex'
  try {
    const { data, error } = await supabase.auth.signUp({
      email: signupEmail.value.trim(),
      password: signupPassword.value
    })
    if (error) throw error
    if (data.session) {
      // email confirmation disabled — logged in immediately, onAuthStateChange handles rest
    } else {
      authNotice.style.display = 'block'
      authNotice.textContent = 'Регистрация почти завершена — проверьте почту и перейдите по ссылке для подтверждения, затем войдите.'
    }
  } catch (err) {
    showIn(authError, err instanceof Error ? err.message : 'Не удалось зарегистрироваться.')
  } finally {
    authLoading.style.display = 'none'
  }
})

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut()
})

supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    accountBar.classList.add('account-bar--visible')
    accountEmail.textContent = session.user.email || ''
    void loadProfileAndProceed(session.user.id)
  } else {
    accountBar.classList.remove('account-bar--visible')
    currentProfile = null
    showSection('auth')
  }
})

// ============================================================
// PROFILE
// ============================================================
async function loadProfileAndProceed(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()

  if (error) {
    showIn(authError, 'Не удалось загрузить профиль: ' + error.message)
    return
  }

  if (data && data.full_name && data.age) {
    currentProfile = data as Profile
    profileRegion.value = currentProfile.region || 'Алматы'
    regionSelect.value = currentProfile.region || 'Алматы'
    showSection('checker')
    void loadHistory(userId)
  } else {
    if (data) {
      profileName.value = data.full_name || ''
      profileAge.value = data.age ? String(data.age) : ''
      profileRegion.value = data.region || 'Алматы'
    }
    showSection('profile')
  }
}

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  hideIn(profileError)

  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) {
    showIn(profileError, 'Сессия истекла, войдите заново.')
    return
  }

  profileLoading.style.display = 'flex'
  try {
    const payload = {
      id: userId,
      full_name: profileName.value.trim(),
      age: Number(profileAge.value),
      region: profileRegion.value,
      updated_at: new Date().toISOString()
    }
    const { error } = await supabase.from('profiles').upsert(payload)
    if (error) throw error
    currentProfile = payload as Profile
    regionSelect.value = profileRegion.value
    showSection('checker')
    void loadHistory(userId)
  } catch (err) {
    showIn(profileError, err instanceof Error ? err.message : 'Не удалось сохранить профиль.')
  } finally {
    profileLoading.style.display = 'none'
  }
})

// ============================================================
// HISTORY
// ============================================================
async function loadHistory(userId: string) {
  const { data, error } = await supabase
    .from('resume_checks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error || !data || data.length === 0) {
    historyBlock.hidden = true
    return
  }

  historyBlock.hidden = false
  historyList.innerHTML = (data as ResumeCheck[])
    .map((row) => {
      const date = new Date(row.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
      const summary = row.result?.summary || ''
      return `<div class="history-item" data-id="${row.id}">
        <span class="history-item__date">${date}</span>
        <span class="history-item__summary">${escapeHtml(summary)}</span>
      </div>`
    })
    .join('')

  historyList.querySelectorAll<HTMLDivElement>('.history-item').forEach((item) => {
    item.addEventListener('click', () => {
      const row = (data as ResumeCheck[]).find((r) => r.id === item.dataset.id)
      if (row) {
        resumeInput.value = row.resume_text
        if (row.region) regionSelect.value = row.region
        renderResults(row.result)
      }
    })
  })
}

// ============================================================
// file text extraction
// ============================================================
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

  hideIn(errorState)
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

// ============================================================
// prompt
// ============================================================
function buildSystemPrompt(region: string): string {
  const name = currentProfile?.full_name || ''
  const age = currentProfile?.age || ''

  const resourcesForPrompt = KZ_RESOURCES.map((r) => `- ${r.title} (${r.url}): ${r.desc}`).join('\n')

  return `Ты — аналитик рынка труда, встроенный в сервис Көпір. Твоя задача: сопоставить описанный человеком опыт/навыки со списком реально дефицитных профессий Казахстана и вернуть строго JSON, без markdown, без пояснений вне JSON.

Вот официальный контекст по дефицитным профессиям, который нужно использовать как основу для матчинга (не выдумывай профессии вне духа этого списка, если только это не близкая по смыслу вариация):
${DEFICIT_LIST}

Данные о человеке: имя — ${name || 'не указано'}, возраст — ${age || 'не указан'}, регион — ${region}.
Учитывай возраст при подборе (не предлагай варианты, нереалистичные для этого возраста, например переучивание на многолетнюю специальность людям в возрасте, которым важна быстрая занятость).

Формат ответа — ТОЛЬКО валидный JSON следующей структуры, без обратных кавычек и без текста до/после:
{
  "summary": "1-2 предложения, честно и по-человечески описывающие ситуацию этого конкретного человека и общий вывод",
  "now": [
    {"title": "название вакансии/роли", "match": "например Высокое совпадение", "why": "2-3 предложения, конкретно почему подходит именно с ЕГО опытом — ссылайся на детали из описания", "salary": "реалистичная вилка зарплаты в тенге в месяц для этого региона Казахстана, например 350 000 – 500 000 ₸"}
  ],
  "plan": [
    {"title": "название дефицитной профессии-цели", "match": "например требует доучивания", "why": "почему это логичный следующий шаг с его текущим бэкграундом", "plan": ["шаг 1", "шаг 2", "шаг 3"], "timeline": "например 2-4 месяца", "salary": "реалистичная вилка зарплаты в тенге в месяц после переквалификации, например 400 000 – 600 000 ₸"}
  ]
}

Требования:
- "now" — ровно 2 (максимум 3, если оба варианта явно слабее) САМЫХ СИЛЬНЫХ варианта, которые подходят человеку УЖЕ СЕЙЧАС, без доучивания. Лучше 2 отличных, чем 4 посредственных. Каждое "why" должно быть развёрнутым и конкретным, а не общей фразой.
- "plan" — от 1 до 3 дефицитных профессий, которые реалистично достижимы для этого человека за короткий срок (недели-месяцы, не годы), с конкретным пошаговым планом (какие курсы, сертификаты, практика).
- "salary" — обязательно для каждой позиции, реалистичная вилка в тенге (₸) в месяц, ориентируйся на актуальный рынок труда Казахстана 2026 года по этому региону и профессии. Не выдумывай завышенные цифры — будь реалистичен.
- Пиши по-русски, конкретно, без общих фраз вроде "развивайте себя". Указывай реальные типы курсов/сертификатов там, где это уместно, но НЕ выдумывай конкретные названия компаний-курсов, кроме следующих реальных ресурсов, которые уже подключены к сервису и точно существуют — при уместности ссылайся на них по имени прямо в шагах плана ("шаг 2: пройдите курс на Skills Enbek..."):
${resourcesForPrompt}
Пользователь и так увидит карточки этих ресурсов отдельным блоком под планом, так что не обязательно упоминать их в каждом шаге — только там, где это действительно в тему.
- Если из описания видно, что человек уже близок к дефицитной профессии, честно скажи это в summary.
- Никогда не отвечай ничего, кроме JSON объекта.`
}

// ============================================================
// render
// ============================================================
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
  const salaryHtml = job.salary
    ? `<div class="job-card__salary">💰 ${escapeHtml(job.salary)}</div>`
    : ''
  return `
    <div class="job-card ${isNow ? 'job-card--now' : 'job-card--plan'}">
      <div class="job-card__head">
        <div class="job-card__title">${escapeHtml(job.title)}</div>
        <div class="job-card__match">${escapeHtml(job.match || '')}</div>
      </div>
      <div class="job-card__why">${escapeHtml(job.why)}</div>
      ${salaryHtml}
      ${planHtml}
    </div>`
}

function renderResults(parsed: any) {
  resultsSummary.textContent = parsed.summary || ''
  nowJobs.innerHTML =
    (parsed.now || []).map((j: any) => renderJobCard(j, 'now')).join('') ||
    '<p class="checker__empty">Прямых совпадений без доучивания не найдено — смотрите план ниже.</p>'
  planJobs.innerHTML =
    (parsed.plan || []).map((j: any) => renderJobCard(j, 'plan')).join('') ||
    '<p class="checker__empty">Дополнительный план не потребовался.</p>'

  renderResources()

  resultsBlock.style.display = 'block'
  resultsBlock.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ============================================================
// main analyze call (Gemini)
// ============================================================
async function analyze() {
  const text = resumeInput.value.trim()
  if (!text) {
    showIn(errorState, 'Опишите опыт или загрузите резюме — поле пустое.')
    return
  }

  const apiKey = GEMINI_API_KEY
  if (!apiKey || apiKey.includes('ВСТАВЬТЕ')) {
    showIn(errorState, 'Не настроен API-ключ. Откройте src/config.ts и вставьте ваш ключ Gemini в GEMINI_API_KEY, затем перезапустите npm run dev.')
    return
  }

  hideIn(errorState)
  resultsBlock.style.display = 'none'
  setLoading(true, 'Анализируем резюме…')

  const region = regionSelect.value
  const systemPrompt = buildSystemPrompt(region)

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            role: 'system',
            parts: [{ text: systemPrompt }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: `Вот мой опыт и навыки:\n\n${text}` }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.4,
            maxOutputTokens: 2000
          }
        })
      }
    )

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      if (response.status === 400 && /API key/i.test(detail)) {
        throw new Error('API-ключ отклонён. Проверьте ключ в src/config.ts.')
      }
      if (response.status === 403) {
        throw new Error('API-ключ отклонён (403). Проверьте ключ в src/config.ts.')
      }
      if (response.status === 429) {
        throw new Error('Превышен лимит бесплатного тарифа Gemini. Подождите немного и попробуйте снова.')
      }
      throw new Error(`Ошибка запроса к модели (${response.status}). ${detail.slice(0, 200)}`)
    }

    const data = await response.json()

    const finishReason = data?.candidates?.[0]?.finishReason
    if (finishReason && finishReason !== 'STOP') {
      throw new Error(`Модель не смогла завершить ответ (${finishReason}). Попробуйте сократить текст резюме и повторить.`)
    }

    const parts = data?.candidates?.[0]?.content?.parts || []
    const textPart = parts.map((p: any) => p.text).filter(Boolean).join('')
    if (!textPart) throw new Error('Модель не вернула текстовый ответ.')

    let clean = textPart.trim()
    clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '')
    const parsed = JSON.parse(clean)

    renderResults(parsed)

    // save to history (best-effort — don't block the UI on failure)
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user.id
    if (userId) {
      const { error: saveError } = await supabase.from('resume_checks').insert({
        user_id: userId,
        resume_text: text,
        region,
        result: parsed
      })
      if (!saveError) void loadHistory(userId)
    }
  } catch (err) {
    console.error(err)
    const message = err instanceof Error ? err.message : String(err)
    showIn(errorState, 'Не получилось выполнить анализ: ' + message)
  } finally {
    setLoading(false)
  }
}

submitBtn.addEventListener('click', analyze)
