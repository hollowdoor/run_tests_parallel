export default function getOptions(opts){

    return Object.assign(
        opts,
        {
            //Preserve I/O options for merging.
            stdio: [
                null,
                null,
                null
            ]
        }
    );
}
