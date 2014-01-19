exports.isString = function(val) {
  return String(val) === val;
};

exports.once = function(callback) {
  var called = false;

  return function() {
    if (!called) {
      callback.apply(this, arguments);
      called = true;
    }
  };
};
