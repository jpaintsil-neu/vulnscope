import express from "express";
import { fileURLToPath } from "node:url";
import vulnerabilitiesRouter from "./routes/vulnerabilities.js";

// Shared Express application.
const app = express();
const PORT = process.env.PORT || 3000;

// Resolve /public for ES modules.
const publicDirectory = fileURLToPath(new URL("../public", import.meta.url));

// Parse JSON request bodies.
app.use(express.json());

// Serve frontend files.
app.use(express.static(publicDirectory));

// Mount the vulnerability API.
app.use("/api/vulnerabilities", vulnerabilitiesRouter);

// Basic server health check.
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    application: "VulnScope",
  });
});

// Start the HTTP server.
app.listen(PORT, () => {
  console.log(`VulnScope server running at http://localhost:${PORT}`);
});
