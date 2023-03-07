import pg from "pg";
import config from "../utils/config.js";
import { Experiment, Variant } from "../models/experiment.js";

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

async function getEvents(req, res) {
  const client = await pgClient.connect();
  try {
    const response = await client.query("SELECT * FROM events");
    let eventsArr = response.rows;

    console.log("List of Events passed back", eventsArr);
    res.status(200).json(eventsArr);
  } catch (error) {
    res.status(403).json("Error getting the events in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function getEventsForExperiment(req, res) {
  const client = await pgClient.connect();
  const id = req.params.id; //experiment id; event table does not have experiment id column
  try {
    const response = await client.query(
      "SELECT * FROM events INNER JOIN variants ON events.variant_id = variants.id WHERE variants.experiment_id = $1",
      [id]
    );
    let eventsArr = response.rows;

    console.log("List of Events passed back", eventsArr);
    res.status(200).json(eventsArr);
  } catch (error) {
    res.status(403).json("Error getting the events in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function getEventData(req, res) {
  const client = await pgClient.connect();
  const id = req.params.id; //experiment id from params; event table does not have experiment id column

  /*
  get list of variants
  get events for that variant << count is event_total
  get uniq user events for variant << count distic...

  get total users
    query user table with variant

  */

  try {
    let response = await client.query(
      "SELECT * FROM variants WHERE variants.experiment_id = $1",
      [id]
    )
    
    let variantArr = response.rows.map(variant => {
      return new Variant(variant);
    });

    let event_data = []
    for (let i=0; i<variantArr.length; i++) {
      let variant = variantArr[i]
      let variant_id = variant.id
      response = await client.query(
        "SELECT COUNT(id) as event_total FROM events WHERE variant_id = $1", [variant_id]
      )
      let event_total = Number(response.rows[0].event_total)
      response = await client.query(
        "SELECT COUNT( DISTINCT user_id) as distinct_user_events_total FROM events WHERE variant_id = $1", [variant_id]
      )
      let distinct_user_events_total = Number(response.rows[0].distinct_user_events_total)
      response = await client.query(
        "SELECT COUNT(id) as total_users FROM users WHERE variant_id = $1", [variant_id]
      )

      let total_users = Number(response.rows[0].total_users)
      event_data.push({
        ...variant,
        event_total,
        distinct_user_events_total,
        total_users
      })
    }

    res.status(200).json(event_data);
  } catch (error) {
    res.status(403).json("Error getting the events in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}


async function createEvent(req, res) {
  const { variant_id, user_id } = req.body;

  console.log("req body", req.body);

  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "INSERT INTO events (variant_id, user_id) VALUES ($1, $2)",
      [variant_id, user_id]
    );
    res.status(200).json("Event added to database.");
  } catch (error) {
    res.status(403).json("Error in creating the event in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

export { getEvents, getEventsForExperiment, createEvent, getEventData };