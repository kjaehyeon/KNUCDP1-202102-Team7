module.exports = function (app, db) {
    const express = require('express');
    const router = express.Router();
    const ad_ReqEnroll = require('./ad_RequestEnroll');
    const ad_ReqIoT = require('./ad_RequestIoT');
    const ad_IoTTest = require('./ad_IoTTest');
    const ad_ReqBuy = require('./ad_RequestBuy');
    const ad_UsageHistory = require('./ad_UsageHistory');
    const ad_UsageHistoryInfo = require('./ad_UsageHistoryInfo');
    const ad_WarehouseList = require('./ad_WarehouseList');
    const WHInfo = require('./WHInfo');
    const EnrollWHInfo = require('./EnrollWHInfo');
    const RequestWHInfo = require('./RequestWHInfo');
    const IoTWHInfo = require('./IoTWHInfo');

    var check = (req, res, next) => {
        var type = req.session['type'];
        if (!type) res.render('Alert/needLogin');
        else if (type === 'admin') next();
        else res.render('Alert/cannotAccess');
    };
    router.use(check);

    router.get('/RequestEnroll', function (req, res, next) {
        var items = ad_ReqEnroll.RequestForEnroll(req, res, app, db);
        items = JSON.parse(items);
        res.render('User/Admin/ad_RequestEnroll', {'app': app, 'session': req.session, 'db': db, 'items': items});
    });

    router.post('/RequestEnroll', function (req, res, next) {
        ad_ReqEnroll.withAnswer(req, res, app, db);
    });

    router.post('/EnrollWHInfo', function (req, res, next) {
        var WHitems = EnrollWHInfo.getWHInfo(req, res, app, db);
        var PVitems = EnrollWHInfo.getPVInfo(req, res, app, db);
        WHitems = JSON.parse(WHitems);
        PVitems = JSON.parse(PVitems);
        res.render('User/EnrollWHInfo', {'req': req, 'app': app, 'session': req.session, 'db': db, 'WHitems': WHitems, 'PVitems': PVitems});
    });

    router.get('/RequestIoT', function (req, res, next) {
        var items = ad_ReqIoT.RequestForIoT(req, res, app, db);
        items = JSON.parse(items);
        res.render('User/Admin/ad_RequestIoT', {'app': app, 'session': req.session, 'db': db, 'items': items});
    });

    router.post('/RequestIoT', function (req, res, next) {
        ad_ReqIoT.withAnswer(req, res, app, db);
    });

    router.post('/IoTWHInfo', function (req, res, next) {
        var WHitems = IoTWHInfo.getWHInfo(req, res, app, db);
        var PVitems = IoTWHInfo.getPVInfo(req, res, app, db);
        WHitems = JSON.parse(WHitems);
        PVitems = JSON.parse(PVitems);
        res.render('User/IoTWHInfo', {'req': req, 'app': app, 'session': req.session, 'db': db, 'WHitems': WHitems, 'PVitems': PVitems});
    });

    router.post('/IoTTest', function (req, res, next) {
        ad_IoTTest.init(req, res, app, db);
    });
    
    router.get('/RequestBuy', function (req, res, next) {
        var items = ad_ReqBuy.RequestForBuy(req, res, app, db);
        items = JSON.parse(items);
        res.render('User/Admin/ad_RequestBuy', {'app': app, 'session': req.session, 'db': db, 'items': items});
    });

    router.post('/RequestWHInfo', function (req, res, next) {
        var WHitems = RequestWHInfo.getWHInfo(req, res, app, db);
        var PVitems = RequestWHInfo.getPVInfo(req, res, app, db);
        var BYitems = RequestWHInfo.getBYInfo(req, res, app, db);
        var ReqItems = RequestWHInfo.getReqInfo(req, res, app, db);
        WHitems = JSON.parse(WHitems);
        PVitems = JSON.parse(PVitems);
        BYitems = JSON.parse(BYitems);
        ReqItems = JSON.parse(ReqItems);
        res.render('User/RequestWHInfo', {'req': req, 'app': app, 'session': req.session, 'db': db, 'WHitems': WHitems, 'PVitems': PVitems, 'BYitems': BYitems, 'ReqItems': ReqItems});
    });

    router.get('/WarehouseList', function (req, res, next) {
        var WHList = ad_WarehouseList.getWHList(req, res, app, db);
        WHList = JSON.parse(WHList);
        res.render('User/Admin/ad_WarehouseList', {'app': app, 'session': req.session, 'db': db, 'WHList': WHList});
    });

    router.post('/WHInfo', function (req, res, next) {
        var WHitems = WHInfo.getWHInfo(req, res, app, db);
        var PVitems = WHInfo.getPVInfo(req, res, app, db);
        var curItems = WHInfo.getCurUsage(req, res, app, db);
        var nextItems = WHInfo.getNextUsage(req, res, app, db);
        var preItems = WHInfo.getPreUsage(req, res, app, db);
        WHitems = JSON.parse(WHitems);
        PVitems = JSON.parse(PVitems);
        curItems = JSON.parse(curItems);
        nextItems = JSON.parse(nextItems);
        preItems = JSON.parse(preItems);
        res.render('User/WHInfo', {'req': req, 'app': app, 'session': req.session, 'db': db, 'WHitems': WHitems, 'PVitems': PVitems, 'curItems': curItems, 'preItems': preItems, 'nextItems': nextItems});
    });

    router.get('/UsageHistory', function (req, res, next) {
        var items = ad_UsageHistory.getUsageHistory(req, res, app, db);
        items = JSON.parse(items);
        res.render('User/Admin/ad_UsageHistory', {'app': app, 'session': req.session, 'db': db, 'items': items});
    });

    router.post('/UsageHistory/INFO', function (req, res, next) {
        var WHitems = ad_UsageHistoryInfo.getWHInfo(req, res, app, db);
        var PVitems = ad_UsageHistoryInfo.getPVInfo(req, res, app, db);
        var BYitems = ad_UsageHistoryInfo.getBYInfo(req, res, app, db);
        WHitems = JSON.parse(WHitems);
        PVitems = JSON.parse(PVitems);
        BYitems = JSON.parse(BYitems);
        res.render('User/Admin/ad_UsageHistoryInfo', {'app': app, 'session': req.session, 'db': db, 'WHitems': WHitems, 'PVitems': PVitems, 'BYitems': BYitems});
    });

    router.post('/RequestBuy/Ans', function (req, res, next) {
        ad_ReqBuy.withAnswer(req, res, app, db);
    });

    router.get('/Question', function (req, res, next) {
        res.render('User/Admin/ad_Question', {'app': app, 'session': req.session, 'db': db});
    });

    return router;
};
