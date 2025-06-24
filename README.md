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

## Database Setup

To configure the PostgreSQL database for this project, follow these steps:

1. **Create the Database**  
   Run the following command in your terminal to create the `TestLab` database (this is a one-time step):  
   ```bash
   createdb TestLab
   ```

2. **Load the Schema**  
   Populate the database with the schema by running:  
   ```bash
   psql -d TestLab < schema.sql
   ```

## Prerequisites

- PostgreSQL installed and running on your system.
- Access to a terminal with `createdb` and `psql` commands available.

## Environment Setup

3. **Create Environment File**  
   Create a `.env` file in the project root directory with the following variables:  
   ```env
   PORT=3000
   PG_DATABASE=TestLab
   PG_HOST=localhost
   PG_USERNAME=your_postgres_username
   PG_PASSWORD=your_postgres_password
   ```
   Replace the PostgreSQL credentials with your actual database configuration.

4. **Install Dependencies**  
   Install the required Node.js packages:  
   ```bash
   npm install
   ```

## Building and Running the Project

### Development Mode
To run the server in development mode with automatic restart on file changes:
```bash
npm start
```
The server will start on the port specified in your `.env` file (default: 3000).

### Running Tests
To run the test suite with coverage reporting:
```bash
npm test
```
This will execute all Jest tests and generate a coverage report in the `coverage/` directory.

### Production Deployment
The project includes a Dockerfile for containerized deployment:
```bash
docker build -t testlab-server .
docker run -p 3000:3000 testlab-server
```

## API Endpoints

The server provides REST API endpoints for:
- **Features**: `/api/feature` - Manage feature flags and experiments
- **Users**: `/api/users` - User management  
- **Events**: `/api/events` - Event tracking
- **User Blocks**: `/api/userblocks` - User segmentation management

## Verification Steps

- [ ] Verify the database is set up by connecting to it: `psql -d TestLab`
- [ ] Confirm environment variables are configured in `.env`
- [ ] Run `npm install` to install dependencies
- [ ] Start the server with `npm start` and verify it runs without errors
- [ ] Run `npm test` to ensure all tests pass
- [ ] Access the API at `http://localhost:3000/api/feature` to verify the server is responding

## Troubleshooting

- **Database Connection Issues**: Ensure PostgreSQL is running and credentials in `.env` are correct
- **Port Conflicts**: Change the PORT value in `.env` if port 3000 is already in use
- **Missing Dependencies**: Run `npm install` if you encounter module not found errors

Let me know if you encounter any issues!
