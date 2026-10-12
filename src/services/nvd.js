import {
  createVulnerabilityRecord,
  SEVERITY_LEVELS,
} from "../models/vulnerability.js";

/**
 * Selects a usable score from the newest CVSS version.
 */
function selectCvssMetric(metrics = {}) {
  const versions = [
    "cvssMetricV40",
    "cvssMetricV31",
    "cvssMetricV30",
    "cvssMetricV2",
  ];

  for (const version of versions) {
    // Keep valid scores, including zero.
    const candidates = (metrics[version] ?? []).filter((metric) => {
      const score = metric.cvssData?.baseScore;

      return Number.isFinite(score) && score >= 0 && score <= 10;
    });

    // Prefer a primary assessment.
    const selected =
      candidates.find((metric) => metric.type === "Primary") ?? candidates[0];

    if (selected) {
      return selected;
    }
  }

  return null;
}

/**
 * Converts an NVD timestamp to a Date.
 */
function parseNvdDate(value) {
  if (typeof value !== "string" || !value) {
    return null;
  }

  // Treat unmarked timestamps as UTC.
  const timestamp = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? value : `${value}Z`;
  const date = new Date(timestamp);

  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Keeps HTTP and HTTPS reference URLs.
 */
function getReferenceUrl(value) {
  try {
    const url = new URL(value);

    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

/**
 * Converts a CVE object from the NVD API.
 */
export function normalizeNvdCve(cve) {
  // Exclude rejected CVEs.
  if (cve?.vulnStatus === "Rejected") {
    return null;
  }

  if (typeof cve?.id !== "string" || !/^CVE-\d{4}-\d{4,}$/.test(cve.id)) {
    throw new Error("Invalid NVD CVE identifier.");
  }

  const record = createVulnerabilityRecord("nvd");
  const metric = selectCvssMetric(cve.metrics ?? {});
  const severity =
    metric?.cvssData?.baseSeverity ?? metric?.baseSeverity ?? "UNKNOWN";

  // Preserve source information.
  record.cveId = cve.id;
  record.title = cve.id;
  record.sourceUrl = `https://nvd.nist.gov/vuln/detail/${cve.id}`;
  record.description =
    (cve.descriptions ?? []).find((item) => item.lang === "en")?.value ?? "";
  record.publishedAt = parseNvdDate(cve.published);
  record.lastModifiedAt = parseNvdDate(cve.lastModified);

  // Preserve the selected assessment.
  record.severity = SEVERITY_LEVELS.includes(severity) ? severity : "UNKNOWN";
  record.cvssScore = metric?.cvssData?.baseScore ?? null;
  record.cvssVersion = metric?.cvssData?.version ?? null;
  record.cvssVector = metric?.cvssData?.vectorString ?? null;
  record.cvssSource = metric?.source ?? null;

  // Retain usable reference links.
  record.references = (cve.references ?? [])
    .map((reference) => {
      const url = getReferenceUrl(reference.url);

      return url
        ? {
            url,
            source: reference.source ?? null,
            tags: [...(reference.tags ?? [])],
          }
        : null;
    })
    .filter((reference) => reference !== null);

  return record;
}
/**
 * Fetches one page of CVEs from NVD.
 */
export async function fetchNvdCves({
  cveId,
  resultsPerPage = 5,
  startIndex = 0,
  pubStartDate,
  pubEndDate,
  noRejected = false,
} = {}) {
  // Build the API request.
  const url = new URL("https://services.nvd.nist.gov/rest/json/cves/2.0");

  url.searchParams.set("resultsPerPage", String(resultsPerPage));
  url.searchParams.set("startIndex", String(startIndex));

  if (cveId) {
    url.searchParams.set("cveId", cveId);
  }

  // Require both publication dates.
  if (pubStartDate || pubEndDate) {
    if (!pubStartDate || !pubEndDate) {
      throw new Error("Both publication dates are required.");
    }

    url.searchParams.set("pubStartDate", pubStartDate);
    url.searchParams.set("pubEndDate", pubEndDate);
  }

  if (noRejected) {
    url.searchParams.set("noRejected", "");
  }

  // Limit the request duration.
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

  // Confirm the response structure.
  if (!Array.isArray(data.vulnerabilities)) {
    throw new Error("NVD returned an unexpected response.");
  }

  return data;
}
