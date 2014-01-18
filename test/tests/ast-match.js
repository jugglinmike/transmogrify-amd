var assert = require("../util/assert");

suite("astMatch", function() {
  test("variable binding", function() {
    assert.astMatch(
      "(function(a, b) { console.log(a + b); })(1, 3);",
      "(function(__AMDCLEAN0__,   __AMDCLEAN1__)  {" +
        "console.log(__AMDCLEAN0__ + __AMDCLEAN1__);    " +
      "}) (1,3);"
    );
  });

  test("lax IIFE parenthesis placement", function() {
    assert.astMatch(
      "(function() {}());",
      "(function() {})();"
    );
  });

  suite("expected failures", function() {
    var astMatchFail = function(inputSrc, expectedSrc) {
      assert.throws(function() {
        assert.astMatch(inputSrc, expectedSrc);
      });
    };

    test("name change", function() {
      astMatchFail("(function(a) {});", "(function(b) {});");
    });

    test("double binding", function() {
      astMatchFail(
        "(function(a, b) { console.log(a); });",
        "(function(__AMDCLEAN0__, __AMDCLEAN1__) { console.log(__AMDCLEAN1__); });"
      );
    });
  });
});
