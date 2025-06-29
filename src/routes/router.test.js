import supertest from "supertest";
import app from "../app.js"
import { clearTestDatabase, closeTestDbPool } from "../../test/db-helper.js";

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
let lastModified

// Set up test database before all tests
beforeAll(async () => {
  // Clear the test database to start fresh
  await clearTestDatabase();
});

// Clean up after all tests
afterAll(async () => {
  // Close test database pool
  await closeTestDbPool();
  
  // Give a moment for any remaining connections to close
  await new Promise(resolve => setTimeout(resolve, 100));
}, 10000); // 10 second timeout for cleanup

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

  // Now enable database setup for integration tests
  response = await supertest(app).post("/api/feature").send(testFeature1);
  testID = response.body.id
  response = await supertest(app).post("/api/feature").send(testFeature2);
  testID2 = response.body.id
  newVariants.variants[0].feature_id = testID2
  newVariants.variants[1].feature_id = testID2
  response = await supertest(app).post(`/api/feature/${testID2}/variants`).send(newVariants);
  
  variants = response.body
  variant1ID = response.body[0].id
  variant2ID = response.body[1].id

  newUser.variant_id = variant1ID
  response = await supertest(app).post("/api/users").send(newUser);
  testUserID = response.body.id
  
  testNewEvent.user_id = testUserID
  testNewEvent.variant_id = variant2ID
  response = await supertest(app).post(`/api/events`).send(testNewEvent)
})

afterEach( async() => {
  // Clean up test data after each test
  await supertest(app).delete(`/api/feature/${testID}`)
  await supertest(app).delete(`/api/feature/${testID2}`)
  await supertest(app).delete(`/api/users/${testUserID}`)
  jest.resetModules();
  jest.clearAllMocks();
})

describe("Basic App Tests", () => {
  test("app loads successfully", async () => {
    // Simple test to verify the Express app loads without database calls
    expect(app).toBeDefined();
    expect(typeof app).toBe('function');
  });
});

describe("Features API", () => {
  let newFeature = {
    "type_id": 3,
    "name": "new_test_feature",
    "start_date": "2/23/23",
    "end_date": "2/23/24",
    "is_running": true,
    "user_percentage": 0.5
  }

  test("testing get all feature", async () => {
    // First create a test feature so we have data to retrieve
    const createResponse = await supertest(app).post("/api/feature").send(newFeature);
    expect(createResponse.status).toEqual(200);
    
    // Now test getting all features
    response = await supertest(app).get("/api/feature");
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length >= 1).toBe(true);
    
    // Clean up the created feature
    await supertest(app).delete(`/api/feature/${createResponse.body.id}`);
  })

  test( "testing get feature by id", async () => {
    response = await supertest(app).get(`/api/feature/${testID}`);
    expect(response.status).toEqual(200);
  })

  test( "testing error get feature by id", async () => {
    response = await supertest(app).get(`/api/feature/${"bad"}`);
    expect(response.status).toEqual(403);
  })

  test( "testing get current features", async () => {
    response = await supertest(app).get(`/api/feature/current`);
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body.experiments)).toEqual(true)
    expect(Array.isArray(response.body.toggles)).toEqual(true)
    expect(Array.isArray(response.body.rollouts)).toEqual(true)
    expect(Array.isArray(response.body.userblocks)).toEqual(true)
  })

  test( "testing starting from empty userblocks", async () => {
    response = await supertest(app).put(`/api/userblocks/reset`);
    response = await supertest(app).get(`/api/userblocks`);
    let blocks = response.body.filter(block => block.feature_id === null)
    expect(blocks.length).toEqual(20)
    response = await supertest(app).get(`/api/feature/current`);
    expect(response.status).toEqual(200);
  })

  let userblockOld = {
    "feature_id": "86",
    "name": "10" 
  }

  test( "testing old blocks removed", async () => {
    response = await supertest(app).put(`/api/userblocks/reset`);

    response = await supertest(app).put(`/api/userblocks`).send(userblockOld);
    response = await supertest(app).get(`/api/userblocks`);
    let blocks = response.body.filter(block => block.feature_id === 86)
    expect(blocks.length).toEqual(1)
    expect(blocks[0].name).toEqual("10")

    response = await supertest(app).get(`/api/feature/current`);
    expect(response.status).toEqual(200);
    response = await supertest(app).get(`/api/userblocks`);
    blocks = response.body.filter(block => block.feature_id === 86)
    expect(blocks.length).toEqual(0)
  })

  test( "testing starting from having scheduled userblocks", async () => {
    response = await supertest(app).get(`/api/feature/current`);
    response = await supertest(app).get(`/api/feature/current`);
    expect(response.status).toEqual(200);
  })

  test( "testing overscheduling", async () => {
    response = await supertest(app).post("/api/feature").send(newFeature);
    let testID = response.body.id
    response = await supertest(app).get(`/api/feature/current`);
    expect(response.status).toEqual(200);
    await supertest(app).delete(`/api/feature/${testID}`)
  })

  test( "testing overscheduling with block that can't fit", async () => {
    response = await supertest(app).post("/api/feature").send(newFeature);
    let testID = response.body.id
    response = await supertest(app).get(`/api/feature/current`);
    expect(response.status).toEqual(200);
    await supertest(app).delete(`/api/feature/${testID}`)
  })

  test( "testing Create feature", async () => {
    response = await supertest(app).post("/api/feature").send(newFeature);
    expect(response.status).toEqual(200);
    expect(response.body.name).toEqual("new_test_feature");
    let testID = response.body.id
    await supertest(app).delete(`/api/feature/${testID}`)
  })

  test( "creating an experiment that already exists", async () => {
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
    expect(response.status).toEqual(403);
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
    expect(response.body.name).toBe("purple")
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
    expect(Array.isArray(response.body)).toEqual(true)
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
    response = await supertest(app).post(`/api/feature/${testID}/variants`).send(newVariants);
    expect(response.status).toEqual(200);
  })
})

describe("User API", () => {

  let testUser = {
    "id": "72",
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

describe("testing 304 last modified", () => {
  test("last modified get Features 304", async () => {
    response = await supertest(app).get("/api/feature");
    const lastModified = response.get('Last-Modified');

    response = await supertest(app).get("/api/feature")
    .set('If-Modified-Since', lastModified);
  
    expect(response.status).toBe(304);
  })

  test("last modified get current Features 304", async () => {
    response = await supertest(app).get("/api/feature/current");
    const lastModified = response.get('Last-Modified');

    response = await supertest(app).get("/api/feature/current")
    .set('If-Modified-Since', lastModified);
  
    expect(response.status).toBe(304);
  })

  test("last modified getFeatureByID 304", async () => {
    response = await supertest(app).get(`/api/feature/${testID}`);
    const lastModified = response.get('Last-Modified');

    response = await supertest(app).get(`/api/feature/${testID}`)
    .set('If-Modified-Since', lastModified);
  
    expect(response.status).toBe(304);
  })

  test("last modified getVariantsByExpID 304", async () => {
    response = await supertest(app).get(`/api/feature/${testID}/variants`);
    const lastModified = response.get('Last-Modified');

    response = await supertest(app).get(`/api/feature/${testID}/variants`)
    .set('If-Modified-Since', lastModified);
  
    expect(response.status).toBe(304);
  })

  test("last modified mixing 304", async () => {
    response = await supertest(app).get(`/api/feature/${testID}/variants`);
    const lastModified = response.get('Last-Modified');

    response = await supertest(app).get(`/api/feature/current`)
    .set('If-Modified-Since', lastModified);
  
    expect(response.status).toBe(304);
  })
})