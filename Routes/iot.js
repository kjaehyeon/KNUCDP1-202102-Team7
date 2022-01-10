module.exports = function(app, pool) {
    const express = require('express');
    const router = express.Router();
    const iot_Monitoring = require('./iot_Monitoring');

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
        try {
            await iot_Monitoring.init(req, res, pool);
        } catch (err) {
            console.log(err.message);
            res.render('Alert/errorOccured');
        }
    });

    router.post('/', async (req, res, next) => {
        try {
            await iot_Monitoring.sessionCheck(req, res, pool)
        } catch (err) {
            console.log(err.message);
            res.render('Alert/cannotAccess');
        }
    });

    router.get('/Monitoring', async (req, res, next) => {
        try {
            await iot_Monitoring.init(req, res, pool)
        } catch (err) {
            console.log(err.message);
            res.render('Alert/errorOccured', {'req' : req});
        }
    });

    router.get('/Statistic', (req, res, next) => {
        res.render('IoT/iot_Statistic', { iotIP: req.session['iotServer'],
            user_name: req.session['username'],
            user_type: req.session['type'] });
    })

    return router;
};