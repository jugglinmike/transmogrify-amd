const Parser = require("./parser");
const Transform = require("./transform");
const Context = require("./context");
//const utils = require("./utils");

const DefineTransformer = require("./transformers/define");
const RequireTransformer = require("./transformers/require");

// Register internal transformers.
Transform.registerTransformer("define", DefineTransformer);
Transform.registerTransformer("require", RequireTransformer);

var defaultContext = new Context();

/*
var primeContextWithShim = utils.once(function(shimConfiguration) {
  Object.keys(shimConfiguration || {}).forEach(function(key) {
    defaultContext.register(key, "window." + shimConfiguration[key].exports);
  });
});
*/

// Proxy the useful `registerTransformer` method so that others may extend
// this library without forking.
exports.registerTransformer = Transform.registerTransformer.bind(Transform);

exports.clean = function(source) {
  var ast = new Parser(source, defaultContext).parse();
  return String(ast);
};

/*
exports.rjs = function(config, source, context) {
  // Only call this once, since it's a cache primer.
  primeContextWithShim(config.shim);

  // Prime the context with the shim configuration.
  var retval = transform(String(source), context || defaultContext);

  return retval;
};
*/
