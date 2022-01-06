module.exports = function(app, pool) {
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

    router.get('/RequestEnroll', async function(req, res, next) {
        try {
            var items = await ad_ReqEnroll.RequestForEnroll(req, res, app, pool);
            items = JSON.parse(items);
            res.render('User/Admin/ad_RequestEnroll', { 
                        'app': app,
                        'session': req.session,
                        'pool': pool,
                        'items': items });
        } catch (err) {
            console.log(err.message);
            res.render('Alert/errorOccured');
        }
    });

    router.post('/RequestEnroll', async function(req, res, next) {
        try {
            await ad_ReqEnroll.withAnswer(req, res, app, pool);
        } catch (err) {
            console.log(err.message);
            res.send(false);
        }
    });
    
    router.post('/EnrollWHInfo', async function(req, res, next) {
        var WHitems = {};
        var PVitems = {};
        try {
            WHitems = await EnrollWHInfo.getWHInfo(req, res, app, pool);
            PVitems = await EnrollWHInfo.getPVInfo(req, res, app, pool);
            WHitems = JSON.parse(WHitems);
            PVitems = JSON.parse(PVitems);
            res.render('User/EnrollWHInfo', { 
                        'req': req,
                        'app': app,
                        'session': req.session,
                        'pool': pool,
                        'WHitems': WHitems,
                        'PVitems': PVitems });
        } catch (err) {
            console.log(err.message);
            res.render('Alert/errorOccured');
        }
    });

    router.get('/RequestIoT', async function(req, res, next) {
        try {
            var items = await ad_ReqIoT.RequestForIoT(req, res, app, pool);
            items = JSON.parse(items);
            res.render('User/Admin/ad_RequestIoT', {
                    'app': app,
                    'session': req.session,
                    'pool': pool,
                    'items': items });
            
        } catch (err) {
            console.log(err.message);
            res.render('Alert/errorOccured');
        }
    });
    
    router.post('/RequestIoT', async function(req, res, next) {
        try {
            await ad_ReqIoT.withAnswer(req, res, app, pool);
        } catch (err) {
            console.log(err.message);
            res.send(false);
        }
    });

    router.post('/IoTWHInfo', async function(req, res, next) {
        try {
            var WHitems = await IoTWHInfo.getWHInfo(req, res, app, pool);
            var PVitems = await IoTWHInfo.getPVInfo(req, res, app, pool);
            WHitems = JSON.parse(WHitems);
            PVitems = JSON.parse(PVitems);
            res.render('User/IoTWHInfo', {
                    'req': req,
                    'app': app,
                    'session': req.session,
                    'pool': pool,
                    'WHitems': WHitems,
                    'PVitems': PVitems });
        } catch (err) {
            console.log(err.message);
            res.render('Alert/errorOccured');
        }
    });

    router.post('/IoTTest', async function(req, res, next) {
        try {
            await ad_IoTTest.init(req, res, app, pool);
        } catch (err) {
            console.log(err.message);
            res.render('Alert/errorOccured');
        }
    });

    router.get('/RequestBuy', async function(req, res, next) {
        try {
            var items = await ad_ReqBuy.RequestForBuy(req, res, app, pool);
            items = JSON.parse(items);
            res.render('User/Admin/ad_RequestBuy', { 
                        'app': app,
                        'session': req.session,
                        'pool': pool,
                        'items': items });
        } catch (err) {
            console.log(err.message);
            res.render('Alert/errorOccured');
        }
    });

    router.post('/RequestWHInfo', async function(req, res, next) {
        try {
            var WHitems = await RequestWHInfo.getWHInfo(req, res, app, pool);
            var PVitems = await RequestWHInfo.getPVInfo(req, res, app, pool);
            var BYitems = await RequestWHInfo.getBYInfo(req, res, app, pool);
            var ReqItems = await RequestWHInfo.getReqInfo(req, res, app, pool);
            WHitems = JSON.parse(WHitems);
            PVitems = JSON.parse(PVitems);
            BYitems = JSON.parse(BYitems);
            ReqItems = JSON.parse(ReqItems);
            res.render('User/RequestWHInfo', {
                        'req': req,
                        'app': app,
                        'session': req.session,
                        'pool': pool,
                        'WHitems': WHitems,
                        'PVitems': PVitems,
                        'BYitems': BYitems,
                        'ReqItems': ReqItems });
        } catch (err) {
            console.log(err.message);
            res.render('Alert/errorOccured');
        }
    });

    router.get('/WarehouseList', async function(req, res, next) {
        try {
            var WHList = await ad_WarehouseList.getWHList(req, res, app, pool);
            WHList = JSON.parse(WHList);
            res.render('User/Admin/ad_WarehouseList', { 
                    'app': app,
                    'session': req.session,
                    'pool': pool,
                    'WHList': WHList });
        } catch (err) {
            console.log(err.message);
            res.render('Alert/errorOccured');
        }
    });

    router.post('/WHInfo', async function(req, res, next) {
        try {
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
            res.render('User/WHInfo', {
                        'req': req,
                        'app': app,
                        'session': req.session,
                        'pool': pool,
                        'WHitems': WHitems,
                        'PVitems': PVitems,
                        'curItems': curItems,
                        'preItems': preItems,
                        'nextItems': nextItems });
        } catch (err) {
            console.log(err.message);
            res.render('Alert/errorOccured');
        }
    });

    router.get('/UsageHistory', async function(req, res, next) {
        try {
            var items = await ad_UsageHistory.getUsageHistory(req, res, app, pool);
            items = JSON.parse(items);
            res.render('User/Admin/ad_UsageHistory', {
                        'app': app,
                        'session': req.session,
                        'pool': pool,
                        'items': items });
        } catch (err) {
            console.log(err.message);
            res.render('Alert/errorOccured');
        }
    });

    router.post('/UsageHistory/INFO', async function(req, res, next) {
        try {
            var WHitems = await ad_UsageHistoryInfo.getWHInfo(req, res, app, pool);
            var PVitems = await ad_UsageHistoryInfo.getPVInfo(req, res, app, pool);
            var BYitems = await ad_UsageHistoryInfo.getBYInfo(req, res, app, pool);
            WHitems = JSON.parse(WHitems);
            PVitems = JSON.parse(PVitems);
            BYitems = JSON.parse(BYitems);
            res.render('User/Admin/ad_UsageHistoryInfo', {
                        'app': app,
                        'session': req.session,
                        'pool': pool,
                        'WHitems': WHitems,
                        'PVitems': PVitems,
                        'BYitems': BYitems });
        } catch (err) {
            console.log(err.message);
            res.render('Alert/errorOccured');
        }
    });

    router.post('/RequestBuy/Ans', async function(req, res, next) {
        try {
            await ad_ReqBuy.withAnswer(req, res, app, pool);
        } catch (err) {
            console.log(err.message);
            res.send(false);
        }
    });

    router.get('/Question', function(req, res, next) {
        res.render('User/Admin/ad_Question', { 'app': app, 'session': req.session, 'pool': pool });
    });

    return router;
};