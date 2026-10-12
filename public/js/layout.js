// Shared navigation destinations.
const links = [
  ["Home", "/"],
  ["Vulnerabilities", "/vulnerabilities.html"],
  ["Products", "/products.html"],
  ["Resources", "/resources.html"],
  ["About", "/about.html"],
];

// Normalize the homepage path.
const currentPath =
  window.location.pathname === "/index.html" ? "/" : window.location.pathname;

/**
 * Identifies the current navigation item.
 */
function navigationState(href) {
  // Mark the actual page.
  if (currentPath === href) {
    return 'aria-current="page"';
  }

  // Keep FAQs within Resources.
  if (currentPath === "/faqs.html" && href === "/resources.html") {
    return 'aria-current="true"';
  }
  // Keep details within Vulnerabilities.
  if (
    currentPath === "/vulnerability.html" &&
    href === "/vulnerabilities.html"
  ) {
    return 'aria-current="true"';
  }

  return "";
}
/**
 * Builds the shared brand link.
 */
function brandMarkup(extraClass = "") {
  return `
      <a class="brand ${extraClass}" href="/" aria-label="VulnScope home">
        <!-- Decorative brand logo. -->
        <img class="brand-logo" src="/images/logo.png"
          alt="" width="44" height="44" />
  
        <!-- Contrasting wordmark colors. -->
        <span class="brand-name" aria-hidden="true">
          <span class="brand-vuln">Vuln</span><span class="brand-scope">Scope</span>
        </span>
      </a>
    `;
}

/**
 * Wraps decorative SVG icons.
 */
const icon = (content) => `
    <svg viewBox="0 0 24 24" width="20" height="20"
      fill="none" stroke="currentColor" stroke-width="1.7"
      stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true">
      ${content}
    </svg>
  `;

// Header account icon.
const accountIcon = icon(`
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="9" r="3" />
    <path d="M6 18c1-5 11-5 12 0" />
  `);

// Footer reference icons.
const privacyIcon = icon(`
    <path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6Z" />
  `);

const faqIcon = icon(`
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4" />
    <path d="M12 17h.01" />
  `);

const contactIcon = icon(`
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 6 9 7 9-7" />
  `);

// Render the shared header.
document.querySelector("#site-header").innerHTML = `
    <div class="header-inner">
      ${brandMarkup()}
  
      <!-- Mobile menu control. -->
      <button class="menu-toggle" type="button"
        aria-controls="primary-navigation" aria-expanded="false">
        Menu
      </button>
  
      <!-- Mark the current page. -->
      <nav id="primary-navigation" class="primary-navigation"
        aria-label="Primary navigation">
        ${links
          .map(
            ([label, href]) => `
                <a href="${href}" ${navigationState(href)}>
                  ${label}
                </a>
              `,
          )
          .join("")}
      </nav>
  
      <!-- Account workflow placeholder. -->
      <button class="account-control" type="button" disabled
        aria-label="Create Account / Log In — coming soon"
        title="Account access is coming soon">
        ${accountIcon}
        <span>Create Account / Log In</span>
      </button>
    </div>
  `;

// Render the shared footer.
document.querySelector("#site-footer").innerHTML = `
    <div class="footer-inner">
      <div class="footer-brand-group">
        ${brandMarkup("footer-brand")}
        <p>Understand. Track. Act.</p>
      </div>
  
      <!-- Standard reference links. -->
      <nav class="footer-navigation" aria-label="Footer navigation">
        <a href="/privacy.html">${privacyIcon}<span>Privacy Policy</span></a>
        <a href="/faqs.html">${faqIcon}<span>FAQs</span></a>
        <a href="/contact.html">${contactIcon}<span>Contact</span></a>
      </nav>
    </div>
  `;

// Select rendered menu elements.
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");

/**
 * Closes the mobile menu.
 */
function closeMenu() {
  // Synchronize state and visibility.
  menuButton.setAttribute("aria-expanded", "false");
  navigation.classList.remove("is-open");
}

// Toggle the mobile menu.
menuButton.addEventListener("click", () => {
  const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isExpanded));
  navigation.classList.toggle("is-open", !isExpanded);
});

// Close after link selection.
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

// Escape restores button focus.
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuButton.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuButton.focus();
  }
});

// Reset menu on desktop.
const desktopViewport = window.matchMedia("(min-width: 1101px)");

desktopViewport.addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});
