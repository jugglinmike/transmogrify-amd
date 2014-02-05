const Parser = require("./parser");
const Transform = require("./transform");
const Context = require("./context");

// Load internal transformers.
const DefineTransformer = require("./transformers/define");
const RequireTransformer = require("./transformers/require");

// Register internal transformers.
Transform.registerTransformer("define", DefineTransformer);
Transform.registerTransformer("require", RequireTransformer);

// A context is always required, this is the fallback if one is not provided
// to the API.
var defaultContext = new Context();

// Expose the default context;
exports.defaultContext = defaultContext;

// Export the `Context` module as it's useful to create your own.
exports.Context = Context;

// Proxy the useful `registerTransformer` method so that others may extend
// this library without forking.
exports.registerTransformer = Transform.registerTransformer.bind(Transform);

// Export a single entry function to facilitate converting a source file into
// a namespaced file.
exports.clean = function(source, context) {
  var ast = new Parser(source, context || defaultContext).parse();
  return ast.toString();
};
