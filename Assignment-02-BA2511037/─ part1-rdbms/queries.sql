-- Q1: List all customers from Mumbai along with their total order value
SELECT 
    c.customer_id,
    c.customer_name,
    SUM(p.unit_price * o.quantity) AS total_order_value
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
JOIN products p ON o.product_id = p.product_id
WHERE c.city = 'Mumbai'
GROUP BY c.customer_id, c.customer_name;

#Q2: Find the top 3 products by total quantity sold
SELECT 
    p.product_id,
    p.product_name,
    SUM(o.quantity) AS total_quantity_sold
FROM products p
join orders o on o.product_id = p.product_id
GROUP BY p.product_id, p.product_name
ORDER BY total_quantity_sold DESC
LIMIT 3;

 # Q3: List all sales representatives and the number of unique customers they have handled
 SELECT 
    s.sales_rep_id,
    s.sales_rep_name,
    COUNT( o.customer_id) AS unique_customers_handled
    from sales_reps s 
    join orders o on s.sales_rep_id = o.sales_rep_id
    GROUP BY s.sales_rep_id, s.sales_rep_name;

    #  Q4: Find all orders where the total value exceeds 10,000, sorted by value descending
    SELECT
    o.order_id,
    c.customer_name,
    p.product_name,
    o.quantity,
    p.unit_price,
    (p.unit_price * o.quantity) AS total_value
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN products p ON o.product_id = p.product_id
WHERE (p.unit_price * o.quantity) > 10000
ORDER BY total_value DESC;

#Q5: Identify any products that have never been ordered
SELECT 
    p.product_id,
    p.product_name
    from products p
    LEFT JOIN orders o on p.product_id = o.product_id
    WHERE o.order_id IS NULL;  
