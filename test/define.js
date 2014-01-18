var burrito = require("burrito");
var assert = require("chai").assert;
var observableDiff = require("deep-diff").observableDiff;
var lib = require("..");

suite("define", function() {
  suite("Anonymous modules", function() {

    test("Anonymous module", function() {
      assert.equal(
        lib("define();"),
        ""
      );
    });

    suite("literal values", function() {
      test("object literal", function() {
        assert.equal(
          "define({});",
          "var __DEFINE__0__ = (function() { return {}; })();"
        );
      });

      test("boolean literal", function() {
        assert.equal(
          lib("define(true);"),
          "var __DEFINE__0__ = (function() { return true; })()"
        );
      });

      test("number literal", function() {
        assert.equal(
          lib("define(1234);"),
          "var __DEFINE__0__ = (function() { return 1234; })()"
        );
      });

      test("null", function() {
        assert.equal(
          lib("define(null);"),
          "var __DEFINE__0__ = (function() { return null; })()"
        );
      });

      test("undefined", function() {
        assert.equal(
          lib("define(undefined);"),
          "var __DEFINE__0__ = (function() { return undefined; })()"
        );
      });
    });

function clean(val) {
  if (Object(val) !== val) {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map(clean);
  }
  for (attr in val) {
    if (attr === "line" || attr === "col" || attr === "pos") {
      delete val[attr];
    } else {
      val[attr] = clean(val[attr]);
    }
  }
  return val;
}
assert.astMatch = function(actualSrc, expectedSrc) {
  var actualAst = clean(burrito.parse(actualSrc, false, true));
  var expectedAst = clean(burrito.parse(expectedSrc, false, true));

  /*bind(actualAst, expectedAst, {
    ignoreAttrs: [],
    varPattern: /__X\d+__/
  });*/

  assert.deepEqual(actualAst, expectedAst);
};

    suite("functions", function() {
      test.only("without dependencies", function() {
        assert.astMatch(
          lib("(function(a, b) { console.log(a + b); })(1, 3);"),
          "(function(a,   __X0__)  {console.log(a + __X0__); }) (1,   3);"
        );
        //assert.equal(
        //  lib("define(function() {});"),
        //  "var __DEFINE__0__ = (function() {})();"
        //);
      });

      test("with AMD dependencies", function() {
        assert.equal(
          lib("define(['depA'], function(depA) {});"),
          "var __DEFINE__0__ = (function(depA) {})(depA);"
        );
      });

      test("with CJS dependencies", function() {
        var expected = [
          "(function() {",
            "var module = { exports: {} };",
            "(function(require, exports, module) {",
              "/* content */",
            "})(null, module.exports, module);",
          "});"
        ].join("");

        assert.equal(
          lib("define(function(require, exports, module) { /* content */ });"),
          expected
        );
      });
    });
  });

/*
  // Anonymous mixed dependencies and CJS.
  define(["require", "depA"], function(require, depA) {});

  // Named module.
  define("name");

  suite("Named module values.", function() {

    test("object literal", function() {
      assert.equal(
        lib("define('name', {});"),
        "var name = {};"
      );
    });


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
});
