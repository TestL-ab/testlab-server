import "dotenv/config";

const PORT = process.env.PORT;
const PG_DATABASE = process.env.PG_DATABASE;
const PG_HOST = process.env.PG_HOST;
const PG_PASSWORD = process.env.PG_PASSWORD;
const PG_USERNAME = process.env.PG_USERNAME;

export default {
  PORT,
  PG_DATABASE,
  PG_HOST,
  PG_PASSWORD,
  PG_USERNAME,
};
