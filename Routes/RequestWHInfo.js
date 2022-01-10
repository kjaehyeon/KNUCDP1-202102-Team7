const viewInfo = require('./viewInfo');

exports.getWHInfo = async function(req, res, app, pool) {
    var reqID = req.body.reqID;
    var items = {};
    var connection = null;
    let results = [];
    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query('select warehouseID from RequestForBuy where reqID=' + reqID);
    } catch (err) { 
        console.loge(err);
    } finally {
        connection.release();
    }
    if (results.length > 0) {
        var warehouseID = results[0].warehouseID;
        items = await viewInfo.getWHInfo(pool, warehouseID);
    } else {
        items = JSON.stringify(items);
    }
    return items;
}

exports.getPVInfo = async function(req, res, app, pool) {
    var reqID = req.body.reqID;
    var items = {};
    var connection = null;
    var results = [];
    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query('select memberID from RequestForBuy, Provider'
                                            + ' where RequestForBuy.warehouseID=Provider.warehouseID' 
                                            + ' and RequestForBuy.reqID=' + reqID);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    if (results.length > 0) {
        var providerID = results[0].memberID;
        items = await viewInfo.getMemberInfo(pool, providerID);
    } else {
        JSON.stringify(items);
    }
    return items;
}

exports.getBYInfo = async function(req, res, app, pool) {
    var reqID = req.body.reqID;
    var items = {};
    var connection = null;
    var results = [];
    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query('select buyerID from RequestForBuy where reqID=' + reqID);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    if (results.length > 0) {
        var buyerID = results[0].buyerID;
        items = await viewInfo.getMemberInfo(pool, buyerID);
    } else {
        items = JSON.stringify(items);
    }
    return items;
}

exports.getReqInfo = async function(req, res, app, pool) {
    var reqID = req.body.reqID;
    var items = {};
    var connection = null;
    var results = [];
    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query('select * from RequestForBuy, Warehouse'
                                            + ' where Warehouse.warehouseID=RequestForBuy.warehouseID' 
                                            + ' and reqID=' + reqID);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    if (results.length > 0) {
        items = {
            reqID: results[0].reqID,
            reqDate: results[0].reqDate.toString().substring(0, 10),
            warehouseID: results[0].warehouseID,
            buyerID: results[0].buyerID,
            amount: results[0].amount,
            startDate: results[0].startDate.toString().substring(0, 10),
            endDate: results[0].endDate.toString().substring(0, 10),
            area: results[0].area
        };
    }
    return JSON.stringify(items);
}