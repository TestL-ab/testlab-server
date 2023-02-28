import pg from "pg";
import config from "../utils/config.js";
import { Experiment, Variant } from "../models/experiment.js";

const pgClient = new pg.Pool({ database: config.PG_DATABASE });
pgClient.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

async function getUsers(req, res) {
  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "SELECT * FROM users"
    );
    let usersArr = response.rows

    console.log("List of Users passed back", usersArr);
    res.status(200).json(usersArr);
  } catch (error) {
    res.status(403).json("Error getting the users in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function createUser(req, res) {
  const { id, variant_id, ip_address } = req.body;

  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "INSERT INTO users (id, variant_id, ip_address) VALUES ($1, $2, $3)",
      [id, variant_id, ip_address]
    );

    let userData = await client.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );

    let newUser = userData.rows[0];
    console.log("New User passed back", newUser);
    res.status(200).json(newUser);
  } catch (error) {
    res.status(403).json("Error in creating the user in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

export { getUsers, createUser };