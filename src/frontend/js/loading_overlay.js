function showLoadingOverlay() {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(188, 211, 225, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            fontSize: '2rem',
            color: '#222',
            fontFamily: 'Arial, sans-serif'
        });
        overlay.innerText = 'Loading...';
        document.body.appendChild(overlay);
    } else {
        overlay.style.display = 'flex';
    }
}
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
}

export { showLoadingOverlay, hideLoadingOverlay }