# Vector Database — Reflection

## Vector DB Use Case

Keyword search looks for exact or near-exact word matches. A query like
"termination clauses" only returns paragraphs containing those literal words.
But contracts don't work that way. The same concept might appear as "right to
terminate", "cancellation provisions", "expiry of agreement", or buried inside
a clause titled "Duration and Renewal" with no mention of termination at all.
Keyword search misses every one of those.

Vector databases approach the problem differently. When a lawyer types a plain
English question, it gets converted to an embedding — a point in
high-dimensional space that encodes the *meaning* of the query, not just the
words. Every chunk of the contract has already been embedded and stored. The
system retrieves the chunks whose embeddings sit closest to the query vector.
That proximity reflects semantic similarity. So "What are the termination
clauses?" would surface a passage like "either party may dissolve this
agreement with 30 days' written notice" even if the word "termination" never
appears anywhere in it.

The practical setup: split each contract into overlapping chunks of roughly
300–500 tokens, embed each chunk using a model like `all-MiniLM-L6-v2`, and
store the vectors in a database like Pinecone or pgvector. At query time, embed
the lawyer's question, run a nearest-neighbour search, retrieve the top chunks,
and pass them to an LLM to generate a plain-English answer with clause
references.

Keyword search is not entirely useless — it handles precise lookups well, like
finding a specific clause number or a party's name. But for conceptual
questions in plain English, it fails in exactly the situations where getting
the right answer matters most.
