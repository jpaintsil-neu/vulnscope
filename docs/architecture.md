# Architecture

## Application Structure

Express serves `public/` and mounts the vulnerability router at
`/api/vulnerabilities` and the product router at /api/products. Browser ES modules fetch JSON and render records.
Database operations use the native MongoDB driver and a shared connection.

Render hosts the Express application at
[the live HTTPS site](https://vulnscope-d4xk.onrender.com/), and MongoDB Atlas
stores the vulnerability dataset, product datasets, and guest records. Render environment
variables supply the database configuration; credentials are not committed.
The `/api/health` route checks HTTP server availability, not database readiness.

There is no frontend bundling step or server-side template engine.

## Folder and File Mapping

| Location                     | Files                                                                                                         | Responsibility                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `public/`                    | `index.html`                                                                                                  | Homepage and shared public-catalog search                                        |
| `public/`                    | `vulnerabilities.html`                                                                                        | Search/filter controls and records table                                         |
| `public/`                    | `vulnerability.html`                                                                                          | Public/local record details                                                      |
| `public/`                    | `vulnerability-form.html`                                                                                     | Local creation/editing form                                                      |
| `public/`                    | `about.html`, `resources.html`, `faqs.html`                                                                   | Supporting content                                                               |
| `public/css/`                | `styles.css`                                                                                                  | Shared theme, header, footer, and controls                                       |
| `public/css/`                | `home.css`                                                                                                    | Homepage layout                                                                  |
| `public/css/`                | `workspace.css`                                                                                               | Filters, results table, and pagination                                           |
| `public/css/`                | `vulnerability.css`                                                                                           | Detail panels and local actions                                                  |
| `public/css/`                | `vulnerability-form.css`                                                                                      | Form layout and errors                                                           |
| `public/js/`                 | `layout.js`                                                                                                   | Shared layout and mobile navigation                                              |
| `public/js/`                 | `home-search.js`                                                                                              | Homepage category selection and search destination                               |
| `public/js/`                 | `vulnerability-overview.js`                                                                                   | Filter-aware overview cards and charts                                           |
| `public/css/`                | `vulnerability-overview.css`, `about.css`, `resources.css`                                                    | Overview and supporting-page visuals                                             |
| `public/js/`                 | `vulnerabilities.js`                                                                                          | Results, filters, URL state, and pagination                                      |
| `public/js/`                 | `vulnerability.js`                                                                                            | Detail rendering and confirmed deletion                                          |
| `public/js/`                 | `vulnerability-form.js`                                                                                       | Loading, validation feedback, and POST/PUT saves                                 |
| `public/images/`             | `logo.png`                                                                                                    | Shared branding                                                                  |
| `public/images/screenshots/` | `thumbnail.png`, `devs/`, `deploy/`, `mockups/`, `screenshots_sania/`, `w3-validator`                         | Submission thumbnail, application views, deployment evidence, and design exports |
| `src/`                       | `server.js`                                                                                                   | Express startup, static files, and API mounting                                  |
| `src/db/`                    | `connection.js`                                                                                               | Environment configuration and reusable MongoDB connection                        |
| `src/db/`                    | `vulnerabilities.js`                                                                                          | Collection indexes and public/local database operations                          |
| `src/models/`                | `vulnerability.js`                                                                                            | Record defaults, severity levels, and review statuses                            |
| `src/routes/`                | `vulnerabilities.js`                                                                                          | HTTP input validation and responses                                              |
| `src/services/`              | `local-workspace.js`                                                                                          | Guest cookie and server-side owner identity                                      |
| `src/services/`              | `vulnerability-validation.js`                                                                                 | Editable-field validation and normalization                                      |
| `src/services/`              | `nvd.js`                                                                                                      | NVD retrieval and CVE conversion                                                 |
| `src/services/`              | `vulnerability-summary.js`                                                                                    | Severity and review-status aggregation results                                   |
| `scripts/`                   | `setup-database.js`, `check-nvd.js`, `import-vulnerabilities.js`                                              | Index setup, sample check, and import                                            |
| `docs/`                      | `design.md`, `architecture.md`, `setup.md`, `user-guide.md`, `api.md`, `validation.md`, `dev.md`, `mockup.md` | Detailed documentation and image galleries                                       |
| Root                         | `README.md`, `LICENSE`                                                                                        | Project overview and MIT license                                                 |
| Root                         | `package.json`, `package-lock.json`                                                                           | Scripts and dependencies                                                         |
| Root                         | `eslint.config.js`, `prettier.config.js`, `.prettierignore`                                                   | Quality-tool configuration                                                       |
| Root                         | `.env.example`, `.gitignore`                                                                                  | Configuration example and ignored local files                                    |
| `public/`                    | `products.html`                                                                                               | Product search/filter controls and records table                                 |
| `public/`                    | `product-details.html`                                                                                        | Public/local product details                                                     |
| `public/`                    | `product-form.html`                                                                                           | Local product creation/editing form                                              |
| `public/css/`                | `products.css`, `product-details.css`, `product-form.css`                                                     | Products table, detail panels, and form layout                                   |
| `public/js/`                 | `products.js`                                                                                                 | Product results, filters, URL state, pagination                                  |
| `public/js/`                 | `product-details.js`                                                                                          | Product detail rendering and confirmed deletion                                  |
| `public/js/`                 | `product-form.js`                                                                                             | Product loading, validation feedback, POST/PUT                                   |
| `src/db/`                    | `products.js`                                                                                                 | Product indexes and public/local operations                                      |
| `src/models/`                | `product.js`                                                                                                  | Product defaults, types, and review statuses                                     |
| `src/routes/`                | `products.js`                                                                                                 | Product HTTP validation and responses                                            |
| `src/services/`              | `product-validation.js`                                                                                       | Product field validation                                                         |
| `src/services/`              | `nvd-products.js`                                                                                             | NVD CPE retrieval and conversion                                                 |
| `scripts/`                   | `check-nvd-products.js`, `import-products.js`                                                                 | Product sample check and import                                                  |
| `.github/workflows/`         | `quality-checks.yml`                                                                                          | Automated ESLint and Prettier checks for pull requests and pushes to `main`      |     |

## Collections and Record Origin

The implemented `vulnerabilities` collection contains both imported records
(`source: "nvd"`) and guest records (`source: "local"`).

| Field group        | Fields                                                 |
| ------------------ | ------------------------------------------------------ |
| Identity/origin    | `_id`, `source`, `ownerId`, `sourceUrl`                |
| Main content       | `cveId`, `title`, `description`, `severity`            |
| CVSS               | `cvssScore`, `cvssVersion`, `cvssVector`, `cvssSource` |
| Source information | `publishedAt`, `lastModifiedAt`, `references`          |
| Supporting content | `explanation`, `protectiveGuidance`                    |
| Local review       | `triageStatus`, `analystNotes`                         |
| Application dates  | `createdAt`, `updatedAt`                               |

An optional CVE ID on a local record does not change its local origin.
Updates preserve `createdAt` and refresh `updatedAt`.

Indexes support public date/severity browsing, owner-based local browsing,
and uniqueness of imported CVE IDs. Local records may share a CVE ID.

The `products` collection is separate and contains imported CPE records
(`source: "nvd"`) and guest records (`source: "local"`).

| Field group     | Fields                                             |
| --------------- | -------------------------------------------------- |
| Identity/origin | `_id`, `source`, `ownerId`, `cpeName`, `cpeNameId` |
| Main content    | `productName`, `vendor`, `version`, `productType`  |
| Local review    | `reviewStatus`, `exposureNotes`, `comments`        |
| Dates           | `lastModifiedAt`, `createdAt`, `updatedAt`         |

Indexes support vendor/name browsing, type filtering, owner-based local
browsing, and uniqueness of imported CPE IDs.

## Guest Workspace Identity

The server creates a random browser token and stores it in an HttpOnly,
SameSite=Strict cookie. Its SHA-256 hash becomes the internal local `ownerId`.

Local list/detail/update/delete queries require both local origin and the
requesting owner. Owner IDs are excluded from API responses.
The validator rejects client-supplied server-managed fields.

Production uses a Secure `__Host-` cookie and requires HTTPS.
Guest ownership is browser-based; account login and cross-device access
remain unimplemented.

## NVD Conversion

The converter selects English descriptions, usable CVSS information,
UTC source dates, and HTTP/HTTPS references. It skips rejected CVEs.
The importer refreshes public source fields while preserving existing
authored supporting content.

See [setup and import behavior](setup.md) and the [API contract](api.md).

[Back to project overview](../README.md)
