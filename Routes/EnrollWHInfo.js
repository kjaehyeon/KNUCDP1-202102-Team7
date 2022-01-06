const viewInfo = require('./viewInfo');

exports.getWHInfo = async function (req, res, app, pool) {
    var warehouseID = req.body.warehouseID;
    var items = {};
    try {
        items = await viewInfo.getWHInfo(pool, warehouseID);
    } catch (err) {
        console.log(err.message);
        items = JSON.stringify(items);
    }
    return items;
}

exports.getPVInfo = async function (req, res, app, pool) {
    var providerID = req.body.providerID;
    var items = {};
    try {
        items = await viewInfo.getMemberInfo(pool, providerID);
    } catch (err) {
        console.log(err.message);
        items = JSON.stringify(items);
    }
    return items;
}