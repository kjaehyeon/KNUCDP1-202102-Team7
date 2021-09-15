const viewInfo = require('./viewInfo');

exports.getWHInfo = function (req, res, app, db) {
    var warehouseID = req.body.warehouseID;
    var items = {};
    items = viewInfo.getWHInfo(db, warehouseID);
    return items;
}

exports.getPVInfo = function (req, res, app, db) {
    var warehouseID = req.body.warehouseID;
    var items = {};
    let results = db.query(`select * from Warehouse, Provider where Warehouse.warehouseID=Provider.warehouseID and Warehouse.warehouseID=` + warehouseID + `;`);
    if (results.length > 0) {
        var providerID = results[0].memberID;
        items = viewInfo.getMemberInfo(db, providerID);
    }
    return items;
}