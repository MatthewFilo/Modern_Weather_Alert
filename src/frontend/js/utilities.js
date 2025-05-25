// Function to translate time from ISO-8601 (Format that NWS API gives us) to a human readable format
function translateTime(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    };
    return date.toLocaleString('en-US', options);
}

// Const for colors of different alerts to be drawn (Colors also coincide with the legend table)
const warningColors = [
    'case',
    ['==', ['get', 'event'], 'Tornado Warning'], '#ff2d00',
    ['==', ['get', 'event'], 'Severe Thunderstorm Warning'], '#ff9200',
    ['==', ['get', 'event'], 'Flash Flood Warning'], '#792121',
    ['==', ['get', 'event'], 'Coastal Flood Advisory'], '#7db9f1',
    ['==', ['get', 'event'], 'Coastal Flood Warning'], '#aad5d4',
    ['==', ['get', 'event'], 'Coastal Flood Statement'], '#1b3d3c',
    ['==', ['get', 'event'], 'Beach Hazards Statement'], '#98afc4',
    ['==', ['get', 'event'], 'Rip Current Statement'], '#27cac5',
    ['==', ['get', 'event'], 'Marine Weather Statement'], '#c7eceb',
    ['==', ['get', 'event'], 'Severe Weather Statement'], '#00fff8',
    ['==', ['get', 'event'], 'Heavy Freezing Spray Warning'], '#00a5ff',
    ['==', ['get', 'event'], 'High Wind Warning'], '#ff2d00',
    ['==', ['get', 'event'], 'Storm Warning'], '#6e00ba',
    ['==', ['get', 'event'], 'Flood Warning'], '#00ff27',
    ['==', ['get', 'event'], 'Tornado Watch'], '#eeff00',
    ['==', ['get', 'event'], 'Severe Thunderstorm Watch'], '#e2599f',
    ['==', ['get', 'event'], 'Gale Warning'], '#ecb0ce',
    ['==', ['get', 'event'], 'Freeze Warning'], '#32005e',
    ['==', ['get', 'event'], 'Red Flag Warning'], '#d9006b',
    ['==', ['get', 'event'], 'Winter Weather Advisory'], '#8500e9',
    ['==', ['get', 'event'], 'Flood Advisory'], '#21ff8b',
    ['==', ['get', 'event'], 'Small Craft Advisory'], '#f0ccda',
    ['==', ['get', 'event'], 'Brisk Wind Advisory'], '#b399a3',
    ['==', ['get', 'event'], 'Lake Wind Advisory'], '#9b8761',
    ['==', ['get', 'event'], 'Wind Advisory'], '#d7bd8a',
    ['==', ['get', 'event'], 'Frost Advisory'], '#3c8cd7',
    ['==', ['get', 'event'], 'Gale Watch'], '#ffa2c7',
    ['==', ['get', 'event'], 'Flood Watch'], '#0a4d12',
    ['==', ['get', 'event'], 'Freeze Watch'], '#48fff3',
    ['==', ['get', 'event'], 'Fire Weather Watch'], '#bdad7e',
    ['==', ['get', 'event'], 'Special Weather Statement'], '#ebd9a4',
    ['==', ['get', 'event'], 'Air Quality Alert'], '#595857',
    ['==', ['get', 'event'], 'Special Marine Warning'], '#b3faff',
    ['==', ['get', 'event'], 'Test Message'], '#3f3f3f',
    '#ffffff'
]

export { translateTime, warningColors }