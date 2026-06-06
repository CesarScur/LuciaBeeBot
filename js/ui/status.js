/* ============================================================
   STATUS BAR HELPER
   ============================================================ */
function setStatus(barId, icon, text, type = '') {
    const bar = document.getElementById(barId);
    bar.className = 'status-bar' + (type ? ' ' + type : '');
    bar.querySelector('.status-icon').textContent = icon;
    bar.querySelector('.status-text').textContent = text;
}