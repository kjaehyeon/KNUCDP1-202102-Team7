const viewInfo = require('./viewInfo');

exports.getWHInfo = function (req, res, app, db) {
    var reqID = req.body.reqID;
    var items = {};
    let results = db.query(`select warehouseID from RequestForBuy where reqID=` + reqID + `;`);
    if (results.length > 0) {
        var warehouseID = results[0].warehouseID;
        items = viewInfo.getWHInfo(db, warehouseID);
    }
    return items;
}

exports.getPVInfo = function (req, res, app, db) {
    var reqID = req.body.reqID;
    var items = {};
    let results = db.query(`select memberID from RequestForBuy, Provider where RequestForBuy.warehouseID=Provider.warehouseID and RequestForBuy.reqID=` + reqID + `;`);
    if (results.length > 0) {
        var providerID = results[0].memberID;
        items = viewInfo.getMemberInfo(db, providerID);
    }
    return items;
}

exports.getBYInfo = function (req, res, app, db) {
    var reqID = req.body.reqID;
    var items = {};
    let results = db.query(`select buyerID from RequestForBuy where reqID=` + reqID + `;`);
    if (results.length > 0) {
        var buyerID = results[0].buyerID;
        items = viewInfo.getMemberInfo(db, buyerID);
    }
    return items;
}

exports.getReqInfo = function (req, res, app, db) {
    var reqID = req.body.reqID;
    var items = {};
    let results = db.query(`select * from RequestForBuy, Warehouse where Warehouse.warehouseID=RequestForBuy.warehouseID and reqID=` + reqID + `;`);
    if (results.length > 0) {
        items = {
            reqID: results[0].reqID,
            reqDate: results[0].reqDate.substring(0, 10),
            warehouseID: results[0].warehouseID,
            buyerID: results[0].buyerID,
            amount: results[0].amount,
            startDate: results[0].startDate.substring(0, 10),
            endDate: results[0].endDate.substring(0, 10),
            area: results[0].area
        };
    }
    return JSON.stringify(items);
}