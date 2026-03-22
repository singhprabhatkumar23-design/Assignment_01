-- Q1: Total sales revenue by product category for each month
SELECT 
    p.category, 
    d.month, 
    d.year, 
    SUM(f.total_price) as total_revenue
FROM fact_sales f
JOIN dim_product p ON f.product_id = p.product_id
JOIN dim_date d ON f.date_key = d.date_key
GROUP BY p.category, d.month, d.year
ORDER BY d.year, d.month;

-- Q2: Top 2 performing stores by total revenue
SELECT 
    s.store_name, 
    SUM(f.total_price) as total_revenue
FROM fact_sales f
JOIN dim_store s ON f.store_id = s.store_id
GROUP BY s.store_name
ORDER BY total_revenue DESC
LIMIT 2;

-- Q3: Month-over-month sales trend across all stores
SELECT 
    d.year, 
    d.month, 
    SUM(f.total_price) as monthly_revenue,
    LAG(SUM(f.total_price)) OVER (ORDER BY d.year, d.month) as previous_month_revenue
FROM fact_sales f
JOIN dim_date d ON f.date_key = d.date_key
GROUP BY d.year, d.month
ORDER BY d.year, d.month;