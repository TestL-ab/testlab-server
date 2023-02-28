import pg from "pg";
import config from "../utils/config.js";
import transformData from "../utils/transformData.js";
import { Experiment, Variant } from "../models/experiment.js";

const pgClient = new pg.Pool({ database: config.PG_DATABASE });
pgClient.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

async function createExperiment(req, res) {
  const { name, type_id, start_date, end_date, is_running, user_percentage } = req.body;

  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "INSERT INTO experiments (type_id, name, start_date, end_date, is_running, user_percentage) VALUES ($1, $2, $3, $4, $5, $6)",
      [type_id, name, start_date, end_date, is_running, user_percentage]
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

async function deleteExperiment(req, res) {
  const id = req.params.id;

  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "DELETE FROM experiments WHERE (id = $1)",
      [id]
    );
    res.status(200).json(`Experiment with id ${id} successfully deleted.`)
  } catch (error) {
    res.status(400).json("Error in deleting the experiment in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function updateExperiment(req, res) {}

async function createVariants(req, res) {
  let id = req.params.id;
  const client = await pgClient.connect();
  try {
    let variantArr = req.body.variants;
    console.log("variant array: ", variantArr);

    for (let i = 0; i < variantArr.length; i++) {
      let variant = variantArr[i];
      if (variant.experiment_id != id) throw new Error("Experiment Id doesn't match.")
      await createVariant(variant);
    }
    const response = await client.query(
      "SELECT * from variants WHERE experiment_id = $1", [id]
    );

    let addVariants = response.rows
    let weightSum = addVariants.reduce( (t,v) => t+Number(v.weight), 0)

    if (weightSum != 1 ) throw new Error("Experiment weights don't add to 1")
    res.status(200).json({ variants: addVariants, text: "Made it" });
  } catch (error) {
    await client.query("DELETE FROM variants WHERE experiment_id = $1", [id])
    res.status(403).json("Error in creating the variants in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}
/*
{
  "variants": [
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

async function createVariant(obj) {
  console.log("We made it to line 98")
  console.log("var obj", obj)
  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "INSERT INTO variants (experiment_id, value, is_control, weight) VALUES ($1, $2, $3, $4)", [obj.experiment_id, obj.value, obj.is_control, obj.weight]
    );

    return;
  } catch (error) {
    throw new Error("Error creating Variant")
  } finally {
    client.release();
  }
}

function updateVariants() {}

export { createExperiment, updateExperiment, deleteExperiment, createVariants, updateVariants };
