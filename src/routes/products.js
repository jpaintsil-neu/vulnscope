import { Router } from "express";
import {
  createLocalProduct,
  deleteLocalProduct,
  findLocalProductById,
  findPublicProductById,
  listLocalProducts,
  listPublicProducts,
  updateLocalProduct,
} from "../db/products.js";
import { PRODUCT_TYPES, REVIEW_STATUSES } from "../models/product.js";
import { getLocalWorkspaceOwner } from "../services/local-workspace.js";
import { validateLocalProduct } from "../services/product-validation.js";

// product API routes
const router = Router();

const OBJECT_ID_PATTERN = /^[a-fA-F0-9]{24}$/;

// validates the page, search, and filter queries
function parseListQuery(query, isLocal) {
  const rawPage = query.page ?? "1";
  const rawQuery = query.q ?? "";
  const rawType = query.productType ?? "";
  const rawStatus = query.reviewStatus ?? "";

  const page =
    typeof rawPage === "string" && /^\d+$/.test(rawPage)
      ? Number(rawPage)
      : NaN;

  if (!Number.isSafeInteger(page) || page < 1 || page > 10000) {
    return { error: "Page must be a whole number between 1 and 10000." };
  }

  // validates the search text before querying
  if (
    typeof rawQuery !== "string" ||
    rawQuery.length > 200 ||
    rawQuery.includes("\0")
  ) {
    return { error: "Enter a valid search of up to 200 characters." };
  }

  const productType = typeof rawType === "string" ? rawType.trim() : null;

  if (
    productType === null ||
    (productType && !PRODUCT_TYPES.includes(productType))
  ) {
    return { error: "Invalid product type filter." };
  }

  // reviews status of local records
  const reviewStatus = typeof rawStatus === "string" ? rawStatus.trim() : null;

  if (
    reviewStatus === null ||
    (reviewStatus && (!isLocal || !REVIEW_STATUSES.includes(reviewStatus)))
  ) {
    return { error: "Invalid review-status filter." };
  }

  return {
    values: { page, q: rawQuery.trim(), productType, reviewStatus },
  };
}

// guest workspace record
router.post("/local", async (req, res) => {
  if (!req.is("application/json")) {
    return res.status(415).json({ error: "Submit the record as JSON." });
  }

  const { values, errors } = validateLocalProduct(req.body);

  if (!values) {
    return res.status(400).json({
      error: "Please correct the highlighted fields.",
      errors,
    });
  }

  try {
    const ownerId = getLocalWorkspaceOwner(req, res, { create: true });
    const record = await createLocalProduct(values, ownerId);

    return res.status(201).json({ record });
  } catch (error) {
    console.error("Local product creation failed:", error.name);

    return res.status(500).json({
      error: "Unable to create the product. Please try again.",
    });
  }
});

// browses this guest's local workspace records
router.get("/local", async (req, res) => {
  res.set("Cache-Control", "no-store");

  const { values, error } = parseListQuery(req.query, true);

  if (!values) {
    return res.status(400).json({ error });
  }

  try {
    const ownerId = getLocalWorkspaceOwner(req, res);

    // new visitors have no local records
    if (!ownerId) {
      return res.json({
        records: [],
        pagination: {
          page: values.page,
          pageSize: 20,
          total: 0,
          totalPages: 0,
        },
      });
    }

    return res.json(await listLocalProducts({ ownerId, ...values }));
  } catch (caught) {
    console.error("Local product search failed:", caught.name);

    return res.status(500).json({
      error: "Unable to load your local records. Please try again.",
    });
  }
});

// read record from this guest's workspace
router.get("/local/:id", async (req, res) => {
  res.set("Cache-Control", "no-store");

  const { id } = req.params;

  if (!OBJECT_ID_PATTERN.test(id)) {
    return res.status(400).json({ error: "Invalid product ID." });
  }

  try {
    const ownerId = getLocalWorkspaceOwner(req, res);

    const record = ownerId ? await findLocalProductById(id, ownerId) : null;

    if (!record) {
      return res.status(404).json({ error: "Local product not found." });
    }

    return res.json({ record });
  } catch (error) {
    console.error("Local product detail lookup failed:", error.name);

    return res.status(500).json({
      error: "Unable to load this local record. Please try again.",
    });
  }
});

// search imported product records
router.get("/", async (req, res) => {
  const { values, error } = parseListQuery(req.query, false);

  if (!values) {
    return res.status(400).json({ error });
  }

  try {
    const { page, q, productType } = values;

    return res.json(await listPublicProducts({ page, q, productType }));
  } catch (caught) {
    console.error("Product search failed:", caught.name);

    return res.status(500).json({
      error: "Unable to load products. Please try again.",
    });
  }
});

// updating guest's workspace record
router.put("/local/:id", async (req, res) => {
  res.set("Cache-Control", "no-store");

  const { id } = req.params;

  // validate database & rejects malformed IDs
  if (!OBJECT_ID_PATTERN.test(id)) {
    return res.status(400).json({ error: "Invalid product ID." });
  }

  if (!req.is("application/json")) {
    return res.status(415).json({ error: "Submit the record as JSON." });
  }

  try {
    const ownerId = getLocalWorkspaceOwner(req, res);

    // require an existing workspace
    if (!ownerId) {
      return res.status(404).json({ error: "Local product not found." });
    }

    const { values, errors } = validateLocalProduct(req.body);

    if (!values) {
      return res.status(400).json({
        error: "Please correct the highlighted fields.",
        errors,
      });
    }

    const record = await updateLocalProduct(id, values, ownerId);

    // handles unavailable records
    if (!record) {
      return res.status(404).json({ error: "Local product not found." });
    }

    return res.json({ record });
  } catch (error) {
    console.error("Local product update failed:", error.name);

    return res.status(500).json({
      error: "Unable to update this local record. Please try again.",
    });
  }
});

// delete a guest's workspace record
router.delete("/local/:id", async (req, res) => {
  res.set("Cache-Control", "no-store");

  const { id } = req.params;

  // validate database & rejects malformed IDs
  if (!OBJECT_ID_PATTERN.test(id)) {
    return res.status(400).json({ error: "Invalid product ID." });
  }

  try {
    const ownerId = getLocalWorkspaceOwner(req, res);

    // require an existing workspace
    if (!ownerId) {
      return res.status(404).json({ error: "Local product not found." });
    }

    if (!(await deleteLocalProduct(id, ownerId))) {
      return res.status(404).json({ error: "Local product not found." });
    }

    return res.status(204).end();
  } catch (error) {
    console.error("Local product deletion failed:", error.name);

    return res.status(500).json({
      error: "Unable to delete this local record. Please try again.",
    });
  }
});

// read an imported product
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // validate database & rejects malformed IDs
  if (!OBJECT_ID_PATTERN.test(id)) {
    return res.status(400).json({ error: "Invalid product ID." });
  }

  try {
    const record = await findPublicProductById(id);

    if (!record) {
      return res.status(404).json({ error: "Product not found." });
    }

    return res.json({ record });
  } catch (error) {
    console.error("Product detail lookup failed:", error.name);

    return res.status(500).json({
      error: "Unable to load this product. Please try again.",
    });
  }
});

export default router;
