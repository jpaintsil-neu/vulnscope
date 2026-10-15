import "dotenv/config";
import { MongoClient } from "mongodb";

// Shared connection state.
let client;
let database;
let connectionPromise;

/**
 * Returns the shared database.
 */
export async function getDatabase() {
  if (database) return database;

  // Share an in-progress connection.
  if (!connectionPromise) {
    const uri = process.env.MONGODB_URI;
    const databaseName = process.env.MONGODB_DB_NAME || "vulnscope";

    if (!uri) {
      throw new Error("MONGODB_URI is not defined.");
    }

    client = new MongoClient(uri);
    connectionPromise = client
      .connect()
      .then(() => {
        database = client.db(databaseName);
        return database;
      })
      .catch(async (error) => {
        // Allow a clean retry.
        await client.close().catch(() => {});
        client = undefined;
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
}

/**
 * Closes the shared connection.
 */
export async function closeDatabaseConnection() {
  // Wait for pending connection work.
  await connectionPromise?.catch(() => {});

  try {
    if (client) await client.close();
  } finally {
    client = undefined;
    database = undefined;
    connectionPromise = undefined;
  }
}
