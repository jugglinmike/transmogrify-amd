// Given a "template" expected AST that defines abstract identifier names
// described by `options.varPattern`, "bind" those identifiers to their
// concrete names in the "actual" AST.
module.exports = function(actual, expected, options) {
  var removeAttrs = options.removeAttrs || [];
  var varPattern = options.varPattern;
  // Lookup table of bound variable names
  var boundVars = {};

  function _bind(actual, expected) {
    var attr;

    // Literal values
    if (Object(actual) !== actual) {
      return;
    }

    // Arrays
    if (Array.isArray(actual)) {
      actual.forEach(function(_, i) {
        _bind(actual[i], expected[i]);
      });
      return;
    }

    // Objects

    // Update unbound variable names in the expected AST, using the
    // previously-bound value when available.
    if (actual.type === "Identifier") {
      if (varPattern.test(expected.name)) {
        if (!(expected.name in boundVars)) {
          boundVars[expected.name] = actual.name;
        }
        expected.name = boundVars[expected.name];
      }
    }

    // Either remove attributes or recurse on their values
    for (attr in actual) {
      if (removeAttrs.indexOf(attr) > -1) {
        delete actual[attr];
        delete expected[attr];
      } else if (expected && attr in expected) {
        _bind(actual[attr], expected[attr]);
      }
    }
  }

  // Start recursing on the ASTs from the top level.
  _bind(actual, expected);
};
