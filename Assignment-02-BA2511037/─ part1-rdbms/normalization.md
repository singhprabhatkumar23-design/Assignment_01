
# Normalization Analysis — orders_flat.csv

## Anomaly Analysis

The flat file `orders_flat.csv` stores customer, product, sales representative, and order
information in a single table. Because non-key attributes repeat across rows and depend on
different keys, all three classical data anomalies are present.

---

### Insert Anomaly

**Definition:** A record for a logically independent entity cannot be inserted unless an
order also exists.

**Example — Product P008 (Webcam):**

In the flat file, product data (`product_id`, `product_name`, `category`, `unit_price`)
is stored only inside order rows. There is no way to record a new product in the system
unless at least one order for that product exists.



### Update Anomaly

**Definition:** Updating a single real-world fact requires changing multiple rows; if even
one row is missed, the data becomes inconsistent.

**Example — Sales Rep SR01 (Deepak Joshi) office address:**

The `office_address` of a sales representative is a fact about that rep alone, not about
any specific order. In the flat file it is repeated in every row where SR01 is the assigned
rep. The address appears in two different forms across those rows:


---

### Delete Anomaly

**Definition:** Deleting an order row inadvertently destroys information about an unrelated
entity (a product, customer, or sales rep) that happened to appear only in that row.



If order **ORD1185** is deleted — for example because the customer cancelled it or it was
entered in error — the only record that Webcam (P008) exists in the product catalogue is
also permanently erased. There is no separate `products` table to preserve this information.
The same risk applies to any customer or sales rep whose last remaining order is deleted.

---

## How Normalization Eliminates These Anomalies

Decomposing the flat file into **customers**, **products**, **sales_reps**, and **orders**
tables (3NF) removes all three anomalies:

- **Insert:** A product, customer, or sales rep can be inserted into its own table
  independently, without needing a corresponding order.
- **Update:** `office_address` lives in exactly one row of `sales_reps`; one `UPDATE`
  statement propagates to every order automatically through the foreign key.
- **Delete:** Deleting an order row in `orders` leaves the related rows in `customers`,
  `products`, and `sales_reps` completely intact.



---

## Normalization Justification

The argument that a single flat table is "simpler" mistakes ease of setup for ease of
maintenance. In practice, the flat `orders_flat.csv` structure creates real, measurable
problems that normalization directly solves.

The update anomaly with SR01 is the clearest example. Deepak Joshi's office address
appears in 83 order rows, and it was not updated consistently — 15 rows say
`"Mumbai HQ, Nariman Pt, Mumbai - 400021"` while 68 say `"Mumbai HQ, Nariman Point,
Mumbai - 400021"`. These represent the same physical office. In a production system, a
report filtering by office address would now silently return incomplete results depending
on which version of the string it matched. This is not a theoretical risk; it is already
present in this dataset with fewer than 200 rows. At 200,000 rows the same partial update
would be nearly impossible to detect and correct. In the normalized schema, SR01's address
is stored in exactly one row in `sales_reps` — one `UPDATE` fixes it everywhere.

The delete anomaly with P008 (Webcam) illustrates a second category of real risk. The
Webcam appears in only one order, ORD1185. Cancelling that order in the flat table
permanently erases the product from the system. A normalized `products` table keeps the
product record independent of whether any orders exist for it.

The insert anomaly compounds this: a new product cannot even be catalogued until a
customer buys it. That is a business logic failure, not just a database design preference.

Normalization is not over-engineering here — it is the minimum structure needed to keep
data trustworthy as the business grows. The "simplicity" of one table is an illusion that
shifts complexity from the schema into every query, report, and data correction that
follows.