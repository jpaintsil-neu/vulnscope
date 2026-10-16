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

// workspace valid record creation
export async function createLocalProduct(values, ownerId) {
  requireOwnerId(ownerId);

  const collection = await getProductsCollection();
  const record = {
    ...createProductRecord("local"),
    ...values,
    source: "local",
    ownerId,
  };

  const result = await collection.insertOne(record);

  const savedRecord = { ...record, _id: result.insertedId };
  delete savedRecord.ownerId;

  return savedRecord;
}

// returns local records of the user
export async function listLocalProducts({
  ownerId,
  page = 1,
  q = "",
  productType = "",
  reviewStatus = "",
}) {
  requireOwnerId(ownerId);

  // results of a specific user's workspace
  const filter = buildFilter({ source: "local", ownerId }, { q, productType });

  if (reviewStatus) {
    filter.reviewStatus = reviewStatus;
  }

  // recently updated records are shown first
  return listProducts(
    filter,
    { updatedAt: -1, _id: -1 },
    LOCAL_LIST_PROJECTION,
    page,
  );
}

export async function findLocalProductById(id, ownerId) {
  requireOwnerId(ownerId);

  const collection = await getProductsCollection();

  // match record to owner
  return collection.findOne(
    { _id: new ObjectId(id), source: "local", ownerId },
    { projection: LOCAL_DETAIL_PROJECTION },
  );
}

export async function updateLocalProduct(id, values, ownerId) {
  requireOwnerId(ownerId);

  const collection = await getProductsCollection();

  const changes = {
    productName: values.productName,
    vendor: values.vendor,
    version: values.version,
    productType: values.productType,
    reviewStatus: values.reviewStatus,
    exposureNotes: values.exposureNotes,
    comments: values.comments,
    updatedAt: new Date(),
  };

  return collection.findOneAndUpdate(
    { _id: new ObjectId(id), source: "local", ownerId },
    { $set: changes },
    {
      returnDocument: "after",
      includeResultMetadata: false,
      upsert: false,
      projection: LOCAL_DETAIL_PROJECTION,
    },
  );
}

// delete records on a user's workspace
export async function deleteLocalProduct(id, ownerId) {
  requireOwnerId(ownerId);

  const collection = await getProductsCollection();
  const result = await collection.deleteOne({
    _id: new ObjectId(id),
    source: "local",
    ownerId,
  });

  return result.deletedCount === 1;
}
