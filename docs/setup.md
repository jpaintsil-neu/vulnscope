# Setup and Local Development

## Prerequisites

- Node.js 24 LTS and npm.
- A running MongoDB server or MongoDB Atlas connection.
- Internet access for dependency installation and NVD requests.

## Install

```bash
# Clone and install dependencies.
git clone https://github.com/jpaintsil-neu/vulnscope.git
cd vulnscope
npm ci

# Create local configuration.
cp .env.example .env
```

Edit `.env` before database preparation if using Atlas or a different port.
For local MongoDB:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=vulnscope
PORT=3000
```

Keep actual credentials in the ignored local `.env` file.
The database name defaults to `vulnscope` when not supplied.

## Prepare the Database

```bash
# Create collection indexes.
node scripts/setup-database.js

# Check a known CVE conversion.
node scripts/check-nvd.js

# Import the development dataset.
node scripts/import-vulnerabilities.js
```

The sample check and import are separate operations. A CVE used by the
sample check is not necessarily included in the recent import window.

## NVD Import

The importer requests up to 1,500 non-rejected CVEs from the preceding
90 days. It requires more than 1,000 usable records before writing.
A successful local development run imported 1,500 records.

Records are upserted by imported source and CVE ID. Existing source fields
are refreshed; creation dates and authored notes/guidance are preserved.

The import is manual, not scheduled. It is a development dataset rather
than the complete NVD. Data is not bundled in Git and must be populated
separately for a fresh environment or deployment.

## Run

```bash
# Development server with watching.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), or the configured port.

```bash
# Regular server start.
npm start
```

Express serves the browser files and API together.

## Troubleshooting

| Symptom                               | Check                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| `MONGODB_URI is not defined`          | Create `.env` in the repository root and set the URI                            |
| MongoDB connection fails              | Confirm the server is running and the URI/access settings are correct           |
| Public results are empty              | Check whether the import completed in the configured database                   |
| Import returns too few usable records | Review the error and requested publication window before retrying               |
| NVD request fails                     | Check connectivity and the returned error; allow time before retrying           |
| Port is occupied                      | Stop the conflicting server or change `PORT` in `.env`                          |
| Local record is unavailable           | Use the browser workspace that created it; check whether its cookie was cleared |
| A save/delete cannot be confirmed     | Recheck the record before repeating the operation                               |

**Pending:** Public hosting instructions, production database configuration,
and deployment verification.

[Back to project overview](../README.md)
