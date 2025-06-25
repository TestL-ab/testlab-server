// Mock the pg module to prevent real database connections
jest.mock('pg', () => {
  const mPgClient = {
    query: jest.fn(() => ({ rows: [] })), // Return empty rows by default
    release: jest.fn(),
  };
  const mPgPool = {
    connect: jest.fn(() => mPgClient),
    on: jest.fn(),
  };
  const PoolMock = jest.fn(() => mPgPool);
  return {
    default: {
      Pool: PoolMock,
    },
    Pool: PoolMock,
  };
});

// Mock the config module to prevent loading real environment variables
jest.mock('../utils/config.js', () => ({
  default: {
    PG_DATABASE: 'test_db',
    PG_HOST: 'localhost',
    PG_USERNAME: 'test_user',
    PG_PASSWORD: 'test_password'
  }
}));

import { scheduleExperiment, createVariant, deleteVariants } from "./featuresController";

describe("testing some loner functions from features Controller", () => {
  // Suppress console.log during tests to avoid noise
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    console.log.mockRestore();
  });

  test("scheduleExperiment", async () => {
    expect( await scheduleExperiment({name: "howard"}, [])).toEqual(false)
  })

  // test( "scheduleExperiments throws error", async () => {
  //   expect.assertions(1);

  //   try {
  //     await scheduleExperiment({name: "howard"}, []);
  //   } catch (e) {
  //     expect(e).toBeInstanceOf(Error);
  //   }

  // })

  test("create variant error with feature id", async () => {
    expect( await createVariant({
      "feature_id" : -1,
      "value": "red"
    })).toEqual(false)
  })

  test("create variant error with feature id", async () => {
    expect( await deleteVariants(-1)).toEqual(false)
  })
})