function setupSmartHeader() {
  const header = document.getElementById("smart-header");
  if (!header) return;

  let lastScroll = window.scrollY;

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;

    if (currentScroll > lastScroll && currentScroll > 50) {
      // Naar beneden scrollen – verberg de header
      header.classList.remove("top-0");
      header.classList.add("-top-full");
    } else {
      // Naar boven scrollen – toon de header
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
      if (dropdown) {
        dropdown.classList.toggle("hidden");
      }
    });
  });
}

// Gebruik MutationObserver om te wachten tot #smart-header is toegevoegd
const observer = new MutationObserver(() => {
  const header = document.getElementById("smart-header");
  if (header) {
    setupSmartHeader();
    setupMobileMenuToggle();
    setupDropdownToggles();
    observer.disconnect(); // stop zodra gevonden
  }
});

const target = document.getElementById("main-header");
if (target) {
  observer.observe(target, { childList: true, subtree: true });
}
