import pg from 'pg';
import config from '../src/utils/config.js';

let pool = null;

export function getTestDbPool() {
  if (!pool) {
    pool = new pg.Pool({
      host: config.PG_HOST,
      user: config.PG_USERNAME,
      password: config.PG_PASSWORD,
      database: config.PG_DATABASE,
      port: 5432,
      max: 5, // Limit concurrent connections
      idleTimeoutMillis: 1000, // Close idle connections quickly
      connectionTimeoutMillis: 5000, // Timeout for connection attempts
    });
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  return pool;
}

export async function clearTestDatabase() {
  const testPool = getTestDbPool();
  
  try {
    // Clear all data but keep schema (order matters for foreign key constraints)
    await testPool.query('DELETE FROM events');
    await testPool.query('DELETE FROM users');
    await testPool.query('DELETE FROM variants');
    await testPool.query('DELETE FROM features');
    await testPool.query('UPDATE userblocks SET feature_id = NULL');
    
    console.log('Test database cleared');
  } catch (error) {
    console.error('Error clearing test database:', error);
    throw error;
  }
}

export async function closeTestDbPool() {
  if (pool) {
    try {
      await pool.end();
      pool = null;
      console.log('Test database pool closed');
    } catch (error) {
      console.error('Error closing test database pool:', error);
      // Set to null anyway to prevent hanging
      pool = null;
    }
  }
}
