require('dotenv').config();
const mysql = require('mysql2/promise');

// Create a connection pool (recommended for better performance)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0,
});


db.getConnection()
  .then((connection) => {
    console.log('Connected to MySQL database');
    connection.release(); // Release the connection back to the pool
  })
  .catch((err) => {
    console.error('Error connecting to MySQL:', err);
  });

// Export the pool for use in other files
module.exports = db;