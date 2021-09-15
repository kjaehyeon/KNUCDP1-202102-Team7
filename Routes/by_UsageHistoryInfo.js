const viewInfo = require('./viewInfo');

exports.getWHInfo = function (req, res, app, db) {
    var reqID = req.body.reqID;
    var items = {};
    let results = db.query(`select warehouseID from Contract where reqID=` + [reqID] + `;`);
    if (results.length > 0) {
        var warehouseID = results[0].warehouseID;
        items = viewInfo.getWHInfo(db, warehouseID);
    }
    return items;
}

exports.getPVInfo = function (req, res, app, db) {
    var reqID = req.body.reqID;
    var items = {};
    let results = db.query(`select memberID from Contract, Warehouse, Provider where Contract.warehouseID=Warehouse.warehouseID and Warehouse.warehouseID=Provider.warehouseID and reqID=` + [reqID] + `;`);
    if (results.length > 0) {
        var providerID = results[0].memberID;        
        items = viewInfo.getMemberInfo(db, providerID);
    }
    return items;
}