const express = require('express')
const app = express()
const port = 8080
const { fetchAlerts } = require('./backend/api/api.js')

app.use('/frontend', express.static('frontend'));

// Getting the alerts from the API and sending to frontend
app.get('/api/alerts', async (req, res) => {
    try {
        const data = await fetchAlerts();
        if (data) {
        res.json(data);
        } 
    }
    catch (error) {
        console.error('Error in /api/alerts route:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})