import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '.env.test') });

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

console.log('Vitest setup: Loaded test environment configuration');
console.log(`Test database: ${process.env.PG_DATABASE}`);
