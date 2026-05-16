const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'skillsync_user',
  password: process.env.DB_PASSWORD || 'skillsync_pass',
  database: process.env.DB_NAME || 'skillsync',
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
