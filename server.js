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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});