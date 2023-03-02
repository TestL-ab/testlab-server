import { response } from "express";
import supertest from "supertest";
import request from "supertest";
import app from "../app.js"
const baseURL = "http://localhost:3000/api"

describe("GET /experiment", () => {

  test( "testing GET /experiment", async () => {

    await supertest(app).get("/api/experiment")
      .expect(200)
      .then( response => {
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length >= 1).toBe(true);
      })
  })

  // afterAll(async () => {
  //   await new Promise(resolve => setTimeout(() => resolve(), 4000)); // avoid jest open handle error
  // });
});