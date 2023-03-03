import pg from "pg";
import config from "../utils/config.js";
//import { Experiment, Variant } from "../models/experiment.js";

//const pgClient = new pg.Pool({ database: config.PG_DATABASE });
const pgClient = new pg.Pool({
  host: config.DB_HOST,
  port: 5432,
  user: "postgres",
  password: "password",
  database: config.PG_DATABASE,
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

export { getEvents, getEventsForExperiment, createEvent };
