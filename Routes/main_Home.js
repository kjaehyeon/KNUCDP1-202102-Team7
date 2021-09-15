exports.searchWH = function (req, res, app, db) {
    var items = {};
    const cols = 'warehouseID, warehouseName, address, latitude, longitude, landArea';
    const results1 = db.query(`SELECT ${cols} from PublicWarehouse`);
    const results2 = db.query(`SELECT ${cols} from Warehouse where enroll='Y'`);
    const results = results1.concat(results2);

    if (results.length > 0) {
        for (var step = 0; step < results.length; step++) {
            items[`item${step}`] = {
                warehouseName: results[step].warehouseName,
                address: results[step].address,
                latitude: results[step].latitude,
                longitude: results[step].longitude,
                landArea: results[step].landArea,
                isPublic: parseInt(results[step].warehouseID) < 10000
            };
        }
    }
    return JSON.stringify(items);
}
