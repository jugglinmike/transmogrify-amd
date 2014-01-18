# CleanAMD

## Running tests

Unit tests can be invoked from the command line via:

    $ npm test

Failures will generate a graphical diff of the parsed ASTs. These failure
reports may contain too much noise to be useful; in these cases, you can
configure the test runner to report string diffs of the generated code (note
that this may also contain more information than is relevant):

    $ CLEANAMD_STRINGS=1 npm test
