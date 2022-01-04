module.exports = (app, pool) => {
    const express = require('express');
    const router = express.Router();
    const alert = require('./api_Alert');
    const user = require('./api_User');
    const warehouse = require('./api_Warehouse');

    router.get('/alert', async (req, res) => {
        await alert(req, res, pool);
    });

    router.post('/login', async (req, res) => {
        await user.login(req, res, pool);
    });

    router.get('/warehouse', user.check, async (req, res) => {
        await warehouse.sendMyWarehouseList(req, res, pool);
    });

    return router;  
}