/* ============================================================
   GRID BUILDER
   ============================================================ */
function buildGrid(gridEl, size = 8) {
    gridEl.innerHTML = '';
    gridEl.style.setProperty('--grid-size', size);
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = col;
            cell.dataset.y = row;
            cell.setAttribute('role', 'gridcell');
            cell.setAttribute('aria-label', `Célula ${col},${row}`);
            const coords = document.createElement('span');
            coords.className = 'cell-coords';
            coords.textContent = `${col},${row}`;
            cell.appendChild(coords);
            gridEl.appendChild(cell);
        }
    }
}

function getCell(gridEl, x, y) {
    return gridEl.querySelector(`[data-x="${x}"][data-y="${y}"]`);
}