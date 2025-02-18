const express = require("express");
const db = require("./db"); // Import the db object
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// API endpoint to list orders with filtering and pagination
app.get("/orders", async (req, res) => {
  try {
    const { productName, categoryName, customerEmail, startDate, endDate } =
      req.query;

    // Calculate offset
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Base query for data
    let query = `
            SELECT o.id, o.order_date, o.total_price, c.name AS customer_name, c.email AS customer_email
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            JOIN categories cat ON p.category_id = cat.id
            
        `;

    // Base query for total count
    let countQuery = `
            SELECT COUNT(*) AS total
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            JOIN categories cat ON p.category_id = cat.id
        `;

    const conditions = [];
    const values = [];

    if (productName) {
      conditions.push("p.name LIKE ?");
      values.push(`%${productName}%`);
    }

    if (categoryName) {
      conditions.push("cat.name LIKE ?");
      values.push(`%${categoryName}%`);
    }

    if (customerEmail) {
      conditions.push("c.email = ?");
      values.push(customerEmail);
    }

    if (startDate && endDate) {
      conditions.push("o.order_date BETWEEN ? AND ?");
      values.push(startDate, endDate);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
      countQuery += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Add LIMIT and OFFSET for pagination
    query += ` ORDER BY o.order_date ASC, o.id ASC LIMIT ? OFFSET ?`;
    values.push(parseInt(limit, 10), offset);

    // Execute the queries
    const [rows] = await db.query(query, values);
    const [totalRows] = await db.query(countQuery, values.slice(0, -2)); // Exclude limit and offset for count query
    const total = totalRows[0].total;
    const totalPages = Math.ceil(total / limit);

    // Prepare the response
    const response = {
      data: rows,
      metadata: {
        currentPage: parseInt(page, 10),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit, 10),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
