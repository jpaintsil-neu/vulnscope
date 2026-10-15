# Validation Status

**Last updated:** October 15, 2026

## Scope and Responsibilities

The HTML and local code-quality results below describe the October 14
development checkpoint. The hosted deployment checks describe the October 15
Render and MongoDB Atlas checkpoint. These results cover John's completed
workflow; combined application validation after Products integration remains
pending. Record the deployed commit from Render with the final evidence.

John's recorded checks cover the Homepage, Vulnerabilities workspace,
shared layout, About, Resources, and FAQs. Products implementation and
validation belong to Sania; no Products completion is claimed here.

Results apply to the local development snapshot tested on October 14.
Synchronization with newer remote commits and validation of the combined
build remain pending confirmation. Record the tested commit when completing
the next checkpoint.

HTML validation checks markup structure. It does not establish that CRUD,
accessibility, security, or deployment requirements are fully satisfied.

## Local Code Quality Checks

The following commands completed successfully in John's local repository
on October 14:

| Check      | Command                | Recorded result                           |
| ---------- | ---------------------- | ----------------------------------------- |
| ESLint     | `npm run lint`         | Passed without reported errors            |
| Prettier   | `npm run format:check` | All matched files use Prettier code style |
| Whitespace | `git diff --check`     | No whitespace errors reported             |

**Pending:** Repeat these checks after further edits and integration.
The October 15 hosted workflow checks do not replace code-quality checks.

## HTML Source Validation

All seven files below passed W3C Nu HTML Checker file-upload validation on
October 14 with zero errors and zero warnings after the listed corrections.

| File                             | Errors | Warnings | Informational notices |
| -------------------------------- | ------ | -------- | --------------------- |
| `public/vulnerabilities.html`    | 0      | 0        | 11                    |
| `public/vulnerability.html`      | 0      | 0        | 9                     |
| `public/vulnerability-form.html` | 0      | 0        | 12                    |
| `public/index.html`              | 0      | 0        | 10                    |
| `public/about.html`              | 0      | 0        | 9                     |
| `public/resources.html`          | 0      | 0        | 9                     |
| `public/faqs.html`               | 0      | 0        | 8                     |

The informational notices concern trailing slashes on void elements such as
`meta`, `link`, and `input`. They are not errors or warnings and required no
changes for these results.

### Corrections Applied

- **Vulnerability details:** Replaced the empty `article#detail-content`
  rendering container with a `div`, retaining its ID and hidden state.
  JavaScript-generated panels continue to provide their own headings.
- **Vulnerability form:** Replaced the unheaded `section.workspace-panel`
  wrapper with a `div` and corrected its matching closing tag. Kept the
  form's accessible name and added form-panel spacing in
  `public/css/vulnerability-form.css`.
- **About:** Removed the redundant `role="list"` from the workflow's
  ordered list, retaining its class and accessible label.
- **Resources:** Removed the redundant `role="list"` from the learning
  pathway's ordered list, retaining its class and accessible label.

Each corrected source file was formatted and checked again successfully.

## Rendered HTML Validation

Rendered documents were copied after JavaScript populated the page and
submitted through the checker's Text Input mode. Browser extensions were
disabled for the successful captures. Result screenshots reported checker
version `vnu 26.10.12`.

| Captured view                 | Errors | Warnings |
| ----------------------------- | ------ | -------- |
| Public CVEs list              | 0      | 0        |
| My local records list         | 0      | 0        |
| Public CVE detail             | 0      | 0        |
| Local vulnerability detail    | 0      | 0        |
| Local vulnerability edit form | 0      | 0        |
| Add Vulnerability form        | 0      | 0        |

These checks include shared layout markup and the content present in each
captured view. They establish validity of those snapshots, not every
possible record, filter combination, or application state.

### Create-Form Validation Scope

The captured Add Vulnerability document contained the enabled form.
Its inline server-error elements were empty and hidden.

The submission handler uses `form.reportValidity()` for empty required
fields. Native browser validation messages are outside the copied HTML.
The passing capture therefore does not establish validation of visible
inline server-error markup.

### Browser Extension Interference

Initial rendered captures contained:

- A `suppresshydrationwarning` attribute on `html`.
- A `grammarly-desktop-integration` element outside `body`.

These strings were absent from the reviewed application page source and
shared layout. Fresh captures after disabling extensions and reloading
the application passed. No project-code correction was made for these
extension-related messages.

## Earlier Reported Functional Checks

John previously reported successful local checks covering:

- NVD sample conversion and the import of 1,500 CVE records.
- Public CVE search, severity filters, pagination, and detail navigation.
- Homepage search and transfer of the query to Vulnerabilities.
- Local record creation, listing, details, editing, and confirmed deletion.
- Field validation, review statuses, and analyst notes.
- Guest ownership and separate-browser workspace access.
- Read-only public records with local management actions excluded.
- Combined local filters, URL restoration, Clear Filters, and view switching.
- Vulnerabilities regression, responsive behavior, and keyboard navigation.

These are reported development checkpoints. The HTML checker did not
execute these workflows, and they have not been repeated against the
pending combined build in this validation checkpoint.

## Hosted Deployment Validation

On October 15, 2026, John reported successful checks against the publicly
hosted application after correcting its deployment configuration.

- **Application:** https://vulnscope-d4xk.onrender.com/
- **Vulnerabilities:** https://vulnscope-d4xk.onrender.com/vulnerabilities.html
- **Application hosting:** Render.
- **Database hosting:** MongoDB Atlas.
- **Imported NVD records:** 1,500.
- **Unfiltered pagination:** 75 pages, with up to 20 records per page.

| Check                                                         | Recorded result             |
| ------------------------------------------------------------- | --------------------------- |
| Atlas connection from the development machine                 | Passed                      |
| Atlas vulnerability collection initialization and import      | Passed                      |
| Application tested locally against Atlas                      | Passed                      |
| Hosted public CVE list and severity overview                  | Passed                      |
| Hosted search, severity filtering, and Previous/Next controls | Passed                      |
| Hosted public CVE detail navigation                           | Passed                      |
| Hosted guest-record creation and detail view                  | Passed                      |
| Hosted guest-record editing and persistence after refresh     | Passed                      |
| Hosted guest-record deletion                                  | Passed                      |
| Separate Incognito guest workspace                            | Test record was not visible |

The hosted screenshot showed 1,500 matching records, populated table rows,
the severity distribution, and page 1 of 75. The remaining hosted workflow
results were reported by John after manual browser checks.

The initial hosted data request failed. After the deployment configuration
was corrected, public records loaded successfully. The exact configuration
change was not recorded.

These checks establish the tested Vulnerabilities workflows. They do not
establish Products completion, a comprehensive security audit, or final
accessibility compliance. Cookie attributes have not been independently
recorded in the hosted evidence.

**Evidence pending:** Record the tested deployment's Source commit from
Render and add committed screenshots or logs for the hosted checkpoint.

## Credential Scan

On October 14, 2026, Gitleaks scanned 37 commits and approximately
352 KB of Git history after refreshing the remote references.

```bash
git fetch origin
gitleaks git . --log-opts="--all" --redact=100 --no-banner
```

**Result:** No leaks found.

The scan covered history reachable from the available Git references.
No credentials were detected by the scanner's configured rules.
Production configuration review remains pending.

## Remaining Verification

| Area                             | Remaining work                                                                                                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Repository synchronization       | Record the tested Render deployment commit and synchronize local work before the next commit.                                                                                                                                        |
| Code quality                     | Repeat lint, formatting, and whitespace checks after integration; finish unused-code review.                                                                                                                                         |
| Regression                       | Hosted Vulnerabilities checks passed on October 15. Repeat affected checks after further changes and Products integration.                                                                                                           |
| Accessibility and responsiveness | Complete final keyboard, focus, labels, announcements, contrast, and viewport checks. HTML validity alone is insufficient.                                                                                                           |
| Additional rendered states       | Visible server-side field errors, loading/empty/failure states, and separately captured rendered Home/About/Resources/FAQs views are not established by the recorded snapshots.                                                      |
| Products                         | Sania verifies her independent collection, APIs, forms, ownership, and CRUD. John does not implement Products without Prof. Gomez's authorization.                                                                                   |
| Combined application             | Verify both workspaces and all navigation after Products integration.                                                                                                                                                                |
| Security and configuration       | Environment-file checks and Git-history credential scan completed. Review production configuration and repeat scanning after further changes.                                                                                        |
| Deployment                       | Vulnerabilities is live with 1,500 imported records; hosted browsing, guest CRUD, persistence, and separate-browser isolation passed. Record HTTPS cookie attributes and verify the combined application after Products integration. |
| Evidence                         | Add final result screenshots/log links and verify submission links and thumbnail display.                                                                                                                                            |

## Repeating the Checks

Run the code-quality commands from the repository root:

```bash
npm run lint
npm run format:check
git diff --check
```

For source validation, upload the relevant HTML file to the
[W3C Nu HTML Checker](https://validator.w3.org/nu/).

For a rendered snapshot, disable browser extensions, reload the application,
and wait for the intended view to finish loading. Run this in Chrome's
DevTools Console:

```javascript
// Copy the rendered document.
copy("<!doctype html>\n" + document.documentElement.outerHTML);
```

Replace the checker's existing Text Input contents with the fresh copy
and run the check. Use temporary test records for local-workspace captures.

## Evidence Records

For each final check, record the date, tested commit, file or view, method,
result, and evidence location.

Use `git rev-parse HEAD` to identify the commit being tested. If checks
include uncommitted changes, note that explicitly and associate the results
with the resulting commit afterward.

Validation outputs were reviewed during the local checkpoint, but their
final committed evidence paths remain pending. The
[development screenshot gallery](dev.md) contains application examples;
those images do not replace validation reports or test logs.

[Back to project overview](../README.md)
