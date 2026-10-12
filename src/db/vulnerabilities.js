import { ObjectId } from "mongodb";
import { getDatabase } from "./connection.js";

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
