exports.searchWH = async function (req, res, app, pool) {
    var items = {};
    var connection = null;

    try { 
        connection = await pool.getConnection(async conn => conn);
        const cols = 'warehouseID, warehouseName, address, latitude, longitude, landArea';
        const [results1] = await connection.query(`SELECT ${cols} from PublicWarehouse`);
        const [results2] = await connection.query(`SELECT ${cols} from Warehouse where enroll='Y'`);
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
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    return JSON.stringify(items);
}
