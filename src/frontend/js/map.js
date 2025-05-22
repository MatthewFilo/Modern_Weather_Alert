import { getAlerts, drawAlertsLayer, updateAlerts } from './alerts.js';

let map;
async function initMap() {
    map = new maplibregl.Map({
        container: 'map',
        style: 'https://demotiles.maplibre.org/style.json',
        center: [-100, 39.5],
        zoom: 4.1,
        maxBounds: [
            [-210, 20],
            [-50, 72]
        ]
    });

    // Draw initial states, counties, and alerts
    map.on('load', async () => {
        drawMap(map);
        await getAlerts();
        drawAlertsLayer(map);
    });
}

// Function that draws the map states and counties, does not draw alerts
function drawMap(map) {
    map.addSource('state-data', {
        type: 'geojson',
        data: 'src/frontend/assets/us-states.geojson',
    });
    map.addSource('county-data', {
        type: 'geojson',
        data: 'src/frontend/assets/usa-counties.geojson',
        generateId: true
    });

    map.addLayer({ // County Lines
        id: 'county-lines',
        source: 'county-data',
        type: 'line',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#000000',
            'line-width': 1,
            'line-opacity': 0.8
        }
    });
    map.addLayer({ // County Lines Fill
        id: 'county-lines-color',
        source: 'county-data',
        type: 'fill',
        layout: {},
        paint: {
            'fill-color': '#ffffff',
        }
    }, 'county-lines');

    map.addLayer({ // State Lines
        id: 'state-lines',
        source: 'state-data',
        type: 'line',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#000000',
            'line-width': 3,
            'line-opacity': 0.8
        }
    }, 'county-lines');
}

// Call the function every 3 minutes to check for new alerts and update maps
setInterval(() => {
    getAlerts().then(alerts => {
        if (alerts) {
            updateAlerts(map);
        }
    })
}, 180000); // 3 minutes in ms

initMap();