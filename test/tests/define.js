var assert = require("../util/assert");
var lib = require("../..");
var fs = require("fs");

suite("define", function() {

  var fixturesDir = __dirname + "/../fixtures/define/";
  var testDirs = fs.readdirSync(fixturesDir);
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

        assert.astMatch(lib(inputAnon), expected);
      });

      test("named module", function() {
        var inputNamed = fs.readFileSync(
          fixturesDir + testDir + "/input-named.js"
        ).toString();

        assert.astMatch(lib(inputNamed), expected);
      });
    });
  });

  test("tautology", function() {
    assert.astMatch(
      lib("(function(a, b) { console.log(a + b); })(1, 3);"),
      "(function(__AMDCLEAN0__,   __AMDCLEAN1__)  {" +
        "console.log(__AMDCLEAN0__ + __AMDCLEAN1__);    " +
        "}) (1,3);"
    );
  });
});
