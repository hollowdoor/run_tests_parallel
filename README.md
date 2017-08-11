run-tests-parallel
=================

Install
-------

To add to some other module: `npm install --save run-tests-parallel`

To run tests in a homemade test harness: `npm install --save-dev run-tests-parallel`

Usage
----

While using the `node-tap` module.

`run.js`

```javascript
let rtp = require('run-tests-parallel');
//or es2015 import
//import rtp from 'run-tests-parallel';

rtp(['script1.js', 'script2.js'], {
    tap: true
});
```

`script1.js`

```javascript
let tap = require('tap');

tap.test('Is it ok? 1', t=>{
    t.ok(true);
});
```

`script2.js`

```javascript
let tap = require('tap');

tap.test('Is it ok? 2', t=>{
    t.ok(false);
});
```

The output of running `run.js` above should look something like this:

```
TAP version 13
...truncated for verbosity
# failed 1 test
# time=30.827ms
        function: tap.test.t
      stack: |
        Test.tap.test.t (script2.js:4:7)
        Object.<anonymous> (script2.js:3:5)
      source: |
        t.ok(false);
      ...

    not ok 2 - test unfinished
      ---
      stack: |
        Object.<anonymous> (script2.js:3:5)
      test: bla 2
      at:
        line: 3
        column: 5
        file: script2.js
        function: Object.<anonymous>
      source: |
        tap.test('bla 2', t=>{
      ...

    1..2
    # failed 2 of 2 tests
not ok 2 - bla 2 # time=38.7ms

# failed 1 test
# time=47.011ms

1..2
```

The API
-------

### rtp([scripts,...], options = {})

Run a bunch of test scripts. `rtp()` returns an object with two streams that looks like this:

```javascript
{
    //The stream that gets all the child output
    stdout,
    //The stream that gets all the child error output
    stderr,
    //print() is a convenience function for
    //setting the pipe to standard output
    print(){
        this.stdout.pipe(process.stdout);
        this.stderr.pipe(process.stderr);
    }
}
```

`run-tests-parallel` with all of it's options, and default values.

```javascript
rtp(['script1.js', 'script2.js'], {
    argv: [],
    commandOpts: {
        stdio: [null, null, null]
    },
    tap: false,
    failFast: true,
    onError: null
});
```

### options.argv

An array of cli arguments for all the scripts. The default of `options.argv` is an empty array.

### options.commandOpts

An object that is used as options to the `child_process` `spawn` function that spawns all the scripts.

In `run-tests-parallel` stdio is automatically streamed to the main process io (terminal output). See `options.stdio` next:

### options.stdio

The default of `options.stdio` is true. Set `options.stdio` to false to prevent the automatic stream to `process.stdout`, and `process.stderr`.

### options.tap

Tell `run-tests-parallel` that it should expect TAP output from all the scripts. The default of `options.tap` is false.

### options.failFast

Tell `run-tests-parallel` whether, or not it should make the main process fail when a child process errors out. When `failFast` is set to false the main parent process will keep running even if a child errors out.

### options.onError

`options.onError` will be called when a child process errors out.

If `options.failFast` is set to true `options.onError` will be called before the main process exits.

About
-----

`run-tests-parallel` runs a series of scripts in parallel, and merges the streams of those scripts into a single stream for terminal output.
