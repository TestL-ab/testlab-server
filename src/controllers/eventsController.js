import pg from "pg";
import config from "../utils/config.js";
import { Experiment, Variant } from "../models/experiment.js";

const pgClient = new pg.Pool({ database: config.PG_DATABASE });
pgClient.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

async function getEvents(req, res) {
  const client = await pgClient.connect();
  try {
    const response = await client.query(
      "SELECT * FROM events"
    );
    let eventsArr = response.rows

    console.log("List of Events passed back", eventsArr);
    res.status(200).json(eventsArr);
  } catch (error) {
    res.status(403).json("Error getting the events in postgres");
    console.log(error.stack);
  } finally {
    client.release();
  }
}

async function getEventsForExperiment(req,res) {}

async function createEvent(req, res) {
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

export { getEvents, getEventsForExperiment, createEvent};
