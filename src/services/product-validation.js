import { PRODUCT_TYPES, REVIEW_STATUSES } from "../models/product.js";

const TEXT_FIELDS = [
  ["productName", "Product name", 200, true],
  ["vendor", "Vendor", 200, true],
  ["exposureNotes", "Exposure notes", 5000, false],
  ["comments", "Comments", 5000, false],
];

const EDITABLE_FIELDS = new Set([
  ...TEXT_FIELDS.map(([field]) => field),
  "version",
  "productType",
  "reviewStatus",
]);

// validate records
export function validateLocalProduct(input) {
  // Require an object submission.
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      values: null,
      errors: { form: "Submit a product record as an object." },
    };
  }

  const errors = {};
  const values = {};

  if (Object.keys(input).some((field) => !EDITABLE_FIELDS.has(field))) {
    errors.form = "Submit only editable local-record fields.";
  }

  for (const [field, label, maxLength, required] of TEXT_FIELDS) {
    const raw = input[field] === undefined ? "" : input[field];

    if (typeof raw !== "string") {
      errors[field] = `${label} must be text.`;
      continue;
    }

    const value = raw.trim();

    if (raw.includes("\0")) {
      errors[field] = `${label} contains an invalid character.`;
    } else if (required && !value) {
      errors[field] = `${label} is required.`;
    } else if (value.length > maxLength) {
      errors[field] = `${label} must be ${maxLength} characters or fewer.`;
    } else {
      values[field] = value;
    }
  }

  const rawVersion = input.version ?? "";

  if (typeof rawVersion !== "string" || rawVersion.includes("\0")) {
    errors.version = "Version must be text.";
  } else if (rawVersion.trim().length > 100) {
    errors.version = "Version must be 100 characters or fewer.";
  } else {
    values.version = rawVersion.trim() || null;
  }

  const rawType =
    input.productType === undefined ? "application" : input.productType;

  if (typeof rawType !== "string" || !PRODUCT_TYPES.includes(rawType.trim())) {
    errors.productType = "Choose a valid product type.";
  } else {
    values.productType = rawType.trim();
  }

  const rawStatus =
    input.reviewStatus === undefined ? "not-reviewed" : input.reviewStatus;

  if (
    typeof rawStatus !== "string" ||
    !REVIEW_STATUSES.includes(rawStatus.trim())
  ) {
    errors.reviewStatus = "Choose a valid review status.";
  } else {
    values.reviewStatus = rawStatus.trim();
  }

  return {
    values: Object.keys(errors).length ? null : values,
    errors,
  };
}
