import { closeDatabaseConnection } from "../src/db/connection.js";
import { initializeVulnerabilitiesCollection } from "../src/db/vulnerabilities.js";

try {
  // Prepare the collection.
  const collection = await initializeVulnerabilitiesCollection();

  // Confirm stored indexes.
  const indexes = await collection.listIndexes().toArray();

  console.log("Vulnerabilities collection ready.");
  console.log("Indexes:", indexes.map((index) => index.name).join(", "));
} catch (error) {
  // Report setup failures.
  console.error("Database setup failed:", error.message);
  process.exitCode = 1;
} finally {
  // Release the connection.
  await closeDatabaseConnection();
}
