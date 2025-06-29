import pg from "pg";
import config from "../utils/config.js";
import { Variant } from "../models/feature.js";

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

async function getEvents(req, res) {
  const client = await pgClient.connect();
  try {
    const response = await client.query("SELECT * FROM events");
    let eventsArr = response.rows;

    res.status(200).json(eventsArr);
  } catch (error) {
    res.status(403).json("Error getting the events in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function getEventsForFeature(req, res) {
  const client = await pgClient.connect();
  const id = req.params.id; //feature id
  // Note that the event table has a variant not feature id
  // this is why we use a join
  try {
    const response = await client.query(
      "SELECT e.id as event_id, e.variant_id, e.user_id, e.time_stamp, v.feature_id, v.value, v.is_control, v.weight FROM events AS e INNER JOIN variants AS v ON e.variant_id = v.id WHERE v.feature_id = $1",
      [id]
    );
    let eventsArr = response.rows;

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
  const id = req.params.id; //feature(aka experiment/toggle/rollout) id passed as param, not variantid

  try {
    let response = await client.query(
      "SELECT * FROM variants WHERE variants.feature_id = $1",
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
    res.status(403).json("Error getting the analysis in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}


async function createEvent(req, res) {
  const { variant_id, user_id } = req.body;

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

export { getEvents, getEventsForFeature, createEvent, getEventData };
