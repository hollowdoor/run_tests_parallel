import { spawn } from 'child_process';
import tapMerge from 'tap-merge';
import through from 'through2';
import killProc from './lib/kill_proc.js';
import cleanup from './lib/cleanup.js';
import getOptions from './lib/get_options.js';
import os from 'os';
const cpuMax = os.cpus().length;


export default function rtp(scripts, {
    argv = [],
    tap = false,
    commandOpts = {},
    onError = null,
    failFast = true
} = {}){

    let startCount = scripts.length < cpuMax
    ? scripts.length : cpuMax;
    let options = getOptions(commandOpts);
    let queue = [];
    let stdout = through(), stderr = through();
    let childError = false;

    let io = {
        stdout, stderr,
        print(){
            this.stdout.pipe(process.stdout);
            this.stderr.pipe(process.stderr);
        }
    };

    if(tap){
        let tm = tapMerge();
        tm.pipe(stdout);
        //Change the internal writable
        stdout = tm;
    }

    cleanup({queue});

    function run(){

        if(
            !scripts.length //Sanity check.
            || childError
            || queue.length === cpuMax
        ) return;

        let script = scripts.shift();
        let index = queue.length;

        let c = spawn('node', [script].concat(argv), options);

        queue.push({
            complete: false,
            stdout: [],
            stderr: [],
            child: c,
            set index(v){
                index = v;
            }
        });

        if(scripts.length){
            //Some scripts remain
            c.on('exit', code=>{
                run();
            });
        }

        c.stdout.on('data', data=>{
            queue[index].stdout.push(data);
        });

        c.stdout.on('finish', a=>{
            queue[index].complete = true;

            while(queue.length){
                //Write as many as possible
                if(queue[0].complete){
                    let output = queue.shift();
                    for(let i=0; i<output.stdout.length; i++){
                        stdout.write(output.stdout[i]);
                    }

                    output = null;

                    if(!scripts.length && !queue.length){
                        stdout.end();
                    }

                    queue.forEach((item, i)=>{
                        item.index = i;
                    });

                }else{
                    //Some output might be available so
                    while(queue[0].stdout.length){
                        stdout.write(queue[0].stdout.shift());
                    }
                    break;
                }
            }
        });

        c.stderr.on('data', data=>{
            queue[index].stderr.push(data);
        });

        c.stderr.on('finish', a=>{
            if(queue[index] && queue[index].stderr.length){

                queue[index].complete = true;
                childError = true;

                let error = new Error(
                    'child process error (PID # '+c.pid+'): \n'+
                    output
                );

                if(typeof onError === 'function'){
                    return onError(error);
                }

                if(failFast){
                    let output = queue[index].stderr.join('');
                    scripts = [];
                    //Throw an error instead of calling process.exit()
                    //This allows the event queue of the main process to run out
                    throw error;
                }else{
                    error = null;
                    let output = queue.splice(index, 1);
                    while(output.stderr.length){
                        stderr.write(output.stderr.shift());
                    }
                    queue.forEach((item, i)=>{
                        item.index = i;
                    });
                }
            }
        });
    }

    for(let i=0; i<startCount; i++){
        run();
    }

    return io;
};
