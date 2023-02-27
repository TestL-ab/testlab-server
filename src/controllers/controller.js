import pg from "pg";
import config from "../utils/config.js";
import transformData from "../utils/transformData.js";
import { Experiment, Variant } from "../models/experiment.js";

// const baseUrl = "https://dog.ceo/api/breeds/list/all";

const pgClient = new pg.Pool({ database: config.PG_DATABASE });
pgClient.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

//

async function createExperiment(req, res) {
  const { name, type, startDate, endDate, running, percentage } = req.body;

  let newID;
  let allData;

  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "INSERT INTO experiments (type, name, start_date, end_date, is_running, user_percentage) VALUES ($1, $2, $3, $4, $5, $6)",
      [type, name, startDate, endDate, running, percentage]
    );
    // newID = await client.query("SELECT id FROM experiments WHERE name = $1", [
    //   name,
    // ]);
    // newID = newID.rows[0];
    allData = await client.query("SELECT * FROM experiments WHERE name = $1", [
      name,
    ]);
    allData = allData.rows[0];
    // console.log("newID of experiment", newID);
    console.log("all data in experiment", allData);
    res.status(200).json(`New experiment created`);
  } catch (error) {
    res.status(403).json("Error in creating the experiment in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }

  return new Experiment(
    allData,
    type,
    name,
    startDate,
    endDate,
    running,
    percentage
  );
}

// const uniquePath = generateUniquePath();
// const customPath = req.body.endpoint || uniquePath;
// console.log(customPath);

// const client = await pgClient.connect();
// try {
//   const response = await client.query(
//     "INSERT INTO endpoints (path, binId) VALUES ($1, 1)",
//     [customPath]
//   );
//   res.status(200).json(`Unique path: ${customPath} added`);
// } catch (err) {
//   res.status(403).json("Error in creating the endpoint on postgres");
//   console.log(err.stack);
// } finally {
//   client.release();
// }

// async function get_breed_list(req, res) {
//   try {
//     let data = await getBreedData(baseUrl);
//     let result = transformData(data);
//     res.status(200).send(result);
//   } catch (error) {
//     res.status(504).send(error);
//   }
// }

export { createExperiment };
