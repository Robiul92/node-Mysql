const express = require("express");
const db = require("./db"); // Import the db object
const app = express();
const port = 3000;
const cors = require('cors');

app.use(cors());


// Middleware to parse JSON bodies
app.use(express.json());

// API endpoint to list orders with filtering and pagination
app.get("/orders", async (req, res) => {
  const { customerEmail, categoryName, productName, startDate, endDate, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  let query = `
    SELECT 
      o.id, 
      c.email AS customerEmail, 
      cat.name AS categoryName, 
      p.name AS productName, 
      o.order_date, 
      o.total_price
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    JOIN categories cat ON p.category_id = cat.id
    WHERE 1=1
  `;

  if (customerEmail) query += ` AND c.email = '${customerEmail}'`;
  if (categoryName) query += ` AND cat.name = '${categoryName}'`;
  if (productName) query += ` AND p.name = '${productName}'`;
  if (startDate) query += ` AND o.order_date >= '${startDate}'`;
  if (endDate) query += ` AND o.order_date <= '${endDate}'`;

  query += ` LIMIT ${limit} OFFSET ${offset}`;

  try {
    const [orders] = await db.query(query);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
