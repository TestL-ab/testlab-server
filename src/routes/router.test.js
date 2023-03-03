import supertest from "supertest";
import app from "../app.js"

describe("Experiments API", () => {
  let newExperiment = {
    "type_id": 3,
    "name": "test_experiment",
    "start_date": "2/23/23",
    "end_date": "2/23/24",
    "is_running": true,
    "user_percentage": 0.5
  }

  test( "testing get all experiment", async () => {

    let response = await supertest(app).get("/api/experiment");
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length >= 1).toBe(true);
  })

  test( "testing Create experiment", async () => {
    let response = await supertest(app).post("/api/experiment").send(newExperiment);
    expect(response.status).toEqual(200);
    expect(response.body.name).toEqual("test_experiment");
    let testID = response.body.id

    response = await supertest(app).post("/api/experiment").send(newExperiment);
    expect(response.status).toEqual(403);
    expect(response.body).toEqual("Error in creating the experiment in postgres");

    await supertest(app).delete(`/api/experiment/${testID}`)
  })

  test( "testing delete experiment", async () => {
    let response = await supertest(app).post("/api/experiment").send(newExperiment);
    let testID = response.body.id

    await supertest(app).delete(`/api/experiment/${testID}`)

    response = await supertest(app).get("/api/experiment")
    expect(
      response
        .body
        .filter( exp => exp.name === "test_experiment")
        .length
    ).toBe(0)
  })
});

describe("Variants API", () => {
  let newVariants = {
    "variants": [
      {
        "experiment_id" : 5,
        "value": "red",
      },
      {
        "experiment_id" : 5,
        "value": "red"
      }
    ]
  }

  let newExperiment = {
    "type_id": 3,
    "name": "test_experiment",
    "start_date": "2/23/23",
    "end_date": "2/23/24",
    "is_running": true,
    "user_percentage": 0.5
  }

  test( "testing create variant" , async () => {
    let response = await supertest(app).post("/api/experiment").send(newExperiment);
    let expId = response.body.id

    response = await supertest(app).post(`/api/experiment/${expId}/variants`).send(newVariants);
    expect(response.status).toEqual(403)
    expect(response.body).toEqual("Error in creating the variants in postgres")

    newVariants.variants.forEach(variant => variant.experiment_id = expId)
    newVariants.variants[0].weight = 0.4
    newVariants.variants[1].weight = 0.4


    response = await supertest(app).post(`/api/experiment/${expId}/variants`).send(newVariants);
    expect(response.status).toEqual(403)
    expect(response.body).toEqual("Error in creating the variants in postgres")

    newVariants.variants[0].weight = 0.5
    newVariants.variants[1].weight = 0.5

    response = await supertest(app).post(`/api/experiment/${expId}/variants`).send(newVariants);
    expect(response.status).toEqual(200)
    expect(Array.isArray(response.body.variants)).toEqual(true)

    await supertest(app).delete(`/api/experiment/${expId}`)
  })
})