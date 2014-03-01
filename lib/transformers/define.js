const isString = require("../utils/is-string");
const indent = require("../utils/indent");

function transformDefine(transform) {
  // By default the module is anonymous.
  transform.moduleName = null;

  if (transform.args.length > 1) {
    multipleArguments(transform);
  }

  // A single argument was passed into the invocation.
  else if (transform.args.length === 1) {
    singleArgument(transform);
  }

  // No arguments were passed into the invocation.
  else {
    noArguments(transform);
  }
}

/**
 * Define a new module with an anonymous identfier requested from the context
 * or use the one provided on the instance.
 */
var defineModule = function(transform, value) {
  var identifier = transform.moduleName || transform.context.requestIdentifier();
  transform.context.register(transform.moduleName, identifier);
  return transform.context.writeIdentifier(identifier) + " = " + value;
};

/**
 * This method is only ever useful if the syntax is pure define CJS:
 *
 *   define(function(require, exports, module) {});
 *
 * Not so useful when you have mixed CJS properties within arguments:
 *
 *   define(["require", "modA"], function(require, modA) {});
 */
var wrapCJS = function(params, contents) {
  var apply = ["null", "module.exports", "module"];

  var norml = params.reduce(function(memo, current, index) {
    // Use the provided value.
    memo.stringMap.push(current.name);
    memo.stringApply.push(apply[index]);

    return memo;
  }, {
    stringMap: [],
    stringApply: []
  });

  return [
    "(function() {",
    "  var module = { exports: {} };",
    "",
    "  (function(" + norml.stringMap.join(", ") + ") " +
        indent(contents, 2).trim() +
    ").call(module.exports, " + norml.stringApply.join(", ") + ");",
    "",
    "  return module.exports;",
    "})()"
  ].join("\n");
};

var wrapAMD = function(transform, args, contents, params, ident) {
  var apply = {
    exports: "module.exports",
    module: "module"
  };

  var isCjs = false;

  var norml = args.reduce(function(memo, current, index) {
    // Use the provided value or parameter name from the function.
    memo.stringMap.push(params && params[index] ? params[index].name : current.value);

    // If `module` or `exports` put into CJS-mode.
    if (current.value === "module" || current.value === "exports") {
      isCjs = true;
    }

    if (current.value in apply) {
      memo.stringApply.push(apply[current.value]);
    }
    else if (current.value === "require") {
      memo.stringApply.push("null");
    }
    else {
      memo.stringApply.push(this.context.lookup(current.value));
    }

    return memo;
  }.bind(transform), {
    stringMap: [],
    stringApply: []
  });

  // This might be hacky.
  var minLength = Math.min(args.length, params.length);

  norml.stringMap.length = minLength;
  norml.stringApply.length = minLength;

  var output;

  if (isCjs) {
    output = [
      "(function() {",
      "  var module = { exports: {} };",
      "",
      "  var retVal = (function(" + norml.stringMap.join(", ") + ") " +
      contents + ").call(module.exports, " + norml.stringApply.join(", ") + ");",
      "",
      "  return retVal || module.exports",
      "})()"
    ].join("\n");
  }
  else if (ident) {
    output = contents + "(" + norml.stringApply.join(", ") + ")";
  }
  else {
    output = "(function(" + norml.stringMap.join(", ") + ")" + contents +
      ")(" + norml.stringApply.join(", ") + ")";
  }

  return output;
};

/**
 * Define calls that do not contain arguments are assumed to be undefined
 * modules.
 */
var noArguments = function(transform) {
  var undefinedModule = defineModule(transform, "undefined");
  transform.node.update(undefinedModule);
};

var singleArgument = function(transform) {
  // Cache the first argument for easier typing.
  var arg = transform.args[0];
  var source = "";

  // If the first argument is a function, handle it differently from all other
  // values.
  if (arg.type === "FunctionExpression") {
    var params = arg.params;

    // If the first argument we hit is `require` then we are now CJS.
    if (params.length && params[0].name === "require") {
      source = wrapCJS(params, arg.body.source());
      transform.node.update(defineModule(transform, source));
    }

    // Otherwise we can assume it's a single AMD define.
    else {
      source = "(" + arg.source() + ")()";
      transform.node.update(defineModule(transform, source));
    }
  }

  // Special case empty named defines.
  else if (isString(arg.value)) {
    // Use the existing name or fall back to the value in the argument.
    transform.moduleName = transform.moduleName || arg.value;
    transform.node.update(defineModule(transform, "undefined"));
  }

  else {
    transform.node.update(defineModule(transform, arg.source()));
  }
};

var multipleArguments = function(transform) {
  var arg = transform.args[0];
  var arg1 = transform.args[1];

  // If the first argument is a String, it's a module identifier.
  if (isString(arg.value)) {
    if (transform.args.length === 2) {
      transform.args = transform.args.slice(1);
      transform.moduleName = transform.moduleName || arg.value;

      // Run the single argument.
      singleArgument(transform);
    }

    // If the first argument is a String,
    else if (transform.args.length > 2) {
      transform.args = transform.args.slice(1);
      transform.moduleName = transform.moduleName || arg.value;

      // Run the single argument.
      multipleArguments(transform);
    }
  }

  // If the first argument is an array, it's dependencies.
  else if (arg.type === "ArrayExpression") {
    var source;

    // If dealing with a function we'll need to update the parameters.
    if (arg1.body) {
      source = wrapAMD(transform, arg.elements, arg1.body.source(), arg1.params);
    }

    // Literal values can be inlined.
    else {
      source = wrapAMD(transform, arg.elements, arg1.source(), arg.elements, true);
    }

    transform.node.update(defineModule(transform, source));
  }
};

module.exports = transformDefine;
