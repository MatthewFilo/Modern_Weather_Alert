const request = require('supertest');

describe('API Endpoints', () => {
    it('GET /api/alerts returns valid GeoJSON', async () => {
        const app = require('../app');
        const res = await request(app).get('/api/alerts');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('type', 'FeatureCollection');
        expect(Array.isArray(res.body.features)).toBe(true);
    });

    it('GET /api/alerts handles fetch error gracefully', async () => {
        jest.resetModules();
        jest.spyOn(require('../src/backend/api/api'), 'fetchAlerts').mockResolvedValueOnce(null);
        const app = require('../app');
        const res = await request(app).get('/api/alerts');
        expect(res.statusCode).toEqual(500);
        expect(res.body).toHaveProperty('error');
    });

    it('GET /api/alerts returns empty FeatureCollection if no alerts', async () => {
        jest.resetModules();
        jest.spyOn(require('../src/backend/api/api'), 'fetchAlerts').mockResolvedValueOnce({
            type: 'FeatureCollection',
            features: []
        });
        const app = require('../app');
        const res = await request(app).get('/api/alerts');
        expect(res.statusCode).toEqual(200);
        expect(res.body.features.length).toBe(0);
    });

    it('GET /src/frontend/css/styles.css returns CSS', async () => {
        const app = require('../app');
        const res = await request(app).get('/src/frontend/css/styles.css');
        expect(res.statusCode).toBe(200);
        expect(res.type).toMatch(/css/);
    });

    it('GET /nonexistent returns 404', async () => {
        const app = require('../app');

        const res = await request(app).get('/nonexistent');
        expect(res.statusCode).toEqual(404);
    });

    it('GET / returns HTML', async () => {
        const app = require('../app');

        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toMatch(/Modern Weather Alerts?/i);
    });
});