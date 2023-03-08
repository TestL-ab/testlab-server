import pg from "pg";
import config from "../utils/config.js";

const pgClient = new pg.Pool({ database: config.PG_DATABASE });
// const pgClient = new pg.Pool({
//   host: config.PG_HOST,
//   port: 5432,
//   user: config.PG_USERNAME,
//   password: config.PG_PASSWORD,
//   database: config.PG_DATABASE,
// });

pgClient.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

async function getUsers(req, res) {
  const client = await pgClient.connect();
  try {
    const response = await client.query("SELECT * FROM users");
    let usersArr = response.rows;

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

    let userData = await client.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);

    let newUser = userData.rows[0];

    res.status(200).json(newUser);
  } catch (error) {
    res.status(403).json("Error in creating the user in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function deleteUser(req, res) {
  const id = req.params.id;
  const client = await pgClient.connect();
  try {
    await client.query(
      "DELETE FROM users WHERE id =$1",
      [id]
    );

    res.status(200).json(`User with id ${id} was deleted`);
  } catch (error) {
    res.status(403).json("Error in deleting the user in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

export { getUsers, createUser, deleteUser };
