const utils = require("../utils");

function RequireTransformer(transform) {
  this.transform = transform;

  // Shadow properties from the passed in transform object.
  this.args = transform.args;
  this.node = transform.node;
  this.context = transform.context;
}

/**
 * Empty `require` calls are empty function invocations, so it is safe to
 * remove them completely from the output.
 */
RequireTransformer.prototype.noArguments = function() {
  this.node.update("");
};

RequireTransformer.prototype.singleArgument = function() {
  var argVal = this.args[0].value;

  // Valid identifier type for single requires.
  if (argVal) {
    this.node.update(this.context.lookup(argVal));
  }

  // Ignore configurations and `require([])` for now.
  else {
    this.node.update("");
  }
};

RequireTransformer.prototype.multipleArguments = function() {
  var arg = this.args[0];
  var arg1 = this.args[1];
  var params = arg1 ? arg1.params : null;
  var context = this.context;

  // If the first argument is a configuration object, skip it and slice the
  // args and re-run this method.
  if (arg.type === "ObjectExpression") {
    // TODO Handle configurations.
    // handleConfigurationObject(args[0]);
    var transformer = new RequireTransformer(this.transform);
    transformer.args = transformer.args.slice(1);

    return transformer.multipleArguments();
  }

  // Handle single 
  if (this.args.length === 1) {
    new RequireTransformer(this.transform).singleArgument();
  }

  // The most common code path.
  else if (arg.type === "ArrayExpression") {
    var norml = arg.elements.reduce(function(memo, current, index) {
      memo.mapArgs.push(context.lookup(current.value));
      memo.paramArgs.push(params && params[index] ? params[index].name : null);

      return memo;
    }, {
      mapArgs: [],
      paramArgs: []
    });

    var minLength = Math.min(this.args.length, params.length);

    norml.mapArgs.length = minLength;
    norml.paramArgs.length = minLength;

    this.node.update([
      "(function(" + norml.paramArgs.join(", ") + ")",
        arg1.body.source(),
      ")(" + norml.mapArgs.join(", ") + ")"
    ].join("\n"));
  }
};

module.exports = RequireTransformer;
