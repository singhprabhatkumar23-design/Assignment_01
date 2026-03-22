# Architecture Recommendation

## Architecture Recommendation

A Data Lakehouse — Delta Lake on S3, or Apache Iceberg with Databricks — is
the right choice here.

A warehouse (Redshift, BigQuery) handles structured data well, but GPS logs are
semi-structured, reviews are unstructured, and menu images can't go into a
relational schema at all. You'd need ETL to extract features from text and
images before ingestion — and a fast-growing startup probably doesn't know yet
which features matter. Schema-on-write is the wrong model when the data
strategy is still being figured out.

A pure data lake takes everything cheaply, but running SQL on raw GPS parquet
at scale means spinning up Spark every time an analyst wants last night's
delivery times by neighbourhood. Flexible, but too slow for daily BI.

A lakehouse gives you both. Raw files — images, JSON reviews, location logs,
payment CSVs — land in object storage unchanged. A transaction layer (Delta,
Iceberg, or Hudi) adds ACID guarantees and query-time schema enforcement, so
fast SQL and raw data access coexist without duplicating storage.

Three specific reasons this fits the startup:

First, the data is genuinely heterogeneous. No single paradigm handles
structured payments, high-frequency GPS, free-text reviews, and binary images
except a lakehouse.

Second, ML workloads — delivery ETA models, sentiment analysis, menu image
tagging — need raw data. Warehouse ETL strips out exactly the features those
models depend on.

Third, ops dashboards need fast SQL while data scientists need raw access. A
lakehouse serves both from the same storage tier, which matters on a startup
budget.
