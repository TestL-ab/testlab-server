import "dotenv/config.js";

const PORT = process.env.PORT;
const PG_DATABASE = process.env.PG_DATABASE;

export default {
  PORT,
  PG_DATABASE,
};
