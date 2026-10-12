import { ObjectId } from "mongodb";
import { getDatabase } from "./connection.js";
import { createVulnerabilityRecord } from "../models/vulnerability.js";

/**
 * Returns the vulnerabilities collection.
 */
export async function getVulnerabilitiesCollection() {
  const database = await getDatabase();

  return database.collection("vulnerabilities");
}

/**
 * Creates indexes for vulnerability queries.
 */
export async function initializeVulnerabilitiesCollection() {
  const collection = await getVulnerabilitiesCollection();

  await collection.createIndexes([
    {
      // Prevent duplicate imported CVEs.
      key: { cveId: 1 },
      name: "unique_nvd_cve",
      unique: true,
      partialFilterExpression: {
        source: "nvd",
        cveId: { $type: "string" },
      },
    },
    {
      // Browse recent source records.
      key: { source: 1, publishedAt: -1 },
      name: "source_published",
    },
    {
      // Filter records by severity.
      key: { source: 1, severity: 1, publishedAt: -1 },
      name: "source_severity_published",
    },
    {
      // Browse an owner's local records.
      key: { source: 1, ownerId: 1, updatedAt: -1 },
      name: "source_owner_updated",
    },
  ]);

  return collection;
}
/**
 * Returns one page of matching imported vulnerabilities.
 */
export async function listPublicVulnerabilities({
  page = 1,
  q = "",
  severity = "",
} = {}) {
  const collection = await getVulnerabilitiesCollection();
  const pageSize = 20;
  const filter = { source: "nvd" };

  // Apply the severity selection.
  if (severity) {
    filter.severity = severity;
  }

  if (q) {
    if (/^CVE-\d{4}-\d{4,}$/i.test(q)) {
      // Match complete CVE identifiers.
      filter.cveId = q.toUpperCase();
    } else {
      // Treat search text as a literal phrase.
      const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = { $regex: escapedQuery, $options: "i" };

      filter.$or = [{ cveId: match }, { title: match }, { description: match }];
    }
  }

  // Return fields needed by the results table.
  const projection = {
    cveId: 1,
    title: 1,
    description: 1,
    severity: 1,
    cvssScore: 1,
    cvssVersion: 1,
    publishedAt: 1,
    source: 1,
  };

  // Use a stable order across pages.
  const [records, total] = await Promise.all([
    collection
      .find(filter, { projection })
      .sort({ publishedAt: -1, _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    records,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Returns an imported vulnerability by database ID.
 */
export async function findPublicVulnerabilityById(id) {
  const collection = await getVulnerabilitiesCollection();

  // Match imported records only.
  return collection.findOne(
    { _id: new ObjectId(id), source: "nvd" },
    {
      // Return public detail fields.
      projection: {
        source: 1,
        sourceUrl: 1,
        cveId: 1,
        title: 1,
        description: 1,
        severity: 1,
        cvssScore: 1,
        cvssVersion: 1,
        cvssVector: 1,
        cvssSource: 1,
        publishedAt: 1,
        lastModifiedAt: 1,
        references: 1,
        explanation: 1,
        protectiveGuidance: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  );
}

/**
 * Creates a validated record in a guest workspace.
 */
export async function createLocalVulnerability(values, ownerId) {
  // Require server-assigned ownership.
  if (typeof ownerId !== "string" || !/^[a-f0-9]{64}$/.test(ownerId)) {
    throw new Error("A local workspace is required.");
  }

  const collection = await getVulnerabilitiesCollection();
  const record = {
    ...createVulnerabilityRecord("local"),
    ...values,
    // Enforce local origin and ownership.
    source: "local",
    ownerId,
  };

  const result = await collection.insertOne(record);

  // Exclude internal ownership from responses.
  const savedRecord = { ...record, _id: result.insertedId };
  delete savedRecord.ownerId;

  return savedRecord;
}

/**
 * Returns one page of the owner's local records.
 */
export async function listLocalVulnerabilities({
  ownerId,
  page = 1,
  q = "",
  severity = "",
}) {
  // Require server-assigned ownership.
  if (typeof ownerId !== "string" || !/^[a-f0-9]{64}$/.test(ownerId)) {
    throw new Error("A local workspace is required.");
  }

  const collection = await getVulnerabilitiesCollection();
  const pageSize = 20;

  // Restrict results to this guest workspace.
  const filter = { source: "local", ownerId };

  if (severity) {
    filter.severity = severity;
  }

  if (q) {
    // Treat search text as a literal phrase.
    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = { $regex: escapedQuery, $options: "i" };

    filter.$or = [{ cveId: match }, { title: match }, { description: match }];
  }

  // Return fields needed by the local table.
  const projection = {
    source: 1,
    cveId: 1,
    title: 1,
    description: 1,
    severity: 1,
    triageStatus: 1,
    createdAt: 1,
    updatedAt: 1,
  };

  // Show recently updated records first.
  const [records, total] = await Promise.all([
    collection
      .find(filter, { projection })
      .sort({ updatedAt: -1, _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    records,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Returns a local record owned by the guest workspace.
 */
export async function findLocalVulnerabilityById(id, ownerId) {
  // Require server-assigned ownership.
  if (typeof ownerId !== "string" || !/^[a-f0-9]{64}$/.test(ownerId)) {
    throw new Error("A local workspace is required.");
  }

  const collection = await getVulnerabilitiesCollection();

  // Match the record, local source, and owner.
  return collection.findOne(
    { _id: new ObjectId(id), source: "local", ownerId },
    {
      // Return editable details without ownership.
      projection: {
        source: 1,
        cveId: 1,
        title: 1,
        description: 1,
        severity: 1,
        explanation: 1,
        protectiveGuidance: 1,
        triageStatus: 1,
        analystNotes: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  );
}
