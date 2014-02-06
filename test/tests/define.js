var assert = require("../util/assert");
var lib = require("../..");
var fs = require("fs");

suite("define", function() {

  var fixturesDir = __dirname + "/../fixtures/define/";
  var testDirs = fs.readdirSync(fixturesDir);

  // Register the given identifer.
  lib.defaultContext.register("moduleA");
  lib.defaultContext.register("module-a");

  testDirs.filter(function(fileName) {
    return fileName !== "." || fileName !== "..";
  }).forEach(function(testDir) {
    suite(testDir, function() {
      var expected = fs.readFileSync(
        fixturesDir + testDir + "/expected.js"
      ).toString();

      test("anonymous module", function() {
        var inputAnon = fs.readFileSync(
          fixturesDir + testDir + "/input-anon.js"
        ).toString();

        assert.astMatch(lib.clean(inputAnon), expected);
      });

      test("named module", function() {
        var inputNamed = fs.readFileSync(
          fixturesDir + testDir + "/input-named.js"
        ).toString();

        assert.astMatch(lib.clean(inputNamed), expected);
      });
    });
  });

});
