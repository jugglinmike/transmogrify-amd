# Transmogrify AMD

> Re-write AMD files to synchronously define modules on a global namespace

[![Build Status](https://travis-ci.org/jugglinmike/transmogrify-amd.png)](https://travis-ci.org/jugglinmike/transmogrify-amd)

Thanks to Greg Franko (@gfranko) for inspiring this work with [the "amdclean"
project](https://github.com/gfranko/amdclean)!

## Install

Install using [NPM](http://npmjs.org/):

``` bash 
npm install transmogrify-amd
```

## Example

This is a sample AMD module:

``` javascript
define("moduleA", [], function() {

});
```

Then you would use the following code to convert:

``` javascript
// Get the source and convert to a String.
var source = fs.readFileSync("./the/above/file").toString();

// Pass into the `clean` function, you will receive cleaned source of the file.
require("transmogrify-amd").clean(source);
```

By default, the transmogrification defines all modules on the global scope.

``` javascript
window.moduleA = (function() {

})();
```

## Tests

Unit tests can be invoked from the command line via:

    $ npm test

The tests assert expectations over JavaScript ASTs. See [the "compareAst"
project](https://github.com/jugglinmike/compare-ast) for details.

## Documentation

At the moment there are no pubished resources for API documentation, but fear
not, you can generate the API documentation by running:

    $ npm run jsdoc

Once that completes you can open **docs/index.html** in your browser.

## License

Copyright (c) 2014 Tim Branyen & Mike Pennisi  
Licensed under the MIT license.
