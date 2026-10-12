// Results elements.
const tableBody = document.querySelector("#vulnerability-records");
const tableRegion = document.querySelector("#vulnerability-results");
const resultsHeading = document.querySelector("#results-heading");
const resultsCount = document.querySelector("#results-count");
const resultsStatus = document.querySelector("#results-status");
const retryButton = document.querySelector("#results-retry");
const tableCaption = document.querySelector("#records-caption");
const identifierHeading = document.querySelector("#record-identifier-heading");
const dateHeading = document.querySelector("#record-date-heading");

// Top pagination controls.
const pageSummaries = document.querySelectorAll("[data-page-summary]");
const previousButtons = document.querySelectorAll("[data-previous-page]");
const nextButtons = document.querySelectorAll("[data-next-page]");

// Search and filter elements.
const filterForm = document.querySelector("#vulnerability-filters");
const filterControls = document.querySelector("#filter-controls");
const queryInput = document.querySelector("#vulnerability-query");
const scopeSelect = document.querySelector("#record-scope");
const severitySelect = document.querySelector("#severity-filter");
const clearFiltersButton = document.querySelector("#clear-filters");

// Restore the requested view.
const initialScope =
  new URL(window.location.href).searchParams.get("scope") === "mine"
    ? "mine"
    : "public";
scopeSelect.value = initialScope;

// Current browsing state.
let currentPage = 1;
let totalPages = 0;
let requestedPage = 1;
let loading = false;
let hasLoaded = false;
let activeFilters = { scope: initialScope, q: "", severity: "" };

// Consistent record dates.
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Returns the current record label.
 */
function recordLabel() {
  return activeFilters.scope === "mine" ? "local records" : "public CVEs";
}

/**
 * Updates headings for the selected view.
 */
function updateScopeView() {
  const isLocal = activeFilters.scope === "mine";

  resultsHeading.textContent = isLocal
    ? "My Local Records"
    : "Vulnerability Records";
  tableCaption.textContent = isLocal
    ? "Guest workspace vulnerability records"
    : "Public vulnerability records";
  identifierHeading.textContent = isLocal ? "Title" : "CVE ID";
  dateHeading.textContent = isLocal ? "Updated (UTC)" : "Published (UTC)";
  tableRegion.classList.toggle("is-local", isLocal);

  // Preserve the view when refreshing.
  const url = new URL(window.location.href);

  if (isLocal) {
    url.searchParams.set("scope", "mine");
  } else {
    url.searchParams.delete("scope");
  }

  window.history.replaceState(null, "", url);
}

/**
 * Formats an available record date.
 */
function formatRecordDate(value) {
  if (!value) return "Not available";

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
 * Renders the selected record collection.
 */
function renderRecords(records) {
  const isLocal = activeFilters.scope === "mine";

  if (records.length === 0) {
    showTableMessage(
      isLocal
        ? "No local records found. Try changing or clearing the filters."
        : "No matching CVEs. Try changing or clearing the filters.",
    );
    return;
  }

  const rows = records.map((record) => {
    const row = document.createElement("tr");
    const severity =
      record.severity === "UNKNOWN"
        ? "Not available"
        : (record.severity ?? "Not available");

    const values = [
      isLocal ? record.title || "Untitled record" : record.cveId,
      severity,
      record.description || "Description not available.",
      formatRecordDate(isLocal ? record.updatedAt : record.publishedAt),
    ];

    for (const [index, value] of values.entries()) {
      const cell = document.createElement("td");

      if (index === 0) {
        // Open details from the selected collection.
        const link = document.createElement("a");
        const detailUrl = new URL(
          "/vulnerability.html",
          window.location.origin,
        );

        detailUrl.searchParams.set("id", record._id);

        if (isLocal) {
          detailUrl.searchParams.set("scope", "mine");
        }

        link.className = "text-link";
        link.href = detailUrl.href;
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
 * Updates the page summary.
 */
function setPageSummary(message) {
  for (const summary of pageSummaries) {
    summary.textContent = message;
  }
}

/**
 * Updates pagination and request controls.
 */
function updatePagingControls() {
  const disablePrevious = loading || !hasLoaded || currentPage <= 1;
  const disableNext = loading || !hasLoaded || currentPage >= totalPages;

  for (const button of previousButtons) button.disabled = disablePrevious;
  for (const button of nextButtons) button.disabled = disableNext;

  retryButton.disabled = loading;
  filterControls.disabled = loading;
}

/**
 * Loads and displays one results page.
 */
async function loadPage(page, focusResults = false) {
  if (loading) return;

  requestedPage = page;
  loading = true;
  retryButton.hidden = true;
  tableRegion.setAttribute("aria-busy", "true");
  resultsStatus.textContent = `Loading ${recordLabel()}...`;
  updatePagingControls();

  try {
    // Choose the public or guest endpoint.
    const isLocal = activeFilters.scope === "mine";
    const endpoint = isLocal
      ? "/api/vulnerabilities/local"
      : "/api/vulnerabilities";
    const url = new URL(endpoint, window.location.origin);
    url.searchParams.set("page", String(page));

    if (activeFilters.q) url.searchParams.set("q", activeFilters.q);
    if (activeFilters.severity) {
      url.searchParams.set("severity", activeFilters.severity);
    }

    const response = await fetch(url, {
      signal: globalThis.AbortSignal.timeout(15000),
    });

    if (!response.ok) throw new Error("Vulnerability request failed.");

    const data = await response.json();
    const pagination = data.pagination;
    const expectedSource = isLocal ? "local" : "nvd";

    // Confirm the expected collection and pagination.
    if (
      !Array.isArray(data.records) ||
      !Number.isSafeInteger(pagination?.page) ||
      pagination.page < 1 ||
      !Number.isSafeInteger(pagination?.total) ||
      pagination.total < 0 ||
      !Number.isSafeInteger(pagination?.totalPages) ||
      pagination.totalPages < 0 ||
      !Number.isSafeInteger(pagination?.pageSize) ||
      pagination.pageSize < 1 ||
      data.records.some(
        (record) =>
          record?.source !== expectedSource ||
          typeof record?._id !== "string" ||
          !/^[a-f0-9]{24}$/.test(record._id),
      )
    ) {
      throw new Error("Unexpected vulnerability response.");
    }

    renderRecords(data.records);
    tableRegion.scrollTop = 0;
    currentPage = pagination.page;
    totalPages = pagination.totalPages;
    hasLoaded = true;

    resultsCount.textContent = `${pagination.total.toLocaleString()} ${recordLabel()}`;
    setPageSummary(
      totalPages > 0 ? `Page ${currentPage} of ${totalPages}` : "No pages",
    );

    // Announce the displayed range.
    const first =
      data.records.length > 0 ? (currentPage - 1) * pagination.pageSize + 1 : 0;
    const last = data.records.length > 0 ? first + data.records.length - 1 : 0;

    resultsStatus.textContent = `Showing ${first}–${last} of ${pagination.total.toLocaleString()} ${recordLabel()}.`;

    if (focusResults) {
      resultsHeading.focus();
      resultsHeading.scrollIntoView({ block: "start" });
    }
  } catch (error) {
    console.error("Vulnerability loading failed:", error.name);

    if (!hasLoaded) {
      showTableMessage(`${recordLabel()} could not be loaded.`);
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
 * Applies form selections from page one.
 */
function applyFilters() {
  if (loading) return;

  activeFilters = {
    scope: scopeSelect.value === "mine" ? "mine" : "public",
    q: queryInput.value.trim(),
    severity: severitySelect.value,
  };

  // Reset the previous results.
  currentPage = 1;
  totalPages = 0;
  hasLoaded = false;
  updateScopeView();
  resultsCount.textContent = "Loading records";
  setPageSummary("No page loaded");
  showTableMessage(`Loading ${recordLabel()}...`);
  loadPage(1, true);
}

// Apply filters without a document reload.
filterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  applyFilters();
});

// Switch collections when selected.
scopeSelect.addEventListener("change", applyFilters);

// Clear filters within the selected collection.
clearFiltersButton.addEventListener("click", () => {
  if (loading) return;

  queryInput.value = "";
  severitySelect.value = "";
  applyFilters();
});

// Connect top pagination.
for (const button of previousButtons) {
  button.addEventListener("click", () => loadPage(currentPage - 1, true));
}
for (const button of nextButtons) {
  button.addEventListener("click", () => loadPage(currentPage + 1, true));
}

// Retry an unsuccessful request.
retryButton.addEventListener("click", () => loadPage(requestedPage, true));

// Load the initial collection.
updateScopeView();
loadPage(1);
