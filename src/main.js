const TOTAL_STEPS = 4

const QUESTIONS = [
  {
    id: 'rooms',
    title: 'Сколько комнат рассматриваете?',
    options: [
      'Студия',
      '1-комнатная',
      '2-комнатная',
      '3-комнатная',
      'Пока не определился(ась)',
    ],
  },
  {
    id: 'purpose',
    title: 'Цель покупки',
    options: ['Для себя', 'Инвестиция', 'Пока не определился(ась)'],
  },
  {
    id: 'payment',
    title: 'Способ оплаты',
    options: ['Ипотека', 'Рассрочка', '100% оплата', 'Пока не определился(ась)'],
  },
]

const answers = {
  rooms: null,
  purpose: null,
  payment: null,
  phone: '',
}

let currentStep = 0
let isTransitioning = false
let focusedOptionIndex = 0

const app = document.querySelector('#app')

function formatPhone(digits) {
  const d = digits.slice(0, 10)
  const parts = [
    d.slice(0, 3),
    d.slice(3, 6),
    d.slice(6, 8),
    d.slice(8, 10),
  ].filter(Boolean)

  if (!d.length) return '+7 '

  let result = '+7'
  if (parts[0] !== undefined) result += ` (${parts[0]}`
  if (parts[0]?.length === 3) result += ')'
  if (parts[1]) result += ` ${parts[1]}`
  if (parts[2]) result += `-${parts[2]}`
  if (parts[3]) result += `-${parts[3]}`
  return result
}

function extractDigits(value) {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('8')) digits = digits.slice(1)
  if (digits.startsWith('7')) digits = digits.slice(1)
  return digits.slice(0, 10)
}

function isPhoneComplete(digits) {
  return digits.length === 10
}

function progressPercent(step) {
  return ((step + 1) / TOTAL_STEPS) * 100
}

function render() {
  if (currentStep === 4) {
    app.innerHTML = `
      <div class="quiz">
        ${renderBrand(false)}
        <section class="panel" aria-live="polite">
          <div class="view is-active success">
            <div class="success__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 class="success__title">Спасибо!</h2>
            <p class="success__text">
              Ваша заявка успешно отправлена.
              В ближайшее время Анна свяжется с вами и подготовит персональную подборку объектов.
            </p>
          </div>
        </section>
      </div>
    `
    return
  }

  const isContact = currentStep === 3
  const question = QUESTIONS[currentStep]

  app.innerHTML = `
    <div class="quiz">
      ${renderBrand(true)}
      <section class="panel" aria-labelledby="step-title">
        <div class="progress" aria-hidden="false">
          <div class="progress__meta">
            <span class="progress__step">Шаг ${currentStep + 1} из ${TOTAL_STEPS}</span>
            <span>${Math.round(progressPercent(currentStep))}%</span>
          </div>
          <div class="progress__track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progressPercent(currentStep))}">
            <div class="progress__fill" id="progress-fill"></div>
          </div>
        </div>

        <div class="stage" id="stage">
          <div class="view is-active" id="active-view" data-step="${currentStep}">
            ${
              isContact
                ? renderContact()
                : renderQuestion(question)
            }
          </div>
        </div>
      </section>
      ${!isContact ? '<p class="hint">Выберите вариант — переход автоматический · Enter / ↑↓</p>' : ''}
    </div>
  `

  bindEvents()

  const fill = document.getElementById('progress-fill')
  if (fill) {
    const from =
      currentStep === 0
        ? 0
        : progressPercent(Math.max(currentStep - 1, 0))
    fill.style.transition = 'none'
    fill.style.width = `${from}%`
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fill.style.transition = ''
        fill.style.width = `${progressPercent(currentStep)}%`
      })
    })
  }
}

function renderBrand(showTagline) {
  return `
    <header class="brand">
      <p class="brand__label">Риелтор</p>
      <h1 class="brand__name">Анна Вечеринина</h1>
      ${
        showTagline
          ? '<p class="brand__tagline">Персональная подборка новостроек за 1 минуту</p>'
          : ''
      }
    </header>
  `
}

function renderQuestion(question) {
  focusedOptionIndex = Math.max(
    0,
    question.options.findIndex((opt) => opt === answers[question.id]),
  )
  if (focusedOptionIndex < 0) focusedOptionIndex = 0

  return `
    <div class="question">
      <h2 class="question__title" id="step-title">${question.title}</h2>
    </div>
    <div class="options" role="listbox" aria-labelledby="step-title" id="options">
      ${question.options
        .map((option, index) => {
          const selected = answers[question.id] === option
          return `
            <button
              type="button"
              class="option${selected ? ' is-selected' : ''}"
              role="option"
              aria-selected="${selected}"
              data-value="${escapeAttr(option)}"
              data-index="${index}"
              tabindex="${index === focusedOptionIndex ? '0' : '-1'}"
            >
              <span class="option__marker" aria-hidden="true"></span>
              <span class="option__label">${option}</span>
            </button>
          `
        })
        .join('')}
    </div>
  `
}

function renderContact() {
  const digits = extractDigits(answers.phone)
  const display = formatPhone(digits)
  const valid = isPhoneComplete(digits)

  return `
    <div class="lead">
      <h2 class="lead__title" id="step-title">Остался последний шаг 🎉</h2>
      <p class="lead__text">
        Подберу для вас подходящие варианты новостроек с учетом ваших ответов.
        Оставьте номер телефона, и я лично свяжусь с вами, отвечу на вопросы и подготовлю индивидуальную подборку.
      </p>
    </div>
    <form class="form" id="lead-form" novalidate>
      <div class="field">
        <label class="field__label" for="phone">Телефон</label>
        <input
          class="field__input"
          id="phone"
          name="phone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          placeholder="+7 (___) ___-__-__"
          value="${escapeAttr(display.trim() === '+7' ? '' : display)}"
          aria-describedby="phone-error"
          aria-invalid="false"
        />
        <p class="field__error" id="phone-error" role="alert"></p>
      </div>
      <button class="btn" type="submit" id="submit-btn" ${valid ? '' : 'disabled'}>
        Получить подборку
      </button>
    </form>
  `
}

function escapeAttr(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function bindEvents() {
  if (currentStep < 3) {
    const options = [...document.querySelectorAll('.option')]
    options.forEach((btn) => {
      btn.addEventListener('click', () => selectOption(btn.dataset.value))
    })

    const optionsRoot = document.getElementById('options')
    optionsRoot?.addEventListener('keydown', (event) => {
      handleOptionKeys(event, options)
    })

    options[focusedOptionIndex]?.focus()
    return
  }

  if (currentStep === 3) {
    const input = document.getElementById('phone')
    const form = document.getElementById('lead-form')
    const submitBtn = document.getElementById('submit-btn')
    const error = document.getElementById('phone-error')

    input?.focus()

    input?.addEventListener('input', (event) => {
      const digits = extractDigits(event.target.value)
      answers.phone = digits
      event.target.value = formatPhone(digits).trim() === '+7' ? '+7 ' : formatPhone(digits)
      const complete = isPhoneComplete(digits)
      submitBtn.disabled = !complete
      input.classList.remove('is-invalid')
      input.setAttribute('aria-invalid', 'false')
      error.textContent = ''
    })

    input?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !submitBtn.disabled) {
        event.preventDefault()
        form.requestSubmit()
      }
    })

    form?.addEventListener('submit', (event) => {
      event.preventDefault()
      const digits = answers.phone
      if (!isPhoneComplete(digits)) {
        input.classList.add('is-invalid')
        input.setAttribute('aria-invalid', 'true')
        error.textContent = 'Введите номер полностью: +7 (XXX) XXX-XX-XX'
        submitBtn.disabled = true
        return
      }

      const payload = {
        rooms: answers.rooms,
        purpose: answers.purpose,
        payment: answers.payment,
        phone: `+7${digits}`,
        createdAt: new Date().toISOString(),
      }

      // Готово к подключению CRM / Telegram / Google Sheets
      console.info('Quiz lead:', payload)
      localStorage.setItem('anna-quiz-lead', JSON.stringify(payload))

      goToStep(4)
    })
  }
}

function handleOptionKeys(event, options) {
  const max = options.length - 1

  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    event.preventDefault()
    focusedOptionIndex = focusedOptionIndex >= max ? 0 : focusedOptionIndex + 1
    focusOption(options)
  } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
    event.preventDefault()
    focusedOptionIndex = focusedOptionIndex <= 0 ? max : focusedOptionIndex - 1
    focusOption(options)
  } else if (event.key === 'Home') {
    event.preventDefault()
    focusedOptionIndex = 0
    focusOption(options)
  } else if (event.key === 'End') {
    event.preventDefault()
    focusedOptionIndex = max
    focusOption(options)
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    const current = options[focusedOptionIndex]
    if (current) selectOption(current.dataset.value)
  }
}

function focusOption(options) {
  options.forEach((opt, index) => {
    opt.tabIndex = index === focusedOptionIndex ? 0 : -1
  })
  options[focusedOptionIndex]?.focus()
}

function selectOption(value) {
  if (isTransitioning || currentStep > 2) return

  const question = QUESTIONS[currentStep]
  answers[question.id] = value

  document.querySelectorAll('.option').forEach((btn) => {
    const selected = btn.dataset.value === value
    btn.classList.toggle('is-selected', selected)
    btn.setAttribute('aria-selected', String(selected))
  })

  isTransitioning = true
  window.setTimeout(() => {
    goToStep(currentStep + 1)
    isTransitioning = false
  }, 320)
}

function goToStep(nextStep) {
  const stage = document.getElementById('stage')
  const active = document.getElementById('active-view')

  if (!stage || !active || nextStep === currentStep) {
    currentStep = nextStep
    render()
    return
  }

  active.classList.add('is-leaving')
  active.classList.remove('is-active')

  window.setTimeout(() => {
    currentStep = nextStep
    render()
  }, 240)
}

render()
