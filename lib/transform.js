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
