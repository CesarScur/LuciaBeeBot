
/* ============================================================
   CHALLENGE MODULE
   ============================================================ */
(function initChallenge() {
    const gridEl = document.getElementById('grid-challenge');
    const queueEl = document.getElementById('queue-challenge');
    const countEl = document.getElementById('queue-count-challenge');
    const pickerEl = document.getElementById('challenge-level-picker');
    const gameEl = document.getElementById('challenge-game');
    const levelListEl = document.getElementById('challenge-level-list');
    buildGrid(gridEl);

    let tempLevel = null;

    // Load built-in + custom levels
    function getAllLevels() {
        const custom = getCustomLevels();
        const levels = [...BUILT_IN_LEVELS, ...custom];
        if (tempLevel) levels.push(tempLevel);
        return levels;
    }

    function isBuiltIn(idx) {
        return idx < BUILT_IN_LEVELS.length;
    }

    function isLevelUnlocked(idx) {
        if (!isBuiltIn(idx)) return true;
        if (idx === 0) return true;
        const prev = BUILT_IN_LEVELS[idx - 1];
        return completedLevels.has(prev.id);
    }

    function showLevelPicker() {
        pickerEl.classList.remove('hidden');
        gameEl.classList.remove('active');
        renderLevelList();
    }

    function showChallengeGame() {
        pickerEl.classList.add('hidden');
        gameEl.classList.add('active');
    }

    function renderLevelList() {
        const levels = getAllLevels();
        const builtInCount = BUILT_IN_LEVELS.length;
        const customCount = getCustomLevels().length;
        const totalStars = Object.values(levelStars).reduce((sum, s) => sum + s, 0);

        document.getElementById('picker-total-levels').textContent =
            `📋 ${builtInCount} fase${builtInCount !== 1 ? 's' : ''}` +
            (customCount ? ` + ${customCount} personalizada${customCount !== 1 ? 's' : ''}` : '');
        document.getElementById('picker-completed').textContent =
            `✅ ${completedLevels.size} completa${completedLevels.size !== 1 ? 's' : ''}`;
        document.getElementById('picker-stars-total').textContent = `⭐ ${totalStars} estrela${totalStars !== 1 ? 's' : ''}`;

        levelListEl.innerHTML = '';
        levels.forEach((level, idx) => {
            const isTemp = tempLevel && idx === levels.length - 1;
            const isCustom = !isBuiltIn(idx) && !isTemp;
            const unlocked = isTemp || isLevelUnlocked(idx);
            const completed = completedLevels.has(level.id);
            const stars = levelStars[level.id] || 0;
            const locked = !unlocked;

            const card = document.createElement('div');
            card.className = 'level-card' +
                (completed ? ' completed' : '') +
                (locked ? ' locked' : '') +
                (isCustom || isTemp ? ' custom' : '');
            card.setAttribute('role', 'listitem');

            const displayNum = isBuiltIn(idx) ? idx + 1 : '✏️';
            const starsDisplay = locked ? '🔒' : '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

            card.innerHTML = `
        <div class="level-card-top">
          <div class="level-card-num">${displayNum}</div>
          <div class="level-card-info">
            <div class="level-card-name">${level.name || `Fase ${idx + 1}`}</div>
            <div class="level-card-desc">${level.desc || ''}</div>
          </div>
        </div>
        <div class="level-card-meta">
          <span class="level-card-stars">${starsDisplay}</span>
          ${completed ? '<span class="level-card-badge">✓ Completa</span>' :
                locked ? '<span class="level-card-badge locked-badge">🔒 Bloqueada</span>' : ''}
        </div>
        <button class="level-card-play${completed ? ' done-btn' : ''}" ${locked ? 'disabled' : ''}>
          ${locked ? '🔒 Complete a fase anterior' : completed ? '🔄 Jogar Novamente' : '▶ Jogar'}
        </button>
      `;

            const playBtn = card.querySelector('.level-card-play');
            if (!locked) {
                playBtn.addEventListener('click', () => {
                    AudioManager.click();
                    loadLevel(idx);
                    showChallengeGame();
                });
            }

            levelListEl.appendChild(card);
        });
    }

    let currentLevelIdx = 0;
    let beeState = createBeeState(0, 7, 'EAST');
    const queue = createCommandQueue();
    const renderer = createRenderer(gridEl, queueEl, countEl);
    renderer.init();

    // Progress
    let completedLevels = new Set();
    let levelStars = {};
    try {
        const saved = JSON.parse(localStorage.getItem('beebot_progress') || '{}');
        completedLevels = new Set(saved.completed || []);
        levelStars = saved.stars || {};
    } catch(e) {}

    function saveProgress() {
        try {
            localStorage.setItem('beebot_progress', JSON.stringify({
                completed: [...completedLevels],
                stars: levelStars,
                currentLevel: currentLevelIdx
            }));
        } catch(e) {}
    }

    let collectedFlowers = new Set();
    let levelFlowers = [];

    function loadLevel(idx) {
        const levels = getAllLevels();
        if (idx < 0 || idx >= levels.length) return;
        currentLevelIdx = idx;
        const level = levels[idx];

        queue.clear();
        renderer.clearLevel();
        collectedFlowers = new Set();
        levelFlowers = level.flowers || [];

        beeState = createBeeState(level.start.x, level.start.y, level.start.dir || 'EAST');
        renderer.placeBee(beeState);
        renderer.markOccupied(beeState.x, beeState.y);

        if (level.obstacles) renderer.renderObstacles(level.obstacles);
        if (level.target) renderer.renderTarget(level.target.x, level.target.y);
        if (level.flowers) renderer.renderFlowers(level.flowers);

        // UI
        const isBuiltin = isBuiltIn(idx);
        document.getElementById('challenge-level-badge').textContent = isBuiltin ? `Fase ${idx + 1}` : '✏️ Extra';
        document.getElementById('challenge-level-name').textContent = level.name || '';
        document.getElementById('challenge-desc').textContent = level.desc;
        document.getElementById('btn-prev-level').disabled = idx === 0;
        document.getElementById('btn-next-level').disabled = idx === levels.length - 1;
        const total = completedLevels.size;
        document.getElementById('challenge-progress').textContent = `${total}/${levels.length} completos`;

        const stars = levelStars[level.id] || 0;
        document.getElementById('challenge-stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

        refreshQueue();
        setStatus('status-challenge', '🎯', level.desc);

        try { localStorage.setItem('beebot_current_level', idx); } catch(e) {}
    }

    // Start on level picker
    showLevelPicker();

    document.getElementById('btn-back-phases').addEventListener('click', () => {
        AudioManager.click();
        showLevelPicker();
    });

    document.getElementById('btn-prev-level').addEventListener('click', () => {
        AudioManager.click();
        loadLevel(currentLevelIdx - 1);
    });
    document.getElementById('btn-next-level').addEventListener('click', () => {
        AudioManager.click();
        loadLevel(currentLevelIdx + 1);
    });

    let speed = 'normal';
    document.querySelectorAll('#view-challenge .speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#view-challenge .speed-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            speed = btn.dataset.speed;
            executor.setSpeed(speed);
            AudioManager.click();
        });
    });

    function isObstacle(x, y) {
        const level = getAllLevels()[currentLevelIdx];
        return (level.obstacles || []).some(o => o.x === x && o.y === y);
    }

    function checkCollect(x, y) {
        const key = `${x},${y}`;
        if (collectedFlowers.has(key)) return;
        const flower = levelFlowers.find(f => f.x === x && f.y === y);
        if (flower) {
            collectedFlowers.add(key);
            renderer.collectFlower(x, y);
            AudioManager.collect();
            setStatus('status-challenge', '🌼', `Flor coletada! (${collectedFlowers.size}/${levelFlowers.length})`);
        }
    }

    const executor = createExecutor(
        renderer,
        () => beeState,
        (s) => { beeState = s; },
        isObstacle,
        () => {
            // Check win conditions
            const level = getAllLevels()[currentLevelIdx];
            const atTarget = level.target && beeState.x === level.target.x && beeState.y === level.target.y;
            const allFlowers = levelFlowers.length === 0 || collectedFlowers.size === levelFlowers.length;

            if (atTarget && allFlowers) {
                // Success!
                completedLevels.add(level.id);
                const cmdCount = queue.size();
                const stars = calcStars(level, cmdCount);
                const { three, two } = getStarLimits(level);
                levelStars[level.id] = Math.max(levelStars[level.id] || 0, stars);
                saveProgress();

                AudioManager.success();
                launchConfetti();
                setStatus('status-challenge', '🏆', 'Parabéns! Desafio completado! 🎉', 'success');

                const levels = getAllLevels();
                const hasNext = currentLevelIdx < levels.length - 1;
                showModal('🎉', 'Parabéns!', `Fase completada! ${'⭐'.repeat(stars)} Você usou ${cmdCount} comandos! (3⭐ ≤${three}, 2⭐ ≤${two})`, [
                    hasNext ? {label:'➡ Próxima Fase', cls:'mbtn-green', action: () => { loadLevel(currentLevelIdx + 1); showChallengeGame(); }} : null,
                    {label:'🔄 Jogar Novamente', cls:'mbtn-primary', action: () => loadLevel(currentLevelIdx)},
                    {label:'🗺 Fases', cls:'mbtn-secondary', action: () => showLevelPicker()}
                ].filter(Boolean));
            } else {
                // Not at target
                if (!atTarget) {
                    setStatus('status-challenge', '😅', 'Quase! Chegue até o objetivo!');
                } else {
                    setStatus('status-challenge', '🌼', `Ainda faltam flores! Colete todas (${collectedFlowers.size}/${levelFlowers.length})`);
                }
            }
            enableButtons();
        },
        (msg) => {
            setStatus('status-challenge', '🚫', msg, 'error');
            enableButtons();
        },
        checkCollect,
        8
    );
    executor.setSpeed(speed);

    function disableButtons() {
        document.querySelectorAll('#challenge-btns .cmd-btn').forEach(b => b.disabled = true);
    }
    function enableButtons() {
        document.querySelectorAll('#challenge-btns .cmd-btn').forEach(b => b.disabled = false);
    }

    function refreshQueue(activeIdx = -1) {
        const onRemove = activeIdx < 0 && !executor.isRunning()
            ? (idx) => {
                if (queue.remove(idx)) {
                    AudioManager.click();
                    refreshQueue();
                }
            }
            : null;
        renderer.renderQueue(queue.get(), activeIdx, onRemove);
    }

    // Add commands
    document.querySelectorAll('[data-mode="challenge"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (executor.isRunning()) return;
            const cmd = btn.dataset.cmd;
            if (queue.add(cmd)) {
                AudioManager.click();
                refreshQueue();
            }
        });
    });

    document.getElementById('btn-clear-challenge').addEventListener('click', () => {
        if (executor.isRunning()) return;
        queue.clear();
        loadLevel(currentLevelIdx);
        AudioManager.click();
    });

    document.getElementById('btn-run-challenge').addEventListener('click', async () => {
        if (executor.isRunning()) return;
        const cmds = queue.get();
        if (!cmds.length) {
            setStatus('status-challenge', '⚠️', 'Adicione comandos primeiro!');
            return;
        }
        disableButtons();
        setStatus('status-challenge', '▶️', 'Executando...');

        // Reset bee to start
        const level = getAllLevels()[currentLevelIdx];
        beeState = createBeeState(level.start.x, level.start.y, level.start.dir || 'EAST');
        collectedFlowers = new Set();
        renderer.clearCellHighlights();
        renderer.clearLevel();
        if (level.obstacles) renderer.renderObstacles(level.obstacles);
        if (level.target) renderer.renderTarget(level.target.x, level.target.y);
        if (level.flowers) renderer.renderFlowers(level.flowers);
        renderer.placeBee(beeState);
        renderer.markOccupied(beeState.x, beeState.y);

        await executor.run(cmds, i => renderer.renderQueue(cmds, i));
        refreshQueue();
    });

    // Expose for editor integration
    window._challengeReloadLevels = () => {
        renderLevelList();
        if (gameEl.classList.contains('active')) loadLevel(currentLevelIdx);
    };
    window._challengeShowPicker = showLevelPicker;
    window._challengeSkipPickerOnce = false;
    window._challengeLoadTempLevel = (levelData) => {
        tempLevel = { ...levelData, id: 'temp_' + Date.now() };
        const idx = getAllLevels().length - 1;
        loadLevel(idx);
        showChallengeGame();
    };
    window._challengePlayLevel = (idx) => {
        loadLevel(idx);
        showChallengeGame();
    };

    document.addEventListener('beebot:resize', () => {
        if (!gameEl.classList.contains('active')) return;
        renderer.placeBee(beeState);
    });
})();
