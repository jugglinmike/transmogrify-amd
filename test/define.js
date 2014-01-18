var assert = require("./util/assert");
var lib = require("..");
var fs = require("fs");

suite("define", function() {

  var testDirs = fs.readdirSync(__dirname + "/fixtures/define");
  testDirs.filter(function(fileName) {
    return fileName !== "." || fileName !== "..";
  }).forEach(function(testDir) {
    test(testDir, function() {
      var input = fs.readFileSync(
        __dirname + "/fixtures/define/" + testDir + "/input.js"
      ).toString();
      var expected = fs.readFileSync(
        __dirname + "/fixtures/define/" + testDir + "/expected.js"
      ).toString();

      assert.astMatch(lib(input), expected);
    });
  });

  test("tautology", function() {
    assert.astMatch(
      lib("(function(a, b) { console.log(a + b); })(1, 3);"),
      "(function(__X13__,   __X0__)  {console.log(__X13__ + __X0__); }) (1,3);"
    );
  });
});

/*
// Anonymous mixed dependencies and CJS.
define(["require", "depA"], function(require, depA) {});

// Named module.
define("name");

suite("Named module values.", function() {
  define('name', {});
  define("name", true);
  define("name", 1234);
  define("name", null);
  define("name", undefined);
});

// Named function.
define(function() {});

// Named function with dependencies
define("name", ["depA"], function(depA) {});

// Named CJS.
define("name", function(require, exports, module) {});

// Named mixed dependencies and CJS.

define("name", ["require", "depA"], function(require, depA) {});
*/
