const dotenv = require('dotenv');
const path = require('path');

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '.env.test') });

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

console.log('Jest setup: Loaded test environment configuration');
console.log(`Test database: ${process.env.PG_DATABASE}`);

// Increase timeout for database operations
jest.setTimeout(15000);

// Global teardown to ensure clean exit
afterAll(async () => {
  // Force close any remaining connections after a small delay
  await new Promise(resolve => setTimeout(resolve, 500));
});
