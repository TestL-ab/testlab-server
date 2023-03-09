import pg from "pg";
import config from "../utils/config.js";
import { Feature, Variant } from "../models/feature.js";

const pgClient = new pg.Pool({ database: config.PG_DATABASE });
pgClient.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

async function getFeatures(req, res) {
  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "SELECT * FROM features"
    );
    let featuresArr = response.rows.map(exp => {
      return new Feature(exp);
    })
    for (let i = 0; i < featuresArr.length; i++) {
      let variants = await getVariants(featuresArr[i].id);
      if (variants === false) throw new Error("Error getting variants");
      featuresArr[i].variant_arr = variants.map(variant => {
        return new Variant(variant);
      });
    }

    res.status(200).json(featuresArr);
  } catch (error) {
    res.status(403).json("Error getting the feature in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function getCurrentFeatures(req, res) {
  const client = await pgClient.connect();
  try {
    let response = await client.query(
      "SELECT * FROM features WHERE start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE"
    );
    let featuresArr = response.rows.map(exp => {
      return new Feature(exp);
    })
    for (let i = 0; i < featuresArr.length; i++) {
      let variants = await getVariants(featuresArr[i].id);
      if (variants === false) throw new Error("Error getting variants");
      featuresArr[i].variant_arr = variants.map(variant => {
        return new Variant(variant);
      });
    }
    let currentToggles = featuresArr.filter( obj => obj.type_id === 1)
    let currentRollouts = featuresArr.filter( obj => obj.type_id === 2)
    let currentExperiments = featuresArr.filter( obj => obj.type_id === 3) 
    console.log("before update")
    await updateUserBlocks(currentExperiments)
    console.log("after update")

    let userblocks = await client.query(
      "SELECT * FROM userblocks"
    );
    userblocks = userblocks.rows
    let currentObj = {experiments: currentExperiments, toggles: currentToggles, rollouts: currentRollouts, userblocks}

    res.status(200).json(currentObj);
  } catch (error) {
    res.status(403).json("Error getting the feature in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function updateUserBlocks(currentExperiments) {
  let currentExperimentIDs = currentExperiments.map( obj => obj.id)
  const client = await pgClient.connect();
  try {
    let response = await client.query(
      "SELECT * FROM userblocks"
    );
    let userblocks = response.rows
    let oldblocks = []
    let scheduledIDs = []
    let freeblocks = []

    userblocks.forEach( block=> {
      if (block.feature_id === null) {
        freeblocks.push(block)
        return
      }
      if (!currentExperimentIDs.includes(block.feature_id)) {
        oldblocks.push(block)
        return
      }
      scheduledIDs.push(block.feature_id)
    })

    for(let i = 0; i<oldblocks.length; i++) {
      let block = oldblocks[i]
      freeblocks.push (await resetBlock(block));
    }

    for(let i = 0; i< currentExperimentIDs.length; i ++) {
      if (freeblocks.length === 0 ) throw new Error("overbooked experiments");
      let experiment = currentExperiments[i]
      let id = currentExperimentIDs[i]
      if (scheduledIDs.includes(id)) continue
      console.log("freeblocks before", freeblocks)
      freeblocks = await scheduleExperiment(experiment, freeblocks)
      console.log("freeblocks after", freeblocks)
    }

  } catch (error) {
    console.log("error updating blocks")
    return false
  } finally {
    client.release();
  }
}

async function scheduleExperiment(experiment, freeblocks) {
  let feature_id = experiment.id
  let percentage = experiment.user_percentage
  percentage *= 100
  let percentFree = freeblocks.length * 5
  percentage = Math.min(percentFree, percentage)
  let blockIDSUsed = []
  console.log("percentage", percentage)
  const client = await pgClient.connect();
  try {
    let currentPercentage = 0
    for(let i = 0; i < freeblocks.length; i++) {
      if (currentPercentage >= percentage) break;
      currentPercentage += 5;
      let {id} = freeblocks[i]
      await client.query(
        "UPDATE userblocks SET feature_id = $1 WHERE id = $2", [feature_id, id]
      );
      blockIDSUsed.push(freeblocks[i].id)
    }
    console.log("currentPercentage", currentPercentage)
    return freeblocks.filter( block => !blockIDSUsed.includes(block.id))
  } catch (error) {
    console.log(`error scheduling Experiment with name ${experiment.name}`)
    return false
  } finally {
    client.release();
  }
}
  
async function resetBlock(block) {
  let {name} = block
  const client = await pgClient.connect();
  try {
    await client.query(
      "UPDATE userblocks SET feature_id = null WHERE name = $1", [name]
    );
  } catch (error) {
    console.log(`error reseting userblock with name ${name}`)
    return false
  } finally {
    client.release();
  }
}

async function getFeatureByID(req, res) {
  const id = req.params.id;
  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "SELECT * FROM features WHERE id = $1", [id]
    );
    let newFeature = new Feature(response.rows[0])
    let variants = await getVariants(id)
    if (variants === false) throw new Error("Error getting variants");
    newFeature.variant_arr = variants.map(variant => {
      return new Variant(variant);
    });
    res.status(200).json(newFeature);
  } catch (error) {
    res.status(403).json("Error getting the feature in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function getVariants(feature_id) {
  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "SELECT * FROM variants WHERE feature_id = $1", [feature_id]
    )
    let variant_arr = response.rows
    return variant_arr
  } catch (error) {
    console.log(error.stack);
    return(false);
  } finally {
    client.release();
  }
}

async function getVariantsByExpID(req, res) {
  const id = req.params.id;
  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "SELECT * FROM variants WHERE feature_id = $1", [id]
    )
    let variantArr = response.rows
    variantArr = variantArr.map(variant => {
      return new Variant(variant);
    });
    res.status(200).json(variantArr);
  } catch (error) {
    console.log(error.stack);
    res.status(403).json("Error getting variants by feature Id");
  } finally {
    client.release();
  }
}

async function createFeature(req, res) {
  let { name, type_id, start_date, end_date, is_running, user_percentage, description } = req.body;
  if (is_running === undefined) is_running = false;
  if (user_percentage === undefined) user_percentage = 1;
  if (description === undefined) description = "";

  const client = await pgClient.connect();
  try {
    let response = await client.query(
      "INSERT INTO features (type_id, name, start_date, end_date, is_running, user_percentage, description) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [type_id, name, start_date, end_date, is_running, user_percentage, description]
    );

    response = await client.query(
      "SELECT * FROM features WHERE name = $1",
      [name]
    );

    response = response.rows[0];
    let newFeature = new Feature(response);
    res.status(200).json(newFeature);
  } catch (error) {
    res.status(403).json("Error in creating the feature in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function deleteFeature(req, res) {
  const id = req.params.id;

  const client = await pgClient.connect();
  try {
    await client.query(
      "DELETE FROM features WHERE (id = $1)",
      [id]
    );
    res.status(200).json(`feature with id ${id} successfully deleted.`)
  } catch (error) {
    res.status(400).json("Error in deleting the feature in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function updateFeature(req, res) {
  let {id, type_id, name, start_date, end_date, is_running, user_percentage, description} = req.body;

  const client = await pgClient.connect();
  try {
    let response = await client.query(
      "UPDATE features SET type_id = $2, name = $3, start_date = $4, end_date = $5, is_running = $6, user_percentage = $7, description = $8 WHERE id = $1", [id, type_id, name, start_date, end_date, is_running, user_percentage, description]
    );
    response = await client.query(
      "SELECT * FROM features WHERE id = $1", [id]
    );
    let newFeature = new Feature(response.rows[0])
    let variants = await getVariants(id)
    if (variants === false) throw new Error("Error getting variants");
    newFeature.variant_arr = variants.map(variant => {
      return new Variant(variant);
    });
    res.status(200).json(newFeature);
  } catch (error) {
    await client.query("DELETE FROM variants WHERE feature_id = $1", [id])
    res.status(403).json("Error in updating the feature in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function createVariants(req, res) {
  let id = req.params.id;
  const client = await pgClient.connect();
  try {
    let variant_arr = req.body.variants;
    await deleteVariants (id)

    for (let i = 0; i < variant_arr.length; i++) {
      let variant = variant_arr[i];
      if (variant.feature_id != id) throw new Error(`feature Id doesn't match. feature id: ${id}. variant id: ${variant.feature_id}`)
      await createVariant(variant);
    }
    const response = await client.query(
      "SELECT * from variants WHERE feature_id = $1", [id]
    );

    let addVariants = response.rows
    let weightSum = addVariants.reduce( (t,v) => t+Number(v.weight), 0)

    if (weightSum != 1 ) throw new Error("feature weights don't add to 1")
    res.status(200).json(addVariants);  //FIXME
  } catch (error) {
    await client.query("DELETE FROM variants WHERE feature_id = $1", [id])
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
      "INSERT INTO variants (feature_id, value, is_control, weight) VALUES ($1, $2, $3, $4)", [obj.feature_id, obj.value, obj.is_control, obj.weight]
    );

    return;
  } catch (error) {
    throw new Error("Error creating Variant")
  } finally {
    client.release();
  }
}

async function deleteVariants (id) {
  const client = await pgClient.connect();
  try {
    await client.query("DELETE FROM variants WHERE feature_id = $1" , [id])
    return true
  } catch (error) {
    console.log("Error deleting the variants in postgres")
    return false
  } finally {
    client.release();
  }
}

export { getFeatures, getFeatureByID, createFeature, updateFeature, deleteFeature, createVariants, getVariantsByExpID, deleteVariants, getCurrentFeatures };