const { Pool } = require('pg');
require('dotenv').config();

function resolveSslConfig(connectionString) {
  if (process.env.DB_SSL === 'true') {
    return { rejectUnauthorized: false };
  }
  if (process.env.DB_SSL === 'false') {
    return false;
  }

  if (connectionString) {
    try {
      const parsed = new URL(connectionString);
      const isLocal =
        parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
      const hasSslParam = parsed.searchParams.get('sslmode') === 'require';
      const isExternalHost = !isLocal && parsed.hostname.includes('.');
      if (hasSslParam || isExternalHost) {
        return { rejectUnauthorized: false };
      }
    } catch {
      return { rejectUnauthorized: false };
    }
  }

  return false;
}

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: resolveSslConfig(process.env.DATABASE_URL),
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'books_db',
      ssl: resolveSslConfig(null),
    };

const pool = new Pool(poolConfig);

const initDatabase = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      published_year INTEGER,
      isbn VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(createTableQuery);
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initDatabase,
};

