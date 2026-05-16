const pages = ['home', 'events', 'announcements', 'about']
const buttons = Array.from(document.querySelectorAll('[data-page]'))
const mobileMenu = document.getElementById('mobileMenu')
const mobileMenuButton = document.getElementById('mobileMenuButton')
const desktopNav = document.getElementById('desktopNav')
const logoButton = document.getElementById('logoButton')

function setActivePage(page) {
  pages.forEach((key) => {
    const section = document.getElementById(key)
    if (section) {
      if (key === page) {
        section.classList.remove('hidden')
        // trigger transition
        requestAnimationFrame(() => section.classList.add('visible'))
      } else {
        // remove visible first, then hide after transition
        section.classList.remove('visible')
        setTimeout(() => section.classList.add('hidden'), 380)
      }
    }
  })

  buttons.forEach((button) => {
    const isActive = button.dataset.page === page
    button.classList.toggle('active', isActive)
  })

  if (mobileMenu) {
    mobileMenu.classList.remove('open')
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const page = button.dataset.page
    if (page) setActivePage(page)
  })
})

if (mobileMenuButton) {
  mobileMenuButton.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open')
    mobileMenuButton.setAttribute('aria-expanded', String(isOpen))
  })
}

if (logoButton) {
  logoButton.addEventListener('click', () => {
    setActivePage('home')
  })
}

// ensure initial visible class on load
document.addEventListener('DOMContentLoaded', () => {
  const activeSection = document.querySelector('.page-section:not(.hidden)')
  if (activeSection) requestAnimationFrame(() => activeSection.classList.add('visible'))
  // format dates on load
  formatDateElements()
})

// Dark mode removed — no theme toggle behavior

// Overlay handling for mobile menu
const menuOverlay = document.getElementById('menuOverlay')
if (mobileMenuButton) {
  mobileMenuButton.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open')
    // toggle overlay
    if (menuOverlay) menuOverlay.classList.toggle('open', isOpen)
  })
}
if (menuOverlay) {
  menuOverlay.addEventListener('click', () => {
    mobileMenu.classList.remove('open')
    mobileMenuButton.setAttribute('aria-expanded', 'false')
    menuOverlay.classList.remove('open')
  })
}

// Logo fallback: if image fails or not visible, replace with inline SVG text
function ensureLogo() {
  const brand = document.querySelector('.brand')
  const img = brand && brand.querySelector('img')
  if (!img) return
  const failed = () => {
    if (!brand) return
    brand.innerHTML = `
      <div class="brand-icon" style="display:grid;place-items:center;width:3rem;height:3rem;border-radius:1rem;background:#1E3A8A;color:#fff;font-weight:800;">MBA</div>
      <div class="brand-text"><span class="brand-label">MBA Aspendos Kampüsü</span><span class="brand-subtitle">Bilgi Portalı</span></div>
    `
  }
  img.addEventListener('error', failed)
  // if zero size, treat as failed
  setTimeout(() => {
    if (img.naturalWidth === 0) failed()
  }, 300)
}
ensureLogo()

// Clock and calendar (Istanbul timezone)
const clockWidget = document.getElementById('clockWidget')
const calendarPopup = document.getElementById('calendarPopup')

function updateClock() {
  try {
    const now = new Date()
    const istOptions = { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit' }
    const dateOptions = { timeZone: 'Europe/Istanbul', day: '2-digit', month: 'short', year: 'numeric' }
    const time = new Intl.DateTimeFormat('tr-TR', istOptions).format(now)
    const date = new Intl.DateTimeFormat('tr-TR', dateOptions).format(now)
    if (clockWidget) clockWidget.textContent = `${time} · ${date}`
  } catch (e) {
    if (clockWidget) clockWidget.textContent = new Date().toLocaleTimeString()
  }
}
setInterval(updateClock, 1000)
updateClock()

// Simple calendar renderer for the current Istanbul month with event markers
function renderCalendar(container) {
  if (!container) return
  const now = new Date()
  const tzDate = new Date(new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Istanbul', year: 'numeric', month: 'numeric', day: 'numeric' }).format(now))
  const year = tzDate.getFullYear()
  const month = tzDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = tzDate.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })

  let html = `<div class="cal-header"><strong>${monthName}</strong></div><div class="cal-grid">`
  // week day headers
  const wk = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz']
  html += '<div class="cal-weekdays">'
  for (let d=0; d<7; d++) html += `<div class="cal-wd">${wk[d]}</div>`
  html += '</div>'

  html += '<div class="cal-days">'
  // fill blanks (assuming week starts Monday)
  let blanks = (firstDay + 6) % 7 // convert Sun(0) to 6, Mon->0
  for (let i=0;i<blanks;i++) html += '<div class="cal-day empty"></div>'
  for (let d=1; d<=daysInMonth; d++) {
    const isToday = d === tzDate.getDate()
    let classes = 'cal-day'
    if (isToday) classes += ' today'
    html += `<div class="${classes}">${d}</div>`
  }
  html += '</div></div>'
  container.innerHTML = html
}

// Format all time elements for announcements and events to Istanbul locale
function formatDateElements() {
  try {
    const elems = Array.from(document.querySelectorAll('time.announcement-date, time.event-date'))
    elems.forEach((el) => {
      const raw = el.getAttribute('datetime') || el.textContent
      if (!raw) return
      // parse ISO if possible
      const d = new Date(raw)
      if (isNaN(d)) {
        // fallback: keep original text
        return
      }
      // format to Turkish locale — show full date and time if available
      const hasTime = /T\d{2}:\d{2}/.test(raw)
      const opts = hasTime
        ? { timeZone: 'Europe/Istanbul', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { timeZone: 'Europe/Istanbul', day: '2-digit', month: 'long', year: 'numeric' }
      const out = new Intl.DateTimeFormat('tr-TR', opts).format(d)
      el.textContent = out
    })
  } catch (e) {
    // ignore formatting errors
  }
}

if (clockWidget) {
  // clicking the clock widget toggles the calendar popup
  clockWidget.addEventListener('click', (e) => {
    e.preventDefault()
    if (!calendarPopup) return
    const isHidden = calendarPopup.classList.contains('hidden')
    if (isHidden) {
      renderCalendar(calendarPopup)
      calendarPopup.classList.remove('hidden')
      calendarPopup.setAttribute('aria-hidden','false')
    } else {
      calendarPopup.classList.add('hidden')
      calendarPopup.setAttribute('aria-hidden','true')
    }
  })
}

// close calendar when clicking outside
document.addEventListener('click', (e) => {
  const target = e.target
  if (calendarPopup && !calendarPopup.contains(target) && !(clockWidget && clockWidget.contains(target))) {
    calendarPopup.classList.add('hidden')
    calendarPopup.setAttribute('aria-hidden','true')
  }
})