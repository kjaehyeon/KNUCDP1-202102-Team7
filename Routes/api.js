module.exports = (app, pool) => {
    const express = require('express');
    const router = express.Router();
    const itemControl = require('./api_ItemControl');
    const alert = require('./api_Alert');
    const user = require('./api_User');
    const warehouse = require('./api_Warehouse');

    router.get('/alert', async (req, res) => {
        await alert(req, res, pool);
    });

    router.post('/login', async (req, res) => {
        console.log("login requested");
        await user.login(req, res, pool);
    });

    router.get('/warehouse', user.check, async (req, res) => {
        console.log("GET WAREHOUSE");
        await warehouse.sendMyWarehouseList(req, res, pool);
    });
    router.post('/EnrollItem', async (req, res, next) => {
        await itemControl.enrollItem(req, res, pool);
    });
    router.post('/item/in', user.check, async (req, res, next) => {
        await itemControl.receivedItem(req, res, pool);
    });
    router.post('/item/out', user.check, async (req, res, next) => {
        await itemControl.releaseItem(req, res, pool);
    });
    router.get('/itemlist', user.check, async (req, res, next) => {
        console.log("itemlist requested");
        await itemControl.listItem(req, res, pool);
    });

    return router;  
}