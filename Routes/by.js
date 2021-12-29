module.exports = function (app, pool) {
    var express = require('express');
    var router = express.Router();
    var findWH = require('./by_FindWH');
    var requestWH = require('./by_RequestStatus');
    var UsageHistory = require('./by_UsageHistory');
    var UsageHistoryInfo = require('./by_UsageHistoryInfo');
    const RequestWHInfo = require('./RequestWHInfo');

    var check = (req, res, next) => {
        var type = req.session['type'];
        if (!type) res.render('Alert/needLogin');
        else if (type === 'buyer') next();
        else res.render('Alert/cannotAccess');
    };
    router.use(check);

    router.get('/', function (req, res, next) {
        res.render('User/Buyer/by_FindWH', {'app': app, 'session': req.session, 'pool': pool});
    });
    router.post('/FindWH/FindImage', async function (req, res, next) {
        var items = await findWH.findImage(req, res, app, pool);
        res.send(JSON.parse(items));
    });
    router.post('/FindWH/Inquire', async function (req, res, next) {
        await findWH.inquireWH(req, res, app, pool);
    });
    router.get('/FindWH', function (req, res, next) {
        res.render('User/Buyer/by_FindWH', {'app': app, 'session': req.session, 'pool': pool});
    });
    router.post('/searchWH', async function (req, res, next) {
        var items = await findWH.searchWH(req, res, app, pool);
        res.send(items);
    });

    router.get('/RequestStatus', async function (req, res, next) {
        var items = await requestWH.RequestForBuy(req, res, app, pool);
        items = JSON.parse(items);
        res.render('User/Buyer/by_RequestStatus', {'app': app, 'session': req.session, 'pool': pool, 'items': items});
    });
    
    router.post('/RequestWHInfo', async function (req, res, next) {
        var WHitems = await RequestWHInfo.getWHInfo(req, res, app, pool);
        var PVitems = await RequestWHInfo.getPVInfo(req, res, app, pool);
        var ReqItems = await RequestWHInfo.getReqInfo(req, res, app, pool);
        WHitems = JSON.parse(WHitems);
        PVitems = JSON.parse(PVitems);
        ReqItems = JSON.parse(ReqItems);
        res.render('User/RequestWHInfo', {'req': req, 'app': app, 'session': req.session, 'pool': pool, 'WHitems': WHitems, 'PVitems': PVitems, 'ReqItems': ReqItems});
    });

    router.get('/UsageHistory', async function (req, res, next) {
        var curItems = await UsageHistory.getCurUsage(req, res, app, pool);
        var nextItems = await UsageHistory.getNextUsage(req, res, app, pool);
        var preItems = await UsageHistory.getPreUsage(req, res, app, pool);
        curItems = JSON.parse(curItems);
        nextItems = JSON.parse(nextItems);
        preItems = JSON.parse(preItems);
        res.render('User/Buyer/by_UsageHistory', {'app': app, 'session': req.session, 'pool': pool, 'curItems': curItems, 'preItems': preItems, 'nextItems': nextItems});
    });

    router.post('/UsageHistory/INFO', async function (req, res, next) {
        var WHitems = await UsageHistoryInfo.getWHInfo(req, res, app, pool);
        var PVitems = await UsageHistoryInfo.getPVInfo(req, res, app, pool);
        WHitems = JSON.parse(WHitems);
        PVitems = JSON.parse(PVitems);
        res.render('User/Buyer/by_UsageHistoryInfo', {'app': app, 'session': req.session, 'pool': pool, 'WHitems': WHitems, 'PVitems': PVitems});
    });

    router.post('/RequestStatus/Buy/Ans', async function (req, res, next) {
        await requestWH.ReqBuyWithAnswer(req, res, app, pool);
    });

    return router;
};
