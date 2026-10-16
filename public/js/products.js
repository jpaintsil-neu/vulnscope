// results
const tableBody = document.querySelector("#product-records");
const tableRegion = document.querySelector("#product-results");
const resultsHeading = document.querySelector("#results-heading");
const resultsCount = document.querySelector("#results-count");
const resultsStatus = document.querySelector("#results-status");
const retryButton = document.querySelector("#results-retry");
const filterControls = document.querySelector("#filter-controls");

const pageSummaries = document.querySelectorAll("[data-page-summary]");
const previousButtons = document.querySelectorAll("[data-previous-page]");
const nextButtons = document.querySelectorAll("[data-next-page]");

// labels for product types
const TYPE_LABELS = new Map([
  ["application", "Application"],
  ["operating-system", "Operating system"],
  ["hardware", "Hardware"],
]);

const STATUS_LABELS = new Map([
  ["not-reviewed", "Not reviewed"],
  ["in-review", "In review"],
  ["reviewed", "Reviewed"],
]);

// current paging and filter state
let currentPage = 1;
let totalPages = 0;
let requestedPage = 1;
let loading = false;
let hasLoaded = false;
let activeFilters = {
  scope: "public",
  q: "",
  productType: "",
  reviewStatus: "",
};

function recordLabel() {
  return activeFilters.scope === "mine" ? "local records" : "public products";
}

function showTableMessage(message) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");

  cell.colSpan = 5;
  cell.className = "empty-state";
  cell.textContent = message;
  row.append(cell);
  tableBody.replaceChildren(row);
}

// selected record
function renderRecords(records) {
  const isLocal = activeFilters.scope === "mine";

  if (records.length === 0) {
    showTableMessage(
      isLocal
        ? "No local records found. Try changing or clearing the filters."
        : "No matching products. Try changing or clearing the filters.",
    );
    return;
  }

  const rows = records.map((record) => {
    const row = document.createElement("tr");

    const values = [
      record.productName || "Untitled product",
      record.vendor || "Not available",
      record.version || "Not specified",
      TYPE_LABELS.get(record.productType) ?? "Not available",
      isLocal
        ? (STATUS_LABELS.get(record.reviewStatus) ?? "Not available")
        : "NVD / CPE",
    ];

    for (const [index, value] of values.entries()) {
      const cell = document.createElement("td");

      if (index === 0) {
        // opens details
        const link = document.createElement("a");
        const detailUrl = new URL(
          "/product-details.html",
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
        cell.textContent = value;
      }

      row.append(cell);
    }

    return row;
  });

  tableBody.replaceChildren(...rows);
}

// summary of the page
function setPageSummary(message) {
  for (const summary of pageSummaries) {
    summary.textContent = message;
  }
}

function updatePagingControls() {
  const disablePrevious = loading || !hasLoaded || currentPage <= 1;
  const disableNext = loading || !hasLoaded || currentPage >= totalPages;

  for (const button of previousButtons) button.disabled = disablePrevious;
  for (const button of nextButtons) button.disabled = disableNext;

  retryButton.disabled = loading;
  filterControls.disabled = loading;
}

// result page
async function loadPage(page, focusResults = false) {
  if (loading) return;

  requestedPage = page;
  loading = true;
  retryButton.hidden = true;
  tableRegion.setAttribute("aria-busy", "true");
  resultsStatus.textContent = `Loading ${recordLabel()}...`;
  updatePagingControls();

  try {
    const isLocal = activeFilters.scope === "mine";
    const endpoint = isLocal ? "/api/products/local" : "/api/products";
    const url = new URL(endpoint, window.location.origin);

    url.searchParams.set("page", String(page));

    if (activeFilters.q) url.searchParams.set("q", activeFilters.q);
    if (activeFilters.productType) {
      url.searchParams.set("productType", activeFilters.productType);
    }

    // reveiw status
    if (isLocal && activeFilters.reviewStatus) {
      url.searchParams.set("reviewStatus", activeFilters.reviewStatus);
    }

    const response = await fetch(url, {
      signal: globalThis.AbortSignal.timeout(15000),
    });

    if (!response.ok) throw new Error("Product request failed.");

    const data = await response.json();
    const pagination = data.pagination;
    const expectedSource = isLocal ? "local" : "nvd";

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
      throw new Error("Unexpected product response.");
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

    const first =
      data.records.length > 0 ? (currentPage - 1) * pagination.pageSize + 1 : 0;
    const last = data.records.length > 0 ? first + data.records.length - 1 : 0;

    resultsStatus.textContent = `Showing ${first}–${last} of ${pagination.total.toLocaleString()} ${recordLabel()}.`;

    if (focusResults) {
      resultsHeading.focus();
      resultsHeading.scrollIntoView({ block: "start" });
    }
  } catch (error) {
    console.error("Product loading failed:", error.name);

    if (!hasLoaded) {
      showTableMessage(`The ${recordLabel()} could not be loaded.`);
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

// paging buttons - top and bottom
for (const button of previousButtons) {
  button.addEventListener("click", () => loadPage(currentPage - 1, true));
}
for (const button of nextButtons) {
  button.addEventListener("click", () => loadPage(currentPage + 1, true));
}

// retry
retryButton.addEventListener("click", () => loadPage(requestedPage, true));

// filtering
const tableCaption = document.querySelector("#records-caption");
const extraHeading = document.querySelector("#record-extra-heading");
const filterForm = document.querySelector("#product-filters");
const queryInput = document.querySelector("#product-query");
const scopeSelect = document.querySelector("#record-scope");
const typeSelect = document.querySelector("#type-filter");
const reviewStatusField = document.querySelector("#review-status-field");
const reviewStatusSelect = document.querySelector("#review-status-filter");
const clearFiltersButton = document.querySelector("#clear-filters");

// restore - search and filters from url
const parameters = new URL(window.location.href).searchParams;
const initialScope = parameters.get("scope") === "mine" ? "mine" : "public";
const initialQuery = (parameters.get("q") ?? "").trim();
const requestedType = (parameters.get("productType") ?? "").trim();
const requestedReviewStatus = (parameters.get("reviewStatus") ?? "").trim();

const initialType = Array.from(typeSelect.options).some(
  (option) => option.value === requestedType,
)
  ? requestedType
  : "";

const initialReviewStatus =
  initialScope === "mine" &&
  Array.from(reviewStatusSelect.options).some(
    (option) => option.value === requestedReviewStatus,
  )
    ? requestedReviewStatus
    : "";

scopeSelect.value = initialScope;
queryInput.value = initialQuery;
typeSelect.value = initialType;
reviewStatusSelect.value = initialReviewStatus;

activeFilters = {
  scope: initialScope,
  q: initialQuery,
  productType: initialType,
  reviewStatus: initialReviewStatus,
};

// headings update
function updateScopeView() {
  const isLocal = activeFilters.scope === "mine";

  resultsHeading.textContent = isLocal ? "My Local Records" : "Product Records";
  tableCaption.textContent = isLocal
    ? "Guest workspace product records"
    : "Public product records";
  extraHeading.textContent = isLocal ? "Review status" : "Source";

  // review status is for local records only
  reviewStatusField.hidden = !isLocal;
  reviewStatusSelect.disabled = !isLocal;

  if (!isLocal) {
    reviewStatusSelect.value = "";
    activeFilters.reviewStatus = "";
  }

  // selected collection
  const url = new URL(window.location.href);

  if (isLocal) {
    url.searchParams.set("scope", "mine");
  } else {
    url.searchParams.delete("scope");
  }

  // keeps filters in the URL so refresh can restore them
  for (const [name, value] of [
    ["q", activeFilters.q],
    ["productType", activeFilters.productType],
    ["reviewStatus", activeFilters.reviewStatus],
  ]) {
    if (value) {
      url.searchParams.set(name, value);
    } else {
      url.searchParams.delete(name);
    }
  }

  window.history.replaceState(null, "", url);
}

// form selections
function applyFilters() {
  if (loading) return;

  const scope = scopeSelect.value === "mine" ? "mine" : "public";

  activeFilters = {
    scope,
    q: queryInput.value.trim(),
    productType: typeSelect.value,
    reviewStatus: scope === "mine" ? reviewStatusSelect.value : "",
  };

  // reset prev. results
  currentPage = 1;
  totalPages = 0;
  hasLoaded = false;
  updateScopeView();
  resultsCount.textContent = "Loading records";
  setPageSummary("No page loaded");
  showTableMessage(`Loading ${recordLabel()}...`);
  loadPage(1, true);
}

filterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  applyFilters();
});

scopeSelect.addEventListener("change", applyFilters);

clearFiltersButton.addEventListener("click", () => {
  if (loading) return;

  queryInput.value = "";
  typeSelect.value = "";
  reviewStatusSelect.value = "";
  applyFilters();
});

// initial collections
updateScopeView();
loadPage(1);
