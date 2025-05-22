import { translateTime, warningColors } from './utilities.js';
let combinedJSON;
let prevAlertsID = new Set();

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

            new maplibregl.Popup({maxWidth: 'none'})
                .setLngLat([e.lngLat.lng, e.lngLat.lat])
                .setHTML(popupContent)
                .addTo(map);
        }
    });

}

async function getAlerts() {
    const response = await fetch('/api/alerts');
    if (!response.ok) {
        console.error('Failed to fetch alerts');
        return null;
    }
    // Thing I would have liked to do: perform this filter in api.js but I was having issues submitting way too many requests
    // to the point my IPS would limit my outward requests.
    const alerts = await response.json();
    let allFeatures = alerts.features.filter(f => f.geometry); // Get all alerts with a geometry tag
    let nullZones = []
    
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

    // Merge the alerts with the new null zones
    const combinedAlerts = allFeatures.concat(nullZonesData);

    // This removes any old / duplicate alerts and only shows the most recent one
    const newest_alerts = {};
    for (const feature of combinedAlerts) {
        const key = feature.properties.event + '|' + (feature.properties.zoneName || '');
        const current = newest_alerts[key];
        if ( ! current || new Date(feature.properties.expires) >= new Date(current.properties.expires)) {
            newest_alerts[key] = feature;
        }
    }
    combinedJSON = {
        type: 'FeatureCollection',
        features: Object.values(newest_alerts)
    };
}

// We need to compare the old and new alerts and see if there's changes, if so, update map
async function updateAlerts(map) {
    // We want to make sure we are comparing the same response as in the init draw function
    // Now we compare the newIDs with the old IDs
    await getAlerts();
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