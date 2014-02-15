module.exports = function(contents, spaces) {
  var lines = contents.split("\n");

  lines = lines.map(function(line) {
    if (line) {
      return Array(spaces + 1).join(" ") + line;
    }

    else {
      return "";
    }
  });

  return lines.join("\n");
};
