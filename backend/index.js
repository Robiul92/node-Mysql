require('dotenv').config();
const express = require('express');
const db = require('./db');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/orders', async (req, res) => {
    try {
        let { page = 1, limit = 10, product, category, customer_email, start_date, end_date } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        let query = `SELECT orders.id, customers.name AS customer_name, orders.order_date, orders.total_price 
                     FROM orders 
                     JOIN customers ON orders.customer_id = customers.id 
                     JOIN order_items ON orders.id = order_items.order_id
                     JOIN products ON order_items.product_id = products.id
                     JOIN categories ON products.category_id = categories.id
                     WHERE 1=1`;

        const params = [];

        if (product) {
            query += ` AND products.name LIKE ?`;
            params.push(`%${product}%`);
        }
        if (category) {
            query += ` AND categories.name LIKE ?`;
            params.push(`%${category}%`);
        }
        if (customer_email) {
            query += ` AND customers.email = ?`;
            params.push(customer_email);
        }
        if (start_date && end_date) {
            query += ` AND orders.order_date BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        }

        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        console.log('Generated Query:', query); // Debugging
        console.log('Query Parameters:', params); // Debugging

        const [orders] = await db.query(query, params);
        res.json({ data: orders, page, limit });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});