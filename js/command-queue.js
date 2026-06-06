/* ============================================================
   COMMAND QUEUE MODULE
   ============================================================ */
function createCommandQueue() {
    let cmds = [];
    const MAX = 200;
    return {
        add(cmd) {
            if (cmds.length >= MAX) return false;
            cmds.push(cmd);
            return true;
        },
        clear() { cmds = []; },
        remove(index) {
            if (index < 0 || index >= cmds.length) return false;
            cmds.splice(index, 1);
            return true;
        },
        get() { return [...cmds]; },
        size() { return cmds.length; },
        set(arr) { cmds = arr.slice(0, MAX); }
    };
}