# API Reference

## Endpoints

| Method | Endpoint                         | Purpose                                                          |
| ------ | -------------------------------- | ---------------------------------------------------------------- |
| GET    | `/api/health`                    | HTTP server health check                                         |
| GET    | `/api/vulnerabilities`           | Public CVE search/pagination                                     |
| GET    | `/api/vulnerabilities/:id`       | Public CVE details                                               |
| POST   | `/api/vulnerabilities/local`     | Create a local record and establish/refresh its workspace cookie |
| GET    | `/api/vulnerabilities/local`     | Search the requesting workspace's local records                  |
| GET    | `/api/vulnerabilities/local/:id` | Read an owned local record                                       |
| PUT    | `/api/vulnerabilities/local/:id` | Update an owned local record                                     |
| DELETE | `/api/vulnerabilities/local/:id` | Delete an owned local record                                     |

Record IDs are MongoDB `_id` values: 24 hexadecimal characters.
The health endpoint checks the HTTP server, not database connectivity.

## List Parameters

| Parameter      | Accepted values                                                |
| -------------- | -------------------------------------------------------------- |
| `page`         | Integer 1–10000; default 1                                     |
| `q`            | Search text up to 200 characters; no null characters           |
| `severity`     | CRITICAL, HIGH, MEDIUM, LOW, NONE, UNKNOWN; blank includes all |
| `triageStatus` | Local list only: new, in-review, resolved; blank includes all  |

Complete CVE IDs use exact identifier matching in public searches.
Other search text is treated as a literal, case-insensitive phrase across
CVE ID, title, and description.

Both lists return `records`, `summary`, and `pagination`. Pagination contains
`page`, `pageSize`, `total`, and `totalPages`. Page size is 20.
Filtered records and counts use the same database filter.

## List Summary

The summary covers all records matching the applied filters across every
page. Its total equals `pagination.total`.

- Public CVEs use `groupBy: "severity"`.
- Local records use `groupBy: "triageStatus"` and the requesting owner's filter.
- Counts sum to `summary.total`; empty results return zero totals.

Example public summary with illustrative counts:

```json
{
  "groupBy": "severity",
  "total": 12,
  "counts": {
    "CRITICAL": 2,
    "HIGH": 4,
    "MEDIUM": 5,
    "LOW": 1,
    "NONE": 0,
    "UNKNOWN": 0
  }
}
```

Local count keys are `new`, `in-review`, `resolved`, and `UNKNOWN`.
Missing or unrecognized values are grouped as `UNKNOWN`.

The API retains all expected keys at zero. The public chart hides
zero-count severity rows; known local review statuses remain visible at
zero, and the local unknown row appears only when populated.

## Local Record Fields

POST and PUT require an application/json body.

| Field                | Validation/default                                               |
| -------------------- | ---------------------------------------------------------------- |
| `title`              | Required text, up to 200 characters                              |
| `description`        | Required text, up to 10000 characters                            |
| `cveId`              | Optional CVE identifier, up to 50 characters; blank becomes null |
| `severity`           | Supported severity; default UNKNOWN                              |
| `triageStatus`       | Supported review status; default new                             |
| `analystNotes`       | Optional text, up to 5000 characters                             |
| `explanation`        | Optional text, up to 5000 characters                             |
| `protectiveGuidance` | Optional text, up to 5000 characters                             |

Text is trimmed and null characters are rejected. CVE IDs and severity
are normalized to uppercase. Review statuses use the lowercase values above.

PUT submits a complete editable record: omitted optional fields reset to
their defaults. Include all fields whose values should be retained.

Server-managed fields such as `_id`, `source`, `ownerId`, timestamps, and
CVSS fields cannot be submitted for local creation/update.

## Example JSON Submission

```json
{
  "title": "Local vulnerability review",
  "description": "Review this issue and record the assessment.",
  "cveId": null,
  "severity": "HIGH",
  "triageStatus": "in-review",
  "analystNotes": "Assessment in progress.",
  "explanation": "",
  "protectiveGuidance": ""
}
```

## Response Statuses

| Status | Meaning                                       |
| ------ | --------------------------------------------- |
| 200    | Successful list, detail, or update            |
| 201    | Successful creation                           |
| 204    | Successful deletion; no response body         |
| 400    | Invalid ID, query, or submission              |
| 404    | Record absent or unavailable to the workspace |
| 415    | POST/PUT body was not submitted as JSON       |
| 500    | Internal operation failed                     |

Creation/detail/update responses contain `record`.
Field validation failures contain `error` and an `errors` object.
Returned fields vary by endpoint; internal owner IDs are omitted.
Do not attempt JSON parsing after a successful DELETE response.

A valid local list request without a workspace cookie returns an empty list.
Local detail/update/delete requests without ownership return 404.

## Cookie-Based Requests

Same-origin browser fetches carry the workspace cookie automatically.
API clients must retain the cookie returned by POST.

```bash
# Create a record and retain the workspace cookie.
curl -c /tmp/vulnscope-cookies -b /tmp/vulnscope-cookies \
  -H 'Content-Type: application/json' \
  -d '{"title":"API review","description":"Temporary API example."}' \
  http://localhost:3000/api/vulnerabilities/local

# Browse records using the same workspace.
curl -b /tmp/vulnscope-cookies \
  'http://localhost:3000/api/vulnerabilities/local?triageStatus=new'
```

## Products API

| Method | Endpoint                  | Purpose                                                          |
| ------ | ------------------------- | ---------------------------------------------------------------- |
| GET    | `/api/products`           | Public product search/pagination                                 |
| GET    | `/api/products/:id`       | Public product details                                           |
| POST   | `/api/products/local`     | Create a local record and establish/refresh its workspace cookie |
| GET    | `/api/products/local`     | Search the requesting workspace's local records                  |
| GET    | `/api/products/local/:id` | Read an owned local record                                       |
| PUT    | `/api/products/local/:id` | Update an owned local record                                     |
| DELETE | `/api/products/local/:id` | Delete an owned local record                                     |

### Product List Parameters

| Parameter      | Accepted values                                                         |
| -------------- | ----------------------------------------------------------------------- |
| `page`         | Integer 1–10000; default 1                                              |
| `q`            | Search text up to 200 characters; matches product name, vendor, version |
| `productType`  | application, operating-system, hardware; blank includes all             |
| `reviewStatus` | Local list only: not-reviewed, in-review, reviewed; blank includes all  |

Lists return `records` and `pagination` (`page`, `pageSize`, `total`,
`totalPages`). Page size is 20. Search text is matched literally and
case-insensitively. Sending `reviewStatus` to the public list returns 400.

### Local Product Fields

| Field           | Validation/default                                 |
| --------------- | -------------------------------------------------- |
| `productName`   | Required text, up to 200 characters                |
| `vendor`        | Required text, up to 200 characters                |
| `version`       | Optional text, up to 100 characters; blank is null |
| `productType`   | Supported product type; default application        |
| `reviewStatus`  | Supported review status; default not-reviewed      |
| `exposureNotes` | Optional text, up to 5000 characters               |
| `comments`      | Optional text, up to 5000 characters               |

Text is trimmed and null characters are rejected. Fields other than these
are rejected. PUT submits a complete record; omitted optional fields reset
to their defaults.

```json
{
  "productName": "Firefox",
  "vendor": "Mozilla",
  "version": "115.0",
  "productType": "application",
  "reviewStatus": "in-review",
  "exposureNotes": "Installed on team laptops.",
  "comments": ""
}
```

Status codes, cookie behavior, and ownership rules match the
vulnerability API above.

[Back to project overview](../README.md)
