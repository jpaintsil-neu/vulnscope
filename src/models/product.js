// allowed products
export const PRODUCT_TYPES = Object.freeze([
  "application",
  "operating-system",
  "hardware",
]);

export const REVIEW_STATUSES = Object.freeze([
  "not-reviewed",
  "in-review",
  "reviewed",
]);

// blank record
export function createProductRecord(source = "local") {
  // Accept supported sources.
  if (source !== "local" && source !== "nvd") {
    throw new Error("Unsupported product source.");
  }

  const now = new Date();

  return {
    source,
    ownerId: null,

    cpeName: null,
    cpeNameId: null,

    // product info
    productName: "",
    vendor: "",
    version: null,
    productType: "application",

    // review info
    reviewStatus: source === "local" ? "not-reviewed" : null,
    exposureNotes: "",
    comments: "",

    lastModifiedAt: null,

    createdAt: now,
    updatedAt: now,
  };
}
