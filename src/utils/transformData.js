function transformData(data) {
  let result = [];
  Object.entries(data).forEach(([breed, subBreeds]) => {
    if (subBreeds.length === 0) {
      result.push(breed);
    } else {
      subBreeds.forEach((subBreed) => {
        result.push(`${subBreed} ${breed}`);
      });
    }
  });
  return result;
}

export default transformData;
