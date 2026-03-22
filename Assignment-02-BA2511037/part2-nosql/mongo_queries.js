// =============================================================
//  mongo_queries.js
//  Product Catalog — MongoDB Operations
//  Database: ecommerce_db   Collection: products
// =============================================================

// Connect via mongosh before running:
//   mongosh "mongodb://localhost:27017/ecommerce_db"

// ─────────────────────────────────────────────────────────────
// OP1: insertMany() — insert all 3 documents from sample_documents.json
// ─────────────────────────────────────────────────────────────
db.products.insertMany([
  {
    _id: ObjectId("64a1f2c3e4b0a1234567890a"),
    product_id: "ELEC-001",
    category: "Electronics",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    price: 124999,
    currency: "INR",
    stock: 45,
    specs: {
      display: "6.8-inch Dynamic AMOLED 2X",
      processor: "Snapdragon 8 Gen 3",
      ram_gb: 12,
      storage_gb: 256,
      battery_mah: 5000,
      voltage: "5V / 45W Fast Charging",
      os: "Android 14"
    },
    warranty: {
      duration_months: 12,
      type: "Manufacturer Warranty",
      covers: ["manufacturing defects", "hardware failure"],
      excludes: ["physical damage", "water damage"]
    },
    certifications: ["BIS", "CE", "FCC"],
    images: [
      "https://cdn.example.com/elec-001-front.jpg",
      "https://cdn.example.com/elec-001-back.jpg"
    ],
    tags: ["smartphone", "5G", "flagship", "android"],
    ratings: { average: 4.6, count: 2341 },
    created_at: new Date("2024-01-15T10:30:00Z"),
    updated_at: new Date("2024-11-01T08:00:00Z")
  },
  {
    _id: ObjectId("64a1f2c3e4b0a1234567890b"),
    product_id: "CLTH-001",
    category: "Clothing",
    name: "Men's Slim Fit Chino Trousers",
    brand: "Allen Solly",
    price: 1799,
    currency: "INR",
    stock: 120,
    details: {
      material: "98% Cotton, 2% Elastane",
      fit: "Slim Fit",
      occasion: ["casual", "semi-formal"],
      care_instructions: ["machine wash cold", "do not bleach", "tumble dry low"],
      country_of_origin: "India"
    },
    variants: [
      { size: "30", color: "Navy Blue", sku: "AS-CHINO-30-NB", stock: 15 },
      { size: "32", color: "Navy Blue", sku: "AS-CHINO-32-NB", stock: 30 },
      { size: "32", color: "Khaki",     sku: "AS-CHINO-32-KH", stock: 25 },
      { size: "34", color: "Khaki",     sku: "AS-CHINO-34-KH", stock: 20 },
      { size: "34", color: "Olive",     sku: "AS-CHINO-34-OL", stock: 30 }
    ],
    gender: "Men",
    age_group: "Adult",
    tags: ["trousers", "chinos", "cotton", "slim-fit", "casual"],
    ratings: { average: 4.3, count: 892 },
    created_at: new Date("2024-03-10T09:00:00Z"),
    updated_at: new Date("2024-10-20T11:15:00Z")
  },
  {
    _id: ObjectId("64a1f2c3e4b0a1234567890c"),
    product_id: "GROC-001",
    category: "Groceries",
    name: "Britannia NutriChoice Digestive Biscuits",
    brand: "Britannia",
    price: 85,
    currency: "INR",
    stock: 300,
    packaging: {
      weight_grams: 400,
      type: "Sealed Plastic Pack",
      units_per_pack: 1
    },
    dates: {
      manufactured_at: new Date("2024-09-01T00:00:00Z"),
      expires_at: new Date("2025-03-01T00:00:00Z"),
      best_before_days: 180
    },
    nutritional_info: {
      serving_size_grams: 30,
      servings_per_pack: 13,
      per_serving: {
        calories_kcal: 130,
        total_fat_g: 4.5,
        saturated_fat_g: 2.0,
        trans_fat_g: 0,
        cholesterol_mg: 0,
        sodium_mg: 140,
        total_carbohydrates_g: 20,
        dietary_fiber_g: 2.5,
        sugars_g: 5,
        protein_g: 3
      }
    },
    allergens: ["wheat", "gluten", "milk", "soy"],
    dietary_flags: {
      vegetarian: true,
      vegan: false,
      gluten_free: false,
      organic: false
    },
    storage_instructions: "Store in a cool, dry place. Consume within 3 days of opening.",
    fssai_license: "10013022002253",
    tags: ["biscuits", "digestive", "snacks", "whole-wheat"],
    ratings: { average: 4.5, count: 5120 },
    created_at: new Date("2024-09-05T07:00:00Z"),
    updated_at: new Date("2024-09-05T07:00:00Z")
  }
]);

// ─────────────────────────────────────────────────────────────
// OP2: find() — retrieve all Electronics products with price > 20000
// ─────────────────────────────────────────────────────────────
//
// Filters on two fields simultaneously:
//   • category = "Electronics"  (equality match)
//   • price > 20000             ($gt comparison operator)
//
// The projection {_id:0, product_id:1, name:1, brand:1, price:1}
// returns only the fields relevant for a product-listing page,
// keeping the response payload lean.
// ─────────────────────────────────────────────────────────────
db.products.find(
  {
    category: "Electronics",
    price: { $gt: 20000 }
  },
  {
    _id: 0,
    product_id: 1,
    name: 1,
    brand: 1,
    price: 1,
    "ratings.average": 1
  }
);

// ─────────────────────────────────────────────────────────────
// OP3: find() — retrieve all Groceries expiring before 2025-01-01
// ─────────────────────────────────────────────────────────────
//
// "dates.expires_at" is a nested Date field inside the "dates"
// subdocument. MongoDB dot-notation lets us query nested fields
// directly without unwinding the document.
// $lt: new Date("2025-01-01") matches any expiry strictly before
// New Year 2025 — useful for flagging near-expiry stock.
// ─────────────────────────────────────────────────────────────
db.products.find(
  {
    category: "Groceries",
    "dates.expires_at": { $lt: new Date("2025-01-01") }
  },
  {
    _id: 0,
    product_id: 1,
    name: 1,
    brand: 1,
    "dates.expires_at": 1,
    "packaging.weight_grams": 1
  }
);

// ─────────────────────────────────────────────────────────────
// OP4: updateOne() — add a "discount_percent" field to a specific product
// ─────────────────────────────────────────────────────────────
//
// Targets ELEC-001 (the Samsung phone) by its unique product_id.
// $set adds or updates fields without touching the rest of the document —
// this is safer than $replaceOne when only a subset of fields must change.
// We also update "updated_at" to maintain an accurate audit trail.
// ─────────────────────────────────────────────────────────────
db.products.updateOne(
  { product_id: "ELEC-001" },
  {
    $set: {
      discount_percent: 10,
      updated_at: new Date()
    }
  }
);

// Verify the update
db.products.findOne(
  { product_id: "ELEC-001" },
  { _id: 0, product_id: 1, name: 1, price: 1, discount_percent: 1 }
);

// ─────────────────────────────────────────────────────────────
// OP5: createIndex() — create an index on the category field
// ─────────────────────────────────────────────────────────────
//
// WHY THIS INDEX?
//
// Almost every query in a product catalog filters by category
// (e.g., "show all Electronics", "show Groceries expiring soon").
// Without an index, MongoDB performs a full collection scan (COLLSCAN)
// on every such query — O(n) cost that grows linearly with catalogue size.
//
// With a single-field ascending index on "category", MongoDB uses
// an IXSCAN, narrowing the candidate documents instantly and reducing
// query time from O(n) to O(log n + k) where k = matching docs.
//
// In a multi-category store with thousands of SKUs this can cut
// read latency by orders of magnitude.
//
// We also add a compound index on (category, price) because OP2-style
// queries filter on BOTH fields; the compound index satisfies such
// queries with a single index traversal (covered query when projected
// fields are also in the index), avoiding a separate in-memory sort/filter.
// ─────────────────────────────────────────────────────────────

// Index 1 — single field: optimises pure category lookups
db.products.createIndex(
  { category: 1 },
  { name: "idx_category" }
);

// Index 2 — compound: optimises category + price range queries (e.g. OP2)
db.products.createIndex(
  { category: 1, price: -1 },
  { name: "idx_category_price_desc" }
);

// Index 3 — compound: optimises category + expiry queries (e.g. OP3)
db.products.createIndex(
  { category: 1, "dates.expires_at": 1 },
  { name: "idx_category_expiry" }
);

// Confirm all indexes on the collection
db.products.getIndexes();
