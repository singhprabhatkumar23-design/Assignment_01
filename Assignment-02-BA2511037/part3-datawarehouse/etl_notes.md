## ETL Decisions

### Decision 1 — Date Standardization
**Problem:** The raw `retail_transactions.csv` contained mixed date formats (e.g., '01/01/2024', '2024-Jan-01', and 'Jan 1st 2024'). This makes time-series analysis impossible.
**Resolution:** All date strings were parsed and converted into a standard ISO 8601 `YYYY-MM-DD` format before being loaded into `dim_date` and `fact_sales`.

### Decision 2 — Categorical Casing Consistency
**Problem:** Product categories were recorded inconsistently, such as 'electronics', 'Electronics', and 'ELECTRONICS'. SQL treats these as three separate categories in `GROUP BY` operations.
**Resolution:** I applied a Title Case transformation to the `category` field during the ETL process, ensuring all records were loaded as 'Electronics' for accurate aggregation.

### Decision 3 — Handling Missing Measures (NULLs)
**Problem:** Some transaction rows were missing `total_price` or `quantity` values (NULLs), which would lead to incorrect revenue calculations or runtime errors.
**Resolution:** Rows with missing critical measures were excluded from the load. For non-critical missing data (like a missing `brand`), a default value of 'N/A' was assigned to ensure referential integrity.
