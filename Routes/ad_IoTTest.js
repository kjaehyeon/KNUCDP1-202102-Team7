exports.init = function (req, res, app, db) {
    var wid = req.body.wid;
    var rows = db.query(`SELECT * FROM Warehouse WHERE warehouseID=${wid}`);
    if (!rows.length) res.render('Alert/cannotAccess');
    else {
        req.session['warehouseID'] = wid;
        res.render('User/Admin/ad_IoTTest', {'session': req.session, 'wid': wid});
    }
}
