module.exports = function (app, db) {
    var express = require('express');
    var router = express.Router();

    const register = require('./user_Register');
    const login = require('./user_Login');
    const edit = require('./user_Edit');
    const pwEdit = require('./user_PwEdit');
    const del = require('./user_Delete');
    const emailIDF = require('./user_EmailIDF');

    var check = (req, res, next) => {
        const id = req.session['memberID'];
        const path = req.path.toLowerCase();
        const needLoginPath = ['/edit', '/edit/pw', '/show'];
        if (!id && needLoginPath.some((e) => (path === e || path === e + '/'))) res.render('Alert/needLogin');
        else next();
    };
    router.use(check);

    router.post('/Register/MemberID', function (req, res, next) {
        register.checkID(req, res, app, db);
    });

    router.post("/Register/checkPW", function (req, res, next) {
        register.checkPW(req, res, app, db);
    });

    router.post('/Register/EmailIDF', function (req, res, next) {
        emailIDF.emailIDF(req, res, app, db);
    });

    router.post('/Register', function (req, res, next) {
        register.register(req, res, app, db);
    });

    router.get('/Register', function (req, res, next) {
        res.render('User/user_Register', { 'app': app, 'session': req.session, 'db': db, 'req': req });
    });

    router.get('/Select', function (req, res, next) {
        res.render('User/user_Select', { 'app': app, 'session': req.session, 'db': db });
    });

    router.get('/Login', function (req, res, next) {
        res.render('User/user_Login', { 'app': app, 'session': req.session, 'db': db });
    });

    router.post('/Login', function (req, res, next) {
        login.login(req, res, app, db);
    });

    router.get('/Logout', function (req, res, next) {
        req.session.destroy();
        res.redirect('/');
    });

    router.get('/Edit', function (req, res, next) {
        res.render('User/user_Edit', { 'app': app, 'session': req.session, 'db': db });
    });

    router.post('/Edit', function (req, res, next) {
        edit.edit(req, res, app, db);
    });

    router.get('/Edit/PW', function (req, res, next) {
        res.render('User/user_PwEdit', { 'app': app, 'session': req.session, 'db': db });
    });

    router.post('/Edit/PW', function (req, res, next) {
        pwEdit.pwEdit(req, res, app, db);
    });

    router.get('/Show', function (req, res, next) {
        res.render('User/user_Show', { 'app': app, 'session': req.session, 'db': db });
    });

    router.get('/Help', function (req, res, next) {
        res.render('User/user_Help', { 'app': app, 'session': req.session, 'db': db });
    });

    router.post('/Delete', function (req, res, next) {
        del.delete(req, res, app, db);
    });

    return router;
}
