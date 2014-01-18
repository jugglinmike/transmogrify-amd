var falafel = require("falafel");
var assert = require("chai").assert;

var bindAst = require("./bind-ast");

assert.astMatch = function(actualSrc, expectedSrc) {
  var actualAst;
  var expectedAst;

  // falafel preforms a pre-traversal walk, so the final node will be the
  // complete AST.
  falafel(actualSrc, false, function(node) {
    actualAst = node;
  });
  falafel(expectedSrc, false, function(node) {
    expectedAst = node;
  });

  bindAst(actualAst, expectedAst, {
    removeAttrs: ["line", "col", "pos"],
    varPattern: /__AMDCLEAN\d+__/
  });

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
