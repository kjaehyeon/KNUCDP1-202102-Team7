exports.searchWH = function (req, res, app, db) {
    var items = {};
    const results1 = db.query(`SELECT * from PublicWarehouse`);
    const results2 = db.query(`SELECT * from Warehouse where enroll='Y'`);
    const results = results1.concat(results2);
    if (results.length > 0) {
        for (var step = 0; step < results.length; step++) {
            items[`item${step}`] = {
                warehouseID: results[step].warehouseID,
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

exports.findImage = function (req, res, app, db) {
    var items = {};
    let results = db.query(`SELECT * from FileInfo where warehouseID=${req.body.warehouseID}`);
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

exports.inquireWH = function (req, res, app, db) {
    var mysql = require('mysql');
    var connection = mysql.createConnection(require('../Module/db').info);
    connection.connect();
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
    connection.query('INSERT INTO RequestForBuy SET ?', reqItem, function (error, results, fields) {
        if (error) {
            console.log(error);
            res.send(false);
            connection.end();
        } else {
            res.send(true);
            connection.end();
        }
    })
}
