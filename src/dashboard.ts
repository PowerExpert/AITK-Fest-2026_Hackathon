import './index.css'
import './check.css'
import './dashboard.css'
import { supabase, supabaseConfigured, type Profile, type ResumeCheck } from './lib/supabaseClient'

// ---------- element refs ----------
const accountBar = document.getElementById('accountBar') as HTMLDivElement
const accountEmail = document.getElementById('accountEmail') as HTMLSpanElement
const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement

const dashName = document.getElementById('dashName') as HTMLSpanElement
const dashLoading = document.getElementById('dashLoading') as HTMLDivElement
const dashError = document.getElementById('dashError') as HTMLDivElement
const dashContent = document.getElementById('dashContent') as HTMLDivElement

const viewName = document.getElementById('viewName') as HTMLElement
const viewAge = document.getElementById('viewAge') as HTMLElement
const viewRegion = document.getElementById('viewRegion') as HTMLElement
const viewEmail = document.getElementById('viewEmail') as HTMLElement

const profileView = document.getElementById('profileView') as HTMLDivElement
const editProfileBtn = document.getElementById('editProfileBtn') as HTMLButtonElement
const profileEditForm = document.getElementById('profileEditForm') as HTMLFormElement
const cancelEditBtn = document.getElementById('cancelEditBtn') as HTMLButtonElement
const editName = document.getElementById('editName') as HTMLInputElement
const editAge = document.getElementById('editAge') as HTMLInputElement
const editRegion = document.getElementById('editRegion') as HTMLSelectElement

const resumePreview = document.getElementById('resumePreview') as HTMLParagraphElement
const resumeEmpty = document.getElementById('resumeEmpty') as HTMLParagraphElement
const resumeDate = document.getElementById('resumeDate') as HTMLParagraphElement

const dashNowJobs = document.getElementById('dashNowJobs') as HTMLDivElement
const dashPlanJobs = document.getElementById('dashPlanJobs') as HTMLDivElement
const dashResourcesList = document.getElementById('dashResourcesList') as HTMLDivElement
const dashDownloadPdfBtn = document.getElementById('dashDownloadPdfBtn') as HTMLButtonElement
const dashPrintDate = document.getElementById('dashPrintDate') as HTMLSpanElement
const historyBlock = document.getElementById('historyBlock') as HTMLDivElement
const historyList = document.getElementById('historyList') as HTMLDivElement

// real retraining resources (Kazakhstan) — kept in sync with check.ts
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
  dashResourcesList.innerHTML = KZ_RESOURCES.map(
    (r) => `<div class="resource-card">
        <div class="resource-card__body">
          <div class="resource-card__title">${escapeHtml(r.title)}</div>
          <div class="resource-card__desc">${escapeHtml(r.desc)}</div>
        </div>
        <a class="resource-card__link" href="${r.url}" target="_blank" rel="noopener noreferrer">открыть →</a>
      </div>`
  ).join('')
}

dashDownloadPdfBtn.addEventListener('click', () => {
  dashPrintDate.textContent = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  window.print()
})

// ---------- state ----------
let currentUserId: string | null = null
let currentProfile: Profile | null = null
let checks: ResumeCheck[] = []

// ---------- helpers ----------
function escapeHtml(str: unknown): string {
  const d = document.createElement('div')
  d.textContent = str == null ? '' : String(str)
  return d.innerHTML
}

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
  const salaryHtml = job.salary ? `<div class="job-card__salary">💰 ${escapeHtml(job.salary)}</div>` : ''
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ---------- rendering ----------
function showCheck(row: ResumeCheck) {
  resumePreview.hidden = false
  resumeEmpty.hidden = true
  resumePreview.textContent = row.resume_text
  resumeDate.textContent = `проверено: ${formatDate(row.created_at)}`

  const result = row.result || {}
  dashNowJobs.innerHTML =
    (result.now || []).map((j: any) => renderJobCard(j, 'now')).join('') ||
    '<p class="checker__empty">Прямых совпадений без доучивания не найдено.</p>'
  dashPlanJobs.innerHTML =
    (result.plan || []).map((j: any) => renderJobCard(j, 'plan')).join('') ||
    '<p class="checker__empty">Дополнительный план не потребовался.</p>'
}

function renderAll() {
  const fullName = currentProfile?.full_name || ''
  dashName.textContent = fullName || 'там'
  viewName.textContent = fullName || '—'
  viewAge.textContent = currentProfile?.age ? String(currentProfile.age) : '—'
  viewRegion.textContent = currentProfile?.region || '—'
  viewEmail.textContent = accountEmail.textContent || '—'

  if (checks.length === 0) {
    resumePreview.hidden = true
    resumeEmpty.hidden = false
    resumeDate.textContent = ''
    dashNowJobs.innerHTML = '<p class="checker__empty">Пока нет результатов — пройдите проверку резюме.</p>'
    dashPlanJobs.innerHTML = ''
    dashResourcesList.innerHTML = ''
    historyBlock.hidden = true
    return
  }

  renderResources()
  showCheck(checks[0])

  historyBlock.hidden = false
  historyList.innerHTML = checks
    .map(
      (c) => `<div class="history-item" data-id="${c.id}">
        <span class="history-item__date">${formatDate(c.created_at)}</span>
        <span class="history-item__summary">${escapeHtml(c.result?.summary || '')}</span>
      </div>`
    )
    .join('')

  historyList.querySelectorAll<HTMLDivElement>('.history-item').forEach((item) => {
    item.addEventListener('click', () => {
      const row = checks.find((c) => c.id === item.dataset.id)
      if (row) {
        showCheck(row)
        document.getElementById('resumePreview')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
  })
}

// ---------- profile edit ----------
function openEdit() {
  editName.value = currentProfile?.full_name || ''
  editAge.value = currentProfile?.age ? String(currentProfile.age) : ''
  editRegion.value = currentProfile?.region || 'Алматы'
  profileView.hidden = true
  profileEditForm.hidden = false
}
function closeEdit() {
  profileView.hidden = false
  profileEditForm.hidden = true
}
editProfileBtn.addEventListener('click', openEdit)
cancelEditBtn.addEventListener('click', closeEdit)

profileEditForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  if (!currentUserId) return
  const payload = {
    id: currentUserId,
    full_name: editName.value.trim(),
    age: Number(editAge.value),
    region: editRegion.value,
    updated_at: new Date().toISOString()
  }
  const { error } = await supabase.from('profiles').upsert(payload)
  if (error) {
    dashError.textContent = 'Не удалось сохранить изменения: ' + error.message
    dashError.style.display = 'block'
    return
  }
  currentProfile = payload as Profile
  dashError.style.display = 'none'
  renderAll()
  closeEdit()
})

// ---------- logout ----------
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut()
})

// ---------- load & init ----------
async function loadProfile(userId: string): Promise<boolean> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) {
    dashError.textContent = 'Не удалось загрузить профиль: ' + error.message
    dashError.style.display = 'block'
    return false
  }
  if (!data || !data.full_name || !data.age) {
    // profile not completed yet — that flow lives on check.html
    window.location.href = './check.html'
    return false
  }
  currentProfile = data as Profile
  return true
}

async function loadChecks(userId: string) {
  const { data } = await supabase
    .from('resume_checks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)
  checks = (data as ResumeCheck[]) || []
}

async function init() {
  if (!supabaseConfigured) {
    dashLoading.style.display = 'none'
    dashError.textContent = 'Supabase не настроен. Откройте src/config.ts и заполните SUPABASE_URL и SUPABASE_ANON_KEY.'
    dashError.style.display = 'block'
    return
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const session = sessionData.session
  if (!session) {
    window.location.href = './check.html'
    return
  }

  currentUserId = session.user.id
  accountEmail.textContent = session.user.email || ''
  accountBar.classList.add('account-bar--visible')

  const ok = await loadProfile(currentUserId)
  if (!ok) return

  await loadChecks(currentUserId)
  renderAll()

  dashLoading.style.display = 'none'
  dashContent.style.display = 'block'
}

supabase.auth.onAuthStateChange((_event, session) => {
  if (!session) {
    window.location.href = './check.html'
  }
})

init()
