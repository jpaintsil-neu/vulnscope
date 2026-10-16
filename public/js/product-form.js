// product form elements
const form = document.querySelector("#product-form");
const recordFields = document.querySelector("#record-fields");
const saveButton = document.querySelector("#save-record");
const formStatus = document.querySelector("#form-status");
const retryButton = document.querySelector("#form-retry");

const FIELD_NAMES = [
  "productName",
  "vendor",
  "version",
  "productType",
  "reviewStatus",
  "exposureNotes",
  "comments",
];

const controls = Object.fromEntries(
  FIELD_NAMES.map((name) => [name, form.elements.namedItem(name)]),
);

// create/edit
const parameters = new URL(window.location.href).searchParams;
const isEditing = parameters.has("id");
const id = parameters.get("id");
const saveLabel = isEditing ? "Save changes" : "Save record";
const endpoint = isEditing
  ? `/api/products/local/${encodeURIComponent(id ?? "")}`
  : "/api/products/local";

let ready = false;
let loading = false;
let saving = false;

if (isEditing) {
  document.title = "Edit Product — VulnScope";
  document.querySelector("#form-heading").textContent = "Edit Product";
  document.querySelector("#form-instructions").textContent =
    "Update this browser's local record. Product name and vendor are required.";
  document.querySelector('.breadcrumb [aria-current="page"]').textContent =
    "Edit";
}

saveButton.textContent = saveLabel;

function clearErrors() {
  for (const name of FIELD_NAMES) {
    const error = document.querySelector(`#${name}-error`);

    error.textContent = "";
    error.hidden = true;
    controls[name].removeAttribute("aria-invalid");
  }

  formStatus.textContent = "";
}

// display errors
function renderErrors(errors) {
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) {
    return null;
  }

  let firstControl = null;

  for (const name of FIELD_NAMES) {
    if (typeof errors[name] !== "string") continue;

    const control = controls[name];
    const error = document.querySelector(`#${name}-error`);

    control.setAttribute("aria-invalid", "true");
    error.textContent = errors[name];
    error.hidden = false;

    firstControl ??= control;
  }

  return firstControl;
}

// load record before edits
async function loadEditRecord() {
  if (loading || saving) return;

  ready = false;
  recordFields.disabled = true;
  retryButton.hidden = true;
  clearErrors();

  if (
    parameters.getAll("id").length !== 1 ||
    !id ||
    !/^[a-fA-F0-9]{24}$/.test(id)
  ) {
    formStatus.textContent =
      "Choose a local record from My local records before editing.";
    return;
  }

  loading = true;
  form.setAttribute("aria-busy", "true");
  formStatus.textContent = "Loading your local record...";

  try {
    const response = await fetch(endpoint, {
      cache: "no-store",
      signal: globalThis.AbortSignal.timeout(15000),
    });

    if (response.status === 404) {
      formStatus.textContent =
        "This record is unavailable in this browser's guest workspace.";
      return;
    }

    if (!response.ok) throw new Error("Record loading failed.");

    const { record } = await response.json();

    // confirm identity
    if (
      record?.source !== "local" ||
      record?._id !== id.toLowerCase() ||
      !FIELD_NAMES.every((name) =>
        name === "version"
          ? record[name] === null || typeof record[name] === "string"
          : typeof record[name] === "string",
      ) ||
      !record.productName.trim() ||
      !record.vendor.trim()
    ) {
      throw new Error("Unexpected local record.");
    }

    for (const name of ["productType", "reviewStatus"]) {
      if (
        !Array.from(controls[name].options).some(
          (option) => option.value === record[name],
        )
      ) {
        throw new Error("Unexpected record selection.");
      }
    }

    for (const name of FIELD_NAMES) {
      controls[name].value = record[name] ?? "";
    }

    document.querySelector(".form-actions a").href =
      `/product-details.html?id=${encodeURIComponent(record._id)}&scope=mine`;

    ready = true;
    recordFields.disabled = false;
    formStatus.textContent = "Record loaded. You can now make changes.";
  } catch (error) {
    console.error("Local record loading failed:", error.name);
    formStatus.textContent = "Unable to load this record. Please try again.";
    retryButton.hidden = false;
  } finally {
    loading = false;
    form.setAttribute("aria-busy", "false");
  }
}

// create/update local record
async function saveRecord(event) {
  event.preventDefault();
  if (!ready || saving) return;

  clearErrors();
  if (!form.reportValidity()) return;

  const values = Object.fromEntries(
    FIELD_NAMES.map((name) => [name, controls[name].value.trim()]),
  );

  saving = true;
  recordFields.disabled = true;
  form.setAttribute("aria-busy", "true");
  saveButton.textContent = "Saving...";
  formStatus.textContent = "Saving your local record...";

  let saved = false;
  let firstErrorControl = null;

  try {
    const response = await fetch(endpoint, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
      signal: globalThis.AbortSignal.timeout(15000),
    });

    const result = await response.json();

    if (response.status === 400) {
      firstErrorControl = renderErrors(result.errors);
      formStatus.textContent =
        typeof result.errors?.form === "string"
          ? result.errors.form
          : "Please correct the highlighted fields.";
      return;
    }

    if (isEditing && response.status === 404) {
      ready = false;
      formStatus.textContent =
        "This record is unavailable in this browser's guest workspace.";
      return;
    }

    const record = result.record;

    // saved records
    if (
      response.status !== (isEditing ? 200 : 201) ||
      record?.source !== "local" ||
      typeof record._id !== "string" ||
      !/^[a-f0-9]{24}$/.test(record._id) ||
      (isEditing && record._id !== id.toLowerCase())
    ) {
      throw new Error("Record saving failed.");
    }

    saved = true;
    formStatus.textContent = "Saved. Opening your record...";
    window.location.assign(
      `/product-details.html?id=${encodeURIComponent(record._id)}&scope=mine`,
    );
  } catch (error) {
    console.error("Local record saving failed:", error.name);
    formStatus.textContent =
      "The save could not be confirmed. Check My local records before trying again.";
  } finally {
    form.setAttribute("aria-busy", "false");

    if (!saved) {
      saving = false;
      recordFields.disabled = !ready;
      saveButton.textContent = saveLabel;
      firstErrorControl?.focus();
    }
  }
}

form.addEventListener("submit", saveRecord);
retryButton.addEventListener("click", () => loadEditRecord());

window.addEventListener("pageshow", (event) => {
  if (event.persisted && saving) {
    window.location.replace("/products.html?scope=mine");
  } else if (event.persisted && isEditing) {
    loadEditRecord();
  }
});

// create/load selected record
if (isEditing) {
  loadEditRecord();
} else {
  ready = true;
  recordFields.disabled = false;
}
