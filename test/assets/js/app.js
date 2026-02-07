const modal = document.querySelector('.modal');
const modalPanel = document.querySelector('.modal__panel');
const modalTitle = document.querySelector('[data-modal-title]');
const modalIntro = document.querySelector('[data-modal-intro]');
const roleInput = document.querySelector('input[name="role"]');
const pageUrlInput = document.querySelector('input[name="page_url"]');
const timestampInput = document.querySelector('input[name="timestamp"]');
const subjectInput = document.querySelector('input[name="_subject"]');
const replyToInput = document.querySelector('input[name="_replyto"]');
const honeypotInput = document.querySelector('input[name="_gotcha"]');
const form = document.getElementById('mki-form');
const successPanel = document.querySelector('.success');
const successTitle = document.querySelector('[data-success-title]');
const successMessage = document.querySelector('[data-success-message]');
const errorMessage = document.querySelector('[data-form-error]');
const submitBtn = document.querySelector('[data-submit]');
const consentBanner = document.querySelector('.consent');
const consentBtn = document.querySelector('[data-consent]');
const roleSections = Array.from(document.querySelectorAll('[data-role-section]'));

const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
let lastFocused = null;
let activeRole = null;

const roleConfig = {
  opdrachtgever: {
    title: 'Vraag stellen als opdrachtgever',
    intro: 'Kies kort wat past, dan nemen we gericht contact op.',
    subject: 'Opdrachtgever',
    value: 'opdrachtgever'
  },
  opdrachtnemer: {
    title: 'Vraag stellen als opdrachtnemer',
    intro: 'Kies kort wat past, dan nemen we gericht contact op.',
    subject: 'Opdrachtnemer',
    value: 'opdrachtnemer'
  },
  leverancier_producent: {
    title: 'Vraag stellen als leverancier / producent',
    intro: 'Kies kort wat past, dan nemen we gericht contact op.',
    subject: 'Leverancier / Producent',
    value: 'leverancier_producent'
  }
};

const setActiveRole = (roleKey) => {
  roleSections.forEach((section) => {
    const isActive = section.dataset.roleSection === roleKey;
    section.classList.toggle('is-active', isActive);
    section.querySelectorAll('input, select, textarea').forEach((field) => {
      field.disabled = !isActive;
    });
  });
};

const openModal = (roleKey) => {
  if (!modal) return;
  const config = roleConfig[roleKey];
  if (!config) return;
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  activeRole = roleKey;
  resetForm();
  modalTitle.textContent = config.title;
  modalIntro.textContent = config.intro;
  roleInput.value = config.value;
  subjectInput.value = `Nieuwe aanvraag MKI Expertisecentrum – ${config.subject}`;
  lastFocused = document.activeElement;
  const firstFocusable = modal.querySelector(focusableSelectors);
  firstFocusable?.focus();
};

const closeModal = () => {
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  if (lastFocused) lastFocused.focus();
};

const resetForm = () => {
  form.reset();
  successPanel.hidden = true;
  if (successTitle) successTitle.textContent = '';
  if (successMessage) successMessage.textContent = '';
  form.hidden = false;
  errorMessage.hidden = true;
  submitBtn.disabled = false;
  submitBtn.textContent = 'Verstuur';
  form.querySelectorAll('[data-max-warning]').forEach((warning) => {
    warning.hidden = true;
  });
  if (activeRole) {
    setActiveRole(activeRole);
  }
};

const trapFocus = (event) => {
  if (!modal || modal.hidden) return;
  if (event.key !== 'Tab') return;
  const focusable = Array.from(modal.querySelectorAll(focusableSelectors));
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

const enforceMaxChecks = (fieldset, target) => {
  const max = Number(fieldset.dataset.maxChecks);
  const checked = fieldset.querySelectorAll('input[type="checkbox"]:checked');
  const warning = fieldset.querySelector('[data-max-warning]');
  if (checked.length > max) {
    target.checked = false;
    if (warning) warning.hidden = false;
    return;
  }
  if (warning) warning.hidden = true;
};

const setupAccordion = () => {
  const items = document.querySelectorAll('.accordion-item');
  items.forEach((item) => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');
    trigger?.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  });
};

const setupConsent = () => {
  if (!consentBanner || !consentBtn) return;
  const hasConsent = localStorage.getItem('ga-consent') === 'true';
  if (hasConsent) {
    consentBanner.hidden = true;
    loadAnalytics();
  }
  consentBtn.addEventListener('click', () => {
    localStorage.setItem('ga-consent', 'true');
    consentBanner.hidden = true;
    loadAnalytics();
  });
};

const loadAnalytics = () => {
  if (document.getElementById('ga4-script')) return;
  const id = 'G-XXXXXXXXXX';
  if (id.includes('XXXX')) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  script.id = 'ga4-script';
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', id);
};

setupAccordion();
setupConsent();

const ctaButtons = document.querySelectorAll('.cta-card');
ctaButtons.forEach((button) => {
  button.addEventListener('click', () => openModal(button.dataset.role));
});

modal?.addEventListener('click', (event) => {
  if (event.target.matches('[data-close]')) closeModal();
});

modalPanel?.addEventListener('click', (event) => {
  if (event.target.matches('[data-close]')) closeModal();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal && !modal.hidden) {
    closeModal();
  }
  trapFocus(event);
});

form?.addEventListener('change', (event) => {
  if (event.target?.name === 'email') {
    replyToInput.value = event.target.value;
  }
  if (event.target?.type === 'checkbox') {
    const fieldset = event.target.closest('[data-max-checks]');
    if (fieldset) enforceMaxChecks(fieldset, event.target);
  }
});

form?.addEventListener('submit', async (event) => {
  if (!form.checkValidity()) {
    event.preventDefault();
    form.reportValidity();
    return;
  }
  if (honeypotInput && honeypotInput.value) {
    event.preventDefault();
    return;
  }

  event.preventDefault();
  errorMessage.hidden = true;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Versturen…';
  if (pageUrlInput) pageUrlInput.value = window.location.href;
  if (timestampInput) timestampInput.value = new Date().toISOString();
  if (replyToInput) {
    const emailField = form.querySelector('input[name="email"]');
    replyToInput.value = emailField?.value || '';
  }
  const formData = new FormData(form);
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json'
      }
    });
    if (!response.ok) throw new Error('Submit failed');
    form.hidden = true;
    if (successTitle) successTitle.textContent = 'Verzonden';
    if (successMessage) {
      successMessage.textContent =
        'Dank! Je aanvraag is verstuurd. We nemen meestal binnen 1–2 werkdagen contact op.';
    }
    successPanel.hidden = false;
  } catch (error) {
    errorMessage.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Verstuur';
  }
});
