import { fetchNvdCpes, normalizeNvdCpe } from "../src/services/nvd-products.js";

try {
  // request a couple sample products
  const data = await fetchNvdCpes({
    keywordSearch: "firefox",
    resultsPerPage: 20,
  });

  // converting the returned records
  const records = data.products
    .map(({ cpe }) => normalizeNvdCpe(cpe))
    .filter((record) => record !== null);

  if (records.length === 0) {
    throw new Error("No usable products were returned.");
  }

  // display info about the products
  console.table(
    records.slice(0, 5).map((record) => ({
      vendor: record.vendor,
      product: record.productName,
      version: record.version ?? "None",
      type: record.productType,
    })),
  );

  console.log(`Usable products: ${records.length} of ${data.products.length}`);
  console.log("NVD product check passed.");
} catch (error) {
  // error handling
  console.error("NVD product check failed:", error.message);
  process.exitCode = 1;
}
