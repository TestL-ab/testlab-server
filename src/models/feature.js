const Feature = class {
  constructor(obj) {
    this.id = obj.id;
    this.type_id = obj.type_id;
    this.name = obj.name;

    this.start_date = obj.start_date;
    this.end_date = obj.end_date;
    this.is_running = obj.is_running;
    this.user_percentage = Number(obj.user_percentage);
    this.hypothesis = obj.hypothesis
    this.variant_arr = obj.variant_arr || [];
  }
};

const Variant = class {
  constructor(obj) {
    this.id = obj.id;
    this.value = obj.value;
    this.experiment_id = obj.experiment_id;
    this.is_control = obj.is_control;
    this.weight = obj.weight;
  }
};

export { Feature, Variant };
