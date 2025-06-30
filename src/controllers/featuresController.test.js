import { vi, describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';

// Mock the pg module to prevent real database connections
vi.mock('pg', () => {
  const mPgClient = {
    query: vi.fn(() => ({ rows: [] })), // Return empty rows by default
    release: vi.fn(),
  };
  const mPgPool = {
    connect: vi.fn(() => mPgClient),
    on: vi.fn(),
  };
  const PoolMock = vi.fn(() => mPgPool);
  return {
    default: {
      Pool: PoolMock,
    },
  };
});

// Mock the config module to prevent loading real environment variables
vi.mock('../utils/config.js', () => ({
  default: {
    PG_DATABASE: 'test_db',
    PG_HOST: 'localhost',
    PG_USERNAME: 'test_user',
    PG_PASSWORD: 'test_password'
  }
}));

import { scheduleExperiment, createVariant, deleteVariants } from "./featuresController.js";

describe("testing some loner functions from features Controller", () => {
  // Suppress console.log during tests to avoid noise
  beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    console.log.mockRestore();
  });

  it("scheduleExperiment", async () => {
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

  it("create variant error with feature id", async () => {
    expect( await createVariant({
      "feature_id" : -1,
      "value": "red"
    })).toEqual(false)
  })

  it("create variant error with feature id", async () => {
    expect( await deleteVariants(-1)).toEqual(false)
  })
})