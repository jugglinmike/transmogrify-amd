# Transmogrify AMD

[![Build Status](https://travis-ci.org/jugglinmike/transmogrify-amd.png)](https://travis-ci.org/jugglinmike/transmogrify-amd)

Thanks to Greg Franko (@gfranko) for inspiring this work with [the "amdclean"
project](https://github.com/gfranko/amdclean)!

## Tests

Unit tests can be invoked from the command line via:

    $ npm test

Tests assert expectations over JavaScript ASTs. The expected ASTs include
"fuzzy" identifier names of the pattern `__UNBOUND{number}__` in order to avoid
hard-coding procedurally-generated identifiers (which are an internal concern).

## Documentation

At the moment there are no pubished resources for API documentation, but fear
not, you can generate the API documentation by running:

    $ npm run jsdoc

Once that completes you can open **docs/index.html** in your browser.

## License

Copyright (c) 2014 Tim Branyen & Mike Pennisi  
Licensed under the MIT license.
