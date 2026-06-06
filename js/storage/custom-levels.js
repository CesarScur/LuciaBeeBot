/* ============================================================
   CUSTOM LEVELS — localStorage persistence
   ============================================================ */
function getCustomLevels() {
    try { return JSON.parse(localStorage.getItem('beebot_custom_levels') || '[]'); } catch(e) { return []; }
}

function saveCustomLevels(levels) {
    try { localStorage.setItem('beebot_custom_levels', JSON.stringify(levels)); } catch(e) {}
}

window.getCustomLevels = getCustomLevels;
