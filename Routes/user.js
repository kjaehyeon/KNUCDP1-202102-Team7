module.exports = function (app, pool) {
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

    router.post('/Register/MemberID', async function (req, res, next) {
        await register.checkID(req, res, app, pool);
    });

    router.post("/Register/checkPW", function (req, res, next) {
        register.checkPW(req, res, app, pool);
    });

    router.post('/Register/EmailIDF', async function (req, res, next) {
        await emailIDF.emailIDF(req, res, app, pool);
    });

    router.post('/Register', async function (req, res, next) {
        await register.register(req, res, app, pool);
    });

    router.get('/Register', function (req, res, next) {
        res.render('User/user_Register', { 'app': app, 'session': req.session, 'pool': pool, 'req': req });
    });

    router.get('/Select', function (req, res, next) {
        res.render('User/user_Select', { 'app': app, 'session': req.session, 'pool': pool });
    });

    router.get('/Login', function (req, res, next) {
        res.render('User/user_Login', { 'app': app, 'session': req.session, 'pool': pool });
    });

    router.post('/Login', async function (req, res, next) {
        await login.login(req, res, app, pool);
    });

    router.get('/Logout', function (req, res, next) {
        req.session.destroy();
        res.redirect('/');
    });

    router.get('/Edit', function (req, res, next) {
        res.render('User/user_Edit', { 'app': app, 'session': req.session, 'pool': pool });
    });

    router.post('/Edit', async function (req, res, next) {
        await edit.edit(req, res, app, pool);
    });

    router.get('/Edit/PW', function (req, res, next) {
        res.render('User/user_PwEdit', { 'app': app, 'session': req.session, 'pool': pool });
    });

    router.post('/Edit/PW', async function (req, res, next) {
        await pwEdit.pwEdit(req, res, app, pool);
    });

    router.get('/Show', function (req, res, next) {
        res.render('User/user_Show', { 'app': app, 'session': req.session, 'pool': pool });
    });

    router.get('/Help', function (req, res, next) {
        res.render('User/user_Help', { 'app': app, 'session': req.session, 'pool': pool });
    });

    router.post('/Delete', async function (req, res, next) {
        await del.delete(req, res, app, pool);
    });

    return router;
}
