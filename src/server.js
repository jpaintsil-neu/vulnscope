import express from "express";
import { fileURLToPath } from "node:url";
import vulnerabilitiesRouter from "./routes/vulnerabilities.js";
import productsRouter from "./routes/products.js";

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

// Mounting the product API
app.use("/api/products", productsRouter);

// Basic server health check.
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    application: "VulnScope",
  });
});

// Keep JSON body errors consistent with the API's other error responses.
app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Submit a valid JSON request body." });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({ error: "The request body is too large." });
  }

  return next(error);
});

// Start the HTTP server.
app.listen(PORT, () => {
  console.log(`VulnScope server running at http://localhost:${PORT}`);
});
