# Architecture

## Application Structure

Express serves `public/` and mounts the vulnerability router at
`/api/vulnerabilities`. Browser ES modules fetch JSON and render records.
Database operations use the native MongoDB driver and a shared connection.

There is no frontend bundling step or server-side template engine.

## Folder and File Mapping

| Location         | Files                                                                                                 | Responsibility                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `public/`        | `index.html`                                                                                          | Homepage and public vulnerability search entry            |
| `public/`        | `vulnerabilities.html`                                                                                | Search/filter controls and records table                  |
| `public/`        | `vulnerability.html`                                                                                  | Public/local record details                               |
| `public/`        | `vulnerability-form.html`                                                                             | Local creation/editing form                               |
| `public/`        | `about.html`, `resources.html`, `faqs.html`                                                           | Supporting content                                        |
| `public/css/`    | `styles.css`                                                                                          | Shared theme, header, footer, and controls                |
| `public/css/`    | `home.css`                                                                                            | Homepage layout                                           |
| `public/css/`    | `workspace.css`                                                                                       | Filters, results table, and pagination                    |
| `public/css/`    | `vulnerability.css`                                                                                   | Detail panels and local actions                           |
| `public/css/`    | `vulnerability-form.css`                                                                              | Form layout and errors                                    |
| `public/js/`     | `layout.js`                                                                                           | Shared layout and mobile navigation                       |
| `public/js/`     | `vulnerabilities.js`                                                                                  | Results, filters, URL state, and pagination               |
| `public/js/`     | `vulnerability.js`                                                                                    | Detail rendering and confirmed deletion                   |
| `public/js/`     | `vulnerability-form.js`                                                                               | Loading, validation feedback, and POST/PUT saves          |
| `public/images/` | `logo.png`                                                                                            | Shared branding                                           |
| `src/`           | `server.js`                                                                                           | Express startup, static files, and API mounting           |
| `src/db/`        | `connection.js`                                                                                       | Environment configuration and reusable MongoDB connection |
| `src/db/`        | `vulnerabilities.js`                                                                                  | Collection indexes and public/local database operations   |
| `src/models/`    | `vulnerability.js`                                                                                    | Record defaults, severity levels, and review statuses     |
| `src/routes/`    | `vulnerabilities.js`                                                                                  | HTTP input validation and responses                       |
| `src/services/`  | `local-workspace.js`                                                                                  | Guest cookie and server-side owner identity               |
| `src/services/`  | `vulnerability-validation.js`                                                                         | Editable-field validation and normalization               |
| `src/services/`  | `nvd.js`                                                                                              | NVD retrieval and CVE conversion                          |
| `scripts/`       | `setup-database.js`, `check-nvd.js`, `import-vulnerabilities.js`                                      | Index setup, sample check, and import                     |
| `docs/`          | `design.md`, `architecture.md`, `setup.md`, `user-guide.md`, `api.md`, `validation.md`, `ai-usage.md` | Detailed documentation                                    |
| Root             | `README.md`, `LICENSE`                                                                                | Project overview and MIT license                          |
| Root             | `package.json`, `package-lock.json`                                                                   | Scripts and dependencies                                  |
| Root             | `eslint.config.js`, `prettier.config.js`, `.prettierignore`                                           | Quality-tool configuration                                |
| Root             | `.env.example`, `.gitignore`                                                                          | Configuration example and ignored local files             |

**Pending:** Products modules, Privacy/Contact pages, and application screenshots.

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

**Pending:** Products integration must add a second MongoDB collection with
its own CRUD workflow. Two source values in one collection do not satisfy
the two-collection rubric requirement.

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
