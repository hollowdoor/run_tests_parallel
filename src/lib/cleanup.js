import killProc from './kill_proc.js';

export default function cleanup(
    {queue = []} = {}
){
    function ifEnd(event){
        process.on(event, () => {
            queue.forEach(item=>{
                //Make sure all children are killed.
                killProc(item.child, event);
                //How child processes could be killed
                //item.child.kill(event);
            });
            scripts = [];
        });
    }

    ['SIGINT', 'SIGTERM'].forEach(ifEnd);
}
