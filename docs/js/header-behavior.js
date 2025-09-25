function setupSmartHeader() {
  const header = document.getElementById("smart-header");
  if (!header) return;

  let lastScroll = window.scrollY;

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;

    if (currentScroll > lastScroll && currentScroll > 50) {
      header.classList.remove("top-0");
      header.classList.add("-top-full");
    } else {
      header.classList.remove("-top-full");
      header.classList.add("top-0");
    }

    lastScroll = currentScroll;
  });
}

function setupMobileMenuToggle() {
  const button = document.getElementById("mobile-menu-button");
  const menu = document.getElementById("mobile-menu");
  if (!button || !menu) return;

  button.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });
}

function setupDropdownToggles() {
  document.querySelectorAll("[data-dropdown-toggle]").forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = toggle.getAttribute("data-dropdown-toggle");
      const dropdown = document.getElementById(targetId);
      if (dropdown) dropdown.classList.toggle("hidden");
    });
  });
}

function setupDesktopDropdowns() {
  const buttons = document.querySelectorAll("[data-dropdown-id]");
  buttons.forEach((btn) => {
    const dropdownId = btn.getAttribute("data-dropdown-id");
    const dropdown = document.querySelector(`[data-dropdown-content='${dropdownId}']`);

    if (!dropdown) return;

    let hideTimeout;

    btn.addEventListener("mouseenter", () => {
      clearTimeout(hideTimeout);
      dropdown.classList.remove("hidden");
    });

    btn.addEventListener("mouseleave", () => {
      hideTimeout = setTimeout(() => dropdown.classList.add("hidden"), 150);
    });

    dropdown.addEventListener("mouseenter", () => {
      clearTimeout(hideTimeout);
      dropdown.classList.remove("hidden");
    });

    dropdown.addEventListener("mouseleave", () => {
      hideTimeout = setTimeout(() => dropdown.classList.add("hidden"), 150);
    });
  });
}

// Wacht tot de header is geladen
const observer = new MutationObserver(() => {
  const header = document.getElementById("smart-header");
  if (header) {
    setupSmartHeader();
    setupMobileMenuToggle();
    setupDropdownToggles();
    setupDesktopDropdowns();
    observer.disconnect();
  }
});

const target = document.getElementById("main-header");
if (target) {
  observer.observe(target, { childList: true, subtree: true });
}
