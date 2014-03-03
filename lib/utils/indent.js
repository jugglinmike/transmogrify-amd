/**
 * Takes a String and indents each line the specified amount.
 *
 * @param {String} contents to indent.
 * @param {*} spaces is either a number of spaces to indent or a string value
 *            to indent by.
 * @return {String} indented contents.
 */
function indent(contents, spaces) {
  var lines = contents.split("\n");

  // Allow the number of spaces to be specified.
  if (typeof spaces === "number") {
    spaces = Array(spaces + 1).join(" ");
  }

  return lines.map(function(line) {
    // If the line is an empty string, simply return it, otherwise indent.
    return line ? spaces + line : line;
  }).join("\n");
}

module.exports = indent;
