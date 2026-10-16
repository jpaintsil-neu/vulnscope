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
  if (currentPath === href) {
    return 'aria-current="page"';
  }

  // Keep FAQs within Resources.
  if (currentPath === "/faqs.html" && href === "/resources.html") {
    return 'aria-current="true"';
  }

  // Keep record pages within Vulnerabilities.
  if (
    ["/vulnerability.html", "/vulnerability-form.html"].includes(currentPath) &&
    href === "/vulnerabilities.html"
  ) {
    return 'aria-current="true"';
  }

  return "";

  // keeps product record pages within products
  if (
    ["/product-details.html", "/product-form.html"].includes(currentPath) &&
    href === "/products.html"
  ) {
    return 'aria-current="true"';
  }
}

/**
 * Builds the shared brand link.
 */
function brandMarkup(extraClass = "") {
  return `
    <a class="brand ${extraClass}" href="/" aria-label="VulnScope home">
      <!-- Decorative brand logo. -->
      <img
        class="brand-logo"
        src="/images/logo.png"
        alt=""
        width="44"
        height="44"
      />

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
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
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
const dataIcon = icon(`
  <ellipse cx="12" cy="5" rx="8" ry="3" />
  <path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0" />
`);

const faqIcon = icon(`
  <circle cx="12" cy="12" r="9" />
  <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4" />
  <path d="M12 17h.01" />
`);

const feedbackIcon = icon(`
  <path d="M4 4h16v12H9l-5 4Z" />
  <path d="M8 8h8M8 12h5" />
`);

const githubIcon = icon(`
  <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16" />
`);

// Render the shared header.
document.querySelector("#site-header").innerHTML = `
  <div class="header-inner">
    <!-- Header brand and tagline. -->
    <div class="header-brand-group">
      ${brandMarkup()}
      <p class="brand-tagline">Understand. Track. Act.</p>
    </div>

    <!-- Mobile menu control. -->
    <button
      class="menu-toggle"
      type="button"
      aria-controls="primary-navigation"
      aria-expanded="false"
    >
      Menu
    </button>

    <!-- Mark the current page. -->
    <nav
      id="primary-navigation"
      class="primary-navigation"
      aria-label="Primary navigation"
    >
      ${links
        .map(
          ([label, href]) => `
            <a href="${href}" ${navigationState(href)}>${label}</a>
          `,
        )
        .join("")}
    </nav>

    <!-- Account workflow placeholder. -->
    <button
      class="account-control"
      type="button"
      disabled
      aria-label="Create Account / Log In — coming soon"
      title="Account access is coming soon"
    >
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

      <!-- Current-year copyright. -->
      <p>&copy; ${new Date().getFullYear()} VulnScope.</p>
    </div>

    <!-- Data, help, and project links. -->
    <nav class="footer-navigation" aria-label="Footer navigation">
      <a href="/about.html#data-heading">
        ${dataIcon}<span>About the Data</span>
      </a>

      <a href="/faqs.html">
        ${faqIcon}<span>FAQs</span>
      </a>

      <a
        href="https://github.com/jpaintsil-neu/vulnscope/issues"
        title="Feedback through public GitHub issues"
      >
        ${feedbackIcon}<span>Feedback</span>
        <span class="visually-hidden"> (public GitHub issues)</span>
      </a>

      <a href="https://github.com/jpaintsil-neu/vulnscope">
        ${githubIcon}<span>GitHub</span>
      </a>
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
