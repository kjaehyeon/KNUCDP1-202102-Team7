const viewInfo = require('./viewInfo');

exports.getWHInfo = async function (req, res, app, pool) {
    var reqID = req.body.reqID;
    var items = {};
    var connection = null;
    var results = null;
    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query('select warehouseID from Contract where reqID=' + reqID);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    if (results.length > 0) {
        var warehouseID = results[0].warehouseID;
        items = await viewInfo.getWHInfo(pool, warehouseID);
    } else {
        JSON.stringify(items);
    }
    return items;
}

exports.getPVInfo = async function (req, res, app, pool) {
    var reqID = req.body.reqID;
    var items = {};
    var connection = null;
    var results = null;
    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query('select memberID from Contract, Warehouse, Provider'
                                            + ' where Contract.warehouseID=Warehouse.warehouseID' 
                                            + ' and Warehouse.warehouseID=Provider.warehouseID'
                                            + ' and reqID=' + reqID);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    if (results.length > 0) {
        var providerID = results[0].memberID;        
        items = await viewInfo.getMemberInfo(pool, providerID);
    } else {
        JSOIN.stringify(items);
    }
    return items;
}

exports.getBYInfo = async function (req, res, app, pool) {
    var reqID = req.body.reqID;
    var items = {};
    var connection = null;
    var results = null;
    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = connection.query('select buyerID from Contract where reqID=' + reqID);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    if (results.length > 0) {
        var buyerID = results[0].buyerID;
        items = await viewInfo.getMemberInfo(db, buyerID);
    } else {
        JSON.stringify(items);
    }
    return items;
}