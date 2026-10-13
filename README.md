# VulnScope

**Understand, Track, and Act on Cybersecurity Vulnerabilities**

A full-stack cybersecurity awareness and review application created for
**CS 5610: Web Development** at Northeastern University.

VulnScope helps everyday technology users, cybersecurity students, and
security professionals explore publicly disclosed vulnerabilities and
organize locally managed security reviews.

- **Live Site:** Pending — public deployment has not been completed.
- **Repository:** [jpaintsil-neu/vulnscope](https://github.com/jpaintsil-neu/vulnscope)
- **Progress Updated:** October 13, 2026

## Authors

### John Paintsil

- GitHub: [jpaintsil-neu](https://github.com/jpaintsil-neu)
- Responsibility: Vulnerability Awareness & Triage workspace.

### Sania Anwar

- Responsibility: Product & Technology workspace.

**Course Page:** [CS 5610 — Web Development](https://johnguerra.co/classes/webDevelopment_online_fall_2026/)

## Project Objective

The goal is to build a useful, approachable application using semantic HTML,
modular CSS, vanilla JavaScript, Node.js, Express, and MongoDB.

The application has two planned independent feature areas:

- **Vulnerability Awareness & Triage:** Explore CVEs and manage local
  vulnerability records, review statuses, and analyst notes.
- **Product & Technology:** Explore technology products and manage local
  product-security records and review notes.

Each workspace must support its own CRUD workflow without depending on the
other workspace's collection. Imported NVD source data remains separate
from locally managed records.

The primary implementation focus is the **Homepage, Vulnerabilities, and
Products** pages. Supporting About, Resources, and FAQs pages provide
context and cybersecurity learning material.

The project also demonstrates:

- Client-side record rendering with vanilla JavaScript.
- ES modules in frontend and backend code.
- Node.js and Express API development.
- MongoDB operations using the native driver.
- Search, filtering, pagination, and record detail views.
- Semantic controls, responsive layouts, and accessible navigation.
- ESLint, Prettier, and Git/GitHub workflow.

**Current milestone:** A successful local development import loaded
**1,500 CVE records**. Public CVE browsing and guest-workspace creation,
search, details, editing, and confirmed deletion are implemented.
Imported CVEs remain read-only. Homepage search integration, Products,
public deployment, and final submission deliverables remain pending.

## Pages

### Home — [`public/index.html`](./public/index.html)

The homepage introduces the platform and its two workspaces.

Implemented:

- Minimal banner wallpaper.
- Shared logo, navigation, sticky header, and footer.
- Homepage search interface.
- Overview of the vulnerability and product workspaces.

**Pending:** Connect the homepage search to the working APIs. The search
controls are currently disabled.

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

**Pending:** The planned triage-status filter.

### Vulnerability Details — [`public/vulnerability.html`](./public/vulnerability.html)

Public details show descriptions, available CVSS assessments, source dates,
and reference links.

Local details show titles, descriptions, severity, review status, analyst
notes, and creation/update dates. Authored explanations and protective
guidance appear when present.

Local records include **Edit record** and **Delete record** controls.
Deletion requires confirmation. Imported CVEs display read-only details
without editing or deletion controls.The breadcrumb returns users to the selected record collection.

### Add / Edit Vulnerability — [`public/vulnerability-form.html`](./public/vulnerability-form.html)

One form supports creating and editing guest-workspace records:

- Required title and description.
- Optional CVE ID, analyst notes, explanation, and protective guidance.
- Severity and review-status selections.
- Browser validation and server-returned field errors.
- Existing-value loading before editing is enabled.
- Save progress, retry feedback, and duplicate-submission guards.

A successful save opens the local record's detail page.
Unavailable or unowned records cannot be edited.

### Products — Pending Integration

Sania owns this workspace. Its implementation has not yet been integrated
into `main`.

**Pending:** Product data import, MongoDB collection, APIs, search/filtering,
detail views, and local-record CRUD interface.

### Supporting Pages

- [About](./public/about.html) — Platform purpose, workflow, and data context.
- [Resources](./public/resources.html) — Cybersecurity learning resources.
- [FAQs](./public/faqs.html) — Frequently asked questions.

**Pending:** Privacy Policy and Contact destinations.

## Original JavaScript Functionality

The project uses ES modules for browser behavior, API routes, database
operations, and supporting services.

### Record Search and Collection Switching

Visitors can switch between imported public CVEs and their guest workspace's
local records. Search text and severity selections are sent to the matching
API, and the results table is rendered in the browser.

### Pagination and Detail Rendering

The interface updates page summaries, navigation controls, record counts,
column headings, and detail links. Detail pages select the public or local
API and render the matching record fields.

### Guest Workspace Records

The server assigns local-record ownership using a browser workspace cookie.
The browser token is hashed before it is used as the database owner ID.

Local records support creation, browsing, detail viewing, editing, and
confirmed deletion. The server validates creation and update submissions
and accepts only editable fields.

Local list, detail, update, and delete operations restrict access to the
requesting workspace's records. Updates preserve the creation date and
refresh the update date. Imported NVD records remain read-only through
the application.

**Pending:** Owner-restricted update/delete operations and their browser controls.

### NVD Import and Conversion

Backend modules retrieve NVD CVE data, normalize descriptions and CVSS
information, preserve UTC source dates, and import accepted records into
MongoDB using upserts.

The import runs manually. The dataset reflects the last successful import.

### Responsive Navigation

The shared layout module controls the mobile navigation using
`aria-expanded` and `aria-controls`. Escape closes the menu and restores
focus to the menu button.

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

The following mapping reflects files currently present on `main`.

```text
vulnscope/
├── public/
│   ├── css/
│   │   ├── home.css
│   │   ├── styles.css
│   │   ├── vulnerability.css
│   │   ├── vulnerability-form.css
│   │   └── workspace.css
│   ├── images/
│   │   └── logo.png
│   ├── js/
│   │   ├── layout.js
│   │   ├── vulnerabilities.js
│   │   ├── vulnerability.js
│   │   └── vulnerability-form.js
│   ├── about.html
│   ├── faqs.html
│   ├── index.html
│   ├── resources.html
│   ├── vulnerabilities.html
│   └── vulnerability.html
├── scripts/
│   ├── check-nvd.js
│   ├── import-vulnerabilities.js
│   └── setup-database.js
├── src/
│   ├── db/
│   │   ├── connection.js
│   │   └── vulnerabilities.js
│   ├── models/
│   │   └── vulnerability.js
│   ├── routes/
│   │   └── vulnerabilities.js
│   ├── services/
│   │   ├── local-workspace.js
│   │   ├── nvd.js
│   │   └── vulnerability-validation.js
│   └── server.js
├── .env.example
├── .gitignore
├── .prettierignore
├── eslint.config.js
├── LICENSE
├── package.json
├── package-lock.json
├── prettier.config.js
└── README.md
```

**Pending:** Products modules, application screenshots, and final
submission documentation.

## Design Documentation

- [0. VulnScope Design Mockups — Index](https://docs.google.com/spreadsheets/d/1OPhlHSFipS1TBg5fY3gODJUL3W921hsAR03a6K-po7k/edit?usp=drivesdk)

The design document draft covers the project description, personas, user
stories, use cases, technical architecture, and responsibility split.
The mockup index organizes the exported references and includes the editable
Figma link.

### User Personas

- **Joe — Everyday Technology User:** Wants to understand risks affecting
  software and devices and learn practical protective steps.
- **Ahmed — Cybersecurity Student:** Wants to explore CVEs, severity ratings,
  and relationships between vulnerabilities and technologies.
- **Fatima — Security Analyst:** Needs detailed records, triage information,
  filtering, and review notes.

### User Stories

These describe the intended complete workflows.

- As Joe, I want to search vulnerability records so I can identify issues
  that may be relevant to technology I use.
- As Ahmed, I want to examine CVE details and protective guidance so I can
  understand vulnerability assessment and response.
- As Fatima, I want to create, update, and delete local vulnerability records
  and notes so I can maintain an organized review workspace.
- As Joe, I want to browse product records so I can learn about software and
  devices that may have security concerns.
- As Ahmed, I want to view vendor, product, version, and review information so
  I can understand how vulnerabilities relate to technologies.
- As Fatima, I want to manage local product records and review notes so I can
  maintain an accurate product-security workspace.

**Pending:** Update the design document with completed mockup references and
current implementation progress, then review the final document and sharing
access before submission.

## Installation and Local Development

### 1. Prerequisites

- Node.js **24 LTS** with npm is recommended.
- A running MongoDB server or a MongoDB Atlas connection.
- Internet access for NVD requests.

### 2. Clone the Repository

```bash
git clone https://github.com/jpaintsil-neu/vulnscope.git
cd vulnscope
```

### 3. Install Dependencies

```bash
npm ci
```

### 4. Configure the Environment

For a fresh clone:

```bash
cp .env.example .env
```

For local MongoDB:

```dotenv
# Local database connection.
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=vulnscope

# HTTP server port.
PORT=3000
```

For Atlas, supply your own connection URI. Keep credentials in the local
`.env` file and exclude them from version control.

### 5. Prepare the Database

With MongoDB running:

```bash
# Create collection indexes.
node scripts/setup-database.js

# Check a known NVD sample.
node scripts/check-nvd.js

# Import the development dataset.
node scripts/import-vulnerabilities.js
```

The importer requests up to 1,500 non-rejected CVEs from a 90-day publication
window. It requires more than 1,000 usable records before importing and
upserts records by CVE ID.

MongoDB data is populated by these scripts and is not bundled with the
repository.

### 6. Start the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a regular server start:

```bash
npm start
```

Express serves the frontend and API. There is no separate frontend bundling step.

## Using the Application

1. Open **Vulnerabilities** from the navigation.
2. Choose **Public CVEs** or **My local records**.
3. Enter a CVE ID or keyword and select an optional severity.
4. Click **Apply Filters**. Use **Clear Filters** to reset the current collection.
5. Use **Previous** and **Next** above the table to browse results.
6. Click a CVE ID or local-record title to open its details.

### Create a Local Record

1. Click **Add Vulnerability**.
2. Enter the required title and description.
3. Add an optional CVE ID, severity, review status, and supporting notes.
4. Click **Save record** to open the saved record's details.

### Edit a Local Record

1. Open a record from **My local records**.
2. Click **Edit record** and wait for its existing values to load.
3. Update the fields and click **Save changes**.

### Delete a Local Record

1. Open a record from **My local records**.
2. Click **Delete record**.
3. Cancel to keep the record, or confirm permanent deletion.
4. After successful deletion, the application returns to **My local records**.

If a save cannot be confirmed, check My local records before submitting again.
If deletion cannot be confirmed, use **Try again** to reload the record.

Guest records are associated with the browser that created them. Another
browser has a separate workspace. Clearing the workspace cookie removes
access to that workspace. Guest workspaces do not provide account login
or cross-device access.

Imported public CVEs are read-only.

**Pending:** Homepage search integration and account access.

## API Endpoints

| Method | Endpoint                         | Function                                  |
| ------ | -------------------------------- | ----------------------------------------- |
| GET    | `/api/health`                    | HTTP server health check                  |
| GET    | `/api/vulnerabilities`           | Public CVE search and pagination          |
| GET    | `/api/vulnerabilities/:id`       | Public CVE details                        |
| POST   | `/api/vulnerabilities/local`     | Validated local-record creation           |
| GET    | `/api/vulnerabilities/local`     | Guest workspace search and pagination     |
| GET    | `/api/vulnerabilities/local/:id` | Guest-owned local record details          |
| PUT    | `/api/vulnerabilities/local/:id` | Validated guest-owned local record update |
| DELETE | `/api/vulnerabilities/local/:id` | Guest-owned local record deletion         |

List endpoints accept `page`, `q`, and `severity` and return up to 20 records
per page. Detail endpoints use the MongoDB `_id` returned by the list API.

POST and PUT accept JSON containing editable local-record fields:
`title`, `description`, `cveId`, `severity`, `triageStatus`,
`analystNotes`, `explanation`, and `protectiveGuidance`.
Title and description are required. PUT submits the complete editable
record; omitted optional fields reset to their defaults.

The server derives ownership from the guest workspace cookie.
Client-supplied ownership and other server-managed fields are rejected.

Successful creation returns `201`, updating returns `200`, and deletion
returns `204` with no response body. Invalid submissions return `400`.
Unavailable or unowned local records return `404`.

**Pending:** Products endpoints.

## Public Data Sources

- [NIST NVD CVE API](https://nvd.nist.gov/developers/vulnerabilities) — implemented.
- [NIST NVD CPE/Product API](https://nvd.nist.gov/developers/products) — planned for Products.

## Code Quality

**Current checkpoint:** ESLint passed without errors after the public CVE
detail-rendering correction on October 13, 2026. Changed files were
formatted with Prettier.

**Pending:** Final repository-wide formatting verification and unused-code
cleanup. Repeat lint and formatting checks after further implementation
and before submission.

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

**Pending:** Final whole-project lint/format verification and unused-code cleanup.

## Validation

Development checks have covered:

- NVD sample conversion and the development import.
- Public CVE search, severity filters, pagination, and details.
- Local-record form validation, creation, editing, and confirmed deletion.
- Guest ownership checks and separate-browser access.
- Public/local view switching and detail navigation.
- Review and correction of public CVE details to remove local editing controls.

**Pending:**

- W3C Nu HTML Checker validation and evidence.
- Final responsive and keyboard-access testing.
- Products CRUD checks and final regression checks across both collections.
- Deployment and final end-to-end testing.
- Final validation screenshots and logs.

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

**Pending:** Final accessibility review across all completed pages and forms.

## Peer Code Review

**Pending — the Project 2 code-review requirement has not been completed.**

The final update will include:

- Reviewed repository.
- Review or pull-request link.
- Summary of findings and contributions.
- Validation performed.

## Screenshot

### Homepage

**Pending — add a current screenshot of the running Homepage.**

### Vulnerabilities Workspace

**Pending — add screenshots of public CVEs, local records, and record details.**

### Products Workspace

**Pending — add a screenshot after Products integration.**

## Presentation and Demo Video

- **Google Slides Presentation:** Pending.
- **Short Public Narrated Demo Video:** Pending.
- **Published Demo Link:** Pending.
- **Submission Thumbnail:** Pending.
- **Google Form Submission:** Pending.

## Development Status

### Completed

- Scope, personas, user stories, use cases, and responsibility split.
- Design mockups and their shared index.
- Shared layout, navy theme, logo, and sticky navigation.
- Homepage banner and search interface.
- About, Resources, and FAQs pages.
- Node/Express setup, ES modules, and MongoDB connection.
- Vulnerability model, indexes, NVD conversion, and 1,500-record development import.
- Public search, severity filtering, pagination, and detail APIs.
- Guest identity, local validation, and local create/list/detail/update/delete APIs.
- Shared creation/editing form with required-field validation and save feedback.
- Local detail actions with confirmed deletion and failure recovery.
- Read-only public CVE details with local management controls excluded.
- Successful local ESLint check after the public-detail rendering correction.- Public/local browsing and detail views with sticky headings and top pagination.
- ESLint/Prettier configuration, dependency files, and MIT license.

### In Progress / Next

- Planned triage-status filtering.
- Products collection, data import, APIs, and full CRUD interface.
- Homepage search integration.
- Privacy Policy and Contact destinations.
- Final design-document, usability, accessibility, and code-quality review.
- Public deployment with both workflows and more than 1,000 records.
- Screenshots, presentation, narrated video, and code review.
- Google Form submission and working thumbnail/links.
- Code freeze 24 hours before class; deployment, video, and slides before class.

## Generative AI Disclosure

Generative AI has assisted portions of the Project 2.

### Tool and Model

- **Tool:** ChatGPT / Codex.
- **Provider:** OpenAI.
- **Model/version details:** Pending final documentation of the models used.

### How Generative AI Was Used

-

### Prompt Log and Supporting Evidence

**Pending — compile the Project 2 prompt history, model details, and any
required supporting screenshots.**

## License

This project is licensed under the **MIT License**.

See [`LICENSE`](./LICENSE) for details.
