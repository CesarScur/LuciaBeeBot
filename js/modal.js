/* ============================================================
   MODAL HELPERS
   ============================================================ */
function showModal(emoji, title, text, buttons) {
    document.getElementById('modal-emoji').textContent = emoji;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-text').textContent = text;
    const btns = document.getElementById('modal-btns');
    btns.innerHTML = '';
    buttons.forEach(b => {
        const btn = document.createElement('button');
        btn.className = `modal-btn ${b.cls || 'mbtn-primary'}`;
        btn.textContent = b.label;
        btn.onclick = () => { closeModal(); b.action && b.action(); };
        btns.appendChild(btn);
    });
    document.getElementById('modal-overlay').classList.add('open');
}
function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }
document.getElementById('modal-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });

/* ============================================================
   IO MODAL
   ============================================================ */
function openIOModal() { document.getElementById('io-modal').classList.add('open'); }
function closeIOModal() { document.getElementById('io-modal').classList.remove('open'); }
document.getElementById('io-cancel-btn').addEventListener('click', closeIOModal);
document.getElementById('io-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeIOModal(); });
