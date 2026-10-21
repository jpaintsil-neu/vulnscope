import express from "express";
import { fileURLToPath } from "node:url";
import vulnerabilitiesRouter from "./routes/vulnerabilities.js";
import productsRouter from "./routes/products.js";

// Shared Express application.
const app = express();
const PORT = process.env.PORT || 3000;

// Resolve /public for ES modules.
const publicDirectory = fileURLToPath(new URL("../public", import.meta.url));

//Since this is live on Render, it might be worth adding rate limiting (express-rate-limit), 
//and a body size limit here. Right now someone could spam the POST routes and fill up the database.

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

// Start the HTTP server.
app.listen(PORT, () => {
  console.log(`VulnScope server running at http://localhost:${PORT}`);
});
