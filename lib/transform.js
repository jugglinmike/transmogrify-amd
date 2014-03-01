/**
 * Represents a Transform.
 * @constructor
 *
 * @param {Object} node is an optional prefix for identifier generation.
 * @param {Array} args is an optional object to attach identifiers to.
 * @param {Object} context is an optional object to attach identifiers to.
 */
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
  Transform._transformers[functionName](this);
};

module.exports = Transform;
