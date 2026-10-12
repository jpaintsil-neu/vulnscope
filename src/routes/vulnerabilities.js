import { Router } from "express";
import {
  findPublicVulnerabilityById,
  listPublicVulnerabilities,
} from "../db/vulnerabilities.js";
import { SEVERITY_LEVELS } from "../models/vulnerability.js";

// Vulnerability API routes.
const router = Router();

// Search imported vulnerability records.
router.get("/", async (req, res) => {
  const rawPage = req.query.page ?? "1";
  const rawQuery = req.query.q ?? "";
  const rawSeverity = req.query.severity ?? "";

  // Accept bounded whole-number pages.
  const page =
    typeof rawPage === "string" && /^\d+$/.test(rawPage)
      ? Number(rawPage)
      : NaN;

  if (!Number.isSafeInteger(page) || page < 1 || page > 10000) {
    return res.status(400).json({
      error: "Page must be a whole number between 1 and 10000.",
    });
  }

  // Validate search text before querying.
  if (
    typeof rawQuery !== "string" ||
    rawQuery.length > 200 ||
    rawQuery.includes("\0")
  ) {
    return res.status(400).json({
      error: "Enter a valid search of up to 200 characters.",
    });
  }

  if (typeof rawSeverity !== "string") {
    return res.status(400).json({ error: "Invalid severity filter." });
  }

  const q = rawQuery.trim();
  const severity = rawSeverity.trim().toUpperCase();

  // Accept only supported severity values.
  if (severity && !SEVERITY_LEVELS.includes(severity)) {
    return res.status(400).json({ error: "Invalid severity filter." });
  }

  try {
    const result = await listPublicVulnerabilities({ page, q, severity });

    return res.json(result);
  } catch (error) {
    // Keep internal errors out of responses.
    console.error("Vulnerability search failed:", error.name);

    return res.status(500).json({
      error: "Unable to load vulnerabilities. Please try again.",
    });
  }
});

// Read one imported vulnerability.
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // Validate the database identifier.
  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    return res.status(400).json({
      error: "Invalid vulnerability ID.",
    });
  }

  try {
    const record = await findPublicVulnerabilityById(id);

    if (!record) {
      return res.status(404).json({
        error: "Vulnerability not found.",
      });
    }

    return res.json({ record });
  } catch (error) {
    // Keep internal errors out of responses.
    console.error("Vulnerability detail lookup failed:", error.name);

    return res.status(500).json({
      error: "Unable to load this vulnerability. Please try again.",
    });
  }
});

export default router;
