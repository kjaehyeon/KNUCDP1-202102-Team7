exports.searchWH = async function(req, res, app, pool) {
    var items = {};
    var connection = null;
    var results1 = [];
    var results2 = [];
    var results = [];
    try {
        connection = await pool.getConnection(async conn => conn);
        [results1] = await connection.query('SELECT * from PublicWarehouse');
        [results2] = await connection.query(`SELECT * from Warehouse where enroll='Y'`);
        for (index in results2){
            results2[index].warehouseID += 10000
        }
        results = results1.concat(results2);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    if (results.length > 0) {
        for (var step = 0; step < results.length; step++) {
            let wid;
            if (results1.length <= step) {
                wid = results[step].warehouseID;
            } else {
                wid = results[step].warehouseID
            }
            items[`item${step}`] = {
                warehouseID: wid,
                warehouseName: results[step].warehouseName,
                warehouseEmail: results[step].warehouseEmail,
                warehouseTel: results[step].warehouseTEL,
                enrolledDate: results[step].enrolledDate,
                address: results[step].address,
                addressDetail: results[step].addressDetail,
                latitude: results[step].latitude,
                longitude: results[step].longitude,
                landArea: results[step].landArea,
                floorArea: results[step].floorArea,
                useableArea: results[step].useableArea,
                price: results[step].price,
                infoComment: results[step].infoComment,
                etcComment: results[step].etcComment,
                zipcode: results[step].zipcode,
                iotStat: results[step].iotStat,
                enroll: results[step].enroll,
                isPublic: parseInt(results[step].warehouseID) < 10000
            };
        }
    }
    return JSON.stringify(items);
}

exports.findImage = async function(req, res, app, pool) {
    var items = {};
    var connection = null;
    var results = [];
    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query(`SELECT * from FileInfo where warehouseID=${req.body.warehouseID}`);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    if (results.length > 0) {
        for (var step = 0; step < results.length; step++) {
            items[`image${step}`] = {
                title: results[step].filename,
                url: `../../Public/Upload/${results[step].filename}`
            };
        }
    }
    return JSON.stringify(items);
}

exports.inquireWH = async function(req, res, app, pool) {
    var reqItem = {
        reqDate: new Date(),
        reqType: "ReqByBuyer",
        buyerID: req.session['memberID'],
        warehouseID: parseInt(req.body.warehouseID),
        area: parseInt(req.body.area),
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        amount: req.body.amount
    };
    var connection = null;
    try {
        connection = await pool.getConnection(async conn => conn);
        await connection.query('INSERT INTO RequestForBuy SET ?', [reqItem]);
        res.send(true);
    } catch (err) {
        console.log(err.message);
        res.send(false);
    } finally {
        connection.release();
    }
}