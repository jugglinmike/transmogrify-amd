var transform = require("./transform");
var context = require("./context");
var utils = require("./utils");

var primeContextWithShim = utils.once(function(shimConfiguration) {
  Object.keys(shimConfiguration || {}).forEach(function(key) {
    context.register(key, "window." + shimConfiguration[key].exports);
  });
});

exports.clean = function(source) {
  return transform(String(source));
};

exports.rjs = function(config, source) {
  // Only call this once, since it's a cache primer.
  primeContextWithShim(config.shim);

  // Prime the context with the shim configuration.
  var retval = transform(String(source));

  console.log(context._cache);

  return retval;
};
