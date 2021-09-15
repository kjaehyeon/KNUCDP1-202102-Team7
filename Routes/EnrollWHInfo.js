const viewInfo = require('./viewInfo');

exports.getWHInfo = function (req, res, app, db) {
    var warehouseID = req.body.warehouseID;
    var items = {};
    items = viewInfo.getWHInfo(db, warehouseID);
    return items;
}

exports.getPVInfo = function (req, res, app, db) {
    var providerID = req.body.providerID;
    var items = {};
    items = viewInfo.getMemberInfo(db, providerID);
    return items;
}