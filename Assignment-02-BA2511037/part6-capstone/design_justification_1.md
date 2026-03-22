# Capstone Design Justification

## Storage Systems

Each of the four goals pulls the data in a different direction — which is
why the design ends up with five storage systems rather than one trying to do
everything poorly.

**G1 (readmission risk)** needs two. PostgreSQL holds the current patient
record: live admissions, medications, today's lab orders. The Data Lake
(S3 + Delta) holds historical depth — years of prior admissions, discharge
summaries, lab trends. Feast pre-computes features from lake data and serves
them to the XGBoost model at inference time. Postgres alone lacks history;
the lake alone is too slow for live lookups.

**G2 (plain-English queries)** requires Pinecone. A query like "has this
patient had a cardiac event?" won't match on keywords if the clinical note
says "STEMI, 2019." Embedding-based retrieval finds it. Notes are embedded
nightly via `all-MiniLM-L6-v2` and stored as vectors in Pinecone.

**G3 (management reports)** uses the data warehouse — Redshift or DuckDB.
dbt builds marts (fact_admissions, dim_dept, dim_date) from lake data, and
Metabase sits on top. Standard OLAP: columnar, pre-aggregated, fast on
department-level GROUP BYs.

**G4 (ICU vitals)** is the outlier. Fifty devices writing every second is a
time-series problem, not a relational one. TimescaleDB handles this natively
with built-in compression, retention policies, and time-bucketing. Postgres
would work at low volume. It would not survive a full ICU at scale.

---

## OLTP vs OLAP Boundary

The boundary sits at the Debezium CDC layer.

PostgreSQL is the OLTP system. Writes come from EHR workflows, pharmacy
systems, and nursing stations. Queries are narrow: one patient, one order, one
medication status. Short transactions, row-level locking, millisecond response
times. Everything about Postgres here is tuned for that workload.

Debezium streams every committed row change to the Data Lake. Downstream of
that, everything is append-only and analytical. Analysts and reporting tools
never touch Postgres directly — and they shouldn't. A twelve-month admission
aggregation across all departments would scan millions of rows and hit Postgres
like a truck during peak clinical hours. The CDC boundary keeps those two
workloads completely separate.

The data warehouse only ever sees data that has passed through dbt models —
cleaned, conformed, and documented. Raw Postgres tables don't appear in any
analyst-facing query.

---

## Trade-offs

Running five storage systems is genuinely complex. Each needs its own backup
strategy, schema evolution process, and on-call runbook. A team that hasn't
operated Kafka, TimescaleDB, and Pinecone together will feel it.

The mitigation is to not deploy all five on day one. TimescaleDB can run as a
Postgres extension — same operational footprint, time-series capabilities added.
DuckDB queries the lake directly without a Redshift cluster until query volume
forces the migration. Pinecone can wait until the RAG use case is validated
with a prototype. Start with Postgres and the lake, and let the pain of each
missing capability make the case for adding the next system. The full
architecture is where you end up — not where you start.

