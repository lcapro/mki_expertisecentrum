const modal = document.querySelector('.modal');
const modalPanel = document.querySelector('.modal__panel');
const roleOutput = document.querySelector('[data-role-output]');
const roleInput = document.querySelector('input[name="role"]');
const replyToInput = document.querySelector('input[name="_replyto"]');
const form = document.getElementById('mki-form');
const successPanel = document.querySelector('.success');
const summary = document.querySelector('[data-summary]');
const stepOutput = document.querySelector('[data-step]');
const nextBtn = document.querySelector('[data-next]');
const prevBtn = document.querySelector('[data-prev]');
const submitBtn = document.querySelector('[data-submit]');
const consentBanner = document.querySelector('.consent');
const consentBtn = document.querySelector('[data-consent]');

const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
let currentStep = 1;
let lastFocused = null;

const openModal = (role) => {
  if (!modal) return;
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  roleOutput.textContent = role;
  roleInput.value = role;
  resetForm();
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

const updateStepUI = () => {
  const steps = Array.from(document.querySelectorAll('.form-step'));
  steps.forEach((step) => {
    const stepIndex = Number(step.dataset.step);
    step.hidden = stepIndex !== currentStep;
  });
  stepOutput.textContent = `Stap ${currentStep}/4`;
  prevBtn.hidden = currentStep === 1;
  nextBtn.hidden = currentStep === 4;
  submitBtn.hidden = currentStep !== 4;
};

const validateCurrentStep = () => {
  const step = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  if (!step) return false;
  const fields = Array.from(step.querySelectorAll('input, textarea'));
  for (const field of fields) {
    if (!field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }
  if (currentStep === 3) {
    const checked = step.querySelectorAll('input[type="checkbox"]:checked');
    if (checked.length === 0 || checked.length > 3) {
      alert('Selecteer maximaal 3 doelen.');
      return false;
    }
  }
  return true;
};

const resetForm = () => {
  form.reset();
  successPanel.hidden = true;
  form.hidden = false;
  currentStep = 1;
  updateStepUI();
  summary.innerHTML = '';
  const conditional = document.querySelector('.conditional');
  conditional?.classList.remove('is-active');
};

const buildSummary = (formData) => {
  const entries = [];
  for (const [key, value] of formData.entries()) {
    if (['_subject', '_replyto', '_format'].includes(key)) continue;
    if (key === 'consent') continue;
    if (key === 'goal') {
      entries.push(`Doelen: ${formData.getAll('goal').join(', ')}`);
      continue;
    }
    if (value) entries.push(`${key}: ${value}`);
  }
  summary.innerHTML = `<ul>${entries.map((item) => `<li>${item}</li>`).join('')}</ul>`;
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

const enableConditional = () => {
  const trigger = document.querySelector('[data-conditional="issue"]');
  const conditional = document.querySelector('.conditional');
  if (!trigger || !conditional) return;
  if (trigger.checked) {
    conditional.classList.add('is-active');
    conditional.focus();
  } else {
    conditional.classList.remove('is-active');
    conditional.value = '';
  }
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

nextBtn?.addEventListener('click', () => {
  if (!validateCurrentStep()) return;
  currentStep = Math.min(4, currentStep + 1);
  updateStepUI();
});

prevBtn?.addEventListener('click', () => {
  currentStep = Math.max(1, currentStep - 1);
  updateStepUI();
});

form?.addEventListener('change', (event) => {
  if (event.target?.name === 'issue') enableConditional();
  if (event.target?.name === 'email') {
    replyToInput.value = event.target.value;
  }
});

form?.addEventListener('submit', async (event) => {
  if (!validateCurrentStep()) {
    event.preventDefault();
    return;
  }
  if (!form.checkValidity()) {
    event.preventDefault();
    form.reportValidity();
    return;
  }

  event.preventDefault();
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
    buildSummary(formData);
    form.hidden = true;
    successPanel.hidden = false;
  } catch (error) {
    alert('Verzenden lukt nu niet. Probeer het later opnieuw.');
  }
});
