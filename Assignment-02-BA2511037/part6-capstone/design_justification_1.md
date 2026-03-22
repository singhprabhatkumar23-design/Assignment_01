# Capstone Design Justification

## Storage Systems

The design uses four storage systems, each chosen for a specific job.

**PostgreSQL** handles live transactional data — orders, cart sessions, customer
accounts. It's OLTP in the strictest sense: high write throughput, row-level
locking, ACID guarantees per transaction. The relational model (orders → line
items → products → customers) also lets the database enforce integrity
constraints that application-level validation misses.

**S3 + Delta Lake** is the raw landing zone. Everything arrives here first —
Parquet from batch ETL, JSON from event streams, images from the product
catalogue. Delta adds a transaction log on top of plain S3, giving ACID
semantics and time travel without a separate cluster. The rule: if the schema
isn't settled yet, or the data type isn't tabular, it goes to the lake.

**DuckDB / Redshift** serves the analytical workload. Once data is modelled
through dbt (fact_sales, dim_date, dim_store, dim_product), it lives here and
powers BI dashboards and analyst queries. DuckDB is the right choice for fast
SQL on Parquet without provisioning infrastructure; Redshift is the scale-out
path when query volume justifies the cost.

**Pinecone** stores embeddings for semantic search. Product descriptions,
reviews, and contract text are chunked, embedded with `all-MiniLM-L6-v2`, and
stored as 384-dimensional vectors. Keyword search would miss synonyms and
domain-specific phrasing. Vector retrieval doesn't.

---

## OLTP vs OLAP Boundary

The boundary sits at the Change Data Capture layer — Debezium streaming
Postgres binlog changes into the data lake.

Upstream is OLTP: short-lived transactions, primary-key lookups, millisecond
latency. Postgres is row-oriented, indexed on `order_id` and `customer_id`,
with connection pooling for the app tier. Analysts never query Postgres
directly — mixing read-heavy analytical scans with write-heavy transactional
traffic causes lock contention and degrades both workloads.

Downstream is OLAP: columnar storage, append-only writes, queries that scan
millions of rows. The warehouse sees only data that has passed through dbt
models. The CDC boundary is also where schema evolution is managed — a new
column in Postgres propagates as a schema change event, and the dbt model
updates independently. The two systems can evolve at different speeds.

---

## Trade-offs

The most significant trade-off is **data freshness vs. pipeline complexity**.
The path from Postgres to a BI dashboard has several hops: CDC → lake → dbt →
warehouse. Each adds latency. A metric might be 15–30 minutes stale, which is
fine for weekly revenue reports but not for "is this specific order still
pending?"

The mitigation is a two-tier query strategy. Dashboards read from the warehouse.
Anything needing current state — order tracking, live inventory, customer-facing
status — reads from Postgres via the REST API, bypassing the analytical pipeline
entirely. Redis sits in front for the hottest reads, cutting DB load without
sacrificing freshness.

The risk is that two sources now appear authoritative for the same entity within
the same 30-minute window. Documenting which system owns which metric, and
making sure both engineers and business users know the difference, is the most
important operational discipline this design requires.
