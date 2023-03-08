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
    // iterate over featureArr to tun into new feature objects
    for (let i = 0; i < featuresArr.length; i++) {
      let variants = await getVariants(featuresArr[i].id);
      if (variants === false) throw new Error("Error getting variants");
      // console.log("variants", variants)
      featuresArr[i].variant_arr = variants.map(variant => {
        return new Variant(variant);
      });
    }

    // console.log("List of features passed back", featuresArr);
    res.status(200).json(featuresArr);
  } catch (error) {
    res.status(403).json("Error getting the feature in postgres");
    console.log(error.stack);
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
    // console.log(`Variants for feature ${feature_id}`, variant_arr)
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
  let { name, type_id, start_date, end_date, is_running, user_percentage, hypothesis } = req.body;
  if (is_running === undefined) is_running = false;
  if (user_percentage === undefined) user_percentage = 1;
  if (hypothesis === undefined) hypothesis = "";

  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "INSERT INTO features (type_id, name, start_date, end_date, is_running, user_percentage, hypothesis) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [type_id, name, start_date, end_date, is_running, user_percentage, hypothesis]
    );

    let allData = await client.query(
      "SELECT * FROM features WHERE name = $1",
      [name]
    );

    allData = allData.rows[0];
    let newFeature = new Feature(allData);
    // console.log("New feature passed back", newFeature);
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
    const response = await client.query(
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
  let id = req.params.id;

  /*
  decontruct feature into obj with sql columns
  deconstruct variant_arr

  */

  // const client = await pgClient.connect();
  // try {
  //   let variant_arr = req.body.variants;

  //   for (let i = 0; i < variant_arr.length; i++) {
  //     let variant = variant_arr[i];
  //     if (variant.feature_id != id) throw new Error("feature Id doesn't match.")
  //     await createVariant(variant);
  //   }
  //   const response = await client.query(
  //     "SELECT * from variants WHERE feature_id = $1", [id]
  //   );

  //   let addVariants = response.rows
  //   let weightSum = addVariants.reduce( (t,v) => t+Number(v.weight), 0)

  //   if (weightSum != 1 ) throw new Error("feature weights don't add to 1")
  //   res.status(200).json({ variants: addVariants, text: "Made it" });
  // } catch (error) {
  //   await client.query("DELETE FROM variants WHERE feature_id = $1", [id])
  //   res.status(403).json("Error in creating the variants in postgres");
  //   console.log(error.stack);
  // } finally {
  //   client.release();
  // }
}

async function createVariants(req, res) {
  let id = req.params.id;
  const client = await pgClient.connect();
  try {
    let variant_arr = req.body.variants;

    for (let i = 0; i < variant_arr.length; i++) {
      let variant = variant_arr[i];
      if (variant.feature_id != id) throw new Error("feature Id doesn't match.")
      await createVariant(variant);
    }
    const response = await client.query(
      "SELECT * from variants WHERE feature_id = $1", [id]
    );

    let addVariants = response.rows
    let weightSum = addVariants.reduce( (t,v) => t+Number(v.weight), 0)

    if (weightSum != 1 ) throw new Error("feature weights don't add to 1")
    res.status(200).json({ variants: addVariants, text: "Made it" });
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

async function updateVariants () {

}

export { getFeatures, getFeatureByID, createFeature, updateFeature, deleteFeature, createVariants, getVariantsByExpID, updateVariants };