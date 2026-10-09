import "dotenv/config";
import { MongoClient } from "mongodb";

// Shared MongoDB connection.
let client;
let database;

/**
 * Returns the VulnScope database connection.
 */
export async function getDatabase() {
  // Reuse the existing connection.
  if (database) {
    return database;
  }

  const uri = process.env.MONGODB_URI;
  const databaseName = process.env.MONGODB_DB_NAME || "vulnscope";

  if (!uri) {
    throw new Error("MONGODB_URI is not defined.");
  }

  client = new MongoClient(uri);
  await client.connect();

  database = client.db(databaseName);

  return database;
}
/**
 * Closes the active database connection.
 */
export async function closeDatabaseConnection() {
  if (client) {
    await client.close();

    client = undefined;
    database = undefined;
  }
}
