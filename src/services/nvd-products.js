import { createProductRecord } from "../models/product.js";

// CPE letters mapped with product types
const CPE_PARTS = new Map([
  ["a", "application"],
  ["o", "operating-system"],
  ["h", "hardware"],
]);

// nvd timestamp to date conversion
function parseNvdDate(value) {
  if (typeof value !== "string" || !value) {
    return null;
  }

  const timestamp = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? value : `${value}Z`;
  const date = new Date(timestamp);

  return Number.isNaN(date.getTime()) ? null : date;
}

// remove cpe escape characters
function unescapeCpe(value) {
  return value.replace(/\\(.)/g, "$1");
}

// cpe token conversion
function toDisplayName(value) {
  return unescapeCpe(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// cpe object conversion from nvd api
export function normalizeNvdCpe(cpe) {
  if (cpe?.deprecated) {
    return null;
  }

  if (typeof cpe?.cpeName !== "string" || typeof cpe?.cpeNameId !== "string") {
    return null;
  }

  const parts = cpe.cpeName.split(/(?<!\\):/);
  const productType = CPE_PARTS.get(parts[2]);

  // all entries
  if (
    parts[0] !== "cpe" ||
    parts[1] !== "2.3" ||
    !productType ||
    !parts[3] ||
    !parts[4]
  ) {
    return null;
  }

  const record = createProductRecord("nvd");

  record.cpeName = cpe.cpeName;
  record.cpeNameId = cpe.cpeNameId;
  record.vendor = toDisplayName(parts[3]);
  record.productName = toDisplayName(parts[4]);

  record.version =
    parts[5] && !["*", "-"].includes(parts[5]) ? unescapeCpe(parts[5]) : null;

  record.productType = productType;
  record.lastModifiedAt = parseNvdDate(cpe.lastModified);

  return record;
}

// fetching CPE products from NVD
export async function fetchNvdCpes({
  keywordSearch,
  resultsPerPage = 5,
  startIndex = 0,
} = {}) {
  // api request
  const url = new URL("https://services.nvd.nist.gov/rest/json/cpes/2.0");

  url.searchParams.set("resultsPerPage", String(resultsPerPage));
  url.searchParams.set("startIndex", String(startIndex));

  if (keywordSearch) {
    url.searchParams.set("keywordSearch", keywordSearch);
  }

  // request duration
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: globalThis.AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    const message = response.headers.get("message");

    throw new Error(
      `NVD request failed (${response.status})${message ? `: ${message}` : "."}`,
    );
  }

  const data = await response.json();

  // responses
  if (!Array.isArray(data.products)) {
    throw new Error("NVD returned an unexpected response.");
  }

  return data;
}
