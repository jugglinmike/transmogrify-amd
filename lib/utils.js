exports.isString = function(val) {
  return String(val) === val;
};

exports.inlineDefine = function(identifier, value) {
  return identifier + " = " + value;
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
