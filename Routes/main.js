module.exports = function (app, pool) {
    var express = require('express');
    var router = express.Router();
    var main_Home = require('./main_Home');

    router.get('/', function (req, res, next) {
        res.render('main_Home', {'session': req.session});
    });

    router.post('/searchWH', async function (req, res, next) {
        try {
            var items = await main_Home.searchWH(req, res, app, pool);
            res.send(items);
        } catch (err) {
            console.log(err.message);
            res.send(err);
        }
    });

    return router;
};
