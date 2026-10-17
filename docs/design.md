# Design Overview

- **Updated:** October 16, 2026.

- [Full design document](https://docs.google.com/document/d/1_EBsK1iSNJMkEcqX7na_RYYyHbUdZPt71yt7oZE1Pjw/edit)
- [Live application](https://vulnscope-d4xk.onrender.com/)

## Project Description

VulnScope helps people explore public cybersecurity vulnerabilities and
maintain local security-review records. The main assignment pages are Home,
Vulnerabilities, and Products.

Vulnerabilities and Products are intended as independent CRUD workspaces.
About, Resources, and FAQs add context and portfolio value.

## Responsibilities

| Contributor   | Main responsibility                        |
| ------------- | ------------------------------------------ |
| John Paintsil | Vulnerability Awareness & Triage workspace |
| Sania Anwar   | Product & Technology workspace             |

John also created the initial mockups and index, shared layout, supporting
pages, repository documentation, and deployment/validation notes. Sania owns
Products code and its completion/validation notes.

The Vulnerabilities workflow is live on Render with 1,500 imported CVEs in
MongoDB Atlas. Products is implemented with its own products collection, API routes, search/filtering, detail views, and CRUD. It has been tested locally with 6,344 imported NVD CPE records and is live on Render.

## User Personas

| Persona                        | Need                                                                       |
| ------------------------------ | -------------------------------------------------------------------------- |
| Joe — Everyday Technology User | Understand risks affecting software/devices and practical protective steps |
| Ahmed — Cybersecurity Student  | Explore CVEs, severity assessments, and technology relationships           |
| Fatima — Security Analyst      | Search records, manage review status, and maintain analyst notes           |

## User Stories

- As Joe, I want to search vulnerabilities so I can identify issues relevant to technology I use.
- As Ahmed, I want to inspect CVE details and guidance so I can understand assessment and response.
- As Fatima, I want to create, edit, and delete local vulnerability records so I can organize my reviews.
- As Joe, I want to browse products so I can learn about software and devices with security concerns.
- As Ahmed, I want vendor, product, and version details so I can understand technology-related risks.
- As Fatima, I want to manage local product records and notes so I can maintain a product-security workspace.

Product stories are supported by the Products workspace and the homepage product search.

## Mockups and Shared References

- [Design Mockups](mockup.md)
- [Design Mockups — Index](https://docs.google.com/spreadsheets/d/1OPhlHSFipS1TBg5fY3gODJUL3W921hsAR03a6K-po7k/edit)

The index organizes exported mockups and includes the editable Figma link.
Keep editable designs and exported references in their existing shared locations.

## Design Decisions

- Navy theme, contrasting wordmark, light surfaces, and generous spacing.
- Shared logo, centered navigation, sticky header, and responsive mobile menu.
- Navigation: Home, Vulnerabilities, Products, Resources, About.
- Local records use anonymous guest workspaces.
- Search and record management use standard HTML controls.
- Public source records are read-only; guest-owned local records support CRUD.
- Table headings remain visible during scrolling, with pagination above the table.

See [development screenshots](dev.md) and [validation status](validation.md).

[Back to project overview](../README.md)
