import { scheduleExperiment, createVariant, deleteVariants, pgClient } from "./featuresController";

describe("testing some loner functions from features Controller", () => {
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