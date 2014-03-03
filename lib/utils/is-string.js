/**
 * Determines if the value is a String literal or object.
 *
 * @param {*} value to test.
 * @return {Boolean} indicating if the value is a String.
 */
function isString(value) {
  return String(value) === value;
}

module.exports = isString;
