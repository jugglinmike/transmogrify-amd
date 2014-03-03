const isString = require("../utils/is-string");
const indent = require("../utils/indent");

function DefineTransformer(transform) {
  this.transform = transform;

  // By default the module is anonymous.
  this.moduleName = null;

  // Shadow properties from the passed in transform object.
  this.args = transform.args;
  this.node = transform.node;
  this.context = transform.context;
}

/**
 * Define a new module with an anonymous identfier requested from the context
 * or use the one provided on the instance.
 */
DefineTransformer.prototype.defineModule = function(value) {
  var identifier = this.moduleName || this.context.requestIdentifier();
  this.context.register(this.moduleName, identifier);
  return this.context.writeIdentifier(identifier) + " = " + value;
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
DefineTransformer.prototype.wrapCJS = function(params, contents) {
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

DefineTransformer.prototype.wrapAMD = function(args, contents, params, ident) {
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
  }.bind(this), {
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
DefineTransformer.prototype.noArguments = function() {
  var undefinedModule = this.defineModule("undefined");
  this.node.update(undefinedModule);
};

DefineTransformer.prototype.singleArgument = function() {
  // Cache the first argument for easier typing.
  var arg = this.args[0];
  var source = "";

  // If the first argument is a function, handle it differently from all other
  // values.
  if (arg.type === "FunctionExpression") {
    var params = arg.params;

    // If the first argument we hit is `require` then we are now CJS.
    if (params.length && params[0].name === "require") {
      source = this.wrapCJS(params, arg.body.source());
      this.node.update(this.defineModule(source));
    }

    // Otherwise we can assume it's a single AMD define.
    else {
      source = "(" + arg.source() + ")()";
      this.node.update(this.defineModule(source));
    }
  }

  // Special case empty named defines.
  else if (isString(arg.value)) {
    // Use the existing name or fall back to the value in the argument.
    this.moduleName = this.moduleName || arg.value;
    this.node.update(this.defineModule("undefined"));
  }

  else {
    this.node.update(this.defineModule(arg.source()));
  }
};

DefineTransformer.prototype.multipleArguments = function() {
  var arg = this.args[0];
  var arg1 = this.args[1];
  var transformer;

  // If the first argument is a String, it's a module identifier.
  if (isString(arg.value)) {
    if (this.args.length === 2) {
      transformer = new DefineTransformer(this.transform);
      transformer.args = transformer.args.slice(1);
      transformer.moduleName = this.moduleName || arg.value;

      // Run the single argument.
      transformer.singleArgument();
    }

    // If the first argument is a String,
    else if (isString(arg.value) && this.args.length > 2) {
      transformer = new DefineTransformer(this.transform);
      transformer.args = transformer.args.slice(1);
      transformer.moduleName = this.moduleName || arg.value;

      // Run the single argument.
      transformer.multipleArguments();
    }
  }

  // If the first argument is an array, it's dependencies.
  else if (arg.type === "ArrayExpression") {
    var source;

    // If dealing with a function we'll need to update the parameters.
    if (arg1.body) {
      source = this.wrapAMD(arg.elements, arg1.body.source(), arg1.params);
    }

    // Literal values can be inlined.
    else {
      source = this.wrapAMD(arg.elements, arg1.source(), arg.elements, true);
    }

    this.node.update(this.defineModule(source));
  }
};

module.exports = DefineTransformer;
