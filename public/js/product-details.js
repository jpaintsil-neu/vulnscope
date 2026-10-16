// details page
const heading = document.querySelector("#product-title");
const status = document.querySelector("#detail-status");
const content = document.querySelector("#detail-content");
const retryButton = document.querySelector("#detail-retry");

const parameters = new URL(window.location.href).searchParams;
const isLocal = parameters.get("scope") === "mine";

const backLink = document.querySelector(".breadcrumb a");

if (isLocal) {
  backLink.href = "/products.html?scope=mine";
  backLink.textContent = "My local records";
}

// display labels
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

// record dates
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : dateFormatter.format(date);
}

// details panel
function createPanel(title, text) {
  const panel = document.createElement("section");
  const titleElement = document.createElement("h2");

  panel.className = "detail-panel";
  titleElement.id = `detail-${title.toLowerCase().replaceAll(" ", "-")}`;
  titleElement.textContent = title;
  panel.setAttribute("aria-labelledby", titleElement.id);
  panel.append(titleElement);

  if (text !== undefined) {
    const paragraph = document.createElement("p");

    paragraph.className = "detail-copy";
    paragraph.textContent = text;
    panel.append(paragraph);
  }

  return panel;
}

function createFactsPanel(title, entries) {
  const panel = createPanel(title);
  const list = document.createElement("dl");

  list.className = "detail-facts";

  for (const [label, value] of entries) {
    const item = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");

    term.textContent = label;
    description.textContent = value;

    if (label === "CPE name") {
      item.className = "detail-fact-wide";
    }

    item.append(term, description);
    list.append(item);
  }

  panel.append(list);
  return panel;
}

// product details
function renderRecord(record) {
  heading.textContent = record.productName;
  document.title = `${record.productName} — VulnScope`;

  const facts = [
    ["Vendor", record.vendor || "Not available"],
    ["Version", record.version || "Not specified"],
    ["Type", TYPE_LABELS.get(record.productType) ?? "Not available"],
    ["Source", "NIST National Vulnerability Database (CPE)"],
    ["Last modified (UTC)", formatDate(record.lastModifiedAt)],
  ];

  if (typeof record.cpeName === "string" && record.cpeName) {
    facts.push(["CPE name", record.cpeName]);
  }

  content.replaceChildren(
    createFactsPanel("Overview", facts),
    createPanel(
      "About This Record",
      "This product record comes from the National Vulnerability Database and is read-only. To write your own notes about a product, add a local record from the Products page.",
    ),
  );
}

// requested record ID

const id = parameters.get("id");
let deleting = false;

// guest workspace
function renderLocalRecord(record) {
  heading.textContent = record.productName;
  document.title = `${record.productName} — VulnScope`;

  const panels = [
    createFactsPanel("Overview", [
      ["Vendor", record.vendor || "Not available"],
      ["Version", record.version || "Not specified"],
      ["Type", TYPE_LABELS.get(record.productType) ?? "Not available"],
      ["Source", "Local guest workspace record"],
      [
        "Review status",
        STATUS_LABELS.get(record.reviewStatus) ?? "Not available",
      ],
      ["Created (UTC)", formatDate(record.createdAt)],
      ["Updated (UTC)", formatDate(record.updatedAt)],
    ]),
    createPanel(
      "Exposure Notes",
      record.exposureNotes || "No exposure notes yet.",
    ),
    createPanel("Comments", record.comments || "No comments yet."),
  ];

  // local records
  const actions = document.createElement("div");
  const editLink = document.createElement("a");
  const deleteButton = document.createElement("button");

  actions.className = "detail-actions";
  editLink.className = "button button-primary";
  editLink.href = `/product-form.html?id=${encodeURIComponent(record._id)}`;
  editLink.textContent = "Edit record";

  deleteButton.type = "button";
  deleteButton.className = "button button-danger";
  deleteButton.textContent = "Delete record";
  deleteButton.addEventListener("click", () =>
    deleteLocalRecord(record, deleteButton, editLink),
  );

  actions.append(editLink, deleteButton);
  content.replaceChildren(actions, ...panels);
}

// load product that was requested
async function loadRecord(focusHeading = false) {
  if (deleting) return;

  content.hidden = true;
  retryButton.hidden = true;

  // rejects any wrong ObjectIds before requesting
  if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
    status.textContent = "Choose a product from the results list.";
    return;
  }

  retryButton.disabled = true;
  status.textContent = isLocal
    ? "Loading local record..."
    : "Loading product...";

  try {
    const endpoint = isLocal ? "/api/products/local" : "/api/products";

    const response = await fetch(`${endpoint}/${encodeURIComponent(id)}`, {
      signal: globalThis.AbortSignal.timeout(15000),
    });

    if (response.status === 404) {
      status.textContent = isLocal
        ? "This local record is unavailable in this browser's guest workspace."
        : "This product could not be found.";
      return;
    }

    if (!response.ok) {
      throw new Error("Product request failed.");
    }

    const { record } = await response.json();
    const expectedSource = isLocal ? "local" : "nvd";

    // verifies the response matches the requested record before the record is pulled
    if (
      record?.source !== expectedSource ||
      record?._id !== id.toLowerCase() ||
      typeof record.productName !== "string" ||
      !record.productName.trim() ||
      typeof record.vendor !== "string"
    ) {
      throw new Error("Unexpected product response.");
    }

    if (isLocal) {
      renderLocalRecord(record);
    } else {
      renderRecord(record);
    }

    content.hidden = false;
    status.textContent = `Loaded ${record.productName}.`;

    if (focusHeading) {
      heading.focus();
      heading.scrollIntoView({ block: "start" });
    }
  } catch (error) {
    console.error("Product detail loading failed:", error.name);
    status.textContent = "Unable to load this product. Please try again.";
    retryButton.hidden = false;
  } finally {
    retryButton.disabled = false;
  }
}

// retry request
retryButton.addEventListener("click", () => loadRecord(true));

// deletes a local record after confirmation
async function deleteLocalRecord(record, deleteButton, editLink) {
  if (
    deleting ||
    deleteButton.disabled ||
    !isLocal ||
    record?.source !== "local" ||
    record._id !== id?.toLowerCase()
  ) {
    return;
  }

  // remove permanently
  if (
    !window.confirm(
      `Delete "${record.productName}"? This permanently removes your local record and cannot be undone.`,
    )
  ) {
    return;
  }

  deleting = true;
  deleteButton.disabled = true;
  deleteButton.textContent = "Deleting...";
  editLink.removeAttribute("href");
  editLink.setAttribute("aria-disabled", "true");
  content.setAttribute("aria-busy", "true");
  retryButton.hidden = true;
  retryButton.disabled = true;
  status.textContent = "Deleting your local record...";

  let deleted = false;

  try {
    const response = await fetch(
      `/api/products/local/${encodeURIComponent(record._id)}`,
      {
        method: "DELETE",
        signal: globalThis.AbortSignal.timeout(15000),
      },
    );

    if (response.status === 404) {
      content.hidden = true;
      status.textContent =
        "This record is no longer available in this browser's guest workspace.";
      retryButton.hidden = false;
      return;
    }

    if (response.status !== 204) {
      throw new Error("Record deletion failed.");
    }

    deleted = true;
    status.textContent = "Record deleted. Returning to My local records...";
    window.location.replace("/products.html?scope=mine");
  } catch (error) {
    console.error("Local record deletion failed:", error.name);
    status.textContent =
      "Deletion could not be confirmed. Select Try again to check this record.";
    retryButton.hidden = false;
  } finally {
    content.setAttribute("aria-busy", "false");

    if (!deleted) {
      deleting = false;
      deleteButton.textContent = "Delete record";
      retryButton.disabled = false;
      retryButton.focus();
    }
  }
}

loadRecord();
