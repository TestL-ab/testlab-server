const Experiment = class {
  constructor(
    // id,
    // type_id,
    // name,
    // start_date,
    // end_date,
    // is_running,
    // user_percentage,
    // variantArr
    obj
  ) {
    this.id = obj.id;
    this.type_id = obj.type_id;
    this.name = obj.name;

    this.startDate = obj.start_date;
    this.endDate = obj.end_date;
    this.isRunning = obj.is_running;
    this.userPercentage = Number(obj.user_percentage);
    this.variantArr = obj.variantArr || [];
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
