const Parser = require("./parser");
const Transform = require("./transform");
const Context = require("./context");
const utils = require("./utils");

// Load internal transformers.
const DefineTransformer = require("./transformers/define");
const RequireTransformer = require("./transformers/require");

// Register internal transformers.
Transform.registerTransformer("define", DefineTransformer);
Transform.registerTransformer("require", RequireTransformer);

// A context is always required, this is the fallback if one is not provided
// to the API.
var defaultContext = new Context();

// A method that is used to initially prime the context.
var primeContextWithShim = utils.once(function(shimConfiguration, context) {
  Object.keys(shimConfiguration || {}).forEach(function(key) {
    context.register(key, "window." + shimConfiguration[key].exports);
  });
});

// Expose the default context;
exports.defaultContext = defaultContext;

// Export the `Context` module as it's useful to create your own.
exports.Context = Context;

// Proxy the useful `registerTransformer` method so that others may extend
// this library without forking.
exports.registerTransformer = Transform.registerTransformer.bind(Transform);

exports.clean = function(source, context) {
  return Parser(source, context || defaultContext).parse().toString();
};

exports.rjs = function(config, source, context) {
  // This is only called once.
  primeContextWithShim(config.shim, context || defaultContext);

  return new Parser(source, context || defaultContext).parse().toString();
};
