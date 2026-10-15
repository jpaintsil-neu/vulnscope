# Validation Status

**Last updated:** October 14, 2026

## Scope and Responsibilities

This document records completed local checks, HTML corrections, and
remaining verification work.

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
on October 14, before the pending remote-update integration:

| Check      | Command                | Recorded result                           |
| ---------- | ---------------------- | ----------------------------------------- |
| ESLint     | `npm run lint`         | Passed without reported errors            |
| Prettier   | `npm run format:check` | All matched files use Prettier code style |
| Whitespace | `git diff --check`     | No whitespace errors reported             |

**Pending:** Repeat these checks after integrating remote changes and after
any further edits. Commit/rebase/push completion has not yet been confirmed
for this validation checkpoint.

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

## Remaining Verification

| Area                             | Remaining work                                                                                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository synchronization       | Integrate newer remote commits, resolve any conflicts, and record the tested commit.                                                                                            |
| Code quality                     | Repeat lint, formatting, and whitespace checks after integration; finish unused-code review.                                                                                    |
| Regression                       | Recheck affected workflows after integration and the HTML/CSS corrections.                                                                                                      |
| Accessibility and responsiveness | Complete final keyboard, focus, labels, announcements, contrast, and viewport checks. HTML validity alone is insufficient.                                                      |
| Additional rendered states       | Visible server-side field errors, loading/empty/failure states, and separately captured rendered Home/About/Resources/FAQs views are not established by the recorded snapshots. |
| Products                         | Sania verifies her independent collection, APIs, forms, ownership, and CRUD. John does not implement Products without Prof. Gomez's authorization.                              |
| Combined application             | Verify both workspaces and all navigation after Products integration.                                                                                                           |
| Security and configuration       | Complete credentials/history and production-configuration review.                                                                                                               |
| Deployment                       | Verify public access, HTTPS workspace cookies, MongoDB connectivity, production CRUD, and more than 1,000 deployed records.                                                     |
| Evidence                         | Add final result screenshots/log links and verify submission links and thumbnail display.                                                                                       |

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
