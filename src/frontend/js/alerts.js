import { translateTime, warningColors } from './utilities.js';
let combinedJSON;
let prevAlertsID = new Set();

async function getAlerts() {
    const response = await fetch('/api/alerts');
    if (!response.ok) {
        console.error('Failed to fetch alerts');
        return null;
    }
    combinedJSON = await response.json();
    return combinedJSON;
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

    map.addLayer({ // Alerts Line
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

    map.addLayer({ // Alerts fill
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
            const popupContent = 
            `<div class=popup-row>
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

            new maplibregl.Popup({maxWidth: 'none'})
                .setLngLat([e.lngLat.lng, e.lngLat.lat])
                .setHTML(popupContent)
                .addTo(map);
        }
    });
}

// We need to compare the old and new alerts and see if there's changes, if so, update map
async function updateAlerts(map) {
    // We want to make sure we are comparing the same response as what is currently drawn
    await getAlerts();

    // Now we compare the newIDs with the old IDs
    const newIDs = new Set(combinedJSON.features.map(feature => feature.id));
    let changed = false;
    // We check the sizes and then we will check to see if the prevID's don't have some of the newID's
    // Handles removals
    if (prevAlertsID.size !== newIDs.size) {
        changed = true;
    }
    else {
        for (let id of newIDs) {
            // Otherwise if prevAlerts does not have instance newID, we know it has a change
            if (!prevAlertsID.has(id)) {
                changed = true;
                break;
            }
        }
    }
    if (changed) { // if data is changed, update the map
        const source = map.getSource('alerts-data');
        if (source) {
            source.setData(combinedJSON); // setData lets us update the map without redrawing the layers
        }
        prevAlertsID = newIDs;
    }
}

export { getAlerts, drawAlertsLayer, updateAlerts }