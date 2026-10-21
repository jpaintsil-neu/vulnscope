import { closeDatabaseConnection } from "../src/db/connection.js";
import { initializeVulnerabilitiesCollection } from "../src/db/vulnerabilities.js";
import { initializeProductsCollection } from "../src/db/products.js";

try {
  // Prepare the collection.
  const collection = await initializeVulnerabilitiesCollection();

  // Confirm stored indexes.
  const indexes = await collection.listIndexes().toArray();

  console.log("Vulnerabilities collection ready.");
  console.log("Indexes:", indexes.map((index) => index.name).join(", "));

  // Prepare product indexes even when the optional NVD import has not run.
  const products = await initializeProductsCollection();
  const productIndexes = await products.listIndexes().toArray();

  console.log("Products collection ready.");
  console.log("Indexes:", productIndexes.map((index) => index.name).join(", "));
} catch (error) {
  // Report setup failures.
  console.error("Database setup failed:", error.message);
  process.exitCode = 1;
} finally {
  // Release the connection.
  await closeDatabaseConnection();
}
