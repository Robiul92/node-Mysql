require('dotenv').config();
const db = require('./db'); // Import the db object
const { faker } = require('@faker-js/faker');

async function createTables() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                image TEXT
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                quantity INT NOT NULL,
                product_image TEXT,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS customers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(30),
                address TEXT
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT,
                order_date TIMESTAMP,
                total_price DECIMAL(10,2),
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                product_id INT,
                quantity INT NOT NULL,
                price DECIMAL(10,2),
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Tables created successfully.');
    } catch (error) {
        console.error('❌ Error creating tables:', error);
    }
}

async function insertData() {
    try {
        // Get existing category names
        const [existingCategories] = await db.query('SELECT name FROM categories');
        const existingCategoryNames = existingCategories.map(cat => cat.name);

        // Insert 10 Categories
        const categories = [];
        while (categories.length < 10) {
            const name = faker.commerce.department();
            if (!existingCategoryNames.includes(name) && !categories.some(cat => cat[0] === name)) {
                const image = faker.image.url();
                categories.push([name, image]);
            }
        }
        await db.query('INSERT INTO categories (name, image) VALUES ?', [categories]);

        // Get Category IDs
        const [categoryRows] = await db.query('SELECT id FROM categories');
        const categoryIds = categoryRows.map(cat => cat.id);

        // Insert 1000 Products
        const products = [];
        for (let i = 0; i < 1000; i++) {
            const categoryId = categoryIds[Math.floor(Math.random() * categoryIds.length)];
            const name = faker.commerce.productName();
            const description = faker.commerce.productDescription();
            const quantity = faker.number.int({ min: 1, max: 100 });
            const productImage = faker.image.url();
            products.push([categoryId, name, description, quantity, productImage]);
        }
        await db.query('INSERT INTO products (category_id, name, description, quantity, product_image) VALUES ?', [products]);

        // Insert 500 Customers
        const customers = [];
        for (let i = 0; i < 500; i++) {
            const name = faker.person.fullName();
            const email = faker.internet.email();
            const phone = faker.phone.number().slice(0, 20); // Truncate to 20 characters
            const address = faker.location.streetAddress();
            customers.push([name, email, phone, address]);
        }
        await db.query('INSERT INTO customers (name, email, phone, address) VALUES ?', [customers]);

        // Get Customers and Products
        const [customerRows] = await db.query('SELECT id FROM customers');
        const customerIds = customerRows.map(cust => cust.id);
        const [productRows] = await db.query('SELECT id FROM products');
        const productIds = productRows.map(prod => prod.id);

        // Insert 10,000 Orders with Random Dates
        const orders = [];
        const startDate = new Date(2023, 0, 1); // Start date (e.g., January 1, 2023)
        const endDate = new Date(); // End date (current date)
        for (let i = 0; i < 10000; i++) {
            const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
            const totalPrice = faker.finance.amount(10, 500, 2);
            const orderDate = faker.date.between({ from: startDate, to: endDate }).toISOString().slice(0, 19).replace('T', ' '); // Format as MySQL timestamp
            orders.push([customerId, orderDate, totalPrice]);
        }
        await db.query('INSERT INTO orders (customer_id, order_date, total_price) VALUES ?', [orders]);

        // Get Orders
        const [orderRows] = await db.query('SELECT id FROM orders');
        const orderIds = orderRows.map(order => order.id);

        // Insert Order Items (3 to 7 items per order)
        const orderItems = [];
        for (const orderId of orderIds) {
            const numItems = faker.number.int({ min: 3, max: 7 }); // Each order has 3 to 7 items
            const selectedProducts = faker.helpers.arrayElements(productIds, numItems); // Randomly select products
            for (const productId of selectedProducts) {
                const quantity = faker.number.int({ min: 1, max: 5 });
                const price = faker.finance.amount(5, 100, 2);
                orderItems.push([orderId, productId, quantity, price]);
            }
        }
        await db.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?', [orderItems]);

        console.log('✅ Data inserted successfully.');
        process.exit();
    } catch (error) {
        console.error('❌ Error inserting data:', error);
        process.exit(1);
    }
}

// Run scripts
async function main() {
    await createTables();
    await insertData();
}
main();