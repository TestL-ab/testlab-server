#!/usr/bin/env node

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.test') });

// Test database configuration
const TEST_DB_CONFIG = {
  host: process.env.PG_HOST || 'localhost',
  user: process.env.PG_USERNAME || 'postgres',
  password: process.env.PG_PASSWORD,
  port: 5432,
};

const TEST_DB_NAME = process.env.PG_DATABASE || 'TestLab_test';

async function setupTestDatabase() {
  const client = new pg.Client(TEST_DB_CONFIG);
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');

    // Drop test database if it exists
    await client.query(`DROP DATABASE IF EXISTS "${TEST_DB_NAME}"`);
    console.log(`Dropped database "${TEST_DB_NAME}" if it existed`);

    // Create test database
    await client.query(`CREATE DATABASE "${TEST_DB_NAME}"`);
    console.log(`Created test database "${TEST_DB_NAME}"`);

    await client.end();

    // Connect to the test database and run schema
    const testDbClient = new pg.Client({
      ...TEST_DB_CONFIG,
      database: TEST_DB_NAME
    });

    await testDbClient.connect();
    console.log(`Connected to test database "${TEST_DB_NAME}"`);

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    await testDbClient.query(schemaSql);
    console.log('Executed schema.sql on test database');

    await testDbClient.end();
    console.log('Test database setup complete!');

  } catch (error) {
    console.error('Error setting up test database:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Make sure PostgreSQL is running and accessible');
    } else if (error.code === '28P01') {
      console.error('Check your database credentials in .env.test');
    }
    process.exit(1);
  }
}

async function teardownTestDatabase() {
  const client = new pg.Client(TEST_DB_CONFIG);
  
  try {
    await client.connect();
    
    // Drop test database
    await client.query(`DROP DATABASE IF EXISTS "${TEST_DB_NAME}"`);
    console.log(`Dropped test database "${TEST_DB_NAME}"`);

    await client.end();
    console.log('Test database teardown complete!');

  } catch (error) {
    console.error('Error tearing down test database:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Make sure PostgreSQL is running and accessible');
    } else if (error.code === '28P01') {
      console.error('Check your database credentials in .env.test');
    }
    process.exit(1);
  }
}

// Handle command line arguments
const command = process.argv[2];

if (command === 'setup') {
  setupTestDatabase();
} else if (command === 'teardown') {
  teardownTestDatabase();
} else {
  console.log('Usage: node scripts/test-db.js [setup|teardown]');
  console.log('');
  console.log('Commands:');
  console.log('  setup    - Create and initialize test database');
  console.log('  teardown - Drop test database');
  process.exit(1);
}
