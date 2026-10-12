import { closeDatabaseConnection } from "../src/db/connection.js";
import { initializeVulnerabilitiesCollection } from "../src/db/vulnerabilities.js";
import { fetchNvdCves, normalizeNvdCve } from "../src/services/nvd.js";

try {
  // Select a recent publication window.
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 90);

  console.log("Fetching up to 1,500 recent CVEs...");

  const data = await fetchNvdCves({
    resultsPerPage: 1500,
    pubStartDate: startDate.toISOString(),
    pubEndDate: endDate.toISOString(),
    noRejected: true,
  });

  // Convert accepted source records.
  const records = data.vulnerabilities
    .map(({ cve }) => normalizeNvdCve(cve))
    .filter((record) => record !== null);

  if (records.length <= 1000) {
    throw new Error(
      `Only ${records.length} usable CVEs returned. Import requires more than 1,000.`,
    );
  }

  const collection = await initializeVulnerabilitiesCollection();

  const operations = records.map((record) => {
    // Preserve existing authored content.
    const {
      createdAt,
      ownerId,
      triageStatus,
      analystNotes,
      explanation,
      protectiveGuidance,
      ...sourceFields
    } = record;

    return {
      updateOne: {
        // Match only imported records.
        filter: { source: "nvd", cveId: record.cveId },
        update: {
          $set: sourceFields,
          $setOnInsert: {
            createdAt,
            ownerId,
            triageStatus,
            analystNotes,
            explanation,
            protectiveGuidance,
          },
        },
        upsert: true,
      },
    };
  });

  // Insert new records or refresh existing ones.
  const result = await collection.bulkWrite(operations, { ordered: true });
  const total = await collection.countDocuments({ source: "nvd" });

  console.log("New NVD records:", result.upsertedCount);
  console.log("Existing NVD records matched:", result.matchedCount);
  console.log("NVD records in database:", total);

  if (total <= 1000) {
    throw new Error("The database record requirement has not been met.");
  }

  console.log("NVD import complete.");
} catch (error) {
  // Report import failures.
  console.error("NVD import failed:", error.message);
  process.exitCode = 1;
} finally {
  // Release the connection.
  await closeDatabaseConnection();
}
