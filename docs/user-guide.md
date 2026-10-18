# User Guide

## Search from Home

Choose Vulnerabilities or Products in the category selector, enter a query,
and click Search or press Enter. The same search field opens the selected
workspace with the query applied to its public catalog. A blank query opens
that catalog without a search filter.

Vulnerability search accepts a CVE ID or keywords, including product/vendor
names mentioned in CVE content. Product search matches vendor, product, or
version. Without JavaScript, the homepage form defaults to Vulnerabilities.

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

## Products

### Browse and Filter Products

1. Open Products and choose Public products or My local records.
2. Enter a vendor, product, or version and optionally select a product type.
3. For local records, optionally select Not reviewed, In review, or Reviewed.
4. Click Apply Filters.
5. Use Previous/Next above the table to browse pages of up to 20 records.
6. Open a product name for details.

Search, type, and local review status are preserved in the URL on refresh.
A product can appear many times because each version is a separate record.

### Read Product Details

Public product details show the vendor, version, type, last-modified date,
and original CPE name. Public products are read-only.

Local product details show review status, exposure notes, comments, and
creation/update dates.

### Create, Edit, and Delete a Local Product

1. Click Add Product, enter a product name and vendor, and set the optional
   fields. Click Save record to open the saved details.
2. To edit, open the record, click Edit record, change fields, and click
   Save changes.
3. To delete, open the record, click Delete record, and confirm. You return
   to My local records.

Product name and vendor are required. Version can be left blank when unknown.

## Workspace Access

Local records belong to the creating browser's guest workspace.
Another browser/incognito session has a separate workspace.
Clearing the workspace cookie removes access; it does not delete database records.

Account login and cross-device access remain pending.

[Back to project overview](../README.md)
