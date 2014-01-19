# AMDClean

[![Build Status](https://travis-ci.org/jugglinmike/amdclean.png)](https://travis-ci.org/jugglinmike/amdclean)

## Tests

Unit tests can be invoked from the command line via:

    $ npm test

Tests assert expectations over JavaScript ASTs. The expected ASTs include
"fuzzy" identifier names of the pattern `__UNBOUND{number}__` in order to avoid
hard-coding procedurally-generated identifiers (which are an internal concern).

## License

Copyright (c) 2014 Tim Branyen & Mike Pennisi  
Licensed under the MIT license.
