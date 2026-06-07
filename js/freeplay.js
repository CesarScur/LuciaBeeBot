
/* ============================================================
   FREE PLAY MODULE
   ============================================================ */
(function initFreePlay() {
    const gridEl = document.getElementById('grid-free');
    const queueEl = document.getElementById('queue-free');
    const countEl = document.getElementById('queue-count-free');
    buildGrid(gridEl);

    let beeState = createBeeState();
    const queue = createCommandQueue();
    const renderer = createRenderer(gridEl, queueEl, countEl);
    renderer.init();
    renderer.placeBee(beeState);
    renderer.markOccupied(beeState.x, beeState.y);

    // Replay data
    let replayStates = [];
    let replayIdx = 0;
    let replayRunning = false;

    // Speed
    let speed = 'normal';
    document.querySelectorAll('#view-free .speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#view-free .speed-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            speed = btn.dataset.speed;
            executor.setSpeed(speed);
            AudioManager.click();
        });
    });

    const executor = createExecutor(
        renderer,
        () => beeState,
        (s) => { beeState = s; },
        (x, y) => false,
        () => {
            // Completed
            setStatus('status-free', '🎉', '¡Programa executado com sucesso!', 'success');
            AudioManager.success();
            launchConfetti();
            enableButtons();
            // Show replay
            document.getElementById('replay-bar-free').classList.add('visible');
            document.getElementById('replay-step-info').textContent = `0/${replayStates.length-1} passos`;
            replayIdx = 0;
        },
        (msg) => {
            setStatus('status-free', '🚫', msg, 'error');
            enableButtons();
        },
        null, 8
    );
    executor.setSpeed(speed);

    function disableButtons() {
        document.querySelectorAll('#view-free .cmd-btn').forEach(b => b.disabled = true);
    }
    function enableButtons() {
        document.querySelectorAll('#view-free .cmd-btn').forEach(b => b.disabled = false);
    }

    function refreshQueue(activeIdx = -1) {
        const onRemove = activeIdx < 0 && !executor.isRunning()
            ? (idx) => {
                if (queue.remove(idx)) {
                    AudioManager.click();
                    refreshQueue();
                    setStatus('status-free', '🗑', 'Comando removido.');
                }
            }
            : null;
        renderer.renderQueue(queue.get(), activeIdx, onRemove);
    }

    // Add commands
    document.querySelectorAll('#view-free [data-cmd]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (executor.isRunning()) return;
            const cmd = btn.dataset.cmd;
            if (queue.add(cmd)) {
                AudioManager.click();
                refreshQueue();
                setStatus('status-free', '📝', `Comando "${cmd}" adicionado! Pressione ▶ para executar.`);
            } else {
                setStatus('status-free', '⚠️', 'Limite de 200 comandos atingido!', 'error');
            }
        });
    });

    // Clear
    document.getElementById('btn-clear-free').addEventListener('click', () => {
        if (executor.isRunning()) return;
        queue.clear();
        beeState = createBeeState();
        renderer.clearCellHighlights();
        renderer.placeBee(beeState);
        renderer.markOccupied(beeState.x, beeState.y);
        refreshQueue();
        document.getElementById('replay-bar-free').classList.remove('visible');
        setStatus('status-free', '🐝', 'Programa limpo! Adicione novos comandos.');
        AudioManager.click();
    });

    // Run
    document.getElementById('btn-run-free').addEventListener('click', async () => {
        if (executor.isRunning()) return;
        const cmds = queue.get();
        if (!cmds.length) {
            setStatus('status-free', '⚠️', 'Adicione comandos primeiro!');
            return;
        }
        disableButtons();
        setStatus('status-free', '▶️', 'Executando programa...');
        document.getElementById('replay-bar-free').classList.remove('visible');

        // Reset bee
        beeState = createBeeState();
        renderer.clearCellHighlights();
        renderer.placeBee(beeState);
        renderer.markOccupied(beeState.x, beeState.y);

        // Capture replay states
        replayStates = [{...beeState}];

        // Override setState to capture
        const origSetState = executor._setState;
        const stateHistory = [{...beeState}];
        const patchedExecutor = createExecutor(
            renderer,
            () => beeState,
            (s) => {
                beeState = s;
                stateHistory.push({...s});
            },
            (x,y) => false,
            () => {
                replayStates = stateHistory;
                setStatus('status-free', '🎉', 'Programa executado com sucesso!', 'success');
                AudioManager.success();
                launchConfetti();
                enableButtons();
                document.getElementById('replay-bar-free').classList.add('visible');
                document.getElementById('replay-step-info').textContent = `0/${replayStates.length-1} passos`;
                replayIdx = 0;
            },
            (msg) => {
                setStatus('status-free', '🚫', msg, 'error');
                enableButtons();
            },
            null, 8
        );
        patchedExecutor.setSpeed(speed);
        await patchedExecutor.run(cmds, i => renderer.renderQueue(cmds, i));
        refreshQueue();
    });

    // Replay controls
    document.getElementById('btn-replay-restart').addEventListener('click', () => {
        replayIdx = 0;
        if (!replayStates.length) return;
        beeState = {...replayStates[0]};
        renderer.clearCellHighlights();
        renderer.placeBee(beeState);
        renderer.markOccupied(beeState.x, beeState.y);
        document.getElementById('replay-step-info').textContent = `0/${replayStates.length-1} passos`;
        AudioManager.click();
    });

    document.getElementById('btn-replay-step').addEventListener('click', () => {
        if (!replayStates.length || replayIdx >= replayStates.length - 1) return;
        replayIdx++;
        beeState = {...replayStates[replayIdx]};
        renderer.markTrail(replayStates[replayIdx-1].x, replayStates[replayIdx-1].y);
        renderer.placeBee(beeState);
        renderer.markOccupied(beeState.x, beeState.y);
        document.getElementById('replay-step-info').textContent = `${replayIdx}/${replayStates.length-1} passos`;
        AudioManager.move();
    });

    document.getElementById('btn-replay-play').addEventListener('click', async () => {
        if (replayRunning || !replayStates.length) return;
        replayRunning = true;
        replayIdx = 0;
        beeState = {...replayStates[0]};
        renderer.clearCellHighlights();
        renderer.placeBee(beeState);
        for (let i = 1; i < replayStates.length; i++) {
            await new Promise(r => setTimeout(r, SPEED_MAP[speed]));
            renderer.markTrail(replayStates[i-1].x, replayStates[i-1].y);
            beeState = {...replayStates[i]};
            renderer.placeBee(beeState);
            renderer.markOccupied(beeState.x, beeState.y);
            replayIdx = i;
            document.getElementById('replay-step-info').textContent = `${i}/${replayStates.length-1} passos`;
        }
        replayRunning = false;
    });

    // Export
    document.getElementById('btn-export-free').addEventListener('click', () => {
        const json = JSON.stringify({ commands: queue.get() }, null, 2);
        const ta = document.getElementById('io-textarea');
        ta.value = json;
        ta.readOnly = true;
        document.getElementById('io-modal-title').textContent = '📤 Exportar Programa';
        document.getElementById('io-confirm-btn').textContent = '📋 Copiar';
        document.getElementById('io-confirm-btn').onclick = () => {
            navigator.clipboard.writeText(json).catch(() => {});
            closeIOModal();
        };
        openIOModal();
    });

    // Import
    document.getElementById('btn-import-free').addEventListener('click', () => {
        const ta = document.getElementById('io-textarea');
        ta.value = '';
        ta.readOnly = false;
        document.getElementById('io-modal-title').textContent = '📥 Importar Programa (JSON)';
        document.getElementById('io-confirm-btn').textContent = '✅ Importar';
        document.getElementById('io-confirm-btn').onclick = () => {
            try {
                const data = JSON.parse(ta.value);
                if (data.commands && Array.isArray(data.commands)) {
                    queue.clear();
                    queue.set(data.commands);
                    refreshQueue();
                    setStatus('status-free', '📥', 'Programa importado com sucesso!');
                    closeIOModal();
                } else throw new Error();
            } catch { alert('JSON inválido! Verifique o formato.'); }
        };
        openIOModal();
    });

    // Keyboard
    document.addEventListener('keydown', e => {
        if (document.getElementById('view-free').classList.contains('active') && !executor.isRunning()) {
            const map = { KeyW:'FORWARD', KeyS:'BACKWARD', KeyA:'LEFT', KeyD:'RIGHT', Space:'PAUSE', Enter:'RUN', Escape:'CLEAR' };
            const action = map[e.code];
            if (!action) return;
            e.preventDefault();
            if (action === 'RUN') document.getElementById('btn-run-free').click();
            else if (action === 'CLEAR') document.getElementById('btn-clear-free').click();
            else if (queue.add(action)) {
                AudioManager.click();
                refreshQueue();
            }
        }
    });

    // Persistence
    function saveProgress() {
        try {
            localStorage.setItem('beebot_free_queue', JSON.stringify(queue.get()));
        } catch(e) {}
    }
    function loadProgress() {
        try {
            const saved = localStorage.getItem('beebot_free_queue');
            if (saved) {
                const data = JSON.parse(saved);
                if (Array.isArray(data)) {
                    queue.set(data);
                    refreshQueue();
                }
            }
        } catch(e) {}
    }
    loadProgress();
    // Save on queue change
    const origAdd = queue.add.bind(queue);
    // Observe changes via setInterval (simple approach)
    setInterval(saveProgress, 2000);

    document.addEventListener('beebot:resize', () => {
        if (!document.getElementById('view-free').classList.contains('active')) return;
        renderer.placeBee(beeState);
    });
})();

