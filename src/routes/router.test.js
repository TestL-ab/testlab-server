import supertest from "supertest";
import app from "../app.js"

describe("GET /experiment", () => {

  test( "testing GET /experiment", async () => {

    let response = await supertest(app).get("/api/experiment");
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length >= 1).toBe(true);
  })
});

describe("post /experiment", () => {

  test( "testing POST /experiment", async () => {

    let newExperiment = {
      "type_id": 3,
      "name": "test_experiment",
      "start_date": "2/23/23",
      "end_date": "2/23/24",
      "is_running": true,
      "user_percentage": 0.5
    }

    let response = await supertest(app).post("/api/experiment").send(newExperiment);
    expect(response.status).toEqual(200);
    expect(response.body.name).toEqual("test_experiment");
    let testID = response.body.id

    await supertest(app).delete(`/api/experiment/${testID}`)
  })
});