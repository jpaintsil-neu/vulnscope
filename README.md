# VulnScope

**Understand, Track, and Act on Cybersecurity Vulnerabilities**

A full-stack cybersecurity awareness and review application created for
**CS 5610: Web Development** at Northeastern University.

VulnScope helps everyday technology users, cybersecurity students, and
security professionals explore publicly disclosed vulnerabilities and
organize locally managed security reviews.

- **Live Site:** [VulnScope](https://vulnscope-d4xk.onrender.com/)
- **Repository:** [jpaintsil-neu/vulnscope](https://github.com/jpaintsil-neu/vulnscope)
- **Final Review:** October 18, 2026

## Authors

### John Paintsil

- GitHub: [jpaintsil-neu](https://github.com/jpaintsil-neu)
- Responsibility: Vulnerability Awareness & Triage workspace.
- Shared work: initial Figma mockups, site layout, supporting pages,
  documentation, and deployment coordination.

### Sania Anwar

- GitHub: [saniaanwar](https://github.com/saniaanwar)
- Responsibility: Product & Technology workspace.
- Includes the Products collection, import, API, browser views, and forms.

**Course Page:** [CS 5610 — Web Development](https://johnguerra.co/classes/webDevelopment_online_fall_2026/)

## Project Objective

The goal is to build a useful, approachable application using semantic HTML,
modular CSS, vanilla JavaScript, Node.js, Express, and MongoDB.

The application has two independent feature areas:

- **Vulnerability Awareness & Triage:** Explore CVEs and manage local
  vulnerability records, review statuses, and analyst notes.
- **Product & Technology:** Explore technology products and manage local
  product-security records and review notes.

Each workspace supports its own create, read, update, and delete (CRUD)
workflow without depending on the other workspace's collection. Each
collection distinguishes imported National Vulnerability Database (NVD)
records from guest-authored records using its `source` field.

The primary implementation focus is the **Homepage, Vulnerabilities, and
Products** pages. Supporting About and Resources pages provide
context and cybersecurity learning material.

The project also demonstrates:

- Client-side record rendering with vanilla JavaScript.
- ES modules in frontend and backend code.
- Node.js and Express API development.
- MongoDB operations using the native driver.
- Search, filtering, pagination, and record detail views.
- Semantic controls, responsive layouts, and accessible navigation.
- ESLint, Prettier, and Git/GitHub workflow.

**Final build:** VulnScope is publicly deployed on Render with MongoDB Atlas.
Read-only API checks on October 18 confirmed **1,500 imported Common
Vulnerabilities and Exposures (CVE) records** and **6,344 imported Common
Platform Enumeration (CPE) product records**. Hosted Vulnerabilities checks
passed for public CVE search, severity filtering, pagination, details,
and guest-workspace record creation, editing, persistence, and deletion.
Separate-browser guest isolation was also checked.

Local records support review-status filtering, and active filters are
preserved in the URL. Imported CVEs remain read-only.

The Products workspace is implemented with its own `products` collection,
API, search/filtering, detail views, and guest-owned CRUD. It was tested
locally with 6,344 imported NVD CPE records; the live API now returns the
same public record count. Sania owns the Products workflow and its validation.

The team reports application coding complete. The reviewed application
snapshot is [`ccfe03b`](https://github.com/jpaintsil-neu/vulnscope/commit/ccfe03b1859c9f86fe92d0220352191b5a18a03b)
(October 17, 2026, 23:20 UTC). This identifies the reviewed code; compliance
with the course's freeze deadline must be confirmed against that deadline.

## Pages

### Home — [`public/index.html`](./public/index.html)

The homepage introduces the platform and its two workspaces.

Implemented:

- Minimal navy gradient banner.
- Shared logo, navigation, sticky header, and footer.
- One search field with a Vulnerabilities/Products category selector.
- Vulnerability search by CVE ID or keyword; product search by vendor,
  product, or version.
- Navigation to the selected workspace with the query applied.
- Overview of the vulnerability and product workspaces.

### Vulnerabilities — [`public/vulnerabilities.html`](./public/vulnerabilities.html)

The workspace supports:

- Public CVE and My local records views.
- CVE ID, title, and description keyword search.
- Severity filtering.
- Results in pages of up to 20 records.
- Sticky column headings and top Previous/Next controls.
- Links to public and local record details.
- Loading, empty-result, error, and retry states.
- Add Vulnerability link to the local-record form.
- Local review-status filtering: New, In review, and Resolved.
- Active search, severity, and local review-status filters preserved in the URL.
- Filter-aware overview cards and charts.

### Products — [`public/products.html`](./public/products.html)

- Public products and local records views.
- Vendor, product, and version keyword search.
- Product type filtering: Application, Operating system, Hardware.
- Local review-status filtering: Not reviewed, In review, and Reviewed.
- Results in pages of up to 20 records.
- Sticky column headings and top Previous/Next controls.
- Links to public and local product details, including the original CPE name.
- Loading, empty-result, error, and retry states.
- Add Product link to the local-record form, with editing and confirmed deletion.
- Active search, type, and review-status filters preserved in the URL.

### Supporting Pages

- [About](./public/about.html) — Platform purpose, workflow, and data context.
- [Resources](./public/resources.html) — Cybersecurity learning resources.
- [FAQs](./public/faqs.html) — Platform usage, public data, and guest-workspace guidance.

See the [user guide](docs/user-guide.md) for page workflows.

## Original JavaScript Functionality

Vanilla JavaScript renders API results, switches public/local views, manages
filters and pagination, and handles local-record forms and actions.
Active filters are preserved in the URL.

See [architecture and module responsibilities](docs/architecture.md).

## Technologies

- HTML5 and CSS3.
- Vanilla JavaScript ES6+ and ES modules.
- CSS Grid and Flexbox.
- Fetch API.
- Node.js and npm.
- Express.
- MongoDB and the native MongoDB Node.js driver.
- Git and GitHub.
- ESLint and Prettier.

The implementation uses ES modules and the native database driver.
Mongoose and server-side template engines are excluded from the project.

## Project Structure

| Location                     | Purpose                                                              |
| ---------------------------- | -------------------------------------------------------------------- |
| `public/`                    | HTML pages, CSS modules, browser JavaScript, and images              |
| `src/`                       | Express routes, database modules, models, and services               |
| `scripts/`                   | Database setup, NVD sample check, and data import                    |
| `docs/`                      | Detailed project documentation                                       |
| `public/images/screenshots/` | Thumbnail, application screenshots, mockups, and deployment evidence |

See the [complete folder/file mapping](docs/architecture.md#folder-and-file-mapping).

## Design Documentation

Personas, user stories, mockups, and responsibility split are documented in
the [design overview](docs/design.md).

- [Full design document](https://docs.google.com/document/d/1_EBsK1iSNJMkEcqX7na_RYYyHbUdZPt71yt7oZE1Pjw/edit)
- [Mockup index](https://docs.google.com/spreadsheets/d/1OPhlHSFipS1TBg5fY3gODJUL3W921hsAR03a6K-po7k/edit)
- [Editable Figma designs](https://www.figma.com/design/N6bytNugV2tRNjimOJfo8H)
- [Exported mockups](docs/mockup.md)

## Installation and Local Development

Prerequisites: Node.js **24 LTS**, npm, a running MongoDB server or Atlas
connection, and internet access for the NVD import.

```bash
# Clone and install.
git clone https://github.com/jpaintsil-neu/vulnscope.git
cd vulnscope
npm ci
cp .env.example .env

# Prepare vulnerability indexes and import both datasets.
node scripts/setup-database.js
node scripts/import-vulnerabilities.js
node scripts/import-products.js

# Start the application.
npm run dev
```

For local MongoDB, the example configuration uses:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=vulnscope
PORT=3000
```

For Atlas, edit `.env` with your own connection settings before running the scripts.
Open [http://localhost:3000](http://localhost:3000).
Use `npm start` for a regular server start.

See [detailed setup and troubleshooting](docs/setup.md).
Database records are imported separately and are not bundled with the repository.

## Using the Application

On Home, choose Vulnerabilities or Products, enter a query, and select Search.
A blank query opens the selected public catalog. Alternatively, open
Vulnerabilities and choose Public CVEs or My local
records. Apply search/severity filters; local records also support review status.
Open a record for details, or use Add Vulnerability to create a local record.

For products, open Products and choose Public products or My local records.
Search by vendor, product, or version and filter by product type; local
records also support review status. Use Add Product to create a local record.

Guest records belong to the browser workspace that created them.
Clearing its cookie removes access without deleting database records.
Public CVEs and products remain read-only. Account login and cross-device
workspace access are outside this build.

See the [user guide](docs/user-guide.md).

## API Endpoints

The Express API provides public CVE browsing and guest-owned local CRUD.
Local searches support `triageStatus` alongside search and severity.

See the [API reference](docs/api.md) for endpoints, validation, and examples.

Products uses `/api/products` for public CPE browsing and
`/api/products/local` for guest-owned CRUD, with `productType` and local
`reviewStatus` filters.

## Public Data Sources

- [NIST NVD CVE API](https://nvd.nist.gov/developers/vulnerabilities) — implemented.
- [NIST NVD CPE/Product API](https://nvd.nist.gov/developers/products) — implemented.

The development import is manual; the dataset reflects its last successful run.
See [import behavior](docs/setup.md#nvd-import).

## Code Quality

**Final review — October 18, 2026:** ESLint and Prettier verification passed
on the reviewed application snapshot. The production dependency audit
(`npm audit --omit=dev`) reported zero known vulnerabilities. The final
documentation changes also passed formatting, whitespace, and relative-link
checks.

### Run ESLint

```bash
npm run lint
```

### Format Files with Prettier

```bash
npm run format
```

### Verify Prettier Formatting

```bash
npm run format:check
```

Source modules include brief purpose comments and short documentation for
reusable functions.

## Validation

On October 14, 2026, all seven checked HTML source files and six rendered
Vulnerabilities views passed W3C Nu HTML Checker validation with zero
errors and zero warnings.

On October 15, hosted checks passed against the Render application and
MongoDB Atlas for public CVE browsing, search, severity filters, pagination,
details, guest-record CRUD, persistence, and separate-browser isolation.
The deployed vulnerability dataset contained 1,500 imported records.

The October 18 review confirmed both public dataset counts, current source
organization, and code-quality results. Earlier HTML and manual workflow
results are dated evidence; they do not establish a complete regression of
every subsequent change or of Sania's Products workflow.

See [validation results, corrections, and remaining checks](docs/validation.md)
for the detailed record and testing instructions.

## Accessibility

Implemented considerations include:

- Semantic HTML and standard interactive controls.
- Skip-to-content navigation.
- Visible keyboard focus.
- Decorative logo images with empty alternative text.
- Accessible mobile-menu state and Escape behavior.
- Keyboard-accessible table scrolling.
- Labeled search/filter controls.
- `aria-expanded`, `aria-controls`, and `aria-busy`.
- Status announcements for loading and errors.
- Responsive layout rules.

**Checked on October 15:** Hosted layouts at 360, 768, and 1440 CSS pixels,
200% zoom, visible focus, skip navigation, mobile-menu behavior, and keyboard
operation of the completed workflows.

The October 15 follow-up also passed VoiceOver result and error-announcement
checks. Eight sampled text/background color combinations exceeded 4.5:1.
These checks do not establish full accessibility compliance; the latest
homepage search and Products views need their own final manual confirmation.

## Peer Code Review

**Pending assignment after Canvas submission.** Canvas assigns the classmate's
project to review. After completing the review, add the reviewed repository,
review or pull-request link, findings, and validation performed here.

## Screenshot

### Homepage

![homepage thumbnail](public/images/screenshots/thumbnail.png)

See [development screenshots](docs/dev.md) and [Figma design mockups](docs/mockup.md).

## Presentation and Demo Video

- **Google Slides Presentation (John):** [John's presentation](https://docs.google.com/presentation/d/13cx7LqqmMWwijsvRJpnUI7jwwlo0HvpCHUYRvUAL6HQ/edit)
- **Google Slides Presentation (Sania):** [Sania's presentation](https://docs.google.com/presentation/d/1bH6_mhe3n3b-y8X_ObTOzPIioFuBz1YehroUM92Tutg/edit?usp=sharing)
- **Combined presentation and website demo:** [John and Sania — 1080p video](https://drive.google.com/file/d/1hT3PxPNHPnn4Kedygqcq3sNCSdnDHBZd/view) (approximately 9 minutes 34 seconds).

Before submitting, confirm that the design document, slides, and video open
without an account invitation, the submission thumbnail displays correctly,
and the Canvas/Google Form submission is complete. Public video playback,
submission receipts, and acceptance of the combined runtime are not verified
by the repository review.

## Generative AI Disclosure

### Tool and Model

- **Tool:** ChatGPT / Codex / Claude.
- **Provider:** OpenAI / Anthropic.
- **Model/version details:** Not verified in this repository; no specific
  version is asserted here.

### How Generative AI Was Used

- John Paintsil — ChatGPT/Codex assisted with planning and mockups, generated
  and revised code, debugging, validation guidance, documentation, presentation
  scripts, and video preparation. This describes the assistance used and does
  not assert course-policy approval.

- Sania Anwar - I used Claude to organize the README and design documentation on github. I also used it to help me with the database connection issues.

## License

This project is licensed under the **MIT License**.

See [`LICENSE`](./LICENSE) for details.
