module.exports = (app, pool) => {
    const express = require('express');
    const router = express.Router();
    const alert = require('./api_Alert');

    router.get('/alert', async (req, res) => {
        await alert(req, res, pool);
    });

    return router;  
}