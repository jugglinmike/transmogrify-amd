# AMDClean

## Running tests

Unit tests can be invoked from the command line via:

    $ npm test

Tests assert expectations over JavaScript ASTs. The expected ASTs include
"fuzzy" identifier names of the pattern `__AMDCLEAN{number}__` in order to
avoid hard-coding internal concerns.

## License

Copyright (c) 2014 Tim Branyen & Mike Pennisi  
Licensed under the MIT license.
