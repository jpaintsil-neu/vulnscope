import { ObjectId } from "mongodb";
import { getDatabase } from "./connection.js";
import { createProductRecord } from "../models/product.js";

const PAGE_SIZE = 20;

const PUBLIC_LIST_PROJECTION = {
  source: 1,
  productName: 1,
  vendor: 1,
  version: 1,
  productType: 1,
};

const PUBLIC_DETAIL_PROJECTION = {
  ...PUBLIC_LIST_PROJECTION,
  cpeName: 1,
  lastModifiedAt: 1,
  createdAt: 1,
  updatedAt: 1,
};

const LOCAL_LIST_PROJECTION = {
  ...PUBLIC_LIST_PROJECTION,
  reviewStatus: 1,
  createdAt: 1,
  updatedAt: 1,
};

const LOCAL_DETAIL_PROJECTION = {
  ...LOCAL_LIST_PROJECTION,
  exposureNotes: 1,
  comments: 1,
};

// all products collection
export async function getProductsCollection() {
  const database = await getDatabase();

  return database.collection("products");
}

export async function initializeProductsCollection() {
  const collection = await getProductsCollection();

  await collection.createIndexes([
    {
      key: { cpeNameId: 1 },
      name: "unique_nvd_cpe",
      unique: true,
      partialFilterExpression: {
        source: "nvd",
        cpeNameId: { $type: "string" },
      },
    },
    {
      // search records
      key: { source: 1, vendor: 1, productName: 1 },
      name: "source_vendor_name",
    },
    {
      // filter records by type
      key: { source: 1, productType: 1, vendor: 1 },
      name: "source_type_vendor",
    },
    {
      // search local records
      key: { source: 1, ownerId: 1, updatedAt: -1 },
      name: "source_owner_updated",
    },
  ]);

  return collection;
}

// workspace
function requireOwnerId(ownerId) {
  if (typeof ownerId !== "string" || !/^[a-f0-9]{64}$/.test(ownerId)) {
    throw new Error("A local workspace is required.");
  }
}

function buildFilter(base, { q = "", productType = "" }) {
  const filter = { ...base };

  if (productType) {
    filter.productType = productType;
  }

  if (q) {
    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = { $regex: escapedQuery, $options: "i" };

    filter.$or = [
      { productName: match },
      { vendor: match },
      { version: match },
    ];
  }

  return filter;
}

async function listProducts(filter, sort, projection, page) {
  const collection = await getProductsCollection();

  const [records, total] = await Promise.all([
    collection
      .find(filter, { projection })
      .sort(sort)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    records,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  };
}

// returns matched product list
export async function listPublicProducts({
  page = 1,
  q = "",
  productType = "",
} = {}) {
  const filter = buildFilter({ source: "nvd" }, { q, productType });

  return listProducts(
    filter,
    { vendor: 1, productName: 1, _id: 1 },
    PUBLIC_LIST_PROJECTION,
    page,
  );
}

export async function findPublicProductById(id) {
  const collection = await getProductsCollection();

  return collection.findOne(
    { _id: new ObjectId(id), source: "nvd" },
    { projection: PUBLIC_DETAIL_PROJECTION },
  );
}
