var assert = require("../util/assert");
var lib = require("../..");
var fs = require("fs");

suite("require", function() {

  var fixturesDir = __dirname + "/../fixtures/require/";
  var testDirs = fs.readdirSync(fixturesDir);

  // Register the given identifer.
  lib.defaultContext.register("moduleA");
  lib.defaultContext.register("module-a");

  testDirs.filter(function(fileName) {
    return fileName !== "." || fileName !== "..";
  }).forEach(function(testDir) {
    test(testDir, function() {
      var input = fs.readFileSync(
        fixturesDir + testDir + "/input.js"
      ).toString();
      var expected = fs.readFileSync(
        fixturesDir + testDir + "/expected.js"
      ).toString();

      assert.astMatch(lib.clean(input), expected);
    });
  });
});
