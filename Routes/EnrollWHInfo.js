const viewInfo = require('./viewInfo');

exports.getWHInfo = async function (req, res, app, pool) {
    var warehouseID = req.body.warehouseID;
    var items = {};
    items = await viewInfo.getWHInfo(pool, warehouseID);
    return items;
}

exports.getPVInfo = async function (req, res, app, pool) {
    var providerID = req.body.providerID;
    var items = {};
    items = await viewInfo.getMemberInfo(pool, providerID);
    return items;
}