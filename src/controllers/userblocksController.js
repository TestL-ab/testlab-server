import pg from "pg";
import config from "../utils/config.js";

const pgClient = new pg.Pool({ database: config.PG_DATABASE });

pgClient.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

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
  console.log("name", name)
  console.log("featureID", feature_id)
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

export { getUserblocks, setUserBlock };