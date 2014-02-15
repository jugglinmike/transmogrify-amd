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

exports.indent = function(contents, spaces) {
  var lines = contents.split("\n");

  lines = lines.map(function(line) {
    if (line) {
      return Array(spaces + 1).join(" ") + line;
    }

    else {
      return "";
    }
  });

  return lines.join("\n");
};
