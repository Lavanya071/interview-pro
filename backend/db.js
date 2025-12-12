// db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'interview_prep',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;

// Test connection
(async () => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('DB Connected! Test query result:', rows[0].result);
  } catch (err) {
    console.error('DB Connection Error:', err);
  }
})();
