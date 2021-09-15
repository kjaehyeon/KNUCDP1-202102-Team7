module.exports = function (app, db) {
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
            'db': db
        });
    });

    router.get('/EnrollWH', function (req, res, next) {
        res.render('User/Provider/pv_EnrollWH', {
            'app': app,
            'session': req.session,
            'db': db
        });
    });

    router.post('/EnrollWH', function (req, res, next) {
        pv_EnrollWH.EnrollWH(req, res, app, db);
    });

    router.post('/MyWarehouse/Buy/Ans', function (req, res, next) {
        pv_myWH.ReqBuyAns(req, res, app, db);
    });

    router.post('/MyWarehouse/Enroll/Ans', function (req, res, next) {
        pv_myWH.ReqEnrollAns(req, res, app, db);
    });

    router.post('/MyWarehouse/IoT/Ans', function (req, res, next) {
        pv_myWH.ReqIoTAns(req, res, app, db);
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

    router.post('/WHInfo/Edit', function (req, res, next) {
        WHEdit.Show(req, res, app, db);
    });

    router.post('/WHInfo/Edit/Save', function (req, res, next) {
        WHEdit.Save(req, res, app, db);
    });

    router.post('/EnrollWHInfo', function (req, res, next) {
        var WHitems = EnrollWHInfo.getWHInfo(req, res, app, db);
        WHitems = JSON.parse(WHitems);
        res.render('User/EnrollWHInfo', {'req': req, 'app': app, 'session': req.session, 'db': db, 'WHitems': WHitems});
    });
    
    router.post('/RequestWHInfo', function (req, res, next) {
        var WHitems = RequestWHInfo.getWHInfo(req, res, app, db);
        var BYitems = RequestWHInfo.getBYInfo(req, res, app, db);
        var ReqItems = RequestWHInfo.getReqInfo(req, res, app, db);
        WHitems = JSON.parse(WHitems);
        BYitems = JSON.parse(BYitems);
        ReqItems = JSON.parse(ReqItems);
        res.render('User/RequestWHInfo', {'req': req, 'app': app, 'session': req.session, 'db': db, 'WHitems': WHitems, 'BYitems': BYitems, 'ReqItems': ReqItems});
    });

    router.get('/MyWarehouse', function (req, res, next) {
        var enrollItems = pv_myWH.RequestForEnroll(req, res, app, db);
        var requestItems = pv_myWH.RequestForBuy(req, res, app, db);
        var IoTitems = WHInfo.getIoTInfo(req, res, app, db);
        var wList = pv_myWH.Mywarehouse(req, res, app, db);
        enrollItems = JSON.parse(enrollItems);
        requestItems = JSON.parse(requestItems);
        IoTitems = JSON.parse(IoTitems);
        wList = JSON.parse(wList);

        res.render('User/Provider/pv_MyWH', {
            'app': app,
            'session': req.session,
            'db': db,
            'enrollItems': enrollItems,
            'requestItems': requestItems,
            'IoTitems': IoTitems,
            'wList': wList
        });
    });

    return router;
};
