import { fetchNvdCves, normalizeNvdCve } from "../src/services/nvd.js";

try {
  // Request a known CVE.
  const sampleId = "CVE-2021-44228";
  const data = await fetchNvdCves({ cveId: sampleId });

  // Convert the returned records.
  const records = data.vulnerabilities
    .map(({ cve }) => normalizeNvdCve(cve))
    .filter((record) => record !== null);

  if (records.length !== 1 || records[0].cveId !== sampleId) {
    throw new Error("The expected sample CVE was not returned.");
  }

  const record = records[0];

  // Display the converted information.
  console.table([
    {
      cveId: record.cveId,
      severity: record.severity,
      score: record.cvssScore ?? "Unknown",
      version: record.cvssVersion ?? "Unknown",
      scoringSource: record.cvssSource ?? "Unknown",
      references: record.references.length,
    },
  ]);

  console.log(
    "Published (UTC):",
    record.publishedAt?.toISOString() ?? "Unknown",
  );
  console.log("Description available:", record.description.length > 0);
  console.log("NVD sample check passed.");
} catch (error) {
  // Report request or conversion failures.
  console.error("NVD sample check failed:", error.message);
  process.exitCode = 1;
}
