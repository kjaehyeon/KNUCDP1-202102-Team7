module.exports = function (app, db) {
    var express = require('express');
    var router = express.Router();
    var main_Home = require('./main_Home');

    router.get('/', function (req, res, next) {
        res.render('main_Home', {'session': req.session});
    });

    router.post('/searchWH', function (req, res, next) {
        var items = main_Home.searchWH(req, res, app, db);
        res.send(items);
    });

    return router;
};
