exports.isString = function(val) {
  return String(val) === val;
};

exports.inlineDefine = function(identifier, value) {
  return identifier + " = " + value;
};
