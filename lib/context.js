/**
 * Represents a Context.
 * @constructor
 *
 * @param {String} name is an optional prefix for identifier generation.
 * @param {String} namespace is an optional object to attach identifiers to.
 */
function Context(name, namespace) {
  /** 
   * Internal cache for `moduleName` => `identifier`.
   * @api private
   * */
  this._cache = {};

  /**
   * Internal counter for identifier uniqueness.
   * @api private
   */
  this._counter = 0;

  /**
   * Allows naming segregation from other contexts.
   * @api public
   */
  this.name = name;

  /**
   * Allows identifiers to be attached to any object.
   * @api public
   */
  this.namespace = namespace;
}

/**
 * Return cached `identifier` for a given `moduleName`.  Used during
 * transformation substitution.
 *
 * Examples:
 *
 *     context.lookup("lodash");
 *
 *     // Will return the associated identifier.
 *     => "window._"
 *
 * @param {String} moduleName that represents the current module.
 * @return {String} identifier associated with the `moduleName`.
 * @api public
 */
Context.prototype.lookup = function(moduleName) {
  // If a namespace was specified, end with a dot for proper concatenation.
  // Otherwise opt for using a `var` declaration.
  var prefix = this.namespace ? this.namespace + "." : "";
    
  return prefix + this._cache[moduleName] || "null";
};

/**
 * Request a valid JavaScript identifier for a given `moduleName`.
 *
 * @param {String} moduleName that represents the current module.
 * @return {String} A valid line of JavaScript to identify the module.
 */
Context.prototype.requestIdentifier = function(moduleName) {
  // If a namespace was specified, end with a dot for proper concatenation.
  // Otherwise opt for using a `var` declaration.
  var prefix = this.namespace ? this.namespace + "." : "var ";

  // Lead in and out with `__` to make it known that this identifier is used
  // internally.  Uppercase to stand out.
  var identifier = [
    "__", this.name || "define", "_", this._counter++, "__"
  ].join("").toUpperCase();

  // Register into this context.
  this.register(moduleName, identifier);
  
  // Return the valid declaration.
  return prefix + identifier;
};

/**
 * Associates a `moduleName` with replacement `identifier` that will be used
 * during transformation.
 *
 * Examples:
 *
 *     context.register("lodash", "window._");
 *
 * @param {String} moduleName that represents the current module.
 * @param {String} identifier that will be used during substitution.
 * @api public
 */
Context.prototype.register = function(moduleName, identifier) {
  if (!this._cache.hasOwnProperty(moduleName)) {
    this._cache[moduleName] = identifier;
  }
};

/**
 * Removes given `moduleName` from the cache registration.
 *
 * Examples:
 *
 *     context.unregister("lodash");
 *
 * @param {String} moduleName that represents the current module.
 * @api public
 */
Context.prototype.unregister = function(moduleName) {
  delete this._cache[moduleName];
};

module.exports = Context;
