exports.getWHList = async function (req, res, app, pool) {
    var items = {};
    var sql = `SELECT * from Warehouse,Provider where Warehouse.warehouseID=Provider.warehouseID and enroll='Y'`;
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
                warehouseID: results[step].warehouseID,
                warehouseName: results[step].warehouseName,
                enrolledDate: results[step].enrolledDate,
                address: results[step].address,
                latitude: results[step].latitude,
                longitude: results[step].longitude,
                landArea: results[step].landArea,
                floorArea: results[step].floorArea,
                useableArea: results[step].useableArea,
                infoComment: results[step].infoComment,
                etcComment: results[step].etcComment,
                iotStat: results[step].iotStat,
                enroll: results[step].enroll,
                memberID: results[step].memberID
            };
        }
    }
    return JSON.stringify(items);
}