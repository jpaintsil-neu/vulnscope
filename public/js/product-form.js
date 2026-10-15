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
