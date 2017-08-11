const rollup = require('rollup');
let pack = require('./package.json');
let external = Object.keys(pack.dependencies);

rollup.rollup({
    entry: 'src/index.js',
    external: external
}).then((bundle)=>{
    return bundle.write({
        dest: 'dist/bundle.js',
        format: 'cjs',
        moduleName: pack.name,
        sourceMap: true
    });
}).catch(e=>console.log(e));
