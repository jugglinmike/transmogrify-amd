const utils = require("./utils");

function handleSingleRequire(args, node, context) {
  var identifier = args[0].value;

  // Valid identifier type for single requires.
  if (utils.isString(identifier)) {
    node.update(context.lookup(identifier));
  }

  // Ignore configurations and `require([])` for now.
  else {
    node.update("");
  }
}

function handleMultipleRequire(args, node, context) {
  var params = args[1].params;

  // If the first argument is a configuration object, skip it and slice the
  // args and re-run this method.
  if (args[0].type === "ObjectExpression") {
    // TODO Handle configurations.
    // handleConfigurationObject(args[0]);
    return handleMultipleRequire(args.slice(1), node);
  }

  // Handle single 
  if (args.length === 1) {
    return handleSingleRequire(args, node);
  }

  // The most common code path.
  else if (args[0].type === "ArrayExpression") {
    var norml = args[0].elements.reduce(function(memo, current, index) {
      memo.mapArgs.push(context.lookup(current.value));
      memo.paramArgs.push(params && params[index] ? params[index].name : null);

      return memo;
    }, {
      mapArgs: [],
      paramArgs: []
    });

    var minLength = Math.min(args.length, params.length);

    norml.mapArgs.length = minLength;
    norml.paramArgs.length = minLength;

    node.update("(function(" + norml.paramArgs.join(", ") + ")" + args[1].body.source() + ")(" + norml.mapArgs.join(", ") + ")");
  }
}

function Transform(node, args, context) {
  this.node = node;
  this.args = args;
  this.context = context;
}

/**
 * Cache all registered transformers.
 * @api private
 */
Transform._transformers = {};

/**
 * Register a given transformer with a name that corresponds to the function
 * name and the constructor that will be initialized and conforms to the
 * methods expected below.
 */
Transform.registerTransformer = function(name, constructor) {
  this._transformers[name] = constructor;
};

/**
 * Transform the function based on the rules defined in the registered
 * transformer.
 *
 * @param {String} functionName is the name of the function to transform.
 */
Transform.prototype.modify = function(functionName) {
  // Include the transformer that matches this specific function call.
  var Transformer = Transform._transformers[functionName];
    
  // Multiple arguments have been passed into the invocation.
  if (this.args.length > 1) {
    new Transformer(this).multipleArguments();
  }

  // A single argument was passed into the invocation.
  else if (this.args.length === 1) {
    new Transformer(this).singleArgument();
  }

  // No arguments were passed into the invocation.
  else {
    new Transformer(this).noArguments();
  }
};

module.exports = Transform;
