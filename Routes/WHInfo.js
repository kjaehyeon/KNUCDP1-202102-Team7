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
    var warehouseID = req.body.warehouseID;
    var items = {};
    var connection = null;
    let results = [];
    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query('select * from Warehouse, Provider' 
                                        + ' where Warehouse.warehouseID=Provider.warehouseID' 
                                        + ' and Warehouse.warehouseID=?',[warehouseID]);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    if (results.length > 0) {
        var providerID = results[0].memberID;
        items = await viewInfo.getMemberInfo(pool, providerID);
    } else {
        items = JSON.stringify(items);
    }
    return items;
}

exports.getIoTInfo = async function (req, res, app, pool) {
    var memberID = req.session.memberID;
    var items = {};
    var connection = null;
    var results = [];
    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query(`select * from RequestForIoT where providerID='${memberID}'`);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    if (results.length > 0) {
        for (var step = 0; step < results.length; step++) {
            items[results[step].warehouseID] = {
                reqID: results[step].reqID,
                rejectCmt: results[step].rejectCmt
            };
        }
    }
    return JSON.stringify(items);
}

exports.getCurUsage = async function (req, res, app, pool) {
    var warehouseID = req.body.warehouseID;
    var today = new Date(new Date().getTime() + 32400000).toISOString().replace(/T.+/, '');
    var items = {};
    var connection = null;
    var results = [];
    var sql = 'select * from Contract, Member' 
            + ` where Contract.buyerID=Member.memberID and warehouseID=` + warehouseID 
            + ` and endDate >= '` + today + `' and startDate <= '` + today + `'`;
    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query(sql);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }

    if (results.length > 0) {
        for (var step = 0; step < results.length; step++) {
            items[`item${step}`] = {
                reqID: results[step].reqID,
                buyerID: results[step].buyerID,
                startDate: results[step].startDate.substring(0, 10),
                endDate: results[step].endDate.substring(0, 10),
                area: results[step].area,
                amount: results[step].amount,
                name: results[step].name,
                national: results[step].national,
                zipcode: results[step].zipcode,
                address: results[step].address,
                email: results[step].email,
                contactNumber: results[step].contactNumber,
            };
        }
    }
    return JSON.stringify(items);
}

exports.getNextUsage = async function (req, res, app, pool) {
    var warehouseID = req.body.warehouseID;
    var today = new Date(new Date().getTime() + 32400000).toISOString().replace(/T.+/, '');
    var items = {};
    var sql = `select * from Contract, Member where Contract.buyerID=Member.memberID and warehouseID=` 
                + warehouseID + ` and startDate > '` + today + `';`
    var connection = null;
    var results = [];
    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query(sql);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    if (results.length > 0) {
        for (var step = 0; step < results.length; step++) {
            items[`item${step}`] = {
                reqID: results[step].reqID,
                buyerID: results[step].buyerID,
                startDate: results[step].startDate.substring(0, 10),
                endDate: results[step].endDate.substring(0, 10),
                area: results[step].area,
                amount: results[step].amount,
                name: results[step].name,
                national: results[step].national,
                zipcode: results[step].zipcode,
                address: results[step].address,
                email: results[step].email,
                contactNumber: results[step].contactNumber,
            };
        }
    }
    return JSON.stringify(items);
}

exports.getPreUsage = async function (req, res, app, pool) {
    var warehouseID = req.body.warehouseID;
    var today = new Date(new Date().getTime() + 32400000).toISOString().replace(/T.+/, '');
    var items = {};
    var connection = null;
    var results = [];
    var sql = `select * from Contract, Member` 
            + ` where Contract.buyerID=Member.memberID and warehouseID=` 
            + warehouseID + ` and endDate < '` + today + `';`
    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query(sql);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    if (results.length > 0) {
        for (var step = 0; step < results.length; step++) {
            items[`item${step}`] = {
                reqID: results[step].reqID,
                buyerID: results[step].buyerID,
                startDate: results[step].startDate.substring(0, 10),
                endDate: results[step].endDate.substring(0, 10),
                area: results[step].area,
                amount: results[step].amount,
                name: results[step].name,
                national: results[step].national,
                zipcode: results[step].zipcode,
                address: results[step].address,
                email: results[step].email,
                contactNumber: results[step].contactNumber,
            };
        }
    }
    return JSON.stringify(items);
}
