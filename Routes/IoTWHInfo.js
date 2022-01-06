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
    try {
        connection = await pool.getConnection(async conn => conn);
        const [results] = await connection.query('select * from Warehouse, Provider'
                                                + ' where Warehouse.warehouseID=Provider.warehouseID'
                                                + ' and Warehouse.warehouseID=' + warehouseID);
        if (results.length > 0) {
            var providerID = results[0].memberID;
            items = await viewInfo.getMemberInfo(pool, providerID);
        } else {
            throw new Error('no pv info');
        }
    } catch (err) {
        console.log(err.message);
        items = JSON.stringify(items);
    } finally {
        connection.release();
    }
    return items;
}