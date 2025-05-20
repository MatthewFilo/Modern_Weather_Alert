const url = "https://api.weather.gov/alerts/active";

async function fetchAlerts() {
    try { // Try and catch response for error-handling
        const response = await fetch(url);
        if (!response.ok) {
          console.error('Failed to fetch alerts');
          return null;
        }
        const data = await response.json();
        return data;
    }
    catch ( error ) {
        console.error('Error Fetching NWS Api Alerts:', error);
        return null;
    }
}

module.exports = { fetchAlerts };