let map;
let combinedJSON;
let prevAlertsID = new Set();
async function initMap() {
    map = new maplibregl.Map({
        container: 'map',
        style: 'https://demotiles.maplibre.org/style.json',
        center: [-100, 39.5],
        zoom: 4.1,
        maxBounds: [
            [-170, 15],
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

async function getAlerts() {
    const response = await fetch('/api/alerts');
    if (!response.ok) {
        console.error('Failed to fetch alerts');
        return null;
    }
    const alerts = await response.json();
    let allFeatures = alerts.features.filter(f => f.geometry); // Get all alerts with a geometry tag
    let nullZones = [] // Array to hold the init null geo zones
    
    // Go through each of the alerts, if geo null but has url for affected zones, fetcch the zones
    alerts.features.forEach(alert => {
        if(!alert.geometry && alert.properties.affectedZones) {
            alert.properties.affectedZones.forEach(affectedZoneUrl => {
                const zone = fetch(affectedZoneUrl)
                .then(response => response.json())
                .then(zoneGeography => {
                    if(zoneGeography.geometry) 
                    {
                        return {
                            type: 'Feature',
                            geometry: zoneGeography.geometry,
                            properties:{ ...alert.properties, 
                                         zoneName: zoneGeography.properties?.name // Mainly for the coastal regions since the county JSON doesn't have any data for the coasts
                            }
                        };
                    }
                    else 
                    {
                        return null;
                    }
                });
                nullZones.push(zone);
            });
        }
    });
    // Wait until all null zones are received
    // We need to filter out some null zones since those zones don't have any sort of geometry
    const nullZonesData = (await Promise.all(nullZones)).filter(nullZone => nullZone && nullZone.geometry);

    // Combine the alerts with the new null zones
    const combinedAlerts = allFeatures.concat(nullZonesData);
    combinedJSON = {
        type: 'FeatureCollection',
        features: combinedAlerts
    };
}

function drawMap(map) {
    map.addSource('state-data', {
        type: 'geojson',
        data: 'frontend/assets/us-states.geojson',
    });
    map.addSource('county-data', {
        type: 'geojson',
        data: 'frontend/assets/usa-counties.geojson',
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
    map.addLayer({ // County Lines Background Fill
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

async function drawAlertsLayer(map) {
    // Before we redraw new alerts, we need to check for and remove old alerts
    if (map.getLayer('active-alerts')) map.removeLayer('active-alerts');
    if (map.getLayer('active-alerts-fill')) map.removeLayer('active-alerts-fill');
    if (map.getSource('alerts-data')) map.removeSource('alerts-data');

    map.addSource('alerts-data', {
        type: 'geojson',
        data: combinedJSON
    });

    // Alerts Line
    map.addLayer({
        id: 'active-alerts',
        type: 'line',
        source: 'alerts-data',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': warningColors,
            'line-width': 3,
        }
    });
    // Alerts Fill
    map.addLayer({ 
        id: 'active-alerts-fill',
        source: 'alerts-data',
        type: 'fill',
        layout: {},
        paint: {
            'fill-color': warningColors,
            'fill-opacity':0.5
        }
    });

    // Alert Popup
    map.on('mouseenter', 'active-alerts', () => {
        map.getCanvas().style.cursor = 'pointer';  
    });
    map.on('click', 'active-alerts-fill', (e) => {
        const alertFeatures = map.queryRenderedFeatures(e.point, {
            layers: ['active-alerts-fill']
        });
        const countyFeatures = map.queryRenderedFeatures(e.point, {
            layers: ['county-lines-color']
        });
        if (alertFeatures.length) {

            // Set the contents for the popup (Warning, Severity, Expires).
            const popupContent = `<div class=popup-row>
            ${alertFeatures.map(feature => {
            const zoneName = feature.properties.zoneName
            const countyName = countyFeatures[0]?.properties?.NAME || zoneName || "Unknown";
            return `<div class="popup-card">
                    <h2> ${feature.properties.event} </h2>
                    <p> Area: ${countyName} County </p>
                    <h2> Severity </h2> <p> ${feature.properties.severity} </p>
                    <h2> Expires </h2> <p> ${translateTime(feature.properties.expires)} </p>
                    <hr>
                    </div>`
            }).join('')}
            </div>`;
            // Handle all of the different types of geometries
            let coordinates;
            const feature = alertFeatures[0];
            if (feature.geometry.type === "Point") {
                coordinates = feature.geometry.coordinates;
            } else if (feature.geometry.type === "Polygon") {
                coordinates = feature.geometry.coordinates[0][0];
            } else if (feature.geometry.type === "MultiPolygon") {
                coordinates = feature.geometry.coordinates[0][0][0];
            } else {
                coordinates = [e.lngLat.lng, e.lngLat.lat];
            }

            new maplibregl.Popup({maxWidth: '90vw'})
                .setLngLat(coordinates)
                .setHTML(popupContent)
                .addTo(map);
        }
    });

}

// We need to compare the old and new alerts and see if there's changes, if so, update map
async function updateAlerts(map) {
    // we want to make sure we are comparing the same response as in the init draw function
    // Now we compare the newIDs with the old IDs
    const newIDs = new Set(getAlerts().features.map(feature => feature.id));
    let changed = false;
    // We check the sizes and then we will check to see if the prevID's don't have some of the newID's
    if (prevAlertsID.size !== newIDs.size) {
        changed = true;
    }
    else {
        for (let id of newIDs) {
            if (!prevAlertsID.has(id)) {
                changed = true;
                break;
            }
        }
    }
    if (changed) { // if data is changed, update the map
        const source = map.getSource('alerts-data');
        if (source) {
            source.setData(combinedJSON); // This lets us update the map without redrawing the layers
        }
        prevAlertsID = newIDs;
    }
}

// Function to translate time from ISO-8601 to a human readable format
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

// Const for colors of different alerts to be drawn
const warningColors = [
    'case',
    ['==', ['get', 'event'], 'Tornado Warning'], '#ff2d00',
    ['==', ['get', 'event'], 'Severe Thunderstorm Warning'], '#ff9200',
    ['==', ['get', 'event'], 'Flash Flood Warning'], '#792121',
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
    ['==', ['get', 'event'], 'Test Message'], '#3f3f3f',
    '#ffffff'
]

// Call the function every 3 minutes
setInterval(() => {
    getAlerts().then(alerts => {
        if (alerts) {
            updateAlerts(map);
        }
    })
}, 180000); // 3 minutes in ms

window.initMap = initMap;