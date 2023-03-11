import { scheduleExperiment } from "./featuresController";

describe("testing some loner functions from features Controller", () => {
  test("scheduleExperiment", async () => {
    // expect(scheduleExperiment({name: "howard"}, [])).toEqual(false)
    expect( await scheduleExperiment({name: "howard"}, [])).toEqual(false)
  })

  // test( "scheduleExperiments throws error", () => {
  //   expect(
  //     async () => {
  //       await scheduleExperiment({name: "howare"}, []);
  //     }
  //   ).toThrow();
  // })
  // test( "scheduleExperiments throws error", async () => {
  //   expect.assertions(1);

  //   try {
  //     await scheduleExperiment({name: "howard"}, []);
  //   } catch (e) {
  //     expect(e).toBeInstanceOf(Error);
  //   }

  // })
})