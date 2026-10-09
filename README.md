# VulnScope

**VulnScope: Understand, Track, and Act on Cybersecurity Vulnerabilities**

VulnScope is a full-stack web application designed to help everyday technology
users, cybersecurity students, and security professionals understand, assess,
and respond to publicly disclosed vulnerabilities.

The application uses public vulnerability and product data from the
[National Vulnerability Database (NVD)](https://nvd.nist.gov/) maintained by
the National Institute of Standards and Technology (NIST). VulnScope will
store more than 1,000 public records in MongoDB and provide two independently
functional full-stack workspaces.

## Project Purpose

Cybersecurity vulnerability information is often highly technical and
difficult for everyday users to interpret. VulnScope aims to make that
information more approachable while preserving the technical detail needed
by students and security professionals.

Users will be able to:

- Explore publicly disclosed vulnerabilities and technology products.
- Search and filter vulnerability and product records.
- Understand vulnerability severity and relevant cybersecurity terminology.
- Review practical protective guidance.
- Maintain locally managed vulnerability or product-review records.
- Create, read, update, and delete locally managed records without modifying
  authoritative NVD source data.

## User Personas

### Joe — Everyday Technology User

Joe wants to understand how security vulnerabilities may affect the software
or devices he uses and learn practical steps he can take to reduce risk.

### Ahmed — Cybersecurity Student

Ahmed is learning about cybersecurity and wants to explore real CVEs,
understand severity ratings, compare vulnerabilities, and learn how
vulnerabilities affect commonly used technologies.

### Fatima — Security Analyst

Fatima needs access to detailed vulnerability information, filtering,
triage statuses, product-review information, and analyst notes to support
vulnerability-management activities.

## User Stories

### Sania Anwar — Product & Technology Workspace

Sania will own the `products` MongoDB collection and its independent
full-stack CRUD workflow.

- As Joe, I want to search and browse product records so I can learn about
  software and devices that may have known security concerns.
- As Ahmed, I want to view product details such as vendor, product name,
  version, and review status so I can better understand how security
  vulnerabilities relate to commonly used technologies.
- As Fatima, I want to create, update, and delete locally managed product
  records and review notes so I can maintain an accurate product-security
  workspace.

### John Paintsil — Vulnerability Awareness & Triage

John will own the `vulnerabilities` MongoDB collection and its independent
full-stack CRUD workflow.

- As Joe, I want to search and browse vulnerability records with understandable
  explanations so I can determine whether a security issue may be relevant to
  technology I use.
- As Ahmed, I want to view CVE details, severity ratings, and protective
  guidance so I can understand how real-world vulnerabilities are assessed
  and what actions users can take to reduce risk.
- As Fatima, I want to create, update, and delete locally managed vulnerability
  records, triage statuses, and analyst notes so I can maintain an organized
  vulnerability-review workspace.

## Primary Use Cases

### Vulnerability Awareness & Triage

1. Browse and search imported CVE records.
2. Filter vulnerabilities by severity and triage status.
3. View technical CVE information and approachable explanations.
4. Review practical protective guidance.
5. Create a locally managed vulnerability record.
6. Update triage status and analyst notes.
7. Delete locally managed vulnerability records.

### Product & Technology Workspace

1. Browse and search imported product records.
2. Filter records by vendor, product, version, or review status.
3. View product-security information.
4. Create a locally managed product record.
5. Update product details, review status, and notes.
6. Delete locally managed product records.

The two feature areas will remain independently functional. Any future
relationship between product records and vulnerabilities will be treated as
an optional enhancement rather than a dependency.

## Technology Stack

- Node.js
- Express
- Vanilla ES6 JavaScript
- MongoDB
- MongoDB native Node.js driver
- HTML5
- CSS3

## Current Architecture

```text
vulnscope/
├── public/
│   ├── css/
│   ├── js/
│   └── index.html
├── scripts/
├── src/
│   ├── db/
│   │   └── connection.js
│   ├── routes/
│   └── server.js
├── .env.example
├── eslint.config.js
├── prettier.config.js
├── package.json
└── package-lock.json
```

## Local Development

Install dependencies:

## Public Data Sources

- [NIST NVD CVE API](https://nvd.nist.gov/developers/vulnerabilities)
- [NIST NVD CPE/Product API](https://nvd.nist.gov/developers/products)

## Team

- **John Paintsil** — Vulnerability Awareness & Triage
- **Sania Anwar** — Product & Technology Workspace

## Development Status

VulnScope is currently in the project setup and design phase.

Completed:

- Project concept and scope
- User personas, User stories, and Primary use cases
- Team responsibility split
- Shared GitHub repository
- Node.js project initialization
- ES module configuration
- Express server and health-check endpoint
- Initial browser-facing homepage
- Shared MongoDB connection module
- Environment-variable template
- ESLint configuration
- Prettier configuration
- Project tracking and submission-planning workspace

Next:

- IFinalize the design document and mockups
- Configure the MongoDB development environment
- Define the `vulnerabilities` and `products` data models
- Plan the NVD CVE and CPE import process
- Implement the independent CRUD APIs
- Build the vulnerability and product browser interfaces

## License

This project is licensed under the [MIT License](LICENSE).
