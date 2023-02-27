const Experiment = class {
  constructor(
    id,
    type,
    name,
    start_date,
    end_date,
    is_running,
    user_percentage,
    variantArr
  ) {
    this.id = id;
    this.type = type;
    this.name = name;

    this.startDate = start_date;
    this.endDate = end_date;
    this.isRunning = is_running;
    this.userPercentage = user_percentage;
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
