// Results elements.
const tableBody = document.querySelector("#vulnerability-records");
const tableRegion = document.querySelector("#vulnerability-results");
const resultsHeading = document.querySelector("#results-heading");
const resultsCount = document.querySelector("#results-count");
const resultsStatus = document.querySelector("#results-status");
const retryButton = document.querySelector("#results-retry");

// Select both paging toolbars.
const pageSummaries = document.querySelectorAll("[data-page-summary]");
const previousButtons = document.querySelectorAll("[data-previous-page]");
const nextButtons = document.querySelectorAll("[data-next-page]");

// Search and filter elements.
const filterForm = document.querySelector("#vulnerability-filters");
const filterControls = document.querySelector("#filter-controls");
const queryInput = document.querySelector("#vulnerability-query");
const severitySelect = document.querySelector("#severity-filter");
const clearFiltersButton = document.querySelector("#clear-filters");

// Current browsing state.
let currentPage = 1;
let totalPages = 0;
let requestedPage = 1;
let loading = false;
let hasLoaded = false;

// Filters used by the current results.
let activeFilters = { q: "", severity: "" };

// Consistent publication dates.
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Formats a publication date.
 */
function formatPublishedDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : dateFormatter.format(date);
}

/**
 * Displays a table-wide message.
 */
function showTableMessage(message) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");

  cell.colSpan = 4;
  cell.className = "empty-state";
  cell.textContent = message;

  row.append(cell);
  tableBody.replaceChildren(row);
}

/**
 * Renders vulnerability records and detail links.
 */
function renderRecords(records) {
  if (records.length === 0) {
    showTableMessage("No matching CVEs. Try changing or clearing the filters.");
    return;
  }

  const rows = records.map((record) => {
    const row = document.createElement("tr");
    const severity =
      record.severity === "UNKNOWN"
        ? "Not available"
        : (record.severity ?? "Not available");

    const values = [
      record.cveId ?? "Not available",
      severity,
      record.description || "Description not available.",
      formatPublishedDate(record.publishedAt),
    ];

    for (const [index, value] of values.entries()) {
      const cell = document.createElement("td");

      if (index === 0) {
        // Open the vulnerability detail page.
        const link = document.createElement("a");

        link.className = "text-link";
        link.href = `/vulnerability.html?id=${encodeURIComponent(record._id)}`;
        link.textContent = value;
        cell.append(link);
      } else {
        // Render remaining values as text.
        cell.textContent = value;
      }

      row.append(cell);
    }

    return row;
  });

  tableBody.replaceChildren(...rows);
}

/**
 * Synchronizes both page summaries.
 */
function setPageSummary(message) {
  for (const summary of pageSummaries) {
    summary.textContent = message;
  }
}

/**
 * Updates both paging toolbars.
 */
function updatePagingControls() {
  const disablePrevious = loading || !hasLoaded || currentPage <= 1;
  const disableNext = loading || !hasLoaded || currentPage >= totalPages;

  for (const button of previousButtons) {
    button.disabled = disablePrevious;
  }

  for (const button of nextButtons) {
    button.disabled = disableNext;
  }

  retryButton.disabled = loading;

  // Prevent changes during requests.
  filterControls.disabled = loading;
}

/**
 * Loads and displays one results page.
 */
async function loadPage(page, focusResults = false) {
  if (loading) {
    return;
  }

  requestedPage = page;
  loading = true;
  retryButton.hidden = true;

  tableRegion.setAttribute("aria-busy", "true");
  resultsStatus.textContent = "Loading vulnerabilities...";
  updatePagingControls();

  try {
    // Preserve applied filters across pages.
    const url = new URL("/api/vulnerabilities", window.location.origin);
    url.searchParams.set("page", String(page));

    if (activeFilters.q) {
      url.searchParams.set("q", activeFilters.q);
    }

    if (activeFilters.severity) {
      url.searchParams.set("severity", activeFilters.severity);
    }

    const response = await fetch(url, {
      signal: globalThis.AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error("Vulnerability request failed.");
    }

    const data = await response.json();
    const pagination = data.pagination;

    // Confirm the expected API fields.
    if (
      !Array.isArray(data.records) ||
      !Number.isSafeInteger(pagination?.page) ||
      !Number.isSafeInteger(pagination?.total) ||
      !Number.isSafeInteger(pagination?.totalPages) ||
      !Number.isSafeInteger(pagination?.pageSize) ||
      pagination.pageSize < 1
    ) {
      throw new Error("Unexpected vulnerability response.");
    }

    renderRecords(data.records);

    // Start each results page at the first row.
    tableRegion.scrollTop = 0;

    currentPage = pagination.page;
    totalPages = pagination.totalPages;
    hasLoaded = true;

    resultsCount.textContent = `${pagination.total.toLocaleString()} public CVEs`;

    setPageSummary(
      totalPages > 0 ? `Page ${currentPage} of ${totalPages}` : "No pages",
    );

    // Announce the displayed range.
    const first =
      data.records.length > 0 ? (currentPage - 1) * pagination.pageSize + 1 : 0;
    const last = data.records.length > 0 ? first + data.records.length - 1 : 0;

    resultsStatus.textContent = `Showing ${first}–${last} of ${pagination.total.toLocaleString()} public CVEs.`;

    if (focusResults) {
      // Return focus to the new results.
      resultsHeading.focus();
      resultsHeading.scrollIntoView({ block: "start" });
    }
  } catch (error) {
    console.error("Vulnerability loading failed:", error.name);

    if (!hasLoaded) {
      showTableMessage("Vulnerabilities could not be loaded.");
      resultsCount.textContent = "Unavailable";
    }

    resultsStatus.textContent = `Could not load page ${page}. Please try again.`;
    retryButton.hidden = false;
  } finally {
    loading = false;
    tableRegion.setAttribute("aria-busy", "false");
    updatePagingControls();
  }
}

/**
 * Applies the form selections from page one.
 */
function applyFilters() {
  if (loading) {
    return;
  }

  activeFilters = {
    q: queryInput.value.trim(),
    severity: severitySelect.value,
  };

  // Reset the previous results.
  currentPage = 1;
  totalPages = 0;
  hasLoaded = false;

  resultsCount.textContent = "Loading records";
  setPageSummary("No page loaded");
  showTableMessage("Loading matching CVEs...");

  loadPage(1, true);
}

// Apply filters without reloading the document.
filterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  applyFilters();
});

// Restore unfiltered browsing.
clearFiltersButton.addEventListener("click", () => {
  if (loading) {
    return;
  }

  queryInput.value = "";
  severitySelect.value = "";
  applyFilters();
});

// Connect Previous buttons.
for (const button of previousButtons) {
  button.addEventListener("click", () => loadPage(currentPage - 1, true));
}

// Connect Next buttons.
for (const button of nextButtons) {
  button.addEventListener("click", () => loadPage(currentPage + 1, true));
}

// Retry the unsuccessful request.
retryButton.addEventListener("click", () => loadPage(requestedPage, true));

// Load the initial results.
loadPage(1);
