var parse = require("esprima").parse;
var assert = require("chai").assert;

var bindAst = require("./bind-ast");

assert.astMatch = function(actualSrc, expectedSrc) {
  var actualAst = parse(actualSrc);
  var expectedAst = parse(expectedSrc);

  bindAst(actualAst, expectedAst, /__AMDCLEAN\d+__/);

  try {
    assert.deepEqual(actualAst, expectedAst);
  } catch(err) {
    if (process.env.AMDCLEAN_STRINGS) {
      assert.equal(actualSrc, expectedSrc);
    } else {
      throw err;
    }
  }
};

module.exports = assert;
