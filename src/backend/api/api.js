require('dotenv').config();
const url = "https://api.weather.gov/alerts/active";
const Redis = require('ioredis');
const redisURL = process.env.REDIS_URL
const redis = new Redis(redisURL);

async function fetchAlerts() {
    try {
        const cached = await redis.get('alerts_geojson');
        if (cached) {
            return JSON.parse(cached);
        }
    } 
    catch ( error ) {
        console.error('Redis cache error:', error);
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error('Failed to fetch alerts');
          return null;
        }
        const alerts = await response.json();

        let allFeatures = alerts.features.filter(f => f.geometry);
        let nullZones = []

        // If we don't limit concurrent request, not all alerts will show due to rate limits
        const pLimit = require('p-limit').default;
        const limit = pLimit(5);

        // Go through each of the alerts, if geo null but has url for affected zones, fetcch the zones
        alerts.features.forEach(alert => {
            if (!alert.geometry && alert.properties.affectedZones) {
                alert.properties.affectedZones.forEach(affectedZoneUrl => {
                    const zone = limit(async () => {
                        const zoneCacheKey = `zone:${affectedZoneUrl}`;
                        let zoneGeo = await redis.get(zoneCacheKey);
                        if (zoneGeo) {
                            zoneGeo = JSON.parse(zoneGeo);
                        } else {
                            zoneGeo = await fetch(affectedZoneUrl).then(r => r.json()).catch(() => null);
                            if (zoneGeo && zoneGeo.geometry) {
                                // Cache for 1 week (Geometries do not change much)
                                await redis.set(zoneCacheKey, JSON.stringify(zoneGeo), 'EX', 604800);
                            }
                        }
                        if (zoneGeo && zoneGeo.geometry) {
                            return {
                                type: 'Feature',
                                geometry: zoneGeo.geometry,
                                properties: { ...alert.properties, zoneName: zoneGeo.properties?.name }
                            };
                        } else {
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
            const key = feature.properties.event + '|' + (feature.properties.zoneName || '') + '|' + feature.id;
            const current = newest_alerts[key];
            const feature_expires = new Date(feature.properties.expires);
            const current_expires = new Date(current?.properties.expires);
            if ( (! current || feature_expires >= current_expires) && feature_expires >= Date.now()) {
                newest_alerts[key] = feature;
            }
        }
        combinedJSON = {
            type: 'FeatureCollection',
            features: Object.values(newest_alerts)
        };

        try {
            await redis.set('alerts_geojson', JSON.stringify(combinedJSON), 'EX', 180);
        } catch (err) {
            console.error('Redis set error:', err);
        }

        return combinedJSON;
    }
    catch ( error ) {
        console.error('Error Fetching NWS Api Alerts:', error);
        return { type: 'FeatureCollection', features: [] };
    }
}

module.exports = { fetchAlerts };