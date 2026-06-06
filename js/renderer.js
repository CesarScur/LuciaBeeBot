/* ============================================================
   RENDERER
   ============================================================ */
function createRenderer(gridEl, queueEl, countEl) {
    let beeEl = null;
    let beeWrap = null;

    function init() {
        // Remove existing bee
        const old = gridEl.querySelector('.bee-container');
        if (old) old.remove();
        // Create bee
        beeEl = document.createElement('div');
        beeEl.className = 'bee-container';
        beeEl.setAttribute('aria-label', 'BeeBot');
        beeWrap = document.createElement('div');
        beeWrap.className = 'bee-svg-wrap';
        beeWrap.appendChild(createBeeSVG());
        beeEl.appendChild(beeWrap);
        gridEl.style.position = 'relative';
        gridEl.appendChild(beeEl);
    }

    function placeBee(state) {
        if (!beeEl) init();
        const cellSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size'));
        beeEl.style.left = (state.x * cellSize) + 'px';
        beeEl.style.top = (state.y * cellSize) + 'px';
        beeWrap.style.transform = `rotate(${DIR_ROTATION[state.dir]}deg)`;
    }

    function beeBounce() {
        beeEl.classList.remove('bounce');
        void beeEl.offsetWidth;
        beeEl.classList.add('bounce');
        beeEl.addEventListener('animationend', () => beeEl.classList.remove('bounce'), {once: true});
    }

    function beeError() {
        beeEl.classList.remove('error-shake');
        void beeEl.offsetWidth;
        beeEl.classList.add('error-shake');
        beeEl.addEventListener('animationend', () => beeEl.classList.remove('error-shake'), {once: true});
    }

    function clearCellHighlights() {
        gridEl.querySelectorAll('.cell').forEach(c => {
            c.classList.remove('occupied', 'trail', 'collected');
        });
    }

    function markTrail(x, y) {
        const c = getCell(gridEl, x, y);
        if (c) c.classList.add('trail');
    }

    function markOccupied(x, y) {
        gridEl.querySelectorAll('.cell.occupied').forEach(c => c.classList.remove('occupied'));
        const c = getCell(gridEl, x, y);
        if (c) c.classList.add('occupied');
    }

    function renderObstacles(obstacles) {
        obstacles.forEach(o => {
            const c = getCell(gridEl, o.x, o.y);
            if (c) {
                c.classList.add('obstacle');
                if (!c.querySelector('.grid-item')) {
                    const it = document.createElement('div');
                    it.className = 'grid-item';
                    it.textContent = '🧱';
                    it.style.fontSize = '1.4rem';
                    c.appendChild(it);
                }
            }
        });
    }

    function renderTarget(tx, ty) {
        const c = getCell(gridEl, tx, ty);
        if (c) {
            c.classList.add('target');
            if (!c.querySelector('.grid-item')) {
                const it = document.createElement('div');
                it.className = 'grid-item target-item';
                it.textContent = '🌸';
                it.style.fontSize = '1.6rem';
                c.appendChild(it);
            }
        }
    }

    function renderFlowers(flowers) {
        flowers.forEach(f => {
            const c = getCell(gridEl, f.x, f.y);
            if (c && !c.dataset.flower) {
                c.dataset.flower = '1';
                const it = document.createElement('div');
                it.className = 'grid-item';
                it.textContent = '🌼';
                it.style.fontSize = '1.4rem';
                it.dataset.fx = f.x;
                it.dataset.fy = f.y;
                c.appendChild(it);
            }
        });
    }

    function collectFlower(x, y) {
        const c = getCell(gridEl, x, y);
        if (!c) return;
        const it = c.querySelector('.grid-item');
        if (it) {
            it.textContent = '✅';
            setTimeout(() => { it.style.opacity = '0.4'; }, 300);
        }
        c.classList.add('collected');
        delete c.dataset.flower;
    }

    function clearLevel() {
        gridEl.querySelectorAll('.cell').forEach(c => {
            c.classList.remove('obstacle','target','trail','occupied','collected');
            const items = c.querySelectorAll('.grid-item');
            items.forEach(i => i.remove());
            delete c.dataset.flower;
        });
    }

    function renderQueue(cmds, activeIdx = -1, onRemove = null) {
        if (!queueEl) return;
        const CMD_CONF = {
            FORWARD:  {icon:'⬆', cls:'fwd', label:'Avançar'},
            BACKWARD: {icon:'⬇', cls:'bwd', label:'Voltar'},
            LEFT:     {icon:'↺', cls:'lft', label:'Esquerda'},
            RIGHT:    {icon:'↻', cls:'rgt', label:'Direita'},
            PAUSE:    {icon:'⏸', cls:'pse', label:'Pausa'},
        };
        const canRemove = typeof onRemove === 'function' && activeIdx < 0;
        queueEl.innerHTML = '';
        cmds.forEach((cmd, i) => {
            const conf = CMD_CONF[cmd] || {icon:'?',cls:'pse',label:cmd};
            const el = document.createElement('div');
            el.className = `q-cmd ${conf.cls}${i === activeIdx ? ' active' : ''}${i < activeIdx ? ' done' : ''}`;
            el.setAttribute('role','listitem');
            el.setAttribute('aria-label', conf.label);
            el.innerHTML = `<span class="q-cmd-icon">${conf.icon}</span><span class="q-cmd-label">${conf.label}</span>`;
            if (canRemove) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'q-cmd-remove';
                btn.setAttribute('aria-label', `Remover ${conf.label}`);
                btn.textContent = '✕';
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    onRemove(i);
                });
                el.appendChild(btn);
            }
            queueEl.appendChild(el);
        });
        if (countEl) countEl.textContent = `${cmds.length} / 200 comandos`;
        // Scroll active into view
        const activeEl = queueEl.querySelector('.active');
        if (activeEl) activeEl.scrollIntoView({block:'nearest',behavior:'smooth'});
    }

    return { init, placeBee, beeBounce, beeError, clearCellHighlights, markTrail, markOccupied, renderObstacles, renderTarget, renderFlowers, collectFlower, clearLevel, renderQueue };
}
