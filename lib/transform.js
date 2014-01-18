var falafel = require("falafel");
var count = 0;

// Use the named identifier or generate an anonymous id.
function generateIdentifier(id) {
  return "var __DEFINE_" + (count++) + "__";
}

function inlineDefine(identifier, value) {
  return [
    // Set start identifier.
    identifier,

    // Equals?
    " = ",

    value
  ].join("");
}

//
// This method is only ever useful if the syntax is pure define CJS:
//
//   define(function(require, exports, module) {});
//
// Not so useful when you have mixed CJS properties within arguments:
//
//   define(["require", "modA"], function(require, modA) {});
//
function wrapCJS(arguments, contents) {
  var apply = ["null", "module.exports", "module"];

  var args = arguments.reduce(function(memo, current, index) {
    // Use the provided value.
    memo["stringMap"].push(current.name);
    memo["stringApply"].push(apply[index]);

    return memo;
  }, {
    stringMap: [],
    stringApply: []
  });

  return [
    "(function() {",
      "var module = { exports: {} };",
      
      "(function(", args.stringMap.join(", "), ") ",
        contents,
      ")(", args.stringApply.join(", "), ");",

      "return module.exports;",
    "})()"
  ].join("");
}

// This handles basically every other case.
function wrapAMD(arguments, contents, params) {
  var apply = {
    exports: "module.exports",
    module: "module"
  };

  var isCjs = false;

  var args = arguments.reduce(function(memo, current, index) {
    // Use the provided value or parameter name from the function.
    memo["stringMap"].push(params ? params[index].name : current.value);

    // If `module` or `exports` put into CJS-mode.
    if (current.value === "module" || current.value === "exports") {
      isCjs = true;
    }

    if (current.value in apply) {
      memo["stringApply"].push(apply[current.value]);
    }
    else if (current.value === "require") {
      memo["stringApply"].push("null");
    }
    else {
      memo["stringApply"].push(current.value);
    }

    return memo;
  }, {
    stringMap: [],
    stringApply: []
  });

  return isCjs ? [
    "(function() {",
      "var module = { exports: {} };",
      
      "var retVal = (function(", args.stringMap.join(", "), ") ",
        contents,
      ")(", args.stringApply.join(", "), ");",

      "return retVal || module.exports",
    "})()"
  ].join("") : [
    "(function(", args.stringMap.join(", "), ")",
      contents,
    ")(", args.stringApply.join(", "), ")"
  ].join("");
}

function isString(val) {
  return String(val) === val;
}

function handleSingleDependency(arguments, node, name) {
  // If the first argument is a function, handle it differently from all
  // other values.
  if (arguments[0].type === "FunctionExpression") {
    var params = arguments[0].params;

    // If the first argument we hit is `require` then we are now CJS.
    if (params.length && params[0].name === "require") {
      node.update(inlineDefine(generateIdentifier(name),
        wrapCJS(params, arguments[0].body.source())));
    }
    // TODO REFACTOR THIS MR RUBBER BURNER
    else {
      node.update(inlineDefine(generateIdentifier(name), 
        "(" + arguments[0].source() + ")()"));
    }
  }

  // Special case empty named defines.
  else if (isString(arguments[0].value)) {
    node.update(inlineDefine(generateIdentifier(name || arguments[0].value), 
      "undefined"));
  }

  else {
    node.update(inlineDefine(generateIdentifier(name), 
      "(function() { return " + arguments[0].source() + "; })()"));
  }
}

function handleManyDependencies(args, node, name) {
  // If the first argument is a String, it's a module identifier.
  if (isString(args[0].value)) {
    if (args.length === 2) {
      handleSingleDependency(args.slice(1), node, name || args[0].value);
    }
    // If the first argument is a String, 
    else if (isString(args[0].value) && args.length > 2) {
      handleManyDependencies(args.slice(1), node, name || args[0].value);
    }
  }

  // If the first argument is an array, it's dependencies.
  else if (args[0].type === "ArrayExpression") {
    node.update(inlineDefine(generateIdentifier(name),
      wrapAMD(args[0].elements, args[1].body.source(), args[1].params)));
  }
}

module.exports = function(str) {

  var output = falafel(str,

  function(node) {
    var args = node.arguments;

    // Operate on `define` invocations.
    if (node.type === "CallExpression" && node.callee.name === "define") {
      // Multiple argument defines.  Based on what the first argument is,
      // determines the rest of the pattern.
      if (args.length > 1) {
        handleManyDependencies(args, node);
      }

      // Single argument defines.
      if (args.length === 1) {
        handleSingleDependency(node.arguments, node);
      }

      // Zero argument defines, just return undefined.
      if (args.length === 0) {
        node.update(inlineDefine(generateIdentifier(), "undefined"));
      }
    }
  });

  return String(output);
};
