import transformData from "../utils/transformData.js";
const baseUrl = "https://dog.ceo/api/breeds/list/all";

function hello(req, res) {
  res.send("Hello, world");
}

// async function get_breed_list(req, res) {
//   try {
//     let data = await getBreedData(baseUrl);
//     let result = transformData(data);
//     res.status(200).send(result);
//   } catch (error) {
//     res.status(504).send(error);
//   }
// }

export { hello };
