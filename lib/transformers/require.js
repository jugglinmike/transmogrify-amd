function RequireTransformer(transform) {
  if (transform.args.length > 1) {
    multipleArguments(transform);
  }

  // A single argument was passed into the invocation.
  else if (transform.args.length === 1) {
    singleArgument(transform);
  }

  // No arguments were passed into the invocation.
  else {
    noArguments(transform);
  }
}

/**
 * Empty `require` calls are empty function invocations, so it is safe to
 * remove them completely from the output.
 */
var noArguments = function(transform) {
  transform.node.update("");
};

var singleArgument = function(transform) {
  var argVal = transform.args[0].value;

  // Valid identifier type for single requires.
  if (argVal) {
    transform.node.update(transform.context.lookup(argVal));
  }

  // Ignore configurations and `require([])` for now.
  else {
    transform.node.update("");
  }
};

var multipleArguments = function(transform) {
  var arg = transform.args[0];
  var arg1 = transform.args[1];
  var params = arg1 ? arg1.params : null;
  var context = transform.context;

  // If the first argument is a configuration object, skip it and slice the
  // args and re-run this method.
  if (arg.type === "ObjectExpression") {
    // TODO Handle configurations.
    // handleConfigurationObject(args[0]);
    transform.args = transform.args.slice(1);

    return multipleArguments(transform);
  }

  // Handle single 
  if (transform.args.length === 1) {
    singleArgument(transform);
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

    var minLength = Math.min(transform.args.length, params.length);

    norml.mapArgs.length = minLength;
    norml.paramArgs.length = minLength;

    transform.node.update(
      "(function(" + norml.paramArgs.join(", ") + ") " +
        arg1.body.source() +
      ")(" + norml.mapArgs.join(", ") + ")"
    );
  }
};

module.exports = RequireTransformer;
