module.exports = (app, pool) => {
    const express = require('express');
    const router = express.Router();
    const itemControl = require('./api_ItemControl');
    const alert = require('./api_Alert');
    const user = require('./api_User');
    const warehouse = require('./api_Warehouse');

    router.get('/alert', async (req, res) => {
        try {
            await alert(req, res, pool);
        } catch (err) {
            console.log(err.message);
            res.status(500).json({
                message: err.message
            });
        }
    });

    router.post('/login', async (req, res) => {
        try {
            await user.login(req, res, pool);
        } catch (err) {
            console.log(err.message);
            res.status(500).json({
                messge: err.message
            });
        }
    });

    router.get('/warehouse', user.check, async (req, res) => {
        try {
            await warehouse.sendMyWarehouseList(req, res, pool);
        } catch (err) {
            console.log(err);
            res.status(500).json({
                messge: err.message
            });
        }
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