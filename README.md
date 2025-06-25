# TestLab Server

Welcome to the TestLab Server project! This README provides instructions to set up the database and get started.

## Installing PostgreSQL

To use the `psql` and `createdb` commands, you'll need PostgreSQL installed. Follow these steps based on your operating system:

### On Ubuntu/Debian-based Linux
1. Update your package list:
   ```bash
   sudo apt update
   ```
2. Install PostgreSQL (this includes `psql` and `createdb`):
   ```bash
   sudo apt install postgresql postgresql-contrib
   ```
3. Verify the installation:
   ```bash
   psql --version
   ```
   You should see output like `psql (PostgreSQL) 16.4` (version may vary).

### On Other Systems
- **Fedora**: `sudo dnf install postgresql-server postgresql-contrib`
- **macOS**: Use Homebrew with `brew install postgresql`
- **Windows**: Download and install from the [official PostgreSQL site](https://www.postgresql.org/download/windows/).

After installation, ensure the PostgreSQL service is running (e.g., `sudo service postgresql start` on Ubuntu).

## PostgreSQL User Setup

After installing PostgreSQL, you need to set up a user and configure authentication:

### Option 1: Use Default 'postgres' User (Recommended for Development)

1. **Switch to postgres user and set password:**
   ```bash
   sudo -u postgres psql
   ```
   
2. **Set a password for the postgres user:**
   ```sql
   ALTER USER postgres PASSWORD 'your_secure_password';
   \q
   ```
   Replace `your_secure_password` with a strong password of your choice.

3. **Test the connection:**
   ```bash
   psql -U postgres -h localhost -d postgres
   ```
   Enter your password when prompted.

### Option 2: Create a New Database User

1. **Switch to postgres user:**
   ```bash
   sudo -u postgres psql
   ```

2. **Create a new user with database creation privileges:**
   ```sql
   CREATE USER your_username WITH PASSWORD 'your_password';
   ALTER USER your_username CREATEDB;
   \q
   ```

3. **Test the connection:**
   ```bash
   psql -U your_username -h localhost -d postgres
   ```

### Configure Authentication (if needed)

If you encounter authentication errors, you may need to modify PostgreSQL's authentication settings:

1. **Find the pg_hba.conf file:**
   ```bash
   sudo find /etc -name "pg_hba.conf" 2>/dev/null
   ```

2. **Edit the file (usually located at `/etc/postgresql/[version]/main/pg_hba.conf`):**
   ```bash
   sudo nano /etc/postgresql/16/main/pg_hba.conf
   ```

3. **Ensure these lines exist (modify if different):**
   ```
   # "local" is for Unix domain socket connections only
   local   all             all                                     md5
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            md5
   # IPv6 local connections:
   host    all             all             ::1/128                 md5
   ```

4. **Restart PostgreSQL:**
   ```bash
   sudo service postgresql restart
   ```

## Environment Configuration

Before setting up the database, you need to configure your environment variables:

1. **Create Environment File**  
   Copy the example environment file to create your local configuration:
   ```bash
   cp .env.example .env
   ```

2. **Create Test Environment File (for testing)**  
   Copy the test example environment file:
   ```bash
   cp .env.test.example .env.test
   ```

3. **Configure Your Environment Variables**  
   Edit both the `.env` and `.env.test` files with your specific database credentials and settings:
   ```bash
   # Database Configuration
   PG_DATABASE=TestLab
   PG_HOST=localhost
   PG_USERNAME=your_postgres_username
   PG_PASSWORD=your_postgres_password

   # Server Configuration
   PORT=3000
   ```
   
   **Important:** Replace the placeholders with the credentials you set up in the PostgreSQL User Setup section:
   - If you used **Option 1** (default postgres user): Use `PG_USERNAME=postgres` and `PG_PASSWORD=your_secure_password`
   - If you used **Option 2** (custom user): Use your custom username and password

## Database Setup

After configuring PostgreSQL and your environment variables, create and populate the database:

1. **Create the Database**  
   Run the following command using your PostgreSQL credentials:
   ```bash
   createdb -U your_postgres_username -h localhost TestLab
   ```
   Replace `your_postgres_username` with your actual username and enter your password when prompted.

2. **Load the Schema**  
   Populate the database with the schema:
   ```bash
   psql -U your_postgres_username -h localhost -d TestLab < schema.sql
   ```
   Again, replace `your_postgres_username` with your actual username and enter your password when prompted.

3. **Verify Database Setup**  
   Connect to the database to verify it was created successfully:
   ```bash
   psql -U your_postgres_username -h localhost -d TestLab
   ```
   
   Once connected, you can list the tables:
   ```sql
   \dt
   ```
   
   Exit with:
   ```sql
   \q
   ```

## Prerequisites

- PostgreSQL installed and running on your system
- Node.js and npm installed
- Access to a terminal with `createdb` and `psql` commands available

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**  
   Follow the "Environment Configuration" section above to create and configure your `.env` and `.env.test` files.

3. **Set Up Database**  
   Follow the "Database Setup" section above to create and populate your main database.

4. **Run the Application**
   ```bash
   npm start
   ```

## Testing

This project includes a comprehensive test suite with automated test database management:

### Test Environment Setup

The test environment uses a separate database (`TestLab_test`) to ensure tests don't interfere with your development data:

1. **Environment Configuration**: Tests automatically use `.env.test` for configuration
2. **Database Isolation**: Each test run uses a fresh test database
3. **Automated Cleanup**: Test data is automatically cleaned up after each test

### Running Tests

- **Run All Tests** (includes setup and coverage):
  ```bash
  npm test
  ```

- **Run Unit Tests Only** (excludes integration tests):
  ```bash
  npm run test:unit
  ```

### Test Database Management

The project includes automated scripts for test database lifecycle management:

- **Set up test database** (creates database and loads schema):
  ```bash
  npm run test:db:setup
  ```

- **Tear down test database** (removes test database):
  ```bash
  npm run test:db:teardown
  ```

**Note**: The main `npm test` command automatically sets up the test database before running tests, so you typically don't need to run these commands manually.

### Test Structure

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test API endpoints with real database interactions
- **Test Database**: Automatically created/destroyed for each test run
- **Coverage Reports**: Generated in the `coverage/` directory after running tests

### Test Files

- `src/controllers/featuresController.test.js` - Unit tests for features controller
- `src/controllers/postgres.test.js` - Database connection tests
- `src/routes/router.test.js` - Integration tests for API routes
- `test/db-helper.js` - Test database utilities
- `scripts/test-db.js` - Test database setup/teardown automation

## API Endpoints

The server provides REST API endpoints for:
- **Features**: `/api/feature` - Manage feature flags and experiments
- **Users**: `/api/users` - User management  
- **Events**: `/api/events` - Event tracking
- **User Blocks**: `/api/userblocks` - User segmentation management

## Security Notes

- **Environment Files**: Never commit `.env` or `.env.test` files to version control
- **Example Files**: Use `.env.example` and `.env.test.example` as templates
- **Database Credentials**: Use strong passwords and limit database user privileges
- **Test Isolation**: Tests run against a separate database to prevent data corruption

## Next Steps

- [ ] Verify the database is set up by connecting to it: `psql -d TestLab`
- [ ] Run the test suite to ensure everything is working: `npm test`
- [ ] Explore the API endpoints and test the application
- [ ] Check test coverage reports in the `coverage/` directory after running tests

## Troubleshooting

### Common Issues

1. **Database Connection Errors**: Verify PostgreSQL is running and credentials in `.env` are correct
2. **Test Database Issues**: Ensure PostgreSQL user has database creation privileges
3. **Authentication Failures**: Check pg_hba.conf configuration (see PostgreSQL User Setup section)
4. **Port Conflicts**: Ensure ports 3000 (app) and 3001 (test) are available

### Getting Help

If you encounter any issues:
1. Check the logs for specific error messages
2. Verify your environment configuration matches the examples
3. Ensure PostgreSQL is running and accessible
4. Try running the test database setup manually: `npm run test:db:setup`

Let me know if you encounter any issues!
