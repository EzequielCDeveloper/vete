// ─── MariaDB Connection Pool ──────────────────────────────────
const mysql = require('mysql2/promise');
const { DB } = require('./env');

const pool = mysql.createPool({
  ...DB,
  dateStrings: true,     // Return DATE columns as YYYY-MM-DD strings instead of Date objects
});

module.exports = pool;
