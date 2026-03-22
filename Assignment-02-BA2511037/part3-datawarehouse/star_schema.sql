-- Create Dimension Tables
CREATE TABLE dim_date (
    date_key DATE PRIMARY KEY,
    day INT,
    month INT,
    quarter INT,
    year INT,
    day_name VARCHAR(10)
);

CREATE TABLE dim_store (
    store_id INT PRIMARY KEY,
    store_name VARCHAR(100),
    city VARCHAR(100),
    region VARCHAR(50)
);

CREATE TABLE dim_product (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(255),
    category VARCHAR(100),
    brand VARCHAR(100)
);

-- Create Fact Table
CREATE TABLE fact_sales (
    sales_id SERIAL PRIMARY KEY,
    date_key DATE REFERENCES dim_date(date_key),
    store_id INT REFERENCES dim_store(store_id),
    product_id INT REFERENCES dim_product(product_id),
    quantity INT NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) DEFAULT 0
);

-- Sample Cleaned Data Inserts (10 Fact Rows)
-- Note: Categories are standardized to Title Case, Dates to ISO format
INSERT INTO dim_date VALUES ('2024-01-01', 1, 1, 1, 2024, 'Monday'), ('2024-01-02', 2, 1, 1, 2024, 'Tuesday'), ('2024-02-01', 1, 2, 1, 2024, 'Thursday');
INSERT INTO dim_store VALUES (1, 'Main St Store', 'Mumbai', 'West'), (2, 'Tech Park Mall', 'Bangalore', 'South');
INSERT INTO dim_product VALUES (101, 'Laptop Pro', 'Electronics', 'Dell'), (102, 'Casual Shirt', 'Clothing', 'Zara');

INSERT INTO fact_sales (date_key, store_id, product_id, quantity, total_price, discount_amount) VALUES
('2024-01-01', 1, 101, 1, 50000.00, 2000.00),
('2024-01-01', 1, 102, 2, 3000.00, 0.00),
('2024-01-02', 2, 101, 1, 50000.00, 1000.00),
('2024-01-02', 2, 102, 5, 7500.00, 500.00),
('2024-02-01', 1, 101, 1, 50000.00, 0.00),
('2024-02-01', 1, 102, 1, 1500.00, 0.00),
('2024-02-01', 2, 101, 3, 150000.00, 10000.00),
('2024-01-15', 1, 101, 1, 50000.00, 0.00), -- Assume date added to dim_date
('2024-01-20', 2, 102, 4, 6000.00, 200.00),
('2024-02-15', 1, 102, 10, 15000.00, 1000.00);


