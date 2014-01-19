var parse = require("esprima").parse;
var assert = require("chai").assert;

var bindAst = require("./bind-ast");

assert.astMatch = function(actualSrc, expectedSrc) {
  var actualAst = parse(actualSrc).body;
  var expectedAst = parse(expectedSrc).body;

  bindAst(actualAst, expectedAst, /__UNBOUND\d+__/);

  try {
    assert.deepEqual(actualAst, expectedAst, "This is a message");
  } catch(astError) {
    // When ASTs do not match, compare ASTs with the original source so the
    // generated error report contains diffs of both.
    assert.deepEqual({
      ast: actualAst,
      source: actualSrc
    }, {
      ast: expectedAst,
      source: expectedSrc
    });
  }
};

module.exports = assert;
