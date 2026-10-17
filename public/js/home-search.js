// Shared homepage controls.
const searchForm = document.querySelector("#home-search-form");
const scopeField = document.querySelector("#home-search-scope-field");
const scopeSelect = document.querySelector("#home-search-scope");
const queryInput = document.querySelector("#home-query");
const queryLabel = document.querySelector("#home-query-label");
const searchNote = document.querySelector("#search-availability");

// Match each category to its results page.
const searchOptions = new Map([
  [
    "vulnerabilities",
    {
      action: "/vulnerabilities.html",
      label: "CVE ID or vulnerability keyword",
      placeholder: "For example: a CVE ID or Firefox",
      note: "Search public vulnerabilities by CVE ID or keywords, including product and vendor names mentioned in their descriptions.",
    },
  ],
  [
    "products",
    {
      action: "/products.html",
      label: "Vendor, product, or version",
      placeholder: "For example: Firefox or Apple",
      note: "Search public products by vendor, product, or version.",
    },
  ],
]);

// Update the destination without navigating.
function updateSearch() {
  const options =
    searchOptions.get(scopeSelect.value) ??
    searchOptions.get("vulnerabilities");

  searchForm.action = options.action;
  queryLabel.textContent = options.label;
  queryInput.placeholder = options.placeholder;
  searchNote.textContent = options.note;
}

scopeSelect.addEventListener("change", updateSearch);

// Let the browser encode and submit the query.
searchForm.addEventListener("submit", () => {
  updateSearch();
  queryInput.value = queryInput.value.trim();
});

// Resync controls after browser history navigation.
window.addEventListener("pageshow", updateSearch);

updateSearch();
scopeField.hidden = false;
