var compareAst = require("compare-ast");
var assert = require("chai").assert;

assert.astMatch = function(actualSrc, expectedSrc) {

  compareAst(actualSrc, expectedSrc, {
    varPattern: /__UNBOUND\d+__/,
    stringPattern: /__STRING\d+__/
  });
};

module.exports = assert;
