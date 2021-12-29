exports.getCurUsage = async function (req, res, app, pool) {
    var today = new Date(new Date().getTime() + 32400000).toISOString().replace(/T.+/, '');
    var items = {};
    var sql = `select * from Contract, Warehouse`
            + ` where Warehouse.warehouseID=Contract.warehouseID`
            + ` and buyerID='` + req.session['memberID']
            + `' and endDate >= '` + [today]
            + `' and startDate <= '` + [today];
    var connection = null;
    var results = null;
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
                warehouseID: results[step].warehouseID,
                warehouseName: results[step].warehouseName,
                startDate: results[step].startDate.substring(0, 10),
                endDate: results[step].endDate.substring(0, 10),
                area: results[step].area,
                amount: results[step].amount,
                iotStat: results[step].iotStat
            };
        }
    }
    return JSON.stringify(items);
}

exports.getNextUsage = async function (req, res, app, pool) {
    var today = new Date(new Date().getTime() + 32400000).toISOString().replace(/T.+/, '');
    var items = {};
    var sql = `select * from Contract, Warehouse`
            + ` where Warehouse.warehouseID=Contract.warehouseID`
            + ` and buyerID='` + req.session['memberID']
            + `' and startDate > '` + [today];
    var connection = null;
    var results = null;
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
                warehouseID: results[step].warehouseID,
                warehouseName: results[step].warehouseName,
                startDate: results[step].startDate.substring(0, 10),
                endDate: results[step].endDate.substring(0, 10),
                area: results[step].area,
                amount: results[step].amount,
                iotStat: results[step].iotStat
            };
        }
    }
    return JSON.stringify(items);
}

exports.getPreUsage = async function (req, res, app, pool) {
    var today = new Date(new Date().getTime() + 32400000).toISOString().replace(/T.+/, '');
    var items = {};
    var sql = `select * from Contract, Warehouse` 
            + ` where Warehouse.warehouseID=Contract.warehouseID`
            + ` and buyerID='` + req.session['memberID']
            + `' and endDate < '` + [today];
    var connection = null;
    var results = null;
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
                warehouseID: results[step].warehouseID,
                warehouseName: results[step].warehouseName,
                startDate: results[step].startDate.substring(0, 10),
                endDate: results[step].endDate.substring(0, 10),
                area: results[step].area,
                amount: results[step].amount,
                iotStat: results[step].iotStat
            };
        }
    }
    return JSON.stringify(items);
}
