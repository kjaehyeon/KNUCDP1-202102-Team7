module.exports = (app, pool) => {
    const express = require('express');
    const router = express.Router();
    const alert = require('./api_Alert');
    const user = require('./api_User');

    router.get('/alert', async (req, res) => {
        await alert(req, res, pool);
    });

    router.post('/login', async (req, res) => {
        await user.login(req, res, pool);
    });

    return router;  
}