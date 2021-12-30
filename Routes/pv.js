module.exports = function (app, pool) {
    var express = require('express');
    var router = express.Router();

    const pv_myWH = require('./pv_MyWH');
    const pv_EnrollWH = require('./pv_EnrollWH');
    const WHInfo = require('./WHInfo');
    const WHEdit = require('./WHEdit');    
    const EnrollWHInfo = require('./EnrollWHInfo');
    const RequestWHInfo = require('./RequestWHInfo');

    var check = (req, res, next) => {
        var type = req.session['type'];
        if (!type) res.render('Alert/needLogin');
        else if (type === 'provider') next();
        else res.render('Alert/cannotAccess');
    };
    router.use(check);

    router.get('/', function (req, res, next) {
        res.render('User/Provider/pv_EnrollWH', {
            'app': app,
            'session': req.session,
            'pool': pool
        });
    });

    router.get('/EnrollWH', function (req, res, next) {
        res.render('User/Provider/pv_EnrollWH', {
            'app': app,
            'session': req.session,
            'pool': pool
        });
    });

    router.post('/EnrollWH', async function (req, res, next) {
        await pv_EnrollWH.EnrollWH(req, res, app, pool);
    });

    router.post('/MyWarehouse/Buy/Ans', async function (req, res, next) {
        await pv_myWH.ReqBuyAns(req, res, app, pool);
    });

    router.post('/MyWarehouse/Enroll/Ans', async function (req, res, next) {
        await pv_myWH.ReqEnrollAns(req, res, app, pool);
    });

    router.post('/MyWarehouse/IoT/Ans', async function (req, res, next) {
        await pv_myWH.ReqIoTAns(req, res, app, pool);
    });

    router.post('/WHInfo', async function (req, res, next) {
        var WHitems = await WHInfo.getWHInfo(req, res, app, pool);
        var PVitems = await WHInfo.getPVInfo(req, res, app, pool);
        var curItems = await WHInfo.getCurUsage(req, res, app, pool);
        var nextItems = await WHInfo.getNextUsage(req, res, app, pool);
        var preItems = await WHInfo.getPreUsage(req, res, app, pool);
        WHitems = JSON.parse(WHitems);
        PVitems = JSON.parse(PVitems);
        curItems = JSON.parse(curItems);
        nextItems = JSON.parse(nextItems);
        preItems = JSON.parse(preItems);
        res.render('User/WHInfo', {'req': req, 'app': app, 'session': req.session, 'pool': pool, 'WHitems': WHitems, 'PVitems': PVitems, 'curItems': curItems, 'preItems': preItems, 'nextItems': nextItems});
    });

    router.post('/WHInfo/Edit', async function (req, res, next) {
        await WHEdit.Show(req, res, app, pool);
    });

    router.post('/WHInfo/Edit/Save', async function (req, res, next) {
        await WHEdit.Save(req, res, app, pool);
    });

    router.post('/EnrollWHInfo', async function (req, res, next) {
        var WHitems = await EnrollWHInfo.getWHInfo(req, res, app, pool);
        WHitems = JSON.parse(WHitems);
        res.render('User/EnrollWHInfo', {'req': req, 'app': app, 'session': req.session, 'pool': pool, 'WHitems': WHitems});
    });
    
    router.post('/RequestWHInfo', async function (req, res, next) {
        var WHitems = await RequestWHInfo.getWHInfo(req, res, app, pool);
        var BYitems = await RequestWHInfo.getBYInfo(req, res, app, pool);
        var ReqItems = await RequestWHInfo.getReqInfo(req, res, app, pool);
        WHitems = JSON.parse(WHitems);
        BYitems = JSON.parse(BYitems);
        ReqItems = JSON.parse(ReqItems);
        res.render('User/RequestWHInfo', {'req': req, 'app': app, 'session': req.session, 'pool': pool, 'WHitems': WHitems, 'BYitems': BYitems, 'ReqItems': ReqItems});
    });

    router.get('/MyWarehouse', async function (req, res, next) {
        var enrollItems = await pv_myWH.RequestForEnroll(req, res, app, pool);
        var requestItems = await pv_myWH.RequestForBuy(req, res, app, pool);
        var IoTitems = await WHInfo.getIoTInfo(req, res, app, pool);
        var wList = await pv_myWH.Mywarehouse(req, res, app, pool);
        enrollItems = JSON.parse(enrollItems);
        requestItems = JSON.parse(requestItems);
        IoTitems = JSON.parse(IoTitems);
        wList = JSON.parse(wList);

        res.render('User/Provider/pv_MyWH', {
            'app': app,
            'session': req.session,
            'pool': pool,
            'enrollItems': enrollItems,
            'requestItems': requestItems,
            'IoTitems': IoTitems,
            'wList': wList
        });
    });

    return router;
};
