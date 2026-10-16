import { setTimeout as sleep } from "node:timers/promises";
import { closeDatabaseConnection } from "../src/db/connection.js";
import { initializeProductsCollection } from "../src/db/products.js";
import { fetchNvdCpes, normalizeNvdCpe } from "../src/services/nvd-products.js";

// well-known names for the imported sample
const KEYWORDS = [
  "microsoft",
  "google",
  "apple",
  "mozilla",
  "adobe",
  "oracle",
  "cisco",
  "linux",
  "samsung",
  "intel",
  "zoom",
  "vmware",
  "wordpress",
  "apache",
  "android",
  "windows",
];

const RESULTS_PER_KEYWORD = 500;

// NVD allows 5 requests per 30 seconds without an API key
const REQUEST_DELAY_MS = 6500;

try {
  const productsById = new Map();

  for (const [index, keyword] of KEYWORDS.entries()) {
    if (index > 0) {
      await sleep(REQUEST_DELAY_MS);
    }

    console.log(`Fetching products for "${keyword}"...`);

    const data = await fetchNvdCpes({
      keywordSearch: keyword,
      resultsPerPage: RESULTS_PER_KEYWORD,
    });

    // convert accepted source records and remove any duplicates
    for (const { cpe } of data.products) {
      const record = normalizeNvdCpe(cpe);

      if (record) {
        productsById.set(record.cpeNameId, record);
      }
    }
  }

  const records = [...productsById.values()];

  if (records.length <= 1000) {
    throw new Error(
      `Only ${records.length} usable products returned. Import requires more than 1,000.`,
    );
  }

  const collection = await initializeProductsCollection();

  const operations = records.map((record) => {
    // preserves any authored content that exists
    const {
      createdAt,
      ownerId,
      reviewStatus,
      exposureNotes,
      comments,
      ...sourceFields
    } = record;

    return {
      updateOne: {
        // matches imported records
        filter: { source: "nvd", cpeNameId: record.cpeNameId },
        update: {
          $set: sourceFields,
          $setOnInsert: {
            createdAt,
            ownerId,
            reviewStatus,
            exposureNotes,
            comments,
          },
        },
        upsert: true,
      },
    };
  });

  // inserts new records or refreshes any existing ones
  const result = await collection.bulkWrite(operations, { ordered: true });
  const total = await collection.countDocuments({ source: "nvd" });

  console.log("New NVD products:", result.upsertedCount);
  console.log("Existing NVD products matched:", result.matchedCount);
  console.log("NVD products in database:", total);

  if (total <= 1000) {
    throw new Error("The database record requirement has not been met.");
  }

  console.log("NVD product import complete.");
} catch (error) {
  // import failures report
  console.error("NVD product import failed:", error.message);
  process.exitCode = 1;
} finally {
  // release connection
  await closeDatabaseConnection();
}
