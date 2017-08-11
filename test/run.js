let rtp = require('../');

let streams = rtp([1, 2, 3, 4, 5, 6].map(n=>'script'+n+'.js'), {
    tap: true
});

//streams.stdout.pipe(process.stdout);
//streams.stderr.pipe(process.stderr);

streams.print();
