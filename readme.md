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

## Next Steps

- [ ] Verify the database is set up by connecting to it: `psql -d TestLab`.
- [ ] Explore additional setup instructions (e.g., server configuration) as needed.

Let me know if you encounter any issues!
