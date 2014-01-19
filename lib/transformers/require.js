function RequireTransformer(transform) {
  this.transform = transform;

  // Shadow properties from the passed in transform object.
  this.args = transform.args;
  this.node = transform.node;
  this.context = transform.context;
}

/**
 * Empty `require` calls are empty function invocations, so it is safe to
 * remove them completely from the output.
 */
RequireTransformer.prototype.noArguments = function() {
  this.node.update("");
};

module.exports = RequireTransformer;
