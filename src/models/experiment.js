const Experiment = class {
  constructor(
    name,
    typeId,
    startDate,
    endDate,
    running,
    percentage,
    variantArr
  ) {
    this.id = null;
    this.name = name;
    this.type = typeId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.running = running;
    this.percentage = percentage;
    this.variants = variantArr || [];
  }
};

const Variant = class {
  constructor(name, experimentId, isControl, weight) {
    // this.id = id generator function
    this.name = name;
    this.experimentId = experimentId;
    this.isControl = isControl;
    this.weight = weight;
  }
};

export { Experiment, Variant };
