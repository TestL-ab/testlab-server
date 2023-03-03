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