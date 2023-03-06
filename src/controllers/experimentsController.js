import pg from "pg";
import config from "../utils/config.js";
import { Experiment, Variant } from "../models/experiment.js";

const pgClient = new pg.Pool({ database: config.PG_DATABASE });
pgClient.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

async function getExperiments(req, res) {
  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "SELECT * FROM experiments"
    );
    let experimentsArr = response.rows.map(exp => {
      return new Experiment(exp);
    })
    // iterate over experimentArr to tun into new experiment objects
    for (let i = 0; i < experimentsArr.length; i++) {
      let variants = await getVariants(experimentsArr[i].id);
      if (variants === false) throw new Error("Error getting variants");
      // console.log("variants", variants)
      experimentsArr[i].variant_arr = variants.map(variant => {
        return new Variant(variant);
      });
    }

    // console.log("List of Experiments passed back", experimentsArr);
    res.status(200).json(experimentsArr);
  } catch (error) {
    res.status(403).json("Error getting the experiment in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function getExperimentByID(req, res) {
  const id = req.params.id;
  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "SELECT * FROM experiments WHERE id = $1", [id]
    );
    let newExperiment = new Experiment(response.rows[0])
    let variants = await getVariants(id)
    if (variants === false) throw new Error("Error getting variants");
    newExperiment.variant_arr = variants.map(variant => {
      return new Variant(variant);
    });
    res.status(200).json(newExperiment);
  } catch (error) {
    res.status(403).json("Error getting the experiment in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function getVariants(experiment_id) {
  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "SELECT * FROM variants WHERE experiment_id = $1", [experiment_id]
    )
    let variant_arr = response.rows
    // console.log(`Variants for experiment ${experiment_id}`, variant_arr)
    return variant_arr
  } catch (error) {

    console.log(error.stack);
    return(false);
  } finally {
    client.release();
  }
}


async function createExperiment(req, res) {
  let { name, type_id, start_date, end_date, is_running, user_percentage } = req.body;
  if (is_running === undefined) is_running = false;
  if (user_percentage === undefined) user_percentage = 1;

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
    // console.log("New experiment passed back", newExperiment);
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
    let variant_arr = req.body.variants;
    // console.log("variant array: ", variant_arr);

    for (let i = 0; i < variant_arr.length; i++) {
      let variant = variant_arr[i];
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

async function createVariant(obj) {
  if (obj.weight === undefined) obj.weight = 0.5
  if (obj.is_control === undefined) obj.is_control = false
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

export { getExperiments, getExperimentByID, createExperiment, updateExperiment, deleteExperiment, createVariants, updateVariants };