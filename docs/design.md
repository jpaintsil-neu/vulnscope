# Design Overview

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

Products implementation remains pending integration into `main`.

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

These stories describe the intended complete application. Product workflows
and product-specific search remain pending integration.

## Mockups and Shared References

- [Desing Mockups](../docs/mockup.md)
- [Design Mockups — Index](https://docs.google.com/spreadsheets/d/1OPhlHSFipS1TBg5fY3gODJUL3W921hsAR03a6K-po7k/edit)

The index organizes exported mockups and includes the editable Figma link.
Keep editable designs and exported references in their existing shared locations.

## Design Decisions

- Navy theme, contrasting wordmark, light surfaces, and generous spacing.
- Shared logo, centered navigation, sticky header, and responsive mobile menu.
- Navigation: Home, Vulnerabilities, Products, Resources, About.
- Account control remains a placeholder.
- Search and record management use standard HTML controls.
- Public source records are read-only; guest-owned local records support CRUD.
- Table headings remain visible during scrolling, with pagination above the table.

See the [dev.md](/docs/dev.md).

[Back to project overview](../README.md)
