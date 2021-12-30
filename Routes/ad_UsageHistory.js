exports.getUsageHistory = async function (req, res, app, pool) {
    var items = {};
    var connection = null;
    var results = null;
    var sql = `select * from Contract, Warehouse where Contract.warehouseID=Warehouse.warehouseID`;
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
                warehouseID: results[step].warehouseID,
                amount: results[step].amount,
                startDate: results[step].startDate.substring(0, 10),
                endDate: results[step].endDate.substring(0, 10),
                area: results[step].area,
                iotStat: results[step].iotStat,
            };
        }
    }
    return JSON.stringify(items);
}
