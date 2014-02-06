/**
 * Represents a Context.
 * @constructor
 *
 * @param {String} name is an optional prefix for identifier generation.
 * @param {String} namespace is an optional object to attach identifiers to.
 * @param {Boolean} compat generates valid ES3 code.
 */
function Context(name, namespace, compat) {
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

  /**
   * Toggles whether or not valid ES3 identifiers are enforced.  Defaults to
   * false, as all modern browsers support ES5.
   * @api public
   *
   * TODO: Test this option
   */
  this.compat = compat || false;
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
  var identifier = this._cache[moduleName];
  if (identifier === undefined) {
    throw new Error("Unrecognized module name: '" + moduleName + "'");
  }
  return identifier;
};

/**
 * Request a valid randomized JavaScript identifier.
 *
 * @return {String} A valid line of JavaScript to identify the module.
 */
Context.prototype.requestIdentifier = function() {
  // Lead in and out with `__` to make it known that this identifier is used
  // internally.  Uppercase to stand out.
  var identifier = [
    "__", this.name || "define", "_", this._counter++, "__"
  ].join("").toUpperCase();

  // Return the valid declaration.
  return identifier;
};

/**
 * Writes an equivalent `define` definition using a namespace.  Will attempt
 * to use dot-notation whenever possible and fall back on hash notation.
 *
 * @param {String} identifier associated with the `moduleName`.
 * @param {String} prefix that can be optionally specified for namespacing.
 * @return {String} definition that is valid JS.
 * @api public
 */
Context.prototype.writeIdentifier = function(identifier, prefix) {
  // Use either the passed in prefix, the current namespace, or default to
  // using the `window` object.
  prefix = prefix || this.namespace || "window";

  // List of unavailable words.
  var reservedWords = [
    "implements", "interface", "let", "package", "private", "protected",
    "public", "static", "yield", "class", "enum", "export", "extends",
    "import", "super", "abstract", "boolean", "byte", "char", "class", "const",
    "debugger", "double", "enum", "export", "extends", "final", "float",
    "goto", "implements", "import", "int", "interface", "long", "native",
    "package", "private", "protected", "public", "short", "static", "super",
    "synchronized", "throws", "transient", "volatile"
  ];

  // Allow all non-ascii characters as valid JS identifiers.
  var validIdentifier = /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/;

  // If generating valid ES3 code and if the identifier is a reserved keyword,
  // use hash notation.
  if (this.compat && reservedWords.indexOf(identifier) > -1) {
    return prefix + "['" + identifier + "']";
  }

  // If the identifier does not match a valid strict subset of the possible
  // spectrum, play safe and wrap in quotes.
  else if (!validIdentifier.test(identifier)) {
    return prefix + "['" + identifier + "']";
  }

  // If the identifier is valid, use dot notation.
  return prefix + "." + identifier;
};

/**
 * Associates a `moduleName` with replacement `identifier` that will be used
 * during transformation.  If the `identifier` is not provided, will default
 * to using the `moduleName`.
 *
 * Examples:
 *
 *     context.register("lodash", "window._");
 *
 * @param {String} moduleName that represents the current module.
 * @param {String} identifier that will be used during substitution.
 * @param {String} prefix that can be optionally specified for namespacing.
 * @api public
 */
Context.prototype.register = function(moduleName, identifier, prefix) {
  identifier = identifier || moduleName;

  if (!this._cache.hasOwnProperty(moduleName)) {
    this._cache[moduleName] = this.writeIdentifier(identifier, prefix);
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
