import cp from 'child_process';
//http://krasimirtsonev.com/blog/article/Nodejs-managing-child-processes-starting-stopping-exec-spawn
export default function killProc(proc, signal){
    let pid = proc.pid;
    signal = signal || 'SIGKILL';

    const getKill = reject=>{
        if(!/^win/.test(process.platform)){
            return tpid => {
                try{ process.kill(tpid, signal); }
                catch(e){}
            };
        }

        return tpid => {
            cp.exec('taskkill /PID ' + tpid + ' /T /F', reject);
        };
    };

    return new Promise((resolve, reject)=>{
        psTree(pid, (err, children) => {
            if(err) return reject(err);

            [pid].concat(children.map(p => p.PID))
            .forEach(getKill(reject));
            setTimeout(resolve, 1);
        });
    });
}
