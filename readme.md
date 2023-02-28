[if resetting, drop the TestLab database first]:
  dropdb TestLab

Create database: 
createdb TestLab

To set up database:
psql -d TestLab < schema.sql
