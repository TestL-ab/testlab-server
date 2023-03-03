import "dotenv/config.js";

const PORT = process.env.PORT;
const PG_DATABASE = process.env.PG_DATABASE;
const DB_HOST = process.env.DB_HOST;

export default {
  PORT,
  PG_DATABASE,
  DB_HOST,
};
