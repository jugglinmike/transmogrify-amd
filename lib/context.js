var cache = {};

exports._cache = cache;

exports.register = function(identifier, id) {
  if (!cache[identifier]) {
    cache[identifier] = id;
  }
};

exports.lookup = function(identifier) {
  return cache[identifier] || "null";
};
