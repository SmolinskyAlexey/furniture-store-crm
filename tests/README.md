# Regression tests

Run all isolated local regressions:

```bash
php tests/run-regressions.php <external-artifact-directory>
node --test tests/frontend.test.cjs
```

`ImageUploadSecurityRegression.php` verifies that uploads are checked by their
bytes, renamed with an allowlisted extension, and protected by the Apache
policy in `assets/.htaccess`.

The PHP runner also creates real Cyrillic PDFs and reads both XLSX and XLS
through the retained PHPExcel loader. Output and runtime caches go to the
explicit artifact directory, or the system temporary directory when omitted.
These tests do not write CRM business data. Keep regression sources local;
they are not public production endpoints.

The API smoke check is explicitly opt-in because it contacts a running CRM instance. It uses only read endpoints and never writes or clears server logs:

```bash
copy tests/api-smoke.example.json tests/api-smoke.json
php tests/ApiSmoke.php tests/api-smoke.json
```

`tests/api-smoke.json` contains credentials and must stay untracked.
