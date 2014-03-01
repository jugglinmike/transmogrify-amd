var assert = require("../util/assert");
var Context = require("../..").Context;
var clean = require("../..").clean;
var fs = require("fs");

suite("require", function() {

  var fixturesDir = __dirname + "/../fixtures/require/";
  var testDirs = fs.readdirSync(fixturesDir);
  var context = new Context();

  // Register the given identifer.
  context.register("moduleA");
  context.register("module-a");

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

      assert.astMatch(clean(input, context), expected);
    });
  });
});
