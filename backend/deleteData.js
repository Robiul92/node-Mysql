require('dotenv').config();
const db = require('./db'); // Import the db object

async function deleteAllData() {
  try {
    await db.query('DELETE FROM order_items');
    await db.query('DELETE FROM orders');
    await db.query('DELETE FROM products');
    await db.query('DELETE FROM categories');
    await db.query('DELETE FROM customers');

    console.log('✅ All data deleted successfully.');
    process.exit();
  } catch (error) {
    console.error('❌ Error deleting data:', error);
    process.exit(1);
  }
}

deleteAllData();