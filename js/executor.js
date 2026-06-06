/* ============================================================
   EXECUTOR
   ============================================================ */
const SPEED_MAP = { slow: 1000, normal: 500, fast: 250 };

function createExecutor(renderer, getState, setState, isObstacle, onComplete, onError, onCollect, gridSize = 8) {
    let running = false;
    let cancelled = false;
    let speed = 'normal';
    let trail = [];

    function setSpeed(s) { speed = s; }
    function isRunning() { return running; }

    function sleep(ms) {
        return new Promise(r => {
            const tid = setTimeout(r, ms);
            // Will be resolved even if cancelled (commands just checked after)
        });
    }

    async function run(cmds, activeCallback) {
        if (running) return;
        running = true;
        cancelled = false;
        trail = [];

        for (let i = 0; i < cmds.length; i++) {
            if (cancelled) break;
            const cmd = cmds[i];
            if (activeCallback) activeCallback(i);
            const state = getState();

            if (cmd === 'FORWARD' || cmd === 'BACKWARD') {
                const delta = cmd === 'FORWARD' ? DIR_DELTA[state.dir] : DIR_DELTA[OPPOSITE[state.dir]];
                const nx = state.x + delta.dx;
                const ny = state.y + delta.dy;
                if (nx < 0 || ny < 0 || nx >= gridSize || ny >= gridSize) {
                    // Collision with boundary
                    AudioManager.error();
                    renderer.beeError();
                    if (activeCallback) activeCallback(i);
                    await sleep(600);
                    onError('Ops! A BeeBot não pode sair do tabuleiro. 🚧');
                    cancelled = true;
                    break;
                }
                if (isObstacle(nx, ny)) {
                    AudioManager.error();
                    renderer.beeError();
                    await sleep(600);
                    onError('Ops! A BeeBot bateu em um obstáculo! 🧱');
                    cancelled = true;
                    break;
                }
                trail.push({x: state.x, y: state.y});
                setState({...state, x: nx, y: ny});
                renderer.markTrail(state.x, state.y);
                renderer.markOccupied(nx, ny);
                renderer.placeBee(getState());
                renderer.beeBounce();
                AudioManager.move();
                // Check collect
                if (onCollect) onCollect(nx, ny);
                await sleep(SPEED_MAP[speed]);

            } else if (cmd === 'LEFT') {
                const idx = DIRECTIONS.indexOf(state.dir);
                const newDir = DIRECTIONS[(idx + 3) % 4];
                setState({...state, dir: newDir});
                renderer.placeBee(getState());
                AudioManager.turn();
                await sleep(SPEED_MAP[speed] * 0.8);

            } else if (cmd === 'RIGHT') {
                const idx = DIRECTIONS.indexOf(state.dir);
                const newDir = DIRECTIONS[(idx + 1) % 4];
                setState({...state, dir: newDir});
                renderer.placeBee(getState());
                AudioManager.turn();
                await sleep(SPEED_MAP[speed] * 0.8);

            } else if (cmd === 'PAUSE') {
                AudioManager.pause_snd();
                await sleep(1000);
            }
        }

        running = false;
        if (!cancelled) {
            onComplete();
        }
    }

    function cancel() { cancelled = true; running = false; }

    return { run, cancel, isRunning, setSpeed };
}
