module.exports = function (app, db) {

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

    router.get('/', (req, res, next) => {
        iot_Monitoring.init(req, res, db)
    });

    router.post('/', (req, res, next) => {
        iot_Monitoring.sessionCheck(req, res, db)
    });

    router.get('/Monitoring', (req, res, next) => {
        iot_Monitoring.init(req, res, db)
    });

    router.get('/Warehousing', (req, res, next) => {
        var itemlist = iot_Warehousing.initWarehouse(req, res, db);
        var userType = req.session['type'];
        itemlist = JSON.parse(itemlist);
        res.render('IoT/iot_Warehousing', { 'session': req.session, 'itemlist': itemlist, 'userType': userType });
    });

    router.get('/Help', (req, res, next) => {
        iot_Help.init(req, res, db)
    });

    router.get('/RandomTest', (req, res, next) => {
        iot_Warehousing.randomTest(req, res, db)
    });

    router.get('/RegisterItem', (req, res, next) => {
        res.render('IoT/iot_RegisterItem', { 'session': req.session })
    });

    router.post('/RegisterItem', (req, res, next) => {
        iot_RegisterItem.registerItem(req, res, db)
    });

    router.get('/EditItem', (req, res, next) => {
        res.render('IoT/iot_EditItem', { 'session': req.session })
    });

    router.post('/EditItem', (req, res, next) => {
        res.render('IoT/iot_EditItem', { 'RFID': req.body.RFID, 'name': req.body.name, 'num': req.body.num, 'session': req.session })
    });

    router.post('/EditSave', (req, res, next) => {
        iot_EditItem.editItem(req, res, db)
    });

    router.post('/DeleteItem', (req, res, next) => {
        iot_Warehousing.delItem(req, res, db)
    });

    router.post('/RFID', (req, res, next) => {
        iot_RFID.receive(req, res, db)
    });

    return router;
};
