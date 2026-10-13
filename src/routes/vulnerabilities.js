import { Router } from "express";
import {
  createLocalVulnerability,
  deleteLocalVulnerability,
  findLocalVulnerabilityById,
  findPublicVulnerabilityById,
  listLocalVulnerabilities,
  listPublicVulnerabilities,
  updateLocalVulnerability,
} from "../db/vulnerabilities.js";
import { SEVERITY_LEVELS, TRIAGE_STATUSES } from "../models/vulnerability.js";
import { getLocalWorkspaceOwner } from "../services/local-workspace.js";
import { validateLocalVulnerability } from "../services/vulnerability-validation.js";

// Vulnerability API routes.
const router = Router();

// Create a guest workspace record.
router.post("/local", async (req, res) => {
  // Accept JSON submissions only.
  if (!req.is("application/json")) {
    return res.status(415).json({
      error: "Submit the record as JSON.",
    });
  }

  const { values, errors } = validateLocalVulnerability(req.body);

  // Return field-specific validation messages.
  if (!values) {
    return res.status(400).json({
      error: "Please correct the highlighted fields.",
      errors,
    });
  }

  try {
    const ownerId = getLocalWorkspaceOwner(req, res, { create: true });
    const record = await createLocalVulnerability(values, ownerId);

    return res.status(201).json({ record });
  } catch (error) {
    // Keep internal errors out of responses.
    console.error("Local vulnerability creation failed:", error.name);

    return res.status(500).json({
      error: "Unable to create the vulnerability. Please try again.",
    });
  }
});

// Browse this guest workspace's records.
router.get("/local", async (req, res) => {
  // Prevent caching of workspace results.
  res.set("Cache-Control", "no-store");

  const rawPage = req.query.page ?? "1";
  const rawQuery = req.query.q ?? "";
  const rawSeverity = req.query.severity ?? "";
  const rawTriageStatus = req.query.triageStatus ?? "";

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

  if (severity && !SEVERITY_LEVELS.includes(severity)) {
    return res.status(400).json({ error: "Invalid severity filter." });
  }

  // Accept supported local review statuses.
  if (typeof rawTriageStatus !== "string") {
    return res.status(400).json({ error: "Invalid review-status filter." });
  }

  const triageStatus = rawTriageStatus.trim();

  if (triageStatus && !TRIAGE_STATUSES.includes(triageStatus)) {
    return res.status(400).json({ error: "Invalid review-status filter." });
  }

  try {
    const ownerId = getLocalWorkspaceOwner(req, res);

    // New visitors have no local records.
    if (!ownerId) {
      return res.json({
        records: [],
        pagination: { page, pageSize: 20, total: 0, totalPages: 0 },
      });
    }

    const result = await listLocalVulnerabilities({
      ownerId,
      page,
      q,
      severity,
      triageStatus,
    });

    return res.json(result);
  } catch (error) {
    // Keep internal errors out of responses.
    console.error("Local vulnerability search failed:", error.name);

    return res.status(500).json({
      error: "Unable to load your local records. Please try again.",
    });
  }
});

// Read one record from this guest workspace.
router.get("/local/:id", async (req, res) => {
  // Prevent caching of workspace details.
  res.set("Cache-Control", "no-store");

  const { id } = req.params;

  // Validate the database identifier.
  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    return res.status(400).json({
      error: "Invalid vulnerability ID.",
    });
  }

  try {
    const ownerId = getLocalWorkspaceOwner(req, res);

    // Use the same response for unavailable records.
    const record = ownerId
      ? await findLocalVulnerabilityById(id, ownerId)
      : null;

    if (!record) {
      return res.status(404).json({
        error: "Local vulnerability not found.",
      });
    }

    return res.json({ record });
  } catch (error) {
    // Keep internal errors out of responses.
    console.error("Local vulnerability detail lookup failed:", error.name);

    return res.status(500).json({
      error: "Unable to load this local record. Please try again.",
    });
  }
});

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

// Update one guest workspace record.
router.put("/local/:id", async (req, res) => {
  // Prevent caching of workspace details.
  res.set("Cache-Control", "no-store");

  const { id } = req.params;

  // Validate the database identifier.
  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    return res.status(400).json({
      error: "Invalid vulnerability ID.",
    });
  }

  // Accept JSON submissions only.
  if (!req.is("application/json")) {
    return res.status(415).json({
      error: "Submit the record as JSON.",
    });
  }

  try {
    const ownerId = getLocalWorkspaceOwner(req, res);

    // Require an existing workspace.
    if (!ownerId) {
      return res.status(404).json({
        error: "Local vulnerability not found.",
      });
    }

    const { values, errors } = validateLocalVulnerability(req.body);

    // Return field-specific errors.
    if (!values) {
      return res.status(400).json({
        error: "Please correct the highlighted fields.",
        errors,
      });
    }

    const record = await updateLocalVulnerability(id, values, ownerId);

    // Handle unavailable records consistently.
    if (!record) {
      return res.status(404).json({
        error: "Local vulnerability not found.",
      });
    }

    return res.json({ record });
  } catch (error) {
    // Keep internal errors private.
    console.error("Local vulnerability update failed:", error.name);

    return res.status(500).json({
      error: "Unable to update this local record. Please try again.",
    });
  }
});

// Delete one guest workspace record.
router.delete("/local/:id", async (req, res) => {
  // Prevent caching of workspace responses.
  res.set("Cache-Control", "no-store");

  const { id } = req.params;

  // Validate the database identifier.
  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    return res.status(400).json({
      error: "Invalid vulnerability ID.",
    });
  }

  try {
    const ownerId = getLocalWorkspaceOwner(req, res);

    // Require an existing workspace.
    if (!ownerId) {
      return res.status(404).json({
        error: "Local vulnerability not found.",
      });
    }

    const deleted = await deleteLocalVulnerability(id, ownerId);

    if (!deleted) {
      return res.status(404).json({
        error: "Local vulnerability not found.",
      });
    }

    // Successful deletion has no response body.
    return res.status(204).end();
  } catch (error) {
    // Keep internal errors private.
    console.error("Local vulnerability deletion failed:", error.name);

    return res.status(500).json({
      error: "Unable to delete this local record. Please try again.",
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
