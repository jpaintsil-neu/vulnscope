# User Guide

## Search from Home

Enter a CVE ID or vulnerability keyword and click Search or press Enter.
The Vulnerabilities page opens with the query applied to public CVEs.
A blank query opens the unfiltered public list.

Keywords can match product/vendor names mentioned in CVE content.
Product-catalog search remains pending.

## Browse and Filter

1. Choose Public CVEs or My local records.
2. Enter a CVE ID or keyword and optionally select severity.
3. For local records, optionally select New, In review, or Resolved.
4. Click Apply Filters.
5. Use Previous/Next above the table to browse pages of up to 20 records.
6. Open a CVE ID or local title for details.

Search, severity, and local review status are preserved in the URL on refresh.
Changing filters starts at page one. Clear Filters resets the filters within
the selected collection. Switching to public CVEs clears local review status.

A no-results message can mean that the current dataset contains no match.
The imported dataset is a recent sample, not the entire NVD.

## Read Details

Public details show available descriptions, CVSS information, UTC dates,
and references. External references open in a new tab.

Local details show review status, analyst notes, and creation/update dates.
Explanations and protective guidance appear when authored.
Public CVEs have no Edit/Delete controls.

## Create a Local Record

1. Click Add Vulnerability.
2. Enter a title and description.
3. Set severity/review status and optional supporting fields.
4. Click Save record to open the saved details.

An optional CVE ID identifies a referenced vulnerability; it does not
turn the local record into an imported record.

## Edit a Local Record

Open its details, click Edit record, and wait for existing values to load.
Change the desired fields and click Save changes. Unchanged supporting
fields are retained by the form's complete submission.

Unavailable records keep the edit form disabled. Use Cancel to return
without saving.

## Delete a Local Record

Open its details and click Delete record. Cancel keeps it; confirmation
permanently removes the local record and returns to My local records.

If deletion cannot be confirmed, Try again reloads the record before
management actions become available again.

## Validation and Retry

Title and description are required. Server validation can show field-specific
errors; the form retains input and focuses the first affected control.

If saving cannot be confirmed, check My local records before submitting again.
Use retry controls to reload failed results or record-loading requests.

## Workspace Access

Local records belong to the creating browser's guest workspace.
Another browser/incognito session has a separate workspace.
Clearing the workspace cookie removes access; it does not delete database records.

Account login and cross-device access remain pending.

[Back to project overview](../README.md)
