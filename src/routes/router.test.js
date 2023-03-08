import supertest from "supertest";
import app from "../app.js"

let testExperiment1
let testExperiment2
let testID
let testID2
let response
let newVariants
let newUser
let testUserID
let variant1ID
let variant2ID
let variants
let testNewEvent

beforeEach( async() => {
  testExperiment1 = {
    "type_id": 3,
    "name": "test_experiment",
    "start_date": "2/23/23",
    "end_date": "2/23/24",
    "is_running": true,
    "user_percentage": 0.5
  }

  testExperiment2 = {
    "type_id": 3,
    "name": "test_experiment_2",
    "start_date": "2/23/23",
    "end_date": "2/23/24",
  }

  newVariants = {
    "variants": [
      {
        "experiment_id" : 184,
        "value": "red",
        "is_control": false,
        "weight": 0.5
      },
      {
        "experiment_id" : 184,
        "value": "red",
        "is_control": false,
        "weight": 0.5
      }
    ]
  }

  newUser = {
    "id": "66",
    "variant_id": "5",
    "ip_address": "192.168.101.20"
  }

  testNewEvent = {}

  response = await supertest(app).post("/api/experiment").send(testExperiment1);
  testID = response.body.id
  response = await supertest(app).post("/api/experiment").send(testExperiment2);
  testID2 = response.body.id
  newVariants.variants[0].experiment_id = testID2
  newVariants.variants[1].experiment_id = testID2
  response = await supertest(app).post(`/api/experiment/${testID2}/variants`).send(newVariants);
  
  variants = response.body.variants
  variant1ID = response.body.variants[0].id
  variant2ID = response.body.variants[1].id

  newUser.variant_id = variant1ID
  response = await supertest(app).post("/api/users").send(newUser);
  testUserID = response.body.id
  
  testNewEvent.user_id = testUserID
  testNewEvent.variant_id = variant2ID
  response = await supertest(app).post(`/api/events`).send(testNewEvent)
})

afterEach( async() => {
  await supertest(app).delete(`/api/experiment/${testID}`)
  await supertest(app).delete(`/api/experiment/${testID2}`)
  await supertest(app).delete(`/api/users/${testUserID}`)
})

describe("Experiments API", () => {
  let newExperiment = {
    "type_id": 3,
    "name": "new_test_experiment",
    "start_date": "2/23/23",
    "end_date": "2/23/24",
    "is_running": true,
    "user_percentage": 0.5
  }

  test( "testing get all experiment", async () => {
    response = await supertest(app).get("/api/experiment");
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length >= 1).toBe(true);
  })

  test( "testing get experiment by id", async () => {
    response = await supertest(app).get(`/api/experiment/${testID}`);
    expect(response.status).toEqual(200);
  })

  test( "testing Create experiment", async () => {
    response = await supertest(app).post("/api/experiment").send(newExperiment);
    expect(response.status).toEqual(200);
    expect(response.body.name).toEqual("new_test_experiment");
    let testID = response.body.id
    await supertest(app).delete(`/api/experiment/${testID}`)
  })

  test( "creating an expirment that already exists", async () => {
    response = await supertest(app).post("/api/experiment").send(newExperiment);
    let testID = response.body.id
    response = await supertest(app).post("/api/experiment").send(newExperiment);
    expect(response.status).toEqual(403);
    expect(response.body).toEqual("Error in creating the experiment in postgres");
    await supertest(app).delete(`/api/experiment/${testID}`)
  })

  test( "testing delete experiment", async () => {
    response = await supertest(app).post("/api/experiment").send(newExperiment);
    let testID = response.body.id

    await supertest(app).delete(`/api/experiment/${testID}`)

    response = await supertest(app).get("/api/experiment")
    expect(
      response
        .body
        .filter( exp => exp.name === "new_test_experiment")
        .length
    ).toBe(0)
  })

  test( "testing creating experiment with defaults", async () => {
    delete newExperiment.is_running
    delete newExperiment.user_percentage

    response = await supertest(app).post("/api/experiment").send(newExperiment);
    let testID = response.body.id
    expect(response.status).toBe(200)

    await supertest(app).delete(`/api/experiment/${testID}`)
  })
});

describe("Variants API", () => {
  test( "testing error when adding variant where experiment Id of variants doesn't match param id", async () => {
    response = await supertest(app).post(`/api/experiment/${testID}/variants`).send(newVariants);
    expect(response.status).toEqual(403)
    expect(response.body).toEqual("Error in creating the variants in postgres")
  })

  test( "testing error when varients weights don't sum to 1", async ()=> {
    newVariants.variants.forEach(variant => variant.experiment_id = testID)
    newVariants.variants[0].weight = 0.4
    newVariants.variants[1].weight = 0.4
    response = await supertest(app).post(`/api/experiment/${testID}/variants`).send(newVariants);
    expect(response.status).toEqual(403)
    expect(response.body).toEqual("Error in creating the variants in postgres")
  })

  test( "testing varient defaults", async ()=> {
    newVariants.variants.forEach(variant => variant.experiment_id = testID)
    response = await supertest(app).post(`/api/experiment/${testID}/variants`).send(newVariants);
    expect(response.status).toEqual(200)
  })

  test( "testing create variant" , async () => {
    newVariants.variants.forEach(variant => variant.experiment_id = testID)
    newVariants.variants[0].weight = 0.5
    newVariants.variants[1].weight = 0.5

    response = await supertest(app).post(`/api/experiment/${testID}/variants`).send(newVariants);
    expect(response.status).toEqual(200)
    expect(Array.isArray(response.body.variants)).toEqual(true)
  })

  test( "get variant array", async () => {
    newVariants.variants.forEach(variant => variant.experiment_id = testID)
    response = await supertest(app).post(`/api/experiment/${testID}/variants`).send(newVariants);
    response = await supertest(app).get(`/api/experiment/${testID}/variants`);
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toEqual(true);
  })
})

describe("User API", () => {

  let testUser = {
    "id": "62",
    "variant_id": 31,
    "ip_address": "192.168.101.20"
  }

  test( "get users", async () => {
    response = await supertest(app).get(`/api/users`)
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  })



  test( "create new user", async () => {
    newVariants.variants.forEach(variant => variant.experiment_id = testID)
    response = await supertest(app).post(`/api/experiment/${testID}/variants`).send(newVariants);
    response = await supertest(app).get(`/api/experiment/${testID}/variants`);
    expect(response.status).toEqual(200);
    
    response = await supertest(app).post("/api/users").send(testUser);
    expect(response.status).toEqual(200);
    let userID = response.body.id
    await supertest(app).delete(`/api/users/${userID}`)
  })

  test("delete new user", async () => {
    response = await supertest(app).post("/api/users").send(testUser);
    expect(response.status).toEqual(200);
    let userID = response.body.id
    response = await supertest(app).delete(`/api/users/${userID}`)
    expect(response.status).toEqual(200);
  })
})

describe("Events API", () => {
  let newEvent = {
    "user_id": "68",
    "variant_id": 14
  }

  test("create event", async () => {
    newEvent.user_id = testUserID
    newEvent.variant_id = variant1ID
    response = await supertest(app).post(`/api/events`).send(newEvent)
    expect(response.status).toEqual(200);
  })

  test("failing create event", async () => {
    response = await supertest(app).post(`/api/events`).send(newEvent)
    expect(response.status).toEqual(403);
  })

  test("get events", async () => {
    response = await supertest(app).get(`/api/events`)
    expect(response.status).toEqual(200);
  })

  test("Get events for experiment", async () => {
    response = await supertest(app).get(`/api/experiment/${testID2}`)
    expect(response.status).toEqual(200);
  })

  test("failing Get events for experiment", async () => {
    response = await supertest(app).get(`/api/experiment/${0}`)
    expect(response.status).toEqual(403);
  })
})