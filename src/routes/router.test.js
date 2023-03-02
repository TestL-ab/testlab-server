import { response } from "express";
import supertest from "supertest";
import request from "supertest";
import app from "../app.js"
const baseURL = "http://localhost:3000/api"

describe("GET /experiment", () => {
  const newExperiment = {
    "type_id": 3,
    "name": "100_experiment",
    "start_date": "2/23/23",
    "end_date": "2/23/24",
    "is_running": true,
    "user_percentage": 0.5
  }

  test( "testing GET /experiment", async () => {

    await supertest(app).get("/api/experiment")
      .expect(200)
      .then( response => {
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length >= 1).toBe(true);
      })
  })
});