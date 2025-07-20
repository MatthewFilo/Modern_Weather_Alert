require('dotenv').config();
const app = require('./app');
const port = process.env.SERVER_PORT;
const { fetchAlerts } = require('./src/backend/api/api.js');

// Pre-warming the alerts cache so user does not have to wait long during first load
fetchAlerts()
  .then(() => {
    console.log('Alerts Cache is pre-warmed')
  })
  .catch( error => {
    console.error('Couldnt pre-warm alerts cache:', error);
  });

// Pre-warm the cache every 3 minutes in the background
setInterval(() => {
  fetchAlerts()
    .then(() => {
      console.log(`[${new Date().toLocaleString()}] Alerts cache refreshed in background`);
    })
    .catch( error => {
      console.error(`[${new Date().toLocaleString()}] Error refreshing alerts cache:`, error);
    });
}, 180000);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});