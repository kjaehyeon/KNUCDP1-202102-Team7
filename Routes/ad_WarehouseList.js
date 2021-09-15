exports.getWHList = function (req, res, app, db) {
    var items = {};
    let sql = `SELECT * from Warehouse,Provider where Warehouse.warehouseID=Provider.warehouseID and enroll='Y'`;
    let results = db.query(sql);
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