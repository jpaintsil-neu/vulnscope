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

Both lists return `records` and `pagination` containing `page`, `pageSize`,
`total`, and `totalPages`. Page size is 20. Filtered records and counts use
the same database filter.

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

**Pending:** Products API integration.

[Back to project overview](../README.md)
