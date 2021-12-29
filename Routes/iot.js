module.exports = function(app, pool) {
    const express = require('express');
    const router = express.Router();

    const iot_Monitoring = require('./iot_Monitoring');
    const iot_Warehousing = require('./iot_Warehousing');
    const iot_RegisterItem = require('./iot_RegisterItem');
    const iot_EditItem = require('./iot_EditItem');
    const iot_Help = require('./iot_Help');
    const iot_RFID = require('./iot_RFID');

    var check = (req, res, next) => {
        var id = req.session['memberID'];
        if (req.path === '/RFID') {
            if (!id) res.send('unauthorized');
            else next();
        } else {
            var wid = req.session['warehouseID'];
            if (!id) res.render('Alert/needLogin');
            else if (req.path === '/' && req.method === 'POST') return next();
            else if (!wid) res.render('Alert/cannotAccess');
            else next();
        }
    };
    router.use(check);

    router.get('/', async (req, res, next) => {
        await iot_Monitoring.init(req, res, pool)
    });

    router.post('/', async (req, res, next) => {
        await iot_Monitoring.sessionCheck(req, res, pool)
    });

    router.get('/Monitoring', async (req, res, next) => {
        await iot_Monitoring.init(req, res, pool)
    });

    router.get('/Warehousing', async (req, res, next) => {
        var itemlist = await iot_Warehousing.initWarehouse(req, res, pool);
        var userType = req.session['type'];
        itemlist = JSON.parse(itemlist);
        res.render('IoT/iot_Warehousing', { 'session': req.session, 'itemlist': itemlist, 'userType': userType });
    });

    router.get('/Help', async (req, res, next) => {
        await iot_Help.init(req, res, pool)
    });

    router.get('/RandomTest', async (req, res, next) => {
        await iot_Warehousing.randomTest(req, res, pool)
    });

    router.get('/RegisterItem', (req, res, next) => {
        res.render('IoT/iot_RegisterItem', { 'session': req.session })
    });

    router.post('/RegisterItem', async (req, res, next) => {
        await iot_RegisterItem.registerItem(req, res, pool)
    });

    router.get('/EditItem', (req, res, next) => {
        res.render('IoT/iot_EditItem', { 'session': req.session })
    });

    router.post('/EditItem', (req, res, next) => {
        res.render('IoT/iot_EditItem', { 'RFID': req.body.RFID, 'name': req.body.name, 'num': req.body.num, 'session': req.session })
    });

    router.post('/EditSave', async (req, res, next) => {
        await iot_EditItem.editItem(req, res, pool)
    });

    router.post('/DeleteItem', async (req, res, next) => {
        await iot_Warehousing.delItem(req, res, pool)
    });

    router.post('/RFID', async (req, res, next) => {
        await iot_RFID.receive(req, res, pool)
    });

    router.get('/Statistic', (req, res, next) => {
        res.render('IoT/iot_Statistic', { iotIP: req.session['iotServer'],
            user_name: req.session['username'],
            user_type: req.session['type'] });
    })

    return router;
};