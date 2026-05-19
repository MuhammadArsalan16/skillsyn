const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'skillsync-db-20260518.postgres.database.azure.com',
  port: 5432,
  user: 'skillsync_user',
  password: 'skillsync_pass_123!',
  database: 'skillsync',
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    console.log("Connecting to PostgreSQL on Azure...");
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log("Running schema.sql...");
    await pool.query(sql);
    console.log("Schema initialized and seeded successfully!");
  } catch (err) {
    console.error("Database initialization failed:", err);
  } finally {
    await pool.end();
  }
}

run();
