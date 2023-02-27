import pg from "pg";
import config from "../utils/config.js";
import transformData from "../utils/transformData.js";
import { Experiment, Variant } from "../models/experiment.js";

const pgClient = new pg.Pool({ database: config.PG_DATABASE });
pgClient.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

//

async function createExperiment(req, res) {
  const { name, type_id, startDate, endDate, running, percentage } = req.body;

  // let allData;

  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "INSERT INTO experiments (type_id, name, start_date, end_date, is_running, user_percentage) VALUES ($1, $2, $3, $4, $5, $6)",
      [type_id, name, startDate, endDate, running, percentage]
    );

    let allData = await client.query(
      "SELECT * FROM experiments WHERE name = $1",
      [name]
    );

    allData = allData.rows[0];
    let newExperiment = new Experiment(allData);
    console.log("New experiment passed back", newExperiment);
    res.status(200).json(newExperiment);
  } catch (error) {
    res.status(403).json("Error in creating the experiment in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function updateExperiment(req, res) {}

async function createVariants(req, res) {
  try {
    let variantArr = req.body.variants;

    let addedVariants = [];
    for (let i = 0; i < variantArr.length; i++) {
      let variant = variantArr[i];
      let newVar = await createVariant(variant, req, res);
      addedVariants.push(newVar);
      // push to array
      // return new variant array
    }
    res.status(200).json({ variants: addedVariants, text: "Made it" });
  } catch (error) {
    res.status(403).json("Error in creating the variants in postgres");
    console.log(error.stack);
  } finally {
    //client.release();
  }
}
/*
{
  "varients": [
    {
      "experiment_id" : 16,
      "value": "blue",
      "is_control": true,
      "weight": 0.5
    },
    {
      "experiment_id" : 16,
      "value": "red",
      "is_control": false,
      "weight": 0.5
    }
  ]
}
*/

async function createVariant(ob, req, res) {
  const client = await pgClient.connect();
  try {
    return {};
    // const response = await client.query(
    //   "INSERT INTO experiments (type_id, name, start_date, end_date, is_running, user_percentage) VALUES ($1, $2, $3, $4, $5, $6)",
    //   [type_id, name, startDate, endDate, running, percentage]
    // );
    // allData = await client.query("SELECT * FROM experiments WHERE name = $1", [
    //   name,
    // ]);
    // allData = allData.rows[0];
    // let newExperiment = new Experiment(allData);
    // console.log("New experiment passed back", newExperiment);
    // res.status(200).json(newExperiment);
  } catch (error) {
    res.status(403).json("Error in updating the experiment in postgres");
    console.log(error.stack);
  } finally {
    //client.release();
  }
}

function updateVariants() {}

export { createExperiment, updateExperiment, createVariants, updateVariants };
