import supertest from "supertest";
import app from "../app.js"

let testFeature1
let testFeature2
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
  testFeature1 = {
    "type_id": 3,
    "name": "test_feature",
    "start_date": "2/23/23",
    "end_date": "2/23/24",
    "is_running": true,
    "user_percentage": 0.5
  }

  testFeature2 = {
    "type_id": 3,
    "name": "test_feature_2",
    "start_date": "2/23/23",
    "end_date": "2/23/24",
  }

  newVariants = {
    "variants": [
      {
        "feature_id" : 184,
        "value": "blue",
        "is_control": false,
        "weight": 0.5
      },
      {
        "feature_id" : 184,
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

  response = await supertest(app).post("/api/feature").send(testFeature1);
  testID = response.body.id
  response = await supertest(app).post("/api/feature").send(testFeature2);
  testID2 = response.body.id
  newVariants.variants[0].feature_id = testID2
  newVariants.variants[1].feature_id = testID2
  response = await supertest(app).post(`/api/feature/${testID2}/variants`).send(newVariants);
  
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
  await supertest(app).delete(`/api/feature/${testID}`)
  await supertest(app).delete(`/api/feature/${testID2}`)
  await supertest(app).delete(`/api/users/${testUserID}`)
})

describe("Features API", () => {
  let newFeature = {
    "type_id": 3,
    "name": "new_test_feature",
    "start_date": "2/23/23",
    "end_date": "2/23/24",
    "is_running": true,
    "user_percentage": 0.5
  }

  test( "testing get all feature", async () => {
    response = await supertest(app).get("/api/feature");
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length >= 1).toBe(true);
  })

  test( "testing get feature by id", async () => {
    response = await supertest(app).get(`/api/feature/${testID}`);
    expect(response.status).toEqual(200);
  })

  test( "testing Create feature", async () => {
    response = await supertest(app).post("/api/feature").send(newFeature);
    expect(response.status).toEqual(200);
    expect(response.body.name).toEqual("new_test_feature");
    let testID = response.body.id
    await supertest(app).delete(`/api/feature/${testID}`)
  })

  test( "creating an expirment that already exists", async () => {
    response = await supertest(app).post("/api/feature").send(newFeature);
    let testID = response.body.id
    response = await supertest(app).post("/api/feature").send(newFeature);
    expect(response.status).toEqual(403);
    expect(response.body).toEqual("Error in creating the feature in postgres");
    await supertest(app).delete(`/api/feature/${testID}`)
  })

  test( "testing delete feature", async () => {
    response = await supertest(app).post("/api/feature").send(newFeature);
    let testID = response.body.id

    await supertest(app).delete(`/api/feature/${testID}`)

    response = await supertest(app).get("/api/feature")
    expect(
      response
        .body
        .filter( exp => exp.name === "new_test_feature")
        .length
    ).toBe(0)
  })

  test( "test error delete feature", async () => {
    response = await supertest(app).delete(`/api/feature/${"bad"}`)
    expect(response.status).toEqual(400);
  })

  test( "testing creating feature with defaults", async () => {
    delete newFeature.is_running
    delete newFeature.user_percentage

    response = await supertest(app).post("/api/feature").send(newFeature);
    let testID = response.body.id
    expect(response.status).toBe(200)

    await supertest(app).delete(`/api/feature/${testID}`)
  })

  test( "update feature", async () => {
    let response = await supertest(app).get(`/api/feature/${testID2}`);
    let testID2Obj = response.body
    testID2Obj.name = "purple"
    testID2Obj = {...testID2Obj, id: testID2}
    response = await supertest(app).put(`/api/feature/${testID2}`).send(testID2Obj);
    expect(response.status).toEqual(200)
    expect(response.body.name === "purple")
  })
});

describe("Variants API", () => {
  test( "testing error when adding variant where feature Id of variants doesn't match param id", async () => {
    response = await supertest(app).post(`/api/feature/${testID}/variants`).send(newVariants);
    expect(response.status).toEqual(403)
    expect(response.body).toEqual("Error in creating the variants in postgres")
  })

  test( "testing error when varients weights don't sum to 1", async ()=> {
    newVariants.variants.forEach(variant => variant.feature_id = testID)
    newVariants.variants[0].weight = 0.4
    newVariants.variants[1].weight = 0.4
    response = await supertest(app).post(`/api/feature/${testID}/variants`).send(newVariants);
    expect(response.status).toEqual(403)
    expect(response.body).toEqual("Error in creating the variants in postgres")
  })

  test( "testing varient defaults", async ()=> {
    newVariants.variants.forEach(variant => variant.feature_id = testID)
    response = await supertest(app).post(`/api/feature/${testID}/variants`).send(newVariants);
    expect(response.status).toEqual(200)
  })

  test( "testing create variant" , async () => {
    newVariants.variants.forEach(variant => variant.feature_id = testID)
    newVariants.variants[0].weight = 0.5
    newVariants.variants[1].weight = 0.5

    response = await supertest(app).post(`/api/feature/${testID}/variants`).send(newVariants);
    expect(response.status).toEqual(200)
    expect(Array.isArray(response.body.variants)).toEqual(true)
  })

  test( "get variant array", async () => {
    newVariants.variants.forEach(variant => variant.feature_id = testID)
    response = await supertest(app).post(`/api/feature/${testID}/variants`).send(newVariants);
    response = await supertest(app).get(`/api/feature/${testID}/variants`);
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toEqual(true);
  })

  test( "test error getting variants by expID", async () => {
    response = await supertest(app).get(`/api/feature/${"bad"}/variants`);
    expect(response.status).toEqual(403);
  })

  test( "update variant", async () => {
    newVariants.variants.forEach(variant => variant.feature_id = testID)
    response = await supertest(app).post(`/api/feature/${testID}/variants`).send(newVariants);
    newVariants.
    response = await supertest(app).post(`/api/feature/${testID}/variants`).send(newVariants);
    expect(response.status).toEqual(200);
  })
})

describe("User API", () => {

  let testUser = {
    "id": "62",
    "variant_id": 0,
    "ip_address": "192.168.101.20"
  }

  test( "get users", async () => {
    response = await supertest(app).get(`/api/users`)
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  })

  test( "create new user", async () => {
    newVariants.variants.forEach(variant => variant.feature_id = testID)
    response = await supertest(app).post(`/api/feature/${testID}/variants`).send(newVariants);
    response = await supertest(app).get(`/api/feature/${testID}/variants`);
    expect(response.status).toEqual(200);

    testUser.variant_id = variant2ID
    
    response = await supertest(app).post("/api/users").send(testUser);
    expect(response.status).toEqual(200);
    let userID = response.body.id
    await supertest(app).delete(`/api/users/${userID}`)
  })

  test( "create new user with bad data", async () => {
    response = await supertest(app).post("/api/users").send({id: 12});
    expect(response.status).toEqual(403);
  })

  test("delete new user", async () => {
    testUser.variant_id = variant2ID
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

  test("Get events for feature", async () => {
    response = await supertest(app).get(`/api/feature/${testID2}`)
    expect(response.status).toEqual(200);
    expect(response.body.length > 0);
  })

  test("failing Get events for feature", async () => {
    response = await supertest(app).get(`/api/feature/${0}`)
    expect(response.status).toEqual(403);
  })

  test("get event data", async () => {
    response = await supertest(app).get(`/api/analysis/feature/${testID2}`)
    expect(response.status).toEqual(200);
  })

  test("get event data with bad feature Id", async () => {
    response = await supertest(app).get(`/api/analysis/feature/${"bad"}`)
    expect(response.status).toEqual(403);
  })

  test("get events for feature with bad feature id", async () => {
    response = await supertest(app).get(`/api/events/feature/${"bad"}`)
    expect(response.status).toEqual(403);
  })

  test("get events for feature", async () => {
    response = await supertest(app).get(`/api/events/feature/${testID2}`)
    expect(response.status).toEqual(200);
  })
})

describe("Userblocks API", () => {
  test("get userblock", async () => {
    response = await supertest(app).get(`/api/userblocks`)
    expect(response.status).toEqual(200);
  })

  test("get userblock by name", async () => {
    response = await supertest(app).get(`/api/userblocks/20`)
    expect(response.status).toEqual(200);
    expect(response.body.id).toEqual(4)
  })

  test("error get userblock by name", async () => {
    response = await supertest(app).get(`/api/userblocks/23`)
    expect(response.status).toEqual(403);
  })

  test("error set userblock", async () => {
    response = await supertest(app).put(`/api/userblocks`).send({
      "feature_id": "63",
      "name": "4" 
    })
    expect(response.status).toEqual(403);
  })

  test("set userblock", async () => {
    response = await supertest(app).put(`/api/userblocks`).send({
      "feature_id": "63",
      "name": "5" 
    })
    expect(response.status).toEqual(200);
    expect(response.body.feature_id).toEqual(63)
  })

  test("reset userblock", async () => {
    response = await supertest(app).put(`/api/userblocks`).send({
      "feature_id": "63",
      "name": "5" 
    })
    response = await supertest(app).put(`/api/userblocks/reset`)
    expect(response.status).toEqual(200);
    response = await supertest(app).get(`/api/userblocks/5`)
    expect(response.body.feature_id).toEqual(null)
  })
})