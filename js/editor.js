
/* ============================================================
   EDITOR MODULE
   ============================================================ */
(function initEditor() {
    const gridEl = document.getElementById('grid-editor');
    buildGrid(gridEl);

    let activeTool = 'start';
    let editorData = {
        start: {x:0, y:7, dir:'EAST'},
        target: null,
        flowers: [],
        obstacles: []
    };

    // Tool buttons
    const tools = {
        'tool-start': 'start',
        'tool-flower': 'flower',
        'tool-obstacle': 'obstacle',
        'tool-erase': 'erase',
        'tool-target': 'target'
    };
    Object.entries(tools).forEach(([id, tool]) => {
        document.getElementById(id).addEventListener('click', () => {
            activeTool = tool;
            document.querySelectorAll('.tool-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            document.getElementById(id).classList.add('active');
            document.getElementById(id).setAttribute('aria-pressed', 'true');
            AudioManager.click();
        });
    });

    function renderEditorGrid() {
        // Clear items
        gridEl.querySelectorAll('.grid-item').forEach(i => i.remove());
        gridEl.querySelectorAll('.cell').forEach(c => {
            c.classList.remove('obstacle','target','trail');
        });

        // Render obstacles
        editorData.obstacles.forEach(o => {
            const c = getCell(gridEl, o.x, o.y);
            if (c) {
                c.classList.add('obstacle');
                const it = document.createElement('div');
                it.className = 'grid-item';
                it.textContent = '🧱';
                c.appendChild(it);
            }
        });

        // Render flowers
        editorData.flowers.forEach(f => {
            const c = getCell(gridEl, f.x, f.y);
            if (c) {
                const it = document.createElement('div');
                it.className = 'grid-item';
                it.textContent = '🌸';
                c.appendChild(it);
            }
        });

        // Render target
        if (editorData.target) {
            const c = getCell(gridEl, editorData.target.x, editorData.target.y);
            if (c) {
                c.classList.add('target');
                const it = document.createElement('div');
                it.className = 'grid-item target-item';
                it.textContent = '🎯';
                c.appendChild(it);
            }
        }

        // Render start (bee placeholder)
        if (editorData.start) {
            const c = getCell(gridEl, editorData.start.x, editorData.start.y);
            if (c) {
                const it = document.createElement('div');
                it.className = 'grid-item';
                it.textContent = '🐝';
                c.appendChild(it);
            }
        }
    }

    gridEl.addEventListener('click', e => {
        const cell = e.target.closest('.cell');
        if (!cell) return;
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        AudioManager.click();

        if (activeTool === 'start') {
            editorData.start = {x, y, dir:'EAST'};
        } else if (activeTool === 'flower') {
            if (!editorData.flowers.some(f => f.x===x && f.y===y))
                editorData.flowers.push({x, y});
        } else if (activeTool === 'obstacle') {
            if (!editorData.obstacles.some(o => o.x===x && o.y===y))
                editorData.obstacles.push({x, y});
        } else if (activeTool === 'target') {
            editorData.target = {x, y};
        } else if (activeTool === 'erase') {
            editorData.flowers = editorData.flowers.filter(f => !(f.x===x && f.y===y));
            editorData.obstacles = editorData.obstacles.filter(o => !(o.x===x && o.y===y));
            if (editorData.target && editorData.target.x===x && editorData.target.y===y) editorData.target = null;
        }
        renderEditorGrid();
    });

    document.getElementById('btn-editor-clear').addEventListener('click', () => {
        editorData = { start:{x:0,y:7,dir:'EAST'}, target:null, flowers:[], obstacles:[] };
        renderEditorGrid();
        AudioManager.click();
    });

    function renderSavedLevels() {
        const list = document.getElementById('saved-levels-list');
        const custom = getCustomLevels();
        list.innerHTML = '';
        if (!custom.length) {
            list.innerHTML = '<p style="font-size:0.8rem;color:#9E9E9E;font-weight:600;">Nenhuma fase salva ainda.</p>';
            return;
        }
        custom.forEach((level, i) => {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:6px 8px;background:#F5F5F5;border-radius:8px;';
            row.innerHTML = `
        <span style="flex:1;font-size:0.82rem;font-weight:700;">${level.name || 'Fase Personalizada'}</span>
        <button onclick="loadEditorLevel(${i})" style="padding:4px 8px;border:none;background:var(--blue);color:white;border-radius:6px;font-size:0.75rem;font-weight:700;cursor:pointer;">✏️</button>
        <button onclick="deleteEditorLevel(${i})" style="padding:4px 8px;border:none;background:var(--red);color:white;border-radius:6px;font-size:0.75rem;font-weight:700;cursor:pointer;">🗑</button>
      `;
            list.appendChild(row);
        });
    }

    window.loadEditorLevel = function(idx) {
        const custom = getCustomLevels();
        if (!custom[idx]) return;
        const level = custom[idx];
        editorData = {
            start: level.start || {x:0,y:7,dir:'EAST'},
            target: level.target || null,
            flowers: level.flowers || [],
            obstacles: level.obstacles || []
        };
        document.getElementById('editor-level-name').value = level.name || '';
        document.getElementById('editor-level-desc').value = level.desc || '';
        renderEditorGrid();
        AudioManager.click();
    };

    window.deleteEditorLevel = function(idx) {
        const custom = getCustomLevels();
        custom.splice(idx, 1);
        saveCustomLevels(custom);
        renderSavedLevels();
        if (window._challengeReloadLevels) window._challengeReloadLevels();
        AudioManager.click();
    };

    document.getElementById('btn-editor-save').addEventListener('click', () => {
        if (!editorData.target) {
            alert('Adicione um objetivo (🎯) na fase antes de salvar!');
            return;
        }
        const name = document.getElementById('editor-level-name').value || 'Fase Personalizada';
        const desc = document.getElementById('editor-level-desc').value || 'Fase criada no editor!';
        const custom = getCustomLevels();
        const newLevel = {
            id: Date.now(),
            name,
            desc,
            start: editorData.start,
            target: editorData.target,
            flowers: editorData.flowers,
            obstacles: editorData.obstacles
        };
        custom.push(newLevel);
        saveCustomLevels(custom);
        renderSavedLevels();
        if (window._challengeReloadLevels) window._challengeReloadLevels();
        AudioManager.success();
        setStatus('status-free', '💾', `Fase "${name}" salva com sucesso!`);
    });

    document.getElementById('btn-editor-play').addEventListener('click', () => {
        if (!editorData.target) {
            alert('Adicione um objetivo (🎯) antes de testar!');
            return;
        }
        const name = document.getElementById('editor-level-name').value || 'Teste do Editor';
        const desc = document.getElementById('editor-level-desc').value || '🧪 Testando fase do editor!';
        window._challengeSkipPickerOnce = true;
        document.getElementById('tab-challenge').click();
        if (window._challengeLoadTempLevel) {
            window._challengeLoadTempLevel({
                name,
                desc,
                start: editorData.start,
                target: editorData.target,
                flowers: [...editorData.flowers],
                obstacles: [...editorData.obstacles]
            });
        }
        AudioManager.click();
    });

    renderEditorGrid();
    renderSavedLevels();
})();

