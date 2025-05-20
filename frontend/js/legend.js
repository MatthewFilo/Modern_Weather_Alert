document.addEventListener('DOMContentLoaded', function() {
    const legendBtn = document.getElementById('legend-btn');
    const legendDialog = document.getElementById('legend-dialog');
    const closeLegend = document.getElementById('close-legend');

    if (legendBtn && legendDialog && closeLegend) {
        legendBtn.onclick = function() {
            legendDialog.style.display = 'flex';
        };
        closeLegend.onclick = function() {
            legendDialog.style.display = 'none';
        };
        legendDialog.onclick = function(e) {
            if (e.target === legendDialog) legendDialog.style.display = 'none';
        };
    }
});