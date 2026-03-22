# RDBMS vs NoSQL — Database Comparison

## Overview

This document compares relational (RDBMS) and non-relational (NoSQL) databases in the context of a real-world system design decision.

---

## Key Concepts

**ACID (MySQL / PostgreSQL)**
Atomicity, Consistency, Isolation, Durability — every transaction is fully committed or fully rolled back. Guarantees correctness even under concurrent writes or system failures.

**BASE (MongoDB / Cassandra)**
Basically Available, Soft-state, Eventually consistent — the system prioritises availability and partition tolerance, accepting that replicas may briefly diverge before converging.

**CAP Theorem**
A distributed system can guarantee at most two of: Consistency, Availability, Partition Tolerance. RDBMS systems traditionally favour CP; many NoSQL systems favour AP.

---

## Database Recommendation

For a healthcare startup building a patient management system, I would recommend **MySQL (or PostgreSQL)** as the primary database.

Patient data — medical histories, prescriptions, diagnoses, lab results — is highly relational and demands strict correctness. A doctor writing a prescription and a nurse simultaneously updating allergy records must never produce an inconsistent state. MySQL's ACID guarantees ensure that partial writes are rolled back automatically, preventing silent data corruption that could endanger a patient's life. Healthcare systems in most jurisdictions (HIPAA in the US, DISHA in India) also impose strict audit and integrity requirements that map naturally onto RDBMS constraints, foreign keys, and transaction logs.

The CAP lens reinforces this choice. A patient management system must prioritise **Consistency over Availability** — it is far safer to show a "system temporarily unavailable" message than to show a doctor stale or split-brain data. MySQL in a synchronous-replication setup (CP) is the right trade-off here.

MongoDB's eventual consistency model would be a liability: if two nurses update the same patient record simultaneously on different replica nodes, the last-write-wins merge could silently discard a critical allergy entry.

**Would the answer change for a fraud detection module?**

Yes, partially. Fraud detection operates on high-velocity, heterogeneous event streams — login attempts, transaction patterns, device fingerprints — where schema rigidity becomes a bottleneck and write throughput matters more than strict consistency. For this module, MongoDB (or Apache Cassandra) is a better fit: its flexible document model accommodates evolving fraud signals without schema migrations, and its horizontal scalability handles millions of events per hour. Eventual consistency is acceptable here because a brief lag in flagging a fraudulent transaction is far less harmful than corrupting a patient record.

**Recommended hybrid architecture:** MySQL for the core patient management system (ACID, relational integrity), MongoDB as a secondary store for the fraud detection event log (high throughput, flexible schema)