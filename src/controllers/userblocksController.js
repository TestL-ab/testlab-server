import pg from "pg";
import config from "../utils/config.js";

const pgClient = new pg.Pool({ 
  database: config.PG_DATABASE,
  host: config.PG_HOST,
  user: config.PG_USERNAME,
  password: config.PG_PASSWORD
});

pgClient.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

async function getUserblockByName(req, res) {
  const name = req.params.name;
  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "SELECT * FROM userblocks WHERE name = $1", [name]
    );
    let block = response.rows[0]
    if (!block) throw new Error("No userblocks with that name")
    res.status(200).json(block);
  } catch (error) {
    res.status(403).json("Error in getting userblock in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function getUserblocks(req, res) {
  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "SELECT * FROM userblocks"
    );
    let blocks = response.rows
    res.status(200).json(blocks);
  } catch (error) {
    res.status(403).json("Error in getting userblocks in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function setUserBlock(req, res) {
  const {feature_id, name} = req.body
  const client = await pgClient.connect();
  try {
    let response = await client.query(
      "UPDATE userblocks SET feature_id = $1 WHERE name = $2", [feature_id, name]
    );
    response = await client.query(
      "SELECT * FROM userblocks WHERE name = $1", [name]
    )
    let block = response.rows[0]
    if (!block) throw new Error("No userblocks with that name")
    res.status(200).json(block);
  } catch (error) {
    res.status(403).json(`Error in updating userblock with name ${name} in postgres`);
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function resetUserBlock(req, res) {
  const client = await pgClient.connect();
  try {
    let response = await client.query(
      "UPDATE userblocks SET feature_id = null"
    );
    response = await client.query(
      "SELECT * FROM userblocks"
    )
    let blocks = response.rows
    res.status(200).json(blocks);
  } catch (error) {
    res.status(403).json(`Error in resetting userblocks in postgres`);
    console.log(error.stack);
  } finally {
    client.release();
  }
}

export { getUserblocks, setUserBlock, resetUserBlock, getUserblockByName };