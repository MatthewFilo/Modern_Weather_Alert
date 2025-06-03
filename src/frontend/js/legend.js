document.addEventListener('DOMContentLoaded', function() {
    // const to display the legend and what color it correlates with
    const legendItems = [
            { color: "#ff2d00", label: "Tornado Warning"},
            { color: "#ff9200", label: "Severe Thunderstorm Warning"},
            { color: "#792121", label: "Flash Flood Warning"},
            { color: '#7db9f1', label: "Coastal Flood Advisory"},
            { color: '#aad5d4', label: "Coastal Flood Warning"},
            { color: '#1b3d3c', label: "Coastal Flood Statement"},
            { color: '#98afc4', label: 'Beach Hazards Statement'},
            { color: '#27cac5', label: 'Rip Current Statement'},
            { color: "#00fff8", label: "Severe Weather Statement"},
            { color: "#00a5ff", label: "Heavy Freezing Spray Warning"},
            { color: '#c7eceb', label: 'Marine Weather Statement'},
            { color: "#ff2d00", label: "High Wind Warning"},
            { color: "#6e00ba", label: "Storm Warning"},
            { color: "#00ff27", label: "Flood Warning"},
            { color: "#eeff00", label: "Tornado Watch"},
            { color: "#e2599f", label: "Severe Thunderstorm Watch"},
            { color: "#ecb0ce", label: "Gale Warning"},
            { color: "#32005e", label: "Freeze Warning"},
            { color: "#d9006b", label: "Red Flag Warning"},
            { color: "#8500e9", label: "Winter Weather Advisory"},
            { color: "#21ff8b", label: "Flood Advisory"},
            { color: "#f0ccda", label: "Small Craft Advisory"},
            { color: "#b399a3", label: "Brisk Wind Advisory"},
            { color: "#9b8761", label: "Lake Wind Advisory"},
            { color: "#d7bd8a", label: "Wind Advisory"},
            { color: "#3c8cd7", label: "Frost Advisory"},
            { color: "#ffa2c7", label: "Gale Watch"},
            { color: "#0a4d12", label: "Flood Watch"},
            { color: "#48fff3", label: "Freeze Watch"},
            { color: "#bdad7e", label: "Fire Weather Watch"},
            { color: "#ebd9a4", label: "Special Weather Statement"},
            { color: "#595857", label: "Air Quality Alert"},
            { color: "#b3faff", label: "Special Marine Warning"},
            { color: "#00686f", label: "Hazardous Seas Warning"},
            { color: "#3f3f3f", label: "Test Message"}
    ]

    // Logic to create the legend button and dialog
    let legendDialog = document.getElementById('legend-dialog');
    if (!legendDialog) {
        legendDialog = document.createElement('div');
        legendDialog.id = 'legend-dialog';
        document.body.appendChild(legendDialog);
    }
    legendDialog.className = 'legend-dialog';
    legendDialog.innerHTML = `<div class="legend-dialog-content">
                                <span id="close-legend" class="legend-close">&times;</span>
                                <div class="legend-items">
                                    ${legendItems.map(item =>
                                        `<div class="legend-item"><span class="legend-color" style="background:${item.color}"></span> ${item.label}</div>`
                                    ).join('')}
                                </div>
                              </div>`;
    const legendBtn = document.getElementById('legend-btn');
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