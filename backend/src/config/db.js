// ─── MariaDB Connection Pool ──────────────────────────────────
const mysql = require('mysql2/promise');
const { DB } = require('./env');

const pool = mysql.createPool(DB);

module.exports = pool;
